const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/** Message unique pour « appel authentifié sans JWT ».
 *  Sans ce garde-fou, la requête partait sans en-tête Authorization et le
 *  backend répondait 500 « Une erreur est survenue. » (au lieu d'un 401) :
 *  l'utilisateur voyait un message opaque et restait bloqué. Le cas se produit
 *  quand le cookie sailingloc_auth survit au token du localStorage — proxy.ts
 *  n'inspecte que le cookie, l'interface croit donc la session active. */
export const SESSION_EXPIREE =
  "Votre session a expiré. Reconnectez-vous pour continuer.";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sailingloc_token");
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("sailingloc_token", token);
    // Cookie accessible par le middleware Next.js (pas HttpOnly volontairement)
    document.cookie = "sailingloc_auth=1; path=/; max-age=86400; SameSite=Lax";
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("sailingloc_token");
    document.cookie = "sailingloc_auth=; path=/; max-age=0";
    document.cookie = "sailingloc_role=; path=/; max-age=0";
  }
}

export function setRoleCookie(role: string) {
  if (typeof window !== "undefined") {
    document.cookie = `sailingloc_role=${role}; path=/; max-age=86400; SameSite=Lax`;
  }
}

const REQUEST_TIMEOUT_MS = 8_000;

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    /* Garde-fou limité aux ÉCRITURES. Plusieurs GET (référentiels, /api/ports)
       répondent 200 sans JWT et alimentent des pages publiques : les bloquer
       ici viderait ces listes. Une écriture sans token, elle, ne peut pas
       aboutir — autant échouer tout de suite avec un message clair plutôt que
       de laisser le backend répondre 500 « Une erreur est survenue. ». */
    if (!token && method !== "GET") throw new ApiError(401, SESSION_EXPIREE);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(503, "Le serveur est temporairement indisponible (timeout).");
    }
    throw new ApiError(503, "Impossible de joindre le serveur.");
  }
  clearTimeout(timer);

  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      message = data.message ?? data.error ?? message;
    } catch {}
    throw new ApiError(res.status, message);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export const api = {
  get:    <T>(path: string, auth = true) => request<T>("GET",    path, undefined, auth),
  post:   <T>(path: string, body: unknown, auth = false) => request<T>("POST",   path, body, auth),
  put:    <T>(path: string, body: unknown, auth = true)  => request<T>("PUT",    path, body, auth),
  patch:  <T>(path: string, body: unknown, auth = true)  => request<T>("PATCH",  path, body, auth),
  delete: <T>(path: string, auth = true)                 => request<T>("DELETE", path, undefined, auth),

  /** GET binaire (PDF, etc.) — renvoie le Blob brut plutôt que du JSON parsé. */
  getBlob: async (path: string, auth = true): Promise<Blob> => {
    const headers: Record<string, string> = {};
    if (auth) {
      const token = getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { headers });

    if (!res.ok) {
      let message = `Erreur ${res.status}`;
      try {
        const data = await res.json();
        message = data.message ?? data.error ?? message;
      } catch {}
      throw new ApiError(res.status, message);
    }

    return res.blob();
  },

  /** POST multipart/form-data — ne pas définir Content-Type, le navigateur le gère */
  postMultipart: async <T>(path: string, formData: FormData): Promise<T> => {
    const headers: Record<string, string> = {};
    const token = getToken();
    if (!token) throw new ApiError(401, SESSION_EXPIREE);
    headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      let message = `Erreur ${res.status}`;
      try {
        const data = await res.json();
        message = data.message ?? data.error ?? message;
      } catch {}
      throw new ApiError(res.status, message);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : (undefined as T);
  },
};

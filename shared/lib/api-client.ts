const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
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

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
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
}

export const api = {
  get:    <T>(path: string, auth = true) => request<T>("GET",    path, undefined, auth),
  post:   <T>(path: string, body: unknown, auth = false) => request<T>("POST",   path, body, auth),
  put:    <T>(path: string, body: unknown, auth = true)  => request<T>("PUT",    path, body, auth),
  patch:  <T>(path: string, body: unknown, auth = true)  => request<T>("PATCH",  path, body, auth),
  delete: <T>(path: string, auth = true)                 => request<T>("DELETE", path, undefined, auth),

  /** POST multipart/form-data — ne pas définir Content-Type, le navigateur le gère */
  postMultipart: async <T>(path: string, formData: FormData): Promise<T> => {
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

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

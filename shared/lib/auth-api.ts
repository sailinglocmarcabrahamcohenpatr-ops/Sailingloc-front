import { api, setToken, removeToken, ApiError } from "./api-client";
import type { UtilisateurAPI } from "./referentiels-api";

export type { ApiError };
export type { UtilisateurAPI };

export type BackendRole = "ROLE_USER" | "ROLE_PROPRIETAIRE" | "ROLE_ADMIN";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
}

interface LoginResponse {
  token: string;
}

interface JwtPayload {
  id?: number;
  sub?: string;
  email?: string;
  username?: string;
  prenom?: string;
  nom?: string;
  firstName?: string;
  lastName?: string;
  roles?: BackendRole[];
  authorities?: Array<{ authority: string } | string>;
  exp?: number;
  iat?: number;
}

function decodeJwt(token: string): JwtPayload {
  try {
    const base64 = token.split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return {};
  }
}

function extractRoleFromJwt(payload: JwtPayload): "locataire" | "proprietaire" | "admin" {
  const roles: string[] = [];

  if (Array.isArray(payload.roles)) {
    roles.push(...payload.roles);
  }
  if (Array.isArray(payload.authorities)) {
    for (const a of payload.authorities) {
      roles.push(typeof a === "string" ? a : a.authority);
    }
  }
  console.log("JWT roles:", roles);

  if (roles.some((r) => r === "ROLE_ADMIN")) return "admin";
  if (roles.some((r) => r.includes("PROPRIETAIRE"))) return "proprietaire";
  return "locataire";
}

function extractNameFromJwt(payload: JwtPayload, fallbackEmail: string): string {
  const prenom = payload.prenom ?? payload.firstName ?? "";
  const nom = payload.nom ?? payload.lastName ?? "";
  if (prenom || nom) return [prenom, nom].filter(Boolean).join(" ");
  return (payload.sub ?? payload.email ?? payload.username ?? fallbackEmail).split("@")[0];
}

export async function apiLogin(payload: LoginPayload) {
  const data = await api.post<LoginResponse>("/api/auth/login", payload, false);
  const token = data.token;
  if (!token) throw new ApiError(200, "Token manquant dans la réponse du serveur");

  setToken(token);

  const jwt = decodeJwt(token);
  const email = jwt.sub ?? jwt.email ?? jwt.username ?? payload.email;
  const role = extractRoleFromJwt(jwt);

  // Fetch real user data from DB — c'est aussi la seule source fiable de
  // l'id numérique (le JWT n'embarque aucune claim `id`) et du statut du
  // compte (le JWT n'embarque pas non plus `statutCompte`).
  let name = extractNameFromJwt(jwt, email);
  let telephone: string | undefined;
  let userId = jwt.id ?? 0;
  let user: UtilisateurAPI | undefined;
  try {
    user = await apiGetUserByEmail(email);
  } catch {
    // fallback to JWT data if fetch fails (ex: endpoint réservé aux admins
    // pour un compte propriétaire/locataire — userId reste 0 dans ce cas)
  }

  if (user?.statutCompte === "inactif") {
    removeToken();
    throw new ApiError(403, "Votre compte a été désactivé. Contactez le support pour plus d'informations.");
  }

  if (user) {
    name = [user.prenom, user.nom].filter(Boolean).join(" ") || name;
    telephone = user.telephone;
    userId = user.id ?? userId;
  }

  return {
    token,
    email,
    name,
    role,
    userId,
    telephone,
  };
}

export async function apiGetUserByEmail(email: string): Promise<UtilisateurAPI> {
  return api.get<UtilisateurAPI>(`/api/utilisateurs/search/email?email=${encodeURIComponent(email)}`);
}

export async function apiRegister(payload: RegisterPayload) {
  await api.post<unknown>("/api/auth/register", payload, false);
}

export async function apiForgotPassword(email: string): Promise<void> {
  await api.post<unknown>("/api/auth/forgot-password", { email }, false);
}

export function apiLogout() {
  removeToken();
}

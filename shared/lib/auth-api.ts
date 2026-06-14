import { api, setToken, removeToken, ApiError } from "./api-client";

export type BackendRole = "ROLE_USER" | "ROLE_PROPRIETAIRE" | "ROLE_ADMIN";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  prenom?: string;
  nom?: string;
  telephone?: string;
  role?: BackendRole;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  type?: string;
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  prenom?: string;
  nom?: string;
  roles?: BackendRole[];
  role?: BackendRole;
}

function extractToken(data: AuthResponse): string {
  const t = data.token ?? data.accessToken;
  if (!t) throw new ApiError(200, "Token manquant dans la réponse du serveur");
  return t;
}

function extractRole(data: AuthResponse): BackendRole {
  if (Array.isArray(data.roles) && data.roles.length > 0) return data.roles[0];
  return data.role ?? "ROLE_USER";
}

function backendRoleToLocal(role: BackendRole): "locataire" | "proprietaire" {
  return role === "ROLE_PROPRIETAIRE" ? "proprietaire" : "locataire";
}

export async function apiLogin(payload: LoginPayload) {
  const data = await api.post<AuthResponse>("/api/auth/login", payload, false);
  const token = extractToken(data);
  setToken(token);
  return {
    token,
    email: data.email ?? payload.email,
    name: [data.prenom ?? data.firstName, data.nom ?? data.lastName].filter(Boolean).join(" ") || payload.email.split("@")[0],
    role: backendRoleToLocal(extractRole(data)),
  };
}

export async function apiRegister(payload: RegisterPayload) {
  const data = await api.post<AuthResponse>("/api/auth/register", payload, false);
  const token = extractToken(data);
  setToken(token);
  return {
    token,
    email: data.email ?? payload.email,
    name: [data.prenom ?? data.firstName ?? payload.prenom ?? payload.firstName, data.nom ?? data.lastName ?? payload.nom ?? payload.lastName].filter(Boolean).join(" ") || payload.email.split("@")[0],
    role: backendRoleToLocal(extractRole(data)),
  };
}

export function apiLogout() {
  removeToken();
}

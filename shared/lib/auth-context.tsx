"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { removeToken, setRoleCookie } from "./api-client";
import { apiGetUserByEmail } from "./auth-api";

export type UserRole = "locataire" | "proprietaire" | "admin";

export interface AuthUser {
  id?: number;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  telephone?: string;
}

interface LoginParams {
  email: string;
  name: string;
  role: UserRole;
  userId?: number;
  telephone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (params: LoginParams) => void;
  logout: () => void;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
});

function buildUser(params: LoginParams): AuthUser {
  const initials = params.name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return { id: params.userId, name: params.name, email: params.email, initials, role: params.role, telephone: params.telephone };
}

function getJwtPayload(token: string): { id?: number; sub?: string; email?: string; username?: string; roles?: string[]; authorities?: Array<{ authority: string } | string> } | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Rehydrate from DB on mount using stored JWT — no user data in localStorage
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sailingloc_token") : null;
    if (!token) return;

    const jwt = getJwtPayload(token);
    if (!jwt) return;

    const userId = jwt.id;
    const email = jwt.sub ?? jwt.email ?? jwt.username ?? "";
    const roles: string[] = [
      ...(Array.isArray(jwt.roles) ? jwt.roles : []),
      ...(Array.isArray(jwt.authorities)
        ? jwt.authorities.map((a) => (typeof a === "string" ? a : a.authority))
        : []),
    ];
    const role: UserRole = roles.some((r) => r === "ROLE_ADMIN")
      ? "admin"
      : roles.some((r) => r.includes("PROPRIETAIRE"))
      ? "proprietaire"
      : "locataire";

    if (email) {
      apiGetUserByEmail(email)
        .then((u) => {
          const name = [u.prenom, u.nom].filter(Boolean).join(" ") || email.split("@")[0];
          const userId = u.id;
          setUser(buildUser({ email, name, role, userId, telephone: u.telephone }));
          setRoleCookie(role);
        })
        .catch(() => {
          // Token invalide ou expiré
          localStorage.removeItem("sailingloc_token");
        });
    } else {
      const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      setUser(buildUser({ email, name, role }));
      setRoleCookie(role);
    }
  }, []);

  const login = useCallback((params: LoginParams) => {
    const u = buildUser(params);
    setUser(u);
    setRoleCookie(params.role);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeToken();
    // Le site public (hors session) reste toujours en version claire —
    // le mode sombre est une préférence de l'espace connecté, pas du site
    // vitrine. On efface la préférence stockée et on repasse l'affichage
    // en clair immédiatement, sans attendre un rechargement de page.
    try {
      localStorage.removeItem("sailingloc_prefs");
    } catch {}
    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    root.setAttribute("data-text-size", "normal");
    root.removeAttribute("data-motion");
  }, []);

  const switchRole = useCallback(() => {
    setUser((prev) => {
      if (!prev || prev.role === "admin") return prev;
      const next: AuthUser = {
        ...prev,
        role: prev.role === "locataire" ? "proprietaire" : "locataire",
      };
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { removeToken, setRoleCookie, ApiError } from "./api-client";
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
  checking: boolean;
  login: (params: LoginParams) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUser: (patch: Partial<Pick<AuthUser, "name" | "email" | "telephone">>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  checking: true,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
  updateUser: () => {},
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

function getJwtPayload(token: string): { id?: number; sub?: string; email?: string; username?: string; prenom?: string; nom?: string; roles?: string[]; authorities?: Array<{ authority: string } | string> } | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  // Rehydrate from DB on mount using stored JWT — no user data in localStorage
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sailingloc_token") : null;
    if (!token) {
      // Pas de token : s'assurer qu'aucun cookie d'auth périmé ne traîne,
      // sinon le middleware pourrait laisser passer une session fantôme.
      removeToken();
      setChecking(false);
      return;
    }

    const jwt = getJwtPayload(token);
    if (!jwt) {
      removeToken();
      setChecking(false);
      return;
    }

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
      // Build a fallback user from the JWT itself (prenom/nom may be embedded)
      const nameFromJwt = [jwt.prenom, jwt.nom]
        .filter(Boolean)
        .join(" ") || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      apiGetUserByEmail(email)
        .then((u) => {
          if (u.statutCompte === "inactif") {
            // Compte désactivé depuis la dernière session : on ne restaure
            // pas la session malgré un JWT encore valide.
            removeToken();
            setUser(null);
            return;
          }
          const name = [u.prenom, u.nom].filter(Boolean).join(" ") || nameFromJwt;
          const userId = u.id;
          setUser(buildUser({ email, name, role, userId, telephone: u.telephone }));
          setRoleCookie(role);
        })
        .catch((err) => {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            // Token genuinely invalid — log out
            removeToken();
          } else {
            // Endpoint unavailable or network error — keep the session alive
            // using the data already in the JWT
            setUser(buildUser({ email, name: nameFromJwt, role, userId }));
            setRoleCookie(role);
          }
        })
        .finally(() => setChecking(false));
    } else {
      const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      setUser(buildUser({ email, name, role }));
      setRoleCookie(role);
      setChecking(false);
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

  const switchRole = useCallback((role: UserRole) => {
    setUser((prev) => {
      if (!prev || prev.role === "admin") return prev;
      // Le middleware lit le cookie de rôle côté serveur : sans cette mise à
      // jour, la redirection vers /proprietaire ou /profil est refusée.
      // On fixe explicitement le rôle cible (plutôt que de basculer sur
      // l'ancien rôle) car la section affichée (isOwnerSection) est déduite
      // de l'URL et peut être désynchronisée du rôle stocké — un simple
      // toggle renverrait alors vers le mauvais espace.
      setRoleCookie(role);
      return { ...prev, role };
    });
  }, []);

  const updateUser = useCallback((patch: Partial<Pick<AuthUser, "name" | "email" | "telephone">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      if (patch.name) {
        next.initials = patch.name.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
      }
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, checking, login, logout, switchRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

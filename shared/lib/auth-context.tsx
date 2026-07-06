"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { removeToken, setRoleCookie } from "./api-client";

export type UserRole = "locataire" | "proprietaire";

export interface AuthUser {
  id?: number;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, role?: UserRole, userId?: number) => void;
  logout: () => void;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
});

const USER_KEY = "sailingloc_user";

function buildUser(email: string, role: UserRole, id?: number): AuthUser {
  const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const initials = name.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
  return { id, name, email, initials, role };
}

function persist(u: AuthUser | null) {
  try {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        const u = JSON.parse(stored) as AuthUser;
        setUser(u);
        setRoleCookie(u.role); // resync cookie après rechargement
      }
    } catch {}
  }, []);

  const login = useCallback((email: string, role: UserRole = "locataire", userId?: number) => {
    const u = buildUser(email, role, userId);
    setUser(u);
    persist(u);
    setRoleCookie(role);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    persist(null);
    removeToken();
  }, []);

  const switchRole = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: AuthUser = {
        ...prev,
        role: prev.role === "locataire" ? "proprietaire" : "locataire",
      };
      persist(next);
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

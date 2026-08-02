"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { favorisApi } from "./favoris-api";
import { useAuth } from "./auth-context";

/** Favoris ajoutés sans être connecté — stockés en local, synchronisés
 *  vers le compte dès la connexion (voir l'effet ci-dessous). */
const PENDING_KEY = "sailingloc_pending_favoris";

function loadPending(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function savePending(ids: Set<string>) {
  try {
    if (ids.size === 0) localStorage.removeItem(PENDING_KEY);
    else localStorage.setItem(PENDING_KEY, JSON.stringify([...ids]));
  } catch {}
}

interface FavorisContextType {
  favoriteIds: Set<string>;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  loading: boolean;
  count: number;
}

const FavorisContext = createContext<FavorisContextType>({
  favoriteIds: new Set(),
  isFavorite: () => false,
  toggle: () => {},
  loading: true,
  count: 0,
});

/** Source unique des favoris pour toute l'app — un seul fetch au montage
 *  plutôt qu'un par <HeartButton/> affiché, voir MessagesProvider/
 *  NotificationsProvider pour le même raisonnement. */
export function FavorisProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Charge les favoris "hors ligne" après le montage seulement (pas de lecture
  // localStorage pendant le rendu serveur, pour éviter un mismatch d'hydratation).
  useEffect(() => {
    setPendingIds(loadPending());
  }, []);

  useEffect(() => {
    if (!userId) return;

    const pending = loadPending();
    const sync = pending.size > 0
      ? Promise.allSettled([...pending].map((id) => favorisApi.add(id))).then(() => {
          savePending(new Set());
          setPendingIds(new Set());
        })
      : Promise.resolve();

    sync
      .then(() => favorisApi.getAll())
      .then((boats) => setFavoriteIds(new Set(boats.map((b) => String(b.id)))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const toggle = useCallback((id: string) => {
    if (!userId) {
      // Pas connecté : on garde le favori en local, synchronisé à la connexion.
      setPendingIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        savePending(next);
        return next;
      });
      return;
    }

    setFavoriteIds((prev) => {
      const wasFavorite = prev.has(id);
      const next = new Set(prev);
      if (wasFavorite) next.delete(id);
      else next.add(id);

      const request = wasFavorite ? favorisApi.remove(id) : favorisApi.add(id);
      request.catch(() => {
        // Échec réseau/serveur : on annule l'optimistic update
        setFavoriteIds((cur) => {
          const revert = new Set(cur);
          if (wasFavorite) revert.add(id);
          else revert.delete(id);
          return revert;
        });
      });

      return next;
    });
  }, [userId]);

  // Dérivé plutôt que stocké : évite un setState synchrone dans un effet
  // pour basculer entre favoris serveur (connecté) et locaux (hors ligne).
  const effectiveIds = userId ? favoriteIds : pendingIds;

  const isFavorite = useCallback((id: string) => effectiveIds.has(id), [effectiveIds]);

  return (
    <FavorisContext.Provider
      value={{ favoriteIds: effectiveIds, isFavorite, toggle, loading: userId ? loading : false, count: effectiveIds.size }}
    >
      {children}
    </FavorisContext.Provider>
  );
}

export function useFavoris() {
  return useContext(FavorisContext);
}

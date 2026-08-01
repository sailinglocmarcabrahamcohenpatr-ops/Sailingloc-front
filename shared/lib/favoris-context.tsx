"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { favorisApi } from "./favoris-api";
import { useAuth } from "./auth-context";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    favorisApi.getAll()
      .then((boats) => setFavoriteIds(new Set(boats.map((b) => String(b.id)))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const toggle = useCallback((id: string) => {
    if (!userId) return; // pas connecté : rien à persister côté serveur

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

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  // Dérivé plutôt que stocké : évite un setState synchrone dans un effet
  // pour vider les favoris à la déconnexion.
  const effectiveIds = userId ? favoriteIds : new Set<string>();

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

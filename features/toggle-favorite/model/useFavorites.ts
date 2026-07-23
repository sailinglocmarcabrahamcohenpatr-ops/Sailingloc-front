"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/lib/auth-context";
import { favorisApi } from "@/shared/lib/favoris-api";

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = user
      ? favorisApi.getAll().then((boats) => new Set(boats.map((b) => String(b.id))))
      : Promise.resolve(new Set<string>());

    load
      .then(setFavorites)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = useCallback(
    (id: string) => {
      if (!user) return; // pas connecté : rien à persister côté serveur

      const wasFavorite = favorites.has(id);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.delete(id);
        else next.add(id);
        return next;
      });

      const request = wasFavorite ? favorisApi.remove(id) : favorisApi.add(id);
      request.catch(() => {
        // Échec réseau/serveur : on annule l'optimistic update
        setFavorites((prev) => {
          const next = new Set(prev);
          if (wasFavorite) next.add(id);
          else next.delete(id);
          return next;
        });
      });
    },
    [user, favorites],
  );

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, isFavorite, toggle, loading };
}

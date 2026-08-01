"use client";

import { useFavoris } from "@/shared/lib";

export function useFavorites() {
  const { favoriteIds, isFavorite, toggle, loading } = useFavoris();
  return { favorites: favoriteIds, isFavorite, toggle, loading };
}

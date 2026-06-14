"use client";

import { useFavorites } from "../model/useFavorites";
import { cn } from "@/shared/lib/utils";

interface HeartButtonProps {
  boatId: string;
  className?: string;
}

export default function HeartButton({ boatId, className }: HeartButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(boatId);

  return (
    <button
      className={cn("btn-heart", active && "liked", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(boatId);
      }}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
    >
      <i
        className={active ? "fa-solid fa-heart" : "fa-regular fa-heart"}
        aria-hidden="true"
      />
    </button>
  );
}

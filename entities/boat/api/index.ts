import { ALL_BOATS, FEATURED_BOATS } from "../model/data";
import type { Boat } from "../model/types";
import type { BoatType } from "@/shared/types";

export async function getBoats(): Promise<Boat[]> {
  return ALL_BOATS;
}

export async function getBoatById(id: string): Promise<Boat | null> {
  return ALL_BOATS.find((b) => b.id === id) ?? null;
}

export async function getFeaturedBoats(): Promise<Boat[]> {
  return FEATURED_BOATS;
}

export async function searchBoats(params: {
  destination?: string;
  types?: BoatType[];
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  minRating?: number;
  minLength?: number;
  maxLength?: number;
  minCabins?: number;
}): Promise<Boat[]> {
  const { destination, types, minPrice, maxPrice, minCapacity, minRating, minLength, maxLength, minCabins } = params;
  return ALL_BOATS.filter((b) => {
    if (types && types.length > 0 && !types.includes(b.type)) return false;
    if (destination && !b.location.toLowerCase().includes(destination.toLowerCase())) return false;
    if (minPrice != null && b.pricePerDay < minPrice) return false;
    if (maxPrice != null && b.pricePerDay > maxPrice) return false;
    if (minCapacity != null && (b.capacity ?? 0) < minCapacity) return false;
    if (minRating != null && b.rating < minRating) return false;
    if (minCabins != null && (b.cabins ?? 0) < minCabins) return false;
    if (minLength != null || maxLength != null) {
      // `length` est un texte libre côté mock ("13,5 m") : on extrait le nombre en tête.
      const size = parseFloat((b.length ?? "").replace(",", ".")) || 0;
      if (minLength != null && size < minLength) return false;
      if (maxLength != null && size > maxLength) return false;
    }
    return true;
  });
}

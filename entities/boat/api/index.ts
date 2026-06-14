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
  query?: string;
  type?: BoatType;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Boat[]> {
  return ALL_BOATS.filter((b) => {
    const { query, type, minPrice, maxPrice } = params;
    if (type && type !== "tous" && b.type !== type) return false;
    if (minPrice && b.pricePerDay < minPrice) return false;
    if (maxPrice && b.pricePerDay > maxPrice) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

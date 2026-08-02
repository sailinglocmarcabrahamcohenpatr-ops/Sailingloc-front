import { ALL_DESTINATIONS } from "../model/data";
import type { FullDestination } from "@/shared/types";
import { getBoats } from "@/entities/boat";
import { boatsApi } from "@/shared/lib/boats-api";
import { matchesDestination, locationMatchesDestination } from "@/shared/lib/destination-match";

export function getDestinations(): FullDestination[] {
  return ALL_DESTINATIONS;
}

export function getDestinationBySlug(slug: string): FullDestination | undefined {
  return ALL_DESTINATIONS.find((d) => d.slug === slug);
}

/** Destinations avec leur nombre réel de bateaux publiés (API backend, données mock en fallback). */
export async function getDestinationsWithLiveBoatCounts(): Promise<FullDestination[]> {
  const destinations = getDestinations();
  try {
    const apiBoats = await boatsApi.getAll();
    return destinations.map((dest) => ({
      ...dest,
      boatCount: apiBoats.filter((b) => matchesDestination(b.port, dest)).length,
    }));
  } catch {
    const mockBoats = await getBoats();
    return destinations.map((dest) => ({
      ...dest,
      boatCount: mockBoats.filter((b) => locationMatchesDestination(b.location, dest)).length,
    }));
  }
}

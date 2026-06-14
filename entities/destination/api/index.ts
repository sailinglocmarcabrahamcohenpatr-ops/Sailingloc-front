import { ALL_DESTINATIONS } from "../model/data";
import type { FullDestination } from "@/shared/types";

export function getDestinations(): FullDestination[] {
  return ALL_DESTINATIONS;
}

export function getDestinationBySlug(slug: string): FullDestination | undefined {
  return ALL_DESTINATIONS.find((d) => d.slug === slug);
}

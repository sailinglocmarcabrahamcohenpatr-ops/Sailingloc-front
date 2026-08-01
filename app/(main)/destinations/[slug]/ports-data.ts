import { getBoats, adaptBoatFromApi } from "@/entities/boat";
import type { Boat } from "@/entities/boat";
import { boatsApi, type BoatAPI } from "@/shared/lib/boats-api";
import { matchesDestination as matchesDestinationApi, locationMatchesDestination } from "@/shared/lib/destination-match";
import { slugify } from "@/shared/lib/utils";
import type { FullDestination } from "@/shared/types";

export type PortBoat = Boat & {
  coordinates: { lat: number; lng: number };
  portId: string;
  portName: string;
  portVille: string;
};

export interface DestinationPort {
  id: string;
  name: string;
  ville: string;
  imageSeed: string;
  boats: PortBoat[];
  priceFrom: number;
  coordinates: { lat: number; lng: number };
}

/** Décalage déterministe (basé sur l'id) pour disperser lisiblement les bateaux sans port géolocalisé. */
function jitter(seed: number, base: number, spread: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  const frac = x - Math.floor(x);
  return base + (frac - 0.5) * spread;
}

function adaptApiBoat(b: BoatAPI, dest: FullDestination): PortBoat | null {
  if (!matchesDestinationApi(b.port, dest) || !b.port) return null;

  const boat = adaptBoatFromApi(b);
  const lat = boat.coordinates?.lat ?? jitter(b.id, dest.center.lat, 0.05);
  const lng = boat.coordinates?.lng ?? jitter(b.id * 7 + 3, dest.center.lng, 0.08);

  return {
    ...boat,
    coordinates: { lat, lng },
    portId: String(b.port.id),
    portName: b.port.nom,
    portVille: b.port.ville,
  };
}

function adaptMockBoat(b: Boat, dest: FullDestination): PortBoat | null {
  if (!b.coordinates || !locationMatchesDestination(b.location, dest)) return null;
  const [ville, ...rest] = b.location.split(",").map((s) => s.trim());
  const portName = rest.join(", ") || ville;
  return {
    ...b,
    coordinates: b.coordinates,
    portId: slugify(b.location),
    portName,
    portVille: ville,
  };
}

/** Tous les bateaux d'une destination, chacun rattaché à son port réel (id/nom/ville). */
export async function getDestinationBoats(dest: FullDestination): Promise<PortBoat[]> {
  try {
    const apiBoats = await boatsApi.getAll();
    return apiBoats
      .map((b) => adaptApiBoat(b, dest))
      .filter((b): b is PortBoat => b !== null);
  } catch {
    const mockBoats = await getBoats();
    return mockBoats
      .map((b) => adaptMockBoat(b, dest))
      .filter((b): b is PortBoat => b !== null);
  }
}

/** Regroupe les bateaux d'une destination par port, du plus fourni au moins fourni. */
export function groupBoatsByPort(boats: PortBoat[]): DestinationPort[] {
  const map = new Map<string, DestinationPort>();
  for (const boat of boats) {
    let group = map.get(boat.portId);
    if (!group) {
      group = {
        id: boat.portId,
        name: boat.portName,
        ville: boat.portVille,
        imageSeed: `port-${boat.portId}`,
        boats: [],
        priceFrom: boat.pricePerDay,
        coordinates: boat.coordinates,
      };
      map.set(boat.portId, group);
    }
    group.boats.push(boat);
    group.priceFrom = Math.min(group.priceFrom, boat.pricePerDay);
  }
  return Array.from(map.values()).sort((a, b) => b.boats.length - a.boats.length);
}

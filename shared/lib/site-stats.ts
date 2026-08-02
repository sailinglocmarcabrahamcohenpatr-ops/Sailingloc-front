import type { BoatAPI } from "./boats-api";
import { boatsApi } from "./boats-api";

/** Une réservation confirmée ou terminée correspond à un voyage réellement effectué. */
const REALIZED_STATUSES = new Set(["confirmée", "terminée"]);

/** Note moyenne pondérée par le nombre d'avis, sur un ensemble de bateaux. */
export function computeSatisfaction(boats: BoatAPI[], fallback: number): number {
  let noteWeighted = 0;
  let noteCount = 0;
  for (const b of boats) {
    if (b.nombreAvis) {
      noteWeighted += (b.noteMoyenne ?? 0) * b.nombreAvis;
      noteCount += b.nombreAvis;
    }
  }
  return noteCount > 0 ? noteWeighted / noteCount : fallback;
}

/** Nombre de réservations confirmées ou terminées parmi un ensemble de bateaux. */
export async function countCompletedTrips(boats: BoatAPI[]): Promise<number> {
  const reservationsByBoat = await Promise.all(
    boats.map((b) => boatsApi.getReservations(b.id).catch(() => []))
  );
  return reservationsByBoat
    .flat()
    .filter((r) => r.statutReservation && REALIZED_STATUSES.has(r.statutReservation)).length;
}

/** Nombre de propriétaires distincts parmi un ensemble de bateaux. */
export function countDistinctOwners(boats: BoatAPI[]): number {
  return new Set(
    boats
      .map((b) => b.proprietaire?.id ?? b.utilisateur?.id)
      .filter((id): id is number => !!id)
  ).size;
}

/** Espace fine comme séparateur de milliers (« 3 200 », « 50 000 »). */
export function formatStatNumber(n: number, decimals = 0): string {
  const fixed = n.toFixed(decimals);
  const [intPart, dec] = fixed.split(".");
  const spaced = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return dec ? `${spaced}.${dec}` : spaced;
}

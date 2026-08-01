import { boatsApi } from "@/shared/lib/boats-api";
import { adaptBoatFromApi } from "@/entities/boat";
import type { Boat } from "@/entities/boat";

const MAX_FEATURED_BOATS = 3;
/** Une annonce n'est mise en avant que si elle a de vrais avis avec une bonne moyenne. */
const MIN_RATING = 4;

function countActiveReservations(reservations: { statutReservation?: string }[]): number {
  return reservations.filter((r) => !(r.statutReservation ?? "").toLowerCase().includes("annul")).length;
}

/** Sélectionne les bateaux les mieux notés et les plus réservés pour la home. Vide si l'API est injoignable. */
export async function getFeaturedBoats(): Promise<Boat[]> {
  try {
    const boats = await boatsApi.getAll({ statut: "disponible", limit: "200" });
    const wellRated = boats.filter((b) => (b.nombreAvis ?? 0) > 0 && (b.noteMoyenne ?? 0) >= MIN_RATING);
    if (wellRated.length === 0) return [];

    const reservationCounts = await Promise.all(
      wellRated.map((b) => boatsApi.getReservations(b.id).then(countActiveReservations).catch(() => 0))
    );

    return wellRated
      .map((boat, i) => ({ boat, reservations: reservationCounts[i] }))
      .sort((a, b) => {
        if (b.reservations !== a.reservations) return b.reservations - a.reservations;
        return (b.boat.noteMoyenne ?? 0) - (a.boat.noteMoyenne ?? 0);
      })
      .slice(0, MAX_FEATURED_BOATS)
      .map(({ boat }) => adaptBoatFromApi(boat));
  } catch {
    return [];
  }
}

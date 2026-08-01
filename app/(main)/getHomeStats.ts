import { boatsApi } from "@/shared/lib/boats-api";
import { api } from "@/shared/lib/api-client";

export interface HomeStatsValues {
  boatsAvailable: number;
  countries: number;
  completedTrips: number;
  satisfaction: number;
}

/** Valeurs affichées si le backend est injoignable, pour ne pas casser la home. */
const FALLBACK: HomeStatsValues = {
  boatsAvailable: 3200,
  countries: 15,
  completedTrips: 50000,
  satisfaction: 4.9,
};

/** Une réservation confirmée ou terminée correspond à un voyage réellement effectué. */
const REALIZED_STATUSES = new Set(["confirmée", "terminée"]);

export async function getHomeStats(): Promise<HomeStatsValues> {
  try {
    const [{ pagination }, boats] = await Promise.all([
      api.get<{ pagination: { total: number } }>("/api/bateaux?statut=disponible&limit=1"),
      boatsApi.getAll({ limit: "200" }),
    ]);

    const countries = new Set(
      boats.map((b) => b.port?.pays?.trim()).filter((p): p is string => !!p)
    ).size;

    let noteWeighted = 0;
    let noteCount = 0;
    for (const b of boats) {
      if (b.nombreAvis) {
        noteWeighted += (b.noteMoyenne ?? 0) * b.nombreAvis;
        noteCount += b.nombreAvis;
      }
    }
    // Pas d'avis en base pour l'instant : on affiche la note par défaut plutôt qu'un 0/5 trompeur.
    const satisfaction = noteCount > 0 ? noteWeighted / noteCount : FALLBACK.satisfaction;

    const reservationsByBoat = await Promise.all(
      boats.map((b) => boatsApi.getReservations(b.id).catch(() => []))
    );
    const completedTrips = reservationsByBoat
      .flat()
      .filter((r) => r.statutReservation && REALIZED_STATUSES.has(r.statutReservation)).length;

    return {
      boatsAvailable: pagination?.total ?? FALLBACK.boatsAvailable,
      countries: countries || FALLBACK.countries,
      completedTrips,
      satisfaction,
    };
  } catch {
    return FALLBACK;
  }
}

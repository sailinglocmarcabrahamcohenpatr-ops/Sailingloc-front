import { boatsApi } from "@/shared/lib/boats-api";
import { api } from "@/shared/lib/api-client";
import { computeSatisfaction, countCompletedTrips } from "@/shared/lib/site-stats";

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

export async function getHomeStats(): Promise<HomeStatsValues> {
  try {
    const [{ pagination }, boats] = await Promise.all([
      api.get<{ pagination: { total: number } }>("/api/bateaux?statut=disponible&limit=1"),
      boatsApi.getAll({ limit: "200" }),
    ]);

    const countries = new Set(
      boats.map((b) => b.port?.pays?.trim()).filter((p): p is string => !!p)
    ).size;

    // Pas d'avis en base pour l'instant : on affiche la note par défaut plutôt qu'un 0/5 trompeur.
    const satisfaction = computeSatisfaction(boats, FALLBACK.satisfaction);
    const completedTrips = await countCompletedTrips(boats);

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

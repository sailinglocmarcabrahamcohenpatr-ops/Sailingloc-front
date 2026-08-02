import { boatsApi } from "@/shared/lib/boats-api";
import { computeSatisfaction, countCompletedTrips, countDistinctOwners } from "@/shared/lib/site-stats";

export interface AuthStatsValues {
  owners: number;
  trips: number;
  satisfaction: number;
}

/** Valeurs affichées si le backend est injoignable, pour ne pas casser la page de connexion. */
const FALLBACK: AuthStatsValues = {
  owners: 3200,
  trips: 50000,
  satisfaction: 4.9,
};

export async function getAuthStats(): Promise<AuthStatsValues> {
  try {
    const boats = await boatsApi.getAll({ limit: "200" });

    const owners = countDistinctOwners(boats);
    const satisfaction = computeSatisfaction(boats, FALLBACK.satisfaction);
    const trips = await countCompletedTrips(boats);

    return {
      owners: owners || FALLBACK.owners,
      trips,
      satisfaction,
    };
  } catch {
    return FALLBACK;
  }
}

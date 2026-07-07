import { api } from "@/shared/lib/api-client";
import type { DisponibiliteAPI } from "@/shared/lib/boats-api";
import type { DisponibiliteSlot } from "../model/types";

/**
 * Crée un créneau de disponibilité via POST /api/disponibilites.
 * @param bateauId  ID du bateau créé à l'étape 1
 * @param slot      Créneau { date_debut, date_fin }
 */
export async function createDisponibilite(
  bateauId: number,
  slot: DisponibiliteSlot,
): Promise<DisponibiliteAPI> {
  return api.post<DisponibiliteAPI>(
    "/api/disponibilites",
    {
      id_bateau:  bateauId,
      date_debut: slot.date_debut,
      date_fin:   slot.date_fin || null,
      statut:     "disponible",
    },
    true, // auth requise
  );
}

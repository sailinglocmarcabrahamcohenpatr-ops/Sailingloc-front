import { avisApi, ApiError } from "@/shared/lib";
import type { AvisAPI } from "@/shared/lib";
import type { RatingFormValues } from "../model/types";

export interface RateBoatResult {
  success: boolean;
  avis?: AvisAPI;
  /** Pas de texte en dur ici : la traduction du message affiché à
   *  l'utilisateur relève de la couche UI (i18n), pas de cette API. */
  errorKind?: "already-rated" | "not-completed" | "server" | "network";
}

export async function submitBoatRating(
  reservationId: number,
  values: RatingFormValues,
): Promise<RateBoatResult> {
  try {
    const avis = await avisApi.create({
      note_proprietaire: values.noteProprietaire,
      note_bateau: values.noteBateau,
      note_lieu: values.noteLieu,
      commentaire: values.commentaire,
      id_reservation: reservationId,
    });
    return { success: true, avis };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) {
        return { success: false, errorKind: "already-rated" };
      }
      if (err.status === 422) {
        return { success: false, errorKind: "not-completed" };
      }
      return { success: false, errorKind: "server" };
    }
    return { success: false, errorKind: "network" };
  }
}

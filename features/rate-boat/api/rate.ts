import { avisApi, ApiError } from "@/shared/lib";
import type { AvisAPI } from "@/shared/lib";
import type { RatingFormValues } from "../model/types";

export interface RateBoatResult {
  success: boolean;
  avis?: AvisAPI;
  error?: string;
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
        return { success: false, error: "Vous avez déjà noté cette location." };
      }
      if (err.status === 422) {
        return { success: false, error: "Cette location doit être terminée pour pouvoir être notée." };
      }
      return { success: false, error: err.message || "Une erreur est survenue. Veuillez réessayer." };
    }
    return { success: false, error: "Impossible d'envoyer votre notation. Vérifiez votre connexion." };
  }
}

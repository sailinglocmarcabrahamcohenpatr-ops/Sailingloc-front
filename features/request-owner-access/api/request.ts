import { ownerRequestsApi, ApiError } from "@/shared/lib";
import type { CreateOwnerRequestPayload, OwnerRequestAPI } from "@/shared/lib";
import type { OwnerRequestFormValues } from "../model/types";

export interface OwnerRequestResult {
  success: boolean;
  request?: OwnerRequestAPI;
  error?: string;
}

function toPayload(values: OwnerRequestFormValues): CreateOwnerRequestPayload {
  return {
    owner_type: values.ownerType,
    phone: values.phone,
    address: values.address,
    city: values.city,
    postal_code: values.postalCode,
    country: values.country || undefined,
    company_name: values.companyName || undefined,
    siret: values.siret || undefined,
    vat_number: values.vatNumber || undefined,
  };
}

export async function sendOwnerRequest(values: OwnerRequestFormValues): Promise<OwnerRequestResult> {
  try {
    const request = await ownerRequestsApi.create(toPayload(values));
    return { success: true, request };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) {
        return { success: false, error: "Une demande est déjà en cours de traitement pour votre compte." };
      }
      if (err.status === 401) {
        return { success: false, error: err.message };
      }
      /* Le backend renvoie 500 « Une erreur est survenue. » dans des cas très
         différents : on n'affiche pas ce message brut, il n'aide personne. */
      if (err.status >= 500) {
        return {
          success: false,
          error: "Le serveur n'a pas pu traiter votre demande. Réessayez dans un instant ; si le problème persiste, contactez le support.",
        };
      }
      return { success: false, error: err.message || "Une erreur est survenue. Veuillez réessayer." };
    }
    return { success: false, error: "Impossible d'envoyer la demande. Vérifiez votre connexion." };
  }
}

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
    owner_type: "particulier",
    phone: values.phone,
    address: values.address,
    city: values.city,
    postal_code: values.postalCode,
    country: values.country || undefined,
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
      return { success: false, error: err.message || "Une erreur est survenue. Veuillez réessayer." };
    }
    return { success: false, error: "Impossible d'envoyer la demande. Vérifiez votre connexion." };
  }
}

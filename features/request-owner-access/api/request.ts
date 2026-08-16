import { ownerRequestsApi, ApiError } from "@/shared/lib";
import type { CreateOwnerRequestPayload, OwnerRequestAPI } from "@/shared/lib";
import type { OwnerRequestFormValues } from "../model/types";

export interface OwnerRequestResult {
  success: boolean;
  request?: OwnerRequestAPI;
  /** Pas de texte en dur ici : la traduction du message affiché à
   *  l'utilisateur relève de la couche UI (i18n), pas de cette API. */
  errorKind?: "already-pending" | "unauthorized" | "server" | "network";
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
        return { success: false, errorKind: "already-pending" };
      }
      if (err.status === 401) {
        return { success: false, errorKind: "unauthorized" };
      }
      /* Le backend renvoie 500 « Une erreur est survenue. » dans des cas très
         différents : on n'affiche pas ce message brut, il n'aide personne. */
      if (err.status >= 500) {
        return { success: false, errorKind: "server" };
      }
      return { success: false };
    }
    return { success: false, errorKind: "network" };
  }
}

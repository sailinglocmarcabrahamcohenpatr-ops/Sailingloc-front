import { api } from "./api-client";

export type OwnerType = "particulier" | "professionnel";
export type OwnerRequestStatus = "pending" | "approved" | "rejected";

export interface OwnerRequestUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
}

export interface OwnerRequestAPI {
  id: number;
  user: OwnerRequestUser;
  ownerType: OwnerType;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  companyName?: string | null;
  siret?: string | null;
  vatNumber?: string | null;
  identityDocument?: unknown | null;
  proofAddressDocument?: unknown | null;
  status: OwnerRequestStatus;
  adminComment?: string | null;
  createdAt: string;
  validatedAt?: string | null;
  validatedBy?: OwnerRequestUser | null;
}

export interface CreateOwnerRequestPayload {
  owner_type: OwnerType;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country?: string;
  company_name?: string;
  siret?: string;
  vat_number?: string;
  identity_document_id?: number;
  proof_address_document_id?: number;
}

export const ownerRequestsApi = {
  /** ADMIN : toutes les demandes. Utilisateur normal : uniquement les siennes. */
  getAll: () => api.get<OwnerRequestAPI[]>("/api/owner-requests"),
  getOne: (id: number | string) => api.get<OwnerRequestAPI>(`/api/owner-requests/${id}`),
  create: (data: CreateOwnerRequestPayload) =>
    api.post<OwnerRequestAPI>("/api/owner-requests", data, true),
  /** ADMIN uniquement — approuve ou refuse ; l'approbation attribue ROLE_PROPRIETAIRE côté backend. */
  updateStatus: (id: number | string, status: "approved" | "rejected", adminComment?: string) =>
    api.put<OwnerRequestAPI>(`/api/owner-requests/${id}`, { status, admin_comment: adminComment }),
};

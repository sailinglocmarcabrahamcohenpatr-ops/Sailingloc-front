import { api } from "./api-client";
import type { DisponibiliteAPI } from "./boats-api";

export interface TypeBateauAPI {
  id: number;
  labelTypeBateau: string;
}

export interface PortAPI {
  id: number;
  nom: string;
  ville: string;
  pays?: string;
  latitude?: number;
  longitude?: number;
}

export interface StatutReservationAPI {
  id: number;
  libelle: string;
}

export interface ModePaiementAPI {
  id: number;
  libelle: string;
}

export interface StatutPaiementAPI {
  id: number;
  libelle: string;
}

export interface AssuranceAPI {
  id: number;
  libelle: string;
  description?: string;
}

export interface TypeDocumentAPI {
  id: number;
  labelTypeDocument?: string; // label_type_document → camelCase API
  libelle?: string;            // fallback selon mapping backend
}

export interface UtilisateurAPI {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  telephone?: string;
  statutCompte?: boolean;
  roles: string[];
}

// All referentiels require ROLE_USER (auth=true, the default)
export const referentielsApi = {
  getTypesBateaux: () =>
    api.get<TypeBateauAPI[]>("/api/referentiels/types-bateaux"),
  getTypesDocuments: () =>
    api.get<TypeDocumentAPI[]>("/api/referentiels/types-documents"),
  getRoles: () =>
    api.get<string[]>("/api/referentiels/roles"),
  getStatutsReservations: () =>
    api.get<StatutReservationAPI[]>("/api/referentiels/statuts-reservations"),
  getModesPaiements: () =>
    api.get<ModePaiementAPI[]>("/api/referentiels/modes-paiements"),
  getStatutsPaiements: () =>
    api.get<StatutPaiementAPI[]>("/api/referentiels/statuts-paiements"),
  getAssurances: () =>
    api.get<AssuranceAPI[]>("/api/referentiels/assurances"),
};

export const portsApi = {
  getAll: () =>
    api.get<PortAPI[]>("/api/ports"),
  getOne: (id: number | string) =>
    api.get<PortAPI>(`/api/ports/${id}`),
  create: (data: Omit<PortAPI, "id">) =>
    api.post<PortAPI>("/api/ports", data, true),
};

export const utilisateursApi = {
  getAll: () =>
    api.get<UtilisateurAPI[]>("/api/utilisateurs"),
  getOne: (id: number | string) =>
    api.get<UtilisateurAPI>(`/api/utilisateurs/${id}`),
  update: (id: number | string, data: Partial<Omit<UtilisateurAPI, "id" | "roles">>) =>
    api.put<UtilisateurAPI>(`/api/utilisateurs/${id}`, data),
  patch: (id: number | string, data: Partial<Omit<UtilisateurAPI, "id" | "roles">>) =>
    api.patch<UtilisateurAPI>(`/api/utilisateurs/${id}`, data),
  delete: (id: number | string) =>
    api.delete<void>(`/api/utilisateurs/${id}`),
};

export const disponibilitesApi = {
  getAll: () =>
    api.get<DisponibiliteAPI[]>("/api/disponibilites"),
  getOne: (id: number | string) =>
    api.get<DisponibiliteAPI>(`/api/disponibilites/${id}`),
  /** date_debut/date_fin/id_bateau en snake_case : convention des payloads POST de cette API */
  create: (data: { date_debut: string; date_fin: string; id_bateau: number }) =>
    api.post<DisponibiliteAPI>("/api/disponibilites", data, true),
  update: (id: number | string, data: { date_debut: string; date_fin: string }) =>
    api.put<DisponibiliteAPI>(`/api/disponibilites/${id}`, data),
  delete: (id: number | string) =>
    api.delete<void>(`/api/disponibilites/${id}`),
};

export const paiementsApi = {
  getAll: () =>
    api.get<unknown[]>("/api/paiements"),
  getOne: (id: number | string) =>
    api.get(`/api/paiements/${id}`),
  create: (data: { montant: number; id_reservation: number; id_statut_paiement: number; id_mode_paiement: number }) =>
    api.post("/api/paiements", data, true),
  update: (id: number | string, data: unknown) =>
    api.put(`/api/paiements/${id}`, data),
  delete: (id: number | string) =>
    api.delete<void>(`/api/paiements/${id}`),
};

export const avisApi2 = {
  getAll: () =>
    api.get<{ id: number; note: number; commentaire: string; id_reservation: number; id_utilisateur: number }[]>("/api/avis"),
  getOne: (id: number | string) =>
    api.get(`/api/avis/${id}`),
};

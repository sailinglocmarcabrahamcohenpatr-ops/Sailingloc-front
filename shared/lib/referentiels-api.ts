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
  /** Renvoyé par GET /api/ports, absent de l'ancienne définition du type. */
  codePostal?: string;
  /** L'API sérialise les coordonnées en STRING ("43.2952790"), pas en number. */
  latitude?: number | string;
  longitude?: number | string;
}

/** Champs acceptés à la création d'un port.
 *  Convention camelCase, alignée sur la forme renvoyée par GET /api/ports.
 *  À confirmer avec un JWT propriétaire : certains POST de cette API utilisent
 *  du snake_case (cf. disponibilitesApi.create → date_debut / id_bateau). */
export interface CreatePortPayload {
  nom: string;
  ville: string;
  pays?: string;
  codePostal?: string;
  latitude?: number | string;
  longitude?: number | string;
}

/** Enum backend sérialisé en simple string — pas de table référentielle avec id/libelle. */
export interface StatutReservationAPI {
  value: string;
}

export interface ModePaiementAPI {
  id: number;
  libelle: string;
}

/** Enum backend sérialisé en simple string — pas de table référentielle avec id/libelle. */
export interface StatutPaiementAPI {
  value: string;
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

export interface TypeEquipementAPI {
  id: number;
  labelTypeEquipement: string;
  equipements?: EquipementAPI[];
}

export interface EquipementAPI {
  id: number;
  nom: string;
  icone?: string | null;
  typeEquipement?: TypeEquipementAPI;
}

export interface UtilisateurAPI {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  telephone?: string;
  statutCompte?: string;
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
  getTypesEquipements: () =>
    api.get<TypeEquipementAPI[]>("/api/referentiels/types-equipements"),
  getEquipements: () =>
    api.get<EquipementAPI[]>("/api/referentiels/equipements"),
};

export const typesEquipementsApi = {
  create: (data: { label_type_equipement: string }) =>
    api.post<TypeEquipementAPI>("/api/referentiels/types-equipements", data, true),
  update: (id: number | string, data: { label_type_equipement?: string }) =>
    api.put<TypeEquipementAPI>(`/api/referentiels/types-equipements/${id}`, data),
  delete: (id: number | string) =>
    api.delete<void>(`/api/referentiels/types-equipements/${id}`),
};

export const equipementsApi = {
  create: (data: { nom: string; type_equipement_id: number; icone?: string | null }) =>
    api.post<EquipementAPI>("/api/referentiels/equipements", data, true),
  update: (id: number | string, data: { nom?: string; icone?: string | null; type_equipement_id?: number }) =>
    api.put<EquipementAPI>(`/api/referentiels/equipements/${id}`, data),
  delete: (id: number | string) =>
    api.delete<void>(`/api/referentiels/equipements/${id}`),
};

export const portsApi = {
  /** GET /api/ports renvoie { data, pagination }, pas un tableau brut —
   *  on normalise ici pour que tous les appelants reçoivent un PortAPI[]. */
  getAll: async () => {
    const res = await api.get<PortAPI[] | { data: PortAPI[] }>("/api/ports");
    if (Array.isArray(res)) return res;
    return (res as { data?: PortAPI[] })?.data ?? [];
  },
  getOne: (id: number | string) =>
    api.get<PortAPI>(`/api/ports/${id}`),
  create: (data: CreatePortPayload) =>
    api.post<PortAPI>("/api/ports", data, true),
  update: (id: number | string, data: Partial<CreatePortPayload>) =>
    api.put<PortAPI>(`/api/ports/${id}`, data),
  delete: (id: number | string) =>
    api.delete<void>(`/api/ports/${id}`),
};

export const utilisateursApi = {
  getAll: () =>
    api.get<UtilisateurAPI[]>("/api/utilisateurs"),
  getOne: (id: number | string) =>
    api.get<UtilisateurAPI>(`/api/utilisateurs/${id}`),
  /** password optionnel : à n'envoyer que si l'utilisateur souhaite le changer. */
  update: (id: number | string, data: Partial<Omit<UtilisateurAPI, "id" | "roles">> & { password?: string; statut_compte?: string }) =>
    api.put<UtilisateurAPI>(`/api/utilisateurs/${id}`, data),
  patch: (id: number | string, data: Partial<Omit<UtilisateurAPI, "id">> & { password?: string; statut_compte?: string; roles?: string[] }) =>
    api.patch<UtilisateurAPI>(`/api/utilisateurs/${id}`, data),
  delete: (id: number | string) =>
    api.delete<void>(`/api/utilisateurs/${id}`),
};

export const disponibilitesApi = {
  getAll: () =>
    api.get<DisponibiliteAPI[]>("/api/disponibilites"),
  getOne: (id: number | string) =>
    api.get<DisponibiliteAPI>(`/api/disponibilites/${id}`),
  /** date_debut/date_fin/id_bateau en snake_case : convention des payloads POST de cette API.
   *  `statut` : "disponible" (défaut, ouvert à la location), "bloque" (bloqué par le
   *  propriétaire, ex. maintenance) ou "indisponible". */
  create: (data: { date_debut: string; date_fin: string; id_bateau: number; statut?: string }) =>
    api.post<DisponibiliteAPI>("/api/disponibilites", data, true),
  update: (id: number | string, data: { date_debut: string; date_fin: string; statut?: string }) =>
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


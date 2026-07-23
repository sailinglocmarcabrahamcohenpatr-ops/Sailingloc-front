import { api } from "./api-client";

export interface ReservationAPI {
  id: number;
  dateDebut: string;
  dateFin: string;
  montantTotal: number;
  idBateau: number;
  idUtilisateur: number;
  idContrat?: number;
  idStatutReservation: number;
  statutReservation?: { id: number; libelle: string };
  bateau?: { id: number; nomBateau: string; prixJour: number | string };
  utilisateur?: { id: number; prenom: string; nom: string; email: string };
  paiements?: unknown[];
  avis?: unknown[];
}

export interface CreateReservationPayload {
  date_debut: string;
  date_fin: string;
  montant_total: number;
  id_bateau: number;
  id_utilisateur: number;
  id_contrat?: number;
  id_statut_reservation: number;
}

export interface AvisAPI {
  id: number;
  note: number;
  noteProprietaire: number;
  noteBateau: number;
  noteLieu: number;
  commentaire: string;
  dateAvis: string;
  utilisateur?: { id: number; prenom: string; nom: string };
  reservation?: {
    id: number;
    dateDebut: string;
    dateFin: string;
    bateau?: { id: number; nomBateau: string };
  };
}

export interface CreateAvisPayload {
  note_proprietaire: number;
  note_bateau: number;
  note_lieu: number;
  commentaire: string;
  id_reservation: number;
}

export const reservationsApi = {
  getAll: () =>
    api.get<ReservationAPI[]>("/api/reservations"),
  getOne: (id: number | string) =>
    api.get<ReservationAPI>(`/api/reservations/${id}`),
  create: (data: CreateReservationPayload) =>
    api.post<ReservationAPI>("/api/reservations", data, true),
  update: (id: number | string, data: Partial<CreateReservationPayload>) =>
    api.put<ReservationAPI>(`/api/reservations/${id}`, data),
  cancel: (id: number | string) =>
    api.delete<void>(`/api/reservations/${id}`),
  getPaiements: (id: number | string) =>
    api.get<unknown[]>(`/api/reservations/${id}/paiements`),
  getAvis: (id: number | string) =>
    api.get<AvisAPI[]>(`/api/reservations/${id}/avis`),
};

export const avisApi = {
  getAll: () =>
    api.get<AvisAPI[]>("/api/avis"),
  /** Avis laissés par l'utilisateur connecté */
  getMine: () =>
    api.get<AvisAPI[]>("/api/avis/mine"),
  /** Avis reçus par un bateau donné */
  getByBateau: (bateauId: number | string) =>
    api.get<AvisAPI[]>(`/api/avis/bateau/${bateauId}`, false),
  getOne: (id: number | string) =>
    api.get<AvisAPI>(`/api/avis/${id}`),
  create: (data: CreateAvisPayload) =>
    api.post<AvisAPI>("/api/avis", data, true),
  delete: (id: number | string) =>
    api.delete<void>(`/api/avis/${id}`),
};

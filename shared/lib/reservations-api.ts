import { api } from "./api-client";
import type { PhotoAPI } from "./boats-api";

export interface ReservationAPI {
  id: number;
  dateReservation?: string;
  dateDebut: string;
  dateFin: string;
  /** L'API renvoie un decimal Doctrine sérialisé en string (ex: "374.00") */
  montantTotal: number | string;
  idContrat?: number;
  /** Valeur de l'enum backend : "en_attente" | "confirmée" | "annulée" | "refusée" | "terminée" */
  statutReservation?: string;
  bateau?: {
    id: number;
    nomBateau: string;
    prixJour?: number | string;
    photos?: PhotoAPI[];
    port?: { id: number; nom: string; ville: string };
    typeBateau?: { id?: number; labelTypeBateau: string };
    proprietaire?: { id: number; prenom: string; nom: string; email?: string; telephone?: string };
  };
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
  /** Optionnel à la création (défaut backend : "en_attente"). Nom de champ historique
   *  côté backend, mais la valeur attendue est bien la string de l'enum, pas un id. */
  statut_reservation?: string;
  id_statut_reservation?: string;
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

export interface PaiementAPI {
  id: number;
  datePaiement: string;
  montant: number | string;
  /** Valeur de l'enum backend : "en_attente" | "paye" | "echoue" | "rembourse" */
  statutPaiement: string;
  stripePaymentIntentId?: string | null;
}

/** Délai minimum avant le départ pour pouvoir annuler gratuitement (cf. FAQ et garanties de réservation). */
export const CANCELLATION_MIN_HOURS = 72;

/** Une réservation ne peut plus être annulée par le client à moins de {@link CANCELLATION_MIN_HOURS}h du départ. */
export function canCancelReservation(dateDebut: string): boolean {
  const hoursUntilDeparture = (new Date(dateDebut).getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursUntilDeparture >= CANCELLATION_MIN_HOURS;
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
    api.get<PaiementAPI[]>(`/api/reservations/${id}/paiements`),
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

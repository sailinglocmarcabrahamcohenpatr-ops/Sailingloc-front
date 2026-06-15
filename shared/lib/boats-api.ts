import { api } from "./api-client";

export interface BoatAPI {
  id: number;
  nom_bateau: string;
  motorisation: string;
  taille: string;
  prix_jour: number;
  capacite: number;
  avec_skipper: boolean;
  statut: "disponible" | "indisponible" | "en_attente";
  id_port: number;
  id_utilisateur: number;
  id_type_bateau: number;
  port?: { id: number; nom: string; ville: string };
  type_bateau?: { id: number; libelle: string };
  photos?: PhotoAPI[];
}

export interface PhotoAPI {
  id: number;
  url: string;
  principale: boolean;
  id_bateau: number;
}

export interface DisponibiliteAPI {
  id: number;
  date_debut: string;
  date_fin: string;
  id_bateau: number;
}

export interface CreateBoatPayload {
  nom_bateau: string;
  motorisation: string;
  taille: string;
  prix_jour: number;
  id_port: number;
  id_utilisateur: number;
  id_type_bateau: number;
  capacite: number;
  avec_skipper: boolean;
  statut?: string;
}

export const boatsApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<BoatAPI[]>(`/api/bateaux${qs}`);
  },
  getOne: (id: number | string) =>
    api.get<BoatAPI>(`/api/bateaux/${id}`),
  create: (data: CreateBoatPayload) =>
    api.post<BoatAPI>("/api/bateaux", data, true),
  update: (id: number | string, data: Partial<CreateBoatPayload>) =>
    api.put<BoatAPI>(`/api/bateaux/${id}`, data),
  patch: (id: number | string, data: Partial<CreateBoatPayload>) =>
    api.patch<BoatAPI>(`/api/bateaux/${id}`, data),
  delete: (id: number | string) =>
    api.delete<void>(`/api/bateaux/${id}`),
  getPhotos: (id: number | string) =>
    api.get<PhotoAPI[]>(`/api/bateaux/${id}/photos`),
  getDisponibilites: (id: number | string) =>
    api.get<DisponibiliteAPI[]>(`/api/bateaux/${id}/disponibilites`),
  getReservations: (id: number | string) =>
    api.get<unknown[]>(`/api/bateaux/${id}/reservations`),
};

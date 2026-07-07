import { api } from "./api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Résout une URL photo relative (ex: /uploads/…) vers une URL absolue */
export function resolvePhotoUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
}

export interface PhotoAPI {
  id: number;
  url: string;             // peut être relatif → utiliser resolvePhotoUrl
  description?: string;
  ordreAffichage?: number; // 0 = principale
}

export interface DisponibiliteAPI {
  id: number;
  date_debut: string;
  date_fin: string;
  id_bateau: number;
}

export interface BoatAPI {
  id: number;
  nomBateau: string;
  motorisation: string;
  taille: string;
  prixJour: string | number;   // l'API renvoie une string "175.00"
  prixHeure?: string | number | null;
  capacite?: number | null;
  avecSkipper: boolean;
  description?: string | null;
  statut: "disponible" | "indisponible" | "en_attente";
  caution?: string | number | null;
  carburantInclus?: boolean;
  permisRequis?: boolean;
  nombreCabines?: number | null;
  id_port?: number;
  id_type_bateau?: number;
  port?: { id: number; nom: string; ville: string };
  type_bateau?: { id: number; libelle: string };
  photos?: PhotoAPI[];
  disponibilites?: DisponibiliteAPI[];
}

export interface CreateBoatPayload {
  nom_bateau:       string;
  motorisation:     string;
  taille:           string;
  prix_jour:        number;
  id_port:          number;
  id_utilisateur:   number;
  id_type_bateau:   number;
  capacite?:        number;
  avec_skipper?:    boolean;
  statut?:          string;
  description?:     string;
  caution?:         number;
  permis_requis?:   boolean;
  nombre_cabines?:  number;
  carburant_inclus?: boolean;
}

type BoatListResponse =
  | BoatAPI[]
  | { "hydra:member": BoatAPI[] }
  | { data: BoatAPI[]; pagination?: unknown }
  | { member: BoatAPI[] };

function extractBoatArray(res: BoatListResponse): BoatAPI[] {
  if (Array.isArray(res)) return res;
  if ("hydra:member" in res) return res["hydra:member"];
  if ("data" in res) return res.data;
  if ("member" in res) return res.member;
  return [];
}

export const boatsApi = {
  getAll: async (params?: Record<string, string>): Promise<BoatAPI[]> => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await api.get<BoatListResponse>(`/api/bateaux${qs}`);
    return extractBoatArray(res);
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

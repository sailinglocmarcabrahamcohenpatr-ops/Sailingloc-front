import { api } from "./api-client";
import type { BoatAPI } from "./boats-api";

export const favorisApi = {
  getAll: () => api.get<BoatAPI[]>("/api/favoris"),
  add: (bateauId: number | string) => api.post<{ favori: boolean }>(`/api/favoris/${bateauId}`, undefined, true),
  remove: (bateauId: number | string) => api.delete<void>(`/api/favoris/${bateauId}`),
};

import { api } from "./api-client";

export interface MessageAPI {
  id: number;
  contenu: string;
  lu: boolean;
  created_at: string;
  id_utilisateur: number;
  id_utilisateur_1: number;
  expediteur?: { id: number; prenom: string; nom: string };
  destinataire?: { id: number; prenom: string; nom: string };
}

export interface SendMessagePayload {
  contenu: string;
  id_utilisateur: number;
  id_utilisateur_1: number;
}

export const messagesApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get<MessageAPI[]>(`/api/messages${qs}`);
  },
  getOne: (id: number | string) =>
    api.get<MessageAPI>(`/api/messages/${id}`),
  send: (data: SendMessagePayload) =>
    api.post<MessageAPI>("/api/messages", data, true),
  markAsRead: (id: number | string) =>
    api.patch<MessageAPI>(`/api/messages/${id}/lu`, {}),
  delete: (id: number | string) =>
    api.delete<void>(`/api/messages/${id}`),
};

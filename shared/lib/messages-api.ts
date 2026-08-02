import { api } from "./api-client";

export interface MessageAPI {
  id: number;
  contenu: string;
  lu: boolean;
  dateEnvoi: string; // ISO datetime
  expediteur: { id: number; nom: string; prenom: string; email: string };
  destinataire: { id: number; nom: string; prenom: string; email: string };
}

export interface SendMessagePayload {
  contenu: string;
  id_destinataire: number;
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
    api.patch<MessageAPI>(`/api/messages/${id}/lu`, null),
  delete: (id: number | string) =>
    api.delete<void>(`/api/messages/${id}`),
};


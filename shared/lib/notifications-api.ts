import { api } from "./api-client";
import type { ReservationAPI } from "./reservations-api";

export type NotificationType = "nouvelle_reservation" | "reservation_confirmee" | "nouvel_avis";

export interface NotificationAPI {
  id: number;
  type: NotificationType;
  titre: string;
  message: string;
  lu: boolean;
  dateCreation: string; // ISO datetime
  destinataire: { id: number; nom: string; prenom: string; email: string };
  reservation?: Pick<ReservationAPI, "id" | "dateDebut" | "dateFin"> | null;
}

export const notificationsApi = {
  getAll: () => api.get<NotificationAPI[]>("/api/notifications"),
  markAsRead: (id: number | string) =>
    api.patch<NotificationAPI>(`/api/notifications/${id}/lu`, null),
  delete: (id: number | string) =>
    api.delete<void>(`/api/notifications/${id}`),
};

export { AuthProvider, useAuth } from "./auth-context";
export type { AuthUser, UserRole } from "./auth-context";

export { PreferencesProvider, usePreferences } from "./preferences-context";
export type { Theme, TextSize } from "./preferences-context";

export { MessagesProvider, useMessages } from "./messages-context";

export { NotificationsProvider, useNotifications } from "./notifications-context";

export { api, getToken, setToken, removeToken, setRoleCookie, ApiError } from "./api-client";

export { apiLogin, apiRegister, apiLogout, apiForgotPassword } from "./auth-api";
export type { LoginPayload, RegisterPayload } from "./auth-api";

export { boatsApi, resolvePhotoUrl, StatutBateau } from "./boats-api";
export type { BoatAPI, PhotoAPI, DisponibiliteAPI, CreateBoatPayload, DocumentAPI, StatutBateauValue } from "./boats-api";

export { reservationsApi, avisApi } from "./reservations-api";
export type { ReservationAPI, CreateReservationPayload, AvisAPI, CreateAvisPayload, PaiementAPI } from "./reservations-api";

export { messagesApi } from "./messages-api";
export type { MessageAPI, SendMessagePayload } from "./messages-api";

export { notificationsApi } from "./notifications-api";
export type { NotificationAPI, NotificationType } from "./notifications-api";

export { referentielsApi, portsApi, utilisateursApi, disponibilitesApi, paiementsApi } from "./referentiels-api";
export type { TypeBateauAPI, PortAPI, StatutReservationAPI, UtilisateurAPI, TypeDocumentAPI } from "./referentiels-api";

export { ownerRequestsApi } from "./owner-requests-api";
export type { OwnerRequestAPI, OwnerRequestUser, OwnerType, OwnerRequestStatus, CreateOwnerRequestPayload } from "./owner-requests-api";

export { favorisApi } from "./favoris-api";

export { documentsApi } from "./documents-api";

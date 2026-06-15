export { AuthProvider, useAuth } from "./auth-context";
export type { AuthUser, UserRole } from "./auth-context";

export { api, setToken, removeToken, ApiError } from "./api-client";

export { apiLogin, apiRegister, apiLogout } from "./auth-api";
export type { LoginPayload, RegisterPayload } from "./auth-api";

export { boatsApi } from "./boats-api";
export type { BoatAPI, PhotoAPI, DisponibiliteAPI, CreateBoatPayload } from "./boats-api";

export { reservationsApi, avisApi } from "./reservations-api";
export type { ReservationAPI, CreateReservationPayload, AvisAPI } from "./reservations-api";

export { messagesApi } from "./messages-api";
export type { MessageAPI, SendMessagePayload } from "./messages-api";

export { referentielsApi, portsApi, utilisateursApi, disponibilitesApi, paiementsApi } from "./referentiels-api";
export type { TypeBateauAPI, PortAPI, StatutReservationAPI, UtilisateurAPI } from "./referentiels-api";

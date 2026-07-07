/** Photo conservée côté client : fichier original + aperçu base64 compressé */
export interface PhotoEntry {
  file: File;
  preview: string; // base64 JPEG généré par compressImage
}

/** Créneau de disponibilité — correspond à un POST /api/disponibilites */
export interface DisponibiliteSlot {
  date_debut: string; // YYYY-MM-DD
  date_fin: string;   // YYYY-MM-DD | "" = sans fin définie
}

export type Motorisation = "voile" | "moteur" | "hybride";

/** États de progression lors de la soumission en 3 étapes */
export type SubmitStep = "idle" | "boat" | "photos" | "disponibilites";

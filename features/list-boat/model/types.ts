/** Photo conservée côté client : fichier original + aperçu base64 compressé */
export interface PhotoEntry {
  file: File;
  preview: string; // base64 JPEG généré par compressImage
}

/** Document conservé côté client avant upload */
export interface DocumentEntry {
  file: File;
  idTypeDocument: number;
}

export type Motorisation = "voile" | "moteur" | "hybride";

/** États de progression lors de la soumission */
export type SubmitStep = "idle" | "boat" | "photos" | "documents";

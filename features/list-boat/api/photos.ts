import { ApiError } from "@/shared/lib/api-client";
import type { PhotoAPI } from "@/shared/lib/boats-api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("sailingloc_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Uploade une photo vers POST /api/photos (multipart/form-data).
 * @param bateauId  ID du bateau créé à l'étape 1
 * @param file      Fichier image original (File object)
 * @param ordre     Position d'affichage — 1 = photo principale
 */
export async function uploadPhoto(
  bateauId: number,
  file: File,
  ordre: number,
): Promise<PhotoAPI> {
  const fd = new FormData();
  fd.append("id_bateau", String(bateauId));
  fd.append("photo", file);
  fd.append("ordre_affichage", String(ordre));

  const res = await fetch(`${API_BASE}/api/photos`, {
    method: "POST",
    headers: getAuthHeaders(), // pas de Content-Type : le navigateur le définit avec le boundary
    body: fd,
  });

  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try { const d = await res.json(); message = d.message ?? d.error ?? message; } catch {}
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<PhotoAPI>;
}

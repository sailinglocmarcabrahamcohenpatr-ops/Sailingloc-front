import { ApiError } from "@/shared/lib/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("sailingloc_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Uploade un document vers POST /api/documents (multipart/form-data).
 * @param bateauId        ID du bateau créé à l'étape 1
 * @param file            Fichier (PDF, image)
 * @param idTypeDocument  ID du type de document (chargé depuis /api/referentiels/types-documents)
 */
export async function uploadDocument(
  bateauId: number,
  file: File,
  idTypeDocument: number,
): Promise<void> {
  const fd = new FormData();
  fd.append("fichier", file);
  fd.append("id_type_document", String(idTypeDocument));
  fd.append("id_bateau", String(bateauId));

  const res = await fetch(`${API_BASE}/api/documents`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: fd,
  });

  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const d = await res.json();
      message = d.message ?? d.error ?? message;
    } catch {}
    throw new ApiError(res.status, message);
  }
}

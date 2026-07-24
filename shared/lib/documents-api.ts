import { api, ApiError } from "./api-client";
import type { DocumentAPI } from "./boats-api";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("sailingloc_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const documentsApi = {
  getAll: () => api.get<DocumentAPI[]>("/api/documents"),
  getOne: (id: number | string) => api.get<DocumentAPI>(`/api/documents/${id}`),
  /** Upload un document vers POST /api/documents (multipart/form-data). */
  create: async (file: File, idTypeDocument: number, idBateau?: number): Promise<DocumentAPI> => {
    const fd = new FormData();
    fd.append("fichier", file);
    fd.append("id_type_document", String(idTypeDocument));
    if (idBateau) fd.append("id_bateau", String(idBateau));

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

    return res.json();
  },
  delete: (id: number | string) => api.delete<void>(`/api/documents/${id}`),
};

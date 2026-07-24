"use client";

import { useEffect, useRef, useState } from "react";
import { documentsApi, referentielsApi, resolvePhotoUrl } from "@/shared/lib";
import type { DocumentAPI, TypeDocumentAPI } from "@/shared/lib";

/** Devine une icône FontAwesome à partir du libellé du type de document (aucune liste de types n'est fixée côté backend). */
function iconForLabel(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("identité") || l.includes("cni")) return "fa-id-card";
  if (l.includes("permis")) return "fa-anchor";
  if (l.includes("assurance")) return "fa-shield-halved";
  if (l.includes("certificat")) return "fa-certificate";
  if (l.includes("grise") || l.includes("immatriculation")) return "fa-file-lines";
  return "fa-folder-plus";
}

export default function DocumentsManager() {
  const [types, setTypes] = useState<TypeDocumentAPI[]>([]);
  const [documents, setDocuments] = useState<DocumentAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [uploadingTypeId, setUploadingTypeId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<Record<number, string>>({});
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    Promise.all([referentielsApi.getTypesDocuments(), documentsApi.getAll()])
      .then(([t, d]) => {
        setTypes(t);
        setDocuments(d);
      })
      .catch(() => setLoadError("Impossible de charger vos documents."))
      .finally(() => setLoading(false));
  }, []);

  const triggerUpload = (typeId: number) => {
    inputRefs.current[typeId]?.click();
  };

  const handleFileChange = async (type: TypeDocumentAPI, previous: DocumentAPI | undefined, file: File | null) => {
    if (!file) return;
    setUploadingTypeId(type.id);
    setUploadError((prev) => ({ ...prev, [type.id]: "" }));
    try {
      const uploaded = await documentsApi.create(file, type.id);
      setDocuments((prev) => [...prev.filter((d) => d.typeDocument?.id !== type.id), uploaded]);
      // Remplacement : l'ancien fichier n'a plus d'utilité une fois le nouveau confirmé côté serveur.
      if (previous) {
        documentsApi.delete(previous.id).catch(() => {});
      }
    } catch {
      setUploadError((prev) => ({ ...prev, [type.id]: "Échec de l'envoi. Réessayez." }));
    } finally {
      setUploadingTypeId(null);
    }
  };

  const handleDelete = async (doc: DocumentAPI) => {
    try {
      await documentsApi.delete(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch {
      if (doc.typeDocument) {
        setUploadError((prev) => ({ ...prev, [doc.typeDocument!.id]: "Impossible de supprimer ce document." }));
      }
    }
  };

  if (loading) {
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>Chargement…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="dash-page">
        <p style={{ color: "var(--red)", padding: "24px" }}>{loadError}</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Mes documents</h1>
          <p className="dash-sub">Gérez vos justificatifs pour accéder à toutes les fonctionnalités</p>
        </div>
      </div>

      <div className="docs-info-banner">
        <i className="fa-solid fa-circle-info" />
        <div>
          <strong>Pourquoi fournir vos documents ?</strong>
          <p>Les propriétaires accordent leur confiance aux profils avec un dossier complet, ce qui augmente vos chances d&apos;acceptation.</p>
        </div>
      </div>

      <div className="docs-list">
        {types.map((type) => {
          const doc = documents.find((d) => d.typeDocument?.id === type.id);
          const label = type.labelTypeDocument ?? type.libelle ?? "Document";
          const icon = iconForLabel(label);
          const busy = uploadingTypeId === type.id;

          return (
            <div key={type.id} className="doc-item">
              <div className="doc-icon">
                <i className={`fa-solid ${icon}`} aria-hidden="true" />
              </div>

              <div className="doc-info">
                <strong>{label}</strong>
                <span>{doc ? "Envoyé" : "Non fourni"}</span>
                {uploadError[type.id] && (
                  <span style={{ color: "var(--red)" }}>{uploadError[type.id]}</span>
                )}
              </div>

              <span className={doc ? "badge-status green" : "badge-status grey"}>
                <i className={`fa-solid ${doc ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden="true" />
                {doc ? "Envoyé" : "Manquant"}
              </span>

              <div className="doc-actions">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  style={{ display: "none" }}
                  ref={(el) => {
                    inputRefs.current[type.id] = el;
                  }}
                  onChange={(e) => {
                    handleFileChange(type, doc, e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
                {doc && (
                  <a
                    href={resolvePhotoUrl(doc.urlDocument ?? "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                  >
                    <i className="fa-solid fa-eye" /> Voir
                  </a>
                )}
                {doc && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(doc)}
                    disabled={busy}
                  >
                    <i className="fa-solid fa-trash" /> Supprimer
                  </button>
                )}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => triggerUpload(type.id)}
                  disabled={busy}
                >
                  {busy ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-upload" />}
                  {doc ? "Remplacer" : "Ajouter"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

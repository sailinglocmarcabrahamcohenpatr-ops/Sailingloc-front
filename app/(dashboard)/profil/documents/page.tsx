"use client";

import { useRef, useState } from "react";

type DocStatus = "verified" | "pending" | "missing" | "optional";

interface Doc {
  id: string;
  label: string;
  description: string;
  icon: string;
  status: DocStatus;
  date: string;
  fileName?: string;
}

const STATUS_META = {
  verified: { label: "Vérifié", cls: "badge-status green", icon: "fa-circle-check" },
  pending:  { label: "En cours", cls: "badge-status orange", icon: "fa-clock" },
  missing:  { label: "Manquant", cls: "badge-status red", icon: "fa-circle-xmark" },
  optional: { label: "Facultatif", cls: "badge-status grey", icon: "fa-circle-plus" },
};

/* Seuls documents exigés pour un compte locataire, par ordre de priorité. */
const INITIAL_DOCS: Doc[] = [
  {
    id: "cni",
    label: "Carte d'identité",
    description: "Pièce d'identité nationale recto-verso",
    icon: "fa-id-card",
    status: "verified",
    date: "Vérifié le 12 mars 2024",
  },
  {
    id: "permis-bateau",
    label: "Permis bateau",
    description: "Permis côtier ou hauturier",
    icon: "fa-anchor",
    status: "missing",
    date: "Non fourni",
  },
  {
    id: "autre",
    label: "Autre document",
    description: "Tout justificatif complémentaire utile à votre dossier",
    icon: "fa-folder-plus",
    status: "optional",
    date: "Non fourni",
  },
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = (docId: string, file: File | null) => {
    if (!file) return;
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, status: "pending", date: "En attente de vérification", fileName: file.name }
          : d
      )
    );
  };

  const triggerUpload = (docId: string) => {
    inputRefs.current[docId]?.click();
  };

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
          <strong>Pourquoi vérifier vos documents ?</strong>
          <p>Les propriétaires accordent leur confiance aux profils vérifiés et un dossier complet augmente vos chances d'acceptation. À l'inverse, tout document manquant ou non vérifié peut entraîner le rejet de votre demande de réservation.</p>
        </div>
      </div>

      <div className="docs-list">
        {docs.map((doc) => (
          <div key={doc.id} className="doc-item">
            <div className="doc-icon">
              <i className={`fa-solid ${doc.icon}`} aria-hidden="true" />
            </div>

            <div className="doc-info">
              <strong>{doc.label}</strong>
              <span style={{ fontSize: ".75rem", color: "var(--text-3)" }}>{doc.description}</span>
              <span>{doc.fileName ? `Fichier : ${doc.fileName}` : doc.date}</span>
            </div>

            <span className={STATUS_META[doc.status].cls}>
              <i className={`fa-solid ${STATUS_META[doc.status].icon}`} aria-hidden="true" />
              {STATUS_META[doc.status].label}
            </span>

            <div className="doc-actions">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                ref={(el) => { inputRefs.current[doc.id] = el; }}
                onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] ?? null)}
              />
              {doc.status === "verified" ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost btn-sm">
                    <i className="fa-solid fa-eye" /> Voir
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => triggerUpload(doc.id)}>
                    <i className="fa-solid fa-rotate" /> Remplacer
                  </button>
                </div>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => triggerUpload(doc.id)}>
                  <i className="fa-solid fa-upload" />
                  {doc.fileName ? "Remplacer" : "Ajouter"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

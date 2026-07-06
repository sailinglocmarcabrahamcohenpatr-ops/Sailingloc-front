"use client";

import { useRef, useState } from "react";

type DocStatus = "verified" | "pending" | "missing";

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
};

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
    id: "carte-grise",
    label: "Carte grise",
    description: "Certificat d'immatriculation du véhicule",
    icon: "fa-file-lines",
    status: "missing",
    date: "Non fourni",
  },
  {
    id: "permis-bateau",
    label: "Permis bateau",
    description: "Permis côtier ou hauturier",
    icon: "fa-anchor",
    status: "missing",
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
          <p>Les propriétaires accordent leur confiance aux profils vérifiés. Un profil complet augmente vos chances d'acceptation de 3×.</p>
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
              <span>{doc.fileName ? `Fichier : ${doc.fileName}` : doc.date}</span>
              <span style={{ fontSize: ".75rem", color: "var(--text-3)" }}>{doc.description}</span>
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
                  {doc.status === "missing" ? "Ajouter" : "Remplacer"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-card" style={{ marginTop: "8px" }}>
        <div className="dash-card-hd"><h3>Ajouter un document</h3></div>
        <div
          className="doc-upload-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (!file) return;
            const missing = docs.find((d) => d.status === "missing");
            if (missing) handleFileChange(missing.id, file);
          }}
        >
          <i className="fa-solid fa-cloud-arrow-up" />
          <strong>Glissez-déposez vos fichiers ici</strong>
          <span>PDF, JPG, PNG — Max 10 Mo par fichier</span>
          <p style={{ fontSize: ".8125rem", color: "var(--text-3)", margin: "4px 0 0" }}>
            Le fichier sera affecté au prochain document manquant
          </p>
        </div>
      </div>
    </div>
  );
}

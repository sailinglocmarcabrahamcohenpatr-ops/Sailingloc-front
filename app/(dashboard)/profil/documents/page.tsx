import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mes documents — SailingLoc" };

const DOCS = [
  { id: "d1", label: "Pièce d'identité", status: "verified" as const, date: "Vérifié le 12 mars 2024", icon: "fa-id-card" },
  { id: "d2", label: "Permis côtier", status: "verified" as const, date: "Vérifié le 5 juin 2024", icon: "fa-anchor" },
  { id: "d3", label: "Attestation d'assurance", status: "pending" as const, date: "En attente de vérification", icon: "fa-shield-halved" },
  { id: "d4", label: "Justificatif de domicile", status: "missing" as const, date: "Non fourni", icon: "fa-house" },
];

const STATUS = {
  verified: { label: "Vérifié", cls: "badge-status green", icon: "fa-circle-check" },
  pending: { label: "En cours", cls: "badge-status orange", icon: "fa-clock" },
  missing: { label: "Manquant", cls: "badge-status red", icon: "fa-circle-xmark" },
};

export default function DocumentsPage() {
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
          <p>Les propriétaires accordent leur confiance aux profils vérifiés. Un profil complet augmente vos chances d'acceptation de 3x.</p>
        </div>
      </div>

      <div className="docs-list">
        {DOCS.map((doc) => (
          <div key={doc.id} className="doc-item">
            <div className="doc-icon">
              <i className={`fa-solid ${doc.icon}`} aria-hidden="true" />
            </div>
            <div className="doc-info">
              <strong>{doc.label}</strong>
              <span>{doc.date}</span>
            </div>
            <span className={STATUS[doc.status].cls}>
              <i className={`fa-solid ${STATUS[doc.status].icon}`} aria-hidden="true" />
              {STATUS[doc.status].label}
            </span>
            <div className="doc-actions">
              {doc.status === "verified" ? (
                <button className="btn btn-ghost btn-sm">
                  <i className="fa-solid fa-eye" /> Voir
                </button>
              ) : (
                <button className="btn btn-outline btn-sm">
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
        <div className="doc-upload-zone">
          <i className="fa-solid fa-cloud-arrow-up" />
          <strong>Glissez-déposez vos fichiers ici</strong>
          <span>PDF, JPG, PNG — Max 10 Mo par fichier</span>
          <button className="btn btn-outline btn-sm" style={{ marginTop: "12px" }}>
            <i className="fa-solid fa-folder-open" /> Parcourir les fichiers
          </button>
        </div>
      </div>
    </div>
  );
}

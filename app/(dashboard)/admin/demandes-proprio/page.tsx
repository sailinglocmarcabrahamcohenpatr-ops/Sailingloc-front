import type { Metadata } from "next";
import "../../proprietaire/dashboard.css";

export const metadata: Metadata = { title: "Admin · Demandes propriétaire · SailingLoc" };

export default function AdminDemandesProprioPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Demandes propriétaire</h1>
          <p className="dash-sub">
            Approuvez ou refusez les demandes d&apos;accès à l&apos;espace propriétaire.
          </p>
        </div>
      </div>

      <div className="dash-empty-state">
        <i className="fa-solid fa-user-check fa-2x" style={{ opacity: 0.3 }} />
        <p>Aucune demande en attente pour l&apos;instant.</p>
      </div>
    </div>
  );
}

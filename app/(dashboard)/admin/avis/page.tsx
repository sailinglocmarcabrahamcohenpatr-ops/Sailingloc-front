import type { Metadata } from "next";
import "../../proprietaire/dashboard.css";

export const metadata: Metadata = { title: "Admin · Avis · SailingLoc" };

export default function AdminAvisPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Gestion des avis</h1>
          <p className="dash-sub">Modérez et supprimez les avis des utilisateurs.</p>
        </div>
      </div>

      <div className="dash-empty-state">
        <i className="fa-solid fa-star fa-2x" style={{ opacity: 0.3 }} />
        <p>Aucun avis à afficher pour l&apos;instant.</p>
      </div>
    </div>
  );
}

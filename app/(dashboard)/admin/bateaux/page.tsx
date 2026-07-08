import type { Metadata } from "next";
import "../../proprietaire/dashboard.css";

export const metadata: Metadata = { title: "Admin · Ajouter un bateau · SailingLoc" };

export default function AdminBateauxPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Ajouter un bateau</h1>
          <p className="dash-sub">
            Créez une annonce de bateau pour un propriétaire existant ou pour la plateforme.
          </p>
        </div>
      </div>

      <div className="dash-empty-state">
        <i className="fa-solid fa-sailboat fa-2x" style={{ opacity: 0.3 }} />
        <p>Le formulaire d&apos;ajout de bateau sera disponible prochainement.</p>
      </div>
    </div>
  );
}

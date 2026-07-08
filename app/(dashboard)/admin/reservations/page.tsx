import type { Metadata } from "next";
import "../../proprietaire/dashboard.css";

export const metadata: Metadata = { title: "Admin · Réservations · SailingLoc" };

export default function AdminReservationsPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Toutes les réservations</h1>
          <p className="dash-sub">Consultez l&apos;ensemble des réservations de la plateforme.</p>
        </div>
      </div>

      <div className="dash-empty-state">
        <i className="fa-solid fa-calendar-check fa-2x" style={{ opacity: 0.3 }} />
        <p>Aucune réservation à afficher pour l&apos;instant.</p>
      </div>
    </div>
  );
}

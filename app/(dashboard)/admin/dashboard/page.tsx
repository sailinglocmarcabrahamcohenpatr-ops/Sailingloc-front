import type { Metadata } from "next";
import Link from "next/link";
import "../../proprietaire/dashboard.css";

export const metadata: Metadata = { title: "Admin · Tableau de bord · SailingLoc" };

export default function AdminDashboardPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Tableau de bord</h1>
          <p className="dash-sub">Bienvenue sur l&apos;espace administrateur.</p>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon">
            <i className="fa-solid fa-users" />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">—</span>
            <span className="dash-stat-label">Utilisateurs inscrits</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">
            <i className="fa-solid fa-sailboat" />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">—</span>
            <span className="dash-stat-label">Bateaux publiés</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">—</span>
            <span className="dash-stat-label">Réservations en cours</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">
            <i className="fa-solid fa-user-check" />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">—</span>
            <span className="dash-stat-label">Demandes propriétaire</span>
          </div>
        </div>
      </div>

      <div className="dash-quick-actions">
        <h2 className="dash-section-title">Actions rapides</h2>
        <div className="dash-action-row">
          <Link href="/admin/demandes-proprio" className="btn btn-primary">
            <i className="fa-solid fa-user-check" /> Demandes propriétaire
          </Link>
          <Link href="/admin/utilisateurs" className="btn btn-outline">
            <i className="fa-solid fa-users" /> Gérer les utilisateurs
          </Link>
          <Link href="/admin/avis" className="btn btn-outline">
            <i className="fa-solid fa-star" /> Gérer les avis
          </Link>
          <Link href="/admin/reservations" className="btn btn-outline">
            <i className="fa-solid fa-calendar-check" /> Voir les réservations
          </Link>
        </div>
      </div>
    </div>
  );
}

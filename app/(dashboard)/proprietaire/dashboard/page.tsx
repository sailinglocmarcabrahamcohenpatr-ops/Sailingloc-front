import type { Metadata } from "next";
import Link from "next/link";
import "../dashboard.css";

export const metadata: Metadata = { title: "Dashboard · SailingLoc" };

export default function ProprietaireDashboardPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Tableau de bord</h1>
          <p className="dash-sub">Bienvenue sur votre espace propriétaire.</p>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon">
            <i className="fa-solid fa-sailboat" />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">0</span>
            <span className="dash-stat-label">Bateau(x) publié(s)</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">0</span>
            <span className="dash-stat-label">Réservation(s) en cours</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">
            <i className="fa-solid fa-euro-sign" />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">0 €</span>
            <span className="dash-stat-label">Revenus ce mois</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">
            <i className="fa-solid fa-envelope" />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">3</span>
            <span className="dash-stat-label">Message(s) non lu(s)</span>
          </div>
        </div>
      </div>

      <div className="dash-quick-actions">
        <h2 className="dash-section-title">Actions rapides</h2>
        <div className="dash-action-row">
          <Link href="/proprietaire/bateaux/nouveau" className="btn btn-primary">
            <i className="fa-solid fa-plus" /> Ajouter un bateau
          </Link>
          <Link href="/proprietaire/reservations" className="btn btn-outline">
            <i className="fa-solid fa-calendar-check" /> Voir les réservations
          </Link>
          <Link href="/proprietaire/messages" className="btn btn-outline">
            <i className="fa-solid fa-envelope" /> Mes messages
          </Link>
        </div>
      </div>
    </div>
  );
}

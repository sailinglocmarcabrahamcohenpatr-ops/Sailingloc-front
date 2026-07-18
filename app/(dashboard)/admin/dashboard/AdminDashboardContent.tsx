"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, utilisateursApi, ownerRequestsApi } from "@/shared/lib";
import "../../proprietaire/dashboard.css";

interface BoatListResponse {
  data: unknown[];
  pagination: { total: number };
}

interface ReservationListItem {
  id: number;
  statutReservation?: { labelStatutReservation?: string } | null;
}

/* Un statut est considéré "terminé" s'il évoque une annulation ou une clôture ;
   tout le reste (en attente, confirmée, en cours…) compte comme actif. */
function isActiveReservation(item: ReservationListItem): boolean {
  const label = item.statutReservation?.labelStatutReservation;
  if (!label) return true;
  return !/annul|termin|complet|refus/i.test(label);
}

interface Stats {
  users: number | null;
  boats: number | null;
  activeReservations: number | null;
  pendingOwnerRequests: number | null;
}

export default function AdminDashboardContent() {
  const [stats, setStats] = useState<Stats>({ users: null, boats: null, activeReservations: null, pendingOwnerRequests: null });

  useEffect(() => {
    utilisateursApi.getAll().then((users) => setStats((s) => ({ ...s, users: users.length }))).catch(() => {});

    api.get<BoatListResponse>("/api/bateaux?limit=1")
      .then((res) => setStats((s) => ({ ...s, boats: res.pagination?.total ?? 0 })))
      .catch(() => {});

    api.get<ReservationListItem[]>("/api/reservations")
      .then((reservations) => setStats((s) => ({ ...s, activeReservations: reservations.filter(isActiveReservation).length })))
      .catch(() => {});

    ownerRequestsApi.getAll()
      .then((requests) => setStats((s) => ({ ...s, pendingOwnerRequests: requests.filter((r) => r.status === "pending").length })))
      .catch(() => {});
  }, []);

  const fmt = (v: number | null) => (v === null ? "—" : v.toLocaleString("fr-FR"));

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
            <span className="dash-stat-value">{fmt(stats.users)}</span>
            <span className="dash-stat-label">Utilisateurs inscrits</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">
            <i className="fa-solid fa-sailboat" />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">{fmt(stats.boats)}</span>
            <span className="dash-stat-label">Bateaux publiés</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon">
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">{fmt(stats.activeReservations)}</span>
            <span className="dash-stat-label">Réservations en cours</span>
          </div>
        </div>
        <Link href="/admin/demandes-proprio" className="dash-stat-card" style={{ cursor: "pointer" }}>
          <div className="dash-stat-icon">
            <i className="fa-solid fa-user-check" />
          </div>
          <div className="dash-stat-body">
            <span className="dash-stat-value">{fmt(stats.pendingOwnerRequests)}</span>
            <span className="dash-stat-label">Demandes propriétaire en attente</span>
          </div>
        </Link>
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

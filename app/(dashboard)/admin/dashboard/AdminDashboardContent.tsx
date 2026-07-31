"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, utilisateursApi, ownerRequestsApi } from "@/shared/lib";
import "./admin-dashboard-home.css";

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
    <div className="adh-page">
      <div className="adh-header">
        <h1>Tableau de bord</h1>
        <p>Bienvenue sur l&apos;espace administrateur.</p>
      </div>

      <div className="adh-stats-grid">
        <Link href="/admin/utilisateurs" className="adh-stat-card adh-hero">
          <div className="adh-stat-top">
            <div className="adh-stat-icon"><i className="fa-solid fa-users" /></div>
            <div className="adh-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div>
            <div className="adh-stat-value">{fmt(stats.users)}</div>
            <div className="adh-stat-label">Utilisateurs inscrits</div>
          </div>
        </Link>

        <Link href="/admin/publication" className="adh-stat-card">
          <div className="adh-stat-top">
            <div className="adh-stat-icon adh-icon-boats"><i className="fa-solid fa-sailboat" /></div>
          </div>
          <div>
            <div className="adh-stat-value">{fmt(stats.boats)}</div>
            <div className="adh-stat-label">Bateaux publiés</div>
          </div>
        </Link>

        <Link href="/admin/reservations" className="adh-stat-card">
          <div className="adh-stat-top">
            <div className="adh-stat-icon adh-icon-reservations"><i className="fa-solid fa-calendar-check" /></div>
          </div>
          <div>
            <div className="adh-stat-value">{fmt(stats.activeReservations)}</div>
            <div className="adh-stat-label">Réservations en cours</div>
          </div>
        </Link>

        <Link href="/admin/demandes-proprio" className="adh-stat-card">
          <div className="adh-stat-top">
            <div className="adh-stat-icon adh-icon-requests"><i className="fa-solid fa-user-check" /></div>
          </div>
          <div>
            <div className="adh-stat-value">{fmt(stats.pendingOwnerRequests)}</div>
            <div className="adh-stat-label">Demandes propriétaire en attente</div>
          </div>
        </Link>
      </div>

      <div className="adh-row">
        <div className="adh-card">
          <div className="adh-card-hd"><h3>Actions rapides</h3></div>
          <div className="adh-list">
            <Link href="/admin/demandes-proprio" className="adh-list-row">
              <div className="adh-list-icon"><i className="fa-solid fa-user-check" /></div>
              <div className="adh-list-info">
                <strong>Demandes propriétaire</strong>
                <span>Valider ou refuser les demandes en attente</span>
              </div>
              <i className="fa-solid fa-chevron-right adh-list-arrow" />
            </Link>
            <Link href="/admin/utilisateurs" className="adh-list-row">
              <div className="adh-list-icon"><i className="fa-solid fa-users" /></div>
              <div className="adh-list-info">
                <strong>Gérer les utilisateurs</strong>
                <span>Voir et administrer les comptes de la plateforme</span>
              </div>
              <i className="fa-solid fa-chevron-right adh-list-arrow" />
            </Link>
            <Link href="/admin/avis" className="adh-list-row">
              <div className="adh-list-icon"><i className="fa-solid fa-star" /></div>
              <div className="adh-list-info">
                <strong>Gérer les avis</strong>
                <span>Modérer les avis laissés par les locataires</span>
              </div>
              <i className="fa-solid fa-chevron-right adh-list-arrow" />
            </Link>
            <Link href="/admin/reservations" className="adh-list-row">
              <div className="adh-list-icon"><i className="fa-solid fa-calendar-check" /></div>
              <div className="adh-list-info">
                <strong>Voir les réservations</strong>
                <span>Suivre l&apos;ensemble des réservations de la plateforme</span>
              </div>
              <i className="fa-solid fa-chevron-right adh-list-arrow" />
            </Link>
          </div>
        </div>

        <div className="adh-dark-card">
          <div className="adh-dark-icon"><i className="fa-solid fa-user-check" /></div>
          <h4>Demandes en attente</h4>
          <div className="adh-dark-amount">{fmt(stats.pendingOwnerRequests)}</div>
          <p>Demande{stats.pendingOwnerRequests !== 1 ? "s" : ""} propriétaire à traiter</p>
          <Link href="/admin/demandes-proprio" className="adh-dark-btn">
            <i className="fa-solid fa-arrow-right" /> Voir les demandes
          </Link>
        </div>
      </div>
    </div>
  );
}

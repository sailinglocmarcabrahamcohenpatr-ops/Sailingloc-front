"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { boatsApi, reservationsApi, messagesApi, useAuth } from "@/shared/lib";
import type { BoatAPI, ReservationAPI } from "@/shared/lib";
import "./dashboard-home.css";

const COMMISSION_RATE = 0.15;

type BadgeKey = "confirmed" | "pending" | "cancelled" | "completed";

const STATUS_LABEL: Record<BadgeKey, { label: string; cls: string }> = {
  confirmed: { label: "Confirmée", cls: "green" },
  pending: { label: "En attente", cls: "orange" },
  cancelled: { label: "Annulée", cls: "red" },
  completed: { label: "Terminée", cls: "grey" },
};

function libelleToKey(libelle?: string): BadgeKey {
  if (!libelle) return "pending";
  const l = libelle.toLowerCase();
  if (l.includes("confirm")) return "confirmed";
  if (l.includes("attente")) return "pending";
  if (l.includes("annul")) return "cancelled";
  if (l.includes("termin")) return "completed";
  return "pending";
}

function renterName(r: ReservationAPI): string {
  const u = r.utilisateur;
  if (!u) return `Réservation #${r.id}`;
  return `${u.prenom} ${u.nom}`.trim();
}

function initials(r: ReservationAPI): string {
  const u = r.utilisateur;
  if (!u) return "?";
  return ((u.prenom?.[0] ?? "") + (u.nom?.[0] ?? "")).toUpperCase() || "?";
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export default function DashboardContent() {
  const { user } = useAuth();
  const [boats, setBoats] = useState<BoatAPI[]>([]);
  const [reservations, setReservations] = useState<ReservationAPI[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([boatsApi.getAll(), reservationsApi.getAll(), messagesApi.getAll()])
      .then(([b, r, msgs]) => {
        setBoats(b);
        setReservations(r);
        setUnreadMessages(msgs.filter((m) => !m.lu && m.destinataire.email === user?.email).length);
      })
      .catch(() => setError("Impossible de charger votre tableau de bord."))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const ownedBoatIds = useMemo(
    () =>
      new Set(
        boats
          .filter((b) => user?.email != null && (b.proprietaire?.email ?? b.utilisateur?.email) === user.email)
          .map((b) => b.id)
      ),
    [boats, user]
  );

  const publishedBoatsCount = useMemo(
    () => boats.filter((b) => ownedBoatIds.has(b.id) && b.statut === "disponible").length,
    [boats, ownedBoatIds]
  );

  const myReservations = useMemo(
    () => reservations.filter((r) => r.bateau?.id != null && ownedBoatIds.has(r.bateau.id)),
    [reservations, ownedBoatIds]
  );

  const pending = useMemo(
    () => myReservations.filter((r) => libelleToKey(r.statutReservation) === "pending"),
    [myReservations]
  );
  const confirmed = useMemo(
    () => myReservations.filter((r) => libelleToKey(r.statutReservation) === "confirmed"),
    [myReservations]
  );

  const revenueReservations = useMemo(
    () =>
      myReservations.filter((r) => {
        const key = libelleToKey(r.statutReservation);
        return key === "confirmed" || key === "completed";
      }),
    [myReservations]
  );

  const totalNet = useMemo(
    () => Math.round(revenueReservations.reduce((a, r) => a + Number(r.montantTotal), 0) * (1 - COMMISSION_RATE)),
    [revenueReservations]
  );

  const monthNet = useMemo(() => {
    const now = new Date();
    const sameMonth = revenueReservations.filter((r) => {
      const d = new Date(r.dateReservation ?? r.dateDebut);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    return Math.round(sameMonth.reduce((a, r) => a + Number(r.montantTotal), 0) * (1 - COMMISSION_RATE));
  }, [revenueReservations]);

  const upcoming = useMemo(
    () =>
      [...pending, ...confirmed]
        .slice()
        .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
        .slice(0, 4),
    [pending, confirmed]
  );

  if (loading)
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>Chargement…</div>
      </div>
    );
  if (error)
    return (
      <div className="dash-page">
        <p style={{ color: "var(--red)", padding: "24px" }}>{error}</p>
      </div>
    );

  return (
    <div className="dh-page">
      <div className="dh-header">
        <h1>Tableau de bord</h1>
        <p>Bienvenue sur votre espace propriétaire.</p>
      </div>

      <div className="dh-stats-grid">
        <Link href="/proprietaire/revenus" className="dh-stat-card dh-hero">
          <div className="dh-stat-top">
            <div className="dh-stat-icon"><i className="fa-solid fa-euro-sign" /></div>
            <div className="dh-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div>
            <div className="dh-stat-value">{monthNet.toLocaleString("fr-FR")} €</div>
            <div className="dh-stat-label">Revenus ce mois (net)</div>
          </div>
        </Link>

        <Link href="/proprietaire/bateaux" className="dh-stat-card">
          <div className="dh-stat-top">
            <div className="dh-stat-icon dh-icon-boats"><i className="fa-solid fa-sailboat" /></div>
          </div>
          <div>
            <div className="dh-stat-value">{publishedBoatsCount}</div>
            <div className="dh-stat-label">Bateau{publishedBoatsCount !== 1 ? "x" : ""} publié{publishedBoatsCount !== 1 ? "s" : ""}</div>
          </div>
        </Link>

        <Link href="/proprietaire/reservations" className="dh-stat-card">
          <div className="dh-stat-top">
            <div className="dh-stat-icon dh-icon-reservations"><i className="fa-solid fa-calendar-check" /></div>
          </div>
          <div>
            <div className="dh-stat-value">{pending.length + confirmed.length}</div>
            <div className="dh-stat-label">Réservation{pending.length + confirmed.length !== 1 ? "s" : ""} en cours</div>
          </div>
        </Link>

        <Link href="/proprietaire/messages" className="dh-stat-card">
          <div className="dh-stat-top">
            <div className="dh-stat-icon dh-icon-messages"><i className="fa-solid fa-envelope" /></div>
          </div>
          <div>
            <div className="dh-stat-value">{unreadMessages}</div>
            <div className="dh-stat-label">Message{unreadMessages !== 1 ? "s" : ""} non lu{unreadMessages !== 1 ? "s" : ""}</div>
          </div>
        </Link>
      </div>

      <div className="dh-row">
        <div className="dash-card">
          <div className="dash-card-hd"><h3>Prochaines réservations</h3></div>
          {upcoming.length === 0 ? (
            <p className="dh-empty">Aucune réservation en attente ou confirmée pour l&apos;instant.</p>
          ) : (
            <div className="dh-list">
              {upcoming.map((r) => {
                const key = libelleToKey(r.statutReservation);
                const st = STATUS_LABEL[key];
                const boatName = r.bateau?.nomBateau ?? `Bateau #${r.bateau?.id ?? r.id}`;
                return (
                  <div key={r.id} className="dh-list-row">
                    <div className="dh-avatar">{initials(r)}</div>
                    <div className="dh-list-info">
                      <strong>{renterName(r)}</strong>
                      <span>{boatName} · {fmtDate(r.dateDebut)} – {fmtDate(r.dateFin)}</span>
                    </div>
                    <span className={`badge-status ${st.cls}`}>{st.label}</span>
                    <div className="dh-list-amount">
                      <strong>{Number(r.montantTotal).toLocaleString("fr-FR")} €</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/proprietaire/reservations" className="dh-card-link">
            Voir toutes les réservations <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>

        <div className="dh-dark-card">
          <div className="dh-dark-icon"><i className="fa-solid fa-wallet" /></div>
          <h4>Revenu net cumulé</h4>
          <div className="dh-dark-amount">{totalNet.toLocaleString("fr-FR")} €</div>
          <p>Sur {revenueReservations.length} location{revenueReservations.length !== 1 ? "s" : ""} au total</p>
          <Link href="/proprietaire/revenus" className="dh-dark-btn">
            <i className="fa-solid fa-arrow-right" /> Voir les revenus
          </Link>
        </div>
      </div>
    </div>
  );
}

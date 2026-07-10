"use client";

import { useState, useEffect } from "react";
import { reservationsApi } from "@/shared/lib";
import type { ReservationAPI } from "@/shared/lib";

type BadgeKey = "confirmed" | "pending" | "cancelled" | "completed";

const STATUS: Record<BadgeKey, { label: string; cls: string }> = {
  confirmed: { label: "Confirmée", cls: "badge-status green" },
  pending: { label: "En attente", cls: "badge-status orange" },
  cancelled: { label: "Annulée", cls: "badge-status red" },
  completed: { label: "Terminée", cls: "badge-status grey" },
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

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

function daysBetween(start: string, end: string) {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function initials(r: ReservationAPI): string {
  const u = r.utilisateur;
  if (!u) return "?";
  return ((u.prenom?.[0] ?? "") + (u.nom?.[0] ?? "")).toUpperCase() || "?";
}

function renterName(r: ReservationAPI): string {
  const u = r.utilisateur;
  if (!u) return `Locataire #${r.idUtilisateur}`;
  return `${u.prenom} ${u.nom}`.trim();
}

const Section = ({
  title,
  items,
}: {
  title: string;
  items: ReservationAPI[];
}) =>
  items.length > 0 ? (
    <div>
      <h3 className="dash-section-title">
        {title} <span>({items.length})</span>
      </h3>
      <div className="reservations-list">
        {items.map((r) => {
          const key = libelleToKey(r.statutReservation?.libelle);
          const st = STATUS[key];
          const days = daysBetween(r.dateDebut, r.dateFin);
          const boatName = r.bateau?.nomBateau ?? `Bateau #${r.idBateau}`;

          return (
            <div key={r.id} className="reservation-row">
              <div className="reservation-renter">
                <div className="reservation-avatar">{initials(r)}</div>
                <div>
                  <strong>{renterName(r)}</strong>
                  <span>{boatName}</span>
                </div>
              </div>
              <div className="reservation-dates">
                <i className="fa-regular fa-calendar" />
                {fmt(r.dateDebut)} → {fmt(r.dateFin)} · {days} jour{days !== 1 ? "s" : ""}
              </div>
              <div className="reservation-amount">
                <strong>{r.montantTotal.toLocaleString("fr-FR")} €</strong>
                <span className={st.cls}>{st.label}</span>
              </div>
              <div className="reservation-actions">
                {key === "pending" && (
                  <>
                    <button className="btn btn-primary btn-sm">
                      <i className="fa-solid fa-check" /> Confirmer
                    </button>
                    <button className="btn btn-outline btn-sm">
                      <i className="fa-solid fa-xmark" /> Refuser
                    </button>
                  </>
                )}
                {key === "confirmed" && (
                  <button className="btn btn-ghost btn-sm">
                    <i className="fa-solid fa-ellipsis" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

export default function OwnerReservationsPage() {
  const [reservations, setReservations] = useState<ReservationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    reservationsApi
      .getAll()
      .then(setReservations)
      .catch(() => setError("Impossible de charger les réservations."))
      .finally(() => setLoading(false));
  }, []);

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

  const pending = reservations.filter(
    (r) => libelleToKey(r.statutReservation?.libelle) === "pending"
  );
  const active = reservations.filter(
    (r) => libelleToKey(r.statutReservation?.libelle) === "confirmed"
  );
  const past = reservations.filter((r) => {
    const k = libelleToKey(r.statutReservation?.libelle);
    return k === "completed" || k === "cancelled";
  });

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Réservations</h1>
          <p className="dash-sub">
            {reservations.length} réservation{reservations.length !== 1 ? "s" : ""} au total
          </p>
        </div>
      </div>
      <Section title="En attente de confirmation" items={pending} />
      <Section title="Réservations confirmées" items={active} />
      <Section title="Historique" items={past} />
    </div>
  );
}

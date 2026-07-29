"use client";

import { useState, useEffect } from "react";
import { reservationsApi, referentielsApi } from "@/shared/lib";
import type { ReservationAPI, StatutReservationAPI } from "@/shared/lib";

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
  if (!u) return `Réservation #${r.id}`;
  return `${u.prenom} ${u.nom}`.trim();
}

const Section = ({
  title,
  items,
  actioningId,
  actionError,
  onConfirm,
  onRefuse,
}: {
  title: string;
  items: ReservationAPI[];
  actioningId: number | null;
  actionError: Record<number, string>;
  onConfirm: (r: ReservationAPI) => void;
  onRefuse: (r: ReservationAPI) => void;
}) =>
  items.length > 0 ? (
    <div>
      <h3 className="dash-section-title">
        {title} <span>({items.length})</span>
      </h3>
      <div className="reservations-list">
        {items.map((r) => {
          const key = libelleToKey(r.statutReservation);
          const st = STATUS[key];
          const days = daysBetween(r.dateDebut, r.dateFin);
          const boatName = r.bateau?.nomBateau ?? `Bateau #${r.bateau?.id ?? r.id}`;
          const busy = actioningId === r.id;

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
                <strong>{Number(r.montantTotal).toLocaleString("fr-FR")} €</strong>
                <span className={st.cls}>{st.label}</span>
              </div>
              <div className="reservation-actions">
                {key === "pending" && (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onConfirm(r)}
                      disabled={busy}
                    >
                      {busy ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-check" />} Confirmer
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onRefuse(r)}
                      disabled={busy}
                    >
                      {busy ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-xmark" />} Refuser
                    </button>
                  </>
                )}
                {key === "confirmed" && (
                  <button className="btn btn-ghost btn-sm">
                    <i className="fa-solid fa-ellipsis" />
                  </button>
                )}
              </div>
              {actionError[r.id] && (
                <p style={{ color: "var(--red)", fontSize: ".8125rem", gridColumn: "1 / -1", margin: "4px 0 0" }}>
                  {actionError[r.id]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

export default function OwnerReservationsPage() {
  const [reservations, setReservations] = useState<ReservationAPI[]>([]);
  const [statuts, setStatuts] = useState<StatutReservationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<Record<number, string>>({});

  useEffect(() => {
    Promise.all([reservationsApi.getAll(), referentielsApi.getStatutsReservations()])
      .then(([resa, sts]) => {
        setReservations(resa);
        setStatuts(sts);
      })
      .catch(() => setError("Impossible de charger les réservations."))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async (r: ReservationAPI) => {
    const confirme = statuts.find((s) => s.value.toLowerCase().includes("confirm"));
    if (!confirme) {
      setActionError((prev) => ({ ...prev, [r.id]: "Statut « confirmée » introuvable." }));
      return;
    }
    setActioningId(r.id);
    setActionError((prev) => ({ ...prev, [r.id]: "" }));
    try {
      const updated = await reservationsApi.update(r.id, { id_statut_reservation: confirme.value });
      setReservations((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...updated } : x)));
    } catch {
      setActionError((prev) => ({ ...prev, [r.id]: "Impossible de confirmer cette réservation." }));
    } finally {
      setActioningId(null);
    }
  };

  const handleRefuse = async (r: ReservationAPI) => {
    setActioningId(r.id);
    setActionError((prev) => ({ ...prev, [r.id]: "" }));
    try {
      await reservationsApi.cancel(r.id);
      setReservations((prev) => prev.filter((x) => x.id !== r.id));
    } catch {
      setActionError((prev) => ({ ...prev, [r.id]: "Impossible de refuser cette réservation." }));
    } finally {
      setActioningId(null);
    }
  };

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
    (r) => libelleToKey(r.statutReservation) === "pending"
  );
  const active = reservations.filter(
    (r) => libelleToKey(r.statutReservation) === "confirmed"
  );
  const past = reservations.filter((r) => {
    const k = libelleToKey(r.statutReservation);
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
      <Section
        title="En attente de confirmation"
        items={pending}
        actioningId={actioningId}
        actionError={actionError}
        onConfirm={handleConfirm}
        onRefuse={handleRefuse}
      />
      <Section
        title="Réservations confirmées"
        items={active}
        actioningId={actioningId}
        actionError={actionError}
        onConfirm={handleConfirm}
        onRefuse={handleRefuse}
      />
      <Section
        title="Historique"
        items={past}
        actioningId={actioningId}
        actionError={actionError}
        onConfirm={handleConfirm}
        onRefuse={handleRefuse}
      />
    </div>
  );
}

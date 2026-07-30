"use client";

import { useState, useEffect } from "react";
import { reservationsApi, referentielsApi } from "@/shared/lib";
import type { ReservationAPI, StatutReservationAPI } from "@/shared/lib";
import "./reservations.css";

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
  icon,
  items,
  actioningId,
  actionError,
  onConfirm,
  onRefuse,
}: {
  title: string;
  icon: string;
  items: ReservationAPI[];
  actioningId: number | null;
  actionError: Record<number, string>;
  onConfirm: (r: ReservationAPI) => void;
  onRefuse: (r: ReservationAPI) => void;
}) =>
  items.length > 0 ? (
    <div className="rsv-section">
      <div className="rsv-section-hd">
        <i className={`fa-solid ${icon}`} />
        <h3>{title}</h3>
        <span className="rsv-section-count">{items.length}</span>
      </div>
      <div className="rsv-list">
        {items.map((r) => {
          const key = libelleToKey(r.statutReservation);
          const st = STATUS[key];
          const days = daysBetween(r.dateDebut, r.dateFin);
          const boatName = r.bateau?.nomBateau ?? `Bateau #${r.bateau?.id ?? r.id}`;
          const busy = actioningId === r.id;

          return (
            <div key={r.id} className={`rsv-row ${key}`}>
              <div className="rsv-renter">
                <div className="rsv-avatar">{initials(r)}</div>
                <div>
                  <strong>{renterName(r)}</strong>
                  <span>{boatName}</span>
                </div>
              </div>
              <div className="rsv-dates">
                <i className="fa-regular fa-calendar" />
                {fmt(r.dateDebut)} → {fmt(r.dateFin)} · {days} jour{days !== 1 ? "s" : ""}
              </div>
              <div className="rsv-amount">
                <strong>{Number(r.montantTotal).toLocaleString("fr-FR")} €</strong>
                <span className={st.cls}>{st.label}</span>
              </div>
              <div className="rsv-actions">
                {key === "pending" && (
                  <>
                    <button
                      className="rsv-btn rsv-btn-confirm"
                      onClick={() => onConfirm(r)}
                      disabled={busy}
                    >
                      {busy ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-check" />} Confirmer
                    </button>
                    <button
                      className="rsv-btn rsv-btn-refuse"
                      onClick={() => onRefuse(r)}
                      disabled={busy}
                    >
                      {busy ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-xmark" />} Refuser
                    </button>
                  </>
                )}
                {key === "confirmed" && (
                  <button className="rsv-btn-ghost">
                    <i className="fa-solid fa-ellipsis" />
                  </button>
                )}
              </div>
              {actionError[r.id] && <p className="rsv-error">{actionError[r.id]}</p>}
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
    <div className="rsv-page">
      <div className="rsv-header">
        <h1>Réservations</h1>
        <p>{reservations.length} réservation{reservations.length !== 1 ? "s" : ""} au total</p>
      </div>

      <div className="rsv-stats-grid">
        <div className="rsv-stat-card pending">
          <div className="rsv-stat-icon"><i className="fa-solid fa-hourglass-half" /></div>
          <div>
            <div className="rsv-stat-value">{pending.length}</div>
            <div className="rsv-stat-label">En attente</div>
          </div>
        </div>
        <div className="rsv-stat-card confirmed">
          <div className="rsv-stat-icon"><i className="fa-solid fa-calendar-check" /></div>
          <div>
            <div className="rsv-stat-value">{active.length}</div>
            <div className="rsv-stat-label">Confirmées</div>
          </div>
        </div>
        <div className="rsv-stat-card history">
          <div className="rsv-stat-icon"><i className="fa-solid fa-clock-rotate-left" /></div>
          <div>
            <div className="rsv-stat-value">{past.length}</div>
            <div className="rsv-stat-label">Historique</div>
          </div>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="rsv-empty">
          <i className="fa-solid fa-calendar-xmark" />
          Aucune réservation pour l'instant.
        </div>
      ) : (
        <>
          <Section
            title="En attente de confirmation"
            icon="fa-hourglass-half"
            items={pending}
            actioningId={actioningId}
            actionError={actionError}
            onConfirm={handleConfirm}
            onRefuse={handleRefuse}
          />
          <Section
            title="Réservations confirmées"
            icon="fa-calendar-check"
            items={active}
            actioningId={actioningId}
            actionError={actionError}
            onConfirm={handleConfirm}
            onRefuse={handleRefuse}
          />
          <Section
            title="Historique"
            icon="fa-clock-rotate-left"
            items={past}
            actioningId={actioningId}
            actionError={actionError}
            onConfirm={handleConfirm}
            onRefuse={handleRefuse}
          />
        </>
      )}
    </div>
  );
}

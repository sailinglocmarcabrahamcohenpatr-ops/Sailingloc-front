"use client";

import { useState, useEffect, type ReactNode } from "react";
import { reservationsApi, referentielsApi, resolvePhotoUrl } from "@/shared/lib";
import type { ReservationAPI, StatutReservationAPI, PaiementAPI } from "@/shared/lib";
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

const fmtLong = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const PAIEMENT_STATUS: Record<string, { label: string; cls: string; icon: string }> = {
  paye: { label: "Payé", cls: "badge-status green", icon: "fa-circle-check" },
  en_attente: { label: "En attente", cls: "badge-status orange", icon: "fa-hourglass-half" },
  echoue: { label: "Échoué", cls: "badge-status red", icon: "fa-circle-xmark" },
  rembourse: { label: "Remboursé", cls: "badge-status grey", icon: "fa-rotate-left" },
};

/** Normalise "Payé" / "PAYE" / "payé" → "paye" pour matcher les clés ci-dessus quelle que soit la casse/accentuation renvoyée par l'API */
const normalizeKey = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

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
  onDetails,
}: {
  title: string;
  icon: string;
  items: ReservationAPI[];
  actioningId: number | null;
  actionError: Record<number, string>;
  onConfirm: (r: ReservationAPI) => void;
  onRefuse: (r: ReservationAPI) => void;
  onDetails: (r: ReservationAPI) => void;
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
                  <button
                    className="rsv-btn-ghost"
                    onClick={() => onDetails(r)}
                    aria-label="Voir les détails de la réservation"
                  >
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
  const [detailsReservation, setDetailsReservation] = useState<ReservationAPI | null>(null);

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
            onDetails={setDetailsReservation}
          />
          <Section
            title="Réservations confirmées"
            icon="fa-calendar-check"
            items={active}
            actioningId={actioningId}
            actionError={actionError}
            onConfirm={handleConfirm}
            onRefuse={handleRefuse}
            onDetails={setDetailsReservation}
          />
          <Section
            title="Historique"
            icon="fa-clock-rotate-left"
            items={past}
            actioningId={actioningId}
            actionError={actionError}
            onConfirm={handleConfirm}
            onRefuse={handleRefuse}
            onDetails={setDetailsReservation}
          />
        </>
      )}

      {detailsReservation && (
        <ReservationDetailsModal
          reservation={detailsReservation}
          onClose={() => setDetailsReservation(null)}
        />
      )}
    </div>
  );
}

const ModalSection = ({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) => (
  <div className="rsv-modal-section">
    <h4><i className={`fa-solid ${icon}`} />{title}</h4>
    {children}
  </div>
);

function ReservationDetailsModal({
  reservation: r,
  onClose,
}: {
  reservation: ReservationAPI;
  onClose: () => void;
}) {
  const [paiements, setPaiements] = useState<PaiementAPI[]>([]);
  const [paiementsLoading, setPaiementsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setPaiementsLoading(true);
    reservationsApi
      .getPaiements(r.id)
      .then((p) => !cancelled && setPaiements(p))
      .catch(() => !cancelled && setPaiements([]))
      .finally(() => !cancelled && setPaiementsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [r.id]);

  const key = libelleToKey(r.statutReservation);
  const st = STATUS[key];
  const days = daysBetween(r.dateDebut, r.dateFin);
  const boat = r.bateau;
  const boatName = boat?.nomBateau ?? `Bateau #${boat?.id ?? r.id}`;
  const u = r.utilisateur;
  const montantTotal = Number(r.montantTotal);
  const prixJour = boat?.prixJour !== undefined ? Number(boat.prixJour) : null;
  const mainPhoto = boat?.photos
    ?.slice()
    .sort((a, b) => (a.ordreAffichage ?? 0) - (b.ordreAffichage ?? 0))[0];

  return (
    <div className="rsv-modal-overlay" onClick={onClose}>
      <div className="rsv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rsv-modal-hd">
          <div className="rsv-modal-hd-icon">
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div className="rsv-modal-hd-text">
            <h3>Réservation #{r.id}</h3>
            {r.dateReservation && (
              <span className="rsv-modal-muted">Réservée le {fmtLong(r.dateReservation)}</span>
            )}
          </div>
          <button className="rsv-modal-close" onClick={onClose} aria-label="Fermer">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="rsv-modal-status">
          <span className={st.cls}>{st.label}</span>
        </div>

        <div className="rsv-modal-body">
          <ModalSection icon="fa-user" title="Locataire">
            <div className="rsv-modal-row">
              <div className="rsv-avatar">{initials(r)}</div>
              <div>
                <strong>{renterName(r)}</strong>
                {u?.email && <span>{u.email}</span>}
              </div>
            </div>
          </ModalSection>

          <ModalSection icon="fa-sailboat" title="Bateau">
            <div className="rsv-modal-row">
              {mainPhoto && (
                <img
                  className="rsv-modal-photo"
                  src={resolvePhotoUrl(mainPhoto.url)}
                  alt={boatName}
                />
              )}
              <div>
                <strong>{boatName}</strong>
                {boat?.typeBateau?.labelTypeBateau && (
                  <span><i className="fa-solid fa-ship" /> {boat.typeBateau.labelTypeBateau}</span>
                )}
                {boat?.port && (
                  <span><i className="fa-solid fa-location-dot" /> {boat.port.nom}, {boat.port.ville}</span>
                )}
                {prixJour !== null && (
                  <span><i className="fa-solid fa-tag" /> {prixJour.toLocaleString("fr-FR")} €/jour</span>
                )}
              </div>
            </div>
          </ModalSection>

          <ModalSection icon="fa-calendar-days" title="Dates">
            <p>
              {fmt(r.dateDebut)} → {fmt(r.dateFin)} · {days} jour{days !== 1 ? "s" : ""}
            </p>
          </ModalSection>

          <ModalSection icon="fa-sack-dollar" title="Montant">
            <div className="rsv-modal-total">
              <span className="rsv-modal-amount">{montantTotal.toLocaleString("fr-FR")} €</span>
              {prixJour !== null && (
                <span className="rsv-modal-muted">
                  {prixJour.toLocaleString("fr-FR")} € × {days} jour{days !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </ModalSection>

          <ModalSection icon="fa-credit-card" title="Paiement">
            {paiementsLoading ? (
              <p className="rsv-modal-muted">Chargement…</p>
            ) : paiements.length === 0 ? (
              <p className="rsv-modal-muted">Aucun paiement enregistré.</p>
            ) : (
              <div className="rsv-modal-payments">
                {paiements.map((p) => {
                  const pst = PAIEMENT_STATUS[normalizeKey(p.statutPaiement)] ?? {
                    label: p.statutPaiement,
                    cls: "badge-status grey",
                    icon: "fa-circle",
                  };
                  return (
                    <div key={p.id} className="rsv-modal-payment-row">
                      <span className="rsv-modal-payment-date">{fmtLong(p.datePaiement)}</span>
                      <strong>{Number(p.montant).toLocaleString("fr-FR")} €</strong>
                      <span className={pst.cls}><i className={`fa-solid ${pst.icon}`} /> {pst.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </ModalSection>

          {r.idContrat && (
            <ModalSection icon="fa-file-contract" title="Contrat">
              <p className="rsv-modal-muted">Contrat #{r.idContrat}</p>
            </ModalSection>
          )}
        </div>
      </div>
    </div>
  );
}

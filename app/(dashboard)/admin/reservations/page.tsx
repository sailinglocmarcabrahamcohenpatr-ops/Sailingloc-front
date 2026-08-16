"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { reservationsApi, resolvePhotoUrl } from "@/shared/lib";
import type { ReservationAPI, PaiementAPI } from "@/shared/lib";
import "../../proprietaire/dashboard.css";
import "../utilisateurs/utilisateurs.css";
import "./reservations.css";

type BadgeKey = "confirmed" | "pending" | "cancelled" | "completed";

const STATUS: Record<BadgeKey, { label: string; cls: string; icon: string }> = {
  confirmed: { label: "Confirmée", cls: "badge-status green", icon: "fa-check" },
  pending: { label: "En attente", cls: "badge-status orange", icon: "fa-clock" },
  cancelled: { label: "Annulée", cls: "badge-status red", icon: "fa-xmark" },
  completed: { label: "Terminée", cls: "badge-status grey", icon: "fa-flag-checkered" },
};

const FILTERS: { value: "all" | BadgeKey; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmées" },
  { value: "completed", label: "Terminées" },
  { value: "cancelled", label: "Annulées" },
];

const PAIEMENT_STATUS: Record<string, { label: string; cls: string; icon: string }> = {
  paye: { label: "Payé", cls: "badge-status green", icon: "fa-circle-check" },
  en_attente: { label: "En attente", cls: "badge-status orange", icon: "fa-hourglass-half" },
  echoue: { label: "Échoué", cls: "badge-status red", icon: "fa-circle-xmark" },
  rembourse: { label: "Remboursé", cls: "badge-status grey", icon: "fa-rotate-left" },
};

/** Normalise "Payé" / "PAYE" / "payé" → "paye" pour matcher les clés ci-dessus quelle que soit la casse/accentuation renvoyée par l'API */
const normalizeKey = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function libelleToKey(libelle?: string): BadgeKey {
  if (!libelle) return "pending";
  const l = libelle.toLowerCase();
  if (l.includes("confirm")) return "confirmed";
  if (l.includes("attente")) return "pending";
  if (l.includes("annul")) return "cancelled";
  if (l.includes("termin")) return "completed";
  return "pending";
}

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const fmtLong = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function daysBetween(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
}

function renterName(r: ReservationAPI): string {
  const u = r.utilisateur;
  if (!u) return `Réservation #${r.id}`;
  return `${u.prenom} ${u.nom}`.trim();
}

function ownerName(r: ReservationAPI): string | null {
  const p = r.bateau?.proprietaire;
  if (!p) return null;
  return `${p.prenom} ${p.nom}`.trim();
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | BadgeKey>("all");
  const [detailsReservation, setDetailsReservation] = useState<ReservationAPI | null>(null);

  useEffect(() => {
    reservationsApi
      .getAll()
      .then(setReservations)
      .catch(() => setError("Impossible de charger les réservations."))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: reservations.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (const r of reservations) c[libelleToKey(r.statutReservation)]++;
    return c;
  }, [reservations]);

  const totalRevenue = useMemo(
    () =>
      reservations
        .filter((r) => libelleToKey(r.statutReservation) !== "cancelled")
        .reduce((sum, r) => sum + Number(r.montantTotal || 0), 0),
    [reservations]
  );

  const filtered = useMemo(
    () => (filter === "all" ? reservations : reservations.filter((r) => libelleToKey(r.statutReservation) === filter)),
    [reservations, filter]
  );

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Toutes les réservations</h1>
          <p className="dash-sub">Consultez l&apos;ensemble des réservations de la plateforme.</p>
        </div>
      </div>

      {error && (
        <div className="users-error">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
          <button onClick={() => setError("")}><i className="fa-solid fa-xmark" /></button>
        </div>
      )}

      {!loading && reservations.length > 0 && (
        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: "#EEF3FE", color: "#1866F2" }}>
              <i className="fa-solid fa-calendar-check" />
            </div>
            <div>
              <div className="dash-stat-value">{counts.all}</div>
              <div className="dash-stat-label">Réservations</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
              <i className="fa-solid fa-hourglass-half" />
            </div>
            <div>
              <div className="dash-stat-value">{counts.pending}</div>
              <div className="dash-stat-label">En attente</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: "#D1FAE5", color: "#065F46" }}>
              <i className="fa-solid fa-check" />
            </div>
            <div>
              <div className="dash-stat-value">{counts.confirmed}</div>
              <div className="dash-stat-label">Confirmées</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: "#EEF3FE", color: "#1866F2" }}>
              <i className="fa-solid fa-sack-dollar" />
            </div>
            <div>
              <div className="dash-stat-value">{totalRevenue.toLocaleString("fr-FR")} €</div>
              <div className="dash-stat-label">Volume total</div>
            </div>
          </div>
        </div>
      )}

      <div className="users-toolbar">
        <div className="users-filters">
          <select
            className="users-filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | BadgeKey)}
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label} ({counts[f.value] ?? 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="dash-empty-state">
          <i className="fa-solid fa-circle-notch fa-spin fa-2x" style={{ opacity: 0.3 }} />
          <p>Chargement des réservations…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-empty-state">
          <i className="fa-solid fa-calendar-check fa-2x" style={{ opacity: 0.3 }} />
          <p>Aucune réservation {filter !== "all" ? STATUS[filter as BadgeKey]?.label.toLowerCase() : ""} pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="docs-list">
          {filtered.map((r) => {
            const key = libelleToKey(r.statutReservation);
            const st = STATUS[key];
            const boatName = r.bateau?.nomBateau ?? `Bateau #${r.bateau?.id ?? r.id}`;
            const owner = ownerName(r);

            return (
              <div
                key={r.id}
                className="doc-item"
                style={{ cursor: "pointer" }}
                onClick={() => setDetailsReservation(r)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setDetailsReservation(r); }}
              >
                <div className="doc-icon">
                  <i className={`fa-solid ${st.icon}`} aria-hidden="true" />
                </div>
                <div className="doc-info">
                  <strong>{renterName(r)} → {boatName}</strong>
                  <span>
                    {owner ? `Propriétaire : ${owner} · ` : ""}
                    {fmt(r.dateDebut)} → {fmt(r.dateFin)} · {Number(r.montantTotal).toLocaleString("fr-FR")} €
                  </span>
                </div>
                <div className="doc-actions">
                  <span className={st.cls}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailsReservation && (
        <ReservationDetailsModal reservation={detailsReservation} onClose={() => setDetailsReservation(null)} />
      )}
    </div>
  );
}

const ModalSection = ({ icon, title, children }: { icon: string; title: string; children: ReactNode }) => (
  <div className="res-modal-section">
    <h4><i className={`fa-solid ${icon}`} />{title}</h4>
    {children}
  </div>
);

function ReservationDetailsModal({ reservation: r, onClose }: { reservation: ReservationAPI; onClose: () => void }) {
  const [paiements, setPaiements] = useState<PaiementAPI[]>([]);
  const [paiementsLoading, setPaiementsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
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
  const owner = boat?.proprietaire;
  const montantTotal = Number(r.montantTotal);
  const prixJour = boat?.prixJour !== undefined ? Number(boat.prixJour) : null;
  const mainPhoto = boat?.photos?.slice().sort((a, b) => (a.ordreAffichage ?? 0) - (b.ordreAffichage ?? 0))[0];

  return (
    <div className="res-modal-overlay" onClick={onClose}>
      <div className="res-modal" role="dialog" aria-modal="true" aria-labelledby="res-modal-title" onClick={(e) => e.stopPropagation()}>
        <div className="res-modal-hd">
          <div className="res-modal-hd-icon">
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div className="res-modal-hd-text">
            <h3 id="res-modal-title">Réservation #{r.id}</h3>
            {r.dateReservation && <span className="res-modal-muted">Réservée le {fmtLong(r.dateReservation)}</span>}
          </div>
          <button className="res-modal-close" onClick={onClose} aria-label="Fermer">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="res-modal-status">
          <span className={st.cls}>{st.label}</span>
        </div>

        <div className="res-modal-body">
          <ModalSection icon="fa-user" title="Locataire">
            <div className="res-modal-row">
              <div className="users-avatar">{((u?.prenom?.[0] ?? "") + (u?.nom?.[0] ?? "")).toUpperCase() || "?"}</div>
              <div>
                <strong>{renterName(r)}</strong>
                {u?.email && <span>{u.email}</span>}
              </div>
            </div>
          </ModalSection>

          {owner && (
            <ModalSection icon="fa-key" title="Propriétaire">
              <div className="res-modal-row">
                <div className="users-avatar">{((owner.prenom?.[0] ?? "") + (owner.nom?.[0] ?? "")).toUpperCase() || "?"}</div>
                <div>
                  <strong>{owner.prenom} {owner.nom}</strong>
                  {owner.email && <span>{owner.email}</span>}
                  {owner.telephone && <span><i className="fa-solid fa-phone" /> {owner.telephone}</span>}
                </div>
              </div>
            </ModalSection>
          )}

          <ModalSection icon="fa-sailboat" title="Bateau">
            <div className="res-modal-row">
              {mainPhoto && <img className="res-modal-photo" src={resolvePhotoUrl(mainPhoto.url)} alt={boatName} />}
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
            <p>{fmt(r.dateDebut)} → {fmt(r.dateFin)} · {days} jour{days !== 1 ? "s" : ""}</p>
          </ModalSection>

          <ModalSection icon="fa-sack-dollar" title="Montant">
            <div className="res-modal-total">
              <span className="res-modal-amount">{montantTotal.toLocaleString("fr-FR")} €</span>
              {prixJour !== null && (
                <span className="res-modal-muted">
                  {prixJour.toLocaleString("fr-FR")} € × {days} jour{days !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </ModalSection>

          <ModalSection icon="fa-credit-card" title="Paiement">
            {paiementsLoading ? (
              <p className="res-modal-muted">Chargement…</p>
            ) : paiements.length === 0 ? (
              <p className="res-modal-muted">Aucun paiement enregistré.</p>
            ) : (
              <div className="res-modal-payments">
                {paiements.map((p) => {
                  const pst = PAIEMENT_STATUS[normalizeKey(p.statutPaiement)] ?? {
                    label: p.statutPaiement,
                    cls: "badge-status grey",
                    icon: "fa-circle",
                  };
                  return (
                    <div key={p.id} className="res-modal-payment-row">
                      <span className="res-modal-payment-date">{fmtLong(p.datePaiement)}</span>
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
              <p className="res-modal-muted">Contrat #{r.idContrat}</p>
            </ModalSection>
          )}
        </div>
      </div>
    </div>
  );
}

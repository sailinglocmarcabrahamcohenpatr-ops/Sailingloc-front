"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  reservationsApi,
  referentielsApi,
  resolvePhotoUrl,
  boatsApi,
  generateReservationInvoicePdf,
  generateReservationContractPdf,
} from "@/shared/lib";
import type { ReservationAPI, StatutReservationAPI, PaiementAPI, BoatAPI } from "@/shared/lib";
import { useI18n } from "@/shared/i18n";
import "./reservations.css";

type BadgeKey = "confirmed" | "pending" | "cancelled" | "completed";

function libelleToKey(libelle?: string): BadgeKey {
  if (!libelle) return "pending";
  const l = libelle.toLowerCase();
  if (l.includes("confirm")) return "confirmed";
  if (l.includes("attente")) return "pending";
  if (l.includes("annul")) return "cancelled";
  if (l.includes("termin")) return "completed";
  return "pending";
}

const fmt = (d: string, locale: string) =>
  new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short" });

const fmtLong = (d: string, locale: string) =>
  new Date(d).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });

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
}) => {
  const t = useI18n().dict.ownerReservationsPage;
  const STATUS: Record<BadgeKey, { label: string; cls: string }> = {
    confirmed: { label: t.statusConfirmed, cls: "badge-status green" },
    pending:   { label: t.statusPending,   cls: "badge-status orange" },
    cancelled: { label: t.statusCancelled, cls: "badge-status red" },
    completed: { label: t.statusCompleted, cls: "badge-status grey" },
  };
  const renterName = (r: ReservationAPI): string => {
    const u = r.utilisateur;
    if (!u) return t.reservationFallback.replace("{id}", String(r.id));
    return `${u.prenom} ${u.nom}`.trim();
  };

  return items.length > 0 ? (
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
          const boatName = r.bateau?.nomBateau ?? t.boatFallback.replace("{id}", String(r.bateau?.id ?? r.id));
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
                {fmt(r.dateDebut, t.intlLocale)} → {fmt(r.dateFin, t.intlLocale)} · {days} {days !== 1 ? t.dayPlural : t.daySingular}
              </div>
              <div className="rsv-amount">
                <strong>{Number(r.montantTotal).toLocaleString(t.intlLocale)} €</strong>
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
                      {busy ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-check" />} {t.confirm}
                    </button>
                    <button
                      className="rsv-btn rsv-btn-refuse"
                      onClick={() => onRefuse(r)}
                      disabled={busy}
                    >
                      {busy ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-xmark" />} {t.refuse}
                    </button>
                  </>
                )}
                {(key === "confirmed" || key === "completed") && (
                  <button
                    className="rsv-btn-ghost"
                    onClick={() => onDetails(r)}
                    aria-label={t.detailsAria}
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
};

export default function OwnerReservationsPage() {
  const t = useI18n().dict.ownerReservationsPage;
  const [reservations, setReservations] = useState<ReservationAPI[]>([]);
  const [statuts, setStatuts] = useState<StatutReservationAPI[]>([]);
  const [boatsById, setBoatsById] = useState<Map<number, BoatAPI>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<Record<number, string>>({});
  const [detailsReservation, setDetailsReservation] = useState<ReservationAPI | null>(null);

  useEffect(() => {
    Promise.all([
      reservationsApi.getAll(),
      referentielsApi.getStatutsReservations(),
      boatsApi.getAll().catch(() => [] as BoatAPI[]),
    ])
      .then(([resa, sts, boats]) => {
        setReservations(resa);
        setStatuts(sts);
        setBoatsById(new Map(boats.map((b) => [b.id, b])));
      })
      .catch(() => setError(t.errLoad))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = async (r: ReservationAPI) => {
    const confirme = statuts.find((s) => s.value.toLowerCase().includes("confirm"));
    if (!confirme) {
      setActionError((prev) => ({ ...prev, [r.id]: t.statusNotFound }));
      return;
    }
    setActioningId(r.id);
    setActionError((prev) => ({ ...prev, [r.id]: "" }));
    try {
      const updated = await reservationsApi.update(r.id, { id_statut_reservation: confirme.value });
      setReservations((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...updated } : x)));
    } catch {
      setActionError((prev) => ({ ...prev, [r.id]: t.errConfirm }));
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
      setActionError((prev) => ({ ...prev, [r.id]: t.errRefuse }));
    } finally {
      setActioningId(null);
    }
  };

  if (loading)
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>{t.loading}</div>
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
        <h1>{t.title}</h1>
        <p>{(reservations.length === 1 ? t.countSingular : t.countPlural).replace("{n}", String(reservations.length))}</p>
      </div>

      <div className="rsv-stats-grid">
        <div className="rsv-stat-card pending">
          <div className="rsv-stat-icon"><i className="fa-solid fa-hourglass-half" /></div>
          <div>
            <div className="rsv-stat-value">{pending.length}</div>
            <div className="rsv-stat-label">{t.statPending}</div>
          </div>
        </div>
        <div className="rsv-stat-card confirmed">
          <div className="rsv-stat-icon"><i className="fa-solid fa-calendar-check" /></div>
          <div>
            <div className="rsv-stat-value">{active.length}</div>
            <div className="rsv-stat-label">{t.statConfirmed}</div>
          </div>
        </div>
        <div className="rsv-stat-card history">
          <div className="rsv-stat-icon"><i className="fa-solid fa-clock-rotate-left" /></div>
          <div>
            <div className="rsv-stat-value">{past.length}</div>
            <div className="rsv-stat-label">{t.statHistory}</div>
          </div>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="rsv-empty">
          <i className="fa-solid fa-calendar-xmark" />
          {t.empty}
        </div>
      ) : (
        <>
          <Section
            title={t.sectionPending}
            icon="fa-hourglass-half"
            items={pending}
            actioningId={actioningId}
            actionError={actionError}
            onConfirm={handleConfirm}
            onRefuse={handleRefuse}
            onDetails={setDetailsReservation}
          />
          <Section
            title={t.sectionConfirmed}
            icon="fa-calendar-check"
            items={active}
            actioningId={actioningId}
            actionError={actionError}
            onConfirm={handleConfirm}
            onRefuse={handleRefuse}
            onDetails={setDetailsReservation}
          />
          <Section
            title={t.sectionHistory}
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
          boat={detailsReservation.bateau?.id != null ? boatsById.get(detailsReservation.bateau.id) : undefined}
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
  boat: fullBoat,
  onClose,
}: {
  reservation: ReservationAPI;
  boat?: BoatAPI;
  onClose: () => void;
}) {
  const t = useI18n().dict.ownerReservationsPage;
  const STATUS: Record<BadgeKey, { label: string; cls: string }> = {
    confirmed: { label: t.statusConfirmed, cls: "badge-status green" },
    pending:   { label: t.statusPending,   cls: "badge-status orange" },
    cancelled: { label: t.statusCancelled, cls: "badge-status red" },
    completed: { label: t.statusCompleted, cls: "badge-status grey" },
  };
  const PAIEMENT_STATUS: Record<string, { label: string; cls: string; icon: string }> = {
    paye:       { label: t.paymentPaid,     cls: "badge-status green",  icon: "fa-circle-check" },
    en_attente: { label: t.paymentPending,  cls: "badge-status orange", icon: "fa-hourglass-half" },
    echoue:     { label: t.paymentFailed,   cls: "badge-status red",    icon: "fa-circle-xmark" },
    rembourse:  { label: t.paymentRefunded, cls: "badge-status grey",   icon: "fa-rotate-left" },
  };
  const renterName = (res: ReservationAPI): string => {
    const u = res.utilisateur;
    if (!u) return t.reservationFallback.replace("{id}", String(res.id));
    return `${u.prenom} ${u.nom}`.trim();
  };
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
  const boatName = boat?.nomBateau ?? t.boatFallback.replace("{id}", String(boat?.id ?? r.id));
  const u = r.utilisateur;
  const montantTotal = Number(r.montantTotal);
  const prixJour = boat?.prixJour !== undefined ? Number(boat.prixJour) : null;
  const mainPhoto = boat?.photos
    ?.slice()
    .sort((a, b) => (a.ordreAffichage ?? 0) - (b.ordreAffichage ?? 0))[0];

  const tenantInfo = { name: u ? `${u.prenom} ${u.nom}` : undefined, email: u?.email };

  const handleDownloadInvoice = () => {
    void generateReservationInvoicePdf(r, tenantInfo, paiements, fullBoat);
  };

  const handleDownloadContract = () => {
    void generateReservationContractPdf(r, tenantInfo, fullBoat);
  };

  return (
    <div className="rsv-modal-overlay" onClick={onClose}>
      <div className="rsv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rsv-modal-hd">
          <div className="rsv-modal-hd-icon">
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div className="rsv-modal-hd-text">
            <h3>{t.modalTitle.replace("{id}", String(r.id))}</h3>
            {r.dateReservation && (
              <span className="rsv-modal-muted">{t.modalBookedOn.replace("{date}", fmtLong(r.dateReservation, t.intlLocale))}</span>
            )}
          </div>
          <button className="rsv-modal-close" onClick={onClose} aria-label={t.closeAria}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="rsv-modal-status">
          <span className={st.cls}>{st.label}</span>
        </div>

        <div className="rsv-modal-body">
          <ModalSection icon="fa-user" title={t.tenantTitle}>
            <div className="rsv-modal-row">
              <div className="rsv-avatar">{initials(r)}</div>
              <div>
                <strong>{renterName(r)}</strong>
                {u?.email && <span>{u.email}</span>}
              </div>
            </div>
          </ModalSection>

          <ModalSection icon="fa-sailboat" title={t.boatTitle}>
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
                  <span><i className="fa-solid fa-tag" /> {prixJour.toLocaleString(t.intlLocale)} {t.perDay}</span>
                )}
              </div>
            </div>
          </ModalSection>

          <ModalSection icon="fa-calendar-days" title={t.datesTitle}>
            <p>
              {fmt(r.dateDebut, t.intlLocale)} → {fmt(r.dateFin, t.intlLocale)} · {days} {days !== 1 ? t.dayPlural : t.daySingular}
            </p>
          </ModalSection>

          <ModalSection icon="fa-sack-dollar" title={t.amountTitle}>
            <div className="rsv-modal-total">
              <span className="rsv-modal-amount">{montantTotal.toLocaleString(t.intlLocale)} €</span>
              {prixJour !== null && (
                <span className="rsv-modal-muted">
                  {prixJour.toLocaleString(t.intlLocale)} € × {days} {days !== 1 ? t.dayPlural : t.daySingular}
                </span>
              )}
            </div>
          </ModalSection>

          <ModalSection icon="fa-credit-card" title={t.paymentTitle}>
            {paiementsLoading ? (
              <p className="rsv-modal-muted">{t.payLoading}</p>
            ) : paiements.length === 0 ? (
              <p className="rsv-modal-muted">{t.noPayment}</p>
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
                      <span className="rsv-modal-payment-date">{fmtLong(p.datePaiement, t.intlLocale)}</span>
                      <strong>{Number(p.montant).toLocaleString(t.intlLocale)} €</strong>
                      <span className={pst.cls}><i className={`fa-solid ${pst.icon}`} /> {pst.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </ModalSection>

          <ModalSection icon="fa-file-contract" title={t.documentsTitle}>
            <div className="rsv-modal-row" style={{ gap: 8 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleDownloadInvoice}>
                <i className="fa-solid fa-file-pdf" /> {t.invoicePdf}
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleDownloadContract}>
                <i className="fa-solid fa-file-contract" /> {t.contractPdf}
              </button>
            </div>
          </ModalSection>
        </div>
      </div>
    </div>
  );
}

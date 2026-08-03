"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  reservationsApi,
  boatsApi,
  canCancelReservation,
  CANCELLATION_MIN_HOURS,
  generateReservationInvoicePdf,
  generateReservationsInvoicesPdf,
  generateReservationContractPdf,
  useAuth,
} from "@/shared/lib";
import type { ReservationAPI, PaiementAPI, BoatAPI } from "@/shared/lib";
import { resolvePhotoUrl } from "@/shared/lib/boats-api";
import { RatingForm } from "@/features/rate-boat";
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
  new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

const BookingCard = ({
  r,
  boat,
  paiements,
  onRated,
  onCancelled,
}: {
  r: ReservationAPI;
  boat?: BoatAPI;
  paiements: PaiementAPI[];
  onRated: (reservationId: number) => void;
  onCancelled: (reservationId: number) => void;
}) => {
  const t = useI18n().dict.reservationsPage;
  const STATUS: Record<BadgeKey, { label: string; cls: string; icon: string }> = {
    confirmed: { label: t.statusConfirmed, cls: "badge-status green", icon: "fa-check" },
    pending:   { label: t.statusPending,   cls: "badge-status orange", icon: "fa-clock" },
    cancelled: { label: t.statusCancelled, cls: "badge-status red",    icon: "fa-xmark" },
    completed: { label: t.statusCompleted, cls: "badge-status grey",   icon: "fa-flag-checkered" },
  };

  const key = libelleToKey(r.statutReservation);
  const st = STATUS[key];
  const boatId = r.bateau?.id;
  const boatName = r.bateau?.nomBateau ?? `Bateau #${boatId ?? "?"}`;
  const sortedPhotos = (r.bateau?.photos ?? [])
    .slice()
    .sort((a, b) => (a.ordreAffichage ?? 99) - (b.ordreAffichage ?? 99));
  const imgSrc = sortedPhotos[0]
    ? resolvePhotoUrl(sortedPhotos[0].url)
    : `https://picsum.photos/seed/boat-${boatId ?? r.id}/400/300`;
  const alreadyRated = (r.avis?.length ?? 0) > 0;
  const cancellable = canCancelReservation(r.dateDebut);
  const [showRating, setShowRating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const { user } = useAuth();

  const tenantInfo = {
    name: r.utilisateur ? `${r.utilisateur.prenom} ${r.utilisateur.nom}` : user?.name,
    email: r.utilisateur?.email ?? user?.email,
  };

  const handleDownloadInvoice = () => {
    void generateReservationInvoicePdf(r, tenantInfo, paiements, boat);
  };

  const handleDownloadContract = () => {
    void generateReservationContractPdf(r, tenantInfo, boat);
  };

  const handleCancel = async () => {
    if (!cancellable) return;
    setCancelling(true);
    setCancelError("");
    try {
      await reservationsApi.cancel(r.id);
      onCancelled(r.id);
    } catch {
      setCancelError(t.cancelErr);
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-card-img">
        <Image src={imgSrc} alt={boatName} fill unoptimized sizes="140px" style={{ objectFit: "cover" }} />
      </div>
      <div className="booking-card-info">
        <div className="booking-card-hd">
          <div>
            <span className={st.cls}>
              <i className={`fa-solid ${st.icon}`} /> {st.label}
            </span>
            <h3>{boatName}</h3>
            {r.bateau?.port?.ville && (
              <p><i className="fa-solid fa-location-dot" /> {r.bateau.port.ville}</p>
            )}
          </div>
          <strong className="booking-price">{Number(r.montantTotal).toLocaleString(t.intlLocale)} €</strong>
        </div>
        <div className="booking-card-dates">
          <i className="fa-regular fa-calendar" />
          {fmt(r.dateDebut, t.intlLocale)} → {fmt(r.dateFin, t.intlLocale)}
        </div>
        <div className="booking-card-actions">
          <Link href={`/profil/reservations/${r.id}`} className="btn btn-primary btn-sm">
            <i className="fa-solid fa-receipt" /> {t.viewDetail}
          </Link>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleDownloadInvoice}>
            <i className="fa-solid fa-file-pdf" /> {t.invoicePdf}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleDownloadContract}>
            <i className="fa-solid fa-file-contract" /> {t.contractPdf}
          </button>
          {key === "completed" && (
            alreadyRated ? (
              <span className="btn btn-ghost btn-sm" style={{ color: "var(--text-3)", cursor: "default" }}>
                <i className="fa-solid fa-check" /> {t.alreadyRated}
              </span>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => setShowRating(true)}>
                <i className="fa-solid fa-star" /> {t.leaveReview}
              </button>
            )
          )}
          {key === "confirmed" && (
            cancellable ? (
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--red)" }}
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
              >
                {cancelling ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-xmark" />} {t.cancel}
              </button>
            ) : (
              <span
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--text-3)", cursor: "default" }}
                title={t.cancelTooLate.replace("{n}", String(CANCELLATION_MIN_HOURS))}
              >
                <i className="fa-solid fa-lock" /> {t.cancelUnavailable}
              </span>
            )
          )}
        </div>
        {key === "confirmed" && !cancellable && (
          <p style={{ color: "var(--text-3)", fontSize: ".8125rem", marginTop: 6 }}>
            {t.cancelSoonNote.replace("{n}", String(CANCELLATION_MIN_HOURS))}
          </p>
        )}
        {cancelError && (
          <p style={{ color: "var(--red)", fontSize: ".8125rem", marginTop: 6 }}>{cancelError}</p>
        )}
      </div>

      {showRating && (
        <RatingForm
          reservationId={r.id}
          boatName={boatName}
          onClose={() => setShowRating(false)}
          onSuccess={() => {
            setShowRating(false);
            onRated(r.id);
          }}
        />
      )}

      {showCancelConfirm && (
        <div className="cancel-modal-overlay" onClick={() => !cancelling && setShowCancelConfirm(false)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-icon">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            </div>
            <h2>{t.cancelModalTitle}</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: t.cancelModalText
                  .replace("{name}", `<strong>${boatName}</strong>`)
                  .replace("{from}", fmt(r.dateDebut, t.intlLocale))
                  .replace("{to}", fmt(r.dateFin, t.intlLocale)),
              }}
            />
            <div className="cancel-modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
              >
                {t.cancelModalBack}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: "var(--red)", borderColor: "var(--red)" }}
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <i className="fa-solid fa-circle-notch fa-spin" />
                ) : (
                  <i className="fa-solid fa-xmark" />
                )}{" "}
                {t.cancelModalConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AccordionSection = ({
  title,
  count,
  defaultOpen,
  children,
}: {
  title: string;
  count: number;
  defaultOpen: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="res-accordion">
      <button
        type="button"
        className={`res-accordion-btn${open ? " open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="dash-section-title" style={{ margin: 0 }}>
          {title} <span>({count})</span>
        </span>
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </button>
      {open && <div className="res-accordion-body-inner">{children}</div>}
    </div>
  );
};

export default function UserReservationsPage() {
  const { user } = useAuth();
  const t = useI18n().dict.reservationsPage;
  const [reservations, setReservations] = useState<ReservationAPI[]>([]);
  const [boatsById, setBoatsById] = useState<Map<number, BoatAPI>>(new Map());
  const [paiementsByReservation, setPaiementsByReservation] = useState<Record<number, PaiementAPI[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    reservationsApi
      .getAll()
      .then(async (list) => {
        setReservations(list);

        const [boats, paiementsEntries] = await Promise.all([
          boatsApi.getAll().catch(() => [] as BoatAPI[]),
          Promise.all(
            list.map(async (r) => {
              try {
                return [r.id, await reservationsApi.getPaiements(r.id)] as const;
              } catch {
                return [r.id, [] as PaiementAPI[]] as const;
              }
            })
          ),
        ]);
        setBoatsById(new Map(boats.map((b) => [b.id, b])));
        setPaiementsByReservation(Object.fromEntries(paiementsEntries));
      })
      .catch(() => setError(t.errLoad))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRated = (reservationId: number) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, avis: [...(r.avis ?? []), true] } : r)),
    );
  };

  const handleCancelled = (reservationId: number) => {
    setReservations((prev) => prev.filter((r) => r.id !== reservationId));
  };

  const handleExportAllInvoices = () => {
    void generateReservationsInvoicesPdf(
      reservations,
      { name: user?.name, email: user?.email },
      paiementsByReservation
    );
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

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = reservations.filter((r) => r.dateFin >= today);
  const past = reservations.filter((r) => r.dateFin < today);
  const n = reservations.length;
  const countLabel = n === 1
    ? t.countSingular.replace("{n}", String(n))
    : t.countPlural.replace("{n}", String(n));

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">{t.title}</h1>
          <p className="dash-sub">{countLabel}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportAllInvoices}
            disabled={reservations.length === 0}
          >
            <i className="fa-solid fa-download" /> {t.exportPdf}
          </button>
          <Link href="/bateaux" className="btn btn-primary">
            <i className="fa-solid fa-magnifying-glass" /> {t.findBoat}
          </Link>
        </div>
      </div>

      {upcoming.length > 0 && (
        <AccordionSection title={t.upcoming} count={upcoming.length} defaultOpen>
          <div className="bookings-list">
            {upcoming.map((r) => (
              <BookingCard
                key={r.id}
                r={r}
                boat={r.bateau?.id != null ? boatsById.get(r.bateau.id) : undefined}
                paiements={paiementsByReservation[r.id] ?? []}
                onRated={handleRated}
                onCancelled={handleCancelled}
              />
            ))}
          </div>
        </AccordionSection>
      )}
      {past.length > 0 && (
        <AccordionSection title={t.history} count={past.length} defaultOpen={false}>
          <div className="bookings-list">
            {past.map((r) => (
              <BookingCard
                key={r.id}
                r={r}
                boat={r.bateau?.id != null ? boatsById.get(r.bateau.id) : undefined}
                paiements={paiementsByReservation[r.id] ?? []}
                onRated={handleRated}
                onCancelled={handleCancelled}
              />
            ))}
          </div>
        </AccordionSection>
      )}
    </div>
  );
}

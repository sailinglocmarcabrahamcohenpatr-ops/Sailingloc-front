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
  useAuth,
} from "@/shared/lib";
import type { ReservationAPI, PaiementAPI, BoatAPI } from "@/shared/lib";
import { resolvePhotoUrl } from "@/shared/lib/boats-api";
import { RatingForm } from "@/features/rate-boat";
import "./reservations.css";

type BadgeKey = "confirmed" | "pending" | "cancelled" | "completed";

const STATUS: Record<BadgeKey, { label: string; cls: string; icon: string }> = {
  confirmed: { label: "Confirmée", cls: "badge-status green", icon: "fa-check" },
  pending: { label: "En attente", cls: "badge-status orange", icon: "fa-clock" },
  cancelled: { label: "Annulée", cls: "badge-status red", icon: "fa-xmark" },
  completed: { label: "Terminée", cls: "badge-status grey", icon: "fa-flag-checkered" },
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
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

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

  const handleDownloadInvoice = () => {
    generateReservationInvoicePdf(
      r,
      {
        name: r.utilisateur ? `${r.utilisateur.prenom} ${r.utilisateur.nom}` : user?.name,
        email: r.utilisateur?.email ?? user?.email,
      },
      paiements,
      boat
    );
  };

  const handleCancel = async () => {
    if (!cancellable) return;
    setCancelling(true);
    setCancelError("");
    try {
      await reservationsApi.cancel(r.id);
      onCancelled(r.id);
    } catch {
      setCancelError("Impossible d'annuler cette réservation.");
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
          <strong className="booking-price">{Number(r.montantTotal).toLocaleString("fr-FR")} €</strong>
        </div>
        <div className="booking-card-dates">
          <i className="fa-regular fa-calendar" />
          {fmt(r.dateDebut)} → {fmt(r.dateFin)}
        </div>
        <div className="booking-card-actions">
          <Link href={`/profil/reservations/${r.id}`} className="btn btn-primary btn-sm">
            <i className="fa-solid fa-receipt" /> Voir en détail
          </Link>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleDownloadInvoice}>
            <i className="fa-solid fa-file-pdf" /> Facture PDF
          </button>
          {/* <Link href={`/bateaux/${boatId}`} className="btn btn-ghost btn-sm">
            <i className="fa-solid fa-eye" /> Voir le bateau
          </Link> */}
          {key === "completed" && (
            alreadyRated ? (
              <span className="btn btn-ghost btn-sm" style={{ color: "var(--text-3)", cursor: "default" }}>
                <i className="fa-solid fa-check" /> Déjà noté
              </span>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => setShowRating(true)}>
                <i className="fa-solid fa-star" /> Laisser un avis
              </button>
            )
          )}
          {/* {(key === "confirmed" || key === "pending") && (
            <button className="btn btn-ghost btn-sm">
              <i className="fa-solid fa-envelope" /> Contacter
            </button>
          )} */}
          {key === "confirmed" && (
            cancellable ? (
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--red)" }}
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
              >
                {cancelling ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-xmark" />} Annuler
              </button>
            ) : (
              <span
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--text-3)", cursor: "default" }}
                title={`Annulation impossible à moins de ${CANCELLATION_MIN_HOURS}h du départ`}
              >
                <i className="fa-solid fa-lock" /> Annulation indisponible
              </span>
            )
          )}
        </div>
        {key === "confirmed" && !cancellable && (
          <p style={{ color: "var(--text-3)", fontSize: ".8125rem", marginTop: 6 }}>
            Le départ est dans moins de {CANCELLATION_MIN_HOURS}h, l&apos;annulation n&apos;est plus possible.
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
            <h2>Annuler cette réservation ?</h2>
            <p>
              Cette action est définitive et impossible à annuler. La réservation de{" "}
              <strong>{boatName}</strong> du {fmt(r.dateDebut)} au {fmt(r.dateFin)} sera supprimée.
            </p>
            <div className="cancel-modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
              >
                Retour
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
                Oui, annuler
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
      .catch(() => setError("Impossible de charger les réservations."))
      .finally(() => setLoading(false));
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
    generateReservationsInvoicesPdf(
      reservations,
      { name: user?.name, email: user?.email },
      paiementsByReservation
    );
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

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = reservations.filter((r) => r.dateFin >= today);
  const past = reservations.filter((r) => r.dateFin < today);

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Mes réservations</h1>
          <p className="dash-sub">
            {reservations.length} réservation{reservations.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportAllInvoices}
            disabled={reservations.length === 0}
          >
            <i className="fa-solid fa-download" /> Export PDF
          </button>
          <Link href="/bateaux" className="btn btn-primary">
            <i className="fa-solid fa-magnifying-glass" /> Trouver un bateau
          </Link>
        </div>
      </div>

      {upcoming.length > 0 && (
        <AccordionSection title="À venir" count={upcoming.length} defaultOpen>
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
        <AccordionSection title="Historique" count={past.length} defaultOpen={false}>
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

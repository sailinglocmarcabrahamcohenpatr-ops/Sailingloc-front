"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  reservationsApi,
  boatsApi,
  resolvePhotoUrl,
  canCancelReservation,
  CANCELLATION_MIN_HOURS,
  generateReservationInvoicePdf,
  useAuth,
} from "@/shared/lib";
import type { ReservationAPI, BoatAPI, PaiementAPI } from "@/shared/lib";
import { RatingForm } from "@/features/rate-boat";
import "../reservations.css";
import "./reservation-detail.css";

type BadgeKey = "confirmed" | "pending" | "cancelled" | "completed";

const STATUS: Record<BadgeKey, { label: string; cls: string; icon: string }> = {
  confirmed: { label: "Confirmée", cls: "badge-status green", icon: "fa-check" },
  pending: { label: "En attente", cls: "badge-status orange", icon: "fa-clock" },
  cancelled: { label: "Annulée", cls: "badge-status red", icon: "fa-xmark" },
  completed: { label: "Terminée", cls: "badge-status grey", icon: "fa-flag-checkered" },
};

const PAIEMENT_LABEL: Record<string, { label: string; cls: string }> = {
  en_attente: { label: "En attente", cls: "badge-status orange" },
  paye: { label: "Payé", cls: "badge-status green" },
  echoue: { label: "Échoué", cls: "badge-status red" },
  rembourse: { label: "Remboursé", cls: "badge-status grey" },
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

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const nights = (start: string, end: string) =>
  Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));

export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();

  const [reservation, setReservation] = useState<ReservationAPI | null>(null);
  const [boat, setBoat] = useState<BoatAPI | null>(null);
  const [paiements, setPaiements] = useState<PaiementAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activePhoto, setActivePhoto] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    reservationsApi
      .getOne(id)
      .then(async (r) => {
        if (!active) return;
        setReservation(r);
        setAlreadyRated((r.avis?.length ?? 0) > 0);

        const boatId = r.bateau?.id;
        const [b, p] = await Promise.allSettled([
          boatId ? boatsApi.getOne(boatId) : Promise.reject(),
          reservationsApi.getPaiements(r.id),
        ]);
        if (!active) return;
        if (b.status === "fulfilled") setBoat(b.value);
        if (p.status === "fulfilled") setPaiements(p.value);
      })
      .catch(() => {
        if (active) setError("Réservation introuvable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>Chargement…</div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="dash-page">
        <p style={{ color: "var(--red)", padding: "24px" }}>{error || "Réservation introuvable."}</p>
        <Link href="/profil/reservations" className="btn btn-outline btn-sm" style={{ alignSelf: "flex-start" }}>
          <i className="fa-solid fa-arrow-left" /> Retour à mes réservations
        </Link>
      </div>
    );
  }

  const key = cancelled ? "cancelled" : libelleToKey(reservation.statutReservation);
  const st = STATUS[key];
  const cancellable = canCancelReservation(reservation.dateDebut);
  const boatId = boat?.id ?? reservation.bateau?.id;
  const boatName = boat?.nomBateau ?? reservation.bateau?.nomBateau ?? `Bateau #${boatId ?? "?"}`;

  const photos = (boat?.photos ?? reservation.bateau?.photos ?? [])
    .slice()
    .sort((a, c) => (a.ordreAffichage ?? 99) - (c.ordreAffichage ?? 99))
    .map((p) => resolvePhotoUrl(p.url));

  const owner = boat?.proprietaire ?? boat?.utilisateur ?? reservation.bateau?.proprietaire;
  const ville = boat?.port?.ville ?? reservation.bateau?.port?.ville;
  const typeBateau = boat?.typeBateau?.labelTypeBateau ?? reservation.bateau?.typeBateau?.labelTypeBateau;

  const handleCancel = async () => {
    if (!cancellable) return;
    setCancelling(true);
    setCancelError("");
    try {
      await reservationsApi.cancel(reservation.id);
      setCancelled(true);
    } catch {
      setCancelError("Impossible d'annuler cette réservation.");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = () => {
    generateReservationInvoicePdf(
      reservation,
      {
        name: reservation.utilisateur
          ? `${reservation.utilisateur.prenom} ${reservation.utilisateur.nom}`
          : user?.name,
        email: reservation.utilisateur?.email ?? user?.email,
      },
      paiements,
      boat
    );
  };

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <Link href="/profil/reservations" className="res-detail-back">
            <i className="fa-solid fa-arrow-left" /> Mes réservations
          </Link>
          <h1 className="dash-title" style={{ marginTop: 8 }}>{boatName}</h1>
          <p className="dash-sub">
            <span className={st.cls}>
              <i className={`fa-solid ${st.icon}`} /> {st.label}
            </span>
            {ville && <span style={{ marginLeft: 10 }}><i className="fa-solid fa-location-dot" /> {ville}</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleDownloadInvoice}>
            <i className="fa-solid fa-download" /> Télécharger la facture
          </button>
          {boatId != null && (
            <Link href={`/bateaux/${boatId}`} className="btn btn-outline btn-sm">
              <i className="fa-solid fa-eye" /> Voir la fiche bateau
            </Link>
          )}
        </div>
      </div>

      {photos.length > 0 && (
        <div className="res-detail-gallery">
          <div className="res-detail-gallery-main">
            <Image src={photos[activePhoto]} alt={boatName} fill unoptimized style={{ objectFit: "cover" }} />
          </div>
          {photos.length > 1 && (
            <div className="res-detail-gallery-thumbs">
              {photos.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  className={`res-detail-gallery-thumb${i === activePhoto ? " active" : ""}`}
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Photo ${i + 1}`}
                >
                  <Image src={src} alt="" fill unoptimized style={{ objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-hd"><h3><i className="fa-regular fa-calendar" /> Séjour</h3></div>
          <div className="res-detail-rows">
            <div className="res-detail-row">
              <span>Arrivée</span>
              <strong>{fmtDate(reservation.dateDebut)}</strong>
            </div>
            <div className="res-detail-row">
              <span>Départ</span>
              <strong>{fmtDate(reservation.dateFin)}</strong>
            </div>
            <div className="res-detail-row">
              <span>Durée</span>
              <strong>{nights(reservation.dateDebut, reservation.dateFin)} nuit(s)</strong>
            </div>
            {reservation.dateReservation && (
              <div className="res-detail-row">
                <span>Réservé le</span>
                <strong>{fmtDate(reservation.dateReservation)}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-hd"><h3><i className="fa-solid fa-sailboat" /> Bateau</h3></div>
          <div className="res-detail-rows">
            {typeBateau && (
              <div className="res-detail-row">
                <span>Type</span>
                <strong style={{ textTransform: "capitalize" }}>{typeBateau}</strong>
              </div>
            )}
            {boat?.capacite != null && (
              <div className="res-detail-row">
                <span>Capacité</span>
                <strong>{boat.capacite} personnes</strong>
              </div>
            )}
            {boat?.nombreCabines != null && (
              <div className="res-detail-row">
                <span>Cabines</span>
                <strong>{boat.nombreCabines}</strong>
              </div>
            )}
            {ville && (
              <div className="res-detail-row">
                <span>Port</span>
                <strong>{ville}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-hd"><h3><i className="fa-solid fa-user" /> Propriétaire</h3></div>
          {owner ? (
            <div className="res-detail-rows">
              <div className="res-detail-row">
                <span>Nom</span>
                <strong>{owner.prenom} {owner.nom}</strong>
              </div>
              {owner.email && (
                <div className="res-detail-row">
                  <span>Email</span>
                  <strong>{owner.email}</strong>
                </div>
              )}
              {owner.telephone && (
                <div className="res-detail-row">
                  <span>Téléphone</span>
                  <strong>{owner.telephone}</strong>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: "var(--text-2)", fontSize: ".875rem" }}>Informations indisponibles.</p>
          )}
          <Link href="/profil/messages" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>
            <i className="fa-solid fa-envelope" /> Contacter
          </Link>
        </div>

        <div className="dash-card">
          <div className="dash-card-hd"><h3><i className="fa-solid fa-credit-card" /> Paiement</h3></div>
          <div className="res-detail-rows">
            <div className="res-detail-row">
              <span>Montant total</span>
              <strong className="res-detail-amount">{Number(reservation.montantTotal).toLocaleString("fr-FR")} €</strong>
            </div>
            {paiements.map((p) => {
              const pst = PAIEMENT_LABEL[p.statutPaiement] ?? { label: p.statutPaiement, cls: "badge-status grey" };
              return (
                <div className="res-detail-row" key={p.id}>
                  <span>Paiement du {fmtDate(p.datePaiement)}</span>
                  <span className={pst.cls}>{pst.label}</span>
                </div>
              );
            })}
            {paiements.length === 0 && (
              <div className="res-detail-row">
                <span>Statut</span>
                <span className="badge-status orange">En attente d&apos;encaissement</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="res-detail-actions">
        {key === "completed" && (
          alreadyRated ? (
            <span className="btn btn-ghost" style={{ color: "var(--text-3)", cursor: "default" }}>
              <i className="fa-solid fa-check" /> Déjà noté
            </span>
          ) : (
            <button className="btn btn-outline" onClick={() => setShowRating(true)}>
              <i className="fa-solid fa-star" /> Laisser un avis
            </button>
          )
        )}
        {(key === "confirmed" || key === "pending") && (
          cancellable ? (
            <button
              className="btn btn-ghost"
              style={{ color: "var(--red)" }}
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-xmark" />} Annuler la réservation
            </button>
          ) : (
            <span
              className="btn btn-ghost"
              style={{ color: "var(--text-3)", cursor: "default" }}
              title={`Annulation impossible à moins de ${CANCELLATION_MIN_HOURS}h du départ`}
            >
              <i className="fa-solid fa-lock" /> Annulation indisponible
            </span>
          )
        )}
      </div>
      {(key === "confirmed" || key === "pending") && !cancellable && (
        <p style={{ color: "var(--text-3)", fontSize: ".8125rem" }}>
          Le départ est dans moins de {CANCELLATION_MIN_HOURS}h, l&apos;annulation n&apos;est plus possible.
        </p>
      )}
      {cancelError && <p style={{ color: "var(--red)", fontSize: ".8125rem" }}>{cancelError}</p>}

      {showRating && (
        <RatingForm
          reservationId={reservation.id}
          boatName={boatName}
          onClose={() => setShowRating(false)}
          onSuccess={() => {
            setShowRating(false);
            setAlreadyRated(true);
          }}
        />
      )}
    </div>
  );
}

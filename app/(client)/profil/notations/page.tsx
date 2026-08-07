"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { avisApi, reservationsApi } from "@/shared/lib";
import type { AvisAPI, ReservationAPI } from "@/shared/lib";
import { resolvePhotoUrl } from "@/shared/lib/boats-api";
import { interpolate } from "@/shared/lib/utils";
import { RatingForm } from "@/features/rate-boat";
import { useI18n } from "@/shared/i18n";
import "./notations.css";

const fmt = (d: string, locale: string) =>
  new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

/** Une réservation est notable dès qu'elle a été validée par le propriétaire
 *  ("confirmée") ou une fois le séjour marqué "terminée", et pas encore notée.
 *  Note : la création d'avis (POST /api/avis) peut renvoyer 422 côté backend
 *  tant que la réservation n'est pas passée à "terminée" — voir RatingForm. */
const isNotable = (r: ReservationAPI) => {
  const statut = (r.statutReservation ?? "").toLowerCase();
  return (statut.includes("confirm") || statut.includes("termin")) && (r.avis?.length ?? 0) === 0;
};

const Stars = ({ n }: { n: number }) => (
  <span className="stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <i key={i} className={i <= n ? "fa-solid fa-star" : "fa-regular fa-star"} aria-hidden="true" />
    ))}
  </span>
);

const NotationCard = ({ a, onDeleted }: { a: AvisAPI; onDeleted: (avisId: number) => void }) => {
  const t = useI18n().dict.notationsPage;
  const boat = a.reservation?.bateau;
  const boatName = boat?.nomBateau ?? t.boatFallback.replace("{id}", String(a.reservation?.id ?? ""));
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await avisApi.delete(a.id);
      onDeleted(a.id);
    } catch {
      setError(t.errDelete);
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="notation-card">
      <div className="notation-card-hd">
        <div>
          {boat ? (
            <Link href={`/bateaux/${boat.id}`}>
              <h3>{boatName}</h3>
            </Link>
          ) : (
            <h3>{boatName}</h3>
          )}
          <Stars n={a.note} />
        </div>
        <span className="notation-card-date">{t.ratedOn.replace("{date}", fmt(a.dateAvis, t.intlLocale))}</span>
      </div>

      <div className="notation-card-subnotes">
        <span><i className="fa-solid fa-user" /> {t.owner} <Stars n={a.noteProprietaire} /></span>
        <span><i className="fa-solid fa-sailboat" /> {t.boat} <Stars n={a.noteBateau} /></span>
        <span><i className="fa-solid fa-map-location-dot" /> {t.place} <Stars n={a.noteLieu} /></span>
      </div>

      {a.commentaire && <p className="notation-card-comment">{a.commentaire}</p>}

      <div className="notation-card-actions">
        <button className="btn btn-ghost btn-sm notation-card-delete" onClick={() => setConfirming(true)}>
          <i className="fa-solid fa-trash-can" /> {t.deleteMine}
        </button>
      </div>
      {error && <p style={{ color: "var(--red)", fontSize: ".8125rem", marginTop: 4 }}>{error}</p>}

      {confirming && (
        <div className="cancel-modal-overlay" onClick={() => !deleting && setConfirming(false)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-icon">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            </div>
            <h2>{t.deleteConfirmTitle}</h2>
            <p>{interpolate(t.deleteConfirmText, { name: <strong>{boatName}</strong> })}</p>
            <div className="cancel-modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setConfirming(false)} disabled={deleting}>
                {t.back}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: "var(--red)", borderColor: "var(--red)" }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-trash-can" />}{" "}
                {t.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToRateCard = ({
  r,
  onRated,
}: {
  r: ReservationAPI;
  onRated: (reservationId: number, avis: AvisAPI) => void;
}) => {
  const t = useI18n().dict.notationsPage;
  const [showRating, setShowRating] = useState(false);
  const boatId = r.bateau?.id;
  const boatName = r.bateau?.nomBateau ?? `Bateau #${boatId ?? "?"}`;
  const sortedPhotos = (r.bateau?.photos ?? [])
    .slice()
    .sort((a, b) => (a.ordreAffichage ?? 99) - (b.ordreAffichage ?? 99));
  const imgSrc = sortedPhotos[0]
    ? resolvePhotoUrl(sortedPhotos[0].url)
    : `https://picsum.photos/seed/boat-${boatId ?? r.id}/400/300`;

  return (
    <div className="torate-card">
      <div className="torate-card-img">
        <Image src={imgSrc} alt={boatName} fill unoptimized sizes="160px" style={{ objectFit: "cover" }} />
        <span className="badge-status green torate-card-badge">
          <i className="fa-solid fa-check" /> {t.confirmedBadge}
        </span>
      </div>
      <div className="torate-card-body">
        {boatId ? (
          <Link href={`/bateaux/${boatId}`} className="torate-card-name">
            <h3>{boatName}</h3>
          </Link>
        ) : (
          <h3 className="torate-card-name">{boatName}</h3>
        )}
        <div className="torate-card-meta">
          {r.bateau?.port?.ville && (
            <span><i className="fa-solid fa-location-dot" /> {r.bateau.port.ville}</span>
          )}
          <span><i className="fa-regular fa-calendar" /> {fmt(r.dateDebut, t.intlLocale)} → {fmt(r.dateFin, t.intlLocale)}</span>
        </div>
      </div>
      <div className="torate-card-action">
        <button className="btn btn-primary" onClick={() => setShowRating(true)}>
          <i className="fa-solid fa-star" /> {t.rateThis}
        </button>
      </div>

      {showRating && (
        <RatingForm
          reservationId={r.id}
          boatName={boatName}
          onClose={() => setShowRating(false)}
          onSuccess={(avis) => {
            setShowRating(false);
            onRated(r.id, avis);
          }}
        />
      )}
    </div>
  );
};

export default function MesNotationsPage() {
  const t = useI18n().dict.notationsPage;
  const [avis, setAvis] = useState<AvisAPI[]>([]);
  const [toRate, setToRate] = useState<ReservationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([avisApi.getMine(), reservationsApi.getAll()])
      .then(([avisList, reservations]) => {
        setAvis(avisList);
        setToRate(reservations.filter(isNotable));
      })
      .catch(() => setError(t.errLoad))
      .finally(() => setLoading(false));
  }, []);

  const handleRated = (reservationId: number, newAvis: AvisAPI) => {
    setToRate((prev) => prev.filter((r) => r.id !== reservationId));
    setAvis((prev) => [newAvis, ...prev]);
  };

  /** Pas d'endpoint d'édition côté backend (PUT/PATCH /api/avis/{id}) : l'équivalent
   *  "modifier" est supprimer puis re-noter, donc on remet la réservation dans
   *  "à noter" à partir des infos déjà connues de l'avis supprimé. */
  const handleDeleted = (avisId: number) => {
    const deleted = avis.find((a) => a.id === avisId);
    setAvis((prev) => prev.filter((a) => a.id !== avisId));
    if (deleted?.reservation) {
      const restored: ReservationAPI = {
        id: deleted.reservation.id,
        dateDebut: deleted.reservation.dateDebut,
        dateFin: deleted.reservation.dateFin,
        montantTotal: 0,
        statutReservation: "confirmée",
        bateau: deleted.reservation.bateau,
        avis: [],
      };
      setToRate((prev) => [restored, ...prev]);
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

  const countLabel = avis.length === 1
    ? t.countSingular.replace("{n}", String(avis.length))
    : t.countPlural.replace("{n}", String(avis.length));

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">{t.title}</h1>
          <p className="dash-sub">{countLabel}</p>
        </div>
        <Link href="/profil/reservations" className="btn btn-primary">
          <i className="fa-solid fa-calendar-check" /> {t.seeReservations}
        </Link>
      </div>

      {toRate.length > 0 && (
        <div className="torate-section">
          <div className="torate-section-hd">
            <span className="torate-section-icon"><i className="fa-solid fa-star" aria-hidden="true" /></span>
            <div>
              <h2>{t.toRateTitle} <span>({toRate.length})</span></h2>
              <p>{t.toRateSub}</p>
            </div>
          </div>
          <div className="torate-list">
            {toRate.map((r) => (
              <ToRateCard key={r.id} r={r} onRated={handleRated} />
            ))}
          </div>
        </div>
      )}

      {avis.length === 0 ? (
        <div className="notation-empty">
          <i className="fa-regular fa-star" />
          {toRate.length > 0 ? (
            <p>{t.emptyAfterToRate}</p>
          ) : (
            <>
              <p>{t.emptyNone}</p>
              <p>{t.emptyHintBefore}<Link href="/profil/reservations">{t.emptyHintLink}</Link>{t.emptyHintAfter}</p>
            </>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {avis.map((a) => (
            <NotationCard key={a.id} a={a} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}

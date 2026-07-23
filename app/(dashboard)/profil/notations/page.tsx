"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { avisApi } from "@/shared/lib";
import type { AvisAPI } from "@/shared/lib";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const Stars = ({ n }: { n: number }) => (
  <span className="stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <i key={i} className={i <= n ? "fa-solid fa-star" : "fa-regular fa-star"} aria-hidden="true" />
    ))}
  </span>
);

const NotationCard = ({ a }: { a: AvisAPI }) => {
  const boat = a.reservation?.bateau;
  const boatName = boat?.nomBateau ?? `Réservation #${a.reservation?.id ?? ""}`;

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
        <span className="notation-card-date">Noté le {fmt(a.dateAvis)}</span>
      </div>

      <div className="notation-card-subnotes">
        <span><i className="fa-solid fa-user" /> Propriétaire <Stars n={a.noteProprietaire} /></span>
        <span><i className="fa-solid fa-sailboat" /> Bateau <Stars n={a.noteBateau} /></span>
        <span><i className="fa-solid fa-map-location-dot" /> Lieu <Stars n={a.noteLieu} /></span>
      </div>

      {a.commentaire && <p className="notation-card-comment">{a.commentaire}</p>}
    </div>
  );
};

export default function MesNotationsPage() {
  const [avis, setAvis] = useState<AvisAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    avisApi
      .getMine()
      .then(setAvis)
      .catch(() => setError("Impossible de charger vos notations."))
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

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Mes notations</h1>
          <p className="dash-sub">
            {avis.length} notation{avis.length !== 1 ? "s" : ""} laissée{avis.length !== 1 ? "s" : ""} sur vos locations
          </p>
        </div>
        <Link href="/profil/reservations" className="btn btn-primary">
          <i className="fa-solid fa-calendar-check" /> Voir mes réservations
        </Link>
      </div>

      {avis.length === 0 ? (
        <div className="notation-empty">
          <i className="fa-regular fa-star" />
          <p>Vous n&apos;avez pas encore noté de location.</p>
          <p>Une fois une réservation terminée, retrouvez le bouton « Laisser un avis » depuis <Link href="/profil/reservations">Mes réservations</Link>.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {avis.map((a) => (
            <NotationCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}

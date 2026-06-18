"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { reservationsApi } from "@/shared/lib";
import type { ReservationAPI } from "@/shared/lib";

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

const BookingCard = ({ r }: { r: ReservationAPI }) => {
  const key = libelleToKey(r.statut_reservation?.libelle);
  const st = STATUS[key];
  const boatName = r.bateau?.nom_bateau ?? `Bateau #${r.id_bateau}`;
  const imgSrc = `https://picsum.photos/seed/boat-${r.id_bateau}/400/300`;

  return (
    <div className="booking-card">
      <div className="booking-card-img">
        <Image src={imgSrc} alt={boatName} fill sizes="140px" style={{ objectFit: "cover" }} />
      </div>
      <div className="booking-card-info">
        <div className="booking-card-hd">
          <div>
            <span className={st.cls}>
              <i className={`fa-solid ${st.icon}`} /> {st.label}
            </span>
            <h3>{boatName}</h3>
            <p><i className="fa-solid fa-location-dot" /> {r.statut_reservation?.libelle ?? "—"}</p>
          </div>
          <strong className="booking-price">{r.montant_total.toLocaleString("fr-FR")} €</strong>
        </div>
        <div className="booking-card-dates">
          <i className="fa-regular fa-calendar" />
          {fmt(r.date_debut)} → {fmt(r.date_fin)}
        </div>
        <div className="booking-card-actions">
          <Link href={`/bateaux/${r.id_bateau}`} className="btn btn-ghost btn-sm">
            <i className="fa-solid fa-eye" /> Voir le bateau
          </Link>
          {key === "completed" && (
            <button className="btn btn-outline btn-sm">
              <i className="fa-solid fa-star" /> Laisser un avis
            </button>
          )}
          {(key === "confirmed" || key === "pending") && (
            <button className="btn btn-ghost btn-sm">
              <i className="fa-solid fa-envelope" /> Contacter
            </button>
          )}
          {key === "confirmed" && (
            <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }}>
              <i className="fa-solid fa-xmark" /> Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function UserReservationsPage() {
  const [reservations, setReservations] = useState<ReservationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    reservationsApi
      .getAll()
      .then(setReservations)
      .catch(() => setError("Impossible de charger les réservations."))
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

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = reservations.filter((r) => r.date_fin >= today);
  const past = reservations.filter((r) => r.date_fin < today);

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Mes réservations</h1>
          <p className="dash-sub">
            {reservations.length} réservation{reservations.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Link href="/bateaux" className="btn btn-primary">
          <i className="fa-solid fa-magnifying-glass" /> Trouver un bateau
        </Link>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h3 className="dash-section-title">À venir</h3>
          <div className="bookings-list">
            {upcoming.map((r) => (
              <BookingCard key={r.id} r={r} />
            ))}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h3 className="dash-section-title">Historique</h3>
          <div className="bookings-list">
            {past.map((r) => (
              <BookingCard key={r.id} r={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

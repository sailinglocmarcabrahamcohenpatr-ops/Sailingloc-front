import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Mes réservations" };

type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled";

const MY_BOOKINGS: Array<{ id: string; boatId: string; boat: string; owner: string; location: string; imageSeed: string; start: string; end: string; guests: number; total: number; status: BookingStatus }> = [
  { id: "b1", boatId: "sun-odyssey-440", boat: "Sun Odyssey 440", owner: "Marc D.", location: "Marseille", imageSeed: "sun-odyssey", start: "2026-07-10", end: "2026-07-17", guests: 4, total: 6230, status: "confirmed" },
  { id: "b2", boatId: "leopard-45", boat: "Leopard 45", owner: "Lucie M.", location: "Cannes", imageSeed: "catamaran6", start: "2026-08-20", end: "2026-08-27", guests: 6, total: 11550, status: "pending" },
  { id: "b3", boatId: "bavaria-46-cruiser", boat: "Bavaria 46", owner: "Pierre T.", location: "Nice", imageSeed: "bavaria-cruiser", start: "2026-06-01", end: "2026-06-08", guests: 4, total: 6020, status: "completed" },
  { id: "b4", boatId: "jeanneau-54-ds", boat: "Jeanneau 54", owner: "Anne B.", location: "La Ciotat", imageSeed: "jeanneau-54", start: "2025-09-10", end: "2025-09-17", guests: 8, total: 8680, status: "completed" },
];

const STATUS = {
  confirmed: { label: "Confirmée", cls: "badge-status green", icon: "fa-check" },
  pending: { label: "En attente", cls: "badge-status orange", icon: "fa-clock" },
  cancelled: { label: "Annulée", cls: "badge-status red", icon: "fa-xmark" },
  completed: { label: "Terminée", cls: "badge-status grey", icon: "fa-flag-checkered" },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default function UserReservationsPage() {
  const upcoming = MY_BOOKINGS.filter((b) => b.status === "confirmed" || b.status === "pending");
  const past = MY_BOOKINGS.filter((b) => b.status === "completed" || b.status === "cancelled");

  const BookingCard = ({ b }: { b: typeof MY_BOOKINGS[0] }) => (
    <div className="booking-card">
      <div className="booking-card-img">
        <Image src={`https://picsum.photos/seed/${b.imageSeed}/400/300`} alt={b.boat} fill sizes="140px" style={{ objectFit: "cover" }} />
      </div>
      <div className="booking-card-info">
        <div className="booking-card-hd">
          <div>
            <span className={STATUS[b.status].cls}>
              <i className={`fa-solid ${STATUS[b.status].icon}`} /> {STATUS[b.status].label}
            </span>
            <h3>{b.boat}</h3>
            <p><i className="fa-solid fa-location-dot" /> {b.location} · {b.owner}</p>
          </div>
          <strong className="booking-price">{b.total.toLocaleString("fr-FR")} €</strong>
        </div>
        <div className="booking-card-dates">
          <i className="fa-regular fa-calendar" />
          {fmt(b.start)} → {fmt(b.end)} · {b.guests} passager{b.guests > 1 ? "s" : ""}
        </div>
        <div className="booking-card-actions">
          <Link href={`/bateaux/${b.boatId}`} className="btn btn-ghost btn-sm">
            <i className="fa-solid fa-eye" /> Voir le bateau
          </Link>
          {b.status === "completed" && (
            <button className="btn btn-outline btn-sm">
              <i className="fa-solid fa-star" /> Laisser un avis
            </button>
          )}
          {(b.status === "confirmed" || b.status === "pending") && (
            <button className="btn btn-ghost btn-sm">
              <i className="fa-solid fa-envelope" /> Contacter
            </button>
          )}
          {b.status === "confirmed" && (
            <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }}>
              <i className="fa-solid fa-xmark" /> Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Mes réservations</h1>
          <p className="dash-sub">{MY_BOOKINGS.length} réservation{MY_BOOKINGS.length > 1 ? "s" : ""} au total</p>
        </div>
        <Link href="/bateaux" className="btn btn-primary">
          <i className="fa-solid fa-magnifying-glass" /> Trouver un bateau
        </Link>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h3 className="dash-section-title">À venir</h3>
          <div className="bookings-list">{upcoming.map((b) => <BookingCard key={b.id} b={b} />)}</div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h3 className="dash-section-title">Historique</h3>
          <div className="bookings-list">{past.map((b) => <BookingCard key={b.id} b={b} />)}</div>
        </div>
      )}
    </div>
  );
}

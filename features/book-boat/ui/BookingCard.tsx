import Link from "next/link";
import GuestCounter from "./GuestCounter";
import { BOOKING_GUARANTEES } from "../model/constants";
import { DEFAULT_BOOKING_DAYS } from "@/shared/config";
import { formatPrice, calculateBookingTotal } from "@/shared/lib/utils";

interface BookingCardProps {
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  capacity: number;
  ownerName?: string;
}

export default function BookingCard({
  pricePerDay,
  rating,
  reviewCount,
  capacity,
  ownerName = "le propriétaire",
}: BookingCardProps) {
  const { subtotal, serviceFee, total, days } = calculateBookingTotal(
    pricePerDay,
    DEFAULT_BOOKING_DAYS
  );

  return (
    <aside>
      <div className="booking-card">
        <div className="booking-header">
          <div className="booking-price">
            {formatPrice(pricePerDay)} <span>/ jour</span>
          </div>
          <div className="booking-rating">
            <i className="fa-solid fa-star" aria-hidden="true" />
            <span>
              {rating} · {reviewCount} avis
            </span>
          </div>
        </div>
        <div className="booking-body">
          <div className="booking-dates">
            <div className="booking-date-field">
              <label htmlFor="book-arrival">Arrivée</label>
              <input type="date" id="book-arrival" defaultValue="2025-07-10" />
            </div>
            <div className="booking-date-field">
              <label htmlFor="book-departure">Départ</label>
              <input type="date" id="book-departure" defaultValue="2025-07-17" />
            </div>
          </div>

          <GuestCounter max={capacity} />

          <div className="booking-info">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <span>
              Ce bateau est très demandé. Il ne reste que 2 disponibilités ce
              mois-ci.
            </span>
          </div>

          <div className="booking-total">
            <div className="booking-total-row">
              <span>
                {formatPrice(pricePerDay)} × {days} jours
              </span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="booking-total-row">
              <span>Frais de service SailingLoc</span>
              <strong>{formatPrice(serviceFee)}</strong>
            </div>
            <div className="booking-total-row">
              <span>Assurance incluse</span>
              <strong className="text-green">Offerte</strong>
            </div>
            <div className="booking-total-divider" />
            <div className="booking-total-final">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <button className="btn btn-primary booking-cta" type="button">
            <i className="fa-solid fa-calendar-check" aria-hidden="true" />
            Réserver maintenant
          </button>
          <p className="booking-note">
            Vous ne serez débité qu&apos;après confirmation du propriétaire
          </p>
          <div className="booking-contact">
            <Link href="/contact">
              <i className="fa-regular fa-comment" aria-hidden="true" /> Contacter{" "}
              {ownerName}
            </Link>
            <Link href="tel:+33612345678">
              <i className="fa-solid fa-phone" aria-hidden="true" /> Appeler
            </Link>
          </div>
        </div>
      </div>

      <div className="booking-guarantees">
        {BOOKING_GUARANTEES.map((g) => (
          <div key={g.title} className="booking-guarantee-item">
            <i
              className={`fa-solid ${g.icon} booking-guarantee-icon`}
              style={{ color: g.color }}
              aria-hidden="true"
            />
            <span>
              <strong>{g.title}</strong> — {g.desc}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

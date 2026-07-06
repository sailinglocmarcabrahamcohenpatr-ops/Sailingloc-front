"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib";
import GuestCounter from "./GuestCounter";
import { BOOKING_GUARANTEES } from "../model/constants";
import { formatPrice, calculateBookingTotal } from "@/shared/lib/utils";

function getDefaultDates() {
  const start = new Date();
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

function daysBetween(start: string, end: string): number {
  const diff = Math.ceil(
    (new Date(end + "T00:00:00").getTime() - new Date(start + "T00:00:00").getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return Math.max(1, diff);
}

interface BookingCardProps {
  boatId: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  capacity: number;
  ownerName?: string;
}

export default function BookingCard({
  boatId,
  pricePerDay,
  rating,
  reviewCount,
  capacity,
  ownerName = "le propriétaire",
}: BookingCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [guests, setGuests] = useState(Math.min(4, capacity));

  const days = daysBetween(startDate, endDate);
  const { subtotal, serviceFee, total } = calculateBookingTotal(pricePerDay, days);

  const today = new Date().toISOString().split("T")[0];

  const handleBook = () => {
    const destination = `/reservation/${boatId}?startDate=${startDate}&endDate=${endDate}&guests=${guests}`;
    if (!user) {
      router.push(`/connexion?redirect=${encodeURIComponent(destination)}`);
      return;
    }
    router.push(destination);
  };

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
              <input
                type="date"
                id="book-arrival"
                value={startDate}
                min={today}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value >= endDate) {
                    const next = new Date(e.target.value + "T00:00:00");
                    next.setDate(next.getDate() + 7);
                    setEndDate(next.toISOString().split("T")[0]);
                  }
                }}
              />
            </div>
            <div className="booking-date-field">
              <label htmlFor="book-departure">Départ</label>
              <input
                type="date"
                id="book-departure"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <GuestCounter
            max={capacity}
            initial={Math.min(4, capacity)}
            onChange={setGuests}
          />

          <div className="booking-info">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <span>
              Ce bateau est très demandé. Il ne reste que 2 disponibilités ce mois-ci.
            </span>
          </div>

          <div className="booking-total">
            <div className="booking-total-row">
              <span>
                {formatPrice(pricePerDay)} × {days} jour{days > 1 ? "s" : ""}
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

          <button className="btn btn-primary booking-cta" type="button" onClick={handleBook}>
            <i className="fa-solid fa-calendar-check" aria-hidden="true" />
            {user ? "Réserver maintenant" : "Se connecter pour réserver"}
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

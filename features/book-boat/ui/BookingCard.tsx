"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { useAuth, boatsApi } from "@/shared/lib";
import GuestCounter from "./GuestCounter";
import AvailabilityCalendar, { type DateSpan } from "./AvailabilityCalendar";
import { BOOKING_GUARANTEES } from "../model/constants";
import { formatPrice, calculateBookingTotal } from "@/shared/lib/utils";

function isCancelled(libelle?: string): boolean {
  return (libelle ?? "").toLowerCase().includes("annul");
}

function daysBetween(start: string, end: string): number {
  const diff = Math.ceil(
    (new Date(end + "T00:00:00").getTime() - new Date(start + "T00:00:00").getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return Math.max(1, diff);
}

function toIsoDay(d: Date): string {
  return d.toISOString().split("T")[0];
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
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(Math.min(4, capacity));

  const [openRanges, setOpenRanges] = useState<DateSpan[]>([]);
  const [bookedRanges, setBookedRanges] = useState<DateSpan[]>([]);
  const [calLoading, setCalLoading] = useState(true);

  useEffect(() => {
    // Le sous-endpoint /disponibilites renvoie une sérialisation incomplète
    // côté backend (pas de dateFin) — on lit plutôt le tableau `disponibilites`
    // embarqué dans la fiche bateau, qui est complet.
    Promise.all([boatsApi.getOne(boatId), boatsApi.getReservations(boatId)])
      .then(([boat, reservations]) => {
        setOpenRanges(
          (boat.disponibilites ?? [])
            // Une disponibilité "bloque" est fermée par le propriétaire (ex. maintenance) —
            // elle ne doit pas apparaître comme réservable côté locataire.
            .filter((d) => d.statut !== "bloque")
            .map((d) => ({
              from: new Date(d.dateDebut),
              to: new Date(d.dateFin ?? d.dateDebut),
            }))
        );
        setBookedRanges(
          reservations
            .filter((r) => !isCancelled(r.statutReservation?.libelle))
            .map((r) => ({ from: new Date(r.dateDebut), to: new Date(r.dateFin) }))
        );
      })
      .catch(() => {})
      .finally(() => setCalLoading(false));
  }, [boatId]);

  const startDate = range?.from ? toIsoDay(range.from) : "";
  const endDate = range?.to ? toIsoDay(range.to) : "";
  const hasAvailability = !calLoading && openRanges.length > 0;
  const canBook = Boolean(startDate && endDate);

  const days = canBook ? daysBetween(startDate, endDate) : 0;
  const { subtotal, serviceFee, total } = calculateBookingTotal(pricePerDay, days || 1);

  const handleBook = () => {
    if (!canBook) return;
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
          <div className="booking-dates booking-dates-cal">
            <label>Dates de location</label>
            <AvailabilityCalendar
              value={range}
              onChange={setRange}
              openRanges={openRanges}
              bookedRanges={bookedRanges}
              loading={calLoading}
            />
          </div>

          <GuestCounter
            max={capacity}
            initial={Math.min(4, capacity)}
            onChange={setGuests}
          />

          <div className="booking-info">
            <i className={`fa-solid ${hasAvailability ? "fa-circle-info" : "fa-triangle-exclamation"}`} aria-hidden="true" />
            <span>
              {calLoading
                ? "Vérification des disponibilités…"
                : hasAvailability
                ? "Cliquez sur le calendrier pour choisir vos dates parmi les périodes disponibles (en vert)."
                : "Le propriétaire n'a pas encore ouvert de créneau de location pour ce bateau."}
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

          <button
            className="btn btn-primary booking-cta"
            type="button"
            onClick={handleBook}
            disabled={!canBook}
            title={!canBook ? "Choisissez vos dates sur le calendrier" : undefined}
          >
            <i className="fa-solid fa-calendar-check" aria-hidden="true" />
            {!canBook ? "Choisir des dates" : user ? "Réserver maintenant" : "Se connecter pour réserver"}
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

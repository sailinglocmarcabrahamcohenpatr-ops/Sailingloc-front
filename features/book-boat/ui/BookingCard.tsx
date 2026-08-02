"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { useAuth, boatsApi, type DisponibiliteAPI } from "@/shared/lib";
import { useI18n, LocaleLink as Link, localizeHref } from "@/shared/i18n";
import GuestCounter from "./GuestCounter";
import AvailabilityCalendar, { type DateSpan } from "./AvailabilityCalendar";
import { BOOKING_GUARANTEES } from "../model/constants";
import { formatPrice, calculateBookingTotal, toLocalIsoDate } from "@/shared/lib/utils";

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

interface BookingCardProps {
  boatId: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  capacity: number;
  ownerName?: string;
  disponibilites?: DisponibiliteAPI[];
}

export default function BookingCard({
  boatId,
  pricePerDay,
  rating,
  reviewCount,
  capacity,
  ownerName,
  disponibilites = [],
}: BookingCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { locale, dict } = useI18n();
  const t = dict.boatDetail;
  const ownerLabel = ownerName ?? t.defaultOwnerName;
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(Math.min(4, capacity));

  // Les statuts "bloque" et "indisponible" bloquent les dates dans le calendrier.
  // Toutes les autres dates sont réservables par défaut. On lit `disponibilites`
  // tel qu'embarqué par boatsApi.getOne() — /api/disponibilites/bateau/{id} et
  // /api/bateaux/{id}/disponibilites renvoient une sérialisation incomplète
  // (statut/dateFin manquants) et ne doivent pas être utilisés ici.
  const blockedRanges: DateSpan[] = useMemo(
    () =>
      disponibilites
        .filter((d) => d.statut === "bloque" || d.statut === "indisponible")
        .map((d) => ({
          from: new Date(d.dateDebut),
          to: new Date(d.dateFin ?? d.dateDebut),
        })),
    [disponibilites]
  );

  const [bookedRanges, setBookedRanges] = useState<DateSpan[]>([]);
  const [calLoading, setCalLoading] = useState(true);

  useEffect(() => {
    boatsApi.getReservations(boatId)
      .then((reservations) => {
        setBookedRanges(
          reservations
            .filter((r) => !isCancelled(r.statutReservation))
            .map((r) => ({ from: new Date(r.dateDebut), to: new Date(r.dateFin) }))
        );
      })
      .catch(() => {})
      .finally(() => setCalLoading(false));
  }, [boatId]);

  const startDate = range?.from ? toLocalIsoDate(range.from) : "";
  const endDate = range?.to ? toLocalIsoDate(range.to) : "";
  const hasAvailability = !calLoading;
  const canBook = Boolean(startDate && endDate);

  const days = canBook ? daysBetween(startDate, endDate) : 0;
  const { subtotal, serviceFee, total } = calculateBookingTotal(pricePerDay, days || 1);

  const isOwnerAccount = user?.role === "proprietaire" || user?.role === "admin";

  const handleBook = () => {
    if (!canBook || isOwnerAccount) return;
    const destination = localizeHref(
      `/reservation/${boatId}?startDate=${startDate}&endDate=${endDate}&guests=${guests}`,
      locale
    );
    if (!user) {
      router.push(localizeHref(`/connexion?redirect=${encodeURIComponent(destination)}`, locale));
      return;
    }
    router.push(destination);
  };

  return (
    <aside>
      <div className="booking-card">
        <div className="booking-header">
          <div className="booking-price">
            {formatPrice(pricePerDay)} <span>{t.perDay}</span>
          </div>
          <div className="booking-rating">
            <i className="fa-solid fa-star" aria-hidden="true" />
            <span>
              {rating} · {reviewCount} {t.reviews}
            </span>
          </div>
        </div>
        <div className="booking-body">
          <div className="booking-dates booking-dates-cal">
            <label>{t.rentalDates}</label>
            <AvailabilityCalendar
              value={range}
              onChange={setRange}
              blockedRanges={blockedRanges}
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
                ? t.checkingAvailability
                : hasAvailability
                ? t.bookingHint
                : t.noDatesAvailable}
            </span>
          </div>

          <div className="booking-total">
            <div className="booking-total-row">
              <span>
                {formatPrice(pricePerDay)} × {days} {days > 1 ? t.daysLabel : t.dayLabel}
              </span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="booking-total-row">
              <span>{t.serviceFee}</span>
              <strong>{formatPrice(serviceFee)}</strong>
            </div>
            <div className="booking-total-row">
              <span>{t.insuranceIncluded}</span>
              <strong className="text-green">{t.free}</strong>
            </div>
            <div className="booking-total-divider" />
            <div className="booking-total-final">
              <span>{t.total}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <button
            className="btn btn-primary booking-cta"
            type="button"
            onClick={handleBook}
            disabled={!canBook || isOwnerAccount}
            title={
              isOwnerAccount
                ? t.titleOwnerOnly
                : !canBook
                ? t.titleChooseDates
                : undefined
            }
          >
            <i className="fa-solid fa-calendar-check" aria-hidden="true" />
            {isOwnerAccount
              ? t.ctaOwnerOnly
              : !canBook
              ? t.ctaChooseDates
              : user
              ? t.ctaBookNow
              : t.ctaLoginToBook}
          </button>
          <p className="booking-note">
            {isOwnerAccount ? (
              <>
                {t.noteOwner}{" "}
                <Link href="/inscription">{t.noteOwnerCta}</Link>
              </>
            ) : (
              t.noteDefault
            )}
          </p>
          <div className="booking-contact">
            <Link href="/contact">
              <i className="fa-regular fa-comment" aria-hidden="true" /> {t.contact}{" "}
              {ownerLabel}
            </Link>
            <a href="tel:+33612345678">
              <i className="fa-solid fa-phone" aria-hidden="true" /> {t.call}
            </a>
          </div>
        </div>
      </div>

      <div className="booking-guarantees">
        {BOOKING_GUARANTEES.map((g, i) => {
          const label = t.guarantees[i];
          return (
            <div key={g.icon} className="booking-guarantee-item">
              <i
                className={`fa-solid ${g.icon} booking-guarantee-icon`}
                style={{ color: g.color }}
                aria-hidden="true"
              />
              <span>
                <strong>{label.title}</strong> — {label.desc}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

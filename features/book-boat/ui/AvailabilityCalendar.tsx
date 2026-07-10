"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DateSpan {
  from: Date;
  to: Date;
}

interface Props {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  openRanges: DateSpan[];
  bookedRanges: DateSpan[];
  loading: boolean;
}

function dayKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function isInRange(day: Date, span: DateSpan): boolean {
  const k = dayKey(day);
  return k >= dayKey(span.from) && k <= dayKey(span.to);
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function formatFR(d?: Date): string {
  if (!d) return "";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Calendrier de disponibilité pour le locataire : sélection restreinte aux
 * périodes ouvertes par le propriétaire et non déjà réservées.
 */
export default function AvailabilityCalendar({ value, onChange, openRanges, bookedRanges, loading }: Props) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isSelectable = (day: Date): boolean => {
    if (day < today) return false;
    const inOpenRange = openRanges.some((r) => isInRange(day, r));
    if (!inOpenRange) return false;
    return !bookedRanges.some((r) => isInRange(day, r));
  };

  // Empêche de sélectionner un intervalle qui traverserait un jour réservé/fermé :
  // on referme l'intervalle au dernier jour valide contigu.
  const clampRange = (range: DateRange | undefined): DateRange | undefined => {
    if (!range?.from || !isSelectable(range.from)) return undefined;
    if (!range.to) return range;
    let cursor = new Date(range.from);
    let last = new Date(range.from);
    while (dayKey(cursor) < dayKey(range.to)) {
      cursor = addDays(cursor, 1);
      if (!isSelectable(cursor)) break;
      last = cursor;
    }
    return { from: range.from, to: last };
  };

  const hasAvailability = !loading && openRanges.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="avail-cal-trigger" aria-label="Choisir vos dates de location">
        <i className="fa-regular fa-calendar" />
        <span className={value?.from ? "avail-cal-value" : "avail-cal-placeholder"}>
          {value?.from ? formatFR(value.from) : "Arrivée"} → {value?.to ? formatFR(value.to) : "Départ"}
        </span>
      </PopoverTrigger>
      <PopoverContent className="dispo-popover-content" align="start" side="bottom">
        {loading ? (
          <div className="avail-cal-loading">
            <i className="fa-solid fa-circle-notch fa-spin" /> Chargement du calendrier…
          </div>
        ) : !hasAvailability ? (
          <p className="avail-cal-empty">
            Le propriétaire n&apos;a pas encore ouvert de créneau de location pour ce bateau.
          </p>
        ) : (
          <>
            <div className="cal-legend cal-legend-sm">
              <span><i className="cal-dot cal-dot-open" /> Disponible</span>
              <span><i className="cal-dot cal-dot-booked" /> Réservé</span>
            </div>
            <Calendar
              mode="range"
              selected={value}
              onSelect={(r) => onChange(clampRange(r))}
              numberOfMonths={2}
              disabled={(day) => !isSelectable(day)}
              modifiers={{ booked: bookedRanges }}
              modifiersClassNames={{ booked: "rdp-day-booked" }}
              defaultMonth={value?.from ?? openRanges[0]?.from ?? today}
            />
          </>
        )}
        <div className="dispo-popover-footer">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setOpen(false)}
            disabled={!value?.from || !value?.to}
          >
            <i className="fa-solid fa-check" /> Valider
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { useMediaQuery, breakpoints } from "@/shared/hooks/useMediaQuery";
import { toLocalIsoDate } from "@/shared/lib/utils";

export interface DateSpan {
  from: Date;
  to: Date;
}

interface Props {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  blockedRanges: DateSpan[];
  bookedRanges: DateSpan[];
  loading: boolean;
}

const dayKey = toLocalIsoDate;

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
 * Calendrier de disponibilité pour le locataire : toutes les dates futures sont
 * réservables sauf celles bloquées (statut "bloque" / "indisponible") ou déjà réservées.
 */
export default function AvailabilityCalendar({ value, onChange, blockedRanges, bookedRanges, loading }: Props) {
  const [open, setOpen] = useState(false);
  const isWide = useMediaQuery(breakpoints.md);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* Fermer en cliquant en dehors */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isSelectable = (day: Date): boolean => {
    if (day < today) return false;
    if (blockedRanges.some((r) => isInRange(day, r))) return false;
    return !bookedRanges.some((r) => isInRange(day, r));
  };

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

  const hasSelection = Boolean(value?.from && value?.to);

  return (
    <div className="avail-cal-wrapper" ref={wrapperRef}>
      {/* Trigger */}
      <button
        type="button"
        className="avail-cal-trigger"
        aria-expanded={open}
        aria-label="Choisir vos dates de location"
        onClick={() => setOpen((v) => !v)}
      >
        <i className="fa-regular fa-calendar" />
        <span className={value?.from ? "avail-cal-value" : "avail-cal-placeholder"}>
          {value?.from ? formatFR(value.from) : "Arrivée"} → {value?.to ? formatFR(value.to) : "Départ"}
        </span>
        <i className={`fa-solid fa-chevron-down avail-cal-chevron${open ? " open" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="avail-cal-dropdown">
          {loading ? (
            <div className="avail-cal-loading">
              <i className="fa-solid fa-circle-notch fa-spin" /> Chargement…
            </div>
          ) : (
            <>
              {/* Légende */}
              <div className="avail-cal-legend">
                <span><i className="cal-dot cal-dot-open" /> Disponible</span>
                <span><i className="cal-dot cal-dot-booked" /> Réservé</span>
                <span><i className="cal-dot cal-dot-blocked" /> Bloqué</span>
              </div>

              <Calendar
                  mode="range"
                  locale={fr}
                  
                selected={value}
                onSelect={(r) => onChange(clampRange(r))}
                numberOfMonths={isWide ? 2 : 1}
                disabled={(day) => !isSelectable(day)}
                modifiers={{ booked: bookedRanges, blocked: blockedRanges }}
                modifiersClassNames={{ booked: "rdp-day-booked", blocked: "rdp-day-blocked" }}
                defaultMonth={value?.from ?? today}
              />

              {/* Footer */}
              <div className="avail-cal-footer">
                {hasSelection && (
                  <span className="avail-cal-summary">
                    <i className="fa-regular fa-calendar-check" />
                    {formatFR(value!.from)} → {formatFR(value!.to)}
                  </span>
                )}
                <div className="avail-cal-footer-actions">
                  <button
                    type="button"
                    className="avail-cal-btn-clear"
                    onClick={() => onChange(undefined)}
                    disabled={!value?.from}
                  >
                    Effacer
                  </button>
                  <button
                    type="button"
                    className="avail-cal-btn-confirm"
                    onClick={() => setOpen(false)}
                    disabled={!hasSelection}
                  >
                    <i className="fa-solid fa-check" /> Confirmer les dates
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


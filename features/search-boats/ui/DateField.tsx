"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/shared/i18n";

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fromISO(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

interface DateFieldProps {
  id?: string;
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  placeholder?: string;
  align?: "left" | "right";
}

/** Champ date custom (remplace <input type="date"> natif) : déclencheur +
 *  calendrier popover entièrement stylable au style du site. */
export default function DateField({
  id,
  value,
  onChange,
  min,
  placeholder,
  align = "left",
}: DateFieldProps) {
  const { dict } = useI18n();
  const t = dict.dateField;
  const ph = placeholder ?? t.placeholder;
  const [open, setOpen] = useState(false);
  const selected = fromISO(value);
  const [view, setView] = useState<Date>(() => selected ?? new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) setView(selected ?? new Date());
    setOpen((v) => !v);
  };

  const minDate = min ? fromISO(min) : null;
  const today = startOfDay(new Date());
  const floor = minDate && startOfDay(minDate) > today ? startOfDay(minDate) : today;

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const display = selected
    ? new Intl.DateTimeFormat(t.intlLocale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(selected)
    : "";

  const canPrev =
    new Date(year, month, 1) > new Date(floor.getFullYear(), floor.getMonth(), 1);

  return (
    <div className="sb-date" ref={ref}>
      <button
        type="button"
        id={id}
        className={`sb-date-trigger${display ? "" : " is-empty"}`}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {display || ph}
      </button>

      {open && (
        <div
          className={`sb-popover sb-calendar${align === "right" ? " sb-popover--right" : ""}`}
          role="dialog"
          aria-label={t.dialogAria}
        >
          <div className="sb-popover-hd">
            <button
              type="button"
              className="sb-popover-close"
              onClick={() => setOpen(false)}
              aria-label={t.close}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
          <div className="sb-cal-head">
            <button
              type="button"
              className="sb-cal-nav"
              onClick={() => setView(new Date(year, month - 1, 1))}
              disabled={!canPrev}
              aria-label={t.prevMonth}
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
            <span className="sb-cal-title">
              {t.months[month]} {year}
            </span>
            <button
              type="button"
              className="sb-cal-nav"
              onClick={() => setView(new Date(year, month + 1, 1))}
              aria-label={t.nextMonth}
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          </div>

          <div className="sb-cal-grid sb-cal-weekdays">
            {t.weekdays.map((w, i) => (
              <span key={i} className="sb-cal-wd">
                {w}
              </span>
            ))}
          </div>

          <div className="sb-cal-grid">
            {cells.map((c, i) => {
              if (!c) return <span key={i} className="sb-cal-empty" />;
              const disabled = startOfDay(c) < floor;
              const isSelected = selected != null && toISO(c) === toISO(selected);
              const isToday = toISO(c) === toISO(today);
              return (
                <button
                  key={i}
                  type="button"
                  className={`sb-cal-day${isSelected ? " is-selected" : ""}${
                    isToday && !isSelected ? " is-today" : ""
                  }`}
                  disabled={disabled}
                  onClick={() => {
                    onChange(toISO(c));
                    setOpen(false);
                  }}
                >
                  {c.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

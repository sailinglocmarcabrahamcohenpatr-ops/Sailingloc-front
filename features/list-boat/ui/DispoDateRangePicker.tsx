"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DisponibiliteSlot } from "../model/types";

interface Props {
  slot: DisponibiliteSlot;
  index: number;
  onChange: (i: number, field: keyof DisponibiliteSlot, value: string) => void;
  onRemove: (i: number) => void;
  canRemove: boolean;
}

function toDate(str: string): Date | undefined {
  if (!str) return undefined;
  return new Date(str + "T00:00:00");
}

function toIso(date: Date): string {
  return date.toISOString().split("T")[0];
}

function displayRange(slot: DisponibiliteSlot): string {
  const fmt = (s: string) =>
    s
      ? new Date(s + "T00:00:00").toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "…";

  if (!slot.date_debut) return "Sélectionner une période";
  if (!slot.date_fin) return `À partir du ${fmt(slot.date_debut)}`;
  return `${fmt(slot.date_debut)} → ${fmt(slot.date_fin)}`;
}

export default function DispoDateRangePicker({ slot, index, onChange, onRemove, canRemove }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<DateRange | undefined>({
    from: toDate(slot.date_debut),
    to:   toDate(slot.date_fin),
  });

  // Synchronise le pending quand le popover s'ouvre
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setPending({ from: toDate(slot.date_debut), to: toDate(slot.date_fin) });
    }
    setOpen(next);
  };

  const handleValidate = () => {
    onChange(index, "date_debut", pending?.from ? toIso(pending.from) : "");
    onChange(index, "date_fin",   pending?.to   ? toIso(pending.to)   : "");
    setOpen(false);
  };

  const handleClear = () => {
    setPending(undefined);
    onChange(index, "date_debut", "");
    onChange(index, "date_fin",   "");
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="dispo-slot-row">
      <div className="dispo-slot-trigger-wrap">
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger className="dispo-slot-trigger" aria-label="Sélectionner une période de disponibilité">
            <i className="fa-regular fa-calendar" />
            <span className={slot.date_debut ? "dispo-slot-value" : "dispo-slot-placeholder"}>
              {displayRange(slot)}
            </span>
          </PopoverTrigger>

          <PopoverContent className="dispo-popover-content" align="start" side="bottom">
            <Calendar
              mode="range"
              selected={pending}
              onSelect={setPending}
              disabled={{ before: today }}
              numberOfMonths={2}
              defaultMonth={pending?.from ?? today}
            />
            <div className="dispo-popover-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setOpen(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleValidate}
                disabled={!pending?.from}
              >
                <i className="fa-solid fa-check" /> Valider
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {slot.date_debut && (
          <button
            type="button"
            className="dispo-slot-clear"
            aria-label="Effacer"
            onClick={handleClear}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>

      {canRemove && (
        <button
          type="button"
          className="dispo-slot-remove"
          onClick={() => onRemove(index)}
          aria-label="Supprimer ce créneau"
        >
          <i className="fa-solid fa-trash" />
        </button>
      )}
    </div>
  );
}

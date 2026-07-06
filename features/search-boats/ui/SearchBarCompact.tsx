"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { fr } from "date-fns/locale";
import { MapPin, CalendarRange, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { api } from "@/shared/lib/api-client";
import type { PortAPI } from "@/shared/lib/referentiels-api";
import s from "./SearchBarCompact.module.css";

export default function SearchBarCompact() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [dest,        setDest]        = useState(searchParams.get("destination") ?? "");
  const [range,       setRange]       = useState<DateRange | undefined>(undefined);
  const [skipper,     setSkipper]     = useState<"avec" | "sans" | "">(
    (searchParams.get("skipper") as "avec" | "sans") ?? ""
  );
  const [calOpen,     setCalOpen]     = useState(false);
  const [ports,       setPorts]       = useState<PortAPI[]>([]);
  const [showSug,     setShowSug]     = useState(false);
  const destRef = useRef<HTMLDivElement>(null);

  /* Charge tous les ports une seule fois */
  useEffect(() => {
    api.get<unknown>("/api/ports", false)
      .then((res) => {
        if (Array.isArray(res)) return res as PortAPI[];
        if (res && typeof res === "object") {
          const r = res as Record<string, unknown>;
          if (Array.isArray(r["hydra:member"])) return r["hydra:member"] as PortAPI[];
          if (Array.isArray(r["data"]))         return r["data"]         as PortAPI[];
          if (Array.isArray(r["member"]))       return r["member"]       as PortAPI[];
        }
        return [] as PortAPI[];
      })
      .then(setPorts)
      .catch(() => {});
  }, []);

  /* Ferme sur clic extérieur */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (destRef.current && !destRef.current.contains(e.target as Node))
        setShowSug(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  /* Filtrage local instantané */
  const query = dest.trim().toLowerCase();
  const suggestions = query.length < 2 ? [] : ports.filter((p) =>
    p.nom.toLowerCase().includes(query) ||
    p.ville.toLowerCase().includes(query) ||
    p.pays?.toLowerCase().includes(query)
  ).slice(0, 6);

  const pickSuggestion = (p: PortAPI) => {
    setDest(p.ville);
    setShowSug(false);
    // Met à jour l'URL immédiatement → BoatsSidebar réagit et charge la météo du port
    const params = new URLSearchParams(searchParams.toString());
    params.set("destination", p.ville);
    router.push(`/bateaux?${params.toString()}`);
  };

  const dateLabel = range?.from
    ? range.to
      ? `${format(range.from, "d MMM", { locale: fr })} – ${format(range.to, "d MMM", { locale: fr })}`
      : format(range.from, "d MMM yyyy", { locale: fr })
    : "Sélectionnez vos dates";

  const handleSearch = () => {
    setShowSug(false);
    const params = new URLSearchParams();
    if (dest.trim())   params.set("destination", dest.trim());
    if (skipper)       params.set("skipper", skipper);
    if (range?.from)   params.set("arrivee", format(range.from, "yyyy-MM-dd"));
    if (range?.to)     params.set("depart",  format(range.to,   "yyyy-MM-dd"));
    const qs = params.toString();
    router.push(`/bateaux${qs ? "?" + qs : ""}`);
  };

  return (
    <div className={s.bar}>

      {/* ── DESTINATION ── */}
      <div className={`${s.section} ${s["section--dest"]}`}>
        <span className={s.label}>Destination</span>
        <div className={s.destWrap} ref={destRef}>
          <div className={s.destRow}>
            <MapPin className={s.destIcon} aria-hidden="true" />
            <input
              className={s.destInput}
              placeholder="Où souhaitez-vous naviguer ?"
              value={dest}
              onChange={e => { setDest(e.target.value); setShowSug(true); }}
              onFocus={() => suggestions.length > 0 && setShowSug(true)}
              onKeyDown={e => {
                if (e.key === "Enter")  handleSearch();
                if (e.key === "Escape") setShowSug(false);
              }}
              aria-label="Destination"
              aria-autocomplete="list"
              aria-expanded={showSug}
              autoComplete="off"
            />
            {dest && (
              <button
                type="button"
                aria-label="Effacer"
                className={s.clearBtn}
                onClick={() => { setDest(""); setShowSug(false); }}
              >
                ×
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSug && suggestions.length > 0 && (
            <div className={s.suggestions} role="listbox" aria-label="Ports disponibles">
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  role="option"
                  type="button"
                  className={s.suggestionItem}
                  onMouseDown={e => { e.preventDefault(); pickSuggestion(p); }}
                >
                  <MapPin className={s.suggestionIcon} aria-hidden="true" />
                  <span className={s.suggestionText}>
                    <span className={s.suggestionName}>{p.nom}</span>
                    <span className={s.suggestionSub}>
                      {[p.ville, p.pays].filter(Boolean).join(", ")}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={s.sep} />

      {/* ── DURÉE ── */}
      <div className={s.section}>
        <span className={s.label}>Durée</span>
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger
            className={`${s.dateTrigger}${range?.from ? ` ${s["dateTrigger--active"]}` : ""}`}
            aria-label="Sélectionner les dates"
          >
            <CalendarRange className={s.dateIcon} aria-hidden="true" />
            {dateLabel}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              disabled={{ before: new Date() }}
              locale={fr}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "10px 12px", borderTop: "1px solid #f1f5f9" }}>
              <Button variant="ghost" size="sm" onClick={() => { setRange(undefined); setCalOpen(false); }}>
                Réinitialiser
              </Button>
              <Button size="sm" onClick={() => setCalOpen(false)}>
                Confirmer
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className={s.sep} />

      {/* ── SKIPPER ── */}
      <div className={s.section}>
        <span className={s.label}>Skipper</span>
        <div className={s.toggleGroup}>
          <button
            type="button"
            onClick={() => setSkipper(skipper === "avec" ? "" : "avec")}
            className={`${s.toggleBtn}${skipper === "avec" ? ` ${s["toggleBtn--active"]}` : ""}`}
          >
            Avec
          </button>
          <button
            type="button"
            onClick={() => setSkipper(skipper === "sans" ? "" : "sans")}
            className={`${s.toggleBtn}${skipper === "sans" ? ` ${s["toggleBtn--active"]}` : ""}`}
          >
            Sans
          </button>
        </div>
      </div>

      {/* ── RECHERCHER ── */}
      <div className={s.submitWrap}>
        <button type="button" className={s.submitBtn} onClick={handleSearch}>
          <Search className={s.submitIcon} aria-hidden="true" />
          Rechercher
        </button>
      </div>

    </div>
  );
}

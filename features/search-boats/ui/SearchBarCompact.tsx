"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { api } from "@/shared/lib/api-client";
import type { PortAPI } from "@/shared/lib/referentiels-api";
import DateField from "./DateField";
import s from "./SearchBarCompact.module.css";

export default function SearchBarCompact() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [dest,      setDest]      = useState(searchParams.get("destination") ?? "");
  const [arrival,   setArrival]   = useState(searchParams.get("arrivee") ?? "");
  const [departure, setDeparture] = useState(searchParams.get("depart")  ?? "");
  const [ports,     setPorts]     = useState<PortAPI[]>([]);
  const [showSug,   setShowSug]   = useState(false);
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

  /* Filtre les cards en direct pendant la frappe */
  useEffect(() => {
    const current = searchParams.get("destination") ?? "";
    const next = dest.trim();
    if (next === current) return;

    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("destination", next);
      else params.delete("destination");
      router.replace(`/bateaux?${params.toString()}`, { scroll: false });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 350);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dest]);

  const query = dest.trim().toLowerCase();
  const suggestions = (
    query.length < 2
      ? ports
      : ports.filter((p) =>
          p.nom.toLowerCase().includes(query) ||
          p.ville.toLowerCase().includes(query) ||
          p.pays?.toLowerCase().includes(query)
        )
  ).slice(0, 8);

  const pickSuggestion = (p: PortAPI) => {
    setDest(p.ville);
    setShowSug(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("destination", p.ville);
    router.push(`/bateaux?${params.toString()}`);
  };

  const handleSearch = () => {
    setShowSug(false);
    const params = new URLSearchParams(searchParams.toString());
    if (dest.trim()) params.set("destination", dest.trim());
    else params.delete("destination");
    if (arrival)    params.set("arrivee", arrival);
    else            params.delete("arrivee");
    if (departure)  params.set("depart",  departure);
    else            params.delete("depart");
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
              onFocus={() => ports.length > 0 && setShowSug(true)}
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

      {/* ── ARRIVÉE ── */}
      <div className={s.section}>
        <span className={s.label}>Arrivée</span>
        <DateField
          id="cbc-arrival"
          value={arrival}
          onChange={setArrival}
          placeholder="Choisir"
        />
      </div>

      <div className={s.sep} />

      {/* ── DÉPART ── */}
      <div className={s.section}>
        <span className={s.label}>Départ</span>
        <DateField
          id="cbc-departure"
          value={departure}
          onChange={setDeparture}
          min={arrival}
          placeholder="Choisir"
          align="right"
        />
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

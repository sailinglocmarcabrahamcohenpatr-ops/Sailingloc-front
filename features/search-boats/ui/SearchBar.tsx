"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { fr } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { BoatTypeIcon } from "@/entities/boat";
import type { BoatType } from "@/entities/boat";
import { portsApi, referentielsApi } from "@/shared/lib/referentiels-api";
import type { PortAPI, TypeBateauAPI } from "@/shared/lib/referentiels-api";
import { normalizeText } from "@/shared/lib/destination-match";
import SearchSelect from "./SearchSelect";
import "./search-bar.css";

/** Dérive un slug URL (?type=) directement du libellé backend, sans dépendre
 *  d'une liste figée : normalizeText(label) reste substring de lui-même, donc
 *  le filtre catalogue (boatMatchesType) matche toujours ce qu'on envoie ici. */
function slugifyType(label: string): string {
  return normalizeText(label).trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function SearchBar() {
  const router = useRouter();
  const [dest, setDest] = useState("");
  const [boatType, setBoatType] = useState("tous");
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);
  const [ports, setPorts] = useState<PortAPI[]>([]);
  const [types, setTypes] = useState<TypeBateauAPI[]>([]);
  const [showSug, setShowSug] = useState(false);
  const destRef = useRef<HTMLDivElement>(null);

  /* Ports et types de bateaux chargés une seule fois depuis l'API (référentiels publics). */
  useEffect(() => {
    portsApi.getAll().then(setPorts).catch(() => {});
    referentielsApi.getTypesBateaux().then(setTypes).catch(() => {});
  }, []);

  /* Ferme les suggestions destination sur clic extérieur */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (destRef.current && !destRef.current.contains(e.target as Node)) setShowSug(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const boatTypeOptions = [
    { value: "tous", label: "Tous types" },
    ...types.map((t) => ({ value: slugifyType(t.labelTypeBateau), label: t.labelTypeBateau })),
  ];

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
  };

  const dateLabel = range?.from
    ? range.to
      ? `${format(range.from, "d MMM", { locale: fr })} – ${format(range.to, "d MMM", { locale: fr })}`
      : format(range.from, "d MMM yyyy", { locale: fr })
    : "Sélectionnez vos dates";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSug(false);
    const params = new URLSearchParams();
    if (dest.trim()) params.set("destination", dest.trim());
    if (boatType !== "tous") params.set("type", boatType);
    if (range?.from) params.set("arrivee", format(range.from, "yyyy-MM-dd"));
    if (range?.to) params.set("depart", format(range.to, "yyyy-MM-dd"));
    router.push(`/bateaux${params.toString() ? "?" + params.toString() : ""}`);
  };

  return (
    <form className="search-card" onSubmit={handleSubmit} role="search" aria-label="Rechercher un bateau">
      <div className="search-fields">
        <div className="search-field" ref={destRef}>
          <label htmlFor="sb-dest">
            <i className="fa-solid fa-location-dot" aria-hidden="true" /> Destination
          </label>
          <input
            type="text"
            id="sb-dest"
            placeholder="Marseille, Cannes, Corse..."
            value={dest}
            onChange={(e) => { setDest(e.target.value); setShowSug(true); }}
            onFocus={() => ports.length > 0 && setShowSug(true)}
            onKeyDown={(e) => { if (e.key === "Escape") setShowSug(false); }}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showSug}
          />

          {showSug && suggestions.length > 0 && (
            <div className="sb-suggestions" role="listbox" aria-label="Ports disponibles">
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={p.ville === dest}
                  className="sb-suggestion-item"
                  onMouseDown={(e) => { e.preventDefault(); pickSuggestion(p); }}
                >
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  <span className="sb-suggestion-text">
                    <span className="sb-suggestion-name">{p.nom}</span>
                    <span className="sb-suggestion-sub">{[p.ville, p.pays].filter(Boolean).join(", ")}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="search-field">
          <label htmlFor="sb-type">
            <i className="fa-solid fa-sailboat" aria-hidden="true" /> Type de bateau
          </label>
          <SearchSelect
            id="sb-type"
            value={boatType}
            options={boatTypeOptions}
            onChange={setBoatType}
            renderIcon={(v) =>
              v === "tous" ? (
                <i className="fa-solid fa-ship" aria-hidden="true" />
              ) : (
                <BoatTypeIcon type={v as BoatType} />
              )
            }
          />
        </div>

        <div className="search-field">
          <label htmlFor="sb-duree">
            <i className="fa-regular fa-calendar" aria-hidden="true" /> Durée
          </label>
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger
              id="sb-duree"
              type="button"
              className={`sb-duree-trigger${range?.from ? " is-active" : ""}`}
              aria-label="Sélectionner les dates"
            >
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
                <Button type="button" variant="ghost" size="sm" onClick={() => { setRange(undefined); setCalOpen(false); }}>
                  Réinitialiser
                </Button>
                <Button type="button" size="sm" onClick={() => setCalOpen(false)}>
                  Confirmer
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="search-btn-wrap">
          <button type="submit" className="btn btn-primary search-btn">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <span>Rechercher</span>
          </button>
        </div>
      </div>
    </form>
  );
}

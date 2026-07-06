"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BOAT_TYPES } from "@/shared/config";
import type { BoatType } from "@/shared/types";
import { PRICE_OPTIONS, CAPACITY_OPTIONS, RATING_OPTIONS } from "../model/constants";

const TYPE_CHOICES = BOAT_TYPES.filter((t) => t.value !== "tous");

export default function FiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const activeTypes = new Set(
    (searchParams.get("type") ?? "").split(",").filter(Boolean)
  );
  const priceMax = searchParams.get("prixMax") ?? "";
  const capacityMin = searchParams.get("capacite") ?? "";
  const ratingMin = searchParams.get("note") ?? "";

  const activeCount =
    activeTypes.size + (priceMax ? 1 : 0) + (capacityMin ? 1 : 0) + (ratingMin ? 1 : 0);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    router.push(`/bateaux${qs ? "?" + qs : ""}`);
  };

  const toggleType = (value: BoatType) => {
    const next = new Set(activeTypes);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    updateParams({ type: next.size > 0 ? Array.from(next).join(",") : null });
  };

  const clearAll = () => {
    updateParams({ type: null, prixMax: null, capacite: null, note: null });
  };

  return (
    <div className="filters-bar">
      <div className="filters-bar-inner" ref={wrapperRef}>
        <button
          type="button"
          className="filter-btn-icon primary-filter"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <i className="fa-solid fa-sliders" aria-hidden="true" /> Filtres
          {activeCount > 0 && <span className="filter-count-badge">{activeCount}</span>}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            className="clear-filters"
            onClick={clearAll}
            aria-label="Effacer tous les filtres"
          >
            Tout effacer
          </button>
        )}

        {open && (
          <div className="filter-panel" role="dialog" aria-label="Filtres avancés">
            <div className="filter-panel-section">
              <span className="filter-panel-label">Type de bateau</span>
              <div className="filter-panel-chips">
                {TYPE_CHOICES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`chip${activeTypes.has(t.value) ? " active" : ""}`}
                    aria-pressed={activeTypes.has(t.value)}
                    onClick={() => toggleType(t.value)}
                  >
                    <i className={`fa-solid ${t.icon}`} aria-hidden="true" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-panel-row">
              <div className="filter-panel-section">
                <label className="filter-panel-label" htmlFor="filter-price">
                  Budget
                </label>
                <select
                  id="filter-price"
                  value={priceMax}
                  onChange={(e) => updateParams({ prixMax: e.target.value || null })}
                >
                  {PRICE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-panel-section">
                <label className="filter-panel-label" htmlFor="filter-capacity">
                  Capacité
                </label>
                <select
                  id="filter-capacity"
                  value={capacityMin}
                  onChange={(e) => updateParams({ capacite: e.target.value || null })}
                >
                  {CAPACITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-panel-section">
                <label className="filter-panel-label" htmlFor="filter-rating">
                  Note
                </label>
                <select
                  id="filter-rating"
                  value={ratingMin}
                  onChange={(e) => updateParams({ note: e.target.value || null })}
                >
                  {RATING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-panel-footer">
              <button type="button" className="clear-filters" onClick={clearAll}>
                Réinitialiser
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setOpen(false)}
              >
                Voir les résultats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

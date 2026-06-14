"use client";

import { useState } from "react";
import { FILTERS } from "../model/constants";

export default function FiltersBar() {
  const [active, setActive] = useState<Set<string>>(new Set(["Voiliers"]));

  const toggle = (label: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  return (
    <div className="filters-bar">
      <div className="filters-bar-inner chip-group">
        <button className="filter-btn-icon primary-filter">
          <i className="fa-solid fa-sliders" aria-hidden="true" /> Filtres
        </button>
        {FILTERS.map((f) => (
          <button
            key={f.label}
            className={`chip${active.has(f.label) ? " active" : ""}`}
            onClick={() => toggle(f.label)}
            aria-pressed={active.has(f.label)}
          >
            {f.icon && (
              <i className={`fa-solid ${f.icon}`} aria-hidden="true" />
            )}
            {f.label}
          </button>
        ))}
        <button
          className="clear-filters"
          onClick={() => setActive(new Set())}
          aria-label="Effacer tous les filtres"
        >
          Tout effacer
        </button>
      </div>
    </div>
  );
}

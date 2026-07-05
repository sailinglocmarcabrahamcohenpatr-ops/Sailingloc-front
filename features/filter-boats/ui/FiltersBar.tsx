"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { referentielsApi } from "@/shared/lib";
import type { TypeBateauAPI } from "@/shared/lib";
import { FEATURE_FILTERS } from "../model/constants";
import type { FilterItem } from "@/shared/types";

function slugify(s: string): string {
  return s?.toLowerCase().replace(/\s+/g, "-");
}

export default function FiltersBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [boatTypes, setBoatTypes] = useState<TypeBateauAPI[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    referentielsApi.getTypesBateaux().then(setBoatTypes).catch(() => {});
  }, []);

  // Close modal on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const currentType = searchParams.get("type");

  const push = useCallback((updater: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    const qs = params.toString();
    router.push(`${pathname}${qs ? "?" + qs : ""}`);
  }, [searchParams, router, pathname]);

  const toggleType = (libelle: string) => {
    const slug = slugify(libelle);
    push(p => { if (p.get("type") === slug) p.delete("type"); else p.set("type", slug); });
  };

  const toggleFeature = (filter: FilterItem) => {
    if (!filter.urlParam || !filter.urlValue) return;
    push(p => {
      if (p.get(filter.urlParam!) === filter.urlValue) p.delete(filter.urlParam!);
      else p.set(filter.urlParam!, filter.urlValue!);
    });
  };

  const clearAll = () => {
    push(p => {
      p.delete("type");
      FEATURE_FILTERS.forEach(f => { if (f.urlParam) p.delete(f.urlParam); });
    });
  };

  // Build active filters list for the chips row
  const activeFilters: { key: string; label: string; onRemove: () => void }[] = [];
  if (currentType) {
    const label = boatTypes.find(t => slugify(t.labelTypeBateau) === currentType)?.labelTypeBateau ?? currentType;
    activeFilters.push({ key: "type", label, onRemove: () => push(p => p.delete("type")) });
  }
  FEATURE_FILTERS.forEach(f => {
    if (f.urlParam && f.urlValue && searchParams.get(f.urlParam) === f.urlValue) {
      activeFilters.push({ key: f.label, label: f.label, onRemove: () => push(p => p.delete(f.urlParam!)) });
    }
  });

  const totalActive = activeFilters.length;

  return (
    <>
      {/*Button only (chips are rendered by ActiveFiltersBar in page) */}
      <div className="filters-bar">
        <div className="filters-bar-inner">
          <button
            className={`filter-open-btn${totalActive > 0 ? " has-active" : ""}`}
            type="button"
            onClick={() => setModalOpen(true)}
            aria-haspopup="dialog"
          >
            <i className="fa-solid fa-sliders" aria-hidden="true" />
            Filtres
            {totalActive > 0 && <span className="filter-badge">{totalActive}</span>}
          </button>
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="filters-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Filtres de recherche"
          onClick={() => setModalOpen(false)}
        >
          <div className="filters-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="filters-modal-header">
              <h2 className="filters-modal-title">
                <i className="fa-solid fa-sliders" aria-hidden="true" />
                Filtres
              </h2>
              <button
                className="filters-modal-close"
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Fermer"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div className="filters-modal-body">

              <section className="filters-section">
                <h3 className="filters-section-title">
                  <i className="fa-solid fa-sailboat" aria-hidden="true" />
                  Type de bateau
                </h3>
                <div className="filters-chips-grid">
                  {boatTypes.map(t => {
                    const active = currentType === slugify(t.labelTypeBateau);
                    return (
                      <button
                        key={t.id}
                        className={`filter-chip-lg${active ? " active" : ""}`}
                        onClick={() => toggleType(t.labelTypeBateau)}
                        aria-pressed={active}
                        type="button"
                      >
                        {active && <i className="fa-solid fa-check" aria-hidden="true" />}
                        {t.labelTypeBateau}
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="filters-divider" />

              <section className="filters-section">
                <h3 className="filters-section-title">
                  <i className="fa-solid fa-sliders" aria-hidden="true" />
                  Options
                </h3>
                <div className="filters-options-list">
                  {FEATURE_FILTERS.map(f => {
                    const active = !!(f.urlParam && f.urlValue && searchParams.get(f.urlParam) === f.urlValue);
                    return (
                      <label key={f.label} className={`filters-option-row${active ? " active" : ""}`}>
                        <div className="filters-option-label">
                          {f.icon && <i className={`fa-solid ${f.icon}`} aria-hidden="true" />}
                          {f.label}
                        </div>
                        <button
                          className={`filters-toggle${active ? " on" : ""}`}
                          role="switch"
                          aria-checked={active}
                          type="button"
                          onClick={() => toggleFeature(f)}
                        >
                          <span className="filters-toggle-knob" />
                        </button>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="filters-modal-footer">
              <button className="btn btn-ghost" type="button" onClick={clearAll}>
                Réinitialiser
              </button>
              <button className="btn btn-primary" type="button" onClick={() => setModalOpen(false)}>
                Voir les résultats
                {totalActive > 0 && (
                  <span className="filter-badge filter-badge-white">{totalActive}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

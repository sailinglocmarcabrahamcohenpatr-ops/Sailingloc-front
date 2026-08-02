"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n, localizeHref } from "@/shared/i18n";

type ViewMode = "grid" | "list" | "map";

const SORT_VALUES = ["", "prix-asc", "prix-desc", "note-desc", "nouveautes"] as const;
type SortValue = (typeof SORT_VALUES)[number];

function sortLabel(value: SortValue, t: ReturnType<typeof useI18n>["dict"]["catalog"]): string {
  switch (value) {
    case "prix-asc":   return t.sortPriceAsc;
    case "prix-desc":  return t.sortPriceDesc;
    case "note-desc":  return t.sortRating;
    case "nouveautes": return t.sortNewest;
    default:           return t.sortRelevance;
  }
}

function SortDropdown({ value, onChange }: { value: SortValue; onChange: (v: SortValue) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { dict } = useI18n();
  const t = dict.catalog;

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

  return (
    <div className="sort-wrap" ref={ref}>
      <button
        type="button"
        className={`sort-trigger${open ? " is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="sort-prefix">{t.sortBy}&nbsp;</span><strong>{sortLabel(value, t)}</strong>
        <i className="fa-solid fa-chevron-down sort-trigger-caret" aria-hidden="true" />
      </button>

      {open && (
        <div className="sort-popover" role="listbox">
          <div className="sort-popover-hd">
            <button
              type="button"
              className="sort-popover-close"
              onClick={() => setOpen(false)}
              aria-label={dict.common.close}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {SORT_VALUES.map((v) => (
              <li key={v} role="option" aria-selected={v === value}>
                <button
                  type="button"
                  className={`sort-option${v === value ? " is-selected" : ""}`}
                  onClick={() => { onChange(v); setOpen(false); }}
                >
                  {sortLabel(v, t)}
                  {v === value && (
                    <i className="fa-solid fa-check sort-option-check" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface ResultsControlsProps {
  count: number;
  dates?: string;
  subtitle?: string;
}

export default function ResultsControls({ count, dates, subtitle }: ResultsControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, dict } = useI18n();
  const t = dict.catalog;
  const rawVue = searchParams.get("vue");
  const view: ViewMode = rawVue === "carte" ? "map" : rawVue === "liste" ? "list" : "grid";
  const tri = (searchParams.get("tri") ?? "") as SortValue;

  const setView = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "list") params.set("vue", "liste");
    else if (next === "map") params.set("vue", "carte");
    else params.delete("vue");
    router.replace(localizeHref(`/bateaux?${params.toString()}`, locale), { scroll: false });
  };

  const setSort = (value: SortValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("tri", value);
    else params.delete("tri");
    router.replace(localizeHref(`/bateaux?${params.toString()}`, locale), { scroll: false });
  };

  const boatWord = count !== 1 ? t.countBoats : t.countBoat;
  const availWord = count !== 1 ? t.availablePlural : t.availableSingular;

  return (
    <div className="results-header">
      <div>
        <div className="results-count">
          <strong>{count} {boatWord} {availWord}</strong>
          {subtitle && <span> — {subtitle}</span>}
          {dates && <span> · {dates}</span>}
        </div>
      </div>
      <div className="results-controls">
        <button
          type="button"
          className={`btn btn-sm ${view === "map" ? "btn-primary" : "btn-outline"}`}
          aria-pressed={view === "map"}
          onClick={() => setView(view === "map" ? "grid" : "map")}
        >
          <i className="fa-solid fa-map" aria-hidden="true" /> {t.map}
        </button>
        <div className="view-toggle" role="group" aria-label={t.viewModeAria}>
          <button
            className={`view-btn${view === "grid" ? " active" : ""}`}
            title={t.grid}
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <i className="fa-solid fa-grip" aria-hidden="true" />
          </button>
          <button
            className={`view-btn${view === "list" ? " active" : ""}`}
            title={t.list}
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <i className="fa-solid fa-list" aria-hidden="true" />
          </button>
        </div>
        <SortDropdown value={tri} onChange={setSort} />
      </div>
    </div>
  );
}

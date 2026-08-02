"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ViewMode = "grid" | "list" | "map";

const SORT_OPTIONS = [
  { value: "",            label: "Pertinence"      },
  { value: "prix-asc",   label: "Prix croissant"   },
  { value: "prix-desc",  label: "Prix décroissant" },
  { value: "note-desc",  label: "Mieux notés"      },
  { value: "nouveautes", label: "Nouveautés"       },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function SortDropdown({ value, onChange }: { value: SortValue; onChange: (v: SortValue) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

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
        <span className="sort-prefix">Trier par :&nbsp;</span><strong>{current.label}</strong>
        <i className="fa-solid fa-chevron-down sort-trigger-caret" aria-hidden="true" />
      </button>

      {open && (
        <div className="sort-popover" role="listbox">
          <div className="sort-popover-hd">
            <button
              type="button"
              className="sort-popover-close"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {SORT_OPTIONS.map((o) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  className={`sort-option${o.value === value ? " is-selected" : ""}`}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                >
                  {o.label}
                  {o.value === value && (
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
  const rawVue = searchParams.get("vue");
  const view: ViewMode = rawVue === "carte" ? "map" : rawVue === "liste" ? "list" : "grid";
  const tri = (searchParams.get("tri") ?? "") as SortValue;

  const setView = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "list") params.set("vue", "liste");
    else if (next === "map") params.set("vue", "carte");
    else params.delete("vue");
    router.replace(`/bateaux?${params.toString()}`, { scroll: false });
  };

  const setSort = (value: SortValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("tri", value);
    else params.delete("tri");
    router.replace(`/bateaux?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="results-header">
      <div>
        <div className="results-count">
          <strong>{count} bateau{count !== 1 ? "x" : ""} disponible{count !== 1 ? "s" : ""}</strong>
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
          <i className="fa-solid fa-map" aria-hidden="true" /> Carte
        </button>
        <div className="view-toggle" role="group" aria-label="Mode d'affichage">
          <button
            className={`view-btn${view === "grid" ? " active" : ""}`}
            title="Grille"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <i className="fa-solid fa-grip" aria-hidden="true" />
          </button>
          <button
            className={`view-btn${view === "list" ? " active" : ""}`}
            title="Liste"
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

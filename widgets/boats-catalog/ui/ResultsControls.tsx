"use client";

import { useRouter, useSearchParams } from "next/navigation";

type ViewMode = "grid" | "list" | "map";

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

  const setView = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "list") params.set("vue", "liste");
    else if (next === "map") params.set("vue", "carte");
    else params.delete("vue");
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
        <select className="sort-select" aria-label="Trier les résultats">
          <option>Trier par : Pertinence</option>
          <option>Prix croissant</option>
          <option>Prix décroissant</option>
          <option>Mieux notés</option>
          <option>Nouveautés</option>
        </select>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { FavoriteBoatCard } from "@/features/toggle-favorite";
import { BoatsSidebar, ResultsControls } from "@/widgets/boats-catalog";
import { ALL_BOATS } from "@/entities/boat";
import type { BoatType } from "@/shared/types";

export const metadata: Metadata = {
  title: "Bateaux disponibles",
  description:
    "Parcourez des centaines de voiliers, catamarans et bateaux à moteur disponibles à la location en France et en Europe.",
};

interface PageProps {
  searchParams: Promise<{
    type?: string;
    destination?: string;
    arrivee?: string;
    depart?: string;
  }>;
}

const TYPE_LABELS: Record<string, string> = {
  voilier: "Voiliers",
  catamaran: "Catamarans",
  moteur: "Bateaux à moteur",
  habitable: "Habitables",
  "semi-rigide": "Semi-rigides",
  "sans-permis": "Sans permis",
  ponton: "Pontons",
};

const PAGINATION_PAGES = [1, 2, 3, 4, 5, 14];

export default async function BoatsPage({ searchParams }: PageProps) {
  const { type, destination } = await searchParams;

  const boats = ALL_BOATS.filter((boat) => {
    if (type && type !== "tous" && boat.type !== (type as BoatType)) return false;
    if (destination && !boat.location.toLowerCase().includes(destination.toLowerCase())) return false;
    return true;
  });

  const subtitle = [
    type && type !== "tous" ? (TYPE_LABELS[type] ?? type) : null,
    destination ? `à ${destination}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="container">
      <div className="results-layout">
        <div>
          <ResultsControls
            count={boats.length}
            dates="10 / 15 juill."
            subtitle={subtitle || undefined}
          />
          <div className="boats-result-grid">
            {boats.length > 0 ? (
              boats.map((boat) => (
                <FavoriteBoatCard key={boat.id} boat={boat} showMeta />
              ))
            ) : (
              <p style={{ color: "var(--text-2)", gridColumn: "1 / -1", padding: "48px 0" }}>
                Aucun bateau ne correspond à votre recherche.
              </p>
            )}
          </div>

          {!type && !destination && (
            <nav className="pagination" aria-label="Pagination">
              <button className="page-btn arrow" disabled aria-label="Page précédente">
                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              </button>
              {PAGINATION_PAGES.map((p, i) => (
                <span key={p}>
                  {i === PAGINATION_PAGES.length - 1 && (
                    <span className="page-dots" aria-hidden="true">…</span>
                  )}
                  <button
                    className={`page-btn${p === 1 ? " active" : ""}`}
                    aria-label={`Page ${p}`}
                    aria-current={p === 1 ? "page" : undefined}
                  >
                    {p}
                  </button>
                </span>
              ))}
              <button className="page-btn arrow" aria-label="Page suivante">
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>

        <BoatsSidebar />
      </div>
    </div>
  );
}

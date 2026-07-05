import { Suspense } from "react";
import { searchBoats } from "@/entities/boat";
import { BoatCard } from "@/entities/boat";
import { BoatsSidebar, ResultsControls } from "@/widgets/boats-catalog";
import type { BoatType } from "@/shared/types";

const TYPE_LABELS: Record<string, string> = {
  voilier: "Voiliers",
  catamaran: "Catamarans",
  moteur: "Bateaux à moteur",
  habitable: "Habitables",
  "semi-rigide": "Semi-rigides",
  "sans-permis": "Sans permis",
  ponton: "Pontons",
};

interface PageProps {
  searchParams: Promise<{
    type?: string;
    destination?: string;
    prixMax?: string;
    capacite?: string;
    note?: string;
  }>;
}

export default async function BoatsPage({ searchParams }: PageProps) {
  const { type, destination, prixMax, capacite, note } = await searchParams;

  const types = (type?.split(",").filter((t) => t && t !== "tous") ?? []) as BoatType[];

  const boats = await searchBoats({
    types: types.length > 0 ? types : undefined,
    destination,
    maxPrice: prixMax ? Number(prixMax) : undefined,
    minCapacity: capacite ? Number(capacite) : undefined,
    minRating: note ? Number(note) : undefined,
  });

  const subtitle = [
    types.length > 0 ? types.map((t) => TYPE_LABELS[t] ?? t).join(", ") : null,
    destination ? `à ${destination}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="container">
      <div className="results-layout">
        <div>
          <Suspense>
            <ResultsControls count={boats.length} subtitle={subtitle || undefined} />
          </Suspense>

          {boats.length === 0 ? (
            <p style={{ color: "var(--text-2)", padding: "48px 0" }}>
              Aucun bateau ne correspond à votre recherche.
            </p>
          ) : (
            <div className="boats-result-grid">
              {boats.map((boat) => (
                <BoatCard key={boat.id} boat={boat} showMeta />
              ))}
            </div>
          )}
        </div>

        <BoatsSidebar boats={boats} />
      </div>
    </div>
  );
}

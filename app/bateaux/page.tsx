import { Suspense } from "react";
import { searchBoats } from "@/entities/boat";
import { BoatCard } from "@/entities/boat";
import { BoatsSidebar, ResultsControls } from "@/widgets/boats-catalog";
import { boatsApi, type BoatAPI } from "@/shared/lib/boats-api";
import type { Boat, BoatType } from "@/entities/boat/model/types";

function adaptBoat(b: BoatAPI): Boat {
  return {
    id:           String(b.id),
    name:         b.nom_bateau,
    location:     b.port ? `${b.port.ville}` : "France",
    type:         (b.type_bateau?.libelle?.toLowerCase() ?? "voilier") as BoatType,
    rating:       4.5,
    reviewCount:  0,
    pricePerDay:  b.prix_jour,
    imageUrl:     b.photos?.find((p) => p.principale)?.url ?? "",
    imageSeed:    String(b.id),
    capacity:     b.capacite,
    owner:        { name: "Propriétaire", avatarSeed: String(b.id_utilisateur) },
  };
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

interface PageProps {
  searchParams: Promise<{
    type?: string;
    destination?: string;
    prixMax?: string;
    capacite?: string;
    note?: string;
    skipper?: string;
    arrivee?: string;
    depart?: string;
  }>;
}

export default async function BoatsPage({ searchParams }: PageProps) {
  const { type, destination, prixMax, capacite, note, skipper, arrivee, depart } = await searchParams;

  const types = (type?.split(",").filter((t) => t && t !== "tous") ?? []) as BoatType[];

  let boats: Boat[];

  try {
    const apiParams: Record<string, string> = {};
    if (destination)  apiParams.destination   = destination;
    if (type)         apiParams.type          = type;
    if (prixMax)      apiParams.prix_max       = prixMax;
    if (capacite)     apiParams.capacite       = capacite;
    if (skipper)      apiParams.avec_skipper   = skipper === "avec" ? "true" : "false";
    if (arrivee)      apiParams.date_debut     = arrivee;
    if (depart)       apiParams.date_fin       = depart;

    const raw = await boatsApi.getAll(Object.keys(apiParams).length ? apiParams : undefined);
    boats = raw.map(adaptBoat);
  } catch {
    boats = await searchBoats({
      types: types.length > 0 ? types : undefined,
      destination,
      maxPrice:    prixMax  ? Number(prixMax)  : undefined,
      minCapacity: capacite ? Number(capacite) : undefined,
      minRating:   note     ? Number(note)     : undefined,
    });
  }

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

        <BoatsSidebar />
      </div>
    </div>
  );
}

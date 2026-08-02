import { Suspense } from "react";
import { searchBoats, adaptBoatFromApi } from "@/entities/boat";
import { getDestinations } from "@/entities/destination";
import { BoatsSidebar, ResultsControls, BoatsMapCard } from "@/widgets/boats-catalog";
import { boatsApi } from "@/shared/lib/boats-api";
import { boatMatchesFreeQuery, locationMatchesDestination, normalizeText } from "@/shared/lib/destination-match";
import { FavoriteBoatCard } from "@/features/toggle-favorite";
import type { Boat, BoatType } from "@/entities/boat/model/types";

const adaptBoat = adaptBoatFromApi;

/** Le backend `/api/bateaux` ignore silencieusement type/avec_skipper/prix_max/capacite/note en
 *  query string (vérifié en direct sur l'API) : on doit donc les réappliquer nous-mêmes, comme
 *  c'est déjà fait pour `destination` ci-dessous. */
function boatMatchesType(labelTypeBateau: string | undefined, slug: string): boolean {
  const label = normalizeText(labelTypeBateau ?? "").replace(/[^a-z0-9]+/g, " ");
  const needle = slug.replace(/-/g, " ");
  return label.includes(needle);
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
    vue?: string;
    tri?: string;
  }>;
}

export default async function BoatsPage({ searchParams }: PageProps) {
  const { type, destination, prixMax, capacite, note, skipper, arrivee, depart, vue, tri } = await searchParams;

  const types = (type?.split(",").filter((t) => t && t !== "tous") ?? []) as BoatType[];

  let boats: Boat[];

  try {
    // Le catalogue public ne doit montrer que les annonces réellement publiées —
    // un bateau en attente de validation, suspendu, refusé ou en maintenance ne
    // doit pas être visible ni réservable par un locataire.
    const apiParams: Record<string, string> = { statut: "disponible" };
    if (destination)  apiParams.destination   = destination;
    if (type)         apiParams.type          = type;
    if (prixMax)      apiParams.prix_max       = prixMax;
    if (capacite)     apiParams.capacite       = capacite;
    if (skipper)      apiParams.avec_skipper   = skipper === "avec" ? "true" : "false";
    if (arrivee)      apiParams.date_debut     = arrivee;
    if (depart)       apiParams.date_fin       = depart;

    const raw = await boatsApi.getAll(Object.keys(apiParams).length ? apiParams : undefined);

    // Un bateau que le propriétaire a bloqué pour maintenance sur la période
    // actuelle ne doit pas non plus apparaître dans le catalogue tant que ce
    // blocage est actif, même si son statut global reste "disponible".
    const todayKey = new Date().toISOString().split("T")[0];
    let filtered = raw.filter((b) => {
      const dispos = b.disponibilites ?? [];
      return !dispos.some((d) => {
        if (d.statut !== "bloque") return false;
        const debut = d.dateDebut.split("T")[0];
        const fin = (d.dateFin ?? d.dateDebut).split("T")[0];
        return todayKey >= debut && todayKey <= fin;
      });
    });
    if (types.length > 0) {
      filtered = filtered.filter((b) => types.some((t) => boatMatchesType(b.typeBateau?.labelTypeBateau, t)));
    }
    if (skipper) {
      const wantSkipper = skipper === "avec";
      filtered = filtered.filter((b) => b.avecSkipper === wantSkipper);
    }
    if (prixMax) {
      const max = Number(prixMax);
      filtered = filtered.filter((b) => {
        const price = typeof b.prixJour === "string" ? parseFloat(b.prixJour) : b.prixJour;
        return typeof price === "number" && Number.isFinite(price) && price <= max;
      });
    }
    if (capacite) {
      const min = Number(capacite);
      filtered = filtered.filter((b) => (b.capacite ?? 0) >= min);
    }
    if (note) {
      const min = Number(note);
      filtered = filtered.filter((b) => (b.noteMoyenne ?? 0) >= min);
    }
    if (destination) {
      // Le backend ne filtre pas toujours fiablement par destination : on revérifie ici
      // via le port réel embarqué dans chaque bateau (pays pour l'étranger, ville pour les
      // régions FR). Pas d'appel à /api/ports : cet endpoint exige une auth que les visiteurs
      // anonymes n'ont pas.
      const destinations = await getDestinations();
      filtered = filtered.filter((b) => boatMatchesFreeQuery(b.port, destination, destinations));
    }

    boats = filtered.map(adaptBoat);
  } catch {
    const base = await searchBoats({
      types: types.length > 0 ? types : undefined,
      maxPrice:    prixMax  ? Number(prixMax)  : undefined,
      minCapacity: capacite ? Number(capacite) : undefined,
      minRating:   note     ? Number(note)     : undefined,
    });

    if (!destination) {
      boats = base;
    } else {
      const destinations = await getDestinations();
      const knownDest = destinations.find((d) => normalizeText(d.name) === normalizeText(destination));
      boats = knownDest
        ? base.filter((b) => locationMatchesDestination(b.location, knownDest))
        : base.filter((b) => b.location.toLowerCase().includes(destination.toLowerCase()));
    }
  }

  if (tri === "prix-asc")        boats.sort((a, b) => a.pricePerDay - b.pricePerDay);
  else if (tri === "prix-desc")  boats.sort((a, b) => b.pricePerDay - a.pricePerDay);
  else if (tri === "note-desc")  boats.sort((a, b) => b.rating - a.rating);
  else if (tri === "nouveautes") boats.sort((a, b) => Number(b.id) - Number(a.id));

  const fmtDate = (iso: string) => {
    const [, m, d] = iso.split("-");
    const months = ["jan.", "fév.", "mar.", "avr.", "mai", "jun.", "juil.", "aoû.", "sep.", "oct.", "nov.", "déc."];
    return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
  };

  const subtitle = [
    types.length > 0 ? types.map((t) => TYPE_LABELS[t] ?? t).join(", ") : null,
    destination ? `à ${destination}` : null,
    skipper === "avec" ? "avec skipper" : skipper === "sans" ? "sans skipper" : null,
    arrivee && depart
      ? `du ${fmtDate(arrivee)} au ${fmtDate(depart)}`
      : arrivee
      ? `dès le ${fmtDate(arrivee)}`
      : depart
      ? `jusqu'au ${fmtDate(depart)}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

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
          ) : vue === "carte" ? (
            <BoatsMapCard boats={boats} className="map-card--catalog" />
          ) : (
            <div className={vue === "liste" ? "boats-result-list" : "boats-result-grid"}>
              {boats.map((boat) => (
                <FavoriteBoatCard key={boat.id} boat={boat} />
              ))}
            </div>
          )}
        </div>

        <Suspense fallback={null}>
          <BoatsSidebar />
        </Suspense>
      </div>
    </div>
  );
}

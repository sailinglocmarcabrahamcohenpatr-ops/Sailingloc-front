import { Suspense } from "react";
import type { Metadata } from "next";
import { searchBoats, adaptBoatFromApi } from "@/entities/boat";
import { getDestinations } from "@/entities/destination";
import { BoatsSidebar, ResultsControls, BoatsSplitMapView } from "@/widgets/boats-catalog";
import { boatsApi } from "@/shared/lib/boats-api";
import { boatMatchesFreeQuery, locationMatchesDestination, normalizeText } from "@/shared/lib/destination-match";
import { FavoriteBoatCard } from "@/features/toggle-favorite";
import { getRequestLocale, getDictionary } from "@/shared/i18n/get-dictionary";
import type { Boat, BoatType } from "@/entities/boat/model/types";

/** Remplace les {placeholders} d'un gabarit par leurs valeurs. */
function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

const adaptBoat = adaptBoatFromApi;

/** Le backend `/api/bateaux` ignore silencieusement type/avec_skipper/prix_max/capacite/note en
 *  query string (vérifié en direct sur l'API) : on doit donc les réappliquer nous-mêmes, comme
 *  c'est déjà fait pour `destination` ci-dessous. */
function boatMatchesType(labelTypeBateau: string | undefined, slug: string): boolean {
  const label = normalizeText(labelTypeBateau ?? "").replace(/[^a-z0-9]+/g, " ");
  const needle = slug.replace(/-/g, " ");
  return label.includes(needle);
}

interface PageProps {
  searchParams: Promise<{
    type?: string;
    destination?: string;
    prixMin?: string;
    prixMax?: string;
    capacite?: string;
    note?: string;
    tailleMin?: string;
    tailleMax?: string;
    cabines?: string;
    skipper?: string;
    arrivee?: string;
    depart?: string;
    vue?: string;
    tri?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const t = getDictionary(await getRequestLocale()).catalog;

  const singleType =
    sp.type && !sp.type.includes(",") && sp.type !== "tous"
      ? (t.typeLabels as Record<string, string>)[sp.type]
      : null;
  const destination = sp.destination?.trim() || null;

  let title = t.metaTitleDefault;
  if (singleType && destination) {
    title = fill(t.metaTitleTypeDestination, { type: singleType, destination });
  } else if (destination) {
    title = fill(t.metaTitleDestination, { destination });
  } else if (singleType) {
    title = fill(t.metaTitleType, { type: singleType });
  }

  // Canonique = destination/type seuls (facettes indexables) ; les autres filtres
  // (prix, capacité, dates…) retombent sur cette même URL pour éviter le contenu dupliqué.
  const canonicalParams = new URLSearchParams();
  if (destination) canonicalParams.set("destination", destination);
  if (sp.type && sp.type !== "tous") canonicalParams.set("type", sp.type);
  const canonical = `/bateaux${canonicalParams.toString() ? `?${canonicalParams.toString()}` : ""}`;

  const hasSecondaryFilters = Boolean(
    sp.prixMin || sp.prixMax || sp.capacite || sp.note || sp.tailleMin || sp.tailleMax || sp.cabines || sp.skipper || sp.arrivee || sp.depart
  );

  return {
    title,
    description: t.metaDescriptionDefault,
    alternates: { canonical },
    ...(hasSecondaryFilters ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function BoatsPage({ searchParams }: PageProps) {
  const { type, destination, prixMin, prixMax, capacite, note, tailleMin, tailleMax, cabines, skipper, arrivee, depart, vue, tri } = await searchParams;

  const types = (type?.split(",").filter((t) => t && t !== "tous") ?? []) as BoatType[];

  let boats: Boat[];

  try {
    // Le catalogue public ne doit montrer que les annonces réellement publiées —
    // un bateau en attente de validation, suspendu, refusé ou en maintenance ne
    // doit pas être visible ni réservable par un locataire.
    const apiParams: Record<string, string> = { statut: "disponible" };
    if (destination)  apiParams.destination   = destination;
    if (type)         apiParams.type          = type;
    if (prixMin)      apiParams.prix_min       = prixMin;
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
    if (prixMin || prixMax) {
      const min = prixMin ? Number(prixMin) : undefined;
      const max = prixMax ? Number(prixMax) : undefined;
      filtered = filtered.filter((b) => {
        const price = typeof b.prixJour === "string" ? parseFloat(b.prixJour) : b.prixJour;
        if (typeof price !== "number" || !Number.isFinite(price)) return false;
        if (min != null && price < min) return false;
        if (max != null && price > max) return false;
        return true;
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
    if (tailleMin || tailleMax) {
      // `taille` est un texte libre côté back ("12m", "12.5 m", …) : on extrait
      // le nombre en tête de chaîne, seul format garanti par le formulaire d'ajout.
      const min = tailleMin ? Number(tailleMin) : undefined;
      const max = tailleMax ? Number(tailleMax) : undefined;
      filtered = filtered.filter((b) => {
        const size = parseFloat(b.taille ?? "") || 0;
        if (min != null && size < min) return false;
        if (max != null && size > max) return false;
        return true;
      });
    }
    if (cabines) {
      const min = Number(cabines);
      filtered = filtered.filter((b) => (b.nombreCabines ?? 0) >= min);
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
      minPrice:    prixMin   ? Number(prixMin)   : undefined,
      maxPrice:    prixMax   ? Number(prixMax)   : undefined,
      minCapacity: capacite  ? Number(capacite)  : undefined,
      minRating:   note      ? Number(note)      : undefined,
      minLength:   tailleMin ? Number(tailleMin) : undefined,
      maxLength:   tailleMax ? Number(tailleMax) : undefined,
      minCabins:   cabines   ? Number(cabines)   : undefined,
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

  const tc = getDictionary(await getRequestLocale()).catalog;

  const fmtDate = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${parseInt(d)} ${tc.monthsShort[parseInt(m) - 1]}`;
  };
  const fill = (tpl: string, vars: Record<string, string>) =>
    tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

  const subtitle = [
    types.length > 0
      ? types.map((ty) => tc.typeLabels[ty as keyof typeof tc.typeLabels] ?? ty).join(", ")
      : null,
    destination ? `${tc.subAt} ${destination}` : null,
    skipper === "avec" ? tc.subWithSkipper : skipper === "sans" ? tc.subWithoutSkipper : null,
    arrivee && depart
      ? fill(tc.subDateRange, { from: fmtDate(arrivee), to: fmtDate(depart) })
      : arrivee
      ? fill(tc.subDateFrom, { date: fmtDate(arrivee) })
      : depart
      ? fill(tc.subDateUntil, { date: fmtDate(depart) })
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
              {tc.empty}
            </p>
          ) : vue === "carte" ? (
            <BoatsSplitMapView boats={boats} />
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

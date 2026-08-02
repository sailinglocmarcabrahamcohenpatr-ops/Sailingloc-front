import type { FullDestination } from "@/shared/types";

const ACCENTS: Record<string, string> = {
  à: "a", â: "a", ä: "a", é: "e", è: "e", ê: "e", ë: "e",
  î: "i", ï: "i", ô: "o", ö: "o", ù: "u", û: "u", ü: "u", ç: "c",
};

export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .split("")
    .map((ch) => ACCENTS[ch] ?? ch)
    .join("");
}

/** Villes/mots-clés associés à chaque destination française (le pays seul ne suffit pas à les distinguer). */
export const FRANCE_CITY_KEYWORDS: Record<string, string[]> = {
  "cote-azur": ["marseille", "nice", "cannes", "antibes", "toulon", "hyeres", "tropez", "grimaud", "cassis", "ciotat", "seyne", "monaco", "menton", "bandol"],
  corse: ["corse", "ajaccio", "bonifacio", "bastia", "calvi", "porto-vecchio", "propriano", "calenzana"],
  bretagne: ["bretagne", "brest", "lorient", "vannes", "quimper", "concarneau", "morbihan", "glenan", "raz", "arzon", "crouesty"],
  "la-rochelle": ["la rochelle", "larochelle", "rochefort", "ile re", "ile de re", "oleron", "oléron", "fouras", "royan", "charente", "chatelaillon"],
  languedoc: ["sete", "sète", "agde", "montpellier", "palavas", "grande motte", "marseillan", "frontignan", "thau", "beziers", "béziers", "valras"],
  camargue: ["camargue", "grau", "grau-du-roi", "saintes maries", "aigues mortes", "port saint louis", "fos", "martigues"],
};

export interface PortLike {
  ville?: string;
  pays?: string;
  nom?: string;
}

/** Un bateau appartient-il à une destination connue (pays pour l'étranger, ville pour les régions françaises) ? */
export function matchesDestination(port: PortLike | undefined, dest: FullDestination): boolean {
  if (!port) return false;
  const ville = normalizeText(port.ville ?? "");
  const pays = normalizeText(port.pays ?? "");
  const destCountry = normalizeText(dest.country);

  if (destCountry !== "france") {
    return pays.length > 0 && pays === destCountry;
  }
  const keywords = FRANCE_CITY_KEYWORDS[dest.slug] ?? [];
  return keywords.some((k) => ville.includes(normalizeText(k)));
}

/** Variante pour les données mock (Boat.location est une simple chaîne "Ville, Port"). */
export function locationMatchesDestination(location: string, dest: FullDestination): boolean {
  const loc = normalizeText(location);
  if (normalizeText(dest.country) !== "france") return false;
  const keywords = FRANCE_CITY_KEYWORDS[dest.slug] ?? [];
  return keywords.some((k) => loc.includes(normalizeText(k)));
}

/**
 * Filtre "libre" utilisé par le catalogue /bateaux : la query peut être le nom exact d'une
 * destination connue, ou un texte quelconque (ville, port…). Ce filtre est appliqué côté
 * frontend car le backend ne filtre pas fiablement par destination.
 */
export function boatMatchesFreeQuery(port: PortLike | undefined, query: string, destinations: FullDestination[]): boolean {
  if (!port) return false;
  const q = normalizeText(query.trim());
  if (!q) return true;

  const knownDest = destinations.find((d) => normalizeText(d.name) === q);
  if (knownDest) return matchesDestination(port, knownDest);

  const ville = normalizeText(port.ville ?? "");
  const nom = normalizeText(port.nom ?? "");
  const pays = normalizeText(port.pays ?? "");
  return ville.includes(q) || nom.includes(q) || pays.includes(q);
}

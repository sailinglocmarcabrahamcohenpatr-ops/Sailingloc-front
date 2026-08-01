/** Pays couverts par la plateforme (cf. `shared/config` → `COUNTRIES`),
 *  avec leur code ISO 3166-1 alpha-2 — utilisé pour l'autocomplétion des
 *  villes portuaires (`portCities.ts`). */
const COUNTRY_CODES: Record<string, string> = {
  france: "FR",
  espagne: "ES",
  italie: "IT",
  grece: "GR",
};

/** Normalise : casse, accents et espaces ignorés (« Grèce » → « grece »). */
function normalize(value: string): string {
  const DIACRITICS = /[̀-ͯ]/g;
  return value.normalize("NFD").replace(DIACRITICS, "").toLowerCase().trim();
}

/** Résout un nom de pays saisi librement vers son code ISO alpha-2.
 *  Retourne `null` si le pays n'est pas reconnu (autocomplétion désactivée,
 *  la saisie manuelle reste toujours possible). */
export function resolveCountryCode(countryName: string): string | null {
  return COUNTRY_CODES[normalize(countryName)] ?? null;
}

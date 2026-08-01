export interface GeocodeResult {
  lat: number;
  lng: number;
  label: string;
}

export interface PortLocation {
  codePostal: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: { postcode?: string };
}

export async function geocodeCity(city: string): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    format: "json",
    q: city,
    limit: "1",
    countrycodes: "fr",
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;

  const results: Array<{ lat: string; lon: string; display_name: string }> = await res.json();
  if (results.length === 0) return null;

  const { lat, lon, display_name } = results[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon), label: display_name };
}

/** Résout le code postal et les coordonnées d'une ville portuaire choisie
 *  dans l'autocomplétion (voir `portCities.ts`). Pour la France on interroge
 *  l'API officielle des communes (geo.api.gouv.fr) — bien plus fiable que
 *  Nominatim pour les codes postaux français ; ailleurs on retombe sur
 *  Nominatim (OSM), filtré par pays. */
export async function resolvePortLocation(
  countryCode: string,
  cityName: string
): Promise<PortLocation | null> {
  if (countryCode === "FR") {
    const params = new URLSearchParams({
      nom: cityName,
      fields: "codesPostaux,centre",
      boost: "population",
      limit: "1",
    });
    const res = await fetch(`https://geo.api.gouv.fr/communes?${params.toString()}`);
    if (!res.ok) return null;
    const results: Array<{ codesPostaux?: string[]; centre?: { coordinates: [number, number] } }> =
      await res.json();
    const commune = results[0];
    if (!commune?.centre) return null;
    const [lng, lat] = commune.centre.coordinates;
    return { codePostal: commune.codesPostaux?.[0] ?? "", lat, lng };
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    q: cityName,
    countrycodes: countryCode,
    addressdetails: "1",
    limit: "1",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const results: NominatimResult[] = await res.json();
  const result = results[0];
  if (!result) return null;
  return {
    codePostal: result.address?.postcode ?? "",
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
  };
}

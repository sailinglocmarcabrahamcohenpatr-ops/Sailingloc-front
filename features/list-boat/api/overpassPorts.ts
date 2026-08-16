export interface OverpassPort {
  nom: string;
  ville: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const RADIUS_METERS = 25000;
const cache = new Map<string, OverpassPort[]>();

/** Géocode « ville, pays » via Nominatim pour obtenir le point de départ de
 *  la recherche de ports. */
async function geocodeCityCountry(cityName: string, countryName: string): Promise<{ lat: number; lng: number } | null> {
  const params = new URLSearchParams({
    q: `${cityName}, ${countryName}`,
    format: "jsonv2",
    limit: "1",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  // Échec réseau/service (ex : 403/429 — quota public dépassé) : distinct
  // d'une ville simplement introuvable, pour ne pas afficher « aucun port
  // trouvé » quand c'est en fait le service de géocodage qui est en panne.
  if (!res.ok) throw new Error(`geocode_unavailable_${res.status}`);

  const results: NominatimResult[] = await res.json();
  const result = results[0];
  if (!result) return null;
  return { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
}

/** Liste les ports/marinas réels à proximité d'une ville (Overpass /
 *  OpenStreetMap) : chaque résultat porte les coordonnées exactes du port,
 *  pas celles de la ville. La recherche est bornée à un rayon de 25 km
 *  autour de la ville (requête `around`, quasi instantanée sur l'index
 *  spatial) plutôt que sur le pays entier — un balayage pays entier s'est
 *  avéré systématiquement trop lent (>40s puis timeout) sur l'instance
 *  Overpass publique dès qu'un pays est un peu grand (mesuré sur la
 *  France) ; un rayon autour d'un point reste rapide quelle que soit la
 *  taille du pays. Résultat mis en cache par « ville, pays ». */
export async function searchPortsNearCity(countryName: string, cityName: string): Promise<OverpassPort[]> {
  const country = countryName.trim();
  const city = cityName.trim();
  if (!country || !city) return [];

  const key = `${city.toLowerCase()}|${country.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const point = await geocodeCityCountry(city, country);
  if (!point) return [];

  const query = `
    [out:json][timeout:15];
    (
      node["harbour"="yes"](around:${RADIUS_METERS},${point.lat},${point.lng});
      way["harbour"="yes"](around:${RADIUS_METERS},${point.lat},${point.lng});
      node["leisure"="marina"](around:${RADIUS_METERS},${point.lat},${point.lng});
      way["leisure"="marina"](around:${RADIUS_METERS},${point.lat},${point.lng});
    );
    out center 60;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: new URLSearchParams({ data: query }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`overpass_unavailable_${res.status}`);

  const data: OverpassResponse & { remark?: string } = await res.json();
  // Overpass répond parfois 200 avec une erreur dans le corps (ex : timeout
  // sur une zone trop lourde) — sans ce contrôle, `elements` serait vide et
  // on afficherait à tort « aucun port trouvé ».
  if (data.remark) throw new Error(`overpass_error: ${data.remark}`);

  const seen = new Set<string>();
  const ports: OverpassPort[] = [];

  for (const el of data.elements) {
    const tags = el.tags ?? {};
    const nom = tags.name;
    if (!nom) continue;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;

    const dedupeKey = nom.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    ports.push({ nom, ville: tags["addr:city"] ?? city, lat, lng });
  }

  ports.sort((a, b) => a.nom.localeCompare(b.nom));
  cache.set(key, ports);
  return ports;
}

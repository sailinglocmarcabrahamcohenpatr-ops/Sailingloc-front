export interface GeocodeResult {
  lat: number;
  lng: number;
  label: string;
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

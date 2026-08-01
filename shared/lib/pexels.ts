interface PexelsPhoto {
  src: { large2x: string; large: string; medium: string };
}
interface PexelsSearchResponse {
  photos: PexelsPhoto[];
}

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

async function searchPexels(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey || apiKey.includes("XXXX")) return null;
  try {
    const res = await fetch(
      `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: apiKey }, next: { revalidate: 60 * 60 * 24 * 7 } }
    );
    if (!res.ok) return null;
    const data: PexelsSearchResponse = await res.json();
    return data.photos[0]?.src.large2x ?? null;
  } catch {
    return null;
  }
}

/**
 * Photo réelle et cohérente (via Pexels) pour une requête donnée — ex. un nom de port ou de
 * site touristique. Repli sur une image Picsum stable (par seed) si PEXELS_API_KEY n'est pas
 * configurée ou si la recherche ne renvoie aucun résultat, pour ne jamais casser l'affichage.
 */
export async function getCoherentPhoto(query: string, fallbackSeed: string, fallbackSize = "800/600"): Promise<string> {
  const photo = await searchPexels(query);
  return photo ?? `https://picsum.photos/seed/${fallbackSeed}/${fallbackSize}`;
}

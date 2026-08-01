import { resolvePhotoUrl } from "@/shared/lib/boats-api";
import type { BoatAPI } from "@/shared/lib/boats-api";
import type { Boat, BoatType } from "../model/types";

/** Convertit un bateau tel que renvoyé par l'API backend vers le shape `Boat` utilisé par le front. */
export function adaptBoatFromApi(b: BoatAPI): Boat {
  const sortedPhotos = (b.photos ?? [])
    .slice()
    .sort((a, c) => (a.ordreAffichage ?? 99) - (c.ordreAffichage ?? 99));

  const photos = sortedPhotos.map((p) => resolvePhotoUrl(p.url)).filter(Boolean);

  const lat = b.port?.latitude != null ? Number(b.port.latitude) : NaN;
  const lng = b.port?.longitude != null ? Number(b.port.longitude) : NaN;

  return {
    id: String(b.id),
    name: b.nomBateau,
    location: b.port ? b.port.ville : "France",
    coordinates: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined,
    type: (b.typeBateau?.labelTypeBateau?.toLowerCase() ?? "voilier") as BoatType,
    rating: b.noteMoyenne ?? 0,
    reviewCount: b.nombreAvis ?? 0,
    pricePerDay: typeof b.prixJour === "string" ? parseFloat(b.prixJour) : (b.prixJour ?? 0),
    imageUrl: photos[0] ?? "",
    imageSeed: String(b.id),
    capacity: b.capacite ?? undefined,
    cabins: b.nombreCabines ?? undefined,
    photos: photos.length > 0 ? photos : undefined,
    owner: { name: "Propriétaire", avatarSeed: String(b.id) },
  };
}

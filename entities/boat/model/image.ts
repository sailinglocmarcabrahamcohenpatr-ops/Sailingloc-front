import type { Boat, BoatType } from "./types";

const TYPE_IMAGE_QUERY: Record<BoatType, string> = {
  tous: "boat,yacht",
  voilier: "sailboat,yacht",
  catamaran: "catamaran,sailing",
  moteur: "motorboat,yacht",
  habitable: "houseboat,trawler",
  "semi-rigide": "rib,dinghy",
  "sans-permis": "motorboat,dayboat",
  ponton: "pontoon,boat",
};

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash % 100000;
}

const VARIANT_INDEX: Record<string, number> = { main: 0, cockpit: 1, cabin: 2 };

/** Builds a realistic, boat-type-matched stock photo URL (LoremFlickr, keyword-tagged Flickr photos),
 *  or returns the owner's own uploaded photo when the boat has one. */
export function getBoatImageUrl(
  boat: Pick<Boat, "imageSeed" | "type" | "imageQuery" | "photos">,
  width: number,
  height: number,
  variant = ""
): string {
  if (boat.photos && boat.photos.length > 0) {
    const index = VARIANT_INDEX[variant] ?? 0;
    return boat.photos[index % boat.photos.length];
  }
  const query = boat.imageQuery ?? TYPE_IMAGE_QUERY[boat.type] ?? "boat,yacht";
  const lock = hashSeed(`${boat.imageSeed}${variant}`);
  return `https://loremflickr.com/${width}/${height}/${query}?lock=${lock}`;
}

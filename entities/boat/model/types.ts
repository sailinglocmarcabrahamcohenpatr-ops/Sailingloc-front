import type { BoatType, BadgeVariant } from "@/shared/types";

export type { BoatType, BadgeVariant };

export interface Boat {
  id: string;
  name: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  type: BoatType;
  rating: number;
  reviewCount: number;
  pricePerDay: number;
  /** Caution demandée pour la location (empreinte bancaire), en euros — champ `caution` côté API. */
  deposit?: number;
  imageUrl: string;
  imageSeed: string;
  imageQuery?: string;
  photos?: string[];
  badge?: { label: string; variant: BadgeVariant; icon?: string };
  cabins?: number;
  toilets?: number;
  year?: number;
  capacity?: number;
  length?: string;
  width?: string;
  speed?: string;
  fuel?: string;
  license?: "Requis" | "Non requis";
  owner: { name: string; avatarSeed: string };
}

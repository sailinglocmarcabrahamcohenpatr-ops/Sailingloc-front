import type { BoatType, BadgeVariant } from "@/shared/types";

export type { BoatType, BadgeVariant };

export interface Boat {
  id: string;
  name: string;
  location: string;
  type: BoatType;
  rating: number;
  reviewCount: number;
  pricePerDay: number;
  imageUrl: string;
  imageSeed: string;
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
}

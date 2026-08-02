import type { Boat } from "@/entities/boat";
import { BoatCard } from "@/entities/boat";
import HeartButton from "./HeartButton";

interface FavoriteBoatCardProps {
  boat: Boat;
  className?: string;
}

export default function FavoriteBoatCard({ boat, className }: FavoriteBoatCardProps) {
  return <BoatCard boat={boat} className={className} action={<HeartButton boatId={boat.id} />} />;
}

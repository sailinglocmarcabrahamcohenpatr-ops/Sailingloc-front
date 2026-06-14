import type { Boat } from "@/entities/boat";
import { BoatCard } from "@/entities/boat";
import HeartButton from "./HeartButton";

interface FavoriteBoatCardProps {
  boat: Boat;
  className?: string;
  showMeta?: boolean;
}

export default function FavoriteBoatCard({
  boat,
  className,
  showMeta,
}: FavoriteBoatCardProps) {
  return (
    <BoatCard
      boat={boat}
      className={className}
      showMeta={showMeta}
      action={<HeartButton boatId={boat.id} />}
    />
  );
}

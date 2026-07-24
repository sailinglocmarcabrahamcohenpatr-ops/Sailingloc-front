import Link from "next/link";
import Image from "next/image";
import type { Boat } from "../model/types";
import { getBoatImageUrl } from "../model/image";
import { cn, formatPrice } from "@/shared/lib/utils";

interface BoatCardProps {
  boat: Boat;
  className?: string;
  showMeta?: boolean;
  action?: React.ReactNode;
}

export default function BoatCard({
  boat,
  className = "",
  showMeta = false,
  action,
}: BoatCardProps) {
  const imgSrc = getBoatImageUrl(boat, 600, 450);
  const isUploadedPhoto = imgSrc.startsWith("data:");

  return (
    <Link
      href={`/bateaux/${boat.id}`}
      className={cn("boat-card", className)}
      aria-label={`${boat.name} — ${boat.location}`}
    >
      <div className="boat-card-img">
        <Image
          src={imgSrc}
          alt={boat.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          unoptimized={isUploadedPhoto}
        />
        {boat.badge && (
          <div
            className={cn(
              "boat-badge",
              boat.badge.variant !== "default" && `badge-${boat.badge.variant}`
            )}
          >
            {boat.badge.icon && (
              <i className={`fa-solid ${boat.badge.icon}`} aria-hidden="true" />
            )}
            {boat.badge.label}
          </div>
        )}
        {action}
      </div>
      <div className="boat-card-body">
        <div className="boat-card-name">{boat.name}</div>
        <div className="boat-card-loc">
          <i className="fa-solid fa-location-dot" aria-hidden="true" />
          {boat.location}
        </div>
        {showMeta && (
          <div className="boat-card-meta">
            {[
              boat.cabins && `${boat.cabins} cabines`,
              boat.toilets && `${boat.toilets} toilettes`,
              boat.year,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        )}
        <div className="boat-card-foot">
          <div className="boat-card-rating">
            <i className="fa-solid fa-star" aria-hidden="true" />
            {boat.reviewCount > 0 ? (
              <>
                <strong>{boat.rating.toFixed(1)}</strong>
                <span className="reviews">({boat.reviewCount} avis)</span>
              </>
            ) : (
              <span className="reviews">Nouveau</span>
            )}
          </div>
          <div className="boat-card-price">
            {formatPrice(boat.pricePerDay)} <span>/ jour</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { Boat } from "../model/types";
import { getBoatImageUrl } from "../model/image";
import BoatTypeIcon from "./BoatTypeIcon";
import { cn, formatPrice } from "@/shared/lib/utils";
import "./boat-card.css";

interface BoatCardProps {
  boat: Boat;
  className?: string;
  action?: React.ReactNode;
}

export default function BoatCard({ boat, className = "", action }: BoatCardProps) {
  const imgSrc = getBoatImageUrl(boat, 640, 820);
  const typeLabel = boat.type.charAt(0).toUpperCase() + boat.type.slice(1);

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
          unoptimized
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
        <h3 className="boat-card-name">{boat.name}</h3>
        <div className="boat-card-sub">
          <BoatTypeIcon type={boat.type} style={{ fontSize: "1.15rem" }} />
          {typeLabel}
        </div>

        <div className="boat-card-info">
          <span className="boat-card-price">
            dès <strong>{formatPrice(boat.pricePerDay)}</strong>
          </span>
          <span className="boat-card-rating">
            <i className="fa-solid fa-star" aria-hidden="true" />
            {boat.reviewCount > 0 ? boat.rating.toFixed(1) : "Nouveau"}
          </span>
        </div>

        <span className="boat-card-cta">Réserver</span>
      </div>
    </Link>
  );
}

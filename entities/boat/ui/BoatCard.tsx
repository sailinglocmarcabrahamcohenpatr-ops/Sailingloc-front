"use client";

import type { Boat } from "../model/types";
import BoatTypeIcon from "./BoatTypeIcon";
import BoatCardGallery from "./BoatCardGallery";
import { cn, formatPrice } from "@/shared/lib/utils";
import { LocaleLink as Link, useI18n } from "@/shared/i18n";
import "./boat-card.css";

interface BoatCardProps {
  boat: Boat;
  className?: string;
  action?: React.ReactNode;
}

export default function BoatCard({ boat, className = "", action }: BoatCardProps) {
  const { dict } = useI18n();
  const t = dict.boatCard;
  const typeLabel =
    dict.boatTypes[boat.type as keyof typeof dict.boatTypes] ??
    boat.type.charAt(0).toUpperCase() + boat.type.slice(1);

  return (
    <Link
      href={`/bateaux/${boat.id}`}
      className={cn("boat-card", className)}
      aria-label={`${boat.name} — ${boat.location}`}
    >
      <BoatCardGallery boat={boat}>
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
      </BoatCardGallery>

      <div className="boat-card-body">
        <div className="boat-card-head">
          <h3 className="boat-card-name">{boat.name}</h3>
          <span className="boat-card-rating">
            <i className="fa-solid fa-star" aria-hidden="true" />
            {boat.reviewCount > 0 ? boat.rating.toFixed(1) : t.new}
          </span>
        </div>

        <div className="boat-card-sub">
          <BoatTypeIcon type={boat.type} />
          {typeLabel}
        </div>

        <p className="boat-card-port" title={boat.location}>
          <i className="fa-solid fa-location-dot" aria-hidden="true" />
          {boat.location}
        </p>

        <ul className="boat-card-specs">
          {boat.capacity != null && (
            <li>
              <i className="fa-solid fa-user-group" aria-hidden="true" />
              {boat.capacity} {t.persons}
            </li>
          )}
          {boat.cabins != null && (
            <li>
              <i className="fa-solid fa-bed" aria-hidden="true" />
              {boat.cabins} {boat.cabins > 1 ? t.cabins : t.cabin}
            </li>
          )}
        </ul>

        <div className="boat-card-foot">
          <span className="boat-card-price">
            {formatPrice(boat.pricePerDay)} <span>{dict.common.perDay}</span>
          </span>
          <span className="boat-card-cta">{t.book}</span>
        </div>
      </div>
    </Link>
  );
}

"use client";

import { useMemo, useState } from "react";
import { divIcon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import Link from "next/link";
import Image from "next/image";
import type { Boat } from "@/entities/boat";
import { getBoatImageUrl } from "@/entities/boat";
import { formatPrice } from "@/shared/lib/utils";

const BOAT_GLYPH_SVG =
  '<svg class="boat-map-marker-glyph" viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M24 57C13 44 6 33 6 21.5 6 11 14.1 3 24 3s18 8 18 18.5C42 33 35 44 24 57Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />' +
  '<path d="M24 14 34 34H14Z" fill="currentColor" />' +
  '<path d="M10 34Q24 30 38 34Q24 42 10 34Z" fill="currentColor" />' +
  '<path d="M8 47q8-5 16 0t16 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />' +
  "</svg>";

function createPortIcon(count: number) {
  const badge = count > 1 ? `<span class="boat-map-marker-badge">${count}</span>` : "";
  return divIcon({
    className: "boat-map-marker",
    html: `<span class="boat-map-marker-pin">${BOAT_GLYPH_SVG}</span>${badge}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });
}

interface PortMarkerProps {
  boats: (Boat & { coordinates: { lat: number; lng: number } })[];
}

/** Une balise = un port. Un seul bateau : popup classique au clic. Plusieurs
 *  bateaux au même port : la balise affiche leur nombre et le clic ouvre un
 *  mini-carrousel (flèches en dehors de la carte) pour les parcourir avant
 *  d'ouvrir la fiche de l'un d'eux. */
export default function PortMarker({ boats }: PortMarkerProps) {
  const [index, setIndex] = useState(0);

  const count = boats.length;
  const position: [number, number] = [boats[0].coordinates.lat, boats[0].coordinates.lng];
  const icon = useMemo(() => createPortIcon(count), [count]);
  const current = boats[index] ?? boats[0];

  const go = (e: React.MouseEvent, dir: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + dir + count) % count);
  };

  return (
    <Marker position={position} icon={icon}>
      <Popup className="boat-map-popup-wrap">
        <div className="boat-map-popup-shell">
          {count > 1 && (
            <button
              type="button"
              className="boat-map-popup-nav boat-map-popup-nav--prev"
              onClick={(e) => go(e, -1)}
              aria-label="Bateau précédent"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
          )}

          <div className="boat-map-popup-card">
            <div className="boat-map-popup-photo">
              <Image
                key={current.id}
                src={getBoatImageUrl(current, 320, 200)}
                alt={current.name}
                fill
                sizes="240px"
                style={{ objectFit: "cover" }}
                unoptimized
              />
              {count > 1 && (
                <>
                  <span className="boat-map-popup-chip boat-map-popup-chip--count">
                    <i className="fa-solid fa-anchor" aria-hidden="true" /> {count} bateaux
                  </span>
                  <span className="boat-map-popup-chip boat-map-popup-chip--index">
                    {index + 1}/{count}
                  </span>
                </>
              )}
            </div>

            <div className="boat-map-popup">
              <strong className="boat-map-popup-name">{current.name}</strong>
              <span className="boat-map-popup-meta">
                <i className="fa-solid fa-location-dot" aria-hidden="true" /> {current.location}
              </span>
              <span className="boat-map-popup-meta">
                <i className="fa-solid fa-user" aria-hidden="true" /> Propriétaire : {current.owner.name}
              </span>
              <div className="boat-map-popup-foot">
                <span className="boat-map-popup-price">{formatPrice(current.pricePerDay)}</span>
                <small>/ jour</small>
              </div>
              <Link href={`/bateaux/${current.id}`} className="btn btn-primary btn-sm boat-map-popup-cta">
                Voir le bateau <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
            </div>

            {count > 1 && (
              <div className="boat-map-popup-dots">
                {boats.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    className={`boat-map-popup-dot${i === index ? " is-active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIndex(i);
                    }}
                    aria-label={`Voir ${b.name}`}
                  />
                ))}
              </div>
            )}
          </div>

          {count > 1 && (
            <button
              type="button"
              className="boat-map-popup-nav boat-map-popup-nav--next"
              onClick={(e) => go(e, 1)}
              aria-label="Bateau suivant"
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

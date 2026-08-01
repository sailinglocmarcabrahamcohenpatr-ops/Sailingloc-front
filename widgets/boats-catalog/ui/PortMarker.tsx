"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { divIcon, type Marker as LeafletMarker } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import Link from "next/link";
import Image from "next/image";
import type { Boat } from "@/entities/boat";
import { getBoatImageUrl } from "@/entities/boat";
import { formatPrice } from "@/shared/lib/utils";

function createPortIcon(count: number) {
  const badge = count > 1 ? `<span class="boat-map-marker-badge">${count}</span>` : "";
  return divIcon({
    className: "boat-map-marker",
    html: `<span class="boat-map-marker-pin"><i class="fa-solid fa-anchor" aria-hidden="true"></i></span>${badge}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });
}

/** Délai avant fermeture du popup au survol : laisse le temps au curseur de
 *  passer de la balise au popup (deux éléments DOM distincts) sans clignoter. */
const HOVER_CLOSE_DELAY = 200;

interface PortMarkerProps {
  boats: (Boat & { coordinates: { lat: number; lng: number } })[];
}

/** Une balise = un port. Un seul bateau : popup classique. Plusieurs bateaux
 *  au même port : la balise affiche leur nombre et le survol ouvre un
 *  mini-carrousel pour parcourir chaque bateau avant d'ouvrir sa fiche. */
export default function PortMarker({ boats }: PortMarkerProps) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [index, setIndex] = useState(0);

  const count = boats.length;
  const position: [number, number] = [boats[0].coordinates.lat, boats[0].coordinates.lng];
  const icon = useMemo(() => createPortIcon(count), [count]);
  const current = boats[index] ?? boats[0];

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      markerRef.current?.closePopup();
    }, HOVER_CLOSE_DELAY);
  }, [cancelClose]);

  const open = useCallback(() => {
    cancelClose();
    markerRef.current?.openPopup();
  }, [cancelClose]);

  const go = (e: React.MouseEvent, dir: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + dir + count) % count);
  };

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      eventHandlers={{ mouseover: open, mouseout: scheduleClose }}
    >
      <Popup className="boat-map-popup-wrap">
        <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
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
                  <button
                    type="button"
                    className="boat-map-popup-nav boat-map-popup-nav--prev"
                    onClick={(e) => go(e, -1)}
                    aria-label="Bateau précédent"
                  >
                    <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="boat-map-popup-nav boat-map-popup-nav--next"
                    onClick={(e) => go(e, 1)}
                    aria-label="Bateau suivant"
                  >
                    <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                  </button>
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
      </Popup>
    </Marker>
  );
}

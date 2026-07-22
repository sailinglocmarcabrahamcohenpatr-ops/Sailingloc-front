"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { DestinationBoatMarker } from "./DestinationMap";
import { formatPrice } from "@/shared/lib/utils";

const DestinationMap = dynamic(() => import("./DestinationMap"), {
  ssr: false,
  loading: () => (
    <div className="dest-map-loading">
      <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
    </div>
  ),
});

interface DestinationMapSectionProps {
  slug: string;
  name: string;
  center: { lat: number; lng: number };
  boatCount: number;
  priceFrom: number;
  boats: DestinationBoatMarker[];
}

export default function DestinationMapSection({ slug, name, center, boatCount, priceFrom, boats }: DestinationMapSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const hasRealBoats = boats.length > 0;

  const mapProps = { slug, name, center, boatCount, priceFrom, boats };

  return (
    <>
      <div className="dest-map-card fade-in">
        <div className="dest-map-card-head">
          <div>
            <span className="dest-map-eyebrow">
              <i className="fa-solid fa-location-crosshairs" aria-hidden="true" /> Carte en direct
            </span>
            <h2>Bateaux disponibles à {name}</h2>
          </div>
          <div className="dest-map-stats">
            <div className="dest-map-stat">
              <strong>{boats.length}</strong>
              <span>{hasRealBoats ? "trouvés" : "annoncés"}</span>
            </div>
            <div className="dest-map-stat">
              <strong>{formatPrice(priceFrom)}</strong>
              <span>dès / jour</span>
            </div>
            <button type="button" className="btn btn-outline btn-sm dest-map-expand" onClick={() => setExpanded(true)}>
              <i className="fa-solid fa-expand" aria-hidden="true" /> Agrandir
            </button>
          </div>
        </div>

        <div className="dest-map-embed">
          <DestinationMap {...mapProps} />
          <div className="dest-map-legend">
            <span className={`dest-map-legend-dot${hasRealBoats ? "" : " dest-map-legend-dot--hub"}`} />
            {hasRealBoats ? `${boats.length} bateau${boats.length > 1 ? "x" : ""} réel${boats.length > 1 ? "s" : ""} localisé${boats.length > 1 ? "s" : ""}` : "Zone de navigation — aucun bateau publié pour l'instant"}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="map-modal-overlay" role="dialog" aria-modal="true" aria-label="Carte agrandie">
          <div className="map-modal dest-map-modal">
            <button
              type="button"
              className="map-modal-close"
              onClick={() => setExpanded(false)}
              aria-label="Fermer la carte"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            <DestinationMap {...mapProps} />
          </div>
        </div>
      )}
    </>
  );
}

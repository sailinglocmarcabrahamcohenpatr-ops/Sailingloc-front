"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Boat } from "@/entities/boat";
import { getUserBoats, USER_BOATS_EVENT } from "@/entities/boat";

const BoatsMap = dynamic(() => import("./BoatsMap"), {
  ssr: false,
  loading: () => (
    <div className="boats-map-loading">
      <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
    </div>
  ),
});

interface BoatsMapCardProps {
  boats: Boat[];
}

export default function BoatsMapCard({ boats: serverBoats }: BoatsMapCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [userBoats, setUserBoats] = useState<Boat[]>([]);

  useEffect(() => {
    const sync = () => setUserBoats(getUserBoats());
    sync();
    window.addEventListener(USER_BOATS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(USER_BOATS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const boats = [...serverBoats, ...userBoats];
  const locatedCount = boats.filter((b) => b.coordinates).length;

  return (
    <>
      <div className="map-card" role="region" aria-label="Carte des bateaux disponibles">
        <div className="map-embed-wrap">
          <BoatsMap boats={boats} />
        </div>
        <div className="map-card-foot">
          <span>
            <i className="fa-solid fa-map-pin" style={{ color: "var(--primary)" }} aria-hidden="true" />{" "}
            {locatedCount} bateaux
          </span>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setExpanded(true)}>
            <i className="fa-solid fa-expand" aria-hidden="true" /> Agrandir
          </button>
        </div>
      </div>

      {expanded && (
        <div className="map-modal-overlay" role="dialog" aria-modal="true" aria-label="Carte agrandie">
          <div className="map-modal">
            <button
              type="button"
              className="map-modal-close"
              onClick={() => setExpanded(false)}
              aria-label="Fermer la carte"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            <BoatsMap boats={boats} />
          </div>
        </div>
      )}
    </>
  );
}

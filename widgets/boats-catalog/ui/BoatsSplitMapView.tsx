"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { LatLngBounds } from "leaflet";
import type { Boat } from "@/entities/boat";
import { FavoriteBoatCard } from "@/features/toggle-favorite";
import { dispatchMapFocus, type MapFocusPort } from "../model/map-focus";

const BoatsMap = dynamic(() => import("./BoatsMap"), {
  ssr: false,
  loading: () => (
    <div className="boats-map-loading">
      <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
    </div>
  ),
});

interface BoatsSplitMapViewProps {
  boats: Boat[];
}

/** Vue carte : la liste se met à jour en direct selon la zone visible sur la
 *  carte (déplacement/zoom) — un bateau n'apparaît que si son port est dans
 *  le cadre actuel. Zoomer sur une zone sans port vide donc la liste. */
export default function BoatsSplitMapView({ boats }: BoatsSplitMapViewProps) {
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  const located = useMemo(
    () => boats.filter((b): b is Boat & { coordinates: { lat: number; lng: number } } => !!b.coordinates),
    [boats]
  );
  const unlocatedCount = boats.length - located.length;

  const visible = useMemo(
    () => (bounds ? located.filter((b) => bounds.contains([b.coordinates.lat, b.coordinates.lng])) : located),
    [bounds, located]
  );

  // Le port le plus proche du centre de la carte parmi ceux visibles à
  // l'écran : c'est celui dont on affiche la météo dans la sidebar.
  const focusPort = useMemo<MapFocusPort | null>(() => {
    if (!bounds || visible.length === 0) return null;
    const ports = new Map<string, MapFocusPort>();
    for (const b of visible) {
      const key = `${b.coordinates.lat},${b.coordinates.lng}`;
      if (!ports.has(key)) ports.set(key, { lat: b.coordinates.lat, lng: b.coordinates.lng, name: b.location });
    }
    const center = bounds.getCenter();
    let closest: MapFocusPort | null = null;
    let bestDist = Infinity;
    for (const port of ports.values()) {
      const dist = (port.lat - center.lat) ** 2 + (port.lng - center.lng) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        closest = port;
      }
    }
    return closest;
  }, [bounds, visible]);

  useEffect(() => {
    dispatchMapFocus(focusPort);
  }, [focusPort]);

  // Vue quittée (retour grille/liste) : on ne laisse pas la météo bloquée sur
  // le dernier port survolé.
  useEffect(() => () => dispatchMapFocus(null), []);

  const isFiltered = bounds != null && visible.length < located.length;
  const resetView = () => setResetSignal((n) => n + 1);

  return (
    <div className="map-split" role="region" aria-label="Bateaux et carte interactive">
      <div className="map-split-list">
        <div className="map-split-list-head">
          <span>
            <i className="fa-solid fa-map-pin" aria-hidden="true" />{" "}
            <strong>{visible.length}</strong> bateau{visible.length !== 1 ? "x" : ""} dans cette zone
          </span>
          {isFiltered && (
            <button type="button" className="map-split-reset" onClick={resetView}>
              <i className="fa-solid fa-arrows-to-circle" aria-hidden="true" /> Réinitialiser la vue
            </button>
          )}
        </div>

        <div className="map-split-list-body">
          {visible.length === 0 ? (
            <div className="map-split-empty">
              <i className="fa-solid fa-compass" aria-hidden="true" />
              <strong>Aucun bateau dans cette zone</strong>
              <p>Déplacez-vous ou dézoomez la carte pour découvrir plus de bateaux.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={resetView}>
                Voir tous les bateaux
              </button>
            </div>
          ) : (
            visible.map((boat) => <FavoriteBoatCard key={boat.id} boat={boat} />)
          )}

          {unlocatedCount > 0 && (
            <p className="map-split-unlocated">
              <i className="fa-solid fa-circle-info" aria-hidden="true" /> {unlocatedCount} autre
              {unlocatedCount !== 1 ? "s" : ""} bateau{unlocatedCount !== 1 ? "x" : ""} sans position connue, non
              affiché{unlocatedCount !== 1 ? "s" : ""} sur la carte.
            </p>
          )}
        </div>
      </div>

      <div className="map-split-map">
        <BoatsMap boats={located} onBoundsChange={setBounds} resetSignal={resetSignal} />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { LatLngBounds, LatLngBoundsExpression } from "leaflet";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Boat } from "@/entities/boat";
import PortMarker from "./PortMarker";

interface BoatsMapProps {
  boats: Boat[];
  /** Appelé à chaque déplacement/zoom (et une fois au chargement) avec la zone visible. */
  onBoundsChange?: (bounds: LatLngBounds) => void;
  /** Incrémenter cette valeur recentre la carte sur l'ensemble des bateaux. */
  resetSignal?: number;
}

interface ViewportProps {
  onBoundsChange?: (bounds: LatLngBounds) => void;
  resetSignal?: number;
  fitBounds?: LatLngBoundsExpression;
  fallbackView: { center: [number, number]; zoom: number };
}

/** Piste les déplacements de la carte pour remonter les bornes visibles au
 *  parent (filtrage dynamique de la liste), et gère le recentrage sur reset. */
function MapViewport({ onBoundsChange, resetSignal, fitBounds, fallbackView }: ViewportProps) {
  const map = useMap();
  const isFirstReset = useRef(true);

  useEffect(() => {
    onBoundsChange?.(map.getBounds());
    // Volontairement limité au montage : la vue initiale est déjà posée par
    // MapContainer (bounds/center+zoom), on ne fait que la lire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (isFirstReset.current) {
      isFirstReset.current = false;
      return;
    }
    if (fitBounds) map.fitBounds(fitBounds, { padding: [30, 30] });
    else map.setView(fallbackView.center, fallbackView.zoom);
    // fitBounds/setView ne déclenche pas toujours "moveend" de façon fiable
    // (no-op silencieux quand Leaflet juge le changement négligeable) : on
    // relit donc les bornes nous-mêmes plutôt que de dépendre de l'event.
    onBoundsChange?.(map.getBounds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useMapEvents({
    moveend() {
      onBoundsChange?.(map.getBounds());
    },
  });

  return null;
}

export default function BoatsMap({ boats, onBoundsChange, resetSignal }: BoatsMapProps) {
  const located = boats.filter(
    (b): b is Boat & { coordinates: { lat: number; lng: number } } => !!b.coordinates
  );

  // Un port = une balise : les bateaux d'un même port partagent les mêmes
  // coordonnées (celles du port), donc les regrouper par coordonnées suffit.
  const ports = new Map<string, (Boat & { coordinates: { lat: number; lng: number } })[]>();
  for (const boat of located) {
    const key = `${boat.coordinates.lat},${boat.coordinates.lng}`;
    const group = ports.get(key);
    if (group) group.push(boat);
    else ports.set(key, [boat]);
  }

  const bounds: LatLngBoundsExpression | undefined =
    located.length > 1 ? located.map((b) => [b.coordinates.lat, b.coordinates.lng]) : undefined;

  const fallbackView: [number, number] =
    located.length > 0 ? [located[0].coordinates.lat, located[0].coordinates.lng] : [43.2965, 5.3698];

  const singleView = bounds == null ? { center: fallbackView, zoom: 9 } : {};

  return (
    <MapContainer
      {...singleView}
      bounds={bounds}
      boundsOptions={{ padding: [30, 30] }}
      scrollWheelZoom
      className="boats-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {(onBoundsChange || resetSignal !== undefined) && (
        <MapViewport
          onBoundsChange={onBoundsChange}
          resetSignal={resetSignal}
          fitBounds={bounds}
          fallbackView={{ center: fallbackView, zoom: 9 }}
        />
      )}
      {Array.from(ports, ([key, group]) => (
        <PortMarker key={key} boats={group} />
      ))}
    </MapContainer>
  );
}

"use client";

import "leaflet/dist/leaflet.css";
import type { LatLngBoundsExpression } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import type { Boat } from "@/entities/boat";
import PortMarker from "./PortMarker";

interface BoatsMapProps {
  boats: Boat[];
}

export default function BoatsMap({ boats }: BoatsMapProps) {
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

  const singleView =
    bounds == null
      ? {
          center: (located.length > 0
            ? [located[0].coordinates.lat, located[0].coordinates.lng]
            : [43.2965, 5.3698]) as [number, number],
          zoom: 9,
        }
      : {};

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
      {Array.from(ports, ([key, group]) => (
        <PortMarker key={key} boats={group} />
      ))}
    </MapContainer>
  );
}

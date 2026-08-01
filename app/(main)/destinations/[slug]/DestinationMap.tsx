"use client";

import "leaflet/dist/leaflet.css";
import { divIcon, type LatLngBoundsExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import Link from "next/link";
import type { Boat } from "@/entities/boat";
import PortMarker from "@/widgets/boats-catalog/ui/PortMarker";
import { formatPrice } from "@/shared/lib/utils";

export type DestinationBoatMarker = Boat & { coordinates: { lat: number; lng: number } };

const BRAND_PIN_GLYPH = (className: string) =>
  `<svg class="${className}" viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
  '<path d="M24 57C13 44 6 33 6 21.5 6 11 14.1 3 24 3s18 8 18 18.5C42 33 35 44 24 57Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />' +
  '<path d="M24 14 34 34H14Z" fill="currentColor" />' +
  '<path d="M10 34Q24 30 38 34Q24 42 10 34Z" fill="currentColor" />' +
  '<path d="M8 47q8-5 16 0t16 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />' +
  "</svg>";

/** Un port = une balise : les bateaux d'un même port partagent les mêmes coordonnées
 *  (celles du port), donc les regrouper par coordonnées suffit — même logique que la
 *  carte du catalogue (@/widgets/boats-catalog/ui/BoatsMap), pour une carte identique. */
function groupByPort(boats: DestinationBoatMarker[]): DestinationBoatMarker[][] {
  const ports = new Map<string, DestinationBoatMarker[]>();
  for (const boat of boats) {
    const key = `${boat.coordinates.lat},${boat.coordinates.lng}`;
    const group = ports.get(key);
    if (group) group.push(boat);
    else ports.set(key, [boat]);
  }
  return Array.from(ports.values());
}

const hubIcon = divIcon({
  className: "dest-map-marker",
  html: `
    <span class="dest-map-hub">
      <span class="dest-map-hub-ring"></span>
      <span class="dest-map-hub-ring dest-map-hub-ring--delay"></span>
      <span class="dest-map-hub-pin">${BRAND_PIN_GLYPH("dest-map-hub-glyph")}</span>
    </span>`,
  iconSize: [46, 46],
  iconAnchor: [23, 23],
  popupAnchor: [0, -26],
});

interface DestinationMapProps {
  center: { lat: number; lng: number };
  name: string;
  slug: string;
  boatCount: number;
  priceFrom: number;
  boats: DestinationBoatMarker[];
}

export default function DestinationMap({ center, name, slug, boatCount, priceFrom, boats }: DestinationMapProps) {
  const hasRealBoats = boats.length > 0;
  const ports = groupByPort(boats);

  const bounds: LatLngBoundsExpression | undefined =
    hasRealBoats && boats.length > 1 ? boats.map((b) => [b.coordinates.lat, b.coordinates.lng]) : undefined;

  const singleView = !bounds
    ? {
        center: hasRealBoats
          ? ([boats[0].coordinates.lat, boats[0].coordinates.lng] as [number, number])
          : ([center.lat, center.lng] as [number, number]),
        zoom: hasRealBoats ? 11 : 8,
      }
    : {};

  return (
    <MapContainer
      {...singleView}
      bounds={bounds}
      boundsOptions={{ padding: [40, 40] }}
      scrollWheelZoom={false}
      className="dest-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {hasRealBoats ? (
        ports.map((group) => (
          <PortMarker key={`${group[0].coordinates.lat},${group[0].coordinates.lng}`} boats={group} />
        ))
      ) : (
        <>
          <Circle
            center={[center.lat, center.lng]}
            radius={28000}
            pathOptions={{ color: "#114B6B", weight: 1, fillColor: "#114B6B", fillOpacity: 0.08 }}
          />
          <Marker position={[center.lat, center.lng]} icon={hubIcon}>
            <Popup>
              <div className="dest-map-popup">
                <strong>{name}</strong>
                <span>
                  <i className="fa-solid fa-sailboat" aria-hidden="true" /> {boatCount} bateaux dans la zone
                </span>
                <span className="dest-map-popup-price">Dès {formatPrice(priceFrom)} / jour</span>
                <Link href={`/bateaux?destination=${encodeURIComponent(slug)}`} className="btn btn-primary btn-sm">
                  Explorer le catalogue
                </Link>
              </div>
            </Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}

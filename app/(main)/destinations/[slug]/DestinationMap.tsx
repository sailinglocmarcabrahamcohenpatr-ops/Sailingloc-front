"use client";

import "leaflet/dist/leaflet.css";
import { divIcon, type LatLngBoundsExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import Link from "next/link";
import { formatPrice } from "@/shared/lib/utils";

export interface DestinationBoatMarker {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  pricePerDay: number;
}

const boatIcon = divIcon({
  className: "dest-map-marker",
  html: '<span class="dest-map-pin"><i class="fa-solid fa-anchor" aria-hidden="true"></i></span>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -32],
});

/**
 * Plusieurs bateaux partagent souvent exactement les mêmes coordonnées (même port) : sans
 * correction, leurs marqueurs se superposent pile et n'en laissent voir qu'un seul. On les
 * disperse en petit cercle autour du point réel — générique, donc valable pour tout nouveau
 * bateau ajouté au même port, pas seulement les cas déjà connus.
 */
function spreadOverlappingBoats(boats: DestinationBoatMarker[]): DestinationBoatMarker[] {
  const groups = new Map<string, DestinationBoatMarker[]>();
  for (const boat of boats) {
    const key = `${boat.lat.toFixed(5)},${boat.lng.toFixed(5)}`;
    const group = groups.get(key);
    if (group) group.push(boat);
    else groups.set(key, [boat]);
  }

  const result: DestinationBoatMarker[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }
    const radius = 0.0012 + Math.min(group.length, 8) * 0.00015;
    const latRad = (group[0].lat * Math.PI) / 180;
    group.forEach((boat, i) => {
      const angle = (2 * Math.PI * i) / group.length;
      result.push({
        ...boat,
        lat: boat.lat + radius * Math.cos(angle),
        lng: boat.lng + (radius * Math.sin(angle)) / Math.max(Math.cos(latRad), 0.15),
      });
    });
  }
  return result;
}

const hubIcon = divIcon({
  className: "dest-map-marker",
  html: `
    <span class="dest-map-hub">
      <span class="dest-map-hub-ring"></span>
      <span class="dest-map-hub-ring dest-map-hub-ring--delay"></span>
      <span class="dest-map-hub-pin"><i class="fa-solid fa-sailboat" aria-hidden="true"></i></span>
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

export default function DestinationMap({ center, name, slug, boatCount, priceFrom, boats: rawBoats }: DestinationMapProps) {
  const hasRealBoats = rawBoats.length > 0;
  const boats = spreadOverlappingBoats(rawBoats);

  const bounds: LatLngBoundsExpression | undefined =
    hasRealBoats && boats.length > 1 ? boats.map((b) => [b.lat, b.lng]) : undefined;

  const singleView = !bounds
    ? {
        center: hasRealBoats ? ([boats[0].lat, boats[0].lng] as [number, number]) : ([center.lat, center.lng] as [number, number]),
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
        boats.map((boat) => (
          <Marker key={boat.id} position={[boat.lat, boat.lng]} icon={boatIcon}>
            <Popup>
              <div className="dest-map-popup">
                <strong>{boat.name}</strong>
                <span>
                  <i className="fa-solid fa-location-dot" aria-hidden="true" /> {boat.location}
                </span>
                <span className="dest-map-popup-price">{formatPrice(boat.pricePerDay)} / jour</span>
                <Link href={`/bateaux/${boat.id}`} className="btn btn-primary btn-sm">
                  Voir le bateau
                </Link>
              </div>
            </Popup>
          </Marker>
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

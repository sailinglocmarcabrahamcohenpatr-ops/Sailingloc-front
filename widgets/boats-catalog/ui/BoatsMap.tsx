"use client";

import "leaflet/dist/leaflet.css";
import { divIcon, type LatLngBoundsExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import type { Boat } from "@/entities/boat";
import { formatPrice } from "@/shared/lib/utils";

const boatIcon = divIcon({
  className: "boat-map-marker",
  html: '<span class="boat-map-marker-pin"><i class="fa-solid fa-anchor" aria-hidden="true"></i></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30],
});

interface BoatsMapProps {
  boats: Boat[];
}

export default function BoatsMap({ boats }: BoatsMapProps) {
  const located = boats.filter(
    (b): b is Boat & { coordinates: { lat: number; lng: number } } => !!b.coordinates
  );

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
      {located.map((boat) => (
        <Marker key={boat.id} position={[boat.coordinates.lat, boat.coordinates.lng]} icon={boatIcon}>
          <Popup>
            <div className="boat-map-popup">
              <strong>{boat.name}</strong>
              <span>
                <i className="fa-solid fa-location-dot" aria-hidden="true" /> {boat.location}
              </span>
              <span>
                <i className="fa-solid fa-user" aria-hidden="true" /> Propriétaire : {boat.owner.name}
              </span>
              <span className="boat-map-popup-price">{formatPrice(boat.pricePerDay)} / jour</span>
              <Link href={`/bateaux/${boat.id}`} className="btn btn-primary btn-sm">
                Voir le bateau
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

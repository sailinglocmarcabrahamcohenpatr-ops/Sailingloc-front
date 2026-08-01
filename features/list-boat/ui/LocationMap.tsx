"use client";

import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

const pinIcon = divIcon({
  className: "boat-map-marker",
  html:
    '<span class="boat-map-marker-pin boat-map-marker-pin--sm">' +
    '<svg class="boat-map-marker-glyph" viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M24 57C13 44 6 33 6 21.5 6 11 14.1 3 24 3s18 8 18 18.5C42 33 35 44 24 57Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />' +
    '<path d="M24 14 34 34H14Z" fill="currentColor" />' +
    '<path d="M10 34Q24 30 38 34Q24 42 10 34Z" fill="currentColor" />' +
    '<path d="M8 47q8-5 16 0t16 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />' +
    "</svg></span>",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

interface LocationMapProps {
  lat: number;
  lng: number;
}

export default function LocationMap({ lat, lng }: LocationMapProps) {
  return (
    <MapContainer center={[lat, lng]} zoom={11} scrollWheelZoom={false} className="location-preview-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={pinIcon} />
    </MapContainer>
  );
}

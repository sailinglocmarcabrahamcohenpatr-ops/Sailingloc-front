"use client";

import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

const pinIcon = divIcon({
  className: "boat-map-marker",
  html: '<span class="boat-map-marker-pin"><i class="fa-solid fa-anchor" aria-hidden="true"></i></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
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

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { reservationsApi, boatsApi, useAuth } from "@/shared/lib";
import { adaptBoatFromApi } from "@/entities/boat";
import type { BoatAPI } from "@/shared/lib";
import "./radar.css";

const MAP_ZOOM_OPTIONS = [4, 6, 8, 10, 12, 14];
const MAP_HEIGHT_PX = 640;
/** Marseille — cohérent avec le centre par défaut utilisé ailleurs dans l'app (ex. BoatsMap). */
const DEFAULT_MAP_CENTER = { lat: 43.2965, lng: 5.3698 };

type RawTarget = {
  id: string;
  name: string;
  ville: string;
  lat: number;
  lng: number;
};

type Target = RawTarget & { distanceKm: number; bearingDeg: number };

type GeoStatus = "idle" | "locating" | "active" | "denied" | "unsupported";

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

/** Distance orthodromique en km entre deux points GPS. */
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Cap (0-360°, 0 = nord) du point 1 vers le point 2. */
function bearingDeg(lat1: number, lng1: number, lat2: number, lng2: number) {
  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const CARDINAL = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
function cardinalFor(deg: number) {
  return CARDINAL[Math.round(deg / 45) % 8];
}

export default function RadarContent() {
  const { user } = useAuth();

  const [geoStatus, setGeoStatus] = useState<GeoStatus>(() =>
    typeof navigator !== "undefined" && "geolocation" in navigator ? "locating" : "unsupported"
  );
  const [geoError, setGeoError] = useState("");
  const [position, setPosition] = useState<GeolocationPosition | null>(null);

  const [rawTargets, setRawTargets] = useState<RawTarget[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(true);

  /* Centre de la carte de trafic maritime en direct : se cale une seule fois
     sur la première position GPS obtenue (figée dans le callback de
     watchPosition, pas recalculée à chaque tick, pour ne pas recharger
     l'iframe en boucle) ; le bouton « Recentrer » la remet à jour à la demande. */
  const [mapZoom, setMapZoom] = useState(12);
  const [manualMapCenter, setManualMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [initialMapCenter, setInitialMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  /* Compteur inclus dans la clé de l'iframe pour forcer son rechargement à
     chaque clic, même quand les coordonnées n'ont pas assez bougé pour
     changer la clé lat/lng (sinon le clic semble ne rien faire). */
  const [recenterNonce, setRecenterNonce] = useState(0);
  const mapCenter = manualMapCenter ?? initialMapCenter ?? DEFAULT_MAP_CENTER;

  const recenterLiveMap = () => {
    if (!position) return;
    setManualMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
    setRecenterNonce((n) => n + 1);
  };

  /* Géolocalisation en continu (uniquement pour un locataire, sur cette page). */
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos);
        setGeoStatus("active");
        setGeoError("");
        setInitialMapCenter((prev) => prev ?? { lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setGeoStatus("denied");
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Accès à la position refusé. Autorisez la géolocalisation dans votre navigateur."
            : "Position indisponible pour le moment."
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  /* Réservations confirmées/à venir du locataire → position du port de chaque bateau loué. */
  useEffect(() => {
    let cancelled = false;
    reservationsApi
      .getAll()
      .then(async (list) => {
        const today = new Date().toISOString().slice(0, 10);
        const active = list.filter(
          (r) => (r.statutReservation ?? "").toLowerCase().includes("confirm") && r.dateFin >= today
        );
        if (active.length === 0) return [];
        const boats = await boatsApi.getAll().catch(() => [] as BoatAPI[]);
        const boatsById = new Map(boats.map((b) => [b.id, b]));
        return active
          .map((r): RawTarget | null => {
            const boatId = r.bateau?.id;
            const full = boatId != null ? boatsById.get(boatId) : undefined;
            const coords = full ? adaptBoatFromApi(full).coordinates : undefined;
            if (!coords) return null;
            return {
              id: String(r.id),
              name: r.bateau?.nomBateau ?? `Bateau #${boatId ?? "?"}`,
              ville: r.bateau?.port?.ville ?? "",
              lat: coords.lat,
              lng: coords.lng,
            };
          })
          .filter((t): t is RawTarget => t !== null);
      })
      .then((targets) => {
        if (!cancelled) setRawTargets(targets);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingTargets(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const targets = useMemo<Target[]>(() => {
    if (!position) return [];
    const { latitude, longitude } = position.coords;
    return rawTargets
      .map((t) => ({
        ...t,
        distanceKm: distanceKm(latitude, longitude, t.lat, t.lng),
        bearingDeg: bearingDeg(latitude, longitude, t.lat, t.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [position, rawTargets]);

  if (user && user.role !== "locataire") {
    return (
      <div className="messages-empty" style={{ minHeight: 260 }}>
        <i className="fa-solid fa-lock" aria-hidden="true" />
        <p>Le radar est réservé aux locataires.</p>
      </div>
    );
  }

  return (
    <div className="radar-layout">
      <div className="dash-card radar-live-map-card">
        <div className="dash-card-hd">
          <h3>Trafic maritime en direct</h3>
          <div className="radar-live-map-controls">
            <select
              className="radar-range-select"
              value={mapZoom}
              onChange={(e) => setMapZoom(Number(e.target.value))}
              aria-label="Zoom de la carte"
            >
              {MAP_ZOOM_OPTIONS.map((z) => (
                <option key={z} value={z}>
                  Zoom {z}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-outline btn-sm" onClick={recenterLiveMap} disabled={!position}>
              <i className="fa-solid fa-location-crosshairs" /> Recentrer sur ma position
            </button>
          </div>
        </div>

        <p className="radar-live-map-hint">
          Position de tous les navires environnants détectés par AIS (trafic public mondial, pas seulement les
          bateaux SailingLoc) — nécessite une connexion internet à bord.
          {geoStatus === "locating" && " Localisation en cours…"}
          {geoStatus === "denied" && ` ${geoError}`}
          {geoStatus === "unsupported" && " Géolocalisation non disponible sur cet appareil."}
        </p>

        <iframe
          key={`${mapCenter.lat.toFixed(3)},${mapCenter.lng.toFixed(3)},${mapZoom},${recenterNonce}`}
          src={`/marine-radar-widget.html?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${mapZoom}&height=${MAP_HEIGHT_PX}`}
          className="radar-live-map-iframe"
          style={{ height: MAP_HEIGHT_PX }}
          title="Trafic maritime en direct"
          loading="lazy"
        />

        <p className="radar-live-map-credit">
          Données AIS fournies par{" "}
          <a href="https://www.vesselfinder.com/" target="_blank" rel="noreferrer">
            VesselFinder
          </a>
          .
        </p>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd">
          <h3>Mes bateaux réservés</h3>
        </div>

        {loadingTargets ? (
          <p style={{ color: "var(--text-2)" }}>Chargement…</p>
        ) : geoStatus !== "active" ? (
          <p style={{ color: "var(--text-2)" }}>
            Activez la géolocalisation pour calculer la distance et le cap vers vos bateaux réservés.
          </p>
        ) : targets.length === 0 ? (
          <div className="messages-empty" style={{ minHeight: 200 }}>
            <i className="fa-solid fa-sailboat" aria-hidden="true" />
            <p>Aucune réservation en cours à afficher.</p>
            <Link href="/bateaux" className="btn btn-outline btn-sm">
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: ".75em" }} /> Trouver un bateau
            </Link>
          </div>
        ) : (
          <ul className="radar-target-list">
            {targets.map((t) => (
              <li key={t.id}>
                <Link href={`/profil/reservations/${t.id}`}>
                  <strong>{t.name}</strong>
                  {t.ville && <span className="radar-target-ville"> · {t.ville}</span>}
                </Link>
                <span>
                  {t.distanceKm.toFixed(1)} km · cap {Math.round(t.bearingDeg)}° ({cardinalFor(t.bearingDeg)})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

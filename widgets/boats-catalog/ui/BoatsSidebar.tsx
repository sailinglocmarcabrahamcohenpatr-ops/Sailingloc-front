"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/* ── Types ──────────────────────────────────────────── */
interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number;
}

interface DailyForecast {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
  windspeed_10m_max: number[];
  sunrise: string[];
  sunset: string[];
  precipitation_probability_max: number[];
  uv_index_max: number[];
}

interface WeatherData {
  current_weather: CurrentWeather;
  daily: DailyForecast;
}

interface GeoLocation { latitude: number; longitude: number; name: string; }

/* ── Helpers ─────────────────────────────────────────── */
const DAYS_FR = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const DEFAULT_LOC: GeoLocation = { latitude: 43.2965, longitude: 5.3698, name: "Marseille" };

function weatherInfo(code: number, isDay = true) {
  if (code === 0)  return { icon: isDay ? "fa-sun" : "fa-moon",         desc: "Ciel dégagé",          color: "#FFD700" };
  if (code <= 2)   return { icon: "fa-cloud-sun",                        desc: "Partiellement nuageux", color: "#FFA040" };
  if (code === 3)  return { icon: "fa-cloud",                            desc: "Couvert",               color: "#D1D5DB" };
  if (code <= 48)  return { icon: "fa-smog",                             desc: "Brouillard",            color: "#9CA3AF" };
  if (code <= 55)  return { icon: "fa-cloud-rain",                       desc: "Bruine",                color: "#93C5FD" };
  if (code <= 65)  return { icon: "fa-cloud-rain",                       desc: "Pluie",                 color: "#60A5FA" };
  if (code <= 77)  return { icon: "fa-snowflake",                        desc: "Neige",                 color: "#BAE6FD" };
  if (code <= 82)  return { icon: "fa-cloud-showers-heavy",              desc: "Averses",               color: "#3B82F6" };
  return               { icon: "fa-bolt",                            desc: "Orage",                 color: "#F59E0B" };
}

function windDir(deg: number) {
  return ["N", "NE", "E", "SE", "S", "SO", "O", "NO"][Math.round(deg / 45) % 8];
}

function navCondition(wind: number): { label: string; color: string } {
  if (wind < 20) return { label: "Excellente", color: "#4ADE80" };
  if (wind < 35) return { label: "Bonne",       color: "#A3E635" };
  if (wind < 50) return { label: "Modérée",     color: "#FCD34D" };
  return              { label: "Difficile",   color: "#F87171" };
}

function uvLabel(uv: number) {
  if (uv <= 2)  return "Faible";
  if (uv <= 5)  return "Modéré";
  if (uv <= 7)  return "Élevé";
  if (uv <= 10) return "Très élevé";
  return "Extrême";
}

function hhmm(iso?: string) {
  return iso?.split("T")?.[1]?.slice(0, 5) ?? "--:--";
}

async function geocode(place: string): Promise<GeoLocation> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=fr&format=json`
    );
    const data = await res.json();
    if (!data.results?.length) return DEFAULT_LOC;
    const r = data.results[0];
    return { latitude: r.latitude, longitude: r.longitude, name: r.name };
  } catch { return DEFAULT_LOC; }
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const qs = new URLSearchParams({
    latitude: String(lat), longitude: String(lon),
    current_weather: "true",
    daily: "temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,sunrise,sunset,precipitation_probability_max,uv_index_max",
    timezone: "auto",
    forecast_days: "7",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${qs}`);
  return res.json();
}

/* ── Component ───────────────────────────────────────── */
export default function BoatsSidebar() {
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination") ?? "";

  const [geo, setGeo] = useState<GeoLocation>(DEFAULT_LOC);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setWeather(null);
    (async () => {
      try {
        const loc = destination ? await geocode(destination) : DEFAULT_LOC;
        setGeo(loc);
        setWeather(await fetchWeather(loc.latitude, loc.longitude));
      } finally {
        setLoading(false);
      }
    })();
  }, [destination]);

  const cw    = weather?.current_weather;
  const daily = weather?.daily;
  const wi    = cw ? weatherInfo(cw.weathercode, cw.is_day === 1) : null;
  const nav   = cw ? navCondition(cw.windspeed) : null;

  return (
    <aside className="sidebar" aria-label="Informations complémentaires">

      {/* ── Weather card ───────────────────────────────── */}
      <div className="weather-card" role="region" aria-label="Météo locale">
        <div className="weather-location">
          <i className="fa-solid fa-location-dot" aria-hidden="true" />
          {geo.name} — Aujourd'hui
        </div>

        {loading ? (
          <div className="weather-loading">
            <i className="fa-solid fa-circle-notch fa-spin" />
          </div>
        ) : !weather ? (
          <div className="weather-loading">Données indisponibles</div>
        ) : (
          <>
            {/* Current */}
            <div className="weather-main">
              <div>
                <div className="weather-temp">
                  {Math.round(cw!.temperature)}<sup>°C</sup>
                </div>
                <div className="weather-desc">{wi!.desc}</div>
              </div>
              <div className="weather-icon" style={{ color: wi!.color }} aria-hidden="true">
                <i className={`fa-solid ${wi!.icon}`} />
              </div>
            </div>

            {/* Stats */}
            <div className="weather-grid">
              <div className="weather-stat">
                <div className="weather-stat-label">Vent</div>
                <div className="weather-stat-val">{Math.round(cw!.windspeed)} km/h</div>
                <div className="weather-stat-sub">{windDir(cw!.winddirection)} · {(cw!.windspeed / 1.852).toFixed(1)} nœuds</div>
              </div>
              <div className="weather-stat">
                <div className="weather-stat-label">UV</div>
                <div className="weather-stat-val">{Math.round(daily!.uv_index_max[0])}</div>
                <div className="weather-stat-sub">{uvLabel(daily!.uv_index_max[0])}</div>
              </div>
              <div className="weather-stat">
                <div className="weather-stat-label">Coucher</div>
                <div className="weather-stat-val">{hhmm(daily!.sunset[0])}</div>
                <div className="weather-stat-sub">Lever {hhmm(daily!.sunrise[0])}</div>
              </div>
              <div className="weather-stat">
                <div className="weather-stat-label">Précipitations</div>
                <div className="weather-stat-val">{daily!.precipitation_probability_max[0]}%</div>
                <div className="weather-stat-sub">
                  {daily!.precipitation_probability_max[0] < 20 ? "Peu probable"
                    : daily!.precipitation_probability_max[0] < 60 ? "Possible"
                    : "Probable"}
                </div>
              </div>
            </div>

            {/* Nav condition */}
            <div className="weather-rating">
              <div className="weather-rating-label">Conditions de navigation</div>
              <div className="weather-rating-val" style={{ color: nav!.color }}>
                {nav!.label} <i className="fa-solid fa-star" aria-hidden="true" />
              </div>
            </div>

            {/* 7-day forecast */}
            <div className="weather-forecast">
              <div className="weather-forecast-title">
                <i className="fa-solid fa-calendar-days" aria-hidden="true" />
                Prévisions 7 jours
              </div>
              <div className="weather-week">
                {daily!.time.map((date, i) => {
                  const dWI  = weatherInfo(daily!.weathercode[i]);
                  const name = i === 0 ? "Auj." : DAYS_FR[new Date(date + "T12:00:00").getDay()];
                  return (
                    <div key={date} className={`weather-day${i === 0 ? " today" : ""}`}>
                      <div className="weather-day-name">{name}</div>
                      <i className={`fa-solid ${dWI.icon} weather-day-icon`} style={{ color: dWI.color }} aria-hidden="true" />
                      <div className="weather-day-max">{Math.round(daily!.temperature_2m_max[i])}°</div>
                      <div className="weather-day-min">{Math.round(daily!.temperature_2m_min[i])}°</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Map card ───────────────────────────────────── */}
      <div className="map-card" role="region" aria-label="Carte">
        <div className="map-placeholder">
          <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
          <span>Voir sur la carte</span>
        </div>
        <div className="map-card-foot">
          <span>
            <i className="fa-solid fa-map-pin" style={{ color: "var(--primary)" }} aria-hidden="true" />{" "}
            140 bateaux
          </span>
          <Link href="#" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-map" aria-hidden="true" /> Carte
          </Link>
        </div>
      </div>

      {/* ── Info card ──────────────────────────────────── */}
      <div className="info-card" role="region" aria-label="Informations utiles">
        <h5>
          <i className="fa-solid fa-circle-info" style={{ color: "var(--primary)" }} aria-hidden="true" />{" "}
          Informations utiles
        </h5>
        {[
          { icon: "fa-shield-halved", label: "Assurance",                value: "Incluse dans le prix", badge: "Incluse" },
          { icon: "fa-credit-card",   label: "Paiement",                 value: "Sécurisé & garanti" },
          { icon: "fa-clock",         label: "Réponse du propriétaire",  value: "Sous 24h en moyenne" },
          { icon: "fa-headset",       label: "Support",                  value: "Lun – Ven, 9h – 18h" },
        ].map((row) => (
          <div key={row.label} className="info-row">
            <div className="info-row-icon">
              <i className={`fa-solid ${row.icon}`} aria-hidden="true" />
            </div>
            <div className="info-row-text">
              <small>{row.label}</small>
              <strong>{row.value}</strong>
            </div>
            {row.badge && <div className="info-row-badge">{row.badge}</div>}
          </div>
        ))}
      </div>

    </aside>
  );
}


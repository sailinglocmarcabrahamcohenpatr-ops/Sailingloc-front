"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./search-bar.css";

const BOAT_TYPES = [
  { value: "tous", label: "Tous types" },
  { value: "voilier", label: "Voilier" },
  { value: "catamaran", label: "Catamaran" },
  { value: "moteur", label: "Bateau moteur" },
  { value: "semi-rigide", label: "Semi-rigide" },
  { value: "habitable", label: "Habitable" },
];

export default function SearchBar() {
  const router = useRouter();
  const [dest, setDest] = useState("");
  const [boatType, setBoatType] = useState("tous");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (dest.trim()) params.set("destination", dest.trim());
    if (boatType !== "tous") params.set("type", boatType);
    if (arrival) params.set("arrivee", arrival);
    if (departure) params.set("depart", departure);
    router.push(`/bateaux${params.toString() ? "?" + params.toString() : ""}`);
  };

  return (
    <form className="search-card" onSubmit={handleSubmit} role="search" aria-label="Rechercher un bateau">
      <div className="search-fields">
        <div className="search-field">
          <label htmlFor="sb-dest">
            <i className="fa-solid fa-location-dot" aria-hidden="true" /> Destination
          </label>
          <input
            type="text"
            id="sb-dest"
            placeholder="Marseille, Cannes, Corse..."
            value={dest}
            onChange={(e) => setDest(e.target.value)}
          />
        </div>

        <div className="search-field">
          <label htmlFor="sb-type">
            <i className="fa-solid fa-sailboat" aria-hidden="true" /> Type de bateau
          </label>
          <select
            id="sb-type"
            value={boatType}
            onChange={(e) => setBoatType(e.target.value)}
          >
            {BOAT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="search-field">
          <label htmlFor="sb-arrival">
            <i className="fa-regular fa-calendar" aria-hidden="true" /> Arrivée
          </label>
          <input
            type="date"
            id="sb-arrival"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
          />
        </div>

        <div className="search-field">
          <label htmlFor="sb-departure">
            <i className="fa-regular fa-calendar" aria-hidden="true" /> Départ
          </label>
          <input
            type="date"
            id="sb-departure"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
          />
        </div>

        <div className="search-btn-wrap">
          <button type="submit" className="btn btn-primary search-btn">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <span>Rechercher</span>
          </button>
        </div>
      </div>
    </form>
  );
}

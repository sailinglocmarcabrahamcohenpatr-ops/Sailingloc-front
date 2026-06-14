"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBarCompact() {
  const router = useRouter();
  const [dest, setDest] = useState("Marseille — Visiteurs");
  const [arrival, setArrival] = useState("2025-07-10");
  const [departure, setDeparture] = useState("2025-07-15");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (dest.trim()) params.set("destination", dest.trim());
    if (arrival) params.set("arrivee", arrival);
    if (departure) params.set("depart", departure);
    const qs = params.toString();
    router.push(`/bateaux${qs ? "?" + qs : ""}`);
  };

  return (
    <div className="cat-search-bar">
      <div className="cat-search-field">
        <label htmlFor="cat-dest">Destination</label>
        <input
          type="text"
          id="cat-dest"
          value={dest}
          onChange={(e) => setDest(e.target.value)}
        />
      </div>
      <div className="cat-search-field">
        <label htmlFor="cat-budget">Budget</label>
        <input
          type="text"
          id="cat-budget"
          placeholder="€1 / j — €4 000 / j"
        />
      </div>
      <div className="cat-search-field">
        <label htmlFor="cat-arrival">Arrivée</label>
        <input
          type="date"
          id="cat-arrival"
          value={arrival}
          onChange={(e) => setArrival(e.target.value)}
        />
      </div>
      <div className="cat-search-field">
        <label htmlFor="cat-departure">Départ</label>
        <input
          type="date"
          id="cat-departure"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
        />
      </div>
      <button className="cat-search-btn" onClick={handleSearch} type="button">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />{" "}
        Rechercher
      </button>
    </div>
  );
}

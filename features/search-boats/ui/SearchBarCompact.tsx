"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBarCompact() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [dest,      setDest]      = useState(searchParams.get("destination") ?? "");
  const [dateRange, setDateRange] = useState("");
  const [boatType,  setBoatType]  = useState(searchParams.get("type") ?? "");
  const [skipper,   setSkipper]   = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (dest.trim())   params.set("destination", dest.trim());
    if (boatType)      params.set("type", boatType);
    if (skipper)       params.set("skipper", skipper);
    const qs = params.toString();
    router.push(`/bateaux${qs ? "?" + qs : ""}`);
  };

  return (
    <div className="search-pill">

      {/* Destination */}
      <div className="search-pill-field">
        <i className="fa-solid fa-location-dot search-pill-icon" aria-hidden="true" />
        <input
          type="text"
          placeholder="Destination"
          value={dest}
          onChange={e => setDest(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          aria-label="Destination"
        />
        {dest && (
          <button className="search-pill-clear" onClick={() => setDest("")} type="button" aria-label="Effacer">
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>

      <div className="search-pill-sep" />

      {/* Dates */}
      <div className="search-pill-field">
        <i className="fa-regular fa-calendar search-pill-icon" aria-hidden="true" />
        <input
          type="text"
          placeholder="Dates"
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
          aria-label="Dates"
        />
      </div>

      <div className="search-pill-sep" />

      {/* Type de bateau */}
      <div className="search-pill-select-wrap">
        <select
          className="search-pill-select"
          value={boatType}
          onChange={e => setBoatType(e.target.value)}
          aria-label="Type de bateau"
        >
          <option value="">Bateau</option>
          <option value="voilier">Voilier</option>
          <option value="catamaran">Catamaran</option>
          <option value="moteur">Moteur</option>
          <option value="sans-permis">Sans permis</option>
          <option value="habitable">Habitable</option>
          <option value="semi-rigide">Semi-rigide</option>
        </select>
        <i className="fa-solid fa-chevron-down search-pill-chevron" aria-hidden="true" />
      </div>

      <div className="search-pill-sep" />

      {/* Type de location */}
      <div className="search-pill-select-wrap">
        <select
          className="search-pill-select"
          value={skipper}
          onChange={e => setSkipper(e.target.value)}
          aria-label="Type de location"
        >
          <option value="">Location</option>
          <option value="avec">Avec skipper</option>
          <option value="sans">Sans skipper</option>
        </select>
        <i className="fa-solid fa-chevron-down search-pill-chevron" aria-hidden="true" />
      </div>

      {/* Search button (hidden visually, triggered by Enter or FiltersBar icon) */}
      <button className="search-pill-submit" onClick={handleSearch} type="button" aria-label="Rechercher">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
      </button>

    </div>
  );
}

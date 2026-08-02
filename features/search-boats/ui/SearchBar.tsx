"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BoatTypeIcon } from "@/entities/boat";
import type { BoatType } from "@/entities/boat";
import { useI18n, localizeHref } from "@/shared/i18n";
import SearchSelect from "./SearchSelect";
import DateField from "./DateField";
import "./search-bar.css";

const BOAT_TYPE_VALUES = ["tous", "voilier", "catamaran", "moteur", "semi-rigide", "habitable"] as const;

export default function SearchBar() {
  const router = useRouter();
  const { locale, dict } = useI18n();
  const t = dict.search;
  const boatTypeLabels = dict.boatTypes;
  const [dest, setDest] = useState("");
  const [boatType, setBoatType] = useState("tous");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");

  const BOAT_TYPES = BOAT_TYPE_VALUES.map((value) => ({ value, label: boatTypeLabels[value] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (dest.trim()) params.set("destination", dest.trim());
    if (boatType !== "tous") params.set("type", boatType);
    if (arrival) params.set("arrivee", arrival);
    if (departure) params.set("depart", departure);
    const target = `/bateaux${params.toString() ? "?" + params.toString() : ""}`;
    router.push(localizeHref(target, locale));
  };

  return (
    <form className="search-card" onSubmit={handleSubmit} role="search" aria-label={t.aria}>
      <div className="search-fields">
        <div className="search-field">
          <label htmlFor="sb-dest">
            <i className="fa-solid fa-location-dot" aria-hidden="true" /> {t.destination}
          </label>
          <input
            type="text"
            id="sb-dest"
            placeholder={t.destinationPlaceholder}
            value={dest}
            onChange={(e) => setDest(e.target.value)}
          />
        </div>

        <div className="search-field">
          <label htmlFor="sb-type">
            <i className="fa-solid fa-sailboat" aria-hidden="true" /> {t.boatType}
          </label>
          <SearchSelect
            id="sb-type"
            value={boatType}
            options={BOAT_TYPES}
            onChange={setBoatType}
            renderIcon={(v) =>
              v === "tous" ? (
                <i className="fa-solid fa-ship" aria-hidden="true" />
              ) : (
                <BoatTypeIcon type={v as BoatType} />
              )
            }
          />
        </div>

        <div className="search-field">
          <label htmlFor="sb-arrival">
            <i className="fa-regular fa-calendar" aria-hidden="true" /> {t.arrival}
          </label>
          <DateField
            id="sb-arrival"
            value={arrival}
            onChange={setArrival}
          />
        </div>

        <div className="search-field">
          <label htmlFor="sb-departure">
            <i className="fa-regular fa-calendar" aria-hidden="true" /> {t.departure}
          </label>
          <DateField
            id="sb-departure"
            value={departure}
            onChange={setDeparture}
            min={arrival}
            align="right"
          />
        </div>

        <div className="search-btn-wrap">
          <button type="submit" className="btn btn-primary search-btn">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <span>{t.submit}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

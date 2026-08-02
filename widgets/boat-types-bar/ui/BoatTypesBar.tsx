"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { BOAT_TYPES } from "@/shared/config";
import type { BoatType } from "@/shared/types";
import "./boat-types-bar.css";

export default function BoatTypesBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeType = (searchParams.get("type") as BoatType) ?? "tous";

  const handleClick = (type: BoatType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "tous") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    const qs = params.toString();
    router.push(`/bateaux${qs ? "?" + qs : ""}`);
  };

  return (
    <section
      className="boat-types-section"
      aria-label="Filtrer par type de bateau"
    >
      <div className="container">
        <div className="boat-types-row" role="list">
          {BOAT_TYPES.map((bt) => (
            <button
              key={bt.value}
              role="listitem"
              className={`boat-type-btn${activeType === bt.value ? " active" : ""}`}
              onClick={() => handleClick(bt.value)}
              aria-pressed={activeType === bt.value}
            >
              <i className={`fa-solid ${bt.icon} icon`} aria-hidden="true" />
              <span>{bt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

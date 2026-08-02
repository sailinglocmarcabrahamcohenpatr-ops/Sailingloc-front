import type { Metadata } from "next";
import RadarContent from "./RadarContent";

export const metadata: Metadata = { title: "Radar — SailingLoc" };

export default function RadarPage() {
  return (
    <div className="dash-page">
      <div className="radar-hero">
        <div className="radar-hero-icon">
          <i className="fa-solid fa-satellite-dish" aria-hidden="true" />
        </div>
        <div className="radar-hero-text">
          <h1 className="radar-hero-title">
            Radar
            <span className="radar-live-badge">
              <span className="radar-live-dot" aria-hidden="true" /> En direct
            </span>
          </h1>
          <p className="radar-hero-sub">Repérez-vous en mer et suivez vos bateaux réservés</p>
        </div>
      </div>

      <RadarContent />
    </div>
  );
}

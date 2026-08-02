import type { Metadata } from "next";
import RadarContent from "./RadarContent";

export const metadata: Metadata = { title: "Radar — SailingLoc" };

export default function RadarPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Radar</h1>
          <p className="dash-sub">Repérez-vous en mer et suivez vos bateaux réservés</p>
        </div>
      </div>

      <RadarContent />
    </div>
  );
}

import type { Metadata } from "next";
import FavorisContent from "./FavorisContent";

export const metadata: Metadata = { title: "Favoris — SailingLoc" };

export default function FavorisPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Favoris</h1>
          <p className="dash-sub">Les bateaux que vous avez enregistrés</p>
        </div>
      </div>

      <FavorisContent />
    </div>
  );
}

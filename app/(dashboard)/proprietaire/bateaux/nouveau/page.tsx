import type { Metadata } from "next";
import { ListBoatForm } from "@/features/list-boat";

export const metadata: Metadata = { title: "Ajouter un bateau · SailingLoc" };

export default function NouveauBateauPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Ajouter un bateau</h1>
          <p className="dash-sub">Complétez les 5 étapes pour publier votre annonce.</p>
        </div>
      </div>
      <ListBoatForm />
    </div>
  );
}

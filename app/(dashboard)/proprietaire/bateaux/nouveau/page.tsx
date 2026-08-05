import type { Metadata } from "next";
import { ListBoatForm } from "@/features/list-boat";
import { getRequestLocale, getDictionary } from "@/shared/i18n/get-dictionary";

export const metadata: Metadata = { title: "Ajouter un bateau · SailingLoc" };

export default async function NouveauBateauPage() {
  const t = getDictionary(await getRequestLocale()).nouveauBateauPage;
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">{t.title}</h1>
          <p className="dash-sub">{t.sub}</p>
        </div>
      </div>
      <ListBoatForm />
    </div>
  );
}

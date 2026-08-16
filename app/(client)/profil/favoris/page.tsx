import type { Metadata } from "next";
import FavorisContent from "./FavorisContent";
import { getRequestLocale, getDictionary } from "@/shared/i18n/get-dictionary";

export const metadata: Metadata = { title: "Favoris — SailingLoc" };

export default async function FavorisPage() {
  const t = getDictionary(await getRequestLocale()).favorisPage;
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">{t.title}</h1>
          <p className="dash-sub">{t.sub}</p>
        </div>
      </div>

      <FavorisContent />
    </div>
  );
}

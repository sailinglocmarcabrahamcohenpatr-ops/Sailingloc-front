import type { Metadata } from "next";
import Link from "next/link";

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

      <div className="messages-empty" style={{ minHeight: 320 }}>
        <i className="fa-solid fa-heart" aria-hidden="true" />
        <p>Vous n&apos;avez pas encore de favoris.</p>
        <Link href="/bateaux" className="btn btn-outline btn-sm">
          <i className="fa-solid fa-magnifying-glass" style={{ fontSize: ".75em" }} /> Trouver un bateau
        </Link>
      </div>
    </div>
  );
}

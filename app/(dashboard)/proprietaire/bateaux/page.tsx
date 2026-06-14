import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Mes bateaux" };

const MY_BOATS: Array<{
  id: string; name: string; type: string; location: string;
  pricePerDay: number; rating: number; reviews: number;
  status: BoatStatus; imageSeed: string; reservations: number; revenue: number;
}> = [
  { id: "sun-odyssey-440", name: "Sun Odyssey 440", type: "Voilier", location: "Marseille, Vieux-Port", pricePerDay: 890, rating: 4.9, reviews: 47, status: "active", imageSeed: "sun-odyssey", reservations: 12, revenue: 31200 },
  { id: "leopard-45", name: "Leopard 45 Catamaran", type: "Catamaran", location: "Cannes, Vieux-Port", pricePerDay: 1650, rating: 4.8, reviews: 23, status: "active", imageSeed: "catamaran6", reservations: 8, revenue: 41800 },
  { id: "dufour-430", name: "Dufour 430", type: "Voilier", location: "Cassis", pricePerDay: 480, rating: 0, reviews: 0, status: "pending", imageSeed: "boat-sail5", reservations: 0, revenue: 0 },
];

type BoatStatus = "active" | "inactive" | "pending";

const STATUS_MAP: Record<BoatStatus, { label: string; cls: string }> = {
  active: { label: "Publié", cls: "badge-status green" },
  inactive: { label: "Désactivé", cls: "badge-status grey" },
  pending: { label: "En révision", cls: "badge-status orange" },
};

export default function OwnerBoatsPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Mes bateaux</h1>
          <p className="dash-sub">{MY_BOATS.length} annonce{MY_BOATS.length > 1 ? "s" : ""} sur SailingLoc</p>
        </div>
        <Link href="/inscrire-bateau" className="btn btn-primary">
          <i className="fa-solid fa-plus" /> Ajouter un bateau
        </Link>
      </div>

      <div className="owner-boats-list">
        {MY_BOATS.map((boat) => (
          <div key={boat.id} className="owner-boat-card">
            <div className="owner-boat-img">
              <Image
                src={`https://picsum.photos/seed/${boat.imageSeed}/400/300`}
                alt={boat.name}
                fill
                sizes="160px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="owner-boat-info">
              <div className="owner-boat-hd">
                <div>
                  <span className={STATUS_MAP[boat.status].cls}>{STATUS_MAP[boat.status].label}</span>
                  <h3>{boat.name}</h3>
                  <p><i className="fa-solid fa-location-dot" /> {boat.location} · {boat.type}</p>
                </div>
                <div className="owner-boat-price">
                  <strong>{boat.pricePerDay.toLocaleString("fr-FR")} €</strong>
                  <span>/ jour</span>
                </div>
              </div>
              <div className="owner-boat-stats">
                <div className="owner-boat-stat">
                  <i className="fa-solid fa-calendar-check" />
                  <span>{boat.reservations} réservation{boat.reservations !== 1 ? "s" : ""}</span>
                </div>
                <div className="owner-boat-stat">
                  <i className="fa-solid fa-euro-sign" />
                  <span>{boat.revenue.toLocaleString("fr-FR")} € générés</span>
                </div>
                {boat.rating > 0 && (
                  <div className="owner-boat-stat">
                    <i className="fa-solid fa-star" style={{ color: "var(--star)" }} />
                    <span>{boat.rating} ({boat.reviews} avis)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="owner-boat-actions">
              <Link href={`/bateaux/${boat.id}`} className="btn btn-ghost btn-sm" target="_blank" rel="noopener">
                <i className="fa-solid fa-eye" /> Voir
              </Link>
              <button className="btn btn-outline btn-sm">
                <i className="fa-solid fa-pen-to-square" /> Modifier
              </button>
              {boat.status === "active" ? (
                <button className="btn btn-ghost btn-sm">
                  <i className="fa-solid fa-pause" /> Désactiver
                </button>
              ) : boat.status === "inactive" ? (
                <button className="btn btn-ghost btn-sm">
                  <i className="fa-solid fa-play" /> Activer
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

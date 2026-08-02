"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { favorisApi } from "@/shared/lib";
import { adaptBoatFromApi, BoatCard } from "@/entities/boat";
import type { Boat } from "@/entities/boat";
import { HeartButton } from "@/features/toggle-favorite";

export default function FavorisContent() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    favorisApi
      .getAll()
      .then((data) => setBoats(data.map(adaptBoatFromApi)))
      .catch(() => setError("Impossible de charger vos favoris."))
      .finally(() => setLoading(false));
  }, []);

  const handleToggled = (boatId: string, active: boolean) => {
    if (!active) setBoats((prev) => prev.filter((b) => b.id !== boatId));
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>Chargement…</div>
    );
  if (error)
    return <p style={{ color: "var(--red)", padding: "24px" }}>{error}</p>;

  if (boats.length === 0)
    return (
      <div className="messages-empty" style={{ minHeight: 320 }}>
        <i className="fa-solid fa-heart" aria-hidden="true" />
        <p>Vous n&apos;avez pas encore de favoris.</p>
        <Link href="/bateaux" className="btn btn-outline btn-sm">
          <i className="fa-solid fa-magnifying-glass" style={{ fontSize: ".75em" }} /> Trouver un bateau
        </Link>
      </div>
    );

  return (
    <div className="boats-result-grid">
      {boats.map((boat) => (
        <BoatCard
          key={boat.id}
          boat={boat}
          action={<HeartButton boatId={boat.id} onToggled={(active) => handleToggled(boat.id, active)} />}
        />
      ))}
    </div>
  );
}

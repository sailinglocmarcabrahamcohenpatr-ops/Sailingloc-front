"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { boatsApi } from "@/shared/lib";
import type { BoatAPI } from "@/shared/lib";

type ApiStatut = "disponible" | "indisponible" | "en_attente";
type UiStatus = "active" | "inactive" | "pending";

const STATUT_MAP: Record<ApiStatut, UiStatus> = {
  disponible: "active",
  indisponible: "inactive",
  en_attente: "pending",
};

const STATUS_MAP: Record<UiStatus, { label: string; cls: string }> = {
  active: { label: "Publié", cls: "badge-status green" },
  inactive: { label: "Désactivé", cls: "badge-status grey" },
  pending: { label: "En révision", cls: "badge-status orange" },
};

function boatImage(boat: BoatAPI): string {
  const main = boat.photos?.find((p) => p.principale);
  return (
    main?.url ??
    boat.photos?.[0]?.url ??
    `https://picsum.photos/seed/boat-${boat.id}/400/300`
  );
}

function boatLocation(boat: BoatAPI): string {
  return (
    [boat.port?.nom, boat.port?.ville].filter(Boolean).join(" – ") || "France"
  );
}

export default function OwnerBoatsPage() {
  const [boats, setBoats] = useState<BoatAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    boatsApi
      .getAll()
      .then(setBoats)
      .catch(() => setError("Impossible de charger les bateaux."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>Chargement…</div>
      </div>
    );
  if (error)
    return (
      <div className="dash-page">
        <p style={{ color: "var(--red)", padding: "24px" }}>{error}</p>
      </div>
    );

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Mes bateaux</h1>
          <p className="dash-sub">
            {boats.length} annonce{boats.length !== 1 ? "s" : ""} sur SailingLoc
          </p>
        </div>
        <Link href="/inscrire-bateau" className="btn btn-primary">
          <i className="fa-solid fa-plus" /> Ajouter un bateau
        </Link>
      </div>

      <div className="owner-boats-list">
        {boats.map((boat) => {
          const uiStatus: UiStatus = STATUT_MAP[boat.statut] ?? "pending";
          const st = STATUS_MAP[uiStatus];
          const imgSrc = boatImage(boat);
          const location = boatLocation(boat);
          const boatType = boat.type_bateau?.libelle ?? "";

          return (
            <div key={boat.id} className="owner-boat-card">
              <div className="owner-boat-img">
                <Image
                  src={imgSrc}
                  alt={boat.nom_bateau}
                  fill
                  sizes="160px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="owner-boat-info">
                <div className="owner-boat-hd">
                  <div>
                    <span className={st.cls}>{st.label}</span>
                    <h3>{boat.nom_bateau}</h3>
                    <p>
                      <i className="fa-solid fa-location-dot" /> {location}
                      {boatType ? ` · ${boatType}` : ""}
                    </p>
                  </div>
                  <div className="owner-boat-price">
                    <strong>{boat.prix_jour.toLocaleString("fr-FR")} €</strong>
                    <span>/ jour</span>
                  </div>
                </div>
                <div className="owner-boat-stats">
                  <div className="owner-boat-stat">
                    <i className="fa-solid fa-calendar-check" />
                    <span>-- réservations</span>
                  </div>
                  <div className="owner-boat-stat">
                    <i className="fa-solid fa-euro-sign" />
                    <span>-- € générés</span>
                  </div>
                </div>
              </div>
              <div className="owner-boat-actions">
                <Link
                  href={`/bateaux/${boat.id}`}
                  className="btn btn-ghost btn-sm"
                  target="_blank"
                  rel="noopener"
                >
                  <i className="fa-solid fa-eye" /> Voir
                </Link>
                <button className="btn btn-outline btn-sm">
                  <i className="fa-solid fa-pen-to-square" /> Modifier
                </button>
                {uiStatus === "active" ? (
                  <button className="btn btn-ghost btn-sm">
                    <i className="fa-solid fa-pause" /> Désactiver
                  </button>
                ) : uiStatus === "inactive" ? (
                  <button className="btn btn-ghost btn-sm">
                    <i className="fa-solid fa-play" /> Activer
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

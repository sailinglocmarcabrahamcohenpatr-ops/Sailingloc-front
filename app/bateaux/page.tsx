"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { boatsApi, referentielsApi } from "@/shared/lib";
import type { BoatAPI, TypeBateauAPI } from "@/shared/lib";
import { BoatsSidebar, ResultsControls } from "@/widgets/boats-catalog";
import { ActiveFiltersBar } from "@/features/filter-boats";

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-");
}

function getMainPhoto(boat: BoatAPI): string {
  const main = boat.photos?.find((p) => p.principale) ?? boat.photos?.[0];
  return main?.url ?? `https://picsum.photos/seed/boat-${boat.id}/800/600`;
}

function BoatListCard({ boat }: { boat: BoatAPI }) {
  const location = [boat.port?.nom, boat.port?.ville].filter(Boolean).join(" – ") || "France";
  const typeName = boat.type_bateau?.libelle ?? "";

  return (
    <Link href={`/bateaux/${boat.id}`} className="boat-card">
      <div className="boat-card-img">
        <Image
          src={getMainPhoto(boat)}
          alt={boat.nom_bateau}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          style={{ objectFit: "cover" }}
        />
        {boat.avec_skipper && (
          <span className="boat-badge">Avec skipper</span>
        )}
      </div>
      <div className="boat-card-body">
        <div className="boat-card-loc">
          <i className="fa-solid fa-location-dot" aria-hidden="true" /> {location}
        </div>
        <h3 className="boat-card-title">{boat.nom_bateau}</h3>
        {typeName && (
          <p className="boat-card-meta">
            {typeName}
            {boat.capacite ? ` · ${boat.capacite} pers.` : ""}
            {boat.taille ? ` · ${boat.taille}` : ""}
          </p>
        )}
        <div className="boat-card-footer">
          <span className="boat-card-price">
            <strong>{boat.prix_jour.toLocaleString("fr-FR")} €</strong>
            <span> / jour</span>
          </span>
          <span className={`badge-status ${boat.statut === "disponible" ? "green" : boat.statut === "en_attente" ? "orange" : "grey"}`}>
            {boat.statut === "disponible" ? "Disponible" : boat.statut === "en_attente" ? "En attente" : "Indisponible"}
          </span>
        </div>
      </div>
    </Link>
  );
}

const PAGINATION_PAGES = [1, 2, 3, 4, 5, 14];

export default function BoatsPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? undefined;
  const destination = searchParams.get("destination") ?? undefined;
  const capaciteMin = Number(searchParams.get("capacite") ?? 0);

  const [boats, setBoats] = useState<BoatAPI[]>([]);
  const [boatTypes, setBoatTypes] = useState<TypeBateauAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    referentielsApi.getTypesBateaux().then(setBoatTypes).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params: Record<string, string> = {};
    if (type && type !== "tous") params.type = type;
    if (destination) params.destination = destination;

    boatsApi
      .getAll(Object.keys(params).length ? params : undefined)
      .then(setBoats)
      .catch(() => setError("Impossible de charger les bateaux. Connectez-vous pour accéder au catalogue."))
      .finally(() => setLoading(false));
  }, [type, destination]);

  const visibleBoats = boats.filter((boat) => {
    if (capaciteMin > 0 && boat.capacite < capaciteMin) return false;
    return true;
  });

  const typeLabel = type && type !== "tous"
    ? (boatTypes.find((t) => slugify(t.labelTypeBateau) === type)?.labelTypeBateau ?? type)
    : null;

  const subtitle = [
    typeLabel,
    destination ? `à ${destination}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="container">
      <div className="results-layout">
        <div>
          <ActiveFiltersBar />

          <ResultsControls
            count={visibleBoats.length}
            dates="10 / 15 juill."
            subtitle={subtitle || undefined}
          />

          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-2)" }}>
              <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }} />
              <p style={{ marginTop: "12px" }}>Chargement des bateaux…</p>
            </div>
          )}

          {error && !loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "2rem", color: "var(--red)" }} />
              <p style={{ marginTop: "12px", color: "var(--text-2)" }}>{error}</p>
              <Link href="/connexion" className="btn btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
                Se connecter
              </Link>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="boats-result-grid">
                {visibleBoats.length > 0 ? (
                  visibleBoats.map((boat) => <BoatListCard key={boat.id} boat={boat} />)
                ) : (
                  <p style={{ color: "var(--text-2)", gridColumn: "1 / -1", padding: "48px 0" }}>
                    Aucun bateau ne correspond à votre recherche.
                  </p>
                )}
              </div>

              {!type && !destination && visibleBoats.length > 0 && (
                <nav className="pagination" aria-label="Pagination">
                  <button className="page-btn arrow" disabled aria-label="Page précédente">
                    <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                  </button>
                  {PAGINATION_PAGES.map((p, i) => (
                    <span key={p}>
                      {i === PAGINATION_PAGES.length - 1 && (
                        <span className="page-dots" aria-hidden="true">…</span>
                      )}
                      <button
                        className={`page-btn${p === 1 ? " active" : ""}`}
                        aria-label={`Page ${p}`}
                        aria-current={p === 1 ? "page" : undefined}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                  <button className="page-btn arrow" aria-label="Page suivante">
                    <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>

        <BoatsSidebar />
      </div>
    </div>
  );
}

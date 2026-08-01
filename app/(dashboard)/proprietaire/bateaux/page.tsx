"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { boatsApi, resolvePhotoUrl, useAuth } from "@/shared/lib";
import type { BoatAPI } from "@/shared/lib";

type UiStatus = "active" | "inactive" | "pending" | "refused";

// `statut` est un champ libre côté API (ex: "disponible", "en attente de validation",
// "loué", "maintenance", "suspendu", "refusé") — on ne mappe que les valeurs connues.
const STATUT_MAP: Record<string, UiStatus> = {
  disponible: "active",
  indisponible: "inactive",
  suspendu: "inactive",
  maintenance: "inactive",
  en_attente: "pending",
  "en attente de validation": "pending",
  refusé: "refused",
};

const STATUS_MAP: Record<UiStatus, { label: string; cls: string }> = {
  active: { label: "Publié", cls: "badge-status green" },
  inactive: { label: "Désactivé", cls: "badge-status grey" },
  pending: { label: "En révision", cls: "badge-status orange" },
  refused: { label: "Refusé", cls: "badge-status red" },
};

function boatImage(boat: BoatAPI): string {
  if (!boat.photos?.length) return "";
  const main = boat.photos
    .slice()
    .sort((a, b) => (a.ordreAffichage ?? 99) - (b.ordreAffichage ?? 99))[0];
  return main?.url ? resolvePhotoUrl(main.url) : "";
}

function boatLocation(boat: BoatAPI): string {
  return (
    [boat.port?.nom, boat.port?.ville].filter(Boolean).join(" – ") || "France"
  );
}

export default function OwnerBoatsPage() {
  const { user } = useAuth();
  const [boats, setBoats] = useState<BoatAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [toggleError, setToggleError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (openMenuId === null) return;
    const closeOnOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".owner-boat-menu")) setOpenMenuId(null);
    };
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (!user?.email) return;
    // Le JWT ne porte pas l'id numérique de l'utilisateur (aucune claim `id`
    // n'est ajoutée côté backend), donc `user.id` vaut 0 pour un propriétaire
    // — filtrer par `proprietaire_id` bloquerait la page indéfiniment. On
    // charge tous les bateaux et on filtre côté client par email, seule
    // donnée d'identité fiable disponible sans appel réservé aux admins.
    boatsApi
      .getAll()
      .then((all) =>
        setBoats(all.filter((b) => (b.proprietaire?.email ?? b.utilisateur?.email) === user.email))
      )
      .catch(() => setError("Impossible de charger les bateaux."))
      .finally(() => setLoading(false));
  }, [user?.email]);

  // Toutes les demandes du propriétaire restent visibles ici, quel que soit
  // leur statut — le badge (En révision / Publié / Refusé / Désactivé) reflète
  // simplement le vrai statut renvoyé par l'API, et se met donc à jour tout
  // seul dès qu'un admin valide ou refuse la demande.
  const visibleBoats = boats;

  const handleToggleStatus = async (boat: BoatAPI, nextActive: boolean) => {
    setTogglingId(boat.id);
    setToggleError("");
    const nextStatut = nextActive ? "disponible" : "suspendu";
    try {
      await boatsApi.updateStatut(boat.id, nextStatut);
      setBoats((prev) => prev.map((b) => (b.id === boat.id ? { ...b, statut: nextStatut } : b)));
    } catch {
      setToggleError("Impossible de modifier le statut de ce bateau. Réessayez.");
    } finally {
      setTogglingId(null);
    }
  };

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
            {visibleBoats.length} annonce{visibleBoats.length !== 1 ? "s" : ""} sur SailingLoc
          </p>
        </div>
        <Link href="/proprietaire/bateaux/nouveau" className="btn btn-primary">
          <i className="fa-solid fa-plus" /> Ajouter un bateau
        </Link>
      </div>

      {toggleError && (
        <p style={{ color: "var(--red)", fontSize: ".875rem" }}>
          <i className="fa-solid fa-triangle-exclamation" /> {toggleError}
        </p>
      )}

      <div className="owner-boats-list">
        {visibleBoats.map((boat, i) => {
          const uiStatus: UiStatus = STATUT_MAP[boat.statut] ?? "pending";
          const st = STATUS_MAP[uiStatus];
          const imgSrc = boatImage(boat);
          const location = boatLocation(boat);
          const boatType = boat.typeBateau?.labelTypeBateau ?? "";

          return (
            <div key={boat.id} className="owner-boat-card">
              <div className="owner-boat-img">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={boat.nomBateau}
                    fill
                    sizes="160px"
                    unoptimized
                    style={{ objectFit: "cover" }}
                    loading={i === 0 ? "eager" : "lazy"}
                    priority={i === 0}
                  />
                ) : (
                  <div className="owner-boat-img-placeholder">
                    <i className="fa-solid fa-sailboat" />
                  </div>
                )}
              </div>
              <div className="owner-boat-info">
                <div className="owner-boat-hd">
                  <div>
                    <span className={st.cls}>{st.label}</span>
                    <h3>{boat.nomBateau}</h3>
                    <p>
                      <i className="fa-solid fa-location-dot" /> {location}
                      {boatType ? ` · ${boatType}` : ""}
                    </p>
                  </div>
                  <div className="owner-boat-price">
                    <strong>{boat.prixJour != null ? boat.prixJour.toLocaleString("fr-FR") : "—"} €</strong>
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
                <div className="owner-boat-menu">
                  <button
                    type="button"
                    className="owner-boat-menu-btn"
                    aria-label="Actions sur ce bateau"
                    aria-haspopup="true"
                    aria-expanded={openMenuId === boat.id}
                    onClick={() => setOpenMenuId((id) => (id === boat.id ? null : boat.id))}
                  >
                    <i className="fa-solid fa-ellipsis" />
                  </button>
                  {openMenuId === boat.id && (
                    <div className="owner-boat-menu-dropdown" role="menu">
                      <Link
                        href={`/bateaux/${boat.id}`}
                        className="owner-boat-menu-item"
                        target="_blank"
                        rel="noopener"
                        role="menuitem"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <i className="fa-solid fa-eye" /> Voir
                      </Link>
                      {uiStatus !== "refused" && uiStatus !== "pending" && (
                        <Link
                          href={`/proprietaire/bateaux/${boat.id}/calendrier`}
                          className="owner-boat-menu-item"
                          role="menuitem"
                          onClick={() => setOpenMenuId(null)}
                        >
                          <i className="fa-solid fa-calendar-days" /> Calendrier
                        </Link>
                      )}
                      <Link
                        href={`/proprietaire/bateaux/${boat.id}/modifier`}
                        className="owner-boat-menu-item"
                        role="menuitem"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <i className="fa-solid fa-pen-to-square" /> Modifier
                      </Link>
                      {uiStatus === "active" ? (
                        <button
                          type="button"
                          className="owner-boat-menu-item"
                          role="menuitem"
                          disabled={togglingId === boat.id}
                          onClick={() => {
                            setOpenMenuId(null);
                            handleToggleStatus(boat, false);
                          }}
                        >
                          <i className="fa-solid fa-pause" /> Désactiver
                        </button>
                      ) : uiStatus === "inactive" ? (
                        <button
                          type="button"
                          className="owner-boat-menu-item"
                          role="menuitem"
                          disabled={togglingId === boat.id}
                          onClick={() => {
                            setOpenMenuId(null);
                            handleToggleStatus(boat, true);
                          }}
                        >
                          <i className="fa-solid fa-play" /> Activer
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

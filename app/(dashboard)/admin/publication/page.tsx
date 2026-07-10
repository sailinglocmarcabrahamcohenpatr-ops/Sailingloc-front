"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { boatsApi, resolvePhotoUrl, StatutBateau } from "@/shared/lib";
import type { BoatAPI } from "@/shared/lib";
import "../../proprietaire/dashboard.css";
import "../publication/publication.css";

/* ── Constants ── */
const PAGE_SIZE = 10;

type Tab = "en-attente" | "disponible" | "suspendu";

/* ── Helpers ── */
function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function visiblePages(page: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (page >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", page - 1, page, page + 1, "...", total];
}

/* ── Subcomponent: boat row ── */
function BoatRow({ boat, tab }: { boat: BoatAPI; tab: Tab }) {
  const mainPhoto = boat.photos?.find((p) => p.ordreAffichage === 0) ?? boat.photos?.[0];
  const photoUrl = mainPhoto ? resolvePhotoUrl(mainPhoto.url) : null;

  const owner = boat.proprietaire ?? boat.utilisateur;
  const ownerFullName = owner
    ? `${owner.prenom} ${owner.nom}`
    : `Utilisateur #${boat.id_utilisateur ?? "?"}`;
  const ownerInitials = owner
    ? `${owner.prenom[0] ?? ""}${owner.nom[0] ?? ""}`.toUpperCase()
    : "?";

  const location = boat.port?.ville
    ? `${boat.port.ville}${boat.port.nom ? ` — ${boat.port.nom}` : ""}`
    : "—";

  const dateLabel =
    tab === "en-attente"
      ? (boat as unknown as { created_at?: string }).created_at ?? null
      : (boat as unknown as { updated_at?: string }).updated_at ?? null;

  return (
    <tr>
      <td data-label="Bateau">
        <div className="pub-boat-cell">
          {photoUrl ? (
            <img src={photoUrl} alt={boat.nomBateau} className="pub-boat-thumb" />
          ) : (
            <div className="pub-boat-thumb-placeholder">
              <i className="fa-solid fa-sailboat" />
            </div>
          )}
          <div>
            <div className="pub-boat-name">{boat.nomBateau}</div>
            <div className="pub-boat-id">#{boat.id}</div>
          </div>
        </div>
      </td>
      <td data-label="Type" className="pub-col-text-sm">
        {boat.type_bateau?.libelle ?? "—"}
      </td>
      <td data-label="Port / Localisation" className="pub-col-text-sm">
        {location}
      </td>
      <td data-label="Propriétaire">
        <div className="pub-owner-mini">
          <div className="pub-owner-mini-avatar">{ownerInitials}</div>
          <span className="pub-owner-mini-name">{ownerFullName}</span>
        </div>
      </td>
      <td data-label="Date" className="pub-col-text-sm">
        {formatDate(dateLabel)}
      </td>
      <td data-label="">
        <Link
          href={`/admin/publication/${boat.id}`}
          className="btn btn-sm btn-ghost"
          style={{ whiteSpace: "nowrap" }}
        >
          <i className="fa-solid fa-eye" />
          Consulter
        </Link>
      </td>
    </tr>
  );
}

/* ── Main component ── */
export default function AdminPublicationPage() {
  const [allBoats, setAllBoats]   = useState<BoatAPI[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [tab, setTab]             = useState<Tab>("en-attente");
  const [search, setSearch]       = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage]           = useState(1);

  useEffect(() => {
    setLoading(true);
    setError("");
    boatsApi
      .getAll()
      .then(setAllBoats)
      .catch(() => setError("Impossible de charger les bateaux."))
      .finally(() => setLoading(false));
  }, []);

  /* Filter by status for the active tab */
  const STATUS_MAP: Record<Tab, string> = {
    "en-attente": StatutBateau.EN_ATTENTE_VALIDATION,
    "disponible":  StatutBateau.DISPONIBLE,
    "suspendu":    StatutBateau.SUSPENDU,
  };
  const statusFilter = STATUS_MAP[tab];

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    allBoats.forEach((b) => {
      if (b.type_bateau?.libelle) types.add(b.type_bateau.libelle);
    });
    return Array.from(types).sort();
  }, [allBoats]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allBoats.filter((b) => {
      if (b.statut !== statusFilter) return false;
      if (filterType !== "all" && b.type_bateau?.libelle !== filterType) return false;
      if (q) {
        const ownerObj = b.proprietaire ?? b.utilisateur;
        const owner = ownerObj
          ? `${ownerObj.prenom} ${ownerObj.nom}`.toLowerCase()
          : "";        const name = b.nomBateau.toLowerCase();
        const port = (b.port?.ville ?? "").toLowerCase();
        if (!name.includes(q) && !owner.includes(q) && !port.includes(q)) return false;
      }
      return true;
    });
  }, [allBoats, statusFilter, filterType, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageBoats  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on tab / filter change
  useEffect(() => { setPage(1); }, [tab, search, filterType]);

  const pendingCount   = allBoats.filter((b) => b.statut === StatutBateau.EN_ATTENTE_VALIDATION).length;
  const availableCount = allBoats.filter((b) => b.statut === StatutBateau.DISPONIBLE).length;
  const suspendedCount = allBoats.filter((b) => b.statut === StatutBateau.SUSPENDU).length;

  return (
    <div className="dash-page">

      {/* ── Header ── */}
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Publication</h1>
          <p className="dash-sub">
            Gérez la publication et la modération des bateaux de la plateforme.
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div>
        <div className="pub-tabs">
          <button
            className={`pub-tab${tab === "en-attente" ? " active" : ""}`}
            onClick={() => setTab("en-attente")}
          >
            <i className="fa-solid fa-clock" />
            En attente de validation
            <span className="pub-tab-count">{pendingCount}</span>
          </button>
          <button
            className={`pub-tab${tab === "disponible" ? " active" : ""}`}
            onClick={() => setTab("disponible")}
          >
            <i className="fa-solid fa-circle-check" />
            Bateaux disponibles
            <span className="pub-tab-count">{availableCount}</span>
          </button>
          <button
            className={`pub-tab${tab === "suspendu" ? " active" : ""}`}
            onClick={() => setTab("suspendu")}
          >
            <i className="fa-solid fa-ban" />
            Suspendus
            <span className="pub-tab-count">{suspendedCount}</span>
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div style={{ marginTop: 20 }}>
          <div className="pub-toolbar">
            <div className="pub-search-wrap">
              <i className="fa-solid fa-magnifying-glass pub-search-icon" />
              <input
                className="pub-search-input"
                placeholder="Nom, propriétaire, port…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="pub-filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {(search || filterType !== "all") && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => { setSearch(""); setFilterType("all"); }}
              >
                <i className="fa-solid fa-xmark" />
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="pub-error" style={{ marginTop: 16 }}>
            <i className="fa-solid fa-triangle-exclamation" />
            {error}
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="pub-loading">
            <div className="pub-spinner" />
            Chargement des bateaux…
          </div>
        ) : (
          <div className="pub-table-wrap" style={{ marginTop: 16 }}>
            {filtered.length === 0 ? (
              <div className="pub-empty">
                <i className="fa-solid fa-sailboat" />
                <p>
                  {search || filterType !== "all"
                    ? "Aucun bateau ne correspond à votre recherche."
                    : tab === "en-attente"
                    ? "Aucun bateau en attente de validation."
                    : tab === "disponible"
                    ? "Aucun bateau disponible pour l'instant."
                    : "Aucun bateau suspendu."}
                </p>
              </div>
            ) : (
              <>
                <table className="pub-table">
                  <thead>
                    <tr>
                      <th>Bateau</th>
                      <th>Type</th>
                      <th>Port / Localisation</th>
                      <th>Propriétaire</th>
                      <th>{tab === "en-attente" ? "Date de création" : tab === "suspendu" ? "Date de suspension" : "Date de publication"}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageBoats.map((b) => (
                      <BoatRow key={b.id} boat={b} tab={tab} />
                    ))}
                  </tbody>
                </table>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div style={{ padding: "16px 20px" }}>
                    <div className="pub-pagination">
                      <button
                        className="pub-page-btn"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        aria-label="Page précédente"
                      >
                        <i className="fa-solid fa-chevron-left" style={{ fontSize: ".75rem" }} />
                      </button>
                      {visiblePages(page, totalPages).map((p, i) =>
                        p === "..." ? (
                          <span key={`dots-${i}`} className="pub-page-dots">…</span>
                        ) : (
                          <button
                            key={p}
                            className={`pub-page-btn${page === p ? " active" : ""}`}
                            onClick={() => setPage(p as number)}
                          >
                            {p}
                          </button>
                        )
                      )}
                      <button
                        className="pub-page-btn"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        aria-label="Page suivante"
                      >
                        <i className="fa-solid fa-chevron-right" style={{ fontSize: ".75rem" }} />
                      </button>
                    </div>
                    <p style={{ textAlign: "center", fontSize: ".8125rem", color: "var(--text-3)", marginTop: 8 }}>
                      {filtered.length} bateau{filtered.length !== 1 ? "x" : ""} — page {page} / {totalPages}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

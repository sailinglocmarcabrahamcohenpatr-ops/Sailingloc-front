"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { avisApi, ApiError } from "@/shared/lib";
import type { AvisAPI } from "@/shared/lib";
import "../../proprietaire/dashboard.css";
import "../utilisateurs/utilisateurs.css";
import "./avis.css";

type RatingFilter = "all" | "low" | "mid" | "high";

const FILTERS: { value: RatingFilter; label: string }[] = [
  { value: "all", label: "Toutes les notes" },
  { value: "low", label: "1-2 étoiles" },
  { value: "mid", label: "3 étoiles" },
  { value: "high", label: "4-5 étoiles" },
];

function matchesFilter(note: number, filter: RatingFilter): boolean {
  if (filter === "low") return note <= 2;
  if (filter === "mid") return note === 3;
  if (filter === "high") return note >= 4;
  return true;
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

function initials(u: { prenom: string; nom: string }) {
  return ((u.prenom?.[0] ?? "") + (u.nom?.[0] ?? "")).toUpperCase() || "?";
}

const Stars = ({ n }: { n: number }) => (
  <span className="stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <i key={i} className={i <= n ? "fa-solid fa-star" : "fa-regular fa-star"} aria-hidden="true" />
    ))}
  </span>
);

export default function AdminAvisPage() {
  const [avis, setAvis] = useState<AvisAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<RatingFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<AvisAPI | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    avisApi
      .getAll()
      .then((data) => setAvis(data.sort((a, b) => b.dateAvis.localeCompare(a.dateAvis))))
      .catch(() => setError("Impossible de charger les avis."))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<RatingFilter, number> = { all: avis.length, low: 0, mid: 0, high: 0 };
    for (const a of avis) {
      if (a.note <= 2) c.low++;
      else if (a.note === 3) c.mid++;
      else c.high++;
    }
    return c;
  }, [avis]);

  const filtered = useMemo(
    () => avis.filter((a) => matchesFilter(a.note, filter)),
    [avis, filter],
  );

  const avgNote = useMemo(
    () => (avis.length ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length : 0),
    [avis],
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await avisApi.delete(deleteTarget.id);
      setAvis((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la suppression de l'avis.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="dash-page avis-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Gestion des avis</h1>
          <p className="dash-sub">Modérez et supprimez les avis des utilisateurs.</p>
        </div>
      </div>

      {error && (
        <div className="users-error">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
          <button onClick={() => setError("")}><i className="fa-solid fa-xmark" /></button>
        </div>
      )}

      {!loading && avis.length > 0 && (
        <div className="avis-stats-grid">
          <div className="avis-stat-card avis-stat-hero">
            <div className="avis-stat-icon"><i className="fa-solid fa-star" /></div>
            <div>
              <div className="avis-stat-value">{avis.length}</div>
              <div className="avis-stat-label">Avis publiés</div>
            </div>
          </div>
          <div className="avis-stat-card">
            <div className="avis-stat-icon"><i className="fa-solid fa-chart-line" /></div>
            <div>
              <div className="avis-stat-value">{avgNote.toFixed(1)} / 5</div>
              <div className="avis-stat-label">Note moyenne</div>
            </div>
          </div>
          <div className="avis-stat-card">
            <div className="avis-stat-icon avis-stat-icon-alt"><i className="fa-solid fa-thumbs-up" /></div>
            <div>
              <div className="avis-stat-value">{counts.high}</div>
              <div className="avis-stat-label">Avis 4-5 étoiles</div>
            </div>
          </div>
        </div>
      )}

      <div className="users-toolbar">
        <div className="users-filters">
          <select
            className="users-filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value as RatingFilter)}
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label} ({counts[f.value]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loading"><div className="page-loading-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="avis-card">
          <div className="users-empty">
            <i className="fa-solid fa-star" />
            <p>Aucun avis à afficher pour l&apos;instant.</p>
          </div>
        </div>
      ) : (
        <div className="avis-card">
          <div className="avis-card-hd"><h3>Tous les avis</h3></div>
          <div className="avis-list">
            {filtered.map((a) => {
              const reviewer = a.utilisateur;
              const authorName = reviewer ? `${reviewer.prenom} ${reviewer.nom}` : "Utilisateur inconnu";
              const boat = a.reservation?.bateau;

              return (
                <div key={a.id} className="avis-row">
                  <div className="users-avatar">
                    {reviewer ? initials(reviewer) : "?"}
                  </div>
                  <div className="avis-row-body">
                    <div className="avis-row-top">
                      <div>
                        <h3 className="avis-row-name">
                          {authorName}
                          {boat && (
                            <span className="avis-row-boat"> — <Link href={`/bateaux/${boat.id}`}>{boat.nomBateau}</Link></span>
                          )}
                        </h3>
                        <Stars n={a.note} />
                      </div>
                      <div className="avis-row-meta">
                        <span className="avis-row-date">Noté le {fmt(a.dateAvis)}</span>
                        <button
                          className="avis-row-action-btn"
                          onClick={() => setDeleteTarget(a)}
                          title="Supprimer"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </div>

                    <div className="notation-card-subnotes">
                      <span><i className="fa-solid fa-user" /> Propriétaire <Stars n={a.noteProprietaire} /></span>
                      <span><i className="fa-solid fa-sailboat" /> Bateau <Stars n={a.noteBateau} /></span>
                      <span><i className="fa-solid fa-map-location-dot" /> Lieu <Stars n={a.noteLieu} /></span>
                    </div>

                    {a.commentaire && <p className="avis-comment">{a.commentaire}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="users-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setDeleteTarget(null); }}
        >
          <div className="users-modal users-modal--sm" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <h2>
                <div className="users-modal-avatar users-modal-avatar--danger">
                  <i className="fa-solid fa-trash" />
                </div>
                Supprimer cet avis
              </h2>
              <button className="users-modal-close" onClick={() => setDeleteTarget(null)} disabled={deleting} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="users-modal-body">
              <p>
                Cet avis de <strong>{deleteTarget.utilisateur ? `${deleteTarget.utilisateur.prenom} ${deleteTarget.utilisateur.nom}` : "cet utilisateur"}</strong> sera définitivement supprimé. Cette action est irréversible.
              </p>
            </div>

            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleting} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{ padding: "9px 18px", fontWeight: 700, background: "var(--red)", color: "#fff", border: "none", borderRadius: "var(--radius-lg)", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: ".9375rem", opacity: deleting ? .7 : 1 }}
              >
                {deleting
                  ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />Suppression…</>
                  : <><i className="fa-solid fa-trash" style={{ marginRight: 6 }} />Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

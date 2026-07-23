"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { avisApi, ApiError } from "@/shared/lib";
import type { AvisAPI } from "@/shared/lib";
import "../../proprietaire/dashboard.css";
import "../utilisateurs/utilisateurs.css";

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
    <div className="dash-page">
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
        <div className="dash-empty-state">
          <i className="fa-solid fa-circle-notch fa-spin fa-2x" style={{ opacity: 0.3 }} />
          <p>Chargement des avis…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-empty-state">
          <i className="fa-solid fa-star fa-2x" style={{ opacity: 0.3 }} />
          <p>Aucun avis à afficher pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filtered.map((a) => {
            const reviewer = a.utilisateur;
            const authorName = reviewer ? `${reviewer.prenom} ${reviewer.nom}` : "Utilisateur inconnu";
            const boat = a.reservation?.bateau;

            return (
              <div key={a.id} className="notation-card">
                <div className="notation-card-hd">
                  <div>
                    <h3>
                      {authorName}
                      {boat && (
                        <>
                          {" "}
                          <span style={{ fontWeight: 400, color: "var(--text-2)" }}>
                            — <Link href={`/bateaux/${boat.id}`}>{boat.nomBateau}</Link>
                          </span>
                        </>
                      )}
                    </h3>
                    <Stars n={a.note} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="notation-card-date">Noté le {fmt(a.dateAvis)}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--red)" }}
                      onClick={() => setDeleteTarget(a)}
                    >
                      <i className="fa-solid fa-trash" /> Supprimer
                    </button>
                  </div>
                </div>

                <div className="notation-card-subnotes">
                  <span><i className="fa-solid fa-user" /> Propriétaire <Stars n={a.noteProprietaire} /></span>
                  <span><i className="fa-solid fa-sailboat" /> Bateau <Stars n={a.noteBateau} /></span>
                  <span><i className="fa-solid fa-map-location-dot" /> Lieu <Stars n={a.noteLieu} /></span>
                </div>

                {a.commentaire && <p className="notation-card-comment">{a.commentaire}</p>}
              </div>
            );
          })}
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

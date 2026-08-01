"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { utilisateursApi, boatsApi, reservationsApi, avisApi, resolvePhotoUrl, ApiError, StatutBateau } from "@/shared/lib";
import type { UtilisateurAPI, BoatAPI, ReservationAPI, AvisAPI } from "@/shared/lib";
import "../../../proprietaire/dashboard.css";
import "../utilisateurs.css";
import "./user-detail.css";

type Role = "admin" | "proprietaire" | "locataire";

function topRole(roles: string[]): Role {
  if (roles.includes("ROLE_ADMIN")) return "admin";
  if (roles.includes("ROLE_PROPRIETAIRE")) return "proprietaire";
  return "locataire";
}

const ROLE_LABEL: Record<Role, string> = { admin: "Admin", proprietaire: "Propriétaire", locataire: "Locataire" };

function initials(u: UtilisateurAPI) {
  return ((u.prenom?.[0] ?? "") + (u.nom?.[0] ?? "")).toUpperCase() || "?";
}

function ownerIdOf(b: BoatAPI): number | undefined {
  return b.proprietaire?.id ?? b.utilisateur?.id ?? b.id_utilisateur;
}

const BOAT_STATUT_BADGE: Record<string, string> = {
  "disponible": "green",
  "en attente de validation": "orange",
  "loué": "green",
  "maintenance": "grey",
  "suspendu": "red",
  "refusé": "red",
};

type ResaBadgeKey = "confirmed" | "pending" | "cancelled" | "completed";
const RESA_STATUS: Record<ResaBadgeKey, { label: string; cls: string }> = {
  confirmed: { label: "Confirmée", cls: "badge-status green" },
  pending: { label: "En attente", cls: "badge-status orange" },
  cancelled: { label: "Annulée", cls: "badge-status red" },
  completed: { label: "Terminée", cls: "badge-status grey" },
};
function libelleToKey(libelle?: string): ResaBadgeKey {
  if (!libelle) return "pending";
  const l = libelle.toLowerCase();
  if (l.includes("confirm")) return "confirmed";
  if (l.includes("attente")) return "pending";
  if (l.includes("annul")) return "cancelled";
  if (l.includes("termin")) return "completed";
  return "pending";
}

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const Stars = ({ n }: { n: number }) => (
  <span className="stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <i key={i} className={i <= n ? "fa-solid fa-star" : "fa-regular fa-star"} aria-hidden="true" />
    ))}
  </span>
);

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;

  const [user, setUser] = useState<UtilisateurAPI | null>(null);
  const [boats, setBoats] = useState<BoatAPI[]>([]);
  const [reservations, setReservations] = useState<ReservationAPI[]>([]);
  const [avis, setAvis] = useState<AvisAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [suspendConfirm, setSuspendConfirm] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [suspendError, setSuspendError] = useState("");

  useEffect(() => {
    let cancelled = false;

    utilisateursApi.getOne(userId)
      .then(async (u) => {
        if (cancelled) return;
        setUser(u);
        const role = topRole(u.roles);
        if (role === "proprietaire") {
          const all = await boatsApi.getAll();
          if (!cancelled) setBoats(all.filter((b) => ownerIdOf(b) === u.id));
        } else {
          const [resa, avisData] = await Promise.all([reservationsApi.getAll(), avisApi.getAll()]);
          if (!cancelled) {
            setReservations(resa.filter((r) => r.utilisateur?.id === u.id));
            setAvis(avisData.filter((a) => a.utilisateur?.id === u.id));
          }
        }
      })
      .catch(() => { if (!cancelled) setError("Impossible de charger cet utilisateur."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [userId]);

  async function handleDelete() {
    if (!user) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await utilisateursApi.delete(user.id);
      router.push("/admin/utilisateurs");
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Erreur lors de la suppression.");
      setDeleting(false);
    }
  }

  async function handleSuspendBoats() {
    setSuspending(true);
    setSuspendError("");
    try {
      const toSuspend = boats.filter((b) => b.statut !== StatutBateau.SUSPENDU);
      await Promise.all(toSuspend.map((b) => boatsApi.updateStatut(b.id, StatutBateau.SUSPENDU)));
      setBoats((prev) => prev.map((b) => ({ ...b, statut: StatutBateau.SUSPENDU })));
      setSuspendConfirm(false);
    } catch (err) {
      setSuspendError(err instanceof ApiError ? err.message : "Erreur lors de la suspension des bateaux.");
    } finally {
      setSuspending(false);
    }
  }

  if (loading) {
    return (
      <div className="dash-page">
        <div className="page-loading"><div className="page-loading-spinner" /></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="dash-page">
        <Link href="/admin/utilisateurs" className="user-detail-back">
          <i className="fa-solid fa-arrow-left" /> Retour aux utilisateurs
        </Link>
        <div className="users-error">
          <i className="fa-solid fa-circle-exclamation" />
          {error || "Utilisateur introuvable."}
        </div>
      </div>
    );
  }

  const role = topRole(user.roles);
  const hasBoats = role === "proprietaire" && boats.length > 0;
  const allSuspended = hasBoats && boats.every((b) => b.statut === StatutBateau.SUSPENDU);

  return (
    <div className="dash-page">
      <Link href="/admin/utilisateurs" className="user-detail-back">
        <i className="fa-solid fa-arrow-left" /> Retour aux utilisateurs
      </Link>

      {deleteError && (
        <div className="users-error">
          <i className="fa-solid fa-circle-exclamation" />
          {deleteError}
          <button onClick={() => setDeleteError("")}><i className="fa-solid fa-xmark" /></button>
        </div>
      )}

      <div className="dash-card">
        <div className="user-detail-header">
          <div className="users-avatar">{initials(user)}</div>
          <div className="user-detail-header-info">
            <h1>{user.prenom} {user.nom}</h1>
            <div className="user-detail-header-meta">
              <span><i className="fa-solid fa-envelope" /> {user.email}</span>
              {user.telephone && <span><i className="fa-solid fa-phone" /> {user.telephone}</span>}
              <span><i className="fa-solid fa-hashtag" /> #{user.id}</span>
            </div>
          </div>
          <div className="user-detail-header-badges">
            <span className={`users-role-badge ${role}`}>{ROLE_LABEL[role]}</span>
            <span className={`badge-status ${user.statutCompte === "inactif" ? "red" : "green"}`}>
              {user.statutCompte === "inactif" ? "Désactivé" : "Actif"}
            </span>
          </div>
        </div>
      </div>

      {role === "proprietaire" ? (
        <div className="dash-card">
          <div className="dash-card-hd">
            <h3>Bateaux publiés ({boats.length})</h3>
          </div>
          {boats.length === 0 ? (
            <p style={{ color: "var(--text-2)", fontSize: ".875rem" }}>Cet utilisateur n&apos;a publié aucun bateau.</p>
          ) : (
            <div className="docs-list">
              {boats.map((b) => {
                const photo = b.photos?.slice().sort((a, c) => (a.ordreAffichage ?? 0) - (c.ordreAffichage ?? 0))[0];
                const badgeCls = BOAT_STATUT_BADGE[b.statut] ?? "grey";
                return (
                  <Link key={b.id} href={`/admin/publication/${b.id}`} className="doc-item" style={{ textDecoration: "none", color: "inherit" }}>
                    {photo ? (
                      <img className="user-detail-boat-photo" src={resolvePhotoUrl(photo.url)} alt={b.nomBateau} />
                    ) : (
                      <div className="doc-icon"><i className="fa-solid fa-sailboat" /></div>
                    )}
                    <div className="doc-info">
                      <strong>{b.nomBateau}</strong>
                      <span>
                        {b.port ? `${b.port.ville} · ` : ""}
                        {Number(b.prixJour).toLocaleString("fr-FR")} €/jour
                      </span>
                    </div>
                    <div className="doc-actions">
                      <span className={`badge-status ${badgeCls}`}>{b.statut}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="dash-card">
            <div className="dash-card-hd">
              <h3>Réservations ({reservations.length})</h3>
            </div>
            {reservations.length === 0 ? (
              <p style={{ color: "var(--text-2)", fontSize: ".875rem" }}>Aucune réservation pour cet utilisateur.</p>
            ) : (
              <div className="docs-list">
                {reservations.map((r) => {
                  const key = libelleToKey(r.statutReservation);
                  const st = RESA_STATUS[key];
                  const boatName = r.bateau?.nomBateau ?? `Bateau #${r.bateau?.id ?? r.id}`;
                  return (
                    <div key={r.id} className="doc-item">
                      <div className="doc-icon"><i className="fa-solid fa-calendar-check" /></div>
                      <div className="doc-info">
                        <strong>{boatName}</strong>
                        <span>{fmt(r.dateDebut)} → {fmt(r.dateFin)} · {Number(r.montantTotal).toLocaleString("fr-FR")} €</span>
                      </div>
                      <div className="doc-actions">
                        <span className={st.cls}>{st.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="dash-card">
            <div className="dash-card-hd">
              <h3>Avis laissés ({avis.length})</h3>
            </div>
            {avis.length === 0 ? (
              <p style={{ color: "var(--text-2)", fontSize: ".875rem" }}>Aucun avis laissé par cet utilisateur.</p>
            ) : (
              <div className="bookings-list">
                {avis.map((a) => {
                  const boat = a.reservation?.bateau;
                  return (
                    <div key={a.id} className="notation-card">
                      <div className="notation-card-hd">
                        <div>
                          <h3>{boat ? <Link href={`/bateaux/${boat.id}`}>{boat.nomBateau}</Link> : "Bateau supprimé"}</h3>
                          <Stars n={a.note} />
                        </div>
                        <span className="notation-card-date">Noté le {fmt(a.dateAvis)}</span>
                      </div>
                      {a.commentaire && <p className="notation-card-comment">{a.commentaire}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <div className="dash-card danger-zone">
        <div className="dash-card-hd"><h3>Zone dangereuse</h3></div>
        {hasBoats ? (
          <div className="setting-item">
            <div>
              <strong>Suspendre les bateaux publiés</strong>
              <span>
                Ce compte possède {boats.length} bateau{boats.length > 1 ? "x" : ""} publié{boats.length > 1 ? "s" : ""} : le compte ne peut pas être supprimé tant qu&apos;il en possède. Vous pouvez suspendre ses annonces pour les retirer immédiatement de la plateforme.
              </span>
            </div>
            <button
              className="btn btn-sm"
              style={{ background: "#FEF3C7", color: "#92400E", border: "1.5px solid #FCD34D" }}
              onClick={() => setSuspendConfirm(true)}
              disabled={allSuspended}
            >
              <i className="fa-solid fa-ban" /> {allSuspended ? "Bateaux déjà suspendus" : "Suspendre les bateaux"}
            </button>
          </div>
        ) : (
          <div className="setting-item">
            <div>
              <strong>Supprimer ce compte</strong>
              <span>Cette action est irréversible.</span>
            </div>
            <button
              className="btn btn-sm"
              style={{ background: "#FEF2F2", color: "var(--red)", border: "1.5px solid #FCA5A5" }}
              onClick={() => setDeleteConfirm(true)}
            >
              <i className="fa-solid fa-trash" /> Supprimer
            </button>
          </div>
        )}
        {suspendError && (
          <p style={{ color: "var(--red)", fontSize: ".8125rem", marginTop: 10 }}>{suspendError}</p>
        )}
      </div>

      {deleteConfirm && (
        <div
          className="users-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setDeleteConfirm(false); }}
        >
          <div className="users-modal users-modal--sm" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <h2>
                <div className="users-modal-avatar users-modal-avatar--danger">
                  <i className="fa-solid fa-trash" />
                </div>
                Supprimer l&apos;utilisateur
              </h2>
              <button className="users-modal-close" onClick={() => setDeleteConfirm(false)} disabled={deleting} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="users-modal-body">
              <div className="users-modal-delete-info">
                <div className="users-avatar" style={{ width: 48, height: 48, fontSize: "1rem", flexShrink: 0 }}>
                  {initials(user)}
                </div>
                <div>
                  <strong>{user.prenom} {user.nom}</strong>
                  <span style={{ display: "block", fontSize: ".8125rem", color: "var(--text-2)", marginTop: 2 }}>{user.email}</span>
                </div>
              </div>
              <p className="users-modal-delete-warning">
                <i className="fa-solid fa-triangle-exclamation" />
                Cette action est irréversible. Le compte sera définitivement supprimé.
              </p>
            </div>

            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(false)} disabled={deleting} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button
                onClick={handleDelete}
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

      {suspendConfirm && (
        <div
          className="users-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && !suspending) setSuspendConfirm(false); }}
        >
          <div className="users-modal users-modal--sm" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <h2>
                <div className="users-modal-avatar" style={{ background: "#FEF3C7", color: "#92400E" }}>
                  <i className="fa-solid fa-ban" />
                </div>
                Suspendre les bateaux
              </h2>
              <button className="users-modal-close" onClick={() => setSuspendConfirm(false)} disabled={suspending} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="users-modal-body">
              <div className="users-modal-delete-info">
                <div className="users-avatar" style={{ width: 48, height: 48, fontSize: "1rem", flexShrink: 0 }}>
                  {initials(user)}
                </div>
                <div>
                  <strong>{user.prenom} {user.nom}</strong>
                  <span style={{ display: "block", fontSize: ".8125rem", color: "var(--text-2)", marginTop: 2 }}>
                    {boats.length} bateau{boats.length > 1 ? "x" : ""} publié{boats.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <p style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "var(--radius-lg)", fontSize: ".875rem", color: "#92400E", lineHeight: 1.5 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginTop: 2, flexShrink: 0 }} />
                Tous les bateaux de ce propriétaire seront immédiatement retirés de la plateforme (statut « suspendu »). Cette action peut être annulée plus tard depuis la modération des annonces.
              </p>
            </div>

            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={() => setSuspendConfirm(false)} disabled={suspending} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button
                onClick={handleSuspendBoats}
                disabled={suspending}
                style={{ padding: "9px 18px", fontWeight: 700, background: "#D97706", color: "#fff", border: "none", borderRadius: "var(--radius-lg)", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: ".9375rem", opacity: suspending ? .7 : 1 }}
              >
                {suspending
                  ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />Suspension…</>
                  : <><i className="fa-solid fa-ban" style={{ marginRight: 6 }} />Suspendre</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

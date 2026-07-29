"use client";

import { useState, useEffect, useMemo } from "react";
import { utilisateursApi } from "@/shared/lib";
import type { UtilisateurAPI } from "@/shared/lib";
import "../../proprietaire/dashboard.css";
import "./utilisateurs.css";

/* ── Constantes ── */
const PAGE_SIZE = 10;

type EditForm = { statutCompte: "actif" | "inactif"; role: "admin" | "proprietaire" | "locataire" };

const ROLE_TO_API: Record<"admin" | "proprietaire" | "locataire", string[]> = {
  admin:        ["ROLE_ADMIN", "ROLE_PROPRIETAIRE", "ROLE_USER"],
  proprietaire: ["ROLE_PROPRIETAIRE", "ROLE_USER"],
  locataire:    ["ROLE_USER"],
};

/* ── Helpers ── */
function initials(u: UtilisateurAPI) {
  return ((u.prenom?.[0] ?? "") + (u.nom?.[0] ?? "")).toUpperCase() || "?";
}

function topRole(roles: string[]): "admin" | "proprietaire" | "locataire" {
  if (roles.includes("ROLE_ADMIN")) return "admin";
  if (roles.includes("ROLE_PROPRIETAIRE")) return "proprietaire";
  return "locataire";
}

const ROLE_LABEL: Record<"admin" | "proprietaire" | "locataire", string> = {
  admin: "Admin",
  proprietaire: "Propriétaire",
  locataire: "Locataire",
};

/* ── Composant ── */
export default function AdminUtilisateursPage() {
  const [users, setUsers]             = useState<UtilisateurAPI[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [filterRole, setFilterRole]   = useState("all");
  const [filterStatut, setFilterStatut] = useState("all");
  const [selected, setSelected]       = useState<Set<number>>(new Set());
  const [page, setPage]               = useState(1);
  const [editingUser, setEditingUser]  = useState<UtilisateurAPI | null>(null);
  const [editForm, setEditForm]       = useState<EditForm>({ statutCompte: "actif", role: "locataire" });
  const [saving, setSaving]           = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<UtilisateurAPI | null>(null);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    utilisateursApi
      .getAll()
      .then(setUsers)
      .catch(() => setError("Impossible de charger les utilisateurs."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filterRole !== "all" && topRole(u.roles) !== filterRole) return false;
          if (filterStatut === "actif"   && u.statutCompte !== "actif")   return false;
          if (filterStatut === "inactif" && u.statutCompte !== "inactif") return false;
      return true;
    });
  }, [users, filterRole, filterStatut]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageUsers  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allChecked = pageUsers.length > 0 && pageUsers.every((u) => selected.has(u.id));
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) pageUsers.forEach((u) => next.delete(u.id));
      else            pageUsers.forEach((u) => next.add(u.id));
      return next;
    });
  }
  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function startEdit(u: UtilisateurAPI) {
    setEditingUser(u);
    setEditForm({
      statutCompte: u.statutCompte === "inactif" ? "inactif" : "actif",
      role: topRole(u.roles),
    });
  }

  function closeModal() { setEditingUser(null); }

  async function saveEdit() {
    if (!editingUser) return;
    setSaving(true);
    try {
      const updatedUser = await utilisateursApi.patch(editingUser.id, {
        statut_compte: editForm.statutCompte,
        roles: ROLE_TO_API[editForm.role],
      });
      setUsers((prev) => prev.map((u) =>
        u.id === editingUser.id
          ? { ...u, ...updatedUser, roles: ROLE_TO_API[editForm.role] }
          : u
      ));
      setEditingUser(null);
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await utilisateursApi.delete(deleteConfirm.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
      setSelected((prev) => { const n = new Set(prev); n.delete(deleteConfirm.id); return n; });
      setDeleteConfirm(null);
    } catch {
      setError("Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  }

  function visiblePages(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)       return [1, 2, 3, 4, 5, "...", totalPages];
    if (page >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }

  return (
    <div className="dash-page">

      {/* ── Modal édition ── */}
      {/* ── Modal confirmation suppression ── */}
      {deleteConfirm && (
        <div
          className="users-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setDeleteConfirm(null); }}
        >
          <div className="users-modal users-modal--sm" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <h2>
                <div className="users-modal-avatar users-modal-avatar--danger">
                  <i className="fa-solid fa-trash" />
                </div>
                Supprimer l&apos;utilisateur
              </h2>
              <button className="users-modal-close" onClick={() => setDeleteConfirm(null)} disabled={deleting} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="users-modal-body">
              <div className="users-modal-delete-info">
                <div className="users-avatar" style={{ width: 48, height: 48, fontSize: "1rem", flexShrink: 0 }}>
                  {initials(deleteConfirm)}
                </div>
                <div>
                  <strong>{deleteConfirm.prenom} {deleteConfirm.nom}</strong>
                  <span style={{ display: "block", fontSize: ".8125rem", color: "var(--text-2)", marginTop: 2 }}>{deleteConfirm.email}</span>
                </div>
              </div>
              <p className="users-modal-delete-warning">
                <i className="fa-solid fa-triangle-exclamation" />
                Cette action est irréversible. Le compte sera définitivement supprimé.
              </p>
            </div>

            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)} disabled={deleting} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button
                onClick={deleteUser}
                disabled={deleting}
                style={{ padding: "9px 18px", fontWeight: 700, background: "var(--red)", color: "#fff", border: "none", borderRadius: "var(--radius-lg)", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: ".9375rem", transition: "var(--transition)", opacity: deleting ? .7 : 1 }}
              >
                {deleting
                  ? <><i className="fa-solid fa-spinner fa-spin" />Suppression…</>
                  : <><i className="fa-solid fa-trash" />Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div
          className="users-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="users-modal" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <h2>
                <div className="users-modal-avatar">{initials(editingUser)}</div>
                Modifier l'utilisateur
              </h2>
              <button className="users-modal-close" onClick={closeModal} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="users-modal-body">
              <div className="users-modal-info">
                <div className="users-avatar" style={{ width: 40, height: 40, fontSize: ".9rem", flexShrink: 0 }}>{initials(editingUser)}</div>
                <div>
                  <strong>{editingUser.prenom} {editingUser.nom}</strong>
                  <span style={{ display: "block", fontSize: ".8125rem", color: "var(--text-2)", marginTop: 2 }}>{editingUser.email}</span>
                </div>
              </div>

              <div className="users-modal-field">
                <label>Statut du compte</label>
                <div className="users-modal-status-row">
                  <button
                    type="button"
                    className={`users-modal-status-btn${editForm.statutCompte === "actif" ? " active" : ""}`}
                    onClick={() => setEditForm({ ...editForm, statutCompte: "actif" })}
                  >
                    <i className="fa-solid fa-circle-check" /> Actif
                  </button>
                  <button
                    type="button"
                    className={`users-modal-status-btn${editForm.statutCompte === "inactif" ? " inactive" : ""}`}
                    onClick={() => setEditForm({ ...editForm, statutCompte: "inactif" })}
                  >
                    <i className="fa-solid fa-circle-xmark" /> Inactif
                  </button>
                </div>
              </div>

              <div className="users-modal-field">
                <label htmlFor="edit-role">Rôle</label>
                <select
                  id="edit-role"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as EditForm["role"] })}
                  className="users-modal-select"
                >
                  <option value="locataire">Locataire</option>
                  <option value="proprietaire">Propriétaire</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={closeModal} disabled={saving} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={saving} style={{ padding: "9px 18px" }}>
                {saving
                  ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />Sauvegarde…</>
                  : <><i className="fa-solid fa-check" style={{ marginRight: 6 }} />Sauvegarder</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Gestion des utilisateurs</h1>
          <p className="dash-sub">Consultez, modifiez ou supprimez les comptes utilisateurs.</p>
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
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="proprietaire">Propriétaire</option>
            <option value="locataire">Locataire</option>
          </select>
          <select
            className="users-filter-select"
            value={filterStatut}
            onChange={(e) => { setFilterStatut(e.target.value); setPage(1); }}
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Désactivé</option>
          </select>
        </div>
        {selected.size > 0 && (
          <span style={{ fontSize: ".875rem", color: "var(--text-2)" }}>
            {selected.size} selectionne{selected.size > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div className="page-loading"><div className="page-loading-spinner" /></div>
      ) : (
        <div className="users-table-wrap">
          {filtered.length === 0 ? (
            <div className="users-empty">
              <i className="fa-solid fa-users" />
              <p>Aucun utilisateur trouve.</p>
            </div>
          ) : (
            <>
              <table className="users-table">
                <thead>
                  <tr>
                    <th className="col-check">
                      <input type="checkbox" className="users-checkbox" checked={allChecked} onChange={toggleAll} />
                    </th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th className="col-phone">Telephone</th>
                    <th>Statut</th>
                    <th>Role</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageUsers.map((u) => {
                    const role = topRole(u.roles);
                    return (
                      <tr key={u.id}>
                        <td className="col-check">
                          <input type="checkbox" className="users-checkbox" checked={selected.has(u.id)} onChange={() => toggleOne(u.id)} />
                        </td>
                        <td>
                          <div className="users-cell-user">
                            <div className="users-avatar">{initials(u)}</div>
                            <div>
                              <strong>{u.prenom} {u.nom}</strong>
                              <span>#{u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-2)" }}>{u.email}</td>
                        <td className="col-phone" style={{ color: "var(--text-2)" }}>{u.telephone ?? "-"}</td>
                        <td>
                          <span className={`badge-status ${u.statutCompte === "inactif" ? "red" : "green"}`}>
                            {u.statutCompte === "inactif" ? "Désactivé" : "Actif"}
                          </span>
                        </td>
                        <td>
                          <span className={`users-role-badge ${role}`}>
                            {ROLE_LABEL[role]}
                          </span>
                        </td>
                        <td>
                          <div className="users-actions">
                            <button className="users-action-btn" onClick={() => startEdit(u)} title="Modifier">
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button className="users-action-btn danger" onClick={() => setDeleteConfirm(u)} title="Supprimer">
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="users-footer">
                <span className="users-footer-count">
                  Page {page} sur {totalPages} - {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}
                </span>
                <div className="users-pagination">
                  <button className="users-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    <i className="fa-solid fa-chevron-left" style={{ fontSize: ".7rem" }} />
                  </button>
                  {visiblePages().map((p, i) =>
                    p === "..." ? (
                      <span key={`dots-${i}`} className="users-page-dots">...</span>
                    ) : (
                      <button key={p} className={`users-page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p as number)}>
                        {p}
                      </button>
                    )
                  )}
                  <button className="users-page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: ".7rem" }} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

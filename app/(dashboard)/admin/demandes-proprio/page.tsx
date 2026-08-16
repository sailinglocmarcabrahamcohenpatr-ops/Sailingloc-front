"use client";

import { useEffect, useMemo, useState } from "react";
import { ownerRequestsApi } from "@/shared/lib";
import type { OwnerRequestAPI, OwnerRequestStatus } from "@/shared/lib";
import "../../proprietaire/dashboard.css";
import "../utilisateurs/utilisateurs.css";

const STATUS_BADGE: Record<OwnerRequestStatus, { cls: string; label: string; icon: string }> = {
  pending:  { cls: "badge-status orange", label: "En attente", icon: "fa-clock" },
  approved: { cls: "badge-status green",  label: "Approuvée",  icon: "fa-circle-check" },
  rejected: { cls: "badge-status red",    label: "Refusée",    icon: "fa-circle-xmark" },
};

const FILTERS: { value: "all" | OwnerRequestStatus; label: string }[] = [
  { value: "all",      label: "Toutes" },
  { value: "pending",  label: "En attente" },
  { value: "approved", label: "Approuvées" },
  { value: "rejected", label: "Refusées" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminDemandesProprioPage() {
  const [requests, setRequests] = useState<OwnerRequestAPI[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState<"all" | OwnerRequestStatus>("pending");

  const [actionTarget, setActionTarget] = useState<{ request: OwnerRequestAPI; status: "approved" | "rejected" } | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    ownerRequestsApi
      .getAll()
      .then(setRequests)
      .catch(() => setError("Impossible de charger les demandes."))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: requests.length, pending: 0, approved: 0, rejected: 0 };
    for (const r of requests) c[r.status]++;
    return c;
  }, [requests]);

  const filtered = useMemo(
    () => (filter === "all" ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter]
  );

  function openAction(request: OwnerRequestAPI, status: "approved" | "rejected") {
    setActionTarget({ request, status });
    setComment("");
  }

  async function confirmAction() {
    if (!actionTarget) return;
    setSaving(true);
    try {
      const updated = await ownerRequestsApi.updateStatus(actionTarget.request.id, actionTarget.status, comment || undefined);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setActionTarget(null);
    } catch {
      setError("Erreur lors de la mise à jour de la demande.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Demandes propriétaire</h1>
          <p className="dash-sub">
            Approuvez ou refusez les demandes d&apos;accès à l&apos;espace propriétaire.
          </p>
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
            onChange={(e) => setFilter(e.target.value as "all" | OwnerRequestStatus)}
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label} ({counts[f.value] ?? 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="dash-empty-state">
          <i className="fa-solid fa-circle-notch fa-spin fa-2x" style={{ opacity: 0.3 }} />
          <p>Chargement des demandes…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-empty-state">
          <i className="fa-solid fa-user-check fa-2x" style={{ opacity: 0.3 }} />
          <p>Aucune demande {filter !== "all" ? STATUS_BADGE[filter as OwnerRequestStatus]?.label.toLowerCase() : ""} pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="docs-list">
          {filtered.map((r) => {
            const badge = STATUS_BADGE[r.status];
            return (
              <div key={r.id} className="doc-item">
                <div className="doc-icon">
                  <i className={`fa-solid ${r.ownerType === "professionnel" ? "fa-building" : "fa-user"}`} aria-hidden="true" />
                </div>

                <div className="doc-info">
                  <strong>{r.user ? `${r.user.prenom} ${r.user.nom}` : `Utilisateur #${r.id}`}</strong>
                  <span>{r.user?.email} · {r.phone}</span>
                  <span>
                    {r.city}, {r.country} · {r.ownerType === "professionnel" ? `Pro${r.companyName ? ` — ${r.companyName}` : ""}` : "Particulier"} · Demandé le {formatDate(r.createdAt)}
                  </span>
                  {r.status !== "pending" && r.adminComment && (
                    <span style={{ fontStyle: "italic" }}>Commentaire : {r.adminComment}</span>
                  )}
                </div>

                {r.status === "pending" ? (
                  <div className="doc-actions" style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openAction(r, "rejected")}>
                      <i className="fa-solid fa-xmark" /> Refuser
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => openAction(r, "approved")}>
                      <i className="fa-solid fa-check" /> Approuver
                    </button>
                  </div>
                ) : (
                  <span className={badge.cls}>
                    <i className={`fa-solid ${badge.icon}`} aria-hidden="true" />
                    {badge.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {actionTarget && (
        <div
          className="users-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && !saving) setActionTarget(null); }}
        >
          <div className="users-modal users-modal--sm" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <h2>
                <div className={`users-modal-avatar${actionTarget.status === "rejected" ? " users-modal-avatar--danger" : ""}`}>
                  <i className={`fa-solid ${actionTarget.status === "approved" ? "fa-check" : "fa-xmark"}`} />
                </div>
                {actionTarget.status === "approved" ? "Approuver la demande" : "Refuser la demande"}
              </h2>
              <button className="users-modal-close" onClick={() => setActionTarget(null)} disabled={saving} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="users-modal-body">
              <p>
                {actionTarget.status === "approved" ? (
                  <>Le compte de <strong>{actionTarget.request.user?.prenom} {actionTarget.request.user?.nom}</strong> obtiendra immédiatement le rôle propriétaire.</>
                ) : (
                  <>La demande de <strong>{actionTarget.request.user?.prenom} {actionTarget.request.user?.nom}</strong> sera marquée comme refusée.</>
                )}
              </p>
              <div className="users-modal-field">
                <label htmlFor="admin-comment">Commentaire {actionTarget.status === "rejected" ? "(visible par le demandeur)" : "(facultatif)"}</label>
                <textarea
                  id="admin-comment"
                  className="form-input"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={actionTarget.status === "rejected" ? "ex. Documents insuffisants." : "ex. Dossier complet, bienvenue !"}
                  maxLength={500}
                />
              </div>
            </div>

            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={() => setActionTarget(null)} disabled={saving} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button
                onClick={confirmAction}
                disabled={saving}
                className={actionTarget.status === "approved" ? "btn btn-primary" : undefined}
                style={actionTarget.status === "rejected"
                  ? { padding: "9px 18px", fontWeight: 700, background: "var(--red)", color: "#fff", border: "none", borderRadius: "var(--radius-lg)", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: ".9375rem", opacity: saving ? .7 : 1 }
                  : { padding: "9px 18px" }}
              >
                {saving
                  ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />Traitement…</>
                  : actionTarget.status === "approved"
                    ? <><i className="fa-solid fa-check" style={{ marginRight: 6 }} />Approuver</>
                    : <><i className="fa-solid fa-xmark" style={{ marginRight: 6 }} />Refuser</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

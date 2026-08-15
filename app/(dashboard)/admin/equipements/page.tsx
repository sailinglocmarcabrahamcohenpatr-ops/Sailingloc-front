"use client";

import { useEffect, useMemo, useState } from "react";
import {
  referentielsApi,
  typesEquipementsApi,
  equipementsApi,
  ApiError,
} from "@/shared/lib";
import type { TypeEquipementAPI, EquipementAPI } from "@/shared/lib/referentiels-api";
import "../../proprietaire/dashboard.css";
import "../utilisateurs/utilisateurs.css";
import "./equipements.css";

type TypeModalMode = "create" | "edit" | null;
type EquipModalMode = "create" | "edit" | null;

export default function AdminEquipementsPage() {
  const [types, setTypes] = useState<TypeEquipementAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  /* Catégories repliées — ouvertes par défaut, on ne garde que celles fermées manuellement. */
  const [closedTypeIds, setClosedTypeIds] = useState<Set<number>>(new Set());

  function toggleTypeOpen(id: number) {
    setClosedTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* ── Modale catégorie (type) ── */
  const [typeModalMode, setTypeModalMode] = useState<TypeModalMode>(null);
  const [editingType, setEditingType] = useState<TypeEquipementAPI | null>(null);
  const [typeLabel, setTypeLabel] = useState("");
  const [typeSaving, setTypeSaving] = useState(false);
  const [typeFormError, setTypeFormError] = useState("");
  const [deleteTypeTarget, setDeleteTypeTarget] = useState<TypeEquipementAPI | null>(null);
  const [deletingType, setDeletingType] = useState(false);

  /* ── Modale équipement ── */
  const [equipModalMode, setEquipModalMode] = useState<EquipModalMode>(null);
  const [editingEquip, setEditingEquip] = useState<EquipementAPI | null>(null);
  const [equipForm, setEquipForm] = useState({ nom: "", icone: "", typeId: null as number | null });
  const [equipSaving, setEquipSaving] = useState(false);
  const [equipFormError, setEquipFormError] = useState("");
  const [deleteEquipTarget, setDeleteEquipTarget] = useState<EquipementAPI | null>(null);
  const [deletingEquip, setDeletingEquip] = useState(false);

  useEffect(() => {
    referentielsApi
      .getTypesEquipements()
      .then((data) => setTypes(Array.isArray(data) ? data : []))
      .catch(() => setError("Impossible de charger les équipements."))
      .finally(() => setLoading(false));
  }, []);

  const totalEquipements = useMemo(
    () => types.reduce((sum, t) => sum + (t.equipements?.length ?? 0), 0),
    [types]
  );

  /* ── Catégorie : ouvrir / fermer ── */
  function openCreateType() {
    setEditingType(null);
    setTypeLabel("");
    setTypeFormError("");
    setTypeModalMode("create");
  }
  function openEditType(type: TypeEquipementAPI) {
    setEditingType(type);
    setTypeLabel(type.labelTypeEquipement);
    setTypeFormError("");
    setTypeModalMode("edit");
  }
  function closeTypeModal() {
    if (typeSaving) return;
    setTypeModalMode(null);
    setEditingType(null);
  }

  async function handleTypeSubmit() {
    if (!typeLabel.trim()) {
      setTypeFormError("Le nom de la catégorie est obligatoire.");
      return;
    }
    setTypeSaving(true);
    setTypeFormError("");
    try {
      if (typeModalMode === "edit" && editingType) {
        const updated = await typesEquipementsApi.update(editingType.id, {
          label_type_equipement: typeLabel.trim(),
        });
        setTypes((prev) =>
          prev.map((t) =>
            t.id === editingType.id
              ? { ...t, labelTypeEquipement: updated.labelTypeEquipement ?? typeLabel.trim() }
              : t
          )
        );
      } else {
        const created = await typesEquipementsApi.create({ label_type_equipement: typeLabel.trim() });
        setTypes((prev) => [...prev, { ...created, equipements: created.equipements ?? [] }]);
      }
      setTypeModalMode(null);
      setEditingType(null);
    } catch (err) {
      setTypeFormError(describeError(err, "gérer les catégories d'équipements", "Cette catégorie existe déjà."));
    } finally {
      setTypeSaving(false);
    }
  }

  async function handleTypeDelete() {
    if (!deleteTypeTarget) return;
    setDeletingType(true);
    try {
      await typesEquipementsApi.delete(deleteTypeTarget.id);
      setTypes((prev) => prev.filter((t) => t.id !== deleteTypeTarget.id));
      setDeleteTypeTarget(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Cette catégorie contient encore des équipements : déplacez-les ou supprimez-les d'abord.");
      } else {
        setError("Erreur lors de la suppression de la catégorie.");
      }
      setDeleteTypeTarget(null);
    } finally {
      setDeletingType(false);
    }
  }

  /* ── Équipement : ouvrir / fermer ── */
  function openCreateEquip(typeId: number) {
    setEditingEquip(null);
    setEquipForm({ nom: "", icone: "", typeId });
    setEquipFormError("");
    setEquipModalMode("create");
  }
  function openEditEquip(equip: EquipementAPI, typeId: number) {
    setEditingEquip(equip);
    setEquipForm({ nom: equip.nom, icone: equip.icone ?? "", typeId });
    setEquipFormError("");
    setEquipModalMode("edit");
  }
  function closeEquipModal() {
    if (equipSaving) return;
    setEquipModalMode(null);
    setEditingEquip(null);
  }

  async function handleEquipSubmit() {
    if (!equipForm.nom.trim() || !equipForm.typeId) {
      setEquipFormError("Le nom et la catégorie sont obligatoires.");
      return;
    }
    setEquipSaving(true);
    setEquipFormError("");
    try {
      if (equipModalMode === "edit" && editingEquip) {
        const updated = await equipementsApi.update(editingEquip.id, {
          nom: equipForm.nom.trim(),
          icone: equipForm.icone.trim() || null,
          type_equipement_id: equipForm.typeId,
        });
        const merged: EquipementAPI = {
          ...editingEquip,
          nom: updated.nom ?? equipForm.nom.trim(),
          icone: updated.icone ?? (equipForm.icone.trim() || null),
        };
        setTypes((prev) =>
          prev.map((t) => {
            const withoutEquip = (t.equipements ?? []).filter((e) => e.id !== editingEquip.id);
            if (t.id === equipForm.typeId) {
              return { ...t, equipements: [...withoutEquip, merged] };
            }
            return { ...t, equipements: withoutEquip };
          })
        );
      } else {
        const created = await equipementsApi.create({
          nom: equipForm.nom.trim(),
          type_equipement_id: equipForm.typeId,
          icone: equipForm.icone.trim() || undefined,
        });
        setTypes((prev) =>
          prev.map((t) =>
            t.id === equipForm.typeId
              ? { ...t, equipements: [...(t.equipements ?? []), created] }
              : t
          )
        );
      }
      setEquipModalMode(null);
      setEditingEquip(null);
    } catch (err) {
      setEquipFormError(describeError(err, "gérer les équipements", "Cet équipement existe déjà."));
    } finally {
      setEquipSaving(false);
    }
  }

  async function handleEquipDelete() {
    if (!deleteEquipTarget) return;
    setDeletingEquip(true);
    try {
      await equipementsApi.delete(deleteEquipTarget.id);
      setTypes((prev) =>
        prev.map((t) => ({ ...t, equipements: (t.equipements ?? []).filter((e) => e.id !== deleteEquipTarget.id) }))
      );
      setDeleteEquipTarget(null);
    } catch {
      setError("Erreur lors de la suppression de l'équipement.");
      setDeleteEquipTarget(null);
    } finally {
      setDeletingEquip(false);
    }
  }

  return (
    <div className="dash-page equip-admin-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Gestion des équipements</h1>
          <p className="dash-sub">
            {types.length} catégorie{types.length !== 1 ? "s" : ""} · {totalEquipements} équipement
            {totalEquipements !== 1 ? "s" : ""} référencé{totalEquipements !== 1 ? "s" : ""}.
          </p>
        </div>
        <button type="button" className="equip-add-btn" onClick={openCreateType}>
          <i className="fa-solid fa-plus" /> Ajouter une catégorie
        </button>
      </div>

      {error && (
        <div className="users-error">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
          <button onClick={() => setError("")}><i className="fa-solid fa-xmark" /></button>
        </div>
      )}

      {loading ? (
        <div className="page-loading"><div className="page-loading-spinner" /></div>
      ) : types.length === 0 ? (
        <div className="equip-card">
          <div className="users-empty">
            <i className="fa-solid fa-toolbox" />
            <p>Aucune catégorie d&apos;équipement pour l&apos;instant.</p>
          </div>
        </div>
      ) : (
        <div className="equip-groups">
          {types.map((type) => {
            const items = type.equipements ?? [];
            const isOpen = !closedTypeIds.has(type.id);
            const bodyId = `equip-type-body-${type.id}`;
            return (
              <div className="equip-card" key={type.id}>
                <div className="equip-card-hd">
                  <button
                    type="button"
                    className="equip-card-hd-info equip-card-hd-toggle"
                    onClick={() => toggleTypeOpen(type.id)}
                    aria-expanded={isOpen}
                    aria-controls={bodyId}
                  >
                    <div className="equip-card-icon"><i className="fa-solid fa-layer-group" /></div>
                    <div>
                      <h3>{type.labelTypeEquipement}</h3>
                      <span>{items.length} équipement{items.length !== 1 ? "s" : ""}</span>
                    </div>
                    <i className={`fa-solid fa-chevron-down equip-card-chevron${isOpen ? " open" : ""}`} aria-hidden="true" />
                  </button>
                  <div className="equip-card-hd-actions">
                    <button className="equip-row-action-btn" onClick={() => openCreateEquip(type.id)} title="Ajouter un équipement">
                      <i className="fa-solid fa-plus" />
                    </button>
                    <button className="equip-row-action-btn" onClick={() => openEditType(type)} title="Renommer la catégorie">
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button className="equip-row-action-btn danger" onClick={() => setDeleteTypeTarget(type)} title="Supprimer la catégorie">
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>

                <div id={bodyId} className={`equip-card-body${isOpen ? " open" : ""}`}>
                  {items.length === 0 ? (
                    <p className="equip-empty-hint">Aucun équipement dans cette catégorie.</p>
                  ) : (
                    <div className="equip-list">
                      {items.map((eq) => (
                        <div className="equip-row" key={eq.id}>
                          <div className="equip-row-icon">
                            <i className={eq.icone ? `fa-solid ${eq.icone}` : "fa-solid fa-check"} />
                          </div>
                          <div className="equip-row-info">
                            <strong>{eq.nom}</strong>
                          </div>
                          <div className="equip-row-actions">
                            <button className="equip-row-action-btn" onClick={() => openEditEquip(eq, type.id)} title="Modifier">
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button className="equip-row-action-btn danger" onClick={() => setDeleteEquipTarget(eq)} title="Supprimer">
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modale création / édition de catégorie ── */}
      {typeModalMode && (
        <div className="users-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeTypeModal(); }}>
          <div className="users-modal users-modal--sm" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <h2>
                <div className="users-modal-avatar equip-modal-icon"><i className="fa-solid fa-layer-group" /></div>
                {typeModalMode === "edit" ? "Renommer la catégorie" : "Ajouter une catégorie"}
              </h2>
              <button className="users-modal-close" onClick={closeTypeModal} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="users-modal-body">
              <div className="form-group">
                <label htmlFor="type-label">Nom de la catégorie *</label>
                <input
                  id="type-label"
                  type="text"
                  placeholder="Ex : Confort"
                  value={typeLabel}
                  onChange={(e) => setTypeLabel(e.target.value)}
                />
              </div>
              {typeFormError && (
                <p className="users-modal-error">
                  <i className="fa-solid fa-circle-exclamation" />
                  {typeFormError}
                </p>
              )}
            </div>
            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={closeTypeModal} disabled={typeSaving} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button
                className="btn btn-primary equip-primary-btn"
                onClick={handleTypeSubmit}
                disabled={typeSaving || !typeLabel.trim()}
                style={{ padding: "9px 18px" }}
              >
                {typeSaving
                  ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />Enregistrement…</>
                  : <><i className="fa-solid fa-check" style={{ marginRight: 6 }} />{typeModalMode === "edit" ? "Enregistrer" : "Créer"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale confirmation suppression catégorie ── */}
      {deleteTypeTarget && (
        <div className="users-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !deletingType) setDeleteTypeTarget(null); }}>
          <div className="users-modal users-modal--sm" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <h2>
                <div className="users-modal-avatar users-modal-avatar--danger"><i className="fa-solid fa-trash" /></div>
                Supprimer la catégorie
              </h2>
              <button className="users-modal-close" onClick={() => setDeleteTypeTarget(null)} disabled={deletingType} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="users-modal-body">
              <p>
                La catégorie <strong>{deleteTypeTarget.labelTypeEquipement}</strong> sera définitivement supprimée.
                Si elle contient encore des équipements, la suppression sera refusée.
              </p>
            </div>
            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteTypeTarget(null)} disabled={deletingType} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button
                onClick={handleTypeDelete}
                disabled={deletingType}
                style={{ padding: "9px 18px", fontWeight: 700, background: "var(--red)", color: "#fff", border: "none", borderRadius: "var(--radius-lg)", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: ".9375rem", opacity: deletingType ? .7 : 1 }}
              >
                {deletingType
                  ? <><i className="fa-solid fa-spinner fa-spin" />Suppression…</>
                  : <><i className="fa-solid fa-trash" />Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale création / édition d'équipement ── */}
      {equipModalMode && (
        <div className="users-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeEquipModal(); }}>
          <div className="users-modal users-modal--sm" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <h2>
                <div className="users-modal-avatar equip-modal-icon"><i className="fa-solid fa-toolbox" /></div>
                {equipModalMode === "edit" ? "Modifier l'équipement" : "Ajouter un équipement"}
              </h2>
              <button className="users-modal-close" onClick={closeEquipModal} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="users-modal-body">
              <div className="form-group">
                <label htmlFor="equip-nom">Nom *</label>
                <input
                  id="equip-nom"
                  type="text"
                  placeholder="Ex : Wifi"
                  value={equipForm.nom}
                  onChange={(e) => setEquipForm((f) => ({ ...f, nom: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="equip-icone">Icône (Font Awesome, optionnel)</label>
                <input
                  id="equip-icone"
                  type="text"
                  placeholder="Ex : fa-wifi"
                  value={equipForm.icone}
                  onChange={(e) => setEquipForm((f) => ({ ...f, icone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="equip-type">Catégorie *</label>
                <select
                  id="equip-type"
                  value={equipForm.typeId ?? ""}
                  onChange={(e) => setEquipForm((f) => ({ ...f, typeId: e.target.value ? Number(e.target.value) : null }))}
                >
                  <option value="" disabled>Sélectionner une catégorie</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.labelTypeEquipement}</option>
                  ))}
                </select>
              </div>
              {equipFormError && (
                <p className="users-modal-error">
                  <i className="fa-solid fa-circle-exclamation" />
                  {equipFormError}
                </p>
              )}
            </div>
            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={closeEquipModal} disabled={equipSaving} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button
                className="btn btn-primary equip-primary-btn"
                onClick={handleEquipSubmit}
                disabled={equipSaving || !equipForm.nom.trim() || !equipForm.typeId}
                style={{ padding: "9px 18px" }}
              >
                {equipSaving
                  ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />Enregistrement…</>
                  : <><i className="fa-solid fa-check" style={{ marginRight: 6 }} />{equipModalMode === "edit" ? "Enregistrer" : "Créer"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale confirmation suppression équipement ── */}
      {deleteEquipTarget && (
        <div className="users-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !deletingEquip) setDeleteEquipTarget(null); }}>
          <div className="users-modal users-modal--sm" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <h2>
                <div className="users-modal-avatar users-modal-avatar--danger"><i className="fa-solid fa-trash" /></div>
                Supprimer l&apos;équipement
              </h2>
              <button className="users-modal-close" onClick={() => setDeleteEquipTarget(null)} disabled={deletingEquip} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="users-modal-body">
              <p>
                L&apos;équipement <strong>{deleteEquipTarget.nom}</strong> sera définitivement supprimé et retiré de tous les bateaux qui l&apos;utilisent.
              </p>
            </div>
            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteEquipTarget(null)} disabled={deletingEquip} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button
                onClick={handleEquipDelete}
                disabled={deletingEquip}
                style={{ padding: "9px 18px", fontWeight: 700, background: "var(--red)", color: "#fff", border: "none", borderRadius: "var(--radius-lg)", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: ".9375rem", opacity: deletingEquip ? .7 : 1 }}
              >
                {deletingEquip
                  ? <><i className="fa-solid fa-spinner fa-spin" />Suppression…</>
                  : <><i className="fa-solid fa-trash" />Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function describeError(err: unknown, action: string, conflictMessage: string): string {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 500) return "Votre session a expiré. Reconnectez-vous puis réessayez.";
    if (err.status === 403) return `Vous n'avez pas les droits pour ${action}.`;
    if (err.status === 409) return conflictMessage;
    if (err.status === 404) return "Élément introuvable — il a peut-être déjà été supprimé.";
    return err.message;
  }
  return "Impossible de joindre le serveur. Réessayez dans un instant.";
}

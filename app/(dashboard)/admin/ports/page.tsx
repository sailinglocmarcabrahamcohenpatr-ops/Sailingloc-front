"use client";

import { useEffect, useMemo, useState } from "react";
import { portsApi, ApiError } from "@/shared/lib";
import type { PortAPI, CreatePortPayload } from "@/shared/lib/referentiels-api";
import { COUNTRIES } from "@/shared/config";
import { geocodeCity } from "@/features/list-boat/api/geocode";
import PortCityAutocomplete, { type PortCitySelection } from "@/features/list-boat/ui/PortCityAutocomplete";
import PortSelector, { type PortSelection } from "@/features/list-boat/ui/PortSelector";
import "../../proprietaire/dashboard.css";
import "../utilisateurs/utilisateurs.css";
import "./ports.css";

type PortForm = {
  nom: string;
  ville: string;
  codePostal: string;
  pays: string;
  latitude: string;
  longitude: string;
};

const EMPTY_FORM: PortForm = { nom: "", ville: "", codePostal: "", pays: "France", latitude: "", longitude: "" };

/* Normalise pour comparer : casse, accents et espaces multiples ignorés. */
function normalize(value: string): string {
  const DIACRITICS = /[̀-ͯ]/g;
  return value.normalize("NFD").replace(DIACRITICS, "").toLowerCase().replace(/\s+/g, " ").trim();
}

function formToPayload(f: PortForm): CreatePortPayload {
  return {
    nom: f.nom.trim(),
    ville: f.ville.trim(),
    pays: f.pays.trim() || undefined,
    codePostal: f.codePostal.trim() || undefined,
    latitude: f.latitude.trim() || undefined,
    longitude: f.longitude.trim() || undefined,
  };
}

function formatCoord(v: number | string | undefined): string {
  if (v == null || v === "") return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n.toFixed(4) : "—";
}

export default function AdminPortsPage() {
  const [ports, setPorts] = useState<PortAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingPort, setEditingPort] = useState<PortAPI | null>(null);
  const [form, setForm] = useState<PortForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PortAPI | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    portsApi
      .getAll()
      .then((data) => setPorts([...data].sort((a, b) => a.nom.localeCompare(b.nom))))
      .catch(() => setError("Impossible de charger les ports."))
      .finally(() => setLoading(false));
  }, []);

  const duplicate = useMemo(() => {
    if (!form.nom.trim()) return null;
    return ports.find(
      (p) =>
        p.id !== editingPort?.id &&
        normalize(p.nom) === normalize(form.nom) &&
        (!form.ville.trim() || normalize(p.ville ?? "") === normalize(form.ville))
    ) ?? null;
  }, [ports, form.nom, form.ville, editingPort]);

  /* Le pays d'un port existant (édition) peut ne pas figurer dans la liste
   * des pays couverts par la plateforme (`COUNTRIES`) — on l'ajoute alors
   * en tête pour ne pas le perdre silencieusement dans le sélecteur. */
  const paysOptions = useMemo(() => {
    const names = COUNTRIES.map((c) => c.name);
    return form.pays.trim() && !names.includes(form.pays.trim()) ? [form.pays.trim(), ...names] : names;
  }, [form.pays]);

  function openCreate() {
    setEditingPort(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalMode("create");
  }

  function openEdit(port: PortAPI) {
    setEditingPort(port);
    setForm({
      nom: port.nom ?? "",
      ville: port.ville ?? "",
      codePostal: port.codePostal ?? "",
      pays: port.pays ?? "France",
      latitude: port.latitude != null ? String(port.latitude) : "",
      longitude: port.longitude != null ? String(port.longitude) : "",
    });
    setFormError("");
    setModalMode("edit");
  }

  function closeModal() {
    if (saving) return;
    setModalMode(null);
    setEditingPort(null);
  }

  function handleCitySelect(s: PortCitySelection) {
    setForm((f) => ({
      ...f,
      ville: s.ville,
      codePostal: s.codePostal || f.codePostal,
      latitude: s.lat != null ? String(s.lat) : f.latitude,
      longitude: s.lng != null ? String(s.lng) : f.longitude,
      nom: f.nom.trim() || `Port de ${s.ville}`,
    }));
    setFormError("");
  }

  function handlePortSelect(s: PortSelection) {
    setForm((f) => ({ ...f, nom: s.nom, latitude: String(s.lat), longitude: String(s.lng) }));
    setFormError("");
  }

  /* Changer de pays invalide la ville et le port choisis pour l'ancien
   * pays : on repart d'un formulaire vierge pour ce pays plutôt que de
   * garder une ville/des coordonnées qui ne lui correspondent plus. */
  function handlePaysChange(pays: string) {
    setForm({ ...EMPTY_FORM, pays });
    setFormError("");
  }

  async function handleLocate() {
    if (!form.ville.trim()) {
      setFormError("Renseignez la ville avant de géolocaliser.");
      return;
    }
    setLocating(true);
    setFormError("");
    try {
      const geo = await geocodeCity(`${form.ville.trim()} ${form.codePostal.trim()}`.trim());
      if (geo) {
        setForm((f) => ({ ...f, latitude: String(geo.lat), longitude: String(geo.lng) }));
      } else {
        setFormError("Aucune coordonnée trouvée pour cette ville.");
      }
    } catch {
      setFormError("Service de géolocalisation indisponible. Renseignez les coordonnées manuellement.");
    } finally {
      setLocating(false);
    }
  }

  function validate(): string | null {
    if (!form.nom.trim() || !form.ville.trim()) return "Le nom du port et la ville sont obligatoires.";
    if (form.latitude.trim()) {
      const lat = parseFloat(form.latitude);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) return "Latitude invalide (doit être comprise entre -90 et 90).";
    }
    if (form.longitude.trim()) {
      const lng = parseFloat(form.longitude);
      if (Number.isNaN(lng) || lng < -180 || lng > 180) return "Longitude invalide (doit être comprise entre -180 et 180).";
    }
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = formToPayload(form);
      if (modalMode === "edit" && editingPort) {
        const updated = await portsApi.update(editingPort.id, payload);
        setPorts((prev) =>
          prev
            .map((p) => (p.id === editingPort.id ? { ...p, ...updated } : p))
            .sort((a, b) => a.nom.localeCompare(b.nom))
        );
      } else {
        const created = await portsApi.create(payload);
        setPorts((prev) => [...prev, created].sort((a, b) => a.nom.localeCompare(b.nom)));
      }
      setModalMode(null);
      setEditingPort(null);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 500) {
          setFormError("Votre session a expiré. Reconnectez-vous puis réessayez.");
        } else if (err.status === 403) {
          setFormError("Vous n'avez pas les droits pour gérer les ports.");
        } else if (err.status === 409) {
          setFormError("Ce port existe déjà.");
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError("Impossible de joindre le serveur. Réessayez dans un instant.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await portsApi.delete(deleteTarget.id);
      setPorts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Ce port est associé à des bateaux : impossible de le supprimer.");
      } else {
        setError("Erreur lors de la suppression du port.");
      }
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const withCoords = ports.filter((p) => p.latitude != null && p.longitude != null).length;

  return (
    <div className="dash-page ports-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Gestion des ports</h1>
          <p className="dash-sub">
            {ports.length} port{ports.length !== 1 ? "s" : ""} d&apos;attache référencé{ports.length !== 1 ? "s" : ""} sur la plateforme.
          </p>
        </div>
        <button type="button" className="ports-add-btn" onClick={openCreate}>
          <i className="fa-solid fa-plus" /> Ajouter un port
        </button>
      </div>

      {error && (
        <div className="users-error">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
          <button onClick={() => setError("")}><i className="fa-solid fa-xmark" /></button>
        </div>
      )}

      {!loading && ports.length > 0 && (
        <div className="ports-stats-grid">
          <div className="ports-stat-card ports-stat-hero">
            <div className="ports-stat-icon"><i className="fa-solid fa-anchor" /></div>
            <div>
              <div className="ports-stat-value">{ports.length}</div>
              <div className="ports-stat-label">Ports référencés</div>
            </div>
          </div>
          <div className="ports-stat-card">
            <div className="ports-stat-icon ports-stat-icon-alt"><i className="fa-solid fa-location-crosshairs" /></div>
            <div>
              <div className="ports-stat-value">{withCoords}</div>
              <div className="ports-stat-label">Avec coordonnées GPS</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading"><div className="page-loading-spinner" /></div>
      ) : ports.length === 0 ? (
        <div className="ports-card">
          <div className="users-empty">
            <i className="fa-solid fa-map-location-dot" />
            <p>Aucun port référencé pour l&apos;instant.</p>
          </div>
        </div>
      ) : (
        <div className="ports-card">
          <div className="ports-card-hd"><h3>Tous les ports</h3></div>
          <div className="ports-list">
            {ports.map((p) => (
              <div className="ports-row" key={p.id}>
                <div className="ports-row-icon"><i className="fa-solid fa-anchor" /></div>
                <div className="ports-row-info">
                  <strong>{p.nom}</strong>
                  <span>
                    {p.ville || "—"}
                    {p.codePostal ? ` (${p.codePostal})` : ""}
                    {p.pays ? ` · ${p.pays}` : ""}
                  </span>
                </div>
                <div className="ports-row-coords">
                  {p.latitude != null && p.longitude != null
                    ? <span className="ports-coord-badge">{formatCoord(p.latitude)}, {formatCoord(p.longitude)}</span>
                    : <span className="ports-coord-badge ports-coord-badge-empty">Non renseignées</span>}
                </div>
                <div className="ports-row-actions">
                  <button className="ports-row-action-btn" onClick={() => openEdit(p)} title="Modifier">
                    <i className="fa-solid fa-pen" />
                  </button>
                  <button className="ports-row-action-btn danger" onClick={() => setDeleteTarget(p)} title="Supprimer">
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal création / édition ── */}
      {modalMode && (
        <div
          className="users-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="users-modal ports-modal" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <h2>
                <div className="users-modal-avatar ports-modal-icon"><i className="fa-solid fa-anchor" /></div>
                {modalMode === "edit" ? "Modifier le port" : "Ajouter un port"}
              </h2>
              <button className="users-modal-close" onClick={closeModal} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="users-modal-body">
              <div className="ports-form-grid">
                <div className="form-group">
                  <label htmlFor="port-pays">Pays</label>
                  <select
                    id="port-pays"
                    value={form.pays}
                    onChange={(e) => handlePaysChange(e.target.value)}
                  >
                    {paysOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="port-ville">Ville *</label>
                  <PortCityAutocomplete
                    id="port-ville"
                    ville={form.ville}
                    pays={form.pays}
                    onVilleChange={(ville) => setForm((f) => ({ ...f, ville }))}
                    onSelect={handleCitySelect}
                  />
                </div>

                <div className="ports-selector-row">
                  <PortSelector id="port-selector" pays={form.pays} ville={form.ville} onSelect={handlePortSelect} />
                </div>

                <div className="form-group">
                  <label htmlFor="port-nom">Nom du port *</label>
                  <input
                    id="port-nom"
                    type="text"
                    placeholder="Ex : Port de Cannes"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="port-cp">Code postal</label>
                  <input
                    id="port-cp"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex : 06400"
                    value={form.codePostal}
                    onChange={(e) => setForm({ ...form, codePostal: e.target.value })}
                  />
                </div>
              </div>

              <div className="ports-coords-row">
                <div className="form-group">
                  <label htmlFor="port-lat">Latitude</label>
                  <input
                    id="port-lat"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex : 43.5513"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="port-lng">Longitude</label>
                  <input
                    id="port-lng"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex : 7.0128"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="ports-locate-btn"
                  onClick={handleLocate}
                  disabled={locating || !form.ville.trim()}
                  title="Renseigner automatiquement les coordonnées à partir de la ville"
                >
                  {locating
                    ? <><i className="fa-solid fa-spinner fa-spin" /> Recherche…</>
                    : <><i className="fa-solid fa-location-crosshairs" /> Géolocaliser</>}
                </button>
              </div>

              {duplicate && !formError && (
                <p className="port-create-warn">
                  <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
                  « {duplicate.nom} » existe déjà{duplicate.ville ? ` à ${duplicate.ville}` : ""}. Vérifiez avant de continuer.
                </p>
              )}

              {formError && (
                <p className="users-modal-error">
                  <i className="fa-solid fa-circle-exclamation" />
                  {formError}
                </p>
              )}
            </div>

            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={closeModal} disabled={saving} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button
                className="btn btn-primary ports-primary-btn"
                onClick={handleSubmit}
                disabled={saving || !form.nom.trim() || !form.ville.trim()}
                style={{ padding: "9px 18px" }}
              >
                {saving
                  ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />Enregistrement…</>
                  : <><i className="fa-solid fa-check" style={{ marginRight: 6 }} />{modalMode === "edit" ? "Enregistrer" : "Créer ce port"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmation suppression ── */}
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
                Supprimer le port
              </h2>
              <button className="users-modal-close" onClick={() => setDeleteTarget(null)} disabled={deleting} aria-label="Fermer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="users-modal-body">
              <p>
                Le port <strong>{deleteTarget.nom}</strong> sera définitivement supprimé. S&apos;il est utilisé par des bateaux existants, la suppression peut être refusée.
              </p>
            </div>

            <div className="users-modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleting} style={{ padding: "9px 18px" }}>
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: "9px 18px", fontWeight: 700, background: "var(--red)", color: "#fff", border: "none", borderRadius: "var(--radius-lg)", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: ".9375rem", opacity: deleting ? .7 : 1 }}
              >
                {deleting
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

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import "@/features/list-boat/ui/list-boat.css";
import SearchableSelect from "@/features/list-boat/ui/SearchableSelect";
import { MOTORISATION_OPTIONS, type Motorisation } from "@/features/list-boat";
import { boatsApi, referentielsApi, portsApi, useAuth } from "@/shared/lib";
import type { TypeBateauAPI, PortAPI } from "@/shared/lib";

export default function EditBoatPage() {
  const params = useParams<{ id: string }>();
  const boatId = params.id;
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const [boatTypes, setBoatTypes] = useState<TypeBateauAPI[]>([]);
  const [ports, setPorts] = useState<PortAPI[]>([]);
  const [ownerId, setOwnerId] = useState<number | undefined>(undefined);

  const [typeId, setTypeId] = useState<number | null>(null);
  const [motorisation, setMotorisation] = useState<Motorisation>("voile");
  const [name, setName] = useState("");
  const [portId, setPortId] = useState<number | null>(null);
  const [length, setLength] = useState("");
  const [capacity, setCapacity] = useState("");
  const [cabins, setCabins] = useState("");
  const [permisRequis, setPermisRequis] = useState(false);
  const [carburantInclus, setCarburantInclus] = useState(false);
  const [skipper, setSkipper] = useState(false);
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [prixHeure, setPrixHeure] = useState("");
  const [caution, setCaution] = useState("");

  useEffect(() => {
    Promise.all([boatsApi.getOne(boatId), referentielsApi.getTypesBateaux(), portsApi.getAll()])
      .then(([boat, types, portsRes]) => {
        setBoatTypes(Array.isArray(types) ? types : []);
        setPorts(Array.isArray(portsRes) ? portsRes : []);
        setOwnerId(boat.id_utilisateur);
        setTypeId(boat.id_type_bateau ?? boat.type_bateau?.id ?? null);
        setMotorisation((boat.motorisation as Motorisation) || "voile");
        setName(boat.nomBateau ?? "");
        setPortId(boat.id_port ?? boat.port?.id ?? null);
        setLength(boat.taille && boat.taille !== "—" ? boat.taille : "");
        setCapacity(boat.capacite != null ? String(boat.capacite) : "");
        setCabins(boat.nombreCabines != null ? String(boat.nombreCabines) : "");
        setPermisRequis(Boolean(boat.permisRequis));
        setCarburantInclus(Boolean(boat.carburantInclus));
        setSkipper(Boolean(boat.avecSkipper));
        setDescription(boat.description ?? "");
        setPricePerDay(boat.prixJour != null ? String(boat.prixJour) : "");
        setPrixHeure(boat.prixHeure != null ? String(boat.prixHeure) : "");
        setCaution(boat.caution != null ? String(boat.caution) : "");
      })
      .catch(() => setError("Impossible de charger ce bateau."))
      .finally(() => setLoading(false));
  }, [boatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeId || !portId || !name.trim() || !pricePerDay || !length.trim()) {
      setSaveError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      await boatsApi.update(boatId, {
        nom_bateau: name.trim(),
        motorisation,
        taille: length.trim(),
        prix_jour: parseFloat(pricePerDay),
        id_port: portId,
        id_utilisateur: ownerId ?? user?.id,
        id_type_bateau: typeId,
        capacite: capacity ? parseInt(capacity, 10) : undefined,
        avec_skipper: skipper,
        description: description || undefined,
        caution: caution ? parseFloat(caution) : undefined,
        permis_requis: permisRequis,
        nombre_cabines: cabins ? parseInt(cabins, 10) : undefined,
        carburant_inclus: carburantInclus,
        prix_heure: prixHeure ? parseFloat(prixHeure) : undefined,
      });
      setSaved(true);
      setTimeout(() => router.push("/proprietaire/bateaux"), 1200);
    } catch {
      setSaveError("Impossible d'enregistrer les modifications. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>Chargement…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-page">
        <p style={{ color: "var(--red)", padding: "24px" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <Link href="/proprietaire/bateaux" className="cal-back-link">
            <i className="fa-solid fa-arrow-left" /> Mes bateaux
          </Link>
          <h1 className="dash-title">Modifier — {name || "bateau"}</h1>
          <p className="dash-sub">Les photos et documents se gèrent séparément (bientôt disponible ici).</p>
        </div>
      </div>

      <form className="list-boat-form" onSubmit={handleSubmit} noValidate style={{ maxWidth: 760 }}>
        <div className="form-section">
          <h3>Type de bateau *</h3>
          <SearchableSelect
            id="eb-type"
            options={boatTypes.map((bt) => ({ value: bt.id, label: bt.labelTypeBateau }))}
            value={typeId}
            onChange={(v) => setTypeId(Number(v))}
            placeholder="Sélectionner un type de bateau…"
            searchPlaceholder="Rechercher un type…"
            required
          />

          <h3 style={{ marginTop: "24px" }}>Motorisation *</h3>
          <div className="radio-group">
            {MOTORISATION_OPTIONS.map((opt) => (
              <label key={opt.value} className="radio-label">
                <input
                  type="radio"
                  name="motorisation"
                  value={opt.value}
                  checked={motorisation === opt.value}
                  onChange={() => setMotorisation(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>

          <h3 style={{ marginTop: "24px" }}>Informations générales</h3>
          <div className="form-group">
            <label htmlFor="eb-name">Nom du bateau *</label>
            <input id="eb-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="eb-port">Port d&apos;attache *</label>
              <SearchableSelect
                id="eb-port"
                options={ports.map((p) => ({
                  value: p.id,
                  label: p.nom,
                  sub: [p.ville, p.pays].filter(Boolean).join(", "),
                }))}
                value={portId}
                onChange={(v) => setPortId(Number(v) || null)}
                placeholder="Sélectionner un port…"
                searchPlaceholder="Rechercher par nom ou ville…"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="eb-length">Taille *</label>
              <input id="eb-length" type="text" placeholder="Ex: 12m" value={length} onChange={(e) => setLength(e.target.value)} required />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="eb-capacity">Capacité (pers.)</label>
              <input id="eb-capacity" type="number" min="1" max="30" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="eb-cabins">Cabines</label>
              <input id="eb-cabins" type="number" min="0" max="10" value={cabins} onChange={(e) => setCabins(e.target.value)} />
            </div>
          </div>

          <h3 style={{ marginTop: "24px" }}>Options</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={skipper} onChange={(e) => setSkipper(e.target.checked)} />
              Avec skipper disponible
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={permisRequis} onChange={(e) => setPermisRequis(e.target.checked)} />
              Permis requis
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={carburantInclus} onChange={(e) => setCarburantInclus(e.target.checked)} />
              Carburant inclus
            </label>
          </div>

          <h3 style={{ marginTop: "24px" }}>Tarification</h3>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="eb-price">Prix par jour (€) *</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">€</span>
                <input id="eb-price" type="number" min="10" step="0.01" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="eb-prix-heure">Prix par heure (€)</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">€</span>
                <input id="eb-prix-heure" type="number" min="0" step="0.01" value={prixHeure} onChange={(e) => setPrixHeure(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="eb-caution">Caution (€)</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">€</span>
              <input id="eb-caution" type="number" min="0" step="0.01" value={caution} onChange={(e) => setCaution(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "8px" }}>
            <label htmlFor="eb-desc">Description</label>
            <textarea id="eb-desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <div className="form-wizard-nav">
          {saveError && (
            <p style={{ color: "var(--red)", fontSize: ".875rem", flex: 1 }}>
              <i className="fa-solid fa-triangle-exclamation" /> {saveError}
            </p>
          )}
          {saved && (
            <p style={{ color: "var(--green)", fontSize: ".875rem", flex: 1 }}>
              <i className="fa-solid fa-circle-check" /> Modifications enregistrées !
            </p>
          )}
          <div className="form-wizard-nav-actions">
            <Link href="/proprietaire/bateaux" className="btn-ghost">Annuler</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <><i className="fa-solid fa-circle-notch fa-spin" /> Enregistrement…</>
              ) : (
                <><i className="fa-solid fa-check" /> Enregistrer les modifications</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

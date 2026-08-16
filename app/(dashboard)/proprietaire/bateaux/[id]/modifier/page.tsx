"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import "@/features/list-boat/ui/list-boat.css";
import SearchableSelect from "@/features/list-boat/ui/SearchableSelect";
import EquipementsPicker from "@/features/list-boat/ui/EquipementsPicker";
import type { Motorisation } from "@/features/list-boat";
import { boatsApi, referentielsApi, portsApi, useAuth } from "@/shared/lib";
import type { TypeBateauAPI, PortAPI, TypeEquipementAPI, EquipementAPI } from "@/shared/lib";
import { useI18n } from "@/shared/i18n";

export default function EditBoatPage() {
  const params = useParams<{ id: string }>();
  const boatId = params.id;
  const router = useRouter();
  const { user } = useAuth();
  const t = useI18n().dict.editBoatPage;
  const tf = useI18n().dict.listBoatForm;
  const MOTORISATION_OPTIONS: { value: Motorisation; label: string }[] = [
    { value: "voile",   label: tf.motorSail },
    { value: "moteur",  label: tf.motorEngine },
    { value: "hybride", label: tf.motorHybrid },
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const [boatTypes, setBoatTypes] = useState<TypeBateauAPI[]>([]);
  const [ports, setPorts] = useState<PortAPI[]>([]);
  const [typesEquipements, setTypesEquipements] = useState<TypeEquipementAPI[]>([]);
  const [originalEquipementIds, setOriginalEquipementIds] = useState<Set<number>>(new Set());
  const [selectedEquipementIds, setSelectedEquipementIds] = useState<Set<number>>(new Set());
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
    Promise.all([boatsApi.getOne(boatId), referentielsApi.getTypesBateaux(), portsApi.getAll(), referentielsApi.getTypesEquipements()])
      .then(([boat, types, portsRes, typesEq]) => {
        setBoatTypes(Array.isArray(types) ? types : []);
        setPorts(Array.isArray(portsRes) ? portsRes : []);
        setTypesEquipements(Array.isArray(typesEq) ? typesEq : []);
        setOwnerId(boat.id_utilisateur);
        setTypeId(boat.id_type_bateau ?? boat.typeBateau?.id ?? null);
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
        const existingIds = new Set<number>((boat.equipements ?? []).map((eq: EquipementAPI) => eq.id));
        setOriginalEquipementIds(existingIds);
        setSelectedEquipementIds(new Set(existingIds));
      })
      .catch(() => setError(t.errLoad))
      .finally(() => setLoading(false));
  }, [boatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeId || !portId || !name.trim() || !pricePerDay || !length.trim()) {
      setSaveError(t.errRequired);
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

      const toAdd = [...selectedEquipementIds].filter((id) => !originalEquipementIds.has(id));
      const toRemove = [...originalEquipementIds].filter((id) => !selectedEquipementIds.has(id));
      await Promise.all([
        ...(toAdd.length > 0 ? [boatsApi.addEquipements(boatId, toAdd)] : []),
        ...toRemove.map((id) => boatsApi.removeEquipement(boatId, id)),
      ]);

      setSaved(true);
      setTimeout(() => router.push("/proprietaire/bateaux"), 1200);
    } catch {
      setSaveError(t.errSave);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>{t.loading}</div>
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
            <i className="fa-solid fa-arrow-left" /> {t.backLink}
          </Link>
          <h1 className="dash-title">{t.titlePrefix}{name || t.boatFallback}</h1>
          <p className="dash-sub">{t.sub}</p>
        </div>
      </div>

      <form className="list-boat-form" onSubmit={handleSubmit} noValidate style={{ maxWidth: 760 }}>
        <div className="form-section">
          <h3>{tf.step0Type}</h3>
          <SearchableSelect
            id="eb-type"
            options={boatTypes.map((bt) => ({ value: bt.id, label: bt.labelTypeBateau }))}
            value={typeId}
            onChange={(v) => setTypeId(Number(v))}
            placeholder={tf.step0TypePlaceholder}
            searchPlaceholder={tf.step0TypeSearchPlaceholder}
            required
          />

          <h3 style={{ marginTop: "24px" }}>{tf.step0Motorisation}</h3>
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

          <h3 style={{ marginTop: "24px" }}>{tf.step0GeneralInfo}</h3>
          <div className="form-group">
            <label htmlFor="eb-name">{tf.step0Name}</label>
            <input id="eb-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="eb-port">{tf.step0Port}</label>
              <SearchableSelect
                id="eb-port"
                options={ports.map((p) => ({
                  value: p.id,
                  label: p.nom,
                  sub: [p.ville, p.pays].filter(Boolean).join(", "),
                }))}
                value={portId}
                onChange={(v) => setPortId(Number(v) || null)}
                placeholder={tf.step0PortPlaceholder}
                searchPlaceholder={tf.step0PortSearchPlaceholder}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="eb-length">{tf.step0Length}</label>
              <input id="eb-length" type="text" placeholder={tf.step0LengthPlaceholder} value={length} onChange={(e) => setLength(e.target.value)} required maxLength={20} />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="eb-capacity">{tf.step0Capacity}</label>
              <input id="eb-capacity" type="number" min="1" max="30" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="eb-cabins">{tf.step0Cabins}</label>
              <input id="eb-cabins" type="number" min="0" max="10" value={cabins} onChange={(e) => setCabins(e.target.value)} />
            </div>
          </div>

          <h3 style={{ marginTop: "24px" }}>{tf.step0Options}</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={skipper} onChange={(e) => setSkipper(e.target.checked)} />
              {tf.optSkipper}
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={permisRequis} onChange={(e) => setPermisRequis(e.target.checked)} />
              {tf.optPermis}
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={carburantInclus} onChange={(e) => setCarburantInclus(e.target.checked)} />
              {tf.optCarburant}
            </label>
          </div>

          <h3 style={{ marginTop: "24px" }}>{tf.step0Pricing}</h3>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="eb-price">{tf.pricePerDay}</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">€</span>
                <input id="eb-price" type="number" min="10" step="0.01" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="eb-prix-heure">{tf.pricePerHour}</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">€</span>
                <input id="eb-prix-heure" type="number" min="0" step="0.01" value={prixHeure} onChange={(e) => setPrixHeure(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="eb-caution">{tf.caution}</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">€</span>
              <input id="eb-caution" type="number" min="0" step="0.01" value={caution} onChange={(e) => setCaution(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "8px" }}>
            <label htmlFor="eb-desc">{tf.step0Description}</label>
            <textarea id="eb-desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
          </div>

          {/* ── Équipements ── */}
          <div className="form-group" style={{ marginTop: "24px" }}>
            <label>{tf.equipementsTitle}</label>
            <p className="form-hint">{tf.equipementsSubtitle}</p>
            <EquipementsPicker
              typesEquipements={typesEquipements}
              selectedIds={selectedEquipementIds}
              emptyLabel={tf.equipementsNone}
              onToggle={(equipementId, checked) => {
                setSelectedEquipementIds((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(equipementId);
                  else next.delete(equipementId);
                  return next;
                });
              }}
            />
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
              <i className="fa-solid fa-circle-check" /> {t.saveSuccess}
            </p>
          )}
          <div className="form-wizard-nav-actions">
            <Link href="/proprietaire/bateaux" className="btn-ghost">{t.cancel}</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <><i className="fa-solid fa-circle-notch fa-spin" /> {t.saving}</>
              ) : (
                <><i className="fa-solid fa-check" /> {t.submit}</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import "./list-boat.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib";
import { boatsApi } from "@/shared/lib/boats-api";
import { referentielsApi, portsApi } from "@/shared/lib/referentiels-api";
import type { TypeBateauAPI, PortAPI } from "@/shared/lib/referentiels-api";
import { geocodeCity, type GeocodeResult } from "../api/geocode";
import { compressImage } from "../lib/compressImage";
import LocationMap from "./LocationMapLoader";
import SearchableSelect from "./SearchableSelect";

const STEPS = ["Type & infos", "Photos & description", "Tarifs", "Disponibilités", "Récapitulatif"];
const MIN_PHOTOS = 3;
const MAX_PHOTOS = 8;

type GeocodeStatus = "idle" | "loading" | "success" | "error";

export default function ListBoatForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submittingRef = useRef(false);

  /* ── Données API ── */
  const [boatTypes, setBoatTypes] = useState<TypeBateauAPI[]>([]);
  const [ports,     setPorts]     = useState<PortAPI[]>([]);

  useEffect(() => {
    referentielsApi.getTypesBateaux()
      .then((res) => {
        const arr = Array.isArray(res) ? res
          : (res as Record<string, unknown>)?.["hydra:member"] as TypeBateauAPI[]
          ?? (res as Record<string, unknown>)?.["data"]         as TypeBateauAPI[]
          ?? [];
        setBoatTypes(arr);
      })
      .catch(() => {});
    portsApi.getAll()
      .then((res) => {
        const arr = Array.isArray(res) ? res
          : (res as Record<string, unknown>)?.["hydra:member"] as PortAPI[]
          ?? (res as Record<string, unknown>)?.["data"]         as PortAPI[]
          ?? [];
        setPorts(arr);
      })
      .catch(() => {});
  }, []);

  /* ── Form state ── */
  const [typeId,    setTypeId]    = useState<number | null>(null);
  const [name,      setName]      = useState("");
  const [portId,    setPortId]    = useState<number | null>(null);
  const [geocodeStatus, setGeocodeStatus] = useState<GeocodeStatus>("idle");
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(null);
  const [length,    setLength]    = useState("");
  const [capacity,  setCapacity]  = useState("");
  const [cabins,    setCabins]    = useState("");
  const [year,      setYear]      = useState("");
  const [license,   setLicense]   = useState("Requis");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [weeklyDiscount, setWeeklyDiscount] = useState("10");
  const [caution,   setCaution]   = useState("2000");
  const [skipper,   setSkipper]   = useState(false);

  const [photos,    setPhotos]    = useState<string[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canContinue = step !== 1 || photos.length >= MIN_PHOTOS;

  const next = () => {
    if (!canContinue) {
      setPhotoError(`Ajoutez au moins ${MIN_PHOTOS} photos pour continuer.`);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const addFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    setPhotoError("");
    const room = MAX_PHOTOS - photos.length;
    const accepted = imageFiles.slice(0, room);
    const compressed = await Promise.all(accepted.map((f) => compressImage(f)));
    setPhotos((prev) => [...prev, ...compressed]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const setMainPhoto = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      return [picked, ...next];
    });
  };

  const handleLocatePort = async (portId: number) => {
    const port = ports.find((p) => p.id === portId);
    if (!port?.ville) return;
    setGeocodeStatus("loading");
    try {
      const result = await geocodeCity(port.ville);
      if (result) { setGeocodeResult(result); setGeocodeStatus("success"); }
      else { setGeocodeResult(null); setGeocodeStatus("error"); }
    } catch {
      setGeocodeResult(null); setGeocodeStatus("error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setSubmitError("");

    try {
      if (!typeId || !portId || !name || !pricePerDay) {
        setSubmitError("Veuillez remplir tous les champs obligatoires.");
        return;
      }
      await boatsApi.create({
        nom_bateau:     name,
        motorisation:   "voile",
        taille:         length ? `${length} m` : "—",
        prix_jour:      parseInt(pricePerDay, 10),
        id_port:        portId,
        id_utilisateur: user?.id ?? 0,
        id_type_bateau: typeId,
        capacite:       capacity ? parseInt(capacity, 10) : 1,
        avec_skipper:   skipper,
        statut:         "en_attente",
      });
      router.push("/proprietaire/bateaux");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de la soumission.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <form className="list-boat-form" onSubmit={handleSubmit} noValidate>
      <div className="form-wizard">
        <div className="form-wizard-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`wizard-step${i <= step ? " done" : ""}${i === step ? " current" : ""}`}>
              <div className="wizard-dot">{i < step ? <i className="fa-solid fa-check" /> : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div className="form-wizard-progress">
          <div className="form-wizard-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="list-boat-body">
        {step === 0 && (
          <div className="form-section">
            <h3>Type de bateau</h3>
            {boatTypes.length === 0 ? (
              <p style={{ color: "var(--text-2)", fontSize: ".875rem" }}>
                <i className="fa-solid fa-circle-notch fa-spin" /> Chargement des types…
              </p>
            ) : (
              <>
                <SearchableSelect
                  id="lb-type"
                  options={boatTypes.map((bt) => ({ value: bt.id, label: bt.labelTypeBateau }))}
                  value={typeId}
                  onChange={(v) => setTypeId(Number(v))}
                  placeholder="Sélectionner un type de bateau…"
                  searchPlaceholder="Rechercher un type…"
                  required
                />
                {/* Affichage en grille après sélection */}
                {typeId !== null && (
                  <div className="boat-type-select-grid" style={{ marginTop: 4 }}>
                    {boatTypes.map((bt) => (
                      <button
                        key={bt.id}
                        type="button"
                        className={`boat-type-select-btn${typeId === bt.id ? " active" : ""}`}
                        onClick={() => setTypeId(bt.id)}
                      >
                        {bt.labelTypeBateau}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            <h3>Informations techniques</h3>
            <div className="form-group">
              <label htmlFor="lb-name">Nom du bateau *</label>
              <input id="lb-name" type="text" placeholder="Ex: Sun Odyssey 440" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="lb-port">Port d'attache *</label>
                <SearchableSelect
                  id="lb-port"
                  options={ports.map((p) => ({
                    value: p.id,
                    label: p.nom,
                    sub: [p.ville, p.pays].filter(Boolean).join(", "),
                  }))}
                  value={portId}
                  onChange={(v) => {
                    const id = Number(v);
                    setPortId(id || null);
                    if (id) handleLocatePort(id);
                  }}
                  placeholder="Sélectionner un port…"
                  searchPlaceholder="Rechercher par nom ou ville…"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lb-year">Année de construction</label>
                <input id="lb-year" type="number" placeholder="2020" min="1970" max={new Date().getFullYear()} value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
            </div>

            {geocodeStatus === "success" && geocodeResult && (
              <div className="location-preview-map-wrap">
                <LocationMap lat={geocodeResult.lat} lng={geocodeResult.lng} />
              </div>
            )}
            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="lb-length">Longueur (m)</label>
                <input id="lb-length" type="text" placeholder="10.5" value={length} onChange={(e) => setLength(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="lb-capacity">Capacité (pers.)</label>
                <input id="lb-capacity" type="number" placeholder="6" min="1" max="30" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="lb-cabins">Cabines</label>
                <input id="lb-cabins" type="number" placeholder="2" min="0" max="10" value={cabins} onChange={(e) => setCabins(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Permis requis</label>
              <div className="radio-group">
                {["Requis", "Non requis"].map((v) => (
                  <label key={v} className="radio-label">
                    <input type="radio" name="license" value={v} checked={license === v} onChange={() => setLicense(v)} />
                    {v}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Skipper disponible</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="skipper" checked={skipper} onChange={() => setSkipper(true)} /> Avec skipper
                </label>
                <label className="radio-label">
                  <input type="radio" name="skipper" checked={!skipper} onChange={() => setSkipper(false)} /> Sans skipper
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="form-section">
            <h3>Photos de votre bateau</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <div
              className={`photo-upload-zone${dragActive ? " drag-active" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
            >
              <i className="fa-solid fa-cloud-arrow-up" />
              <p><strong>Glissez vos photos ici</strong> ou cliquez pour sélectionner</p>
              <small>JPG, PNG — Minimum {MIN_PHOTOS} photos, {MAX_PHOTOS} maximum</small>
              <button type="button" className="btn btn-outline btn-sm" onClick={(e) => e.stopPropagation()}>
                <i className="fa-solid fa-image" /> Choisir des photos
              </button>
            </div>

            <div className="photo-count-hint" data-ok={photos.length >= MIN_PHOTOS}>
              <i className={`fa-solid ${photos.length >= MIN_PHOTOS ? "fa-circle-check" : "fa-circle-info"}`} aria-hidden="true" />
              {photos.length} / {MIN_PHOTOS} photos minimum
            </div>
            {photoError && (
              <small className="form-hint" style={{ color: "var(--red)" }}>
                {photoError}
              </small>
            )}

            {photos.length > 0 && (
              <div className="photo-preview-grid">
                {photos.map((src, i) => (
                  <div key={src.slice(-24) + i} className="photo-preview-item">
                    <img src={src} alt={`Photo ${i + 1} du bateau`} />
                    {i === 0 ? (
                      <span className="photo-preview-main-badge">
                        <i className="fa-solid fa-star" aria-hidden="true" /> Principale
                      </span>
                    ) : (
                      <button type="button" className="photo-set-main-btn" onClick={() => setMainPhoto(i)}>
                        Définir comme principale
                      </button>
                    )}
                    <button
                      type="button"
                      className="photo-preview-remove"
                      onClick={() => removePhoto(i)}
                      aria-label="Retirer cette photo"
                    >
                      <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="photo-tips">
              <h4>Conseils pour de bonnes photos</h4>
              <ul>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> Photo depuis l'arrière du bateau en mer</li>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> Cockpit et poste de barre</li>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> Cabine principale bien éclairée</li>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> Cuisine et salle de bain</li>
              </ul>
            </div>
            <div className="form-group" style={{ marginTop: "32px" }}>
              <label htmlFor="lb-desc">Description *</label>
              <textarea
                id="lb-desc"
                rows={6}
                placeholder="Décrivez votre bateau : ses atouts, son histoire, les zones de navigation idéales, le matériel inclus…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <small className="form-hint">{description.length}/2000 caractères (minimum 100 recommandés)</small>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-section">
            <h3>Tarification</h3>
            <div className="form-group">
              <label htmlFor="lb-price">Prix par jour (€) *</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">€</span>
                <input id="lb-price" type="number" placeholder="350" min="10" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required />
              </div>
              <small className="form-hint">Bateaux similaires sur SailingLoc : 200 € – 900 € / jour</small>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="lb-weekly">Remise semaine (%)</label>
                <div className="input-suffix-wrap">
                  <input id="lb-weekly" type="number" placeholder="10" min="0" max="50" value={weeklyDiscount} onChange={(e) => setWeeklyDiscount(e.target.value)} />
                  <span className="input-suffix">%</span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="lb-caution">Caution (€)</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">€</span>
                  <input id="lb-caution" type="number" placeholder="2000" min="0" value={caution} onChange={(e) => setCaution(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="price-estimate">
              <div className="price-estimate-title">Estimation mensuelle</div>
              <div className="price-estimate-row">
                <span>4 semaines × {pricePerDay ? `${pricePerDay} € × 7 j` : "—"}</span>
                <strong>{pricePerDay ? `${(parseInt(pricePerDay) * 28 * 0.85).toLocaleString("fr-FR")} €` : "—"}</strong>
              </div>
              <small>Après commission SailingLoc (15 %) et frais de service</small>
            </div>
            <div className="form-group" style={{ marginTop: "24px" }}>
              <label>Services inclus</label>
              <div className="checkbox-group">
                {["Linge de bord", "Kit de sécurité", "Carburant inclus", "Skipper disponible", "Cours de voile", "Transfert aéroport"].map((s) => (
                  <label key={s} className="checkbox-label">
                    <input type="checkbox" /> {s}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-section">
            <h3>Disponibilités</h3>
            <p className="form-section-desc">Définissez les périodes où votre bateau est disponible à la location.</p>
            <div className="availability-mock">
              <div className="availability-calendar-placeholder">
                <i className="fa-regular fa-calendar" />
                <p>Calendrier de disponibilités</p>
                <small>Sélectionnez les mois disponibles pour la location</small>
                <div className="month-grid">
                  {["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"].map((m) => (
                    <label key={m} className="month-btn-label">
                      <input type="checkbox" defaultChecked={["Mai", "Juin", "Juil", "Aoû", "Sep"].includes(m)} />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Durée minimale de location</label>
              <div className="radio-group">
                {["1 jour", "3 jours", "1 semaine", "2 semaines"].map((v) => (
                  <label key={v} className="radio-label">
                    <input type="radio" name="min-duration" value={v} defaultChecked={v === "1 semaine"} />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="form-section">
            <h3>Récapitulatif de votre annonce</h3>
            <div className="list-boat-recap">
              <div className="recap-row">
                <span><i className="fa-solid fa-sailboat" /> Type</span>
                <strong>{BOAT_TYPES.find((b) => b.value === type)?.label ?? type}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-tag" /> Nom</span>
                <strong>{name || "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-location-dot" /> Port d'attache</span>
                <strong>{location || "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-city" /> Ville</span>
                <strong>{city || "—"}{geocodeResult ? " (localisée sur la carte)" : ""}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-euro-sign" /> Prix / jour</span>
                <strong>{pricePerDay ? `${pricePerDay} €` : "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-percent" /> Remise semaine</span>
                <strong>{weeklyDiscount}%</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-shield-halved" /> Caution</span>
                <strong>{caution ? `${caution} €` : "—"}</strong>
              </div>
            </div>
            <div className="list-boat-cgv">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  J'accepte les <a href="#" className="auth-link">conditions pour les propriétaires</a> et je certifie être le propriétaire ou le représentant légal de ce bateau.
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="form-wizard-nav">
        {step > 0 && (
          <button type="button" className="btn btn-outline" onClick={prev}>
            <i className="fa-solid fa-arrow-left" /> Retour
          </button>
        )}        {submitError && (
          <p style={{ color: "var(--red)", fontSize: ".875rem", flex: 1, textAlign: "center" }}>
            <i className="fa-solid fa-triangle-exclamation" /> {submitError}
          </p>
        )}        {step < STEPS.length - 1 ? (
          <div style={{ width: '100%', padding: '10px', display: 'flex'  }}>
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={next}>
            Continuer <i className="fa-solid fa-arrow-right" />
          </button>
          </div>
        ) : (
          <button type="submit" className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={loading}>
            {loading ? <><i className="fa-solid fa-circle-notch fa-spin" /> Publication…</> : <><i className="fa-solid fa-paper-plane" /> Publier mon annonce</>}
          </button>
        )}
      </div>
    </form>
  );
}

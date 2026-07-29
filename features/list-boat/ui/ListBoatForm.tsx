"use client";

import "./list-boat.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib";
import { boatsApi } from "@/shared/lib/boats-api";
import { referentielsApi, portsApi } from "@/shared/lib/referentiels-api";
import type { TypeBateauAPI, PortAPI, TypeDocumentAPI } from "@/shared/lib/referentiels-api";
import { geocodeCity, type GeocodeResult } from "../api/geocode";
import { uploadPhoto } from "../api/photos";
import { uploadDocument } from "../api/documents";
import { compressImage } from "../lib/compressImage";
import { STEPS, MIN_PHOTOS, MAX_PHOTOS, MOTORISATION_OPTIONS } from "../model/constants";
import type { PhotoEntry, DocumentEntry, Motorisation, SubmitStep } from "../model/types";
import { loadDraft, clearDraft, useFormDraft } from "../lib/useFormDraft";
import { saveFilesToDraft, loadFilesFromDraft, clearFilesDraft } from "../lib/filesDraft";
import LocationMap from "./LocationMapLoader";
import SearchableSelect from "./SearchableSelect";

type GeocodeStatus = "idle" | "loading" | "success" | "error";

export default function ListBoatForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [uploadedPhotos, setUploadedPhotos] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const submittingRef = useRef(false);

  /* ── Données API ── */
  const [boatTypes, setBoatTypes] = useState<TypeBateauAPI[]>([]);
  const [ports,     setPorts]     = useState<PortAPI[]>([]);
  const [docTypes,  setDocTypes]  = useState<TypeDocumentAPI[]>([]);

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
    referentielsApi.getTypesDocuments()
      .then((res) => {
        const arr = Array.isArray(res) ? res
          : (res as Record<string, unknown>)?.["hydra:member"] as TypeDocumentAPI[]
          ?? (res as Record<string, unknown>)?.["data"]         as TypeDocumentAPI[]
          ?? [];
        console.log("document types: ", res)
        setDocTypes(arr);
      })
      .catch(() => {});
  }, []);

  /* ── Form state ── */
  const [typeId,          setTypeId]          = useState<number | null>(null);
  const [motorisation,    setMotorisation]    = useState<Motorisation>("voile");
  const [name,            setName]            = useState("");
  const [portId,          setPortId]          = useState<number | null>(null);
  const [geocodeStatus,   setGeocodeStatus]   = useState<GeocodeStatus>("idle");
  const [geocodeResult,   setGeocodeResult]   = useState<GeocodeResult | null>(null);
  const [length,          setLength]          = useState("");
  const [capacity,        setCapacity]        = useState("");
  const [cabins,          setCabins]          = useState("");
  const [permisRequis,    setPermisRequis]    = useState(false);
  const [carburantInclus, setCarburantInclus] = useState(false);
  const [skipper,         setSkipper]         = useState(false);
  const [description,     setDescription]     = useState("");
  const [pricePerDay,     setPricePerDay]     = useState("");
  const [prixHeure,       setPrixHeure]       = useState("");
  const [caution,         setCaution]         = useState("");

  const [photos,     setPhotos]     = useState<PhotoEntry[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── 3 slots de documents fixes ── */
  const [docCarteGrise, setDocCarteGrise] = useState<File | null>(null);
  const [docAssurance,  setDocAssurance]  = useState<File | null>(null);
  const [docCertificat, setDocCertificat] = useState<File | null>(null);
  const refCarteGrise = useRef<HTMLInputElement>(null);
  const refAssurance  = useRef<HTMLInputElement>(null);
  const refCertificat = useRef<HTMLInputElement>(null);

  /* ── Restauration du brouillon au montage ── */
  useEffect(() => {
    const draft = loadDraft();
    if (!draft) return;
    if (draft.typeId     !== undefined) setTypeId(draft.typeId);
    if (draft.motorisation)             setMotorisation(draft.motorisation);
    if (draft.name)                     setName(draft.name);
    if (draft.portId     !== undefined) setPortId(draft.portId);
    if (draft.length     !== undefined) setLength(draft.length);
    if (draft.capacity   !== undefined) setCapacity(draft.capacity);
    if (draft.cabins     !== undefined) setCabins(draft.cabins);
    if (draft.permisRequis    !== undefined) setPermisRequis(draft.permisRequis);
    if (draft.carburantInclus !== undefined) setCarburantInclus(draft.carburantInclus);
    if (draft.skipper    !== undefined) setSkipper(draft.skipper);
    if (draft.description !== undefined) setDescription(draft.description);
    if (draft.pricePerDay !== undefined) setPricePerDay(draft.pricePerDay);
    if (draft.prixHeure   !== undefined) setPrixHeure(draft.prixHeure);
    if (draft.caution     !== undefined) setCaution(draft.caution);
    if (draft.step        !== undefined) setStep(draft.step);
    if (draft) setDraftRestored(true);

    // Restauration des fichiers depuis IndexedDB (async)
    loadFilesFromDraft().then(async (files) => {
      if (!files) return;
      if (files.photos.length > 0) {
        const entries = await Promise.all(files.photos.map((file) => compressImage(file)));
        setPhotos(entries);
      }
      if (files.carteGrise) setDocCarteGrise(files.carteGrise);
      if (files.assurance)  setDocAssurance(files.assurance);
      if (files.certificat) setDocCertificat(files.certificat);
      if (!draft && (files.photos.length > 0 || files.carteGrise || files.assurance || files.certificat)) {
        setDraftRestored(true);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Auto-sauvegarde brouillon ── */
  useFormDraft({
    typeId, motorisation, name, portId, length, capacity, cabins,
    permisRequis, carburantInclus, skipper, description, pricePerDay, prixHeure, caution,
    step,
  });

  const [stepError, setStepError] = useState("");

  const next = () => {
    setStepError("");

    if (step === 0) {
      if (!typeId)        { setStepError("Veuillez sélectionner un type de bateau."); return; }
      if (!name.trim())   { setStepError("Veuillez saisir le nom du bateau."); return; }
      if (!portId)        { setStepError("Veuillez sélectionner un port d'attache."); return; }
      if (!length.trim()) { setStepError("Veuillez saisir la taille du bateau."); return; }
      if (!pricePerDay)   { setStepError("Veuillez saisir le prix par jour."); return; }
    }

    if (step === 1 && photos.length < MIN_PHOTOS) {
      setPhotoError(`Ajoutez au moins ${MIN_PHOTOS} photos pour continuer.`);
      return;
    }

    if (step === 2) {
      if (!docCarteGrise) { setStepError("Veuillez joindre la carte grise."); return; }
      if (!docAssurance)  { setStepError("Veuillez joindre l'attestation d'assurance."); return; }
      if (!docCertificat) { setStepError("Veuillez joindre le certificat."); return; }
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => { setStepError(""); setStep((s) => Math.max(s - 1, 0)); };

  /* ── Sauvegarder et reprendre plus tard ── */
  const handleSaveAndExit = async () => {
    await saveFilesToDraft({ photos, carteGrise: docCarteGrise, assurance: docAssurance, certificat: docCertificat });
    setDraftSaved(true);
    setTimeout(() => router.push("/proprietaire/bateaux"), 1800);
  };

  /* ── Photos helpers ── */
  const addFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    setPhotoError("");
    const room = MAX_PHOTOS - photos.length;
    const accepted = imageFiles.slice(0, room);
    const entries = await Promise.all(accepted.map((file) => compressImage(file)));
    setPhotos((prev) => [...prev, ...entries]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  /** Sélection d'un document justificatif — compresse les photos de documents (souvent plusieurs Mo depuis un téléphone) avant de les stocker ; laisse les PDF tels quels. */
  const handleDocSelect = async (file: File, setter: (f: File) => void) => {
    if (file.type.startsWith("image/")) {
      const { file: compressed } = await compressImage(file, 2000, 0.85);
      setter(compressed);
    } else {
      setter(file);
    }
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

  const handleLocatePort = async (id: number) => {
    const port = ports.find((p) => p.id === id);
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

  /* ── Recherche du type document par mots-clés ── */
  const findDocTypeId = (keywords: string[]): number | null => {
    if (!docTypes.length) return null;
    const match = docTypes.find((dt) => {
      const label = (dt.labelTypeDocument ?? dt.libelle ?? "").toLowerCase();
      return keywords.some((kw) => label.includes(kw));
    });
    return match?.id ?? docTypes[0]?.id ?? null;
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitError("");

    try {
      if (!cgvAccepted) {
        setSubmitError("Veuillez accepter les conditions pour les propriétaires avant de publier.");
        return;
      }

      if (!typeId || !portId || !name || !pricePerDay || !length) {
        setSubmitError("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      // Étape 1 — Créer le bateau
      setSubmitStep("boat");
      const boat = await boatsApi.create({
        nom_bateau:       name,
        motorisation,
        taille:           length.trim().endsWith("m") ? length.trim() : `${length.trim()}m`,
        prix_jour:        parseFloat(pricePerDay),
        id_port:          portId,
        id_utilisateur:   user?.id ?? 0,
        id_type_bateau:   typeId,
        capacite:         capacity ? parseInt(capacity, 10) : undefined,
        avec_skipper:     skipper,
        description:      description || undefined,
        caution:          caution ? parseFloat(caution) : undefined,
        permis_requis:    permisRequis,
        nombre_cabines:   cabins ? parseInt(cabins, 10) : undefined,
        carburant_inclus: carburantInclus,
        prix_heure:       prixHeure ? parseFloat(prixHeure) : undefined,
      });

      // Étape 2 — Uploader les photos
      setSubmitStep("photos");
      setUploadedPhotos(0);
      for (let i = 0; i < photos.length; i++) {
        await uploadPhoto(boat.id, photos[i].file, i + 1);
        setUploadedPhotos(i + 1);
      }

      // Étape 3 — Uploader les documents
      const docSlots = [
        { file: docCarteGrise, keywords: ["carte grise", "grise"] },          // id 10
        { file: docAssurance,  keywords: ["assurance"] },                     // id 11
        { file: docCertificat, keywords: ["certificat ce", "certificat"] },   // id 12
      ].filter((s): s is { file: File; keywords: string[] } => s.file !== null);

      if (docSlots.length > 0) {
        setSubmitStep("documents");
        setUploadedDocs(0);
        for (let i = 0; i < docSlots.length; i++) {
          const typeId = findDocTypeId(docSlots[i].keywords);
          if (typeId) {
            await uploadDocument(boat.id, docSlots[i].file, typeId);
          }
          setUploadedDocs(i + 1);
        }
      }

      clearDraft();
      clearFilesDraft();
      setSubmitted(true);
      setTimeout(() => router.push("/proprietaire/bateaux"), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de la soumission.");
      setSubmitStep("idle");
    } finally {
      submittingRef.current = false;
    }
  };

  /* ── Computed ── */
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const isSubmitting = submitStep !== "idle";
  const selectedPort = ports.find((p) => p.id === portId);
  const selectedType = boatTypes.find((bt) => bt.id === typeId);

  function submitLabel() {
    switch (submitStep) {
      case "boat":      return <><i className="fa-solid fa-circle-notch fa-spin" /> Création du bateau…</>;
      case "photos":    return <><i className="fa-solid fa-circle-notch fa-spin" /> Photos ({uploadedPhotos}/{photos.length})…</>;
      case "documents": return <><i className="fa-solid fa-circle-notch fa-spin" /> Documents ({uploadedDocs}/{[docCarteGrise, docAssurance, docCertificat].filter(Boolean).length})…</>;
      default:          return <><i className="fa-solid fa-paper-plane" /> Publier mon annonce</>;
    }
  }

  if (submitted) {
    return (
      <div className="save-confirm">
        <i className="fa-solid fa-hourglass-half" />
        <h3>Votre annonce a bien été soumise !</h3>
        <p>
          Nos équipes vérifient actuellement vos documents légaux. Votre bateau sera mis en ligne
          et ouvert à la location dès que la validation sera terminée.
        </p>
        <small>Redirection vers votre espace…</small>
      </div>
    );
  }

  if (draftSaved) {
    return (
      <div className="save-confirm">
        <i className="fa-solid fa-circle-check" />
        <h3>Brouillon sauvegardé !</h3>
        <p>Vos informations ont été enregistrées. Vous pouvez reprendre à tout moment.</p>
        <small>Redirection vers votre espace…</small>
      </div>
    );
  }

  return (
    <form className="list-boat-form" onSubmit={handleSubmit} noValidate>
      {draftRestored && (
        <div className="draft-banner">
          <i className="fa-solid fa-rotate-left" />
          <span>Brouillon restauré — vos données ont été récupérées automatiquement.</span>
          <button
            type="button"
            className="draft-banner-clear"
            onClick={() => {
              clearDraft();
              clearFilesDraft();
              setDraftRestored(false);
              setTypeId(null); setMotorisation("voile"); setName(""); setPortId(null);
              setLength(""); setCapacity(""); setCabins(""); setPermisRequis(false);
              setCarburantInclus(false); setSkipper(false); setDescription("");
              setPricePerDay(""); setPrixHeure(""); setCaution(""); setStep(0);
              setPhotos([]); setDocCarteGrise(null); setDocAssurance(null); setDocCertificat(null);
            }}
            title="Effacer le brouillon"
          >
            <i className="fa-solid fa-xmark" /> Effacer
          </button>
        </div>
      )}

      {/* ── Progress wizard ── */}
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

        {/* ── ÉTAPE 0 — INFORMATIONS ── */}
        {step === 0 && (
          <div className="form-section">
            <h3>Type de bateau *</h3>
            {boatTypes.length === 0 ? (
              <p style={{ color: "var(--text-2)", fontSize: ".875rem" }}>
                <i className="fa-solid fa-circle-notch fa-spin" /> Chargement des types…
              </p>
            ) : (
              <SearchableSelect
                id="lb-type"
                options={boatTypes.map((bt) => ({ value: bt.id, label: bt.labelTypeBateau }))}
                value={typeId}
                onChange={(v) => { setTypeId(Number(v)); setStepError(""); }}
                placeholder="Sélectionner un type de bateau…"
                searchPlaceholder="Rechercher un type…"
                required
              />
            )}

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
              <label htmlFor="lb-name">Nom du bateau *</label>
              <input
                id="lb-name"
                type="text"
                placeholder="Ex: Sun Odyssey 440"
                value={name}
                onChange={(e) => { setName(e.target.value); setStepError(""); }}
                className={stepError && !name.trim() ? "input-error" : ""}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="lb-port">Port d'attache *</label>
                <div className={stepError && !portId ? "field-error" : ""}>
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
                      setStepError("");
                      if (id) handleLocatePort(id);
                    }}
                    placeholder="Sélectionner un port…"
                    searchPlaceholder="Rechercher par nom ou ville…"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="lb-length">Taille *</label>
                <input
                  id="lb-length"
                  type="text"
                  placeholder="Ex: 12m"
                  value={length}
                  onChange={(e) => { setLength(e.target.value); setStepError(""); }}
                  className={stepError && !length.trim() ? "input-error" : ""}
                  required
                />
              </div>
            </div>

            {geocodeStatus === "success" && geocodeResult && (
              <div className="location-preview-map-wrap">
                <LocationMap lat={geocodeResult.lat} lng={geocodeResult.lng} />
              </div>
            )}

            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="lb-capacity">Capacité (pers.)</label>
                <input id="lb-capacity" type="number" placeholder="8" min="1" max="30" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="lb-cabins">Cabines</label>
                <input id="lb-cabins" type="number" placeholder="3" min="0" max="10" value={cabins} onChange={(e) => setCabins(e.target.value)} />
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
                <label htmlFor="lb-price">Prix par jour (€) *</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">€</span>
                  <input
                    id="lb-price"
                    type="number"
                    placeholder="250.00"
                    min="10"
                    step="0.01"
                    value={pricePerDay}
                    onChange={(e) => { setPricePerDay(e.target.value); setStepError(""); }}
                    className={stepError && !pricePerDay ? "input-error" : ""}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="lb-prix-heure">Prix par heure (€)</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">€</span>
                  <input
                    id="lb-prix-heure"
                    type="number"
                    placeholder="50.00"
                    min="0"
                    step="0.01"
                    value={prixHeure}
                    onChange={(e) => setPrixHeure(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="lb-caution">Caution (€)</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">€</span>
                <input id="lb-caution" type="number" placeholder="500" min="0" step="0.01" value={caution} onChange={(e) => setCaution(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "8px" }}>
              <label htmlFor="lb-desc">Description</label>
              <textarea
                id="lb-desc"
                rows={5}
                placeholder="Décrivez votre bateau : ses atouts, son histoire, les zones de navigation idéales, le matériel inclus…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <small className="form-hint">{description.length}/2000 caractères</small>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 1 — PHOTOS ── */}
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
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
            >
              <i className="fa-solid fa-cloud-arrow-up" />
              <p><strong>Glissez vos photos ici</strong> ou cliquez pour sélectionner</p>
              <small>JPG, PNG, WEBP — Minimum {MIN_PHOTOS} photos, {MAX_PHOTOS} maximum</small>
              <button type="button" className="btn btn-outline btn-sm" onClick={(e) => e.stopPropagation()}>
                <i className="fa-solid fa-image" /> Choisir des photos
              </button>
            </div>

            <div className="photo-count-hint" data-ok={photos.length >= MIN_PHOTOS}>
              <i className={`fa-solid ${photos.length >= MIN_PHOTOS ? "fa-circle-check" : "fa-circle-info"}`} aria-hidden="true" />
              {photos.length} / {MIN_PHOTOS} photos minimum
            </div>
            {photoError && (
              <small className="form-hint" style={{ color: "var(--red)" }}>{photoError}</small>
            )}

            {photos.length > 0 && (
              <div className="photo-preview-grid">
                {photos.map((entry, i) => (
                  <div key={entry.file.name + i} className="photo-preview-item">
                    <img src={entry.preview} alt={`Photo ${i + 1} du bateau`} />
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
          </div>
        )}

        {/* ── ÉTAPE 2 — DOCUMENTS ── */}
        {step === 2 && (
          <div className="form-section">
            <h3>Documents justificatifs</h3>
            <div className="form-section-desc-box">
              <i className="fa-solid fa-circle-exclamation" />
              <p>
                Les 3 documents sont <strong>obligatoires</strong> pour soumettre votre annonce.
                Ils permettent à l&apos;admin de vérifier votre identité de propriétaire avant publication.
              </p>
            </div>

            {/* Carte grise */}
            <div className="doc-slot">
              <div className="doc-slot-header">
                <i className="fa-solid fa-file-lines" />
                <div>
                  <span className="doc-slot-label">Carte grise <span className="doc-slot-required">*</span></span>
                  <span className="doc-slot-hint">Certificat d&apos;immatriculation du bateau</span>
                </div>
              </div>
              {docCarteGrise ? (
                <div className="doc-slot-file">
                  <i className={`fa-solid ${docCarteGrise.type === "application/pdf" ? "fa-file-pdf" : "fa-file-image"}`} />
                  <span>{docCarteGrise.name}</span>
                  <button type="button" className="doc-slot-remove" onClick={() => setDocCarteGrise(null)} aria-label="Retirer">
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ) : (
                <button type="button" className="doc-slot-btn" onClick={() => refCarteGrise.current?.click()}>
                  <i className="fa-solid fa-upload" /> Choisir un fichier
                </button>
              )}
              <input ref={refCarteGrise} type="file" accept=".pdf,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocSelect(f, setDocCarteGrise); e.target.value = ""; }} />
            </div>

            {/* Assurance */}
            <div className="doc-slot">
              <div className="doc-slot-header">
                <i className="fa-solid fa-shield-halved" />
                <div>
                  <span className="doc-slot-label">Assurance <span className="doc-slot-required">*</span></span>
                  <span className="doc-slot-hint">Attestation d&apos;assurance en cours de validité</span>
                </div>
              </div>
              {docAssurance ? (
                <div className="doc-slot-file">
                  <i className={`fa-solid ${docAssurance.type === "application/pdf" ? "fa-file-pdf" : "fa-file-image"}`} />
                  <span>{docAssurance.name}</span>
                  <button type="button" className="doc-slot-remove" onClick={() => setDocAssurance(null)} aria-label="Retirer">
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ) : (
                <button type="button" className="doc-slot-btn" onClick={() => refAssurance.current?.click()}>
                  <i className="fa-solid fa-upload" /> Choisir un fichier
                </button>
              )}
              <input ref={refAssurance} type="file" accept=".pdf,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocSelect(f, setDocAssurance); e.target.value = ""; }} />
            </div>

            {/* Certificat */}
            <div className="doc-slot">
              <div className="doc-slot-header">
                <i className="fa-solid fa-certificate" />
                <div>
                  <span className="doc-slot-label">Certificat <span className="doc-slot-required">*</span></span>
                  <span className="doc-slot-hint">Titre de propriété ou certificat de jauge</span>
                </div>
              </div>
              {docCertificat ? (
                <div className="doc-slot-file">
                  <i className={`fa-solid ${docCertificat.type === "application/pdf" ? "fa-file-pdf" : "fa-file-image"}`} />
                  <span>{docCertificat.name}</span>
                  <button type="button" className="doc-slot-remove" onClick={() => setDocCertificat(null)} aria-label="Retirer">
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ) : (
                <button type="button" className="doc-slot-btn" onClick={() => refCertificat.current?.click()}>
                  <i className="fa-solid fa-upload" /> Choisir un fichier
                </button>
              )}
              <input ref={refCertificat} type="file" accept=".pdf,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocSelect(f, setDocCertificat); e.target.value = ""; }} />
            </div>


          </div>
        )}

        {/* ── ÉTAPE 3 — RÉCAPITULATIF ── */}
        {step === 3 && (
          <div className="form-section">
            <h3>Récapitulatif de votre annonce</h3>
            <div className="list-boat-recap">
              <div className="recap-row">
                <span><i className="fa-solid fa-sailboat" /> Type</span>
                <strong>{selectedType?.labelTypeBateau ?? "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-water" /> Motorisation</span>
                <strong>{MOTORISATION_OPTIONS.find((o) => o.value === motorisation)?.label ?? motorisation}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-tag" /> Nom</span>
                <strong>{name || "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-location-dot" /> Port d'attache</span>
                <strong>{selectedPort ? `${selectedPort.nom} – ${selectedPort.ville}` : "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-ruler-horizontal" /> Taille</span>
                <strong>{length || "—"}</strong>
              </div>
              {capacity && (
                <div className="recap-row">
                  <span><i className="fa-solid fa-users" /> Capacité</span>
                  <strong>{capacity} pers.</strong>
                </div>
              )}
              {cabins && (
                <div className="recap-row">
                  <span><i className="fa-solid fa-bed" /> Cabines</span>
                  <strong>{cabins}</strong>
                </div>
              )}
              <div className="recap-row">
                <span><i className="fa-solid fa-image" /> Photos</span>
                <strong>{photos.length} photo{photos.length !== 1 ? "s" : ""}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-file" /> Documents</span>
                <strong>
                  {[docCarteGrise && "Carte grise", docAssurance && "Assurance", docCertificat && "Certificat"]
                    .filter(Boolean).join(", ") || <span style={{ color: "var(--orange, #f59e0b)" }}>Aucun — validation admin retardée</span>}
                </strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-euro-sign" /> Prix / jour</span>
                <strong>{pricePerDay ? `${pricePerDay} €` : "—"}</strong>
              </div>
              {prixHeure && (
                <div className="recap-row">
                  <span><i className="fa-solid fa-euro-sign" /> Prix / heure</span>
                  <strong>{prixHeure} €</strong>
                </div>
              )}
              {caution && (
                <div className="recap-row">
                  <span><i className="fa-solid fa-shield-halved" /> Caution</span>
                  <strong>{caution} €</strong>
                </div>
              )}
            </div>

            <div className="recap-status-info">
              <i className="fa-solid fa-hourglass-half" />
              <p>
                Votre bateau sera créé avec le statut <strong>« en attente de validation »</strong>.
                Un admin le validera avant publication — assurez-vous d&apos;avoir joint les documents justificatifs.
              </p>
            </div>

            <div className="list-boat-cgv">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={cgvAccepted}
                  onChange={(e) => { setCgvAccepted(e.target.checked); setSubmitError(""); }}
                  required
                />
                <span>
                  J&apos;accepte les <a href="#" className="auth-link">conditions pour les propriétaires</a> et je certifie être le propriétaire ou le représentant légal de ce bateau.
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="form-wizard-nav">
        {step > 0 && (
          <button type="button" className="btn btn-outline" onClick={prev} disabled={isSubmitting}>
            <i className="fa-solid fa-arrow-left" /> Retour
          </button>
        )}
        {(stepError || submitError) && (
          <p style={{ color: "var(--red)", fontSize: ".875rem", flex: 1, textAlign: "center" }}>
            <i className="fa-solid fa-triangle-exclamation" /> {stepError || submitError}
          </p>
        )}
        <div className="form-wizard-nav-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={handleSaveAndExit}
            disabled={isSubmitting}
            title="Sauvegarder le brouillon et revenir plus tard"
          >
            <i className="fa-regular fa-floppy-disk" /> Sauvegarder
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={next} disabled={isSubmitting}>
              Continuer <i className="fa-solid fa-arrow-right" />
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !cgvAccepted}
              title={!cgvAccepted ? "Veuillez accepter les conditions pour continuer" : undefined}
            >
              {submitLabel()}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}


"use client";

import "./list-boat.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib";
import { boatsApi } from "@/shared/lib/boats-api";
import { referentielsApi, portsApi } from "@/shared/lib/referentiels-api";
import type { TypeBateauAPI, PortAPI, TypeDocumentAPI, TypeEquipementAPI } from "@/shared/lib/referentiels-api";
import { geocodeCity, type GeocodeResult } from "../api/geocode";
import { uploadPhoto } from "../api/photos";
import { uploadDocument } from "../api/documents";
import { compressImage } from "../lib/compressImage";
import { MIN_PHOTOS, MAX_PHOTOS } from "../model/constants";
import type { PhotoEntry, DocumentEntry, Motorisation, SubmitStep } from "../model/types";
import { loadDraft, clearDraft, useFormDraft } from "../lib/useFormDraft";
import { saveFilesToDraft, loadFilesFromDraft, clearFilesDraft } from "../lib/filesDraft";
import LocationMap from "./LocationMapLoader";
import SearchableSelect from "./SearchableSelect";
import PortCreateForm from "./PortCreateForm";
import { useI18n } from "@/shared/i18n";

type GeocodeStatus = "idle" | "loading" | "success" | "error";

export default function ListBoatForm() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useI18n().dict.listBoatForm;
  const STEPS = t.steps;
  const MOTORISATION_OPTIONS: { value: Motorisation; label: string }[] = [
    { value: "voile",   label: t.motorSail },
    { value: "moteur",  label: t.motorEngine },
    { value: "hybride", label: t.motorHybrid },
  ];
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
  const [boatTypes,      setBoatTypes]      = useState<TypeBateauAPI[]>([]);
  const [ports,          setPorts]          = useState<PortAPI[]>([]);
  const [docTypes,       setDocTypes]       = useState<TypeDocumentAPI[]>([]);
  const [typesEquipements, setTypesEquipements] = useState<TypeEquipementAPI[]>([]);
  const [selectedEquipementIds, setSelectedEquipementIds] = useState<Set<number>>(new Set());

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
        setDocTypes(arr);
      })
      .catch(() => {});
    referentielsApi.getTypesEquipements()
      .then((res) => setTypesEquipements(Array.isArray(res) ? res : []))
      .catch(() => {});
  }, []);

  /* ── Form state ── */
  const [typeId,          setTypeId]          = useState<number | null>(null);
  const [motorisation,    setMotorisation]    = useState<Motorisation>("voile");
  const [name,            setName]            = useState("");
  const [portId,          setPortId]          = useState<number | null>(null);
  /** null = formulaire d'ajout de port fermé ; string = ouvert, pré-rempli
   *  avec le texte tapé dans la recherche. */
  const [portDraftName,   setPortDraftName]   = useState<string | null>(null);
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

  /* ── Auto-sauvegarde brouillon (coupée une fois la demande soumise) ── */
  useFormDraft({
    typeId, motorisation, name, portId, length, capacity, cabins,
    permisRequis, carburantInclus, skipper, description, pricePerDay, prixHeure, caution,
    step,
  }, !submitted);

  const [stepError, setStepError] = useState("");

  const next = () => {
    setStepError("");

    if (step === 0) {
      if (!typeId)        { setStepError(t.errType); return; }
      if (!name.trim())   { setStepError(t.errName); return; }
      if (!portId)        { setStepError(t.errPort); return; }
      if (!length.trim()) { setStepError(t.errLength); return; }
      if (!pricePerDay)   { setStepError(t.errPrice); return; }
    }

    if (step === 1 && photos.length < MIN_PHOTOS) {
      setPhotoError(t.errPhotosMin.replace("{n}", String(MIN_PHOTOS)));
      return;
    }

    if (step === 2) {
      if (!docCarteGrise) { setStepError(t.errDocCarteGrise); return; }
      if (!docAssurance)  { setStepError(t.errDocAssurance); return; }
      if (!docCertificat) { setStepError(t.errDocCertificat); return; }
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

  /** Prend le port en objet (et non par id) : un port fraîchement créé n'est
   *  pas encore dans l'état `ports` au moment où on veut le localiser. */
  const locatePort = async (port: PortAPI) => {
    /* L'API stocke déjà les coordonnées du port (en string). Quand elles sont
       présentes, on les utilise : plus précis que le centre de la ville, et
       cela évite un appel réseau à Nominatim. */
    const lat = port.latitude != null ? Number(port.latitude) : NaN;
    const lng = port.longitude != null ? Number(port.longitude) : NaN;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setGeocodeResult({
        lat,
        lng,
        label: [port.nom, port.ville].filter(Boolean).join(", "),
      });
      setGeocodeStatus("success");
      return;
    }

    if (!port.ville) return;
    setGeocodeStatus("loading");
    try {
      const result = await geocodeCity(port.ville);
      if (result) { setGeocodeResult(result); setGeocodeStatus("success"); }
      else { setGeocodeResult(null); setGeocodeStatus("error"); }
    } catch {
      setGeocodeResult(null); setGeocodeStatus("error");
    }
  };

  const handleLocatePort = (id: number) => {
    const port = ports.find((p) => p.id === id);
    if (port) locatePort(port);
  };

  /** Port créé depuis le formulaire : on l'ajoute à la liste locale, on le
   *  sélectionne et on centre la carte — sans recharger tout le référentiel. */
  const handlePortCreated = (port: PortAPI) => {
    setPorts((prev) =>
      [...prev, port].sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
    );
    setPortId(port.id);
    setPortDraftName(null);
    setStepError("");
    locatePort(port);
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
        setSubmitError(t.errCgv);
        return;
      }

      if (!typeId || !portId || !name || !pricePerDay || !length) {
        setSubmitError(t.errRequiredFields);
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

      // Étape 2 — Associer les équipements sélectionnés
      for (const equipementId of selectedEquipementIds) {
        await boatsApi.addEquipement(boat.id, equipementId);
      }

      // Étape 3 — Uploader les photos
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
      setSubmitError(err instanceof Error ? err.message : t.errSubmit);
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
      case "boat":      return <><i className="fa-solid fa-circle-notch fa-spin" /> {t.submitBoat}</>;
      case "photos":    return <><i className="fa-solid fa-circle-notch fa-spin" /> {t.submitPhotos.replace("{a}", String(uploadedPhotos)).replace("{b}", String(photos.length))}</>;
      case "documents": return <><i className="fa-solid fa-circle-notch fa-spin" /> {t.submitDocs.replace("{a}", String(uploadedDocs)).replace("{b}", String([docCarteGrise, docAssurance, docCertificat].filter(Boolean).length))}</>;
      default:          return <><i className="fa-solid fa-paper-plane" /> {t.submitPublish}</>;
    }
  }

  if (submitted) {
    return (
      <div className="save-confirm">
        <i className="fa-solid fa-hourglass-half" />
        <h3>{t.submittedTitle}</h3>
        <p>{t.submittedText}</p>
        <small>{t.redirecting}</small>
      </div>
    );
  }

  if (draftSaved) {
    return (
      <div className="save-confirm">
        <i className="fa-solid fa-circle-check" />
        <h3>{t.draftSavedTitle}</h3>
        <p>{t.draftSavedText}</p>
        <small>{t.redirecting}</small>
      </div>
    );
  }

  return (
    <form className="list-boat-form" onSubmit={handleSubmit} noValidate>
      {draftRestored && (
        <div className="draft-banner">
          <i className="fa-solid fa-rotate-left" />
          <span>{t.draftRestored}</span>
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
            title={t.draftClearTitle}
          >
            <i className="fa-solid fa-xmark" /> {t.draftClear}
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
            <h3>{t.step0Type}</h3>
            {boatTypes.length === 0 ? (
              <p style={{ color: "var(--text-2)", fontSize: ".875rem" }}>
                <i className="fa-solid fa-circle-notch fa-spin" /> {t.step0TypeLoading}
              </p>
            ) : (
              <SearchableSelect
                id="lb-type"
                options={boatTypes.map((bt) => ({ value: bt.id, label: bt.labelTypeBateau }))}
                value={typeId}
                onChange={(v) => { setTypeId(Number(v)); setStepError(""); }}
                placeholder={t.step0TypePlaceholder}
                searchPlaceholder={t.step0TypeSearchPlaceholder}
                required
              />
            )}

            <h3 style={{ marginTop: "24px" }}>{t.step0Motorisation}</h3>
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

            <h3 style={{ marginTop: "24px" }}>{t.step0GeneralInfo}</h3>
            <div className="form-group">
              <label htmlFor="lb-name">{t.step0Name}</label>
              <input
                id="lb-name"
                type="text"
                placeholder={t.step0NamePlaceholder}
                value={name}
                onChange={(e) => { setName(e.target.value); setStepError(""); }}
                className={stepError && !name.trim() ? "input-error" : ""}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="lb-port">{t.step0Port}</label>
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
                    placeholder={t.step0PortPlaceholder}
                    searchPlaceholder={t.step0PortSearchPlaceholder}
                    required
                    onCreate={(q) => setPortDraftName(q)}
                    createLabel={t.step0PortCreateLabel}
                  />
                </div>
                {portDraftName !== null && (
                  <PortCreateForm
                    initialName={portDraftName}
                    existingPorts={ports}
                    onCreated={handlePortCreated}
                    onCancel={() => setPortDraftName(null)}
                  />
                )}
              </div>
              <div className="form-group">
                <label htmlFor="lb-length">{t.step0Length}</label>
                <input
                  id="lb-length"
                  type="text"
                  placeholder={t.step0LengthPlaceholder}
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
                <label htmlFor="lb-capacity">{t.step0Capacity}</label>
                <input id="lb-capacity" type="number" placeholder="8" min="1" max="30" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="lb-cabins">{t.step0Cabins}</label>
                <input id="lb-cabins" type="number" placeholder="3" min="0" max="10" value={cabins} onChange={(e) => setCabins(e.target.value)} />
              </div>
            </div>

            <h3 style={{ marginTop: "24px" }}>{t.step0Options}</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={skipper} onChange={(e) => setSkipper(e.target.checked)} />
                {t.optSkipper}
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={permisRequis} onChange={(e) => setPermisRequis(e.target.checked)} />
                {t.optPermis}
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={carburantInclus} onChange={(e) => setCarburantInclus(e.target.checked)} />
                {t.optCarburant}
              </label>
            </div>

            <h3 style={{ marginTop: "24px" }}>{t.step0Pricing}</h3>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="lb-price">{t.pricePerDay}</label>
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
                <label htmlFor="lb-prix-heure">{t.pricePerHour}</label>
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
              <label htmlFor="lb-caution">{t.caution}</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">€</span>
                <input id="lb-caution" type="number" placeholder="500" min="0" step="0.01" value={caution} onChange={(e) => setCaution(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "8px" }}>
              <label htmlFor="lb-desc">{t.step0Description}</label>
              <textarea
                id="lb-desc"
                rows={5}
                placeholder={t.descPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <small className="form-hint">{t.descHint.replace("{n}", String(description.length))}</small>
            </div>

            {/* ── Équipements ── */}
            <div className="form-group" style={{ marginTop: "24px" }}>
              <label>{t.equipementsTitle}</label>
              <p className="form-hint">{t.equipementsSubtitle}</p>
              {typesEquipements.length === 0 ? (
                <p className="form-hint">{t.equipementsNone}</p>
              ) : (
                typesEquipements.map((type) => (
                  <div key={type.id} className="equipements-type-group">
                    <p className="equipements-type-label"><strong>{type.labelTypeEquipement}</strong></p>
                    <div className="equipements-checkboxes">
                      {(type.equipements ?? []).map((eq) => (
                        <label key={eq.id} className="equipements-checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedEquipementIds.has(eq.id)}
                            onChange={(e) => {
                              setSelectedEquipementIds((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(eq.id);
                                else next.delete(eq.id);
                                return next;
                              });
                            }}
                          />
                          {eq.icone && <i className={`fa-solid ${eq.icone}`} aria-hidden="true" />}
                          {eq.nom}
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 1 — PHOTOS ── */}
        {step === 1 && (
          <div className="form-section">
            <h3>{t.step1Title}</h3>
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
              <p><strong>{t.dropzoneLead}</strong>{t.dropzoneOr}</p>
              <small>{t.dropzoneHint.replace("{min}", String(MIN_PHOTOS)).replace("{max}", String(MAX_PHOTOS))}</small>
              <button type="button" className="btn btn-outline btn-sm" onClick={(e) => e.stopPropagation()}>
                <i className="fa-solid fa-image" /> {t.choosePhotos}
              </button>
            </div>

            <div className="photo-count-hint" data-ok={photos.length >= MIN_PHOTOS}>
              <i className={`fa-solid ${photos.length >= MIN_PHOTOS ? "fa-circle-check" : "fa-circle-info"}`} aria-hidden="true" />
              {t.photoCountHint.replace("{n}", String(photos.length)).replace("{min}", String(MIN_PHOTOS))}
            </div>
            {photoError && (
              <small className="form-hint" style={{ color: "var(--red)" }}>{photoError}</small>
            )}

            {photos.length > 0 && (
              <div className="photo-preview-grid">
                {photos.map((entry, i) => (
                  <div key={entry.file.name + i} className="photo-preview-item">
                    <img src={entry.preview} alt={t.photoAlt.replace("{n}", String(i + 1))} />
                    {i === 0 ? (
                      <span className="photo-preview-main-badge">
                        <i className="fa-solid fa-star" aria-hidden="true" /> {t.photoMain}
                      </span>
                    ) : (
                      <button type="button" className="photo-set-main-btn" onClick={() => setMainPhoto(i)}>
                        {t.photoSetMain}
                      </button>
                    )}
                    <button
                      type="button"
                      className="photo-preview-remove"
                      onClick={() => removePhoto(i)}
                      aria-label={t.photoRemoveAria}
                    >
                      <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="photo-tips">
              <h4>{t.photoTipsTitle}</h4>
              <ul>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> {t.photoTip1}</li>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> {t.photoTip2}</li>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> {t.photoTip3}</li>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> {t.photoTip4}</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 — DOCUMENTS ── */}
        {step === 2 && (
          <div className="form-section">
            <h3>{t.step2Title}</h3>
            <div className="form-section-desc-box">
              <i className="fa-solid fa-circle-exclamation" />
              <p>{t.step2Desc}</p>
            </div>

            {/* Carte grise */}
            <div className="doc-slot">
              <div className="doc-slot-header">
                <i className="fa-solid fa-file-lines" />
                <div>
                  <span className="doc-slot-label">{t.docCarteGriseLabel} <span className="doc-slot-required">*</span></span>
                  <span className="doc-slot-hint">{t.docCarteGriseHint}</span>
                </div>
              </div>
              {docCarteGrise ? (
                <div className="doc-slot-file">
                  <i className={`fa-solid ${docCarteGrise.type === "application/pdf" ? "fa-file-pdf" : "fa-file-image"}`} />
                  <span>{docCarteGrise.name}</span>
                  <button type="button" className="doc-slot-remove" onClick={() => setDocCarteGrise(null)} aria-label={t.docRemoveAria}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ) : (
                <button type="button" className="doc-slot-btn" onClick={() => refCarteGrise.current?.click()}>
                  <i className="fa-solid fa-upload" /> {t.docChoose}
                </button>
              )}
              <input ref={refCarteGrise} type="file" accept=".pdf,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocSelect(f, setDocCarteGrise); e.target.value = ""; }} />
            </div>

            {/* Assurance */}
            <div className="doc-slot">
              <div className="doc-slot-header">
                <i className="fa-solid fa-shield-halved" />
                <div>
                  <span className="doc-slot-label">{t.docAssuranceLabel} <span className="doc-slot-required">*</span></span>
                  <span className="doc-slot-hint">{t.docAssuranceHint}</span>
                </div>
              </div>
              {docAssurance ? (
                <div className="doc-slot-file">
                  <i className={`fa-solid ${docAssurance.type === "application/pdf" ? "fa-file-pdf" : "fa-file-image"}`} />
                  <span>{docAssurance.name}</span>
                  <button type="button" className="doc-slot-remove" onClick={() => setDocAssurance(null)} aria-label={t.docRemoveAria}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ) : (
                <button type="button" className="doc-slot-btn" onClick={() => refAssurance.current?.click()}>
                  <i className="fa-solid fa-upload" /> {t.docChoose}
                </button>
              )}
              <input ref={refAssurance} type="file" accept=".pdf,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocSelect(f, setDocAssurance); e.target.value = ""; }} />
            </div>

            {/* Certificat */}
            <div className="doc-slot">
              <div className="doc-slot-header">
                <i className="fa-solid fa-certificate" />
                <div>
                  <span className="doc-slot-label">{t.docCertificatLabel} <span className="doc-slot-required">*</span></span>
                  <span className="doc-slot-hint">{t.docCertificatHint}</span>
                </div>
              </div>
              {docCertificat ? (
                <div className="doc-slot-file">
                  <i className={`fa-solid ${docCertificat.type === "application/pdf" ? "fa-file-pdf" : "fa-file-image"}`} />
                  <span>{docCertificat.name}</span>
                  <button type="button" className="doc-slot-remove" onClick={() => setDocCertificat(null)} aria-label={t.docRemoveAria}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ) : (
                <button type="button" className="doc-slot-btn" onClick={() => refCertificat.current?.click()}>
                  <i className="fa-solid fa-upload" /> {t.docChoose}
                </button>
              )}
              <input ref={refCertificat} type="file" accept=".pdf,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocSelect(f, setDocCertificat); e.target.value = ""; }} />
            </div>


          </div>
        )}

        {/* ── ÉTAPE 3 — RÉCAPITULATIF ── */}
        {step === 3 && (
          <div className="form-section">
            <h3>{t.step3Title}</h3>
            <div className="list-boat-recap">
              <div className="recap-row">
                <span><i className="fa-solid fa-sailboat" /> {t.recapType}</span>
                <strong>{selectedType?.labelTypeBateau ?? "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-water" /> {t.recapMotorisation}</span>
                <strong>{MOTORISATION_OPTIONS.find((o) => o.value === motorisation)?.label ?? motorisation}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-tag" /> {t.recapName}</span>
                <strong>{name || "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-location-dot" /> {t.recapPort}</span>
                <strong>{selectedPort ? `${selectedPort.nom} – ${selectedPort.ville}` : "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-ruler-horizontal" /> {t.recapLength}</span>
                <strong>{length || "—"}</strong>
              </div>
              {capacity && (
                <div className="recap-row">
                  <span><i className="fa-solid fa-users" /> {t.recapCapacity}</span>
                  <strong>{capacity} {t.persons}</strong>
                </div>
              )}
              {cabins && (
                <div className="recap-row">
                  <span><i className="fa-solid fa-bed" /> {t.recapCabins}</span>
                  <strong>{cabins}</strong>
                </div>
              )}
              <div className="recap-row">
                <span><i className="fa-solid fa-image" /> {t.recapPhotos}</span>
                <strong>{photos.length} {photos.length !== 1 ? t.photoPlural : t.photoSingular}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-file" /> {t.recapDocuments}</span>
                <strong>
                  {[docCarteGrise && t.docCarteGriseLabel, docAssurance && t.docAssuranceLabel, docCertificat && t.docCertificatLabel]
                    .filter(Boolean).join(", ") || <span style={{ color: "var(--orange, #f59e0b)" }}>{t.recapNoDocs}</span>}
                </strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-euro-sign" /> {t.recapPricePerDay}</span>
                <strong>{pricePerDay ? `${pricePerDay} €` : "—"}</strong>
              </div>
              {prixHeure && (
                <div className="recap-row">
                  <span><i className="fa-solid fa-euro-sign" /> {t.recapPricePerHour}</span>
                  <strong>{prixHeure} €</strong>
                </div>
              )}
              {caution && (
                <div className="recap-row">
                  <span><i className="fa-solid fa-shield-halved" /> {t.recapCaution}</span>
                  <strong>{caution} €</strong>
                </div>
              )}
            </div>

            <div className="recap-status-info">
              <i className="fa-solid fa-hourglass-half" />
              <p>{t.statusInfo}</p>
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
                  {t.cgvBefore}<a href="#" className="auth-link">{t.cgvLink}</a>{t.cgvAfter}
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
            <i className="fa-solid fa-arrow-left" /> {t.navBack}
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
            title={t.saveExitTitle}
          >
            <i className="fa-regular fa-floppy-disk" /> {t.save}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={next} disabled={isSubmitting}>
              {t.continue} <i className="fa-solid fa-arrow-right" />
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !cgvAccepted}
              title={!cgvAccepted ? t.cgvRequiredTitle : undefined}
            >
              {submitLabel()}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}


"use client";

import { useState } from "react";
import { portsApi } from "@/shared/lib/referentiels-api";
import type { PortAPI } from "@/shared/lib/referentiels-api";
import { ApiError } from "@/shared/lib/api-client";
import { geocodeCity } from "../api/geocode";
import PortCityAutocomplete from "./PortCityAutocomplete";
import { useI18n } from "@/shared/i18n";

interface PortCreateFormProps {
  /** Texte saisi dans la recherche, utilisé pour pré-remplir le nom. */
  initialName?: string;
  /** Ports déjà connus : sert à avertir d'un doublon probable. */
  existingPorts: PortAPI[];
  onCreated: (port: PortAPI) => void;
  onCancel: () => void;
}

/** Normalise pour comparer : casse, accents et espaces multiples ignorés. */
function normalize(value: string): string {
  // Plage des marques diacritiques combinantes (U+0300–U+036F), produites par
  // la décomposition NFD : « Sète » → « Sète » → « Sete ».
  const DIACRITICS = /[̀-ͯ]/g;
  return value
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export default function PortCreateForm({
  initialName = "",
  existingPorts,
  onCreated,
  onCancel,
}: PortCreateFormProps) {
  const t = useI18n().dict.listBoatForm;
  const [nom, setNom] = useState(initialName);
  const [ville, setVille] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [pays, setPays] = useState("France");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* Doublon probable : même nom, ou même couple nom/ville. On avertit sans
     bloquer — deux ports homonymes dans des villes différentes existent. */
  const duplicate = existingPorts.find(
    (p) =>
      normalize(p.nom) === normalize(nom) &&
      (!ville.trim() || normalize(p.ville ?? "") === normalize(ville))
  );

  const handleSubmit = async () => {
    if (!nom.trim() || !ville.trim()) {
      setError(t.pcErrRequired);
      return;
    }
    setSaving(true);
    setError("");
    try {
      /* Géocodage best-effort : l'API stocke latitude/longitude, autant les
         renseigner à la création pour que la carte s'affiche tout de suite.
         Un échec ici ne doit pas empêcher la création du port. Si la ville
         vient de l'autocomplétion, les coordonnées sont déjà connues. */
      let latitude: string | undefined;
      let longitude: string | undefined;
      if (coords) {
        latitude = String(coords.lat);
        longitude = String(coords.lng);
      } else {
        try {
          const geo = await geocodeCity(`${ville.trim()} ${codePostal.trim()}`.trim());
          if (geo) {
            latitude = String(geo.lat);
            longitude = String(geo.lng);
          }
        } catch {
          /* géocodage indisponible : on crée le port sans coordonnées */
        }
      }

      const created = await portsApi.create({
        nom: nom.trim(),
        ville: ville.trim(),
        pays: pays.trim() || undefined,
        codePostal: codePostal.trim() || undefined,
        latitude,
        longitude,
      });
      onCreated(created);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 500) {
          /* 500 : l'API renvoie une 500 au lieu d'une 401 quand le JWT manque. */
          setError(t.pcErrSession);
        } else if (err.status === 403) {
          setError(t.pcErrForbidden);
        } else if (err.status === 409) {
          setError(t.pcErrConflict);
        } else {
          setError(err.message);
        }
      } else {
        setError(t.pcErrNetwork);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="port-create" role="group" aria-label={t.pcAria}>
      <p className="port-create-intro">
        <i className="fa-solid fa-circle-info" aria-hidden="true" />
        {t.pcIntro}
      </p>

      <div className="port-create-grid">
        <div className="form-group">
          <label htmlFor="pc-nom">{t.pcName}</label>
          <input
            id="pc-nom"
            type="text"
            placeholder={t.pcNamePlaceholder}
            value={nom}
            onChange={(e) => { setNom(e.target.value); setError(""); }}
            maxLength={100}
          />
        </div>
        <div className="form-group">
          <label htmlFor="pc-ville">{t.pcCity}</label>
          <PortCityAutocomplete
            id="pc-ville"
            ville={ville}
            pays={pays}
            onVilleChange={(v) => { setVille(v); setCoords(null); setError(""); }}
            onSelect={(s) => {
              setVille(s.ville);
              setCoords(s.lat != null && s.lng != null ? { lat: s.lat, lng: s.lng } : null);
              if (s.codePostal) setCodePostal(s.codePostal);
              if (!nom.trim()) setNom(`Port de ${s.ville}`);
              setError("");
            }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="pc-cp">{t.pcPostalCode}</label>
          <input
            id="pc-cp"
            type="text"
            inputMode="numeric"
            placeholder={t.pcPostalPlaceholder}
            value={codePostal}
            onChange={(e) => { setCodePostal(e.target.value); setError(""); }}
            maxLength={10}
          />
        </div>
        <div className="form-group">
          <label htmlFor="pc-pays">{t.pcCountry}</label>
          <input
            id="pc-pays"
            type="text"
            placeholder="France"
            value={pays}
            onChange={(e) => { setPays(e.target.value); setError(""); }}
            maxLength={60}
          />
        </div>
      </div>

      {duplicate && !error && (
        <p className="port-create-warn">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          {t.pcDuplicateWarn
            .replace("{name}", duplicate.nom)
            .replace("{cityPart}", duplicate.ville ? t.pcDuplicateInCity.replace("{city}", duplicate.ville) : "")}
        </p>
      )}

      {error && (
        <p className="port-create-error" role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="port-create-actions">
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={saving}>
          {t.pcCancel}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleSubmit}
          disabled={saving || !nom.trim() || !ville.trim()}
        >
          {saving ? t.pcCreating : t.pcCreate}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { portsApi } from "@/shared/lib/referentiels-api";
import type { PortAPI } from "@/shared/lib/referentiels-api";
import { ApiError } from "@/shared/lib/api-client";
import { geocodeCity } from "../api/geocode";
import PortCityAutocomplete from "./PortCityAutocomplete";

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
      setError("Le nom du port et la ville sont obligatoires.");
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
          setError("Votre session a expiré. Reconnectez-vous puis réessayez.");
        } else if (err.status === 403) {
          setError(
            "Votre compte n'a pas les droits pour ajouter un port. Contactez un administrateur."
          );
        } else if (err.status === 409) {
          setError("Ce port existe déjà.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Impossible de joindre le serveur. Réessayez dans un instant.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="port-create" role="group" aria-label="Ajouter un port d'attache">
      <p className="port-create-intro">
        <i className="fa-solid fa-circle-info" aria-hidden="true" />
        Votre port n&apos;est pas dans la liste ? Ajoutez-le, il sera
        immédiatement sélectionné.
      </p>

      <div className="port-create-grid">
        <div className="form-group">
          <label htmlFor="pc-nom">Nom du port *</label>
          <input
            id="pc-nom"
            type="text"
            placeholder="Ex : Port de Cannes"
            value={nom}
            onChange={(e) => { setNom(e.target.value); setError(""); }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="pc-ville">Ville *</label>
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
          <label htmlFor="pc-cp">Code postal</label>
          <input
            id="pc-cp"
            type="text"
            inputMode="numeric"
            placeholder="Ex : 06400"
            value={codePostal}
            onChange={(e) => { setCodePostal(e.target.value); setError(""); }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="pc-pays">Pays</label>
          <input
            id="pc-pays"
            type="text"
            placeholder="France"
            value={pays}
            onChange={(e) => { setPays(e.target.value); setError(""); }}
          />
        </div>
      </div>

      {duplicate && !error && (
        <p className="port-create-warn">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          « {duplicate.nom} » existe déjà{duplicate.ville ? ` à ${duplicate.ville}` : ""}.
          Vérifiez avant d&apos;en créer un doublon.
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
          Annuler
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleSubmit}
          disabled={saving || !nom.trim() || !ville.trim()}
        >
          {saving ? "Création…" : "Créer ce port"}
        </button>
      </div>
    </div>
  );
}

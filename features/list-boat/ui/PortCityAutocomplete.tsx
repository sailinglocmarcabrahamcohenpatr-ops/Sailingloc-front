"use client";

import { useEffect, useRef, useState } from "react";
import { resolveCountryCode } from "../api/countries";
import { PORT_CITIES } from "../api/portCities";
import { resolvePortLocation } from "../api/geocode";

export interface PortCitySelection {
  ville: string;
  codePostal: string;
  /** Absentes si la résolution des coordonnées a échoué (service indisponible). */
  lat?: number;
  lng?: number;
}

interface PortCityAutocompleteProps {
  id?: string;
  ville: string;
  pays: string;
  onVilleChange: (ville: string) => void;
  onSelect: (selection: PortCitySelection) => void;
}

/** Normalise pour un filtrage insensible à la casse et aux accents. */
function normalize(value: string): string {
  const DIACRITICS = /[̀-ͯ]/g;
  return value.normalize("NFD").replace(DIACRITICS, "").toLowerCase().trim();
}

/** Champ « Ville » avec suggestions de villes portuaires connues pour le
 *  pays saisi. La liste est locale (instantanée) ; le code postal et les
 *  coordonnées exactes ne sont résolus (via une API officielle) qu'au
 *  moment de la sélection. Se désactive silencieusement si le pays n'est
 *  pas reconnu — la saisie manuelle reste toujours possible.
 *
 *  Remontée (via `key`) à chaque changement de pays reconnu : c'est ce qui
 *  fait réapparaître le menu automatiquement dès que le pays est renseigné,
 *  sans synchroniser un state depuis un effet. */
export default function PortCityAutocomplete(props: PortCityAutocompleteProps) {
  const countryCode = resolveCountryCode(props.pays);
  return <PortCityAutocompleteBody key={countryCode ?? "unrecognized"} {...props} countryCode={countryCode} />;
}

function PortCityAutocompleteBody({
  id,
  ville,
  countryCode,
  onVilleChange,
  onSelect,
}: Omit<PortCityAutocompleteProps, "pays"> & { countryCode: string | null }) {
  const cities = countryCode ? PORT_CITIES[countryCode] ?? [] : [];
  const [open, setOpen] = useState(cities.length > 0);
  const [resolving, setResolving] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const query = normalize(ville);
  const suggestions = query ? cities.filter((c) => normalize(c).includes(query)) : cities;

  const pick = async (cityName: string) => {
    setOpen(false);
    onVilleChange(cityName);
    if (!countryCode) return;
    setResolving(true);
    try {
      const loc = await resolvePortLocation(countryCode, cityName);
      onSelect({
        ville: cityName,
        codePostal: loc?.codePostal ?? "",
        lat: loc?.lat,
        lng: loc?.lng,
      });
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="pca-wrap" ref={wrapRef}>
      <input
        id={id}
        type="text"
        placeholder="Ex : Cannes"
        value={ville}
        autoComplete="off"
        onChange={(e) => onVilleChange(e.target.value)}
        onFocus={() => { if (cities.length > 0) setOpen(true); }}
      />
      {resolving && <i className="fa-solid fa-spinner fa-spin pca-spinner" aria-hidden="true" />}

      {open && cities.length > 0 && (
        <div className="pca-dropdown" role="listbox">
          {suggestions.length === 0 ? (
            <div className="pca-empty">Aucune ville portuaire connue pour « {ville} ».</div>
          ) : (
            suggestions.map((cityName) => (
              <button
                type="button"
                key={cityName}
                className="pca-item"
                role="option"
                aria-selected={cityName === ville}
                onMouseDown={(e) => { e.preventDefault(); pick(cityName); }}
              >
                <i className="fa-solid fa-anchor pca-item-icon" aria-hidden="true" />
                <span className="pca-item-label">{cityName}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

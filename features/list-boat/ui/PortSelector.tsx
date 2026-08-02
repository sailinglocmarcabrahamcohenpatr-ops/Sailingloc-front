"use client";

import { useEffect, useState } from "react";
import { searchPortsNearCity, type OverpassPort } from "../api/overpassPorts";

export interface PortSelection {
  nom: string;
  lat: number;
  lng: number;
}

interface PortSelectorProps {
  id?: string;
  pays: string;
  ville: string;
  onSelect: (selection: PortSelection) => void;
}

type Status = "idle" | "loading" | "done" | "error";

function portKey(p: OverpassPort): string {
  return `${p.nom}|${p.lat}|${p.lng}`;
}

/** Une fois le pays et la ville renseignés, interroge Overpass
 *  (OpenStreetMap) pour lister les ports/marinas réels situés dans un rayon
 *  de 25 km autour de la ville (voir `overpassPorts.ts`) et les propose
 *  dans un sélecteur. Choisir un port renseigne son nom et ses coordonnées
 *  exactes — pas celles de la ville. */
export default function PortSelector(props: PortSelectorProps) {
  if (!props.pays.trim() || !props.ville.trim()) return null;
  return <PortSelectorBody key={`${props.pays.trim().toLowerCase()}|${props.ville.trim().toLowerCase()}`} {...props} />;
}

/* Remontée (via `key`) à chaque changement de ville/pays : c'est ce qui
 * remet la liste de ports à zéro sans avoir à la réinitialiser dans un
 * effet. */
function PortSelectorBody({ id, pays, ville, onSelect }: PortSelectorProps) {
  const [ports, setPorts] = useState<OverpassPort[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setStatus("loading");
      searchPortsNearCity(pays, ville)
        .then((results) => {
          if (cancelled) return;
          setPorts(results);
          setStatus("done");
        })
        .catch(() => {
          if (cancelled) return;
          setPorts([]);
          setStatus("error");
        });
    }, 500);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [pays, ville]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const key = e.target.value;
    setSelectedKey(key);
    const port = ports.find((p) => portKey(p) === key);
    if (port) onSelect({ nom: port.nom, lat: port.lat, lng: port.lng });
  }

  const placeholder =
    status === "loading" ? "Recherche des ports…"
    : status === "error" ? "Service indisponible — saisie manuelle"
    : status === "done" && ports.length === 0 ? "Aucun port trouvé près de cette ville"
    : "Sélectionnez un port";

  return (
    <div className="form-group">
      <label htmlFor={id}>Port détecté près de {ville}</label>
      <select
        id={id}
        value={selectedKey}
        onChange={handleChange}
        disabled={status === "loading" || ports.length === 0}
      >
        <option value="">{placeholder}</option>
        {ports.map((p) => (
          <option key={portKey(p)} value={portKey(p)}>{p.nom}</option>
        ))}
      </select>
    </div>
  );
}

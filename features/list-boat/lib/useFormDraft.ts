import { useEffect, useRef, useCallback } from "react";
import type { Motorisation } from "../model/types";

const DRAFT_KEY = "sailingloc_list_boat_draft_v2";
const DEBOUNCE_MS = 800;

/** Champs du formulaire persistables (pas les File/photos/documents) */
export interface FormDraft {
  typeId:          number | null;
  motorisation:    Motorisation;
  name:            string;
  portId:          number | null;
  length:          string;
  capacity:        string;
  cabins:          string;
  permisRequis:    boolean;
  carburantInclus: boolean;
  skipper:         boolean;
  description:     string;
  pricePerDay:     string;
  prixHeure:       string;
  caution:         string;
  step:            number;
  savedAt:         string; // ISO
}

export type DraftData = Omit<FormDraft, "savedAt">;

export function loadDraft(): FormDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as FormDraft) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
}

function saveDraftNow(data: DraftData): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
}

/** Auto-sauvegarde avec debounce à chaque changement de données.
 *  `enabled=false` coupe l'auto-sauvegarde (ex: juste après soumission) —
 *  sans ça, cet effet (sans tableau de dépendances, il se relance à chaque
 *  rendu) réécrivait le brouillon avec les données déjà soumises quelques
 *  centaines de ms après `clearDraft()`, empêchant de repartir sur un
 *  formulaire vide pour une nouvelle demande. */
export function useFormDraft(data: DraftData, enabled = true): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((d: DraftData) => saveDraftNow(d), []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!enabled) return;
    timerRef.current = setTimeout(() => save(data), DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  });
}

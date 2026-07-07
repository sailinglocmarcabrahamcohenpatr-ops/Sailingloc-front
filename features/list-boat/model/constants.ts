import type { Motorisation } from "./types";

export const STEPS = [
  "Type & infos",
  "Photos & description",
  "Tarifs",
  "Disponibilités",
  "Récapitulatif",
] as const;

export const MIN_PHOTOS = 3;
export const MAX_PHOTOS = 8;

export const MOTORISATION_OPTIONS: { value: Motorisation; label: string }[] = [
  { value: "voile",   label: "Voile" },
  { value: "moteur",  label: "Moteur" },
  { value: "hybride", label: "Hybride" },
];

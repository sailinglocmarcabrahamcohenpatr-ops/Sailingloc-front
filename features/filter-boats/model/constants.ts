import type { FilterItem } from "@/shared/types";

/** Feature filters — client-side only, not tied to a boat type */
export const FEATURE_FILTERS: FilterItem[] = [
  { label: "Voile 4+",         urlParam: "capacite", urlValue: "4" },
  { label: "Assurance incluse" },
  { label: "Climatisation" },
  { label: "Dates flexibles",  icon: "fa-calendar" },
];

/** @deprecated use FEATURE_FILTERS */
export const FILTERS = FEATURE_FILTERS;

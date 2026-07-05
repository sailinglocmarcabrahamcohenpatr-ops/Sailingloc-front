"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FEATURE_FILTERS } from "../model/constants";

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ") : s;
}

export default function ActiveFiltersBar() {
  const searchParams = useSearchParams();
  const router      = useRouter();
  const pathname    = usePathname();

  const push = (updater: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    const qs = params.toString();
    router.push(`${pathname}${qs ? "?" + qs : ""}`);
  };

  const currentType = searchParams.get("type");

  const active: { key: string; label: string; onRemove: () => void }[] = [];

  if (currentType) {
    active.push({
      key:      "type",
      label:    capitalize(currentType),
      onRemove: () => push(p => p.delete("type")),
    });
  }

  FEATURE_FILTERS.forEach(f => {
    if (f.urlParam && f.urlValue && searchParams.get(f.urlParam) === f.urlValue) {
      active.push({
        key:      f.label,
        label:    f.label,
        onRemove: () => push(p => p.delete(f.urlParam!)),
      });
    }
  });

  if (active.length === 0) return null;

  const clearAll = () => push(p => {
    p.delete("type");
    FEATURE_FILTERS.forEach(f => { if (f.urlParam) p.delete(f.urlParam); });
  });

  return (
    <div className="active-filters-row">
      {active.map(f => (
        <button key={f.key} className="chip active chip-removable" type="button" onClick={f.onRemove}>
          {f.label}
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      ))}
      <button className="clear-filters" type="button" onClick={clearAll}>
        Tout effacer
      </button>
    </div>
  );
}

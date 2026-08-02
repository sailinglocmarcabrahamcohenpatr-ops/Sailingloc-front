"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Slider } from "@base-ui/react/slider";
import { BOAT_TYPES } from "@/shared/config";
import type { BoatType } from "@/shared/types";
import { useI18n, localizeHref } from "@/shared/i18n";
import {
  BUDGET_BOUNDS,
  CAPACITY_BOUNDS,
  SIZE_BOUNDS,
  CABINS_BOUNDS,
  RATING_BOUNDS,
} from "../model/constants";

const TYPE_CHOICES = BOAT_TYPES.filter((t) => t.value !== "tous");

/** Remonté avec une `key` dérivée de l'URL par le parent : c'est ce remount,
 *  pas un effet, qui resynchronise l'état "live" quand les params changent
 *  en dehors du contrôle (ex. clearAll). Partagé par Budget et Taille. */
function RangeSlider({
  bounds,
  initialMin,
  initialMax,
  onCommit,
  label,
  minAriaLabel,
  maxAriaLabel,
  format,
  suffix,
}: {
  bounds: { min: number; max: number; step: number };
  initialMin: number;
  initialMax: number;
  onCommit: (value: number[]) => void;
  label: string;
  minAriaLabel: string;
  maxAriaLabel: string;
  format: (value: number) => string;
  suffix?: string;
}) {
  const [value, setValue] = useState<[number, number]>([initialMin, initialMax]);
  const isDefault = value[0] <= bounds.min && value[1] >= bounds.max;
  return (
    <div className="filter-panel-field">
      <div className="filter-field-head">
        <span className="filter-panel-label">{label}</span>
        <span className={`filter-value-pill${isDefault ? " is-default" : ""}`}>
          {format(value[0])} – {format(value[1])}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </div>
      <Slider.Root
        className="pf-slider"
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={value}
        onValueChange={(v) => setValue(v as [number, number])}
        onValueCommitted={(v) => onCommit(v as number[])}
      >
        <Slider.Control className="pf-slider-control">
          <Slider.Track className="pf-slider-track">
            <Slider.Indicator className="pf-slider-indicator" />
            <Slider.Thumb className="pf-slider-thumb" index={0} aria-label={minAriaLabel} />
            <Slider.Thumb className="pf-slider-thumb" index={1} aria-label={maxAriaLabel} />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <div className="pf-slider-scale" aria-hidden="true">
        <span>{format(bounds.min)}</span>
        <span>{format(bounds.max)}+</span>
      </div>
    </div>
  );
}

/** Contrôle −/valeur/+ pour un nombre entier — plus lisible qu'un slider
 *  (Capacité, Cabines). Commit immédiat à chaque clic. */
function Stepper({
  bounds,
  initial,
  onCommit,
  label,
  decreaseAria,
  increaseAria,
}: {
  bounds: { min: number; max: number; step: number };
  initial: number;
  onCommit: (value: number) => void;
  label: string;
  decreaseAria: string;
  increaseAria: string;
}) {
  const [value, setValue] = useState(initial);

  const set = (next: number) => {
    const clamped = Math.min(bounds.max, Math.max(bounds.min, next));
    setValue(clamped);
    onCommit(clamped);
  };

  return (
    <div className="filter-panel-field">
      <span className="filter-panel-label">{label}</span>
      <div className="filter-stepper">
        <button
          type="button"
          className="filter-stepper-btn"
          onClick={() => set(value - bounds.step)}
          disabled={value <= bounds.min}
          aria-label={decreaseAria}
        >
          <i className="fa-solid fa-minus" aria-hidden="true" />
        </button>
        <span className="filter-stepper-value" aria-live="polite">{value}</span>
        <button
          type="button"
          className="filter-stepper-btn"
          onClick={() => set(value + bounds.step)}
          disabled={value >= bounds.max}
          aria-label={increaseAria}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** Slider à un seul curseur (Note minimale) — même habillage que RangeSlider,
 *  mais value/onCommit portent un nombre simple plutôt qu'un tuple [min,max]. */
function MinRatingSlider({
  bounds,
  initial,
  onCommit,
  label,
  ariaLabel,
  anyLabel,
  starAriaFor,
}: {
  bounds: { min: number; max: number; step: number };
  initial: number;
  onCommit: (value: number) => void;
  label: string;
  ariaLabel: string;
  anyLabel: string;
  starAriaFor: (n: number) => string;
}) {
  const [value, setValue] = useState(initial);
  const steps = Array.from({ length: bounds.max - bounds.min + 1 }, (_, i) => bounds.min + i);
  return (
    <div className="filter-panel-field">
      <div className="filter-field-head">
        <span className="filter-panel-label">{label}</span>
        <span className={`filter-value-pill${value <= bounds.min ? " is-default" : ""}`}>
          {value > bounds.min ? (
            <>
              <i className="fa-solid fa-star" aria-hidden="true" /> {value}+
            </>
          ) : (
            anyLabel
          )}
        </span>
      </div>
      <Slider.Root
        className="pf-slider"
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={value}
        onValueChange={(v) => setValue(v as number)}
        onValueCommitted={(v) => onCommit(v as number)}
      >
        <Slider.Control className="pf-slider-control">
          <Slider.Track className="pf-slider-track">
            <Slider.Indicator className="pf-slider-indicator" />
            <div className="pf-slider-ticks" aria-hidden="true">
              {steps.map((n) => (
                <span key={n} className={`pf-slider-tick${n <= value ? " filled" : ""}`} />
              ))}
            </div>
            <Slider.Thumb
              className="pf-slider-thumb"
              aria-label={ariaLabel}
              getAriaValueText={(_, v) => (v > bounds.min ? starAriaFor(v) : anyLabel)}
            />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <div className="pf-slider-scale" aria-hidden="true">
        <span>{anyLabel}</span>
        <span>{bounds.max} <i className="fa-solid fa-star" aria-hidden="true" /></span>
      </div>
    </div>
  );
}

/** Section repliable en accordéon — chevron pivote, contenu conserve son
 *  état monté (juste masqué) pour ne pas perdre le state des enfants. */
function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  badge = 0,
  children,
}: {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  /** Nombre de filtres actifs dans la section — affiché à côté du chevron
   *  pour rester visible même repliée. */
  badge?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  return (
    <div className="filter-section">
      <button
        type="button"
        className="filter-accordion-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <span className="filter-panel-section-title">
          {icon && <i className={`fa-solid ${icon}`} aria-hidden="true" />}
          {title}
        </span>
        <span className="filter-accordion-trigger-end">
          {badge > 0 && <span className="filter-count-badge filter-count-badge-muted">{badge}</span>}
          <i className={`fa-solid fa-chevron-down filter-accordion-chevron${open ? " open" : ""}`} aria-hidden="true" />
        </span>
      </button>
      <div id={bodyId} className={`filter-accordion-body${open ? " open" : ""}`}>
        {children}
      </div>
    </div>
  );
}

export default function FiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, dict } = useI18n();
  const f = dict.filters;
  const bt = dict.boatTypes;
  const c = dict.common;
  const [open, setOpen] = useState(false);

  const activeTypes = new Set(
    (searchParams.get("type") ?? "").split(",").filter(Boolean)
  );
  const priceMin = searchParams.get("prixMin") ?? "";
  const priceMax = searchParams.get("prixMax") ?? "";
  const capacityMin = searchParams.get("capacite") ?? "";
  const ratingMin = searchParams.get("note") ?? "";
  const sizeMin = searchParams.get("tailleMin") ?? "";
  const sizeMax = searchParams.get("tailleMax") ?? "";
  const cabinsMin = searchParams.get("cabines") ?? "";
  const skipper = searchParams.get("skipper") ?? "";

  const activeCount =
    activeTypes.size +
    (priceMin || priceMax ? 1 : 0) +
    (capacityMin ? 1 : 0) +
    (ratingMin ? 1 : 0) +
    (sizeMin || sizeMax ? 1 : 0) +
    (cabinsMin ? 1 : 0) +
    (skipper ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  /* replace (pas push) : chaque interaction (slider, stepper, chip…) ne doit
     pas empiler une entrée d'historique — sinon "retour" sur le navigateur
     oblige à annuler les filtres un par un au lieu de quitter la page.
     Même convention que ResultsControls (tri/vue) et la recherche destination. */
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    router.replace(localizeHref(`/bateaux${qs ? "?" + qs : ""}`, locale));
  };

  const commitBudget = (value: number[]) => {
    const [lo, hi] = value;
    updateParams({
      prixMin: lo > BUDGET_BOUNDS.min ? String(lo) : null,
      prixMax: hi < BUDGET_BOUNDS.max ? String(hi) : null,
    });
  };

  const commitCapacity = (value: number) => {
    updateParams({ capacite: value > CAPACITY_BOUNDS.min ? String(value) : null });
  };

  const commitRating = (value: number) => {
    updateParams({ note: value > RATING_BOUNDS.min ? String(value) : null });
  };

  const commitSize = (value: number[]) => {
    const [lo, hi] = value;
    updateParams({
      tailleMin: lo > SIZE_BOUNDS.min ? String(lo) : null,
      tailleMax: hi < SIZE_BOUNDS.max ? String(hi) : null,
    });
  };

  const commitCabins = (value: number) => {
    updateParams({ cabines: value > CABINS_BOUNDS.min ? String(value) : null });
  };

  const toggleType = (value: BoatType) => {
    const next = new Set(activeTypes);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    updateParams({ type: next.size > 0 ? Array.from(next).join(",") : null });
  };

  const toggleSkipper = (value: "avec" | "sans") => {
    updateParams({ skipper: skipper === value ? null : value });
  };

  const clearAll = () => {
    updateParams({
      type: null,
      prixMin: null,
      prixMax: null,
      capacite: null,
      note: null,
      tailleMin: null,
      tailleMax: null,
      cabines: null,
      skipper: null,
    });
  };

  return (
    <div className="filters-bar">
      <div className="filters-bar-inner">
        <button
          type="button"
          className="filter-btn-icon primary-filter"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <i className="fa-solid fa-sliders" aria-hidden="true" /> {f.button}
          {activeCount > 0 && <span className="filter-count-badge">{activeCount}</span>}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            className="clear-filters"
            onClick={clearAll}
            aria-label={f.clearAllAria}
          >
            {f.clearAll}
          </button>
        )}
      </div>

      {open && (
        <div
          className="filter-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="filter-modal" role="dialog" aria-modal="true" aria-label={f.panelAria}>
            <div className="filter-modal-header">
              <h2>
                <span className="filter-modal-header-icon">
                  <i className="fa-solid fa-sliders" aria-hidden="true" />
                </span>
                {f.button}
              </h2>
              <button className="filter-modal-close" onClick={() => setOpen(false)} aria-label={c.close}>
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>

            <div className="filter-modal-body">
              <CollapsibleSection title={f.boatType} icon="fa-sailboat" badge={activeTypes.size}>
                <div className="filter-panel-chips">
                  {TYPE_CHOICES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`chip${activeTypes.has(t.value) ? " active" : ""}`}
                      aria-pressed={activeTypes.has(t.value)}
                      onClick={() => toggleType(t.value)}
                    >
                      <i className={`fa-solid ${t.icon}`} aria-hidden="true" />
                      {bt[t.value as keyof typeof bt] ?? t.label}
                    </button>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={f.skipper} icon="fa-user-tie" badge={skipper ? 1 : 0}>
                <div className="filter-panel-chips">
                  <button
                    type="button"
                    className={`chip${skipper === "avec" ? " active" : ""}`}
                    aria-pressed={skipper === "avec"}
                    onClick={() => toggleSkipper("avec")}
                  >
                    {f.skipperWith}
                  </button>
                  <button
                    type="button"
                    className={`chip${skipper === "sans" ? " active" : ""}`}
                    aria-pressed={skipper === "sans"}
                    onClick={() => toggleSkipper("sans")}
                  >
                    {f.skipperWithout}
                  </button>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title={f.budgetCapacityTitle}
                icon="fa-coins"
                badge={(priceMin || priceMax ? 1 : 0) + (capacityMin ? 1 : 0) + (ratingMin ? 1 : 0)}
              >
                <RangeSlider
                  key={`budget-${priceMin}-${priceMax}`}
                  bounds={BUDGET_BOUNDS}
                  initialMin={priceMin ? Number(priceMin) : BUDGET_BOUNDS.min}
                  initialMax={priceMax ? Number(priceMax) : BUDGET_BOUNDS.max}
                  onCommit={commitBudget}
                  label={f.budgetPerDay}
                  minAriaLabel={f.budgetMin}
                  maxAriaLabel={f.budgetMax}
                  format={(v) => `${v} €`}
                  suffix={f.perDay}
                />

                <Stepper
                  key={`capacity-${capacityMin}`}
                  bounds={CAPACITY_BOUNDS}
                  initial={capacityMin ? Number(capacityMin) : CAPACITY_BOUNDS.min}
                  onCommit={commitCapacity}
                  label={f.capacity}
                  decreaseAria={`${f.decrease} ${f.capacity}`}
                  increaseAria={`${f.increase} ${f.capacity}`}
                />

                <MinRatingSlider
                  key={`rating-${ratingMin}`}
                  bounds={RATING_BOUNDS}
                  initial={ratingMin ? Number(ratingMin) : RATING_BOUNDS.min}
                  onCommit={commitRating}
                  label={f.rating}
                  ariaLabel={f.rating}
                  anyLabel={f.ratingAny}
                  starAriaFor={(n) => f.starAria.replace("{n}", String(n))}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title={f.featuresTitle}
                icon="fa-ruler-combined"
                badge={(sizeMin || sizeMax ? 1 : 0) + (cabinsMin ? 1 : 0)}
              >
                <RangeSlider
                  key={`size-${sizeMin}-${sizeMax}`}
                  bounds={SIZE_BOUNDS}
                  initialMin={sizeMin ? Number(sizeMin) : SIZE_BOUNDS.min}
                  initialMax={sizeMax ? Number(sizeMax) : SIZE_BOUNDS.max}
                  onCommit={commitSize}
                  label={f.size}
                  minAriaLabel={f.sizeMin}
                  maxAriaLabel={f.sizeMax}
                  format={(v) => `${v} m`}
                />

                <Stepper
                  key={`cabins-${cabinsMin}`}
                  bounds={CABINS_BOUNDS}
                  initial={cabinsMin ? Number(cabinsMin) : CABINS_BOUNDS.min}
                  onCommit={commitCabins}
                  label={f.cabins}
                  decreaseAria={`${f.decrease} ${f.cabins}`}
                  increaseAria={`${f.increase} ${f.cabins}`}
                />
              </CollapsibleSection>
            </div>

            <div className="filter-modal-footer">
              <button type="button" className="clear-filters" onClick={clearAll}>
                <i className="fa-solid fa-arrow-rotate-left" aria-hidden="true" />
                {f.reset}
              </button>
              <div className="filter-modal-footer-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>
                  {f.cancel}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setOpen(false)}
                >
                  {f.seeResults}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/shared/i18n";

interface Option {
  value: number | string;
  label: string;
  sub?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | string | null;
  onChange: (value: number | string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  id?: string;
  required?: boolean;
  /** Active la création d'une entrée absente de la liste. Reçoit le texte
   *  saisi dans la recherche, pour pré-remplir le formulaire de création. */
  onCreate?: (query: string) => void;
  /** Libellé de l'action de création (defaut : « Ajouter »). */
  createLabel?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  id,
  required,
  onCreate,
  createLabel,
}: SearchableSelectProps) {
  const t = useI18n().dict.listBoatForm;
  const resolvedPlaceholder = placeholder ?? t.ssPlaceholder;
  const resolvedSearchPlaceholder = searchPlaceholder ?? t.ssSearchPlaceholder;
  const resolvedCreateLabel = createLabel ?? t.ssCreateLabel;
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState("");
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = query.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.sub?.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  /* Close on outside click */
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* Focus search on open */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const pick = (opt: Option) => {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  };

  const handleCreate = () => {
    onCreate?.(query.trim());
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="ss-wrap" ref={wrapRef}>
      <button
        id={id}
        type="button"
        className={`ss-trigger${open ? " open" : ""}${!selected ? " ss-trigger--empty" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        {...(required ? { "aria-required": "true" } : {})}
      >
        <span className="ss-trigger-label">
          {selected ? (
            <>
              <span className="ss-trigger-value">{selected.label}</span>
              {selected.sub && <span className="ss-trigger-sub">{selected.sub}</span>}
            </>
          ) : (
            <span className="ss-trigger-placeholder">{resolvedPlaceholder}</span>
          )}
        </span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} ss-caret`} aria-hidden="true" />
      </button>

      {open && (
        <div className="ss-dropdown" role="listbox">
          {/* Search */}
          <div className="ss-search">
            <i className="fa-solid fa-magnifying-glass ss-search-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              className="ss-search-input"
              placeholder={resolvedSearchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button type="button" className="ss-search-clear" onClick={() => setQuery("")} aria-label={t.ssClearAria}>
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          {/* Options */}
          <ul className="ss-list">
            {filtered.length === 0 ? (
              <li className="ss-no-result">
                {onCreate ? (
                  <>
                    <span className="ss-no-result-text">
                      {query.trim() ? t.ssNoResultFor.replace("{q}", query.trim()) : t.ssNoResult}
                    </span>
                    <button
                      type="button"
                      className="ss-create-btn"
                      onClick={handleCreate}
                    >
                      <i className="fa-solid fa-plus" aria-hidden="true" />
                      {resolvedCreateLabel}
                    </button>
                  </>
                ) : (
                  t.ssNoResult
                )}
              </li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  className={`ss-option${opt.value === value ? " selected" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); pick(opt); }}
                >
                  <span className="ss-option-label">{opt.label}</span>
                  {opt.sub && <span className="ss-option-sub">{opt.sub}</span>}
                  {opt.value === value && (
                    <i className="fa-solid fa-check ss-option-check" aria-hidden="true" />
                  )}
                </li>
              ))
            )}
          </ul>

          {/* Action de création toujours accessible : un port peut exister sous
              un nom voisin sans être celui du propriétaire. Sans ce pied de
              liste, il faudrait taper un texte sans résultat pour la révéler. */}
          {onCreate && filtered.length > 0 && (
            <div className="ss-footer">
              <button
                type="button"
                className="ss-create-btn"
                onClick={handleCreate}
              >
                <i className="fa-solid fa-plus" aria-hidden="true" />
                {resolvedCreateLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

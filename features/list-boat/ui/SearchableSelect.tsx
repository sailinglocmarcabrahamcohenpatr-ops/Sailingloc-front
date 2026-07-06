"use client";

import { useEffect, useRef, useState } from "react";

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
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner…",
  searchPlaceholder = "Rechercher…",
  id,
  required,
}: SearchableSelectProps) {
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
            <span className="ss-trigger-placeholder">{placeholder}</span>
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
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button type="button" className="ss-search-clear" onClick={() => setQuery("")} aria-label="Effacer">
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          {/* Options */}
          <ul className="ss-list">
            {filtered.length === 0 ? (
              <li className="ss-no-result">Aucun résultat</li>
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
        </div>
      )}
    </div>
  );
}

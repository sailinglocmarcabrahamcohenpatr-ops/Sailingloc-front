"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/shared/i18n";

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchSelectProps {
  id?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  renderIcon?: (value: string) => React.ReactNode;
  align?: "left" | "right";
}

/** Select custom (remplace le <select> natif) : déclencheur + popover
 *  entièrement stylable au style du site, avec icônes de type. */
export default function SearchSelect({
  id,
  value,
  options,
  onChange,
  renderIcon,
  align = "left",
}: SearchSelectProps) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="sb-select" ref={ref}>
      <button
        type="button"
        id={id}
        className="sb-select-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="sb-select-value">{current.label}</span>
        <i
          className={`fa-solid fa-chevron-${open ? "up" : "down"} sb-select-caret`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className={`sb-popover${align === "right" ? " sb-popover--right" : ""}`}>
          <div className="sb-popover-hd">
            <button
              type="button"
              className="sb-popover-close"
              onClick={() => setOpen(false)}
              aria-label={dict.common.close}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
          <ul className="sb-select-list" role="listbox">
            {options.map((o) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  className={`sb-select-option${o.value === value ? " is-selected" : ""}`}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  {renderIcon && (
                    <span className="sb-select-option-icon">{renderIcon(o.value)}</span>
                  )}
                  <span className="sb-select-option-label">{o.label}</span>
                  {o.value === value && (
                    <i className="fa-solid fa-check sb-select-check" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

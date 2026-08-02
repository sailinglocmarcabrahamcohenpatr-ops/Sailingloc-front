"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useI18n } from "@/shared/i18n";

interface Country {
  code: string;
  flag: string;
  dial: string;
  name: string;
  maxDigits: number;
  /** Digit groups for display formatting (e.g. [1,2,2,2,2] → "X XX XX XX XX") */
  groups: number[];
}

const COUNTRIES: Country[] = [
  { code: "FR", flag: "🇫🇷", dial: "+33",  name: "France",        maxDigits: 9,  groups: [1,2,2,2,2] },
  { code: "BE", flag: "🇧🇪", dial: "+32",  name: "Belgique",      maxDigits: 9,  groups: [3,2,2,2]   },
  { code: "CH", flag: "🇨🇭", dial: "+41",  name: "Suisse",        maxDigits: 9,  groups: [2,3,2,2]   },
  { code: "MC", flag: "🇲🇨", dial: "+377", name: "Monaco",        maxDigits: 8,  groups: [2,2,2,2]   },
  { code: "LU", flag: "🇱🇺", dial: "+352", name: "Luxembourg",    maxDigits: 9,  groups: [3,3,3]     },
  { code: "ES", flag: "🇪🇸", dial: "+34",  name: "Espagne",       maxDigits: 9,  groups: [3,3,3]     },
  { code: "IT", flag: "🇮🇹", dial: "+39",  name: "Italie",        maxDigits: 10, groups: [3,3,4]     },
  { code: "PT", flag: "🇵🇹", dial: "+351", name: "Portugal",      maxDigits: 9,  groups: [3,3,3]     },
  { code: "DE", flag: "🇩🇪", dial: "+49",  name: "Allemagne",     maxDigits: 11, groups: [3,4,4]     },
  { code: "GB", flag: "🇬🇧", dial: "+44",  name: "Royaume-Uni",   maxDigits: 10, groups: [4,6]       },
  { code: "NL", flag: "🇳🇱", dial: "+31",  name: "Pays-Bas",      maxDigits: 9,  groups: [2,3,4]     },
  { code: "MA", flag: "🇲🇦", dial: "+212", name: "Maroc",         maxDigits: 9,  groups: [3,2,2,2]   },
  { code: "DZ", flag: "🇩🇿", dial: "+213", name: "Algérie",       maxDigits: 9,  groups: [3,3,3]     },
  { code: "TN", flag: "🇹🇳", dial: "+216", name: "Tunisie",       maxDigits: 8,  groups: [2,3,3]     },
  { code: "SN", flag: "🇸🇳", dial: "+221", name: "Sénégal",       maxDigits: 9,  groups: [3,3,3]     },
  { code: "US", flag: "🇺🇸", dial: "+1",   name: "États-Unis",    maxDigits: 10, groups: [3,3,4]     },
  { code: "CA", flag: "🇨🇦", dial: "+1",   name: "Canada",        maxDigits: 10, groups: [3,3,4]     },
  { code: "AU", flag: "🇦🇺", dial: "+61",  name: "Australie",     maxDigits: 9,  groups: [3,3,3]     },
  { code: "GR", flag: "🇬🇷", dial: "+30",  name: "Grèce",         maxDigits: 10, groups: [3,3,4]     },
  { code: "HR", flag: "🇭🇷", dial: "+385", name: "Croatie",       maxDigits: 9,  groups: [2,3,4]     },
];

/** Turn raw digits into a spaced string following the group pattern */
function format(digits: string, groups: number[]): string {
  let result = "";
  let pos = 0;
  for (const g of groups) {
    if (pos >= digits.length) break;
    if (result) result += " ";
    result += digits.slice(pos, pos + g);
    pos += g;
  }
  return result;
}

/** Build a placeholder like "X XX XX XX XX" from the group pattern */
function placeholder(groups: number[]): string {
  return groups.map((g) => "X".repeat(g)).join(" ");
}

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (full: string) => void;
}

export default function PhoneInput({ id = "reg-phone", value, onChange }: PhoneInputProps) {
  const tp = useI18n().dict.phoneInput;
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [digits, setDigits]   = useState("");
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const wrapRef               = useRef<HTMLDivElement>(null);
  const searchRef             = useRef<HTMLInputElement>(null);

  /* Sync outward value → internal digits when country changes */
  useEffect(() => {
    const raw = value.startsWith(country.dial)
      ? value.slice(country.dial.length)
      : "";
    setDigits(raw.slice(0, country.maxDigits));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  /* Close on outside click */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* Focus search when dropdown opens */
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0);
  }, [open]);

  const filtered = search.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search)
      )
    : COUNTRIES;

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let raw = e.target.value.replace(/\D/g, "");
      // Strip trunk prefix "0" written by habit (e.g. French "06 12 34 56 78")
      if (raw.startsWith("0")) raw = raw.slice(1);
      const capped = raw.slice(0, country.maxDigits);
      setDigits(capped);
      onChange(capped ? country.dial + capped : "");
    },
    [country, onChange]
  );

  const selectCountry = (c: Country) => {
    setCountry(c);
    setOpen(false);
    setSearch("");
    const recapped = digits.slice(0, c.maxDigits);
    setDigits(recapped);
    onChange(recapped ? c.dial + recapped : "");
  };

  const displayValue = format(digits, country.groups);
  const dialAriaLabel = tp.ariaDialCode
    .replace("{name}", country.name)
    .replace("{dial}", country.dial);

  return (
    <div className="phone-wrap" ref={wrapRef}>
      {/* ── Country trigger ── */}
      <button
        type="button"
        className={`phone-country-btn${open ? " open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={dialAriaLabel}
      >
        <span className="phone-flag">{country.flag}</span>
        <span className="phone-dial">{country.dial}</span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} phone-chevron`} aria-hidden="true" />
      </button>

      {/* ── Number input ── */}
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        className="phone-number-input"
        placeholder={placeholder(country.groups)}
        value={displayValue}
        onChange={handleNumberChange}
        autoComplete="tel-national"
        aria-label={tp.ariaPhone}
      />

      {/* ── Dropdown ── */}
      {open && (
        <div className="phone-dropdown" role="listbox" aria-label={tp.ariaSelect}>
          <div className="phone-search-wrap">
            <i className="fa-solid fa-magnifying-glass phone-search-icon" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              className="phone-search-input"
              placeholder={tp.searchPh}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className="phone-country-list">
            {filtered.length === 0 && (
              <li className="phone-no-result">{tp.noResult}</li>
            )}
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  className={`phone-country-option${c.code === country.code ? " selected" : ""}`}
                  onClick={() => selectCountry(c)}
                  role="option"
                  aria-selected={c.code === country.code}
                >
                  <span className="phone-flag">{c.flag}</span>
                  <span className="phone-country-name">{c.name}</span>
                  <span className="phone-country-dial-badge">{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

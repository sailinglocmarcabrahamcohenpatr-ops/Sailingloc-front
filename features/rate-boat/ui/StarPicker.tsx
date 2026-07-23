"use client";

import { useState } from "react";

interface StarPickerProps {
  label: string;
  icon: string;
  value: number;
  onChange: (value: number) => void;
}

export default function StarPicker({ label, icon, value, onChange }: StarPickerProps) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="star-picker-row">
      <span className="star-picker-label">
        <i className={`fa-solid ${icon}`} aria-hidden="true" /> {label}
      </span>
      <div className="star-picker-stars" role="radiogroup" aria-label={label} onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            className={`star-picker-btn${n <= display ? " filled" : ""}`}
            onMouseEnter={() => setHovered(n)}
            onClick={() => onChange(n)}
          >
            <i className={n <= display ? "fa-solid fa-star" : "fa-regular fa-star"} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

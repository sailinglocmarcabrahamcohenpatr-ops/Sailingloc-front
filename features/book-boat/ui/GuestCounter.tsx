"use client";

import { useState } from "react";
import { useI18n } from "@/shared/i18n";

interface GuestCounterProps {
  min?: number;
  max?: number;
  initial?: number;
  onChange?: (count: number) => void;
}

export default function GuestCounter({ min = 1, max = 8, initial = 4, onChange }: GuestCounterProps) {
  const [count, setCount] = useState(initial);
  const t = useI18n().dict.boatDetail;

  const update = (next: number) => {
    setCount(next);
    onChange?.(next);
  };

  return (
    <div className="booking-guests">
      <label>
        <i className="fa-solid fa-user" aria-hidden="true" /> {t.passengers}
      </label>
      <div className="guest-counter">
        <button
          className="guest-btn"
          onClick={() => update(Math.max(count - 1, min))}
          aria-label={t.decreasePassengers}
          disabled={count <= min}
        >
          <i className="fa-solid fa-minus" aria-hidden="true" />
        </button>
        <span className="guest-count" aria-live="polite">{count}</span>
        <button
          className="guest-btn"
          onClick={() => update(Math.min(count + 1, max))}
          aria-label={t.increasePassengers}
          disabled={count >= max}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

interface GuestCounterProps {
  min?: number;
  max?: number;
  initial?: number;
}

export default function GuestCounter({ min = 1, max = 8, initial = 4 }: GuestCounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div className="booking-guests">
      <label>
        <i className="fa-solid fa-user" aria-hidden="true" /> Passagers
      </label>
      <div className="guest-counter">
        <button
          className="guest-btn"
          onClick={() => setCount((v) => Math.max(v - 1, min))}
          aria-label="Diminuer le nombre de passagers"
          disabled={count <= min}
        >
          <i className="fa-solid fa-minus" aria-hidden="true" />
        </button>
        <span className="guest-count" aria-live="polite">{count}</span>
        <button
          className="guest-btn"
          onClick={() => setCount((v) => Math.min(v + 1, max))}
          aria-label="Augmenter le nombre de passagers"
          disabled={count >= max}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

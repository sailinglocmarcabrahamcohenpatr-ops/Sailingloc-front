"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  target: number;
  decimals?: number;
  suffix?: string;
  label: string;
  icon: string;
}

const STATS: Stat[] = [
  { target: 3200, suffix: "+", label: "Bateaux disponibles", icon: "fa-sailboat" },
  { target: 15, label: "Pays en Europe", icon: "fa-earth-europe" },
  { target: 50000, suffix: "+", label: "Voyages réalisés", icon: "fa-anchor" },
  { target: 4.9, decimals: 1, suffix: " / 5", label: "Note de satisfaction", icon: "fa-star" },
];

/** Espace fine comme séparateur de milliers (« 3 200 », « 50 000 »). */
function formatNumber(n: number, decimals: number): string {
  const fixed = n.toFixed(decimals);
  const [intPart, dec] = fixed.split(".");
  const spaced = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return dec ? `${spaced}.${dec}` : spaced;
}

/** Compteurs qui s'incrémentent de 0 jusqu'à leur valeur quand la section
 *  entre dans le viewport (une seule fois). */
export default function StatsCounters() {
  const ref = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<number[]>(() => STATS.map(() => 0));
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const duration = 1600;
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          setValues(STATS.map((s) => s.target * eased));
          if (p < 1) requestAnimationFrame(step);
          else setValues(STATS.map((s) => s.target));
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="stats-dark-grid" ref={ref}>
      {STATS.map((s, i) => (
        <div key={s.label} className="stats-dark-item">
          <i className={`fa-solid ${s.icon} stats-dark-icon`} aria-hidden="true" />
          <strong>
            {formatNumber(values[i], s.decimals ?? 0)}
            {s.suffix ?? ""}
          </strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

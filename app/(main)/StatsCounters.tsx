"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/shared/i18n";
import { formatStatNumber } from "@/shared/lib/site-stats";
import type { HomeStatsValues } from "./getHomeStats";

interface Stat {
  target: number;
  decimals?: number;
  suffix?: string;
  label: string;
  icon: string;
}

function buildStats(values: HomeStatsValues, t: ReturnType<typeof useI18n>["dict"]["stats"]): Stat[] {
  return [
    { target: values.boatsAvailable, label: t.boatsAvailable, icon: "fa-sailboat" },
    { target: values.countries, label: t.countries, icon: "fa-earth-europe" },
    { target: values.completedTrips, label: t.completedTrips, icon: "fa-anchor" },
    { target: values.satisfaction, decimals: 1, suffix: " / 5", label: t.satisfaction, icon: "fa-star" },
  ];
}

/** Compteurs qui s'incrémentent de 0 jusqu'à leur valeur quand la section
 *  entre dans le viewport (une seule fois). */
export default function StatsCounters({ stats }: { stats: HomeStatsValues }) {
  const { dict } = useI18n();
  const STATS = buildStats(stats, dict.stats);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="stats-dark-grid" ref={ref}>
      {STATS.map((s, i) => (
        <div key={s.label} className="stats-dark-item">
          <i className={`fa-solid ${s.icon} stats-dark-icon`} aria-hidden="true" />
          <strong>
            {formatStatNumber(values[i], s.decimals ?? 0)}
            {s.suffix ?? ""}
          </strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

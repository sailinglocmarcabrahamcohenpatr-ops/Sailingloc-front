"use client";

import { Fragment, useEffect, useRef, useState } from "react";

interface StatItem {
  target: number;
  suffix?: string;
  label: string;
}

/** Compteurs du hero « destinations » : partent de 0 et montent jusqu'à leur
 *  valeur quand le hero entre dans le viewport (une seule fois).
 *  Reprend le balisage serveur (.dest-hero-stat + divider) à l'identique pour
 *  ne pas toucher au CSS existant. */
export default function DestHeroStats({ stats }: { stats: StatItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<number[]>(() => stats.map(() => 0));
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const duration = 1400;
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          setValues(stats.map((s) => Math.round(s.target * eased)));
          if (p < 1) requestAnimationFrame(step);
          else setValues(stats.map((s) => s.target));
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
    <div className="dest-hero-stats" ref={ref}>
      {stats.map((s, i) => (
        <Fragment key={s.label}>
          {i > 0 && <div className="dest-hero-stat-divider" />}
          <div className="dest-hero-stat">
            <strong>
              {values[i]}
              {s.suffix ?? ""}
            </strong>
            <span>{s.label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

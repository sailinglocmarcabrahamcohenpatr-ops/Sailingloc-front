"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import type { FullDestination } from "@/entities/destination";
import "./destinations-home.css";

const IMG_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

export default function DestinationsHome({
  destinations,
}: {
  destinations: FullDestination[];
}) {
  const items = destinations.slice(0, 6);
  const [active, setActive] = useState<number | null>(null);
  const [armed, setArmed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // JS actif : on "arme" le reveal (les cartes partent masquées).
    setArmed(true);
    const el = gridRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={gridRef}
      className={
        "destinations-home-grid" +
        (armed ? " dest-armed" : "") +
        (revealed ? " dest-revealed" : "") +
        (active !== null ? " is-zooming" : "")
      }
      onMouseLeave={() => setActive(null)}
    >
      {items.map((dest, i) => (
        <Link
          key={dest.slug}
          href={`/destinations/${dest.slug}`}
          className={
            `dest-home-card${i === 0 ? " dest-home-card--large" : ""}` +
            (active === i ? " is-active" : "")
          }
          style={{ "--pop-i": i } as CSSProperties}
          onMouseEnter={() => setActive(i)}
          onFocus={() => setActive(i)}
          onBlur={() => setActive(null)}
        >
          <div className="dest-home-img">
            <Image
              src={`https://picsum.photos/seed/${dest.imageSeed}/800/600`}
              alt={dest.name}
              fill
              sizes={IMG_SIZES}
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="dest-home-overlay" />
          <div className="dest-home-content">
            <span className="dest-home-flag" aria-hidden="true">{dest.flag}</span>
            <h3>{dest.name}</h3>
            <p>{dest.boatCount} bateaux · dès {dest.priceFrom} €/j</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

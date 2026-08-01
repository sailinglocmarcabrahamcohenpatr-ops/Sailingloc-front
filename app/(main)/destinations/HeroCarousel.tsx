"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FullDestination } from "@/entities/destination";

const AUTOPLAY_MS = 5500;

type DestinationWithPhotos = FullDestination & { photo: string; heroPhoto: string };

export default function HeroCarousel({ destinations }: { destinations: DestinationWithPhotos[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = destinations.length;

  const goTo = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  const containerRef = useRef<HTMLDivElement>(null);

  if (count === 0) return null;

  const current = destinations[index];
  /* Piste de vignettes coulissante : on rend la liste DEUX fois, pour qu'il y
     ait toujours des destinations à droite quel que soit l'index (pas de
     fenêtre vide en fin de liste). Le décalage horizontal est piloté en CSS
     par --thumb-i, avec une transition → défilement fluide. */
  const track = [...destinations, ...destinations];

  return (
    <div
      ref={containerRef}
      className="dest-featured-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) setPaused(false);
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Destinations à la une"
    >
      <div className="dest-featured-bg">
        {destinations.map((dest, i) => (
          <div
            key={dest.slug}
            className="dest-featured-bg-img"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            <Image
              src={dest.heroPhoto}
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
              priority={i === 0}
            />
          </div>
        ))}
        <div className="dest-featured-overlay" />
      </div>

      <div className="dest-featured-content">
        {/* Keyé sur la destination : à chaque changement, ce bloc se remonte et
            rejoue son animation d'entrée (fondu + glissé + net) — le texte ne
            saute plus d'un coup pendant que le fond fait son fondu. */}
        <div className="dest-featured-text" key={current.slug}>
          <div className="dest-featured-eyebrow">{current.flag} {current.country}</div>
          <h2 className="dest-featured-title">{current.name}</h2>
          <p className="dest-featured-desc">{current.tagline}</p>
        </div>

        <div className="dest-featured-actions">
          <Link href={`/destinations/${current.slug}`} className="dest-featured-cta">
            Découvrir <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>

          {count > 1 && (
            <div className="dest-featured-pager">
              <button
                type="button"
                className="dest-featured-pager-btn"
                aria-label="Destination précédente"
                onClick={() => goTo(index - 1)}
              >
                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              </button>
              <span className="dest-featured-pager-count">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
              <button
                type="button"
                className="dest-featured-pager-btn"
                aria-label="Destination suivante"
                onClick={() => goTo(index + 1)}
              >
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      {count > 1 && (
        <div className="dest-featured-thumbs" aria-label="Autres destinations">
          <div
            className="dest-featured-thumbs-track"
            style={{ "--thumb-i": index + 1 } as React.CSSProperties}
          >
            {track.map((dest, n) => (
              <button
                key={`${dest.slug}-${n}`}
                type="button"
                className={`dest-featured-thumb${n % count === index ? " is-active" : ""}`}
                onClick={() => goTo(n % count)}
                aria-label={`Aller à ${dest.name}`}
              >
                <span className="dest-featured-thumb-img">
                  <Image
                    src={dest.photo}
                    alt=""
                    fill
                    sizes="140px"
                    style={{ objectFit: "cover" }}
                  />
                </span>
                <span className="dest-featured-thumb-name">{dest.name}</span>
                <span className="dest-featured-thumb-tag">Explorer</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

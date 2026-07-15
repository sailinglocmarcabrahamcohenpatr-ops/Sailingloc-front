"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FullDestination } from "@/entities/destination";

const AUTOPLAY_MS = 5500;
const THUMB_COUNT = 3;

export default function HeroCarousel({ destinations }: { destinations: FullDestination[] }) {
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
  const thumbs = Array.from({ length: Math.min(THUMB_COUNT, count - 1) }, (_, n) => {
    const i = (index + 1 + n) % count;
    return { i, dest: destinations[i] };
  });

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
              src={`https://picsum.photos/seed/${dest.heroSeed}/1600/800`}
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
        <div className="dest-featured-eyebrow">{current.flag} {current.country}</div>
        <h2 className="dest-featured-title">{current.name}</h2>
        <p className="dest-featured-desc">{current.tagline}</p>

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

      {thumbs.length > 0 && (
        <div className="dest-featured-thumbs" aria-label="Autres destinations">
          {thumbs.map(({ i, dest }) => (
            <button
              key={dest.slug}
              type="button"
              className="dest-featured-thumb"
              onClick={() => goTo(i)}
              aria-label={`Aller à ${dest.name}`}
            >
              <span className="dest-featured-thumb-img">
                <Image
                  src={`https://picsum.photos/seed/${dest.imageSeed}/400/520`}
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
      )}
    </div>
  );
}

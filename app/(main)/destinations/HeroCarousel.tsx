"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { FullDestination } from "@/entities/destination";
import { useI18n, LocaleLink as Link } from "@/shared/i18n";

const AUTOPLAY_MS = 5500;

type DestinationWithPhotos = FullDestination & { photo: string; heroPhoto: string };

export default function HeroCarousel({ destinations }: { destinations: DestinationWithPhotos[] }) {
  const t = useI18n().dict.destinationsPage;
  const count = destinations.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count, next]);

  if (count === 0) return null;

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
      aria-label={t.carouselAria}
    >
      {/* Piste glissante — une diapo plein cadre par destination */}
      <div
        className="dest-featured-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {destinations.map((dest, i) => (
          <article
            key={dest.slug}
            className={`dest-featured-slide${i === index ? " is-active" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-hidden={i !== index}
          >
            <div className="dest-featured-slide-bg">
              <Image
                src={dest.heroPhoto}
                alt=""
                fill
                sizes="100vw"
                style={{ objectFit: "cover" }}
                priority={i === 0}
              />
            </div>
            <div className="dest-featured-overlay" />

            <div className="dest-featured-content">
              <div className="dest-featured-eyebrow">{dest.country} {dest.flag}</div>
              <h2 className="dest-featured-title">{dest.name}</h2>
              <p className="dest-featured-desc">{dest.tagline}</p>
              <div className="dest-featured-actions">
                <Link href={`/destinations/${dest.slug}`} className="dest-featured-cta" tabIndex={i === index ? 0 : -1}>
                  {t.carouselDiscover}{" "}
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Navigation fixe (ne glisse pas avec les diapos) */}
      {count > 1 && (
        <div className="dest-featured-pager">
          <button
            type="button"
            className="dest-featured-pager-btn"
            aria-label={t.carouselPrev}
            onClick={prev}
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
          <span className="dest-featured-pager-count">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <button
            type="button"
            className="dest-featured-pager-btn"
            aria-label={t.carouselNext}
            onClick={next}
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Barre de progression de l'autoplay — redémarre à chaque diapo */}
      {count > 1 && (
        <div
          key={`progress-${index}`}
          className="dest-featured-progress"
          style={{
            animationDuration: `${AUTOPLAY_MS}ms`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      )}
    </div>
  );
}

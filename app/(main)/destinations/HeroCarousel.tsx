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
  const goTo = useCallback((i: number) => setIndex(i), []);

  useEffect(() => {
    if (paused || count <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count, next]);

  if (count === 0) return null;

  const current = destinations[index];
  const thumbs =
    count > 2
      ? [destinations[(index + 1) % count], destinations[(index + 2) % count]]
      : count > 1
        ? [destinations[(index + 1) % count]]
        : [];

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
      {/* Cross-fading full-bleed backgrounds with Ken Burns */}
      <div className="dest-featured-bg">
        {destinations.map((dest, i) => (
          <div
            key={dest.slug}
            className={`dest-featured-bg-img${i === index ? " is-active" : ""}`}
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

      {/* Progress bar — keyed on index so it restarts on every slide change */}
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

      {/* Text stack — CSS opacity+transform transitions, no remount */}
      <div className="dest-featured-content">
        <div className="dest-featured-text-layer">
          {destinations.map((dest, i) => (
            <div
              key={dest.slug}
              className={`dest-featured-text${i === index ? " is-active" : ""}`}
            >
              <div className="dest-featured-eyebrow">{dest.country} {dest.flag}</div>
              <h2 className="dest-featured-title">{dest.name}</h2>
              <p className="dest-featured-desc">{dest.tagline}</p>
            </div>
          ))}
        </div>

        <div className="dest-featured-actions">
          <Link href={`/destinations/${current.slug}`} className="dest-featured-cta">
            {t.carouselDiscover}{" "}
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>

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
        </div>
      </div>

      {/* Thumbnails — keyed on index so they animate in on every slide change */}
      {thumbs.length > 0 && (
        <div key={index} className="dest-featured-thumbs" aria-label={t.carouselThumbsAria}>
          {thumbs.map((dest) => (
            <button
              key={dest.slug}
              type="button"
              className="dest-featured-thumb"
              onClick={() => goTo(destinations.indexOf(dest))}
              aria-label={t.carouselGoTo.replace("{name}", dest.name)}
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
              <span className="dest-featured-thumb-tag">{t.carouselExplore}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

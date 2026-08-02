"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { FullDestination } from "@/entities/destination";
import { useI18n, LocaleLink as Link } from "@/shared/i18n";

const AUTOPLAY_MS = 5500;
const SHIFT_MS = 600;

type DestinationWithPhotos = FullDestination & { photo: string; heroPhoto: string };

export default function HeroCarousel({ destinations }: { destinations: DestinationWithPhotos[] }) {
  const t = useI18n().dict.destinationsPage;
  const count = destinations.length;
  const [index, setIndex] = useState(0);
  const [shifting, setShifting] = useState(false);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);

  // Avance : la rangée de vignettes se décale d'un cran (SHIFT_MS), puis on
  // valide l'index — le grand hero passe alors à la nouvelle destination par
  // fondu doux, pendant que la piste se réinitialise sans transition.
  const advance = useCallback(() => {
    if (lockRef.current || count <= 1) return;
    lockRef.current = true;
    setShifting(true);
    window.setTimeout(() => {
      setIndex((i) => (i + 1) % count);
      setShifting(false);
      lockRef.current = false;
    }, SHIFT_MS);
  }, [count]);

  // Retour : simple fondu du grand hero (pas de décalage inverse).
  const retreat = useCallback(() => {
    if (lockRef.current || count <= 1) return;
    lockRef.current = true;
    setIndex((i) => (i - 1 + count) % count);
    window.setTimeout(() => { lockRef.current = false; }, SHIFT_MS);
  }, [count]);

  // Clic sur une vignette : rejoindre directement cette destination.
  const goTo = useCallback((slug: string) => {
    if (lockRef.current) return;
    const target = destinations.findIndex((d) => d.slug === slug);
    if (target === -1 || target === index) return;
    lockRef.current = true;
    setIndex(target);
    window.setTimeout(() => { lockRef.current = false; }, SHIFT_MS);
  }, [destinations, index]);

  useEffect(() => {
    if (paused || count <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(advance, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count, advance]);

  if (count === 0) return null;

  // Piste de vignettes : jusqu'à 3 destinations à venir (2 visibles + 1 en
  // réserve à droite qui entre pendant le décalage).
  const railCount = Math.min(3, count);
  const thumbs = Array.from({ length: railCount }, (_, k) => destinations[(index + 1 + k) % count]);

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
      {/* Grand hero — fonds en fondu enchaîné */}
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

      {/* Barre de progression de l'autoplay */}
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

      {/* Texte + navigation, bas-gauche */}
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
          <Link href={`/destinations/${destinations[index].slug}`} className="dest-featured-cta">
            {t.carouselDiscover}{" "}
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>

          {count > 1 && (
            <div className="dest-featured-pager">
              <button
                type="button"
                className="dest-featured-pager-btn"
                aria-label={t.carouselPrev}
                onClick={retreat}
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
                onClick={advance}
              >
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rangée de vignettes — mini-carousel qui se décale */}
      {thumbs.length > 0 && (
        <div className="dest-featured-thumbs" aria-label={t.carouselThumbsAria}>
          <div className={`dest-featured-thumbs-track${shifting ? " is-shifting" : ""}`}>
            {thumbs.map((dest) => (
              <button
                key={dest.slug}
                type="button"
                className="dest-featured-thumb"
                onClick={() => goTo(dest.slug)}
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
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FullDestination } from "@/entities/destination";

const AUTOPLAY_MS = 5500;
const SLIDE_MS = 700; // doit rester aligné sur la transition CSS de la piste

type DestinationWithPhotos = FullDestination & { photo: string; heroPhoto: string };

export default function HeroCarousel({ destinations }: { destinations: DestinationWithPhotos[] }) {
  const count = destinations.length;

  /* Carrousel INFINI, sans rembobinage. La piste de vignettes est rendue en
     TROIS exemplaires ; `offset` indexe cette piste triplée et n'est jamais
     ramené a 0 : il avance/recule librement, puis on le RECENTRE dans la copie
     du milieu par un saut de ±count SANS transition. Le contenu se repetant
     tous les `count`, ce saut est invisible → boucle continue dans les deux
     sens, jamais de retour brusque au debut.
     `offset` demarre a count+1 : copie du milieu, en montrant les destinations
     a venir (index+1…). */
  const [offset, setOffset] = useState(count + 1);
  const [noAnim, setNoAnim] = useState(false); // coupe la transition le temps du recentrage
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const index = (((offset - 1) % count) + count) % count;

  const next = useCallback(() => setOffset((o) => o + 1), []);
  const prev = useCallback(() => setOffset((o) => o - 1), []);
  const goTo = useCallback((i: number) => setOffset(count + 1 + i), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count, next]);

  /* Recentrage invisible : quand `offset` sort de la copie du milieu
     [count, 2*count), on attend la fin du glissement puis on le decale de
     ±count sans transition. */
  useEffect(() => {
    if (noAnim) {
      const r = requestAnimationFrame(() =>
        requestAnimationFrame(() => setNoAnim(false))
      );
      return () => cancelAnimationFrame(r);
    }
    if (offset >= 2 * count || offset < count) {
      const t = setTimeout(() => {
        setNoAnim(true);
        setOffset((o) => (o >= 2 * count ? o - count : o + count));
      }, SLIDE_MS + 40);
      return () => clearTimeout(t);
    }
  }, [offset, noAnim, count]);

  if (count === 0) return null;

  const current = destinations[index];
  // Piste triplée : des vignettes existent toujours de part et d'autre de la
  // fenêtre, dans les deux sens.
  const track = [...destinations, ...destinations, ...destinations];

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
                aria-label="Destination suivante"
                onClick={next}
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
            className={`dest-featured-thumbs-track${noAnim ? " no-anim" : ""}`}
            style={{ "--thumb-i": offset } as React.CSSProperties}
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

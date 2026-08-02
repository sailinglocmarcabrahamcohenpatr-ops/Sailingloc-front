"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useI18n } from "@/shared/i18n";

export interface HighlightItem {
  title: string;
  desc: string;
  icon: string;
  image?: string;
}

export interface PlacePhoto {
  src: string;
  caption: string;
}

interface Props {
  highlights: HighlightItem[];
  /** Pool de vraies photos du lieu (images des points forts + galerie), sans doublon. */
  photos: PlacePhoto[];
  destName: string;
}

const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

export default function DestinationHighlights({ highlights, photos, destName }: Props) {
  const t = useI18n().dict.destinationDetail;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const hasPhotos = photos.length > 0;
  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const open = useCallback(
    (fallbackIndex: number, image?: string) => {
      if (!hasPhotos) return;
      if (image) {
        const i = photos.findIndex((p) => p.src === image);
        setOpenIndex(i >= 0 ? i : Math.min(fallbackIndex, photos.length - 1));
      } else {
        setOpenIndex(Math.min(fallbackIndex, photos.length - 1));
      }
    },
    [photos, hasPhotos]
  );

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, prev, next]);

  const active = openIndex === null ? null : photos[openIndex];

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (openIndex === null || !thumbsRef.current) return;
    const thumb = thumbsRef.current.children[openIndex] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [openIndex]);

  // Swipe support
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 48) prev();
    else if (dx < -48) next();
    touchStartX.current = null;
  };

  return (
    <>
      <div className="dest-highlights-grid">
        {highlights.map((h, i) => (
          <button
            key={h.title}
            type="button"
            className="dest-highlight-card"
            onClick={() => open(i, h.image)}
            aria-label={fill(t.highlightOpenAria, { title: h.title })}
            disabled={!hasPhotos}
          >
            {h.image && (
              <div className="dest-highlight-card-img">
                <Image
                  src={h.image}
                  alt={h.title}
                  fill
                  sizes="(max-width: 600px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
                <div className="dest-highlight-card-overlay" />
              </div>
            )}
            <span className="dest-highlight-num">{String(i + 1).padStart(2, "0")}</span>
            <div className="dest-highlight-icon"><i className={`fa-solid ${h.icon}`} aria-hidden="true" /></div>
            <h4>{h.title}</h4>
            <p>{h.desc}</p>
            {hasPhotos && (
              <span className="dest-highlight-view" aria-hidden="true">
                <i className="fa-solid fa-images" /> {t.highlightViewPhotos}
              </span>
            )}
          </button>
        ))}
      </div>

      {active && createPortal(
        <div
          className="dest-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={fill(t.lightboxAria, { name: destName })}
          onClick={close}
        >
          <div className="dest-lightbox-dialog" onClick={(e) => e.stopPropagation()}>

            {/* En-tête : titre + compteur + fermer */}
            <div className="dest-lightbox-header">
              <span className="dest-lightbox-caption">{active.caption}</span>
              {photos.length > 1 && (
                <span className="dest-lightbox-counter">{openIndex! + 1} / {photos.length}</span>
              )}
              <button
                type="button"
                className="dest-lightbox-close"
                onClick={close}
                aria-label={t.lightboxClose}
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>

            {/* Zone image avec flèches flottantes */}
            <div
              className="dest-lightbox-media"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="dest-lightbox-img">
                <Image
                  src={active.src}
                  alt={active.caption}
                  fill
                  sizes="(max-width: 900px) 100vw, 900px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              {photos.length > 1 && (
                <button
                  type="button"
                  className="dest-lightbox-nav dest-lightbox-prev"
                  onClick={prev}
                  aria-label={t.lightboxPrev}
                >
                  <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                </button>
              )}
              {photos.length > 1 && (
                <button
                  type="button"
                  className="dest-lightbox-nav dest-lightbox-next"
                  onClick={next}
                  aria-label={t.lightboxNext}
                >
                  <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Pied : vignettes */}
            {photos.length > 1 && (
              <div className="dest-lightbox-footer">
                <div className="dest-lightbox-thumbs" ref={thumbsRef}>
                  {photos.map((p, i) => (
                    <button
                      key={p.src}
                      type="button"
                      className={`dest-lightbox-thumb${i === openIndex ? " is-active" : ""}`}
                      onClick={() => setOpenIndex(i)}
                      aria-label={p.caption}
                      aria-current={i === openIndex}
                    >
                      <Image src={p.src} alt="" fill sizes="90px" style={{ objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}
    </>
  );
}

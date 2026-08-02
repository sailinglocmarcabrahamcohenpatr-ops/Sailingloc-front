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
  images?: string[];
}

export interface PlacePhoto {
  src: string;
  caption: string;
}

interface Props {
  highlights: HighlightItem[];
  /** Un tableau de photos par point fort — index i = photos du highlight i. */
  highlightPhotos: PlacePhoto[][];
  destName: string;
}

const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

export default function DestinationHighlights({ highlights, highlightPhotos = [], destName }: Props) {
  const t = useI18n().dict.destinationDetail;
  const [mounted, setMounted] = useState(false);
  const [openHighlightIdx, setOpenHighlightIdx] = useState<number | null>(null);
  const [openPhotoIdx, setOpenPhotoIdx] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const currentPhotos = openHighlightIdx !== null ? (highlightPhotos[openHighlightIdx] ?? []) : [];
  const activePhoto = currentPhotos[openPhotoIdx] ?? null;

  const open = useCallback((highlightIdx: number) => {
    if (!(highlightPhotos[highlightIdx]?.length)) return;
    setOpenHighlightIdx(highlightIdx);
    setOpenPhotoIdx(0);
  }, [highlightPhotos]);

  const close = useCallback(() => setOpenHighlightIdx(null), []);

  const prev = useCallback(() => {
    const len = currentPhotos.length;
    if (len > 1) setOpenPhotoIdx((i) => (i - 1 + len) % len);
  }, [currentPhotos.length]);

  const next = useCallback(() => {
    const len = currentPhotos.length;
    if (len > 1) setOpenPhotoIdx((i) => (i + 1) % len);
  }, [currentPhotos.length]);

  useEffect(() => {
    if (openHighlightIdx === null) return;
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
  }, [openHighlightIdx, close, prev, next]);

  // Auto-scroll la vignette active
  useEffect(() => {
    if (!thumbsRef.current) return;
    const thumb = thumbsRef.current.children[openPhotoIdx] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [openPhotoIdx]);

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
        {highlights.map((h, i) => {
          const hasPhoto = (highlightPhotos[i]?.length ?? 0) > 0;
          return (
            <button
              key={h.title}
              type="button"
              className="dest-highlight-card"
              onClick={() => open(i)}
              aria-label={fill(t.highlightOpenAria, { title: h.title })}
              disabled={!hasPhoto}
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
              {hasPhoto && (
                <span className="dest-highlight-view" aria-hidden="true">
                  <i className="fa-solid fa-images" /> {t.highlightViewPhotos}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {mounted && activePhoto && createPortal(
        <div
          className="dest-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={fill(t.lightboxAria, { name: destName })}
          onClick={close}
        >
          <div className="dest-lightbox-dialog" onClick={(e) => e.stopPropagation()}>

            <div className="dest-lightbox-header">
              <span className="dest-lightbox-caption">{activePhoto.caption}</span>
              {currentPhotos.length > 1 && (
                <span className="dest-lightbox-counter">{openPhotoIdx + 1} / {currentPhotos.length}</span>
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

            <div
              className="dest-lightbox-media"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="dest-lightbox-img">
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.caption}
                  fill
                  sizes="(max-width: 900px) 100vw, 900px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              {currentPhotos.length > 1 && (
                <button
                  type="button"
                  className="dest-lightbox-nav dest-lightbox-prev"
                  onClick={prev}
                  aria-label={t.lightboxPrev}
                >
                  <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                </button>
              )}
              {currentPhotos.length > 1 && (
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

            {currentPhotos.length > 1 && (
              <div className="dest-lightbox-footer">
                <div className="dest-lightbox-thumbs" ref={thumbsRef}>
                  {currentPhotos.map((p, i) => (
                    <button
                      key={p.src}
                      type="button"
                      className={`dest-lightbox-thumb${i === openPhotoIdx ? " is-active" : ""}`}
                      onClick={() => setOpenPhotoIdx(i)}
                      aria-label={p.caption}
                      aria-current={i === openPhotoIdx}
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

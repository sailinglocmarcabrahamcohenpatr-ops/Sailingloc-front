"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useFavoris } from "@/shared/lib";

interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryProps {
  images: GalleryImage[];
  title?: string;
  /** Si fourni, active le bouton "Enregistrer" comme favori réel pour ce bateau. */
  boatId?: string;
}

export default function Gallery({ images, title, boatId }: GalleryProps) {
  const { isFavorite, toggle } = useFavoris();
  const isSaved = boatId ? isFavorite(boatId) : false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainSrc, setMainSrc] = useState(images[0]?.src ?? "");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");

  const select = (i: number) => {
    setActiveIndex(i);
    setMainSrc(images[i].src);
  };

  const openLightbox = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  const showPrev = () =>
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setLightboxIndex((i) => (i + 1) % images.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen]);

  const handleShare = async () => {
    const shareData = {
      title: title ?? "Bateau sur SailingLoc",
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        setShareState("copied");
        setTimeout(() => setShareState("idle"), 2000);
      }
    } catch {
      // L'utilisateur a annulé le partage natif : pas d'erreur à afficher.
    }
  };

  return (
    <>
      <div className="gallery" role="group" aria-label="Galerie photos">
        <div className="gallery-main" onClick={() => openLightbox(activeIndex)}>
          <Image
            src={mainSrc}
            alt={images[activeIndex]?.alt ?? "Photo principale"}
            fill
            priority
            unoptimized
            style={{ objectFit: "cover" }}
          />
        </div>
        {images.slice(1, 3).map((img, i) => (
          <button
            key={img.src}
            className={`gallery-thumb${activeIndex === i + 1 ? " active" : ""}`}
            onClick={() => {
              select(i + 1);
              openLightbox(i + 1);
            }}
            aria-label={`Voir photo : ${img.alt}`}
            style={{ border: "none", padding: 0, background: "none", cursor: "pointer", display: "block" }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              unoptimized
              style={{ objectFit: "cover" }}
            />
          </button>
        ))}
      </div>
      <div className="gallery-actions">
        <button className="gallery-act-btn">
          <i className="fa-solid fa-heart" aria-hidden="true" /> Enregistrer
        </button>
        <button className="gallery-act-btn" onClick={handleShare}>
          <i className={`fa-solid ${shareState === "copied" ? "fa-check" : "fa-share-nodes"}`} aria-hidden="true" />{" "}
          {shareState === "copied" ? "Lien copié !" : "Partager"}
        </button>
        <button className="gallery-act-btn" onClick={() => openLightbox(0)}>
          <i className="fa-regular fa-images" aria-hidden="true" /> Voir toutes les photos
        </button>
      </div>

      {lightboxOpen && (
        <div
          className="gallery-lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Galerie photos"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="gallery-lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="gallery-lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Fermer la galerie"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>

            <div className="gallery-lightbox-stage">
              {images.length > 1 && (
                <button
                  className="gallery-lightbox-nav gallery-lightbox-nav-prev"
                  onClick={showPrev}
                  aria-label="Photo précédente"
                >
                  <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                </button>
              )}

              <div className="gallery-lightbox-image">
                <Image
                  src={images[lightboxIndex]?.src ?? ""}
                  alt={images[lightboxIndex]?.alt ?? "Photo du bateau"}
                  fill
                  unoptimized
                  style={{ objectFit: "contain" }}
                />
              </div>

              {images.length > 1 && (
                <button
                  className="gallery-lightbox-nav gallery-lightbox-nav-next"
                  onClick={showNext}
                  aria-label="Photo suivante"
                >
                  <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                </button>
              )}

              {images.length > 1 && (
                <div className="gallery-lightbox-counter">
                  {lightboxIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="gallery-lightbox-thumbs">
                {images.map((img, i) => (
                  <button
                    key={img.src}
                    className={`gallery-lightbox-thumb${i === lightboxIndex ? " active" : ""}`}
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Voir photo ${i + 1} : ${img.alt}`}
                  >
                    <Image src={img.src} alt={img.alt} fill unoptimized style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

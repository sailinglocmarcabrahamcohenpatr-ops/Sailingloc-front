"use client";

import { useState } from "react";
import Image from "next/image";
import type { Boat } from "../model/types";
import { getBoatImageUrls } from "../model/image";

const IMG_SIZES = "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 320px";

interface BoatCardGalleryProps {
  boat: Boat;
  /** Badge + bouton favori, superposés à la photo. */
  children?: React.ReactNode;
}

/** Carrousel de photos de la carte bateau.
 *  La carte entière est un <Link> : les contrôles doivent donc stopper la
 *  navigation (preventDefault + stopPropagation), sinon un clic sur une
 *  flèche ouvrirait la fiche du bateau. */
export default function BoatCardGallery({ boat, children }: BoatCardGalleryProps) {
  const images = getBoatImageUrls(boat, 640, 480);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const go = (e: React.MouseEvent, dir: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + dir + count) % count);
  };

  return (
    <div className="boat-card-img">
      <div
        className="boat-gallery-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div className="boat-gallery-slide" key={`${src}-${i}`}>
            <Image
              src={src}
              alt={`${boat.name} — photo ${i + 1} sur ${count}`}
              fill
              sizes={IMG_SIZES}
              style={{ objectFit: "cover" }}
              loading={i === 0 ? "eager" : "lazy"}
              unoptimized
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="boat-gallery-nav boat-gallery-nav--prev"
            onClick={(e) => go(e, -1)}
            aria-label="Photo précédente"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="boat-gallery-nav boat-gallery-nav--next"
            onClick={(e) => go(e, 1)}
            aria-label="Photo suivante"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
          <div className="boat-gallery-dots" aria-hidden="true">
            {images.map((src, i) => (
              <span
                key={`dot-${src}-${i}`}
                className={`boat-gallery-dot${i === index ? " is-active" : ""}`}
              />
            ))}
          </div>
        </>
      )}

      {children}
    </div>
  );
}

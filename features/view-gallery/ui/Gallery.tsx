"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

export default function Gallery({ images }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainSrc, setMainSrc] = useState(images[0]?.src ?? "");

  const select = (i: number) => {
    setActiveIndex(i);
    setMainSrc(images[i].src);
  };

  return (
    <>
      <div className="gallery" role="group" aria-label="Galerie photos">
        <div className="gallery-main">
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
            onClick={() => select(i + 1)}
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
        <button className="gallery-act-btn">
          <i className="fa-solid fa-share-nodes" aria-hidden="true" /> Partager
        </button>
        <button className="gallery-act-btn">
          <i className="fa-regular fa-images" aria-hidden="true" /> Voir toutes les photos
        </button>
      </div>
    </>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DESTINATIONS } from "@/shared/config";
import "./destinations-carousel.css";

export default function DestinationsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const ITEM_WIDTH = 264;
  const VISIBLE = 4;
  const max = Math.max(0, DESTINATIONS.length - VISIBLE);

  const slide = (dir: 1 | -1) => {
    const next = Math.min(Math.max(index + dir, 0), max);
    setIndex(next);
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${next * ITEM_WIDTH}px)`;
    }
  };

  return (
    <section className="section-py" id="destinations" aria-label="Destinations populaires">
      <div className="container">
        <div className="section-hd fade-in">
          <h2 className="section-title">Destinations populaires</h2>
          <Link href="/bateaux" className="section-link">
            Voir tout <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
        <div className="carousel">
          <button
            className="carousel-btn carousel-prev"
            aria-label="Précédent"
            onClick={() => slide(-1)}
            disabled={index === 0}
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
          <div className="carousel-track" ref={trackRef}>
            {DESTINATIONS.map((dest) => (
              <Link
                key={dest.name}
                href={`/bateaux?destination=${encodeURIComponent(dest.name)}`}
                className="dest-card"
                aria-label={`${dest.name} — ${dest.boatCount} bateaux`}
              >
                <Image
                  src={`https://picsum.photos/seed/${dest.imageSeed}/400/530`}
                  alt={dest.name}
                  fill
                  sizes="240px"
                  style={{ objectFit: "cover" }}
                />
                <div className="dest-card-overlay" aria-hidden="true" />
                <div className="dest-card-body">
                  <div className="dest-card-name">{dest.name}</div>
                  <div className="dest-card-count">
                    <i className="fa-solid fa-sailboat" aria-hidden="true" />{" "}
                    {dest.boatCount} bateaux
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <button
            className="carousel-btn carousel-next"
            aria-label="Suivant"
            onClick={() => slide(1)}
            disabled={index === max}
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

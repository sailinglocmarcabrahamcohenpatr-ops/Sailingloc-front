"use client";

import { useRef, useState, useEffect } from "react";

/** Playlist de fonds vidéo : chaque vidéo enchaîne sur la suivante à sa fin,
 *  puis reboucle. Dépose les fichiers dans public/videos/.
 *  Une source injouable (fichier absent) est retirée automatiquement. */
const SOURCES = [
  "/videos/hero-background.mp4",
  "/videos/hero-background-2.mp4",
];

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [available, setAvailable] = useState(SOURCES);
  const [index, setIndex] = useState(0);

  const src = available[index] ?? available[0];

  useEffect(() => {
    // Relance la lecture au changement de source (autoplay peut ne pas suffire).
    ref.current?.play().catch(() => {});
  }, [src]);

  return (
    <video
      ref={ref}
      key={src}
      className="hero-video"
      src={src}
      autoPlay
      muted
      playsInline
      loop={available.length <= 1} /* une seule vidéo dispo → on reboucle dessus */
      onLoadedData={() => ref.current?.play().catch(() => {})}
      onEnded={() => {
        if (available.length > 1) setIndex((i) => (i + 1) % available.length);
      }}
      onError={() => {
        // Source injouable (ex. 2e vidéo pas encore ajoutée) → on la retire.
        setAvailable((prev) => {
          const next = prev.filter((s) => s !== src);
          return next.length ? next : prev;
        });
        setIndex(0);
      }}
    />
  );
}

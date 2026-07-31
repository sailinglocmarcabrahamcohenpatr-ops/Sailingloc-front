"use client";

import { useEffect, useRef } from "react";
import "./scroll-video.css";

const SRC = "/videos/scroll-bg.mp4";
const POSTER = "/videos/scroll-bg-poster.jpg";

/** Fond vidéo piloté par le scroll : la position dans la page correspond à la
 *  position dans la vidéo.
 *
 *  Deux contraintes ont dicté l'implémentation :
 *  1. Le fichier source (4K, 1 image-clé toutes les ~200 frames) était
 *     inscrutable. Il est réencodé en all-intra 720p : chaque frame est une
 *     image-clé, donc tout `currentTime` est atteignable sans décoder la
 *     séquence précédente.
 *  2. On n'écrit jamais `currentTime` directement depuis l'évènement scroll :
 *     le scroll émet bien plus souvent que le rafraîchissement écran. On
 *     mémorise la cible et on l'applique dans une boucle rAF, avec un lissage
 *     qui absorbe les à-coups du pavé tactile. */
export default function ScrollVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /* Respecte le réglage « réduire les animations » du site et de l'OS :
       la vidéo reste sur sa première image, sans défilement. */
    const reduced =
      document.documentElement.getAttribute("data-motion") === "reduced" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    let target = 0;
    let current = 0;
    let duration = 0;

    const onMeta = () => { duration = video.duration || 0; };
    video.addEventListener("loadedmetadata", onMeta);
    if (video.readyState >= 1) onMeta();

    const computeTarget = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0 || !duration) return;
      const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      target = progress * duration;
    };

    const tick = () => {
      /* Lissage exponentiel : la vidéo rattrape la cible sans à-coups.
         En dessous d'une frame d'écart (1/30 s) on cale, pour éviter des
         seeks permanents qui feraient travailler le décodeur pour rien. */
      const delta = target - current;
      if (Math.abs(delta) > 1 / 30) {
        current += delta * 0.12;
        video.currentTime = current;
      }
      raf = requestAnimationFrame(tick);
    };

    computeTarget();
    raf = requestAnimationFrame(tick);

    const onScroll = () => computeTarget();
    const onResize = () => computeTarget();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  return (
    <div className="scroll-video-bg" aria-hidden="true">
      <video
        ref={videoRef}
        src={SRC}
        poster={POSTER}
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
      />
    </div>
  );
}

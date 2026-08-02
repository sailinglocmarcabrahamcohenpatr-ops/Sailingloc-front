"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function FadeInObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const observe = () => {
      document
        .querySelectorAll(".fade-in:not(.visible), .reveal:not(.visible)")
        .forEach((el) => observer.observe(el));
    };

    observe();

    // Certaines sections (photos chargées via API/Pexels) arrivent dans le DOM
    // bien après le montage — mesuré jusqu'à ~2s sur /destinations. Un unique
    // re-scan différé ratait ce contenu tardif, qui restait alors bloqué à
    // opacity:0 pour toujours. Le MutationObserver rattrape tout ajout,
    // qu'il vienne du streaming SSR ou d'une navigation côté client (le layout
    // racine, où vit ce composant, ne remonte jamais entre les routes).
    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

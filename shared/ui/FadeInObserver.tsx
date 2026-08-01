"use client";

import { useEffect } from "react";

export default function FadeInObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const observe = () => {
      document
        .querySelectorAll(".fade-in:not(.visible), .reveal:not(.visible)")
        .forEach((el) => io.observe(el));
    };

    observe();

    /* Le composant est monté UNE fois dans le layout, mais des éléments
       .reveal / .fade-in apparaissent aussi plus tard : navigation client, et
       surtout pages dont le contenu dépend d'un fetch (la grille des
       destinations arrive après la fenêtre d'un simple setTimeout, d'où des
       cartes bloquées à opacity:0 en venant du menu, alors qu'un rechargement
       direct fonctionnait).
       Un MutationObserver ré-observe à chaque ajout de nœuds — il couvre
       l'hydratation, la navigation et le streaming asynchrone, sans dépendre
       d'un délai fixe. On n'écoute QUE l'ajout de nœuds (pas les attributs) :
       la classe .visible ajoutée par le reveal ne se re-déclenche donc pas. */
    const mo = new MutationObserver(() => observe());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}

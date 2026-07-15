"use client";

import { useEffect } from "react";

export default function FadeInObserver() {
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

    // Re-observe after potential hydration/dynamic renders
    const t = setTimeout(observe, 300);
    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  return null;
}

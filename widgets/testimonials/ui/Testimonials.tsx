"use client";

import { useState } from "react";
import type { Testimonial } from "@/shared/types";
import "./testimonials.css";

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Stars = ({ n }: { n: number }) => (
  <span className="stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <i key={i} className={i <= n ? "fa-solid fa-star" : "fa-regular fa-star"} aria-hidden="true" />
    ))}
  </span>
);

function TestimonialDetailModal({ t, onClose }: { t: Testimonial; onClose: () => void }) {
  return (
    <div className="testimonial-modal-overlay" onClick={onClose}>
      <div className="testimonial-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="testimonial-modal-close" onClick={onClose} aria-label="Fermer">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        <div className="testimonial-modal-author">
          <div className="testimonial-avatar testimonial-avatar--lg" aria-hidden="true">
            {getInitials(t.author)}
          </div>
          <div>
            <strong>{t.author}</strong>
            <span>{t.role} · {t.destination}</span>
          </div>
        </div>

        <Stars n={t.rating} />
        <p className="testimonial-modal-body">&ldquo;{t.body}&rdquo;</p>

        <div className="testimonial-modal-subnotes">
          <span><i className="fa-solid fa-user" aria-hidden="true" /> Propriétaire <Stars n={t.noteProprietaire} /></span>
          <span><i className="fa-solid fa-sailboat" aria-hidden="true" /> Bateau <Stars n={t.noteBateau} /></span>
          <span><i className="fa-solid fa-map-location-dot" aria-hidden="true" /> Lieu <Stars n={t.noteLieu} /></span>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [selected, setSelected] = useState<Testimonial | null>(null);

  if (testimonials.length === 0) return null;

  return (
    <section className="testimonials-section section-py" aria-labelledby="testi-title">
      <div className="container">
        <div className="section-hd fade-in" style={{ flexDirection: "column", textAlign: "center", gap: "12px" }}>
          <h2 className="section-title" id="testi-title">Ce que disent nos navigateurs</h2>
          <p style={{ color: "var(--text-2)", maxWidth: "520px", margin: "0 auto" }}>
            Des milliers de locataires et propriétaires font confiance à SailingLoc chaque année.
          </p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="testimonial-card fade-in"
              role="button"
              tabIndex={0}
              onClick={() => setSelected(t)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelected(t); }}
            >
              <div className="testimonial-stars" aria-label={`${t.rating} sur 5`}>
                {[...Array(t.rating)].map((_, i) => (
                  <i key={i} className="fa-solid fa-star" aria-hidden="true" />
                ))}
              </div>
              <p className="testimonial-body">&ldquo;{t.body}&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" aria-hidden="true">
                  {getInitials(t.author)}
                </div>
                <div>
                  <strong>{t.author}</strong>
                  <span>{t.role} · {t.destination}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selected && <TestimonialDetailModal t={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

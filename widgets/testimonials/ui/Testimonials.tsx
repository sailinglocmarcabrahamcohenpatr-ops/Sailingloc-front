import Image from "next/image";
import type { Testimonial } from "@/shared/types";

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    author: "Sophie M.",
    role: "Locataire",
    avatarSeed: "sophie-m",
    rating: 5,
    body: "Une semaine en Corse sur un Sun Odyssey — c'était absolument magique. La réservation était ultra simple, le bateau parfaitement entretenu. On repart cet été !",
    destination: "Corse",
    boatType: "Voilier",
  },
  {
    id: "t2",
    author: "Thomas L.",
    role: "Propriétaire",
    avatarSeed: "thomas-l",
    rating: 5,
    body: "Je loue mon catamaran depuis 8 mois via SailingLoc. Les revenus couvrent largement les charges. La plateforme gère tout : paiements, assurance, communication.",
    destination: "Côte d'Azur",
    boatType: "Catamaran",
  },
  {
    id: "t3",
    author: "Camille & Julien",
    role: "Locataires",
    avatarSeed: "camille-j",
    rating: 5,
    body: "Notre lune de miel aux Baléares sur un voilier 46 pieds. Service client irréprochable, l'équipe SailingLoc a été disponible 24h/24. Moment inoubliable.",
    destination: "Baléares",
    boatType: "Voilier",
  },
  {
    id: "t4",
    author: "Marc D.",
    role: "Propriétaire",
    avatarSeed: "marc-d",
    rating: 5,
    body: "En tant que propriétaire, ce qui me rassure c'est l'assurance incluse et la vérification des locataires. Mes bateaux sont entre de bonnes mains.",
    destination: "Méditerranée",
    boatType: "Voilier",
  },
  {
    id: "t5",
    author: "Isabelle R.",
    role: "Locataire",
    avatarSeed: "isabelle-r",
    rating: 5,
    body: "Première expérience en voile avec un skipper inclus. Tout était parfait : le bateau, le skipper, la destination. Grèce — je recommande à 200 %.",
    destination: "Cyclades",
    boatType: "Voilier",
  },
  {
    id: "t6",
    author: "Antoine B.",
    role: "Locataire",
    avatarSeed: "antoine-b",
    rating: 5,
    body: "SailingLoc m'a permis de vivre une expérience que je pensais réservée aux millionnaires. Un catamaran aux Cyclades pour une semaine, tarif très raisonnable.",
    destination: "Cyclades",
    boatType: "Catamaran",
  },
];

export default function Testimonials() {
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
          {TESTIMONIALS.map((t) => (
            <article key={t.id} className="testimonial-card fade-in">
              <div className="testimonial-stars" aria-label={`${t.rating} sur 5`}>
                {[...Array(t.rating)].map((_, i) => (
                  <i key={i} className="fa-solid fa-star" aria-hidden="true" />
                ))}
              </div>
              <p className="testimonial-body">&ldquo;{t.body}&rdquo;</p>
              <div className="testimonial-author">
                <Image
                  src={`https://i.pravatar.cc/64?u=${t.avatarSeed}`}
                  alt={t.author}
                  width={40}
                  height={40}
                  className="testimonial-avatar"
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
                  <strong>{t.author}</strong>
                  <span>{t.role} · {t.destination}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

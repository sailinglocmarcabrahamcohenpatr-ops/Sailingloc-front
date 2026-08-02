import Image from "next/image";
import Link from "next/link";
import "./why-sailingloc.css";

const whyItems = [
  {
    icon: "fa-mobile-screen",
    title: "Application mobile",
    description:
      "Gérez vos réservations depuis votre smartphone, à tout moment et n'importe où.",
  },
  {
    icon: "fa-star",
    title: "Note de recommandation",
    description:
      "Des milliers d'avis vérifiés pour choisir votre bateau en toute confiance.",
  },
  {
    icon: "fa-shield-halved",
    title: "Assurance incluse",
    description:
      "Couverture complète pour le propriétaire et le locataire pendant toute la durée de la location.",
  },
  {
    icon: "fa-book-open",
    title: "Carnet de bord numérique",
    description:
      "Suivi en temps réel de vos voyages avec historique complet et documents accessibles.",
  },
];

export default function WhySailingLoc() {
  return (
    <section
      className="section-py"
      style={{ background: "var(--bg)" }}
      aria-labelledby="why-title"
    >
      <div className="container">
        <div className="why-grid">
          <div className="why-img fade-in">
            <Image
              src="https://picsum.photos/seed/sailing-ocean/800/600"
              alt="Voilier en mer bleue"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="why-text fade-in">
            <span className="why-tag">Notre mission</span>
            <h2 id="why-title">Pourquoi SailingLoc ?</h2>
            <p>
              SailingLoc simplifie la location entre particuliers, sécurise les
              échanges et les paiements. Une expérience fluide et premium pour
              les loueurs comme les propriétaires.
            </p>
            <ul className="why-list">
              {whyItems.map((item) => (
                <li key={item.title} className="why-item">
                  <div className="why-item-icon" aria-hidden="true">
                    <i className={`fa-solid ${item.icon}`} />
                  </div>
                  <div className="why-item-text">
                    <h5>{item.title}</h5>
                    <p>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/contact" className="btn btn-primary">
              <i className="fa-solid fa-arrow-right" aria-hidden="true" /> En savoir plus
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

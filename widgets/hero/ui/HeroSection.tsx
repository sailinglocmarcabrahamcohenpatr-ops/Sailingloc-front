import Image from "next/image";
import { SearchBar } from "@/features/search-boats";

export default function HeroSection() {
  return (
    <section className="hero" aria-label="Bannière principale">
      <div className="hero-bg">
        <Image
          src="https://picsum.photos/seed/sailing-mediterranean-blue/1920/1000"
          alt="Voilier naviguant en Méditerranée"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 35%" }}
        />
        <div className="hero-overlay" aria-hidden="true" />
      </div>

      <div className="hero-content">
        <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="hero-eyebrow">
            <i className="fa-solid fa-shield-halved" aria-hidden="true" />
            Assurance incluse &nbsp;·&nbsp; Paiement sécurisé &nbsp;·&nbsp; Propriétaires vérifiés
          </div>

          <h1 className="hero-title">
            Location de bateaux<br />
            <span className="hero-title-accent">entre particuliers</span>
          </h1>

          <p className="hero-sub">
            Réservez un voilier, catamaran ou bateau à moteur au meilleur prix.<br />
            Des centaines de bateaux disponibles en France et en Europe.
          </p>

          <SearchBar />

          <div className="hero-trust">
            <div className="hero-trust-item">
              <strong>3 200+</strong>
              <span>Bateaux disponibles</span>
            </div>
            <div className="hero-trust-sep" aria-hidden="true" />
            <div className="hero-trust-item">
              <strong>15</strong>
              <span>Pays couverts</span>
            </div>
            <div className="hero-trust-sep" aria-hidden="true" />
            <div className="hero-trust-item">
              <strong>4.9 / 5</strong>
              <span>Satisfaction client</span>
            </div>
            <div className="hero-trust-sep" aria-hidden="true" />
            <div className="hero-trust-item">
              <strong>50 000+</strong>
              <span>Voyages réalisés</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

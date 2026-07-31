import { SearchBar } from "@/features/search-boats";
import "./hero.css";

export default function HeroSection() {
  return (
    <section className="hero" aria-label="Bannière principale">
      {/* Plus de vidéo propre au hero : le fond vidéo global (piloté par le
          scroll) tient ce rôle. On conserve le voile, qui assure le contraste
          du titre en haut de page. */}
      <div className="hero-bg">
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
        </div>
      </div>
    </section>
  );
}

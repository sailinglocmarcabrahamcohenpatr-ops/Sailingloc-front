import { SearchBar } from "@/features/search-boats";
import "./hero.css";

export default function HeroSection() {
  return (
    <section className="hero" aria-label="Bannière principale">
      {/* Aucun fond propre au hero : ni image, ni vidéo, ni voile. Le fond
          vidéo global (piloté par le scroll) est visible tel quel. */}

      <div className="hero-content">
        <div className="container">
          {/* Deux colonnes : recherche à gauche, discours à droite. L'ordre du
              DOM place le texte en premier — c'est lui qui doit être lu et
              annoncé d'abord ; l'inversion visuelle est faite en CSS. */}
          <div className="hero-layout">
            <div className="hero-copy">
              <h1 className="hero-title">
                Location de bateaux<br />
                <span className="hero-title-accent">entre particuliers</span>
              </h1>

              <p className="hero-sub">
                Réservez un voilier, catamaran ou bateau à moteur au meilleur prix.
                Des centaines de bateaux disponibles en France et en Europe.
              </p>
            </div>

            <div className="hero-search">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

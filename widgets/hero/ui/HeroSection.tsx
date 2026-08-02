import { SearchBar } from "@/features/search-boats";
import { getRequestLocale, getDictionary } from "@/shared/i18n/get-dictionary";
import "./hero.css";

export default async function HeroSection() {
  const t = getDictionary(await getRequestLocale()).hero;

  return (
    <section className="hero" aria-label={t.aria}>
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
                {t.titleLine1}<br />
                <span className="hero-title-accent">{t.titleAccent}</span>
              </h1>

              <p className="hero-sub">{t.subtitle}</p>
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

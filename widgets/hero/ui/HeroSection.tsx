import { SearchBar } from "@/features/search-boats";
import HeroVideo from "./HeroVideo";
import { getRequestLocale, getDictionary } from "@/shared/i18n/get-dictionary";
import "./hero.css";

export default async function HeroSection() {
  const t = getDictionary(await getRequestLocale()).hero;

  return (
    <section className="hero" aria-label={t.aria}>
      {/* Fond vidéo propre au hero : playlist de deux vidéos qui s'enchaînent
          (HeroVideo), surmontée d'un dégradé sombre pour la lisibilité. */}
      <div className="hero-bg">
        <HeroVideo />
        <div className="hero-overlay" aria-hidden="true" />
      </div>

      <div className="hero-content">
        <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="hero-eyebrow">
            <i className="fa-solid fa-shield-halved" aria-hidden="true" />
            {t.eyebrow}
          </div>

          <h1 className="hero-title">
            {t.titleLine1}<br />
            <span className="hero-title-accent">{t.titleAccent}</span>
          </h1>

          {/* Barre de recherche pleine largeur, horizontale (voir hero.css /
              search-bar.css). C'est la barre custom de la branche (DateField). */}
          <SearchBar />
        </div>
      </div>
    </section>
  );
}

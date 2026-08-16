import type { Metadata } from "next";
import Image from "next/image";
import { getDestinationsWithLiveBoatCounts } from "@/entities/destination";
import { getCoherentPhoto } from "@/shared/lib/pexels";
import { LocaleLink as Link } from "@/shared/i18n";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import HeroCarousel from "./HeroCarousel";
import DestHeroStats from "./DestHeroStats";
import "./destinations.css";

/** Remplace les {placeholders} d'un gabarit par leurs valeurs. */
function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).destinationsPage;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function DestinationsPage() {
  const t = getDictionary(await getRequestLocale()).destinationsPage;
  const liveDestinations = await getDestinationsWithLiveBoatCounts();
  const destinations = await Promise.all(
    liveDestinations.map(async (dest) => ({
      ...dest,
      /* Image de carte = photo curée de la destination (heroImage) → chaque
         carte montre bien son lieu (Corse pour « Corse », etc.). Repli sur
         getCoherentPhoto seulement si une destination n'a pas d'image dédiée. */
      photo: dest.heroImage ?? (await getCoherentPhoto(`${dest.name} ${dest.country} coastline sailing`, dest.imageSeed, "800/600")),
      heroPhoto: dest.heroImage ?? (await getCoherentPhoto(`${dest.name} ${dest.country} aerial coastline`, dest.heroSeed, "1600/800")),
    }))
  );

  return (
    <>
      <section className="dest-hero fade-in">
        <div className="dest-hero-bg">
          {/* Vidéo de fond : vue aérienne d'une côte méditerranéenne, en accord
              avec une app de location de bateaux. muted + playsInline pour un
              autoplay fiable ; poster = image côtière affichée avant le chargement. */}
          <video
            className="dest-hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/destinations/corse/pexels-slimmars-13-197677686-38525042.jpg"
          >
            <source src="/videos/azur.mp4" type="video/mp4" />
          </video>
          <div className="dest-hero-overlay" />
        </div>
        <div className="container dest-hero-content">
          <p className="hero-eyebrow">{t.heroEyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p className="dest-hero-sub">{t.heroSub}</p>
          <DestHeroStats
            stats={[
              { target: destinations.length, label: t.statDestinations },
              { target: destinations.reduce((sum, d) => sum + d.boatCount, 0), suffix: "+", label: t.statBoats },
              { target: new Set(destinations.map((d) => d.country)).size, label: t.statCountries },
            ]}
          />
        </div>
        <a href="#dest-featured" className="dest-detail-hero-scroll" aria-label={t.scrollDown}>
          <i className="fa-solid fa-chevron-down" aria-hidden="true" />
        </a>
      </section>

      <section className="dest-featured-section" id="dest-featured">
        <div className="container">
          <HeroCarousel destinations={destinations} />
        </div>
      </section>

      <section className="section dest-grid-section">
        <div className="container">
          {/* Panneau inséré : mêmes marges latérales et mêmes coins arrondis
              que la carte du carrousel de la section précédente. Le fond porte
              le panneau (boîte de contenu du container), pas la section entière
              qui allait bord à bord. */}
          <div className="dest-grid-panel">
          <div className="section-hd fade-in">
            <h2>{fill(t.gridTitle, { count: destinations.length })}</h2>
          </div>
          <div className="destinations-page-grid">
            {destinations.map((dest, i) => {
              const direction = i === 0 ? "reveal-left" : i <= 2 ? "reveal-right" : "reveal-up";
              return (
              <Link
                key={dest.slug}
                href={`/destinations/${dest.slug}`}
                className={`dest-page-card reveal ${direction}${i === 0 ? " dest-page-card-large" : ""}`}
                style={{ transitionDelay: `${(i % 3) * 180}ms` }}
              >
                <div className="dest-page-card-img">
                  <Image
                    src={dest.photo}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="dest-page-card-overlay" />
                </div>
                <span className="dest-page-card-price">{fill(t.cardPriceFrom, { price: dest.priceFrom })}</span>
                <div className="dest-page-card-content">
                  <div className="dest-page-card-country">
                    {dest.country} <span className="dest-page-card-flag">{dest.flag}</span>
                  </div>
                  <h3>{dest.name}</h3>
                  <p>{dest.tagline}</p>
                  <div className="dest-page-card-footer">
                    <span><i className="fa-solid fa-sailboat" /> {dest.boatCount} {t.cardBoats}</span>
                  </div>
                </div>
                <span className="dest-page-card-arrow" aria-hidden="true">
                  <i className="fa-solid fa-arrow-right" />
                </span>
              </Link>
              );
            })}
          </div>
          </div>
        </div>
      </section>

      <section className="section dest-cta-section">
        <div className="container">
          <div className="dest-cta-box fade-in">
            <div>
              <h2>{t.ctaTitle}</h2>
              <p>{t.ctaText}</p>
            </div>
            <div className="dest-cta-btns">
              <Link href="/bateaux" className="btn btn-primary">{t.ctaExplore}</Link>
              <a href="mailto:contact@sailingloc.com" className="btn btn-outline btn-outline-white">{t.ctaContact}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

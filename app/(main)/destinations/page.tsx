import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDestinationsWithLiveBoatCounts } from "@/entities/destination";
import { getCoherentPhoto } from "@/shared/lib/pexels";
import HeroCarousel from "./HeroCarousel";
import "./destinations.css";

export const metadata: Metadata = {
  title: "Destinations de voile — SailingLoc",
  description: "Explorez les plus belles destinations nautiques en Méditerranée et en Atlantique pour votre prochain voyage en bateau.",
};

export default async function DestinationsPage() {
  const liveDestinations = await getDestinationsWithLiveBoatCounts();
  const destinations = await Promise.all(
    liveDestinations.map(async (dest) => ({
      ...dest,
      photo: await getCoherentPhoto(`${dest.name} ${dest.country} coastline sailing`, dest.imageSeed, "800/600"),
      heroPhoto: dest.heroImage ?? (await getCoherentPhoto(`${dest.name} ${dest.country} aerial coastline`, dest.heroSeed, "1600/800")),
    }))
  );

  return (
    <>
      <section className="dest-hero fade-in">
        <div className="dest-hero-bg">
          <Image src="https://picsum.photos/seed/destinations-hero/1600/600" alt="" fill sizes="100vw" style={{ objectFit: "cover" }} priority />
          <div className="dest-hero-overlay" />
        </div>
        <div className="container dest-hero-content">
          <p className="hero-eyebrow">Nos destinations</p>
          <h1>Naviguez vers l'extraordinaire</h1>
          <p className="dest-hero-sub">Découvrez les plus belles eaux de Méditerranée et d'Atlantique, sélectionnées par nos experts nautiques.</p>
          <div className="dest-hero-stats">
            <div className="dest-hero-stat">
              <strong>{destinations.length}</strong>
              <span>destinations</span>
            </div>
            <div className="dest-hero-stat-divider" />
            <div className="dest-hero-stat">
              <strong>{destinations.reduce((sum, d) => sum + d.boatCount, 0)}+</strong>
              <span>bateaux</span>
            </div>
            <div className="dest-hero-stat-divider" />
            <div className="dest-hero-stat">
              <strong>{new Set(destinations.map((d) => d.country)).size}</strong>
              <span>pays</span>
            </div>
          </div>
        </div>
        <div className="dest-detail-hero-scroll" aria-hidden="true">
          <i className="fa-solid fa-chevron-down" />
        </div>
      </section>

      <section className="dest-featured-section">
        <div className="container">
          <HeroCarousel destinations={destinations} />
        </div>
      </section>

      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="section-hd fade-in">
            <h2>{destinations.length} destinations d'exception</h2>
            <p>Des criques sauvages de Corse aux caps sauvages de Bretagne</p>
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
                <span className="dest-page-card-price">Dès {dest.priceFrom} € / j</span>
                <div className="dest-page-card-content">
                  <div className="dest-page-card-country">
                    <span className="dest-page-card-flag">{dest.flag}</span> {dest.country}
                  </div>
                  <h3>{dest.name}</h3>
                  <p>{dest.tagline}</p>
                  <div className="dest-page-card-footer">
                    <span><i className="fa-solid fa-sailboat" /> {dest.boatCount} bateaux</span>
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
      </section>

      <section className="section dest-cta-section">
        <div className="container">
          <div className="dest-cta-box fade-in">
            <div>
              <h2>Votre destination n'est pas listée ?</h2>
              <p>Nous élargissons continuellement notre catalogue. Contactez-nous pour des destinations sur mesure.</p>
            </div>
            <div className="dest-cta-btns">
              <Link href="/bateaux" className="btn btn-primary">Explorer tous les bateaux</Link>
              <a href="mailto:contact@sailingloc.com" className="btn btn-outline btn-outline-white">Nous contacter</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

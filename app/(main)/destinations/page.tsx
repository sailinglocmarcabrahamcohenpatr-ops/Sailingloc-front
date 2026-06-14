import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDestinations } from "@/entities/destination";

export const metadata: Metadata = {
  title: "Destinations de voile — SailingLoc",
  description: "Explorez les plus belles destinations nautiques en Méditerranée et en Atlantique pour votre prochain voyage en bateau.",
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();

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
        </div>
      </section>

      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="section-hd fade-in">
            <h2>{destinations.length} destinations d'exception</h2>
            <p>Des criques sauvages de Corse aux îles dorées des Cyclades</p>
          </div>
          <div className="destinations-page-grid">
            {destinations.map((dest, i) => (
              <Link key={dest.slug} href={`/destinations/${dest.slug}`} className={`dest-page-card fade-in${i === 0 ? " dest-page-card-large" : ""}`}>
                <div className="dest-page-card-img">
                  <Image
                    src={`https://picsum.photos/seed/${dest.imageSeed}/800/600`}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="dest-page-card-overlay" />
                </div>
                <div className="dest-page-card-content">
                  <div className="dest-page-card-country">{dest.flag} {dest.country}</div>
                  <h3>{dest.name}</h3>
                  <p>{dest.tagline}</p>
                  <div className="dest-page-card-footer">
                    <span><i className="fa-solid fa-sailboat" /> {dest.boatCount} bateaux</span>
                    <span>À partir de {dest.priceFrom} € / j</span>
                  </div>
                </div>
              </Link>
            ))}
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

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestinations, getDestinationBySlug } from "@/entities/destination";
import { formatPrice } from "@/shared/lib/utils";
import { getCoherentPhoto } from "@/shared/lib/pexels";
import { getDestinationBoats, groupBoatsByPort } from "./ports-data";
import DestinationMapSection from "./DestinationMapSection";
import "./destination-detail.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const destinations = await getDestinations();
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) return { title: "Destination introuvable" };
  return {
    title: `${dest.name} — Location de bateau | SailingLoc`,
    description: dest.description,
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) notFound();

  const destBoats = await getDestinationBoats(dest);
  const rawPorts = groupBoatsByPort(destBoats);
  const ports = await Promise.all(
    rawPorts.map(async (port) => ({
      ...port,
      photo: await getCoherentPhoto(`${port.ville} marina port boats`, port.imageSeed, "500/380"),
    }))
  );

  const galleryPhotos =
    dest.galleryImages ??
    (await Promise.all(
      dest.highlights
        .slice(0, 4)
        .map((h, i) => getCoherentPhoto(h.title, dest.gallerySeeds[i] ?? `${dest.slug}-${i}`))
    ));

  return (
    <>
      <section className="dest-detail-hero">
        {dest.slug === "cote-azur" ? (
          <video
            className="hero-video"
            src="/videos/azur.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <Image
            src={dest.heroImage ?? `https://picsum.photos/seed/${dest.heroSeed}/1600/700`}
            alt={dest.name}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
        )}
        <div className="dest-detail-hero-overlay" />
        <div className="container dest-detail-hero-content">
          <div className="dest-detail-breadcrumb">
            <Link href="/destinations">Destinations</Link> / <span>{dest.name}</span>
          </div>
          <div className="dest-detail-flag" aria-hidden="true"><span className="dest-flag-code">{dest.flag} {dest.country}</span></div>
          <h1>{dest.name}</h1>
          <p className="dest-detail-tagline">{dest.tagline}</p>
          <div className="dest-detail-hero-meta">
            <span><i className="fa-solid fa-sailboat" /> {destBoats.length} bateaux disponibles</span>
            <span><i className="fa-solid fa-euro-sign" /> À partir de {dest.priceFrom} € / jour</span>
            <span><i className="fa-solid fa-location-dot" /> {dest.region}</span>
          </div>
        </div>
        <div className="dest-detail-hero-scroll" aria-hidden="true">
          <i className="fa-solid fa-chevron-down" />
        </div>
      </section>

      <section className="section">
        <div className="container dest-detail-layout">
          <div className="dest-detail-main">
            <div className="dest-detail-section fade-in">
              <h2>À propos de {dest.name}</h2>
              <p className="dest-detail-desc">{dest.description}</p>
              <div className="dest-tags">
                {dest.tags.map((tag) => <span key={tag} className="dest-tag">{tag}</span>)}
              </div>
            </div>

            <div className="dest-detail-section fade-in">
              <h2>Points forts de la destination</h2>
              <div className="dest-highlights-grid">
                {dest.highlights.map((h, i) => (
                  <div key={h.title} className="dest-highlight-card">
                    {h.image && (
                      <div className="dest-highlight-card-img">
                        <Image
                          src={h.image}
                          alt={h.title}
                          fill
                          sizes="(max-width: 600px) 100vw, 50vw"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="dest-highlight-card-overlay" />
                      </div>
                    )}
                    <span className="dest-highlight-num">{String(i + 1).padStart(2, "0")}</span>
                    <div className="dest-highlight-icon"><i className={`fa-solid ${h.icon}`} aria-hidden="true" /></div>
                    <h4>{h.title}</h4>
                    <p>{h.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {ports.length > 0 && (
              <div className="dest-detail-section fade-in">
                <h2>Ports de {dest.name}</h2>
                <p className="dest-ports-intro">Choisissez un port pour découvrir les bateaux disponibles sur place.</p>
                <div className="dest-ports-grid">
                  {ports.map((port) => {
                    const isCheapest = ports.length > 1 && port.priceFrom === Math.min(...ports.map((p) => p.priceFrom));
                    return (
                      <Link
                        key={port.id}
                        href={`/destinations/${dest.slug}/ports/${port.id}`}
                        className="dest-port-card"
                      >
                        <div className="dest-port-card-img">
                          <Image
                            src={port.photo}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 25vw"
                            style={{ objectFit: "cover" }}
                          />
                          <div className="dest-port-card-overlay" />
                        </div>
                        <span className="dest-port-card-tag">
                          <i className="fa-solid fa-anchor" aria-hidden="true" /> Port
                        </span>
                        {isCheapest && <span className="dest-port-card-ribbon">Meilleur prix</span>}
                        <div className="dest-port-card-content">
                          <h3>{port.name}</h3>
                          <p className="dest-port-card-ville"><i className="fa-solid fa-location-dot" aria-hidden="true" /> {port.ville}</p>
                          <div className="dest-port-card-footer">
                            <span><i className="fa-solid fa-sailboat" aria-hidden="true" /> {port.boats.length} bateau{port.boats.length > 1 ? "x" : ""}</span>
                            <span className="dest-port-card-price">Dès {formatPrice(port.priceFrom)}</span>
                          </div>
                        </div>
                        <span className="dest-port-card-arrow" aria-hidden="true">
                          <i className="fa-solid fa-arrow-right" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="dest-detail-section fade-in">
              <DestinationMapSection
                slug={dest.slug}
                name={dest.name}
                center={dest.center}
                boatCount={destBoats.length}
                priceFrom={dest.priceFrom}
                boats={destBoats}
              />
            </div>

            <div className="dest-detail-section fade-in">
              <h2>Galerie photos</h2>
              <div className="dest-gallery">
                {galleryPhotos.map((src, i) => (
                  <div key={src} className={`dest-gallery-item${i === 0 ? " dest-gallery-main" : ""}`}>
                    <Image
                      src={src}
                      alt={`${dest.name} — photo ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="dest-detail-aside">
            <div className="dest-aside-card fade-in">
              <h3>Météo & Navigation</h3>
              <div className="dest-weather">
                <div className="dest-weather-item">
                  <i className="fa-solid fa-thermometer-half" />
                  <div><strong>{dest.avgTemp}</strong><span>Température moy.</span></div>
                </div>
                <div className="dest-weather-item">
                  <i className="fa-solid fa-wind" />
                  <div><strong>{dest.avgWind}</strong><span>Vent moyen</span></div>
                </div>
                <div className="dest-weather-item">
                  <i className="fa-solid fa-calendar-days" />
                  <div><strong>{dest.bestPeriod}</strong><span>Meilleure période</span></div>
                </div>
              </div>
            </div>

            <div className="dest-aside-card fade-in">
              <h3>Réserver un bateau</h3>
              <p>Trouvez le bateau idéal pour découvrir {dest.name}.</p>
              <div className="dest-aside-price">
                <span>À partir de</span>
                <strong>{dest.priceFrom} €</strong>
                <span>/ jour</span>
              </div>
              <Link
                href={`/bateaux?destination=${encodeURIComponent(dest.name)}`}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", display: "flex" }}
              >
                <i className="fa-solid fa-magnifying-glass" /> Voir les bateaux
              </Link>
            </div>

            <div className="dest-aside-card fade-in">
              <h3>Infos pratiques</h3>
              <ul className="dest-practical-list">
                <li><i className="fa-solid fa-language" /> Langue : {dest.country === "France" ? "Français" : dest.country === "Grèce" ? "Grec / Anglais" : dest.country === "Espagne" ? "Espagnol" : dest.country === "Croatie" ? "Croate / Anglais" : "Local"}</li>
                <li><i className="fa-solid fa-money-bill-wave" /> Monnaie : {dest.country === "Croatie" ? "Euro (€) depuis 2023" : "Euro (€)"}</li>
                <li><i className="fa-solid fa-id-card" /> Documents : CNI ou Passeport UE</li>
                <li><i className="fa-solid fa-anchor" /> Permis : {dest.country === "France" ? "Permis côtier recommandé" : "Permis hauturier selon zones"}</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

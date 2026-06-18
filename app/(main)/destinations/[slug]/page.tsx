import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestinations, getDestinationBySlug } from "@/entities/destination";

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

  return (
    <>
      <section className="dest-detail-hero">
        <Image
          src={`https://picsum.photos/seed/${dest.heroSeed}/1600/700`}
          alt={dest.name}
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="dest-detail-hero-overlay" />
        <div className="container dest-detail-hero-content">
          <div className="dest-detail-breadcrumb">
            <Link href="/destinations">Destinations</Link> / <span>{dest.name}</span>
          </div>
          <div className="dest-detail-flag" aria-hidden="true"><span className="dest-flag-code">{dest.flag}</span></div>
          <h1>{dest.name}</h1>
          <p className="dest-detail-tagline">{dest.tagline}</p>
          <div className="dest-detail-hero-meta">
            <span><i className="fa-solid fa-sailboat" /> {dest.boatCount} bateaux disponibles</span>
            <span><i className="fa-solid fa-euro-sign" /> À partir de {dest.priceFrom} € / jour</span>
            <span><i className="fa-solid fa-location-dot" /> {dest.region}</span>
          </div>
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
                {dest.highlights.map((h) => (
                  <div key={h.title} className="dest-highlight-card">
                    <div className="dest-highlight-icon">{h.icon}</div>
                    <h4>{h.title}</h4>
                    <p>{h.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="dest-detail-section fade-in">
              <h2>Activités nautiques</h2>
              <div className="dest-activities-grid">
                {dest.activities.map((a) => (
                  <div key={a} className="dest-activity-chip">
                    <i className="fa-solid fa-circle-check" style={{ color: "var(--primary)" }} /> {a}
                  </div>
                ))}
              </div>
            </div>

            <div className="dest-detail-section fade-in">
              <h2>Galerie photos</h2>
              <div className="dest-gallery">
                {dest.gallerySeeds.map((seed, i) => (
                  <div key={seed} className={`dest-gallery-item${i === 0 ? " dest-gallery-main" : ""}`}>
                    <Image
                      src={`https://picsum.photos/seed/${seed}/800/600`}
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

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestinations, getDestinationBySlug } from "@/entities/destination";
import type { FullDestination } from "@/entities/destination";
import { getBoats, type Boat } from "@/entities/boat";
import { boatsApi, type BoatAPI } from "@/shared/lib/boats-api";
import { matchesDestination as matchesDestinationApi, locationMatchesDestination } from "@/shared/lib/destination-match";
import type { DestinationBoatMarker } from "./DestinationMap";
import DestinationMapSection from "./DestinationMapSection";

/** Décalage déterministe (basé sur l'id) pour disperser lisiblement les bateaux sans port géolocalisé. */
function jitter(seed: number, base: number, spread: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  const frac = x - Math.floor(x);
  return base + (frac - 0.5) * spread;
}

/** L'API renvoie parfois les nombres en string (comme `prixJour`) : on normalise défensivement. */
function toNumber(v: number | string | undefined): number | undefined {
  if (v == null) return undefined;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : undefined;
}

function adaptApiBoat(b: BoatAPI, dest: FullDestination): DestinationBoatMarker | null {
  if (!matchesDestinationApi(b.port, dest)) return null;

  const lat = toNumber(b.port?.latitude) ?? jitter(b.id, dest.center.lat, 0.05);
  const lng = toNumber(b.port?.longitude) ?? jitter(b.id * 7 + 3, dest.center.lng, 0.08);

  return {
    id: String(b.id),
    name: b.nomBateau,
    location: b.port?.ville || dest.name,
    lat,
    lng,
    pricePerDay: typeof b.prixJour === "string" ? parseFloat(b.prixJour) : (b.prixJour ?? 0),
  };
}

async function getDestinationBoats(dest: FullDestination): Promise<DestinationBoatMarker[]> {
  try {
    const apiBoats = await boatsApi.getAll();
    return apiBoats
      .map((b) => adaptApiBoat(b, dest))
      .filter((b): b is DestinationBoatMarker => b !== null);
  } catch {
    const mockBoats = await getBoats();
    return mockBoats
      .filter((b): b is Boat & { coordinates: { lat: number; lng: number } } => !!b.coordinates && locationMatchesDestination(b.location, dest))
      .map((b) => ({
        id: b.id,
        name: b.name,
        location: b.location,
        lat: b.coordinates.lat,
        lng: b.coordinates.lng,
        pricePerDay: b.pricePerDay,
      }));
  }
}

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
            <span><i className="fa-solid fa-sailboat" /> {dest.boatCount} bateaux disponibles</span>
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
              <DestinationMapSection
                slug={dest.slug}
                name={dest.name}
                center={dest.center}
                boatCount={dest.boatCount}
                priceFrom={dest.priceFrom}
                boats={destBoats}
              />
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
                {(dest.galleryImages ?? dest.gallerySeeds.map((seed) => `https://picsum.photos/seed/${seed}/800/600`)).map((src, i) => (
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

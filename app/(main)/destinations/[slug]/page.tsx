import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDestinations, getDestinationBySlug } from "@/entities/destination";
import { formatPrice } from "@/shared/lib/utils";
import { getCoherentPhoto } from "@/shared/lib/pexels";
import { LocaleLink as Link } from "@/shared/i18n";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import { getDestinationBoats, groupBoatsByPort } from "./ports-data";
import DestinationMapSection from "./DestinationMapSection";
import DestinationHighlights, { type PlacePhoto } from "./DestinationHighlights";
import "./destination-detail.css";

/** Remplace les {placeholders} d'un gabarit par leurs valeurs. */
function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
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
  const t = getDictionary(await getRequestLocale()).destinationDetail;
  const dest = await getDestinationBySlug(slug);
  if (!dest) return { title: t.metaNotFound };
  return {
    title: fill(t.metaTitle, { name: dest.name }),
    description: dest.description,
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const t = getDictionary(await getRequestLocale()).destinationDetail;
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

  // Pool de vraies photos du lieu pour la lightbox : images des points forts
  // (légendées par leur titre) puis photos de galerie, sans doublon.
  const placePhotos: PlacePhoto[] = [];
  const seenPhotos = new Set<string>();
  for (const h of dest.highlights) {
    if (h.image && !seenPhotos.has(h.image)) {
      seenPhotos.add(h.image);
      placePhotos.push({ src: h.image, caption: h.title });
    }
  }
  for (const src of galleryPhotos) {
    if (!seenPhotos.has(src)) {
      seenPhotos.add(src);
      placePhotos.push({ src, caption: dest.name });
    }
  }

  return (
    <>
      <section className="dest-detail-hero">
        <Image
          src={dest.heroImage ?? `https://picsum.photos/seed/${dest.heroSeed}/1600/700`}
          alt={dest.name}
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="dest-detail-hero-overlay" />
        <div className="container dest-detail-hero-content">
          <div className="dest-detail-breadcrumb">
            <Link href="/destinations">{t.breadcrumb}</Link> / <span>{dest.name}</span>
          </div>
          <div className="dest-detail-flag" aria-hidden="true"><span className="dest-flag-code">{dest.flag} {dest.country}</span></div>
          <h1>{dest.name}</h1>
          <p className="dest-detail-tagline">{dest.tagline}</p>
          <div className="dest-detail-hero-meta">
            <span><i className="fa-solid fa-sailboat" /> {fill(t.heroBoatsAvailable, { count: destBoats.length })}</span>
            <span><i className="fa-solid fa-euro-sign" /> {fill(t.heroPriceFrom, { price: dest.priceFrom })}</span>
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
              <h2>{fill(t.aboutTitle, { name: dest.name })}</h2>
              <p className="dest-detail-desc">{dest.description}</p>
              <div className="dest-tags">
                {dest.tags.map((tag) => <span key={tag} className="dest-tag">{tag}</span>)}
              </div>
            </div>

            <div className="dest-detail-section fade-in">
              <h2>{t.highlightsTitle}</h2>
              <DestinationHighlights
                highlights={dest.highlights}
                photos={placePhotos}
                destName={dest.name}
              />
            </div>

            {ports.length > 0 && (
              <div className="dest-detail-section fade-in">
                <h2>{fill(t.portsTitle, { name: dest.name })}</h2>
                <p className="dest-ports-intro">{t.portsIntro}</p>
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
                          <i className="fa-solid fa-anchor" aria-hidden="true" /> {t.portTag}
                        </span>
                        {isCheapest && <span className="dest-port-card-ribbon">{t.portBestPrice}</span>}
                        <div className="dest-port-card-content">
                          <h3>{port.name}</h3>
                          <p className="dest-port-card-ville"><i className="fa-solid fa-location-dot" aria-hidden="true" /> {port.ville}</p>
                          <div className="dest-port-card-footer">
                            <span><i className="fa-solid fa-sailboat" aria-hidden="true" /> {fill(port.boats.length > 1 ? t.portBoatsMany : t.portBoatsOne, { count: port.boats.length })}</span>
                            <span className="dest-port-card-price">{fill(t.portPriceFrom, { price: formatPrice(port.priceFrom) })}</span>
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
              <h2>{t.galleryTitle}</h2>
              <div className="dest-gallery">
                {galleryPhotos.map((src, i) => (
                  <div key={src} className={`dest-gallery-item${i === 0 ? " dest-gallery-main" : ""}`}>
                    <Image
                      src={src}
                      alt={fill(t.galleryAlt, { name: dest.name, n: i + 1 })}
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
              <h3>{t.weatherTitle}</h3>
              <div className="dest-weather">
                <div className="dest-weather-item">
                  <i className="fa-solid fa-thermometer-half" />
                  <div><strong>{dest.avgTemp}</strong><span>{t.avgTemp}</span></div>
                </div>
                <div className="dest-weather-item">
                  <i className="fa-solid fa-wind" />
                  <div><strong>{dest.avgWind}</strong><span>{t.avgWind}</span></div>
                </div>
                <div className="dest-weather-item">
                  <i className="fa-solid fa-calendar-days" />
                  <div><strong>{dest.bestPeriod}</strong><span>{t.bestPeriod}</span></div>
                </div>
              </div>
            </div>

            <div className="dest-aside-card fade-in">
              <h3>{t.bookTitle}</h3>
              <p>{fill(t.bookText, { name: dest.name })}</p>
              <div className="dest-aside-price">
                <span>{t.bookPriceFrom}</span>
                <strong>{dest.priceFrom} €</strong>
                <span>{t.bookPerDay}</span>
              </div>
              <Link
                href={`/bateaux?destination=${encodeURIComponent(dest.name)}`}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", display: "flex" }}
              >
                <i className="fa-solid fa-magnifying-glass" /> {t.bookSeeBoats}
              </Link>
            </div>

            <div className="dest-aside-card fade-in">
              <h3>{t.practicalTitle}</h3>
              <ul className="dest-practical-list">
                <li><i className="fa-solid fa-language" /> {t.practicalLanguage} : {dest.country === "France" ? t.langFrench : dest.country === "Grèce" ? t.langGreekEnglish : dest.country === "Espagne" ? t.langSpanish : dest.country === "Croatie" ? t.langCroatianEnglish : t.langLocal}</li>
                <li><i className="fa-solid fa-money-bill-wave" /> {t.practicalCurrency} : {dest.country === "Croatie" ? t.currencyEuroCroatia : t.currencyEuro}</li>
                <li><i className="fa-solid fa-id-card" /> {t.practicalDocuments} : {t.practicalDocumentsValue}</li>
                <li><i className="fa-solid fa-anchor" /> {t.practicalLicense} : {dest.country === "France" ? t.licenseCoastal : t.licenseOffshore}</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

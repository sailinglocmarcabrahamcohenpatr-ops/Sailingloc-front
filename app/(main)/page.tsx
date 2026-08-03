import type { Metadata } from "next";
import { HeroSection } from "@/widgets/hero";
import { Testimonials } from "@/widgets/testimonials";
import { FavoriteBoatCard } from "@/features/toggle-favorite";
import Image from "next/image";
import { getDestinationsWithLiveBoatCounts } from "@/entities/destination";
import { DestinationsHome } from "@/widgets/destinations-home";
import { LocaleLink as Link } from "@/shared/i18n";
import { getRequestLocale, getDictionary } from "@/shared/i18n/get-dictionary";
import StatsCounters from "./StatsCounters";
import { getHomeStats } from "./getHomeStats";
import { getTestimonials } from "./getTestimonials";
import { getFeaturedBoats } from "./getFeaturedBoats";
import "./home-shell.css";
import "./home.css";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).home;
  return { title: t.metaTitle, description: t.metaDescription };
}

/* Seules les 3 premières catégories sont mises en avant sur l'accueil, en
   vignettes photo. Le lien « Voir tous les bateaux » donne accès au reste. */
/* imageQuery explicite avec le suffixe /all : sans lui LoremFlickr traite les
   mots-clés en OU et renvoyait des photos hors sujet (personnes, gros plans). */
const BOAT_CATEGORIES = [
  { type: "voilier" as const,   labelKey: "catSailboat" as const,  image: "/images/boats/categories/pexels-solce-35030759.jpg" },
  { type: "catamaran" as const, labelKey: "catCatamaran" as const, image: "/images/boats/categories/pexels-nikos-pentarakis-32509689.jpg" },
  { type: "moteur" as const,    labelKey: "catMotor" as const,     image: "/images/boats/categories/pexels-samfollsf-29237512.jpg" },
];

export default async function HomePage() {
  const [dict, destinations, homeStats, testimonials, featuredBoats] = await Promise.all([
    getRequestLocale().then(getDictionary),
    getDestinationsWithLiveBoatCounts(),
    getHomeStats(),
    getTestimonials(),
    getFeaturedBoats(),
  ]);
  const t = dict.home;

  const howItWorks = [
    { num: "01", icon: "fa-magnifying-glass", title: t.hiwStep1Title, desc: t.hiwStep1Desc },
    { num: "02", icon: "fa-calendar-check",   title: t.hiwStep2Title, desc: t.hiwStep2Desc },
    { num: "03", icon: "fa-sailboat",         title: t.hiwStep3Title, desc: t.hiwStep3Desc },
  ];

  const estimates = [
    { type: t.estimateSailboatType,  weeks: t.estimateSailboatWeeks,  revenue: "12 000 €" },
    { type: t.estimateCatamaranType, weeks: t.estimateCatamaranWeeks, revenue: "32 000 €" },
    { type: t.estimateMotorType,     weeks: t.estimateMotorWeeks,     revenue: "18 000 €" },
  ];

  return (
    <div className="home-shell">
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Stats ── */}
      <section className="stats-dark-section" aria-label={t.statsAria}>
        <div className="container">
          <StatsCounters stats={homeStats} />
        </div>
      </section>

      {/* ── Catégories ── */}
      <section className="home-section bg-surface" aria-labelledby="cat-title">
        <div className="container">
          <div className="home-section-hd fade-in">
            <div>
              <h2 id="cat-title">{t.categoriesTitle}</h2>
              <p>{t.categoriesSubtitle}</p>
            </div>
            <Link href="/bateaux" className="btn btn-outline">
              {t.seeAllBoats} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
          <div className="categories-grid fade-in">
            {BOAT_CATEGORIES.map((cat) => (
              <Link
                key={cat.type}
                href={`/bateaux?type=${cat.type}`}
                className="category-card"
              >
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
                <span className="category-card-veil" aria-hidden="true" />
                <strong className="category-card-label">{t[cat.labelKey]}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destinations populaires ── */}
      <section className="home-section" aria-labelledby="dest-title">
        <div className="container">
          <div className="home-section-hd">
            <div>
              <h2 id="dest-title">{t.destTitle}</h2>
              <p>{t.destSubtitle}</p>
            </div>
            <Link href="/destinations" className="btn btn-outline">
              {t.allDestinations} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
          <DestinationsHome destinations={destinations} />
        </div>
      </section>

      {/* ── Bateaux vedettes ── */}
      {featuredBoats.length > 0 && (
        <section className="home-section bg-surface" aria-labelledby="featured-title">
          <div className="container">
            <div className="home-section-hd fade-in">
              <div>
                <h2 id="featured-title">{t.featuredTitle}</h2>
                <p>{t.featuredSubtitle}</p>
              </div>
              <Link href="/bateaux" className="btn btn-outline">
                {t.seeAll} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
            </div>
            <div className="boats-grid fade-in">
              {featuredBoats.map((boat) => (
                <FavoriteBoatCard key={boat.id} boat={boat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Comment ça marche ── */}
      <section className="home-section home-hiw" aria-labelledby="hiw-title">
        <div className="container">
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <p className="home-eyebrow">{t.hiwEyebrow}</p>
              <h2 id="hiw-title">{t.hiwTitle}</h2>
              <p>{t.hiwSubtitle}</p>
            </div>
          </div>
          <div className="hiw-home-grid">
            {howItWorks.map((step, i) => (
              <div key={step.num} className="hiw-home-card fade-in">
                <div className="hiw-home-icon">
                  <i className={`fa-solid ${step.icon}`} aria-hidden="true" />
                </div>
                <div className="hiw-home-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < howItWorks.length - 1 && (
                  <div className="hiw-home-arrow" aria-hidden="true">→</div>
                )}
              </div>
            ))}
          </div>
          <div className="hiw-home-cta fade-in">
            <Link href="/bateaux" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              {t.hiwCtaFind}
            </Link>
            <Link href="/comment-ca-marche" className="btn btn-ghost">
              {t.hiwCtaMore} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Application mobile ── */}
      <section className="home-section app-teaser" aria-labelledby="app-title">
        <div className="container">
          <div className="app-teaser-grid">
            <div className="app-teaser-text fade-in">
              <p className="home-eyebrow">{t.appEyebrow}</p>
              <h2 id="app-title">{t.appTitle}</h2>
              <p className="app-teaser-lead">{t.appLead}</p>
              <ul className="app-teaser-features">
                <li><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> {t.appFeature1}</li>
                <li><i className="fa-solid fa-calendar-check" aria-hidden="true" /> {t.appFeature2}</li>
                <li><i className="fa-solid fa-bell" aria-hidden="true" /> {t.appFeature3}</li>
              </ul>
              <div className="app-teaser-stores">
                <div className="app-store-btn app-store-btn--dark">
                  <span className="app-store-btn-badge">{t.appComingSoon}</span>
                  <i className="fa-brands fa-apple" aria-hidden="true" />
                  <span className="app-store-btn-text"><small>{t.appStoreIosLabel}</small>{t.appStoreIos}</span>
                </div>
                <div className="app-store-btn app-store-btn--outline">
                  <span className="app-store-btn-badge">{t.appComingSoon}</span>
                  <i className="fa-brands fa-google-play" aria-hidden="true" />
                  <span className="app-store-btn-text"><small>{t.appStoreGoogleLabel}</small>{t.appStoreGoogle}</span>
                </div>
              </div>
              <div className="app-teaser-note">
                <div className="app-teaser-note-icon">
                  <i className="fa-solid fa-mobile-screen-button" aria-hidden="true" />
                </div>
                <div>
                  <strong>{t.appNoteTitle}</strong>
                  <p>{t.appNoteText}</p>
                  <Link href="/bateaux" className="app-teaser-note-link">
                    {t.appNoteLink} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="app-teaser-visual fade-in" aria-hidden="true">
              <div className="app-phone-shot">
                <Image
                  src="/images/tel-cutout.png"
                  alt=""
                  width={543}
                  height={737}
                  sizes="(max-width: 1024px) 260px, 300px"
                  priority={false}
                />
              </div>
              <span className="app-teaser-badge">{t.appComingSoon}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Avis clients ── */}
      <Testimonials testimonials={testimonials} />

      {/* ── Owner CTA ── */}
      <section className="owner-cta-home" aria-labelledby="owner-cta-title">
        <div className="container">
          <div className="owner-cta-home-inner">
            <div className="owner-cta-home-text fade-in">
              <p className="home-eyebrow home-eyebrow--gold">{t.ownerEyebrow}</p>
              <h2 id="owner-cta-title">{t.ownerTitleBefore} <span>{t.ownerTitleAmount}</span> {t.ownerTitleAfter}</h2>
              <p>{t.ownerDesc}</p>
              <ul className="owner-cta-home-list">
                <li><i className="fa-solid fa-check" aria-hidden="true" /> {t.ownerBenefit1}</li>
                <li><i className="fa-solid fa-check" aria-hidden="true" /> {t.ownerBenefit2}</li>
                <li><i className="fa-solid fa-check" aria-hidden="true" /> {t.ownerBenefit3}</li>
                <li><i className="fa-solid fa-check" aria-hidden="true" /> {t.ownerBenefit4}</li>
              </ul>
              <div className="owner-cta-home-actions">
                <Link href="/proprietaire" className="btn btn-white btn-lg">
                  <i className="fa-solid fa-sailboat" aria-hidden="true" />
                  {t.ownerCtaBecome}
                </Link>
                <Link href="/comment-ca-marche#proprietaires" className="btn btn-ghost-white">
                  {t.ownerCtaHow} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="owner-cta-home-visual fade-in">
              <div className="owner-cta-home-card">
                <div className="owner-cta-home-card-header">
                  <i className="fa-solid fa-euro-sign" aria-hidden="true" />
                  <strong>{t.estimatorTitle}</strong>
                </div>
                {estimates.map((e) => (
                  <div key={e.type} className="owner-cta-estimate">
                    <div>
                      <strong>{e.type}</strong>
                      <span>{e.weeks}</span>
                    </div>
                    <div className="owner-cta-estimate-rev">{e.revenue} {t.perYear}</div>
                  </div>
                ))}
                <Link href="/proprietaire" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  {t.estimatorCta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEO text ── */}
      <section className="seo-section">
        <div className="container">
          <div className="seo-content fade-in">
            <h2>{t.seoTitle}</h2>
            <p>{t.seoText}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

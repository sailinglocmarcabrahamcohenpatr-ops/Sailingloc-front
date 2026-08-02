import type { Metadata } from "next";
import Image from "next/image";
import "./comment-ca-marche.css";
import { LocaleLink as Link } from "@/shared/i18n";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import OwnerCtaLink from "./OwnerCtaLink";
import OwnerDashboardButton from "./OwnerDashboardButton";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).howItWorksPage;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function HowItWorksPage() {
  const t = getDictionary(await getRequestLocale()).howItWorksPage;

  return (
    <div className="hiw-page">
      {/* ── Hero photo ── */}
      <section className="hiw-page-hero full-bleed">
        <div className="hiw-page-hero-bg">
          <Image
            src="/images/destinations/corse/pexels-slimmars-13-197677686-38525042.jpg"
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="hiw-page-hero-overlay" />
        </div>
        <div className="container hiw-page-hero-content">
          <p className="hero-eyebrow">{t.heroEyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p className="hiw-page-hero-sub">{t.heroSub}</p>
          <div className="hiw-page-hero-actions">
            <Link href="/bateaux" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> {t.heroSearch}
            </Link>
            <OwnerDashboardButton />
          </div>
        </div>
      </section>

      {/* ── Étapes locataire ── */}
      <section className="home-section" id="locataires">
        <div className="container">
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <span className="section-badge">{t.renterBadge}</span>
              <h2>{t.renterTitle}</h2>
              <p>{t.renterSub}</p>
            </div>
          </div>
          <div className="hiw-page-steps">
            {t.renterSteps.map((step, i) => (
              <div key={i} className="hiw-page-step reveal reveal-up">
                <div className="hiw-page-step-left">
                  <div className="hiw-page-step-num">{String(i + 1).padStart(2, "0")}</div>
                  <div className="hiw-page-step-icon">
                    <i className={`fa-solid ${["fa-magnifying-glass","fa-envelope","fa-lock","fa-sailboat"][i]}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="hiw-page-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  <ul className="hiw-page-step-bullets">
                    {step.bullets.map((b) => (
                      <li key={b}>
                        <i className="fa-solid fa-check" aria-hidden="true" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="hiw-home-cta fade-in">
            <Link href="/bateaux" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-magnifying-glass" /> {t.renterCta}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Garanties ── */}
      <section className="home-section bg-surface">
        <div className="container">
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <h2>{t.guaranteesTitle}</h2>
              <p>{t.guaranteesSub}</p>
            </div>
          </div>
          <div className="hiw-guarantees-grid fade-in">
            {t.guarantees.map((g, i) => (
              <div key={i} className="hiw-guarantee-card">
                <div className="hiw-guarantee-icon">
                  <i className={`fa-solid ${["fa-shield-halved","fa-file-contract","fa-headset","fa-rotate-left","fa-star","fa-id-card"][i]}`} aria-hidden="true" />
                </div>
                <h4>{g.title}</h4>
                <p>{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section propriétaires ── */}
      <section className="home-section hiw-owner-bg" id="proprietaires">
        <div className="container">
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <span className="section-badge section-badge--gold">{t.ownerBadge}</span>
              <h2 style={{ color: "var(--white)" }}>{t.ownerTitle}</h2>
              <p style={{ color: "rgba(255,255,255,.7)" }}>{t.ownerSub}</p>
            </div>
          </div>
          <div className="prop-steps-mini fade-in">
            {t.ownerSteps.map((step, i) => (
              <div key={i} className="prop-step-mini">
                <div className="prop-step-mini-icon"><i className={`fa-solid ${["fa-wand-magic-sparkles","fa-envelope-open-text","fa-circle-check","fa-piggy-bank"][i]}`} aria-hidden="true" /></div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="hiw-home-cta fade-in">
            <OwnerCtaLink />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="home-section">
        <div className="container" style={{ maxWidth: "760px" }}>
          <div className="home-section-hd home-section-hd--center fade-in">
            <div><h2>{t.faqTitle}</h2></div>
          </div>
          <div className="prop-faq fade-in">
            {t.faqs.map((faq) => (
              <details key={faq.q} className="prop-faq-item">
                <summary>{faq.q}</summary>
                <div className="prop-faq-answer">{faq.r}</div>
              </details>
            ))}
          </div>
          <p className="hiw-faq-more fade-in">
            {t.faqMore}{" "}
            <a href="mailto:contact@sailingloc.com">{t.faqMoreLink}</a>
          </p>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { LocaleLink as Link } from "@/shared/i18n";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import { LoginForm } from "@/features/auth";
import "./proprietaire.css";

const BENEFIT_STYLES = [
  { icon: "fa-euro-sign",    color: "#10B981", bg: "#D1FAE5" },
  { icon: "fa-shield-halved", color: "#114B6B", bg: "#EAF0F4" },
  { icon: "fa-sliders",      color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: "fa-headset",      color: "#F59E0B", bg: "#FEF3C7" },
];

const STEP_ICONS = ["fa-camera", "fa-bell", "fa-handshake", "fa-piggy-bank"];

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).ownerPage;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function ProprietairePage() {
  const t = getDictionary(await getRequestLocale()).ownerPage;

  return (
    <>
      {/* ── Hero ── */}
      <section className="prop-hero">
        <div className="prop-hero-bg">
          <Image
            src="https://picsum.photos/seed/boat-owner-port/1920/900"
            alt={t.heroAlt}
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center 40%" }}
            priority
          />
          <div className="prop-hero-overlay" />
        </div>
        <div className="container prop-hero-content">
          <div className="prop-hero-badge">
            <i className="fa-solid fa-star" /> {t.heroBadge}
          </div>
          <h1>
            {t.heroTitle}<br />
            <span className="prop-hero-accent">{t.heroTitleAccent}</span>
          </h1>
          <p>
            {t.heroDesc1}<strong>{t.heroDescStrong}</strong>{t.heroDesc2}
          </p>
          <div className="prop-hero-actions">
            <Link href="/inscrire-bateau" className="btn btn-white btn-xl">
              <i className="fa-solid fa-plus" /> {t.heroCta1}
            </Link>
            <a href="#comment-ca-marche" className="btn btn-ghost-white btn-lg">
              {t.heroCta2} <i className="fa-solid fa-chevron-down" />
            </a>
          </div>
          <div className="prop-hero-stats">
            {t.heroStats.map((s) => (
              <div key={s.label}><strong>{s.val}</strong><span>{s.label}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Avantages ── */}
      <section className="home-section bg-surface">
        <div className="container">
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <p className="home-eyebrow">{t.benefitsEyebrow}</p>
              <h2>{t.benefitsTitle}</h2>
              <p>{t.benefitsSub}</p>
            </div>
          </div>
          <div className="prop-benefits-grid">
            {t.benefits.map((b, i) => (
              <div key={i} className="prop-benefit-card fade-in">
                <div className="prop-benefit-icon" style={{ background: BENEFIT_STYLES[i].bg, color: BENEFIT_STYLES[i].color }}>
                  <i className={`fa-solid ${BENEFIT_STYLES[i].icon}`} aria-hidden="true" />
                </div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="home-section" id="comment-ca-marche">
        <div className="container">
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <p className="home-eyebrow">{t.stepsEyebrow}</p>
              <h2>{t.stepsTitle}</h2>
              <p>{t.stepsSub}</p>
            </div>
          </div>
          <div className="prop-steps">
            {t.steps.map((step, i) => (
              <div key={i} className="prop-step fade-in">
                <div className="prop-step-num">{i + 1}</div>
                {i < t.steps.length - 1 && <div className="prop-step-line" aria-hidden="true" />}
                <div className="prop-step-icon">
                  <i className={`fa-solid ${STEP_ICONS[i]}`} aria-hidden="true" />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <div className="prop-step-detail"><i className="fa-solid fa-check" aria-hidden="true" /> {step.detail}</div>
              </div>
            ))}
          </div>
          <div className="hiw-home-cta fade-in">
            <Link href="/inscrire-bateau" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-rocket" /> {t.stepsCta}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section className="home-section bg-surface">
        <div className="container">
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <p className="home-eyebrow">{t.testiEyebrow}</p>
              <h2>{t.testiTitle}</h2>
            </div>
          </div>
          <div className="prop-testimonials fade-in">
            {t.testimonials.map((testi) => (
              <div key={testi.name} className="prop-testi-card">
                <div className="prop-testi-stars" aria-label={t.testiStarsAria}>
                  {[1,2,3,4,5].map((i) => <i key={i} className="fa-solid fa-star" aria-hidden="true" />)}
                </div>
                <p className="prop-testi-quote">&ldquo;{testi.quote}&rdquo;</p>
                <div className="prop-testi-footer">
                  <div className="prop-testi-avatar">{testi.initial}</div>
                  <div>
                    <strong>{testi.name}</strong>
                    <span>{testi.boat} · {testi.location}</span>
                    <div className="prop-testi-revenue">{testi.revenue}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="home-section">
        <div className="container" style={{ maxWidth: "760px" }}>
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <h2>{t.faqTitle}</h2>
              <p>{t.faqSub}</p>
            </div>
          </div>
          <div className="prop-faq fade-in">
            {t.faqs.map((faq) => (
              <details key={faq.q} className="prop-faq-item">
                <summary>{faq.q}</summary>
                <div className="prop-faq-answer">{faq.r}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Connexion espace propriétaire ── */}
      <section className="prop-login-section" id="connexion-proprietaire">
        <div className="container">
          <div className="prop-login-inner">
            <div className="prop-revenue-text prop-login-text fade-in">
              <p className="home-eyebrow home-eyebrow--gold">{t.loginEyebrow}</p>
              <h2>{t.loginTitle}</h2>
              <p>{t.loginSub}</p>
              <ul className="owner-cta-home-list">
                {t.loginList.map((item) => (
                  <li key={item}><i className="fa-solid fa-check" /> {item}</li>
                ))}
              </ul>
              <p className="prop-login-signup">
                {t.loginSignupPre}{" "}
                <Link href="/inscription">{t.loginSignupLink}</Link>
              </p>
            </div>

            <div className="auth-card prop-login-card fade-in">
              <div className="auth-card-header">
                <h1>{t.loginCardTitle}</h1>
                <p className="auth-card-sub">{t.loginCardSub}</p>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="prop-final-cta">
        <div className="container">
          <div className="prop-final-cta-inner fade-in">
            <i className="fa-solid fa-anchor prop-final-cta-icon" aria-hidden="true" />
            <h2>{t.finalCtaTitle}</h2>
            <p>{t.finalCtaSub}</p>
            <div className="prop-hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/inscrire-bateau" className="btn btn-primary btn-xl">
                <i className="fa-solid fa-plus" /> {t.finalCtaBtn1}
              </Link>
              <a href="mailto:proprietaires@sailingloc.com" className="btn btn-outline btn-lg">
                <i className="fa-solid fa-envelope" /> {t.finalCtaBtn2}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

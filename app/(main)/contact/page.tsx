import type { Metadata } from "next";
import Image from "next/image";
import { LocaleLink as Link } from "@/shared/i18n";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import { ContactForm } from "@/features/send-message";
import { ContactSidebar } from "@/widgets/contact-sidebar";
import { Accordion } from "@/shared/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).contactPage;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function ContactPage() {
  const t = getDictionary(await getRequestLocale()).contactPage;
  const faqMid = Math.ceil(t.faqs.length / 2);

  return (
    <>
      <section className="contact-hero" aria-labelledby="contact-hero-title">
        <div className="contact-hero-bg">
          <Image
            src="https://picsum.photos/seed/contact-sea/1920/700"
            alt={t.heroAlt}
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center 60%" }}
          />
          <div className="contact-hero-overlay" aria-hidden="true" />
        </div>
        <div className="container contact-hero-content">
          <div className="contact-hero-tag">
            <i className="fa-solid fa-headset" aria-hidden="true" /> {t.heroTag}
          </div>
          <h1 className="contact-hero-title" id="contact-hero-title">
            {t.heroTitle1}<em>{t.heroTitleEm}</em>{t.heroTitle2}
          </h1>
          <p className="contact-hero-sub">{t.heroSub}</p>
          <div className="stats-contact" role="list">
            {t.stats.map((s) => (
              <div key={s.label} className="stat-contact" role="listitem">
                <div className="stat-contact-val">{s.val}</div>
                <div className="stat-contact-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <ContactForm />
            <ContactSidebar />
          </div>
        </div>
      </section>

      <section className="faq-section" aria-labelledby="faq-title">
        <div className="container">
          <div className="faq-header">
            <h2 id="faq-title">{t.faqTitle}</h2>
            <p>{t.faqSub}</p>
          </div>
          <div className="faq-grid">
            <div className="faq-col">
              <Accordion items={t.faqs.slice(0, faqMid)} />
            </div>
            <div className="faq-col">
              <Accordion items={t.faqs.slice(faqMid)} />
            </div>
          </div>
        </div>
      </section>

      <section className="cta-final" aria-labelledby="cta-final-title">
        <div className="container">
          <div className="cta-final-tag">
            <i className="fa-solid fa-anchor" aria-hidden="true" /> {t.ctaTag}
          </div>
          <h2 id="cta-final-title">
            {t.ctaTitle1}<em>{t.ctaTitleEm}</em>{t.ctaTitle2}
          </h2>
          <p>{t.ctaSub}</p>
          <div className="cta-final-btns">
            <Link href="/bateaux" className="btn btn-white btn-xl">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> {t.ctaBtn1}
            </Link>
            <Link href="/proprietaire" className="btn btn-xl btn-white-outline">
              <i className="fa-solid fa-anchor" aria-hidden="true" /> {t.ctaBtn2}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

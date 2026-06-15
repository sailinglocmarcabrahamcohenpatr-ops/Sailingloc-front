import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/features/send-message";
import { ContactSidebar } from "@/widgets/contact-sidebar";
import { Accordion } from "@/shared/ui";
import { FAQ_ITEMS } from "@/shared/config";

export const metadata: Metadata = {
  title: "Contact & Support",
  description:
    "Contactez l'équipe SailingLoc pour toute question sur votre location de bateau. Formulaire, téléphone, WhatsApp et FAQ disponibles.",
};

const CONTACT_STATS = [
  { val: "< 48h", label: "Délai de réponse moyen" },
  { val: "98%", label: "Satisfaction client" },
  { val: "Lun–Ven", label: "Disponibilité équipe" },
  { val: "100%", label: "Réservations sécurisées" },
];

const faqLeft = FAQ_ITEMS.slice(0, Math.ceil(FAQ_ITEMS.length / 2));
const faqRight = FAQ_ITEMS.slice(Math.ceil(FAQ_ITEMS.length / 2));

export default function ContactPage() {
  return (
    <>
      <section className="contact-hero" aria-labelledby="contact-hero-title">
        <div className="contact-hero-bg">
          <Image
            src="https://picsum.photos/seed/contact-sea/1920/700"
            alt="Mer depuis un voilier au coucher de soleil"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center 60%" }}
          />
          <div className="contact-hero-overlay" aria-hidden="true" />
        </div>
        <div className="container contact-hero-content">
          <div className="contact-hero-tag">
            <i className="fa-solid fa-headset" aria-hidden="true" /> Support &amp; Contact
          </div>
          <h1 className="contact-hero-title" id="contact-hero-title">
            On est là pour <em>vous aider</em> à prendre le large
          </h1>
          <p className="contact-hero-sub">
            Notre équipe de passionnés de voile est disponible pour répondre à toutes vos
            questions sur la location, les bateaux et les destinations.
          </p>
          <div className="stats-contact" role="list">
            {CONTACT_STATS.map((s) => (
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
            <h2 id="faq-title">Questions fréquentes</h2>
            <p>Trouvez rapidement les réponses à vos questions les plus courantes.</p>
          </div>
          <div className="faq-grid">
            <div className="faq-col">
              <Accordion items={faqLeft} />
            </div>
            <div className="faq-col">
              <Accordion items={faqRight} />
            </div>
          </div>
        </div>
      </section>

      <section className="cta-final" aria-labelledby="cta-final-title">
        <div className="container">
          <div className="cta-final-tag">
            <i className="fa-solid fa-anchor" aria-hidden="true" /> Prêt à partir ?
          </div>
          <h2 id="cta-final-title">
            Prêt à prendre <em>le large ?</em>
          </h2>
          <p>
            Des centaines de bateaux vous attendent en France et en Europe. Votre prochaine
            aventure nautique commence ici.
          </p>
          <div className="cta-final-btns">
            <Link href="/bateaux" className="btn btn-white btn-xl">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Trouver un bateau
            </Link>
            <Link href="/proprietaire" className="btn btn-xl btn-white-outline">
              <i className="fa-solid fa-anchor" aria-hidden="true" /> Mettre en location
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

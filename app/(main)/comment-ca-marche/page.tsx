import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./comment-ca-marche.css";
import OwnerCtaLink from "./OwnerCtaLink";
import OwnerDashboardButton from "./OwnerDashboardButton";

export const metadata: Metadata = {
  title: "Comment ça marche — SailingLoc",
  description:
    "Louez ou inscrivez votre bateau en quelques étapes. Recherche, réservation sécurisée, navigation. Location de bateaux entre particuliers simplifiée.",
};

const RENTER_STEPS = [
  {
    num: "01",
    icon: "fa-magnifying-glass",
    title: "Recherchez votre bateau",
    desc: "Filtrez par destination, type de bateau, dates et nombre de passagers. Comparez les annonces avec photos HD, équipements détaillés et avis vérifiés.",
    bullets: ["Destination, dates, capacité", "Types : voilier, catamaran, moteur…", "Options : avec ou sans permis, skipper"],
  },
  {
    num: "02",
    icon: "fa-envelope",
    title: "Contactez le propriétaire",
    desc: "Envoyez votre demande de réservation via notre messagerie sécurisée. Posez vos questions, présentez-vous, discutez des modalités.",
    bullets: ["Messagerie intégrée", "Profil du propriétaire visible", "Réponse sous 24h en moyenne"],
  },
  {
    num: "03",
    icon: "fa-lock",
    title: "Réservez en toute sécurité",
    desc: "Paiement 100% sécurisé par carte bancaire. Votre argent est bloqué et protégé jusqu'à l'embarquement. Le contrat de location est généré automatiquement.",
    bullets: ["Paiement en ligne SSL", "Contrat légal automatique", "Caution par empreinte bancaire"],
  },
  {
    num: "04",
    icon: "fa-sailboat",
    title: "Naviguez & profitez",
    desc: "Embarquez et vivez votre aventure nautique en Méditerranée ou ailleurs. À votre retour, laissez un avis pour aider la communauté.",
    bullets: ["Check-in avec le propriétaire", "Assistance 24h/24 en mer", "Laisser un avis à votre retour"],
  },
];

const GUARANTEES = [
  { icon: "fa-shield-halved", title: "Assurance tous risques", desc: "Chaque location inclut une assurance dommages et RC. Votre bateau et votre responsabilité sont couverts." },
  { icon: "fa-file-contract", title: "Contrat automatique", desc: "Un contrat de location légal est généré automatiquement pour chaque réservation. Aucune paperasse manuelle." },
  { icon: "fa-headset", title: "Support 24h/24", desc: "Notre équipe est joignable à toute heure en cas d'urgence ou de question pendant votre navigation." },
  { icon: "fa-rotate-left", title: "Annulation flexible", desc: "Politique d'annulation claire. Remboursement possible jusqu'à 30 jours avant la date de départ." },
  { icon: "fa-star", title: "Avis 100% vérifiés", desc: "Tous les avis proviennent de locataires ayant réellement effectué la location. Aucun faux avis possible." },
  { icon: "fa-id-card", title: "Identités vérifiées", desc: "Locataires et propriétaires sont vérifiés par pièce d'identité. Vous savez à qui vous avez affaire." },
];

const OWNER_STEPS = [
  { icon: "fa-wand-magic-sparkles", title: "Créez votre annonce", desc: "Photos, description, équipements, tarifs, disponibilités. En 15 minutes." },
  { icon: "fa-envelope-open-text", title: "Recevez des demandes", desc: "Locataires vérifiés vous contactent. Vous lisez leur profil et choisissez." },
  { icon: "fa-circle-check", title: "Confirmez & préparez", desc: "Contrat automatique, caution prélevée, check-list d'embarquement fournie." },
  { icon: "fa-piggy-bank", title: "Encaissez vos revenus", desc: "Virement automatique sous 24h après l'embarquement confirmé." },
];

const FAQS = [
  { q: "Ai-je besoin d'un permis bateau ?", r: "Cela dépend du type de bateau. Les voiliers et bateaux à moteur de puissance importante nécessitent un permis côtier ou hauturier. Les bateaux électriques et certains petits moteurs peuvent être utilisés sans permis. Chaque annonce précise les exigences." },
  { q: "Quelle est la politique d'annulation ?", r: "Annulation plus de 30 jours avant : remboursement à 100%. Entre 15 et 30 jours : 50% remboursé. Moins de 15 jours : non remboursable. Certains propriétaires proposent des conditions plus souples." },
  { q: "Comment fonctionne la caution ?", r: "La caution est prélevée par empreinte bancaire au moment de la réservation. Elle est restituée dans les 5 jours ouvrés après retour du bateau en bon état. En cas de dommage, seul le montant correspondant est débité." },
  { q: "Peut-on naviguer sans expérience ?", r: "Oui, si le bateau est proposé sans permis ou avec skipper inclus. Pour les autres bateaux, un niveau d'expérience minimum est demandé. Certains propriétaires proposent un briefing ou un skipper en option." },
  { q: "Comment est calculée la commission SailingLoc ?", r: "SailingLoc prélève 15% côté propriétaire et 8% côté locataire. Ces commissions incluent l'assurance, la sécurisation du paiement, le contrat et le support." },
];

export default function HowItWorksPage() {
  return (
    <div className="hiw-page">
      {/* ── Hero photo ── */}
      <section className="hiw-page-hero">
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
          <p className="hero-eyebrow">Transparent &amp; sécurisé</p>
          <h1>Comment ça marche ?</h1>
          <p className="hiw-page-hero-sub">
            De la recherche à l'embarquement, SailingLoc sécurise chaque étape.
            Simple pour les locataires, rentable pour les propriétaires.
          </p>
          <div className="hiw-page-hero-actions">
            <Link href="/bateaux" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Rechercher un bateau
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
              <span className="section-badge">Pour les locataires</span>
              <h2>Réservez votre bateau en 4 étapes</h2>
              <p>Un parcours pensé pour être simple, sécurisé et agréable</p>
            </div>
          </div>
          <div className="hiw-page-steps">
            {RENTER_STEPS.map((step) => (
              <div key={step.num} className="hiw-page-step reveal reveal-up">
                <div className="hiw-page-step-left">
                  <div className="hiw-page-step-num">{step.num}</div>
                  <div className="hiw-page-step-icon">
                    <i className={`fa-solid ${step.icon}`} aria-hidden="true" />
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
              <i className="fa-solid fa-magnifying-glass" /> Commencer ma recherche
            </Link>
          </div>
        </div>
      </section>

      {/* ── Garanties ── */}
      <section className="home-section bg-surface">
        <div className="container">
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <h2>Nos garanties</h2>
              <p>Naviguez l'esprit tranquille</p>
            </div>
          </div>
          <div className="hiw-guarantees-grid fade-in">
            {GUARANTEES.map((g) => (
              <div key={g.title} className="hiw-guarantee-card">
                <div className="hiw-guarantee-icon">
                  <i className={`fa-solid ${g.icon}`} aria-hidden="true" />
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
              <span className="section-badge section-badge--gold">Pour les propriétaires</span>
              <h2 style={{ color: "var(--white)" }}>Rentabilisez votre bateau</h2>
              <p style={{ color: "rgba(255,255,255,.7)" }}>Gagnez jusqu'à 40 000 € par an en louant votre bateau inutilisé</p>
            </div>
          </div>
          <div className="prop-steps-mini fade-in">
            {OWNER_STEPS.map((step) => (
              <div key={step.title} className="prop-step-mini">
                <div className="prop-step-mini-icon"><i className={`fa-solid ${step.icon}`} aria-hidden="true" /></div>
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
            <div><h2>Questions fréquentes</h2></div>
          </div>
          <div className="prop-faq fade-in">
            {FAQS.map((faq) => (
              <details key={faq.q} className="prop-faq-item">
                <summary>{faq.q}</summary>
                <div className="prop-faq-answer">{faq.r}</div>
              </details>
            ))}
          </div>
          <p className="hiw-faq-more fade-in">
            Une autre question ?{" "}
            <a href="mailto:contact@sailingloc.com">Contactez notre équipe</a>
          </p>
        </div>
      </section>
    </div>
  );
}

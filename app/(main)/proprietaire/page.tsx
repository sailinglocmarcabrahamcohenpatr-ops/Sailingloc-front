import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Louez votre bateau — SailingLoc Propriétaires",
  description:
    "Inscrivez votre bateau gratuitement et gagnez jusqu'à 40 000 € par an. Assurance incluse, paiement sécurisé, gestion simplifiée. Rejoignez 3 200 propriétaires.",
};

const BENEFITS = [
  {
    icon: "fa-euro-sign",
    color: "#10B981",
    bg: "#D1FAE5",
    title: "Des revenus réels",
    desc: "Un voilier de 40 pieds peut générer entre 8 000 et 25 000 € par saison. Vous fixez vos tarifs librement.",
  },
  {
    icon: "fa-shield-halved",
    color: "#1866F2",
    bg: "#EEF3FE",
    title: "Assurance tous risques",
    desc: "Chaque location est couverte par une assurance tous risques dommages et responsabilité civile. Votre bateau est protégé.",
  },
  {
    icon: "fa-sliders",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    title: "Vous gardez le contrôle",
    desc: "Vous choisissez qui loue, quand, et à quel prix. Acceptez ou refusez librement chaque demande.",
  },
  {
    icon: "fa-headset",
    color: "#F59E0B",
    bg: "#FEF3C7",
    title: "Support dédié",
    desc: "Une équipe dédiée aux propriétaires. Accompagnement à la création d'annonce, aide juridique, conseils tarifaires.",
  },
];

const STEPS = [
  {
    num: "1",
    icon: "fa-camera",
    title: "Créez votre annonce",
    desc: "Décrivez votre bateau, ajoutez de belles photos, définissez vos tarifs et disponibilités. En moins de 15 minutes.",
    detail: "Gratuit, sans abonnement",
  },
  {
    num: "2",
    icon: "fa-bell",
    title: "Recevez des demandes",
    desc: "Les locataires vous contactent directement sur notre messagerie. Vous lisez leur profil et leur expérience.",
    detail: "Locataires vérifiés",
  },
  {
    num: "3",
    icon: "fa-handshake",
    title: "Confirmez et préparez",
    desc: "Vous acceptez la réservation. Le contrat est généré automatiquement. La caution est prélevée en ligne.",
    detail: "Contrat légal inclus",
  },
  {
    num: "4",
    icon: "fa-piggy-bank",
    title: "Encaissez vos revenus",
    desc: "Le paiement est viré sur votre compte dans les 24h après l'embarquement. Simple et automatique.",
    detail: "Virement sous 24h",
  },
];

const TESTIMONIALS = [
  {
    name: "Marc D.",
    location: "Marseille",
    boat: "Sun Odyssey 440",
    revenue: "18 500 € en 2024",
    initial: "MD",
    quote: "En louant mon voilier 8 semaines l'été, je couvre toutes mes charges annuelles et dégage un bénéfice net. SailingLoc s'occupe de tout.",
  },
  {
    name: "Lucie M.",
    location: "Cannes",
    boat: "Leopard 45 Catamaran",
    revenue: "31 200 € en 2024",
    initial: "LM",
    quote: "J'avais peur de confier mon catamaran à des inconnus. Grâce à l'assurance et aux profils vérifiés, je loue l'esprit tranquille. Mes revenus dépassent les attentes.",
  },
  {
    name: "Pierre T.",
    location: "Saint-Tropez",
    boat: "Ferretti 550",
    revenue: "42 000 € en 2024",
    initial: "PT",
    quote: "La plateforme est simple, professionnelle. L'équipe répond vite. Je recommande à tous les propriétaires de bateau.",
  },
];

const FAQS = [
  { q: "Est-ce que l'inscription est gratuite ?", r: "Oui, créer une annonce est entièrement gratuit. SailingLoc prélève une commission de 15% uniquement sur les locations réellement réalisées." },
  { q: "Comment fonctionne l'assurance ?", r: "SailingLoc inclut une assurance tous risques dans chaque location. Elle couvre les dommages matériels jusqu'à la valeur du bateau et la responsabilité civile. Vous n'avez rien à payer en plus." },
  { q: "Puis-je refuser une réservation ?", r: "Oui, vous gardez le contrôle total. Vous pouvez accepter ou refuser chaque demande de réservation, sans justification nécessaire." },
  { q: "Quand suis-je payé ?", r: "Le virement est effectué automatiquement dans les 24h suivant l'embarquement confirmé par le locataire. Pas d'attente, pas de paperasse." },
  { q: "Que se passe-t-il en cas de dommage ?", r: "En cas de dommage, vous déposez un constat dans votre espace. L'assurance prend en charge selon les conditions. La caution du locataire est utilisée en premier recours." },
];

export default function ProprietairePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="prop-hero">
        <div className="prop-hero-bg">
          <Image
            src="https://picsum.photos/seed/boat-owner-port/1920/900"
            alt="Propriétaire de bateau au port"
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center 40%" }}
            priority
          />
          <div className="prop-hero-overlay" />
        </div>
        <div className="container prop-hero-content">
          <div className="prop-hero-badge">
            <i className="fa-solid fa-star" /> 3 200+ propriétaires nous font confiance
          </div>
          <h1>
            Louez votre bateau<br />
            <span className="prop-hero-accent">en toute simplicité</span>
          </h1>
          <p>
            Gagnez jusqu'à <strong>40 000 € par an</strong> en louant votre bateau
            lorsque vous ne l'utilisez pas. Assurance incluse, locataires vérifiés,
            paiement sécurisé.
          </p>
          <div className="prop-hero-actions">
            <Link href="/inscrire-bateau" className="btn btn-white btn-xl">
              <i className="fa-solid fa-plus" />
              Déposer mon bateau gratuitement
            </Link>
            <a href="#comment-ca-marche" className="btn btn-ghost-white btn-lg">
              Comment ça marche <i className="fa-solid fa-chevron-down" />
            </a>
          </div>
          <div className="prop-hero-stats">
            <div><strong>3 200+</strong><span>Propriétaires actifs</span></div>
            <div><strong>15 min</strong><span>Pour créer une annonce</span></div>
            <div><strong>40 k€</strong><span>Revenu max / an</span></div>
            <div><strong>0 €</strong><span>Inscription</span></div>
          </div>
        </div>
      </section>

      {/* ── Avantages ── */}
      <section className="home-section bg-surface">
        <div className="container">
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <p className="home-eyebrow">Pourquoi SailingLoc ?</p>
              <h2>Tout pour réussir votre location</h2>
              <p>SailingLoc gère le complexe — vous profitez du reste</p>
            </div>
          </div>
          <div className="prop-benefits-grid">
            {BENEFITS.map((b) => (
              <div key={b.title} className="prop-benefit-card fade-in">
                <div className="prop-benefit-icon" style={{ background: b.bg, color: b.color }}>
                  <i className={`fa-solid ${b.icon}`} aria-hidden="true" />
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
              <p className="home-eyebrow">Rapide & simple</p>
              <h2>Publiez votre bateau en 4 étapes</h2>
              <p>De la création d'annonce au premier virement, en moins d'une semaine</p>
            </div>
          </div>
          <div className="prop-steps">
            {STEPS.map((step, i) => (
              <div key={step.num} className="prop-step fade-in">
                <div className="prop-step-num">{step.num}</div>
                {i < STEPS.length - 1 && <div className="prop-step-line" aria-hidden="true" />}
                <div className="prop-step-icon">
                  <i className={`fa-solid ${step.icon}`} aria-hidden="true" />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <div className="prop-step-detail"><i className="fa-solid fa-check" aria-hidden="true" /> {step.detail}</div>
              </div>
            ))}
          </div>
          <div className="hiw-home-cta fade-in">
            <Link href="/inscrire-bateau" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-rocket" /> Commencer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* ── Revenue estimator visual ── */}
      <section className="prop-revenue-section">
        <div className="container">
          <div className="prop-revenue-inner">
            <div className="prop-revenue-text fade-in">
              <p className="home-eyebrow home-eyebrow--gold">Revenus estimés</p>
              <h2>Combien peut rapporter votre bateau ?</h2>
              <p>
                Nos propriétaires gagnent en moyenne 12 000 € par saison.
                Les catamarans et grandes unités peuvent dépasser 40 000 € par an.
              </p>
              <ul className="owner-cta-home-list" style={{ marginTop: "20px" }}>
                <li><i className="fa-solid fa-check" /> Tarif journalier fixé par vous</li>
                <li><i className="fa-solid fa-check" /> Remise longue durée optionnelle</li>
                <li><i className="fa-solid fa-check" /> Haute saison = tarifs premium</li>
                <li><i className="fa-solid fa-check" /> Zéro frais fixes</li>
              </ul>
            </div>
            <div className="prop-revenue-table fade-in">
              <div className="prop-revenue-table-hd">
                <span>Type de bateau</span>
                <span>Semaines louées</span>
                <span>Revenus estimés</span>
              </div>
              {[
                { type: "Voilier 35–40 pieds", weeks: "4–6 sem.", low: "8 000 €", high: "16 000 €" },
                { type: "Catamaran 42–46 pieds", weeks: "6–10 sem.", low: "18 000 €", high: "38 000 €" },
                { type: "Bateau moteur 30–40 pieds", weeks: "4–8 sem.", low: "10 000 €", high: "26 000 €" },
                { type: "Semi-rigide / Day-boat", weeks: "8–15 j.", low: "1 500 €", high: "4 000 €" },
              ].map((row) => (
                <div key={row.type} className="prop-revenue-row">
                  <span>{row.type}</span>
                  <span>{row.weeks}</span>
                  <span className="prop-revenue-amount">{row.low} – {row.high}</span>
                </div>
              ))}
              <div className="prop-revenue-cta">
                <Link href="/inscrire-bateau" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  <i className="fa-solid fa-calculator" /> Estimer mes revenus précis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Témoignages propriétaires ── */}
      <section className="home-section bg-surface">
        <div className="container">
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <p className="home-eyebrow">Ils nous font confiance</p>
              <h2>Ce que disent nos propriétaires</h2>
            </div>
          </div>
          <div className="prop-testimonials fade-in">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="prop-testi-card">
                <div className="prop-testi-stars" aria-label="5 étoiles sur 5">
                  {[1,2,3,4,5].map((i) => <i key={i} className="fa-solid fa-star" aria-hidden="true" />)}
                </div>
                <p className="prop-testi-quote">"{t.quote}"</p>
                <div className="prop-testi-footer">
                  <div className="prop-testi-avatar">{t.initial}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.boat} · {t.location}</span>
                    <div className="prop-testi-revenue">{t.revenue}</div>
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
              <h2>Questions fréquentes</h2>
              <p>Tout ce que vous devez savoir avant de publier votre annonce</p>
            </div>
          </div>
          <div className="prop-faq fade-in">
            {FAQS.map((faq) => (
              <details key={faq.q} className="prop-faq-item">
                <summary>{faq.q}</summary>
                <div className="prop-faq-answer">{faq.r}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="prop-final-cta">
        <div className="container">
          <div className="prop-final-cta-inner fade-in">
            <i className="fa-solid fa-anchor prop-final-cta-icon" aria-hidden="true" />
            <h2>Prêt à rentabiliser votre bateau ?</h2>
            <p>
              Rejoignez 3 200+ propriétaires et commencez à recevoir des réservations
              dès cette saison. Inscription gratuite, sans engagement.
            </p>
            <div className="prop-hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/inscrire-bateau" className="btn btn-primary btn-xl">
                <i className="fa-solid fa-plus" />
                Déposer mon bateau gratuitement
              </Link>
              <a href="mailto:proprietaires@sailingloc.com" className="btn btn-outline btn-lg">
                <i className="fa-solid fa-envelope" />
                Contacter l'équipe propriétaires
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

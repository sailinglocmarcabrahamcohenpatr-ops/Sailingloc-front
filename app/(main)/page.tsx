import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/widgets/hero";
import { Testimonials } from "@/widgets/testimonials";
import { FavoriteBoatCard } from "@/features/toggle-favorite";
import Image from "next/image";
import { FEATURED_BOATS, getBoatImageUrl } from "@/entities/boat";
import { getDestinations } from "@/entities/destination";
import { DestinationsHome } from "@/widgets/destinations-home";
import StatsCounters from "./StatsCounters";
import "./home-shell.css";
import "./home.css";

export const metadata: Metadata = {
  title: "SailingLoc — Location de bateaux entre particuliers en France et Europe",
  description:
    "Trouvez le bateau idéal pour vos vacances. Voiliers, catamarans, bateaux à moteur. Assurance incluse, paiement sécurisé, propriétaires vérifiés. France et Europe.",
};

/* Seules les 3 premières catégories sont mises en avant sur l'accueil, en
   vignettes photo. Le lien « Voir tous les bateaux » donne accès au reste. */
/* imageQuery explicite avec le suffixe /all : sans lui LoremFlickr traite les
   mots-clés en OU et renvoyait des photos hors sujet (personnes, gros plans). */
const BOAT_CATEGORIES = [
  { type: "voilier" as const,   label: "Voilier",         imageQuery: "sailboat,sea/all" },
  { type: "catamaran" as const, label: "Catamaran",       imageQuery: "catamaran,sea/all" },
  { type: "moteur" as const,    label: "Bateau à moteur", imageQuery: "yacht,sea/all" },
];

const HOW_IT_WORKS = [
  {
    num: "01",
    icon: "fa-magnifying-glass",
    title: "Recherchez",
    desc: "Filtrez par destination, type de bateau et dates. Comparez des centaines d'annonces avec photos et avis vérifiés.",
  },
  {
    num: "02",
    icon: "fa-calendar-check",
    title: "Réservez en sécurité",
    desc: "Envoyez votre demande. Paiement sécurisé, assurance incluse. Votre argent est protégé jusqu'à l'embarquement.",
  },
  {
    num: "03",
    icon: "fa-sailboat",
    title: "Naviguez & profitez",
    desc: "Embarquez et vivez votre aventure. Notre équipe est disponible 24h/24 pendant toute la durée de votre navigation.",
  },
];

export default async function HomePage() {
  const destinations = await getDestinations();

  return (
    <div className="home-shell">
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Stats ── */}
      <section className="stats-dark-section" aria-label="Chiffres clés">
        <div className="container">
          <StatsCounters />
        </div>
      </section>

      {/* ── Catégories ── */}
      <section className="home-section bg-surface" aria-labelledby="cat-title">
        <div className="container">
          <div className="home-section-hd fade-in">
            <div>
              <h2 id="cat-title">Quel bateau recherchez-vous ?</h2>
              <p>Des milliers d'annonces pour tous les styles de navigation</p>
            </div>
            <Link href="/bateaux" className="btn btn-outline">
              Voir tous les bateaux <i className="fa-solid fa-arrow-right" aria-hidden="true" />
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
                  src={getBoatImageUrl(
                    { imageSeed: cat.type, type: cat.type, imageQuery: cat.imageQuery },
                    800,
                    600
                  )}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
                <span className="category-card-veil" aria-hidden="true" />
                <strong className="category-card-label">{cat.label}</strong>
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
              <h2 id="dest-title">Destinations populaires</h2>
              <p>Trouvez le bateau idéal en Méditerranée, Atlantique et au-delà</p>
            </div>
            <Link href="/destinations" className="btn btn-outline">
              Toutes les destinations <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
          <DestinationsHome destinations={destinations} />
        </div>
      </section>

      {/* ── Bateaux vedettes ── */}
      <section className="home-section bg-surface" aria-labelledby="featured-title">
        <div className="container">
          <div className="home-section-hd fade-in">
            <div>
              <h2 id="featured-title">Bateaux en vedette</h2>
              <p>Une sélection de nos meilleures annonces du moment</p>
            </div>
            <Link href="/bateaux" className="btn btn-outline">
              Voir tout <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
          <div className="boats-grid fade-in">
            {FEATURED_BOATS.map((boat) => (
              <FavoriteBoatCard key={boat.id} boat={boat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="home-section home-hiw" aria-labelledby="hiw-title">
        <div className="container">
          <div className="home-section-hd home-section-hd--center fade-in">
            <div>
              <p className="home-eyebrow">Simple, rapide, sécurisé</p>
              <h2 id="hiw-title">Réservez en 3 étapes</h2>
              <p>De la recherche à l'embarquement, tout est pensé pour vous</p>
            </div>
          </div>
          <div className="hiw-home-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.num} className="hiw-home-card fade-in">
                <div className="hiw-home-icon">
                  <i className={`fa-solid ${step.icon}`} aria-hidden="true" />
                </div>
                <div className="hiw-home-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hiw-home-arrow" aria-hidden="true">→</div>
                )}
              </div>
            ))}
          </div>
          <div className="hiw-home-cta fade-in">
            <Link href="/bateaux" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              Trouver mon bateau
            </Link>
            <Link href="/comment-ca-marche" className="btn btn-ghost">
              En savoir plus <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Avis clients ── */}
      <Testimonials />

      {/* ── Owner CTA ── */}
      <section className="owner-cta-home" aria-labelledby="owner-cta-title">
        <div className="container">
          <div className="owner-cta-home-inner">
            <div className="owner-cta-home-text fade-in">
              <p className="home-eyebrow home-eyebrow--gold">Pour les propriétaires</p>
              <h2 id="owner-cta-title">Votre bateau peut générer jusqu'à <span>40 000 €</span> par an</h2>
              <p>
                Louez votre bateau lorsque vous ne l'utilisez pas. SailingLoc gère la réservation,
                l'assurance, les paiements et le contrat. Vous n'avez qu'à accueillir vos locataires.
              </p>
              <ul className="owner-cta-home-list">
                <li><i className="fa-solid fa-check" aria-hidden="true" /> Inscription gratuite, sans abonnement</li>
                <li><i className="fa-solid fa-check" aria-hidden="true" /> Vous fixez vos tarifs et disponibilités</li>
                <li><i className="fa-solid fa-check" aria-hidden="true" /> Assurance tous risques incluse</li>
                <li><i className="fa-solid fa-check" aria-hidden="true" /> Virement automatique sous 24h</li>
              </ul>
              <div className="owner-cta-home-actions">
                <Link href="/proprietaire" className="btn btn-white btn-lg">
                  <i className="fa-solid fa-sailboat" aria-hidden="true" />
                  Devenir propriétaire SailingLoc
                </Link>
                <Link href="/comment-ca-marche#proprietaires" className="btn btn-ghost-white">
                  Comment ça marche ? <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="owner-cta-home-visual fade-in">
              <div className="owner-cta-home-card">
                <div className="owner-cta-home-card-header">
                  <i className="fa-solid fa-euro-sign" aria-hidden="true" />
                  <strong>Estimateur de revenus</strong>
                </div>
                {[
                  { type: "Voilier 40 pieds", weeks: "4 semaines/été", revenue: "12 000 €" },
                  { type: "Catamaran 45 pieds", weeks: "8 semaines/été", revenue: "32 000 €" },
                  { type: "Bateau moteur 35 pieds", weeks: "6 semaines/an", revenue: "18 000 €" },
                ].map((e) => (
                  <div key={e.type} className="owner-cta-estimate">
                    <div>
                      <strong>{e.type}</strong>
                      <span>{e.weeks}</span>
                    </div>
                    <div className="owner-cta-estimate-rev">{e.revenue} / an</div>
                  </div>
                ))}
                <Link href="/proprietaire" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Voir les revenus estimés
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
            <h2>Location de bateaux entre particuliers en France et en Europe</h2>
            <p>
              SailingLoc est la plateforme de référence pour la location de bateaux entre particuliers.
              Réservez un voilier, un catamaran ou un bateau à moteur au meilleur prix, avec assurance
              incluse et paiement sécurisé. Trouvez le bateau idéal pour vos vacances en Méditerranée,
              sur l'Atlantique ou à l'étranger — Côte d'Azur, Corse, Cyclades, Baléares, Croatie et plus encore.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ALL_BOATS } from "@/entities/boat";
import { PRODUCT_REVIEWS } from "@/entities/review";
import { Gallery } from "@/features/view-gallery";
import { BookingCard } from "@/features/book-boat";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const boat = ALL_BOATS.find((b) => b.id === id);
  if (!boat) return { title: "Bateau introuvable" };
  return {
    title: boat.name,
    description: `Louez le ${boat.name} à ${boat.location} — ${boat.pricePerDay.toLocaleString("fr-FR")} € / jour. ${boat.reviewCount} avis.`,
  };
}

const SPECS = (boat: (typeof ALL_BOATS)[0]) =>
  [
    { icon: "fa-ruler-horizontal", val: boat.length ?? "—", label: "Longueur" },
    { icon: "fa-arrows-left-right", val: boat.width ?? "—", label: "Largeur" },
    { icon: "fa-users", val: boat.capacity ? `${boat.capacity} pers.` : "—", label: "Capacité" },
    { icon: "fa-bed", val: boat.cabins ? `${boat.cabins} cab.` : "—", label: "Couchettes" },
    { icon: "fa-calendar", val: boat.year?.toString() ?? "—", label: "Année" },
    { icon: "fa-id-card", val: boat.license ?? "—", label: "Permis" },
    { icon: "fa-gas-pump", val: boat.fuel ?? "—", label: "Carburant" },
    { icon: "fa-gauge-high", val: boat.speed ?? "—", label: "Vitesse" },
  ];

const EQUIPMENT = [
  "GPS & chartplotter",
  "Wi-Fi à bord",
  "Climatisation",
  "Pilote automatique",
  "Réfrigérateur",
  "Cuisinière au gaz (3 feux)",
  "Panneau solaire",
  "Dessalinisateur",
  "Dinghy + moteur HB",
  "Équipements de plongée",
  "VHF portatif",
  "Équipements de sécurité",
  "Draps & serviettes",
  "Antifouling récent",
];

const RULES = [
  {
    icon: "fa-clock",
    title: "Heure d'arrivée",
    desc: "À partir de 17h00. Départ avant 09h00. Remise des clés au port.",
  },
  {
    icon: "fa-shield-halved",
    title: "Caution",
    desc: "Caution de 5 000 € par empreinte bancaire. Restituée sous 5 jours après le retour.",
  },
  {
    icon: "fa-gas-pump",
    title: "Carburant",
    desc: "Plein fourni au départ. Retour avec le même niveau de carburant.",
  },
  {
    icon: "fa-circle-question",
    title: "Comment ?",
    desc: "Check-in avec briefing de 45 minutes. Skipper disponible sur demande.",
  },
];

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const boat = ALL_BOATS.find((b) => b.id === id);
  if (!boat) notFound();

  const galleryImages = [
    { src: `https://picsum.photos/seed/${boat.imageSeed}-main/1200/800`, alt: `${boat.name} vue principale` },
    { src: `https://picsum.photos/seed/${boat.imageSeed}-cockpit/600/400`, alt: "Cockpit" },
    { src: `https://picsum.photos/seed/${boat.imageSeed}-cabin/600/400`, alt: "Cabine principale" },
  ];

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="Fil d'Ariane">
        <Link href="/"><i className="fa-solid fa-house" aria-hidden="true" /> Accueil</Link>
        <span className="breadcrumb-sep" aria-hidden="true"><i className="fa-solid fa-chevron-right" /></span>
        <Link href="/bateaux">Bateaux disponibles</Link>
        <span className="breadcrumb-sep" aria-hidden="true"><i className="fa-solid fa-chevron-right" /></span>
        <span aria-current="page">{boat.name}</span>
      </nav>

      <Gallery images={galleryImages} />

      <div className="product-layout">
        <div style={{ position: "relative" }}>
          <div className="product-header">
            <div className="product-type-tag">
              <i className="fa-solid fa-sailboat" aria-hidden="true" />{" "}
              {boat.type.charAt(0).toUpperCase() + boat.type.slice(1)}
            </div>
            <h1 className="product-title">{boat.name}</h1>
            <div className="product-meta">
              <div className="product-rating">
                <i className="fa-solid fa-star" aria-hidden="true" />
                {boat.rating} &nbsp;·&nbsp;
                <a href="#avis">{boat.reviewCount} avis</a>
              </div>
              <div className="product-loc">
                <i className="fa-solid fa-location-dot" aria-hidden="true" />
                {boat.location}
              </div>
            </div>
            <div className="product-owner">
              <Image
                src="https://i.pravatar.cc/96?u=marc-owner"
                alt="Photo du propriétaire Marc"
                width={48}
                height={48}
                className="product-owner-avatar"
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
              <div className="product-owner-info">
                <small>Proposé par</small>
                <strong>Marc D.</strong>
                <Link href="#">
                  Voir le profil{" "}
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: ".7rem" }} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          <div className="specs-grid" role="list" aria-label="Caractéristiques du bateau">
            {SPECS(boat).map((spec) => (
              <div key={spec.label} className="spec-card" role="listitem">
                <div className="spec-icon">
                  <i className={`fa-solid ${spec.icon}`} aria-hidden="true" />
                </div>
                <div className="spec-val">{spec.val}</div>
                <div className="spec-lbl">{spec.label}</div>
              </div>
            ))}
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>
              Le {boat.name} est un voilier moderne et confortable, idéal pour une croisière en
              famille ou entre amis en Méditerranée. Alliant performance et habitabilité grâce à
              son large cockpit ouvert et ses {boat.cabins} cabines indépendantes, chacune avec
              sa propre salle de bains.
            </p>
            <p>
              Basé à {boat.location}, ce bateau vous permettra d'explorer les calanques, les îles
              du Frioul et de rejoindre facilement la Corse ou la Côte d'Azur. Un vrai bijou de
              navigation pour les passionnés de voile.
            </p>
          </div>

          <div className="equipment">
            <h3>Équipements &amp; confort</h3>
            <div className="equip-grid">
              {EQUIPMENT.map((item) => (
                <div key={item} className="equip-item">
                  <i className="fa-solid fa-check" aria-hidden="true" /> {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rules">
            <h3>Règles &amp; conditions de location</h3>
            <div className="rules-grid">
              {RULES.map((rule) => (
                <div key={rule.title} className="rule-item">
                  <strong>
                    <i className={`fa-solid ${rule.icon}`} aria-hidden="true" /> {rule.title}
                  </strong>
                  <p>{rule.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="reviews-section" id="avis" aria-labelledby="reviews-title">
            <h3 id="reviews-title">
              <i className="fa-solid fa-star" style={{ color: "var(--star)" }} aria-hidden="true" />{" "}
              {boat.rating} · {boat.reviewCount} avis
            </h3>

            <div className="reviews-overview">
              <div className="reviews-score-big">
                <div className="reviews-score-num">{boat.rating}</div>
                <div className="reviews-score-max">/ 5</div>
                <div className="stars" aria-hidden="true">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={
                        i < Math.floor(boat.rating)
                          ? "fa-solid fa-star"
                          : i < boat.rating
                          ? "fa-solid fa-star-half-stroke"
                          : "fa-regular fa-star"
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="reviews-bars">
                {[
                  { label: "État général", pct: 96 },
                  { label: "Confort", pct: 98 },
                  { label: "Équipements", pct: 94 },
                  { label: "Communication", pct: 100 },
                  { label: "Rapport qualité/prix", pct: 90 },
                ].map((bar) => (
                  <div key={bar.label} className="review-bar-row">
                    <span className="review-bar-label">{bar.label}</span>
                    <div className="review-bar-track">
                      <div
                        className="review-bar-fill"
                        style={{ width: `${bar.pct}%` }}
                        role="progressbar"
                        aria-valuenow={bar.pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <span className="review-bar-pct">{(bar.pct / 20).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {PRODUCT_REVIEWS.map((review) => (
              <article key={review.id} className="review-card">
                <div className="review-author">
                  <div className="review-author-avatar" aria-hidden="true">{review.initial}</div>
                  <div className="review-author-info">
                    <strong>{review.author}</strong>
                    <span>{review.date}</span>
                  </div>
                </div>
                <div className="review-rating" aria-label={`Note : ${review.rating} sur 5`}>
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={i < review.rating ? "fa-solid fa-star" : "fa-solid fa-star-half-stroke"}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="review-body">{review.body}</p>
                {review.images && (
                  <div className="review-imgs">
                    {review.images.map((img) => (
                      <Image
                        key={img.src}
                        src={img.src}
                        alt={img.alt}
                        width={80}
                        height={60}
                        style={{ objectFit: "cover", borderRadius: "var(--radius)" }}
                      />
                    ))}
                  </div>
                )}
              </article>
            ))}

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button className="btn btn-outline" type="button">
                <i className="fa-solid fa-comments" aria-hidden="true" /> Voir les{" "}
                {boat.reviewCount} avis
              </button>
            </div>
          </section>

          <section className="location-section" aria-labelledby="location-title">
            <h3 id="location-title">Localisation</h3>
            <div className="location-map" role="img" aria-label={`Carte : ${boat.location}`}>
              <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
              <span>{boat.location}</span>
            </div>
            <p className="location-label">
              <i className="fa-solid fa-location-dot" aria-hidden="true" />
              {boat.location} — L'adresse exacte vous sera communiquée après confirmation de la réservation.
            </p>
          </section>
        </div>

        <BookingCard
          pricePerDay={boat.pricePerDay}
          rating={boat.rating}
          reviewCount={boat.reviewCount}
          capacity={boat.capacity ?? 8}
          ownerName="Marc"
        />
      </div>
    </div>
  );
}

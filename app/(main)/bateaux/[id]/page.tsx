import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PRODUCT_REVIEWS } from "@/entities/review";
import { Gallery } from "@/features/view-gallery";
import { BookingCard } from "@/features/book-boat";
import { LocationMapLoader } from "@/features/list-boat";
import { boatsApi, resolvePhotoUrl, type BoatAPI } from "@/shared/lib";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface BoatPageData {
  id: string;
  name: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  type: string;
  rating: number;
  reviewCount: number;
  pricePerDay: number;
  capacity: number;
  cabins: number;
  taille: string;
  motorisation: string;
  permisRequis: boolean;
  carburantInclus: boolean;
  avecSkipper: boolean;
  description: string | null;
  caution: number;
  ownerSeed: string;
  galleryImages: { src: string; alt: string }[];
}

function adaptBoat(b: BoatAPI): BoatPageData {
  const sortedPhotos = (b.photos ?? [])
    .slice()
    .sort((a, c) => (a.ordreAffichage ?? 99) - (c.ordreAffichage ?? 99));

  const galleryImages =
    sortedPhotos.length > 0
      ? sortedPhotos.slice(0, 3).map((p, i) => ({
          src: resolvePhotoUrl(p.url),
          alt: p.description ?? (i === 0 ? `${b.nomBateau} vue principale` : `Photo ${i + 1}`),
        }))
      : [
          { src: `https://picsum.photos/seed/${b.id}-main/1200/800`, alt: `${b.nomBateau} vue principale` },
          { src: `https://picsum.photos/seed/${b.id}-cockpit/600/400`, alt: "Cockpit" },
          { src: `https://picsum.photos/seed/${b.id}-cabin/600/400`, alt: "Cabine principale" },
        ];

  return {
    id: String(b.id),
    name: b.nomBateau,
    location: b.port ? b.port.ville : "France",
    type: b.typeBateau?.labelTypeBateau ?? "Voilier",
    rating: 0,
    reviewCount: 0,
    pricePerDay: typeof b.prixJour === "string" ? parseFloat(b.prixJour) : (b.prixJour ?? 0),
    capacity: b.capacite ?? 0,
    cabins: b.nombreCabines ?? 0,
    taille: b.taille ?? "—",
    motorisation: b.motorisation ?? "—",
    permisRequis: b.permisRequis ?? false,
    carburantInclus: b.carburantInclus ?? false,
    avecSkipper: b.avecSkipper,
    description: b.description ?? null,
    caution: typeof b.caution === "string" ? parseFloat(b.caution) : (b.caution ?? 0),
    ownerSeed: String(b.id_utilisateur ?? b.id),
    galleryImages,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const b = await boatsApi.getOne(id);
    const boat = adaptBoat(b);
    return {
      title: boat.name,
      description: `Louez le ${boat.name} à ${boat.location} — ${boat.pricePerDay.toLocaleString("fr-FR")} € / jour.`,
    };
  } catch {
    return { title: "Bateau introuvable" };
  }
}

const SPECS = (boat: BoatPageData) =>
  [
    { icon: "fa-ruler-horizontal", val: boat.taille, label: "Taille" },
    { icon: "fa-users", val: boat.capacity ? `${boat.capacity} pers.` : "—", label: "Capacité" },
    { icon: "fa-bed", val: boat.cabins ? `${boat.cabins} cab.` : "—", label: "Couchettes" },
    { icon: "fa-id-card", val: boat.permisRequis ? "Requis" : "Non requis", label: "Permis" },
    { icon: "fa-gas-pump", val: boat.motorisation, label: "Motorisation" },
    { icon: "fa-shield-halved", val: boat.caution ? `${boat.caution.toLocaleString("fr-FR")} €` : "—", label: "Caution" },
    { icon: "fa-user-tie", val: boat.avecSkipper ? "Inclus" : "Non inclus", label: "Skipper" },
    { icon: "fa-droplet", val: boat.carburantInclus ? "Inclus" : "Non inclus", label: "Carburant" },
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
    desc: "Caution par empreinte bancaire. Restituée sous 5 jours après le retour.",
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

  let boat: BoatPageData;
  try {
    const data = await boatsApi.getOne(id);
    boat = adaptBoat(data);
  } catch {
    notFound();
  }

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="Fil d'Ariane">
        <Link href="/"><i className="fa-solid fa-house" aria-hidden="true" /> Accueil</Link>
        <span className="breadcrumb-sep" aria-hidden="true"><i className="fa-solid fa-chevron-right" /></span>
        <Link href="/bateaux">Bateaux disponibles</Link>
        <span className="breadcrumb-sep" aria-hidden="true"><i className="fa-solid fa-chevron-right" /></span>
        <span aria-current="page">{boat.name}</span>
      </nav>

      <Gallery images={boat.galleryImages} />

      <div className="product-layout">
        <div style={{ position: "relative" }}>
          <div className="product-header">
            <div className="product-type-tag">
              <i className="fa-solid fa-sailboat" aria-hidden="true" />{" "}
              {boat.type}
            </div>
            <h1 className="product-title">{boat.name}</h1>
            <div className="product-meta">
              <div className="product-rating">
                <i className="fa-solid fa-star" aria-hidden="true" />
                {boat.rating > 0 ? boat.rating : "Nouveau"} &nbsp;·&nbsp;
                <a href="#avis">{boat.reviewCount} avis</a>
              </div>
              <div className="product-loc">
                <i className="fa-solid fa-location-dot" aria-hidden="true" />
                {boat.location}
              </div>
            </div>
            <div className="product-owner">
              <Image
                src={`https://i.pravatar.cc/96?u=${boat.ownerSeed}`}
                alt="Photo du propriétaire"
                width={48}
                height={48}
                className="product-owner-avatar"
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
              <div className="product-owner-info">
                <small>Proposé par</small>
                <strong>Propriétaire</strong>
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
            {boat.description ? (
              <p>{boat.description}</p>
            ) : (
              <>
                <p>
                  Le {boat.name} est un bateau moderne et confortable, idéal pour une croisière en
                  famille ou entre amis. Alliant performance et habitabilité grâce à son large
                  cockpit ouvert{boat.cabins > 0 ? ` et ses ${boat.cabins} cabines indépendantes` : ""}.
                </p>
                <p>
                  Basé à {boat.location}, ce bateau vous permettra d'explorer les plus belles
                  destinations de la région. Un vrai bijou de navigation pour les passionnés.
                </p>
              </>
            )}
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
              {boat.reviewCount > 0 ? `${boat.rating} · ${boat.reviewCount} avis` : "Aucun avis pour l'instant"}
            </h3>

            {boat.reviewCount > 0 && (
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
            )}

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
          </section>

          <section className="location-section" aria-labelledby="location-title">
            <h3 id="location-title">Localisation</h3>
            {boat.coordinates ? (
              <div className="location-map location-map--interactive">
                <LocationMapLoader lat={boat.coordinates.lat} lng={boat.coordinates.lng} />
              </div>
            ) : (
              <div className="location-map" role="img" aria-label={`Carte : ${boat.location}`}>
                <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
                <span>{boat.location}</span>
              </div>
            )}
            <p className="location-label">
              <i className="fa-solid fa-location-dot" aria-hidden="true" />
              {boat.location} — L'adresse exacte vous sera communiquée après confirmation de la réservation.
            </p>
          </section>
        </div>

        <BookingCard
          boatId={boat.id}
          pricePerDay={boat.pricePerDay}
          rating={boat.rating}
          reviewCount={boat.reviewCount}
          capacity={boat.capacity || 8}
          ownerName="Propriétaire"
        />
      </div>
    </div>
  );
}

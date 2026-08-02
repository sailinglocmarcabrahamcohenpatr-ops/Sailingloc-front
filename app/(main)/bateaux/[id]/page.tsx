import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gallery } from "@/features/view-gallery";
import { BookingCard } from "@/features/book-boat";
import { LocationMapLoader } from "@/features/list-boat";
import { boatsApi, avisApi, resolvePhotoUrl, type BoatAPI, type AvisAPI } from "@/shared/lib";
import { LocaleLink as Link } from "@/shared/i18n";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";

type BoatDetailDict = ReturnType<typeof getDictionary>["boatDetail"];

/** Remplace les {placeholders} d'un gabarit par leurs valeurs. */
function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

interface RatingSummary {
  rating: number;
  count: number;
  proprietaire: number;
  bateau: number;
  lieu: number;
}

function summarizeAvis(avis: AvisAPI[]): RatingSummary {
  const count = avis.length;
  if (count === 0) return { rating: 0, count: 0, proprietaire: 0, bateau: 0, lieu: 0 };

  const avg = (key: "note" | "noteProprietaire" | "noteBateau" | "noteLieu") =>
    avis.reduce((sum, a) => sum + a[key], 0) / count;

  return {
    rating: Math.round(avg("note") * 10) / 10,
    count,
    proprietaire: avg("noteProprietaire"),
    bateau: avg("noteBateau"),
    lieu: avg("noteLieu"),
  };
}

const fmtReviewDate = (d: string, intlLocale: string) =>
  new Date(d).toLocaleDateString(intlLocale, { month: "long", year: "numeric" });

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
  ownerId: number | null;
  ownerName: string;
  ownerInitials: string;
  galleryImages: { src: string; alt: string }[];
}

function adaptBoat(b: BoatAPI, t: BoatDetailDict): BoatPageData {
  const sortedPhotos = (b.photos ?? [])
    .slice()
    .sort((a, c) => (a.ordreAffichage ?? 99) - (c.ordreAffichage ?? 99));

  const mainAlt = fill(t.galleryMainViewAlt, { name: b.nomBateau });
  const galleryImages =
    sortedPhotos.length > 0
      ? sortedPhotos.slice(0, 3).map((p, i) => ({
          src: resolvePhotoUrl(p.url),
          alt: p.description ?? (i === 0 ? mainAlt : fill(t.galleryPhotoAlt, { n: i + 1 })),
        }))
      : [
          { src: `https://picsum.photos/seed/${b.id}-main/1200/800`, alt: mainAlt },
          { src: `https://picsum.photos/seed/${b.id}-cockpit/600/400`, alt: t.galleryCockpit },
          { src: `https://picsum.photos/seed/${b.id}-cabin/600/400`, alt: t.galleryMainCabin },
        ];

  const owner = b.proprietaire ?? b.utilisateur;
  const ownerId = owner?.id ?? b.id_utilisateur ?? null;
  const ownerName = owner ? `${owner.prenom} ${owner.nom}`.trim() : t.defaultOwner;
  const ownerInitials = owner
    ? `${owner.prenom?.[0] ?? ""}${owner.nom?.[0] ?? ""}`.toUpperCase() || "?"
    : "?";

  const lat = b.port?.latitude != null ? Number(b.port.latitude) : NaN;
  const lng = b.port?.longitude != null ? Number(b.port.longitude) : NaN;

  return {
    id: String(b.id),
    name: b.nomBateau,
    location: b.port ? b.port.ville : "France",
    coordinates: !Number.isNaN(lat) && !Number.isNaN(lng) ? { lat, lng } : undefined,
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
    ownerId,
    ownerName,
    ownerInitials,
    galleryImages,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const t = getDictionary(await getRequestLocale()).boatDetail;
  try {
    const b = await boatsApi.getOne(id);
    const boat = adaptBoat(b, t);
    return {
      title: boat.name,
      description: fill(t.metaDescription, {
        name: boat.name,
        location: boat.location,
        price: boat.pricePerDay.toLocaleString("fr-FR"),
      }),
    };
  } catch {
    return { title: t.metaNotFound };
  }
}

const SPECS = (boat: BoatPageData, t: BoatDetailDict) =>
  [
    { icon: "fa-ruler-horizontal", val: boat.taille, label: t.specSize },
    { icon: "fa-users", val: boat.capacity ? `${boat.capacity} ${t.persons}` : t.dash, label: t.specCapacity },
    { icon: "fa-bed", val: boat.cabins ? `${boat.cabins} ${t.cabinsShort}` : t.dash, label: t.specBerths },
    { icon: "fa-id-card", val: boat.permisRequis ? t.required : t.notRequired, label: t.specLicense },
    { icon: "fa-gas-pump", val: boat.motorisation, label: t.specMotor },
    { icon: "fa-shield-halved", val: boat.caution ? `${boat.caution.toLocaleString("fr-FR")} €` : t.dash, label: t.specDeposit },
    { icon: "fa-user-tie", val: boat.avecSkipper ? t.included : t.notIncluded, label: t.specSkipper },
    { icon: "fa-droplet", val: boat.carburantInclus ? t.included : t.notIncluded, label: t.specFuel },
  ];

const RULE_ICONS = ["fa-clock", "fa-shield-halved", "fa-gas-pump", "fa-circle-question"] as const;

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const dict = getDictionary(await getRequestLocale());
  const t = dict.boatDetail;

  let boat: BoatPageData;
  let statut: string;
  try {
    const data = await boatsApi.getOne(id);
    statut = data.statut;
    boat = adaptBoat(data, t);
  } catch {
    notFound();
  }

  // Un bateau qui n'est pas publié (en attente, suspendu, refusé, en
  // maintenance) ne doit pas être consultable par un visiteur/locataire,
  // même via un lien direct.
  if (statut !== "disponible") notFound();

  const avis = await avisApi.getByBateau(id).catch(() => [] as AvisAPI[]);
  const summary = summarizeAvis(avis);
  boat.rating = summary.rating;
  boat.reviewCount = summary.count;

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label={t.breadcrumbAria}>
        <Link href="/"><i className="fa-solid fa-house" aria-hidden="true" /> {t.home}</Link>
        <span className="breadcrumb-sep" aria-hidden="true"><i className="fa-solid fa-chevron-right" /></span>
        <Link href="/bateaux">{t.boatsAvailable}</Link>
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
                {boat.rating > 0 ? boat.rating : t.new} &nbsp;·&nbsp;
                <a href="#avis">{boat.reviewCount} {t.reviews}</a>
              </div>
              <div className="product-loc">
                <i className="fa-solid fa-location-dot" aria-hidden="true" />
                {boat.location}
              </div>
            </div>
            <div className="product-owner">
              <div className="product-owner-avatar" aria-hidden="true">
                {boat.ownerInitials}
              </div>
              <div className="product-owner-info">
                <small>{t.offeredBy}</small>
                <strong>{boat.ownerName}</strong>
                {boat.ownerId != null && (
                  <Link href={`/proprietaires/${boat.ownerId}`}>
                    {t.viewProfile}{" "}
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: ".7rem" }} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="specs-grid" role="list" aria-label={t.specsAria}>
            {SPECS(boat, t).map((spec) => (
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
            <h3>{t.descriptionTitle}</h3>
            {boat.description ? (
              <p>{boat.description}</p>
            ) : (
              <>
                <p>
                  {fill(t.descFallback1, {
                    name: boat.name,
                    cabins: boat.cabins > 0 ? fill(t.descFallbackCabins, { n: boat.cabins }) : "",
                  })}
                </p>
                <p>{fill(t.descFallback2, { location: boat.location })}</p>
              </>
            )}
          </div>

          <div className="rules">
            <h3>{t.rulesTitle}</h3>
            <div className="rules-grid">
              {t.rules.map((rule, i) => (
                <div key={rule.title} className="rule-item">
                  <strong>
                    <i className={`fa-solid ${RULE_ICONS[i]}`} aria-hidden="true" /> {rule.title}
                  </strong>
                  <p>{rule.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="reviews-section" id="avis" aria-labelledby="reviews-title">
            <h3 id="reviews-title">
              <i className="fa-solid fa-star" style={{ color: "var(--star)" }} aria-hidden="true" />{" "}
              {boat.reviewCount > 0
                ? fill(t.reviewsSummary, { rating: boat.rating, count: boat.reviewCount })
                : t.reviewsNoneTitle}
            </h3>

            {boat.reviewCount > 0 && (
              <div className="reviews-overview">
                <div className="reviews-score-big">
                  <div className="reviews-score-num">{boat.rating}</div>
                  <div className="reviews-score-max">{t.outOf5}</div>
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
                    { label: t.barOwner, pct: (summary.proprietaire / 5) * 100 },
                    { label: t.barBoat, pct: (summary.bateau / 5) * 100 },
                    { label: t.barPlace, pct: (summary.lieu / 5) * 100 },
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

            {avis.length === 0 ? (
              <p style={{ color: "var(--text-2)" }}>
                {t.noReviewsYet}
              </p>
            ) : (
              avis.map((a) => {
                const reviewer = a.utilisateur;
                const authorName = reviewer ? `${reviewer.prenom} ${reviewer.nom}` : t.defaultReviewer;
                const initial = reviewer?.prenom?.[0]?.toUpperCase() ?? "?";

                return (
                  <article key={a.id} className="review-card">
                    <div className="review-author">
                      <div className="review-author-avatar" aria-hidden="true">{initial}</div>
                      <div className="review-author-info">
                        <strong>{authorName}</strong>
                        <span>{fmtReviewDate(a.dateAvis, dict.dateField.intlLocale)}</span>
                      </div>
                    </div>
                    <div className="review-rating" aria-label={fill(t.ratingAria, { note: a.note })}>
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={i < a.note ? "fa-solid fa-star" : "fa-regular fa-star"}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="review-body">{a.commentaire}</p>
                  </article>
                );
              })
            )}
          </section>

          <section className="location-section" aria-labelledby="location-title">
            <h3 id="location-title">{t.locationTitle}</h3>
            {boat.coordinates ? (
              <div className="location-map location-map--interactive">
                <LocationMapLoader lat={boat.coordinates.lat} lng={boat.coordinates.lng} />
              </div>
            ) : (
              <div className="location-map" role="img" aria-label={fill(t.mapAria, { location: boat.location })}>
                <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
                <span>{boat.location}</span>
              </div>
            )}
            <p className="location-label">
              <i className="fa-solid fa-location-dot" aria-hidden="true" />
              {fill(t.locationDisclaimer, { location: boat.location })}
            </p>
          </section>
        </div>

        <BookingCard
          boatId={boat.id}
          pricePerDay={boat.pricePerDay}
          rating={boat.rating}
          reviewCount={boat.reviewCount}
          capacity={boat.capacity || 8}
          ownerName={boat.ownerName}
        />
      </div>
    </div>
  );
}

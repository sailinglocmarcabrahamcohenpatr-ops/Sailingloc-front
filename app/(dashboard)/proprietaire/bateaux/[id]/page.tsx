import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/features/view-gallery";
import { boatsApi, avisApi, resolvePhotoUrl, type BoatAPI, type AvisAPI } from "@/shared/lib";
import { getRequestLocale, getDictionary } from "@/shared/i18n/get-dictionary";
import "./voir.css";

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

const fmtReviewDate = (d: string, locale: string) =>
  new Date(d).toLocaleDateString(locale, { month: "long", year: "numeric" });

interface PageProps {
  params: Promise<{ id: string }>;
}

interface BoatPageData {
  id: string;
  name: string;
  location: string;
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
  galleryImages: { src: string; alt: string }[];
}

function adaptBoat(b: BoatAPI, t: { mainViewAlt: string; cockpitAlt: string; mainCabinAlt: string; photoAlt: string; fallbackCountry: string; fallbackType: string }): BoatPageData {
  const sortedPhotos = (b.photos ?? [])
    .slice()
    .sort((a, c) => (a.ordreAffichage ?? 99) - (c.ordreAffichage ?? 99));

  const mainViewAlt = t.mainViewAlt.replace("{name}", b.nomBateau);
  const galleryImages =
    sortedPhotos.length > 0
      ? sortedPhotos.slice(0, 3).map((p, i) => ({
          src: resolvePhotoUrl(p.url),
          alt: p.description ?? (i === 0 ? mainViewAlt : t.photoAlt.replace("{n}", String(i + 1))),
        }))
      : [
          { src: `https://picsum.photos/seed/${b.id}-main/1200/800`, alt: mainViewAlt },
          { src: `https://picsum.photos/seed/${b.id}-cockpit/600/400`, alt: t.cockpitAlt },
          { src: `https://picsum.photos/seed/${b.id}-cabin/600/400`, alt: t.mainCabinAlt },
        ];

  return {
    id: String(b.id),
    name: b.nomBateau,
    location: b.port ? b.port.ville : t.fallbackCountry,
    type: b.typeBateau?.labelTypeBateau ?? t.fallbackType,
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
    galleryImages,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const b = await boatsApi.getOne(id);
    return { title: `${b.nomBateau} — SailingLoc` };
  } catch {
    return { title: "Bateau introuvable" };
  }
}

const SPECS = (boat: BoatPageData, t: ReturnType<typeof getDictionary>["ownerBoatViewPage"]) =>
  [
    { icon: "fa-ruler-horizontal", val: boat.taille, label: t.specSize },
    { icon: "fa-users", val: boat.capacity ? `${boat.capacity} ${t.personsShort}` : "—", label: t.specCapacity },
    { icon: "fa-bed", val: boat.cabins ? `${boat.cabins} ${t.cabinsShort}` : "—", label: t.specBerths },
    { icon: "fa-id-card", val: boat.permisRequis ? t.valueRequired : t.valueNotRequired, label: t.specLicense },
    { icon: "fa-gas-pump", val: boat.motorisation, label: t.specEngine },
    { icon: "fa-shield-halved", val: boat.caution ? `${boat.caution.toLocaleString(t.intlLocale)} €` : "—", label: t.specDeposit },
    { icon: "fa-user-tie", val: boat.avecSkipper ? t.valueIncluded : t.valueNotIncluded, label: t.specSkipper },
    { icon: "fa-droplet", val: boat.carburantInclus ? t.valueIncluded : t.valueNotIncluded, label: t.specFuel },
  ];

export default async function OwnerBoatViewPage({ params }: PageProps) {
  const { id } = await params;
  const t = getDictionary(await getRequestLocale()).ownerBoatViewPage;

  let boat: BoatPageData;
  try {
    const data = await boatsApi.getOne(id);
    boat = adaptBoat(data, t);
  } catch {
    notFound();
  }

  const avis = await avisApi.getByBateau(id).catch(() => [] as AvisAPI[]);
  const summary = summarizeAvis(avis);
  boat.rating = summary.rating;
  boat.reviewCount = summary.count;

  return (
    <div className="dash-page">
      <Link href="/proprietaire/bateaux" className="cal-back-link">
        <i className="fa-solid fa-arrow-left" /> {t.backLink}
      </Link>

      <Gallery images={boat.galleryImages} title={boat.name} />

      <div className="owner-view-stack">
        <div className="owner-view-card">
          <div className="product-type-tag">
            <i className="fa-solid fa-sailboat" aria-hidden="true" /> {boat.type}
          </div>
          <h1 className="product-title">{boat.name}</h1>
          <div className="product-meta">
            <div className="product-rating">
              <i className="fa-solid fa-star" aria-hidden="true" />
              {boat.rating > 0 ? boat.rating : t.newBadge} &nbsp;·&nbsp;
              <a href="#avis">{boat.reviewCount} {boat.reviewCount === 1 ? t.reviewsSingular : t.reviewsPlural}</a>
            </div>
            <div className="product-loc">
              <i className="fa-solid fa-location-dot" aria-hidden="true" />
              {boat.location}
            </div>
          </div>
        </div>

        <div className="owner-view-card">
          <h3 className="owner-view-card-title">{t.featuresTitle}</h3>
          <div className="specs-grid" role="list" aria-label={t.featuresAria}>
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
        </div>

        <div className="owner-view-card">
          <h3 className="owner-view-card-title">{t.descriptionTitle}</h3>
          {boat.description ? (
            <p>{boat.description}</p>
          ) : (
            <p style={{ color: "var(--text-2)" }}>{t.noDescription}</p>
          )}
        </div>

        <div className="owner-view-card" id="avis">
          <h3 className="owner-view-card-title">
            <i className="fa-solid fa-star" style={{ color: "var(--star)" }} aria-hidden="true" />{" "}
            {boat.reviewCount > 0
              ? `${boat.rating} · ${boat.reviewCount} ${boat.reviewCount === 1 ? t.reviewsSingular : t.reviewsPlural}`
              : t.noReviewsYet}
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
                  { label: t.ownerRow, pct: (summary.proprietaire / 5) * 100 },
                  { label: t.boatRow, pct: (summary.bateau / 5) * 100 },
                  { label: t.placeVisitedRow, pct: (summary.lieu / 5) * 100 },
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
            <p style={{ color: "var(--text-2)" }}>{t.noReviewsBody}</p>
          ) : (
            avis.map((a) => {
              const reviewer = a.utilisateur;
              const authorName = reviewer ? `${reviewer.prenom} ${reviewer.nom}` : t.tenantFallback;
              const initial = reviewer?.prenom?.[0]?.toUpperCase() ?? "?";

              return (
                <article key={a.id} className="review-card">
                  <div className="review-author">
                    <div className="review-author-avatar" aria-hidden="true">{initial}</div>
                    <div className="review-author-info">
                      <strong>{authorName}</strong>
                      <span>{fmtReviewDate(a.dateAvis, t.intlLocale)}</span>
                    </div>
                  </div>
                  <div className="review-rating" aria-label={t.ratingAria.replace("{n}", String(a.note))}>
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
        </div>
      </div>
    </div>
  );
}

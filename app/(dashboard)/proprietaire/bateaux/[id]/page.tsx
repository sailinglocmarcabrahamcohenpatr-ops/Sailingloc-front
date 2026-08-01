import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/features/view-gallery";
import { boatsApi, avisApi, resolvePhotoUrl, type BoatAPI, type AvisAPI } from "@/shared/lib";
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

const fmtReviewDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

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

export default async function OwnerBoatViewPage({ params }: PageProps) {
  const { id } = await params;

  let boat: BoatPageData;
  try {
    const data = await boatsApi.getOne(id);
    boat = adaptBoat(data);
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
        <i className="fa-solid fa-arrow-left" /> Mes bateaux
      </Link>

      <Gallery images={boat.galleryImages} />

      <div className="owner-view-stack">
        <div className="owner-view-card">
          <div className="product-type-tag">
            <i className="fa-solid fa-sailboat" aria-hidden="true" /> {boat.type}
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
        </div>

        <div className="owner-view-card">
          <h3 className="owner-view-card-title">Caractéristiques</h3>
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
        </div>

        <div className="owner-view-card">
          <h3 className="owner-view-card-title">Description</h3>
          {boat.description ? (
            <p>{boat.description}</p>
          ) : (
            <p style={{ color: "var(--text-2)" }}>Aucune description renseignée pour ce bateau.</p>
          )}
        </div>

        <div className="owner-view-card" id="avis">
          <h3 className="owner-view-card-title">
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
                  { label: "Propriétaire", pct: (summary.proprietaire / 5) * 100 },
                  { label: "Bateau", pct: (summary.bateau / 5) * 100 },
                  { label: "Lieu visité", pct: (summary.lieu / 5) * 100 },
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
            <p style={{ color: "var(--text-2)" }}>Ce bateau n&apos;a pas encore reçu d&apos;avis.</p>
          ) : (
            avis.map((a) => {
              const reviewer = a.utilisateur;
              const authorName = reviewer ? `${reviewer.prenom} ${reviewer.nom}` : "Locataire SailingLoc";
              const initial = reviewer?.prenom?.[0]?.toUpperCase() ?? "?";

              return (
                <article key={a.id} className="review-card">
                  <div className="review-author">
                    <div className="review-author-avatar" aria-hidden="true">{initial}</div>
                    <div className="review-author-info">
                      <strong>{authorName}</strong>
                      <span>{fmtReviewDate(a.dateAvis)}</span>
                    </div>
                  </div>
                  <div className="review-rating" aria-label={`Note : ${a.note} sur 5`}>
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

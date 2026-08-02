import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { boatsApi, type BoatAPI } from "@/shared/lib";
import { adaptBoatFromApi } from "@/entities/boat";
import { FavoriteBoatCard } from "@/features/toggle-favorite";
import "./owner-profile.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

function ownerIdOf(b: BoatAPI): number | undefined {
  return b.proprietaire?.id ?? b.utilisateur?.id ?? b.id_utilisateur;
}

async function getOwnerBoats(ownerId: number): Promise<BoatAPI[]> {
  const boats = await boatsApi.getAll({ statut: "disponible" });
  return boats.filter((b) => ownerIdOf(b) === ownerId);
}

const fmtMemberSince = (d: string) =>
  new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(d));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const ownerId = Number(id);
  if (!Number.isFinite(ownerId)) return { title: "Propriétaire introuvable" };

  try {
    const owned = await getOwnerBoats(ownerId);
    if (owned.length === 0) return { title: "Propriétaire introuvable" };
    const info = owned[0].proprietaire ?? owned[0].utilisateur;
    const name = info ? `${info.prenom} ${info.nom}`.trim() : "Propriétaire";
    return { title: `${name} — Propriétaire SailingLoc` };
  } catch {
    return { title: "Propriétaire introuvable" };
  }
}

export default async function OwnerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const ownerId = Number(id);
  if (!Number.isFinite(ownerId)) notFound();

  let owned: BoatAPI[];
  try {
    owned = await getOwnerBoats(ownerId);
  } catch {
    notFound();
  }
  if (owned.length === 0) notFound();

  const info = owned[0].proprietaire ?? owned[0].utilisateur;
  const name = info ? `${info.prenom} ${info.nom}`.trim() : "Propriétaire";
  const initials = info
    ? `${info.prenom?.[0] ?? ""}${info.nom?.[0] ?? ""}`.toUpperCase() || "?"
    : "?";
  const memberSince = info?.created_at ? fmtMemberSince(info.created_at) : null;

  const totalReviews = owned.reduce((sum, b) => sum + (b.nombreAvis ?? 0), 0);
  const avgRating =
    totalReviews > 0
      ? owned.reduce((sum, b) => sum + (b.noteMoyenne ?? 0) * (b.nombreAvis ?? 0), 0) / totalReviews
      : 0;

  const boats = owned.map(adaptBoatFromApi);

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="Fil d'Ariane">
        <Link href="/"><i className="fa-solid fa-house" aria-hidden="true" /> Accueil</Link>
        <span className="breadcrumb-sep" aria-hidden="true"><i className="fa-solid fa-chevron-right" /></span>
        <Link href="/bateaux">Bateaux disponibles</Link>
        <span className="breadcrumb-sep" aria-hidden="true"><i className="fa-solid fa-chevron-right" /></span>
        <span aria-current="page">{name}</span>
      </nav>

      <div className="owner-profile-header">
        <div className="owner-profile-avatar" aria-hidden="true">{initials}</div>
        <div className="owner-profile-info">
          <h1>{name}</h1>
          {memberSince && (
            <p className="owner-profile-since">
              <i className="fa-solid fa-calendar" aria-hidden="true" /> Propriétaire depuis {memberSince}
            </p>
          )}
          <div className="owner-profile-stats">
            <span>
              <i className="fa-solid fa-star" aria-hidden="true" />
              {totalReviews > 0 ? `${avgRating.toFixed(1)} · ${totalReviews} avis` : "Nouveau propriétaire"}
            </span>
            <span>
              <i className="fa-solid fa-sailboat" aria-hidden="true" />
              {boats.length} bateau{boats.length > 1 ? "x" : ""} proposé{boats.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <section className="owner-profile-boats" aria-labelledby="owner-boats-title">
        <h2 id="owner-boats-title" className="owner-profile-section-title">
          Bateaux proposés par {name}
        </h2>
        <div className="boats-result-grid">
          {boats.map((boat) => (
            <FavoriteBoatCard key={boat.id} boat={boat} />
          ))}
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { boatsApi, resolvePhotoUrl } from "@/shared/lib";
import type { BoatAPI } from "@/shared/lib";
import type { Boat } from "@/entities/boat";
import ReservationTunnel from "./ReservationTunnel";

interface PageProps {
  params: Promise<{ boatId: string }>;
  searchParams: Promise<{ startDate?: string; endDate?: string; guests?: string }>;
}

function adaptBoat(b: BoatAPI): Boat {
  const sortedPhotos = (b.photos ?? [])
    .slice()
    .sort((a, c) => (a.ordreAffichage ?? 99) - (c.ordreAffichage ?? 99))
    .map((p) => resolvePhotoUrl(p.url));

  return {
    id: String(b.id),
    name: b.nomBateau,
    location: b.port ? `${b.port.nom}, ${b.port.ville}` : "France",
    type: "voilier",
    rating: 0,
    reviewCount: 0,
    pricePerDay: typeof b.prixJour === "string" ? parseFloat(b.prixJour) : (b.prixJour ?? 0),
    deposit: typeof b.caution === "string" ? parseFloat(b.caution) : (b.caution ?? undefined),
    imageUrl: sortedPhotos[0] ?? "",
    imageSeed: String(b.id),
    photos: sortedPhotos,
    capacity: b.capacite ?? undefined,
    owner: { name: "Propriétaire", avatarSeed: String(b.id_utilisateur ?? b.id) },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { boatId } = await params;
  try {
    const b = await boatsApi.getOne(boatId);
    return { title: `Réserver ${b.nomBateau}` };
  } catch {
    return { title: "Réservation" };
  }
}

function getDefaultStartDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

function getDefaultEndDate(start: string) {
  const d = new Date(start + "T00:00:00");
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

export default async function ReservationPage({ params, searchParams }: PageProps) {
  const { boatId } = await params;
  const { startDate: sd, endDate: ed, guests: g } = await searchParams;

  // Réserver un bateau est une action réservée aux comptes locataires — un
  // compte propriétaire (ou admin) n'a pas vocation à louer via la plateforme
  // avec ce rôle. Le cookie `sailingloc_role` est posé côté client à la
  // connexion / au changement d'espace (cf. shared/lib/api-client.ts).
  const role = (await cookies()).get("sailingloc_role")?.value;
  if (role === "proprietaire" || role === "admin") {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <div className="messages-empty" style={{ minHeight: 280, padding: 40 }}>
          <i className="fa-solid fa-user-lock" aria-hidden="true" />
          <p>
            La réservation est réservée aux comptes locataires. Un compte propriétaire
            ne peut pas réserver de bateau — il vous faut un compte locataire.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/inscription" className="btn btn-primary btn-sm">
              <i className="fa-solid fa-user-plus" /> Créer un compte locataire
            </Link>
            <Link href="/proprietaire/bateaux" className="btn btn-outline btn-sm">
              <i className="fa-solid fa-arrow-left" /> Retour à mon espace propriétaire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let boat: Boat;
  let statut: string;
  try {
    const data = await boatsApi.getOne(boatId);
    statut = data.statut;
    boat = adaptBoat(data);
  } catch {
    notFound();
  }

  // Même garde que sur la fiche bateau : impossible de réserver un bateau
  // qui n'est pas publié, même en accédant directement à cette URL.
  if (statut !== "disponible") notFound();

  const startDate = sd ?? getDefaultStartDate();
  const endDate = ed ?? getDefaultEndDate(startDate);
  const guests = Math.min(Math.max(parseInt(g ?? "1") || 1, 1), boat.capacity ?? 8);

  return (
    <ReservationTunnel
      boat={boat}
      initialStartDate={startDate}
      initialEndDate={endDate}
      initialGuests={guests}
    />
  );
}

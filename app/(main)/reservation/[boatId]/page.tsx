import type { Metadata } from "next";
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
    return { title: `Réserver ${b.nomBateau} — SailingLoc` };
  } catch {
    return { title: "Réservation — SailingLoc" };
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

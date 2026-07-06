import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_BOATS } from "@/entities/boat";
import ReservationTunnel from "./ReservationTunnel";

interface PageProps {
  params: Promise<{ boatId: string }>;
  searchParams: Promise<{ startDate?: string; endDate?: string; guests?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { boatId } = await params;
  const boat = ALL_BOATS.find((b) => b.id === boatId);
  if (!boat) return { title: "Réservation — SailingLoc" };
  return { title: `Réserver ${boat.name} — SailingLoc` };
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

  const boat = ALL_BOATS.find((b) => b.id === boatId);
  if (!boat) notFound();

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

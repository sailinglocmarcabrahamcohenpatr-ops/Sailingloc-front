import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/entities/destination";
import { FavoriteBoatCard } from "@/features/toggle-favorite";
import { formatPrice } from "@/shared/lib/utils";
import { getCoherentPhoto } from "@/shared/lib/pexels";
import { getDestinationBoats, groupBoatsByPort } from "../../ports-data";
import "./port-detail.css";

interface PageProps {
  params: Promise<{ slug: string; port: string }>;
}

async function loadPort(slug: string, portId: string) {
  const dest = await getDestinationBySlug(slug);
  if (!dest) return null;
  const boats = await getDestinationBoats(dest);
  const port = groupBoatsByPort(boats).find((p) => p.id === portId);
  if (!port) return null;
  return { dest, port };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, port: portId } = await params;
  const found = await loadPort(slug, portId);
  if (!found) return { title: "Port introuvable" };
  return {
    title: `${found.port.name} — ${found.dest.name}`,
    description: `${found.port.boats.length} bateaux disponibles au port de ${found.port.name}, ${found.port.ville}.`,
  };
}

export default async function PortDetailPage({ params }: PageProps) {
  const { slug, port: portId } = await params;
  const found = await loadPort(slug, portId);
  if (!found) notFound();
  const { dest, port } = found;
  const heroPhoto = await getCoherentPhoto(`${port.ville} marina port boats`, port.imageSeed, "1600/500");

  return (
    <>
      <section className="port-hero">
        <Image
          src={heroPhoto}
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="port-hero-overlay" />
        <i className="fa-solid fa-anchor port-hero-watermark" aria-hidden="true" />
        <div className="container port-hero-content">
          <div className="dest-detail-breadcrumb">
            <Link href="/destinations">Destinations</Link> / <Link href={`/destinations/${dest.slug}`}>{dest.name}</Link> / <span>{port.name}</span>
          </div>
          <span className="port-hero-eyebrow"><i className="fa-solid fa-anchor" aria-hidden="true" /> Port</span>
          <h1>{port.name}</h1>
          <p className="port-hero-ville"><i className="fa-solid fa-location-dot" aria-hidden="true" /> {port.ville}, {dest.name}</p>
          <div className="port-hero-stats">
            <span><i className="fa-solid fa-sailboat" aria-hidden="true" /> {port.boats.length} bateau{port.boats.length > 1 ? "x" : ""} disponible{port.boats.length > 1 ? "s" : ""}</span>
            <span><i className="fa-solid fa-euro-sign" aria-hidden="true" /> À partir de {formatPrice(port.priceFrom)} / jour</span>
          </div>
        </div>
      </section>

      <section className="section port-boats-section">
        <div className="container">
          <div className="section-hd fade-in">
            <div>
              <span className="port-section-eyebrow">
                <i className="fa-solid fa-sailboat" aria-hidden="true" /> Location de bateaux
              </span>
              <h2>Bateaux au port de {port.name}</h2>
            </div>
            <p>Toutes les annonces disponibles à cet emplacement</p>
          </div>
          <div className="port-boats-panel">
            <div className="boats-result-grid">
              {port.boats.map((boat) => (
                <FavoriteBoatCard key={boat.id} boat={boat} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

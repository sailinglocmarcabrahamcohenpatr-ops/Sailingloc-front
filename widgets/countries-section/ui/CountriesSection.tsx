import Image from "next/image";
import Link from "next/link";
import { COUNTRIES } from "@/shared/config";

export default function CountriesSection() {
  return (
    <section className="section-py" aria-labelledby="countries-title">
      <div className="container">
        <div className="section-hd fade-in">
          <h2 className="section-title" id="countries-title">
            Les principaux pays de SailingLoc
          </h2>
          <Link href="/bateaux" className="section-link">
            Voir tout <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
        <div className="countries-grid">
          {COUNTRIES.map((country) => (
            <Link
              key={country.name}
              href={`/bateaux?pays=${encodeURIComponent(country.name)}`}
              className="country-card fade-in"
              aria-label={`${country.flag} ${country.name} — ${country.boatCount.toLocaleString("fr-FR")} bateaux`}
            >
              <Image
                src={`https://picsum.photos/seed/${country.imageSeed}/600/400`}
                alt={`Navigation en ${country.name}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                style={{ objectFit: "cover" }}
              />
              <div className="country-card-overlay" aria-hidden="true" />
              <div className="country-card-label">
                {country.flag} {country.name}
                <div className="country-card-sub">
                  {country.boatCount.toLocaleString("fr-FR")} bateaux
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

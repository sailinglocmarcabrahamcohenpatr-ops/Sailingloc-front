import Link from "next/link";
import Image from "next/image";
import "./owner-cta.css";

export default function OwnerCTA() {
  return (
    <section className="section-py" aria-labelledby="owner-cta-title">
      <div className="owner-cta fade-in">
        <div className="owner-cta-text">
          <span className="tag">
            <i className="fa-solid fa-anchor" aria-hidden="true" /> Propriétaires
          </span>
          <h2 id="owner-cta-title">
            Votre bateau dort au port ? Mettez-le en location.
          </h2>
          <p>
            Rejoignez des milliers de propriétaires qui rentabilisent leur bateau
            tout en le gardant disponible pour leurs propres sorties. Assurance
            incluse, paiement sécurisé.
          </p>
          <div className="cta-row">
            <Link href="#" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-plus" aria-hidden="true" /> Mettre en location
            </Link>
            <Link
              href="#"
              className="btn btn-outline"
              style={{ borderColor: "rgba(255,255,255,.3)", color: "rgba(255,255,255,.8)" }}
            >
              En savoir plus
            </Link>
          </div>
        </div>
        <div className="owner-cta-img" aria-hidden="true">
          <Image
            src="https://picsum.photos/seed/marina-sunset/700/500"
            alt="Marina au coucher de soleil"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </section>
  );
}

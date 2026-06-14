import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-split">

      {/* ── Panneau gauche : photo + branding ── */}
      <div className="auth-split-left" aria-hidden="true">
        <Image
          src="https://picsum.photos/seed/sailingloc-auth/900/1200"
          alt=""
          fill
          sizes="50vw"
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="auth-split-overlay" />
        <div className="auth-split-brand">
          <Link href="/" className="auth-split-logo">
            <i className="fa-solid fa-anchor" /> SailingLoc
          </Link>
          <blockquote className="auth-split-quote">
            <p>« Votre prochaine aventure en mer commence ici. »</p>
            <footer>Méditerranée · Atlantique · Europe</footer>
          </blockquote>
          <div className="auth-split-trust">
            <span><i className="fa-solid fa-shield-halved" /> Assurance incluse</span>
            <span><i className="fa-solid fa-lock" /> Paiement sécurisé</span>
            <span><i className="fa-solid fa-star" /> 4.9 / 5</span>
          </div>
        </div>
      </div>

      {/* ── Panneau droit : formulaire ── */}
      <div className="auth-split-right">
        <div className="auth-split-topbar">
          <Link href="/" className="auth-split-back">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Retour au site
          </Link>
        </div>

        <main className="auth-split-main">
          {children}
        </main>

        <footer className="auth-split-footer">
          <Link href="/contact">Contact</Link>
          <Link href="#">CGU</Link>
          <Link href="#">Confidentialité</Link>
          <span>© 2025 SailingLoc</span>
        </footer>
      </div>

    </div>
  );
}

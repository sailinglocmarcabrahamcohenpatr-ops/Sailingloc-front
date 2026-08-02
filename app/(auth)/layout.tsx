"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/shared/ui";
import "@/features/auth/ui/auth.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const invertLogo = pathname === "/connexion";

  return (
    <div className="auth-page">

      {/* ── Zone split (gauche + droite) ── */}
      <div className="auth-split">

        {/* ── Panneau gauche ── */}
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
              <Logo onDark invert={invertLogo} />
            </Link>

            <div className="auth-split-center">
              <p className="auth-split-eyebrow">Rejoignez la communauté</p>
              <h2 className="auth-split-headline">
                La mer vous attend.<br />Votre bateau aussi.
              </h2>
              <p className="auth-split-sub">
                Louez le bateau de vos rêves ou rentabilisez le vôtre. Simple, sécurisé, et assuré.
              </p>

              <div className="auth-split-testi">
                <div className="auth-split-testi-avatar">MD</div>
                <div>
                  <p className="auth-split-testi-quote">
                    « En louant mon voilier 8 semaines l&apos;été, je couvre toutes mes charges annuelles. »
                  </p>
                  <span className="auth-split-testi-name">Marc D. · Marseille · Sun Odyssey 440</span>
                </div>
              </div>

              <div className="auth-split-stats">
                <div className="auth-split-stat">
                  <strong>3 200+</strong>
                  <span>Propriétaires</span>
                </div>
                <div className="auth-split-stat">
                  <strong>50 000+</strong>
                  <span>Voyages</span>
                </div>
                <div className="auth-split-stat">
                  <strong>4.9/5</strong>
                  <span>Satisfaction</span>
                </div>
              </div>
            </div>

            <div className="auth-split-trust">
              <span><i className="fa-solid fa-shield-halved" /> Assurance incluse</span>
              <span><i className="fa-solid fa-lock" /> Paiement sécurisé</span>
              <span><i className="fa-solid fa-id-card" /> Identités vérifiées</span>
            </div>
          </div>
        </div>

        {/* ── Panneau formulaire droit (défile si besoin) ── */}
        <div className="auth-split-right">
          <div className="auth-split-topbar">
            <Link href="/" className="auth-split-back">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Retour au site
            </Link>
          </div>

          <div className="auth-split-right-logo">
            <Link href="/">
              <Logo invert={invertLogo} />
            </Link>
          </div>

          <main className="auth-split-main">
            {children}
          </main>
        </div>

      </div>

      {/* ── Footer pleine largeur ── */}
      <footer className="auth-footer-full">
        <Link href="/contact">Contact</Link>
        <Link href="#">CGU</Link>
        <Link href="#">Confidentialité</Link>
        <span>© 2026 SailingLoc</span>
      </footer>

    </div>
  );
}

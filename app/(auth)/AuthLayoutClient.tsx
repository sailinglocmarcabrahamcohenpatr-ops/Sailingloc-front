"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Logo } from "@/shared/ui";
import { useI18n, LocaleLink as Link } from "@/shared/i18n";
import { formatStatNumber } from "@/shared/lib/site-stats";
import type { AuthStatsValues } from "./getAuthStats";
import "@/features/auth/ui/auth.css";

export default function AuthLayoutClient({
  children,
  stats,
}: {
  children: React.ReactNode;
  stats: AuthStatsValues;
}) {
  const t = useI18n().dict.authLayout;
  const pathname = usePathname();
  const invertLogo = pathname.endsWith("/connexion");

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
              <p className="auth-split-eyebrow">{t.eyebrow}</p>
              <h2 className="auth-split-headline">
                {t.headline1}<br />{t.headline2}
              </h2>
              <p className="auth-split-sub">{t.sub}</p>

              <div className="auth-split-testi">
                <div className="auth-split-testi-avatar">MD</div>
                <div>
                  <p className="auth-split-testi-quote">{t.testiQuote}</p>
                  <span className="auth-split-testi-name">{t.testiName}</span>
                </div>
              </div>

              <div className="auth-split-stats">
                <div className="auth-split-stat">
                  <strong>{formatStatNumber(stats.owners)}+</strong>
                  <span>{t.statOwners}</span>
                </div>
                <div className="auth-split-stat">
                  <strong>{formatStatNumber(stats.trips)}+</strong>
                  <span>{t.statTrips}</span>
                </div>
                <div className="auth-split-stat">
                  <strong>{formatStatNumber(stats.satisfaction, 1)}/5</strong>
                  <span>{t.statSatisfaction}</span>
                </div>
              </div>
            </div>

            <div className="auth-split-trust">
              <span><i className="fa-solid fa-shield-halved" /> {t.trustInsurance}</span>
              <span><i className="fa-solid fa-lock" /> {t.trustPayment}</span>
              <span><i className="fa-solid fa-id-card" /> {t.trustId}</span>
            </div>
          </div>
        </div>

        {/* ── Panneau formulaire droit (défile si besoin) ── */}
        <div className="auth-split-right">
          <div className="auth-split-topbar">
            <Link href="/" className="auth-split-back">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> {t.backToSite}
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
        <Link href="/cgu">{t.footerCgu}</Link>
        <Link href="/confidentialite">{t.footerPrivacy}</Link>
        <span>© 2026 SailingLoc</span>
      </footer>

    </div>
  );
}

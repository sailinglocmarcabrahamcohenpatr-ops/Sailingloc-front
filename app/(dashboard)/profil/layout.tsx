"use client";

import "./profil.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";

const NAV = [
  { href: "/profil",              icon: "fa-house",          label: "Aperçu",        exact: true },
  { href: "/profil/reservations", icon: "fa-calendar-check", label: "Réservations" },
  { href: "/profil/messages",     icon: "fa-envelope",       label: "Messages",      badge: 1 },
  { href: "/profil/favoris",      icon: "fa-heart",          label: "Favoris" },
  { href: "/profil/documents",    icon: "fa-id-card",        label: "Documents" },
  { href: "/profil/paiements",    icon: "fa-credit-card",    label: "Paiements" },
  { href: "/profil/parametres",   icon: "fa-sliders",        label: "Paramètres" },
];

const BOTTOM_NAV = [
  { href: "/bateaux", icon: "fa-magnifying-glass", label: "Trouver un bateau" },
  { href: "/contact", icon: "fa-headset",          label: "Support" },
];

function avatarBg(seed: string) {
  const palette = ["#1866F2", "#8B5CF6", "#EC4899", "#0EA5E9", "#10B981"];
  const sum = seed.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  return palette[sum % palette.length];
}

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();

  const initials = user?.initials ?? "?";
  const name     = user?.name    ?? "Mon compte";
  const email    = user?.email   ?? "";

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <Navbar />

      <div className="profil-shell">
        <div className="profil-shell-inner">

          {/* ── Sidebar gauche ── */}
          <aside className="profil-sidebar">

            {/* Carte utilisateur */}
            <div className="profil-user-card">
              <div
                className="profil-user-avatar"
                style={{ background: avatarBg(name) }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="profil-user-info">
                <strong className="profil-user-name">{name}</strong>
                <span className="profil-user-email">{email}</span>
                <span className="profil-user-role">
                  <i className="fa-solid fa-user" aria-hidden="true" /> Locataire
                </span>
              </div>
            </div>

            {/* Navigation principale */}
            <nav className="profil-nav" aria-label="Mon espace">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`profil-nav-item${isActive(item.href, item.exact) ? " active" : ""}`}
                >
                  <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="profil-nav-badge">{item.badge}</span>
                  ) : null}
                </Link>
              ))}
            </nav>

            <div className="profil-nav-sep" />

            {/* Navigation secondaire */}
            <nav className="profil-nav" aria-label="Liens utiles">
              {BOTTOM_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="profil-nav-item profil-nav-item--secondary"
                >
                  <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                type="button"
                className="profil-nav-item profil-nav-item--logout"
                onClick={handleLogout}
              >
                <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
                <span>Déconnexion</span>
              </button>
            </nav>

          </aside>

          {/* ── Contenu principal ── */}
          <main className="profil-content">
            {children}
          </main>

        </div>
      </div>

      <Footer />
    </>
  );
}


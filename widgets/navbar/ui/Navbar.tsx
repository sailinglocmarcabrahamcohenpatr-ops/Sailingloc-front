"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib";

const navLinks = [
  { href: "/bateaux", label: "Bateaux" },
  { href: "/destinations", label: "Destinations" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/proprietaire", label: "Propriétaires" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "#" || href.startsWith("/#")) return false;
  const cleanPath = href.split("?")[0];
  if (cleanPath === "/") return pathname === "/";
  return pathname === cleanPath || pathname.startsWith(cleanPath + "/");
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            <i className="fa-solid fa-anchor" aria-hidden="true" />
            SailingLoc
          </Link>

          <nav className="navbar-nav" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={isActive(link.href, pathname) ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="navbar-actions">
            {user ? (
              <>
                <Link
                  href={user.role === "proprietaire" ? "/proprietaire/messages" : "/profil/messages"}
                  className="navbar-icon-btn"
                  aria-label="Messages"
                >
                  <i className="fa-solid fa-envelope" />
                  <span className="navbar-badge">1</span>
                </Link>

                <div className="navbar-user-menu" ref={userMenuRef}>
                  <button
                    className="navbar-avatar-btn"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    aria-label="Menu utilisateur"
                  >
                    <span className="navbar-avatar">{user.initials}</span>
                    <i className={`fa-solid fa-chevron-${userMenuOpen ? "up" : "down"} navbar-avatar-caret`} />
                  </button>

                  {userMenuOpen && (
                    <div className="navbar-dropdown" role="menu">
                      <div className="navbar-dropdown-user">
                        <span className="navbar-dropdown-name">{user.name}</span>
                        <span className="navbar-dropdown-role">
                          {user.role === "proprietaire" ? "Propriétaire" : "Locataire"}
                        </span>
                      </div>
                      <div className="navbar-dropdown-sep" />
                      {user.role === "locataire" ? (
                        <>
                          <Link href="/profil" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-user" /> Mon profil
                          </Link>
                          <Link href="/profil/reservations" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-calendar-check" /> Mes réservations
                          </Link>
                          <Link href="/profil/messages" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-envelope" /> Messages
                          </Link>
                          <div className="navbar-dropdown-sep" />
                          <Link href="/proprietaire/bateaux" className="navbar-dropdown-item navbar-dropdown-item--switch" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-sailboat" /> Espace propriétaire
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/proprietaire/bateaux" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-sailboat" /> Mes bateaux
                          </Link>
                          <Link href="/proprietaire/reservations" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-calendar-check" /> Réservations
                          </Link>
                          <Link href="/proprietaire/revenus" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-chart-line" /> Revenus
                          </Link>
                          <div className="navbar-dropdown-sep" />
                          <Link href="/profil" className="navbar-dropdown-item navbar-dropdown-item--switch" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-user" /> Espace locataire
                          </Link>
                        </>
                      )}
                      <div className="navbar-dropdown-sep" />
                      <button className="navbar-dropdown-item navbar-dropdown-item--danger" onClick={handleLogout} role="menuitem">
                        <i className="fa-solid fa-right-from-bracket" /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/connexion" className="btn btn-ghost">
                <i className="fa-solid fa-user" aria-hidden="true" /> Se connecter
              </Link>
            )}

            <button
              className="mobile-menu-btn"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <i className={`fa-solid ${mobileOpen ? "fa-xmark" : "fa-bars"}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav${mobileOpen ? " open" : ""}`} role="dialog" aria-label="Menu de navigation">
        {navLinks.map((link) => (
          <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}>
            {link.label}
          </Link>
        ))}
        {user ? (
          <>
            <Link href={user.role === "locataire" ? "/profil" : "/proprietaire/bateaux"} onClick={() => setMobileOpen(false)}>
              Mon espace
            </Link>
            <button className="btn btn-outline mobile-cta" onClick={() => { logout(); setMobileOpen(false); router.push("/"); }}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/connexion" className="btn btn-primary mobile-cta" onClick={() => setMobileOpen(false)}>
              <i className="fa-solid fa-user" /> Se connecter
            </Link>
          </>
        )}
      </div>
    </>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib";
import "./navbar.css";

const navLinks = [
  { href: "/bateaux", label: "Bateaux", icon: "fa-sailboat" },
  { href: "/destinations", label: "Destinations", icon: "fa-map-location-dot" },
  { href: "/comment-ca-marche", label: "Comment ça marche", icon: "fa-circle-question" },
  { href: "/proprietaire", label: "Propriétaires", icon: "fa-key" },
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
  const { user, logout, switchRole } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // La section courante (URL) fait foi pour l'affichage — pas le rôle stocké
  // sur le compte — pour qu'on ne se retrouve jamais renvoyé vers l'espace
  // propriétaire alors qu'on navigue dans l'espace locataire (ou l'inverse).
  const isOwnerSection = pathname.startsWith("/proprietaire");
  // Un administrateur n'a pas d'espace locataire/propriétaire : il n'a accès
  // qu'au dashboard admin, donc le menu ne doit proposer que ça.
  const isAdmin = user?.role === "admin";

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
                <i className={`fa-solid ${link.icon}`} aria-hidden="true" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="navbar-actions">
            {user ? (
              <>
                {!isAdmin && (
                  <Link
                    href={isOwnerSection ? "/proprietaire/messages" : "/profil/messages"}
                    className="navbar-icon-btn"
                    aria-label="Messages"
                  >
                    <i className="fa-solid fa-envelope" />
                    <span className="navbar-badge">1</span>
                  </Link>
                )}

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
                          {isAdmin ? "Administrateur" : isOwnerSection ? "Propriétaire" : "Locataire"}
                        </span>
                      </div>
                      <div className="navbar-dropdown-sep" />
                      {isAdmin ? (
                        <Link href="/admin/dashboard" className="navbar-dropdown-item navbar-dropdown-item--switch" onClick={() => setUserMenuOpen(false)} role="menuitem">
                          <i className="fa-solid fa-gauge" /> Tableau de bord admin
                        </Link>
                      ) : !isOwnerSection ? (
                        <>
                          {user.role === "proprietaire" ? (
                            <Link href="/proprietaire/bateaux" className="navbar-dropdown-item navbar-dropdown-item--switch" onClick={() => { switchRole(); setUserMenuOpen(false); }} role="menuitem">
                              <i className="fa-solid fa-sailboat" /> Espace propriétaire
                            </Link>
                          ) : (
                            <Link href="/profil/devenir-proprietaire" className="navbar-dropdown-item navbar-dropdown-item--switch" onClick={() => setUserMenuOpen(false)} role="menuitem">
                              <i className="fa-solid fa-sailboat" /> Devenir propriétaire
                            </Link>
                          )}
                          <div className="navbar-dropdown-sep" />
                          <Link href="/profil" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-user" /> Mon profil
                          </Link>
                          <Link href="/profil/reservations" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-calendar-check" /> Mes réservations
                          </Link>
                          <Link href="/profil/messages" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-envelope" /> Messages
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/profil" className="navbar-dropdown-item navbar-dropdown-item--switch" onClick={() => { switchRole(); setUserMenuOpen(false); }} role="menuitem">
                            <i className="fa-solid fa-user" /> Espace locataire
                          </Link>
                          <div className="navbar-dropdown-sep" />
                          <Link href="/proprietaire/bateaux" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-sailboat" /> Mes bateaux
                          </Link>
                          <Link href="/proprietaire/reservations" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-calendar-check" /> Réservations
                          </Link>
                          <Link href="/proprietaire/revenus" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-chart-line" /> Revenus
                          </Link>
                        </>
                      )}
                      <div className="navbar-dropdown-sep" />
                      {!isAdmin && (
                        <>
                          <Link href="/profil/parametres" className="navbar-dropdown-item navbar-dropdown-item--nav" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <span className="navbar-dropdown-item-label"><i className="fa-solid fa-gear" /> Paramètres et confidentialité</span>
                          </Link>
                          <Link href="/contact" className="navbar-dropdown-item navbar-dropdown-item--nav" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <span className="navbar-dropdown-item-label"><i className="fa-solid fa-circle-question" /> Aide et assistance</span>
                            <i className="fa-solid fa-chevron-right" />
                          </Link>
                          <Link href="/profil/affichage" className="navbar-dropdown-item navbar-dropdown-item--nav" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <span className="navbar-dropdown-item-label"><i className="fa-solid fa-moon" /> Affichage et accessibilité</span>
                            <i className="fa-solid fa-chevron-right" />
                          </Link>
                          <div className="navbar-dropdown-sep" />
                        </>
                      )}
                      <button className="navbar-dropdown-item navbar-dropdown-item--danger" onClick={handleLogout} role="menuitem">
                        <i className="fa-solid fa-right-from-bracket" /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/connexion" className="btn btn-ghost" aria-label="Se connecter">
                <i className="fa-solid fa-user" aria-hidden="true" />
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
            <i className={`fa-solid ${link.icon}`} aria-hidden="true" />
            {link.label}
          </Link>
        ))}
        {user ? (
          <>
            <Link href={isAdmin ? "/admin/dashboard" : isOwnerSection ? "/proprietaire/bateaux" : "/profil"} onClick={() => setMobileOpen(false)}>
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

"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useMessages, useFavoris } from "@/shared/lib";
import { LocaleLink as Link, useI18n, LanguageSwitcher, stripLocale } from "@/shared/i18n";
import { Logo } from "@/shared/ui";
import NotificationsBell from "@/widgets/notifications/ui/NotificationsBell";
import "./navbar.css";

const NAV_ITEMS = [
  { href: "/", key: "home", icon: "fa-house" },
  { href: "/bateaux", key: "boats", icon: "fa-sailboat" },
  { href: "/destinations", key: "destinations", icon: "fa-map-location-dot" },
  { href: "/comment-ca-marche", key: "howItWorks", icon: "fa-circle-question" },
  { href: "/proprietaire", key: "owners", icon: "fa-key" },
] as const;

function isActive(href: string, pathname: string): boolean {
  if (href === "#" || href.startsWith("/#")) return false;
  const cleanPath = href.split("?")[0];
  if (cleanPath === "/") return pathname === "/";
  return pathname === cleanPath || pathname.startsWith(cleanPath + "/");
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { pathname: canonicalPath } = stripLocale(pathname);
  const router = useRouter();
  const { dict } = useI18n();
  const t = dict.nav;
  const tc = dict.common;
  const { user, logout, switchRole } = useAuth();
  const { unreadCount } = useMessages();
  const { count: favorisCount } = useFavoris();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // La section courante (URL) fait foi pour l'affichage — pas le rôle stocké
  // sur le compte — pour qu'on ne se retrouve jamais renvoyé vers l'espace
  // propriétaire alors qu'on navigue dans l'espace locataire (ou l'inverse).
  const isOwnerSection = canonicalPath.startsWith("/proprietaire");
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

  // Transparence au scroll : fond translucide/frosted dès qu'on quitte le haut.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            <Logo />
          </Link>

          <nav className="navbar-nav" aria-label={t.mainNav}>
            {NAV_ITEMS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={isActive(link.href, canonicalPath) ? "active" : ""}
              >
                <i className={`fa-solid ${link.icon}`} aria-hidden="true" />
                {t[link.key]}
              </Link>
            ))}
          </nav>

          <div className="navbar-actions">
            {user ? (
              <>
                {!isAdmin && (
                  <>
                    <Link href="/profil/favoris" className="navbar-icon-btn" aria-label={t.favorites}>
                      <i className="fa-solid fa-heart" />
                      {favorisCount > 0 && <span className="navbar-badge">{favorisCount}</span>}
                    </Link>
                    <NotificationsBell />
                    <Link
                      href={isOwnerSection || user.role === "proprietaire" ? "/proprietaire/messages" : "/profil/messages"}
                      className="navbar-icon-btn"
                      aria-label={t.messages}
                    >
                      <i className="fa-solid fa-envelope" />
                      {unreadCount > 0 && <span className="navbar-badge">{unreadCount}</span>}
                    </Link>
                  </>
                )}

                <div className="navbar-user-menu" ref={userMenuRef}>
                  <button
                    className="navbar-avatar-btn"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    aria-label={t.userMenu}
                  >
                    <span className="navbar-avatar">{user.initials}</span>
                    <i className={`fa-solid fa-chevron-${userMenuOpen ? "up" : "down"} navbar-avatar-caret`} />
                  </button>

                  {userMenuOpen && (
                    <div className="navbar-dropdown" role="menu">
                      <div className="navbar-dropdown-user">
                        <span className="navbar-dropdown-name">{user.name}</span>
                        <span className="navbar-dropdown-role">
                          {isAdmin
                            ? t.roleAdmin
                            : isOwnerSection || user.role === "proprietaire"
                            ? t.roleOwner
                            : t.roleTenant}
                        </span>
                      </div>
                      <div className="navbar-dropdown-sep" />
                      {isAdmin ? (
                        <Link href="/admin/dashboard" className="navbar-dropdown-item navbar-dropdown-item--switch" onClick={() => setUserMenuOpen(false)} role="menuitem">
                          <i className="fa-solid fa-gauge" /> {t.adminDashboard}
                        </Link>
                      ) : !isOwnerSection ? (
                        <>
                          {user.role === "proprietaire" ? (
                            <Link href="/proprietaire/bateaux" className="navbar-dropdown-item navbar-dropdown-item--switch" onClick={() => { switchRole("proprietaire"); setUserMenuOpen(false); }} role="menuitem">
                              <i className="fa-solid fa-sailboat" /> {t.ownerSpace}
                            </Link>
                          ) : (
                            <Link href="/profil/devenir-proprietaire" className="navbar-dropdown-item navbar-dropdown-item--switch" onClick={() => setUserMenuOpen(false)} role="menuitem">
                              <i className="fa-solid fa-sailboat" /> {t.becomeOwner}
                            </Link>
                          )}
                          <div className="navbar-dropdown-sep" />
                          <Link
                            href={user.role === "proprietaire" ? "/proprietaire/dashboard" : "/profil"}
                            className="navbar-dropdown-item"
                            onClick={() => { if (user.role === "proprietaire") switchRole("proprietaire"); setUserMenuOpen(false); }}
                            role="menuitem"
                          >
                            <i className="fa-solid fa-user" /> {t.myProfile}
                          </Link>
                          <Link
                            href={user.role === "proprietaire" ? "/proprietaire/reservations" : "/profil/reservations"}
                            className="navbar-dropdown-item"
                            onClick={() => setUserMenuOpen(false)}
                            role="menuitem"
                          >
                            <i className="fa-solid fa-calendar-check" /> {user.role === "proprietaire" ? t.reservations : t.myReservations}
                          </Link>
                          <Link
                            href={user.role === "proprietaire" ? "/proprietaire/messages" : "/profil/messages"}
                            className="navbar-dropdown-item"
                            onClick={() => setUserMenuOpen(false)}
                            role="menuitem"
                          >
                            <i className="fa-solid fa-envelope" /> {t.messages}
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/profil" className="navbar-dropdown-item navbar-dropdown-item--switch" onClick={() => { switchRole("locataire"); setUserMenuOpen(false); }} role="menuitem">
                            <i className="fa-solid fa-user" /> {t.tenantSpace}
                          </Link>
                          <div className="navbar-dropdown-sep" />
                          <Link href="/proprietaire/bateaux" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-sailboat" /> {t.myBoats}
                          </Link>
                          <Link href="/proprietaire/reservations" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-calendar-check" /> {t.reservations}
                          </Link>
                          <Link href="/proprietaire/revenus" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <i className="fa-solid fa-chart-line" /> {t.revenue}
                          </Link>
                        </>
                      )}
                      <div className="navbar-dropdown-sep" />
                      {!isAdmin && (
                        <>
                          <Link href="/profil/parametres" className="navbar-dropdown-item navbar-dropdown-item--nav" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <span className="navbar-dropdown-item-label"><i className="fa-solid fa-gear" /> {t.settings}</span>
                          </Link>
                          <Link href="/contact" className="navbar-dropdown-item navbar-dropdown-item--nav" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <span className="navbar-dropdown-item-label"><i className="fa-solid fa-circle-question" /> {t.help}</span>
                            <i className="fa-solid fa-chevron-right" />
                          </Link>
                          <Link href="/profil/affichage" className="navbar-dropdown-item navbar-dropdown-item--nav" onClick={() => setUserMenuOpen(false)} role="menuitem">
                            <span className="navbar-dropdown-item-label"><i className="fa-solid fa-moon" /> {t.display}</span>
                            <i className="fa-solid fa-chevron-right" />
                          </Link>
                          <div className="navbar-dropdown-sep" />
                        </>
                      )}
                      <button className="navbar-dropdown-item navbar-dropdown-item--danger" onClick={handleLogout} role="menuitem">
                        <i className="fa-solid fa-right-from-bracket" /> {tc.logout}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/connexion" className="btn btn-ghost" aria-label={tc.login}>
                <i className="fa-solid fa-user" aria-hidden="true" />
              </Link>
            )}

            <LanguageSwitcher className="navbar-lang" />

            <button
              className="mobile-menu-btn"
              aria-label={mobileOpen ? t.closeMenu : t.openMenu}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <i className={`fa-solid ${mobileOpen ? "fa-xmark" : "fa-bars"}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav${mobileOpen ? " open" : ""}`} role="dialog" aria-label={t.mainNav}>
        {NAV_ITEMS.map((link) => (
          <Link key={link.key} href={link.href} onClick={() => setMobileOpen(false)}>
            <i className={`fa-solid ${link.icon}`} aria-hidden="true" />
            {t[link.key]}
          </Link>
        ))}
        {user ? (
          <>
            <Link href={isAdmin ? "/admin/dashboard" : isOwnerSection ? "/proprietaire/bateaux" : "/profil"} onClick={() => setMobileOpen(false)}>
              {tc.mySpace}
            </Link>
            <button className="btn btn-outline mobile-cta" onClick={() => { logout(); setMobileOpen(false); router.push("/"); }}>
              {tc.logout}
            </button>
          </>
        ) : (
          <>
            <Link href="/connexion" className="btn btn-primary mobile-cta" onClick={() => setMobileOpen(false)}>
              <i className="fa-solid fa-user" /> {tc.login}
            </Link>
          </>
        )}
        <div className="mobile-nav-lang"><LanguageSwitcher /></div>
      </div>
    </>
  );
}

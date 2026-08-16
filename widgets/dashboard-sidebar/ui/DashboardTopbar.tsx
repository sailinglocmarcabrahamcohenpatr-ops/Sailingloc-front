"use client";

import "./DashboardTopbar.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth, usePreferences, useMessages } from "@/shared/lib";
import NotificationsBell from "@/widgets/notifications/ui/NotificationsBell";

const PAGE_TITLES: Record<string, string> = {
  "/proprietaire/dashboard":          "Dashboard",
  "/proprietaire/bateaux":            "Mes bateaux",
  "/proprietaire/bateaux/nouveau":    "Ajouter un bateau",
  "/proprietaire/reservations":       "Réservations",
  "/proprietaire/revenus":            "Revenus",
  "/proprietaire/messages":           "Messages",
  "/proprietaire/profil":             "Mon profil",
  "/admin/dashboard":                 "Dashboard",
  "/admin/avis":                      "Avis",
  "/admin/reservations":              "Réservations",
  "/admin/utilisateurs":              "Utilisateurs",
  "/admin/demandes-proprio":          "Demandes propriétaire",
  "/profil":                          "Aperçu",
  "/profil/reservations":             "Réservations",
  "/profil/messages":                 "Messages",
  "/profil/favoris":                  "Favoris",
  "/profil/documents":                "Documents",
  "/profil/paiements":                "Paiements",
  "/profil/affichage":                "Affichage et accessibilité",
  "/profil/devenir-proprietaire":     "Devenir propriétaire",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [route, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(route + "/")) return title;
  }
  return "Dashboard";
}

type Props = { onToggleNav?: () => void };

export default function DashboardTopbar({ onToggleNav }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const title = getPageTitle(pathname);
  const { user, logout } = useAuth();
  const { theme, setTheme } = usePreferences();
  const { unreadCount } = useMessages();

  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef                   = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const ROLE_LABELS: Record<string, string> = {
    admin: "Administrateur",
    proprietaire: "Propriétaire",
    locataire: "Locataire",
  };

  function handleLogout() {
    logout();
    setAvatarOpen(false);
    router.push("/connexion");
  }

  /* Fermer en cliquant à l'extérieur */
  useEffect(() => {
    if (!avatarOpen) return;
    function handleClick(e: MouseEvent) {
      if (avatarOpen && avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [avatarOpen]);

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-menu-btn" onClick={onToggleNav} aria-label="Ouvrir le menu" title="Menu">
          <i className="fa-solid fa-bars" />
        </button>
        <h2 className="topbar-title">{title}</h2>
      </div>

      <div className="topbar-actions">

        {/* ── Cloche notifications ── */}
        <NotificationsBell />

        {/* ── Messages ── */}
        {(() => {
          const messagesHref = pathname.startsWith("/admin")
            ? "/admin/messages"
            : pathname.startsWith("/proprietaire")
            ? "/proprietaire/messages"
            : "/profil/messages";
          const isActive = pathname.startsWith(messagesHref);
          return (
            <Link
              href={messagesHref}
              className={`topbar-icon-btn${isActive ? " active" : ""}`}
              title="Messages"
            >
              <i className="fa-solid fa-envelope" aria-hidden="true" />
              {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
            </Link>
          );
        })()}

        {/* ── Profil ── */}
        {user && (
          <div className="navbar-user-menu" ref={avatarRef}>
            <button
              className="navbar-avatar-btn"
              onClick={() => setAvatarOpen((v) => !v)}
              aria-expanded={avatarOpen}
              aria-haspopup="true"
              aria-label="Menu du compte"
            >
              <span className="navbar-avatar">{user.initials}</span>
              <i className={`fa-solid fa-chevron-${avatarOpen ? "up" : "down"} navbar-avatar-caret`} />
            </button>

            {avatarOpen && (
              <div className="navbar-dropdown" role="menu">
                <div className="navbar-dropdown-user">
                  <span className="navbar-dropdown-name">{user.name}</span>
                  <span className="navbar-dropdown-role">{ROLE_LABELS[user.role] ?? user.role}</span>
                </div>
                <div className="navbar-dropdown-sep" />
                <button
                  className="navbar-dropdown-item navbar-dropdown-item--nav"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  role="menuitemcheckbox"
                  aria-checked={isDark}
                >
                  <span className="navbar-dropdown-item-label">
                    <i className={`fa-solid ${isDark ? "fa-moon" : "fa-sun"}`} /> Mode sombre
                  </span>
                  <span className={`toggle-switch${isDark ? " active" : ""}`}>
                    <span />
                  </span>
                </button>
                <div className="navbar-dropdown-sep" />
                <button className="navbar-dropdown-item navbar-dropdown-item--danger" onClick={handleLogout} role="menuitem">
                  <i className="fa-solid fa-right-from-bracket" /> Déconnexion
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}

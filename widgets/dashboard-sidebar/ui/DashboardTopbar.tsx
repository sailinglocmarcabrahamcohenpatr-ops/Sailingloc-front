"use client";

import "./DashboardTopbar.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth, usePreferences } from "@/shared/lib";

const PAGE_TITLES: Record<string, string> = {
  "/proprietaire/dashboard":          "Dashboard",
  "/proprietaire/bateaux":            "Mes bateaux",
  "/proprietaire/bateaux/nouveau":    "Ajouter un bateau",
  "/proprietaire/reservations":       "Réservations",
  "/proprietaire/revenus":            "Revenus",
  "/proprietaire/messages":           "Messages",
  "/admin/dashboard":                 "Dashboard",
  "/admin/avis":                      "Avis",
  "/admin/reservations":              "Réservations",
  "/admin/utilisateurs":              "Utilisateurs",
  "/admin/bateaux":                   "Ajouter un bateau",
  "/admin/demandes-proprio":          "Demandes propriétaire",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [route, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(route + "/")) return title;
  }
  return "Dashboard";
}

/* ── Données mock (à remplacer par l'API) ── */
type Notif = { id: number; icon: string; iconCls: string; title: string; desc: string; time: string; read: boolean };

const MOCK_NOTIFS: Notif[] = [
  { id: 1, icon: "fa-user-check",     iconCls: "notif-icon--blue",   title: "Nouvelle demande propriétaire", desc: "Jean Martin souhaite devenir propriétaire.",  time: "Il y a 5 min",  read: false },
  { id: 2, icon: "fa-calendar-check", iconCls: "notif-icon--green",  title: "Réservation confirmée",          desc: "Réservation #142 confirmée avec succès.",       time: "Il y a 1 h",   read: false },
  { id: 3, icon: "fa-star",           iconCls: "notif-icon--yellow", title: "Nouvel avis posté",              desc: "Un avis 1★ a été laissé sur un bateau.",        time: "Il y a 3 h",   read: false },
  { id: 4, icon: "fa-sailboat",       iconCls: "notif-icon--blue",   title: "Bateau en attente de validation", desc: "Le bateau « Vent du Sud » attend votre approbation.", time: "Hier",      read: true  },
  { id: 5, icon: "fa-envelope",       iconCls: "notif-icon--grey",   title: "Nouveau message",               desc: "Sophie D. vous a envoyé un message.",           time: "Hier",         read: true  },
];

export default function DashboardTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = getPageTitle(pathname);
  const { user, logout } = useAuth();
  const { theme, setTheme } = usePreferences();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs]       = useState<Notif[]>(MOCK_NOTIFS);
  const notifRef                  = useRef<HTMLDivElement>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef                   = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.read).length;
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
    if (!notifOpen && !avatarOpen) return;
    function handleClick(e: MouseEvent) {
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (avatarOpen && avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen, avatarOpen]);

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: number) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <header className="dashboard-topbar">
      <h2 className="topbar-title">{title}</h2>

      <div className="topbar-actions">

        {/* ── Cloche notifications ── */}
        <div className="topbar-notif-wrap" ref={notifRef}>
          <button
            className={`topbar-icon-btn${notifOpen ? " active" : ""}`}
            title="Notifications"
            aria-label="Notifications"
            onClick={() => setNotifOpen((o) => !o)}
          >
            <i className="fa-solid fa-bell" aria-hidden="true" />
            {unread > 0 && <span className="topbar-badge">{unread}</span>}
          </button>

          {notifOpen && (
            <div className="notif-dropdown" role="menu">
              <div className="notif-dropdown-hd">
                <span className="notif-dropdown-title">
                  Notifications
                  {unread > 0 && <span className="notif-unread-count">{unread}</span>}
                </span>
                {unread > 0 && (
                  <button className="notif-mark-all" onClick={markAllRead}>
                    Tout marquer lu
                  </button>
                )}
              </div>

              <ul className="notif-list">
                {notifs.map((n) => (
                  <li
                    key={n.id}
                    className={`notif-item${n.read ? "" : " unread"}`}
                    onClick={() => markRead(n.id)}
                    role="menuitem"
                  >
                    <div className={`notif-icon ${n.iconCls}`}>
                      <i className={`fa-solid ${n.icon}`} aria-hidden="true" />
                    </div>
                    <div className="notif-body">
                      <p className="notif-item-title">{n.title}</p>
                      <p className="notif-item-desc">{n.desc}</p>
                      <span className="notif-item-time">{n.time}</span>
                    </div>
                    {!n.read && <span className="notif-dot" aria-label="Non lu" />}
                  </li>
                ))}
              </ul>

              <div className="notif-dropdown-ft">
                <button className="notif-see-all" onClick={() => setNotifOpen(false)}>
                  Voir toutes les notifications
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Messages ── */}
        {(() => {
          const isAdmin = pathname.startsWith("/admin");
          const messagesHref = isAdmin ? "/admin/messages" : "/proprietaire/messages";
          const isActive = pathname.startsWith(messagesHref);
          return (
            <Link
              href={messagesHref}
              className={`topbar-icon-btn${isActive ? " active" : ""}`}
              title="Messages"
            >
              <i className="fa-solid fa-envelope" aria-hidden="true" />
              <span className="topbar-badge">3</span>
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

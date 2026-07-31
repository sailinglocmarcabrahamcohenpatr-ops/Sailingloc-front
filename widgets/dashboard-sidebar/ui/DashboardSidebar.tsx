"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useMessages } from "@/shared/lib";

type NavLink = { href: string; icon: string; label: string; badge?: number; exact?: boolean };

const ownerLinks: NavLink[] = [
  { href: "/proprietaire/dashboard",      icon: "fa-house",          label: "Dashboard", exact: true },
  { href: "/proprietaire/bateaux",        icon: "fa-sailboat",       label: "Mes bateaux" },
  { href: "/proprietaire/bateaux/nouveau",icon: "fa-plus",           label: "Ajouter un bateau" },
  { href: "/proprietaire/reservations",   icon: "fa-calendar-check", label: "Réservations" },
  { href: "/proprietaire/revenus",        icon: "fa-chart-line",     label: "Revenus" },
  { href: "/proprietaire/messages",       icon: "fa-envelope",       label: "Messages" },
  { href: "/profil/parametres",           icon: "fa-sliders",        label: "Paramètres" },
  { href: "/profil/affichage",            icon: "fa-moon",           label: "Affichage et accessibilité" },
];

const adminLinks: NavLink[] = [
  { href: "/admin/dashboard",         icon: "fa-house",          label: "Dashboard", exact: true },
  { href: "/admin/avis",              icon: "fa-star",           label: "Avis" },
  { href: "/admin/reservations",      icon: "fa-calendar-check", label: "Réservations" },
  { href: "/admin/utilisateurs",      icon: "fa-users",          label: "Utilisateurs" },
  { href: "/admin/publication",       icon: "fa-file-circle-check", label: "Publication" },
  { href: "/admin/demandes-proprio",  icon: "fa-user-check",     label: "Demandes propriétaire" },
  { href: "/admin/messages",          icon: "fa-envelope",       label: "Messages" },
];

const bottomLinks: NavLink[] = [
  { href: "/bateaux", icon: "fa-magnifying-glass", label: "Trouver un bateau" },
  { href: "/contact", icon: "fa-headset", label: "Support" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, switchRole } = useAuth();
  const { unreadCount } = useMessages();

  // Ce shell n'habille plus que l'admin et le propriétaire — l'espace
  // locataire (/profil/**) a sa propre coquille (widgets/client-space).
  const isAdmin = pathname.startsWith("/admin");
  const links = isAdmin ? adminLinks : ownerLinks;

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const displayName = user?.name ?? (isAdmin ? "Admin" : "Marc Dupont");
  const displayRole = isAdmin ? "Administrateur" : "Propriétaire";
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleSwitchRole = () => {
    switchRole("locataire");
    router.push("/profil");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="dashboard-sidebar">
      <Link href="/" className="dash-sidebar-logo">
        <i className="fa-solid fa-anchor" aria-hidden="true" />
        SailingLoc
      </Link>

      <div className="dash-sidebar-user">
        <div className="dash-sidebar-avatar" aria-hidden="true">{initials}</div>
        <div className="dash-sidebar-user-info">
          <strong>{displayName}</strong>
          <span>{displayRole}</span>
        </div>
      </div>

      {!isAdmin && (
        <button className="dash-role-switch" onClick={handleSwitchRole} title="Changer d'espace">
          <i className="fa-solid fa-user" aria-hidden="true" />
          Espace locataire
          <i className="fa-solid fa-arrow-right-arrow-left dash-role-switch-icon" aria-hidden="true" />
        </button>
      )}

      <nav className="dash-sidebar-nav" aria-label="Navigation dashboard">
        <span className="dash-nav-section">
          {isAdmin ? "Administration" : "Espace propriétaire"}
        </span>
        {links.map((l) => {
          const badge = l.href.endsWith("/messages") ? unreadCount : l.badge;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`dash-nav-link${isActive(l.href, l.exact) ? " active" : ""}`}
            >
              <i className={`fa-solid ${l.icon} dash-nav-icon`} aria-hidden="true" />
              <span>{l.label}</span>
              {badge ? <span className="dash-nav-badge">{badge}</span> : null}
            </Link>
          );
        })}

        <span className="dash-nav-section" style={{ marginTop: "8px" }}>Navigation</span>
        {bottomLinks.map((l) => (
          <Link key={l.href} href={l.href} className="dash-nav-link">
            <i className={`fa-solid ${l.icon} dash-nav-icon`} aria-hidden="true" />
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>

      <div className="dash-sidebar-bottom">
        <button onClick={handleLogout} className="dash-nav-link dash-nav-link-logout" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
          <i className="fa-solid fa-right-from-bracket dash-nav-icon" aria-hidden="true" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib";

type NavLink = { href: string; icon: string; label: string; badge?: number; exact?: boolean };

const ownerLinks: NavLink[] = [
  { href: "/proprietaire/dashboard",      icon: "fa-house",          label: "Dashboard", exact: true },
  { href: "/proprietaire/bateaux",        icon: "fa-sailboat",       label: "Mes bateaux" },
  { href: "/proprietaire/bateaux/nouveau",icon: "fa-plus",           label: "Ajouter un bateau" },
  { href: "/proprietaire/reservations",   icon: "fa-calendar-check", label: "Réservations" },
  { href: "/proprietaire/revenus",        icon: "fa-chart-line",     label: "Revenus" },
  { href: "/proprietaire/messages",       icon: "fa-envelope",       label: "Messages", badge: 3 },
];

const renterLinks: NavLink[] = [
  { href: "/profil", icon: "fa-user", label: "Mon profil", exact: true },
  { href: "/profil/reservations", icon: "fa-calendar-check", label: "Mes réservations" },
  { href: "/profil/messages", icon: "fa-envelope", label: "Messages", badge: 1 },
  { href: "/profil/documents", icon: "fa-id-card", label: "Documents" },
  { href: "/profil/paiements", icon: "fa-credit-card", label: "Paiements" },
  { href: "/profil/parametres", icon: "fa-sliders", label: "Paramètres" },
  { href: "/inscrire-bateau", icon: "fa-plus", label: "Ajouter un bateau" },
];

const bottomLinks: NavLink[] = [
  { href: "/bateaux", icon: "fa-magnifying-glass", label: "Trouver un bateau" },
  { href: "/contact", icon: "fa-headset", label: "Support" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, switchRole } = useAuth();

  const isOwner = pathname.startsWith("/proprietaire");
  const links = isOwner ? ownerLinks : renterLinks;

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const displayName = user?.name ?? (isOwner ? "Marc Dupont" : "Marie Dupont");
  const displayRole = isOwner ? "Propriétaire" : "Locataire";
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleSwitchRole = () => {
    switchRole();
    if (isOwner) router.push("/profil");
    else router.push("/proprietaire/bateaux");
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

      <button className="dash-role-switch" onClick={handleSwitchRole} title="Changer d'espace">
        <i className={`fa-solid ${isOwner ? "fa-user" : "fa-sailboat"}`} aria-hidden="true" />
        {isOwner ? "Espace locataire" : "Espace propriétaire"}
        <i className="fa-solid fa-arrow-right-arrow-left dash-role-switch-icon" aria-hidden="true" />
      </button>

      <nav className="dash-sidebar-nav" aria-label="Navigation dashboard">
        <span className="dash-nav-section">{isOwner ? "Espace propriétaire" : "Mon espace"}</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`dash-nav-link${isActive(l.href, l.exact) ? " active" : ""}`}
          >
            <i className={`fa-solid ${l.icon} dash-nav-icon`} aria-hidden="true" />
            <span>{l.label}</span>
            {l.badge ? <span className="dash-nav-badge">{l.badge}</span> : null}
          </Link>
        ))}

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

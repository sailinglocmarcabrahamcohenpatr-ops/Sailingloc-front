"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useMessages } from "@/shared/lib";
import { Logo } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";

type NavLink = { href: string; icon: string; label: string; badge?: number; exact?: boolean };

type Props = { open?: boolean; onClose?: () => void };

export default function DashboardSidebar({ open = false, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { unreadCount } = useMessages();
  const t = useI18n().dict.ownerShell;

  const isAdmin = pathname.startsWith("/admin");

  const ownerLinks: NavLink[] = [
    { href: "/proprietaire/dashboard",       icon: "fa-house",             label: t.navDashboard, exact: true },
    { href: "/proprietaire/bateaux",         icon: "fa-sailboat",          label: t.navBoats },
    { href: "/proprietaire/bateaux/nouveau", icon: "fa-plus",              label: t.navAddBoat },
    { href: "/proprietaire/reservations",    icon: "fa-calendar-check",    label: t.navReservations },
    { href: "/proprietaire/revenus",         icon: "fa-chart-line",        label: t.navRevenue },
    { href: "/proprietaire/messages",        icon: "fa-envelope",          label: t.navMessages },
    { href: "/profil/affichage",             icon: "fa-moon",              label: t.navDisplay },
  ];

  const adminLinks: NavLink[] = [
    { href: "/admin/dashboard",        icon: "fa-house",             label: t.navAdminDashboard, exact: true },
    { href: "/admin/avis",             icon: "fa-star",              label: t.navAdminReviews },
    { href: "/admin/reservations",     icon: "fa-calendar-check",    label: t.navAdminReservations },
    { href: "/admin/utilisateurs",     icon: "fa-users",             label: t.navAdminUsers },
    { href: "/admin/publication",      icon: "fa-file-circle-check", label: t.navAdminPublication },
    { href: "/admin/ports",            icon: "fa-map-location-dot",  label: t.navAdminPorts },
    { href: "/admin/demandes-proprio", icon: "fa-user-check",        label: t.navAdminOwnerRequests },
    { href: "/admin/messages",         icon: "fa-envelope",          label: t.navAdminMessages },
  ];

  const bottomLinks: NavLink[] = [
    { href: "/bateaux",  icon: "fa-magnifying-glass", label: t.navFindBoat },
    { href: "/contact",  icon: "fa-headset",           label: t.navSupport },
  ];

  const links = isAdmin ? adminLinks : ownerLinks;

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const displayName = user?.name ?? "—";
  const displayRole = isAdmin ? t.roleAdmin : t.roleOwner;
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      {open && <div className="dash-sidebar-backdrop" onClick={onClose} />}
      <aside className={`dashboard-sidebar${open ? " mobile-open" : ""}`}>
      <button type="button" className="dash-sidebar-close" onClick={onClose} title={t.closeMenu} aria-label={t.closeMenu}>
        <i className="fa-solid fa-xmark" />
      </button>
      <Link href="/" className="dash-sidebar-logo">
        <Logo />
      </Link>

      <div className="dash-sidebar-user">
        <div className="dash-sidebar-avatar" aria-hidden="true">{initials}</div>
        <div className="dash-sidebar-user-info">
          <strong>{displayName}</strong>
          <span>{displayRole}</span>
        </div>
      </div>

      <nav className="dash-sidebar-nav" aria-label={t.navAria}>
        <span className="dash-nav-section">
          {isAdmin ? t.sectionAdmin : t.sectionOwner}
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

        <span className="dash-nav-section" style={{ marginTop: "8px" }}>{t.sectionNav}</span>
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
          <span>{t.logout}</span>
        </button>
      </div>
      </aside>
    </>
  );
}

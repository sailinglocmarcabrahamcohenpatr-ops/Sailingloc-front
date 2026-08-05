"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth, useMessages } from "@/shared/lib";
import { Logo } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import NotificationsBell from "@/widgets/notifications/ui/NotificationsBell";
import "./client-space.css";

type NavItem = { href: string; icon: string; label: string; exact?: boolean };

export default function ClientSpaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { unreadCount } = useMessages();
  const t = useI18n().dict.clientShell;

  const displayName = user?.name ?? "—";
  const isOwner = user?.role === "proprietaire";
  const displayRole = isOwner ? t.roleOwner : t.roleTenant;
  const initials = user?.initials ?? displayName.slice(0, 2).toUpperCase();

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const NAV_ITEMS: NavItem[] = [
    { href: "/profil", icon: "fa-house", label: t.navHome, exact: true },
    { href: "/profil/reservations", icon: "fa-calendar-check", label: t.navReservations },
    { href: "/profil/messages", icon: "fa-envelope", label: t.navMessages },
    { href: "/profil/notations", icon: "fa-star", label: t.navNotations },
    { href: "/profil/favoris", icon: "fa-heart", label: t.navFavoris },
    { href: "/profil/affichage", icon: "fa-moon", label: t.navAffichage },
  ];

  const navItems = isOwner
    ? NAV_ITEMS
    : [...NAV_ITEMS, { href: "/profil/radar", icon: "fa-satellite-dish", label: t.navRadar }, { href: "/profil/devenir-proprietaire", icon: "fa-sailboat", label: t.navBecomeOwner }];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="client-space">
      <aside className="client-space-side">
        <div className="client-space-topline">
          <Link href="/" className="client-space-logo">
            <Logo />
          </Link>
        </div>

        <div className="client-profile-card">
          <div className="client-profile-banner" />
          <div className="client-profile-avatar" aria-hidden="true">{initials}</div>
          <div className="client-profile-body">
            <strong className="client-profile-name">{displayName}</strong>
            <span className="client-profile-role">{displayRole}</span>
            <span className="client-profile-verified">
              <i className="fa-solid fa-circle-check" aria-hidden="true" /> {t.identityVerified}
            </span>

            <Link href="/profil" className="btn btn-outline btn-sm client-profile-edit">
              <i className="fa-solid fa-pen" /> {t.editProfile}
            </Link>
          </div>
        </div>

        <nav className="client-space-nav" aria-label={t.navAria}>
          {navItems.map((item) => {
            const badge = item.href === "/profil/messages" ? unreadCount : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`client-nav-box${isActive(item.href, item.exact) ? " active" : ""}`}
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
                {badge > 0 && <span className="client-nav-badge">{badge}</span>}
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} className="client-profile-logout">
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
          {t.logout}
        </button>
      </aside>

      <div className="client-space-main">
        <div className="client-space-main-topbar">
          <NotificationsBell />
        </div>
        <main className="client-space-content">{children}</main>
      </div>
    </div>
  );
}

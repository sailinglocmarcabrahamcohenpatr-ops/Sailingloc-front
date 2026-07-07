"use client";

import "./DashboardTopbar.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/shared/lib";

const PAGE_TITLES: Record<string, string> = {
  "/proprietaire/dashboard":          "Dashboard",
  "/proprietaire/bateaux":          "Mes bateaux",
  "/proprietaire/bateaux/nouveau":  "Ajouter un bateau",
  "/proprietaire/reservations":     "Réservations",
  "/proprietaire/revenus":          "Revenus",
  "/proprietaire/messages":         "Messages",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [route, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(route + "/")) return title;
  }
  return "Dashboard";
}

export default function DashboardTopbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const title = getPageTitle(pathname);
  const displayName = user?.name ?? "Propriétaire";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="dashboard-topbar">
      <h2 className="topbar-title">{title}</h2>

      <div className="topbar-actions">
        <Link
          href="/proprietaire/messages"
          className={`topbar-icon-btn${pathname.startsWith("/proprietaire/messages") ? " active" : ""}`}
          title="Messages"
        >
          <i className="fa-solid fa-envelope" aria-hidden="true" />
          <span className="topbar-badge">3</span>
        </Link>

        <Link
          href="/profil"
          className="topbar-avatar"
          title="Mon profil"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}

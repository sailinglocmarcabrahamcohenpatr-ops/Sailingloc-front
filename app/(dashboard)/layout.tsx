"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar, DashboardTopbar } from "@/widgets/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOwner = pathname.startsWith("/proprietaire");
  const isAdmin = pathname.startsWith("/admin");

  if (isOwner || isAdmin) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar />
        <div className="dashboard-main-wrapper">
          <DashboardTopbar />
          <main className="dashboard-main">{children}</main>
        </div>
      </div>
    );
  }

  // Locataire — pas de sidebar, layout géré par profil/layout.tsx
  return <>{children}</>;
}


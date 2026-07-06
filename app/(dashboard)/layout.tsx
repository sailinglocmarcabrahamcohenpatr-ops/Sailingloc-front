"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/widgets/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOwner = pathname.startsWith("/proprietaire");

  if (isOwner) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar />
        <main className="dashboard-main">{children}</main>
      </div>
    );
  }

  // Locataire — pas de sidebar, layout géré par profil/layout.tsx
  return <>{children}</>;
}


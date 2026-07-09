"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/shared/lib";
import { DashboardSidebar, DashboardTopbar } from "@/widgets/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isOwner = pathname.startsWith("/proprietaire");
  const isAdmin = pathname.startsWith("/admin");
  const { user, checking } = useAuth();

  useEffect(() => {
    if ((isOwner || isAdmin) && !checking && !user) router.replace("/connexion");
  }, [isOwner, isAdmin, checking, user, router]);

  if (isOwner || isAdmin) {
    if (checking || !user) return null;
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


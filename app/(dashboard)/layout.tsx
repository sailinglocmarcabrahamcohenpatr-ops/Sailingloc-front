"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/shared/lib";
import { DashboardSidebar, DashboardTopbar } from "@/widgets/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, checking } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!checking && !user) router.replace("/connexion");
  }, [checking, user, router]);

  // Referme le menu mobile à chaque changement de page
  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  if (checking || !user) return null;

  return (
    <div className="dashboard-layout">
      <DashboardSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="dashboard-main-wrapper">
        <DashboardTopbar onToggleNav={() => setMobileNavOpen((v) => !v)} />
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/shared/lib";
import { DashboardSidebar, DashboardTopbar } from "@/widgets/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, checking } = useAuth();

  useEffect(() => {
    if (!checking && !user) router.replace("/connexion");
  }, [checking, user, router]);

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

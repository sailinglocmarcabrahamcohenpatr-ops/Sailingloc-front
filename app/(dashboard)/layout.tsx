"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/widgets/dashboard-sidebar";
import { Navbar } from "@/widgets/navbar";

const ROUTES_WITH_NAVBAR = ["/espace-proprietaire/messages"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = ROUTES_WITH_NAVBAR.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={`dashboard-layout${showNavbar ? " has-navbar" : ""}`}>
        <DashboardSidebar />
        <main className="dashboard-main">{children}</main>
      </div>
    </>
  );
}

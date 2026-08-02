import type { Metadata } from "next";
import AdminDashboardContent from "./AdminDashboardContent";

export const metadata: Metadata = { title: "Admin · Tableau de bord · SailingLoc" };

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}

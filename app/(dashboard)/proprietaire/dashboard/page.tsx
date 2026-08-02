import type { Metadata } from "next";
import DashboardContent from "./DashboardContent";

export const metadata: Metadata = { title: "Dashboard · SailingLoc" };

export default function ProprietaireDashboardPage() {
  return <DashboardContent />;
}

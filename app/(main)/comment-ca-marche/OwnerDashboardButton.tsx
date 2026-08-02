"use client";

import Link from "next/link";
import { useAuth } from "@/shared/lib";

export default function OwnerDashboardButton() {
  const { user } = useAuth();
  if (user?.role !== "proprietaire") return null;

  return (
    <Link href="/proprietaire/dashboard" className="btn btn-ghost-white btn-lg">
      Je suis propriétaire
    </Link>
  );
}

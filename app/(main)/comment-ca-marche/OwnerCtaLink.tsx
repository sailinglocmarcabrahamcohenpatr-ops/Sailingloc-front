"use client";

import Link from "next/link";
import { useAuth } from "@/shared/lib";

export default function OwnerCtaLink() {
  const { user } = useAuth();
  const href = user?.role === "proprietaire" ? "/proprietaire/dashboard" : "/profil/devenir-proprietaire";

  return (
    <Link href={href} className="btn btn-white btn-lg">
      <i className="fa-solid fa-plus" /> Devenir propriétaire
    </Link>
  );
}

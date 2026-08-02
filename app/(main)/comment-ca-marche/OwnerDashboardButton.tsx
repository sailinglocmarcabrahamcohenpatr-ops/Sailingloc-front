"use client";

import { useAuth } from "@/shared/lib";
import { useI18n, LocaleLink as Link } from "@/shared/i18n";

export default function OwnerDashboardButton() {
  const { user } = useAuth();
  const t = useI18n().dict.howItWorksPage;
  if (user?.role !== "proprietaire") return null;

  return (
    <Link href="/proprietaire/dashboard" className="btn btn-ghost-white btn-lg">
      {t.heroOwnerBtn}
    </Link>
  );
}

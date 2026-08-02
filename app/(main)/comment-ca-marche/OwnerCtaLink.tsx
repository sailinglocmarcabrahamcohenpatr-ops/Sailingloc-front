"use client";

import { useAuth } from "@/shared/lib";
import { useI18n, LocaleLink as Link } from "@/shared/i18n";

export default function OwnerCtaLink() {
  const { user } = useAuth();
  const t = useI18n().dict.howItWorksPage;
  const href = user?.role === "proprietaire" ? "/proprietaire/dashboard" : "/profil/devenir-proprietaire";

  return (
    <Link href={href} className="btn btn-white btn-lg">
      <i className="fa-solid fa-plus" /> {t.ownerCta}
    </Link>
  );
}

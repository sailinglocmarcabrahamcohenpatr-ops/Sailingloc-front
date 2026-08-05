"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/shared/lib";
import { BecomeOwnerForm } from "@/features/request-owner-access";
import { useI18n } from "@/shared/i18n";

export default function DevenirProprietaireContent() {
  const router = useRouter();
  const { user, checking } = useAuth();
  const t = useI18n().dict.devenirProprietairePage;

  // Cette demande ne concerne que les locataires : un compte propriétaire
  // ou admin est renvoyé vers son propre espace.
  useEffect(() => {
    if (checking) return;
    if (user && user.role !== "locataire") router.replace("/profil");
  }, [checking, user, router]);

  if (checking || !user || user.role !== "locataire") return null;

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">{t.title}</h1>
          <p className="dash-sub">{t.sub}</p>
        </div>
      </div>

      <BecomeOwnerForm />
    </div>
  );
}

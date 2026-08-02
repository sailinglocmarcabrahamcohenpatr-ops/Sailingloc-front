"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/shared/lib";
import { BecomeOwnerForm } from "@/features/request-owner-access";

export default function DevenirProprietaireContent() {
  const router = useRouter();
  const { user, checking } = useAuth();

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
          <h1 className="dash-title">Devenir propriétaire</h1>
          <p className="dash-sub">
            Passez à l&apos;espace propriétaire pour publier vos bateaux et
            gérer vos locations.
          </p>
        </div>
      </div>

      <BecomeOwnerForm />
    </div>
  );
}

import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisez votre mot de passe SailingLoc.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <div className="auth-card-icon"><i className="fa-solid fa-lock" aria-hidden="true" /></div>
        <h1>Mot de passe oublié ?</h1>
        <p>Pas de panique, ça arrive aux meilleurs</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}

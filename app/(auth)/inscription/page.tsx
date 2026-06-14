import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Rejoignez SailingLoc et louez ou mettez en location votre bateau.",
};

export default function InscriptionPage() {
  return (
    <div className="auth-card auth-card-wide">
      <div className="auth-card-header">
        <h1>Créer un compte</h1>
        <p>Rejoignez 50 000 navigateurs sur SailingLoc</p>
      </div>
      <RegisterForm />
    </div>
  );
}

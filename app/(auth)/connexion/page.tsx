import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Connexion — SailingLoc",
  description: "Connectez-vous à votre espace SailingLoc pour accéder à vos réservations et messages.",
};

export default function ConnexionPage() {
  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h1>Bon retour !</h1>
        <p className="auth-card-sub">Connectez-vous à votre espace SailingLoc</p>
      </div>
      <LoginForm />
      <p className="auth-card-create">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="auth-link">Créer un compte gratuitement</Link>
      </p>
    </div>
  );
}

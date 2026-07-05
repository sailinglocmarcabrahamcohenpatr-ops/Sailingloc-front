import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Connexion — SailingLoc",
  description: "Connectez-vous à votre espace SailingLoc pour accéder à vos réservations et messages.",
};

interface PageProps {
  searchParams: Promise<{ registered?: string }>;
}

export default async function ConnexionPage({ searchParams }: PageProps) {
  const { registered } = await searchParams;

  return (
    <div className="auth-card">
      {registered === "1" && (
        <div className="auth-success" role="alert">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          Compte créé avec succès ! Connectez-vous maintenant.
        </div>
      )}

      <div className="auth-card-header">
        <h1>Bon retour !</h1>
        <p className="auth-card-sub">Entrez vos identifiants pour accéder à votre compte</p>
      </div>

      <LoginForm />

      <p className="auth-card-create">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="auth-link">Créer un compte</Link>
      </p>
    </div>
  );
}

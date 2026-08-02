import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Connexion — SailingLoc",
  description: "Connectez-vous à votre espace SailingLoc pour accéder à vos réservations et messages.",
};

interface PageProps {
  searchParams: Promise<{ registered?: string; redirect?: string }>;
}

export default async function ConnexionPage({ searchParams }: PageProps) {
  const { registered, redirect: redirectTo } = await searchParams;

  return (
    <div className="auth-card">
      {registered === "1" && (
        <div className="auth-success" role="alert">
          <i className="fa-solid fa-envelope-circle-check" aria-hidden="true" />
          Compte créé avec succès ! Un e-mail de confirmation vous a été envoyé — cliquez sur le lien qu&apos;il contient pour activer votre compte, puis connectez-vous.
        </div>
      )}

      <div className="auth-card-header">
        <h1>Bon retour !</h1>
        <p className="auth-card-sub">Entrez vos identifiants pour accéder à votre compte</p>
      </div>
      <LoginForm redirectTo={redirectTo} />
      <p className="auth-card-create">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="auth-link">Créer un compte</Link>
      </p>
    </div>
  );
}

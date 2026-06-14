"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[SailingLoc Error]", error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="error-icon">⚡</div>
      <h2 className="error-title">Quelque chose s&apos;est mal passé</h2>
      <p className="error-desc">
        Une erreur inattendue est survenue. Notre équipe a été notifiée.
      </p>
      <div className="error-actions">
        <button onClick={reset} className="btn btn-primary">
          <i className="fa-solid fa-rotate-right" aria-hidden="true" /> Réessayer
        </button>
        <Link href="/" className="btn btn-outline">
          <i className="fa-solid fa-house" aria-hidden="true" /> Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

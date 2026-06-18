"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BateauxError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[SailingLoc/bateaux Error]", error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="error-icon"><i className="fa-solid fa-anchor" aria-hidden="true" /></div>
      <h2 className="error-title">Impossible de charger les bateaux</h2>
      <p className="error-desc">Une erreur est survenue lors du chargement du catalogue.</p>
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

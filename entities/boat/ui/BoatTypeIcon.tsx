import type { BoatType } from "../model/types";

/* Jeu d'icônes SVG maison, style ligne cohérent, adapté à chaque type de bateau.
   Couleur héritée (currentColor), taille = police du parent (1em). */

const paths: Record<string, React.ReactNode> = {
  // Voilier : mât + voile + coque
  voilier: (
    <>
      <path d="M12 3v10" />
      <path d="M12 5.2 17 13H12z" />
      <path d="M4 15.5h16l-1.9 3.2a2 2 0 0 1-1.7 1H7.6a2 2 0 0 1-1.7-1L4 15.5z" />
    </>
  ),
  // Catamaran : deux coques + pont + petite voile
  catamaran: (
    <>
      <path d="M12 3.5v7" />
      <path d="M12 5 15.5 10.5H12z" />
      <path d="M2.5 15h6.5l-1 3H4z" />
      <path d="M15 15h6.5l-1 3h-4.5z" />
      <path d="M9 16.2h6" />
    </>
  ),
  // Moteur : coque profilée + pare-brise
  moteur: (
    <>
      <path d="M4.5 13h9l3-3h-3.2a2 2 0 0 0-1.4.6L9.5 12H5.5a1 1 0 0 0-1 1z" />
      <path d="M2.6 14.6h18.8l-1.5 3.1a2.4 2.4 0 0 1-2.2 1.3H6.3a2.4 2.4 0 0 1-2.2-1.3z" />
    </>
  ),
  // Semi-rigide : coque arrondie (boudins) + console
  "semi-rigide": (
    <>
      <path d="M3 13.2A2.7 2.7 0 0 1 5.7 10.5H14l3.8 3.8a2.7 2.7 0 0 1-2.7 2.7H5.7A2.7 2.7 0 0 1 3 14.3z" />
      <rect x="9.4" y="7.6" width="3.4" height="3" rx="1" />
    </>
  ),
  // Habitable : coque + cabine avec hublot
  habitable: (
    <>
      <path d="M7 7h6a2 2 0 0 1 2 2v4H7z" />
      <path d="M9 9h2.2v2.2H9z" />
      <path d="M2.6 15h18.8l-1.5 3.1a2.4 2.4 0 0 1-2.2 1.4H6.3a2.4 2.4 0 0 1-2.2-1.4z" />
    </>
  ),
  // Sans permis : petit bateau ouvert + rame
  "sans-permis": (
    <>
      <path d="M4.5 15.5h15l-1.7 3.1a2.3 2.3 0 0 1-2 1.2H8.2a2.3 2.3 0 0 1-2-1.2z" />
      <path d="M13 7 9 13.5" />
    </>
  ),
};

export default function BoatTypeIcon({
  type,
  className,
  style,
}: {
  type: BoatType | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: "1em", height: "1em", ...style }}
      aria-hidden="true"
    >
      {paths[type] ?? paths.voilier}
    </svg>
  );
}

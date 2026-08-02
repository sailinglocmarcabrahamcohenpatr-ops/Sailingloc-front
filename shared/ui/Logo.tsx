interface LogoProps {
  className?: string;
  /** N'affiche que le pictogramme, sans le nom de marque. */
  iconOnly?: boolean;
  /** À utiliser quand le logo repose sur un fond sombre/coloré (footer, bandeau photo…). */
  onDark?: boolean;
  /** Inverse le jeu de couleurs habituel (SAILING/LOC échangent leurs couleurs). */
  invert?: boolean;
}

export default function Logo({ className = "", iconOnly = false, onDark = false, invert = false }: LogoProps) {
  const markClass = `brand-logo-mark${invert ? " brand-logo-mark--invert" : ""}${invert && onDark ? " brand-logo-mark--on-dark" : ""}`;
  const sailingClass = `brand-logo-word-sailing${invert ? " brand-logo-word-sailing--invert" : ""}${invert && onDark ? " brand-logo-word-sailing--on-dark" : ""}`;
  const locClass = `brand-logo-word-loc${onDark && !invert ? " brand-logo-word-loc--on-dark" : ""}${invert ? " brand-logo-word-loc--invert" : ""}${invert && onDark ? " brand-logo-word-loc--invert-on-dark" : ""}`;

  return (
    <span className={`brand-logo${className ? ` ${className}` : ""}`}>
      <svg
        className={markClass}
        viewBox="0 0 48 60"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M24 57C13 44 6 33 6 21.5 6 11 14.1 3 24 3s18 8 18 18.5C42 33 35 44 24 57Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path d="M24 14 34 34H14Z" fill="currentColor" />
        <path d="M10 34Q24 30 38 34Q24 42 10 34Z" fill="currentColor" />
        <path
          d="M8 47q8-5 16 0t16 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      {!iconOnly && (
        <span className="brand-logo-word">
          <span className={sailingClass}>SAILING</span>
          <span className={locClass}>LOC</span>
        </span>
      )}
    </span>
  );
}

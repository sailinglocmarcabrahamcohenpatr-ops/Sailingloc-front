interface LogoProps {
  className?: string;
  /** N'affiche que le pictogramme, sans le nom de marque. */
  iconOnly?: boolean;
  /** À utiliser quand le logo repose sur un fond sombre/coloré (footer, bandeau photo…). */
  onDark?: boolean;
  /** Inverse le jeu de couleurs habituel (SAILING/LOC échangent leurs couleurs). */
  invert?: boolean;
  /** Anime le pictogramme (flotte sur l'eau, se dessine à l'arrivée) et fait apparaître
   *  le wordmark lettre par lettre. Le texte garde toujours sa couleur normale, aucun
   *  effet ne touche à sa couleur au survol. */
  animated?: boolean;
}

/** Découpe un mot en lettres animées individuellement (accessibilité via l'aria-label
 *  posé sur le span parent par l'appelant). */
function renderWord(word: string, animated: boolean) {
  if (!animated) return word;
  return word.split("").map((letter, i) => (
    <span key={i} aria-hidden="true" className="brand-logo-letter" style={{ "--i": i } as React.CSSProperties}>
      {letter}
    </span>
  ));
}

export default function Logo({
  className = "",
  iconOnly = false,
  onDark = false,
  invert = false,
  animated = false,
}: LogoProps) {
  const markClass = `brand-logo-mark${invert ? " brand-logo-mark--invert" : ""}${onDark ? " brand-logo-mark--on-dark" : ""}${animated ? " brand-logo-mark--animated" : ""}`;
  const sailingClass = `brand-logo-word-sailing${invert ? " brand-logo-word-sailing--invert" : ""}${onDark ? " brand-logo-word-sailing--on-dark" : ""}${animated ? " brand-logo-word-sailing--animated" : ""}`;
  const locClass = `brand-logo-word-loc${onDark && !invert ? " brand-logo-word-loc--on-dark" : ""}${invert ? " brand-logo-word-loc--invert" : ""}${invert && onDark ? " brand-logo-word-loc--invert-on-dark" : ""}${animated ? " brand-logo-word-loc--animated" : ""}`;

  return (
    <span className={`brand-logo${animated ? " brand-logo--animated" : ""}${className ? ` ${className}` : ""}`}>
      <svg
        className={markClass}
        viewBox="0 0 48 60"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="brand-logo-hull"
          d="M24 57C13 44 6 33 6 21.5 6 11 14.1 3 24 3s18 8 18 18.5C42 33 35 44 24 57Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path className="brand-logo-sail" d="M24 14 34 34H14Z" fill="currentColor" />
        <path d="M10 34Q24 30 38 34Q24 42 10 34Z" fill="currentColor" />
        <path
          className="brand-logo-waterline"
          d="M8 47q8-5 16 0t16 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {animated && (
          <>
            <ellipse className="brand-logo-ripple brand-logo-ripple--1" cx="24" cy="57" rx="3" ry="1" fill="none" stroke="currentColor" strokeWidth="1" />
            <ellipse className="brand-logo-ripple brand-logo-ripple--2" cx="24" cy="57" rx="3" ry="1" fill="none" stroke="currentColor" strokeWidth="1" />
          </>
        )}
      </svg>
      {!iconOnly && (
        <span className="brand-logo-word">
          <span className={sailingClass} aria-label={animated ? "SAILING" : undefined}>
            {renderWord("SAILING", animated)}
          </span>
          <span className={locClass} aria-label={animated ? "LOC" : undefined}>
            {renderWord("LOC", animated)}
          </span>
        </span>
      )}
    </span>
  );
}

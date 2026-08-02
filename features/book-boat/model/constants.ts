/**
 * Aspect visuel des garanties de réservation (icône + couleur).
 * Les libellés (titre/description) proviennent du dictionnaire i18n
 * (`dict.boatDetail.guarantees`), indexés dans le même ordre que ce tableau.
 */
export const BOOKING_GUARANTEES = [
  { icon: "fa-shield-halved", color: "var(--green)" },
  { icon: "fa-rotate-left", color: "var(--primary)" },
  { icon: "fa-headset", color: "var(--primary)" },
] as const;

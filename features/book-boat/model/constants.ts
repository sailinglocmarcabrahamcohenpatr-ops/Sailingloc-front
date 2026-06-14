import type { BookingGuarantee } from "@/shared/types";

export const BOOKING_GUARANTEES: BookingGuarantee[] = [
  {
    icon: "fa-shield-halved",
    color: "var(--green)",
    title: "Réservation sécurisée",
    desc: "Paiement protégé par SailingLoc",
  },
  {
    icon: "fa-rotate-left",
    color: "var(--primary)",
    title: "Annulation gratuite",
    desc: "jusqu'à 72h avant le départ",
  },
  {
    icon: "fa-headset",
    color: "var(--primary)",
    title: "Support 7j/7",
    desc: "en cas de problème pendant votre croisière",
  },
];

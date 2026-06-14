import type { ContactSubject } from "@/shared/types";

export const CONTACT_SUBJECTS: ContactSubject[] = [
  { id: "resa", label: "Réservation", icon: "fa-sailboat" },
  { id: "pay", label: "Paiement", icon: "fa-credit-card" },
  { id: "doc", label: "Documents", icon: "fa-file" },
  { id: "assur", label: "Assurance", icon: "fa-shield-halved" },
  { id: "prop", label: "Propriétaires", icon: "fa-anchor" },
  { id: "other", label: "Autre", icon: "fa-ellipsis" },
];

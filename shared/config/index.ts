import type { BoatType, Destination, Country, Stat, FaqItem } from "@/shared/types";

export const APP_NAME = "SailingLoc";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://sailingloc.com";
export const SUPPORT_EMAIL = "contact@sailingloc.com";
export const SUPPORT_PHONE = "+33 1 23 45 67 89";
export const SUPPORT_WHATSAPP = "+33 6 12 34 56 78";

// Identité légale de l'éditeur — doit rester synchronisée avec app/(main)/mentions-legales.
export const LEGAL_COMPANY_NAME = `${APP_NAME} SAS`;
export const LEGAL_ADDRESS = "12 quai du Port, 13002 Marseille, France";
export const LEGAL_SIRET = "123 456 789 00012";
export const LEGAL_SIREN = LEGAL_SIRET.slice(0, 11);
export const LEGAL_RCS = "Marseille B 123 456 789";
export const LEGAL_TVA = "FR 12 123456789";

export const SERVICE_FEE_RATE = 0.069;
export const DEFAULT_BOOKING_DAYS = 7;

export const BOAT_TYPES: { value: BoatType; label: string; icon: string }[] = [
  { value: "tous", label: "Tous les bateaux", icon: "fa-sailboat" },
  { value: "voilier", label: "Voilier", icon: "fa-sailboat" },
  { value: "catamaran", label: "Catamaran", icon: "fa-ship" },
  { value: "moteur", label: "Moteur", icon: "fa-gauge-high" },
  { value: "habitable", label: "Habitable", icon: "fa-house" },
  { value: "semi-rigide", label: "Semi-rigide", icon: "fa-person-rowing" },
  { value: "sans-permis", label: "Sans permis", icon: "fa-circle-check" },
  { value: "ponton", label: "Ponton", icon: "fa-anchor" },
];

export const DESTINATIONS: Destination[] = [
  { name: "Marseille", boatCount: 450, imageSeed: "marseille-port" },
  { name: "Côte d'Azur", boatCount: 380, imageSeed: "cote-azur" },
  { name: "Bretagne", boatCount: 290, imageSeed: "bretagne-mer" },
  { name: "Corse", boatCount: 340, imageSeed: "corse-plage" },
  { name: "Méditerranée", boatCount: 520, imageSeed: "mediterr-sea" },
  { name: "Caraïbes", boatCount: 180, imageSeed: "caribbean-sea" },
];

export const COUNTRIES: Country[] = [
  { name: "France", flag: "FR", boatCount: 1450, imageSeed: "france-sea" },
  { name: "Espagne", flag: "ES", boatCount: 980, imageSeed: "spain-ocean" },
  { name: "Grèce", flag: "GR", boatCount: 1230, imageSeed: "greece-island" },
  { name: "Italie", flag: "IT", boatCount: 870, imageSeed: "italy-coast" },
];

export const STATS: Stat[] = [
  { value: "15 000+", label: "Bateaux disponibles" },
  { value: "98 %", label: "Clients satisfaits" },
  { value: "45", label: "Pays couverts" },
  { value: "120 k+", label: "Voyages réalisés" },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Comment annuler ma réservation sans frais ?",
    answer:
      "Vous pouvez annuler gratuitement jusqu'à 72 heures avant votre départ. Passé ce délai, des frais d'annulation peuvent s'appliquer selon la politique du propriétaire.",
  },
  {
    question: "Quels documents dois-je fournir pour louer ?",
    answer:
      "Pour les bateaux nécessitant un permis, vous devrez fournir une copie de votre permis côtier ou hauturier valide. Une pièce d'identité est toujours requise.",
  },
  {
    question: "Comment fonctionne le paiement sécurisé ?",
    answer:
      "SailingLoc utilise un système de paiement sécurisé par séquestre. Votre paiement est débité lors de la réservation mais n'est reversé au propriétaire qu'après votre embarquement.",
  },
  {
    question: "Puis-je sous-louer le bateau à des tiers ?",
    answer:
      "Non. La sous-location est strictement interdite par nos conditions générales d'utilisation.",
  },
  {
    question: "Pourquoi ne pas traiter directement avec le propriétaire ?",
    answer:
      "En passant par SailingLoc, vous bénéficiez d'une assurance, d'une assistance 24h/7j et d'un paiement sécurisé. Les transactions directes hors plateforme ne vous offrent aucune protection.",
  },
  {
    question: "Comment mettre mon bateau en location sur SailingLoc ?",
    answer:
      "Créez un compte propriétaire gratuitement, publiez votre annonce avec photos et description, définissez vos tarifs et disponibilités. SailingLoc prend une commission de 15 % sur chaque location.",
  },
  {
    question: "Quelle est la couverture de l'assurance incluse ?",
    answer:
      "Notre assurance couvre la responsabilité civile du locataire, les dommages causés au bateau et l'assistance en mer. Elle est valable dans les eaux européennes.",
  },
  {
    question: "Que faire si le bateau est endommagé ?",
    answer:
      "En cas de dommage, contactez immédiatement notre assistance 24h/7j. Photographiez les dégâts et remplissez un constat à l'amiable avec le propriétaire.",
  },
];

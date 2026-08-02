/* ──────────────────────────────────────────────────────────────
   Dictionnaire FRANÇAIS — SOURCE DE VÉRITÉ.

   La forme de cet objet définit le type `Dictionary` (via `typeof`).
   Toute clé ajoutée ici DOIT l'être aussi dans en.ts, sinon le
   compilateur TypeScript échoue (en.ts est typé `: Dictionary`).
   C'est le garde-fou qui garantit qu'aucune traduction ne manque.
   ────────────────────────────────────────────────────────────── */

export const fr = {
  common: {
    search: "Rechercher",
    loading: "Chargement…",
    login: "Se connecter",
    logout: "Déconnexion",
    mySpace: "Mon espace",
    close: "Fermer",
    perDay: "/ jour",
    seeMore: "Voir plus",
    back: "Retour",
  },

  languageSwitcher: {
    label: "Langue",
    fr: "Français",
    en: "English",
  },

  nav: {
    home: "Accueil",
    boats: "Bateaux",
    destinations: "Destinations",
    howItWorks: "Comment ça marche",
    owners: "Propriétaires",
    favorites: "Favoris",
    messages: "Messages",
    notifications: "Notifications",
    userMenu: "Menu utilisateur",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    mainNav: "Navigation principale",
    // Menu déroulant compte
    roleAdmin: "Administrateur",
    roleOwner: "Propriétaire",
    roleTenant: "Locataire",
    adminDashboard: "Tableau de bord admin",
    ownerSpace: "Espace propriétaire",
    becomeOwner: "Devenir propriétaire",
    tenantSpace: "Espace locataire",
    myProfile: "Mon profil",
    myBoats: "Mes bateaux",
    reservations: "Réservations",
    myReservations: "Mes réservations",
    revenue: "Revenus",
    settings: "Paramètres et confidentialité",
    help: "Aide et assistance",
    display: "Affichage et accessibilité",
  },

  footer: {
    tagline:
      "La plateforme de référence pour la location de bateaux entre particuliers en France et en Europe. Accessible à tous.",
    colListings: "Annonces",
    colOwners: "Propriétaires",
    colInfo: "Informations",
    colSubscribe: "Abonnement",
    rights: "© 2026 SailingLoc.com — Tous droits réservés",
    manageCookies: "Gérer mes cookies",
    links: {
      findBoat: "Trouver un bateau",
      destinations: "Destinations",
      sailboats: "Voiliers",
      catamarans: "Catamarans",
      motorboats: "Bateaux moteur",
      noLicense: "Sans permis",
      listBoat: "Mettre en location",
      ownerInsurance: "Assurance propriétaire",
      pricing: "Tarifs & commissions",
      ownerHelp: "Aide propriétaire",
      ownerSpace: "Espace propriétaire",
      about: "À propos de SailingLoc",
      contact: "Contact",
      howItWorks: "Comment ça marche",
      faq: "FAQ",
      gdpr: "Politique RGPD",
      blog: "Blog",
      mobileApp: "Application mobile",
      emailAlerts: "Alertes email",
      newsletter: "Newsletter",
      partners: "Nos partenaires",
      cgu: "CGU",
      cookies: "Cookies",
      privacy: "Confidentialité",
      legal: "Mentions légales",
    },
  },
};

/* Pas de `as const` : les valeurs sont volontairement élargies à `string`.
   Sinon `Dictionary` figerait chaque libellé sur son texte FR littéral et
   en.ts ne pourrait jamais s'y conformer (il faudrait le MÊME texte). Les
   clés, elles, restent strictement contrôlées. */
export type Dictionary = typeof fr;

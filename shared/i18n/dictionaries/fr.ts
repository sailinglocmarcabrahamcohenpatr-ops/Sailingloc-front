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

  boatTypes: {
    tous: "Tous types",
    voilier: "Voilier",
    catamaran: "Catamaran",
    moteur: "Bateau moteur",
    "semi-rigide": "Semi-rigide",
    habitable: "Habitable",
  },

  search: {
    aria: "Rechercher un bateau",
    destination: "Destination",
    destinationPlaceholder: "Marseille, Cannes, Corse...",
    boatType: "Type de bateau",
    arrival: "Arrivée",
    departure: "Départ",
    submit: "Rechercher",
  },

  hero: {
    aria: "Bannière principale",
    titleLine1: "Location de bateaux",
    titleAccent: "entre particuliers",
    subtitle:
      "Réservez un voilier, catamaran ou bateau à moteur au meilleur prix. Des centaines de bateaux disponibles en France et en Europe.",
  },

  home: {
    metaTitle: "SailingLoc — Location de bateaux entre particuliers en France et Europe",
    metaDescription:
      "Trouvez le bateau idéal pour vos vacances. Voiliers, catamarans, bateaux à moteur. Assurance incluse, paiement sécurisé, propriétaires vérifiés. France et Europe.",
    statsAria: "Chiffres clés",
    categoriesTitle: "Quel bateau recherchez-vous ?",
    categoriesSubtitle: "Des milliers d'annonces pour tous les styles de navigation",
    seeAllBoats: "Voir tous les bateaux",
    catSailboat: "Voilier",
    catCatamaran: "Catamaran",
    catMotor: "Bateau à moteur",
    destTitle: "Destinations populaires",
    destSubtitle: "Trouvez le bateau idéal en Méditerranée, Atlantique et au-delà",
    allDestinations: "Toutes les destinations",
    featuredTitle: "Bateaux en vedette",
    featuredSubtitle: "Une sélection de nos meilleures annonces du moment",
    seeAll: "Voir tout",
    hiwEyebrow: "Simple, rapide, sécurisé",
    hiwTitle: "Réservez en 3 étapes",
    hiwSubtitle: "De la recherche à l'embarquement, tout est pensé pour vous",
    hiwStep1Title: "Recherchez",
    hiwStep1Desc:
      "Filtrez par destination, type de bateau et dates. Comparez des centaines d'annonces avec photos et avis vérifiés.",
    hiwStep2Title: "Réservez en sécurité",
    hiwStep2Desc:
      "Envoyez votre demande. Paiement sécurisé, assurance incluse. Votre argent est protégé jusqu'à l'embarquement.",
    hiwStep3Title: "Naviguez & profitez",
    hiwStep3Desc:
      "Embarquez et vivez votre aventure. Notre équipe est disponible 24h/24 pendant toute la durée de votre navigation.",
    hiwCtaFind: "Trouver mon bateau",
    hiwCtaMore: "En savoir plus",
    ownerEyebrow: "Pour les propriétaires",
    ownerTitleBefore: "Votre bateau peut générer jusqu'à",
    ownerTitleAmount: "40 000 €",
    ownerTitleAfter: "par an",
    ownerDesc:
      "Louez votre bateau lorsque vous ne l'utilisez pas. SailingLoc gère la réservation, l'assurance, les paiements et le contrat. Vous n'avez qu'à accueillir vos locataires.",
    ownerBenefit1: "Inscription gratuite, sans abonnement",
    ownerBenefit2: "Vous fixez vos tarifs et disponibilités",
    ownerBenefit3: "Assurance tous risques incluse",
    ownerBenefit4: "Virement automatique sous 24h",
    ownerCtaBecome: "Devenir propriétaire SailingLoc",
    ownerCtaHow: "Comment ça marche ?",
    estimatorTitle: "Estimateur de revenus",
    estimateSailboatType: "Voilier 40 pieds",
    estimateSailboatWeeks: "4 semaines/été",
    estimateCatamaranType: "Catamaran 45 pieds",
    estimateCatamaranWeeks: "8 semaines/été",
    estimateMotorType: "Bateau moteur 35 pieds",
    estimateMotorWeeks: "6 semaines/an",
    perYear: "/ an",
    estimatorCta: "Voir les revenus estimés",
    seoTitle: "Location de bateaux entre particuliers en France et en Europe",
    seoText:
      "SailingLoc est la plateforme de référence pour la location de bateaux entre particuliers. Réservez un voilier, un catamaran ou un bateau à moteur au meilleur prix, avec assurance incluse et paiement sécurisé. Trouvez le bateau idéal pour vos vacances en Méditerranée, sur l'Atlantique ou à l'étranger — Côte d'Azur, Corse, Cyclades, Baléares, Croatie et plus encore.",
  },

  destinationCard: {
    boats: "bateaux",
    from: "dès",
    perDayShort: "€/j",
  },

  stats: {
    boatsAvailable: "Bateaux disponibles",
    countries: "Pays en Europe",
    completedTrips: "Voyages réalisés",
    satisfaction: "Note de satisfaction",
  },

  dateField: {
    placeholder: "Choisir",
    dialogAria: "Choisir une date",
    close: "Fermer",
    prevMonth: "Mois précédent",
    nextMonth: "Mois suivant",
    intlLocale: "fr-FR",
    weekdays: ["L", "M", "M", "J", "V", "S", "D"],
    months: [
      "janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre",
    ],
  },
};

/* Pas de `as const` : les valeurs sont volontairement élargies à `string`.
   Sinon `Dictionary` figerait chaque libellé sur son texte FR littéral et
   en.ts ne pourrait jamais s'y conformer (il faudrait le MÊME texte). Les
   clés, elles, restent strictement contrôlées. */
export type Dictionary = typeof fr;

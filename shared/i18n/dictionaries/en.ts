/* ──────────────────────────────────────────────────────────────
   Dictionnaire ANGLAIS.

   Typé `: Dictionary` (dérivé de fr.ts) → toute clé manquante ou en
   trop provoque une erreur de compilation. Les traductions sont
   rédigées à la main pour une qualité professionnelle (registre du
   nautisme de plaisance), pas générées par MT.
   ────────────────────────────────────────────────────────────── */

import type { Dictionary } from "./fr";

export const en: Dictionary = {
  common: {
    search: "Search",
    loading: "Loading…",
    login: "Log in",
    logout: "Log out",
    mySpace: "My account",
    close: "Close",
    perDay: "/ day",
    seeMore: "See more",
    back: "Back",
  },

  languageSwitcher: {
    label: "Language",
    fr: "Français",
    en: "English",
  },

  nav: {
    home: "Home",
    boats: "Boats",
    destinations: "Destinations",
    howItWorks: "How it works",
    owners: "Owners",
    favorites: "Favourites",
    messages: "Messages",
    notifications: "Notifications",
    userMenu: "User menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    mainNav: "Main navigation",
    roleAdmin: "Administrator",
    roleOwner: "Owner",
    roleTenant: "Renter",
    adminDashboard: "Admin dashboard",
    ownerSpace: "Owner area",
    becomeOwner: "Become an owner",
    tenantSpace: "Renter area",
    myProfile: "My profile",
    myBoats: "My boats",
    reservations: "Bookings",
    myReservations: "My bookings",
    revenue: "Earnings",
    settings: "Settings & privacy",
    help: "Help & support",
    display: "Display & accessibility",
  },

  footer: {
    tagline:
      "The leading platform for peer-to-peer boat rental across France and Europe. Open to everyone.",
    colListings: "Listings",
    colOwners: "Owners",
    colInfo: "Information",
    colSubscribe: "Subscribe",
    rights: "© 2026 SailingLoc.com — All rights reserved",
    manageCookies: "Manage my cookies",
    links: {
      findBoat: "Find a boat",
      destinations: "Destinations",
      sailboats: "Sailboats",
      catamarans: "Catamarans",
      motorboats: "Motorboats",
      noLicense: "No licence required",
      listBoat: "List your boat",
      ownerInsurance: "Owner insurance",
      pricing: "Pricing & fees",
      ownerHelp: "Owner help",
      ownerSpace: "Owner area",
      about: "About SailingLoc",
      contact: "Contact",
      howItWorks: "How it works",
      faq: "FAQ",
      gdpr: "GDPR policy",
      blog: "Blog",
      mobileApp: "Mobile app",
      emailAlerts: "Email alerts",
      newsletter: "Newsletter",
      partners: "Our partners",
      cgu: "Terms of use",
      cookies: "Cookies",
      privacy: "Privacy",
      legal: "Legal notice",
    },
  },

  boatTypes: {
    tous: "All types",
    voilier: "Sailboat",
    catamaran: "Catamaran",
    moteur: "Motorboat",
    "semi-rigide": "RIB",
    habitable: "Liveaboard",
  },

  search: {
    aria: "Search for a boat",
    destination: "Destination",
    destinationPlaceholder: "Marseille, Cannes, Corsica...",
    boatType: "Boat type",
    arrival: "Check-in",
    departure: "Check-out",
    submit: "Search",
  },

  hero: {
    aria: "Main banner",
    titleLine1: "Boat rental",
    titleAccent: "between individuals",
    subtitle:
      "Book a sailboat, catamaran or motorboat at the best price. Hundreds of boats available across France and Europe.",
  },

  home: {
    metaTitle: "SailingLoc — Peer-to-peer boat rental in France and Europe",
    metaDescription:
      "Find the ideal boat for your holidays. Sailboats, catamarans, motorboats. Insurance included, secure payment, verified owners. France and Europe.",
    statsAria: "Key figures",
    categoriesTitle: "Which boat are you looking for?",
    categoriesSubtitle: "Thousands of listings for every sailing style",
    seeAllBoats: "See all boats",
    catSailboat: "Sailboat",
    catCatamaran: "Catamaran",
    catMotor: "Motorboat",
    destTitle: "Popular destinations",
    destSubtitle: "Find the ideal boat in the Mediterranean, the Atlantic and beyond",
    allDestinations: "All destinations",
    featuredTitle: "Featured boats",
    featuredSubtitle: "A selection of our best listings right now",
    seeAll: "See all",
    hiwEyebrow: "Simple, fast, secure",
    hiwTitle: "Book in 3 steps",
    hiwSubtitle: "From search to boarding, everything is designed for you",
    hiwStep1Title: "Search",
    hiwStep1Desc:
      "Filter by destination, boat type and dates. Compare hundreds of listings with photos and verified reviews.",
    hiwStep2Title: "Book securely",
    hiwStep2Desc:
      "Send your request. Secure payment, insurance included. Your money is protected until you board.",
    hiwStep3Title: "Sail & enjoy",
    hiwStep3Desc:
      "Get on board and live your adventure. Our team is available 24/7 throughout your trip.",
    hiwCtaFind: "Find my boat",
    hiwCtaMore: "Learn more",
    ownerEyebrow: "For owners",
    ownerTitleBefore: "Your boat can earn up to",
    ownerTitleAmount: "€40,000",
    ownerTitleAfter: "per year",
    ownerDesc:
      "Rent out your boat when you're not using it. SailingLoc handles the booking, insurance, payments and contract. All you have to do is welcome your renters.",
    ownerBenefit1: "Free registration, no subscription",
    ownerBenefit2: "You set your own rates and availability",
    ownerBenefit3: "All-risk insurance included",
    ownerBenefit4: "Automatic payout within 24h",
    ownerCtaBecome: "Become a SailingLoc owner",
    ownerCtaHow: "How does it work?",
    estimatorTitle: "Earnings estimator",
    estimateSailboatType: "40-foot sailboat",
    estimateSailboatWeeks: "4 weeks/summer",
    estimateCatamaranType: "45-foot catamaran",
    estimateCatamaranWeeks: "8 weeks/summer",
    estimateMotorType: "35-foot motorboat",
    estimateMotorWeeks: "6 weeks/year",
    perYear: "/ year",
    estimatorCta: "See estimated earnings",
    seoTitle: "Peer-to-peer boat rental in France and Europe",
    seoText:
      "SailingLoc is the leading platform for peer-to-peer boat rental. Book a sailboat, catamaran or motorboat at the best price, with insurance included and secure payment. Find the ideal boat for your holidays in the Mediterranean, on the Atlantic or abroad — French Riviera, Corsica, the Cyclades, the Balearics, Croatia and much more.",
  },

  destinationCard: {
    boats: "boats",
    from: "from",
    perDayShort: "€/day",
  },

  stats: {
    boatsAvailable: "Boats available",
    countries: "Countries in Europe",
    completedTrips: "Trips completed",
    satisfaction: "Satisfaction rating",
  },

  dateField: {
    placeholder: "Select",
    dialogAria: "Choose a date",
    close: "Close",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    intlLocale: "en-GB",
    weekdays: ["M", "T", "W", "T", "F", "S", "S"],
    months: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
  },
};

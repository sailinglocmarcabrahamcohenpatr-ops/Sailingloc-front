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
};

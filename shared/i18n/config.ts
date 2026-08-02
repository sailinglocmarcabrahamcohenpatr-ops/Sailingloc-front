/* ──────────────────────────────────────────────────────────────
   Configuration i18n — source unique des locales supportées.

   Contrainte structurante : le FRANÇAIS est la locale par défaut et
   n'a PAS de préfixe d'URL (/bateaux, /destinations…). L'anglais est
   un overlay servi sous /en (/en/bateaux…). Ce choix préserve à
   l'identique toutes les URLs FR existantes (SEO, liens entrants,
   liens internes) : aucune redirection de masse, aucun /fr rétroactif.
   ────────────────────────────────────────────────────────────── */

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

/** En-tête posé par le proxy sur la requête réécrite, lu côté serveur. */
export const LOCALE_HEADER = "x-sl-locale";
/** Cookie mémorisant le choix de langue, lu côté client et par le proxy. */
export const LOCALE_COOKIE = "sl_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value != null && (locales as readonly string[]).includes(value);
}

/** Préfixe une URL interne selon la locale. FR = inchangé ; EN = /en/…
 *  Les ancres pures, liens externes et mailto/tel sont laissés tels quels. */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === defaultLocale) return href;
  if (!href.startsWith("/")) return href; // #ancre, http(s):, mailto:, tel:
  if (href === "/") return "/en";
  // Évite un double préfixe si le lien est déjà localisé.
  if (href === "/en" || href.startsWith("/en/")) return href;
  return `/en${href}`;
}

/** Retire le préfixe de locale d'un pathname pour retrouver le chemin FR
 *  canonique (utilisé par le proxy pour la logique d'auth et par le
 *  sélecteur de langue). */
export function stripLocale(pathname: string): { locale: Locale; pathname: string } {
  if (pathname === "/en") return { locale: "en", pathname: "/" };
  if (pathname.startsWith("/en/")) return { locale: "en", pathname: pathname.slice(3) };
  return { locale: "fr", pathname };
}

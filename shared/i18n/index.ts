/* Barrel i18n universel (client + serveur).

   IMPORTANT : ne ré-exporte PAS get-dictionary.ts (marqué "server-only").
   Le code serveur l'importe directement depuis "@/shared/i18n/get-dictionary".
   Ainsi ce barrel reste importable depuis les composants clients. */

export {
  locales,
  defaultLocale,
  isLocale,
  localizeHref,
  stripLocale,
  LOCALE_HEADER,
  LOCALE_COOKIE,
} from "./config";
export type { Locale } from "./config";

export type { Dictionary } from "./dictionaries/fr";

export { I18nProvider, useI18n, useLocalizedHref, LocaleLink } from "./context";
export { LanguageSwitcher } from "./LanguageSwitcher";

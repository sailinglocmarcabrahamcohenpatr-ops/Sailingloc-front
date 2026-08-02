import "server-only";
import { headers, cookies } from "next/headers";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/fr";
import { LOCALE_HEADER, LOCALE_COOKIE, isLocale, defaultLocale } from "./config";
import { fr } from "./dictionaries/fr";
import { en } from "./dictionaries/en";

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Locale active de la requête courante, côté serveur.
 *  Priorité : en-tête posé par le proxy sur la requête réécrite → cookie
 *  → défaut FR. Lisible depuis n'importe quel layout/page serveur. */
export async function getRequestLocale(): Promise<Locale> {
  const fromHeader = (await headers()).get(LOCALE_HEADER);
  if (isLocale(fromHeader)) return fromHeader;
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  return defaultLocale;
}

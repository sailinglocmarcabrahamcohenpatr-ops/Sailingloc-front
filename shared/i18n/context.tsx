"use client";

/* ──────────────────────────────────────────────────────────────
   Contexte i18n CÔTÉ CLIENT.

   Le layout serveur charge le dictionnaire de la locale active et le
   passe à ce provider. Les composants clients (navbar, formulaires,
   tunnels…) lisent la locale et les libellés via useI18n(). Seul le
   dictionnaire de la locale COURANTE transite vers le client — pas
   les deux — donc le coût bundle reste celui d'une seule langue.
   ────────────────────────────────────────────────────────────── */

import { createContext, useContext, useCallback, type ReactNode } from "react";
import NextLink, { type LinkProps } from "next/link";
import { type Locale, localizeHref } from "./config";
import type { Dictionary } from "./dictionaries/fr";

interface I18nValue {
  locale: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n doit être utilisé à l'intérieur d'un <I18nProvider>.");
  }
  return ctx;
}

/** Retourne une fonction qui préfixe une URL interne selon la locale active. */
export function useLocalizedHref(): (href: string) => string {
  const { locale } = useI18n();
  return useCallback((href: string) => localizeHref(href, locale), [locale]);
}

/** Remplaçant direct de `next/link` : préfixe automatiquement le href
 *  selon la locale active. S'importe en alias pour une conversion à
 *  diff minimal :  import { LocaleLink as Link } from "@/shared/i18n"; */
export function LocaleLink({
  href,
  ...props
}: Omit<LinkProps, "href"> & {
  href: string;
  children?: ReactNode;
  className?: string;
  "aria-label"?: string;
  onClick?: React.MouseEventHandler;
  role?: string;
  title?: string;
}) {
  const { locale } = useI18n();
  return <NextLink href={localizeHref(href, locale)} {...props} />;
}

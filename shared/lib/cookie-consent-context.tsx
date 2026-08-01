"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type CookieCategory = "analytics" | "marketing";

export interface CookieCategories {
  analytics: boolean;
  marketing: boolean;
}

interface StoredConsent extends CookieCategories {
  necessary: true;
  date: string;
}

interface CookieConsentContextType {
  /** null tant que l'utilisateur n'a pas répondu au bandeau */
  consent: StoredConsent | null;
  /** false le temps de lire le localStorage côté client (évite le flash du bandeau) */
  ready: boolean;
  preferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (categories: CookieCategories) => void;
  hasConsent: (category: CookieCategory) => boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType>({
  consent: null,
  ready: false,
  preferencesOpen: false,
  openPreferences: () => {},
  closePreferences: () => {},
  acceptAll: () => {},
  rejectAll: () => {},
  savePreferences: () => {},
  hasConsent: () => false,
});

const CONSENT_KEY = "sailingloc_cookie_consent";

function readStoredConsent(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.analytics !== "boolean" || typeof parsed?.marketing !== "boolean") return null;
    return { necessary: true, analytics: parsed.analytics, marketing: parsed.marketing, date: parsed.date ?? new Date().toISOString() };
  } catch {
    return null;
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<StoredConsent | null>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    setConsent(readStoredConsent());
    setReady(true);
  }, []);

  const persist = useCallback((categories: CookieCategories) => {
    const next: StoredConsent = { necessary: true, ...categories, date: new Date().toISOString() };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    } catch {}
    setConsent(next);
    setPreferencesOpen(false);
  }, []);

  const acceptAll = useCallback(() => persist({ analytics: true, marketing: true }), [persist]);
  const rejectAll = useCallback(() => persist({ analytics: false, marketing: false }), [persist]);
  const savePreferences = useCallback((categories: CookieCategories) => persist(categories), [persist]);

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const hasConsent = useCallback((category: CookieCategory) => consent?.[category] === true, [consent]);

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        ready,
        preferencesOpen,
        openPreferences,
        closePreferences,
        acceptAll,
        rejectAll,
        savePreferences,
        hasConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}

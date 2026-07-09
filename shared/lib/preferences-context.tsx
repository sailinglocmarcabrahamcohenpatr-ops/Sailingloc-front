"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";
export type TextSize = "normal" | "large";

interface PreferencesContextType {
  theme: Theme;
  textSize: TextSize;
  reduceMotion: boolean;
  setTheme: (t: Theme) => void;
  setTextSize: (s: TextSize) => void;
  setReduceMotion: (v: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType>({
  theme: "light",
  textSize: "normal",
  reduceMotion: false,
  setTheme: () => {},
  setTextSize: () => {},
  setReduceMotion: () => {},
});

const PREFS_KEY = "sailingloc_prefs";

interface StoredPrefs {
  theme: Theme;
  textSize: TextSize;
  reduceMotion: boolean;
}

function readStoredPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { theme: "light", textSize: "normal", reduceMotion: false, ...JSON.parse(raw) };
  } catch {}
  return { theme: "light", textSize: "normal", reduceMotion: false };
}

function applyToDocument(prefs: StoredPrefs) {
  const root = document.documentElement;
  const resolvedTheme =
    prefs.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : prefs.theme;
  root.setAttribute("data-theme", resolvedTheme);
  root.setAttribute("data-text-size", prefs.textSize);
  if (prefs.reduceMotion) root.setAttribute("data-motion", "reduced");
  else root.removeAttribute("data-motion");
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [textSize, setTextSizeState] = useState<TextSize>("normal");
  const [reduceMotion, setReduceMotionState] = useState(false);

  useEffect(() => {
    const stored = readStoredPrefs();
    setThemeState(stored.theme);
    setTextSizeState(stored.textSize);
    setReduceMotionState(stored.reduceMotion);
    applyToDocument(stored);

    if (stored.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyToDocument(readStoredPrefs());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const persist = useCallback((next: Partial<StoredPrefs>) => {
    const current = readStoredPrefs();
    const merged = { ...current, ...next };
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
    } catch {}
    applyToDocument(merged);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    persist({ theme: t });
  }, [persist]);

  const setTextSize = useCallback((s: TextSize) => {
    setTextSizeState(s);
    persist({ textSize: s });
  }, [persist]);

  const setReduceMotion = useCallback((v: boolean) => {
    setReduceMotionState(v);
    persist({ reduceMotion: v });
  }, [persist]);

  return (
    <PreferencesContext.Provider value={{ theme, textSize, reduceMotion, setTheme, setTextSize, setReduceMotion }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}

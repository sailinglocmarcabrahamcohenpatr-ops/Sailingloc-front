"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { locales, type Locale, stripLocale, localizeHref, LOCALE_COOKIE } from "./config";
import { useI18n } from "./context";
import "./language-switcher.css";

/** Sélecteur de langue FR / EN.
 *  Bascule = on réécrit l'URL vers la version localisée du chemin courant
 *  (le proxy déduit la locale du préfixe /en), on mémorise le choix dans un
 *  cookie, puis router.refresh() re-rend les composants serveur. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale: current } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(target: Locale) {
    if (target === current) return;
    const { pathname: canonical } = stripLocale(pathname);
    const query = searchParams.toString();
    const href = localizeHref(canonical, target) + (query ? `?${query}` : "");

    // Cookie mémoire (1 an) : le serveur le lira sur les prochaines requêtes.
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;

    startTransition(() => {
      router.push(href);
      router.refresh();
    });
  }

  return (
    <div className={`lang-switcher${className ? ` ${className}` : ""}`} role="group" aria-label="Language">
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          className={`lang-switcher-btn${loc === current ? " is-active" : ""}`}
          aria-pressed={loc === current}
          disabled={isPending}
          onClick={() => switchTo(loc)}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

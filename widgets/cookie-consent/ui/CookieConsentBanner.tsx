"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCookieConsent } from "@/shared/lib";
import type { CookieCategories } from "@/shared/lib";

const CATEGORIES: { key: keyof CookieCategories; icon: string; title: string; desc: string }[] = [
  {
    key: "analytics",
    icon: "fa-chart-line",
    title: "Mesure d'audience",
    desc: "Statistiques de visite anonymisées pour comprendre l'usage du site et l'améliorer.",
  },
  {
    key: "marketing",
    icon: "fa-bullhorn",
    title: "Publicité & personnalisation",
    desc: "Contenus et offres adaptés à vos centres d'intérêt sur SailingLoc et ailleurs.",
  },
];

export default function CookieConsentBanner() {
  const { consent, ready, preferencesOpen, openPreferences, closePreferences, acceptAll, rejectAll, savePreferences } = useCookieConsent();
  const [draft, setDraft] = useState<CookieCategories>({ analytics: false, marketing: false });

  useEffect(() => {
    if (preferencesOpen) {
      setDraft({ analytics: consent?.analytics ?? false, marketing: consent?.marketing ?? false });
    }
  }, [preferencesOpen, consent]);

  if (!ready) return null;

  const showBanner = consent === null && !preferencesOpen;

  if (!showBanner && !preferencesOpen) return null;

  return (
    <>
      {showBanner && (
        <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Gestion des cookies">
          <div className="cookie-banner-inner">
            <div className="cookie-banner-icon" aria-hidden="true">
              <i className="fa-solid fa-cookie-bite" />
            </div>
            <div className="cookie-banner-text">
              <strong>Nous utilisons des cookies</strong>
              <p>
                SailingLoc utilise des cookies nécessaires au fonctionnement du site, ainsi que des cookies de mesure
                d'audience et de personnalisation soumis à votre consentement. Consultez notre{" "}
                <Link href="/cookies" className="cookie-banner-link">politique de cookies</Link> pour en savoir plus.
              </p>
            </div>
            <div className="cookie-banner-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={openPreferences}>
                Personnaliser
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={rejectAll}>
                Tout refuser
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={acceptAll}>
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      )}

      {preferencesOpen && (
        <div className="cookie-modal-overlay" onClick={closePreferences}>
          <div
            className="cookie-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="cookie-modal-close" onClick={closePreferences} aria-label="Fermer">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>

            <h3 id="cookie-modal-title">
              <i className="fa-solid fa-sliders" aria-hidden="true" /> Préférences des cookies
            </h3>
            <p className="cookie-modal-intro">
              Choisissez les cookies que vous autorisez. Les cookies strictement nécessaires sont toujours actifs
              pour garantir le bon fonctionnement du site (connexion, sécurité, panier de réservation).
            </p>

            <div className="settings-list">
              <div className="setting-item">
                <div>
                  <strong>Strictement nécessaires</strong>
                  <span>Indispensables à la navigation et à la sécurité, ne peuvent pas être désactivés.</span>
                </div>
                <button type="button" className="toggle-switch active" disabled aria-checked="true" role="switch" aria-label="Cookies nécessaires, toujours actifs">
                  <span />
                </button>
              </div>

              {CATEGORIES.map((cat) => (
                <div className="setting-item" key={cat.key}>
                  <div>
                    <strong><i className={`fa-solid ${cat.icon}`} aria-hidden="true" style={{ marginRight: 8, color: "var(--primary)" }} />{cat.title}</strong>
                    <span>{cat.desc}</span>
                  </div>
                  <button
                    type="button"
                    className={`toggle-switch${draft[cat.key] ? " active" : ""}`}
                    onClick={() => setDraft((d) => ({ ...d, [cat.key]: !d[cat.key] }))}
                    aria-checked={draft[cat.key]}
                    role="switch"
                    aria-label={cat.title}
                  >
                    <span />
                  </button>
                </div>
              ))}
            </div>

            <p className="cookie-modal-footnote">
              En savoir plus dans notre <Link href="/cookies" className="cookie-banner-link">politique de cookies</Link>{" "}
              et notre <Link href="/confidentialite" className="cookie-banner-link">politique de confidentialité</Link>.
            </p>

            <div className="cookie-modal-actions">
              <button type="button" className="btn btn-outline" onClick={rejectAll}>
                Tout refuser
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => savePreferences(draft)}>
                Enregistrer mes choix
              </button>
              <button type="button" className="btn btn-primary" onClick={acceptAll}>
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

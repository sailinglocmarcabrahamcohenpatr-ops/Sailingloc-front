"use client";

import { usePreferences } from "@/shared/lib";
import type { Theme, TextSize } from "@/shared/lib";

const THEME_OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Clair", icon: "fa-sun" },
  { value: "dark", label: "Sombre", icon: "fa-moon" },
  { value: "system", label: "Automatique", icon: "fa-circle-half-stroke" },
];

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string; sample: string }[] = [
  { value: "normal", label: "Normal", sample: "16px" },
  { value: "large", label: "Grand", sample: "18px" },
];

export default function AffichagePage() {
  const { theme, setTheme, textSize, setTextSize, reduceMotion, setReduceMotion } = usePreferences();

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="dash-page-icon"><i className="fa-solid fa-circle-half-stroke" /></div>
          <div>
            <h1 className="dash-title">Affichage et accessibilité</h1>
            <p className="dash-sub">Adaptez l'apparence de SailingLoc à votre confort de lecture</p>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Thème</h3></div>
        <p style={{ fontSize: ".875rem", color: "var(--text-2)", marginBottom: 16 }}>
          Choisissez l'apparence de l'application, ou laissez-la suivre les réglages de votre appareil.
        </p>
        <div className="display-option-row" role="radiogroup" aria-label="Thème">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={theme === opt.value}
              className={`display-option-btn${theme === opt.value ? " active" : ""}`}
              onClick={() => setTheme(opt.value)}
            >
              <i className={`fa-solid ${opt.icon}`} aria-hidden="true" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Taille du texte</h3></div>
        <p style={{ fontSize: ".875rem", color: "var(--text-2)", marginBottom: 16 }}>
          Agrandissez le texte sur l'ensemble du site si vous le trouvez trop petit.
        </p>
        <div className="display-option-row" role="radiogroup" aria-label="Taille du texte">
          {TEXT_SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={textSize === opt.value}
              className={`display-option-btn${textSize === opt.value ? " active" : ""}`}
              onClick={() => setTextSize(opt.value)}
            >
              <span style={{ fontSize: opt.value === "large" ? "1.125rem" : "1rem", fontWeight: 700 }}>Aa</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Mouvement</h3></div>
        <div className="settings-list">
          <div className="setting-item">
            <div>
              <strong>Réduire les animations</strong>
              <span>Désactive les transitions et animations pour un affichage plus statique</span>
            </div>
            <button
              className={`toggle-switch${reduceMotion ? " active" : ""}`}
              onClick={() => setReduceMotion(!reduceMotion)}
              aria-checked={reduceMotion}
              role="switch"
              aria-label="Réduire les animations"
            >
              <span />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

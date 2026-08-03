"use client";

import { usePreferences } from "@/shared/lib";
import type { Theme, TextSize } from "@/shared/lib";
import { useI18n } from "@/shared/i18n";

export default function AffichagePage() {
  const { theme, setTheme, textSize, setTextSize, reduceMotion, setReduceMotion } = usePreferences();
  const t = useI18n().dict.affichagePage;

  const THEME_OPTIONS: { value: Theme; label: string; icon: string }[] = [
    { value: "light",  label: t.themeLight,  icon: "fa-sun" },
    { value: "dark",   label: t.themeDark,   icon: "fa-moon" },
    { value: "system", label: t.themeSystem, icon: "fa-circle-half-stroke" },
  ];

  const TEXT_SIZE_OPTIONS: { value: TextSize; label: string; sample: string }[] = [
    { value: "normal", label: t.sizeNormal, sample: "16px" },
    { value: "large",  label: t.sizeLarge,  sample: "18px" },
  ];

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="dash-page-icon"><i className="fa-solid fa-circle-half-stroke" /></div>
          <div>
            <h1 className="dash-title">{t.title}</h1>
            <p className="dash-sub">{t.sub}</p>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>{t.themeCardTitle}</h3></div>
        <p style={{ fontSize: ".875rem", color: "var(--text-2)", marginBottom: 16 }}>
          {t.themeCardDesc}
        </p>
        <div className="display-option-row" role="radiogroup" aria-label={t.themeAria}>
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
        <div className="dash-card-hd"><h3>{t.textSizeCardTitle}</h3></div>
        <p style={{ fontSize: ".875rem", color: "var(--text-2)", marginBottom: 16 }}>
          {t.textSizeCardDesc}
        </p>
        <div className="display-option-row" role="radiogroup" aria-label={t.textSizeAria}>
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
        <div className="dash-card-hd"><h3>{t.motionCardTitle}</h3></div>
        <div className="settings-list">
          <div className="setting-item">
            <div>
              <strong>{t.reduceMotionLabel}</strong>
              <span>{t.reduceMotionDesc}</span>
            </div>
            <button
              className={`toggle-switch${reduceMotion ? " active" : ""}`}
              onClick={() => setReduceMotion(!reduceMotion)}
              aria-checked={reduceMotion}
              role="switch"
              aria-label={t.reduceMotionAria}
            >
              <span />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

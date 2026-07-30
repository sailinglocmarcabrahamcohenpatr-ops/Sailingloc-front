"use client";

import { useState } from "react";

export default function ParametresPage() {
  const [notifications, setNotifications] = useState({
    email_resa: true,
    email_messages: true,
    email_promo: false,
    sms_resa: true,
    sms_messages: false,
  });

  const toggle = (key: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <h1 className="dash-title">Paramètres</h1>
        <p className="dash-sub">Gérez vos préférences et la confidentialité de votre compte</p>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Notifications par e-mail</h3></div>
        <div className="settings-list">
          {[
            { key: "email_resa", label: "Confirmation de réservation", desc: "Recevez un e-mail à chaque nouvelle réservation" },
            { key: "email_messages", label: "Nouveaux messages", desc: "Soyez notifié lors de nouveaux messages" },
            { key: "email_promo", label: "Promotions & offres spéciales", desc: "Les meilleures offres de la plateforme" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="setting-item">
              <div>
                <strong>{label}</strong>
                <span>{desc}</span>
              </div>
              <button
                className={`toggle-switch${notifications[key as keyof typeof notifications] ? " active" : ""}`}
                onClick={() => toggle(key as keyof typeof notifications)}
                aria-checked={notifications[key as keyof typeof notifications]}
                role="switch"
                aria-label={label}
              >
                <span />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Notifications par SMS</h3></div>
        <div className="settings-list">
          {[
            { key: "sms_resa", label: "Réservations", desc: "SMS de confirmation et rappel" },
            { key: "sms_messages", label: "Messages urgents", desc: "SMS uniquement pour les messages urgents" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="setting-item">
              <div>
                <strong>{label}</strong>
                <span>{desc}</span>
              </div>
              <button
                className={`toggle-switch${notifications[key as keyof typeof notifications] ? " active" : ""}`}
                onClick={() => toggle(key as keyof typeof notifications)}
                aria-checked={notifications[key as keyof typeof notifications]}
                role="switch"
                aria-label={label}
              >
                <span />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Confidentialité</h3></div>
        <div className="settings-list">
          <div className="setting-item">
            <div>
              <strong>Profil public</strong>
              <span>Votre profil est visible par les propriétaires que vous contactez</span>
            </div>
            <span className="badge-status green">Activé</span>
          </div>
          <div className="setting-item">
            <div>
              <strong>Partage de données partenaires</strong>
              <span>Partager des données anonymisées à des fins d'amélioration du service</span>
            </div>
            <button className="btn btn-outline btn-sm">Gérer</button>
          </div>
          <div className="setting-item">
            <div>
              <strong>Télécharger mes données</strong>
              <span>Obtenez une copie de toutes vos données personnelles (RGPD)</span>
            </div>
            <button className="btn btn-outline btn-sm">
              <i className="fa-solid fa-download" /> Télécharger
            </button>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Langue &amp; région</h3></div>
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="lang">Langue</label>
            <select id="lang"><option>Français</option><option>English</option><option>Español</option></select>
          </div>
          <div className="form-group">
            <label htmlFor="currency">Devise</label>
            <select id="currency"><option>EUR — Euro (€)</option><option>USD — Dollar ($)</option><option>GBP — Livre (£)</option></select>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: "16px" }}>
          <i className="fa-solid fa-floppy-disk" /> Enregistrer
        </button>
      </div>

      <div className="dash-card danger-zone">
        <div className="dash-card-hd"><h3>Zone dangereuse</h3></div>
        <div className="setting-item">
          <div>
            <strong>Supprimer mon compte</strong>
            <span>Cette action est irréversible. Toutes vos données seront effacées.</span>
          </div>
          <button className="btn btn-sm" style={{ background: "#FEF2F2", color: "var(--red)", border: "1.5px solid #FCA5A5" }}>
            <i className="fa-solid fa-trash" /> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

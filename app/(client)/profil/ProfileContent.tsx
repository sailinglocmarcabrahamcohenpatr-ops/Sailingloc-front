"use client";

import Link from "next/link";
import { useAuth, useMessages } from "@/shared/lib";
import "./profile.css";

const MENU_BOXES = [
  { href: "/profil/reservations", icon: "fa-calendar-check", label: "Réservations", desc: "Vos voyages en cours et passés", color: "#114B6B", bg: "#EAF0F4" },
  { href: "/profil/messages", icon: "fa-envelope", label: "Messages", desc: "Vos échanges avec les propriétaires", color: "#10B981", bg: "#D1FAE5" },
  { href: "/profil/notations", icon: "fa-star", label: "Notations", desc: "Les avis que vous avez laissés", color: "#EAB308", bg: "#FEF9C3" },
  { href: "/profil/favoris", icon: "fa-heart", label: "Favoris", desc: "Les bateaux que vous avez sauvegardés", color: "#DB2777", bg: "#FCE7F3" },
  { href: "/profil/parametres", icon: "fa-sliders", label: "Paramètres", desc: "Notifications et confidentialité", color: "#0284C7", bg: "#E0F2FE" },
  { href: "/profil/devenir-proprietaire", icon: "fa-sailboat", label: "Devenir propriétaire", desc: "Publiez votre bateau à la location", color: "#059669", bg: "#D1FAE5" },
];

const ACTIVITY = [
  { icon: "fa-calendar-check", color: "#114B6B", bg: "#EAF0F4", title: "Réservation confirmée", detail: "Voilier Excellence · Marseille", time: "il y a 2 j" },
  { icon: "fa-envelope", color: "#10B981", bg: "#D1FAE5", title: "Nouveau message", detail: "Capitaine Léa vous a répondu", time: "il y a 4 j" },
  { icon: "fa-credit-card", color: "#D97706", bg: "#FEF3C7", title: "Paiement effectué", detail: "6 230 € · Location Sun Odyssey 440", time: "il y a 1 sem." },
  { icon: "fa-circle-check", color: "#8B5CF6", bg: "#F5F3FF", title: "Profil vérifié", detail: "Pièce d'identité validée", time: "il y a 1 mois" },
];

export default function ProfileContent() {
  const { user } = useAuth();
  const { unreadCount } = useMessages();

  const displayName = user?.name ?? "Mon compte";
  const displayEmail = user?.email ?? "";
  const firstName = displayName.split(" ")[0] ?? "";
  const lastName = displayName.split(" ").slice(1).join(" ");

  return (
    <div className="profile-page-v2">
      <div className="profile-welcome">
        <h1>Bonjour {firstName || "à vous"}</h1>
        <p>Retrouvez ici toutes vos réservations, messages et informations personnelles.</p>
      </div>

      <nav className="profile-menu-grid" aria-label="Accès rapide">
        {MENU_BOXES.filter((m) => user?.role === "proprietaire" ? m.href !== "/profil/devenir-proprietaire" : true).map((m) => {
          const badge = m.href === "/profil/messages" ? unreadCount : 0;
          return (
            <Link key={m.href} href={m.href} className="profile-menu-box">
              <span className="profile-menu-box-icon" style={{ background: m.bg, color: m.color }}>
                <i className={`fa-solid ${m.icon}`} aria-hidden="true" />
              </span>
              <span className="profile-menu-box-text">
                <strong>{m.label}</strong>
                <span>{m.desc}</span>
              </span>
              {badge > 0 && <span className="profile-menu-box-badge">{badge}</span>}
              <i className="fa-solid fa-chevron-right profile-menu-box-chevron" aria-hidden="true" />
            </Link>
          );
        })}
      </nav>

      <div className="profile-columns">
        <div className="profile-col-main">
          <div className="dash-card">
            <div className="dash-card-hd"><h3>Informations personnelles</h3></div>
            <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="pf-fn">Prénom</label>
                  <input id="pf-fn" type="text" defaultValue={firstName} />
                </div>
                <div className="form-group">
                  <label htmlFor="pf-ln">Nom</label>
                  <input id="pf-ln" type="text" defaultValue={lastName} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="pf-email">E-mail</label>
                <input id="pf-email" type="email" defaultValue={displayEmail} />
              </div>
              <div className="form-group">
                <label htmlFor="pf-phone">Téléphone</label>
                <input id="pf-phone" type="tel" defaultValue="+33 6 12 34 56 78" />
              </div>
              <div className="form-group">
                <label htmlFor="pf-location">Ville</label>
                <input id="pf-location" type="text" placeholder="Paris, France" />
              </div>
              <div className="form-group">
                <label htmlFor="pf-bio">Bio <span className="form-optional">(optionnel)</span></label>
                <textarea id="pf-bio" rows={3} placeholder="Parlez-vous aux propriétaires : expérience en voile, habitudes, etc." />
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fa-solid fa-floppy-disk" /> Enregistrer
              </button>
            </form>
          </div>

          <div className="dash-card">
            <div className="dash-card-hd"><h3>Sécurité du compte</h3></div>
            <div className="security-items">
              <div className="security-item">
                <div><strong>Mot de passe</strong><span>Modifié il y a 3 mois</span></div>
                <button className="btn btn-outline btn-sm">Changer</button>
              </div>
              <div className="security-item">
                <div><strong>Double authentification</strong><span>Non activée</span></div>
                <button className="btn btn-outline btn-sm">Activer</button>
              </div>
              <div className="security-item">
                <div><strong>Identité vérifiée</strong><span>Pièce d&apos;identité validée</span></div>
                <span className="badge-status green"><i className="fa-solid fa-check" /> Vérifié</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-col-side">
          <div className="dash-card">
            <div className="dash-card-hd"><h3>Activité récente</h3></div>
            <div className="profile-activity-list">
              {ACTIVITY.map((a) => (
                <div key={a.title + a.time} className="profile-activity-item">
                  <div className="profile-activity-icon" style={{ background: a.bg, color: a.color }}>
                    <i className={`fa-solid ${a.icon}`} aria-hidden="true" />
                  </div>
                  <div className="profile-activity-content">
                    <strong>{a.title}</strong>
                    <span>{a.detail}</span>
                  </div>
                  <span className="profile-activity-time">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

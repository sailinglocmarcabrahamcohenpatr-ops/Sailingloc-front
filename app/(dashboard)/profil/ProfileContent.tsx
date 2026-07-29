"use client";

import Link from "next/link";
import { useAuth } from "@/shared/lib";
import "./profile.css";

const QUICK_LINKS = [
  { href: "/profil/reservations", icon: "fa-calendar-check", label: "Réservations", color: "#1866F2", bg: "#EEF3FE" },
  { href: "/profil/messages", icon: "fa-envelope", label: "Messages", badge: 1, color: "#10B981", bg: "#D1FAE5" },
  { href: "/profil/documents", icon: "fa-id-card", label: "Documents", color: "#8B5CF6", bg: "#F5F3FF" },
  { href: "/profil/paiements", icon: "fa-credit-card", label: "Paiements", color: "#D97706", bg: "#FEF3C7" },
  { href: "/profil/parametres", icon: "fa-sliders", label: "Paramètres", color: "#0284C7", bg: "#E0F2FE" },
  { href: "/contact", icon: "fa-headset", label: "Support", color: "#DB2777", bg: "#FCE7F3" },
];

const ACTIVITY = [
  { icon: "fa-calendar-check", color: "#1866F2", bg: "#EEF3FE", title: "Réservation confirmée", detail: "Voilier Excellence · Marseille", time: "il y a 2 j" },
  { icon: "fa-envelope", color: "#10B981", bg: "#D1FAE5", title: "Nouveau message", detail: "Capitaine Léa vous a répondu", time: "il y a 4 j" },
  { icon: "fa-credit-card", color: "#D97706", bg: "#FEF3C7", title: "Paiement effectué", detail: "6 230 € · Location Sun Odyssey 440", time: "il y a 1 sem." },
  { icon: "fa-circle-check", color: "#8B5CF6", bg: "#F5F3FF", title: "Profil vérifié", detail: "Pièce d'identité validée", time: "il y a 1 mois" },
];

export default function ProfileContent() {
  const { user } = useAuth();

  const displayName = user?.name ?? "Mon compte";
  const displayEmail = user?.email ?? "";
  const displayRole = user?.role === "proprietaire" ? "Propriétaire" : "Locataire";
  const nameParts = displayName.split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");
  const initials = user?.initials ?? displayName.slice(0, 2).toUpperCase();

  return (
    <div className="profile-page-v2">
      <div className="profile-hero">
        <div className="profile-hero-banner" />
        <div className="profile-hero-body">
          <div className="profile-avatar-wrap">
            <div
              className="dash-sidebar-avatar"
              style={{ width: 88, height: 88, fontSize: "1.75rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary)", color: "#fff", fontWeight: 700 }}
              aria-hidden="true"
            >
              {initials}
            </div>
            <button className="profile-avatar-edit" aria-label="Changer la photo">
              <i className="fa-solid fa-camera" />
            </button>
          </div>
          <div className="profile-hero-info">
            <h2>{displayName}</h2>
            <p><i className="fa-solid fa-sailboat" /> {displayRole} · Membre depuis 2024</p>
            <span className="profile-verified">
              <i className="fa-solid fa-circle-check" style={{ color: "var(--green)" }} /> Identité vérifiée
            </span>
          </div>
          <button className="btn btn-outline btn-sm profile-hero-edit-btn">
            <i className="fa-solid fa-pen" /> Modifier le profil
          </button>
        </div>
        <div className="profile-hero-stats">
          <div className="profile-hero-stat"><strong>8</strong><span>Voyages</span></div>
          <div className="profile-hero-stat"><strong>4.9 <i className="fa-solid fa-star" style={{ color: "var(--star)", fontSize: ".9em" }} aria-hidden="true" /></strong><span>Note</span></div>
          <div className="profile-hero-stat"><strong>1 an</strong><span>Membre</span></div>
        </div>
      </div>

      <nav className="profile-quick-row" aria-label="Accès rapide">
        {QUICK_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="profile-quick-item">
            <span className="profile-quick-icon-wrap">
              <span className="profile-quick-icon" style={{ background: l.bg, color: l.color }}>
                <i className={`fa-solid ${l.icon}`} aria-hidden="true" />
              </span>
              {l.badge ? <span className="profile-quick-badge">{l.badge}</span> : null}
            </span>
            <span>{l.label}</span>
          </Link>
        ))}
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
                <div><strong>Identité vérifiée</strong><span>Pièce d'identité validée</span></div>
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

          <div className="dash-card">
            <div className="dash-card-hd"><h3>Paiement</h3></div>
            <div className="payment-items">
              <div className="payment-method">
                <i className="fa-brands fa-cc-visa" style={{ fontSize: "1.5rem", color: "#1A1F71" }} />
                <div><strong>Visa •••• 4242</strong><span>Expire 09/2027</span></div>
                <button className="btn btn-ghost btn-sm">Supprimer</button>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: "12px" }}>
              <i className="fa-solid fa-plus" /> Ajouter un moyen de paiement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

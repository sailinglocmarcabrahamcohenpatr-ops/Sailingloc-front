"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, useMessages, useNotifications, utilisateursApi, ApiError } from "@/shared/lib";
import type { NotificationType } from "@/shared/lib";
import "./profile.css";

const MENU_BOXES = [
  { href: "/profil/reservations", icon: "fa-calendar-check", label: "Réservations", desc: "Vos voyages en cours et passés", color: "#114B6B", bg: "#EAF0F4" },
  { href: "/profil/messages", icon: "fa-envelope", label: "Messages", desc: "Vos échanges avec les propriétaires", color: "#10B981", bg: "#D1FAE5" },
  { href: "/profil/notations", icon: "fa-star", label: "Notations", desc: "Les avis que vous avez laissés", color: "#EAB308", bg: "#FEF9C3" },
  { href: "/profil/favoris", icon: "fa-heart", label: "Favoris", desc: "Les bateaux que vous avez sauvegardés", color: "#DB2777", bg: "#FCE7F3" },
  { href: "/profil/radar", icon: "fa-satellite-dish", label: "Radar", desc: "Repérez-vous en mer et suivez vos bateaux réservés", color: "#0891B2", bg: "#CFFAFE" },
  { href: "/profil/devenir-proprietaire", icon: "fa-sailboat", label: "Devenir propriétaire", desc: "Publiez votre bateau à la location", color: "#059669", bg: "#D1FAE5" },
];

/* Même flux que la cloche de notifications (widgets/notifications), mais avec
   les couleurs hex utilisées par cette page plutôt que des classes CSS. */
const ACTIVITY_META: Record<NotificationType, { icon: string; color: string; bg: string }> = {
  nouvelle_reservation: { icon: "fa-calendar-plus", color: "#114B6B", bg: "#EAF0F4" },
  reservation_confirmee: { icon: "fa-calendar-check", color: "#114B6B", bg: "#EAF0F4" },
  nouvel_avis: { icon: "fa-star", color: "#EAB308", bg: "#FEF9C3" },
};
const ACTIVITY_FALLBACK = { icon: "fa-bell", color: "#637083", bg: "#F1F5F9" };

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function ProfileContent() {
  const { user, updateUser } = useAuth();
  const { messages, unreadCount, loading: messagesLoading } = useMessages();
  const { notifications, loading: notificationsLoading } = useNotifications();
  const activityLoading = messagesLoading || notificationsLoading;

  /* Les messages n'ont pas d'entrée dans /api/notifications (table dédiée
     côté back) : on les fusionne ici avec les vraies notifications pour
     que l'activité récente reflète aussi les échanges reçus. */
  const activity = [
    ...notifications.map((n) => {
      const meta = ACTIVITY_META[n.type] ?? ACTIVITY_FALLBACK;
      return { id: `notif-${n.id}`, dateIso: n.dateCreation, icon: meta.icon, color: meta.color, bg: meta.bg, title: n.titre, detail: n.message };
    }),
    ...messages
      .filter((m) => m.destinataire.email === user?.email)
      .map((m) => ({
        id: `msg-${m.id}`,
        dateIso: m.dateEnvoi,
        icon: "fa-envelope",
        color: "#10B981",
        bg: "#D1FAE5",
        title: `Message de ${m.expediteur.prenom}`,
        detail: m.contenu.length > 70 ? `${m.contenu.slice(0, 67)}…` : m.contenu,
      })),
  ].sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());

  const displayName = user?.name ?? "Mon compte";
  const firstName = displayName.split(" ")[0] ?? "";

  // Le layout (client) bloque le rendu tant que `user` n'est pas chargé —
  // à ce stade il est donc déjà disponible, d'où les initialiseurs directs.
  const [prenom, setPrenom] = useState(() => user?.name.split(" ")[0] ?? "");
  const [nom, setNom] = useState(() => user?.name.split(" ").slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(() => user?.email ?? "");
  const [telephone, setTelephone] = useState(() => user?.telephone ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await utilisateursApi.update(user.id, {
        prenom,
        nom,
        email,
        telephone: telephone || undefined,
        ...(password ? { password } : {}),
      });
      updateUser({ name: `${prenom} ${nom}`.trim(), email, telephone });
      setPassword("");
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Impossible d'enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page-v2">
      <div className="profile-welcome">
        <h1>Bonjour {firstName || "à vous"}</h1>
        <p>Retrouvez ici toutes vos réservations, messages et informations personnelles.</p>
      </div>

      <nav className="profile-menu-grid" aria-label="Accès rapide">
        {MENU_BOXES.filter((m) =>
          user?.role === "proprietaire" ? m.href !== "/profil/devenir-proprietaire" && m.href !== "/profil/radar" : true
        ).map((m) => {
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
            <form className="profile-form" onSubmit={handleSave}>
              {saveError && (
                <div className="profile-form-alert" role="alert">
                  <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="profile-form-alert success" role="status">
                  <i className="fa-solid fa-circle-check" aria-hidden="true" /> Informations mises à jour.
                </div>
              )}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="pf-fn">Prénom</label>
                  <input id="pf-fn" type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="pf-ln">Nom</label>
                  <input id="pf-ln" type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="pf-email">E-mail</label>
                <input id="pf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="pf-phone">Téléphone</label>
                <input id="pf-phone" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="pf-password">
                  Nouveau mot de passe <span className="form-optional">(laisser vide pour ne pas changer)</span>
                </label>
                <input id="pf-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="8 caractères minimum" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving
                  ? <><i className="fa-solid fa-circle-notch fa-spin" /> Enregistrement…</>
                  : <><i className="fa-solid fa-floppy-disk" /> Enregistrer</>}
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
            {activityLoading ? (
              <div className="profile-activity-loading">
                <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />
              </div>
            ) : activity.length === 0 ? (
              <p className="profile-activity-empty">Aucune activité récente pour l&apos;instant.</p>
            ) : (
              <div className="profile-activity-list">
                {activity.slice(0, 5).map((a) => (
                  <div key={a.id} className="profile-activity-item">
                    <div className="profile-activity-icon" style={{ background: a.bg, color: a.color }}>
                      <i className={`fa-solid ${a.icon}`} aria-hidden="true" />
                    </div>
                    <div className="profile-activity-content">
                      <strong>{a.title}</strong>
                      <span>{a.detail}</span>
                    </div>
                    <span className="profile-activity-time">{formatRelativeTime(a.dateIso)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

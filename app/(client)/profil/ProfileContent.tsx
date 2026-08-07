"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, useMessages, useNotifications, utilisateursApi, ApiError } from "@/shared/lib";
import { isValidEmail } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n";
import type { NotificationType } from "@/shared/lib";
import "./profile.css";

const ACTIVITY_META: Record<NotificationType, { icon: string; color: string; bg: string }> = {
  nouvelle_reservation: { icon: "fa-calendar-plus", color: "#114B6B", bg: "#EAF0F4" },
  reservation_confirmee: { icon: "fa-calendar-check", color: "#114B6B", bg: "#EAF0F4" },
  nouvel_avis: { icon: "fa-star", color: "#EAB308", bg: "#FEF9C3" },
};
const ACTIVITY_FALLBACK = { icon: "fa-bell", color: "#637083", bg: "#F1F5F9" };

function formatRelativeTime(
  iso: string,
  t: { timeJustNow: string; timeMinutes: string; timeHours: string; timeYesterday: string; timeDays: string; intlLocale: string },
): string {
  const fill = (s: string, n: number) => s.replace("{n}", String(n));
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return t.timeJustNow;
  if (min < 60) return fill(t.timeMinutes, min);
  const hours = Math.floor(min / 60);
  if (hours < 24) return fill(t.timeHours, hours);
  const days = Math.floor(hours / 24);
  if (days === 1) return t.timeYesterday;
  if (days < 30) return fill(t.timeDays, days);
  return new Date(iso).toLocaleDateString(t.intlLocale, { day: "numeric", month: "short" });
}

export default function ProfileContent() {
  const { user, updateUser } = useAuth();
  const { messages, unreadCount, loading: messagesLoading } = useMessages();
  const { notifications, loading: notificationsLoading } = useNotifications();
  const t = useI18n().dict.profil;
  const activityLoading = messagesLoading || notificationsLoading;

  const MENU_BOXES = [
    { href: "/profil/reservations", icon: "fa-calendar-check", label: t.menuReservationsLabel, desc: t.menuReservationsDesc, color: "#114B6B", bg: "#EAF0F4" },
    { href: "/profil/messages", icon: "fa-envelope", label: t.menuMessagesLabel, desc: t.menuMessagesDesc, color: "#10B981", bg: "#D1FAE5" },
    { href: "/profil/notations", icon: "fa-star", label: t.menuNotationsLabel, desc: t.menuNotationsDesc, color: "#EAB308", bg: "#FEF9C3" },
    { href: "/profil/favoris", icon: "fa-heart", label: t.menuFavorisLabel, desc: t.menuFavorisDesc, color: "#DB2777", bg: "#FCE7F3" },
    { href: "/profil/radar", icon: "fa-satellite-dish", label: t.menuRadarLabel, desc: t.menuRadarDesc, color: "#0891B2", bg: "#CFFAFE" },
    { href: "/profil/devenir-proprietaire", icon: "fa-sailboat", label: t.menuOwnerLabel, desc: t.menuOwnerDesc, color: "#059669", bg: "#D1FAE5" },
  ];

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
        title: t.activityMsgFrom.replace("{name}", m.expediteur.prenom),
        detail: m.contenu.length > 70 ? `${m.contenu.slice(0, 67)}…` : m.contenu,
      })),
  ].sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());

  const displayName = user?.name ?? "Mon compte";
  const firstName = displayName.split(" ")[0] ?? "";

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
    if (!isValidEmail(email)) { setSaveError(t.errEmailInvalid); return; }
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
      setSaveError(err instanceof ApiError ? err.message : t.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page-v2">
      <div className="profile-welcome">
        <h1>{t.welcomeTitle.replace("{name}", firstName || "")}</h1>
        <p>{t.welcomeSub}</p>
      </div>

      <nav className="profile-menu-grid" aria-label={t.quickAccessAria}>
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
            <div className="dash-card-hd"><h3>{t.personalTitle}</h3></div>
            <form className="profile-form" onSubmit={handleSave}>
              {saveError && (
                <div className="profile-form-alert" role="alert">
                  <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="profile-form-alert success" role="status">
                  <i className="fa-solid fa-circle-check" aria-hidden="true" /> {t.saveSuccess}
                </div>
              )}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="pf-fn">{t.labelFirstName}</label>
                  <input id="pf-fn" type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required maxLength={60} />
                </div>
                <div className="form-group">
                  <label htmlFor="pf-ln">{t.labelLastName}</label>
                  <input id="pf-ln" type="text" value={nom} onChange={(e) => setNom(e.target.value)} required maxLength={60} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="pf-email">{t.labelEmail}</label>
                <input id="pf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} />
              </div>
              <div className="form-group">
                <label htmlFor="pf-phone">{t.labelPhone}</label>
                <input id="pf-phone" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} maxLength={20} />
              </div>
              <div className="form-group">
                <label htmlFor="pf-password">
                  {t.labelPassword} <span className="form-optional">{t.passwordHint}</span>
                </label>
                <input id="pf-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder={t.passwordPlaceholder} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving
                  ? <><i className="fa-solid fa-circle-notch fa-spin" /> {t.saving}</>
                  : <><i className="fa-solid fa-floppy-disk" /> {t.save}</>}
              </button>
            </form>
          </div>

          <div className="dash-card">
            <div className="dash-card-hd"><h3>{t.securityTitle}</h3></div>
            <div className="security-items">
              <div className="security-item">
                <div><strong>{t.securityPasswordLabel}</strong><span>{t.securityPasswordSub}</span></div>
                <button className="btn btn-outline btn-sm">{t.securityPasswordBtn}</button>
              </div>
              <div className="security-item">
                <div><strong>{t.security2faLabel}</strong><span>{t.security2faSub}</span></div>
                <button className="btn btn-outline btn-sm">{t.security2faBtn}</button>
              </div>
              <div className="security-item">
                <div><strong>{t.securityIdLabel}</strong><span>{t.securityIdSub}</span></div>
                <span className="badge-status green"><i className="fa-solid fa-check" /> {t.securityIdBadge}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-col-side">
          <div className="dash-card">
            <div className="dash-card-hd"><h3>{t.activityTitle}</h3></div>
            {activityLoading ? (
              <div className="profile-activity-loading">
                <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />
              </div>
            ) : activity.length === 0 ? (
              <p className="profile-activity-empty">{t.activityEmpty}</p>
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
                    <span className="profile-activity-time">{formatRelativeTime(a.dateIso, t)}</span>
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

"use client";

import "./NotificationsBell.css";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useNotifications, notificationsApi } from "@/shared/lib";
import type { NotificationAPI, NotificationType } from "@/shared/lib";

const TYPE_META: Record<NotificationType, { icon: string; cls: string }> = {
  nouvelle_reservation:  { icon: "fa-calendar-plus",  cls: "notif-icon--blue" },
  reservation_confirmee: { icon: "fa-calendar-check", cls: "notif-icon--green" },
  nouvel_avis:           { icon: "fa-star",            cls: "notif-icon--yellow" },
};

function notificationHref(notif: NotificationAPI): string | undefined {
  if (!notif.reservation) return undefined;
  return notif.type === "reservation_confirmee"
    ? `/profil/reservations/${notif.reservation.id}`
    : "/proprietaire/reservations";
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function NotificationsBell() {
  const { notifications, setNotifications, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function markRead(notif: NotificationAPI) {
    if (notif.lu) return;
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, lu: true } : n)));
    notificationsApi.markAsRead(notif.id).catch(() => {
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, lu: false } : n)));
    });
  }

  function markAllRead() {
    const unread = notifications.filter((n) => !n.lu);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    Promise.allSettled(unread.map((n) => notificationsApi.markAsRead(n.id)));
  }

  function removeNotification(e: React.MouseEvent, id: number) {
    e.preventDefault();
    e.stopPropagation();
    const prevState = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    notificationsApi.delete(id).catch(() => setNotifications(prevState));
  }

  function handleItemClick(notif: NotificationAPI) {
    markRead(notif);
    const href = notificationHref(notif);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  }

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button
        className="notif-bell-btn"
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        <i className="fa-solid fa-bell" aria-hidden="true" />
        {unreadCount > 0 && <span className="notif-bell-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown" role="menu">
          <div className="notif-dropdown-hd">
            <span className="notif-dropdown-title">
              Notifications
              {unreadCount > 0 && <span className="notif-unread-count">{unreadCount}</span>}
            </span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>
                Tout marquer lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notif-empty">
              <i className="fa-regular fa-bell-slash" aria-hidden="true" />
              <p>Aucune notification pour l&apos;instant.</p>
            </div>
          ) : (
            <ul className="notif-list">
              {notifications.map((n) => {
                const meta = TYPE_META[n.type] ?? { icon: "fa-bell", cls: "notif-icon--grey" };
                return (
                  <li
                    key={n.id}
                    className={`notif-item${n.lu ? "" : " unread"}`}
                    onClick={() => handleItemClick(n)}
                    role="menuitem"
                  >
                    <div className={`notif-icon ${meta.cls}`}>
                      <i className={`fa-solid ${meta.icon}`} aria-hidden="true" />
                    </div>
                    <div className="notif-body">
                      <p className="notif-item-title">{n.titre}</p>
                      <p className="notif-item-desc">{n.message}</p>
                      <span className="notif-item-time">{formatRelativeTime(n.dateCreation)}</span>
                    </div>
                    {!n.lu && <span className="notif-dot" aria-label="Non lu" />}
                    <button
                      className="notif-item-delete"
                      onClick={(e) => removeNotification(e, n.id)}
                      aria-label="Supprimer la notification"
                      title="Supprimer"
                    >
                      <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { notificationsApi } from "./notifications-api";
import type { NotificationAPI } from "./notifications-api";
import { getToken } from "./api-client";
import { useAuth } from "./auth-context";
import { useMercureNotifications } from "@/shared/hooks/useMercureNotifications";

interface NotificationsContextType {
  notifications: NotificationAPI[];
  setNotifications: Dispatch<SetStateAction<NotificationAPI[]>>;
  loading: boolean;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  setNotifications: () => {},
  loading: true,
  unreadCount: 0,
});

/** Source unique des notifications pour toute l'app : un seul abonnement
 *  Mercure et un seul polling de secours, montés ici (racine de l'app) plutôt
 *  que dans chaque page — voir MessagesProvider pour le même raisonnement. */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<NotificationAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    notificationsApi.getAll()
      .then((data) => setNotifications([...data].sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const id = setInterval(() => {
      notificationsApi.getAll()
        .then((data) => setNotifications([...data].sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, [userId]);

  const handleRealtimeNotification = useCallback((notif: NotificationAPI) => {
    setNotifications((prev) => (prev.some((n) => n.id === notif.id) ? prev : [notif, ...prev]));
  }, []);
  useMercureNotifications(userId, getToken() ?? undefined, handleRealtimeNotification);

  // Dérivé plutôt que stocké : évite un setState synchrone dans un effet
  // pour vider les notifications à la déconnexion.
  const effectiveNotifications = userId ? notifications : [];
  const unreadCount = effectiveNotifications.filter((n) => !n.lu).length;

  return (
    <NotificationsContext.Provider value={{ notifications: effectiveNotifications, setNotifications, loading: userId ? loading : false, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}

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
 *  Mercure, monté ici (racine de l'app) plutôt que dans chaque page — voir
 *  MessagesProvider pour le même raisonnement. Le temps réel passe par
 *  Mercure quand le hub est configuré ; sinon un poll de secours prend le
 *  relais (voir plus bas). */
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

  /* Filet de secours : sans NEXT_PUBLIC_MERCURE_URL configuré (hub pas
     déployé sur cet environnement), useMercureNotifications ci-dessous ne
     fait rien et rien ne revient rafraîchir l'état après le chargement
     initial. On repasse alors en poll léger — désactivé de lui-même dès que
     Mercure est configuré, pour ne jamais dupliquer le flux temps réel. */
  useEffect(() => {
    if (!userId || process.env.NEXT_PUBLIC_MERCURE_URL) return;
    const id = setInterval(() => {
      notificationsApi.getAll()
        .then((data) => setNotifications([...data].sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())))
        .catch(() => {});
    }, 20000);
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

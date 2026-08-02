"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { messagesApi } from "./messages-api";
import type { MessageAPI } from "./messages-api";
import { getToken } from "./api-client";
import { useAuth } from "./auth-context";
import { useMercureMessages } from "@/shared/hooks/useMercureMessages";

interface MessagesContextType {
  messages: MessageAPI[];
  setMessages: Dispatch<SetStateAction<MessageAPI[]>>;
  loading: boolean;
  unreadCount: number;
}

const MessagesContext = createContext<MessagesContextType>({
  messages: [],
  setMessages: () => {},
  loading: true,
  unreadCount: 0,
});

/** Source unique des messages pour toute l'app : un seul abonnement Mercure,
 *  monté ici (racine de l'app) plutôt que dans chaque page — sans quoi la
 *  connexion SSE se referme et se rouvre à chaque fois qu'on entre/sort de
 *  l'onglet Messages. Pas de polling de secours : le temps réel passe
 *  entièrement par Mercure. */
export function MessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const userEmail = user?.email;
  const [messages, setMessages] = useState<MessageAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    messagesApi.getAll()
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleRealtimeMessage = useCallback((msg: MessageAPI) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);
  useMercureMessages(userId, getToken() ?? undefined, handleRealtimeMessage);

  // Dérivé plutôt que stocké : évite un setState synchrone dans un effet
  // pour vider les messages à la déconnexion.
  const effectiveMessages = userId ? messages : [];
  const unreadCount = userEmail
    ? effectiveMessages.filter((m) => !m.lu && m.destinataire.email === userEmail).length
    : 0;

  return (
    <MessagesContext.Provider value={{ messages: effectiveMessages, setMessages, loading: userId ? loading : false, unreadCount }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  return useContext(MessagesContext);
}

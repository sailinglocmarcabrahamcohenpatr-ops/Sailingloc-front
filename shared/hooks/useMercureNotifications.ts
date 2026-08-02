import { useEffect } from "react";
import type { NotificationAPI } from "@/shared/lib";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Abonnement temps réel aux notifications via Mercure (SSE).
 *  Le cookie mercureAuthorization posé par GET /api/mercure/token couvre déjà
 *  les topics /messages/user/{id} ET /notifications/user/{id}, donc pas besoin
 *  d'un second appel si useMercureMessages tourne déjà — mais on le refait ici
 *  quand même pour que ce hook reste utilisable seul (idempotent côté backend).
 *  No-op tant que NEXT_PUBLIC_MERCURE_URL n'est pas configuré — les pages
 *  notifications continuent de fonctionner via leur polling. */
export function useMercureNotifications(
  userId: number | undefined,
  token: string | undefined,
  onNotification: (notif: NotificationAPI) => void
) {
  useEffect(() => {
    const mercureUrl = process.env.NEXT_PUBLIC_MERCURE_URL;
    if (!userId || !token || !mercureUrl) return;

    let es: EventSource | undefined;
    let cancelled = false;

    async function subscribe(hubUrl: string) {
      try {
        // 1. Pose le cookie mercureAuthorization (scope: /notifications/user/{userId})
        await fetch(`${API_BASE}/api/mercure/token`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;

        // 2. Ouvre la connexion SSE
        const url = new URL(hubUrl);
        url.searchParams.append("topic", `/notifications/user/${userId}`);

        // withCredentials est impératif, sinon le cookie SameSite=None n'est
        // jamais envoyé et la connexion reste "ouverte" mais silencieuse.
        es = new EventSource(url.toString(), { withCredentials: true });
        es.onmessage = (event) => onNotification(JSON.parse(event.data) as NotificationAPI);
        es.onerror = (err) => console.log("Mercure SSE error (notifications)", err);
      } catch (err) {
        console.error("Impossible de s'abonner à Mercure (notifications)", err);
      }
    }

    subscribe(mercureUrl);

    return () => {
      cancelled = true;
      es?.close();
    };
  }, [userId, token, onNotification]);
}

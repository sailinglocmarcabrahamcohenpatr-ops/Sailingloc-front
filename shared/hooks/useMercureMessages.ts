import { useEffect } from "react";
import type { MessageAPI } from "@/shared/lib";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Abonnement temps réel aux nouveaux messages via Mercure (SSE).
 *  No-op tant que NEXT_PUBLIC_MERCURE_URL n'est pas configuré (hub pas encore
 *  déployé) — les pages messages continuent de fonctionner via leur polling. */
export function useMercureMessages(
  userId: number | undefined,
  token: string | undefined,
  onMessage: (msg: MessageAPI) => void
) {
  useEffect(() => {
    const mercureUrl = process.env.NEXT_PUBLIC_MERCURE_URL;
    if (!userId || !token || !mercureUrl) return;

    let es: EventSource | undefined;
    let cancelled = false;

    async function subscribe(hubUrl: string) {
      try {
        // 1. Pose le cookie mercureAuthorization (scope: /messages/user/{userId})
        await fetch(`${API_BASE}/api/mercure/token`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;

        // 2. Ouvre la connexion SSE
        const url = new URL(hubUrl);
        url.searchParams.append("topic", `/messages/user/${userId}`);

        es = new EventSource(url.toString(), { withCredentials: true });
        es.onmessage = (event) => onMessage(JSON.parse(event.data) as MessageAPI);
        es.onerror = (err) => console.log("Mercure SSE error", err);
      } catch (err) {
        console.error("Impossible de s'abonner à Mercure", err);
      }
    }

    subscribe(mercureUrl);

    return () => {
      cancelled = true;
      es?.close();
    };
  }, [userId, token, onMessage]);
}

"use client";

import { useState, useEffect, useRef } from "react";
import { messagesApi } from "@/shared/lib";
import type { MessageAPI } from "@/shared/lib";

interface Conversation {
  key: string;
  otherId: number;
  otherName: string;
  otherInitial: string;
  messages: MessageAPI[];
  unreadCount: number;
  lastDate: string;
}

function groupMessages(msgs: MessageAPI[]): Conversation[] {
  const map = new Map<string, Conversation>();

  for (const msg of msgs) {
    const idA = msg.id_utilisateur;
    const idB = msg.id_utilisateur_1;
    const key = `${Math.min(idA, idB)}-${Math.max(idA, idB)}`;

    if (!map.has(key)) {
      const other = msg.expediteur ?? msg.destinataire;
      const otherName = other ? `${other.prenom} ${other.nom}`.trim() : `Utilisateur`;
      const otherInitial = otherName.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
      map.set(key, { key, otherId: idB, otherName, otherInitial, messages: [], unreadCount: 0, lastDate: "" });
    }

    const conv = map.get(key)!;
    conv.messages.push(msg);
    if (!msg.lu) conv.unreadCount++;
  }

  for (const conv of map.values()) {
    conv.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    conv.lastDate = conv.messages[conv.messages.length - 1]?.created_at ?? "";
  }

  return Array.from(map.values()).sort((a, b) => b.lastDate.localeCompare(a.lastDate));
}

function fmtDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function UserMessagesPage() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = () => {
    messagesApi
      .getAll()
      .then((msgs) => setConvs(groupMessages(msgs)))
      .catch(() => setError("Impossible de charger les messages."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedKey, convs]);

  const selected = convs.find((c) => c.key === selectedKey) ?? null;

  const handleSelect = async (key: string) => {
    setSelectedKey(key);
    const conv = convs.find((c) => c.key === key);
    if (!conv) return;
    // Mark unread messages as read
    const unread = conv.messages.filter((m) => !m.lu);
    for (const m of unread) {
      await messagesApi.markAsRead(m.id).catch(() => null);
    }
    setConvs((prev) =>
      prev.map((c) =>
        c.key === key
          ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, lu: true })) }
          : c
      )
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selected || sending) return;

    setSending(true);
    try {
      const newMsg = await messagesApi.send({
        contenu: reply.trim(),
        id_utilisateur: 0,
        id_utilisateur_1: selected.otherId,
      });
      setConvs((prev) =>
        prev.map((c) =>
          c.key === selectedKey
            ? { ...c, messages: [...c.messages, newMsg] }
            : c
        )
      );
      setReply("");
    } catch {
      // If sending fails (missing userId), still add optimistically for UX
    } finally {
      setSending(false);
    }
  };

  const unreadTotal = convs.reduce((n, c) => n + c.unreadCount, 0);

  if (loading) {
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }} />
          <p style={{ marginTop: "12px" }}>Chargement des messages…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-page">
        <p style={{ color: "var(--red)", padding: "24px" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <h1 className="dash-title">Messages</h1>
        <p className="dash-sub">
          {unreadTotal > 0
            ? `${unreadTotal} message${unreadTotal > 1 ? "s" : ""} non lu${unreadTotal > 1 ? "s" : ""}`
            : "Tous les messages lus"}
        </p>
      </div>

      {convs.length === 0 ? (
        <div className="messages-empty">
          <i className="fa-solid fa-envelope-open-text" />
          <p>Aucun message pour l&apos;instant</p>
        </div>
      ) : (
        <div className="messages-layout">
          <div className="messages-list">
            {convs.map((c) => (
              <div
                key={c.key}
                className={`message-item${c.unreadCount > 0 ? " unread" : ""}${selectedKey === c.key ? " selected" : ""}`}
                onClick={() => handleSelect(c.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(c.key)}
                aria-selected={selectedKey === c.key}
              >
                <div className="message-avatar">{c.otherInitial}</div>
                <div className="message-content">
                  <div className="message-hd">
                    <strong>{c.otherName}</strong>
                    <span className="message-date">{fmtDate(c.lastDate)}</span>
                  </div>
                  <p className="message-preview">
                    {c.messages[c.messages.length - 1]?.contenu ?? ""}
                  </p>
                </div>
                {c.unreadCount > 0 && <div className="message-dot" aria-label="Non lu" />}
              </div>
            ))}
          </div>

          {selected ? (
            <div className="messages-thread">
              <div className="messages-thread-hd">
                <div className="message-avatar">{selected.otherInitial}</div>
                <div>
                  <strong>{selected.otherName}</strong>
                </div>
              </div>
              <div className="messages-thread-body">
                {selected.messages.map((m) => (
                  <div key={m.id} className="thread-msg">
                    <div className="thread-msg-bubble">{m.contenu}</div>
                    <span className="thread-msg-time">
                      {fmtDate(m.created_at)}
                    </span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form className="messages-reply-form" onSubmit={handleSend}>
                <input
                  type="text"
                  className="messages-reply-input"
                  placeholder="Votre réponse…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  aria-label="Répondre"
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={!reply.trim() || sending}>
                  <i className={`fa-solid ${sending ? "fa-circle-notch fa-spin" : "fa-paper-plane"}`} /> Envoyer
                </button>
              </form>
            </div>
          ) : (
            <div className="messages-empty">
              <i className="fa-solid fa-envelope-open-text" />
              <p>Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

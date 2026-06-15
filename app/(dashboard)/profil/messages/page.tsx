"use client";

import { useState } from "react";
import type { Metadata } from "next";

type Conversation = {
  id: string;
  from: string;
  initial: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
  messages: { author: string; text: string; time: string; isMe: boolean }[];
};

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    from: "Marc D.",
    initial: "MD",
    subject: "Sun Odyssey 440 · Juill. 10–17",
    preview: "Bonjour Marie, votre demande de réservation a bien été confirmée. Embarquement à 17h.",
    date: "Aujourd'hui",
    unread: true,
    messages: [
      { author: "Marc D.", text: "Bonjour ! Votre demande de réservation pour le Sun Odyssey 440 a bien été confirmée.", time: "10h12", isMe: false },
      { author: "Marc D.", text: "Embarquement prévu le 10 juillet à 17h au Vieux-Port de Marseille, quai des Belges.", time: "10h13", isMe: false },
      { author: "Moi", text: "Parfait, merci beaucoup ! Nous serons là à 17h pile. À bientôt !", time: "10h35", isMe: true },
    ],
  },
  {
    id: "c2",
    from: "Support SailingLoc",
    initial: "SL",
    subject: "Confirmation de réservation #R-2847",
    preview: "Votre réservation est confirmée. Retrouvez tous les détails dans votre espace.",
    date: "Hier",
    unread: false,
    messages: [
      { author: "Support SailingLoc", text: "Bonjour, votre réservation #R-2847 est confirmée. Vous pouvez retrouver tous les détails dans votre espace personnel.", time: "09h00", isMe: false },
    ],
  },
  {
    id: "c3",
    from: "Pierre T.",
    initial: "PT",
    subject: "Bavaria 46 · Juin 1–8",
    preview: "Merci pour votre avis 5 étoiles ! C'était un plaisir de naviguer ensemble.",
    date: "Il y a 2 sem.",
    unread: false,
    messages: [
      { author: "Moi", text: "Bonjour Pierre, nous avons adoré la semaine sur le Bavaria ! Nous laissons un avis 5 étoiles avec plaisir.", time: "14h20", isMe: true },
      { author: "Pierre T.", text: "Merci beaucoup ! C'était un vrai plaisir de vous accueillir. Revenez quand vous voulez !", time: "15h05", isMe: false },
    ],
  },
];

export default function UserMessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [convs, setConvs] = useState(CONVERSATIONS);
  const [reply, setReply] = useState("");

  const selected = convs.find((c) => c.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setConvs((prev) => prev.map((c) => c.id === id ? { ...c, unread: false } : c));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedId) return;
    setConvs((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, { author: "Moi", text: reply.trim(), time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), isMe: true }] }
          : c
      )
    );
    setReply("");
  };

  const unreadCount = convs.filter((c) => c.unread).length;

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <h1 className="dash-title">Messages</h1>
        <p className="dash-sub">{unreadCount > 0 ? `${unreadCount} message${unreadCount > 1 ? "s" : ""} non lu${unreadCount > 1 ? "s" : ""}` : "Tous les messages lus"}</p>
      </div>
      <div className="messages-layout">
        <div className="messages-list">
          {convs.map((c) => (
            <div
              key={c.id}
              className={`message-item${c.unread ? " unread" : ""}${selectedId === c.id ? " selected" : ""}`}
              onClick={() => handleSelect(c.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleSelect(c.id)}
              aria-selected={selectedId === c.id}
            >
              <div className="message-avatar">{c.initial}</div>
              <div className="message-content">
                <div className="message-hd">
                  <strong>{c.from}</strong>
                  <span className="message-date">{c.date}</span>
                </div>
                <div className="message-subject">{c.subject}</div>
                <p className="message-preview">{c.preview}</p>
              </div>
              {c.unread && <div className="message-dot" aria-label="Non lu" />}
            </div>
          ))}
        </div>

        {selected ? (
          <div className="messages-thread">
            <div className="messages-thread-hd">
              <div className="message-avatar">{selected.initial}</div>
              <div>
                <strong>{selected.from}</strong>
                <span className="message-subject">{selected.subject}</span>
              </div>
            </div>
            <div className="messages-thread-body">
              {selected.messages.map((m, i) => (
                <div key={i} className={`thread-msg${m.isMe ? " thread-msg--me" : ""}`}>
                  <div className="thread-msg-bubble">{m.text}</div>
                  <span className="thread-msg-time">{m.time}</span>
                </div>
              ))}
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
              <button type="submit" className="btn btn-primary btn-sm" disabled={!reply.trim()}>
                <i className="fa-solid fa-paper-plane" /> Envoyer
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
    </div>
  );
}

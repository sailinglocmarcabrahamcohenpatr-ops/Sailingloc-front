"use client";

import { useState } from "react";

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
    from: "Sophie M.",
    initial: "SM",
    subject: "Sun Odyssey 440 · Juill. 10–17",
    preview: "Bonjour ! Est-il possible d'embarquer à 16h le 10 juillet ?",
    date: "Il y a 2h",
    unread: true,
    messages: [
      { author: "Sophie M.", text: "Bonjour Marc ! Nous sommes très enthousiastes pour la location. Est-il possible d'embarquer à 16h le 10 juillet au lieu de 17h ?", time: "09h45", isMe: false },
      { author: "Sophie M.", text: "Nous arrivons en TGV à 14h30 et aurions le temps de nous installer avant le soir.", time: "09h46", isMe: false },
    ],
  },
  {
    id: "c2",
    from: "Julien B.",
    initial: "JB",
    subject: "Leopard 45 · Juill. 20–27",
    preview: "Merci pour la confirmation ! Avez-vous une checklist d'embarquement ?",
    date: "Hier",
    unread: true,
    messages: [
      { author: "Julien B.", text: "Bonjour, merci pour votre confirmation rapide ! Avez-vous une checklist d'embarquement à nous transmettre ?", time: "14h20", isMe: false },
      { author: "Moi", text: "Bonjour Julien ! Oui, je vous enverrai la checklist complète 48h avant l'embarquement.", time: "16h00", isMe: true },
      { author: "Julien B.", text: "Parfait, merci beaucoup ! On a hâte.", time: "16h15", isMe: false },
    ],
  },
  {
    id: "c3",
    from: "Pierre L.",
    initial: "PL",
    subject: "Leopard 45 · Août 15–22",
    preview: "Nous envisageons un voyage de lune de miel, est-ce possible ?",
    date: "Il y a 3j",
    unread: true,
    messages: [
      { author: "Pierre L.", text: "Bonjour, nous envisageons ce bateau pour notre voyage de lune de miel. Serait-il possible d'avoir une petite décoration à bord à l'arrivée ?", time: "11h00", isMe: false },
    ],
  },
  {
    id: "c4",
    from: "Marie T.",
    initial: "MT",
    subject: "Sun Odyssey 440 · Juin 1–8",
    preview: "Merci pour cette belle semaine ! Nous reviendrons l'année prochaine.",
    date: "Il y a 2 sem.",
    unread: false,
    messages: [
      { author: "Marie T.", text: "Bonjour Marc, nous venons de rentrer. Quelle semaine magnifique ! Le bateau était impeccable. Merci infiniment.", time: "18h30", isMe: false },
      { author: "Moi", text: "Merci Marie, c'était un plaisir ! J'espère vous revoir l'an prochain.", time: "19h00", isMe: true },
    ],
  },
  {
    id: "c5",
    from: "Antoine C.",
    initial: "AC",
    subject: "Sun Odyssey 440 · Renseignements",
    preview: "Bonjour, est-il possible d'avoir le bateau sans permis avec un skipper ?",
    date: "Il y a 1 mois",
    unread: false,
    messages: [
      { author: "Antoine C.", text: "Bonjour, est-il possible de louer votre voilier avec un skipper inclus pour une famille sans permis ?", time: "10h00", isMe: false },
      { author: "Moi", text: "Bonjour Antoine, oui c'est possible ! Je travaille avec un skipper certifié. Comptez 300€/jour en supplément.", time: "11h30", isMe: true },
    ],
  },
];

export default function OwnerMessagesPage() {
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
        <div>
          <h1 className="dash-title">Messages</h1>
          <p className="dash-sub">{unreadCount > 0 ? `${unreadCount} message${unreadCount > 1 ? "s" : ""} non lu${unreadCount > 1 ? "s" : ""}` : "Tous les messages lus"}</p>
        </div>
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

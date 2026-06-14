import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

const CONVERSATIONS = [
  { id: "c1", from: "Sophie M.", initial: "SM", subject: "Sun Odyssey 440 · Juill. 10–17", preview: "Bonjour ! Est-il possible d'embarquer à 16h le 10 juillet ?", date: "Il y a 2h", unread: true },
  { id: "c2", from: "Julien B.", initial: "JB", subject: "Leopard 45 · Juill. 20–27", preview: "Merci pour la confirmation ! Avez-vous une checklist d'embarquement ?", date: "Hier", unread: true },
  { id: "c3", from: "Pierre L.", initial: "PL", subject: "Leopard 45 · Août 15–22", preview: "Nous envisageons un voyage de lune de miel, est-ce possible ?", date: "Il y a 3j", unread: true },
  { id: "c4", from: "Marie T.", initial: "MT", subject: "Sun Odyssey 440 · Juin 1–8", preview: "Merci pour cette belle semaine ! Nous reviendrons l'année prochaine.", date: "Il y a 2 sem.", unread: false },
  { id: "c5", from: "Antoine C.", initial: "AC", subject: "Sun Odyssey 440 · Renseignements", preview: "Bonjour, est-il possible d'avoir le bateau sans permis avec un skipper ?", date: "Il y a 1 mois", unread: false },
];

export default function OwnerMessagesPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Messages</h1>
          <p className="dash-sub">3 messages non lus</p>
        </div>
      </div>

      <div className="messages-layout">
        <div className="messages-list">
          {CONVERSATIONS.map((c) => (
            <div key={c.id} className={`message-item${c.unread ? " unread" : ""}`}>
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

        <div className="messages-empty">
          <i className="fa-solid fa-envelope-open-text" />
          <p>Sélectionnez une conversation</p>
        </div>
      </div>
    </div>
  );
}

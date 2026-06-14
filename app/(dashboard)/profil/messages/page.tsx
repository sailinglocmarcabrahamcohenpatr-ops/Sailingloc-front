import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mes messages" };

const CONVERSATIONS = [
  { id: "c1", from: "Marc D.", initial: "MD", subject: "Sun Odyssey 440 · Juill. 10–17", preview: "Bonjour Marie, votre demande de réservation a bien été confirmée. Embarquement à 17h.", date: "Aujourd'hui", unread: true },
  { id: "c2", from: "Support SailingLoc", initial: "SL", subject: "Confirmation de réservation #R-2847", preview: "Votre réservation est confirmée. Retrouvez tous les détails dans votre espace.", date: "Hier", unread: false },
  { id: "c3", from: "Pierre T.", initial: "PT", subject: "Bavaria 46 · Juin 1–8", preview: "Merci pour votre avis 5 étoiles ! C'était un plaisir de naviguer ensemble.", date: "Il y a 2 sem.", unread: false },
];

export default function UserMessagesPage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <h1 className="dash-title">Messages</h1>
        <p className="dash-sub">1 message non lu</p>
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

"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/shared/lib";

interface MockMsg {
  id: number;
  contenu: string;
  isMe: boolean;
  created_at: string;
  lu: boolean;
}

interface MockConv {
  key: string;
  otherName: string;
  otherInitials: string;
  otherRole: string;
  boatName: string;
  online: boolean;
  messages: MockMsg[];
}

const MOCK_CONVS: MockConv[] = [
  {
    key: "conv-1",
    otherName: "Claire Dupont",
    otherInitials: "CD",
    otherRole: "Locataire",
    boatName: "Bénéteau Océanis 40",
    online: true,
    messages: [
      { id: 1, contenu: "Bonjour ! Votre Océanis 40 est-il disponible du 15 au 22 juillet ?", isMe: false, created_at: "2026-06-25T09:10:00Z", lu: true },
      { id: 2, contenu: "Bonjour Claire ! Oui, le bateau est bien disponible cette semaine 😊", isMe: true, created_at: "2026-06-25T09:32:00Z", lu: true },
      { id: 3, contenu: "Super, je confirme ma réservation alors !", isMe: false, created_at: "2026-06-25T09:45:00Z", lu: true },
      { id: 4, contenu: "Parfait, j'ai bien reçu votre demande. Le bateau sera prêt à 9h au port. N'hésitez pas si vous avez des questions avant le départ !", isMe: true, created_at: "2026-06-28T08:15:00Z", lu: true },
      { id: 5, contenu: "Merci beaucoup ! On a hâte 😄", isMe: false, created_at: "2026-06-28T08:40:00Z", lu: false },
    ],
  },
  {
    key: "conv-2",
    otherName: "Thomas Bernard",
    otherInitials: "TB",
    otherRole: "Locataire",
    boatName: "Jeanneau Sun Odyssey 35",
    online: false,
    messages: [
      { id: 6, contenu: "Bonjour, le Sun Odyssey 35 est-il disponible début août ?", isMe: false, created_at: "2026-06-20T14:00:00Z", lu: true },
      { id: 7, contenu: "Bonjour Thomas ! Malheureusement il est réservé jusqu'au 12 août.", isMe: true, created_at: "2026-06-20T15:30:00Z", lu: true },
      { id: 8, contenu: "D'accord, merci pour l'info !", isMe: false, created_at: "2026-06-20T15:45:00Z", lu: true },
      { id: 9, contenu: "N'hésitez pas, j'ai aussi un Dufour 360 disponible si ça vous intéresse 🚤", isMe: true, created_at: "2026-06-20T16:00:00Z", lu: true },
    ],
  },
  {
    key: "conv-3",
    otherName: "Léa Martin",
    otherInitials: "LM",
    otherRole: "Locataire",
    boatName: "Catamaran Leopard 42",
    online: false,
    messages: [
      { id: 10, contenu: "Bonjour, est-il possible de visiter le catamaran avant de réserver ?", isMe: false, created_at: "2026-06-15T10:00:00Z", lu: true },
      { id: 11, contenu: "Bien sûr ! Je suis disponible ce weekend si vous voulez passer au port.", isMe: true, created_at: "2026-06-15T10:45:00Z", lu: true },
    ],
  },
];

function fmtDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function fmtFull(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function OwnerMessagesPage() {
  const { user } = useAuth();
  const [convs, setConvs] = useState<MockConv[]>(MOCK_CONVS);
  const [selectedKey, setSelectedKey] = useState<string | null>("conv-1");
  const [reply, setReply] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = convs.find((c) => c.key === selectedKey) ?? null;
  const unreadTotal = convs.reduce((n, c) => n + c.messages.filter((m) => !m.lu && !m.isMe).length, 0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedKey, convs]);

  const handleSelect = (key: string) => {
    setSelectedKey(key);
    setConvs((prev) =>
      prev.map((c) =>
        c.key === key
          ? { ...c, messages: c.messages.map((m) => ({ ...m, lu: true })) }
          : c
      )
    );
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedKey) return;
    const newMsg: MockMsg = {
      id: Date.now(),
      contenu: reply.trim(),
      isMe: true,
      created_at: new Date().toISOString(),
      lu: true,
    };
    setConvs((prev) =>
      prev.map((c) =>
        c.key === selectedKey ? { ...c, messages: [...c.messages, newMsg] } : c
      )
    );
    setReply("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) handleSend(e as unknown as React.FormEvent);
  };

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Messages</h1>
          <p className="dash-sub">
            {unreadTotal > 0
              ? `${unreadTotal} message${unreadTotal > 1 ? "s" : ""} non lu${unreadTotal > 1 ? "s" : ""}`
              : "Tous les messages lus"}
          </p>
        </div>
      </div>

      <div className="messages-layout">
        {/* ── Liste des conversations ── */}
        <div className="messages-list">
          <div style={{ padding: "12px 16px 8px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ position: "relative" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: ".8rem" }} />
              <input
                type="text"
                placeholder="Rechercher…"
                style={{ width: "100%", padding: "8px 10px 8px 30px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-lg)", fontSize: ".8125rem", outline: "none", background: "var(--bg)", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {convs.map((c) => {
            const last = c.messages[c.messages.length - 1];
            const unread = c.messages.filter((m) => !m.lu && !m.isMe).length;
            return (
              <div
                key={c.key}
                className={`message-item${unread > 0 ? " unread" : ""}${selectedKey === c.key ? " selected" : ""}`}
                onClick={() => handleSelect(c.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(c.key)}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div className="message-avatar">{c.otherInitials}</div>
                  {c.online && (
                    <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid var(--white)" }} />
                  )}
                </div>
                <div className="message-content">
                  <div className="message-hd">
                    <strong>{c.otherName}</strong>
                    <span className="message-date">{fmtDate(last?.created_at ?? "")}</span>
                  </div>
                  <p className="message-subject">{c.boatName}</p>
                  <p className="message-preview">
                    {last?.isMe ? `Vous : ${last.contenu}` : last?.contenu ?? ""}
                  </p>
                </div>
                {unread > 0 && (
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--primary)", color: "#fff", fontSize: ".7rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {unread}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Fil de conversation ── */}
        {selected ? (
          <div className="messages-thread">
            <div className="messages-thread-hd">
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div className="message-avatar">{selected.otherInitials}</div>
                {selected.online && (
                  <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid var(--bg)" }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <strong>{selected.otherName}</strong>
                <p className="message-subject" style={{ margin: 0 }}>
                  {selected.online ? "En ligne" : selected.otherRole} · {selected.boatName}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" title="Appel">
                  <i className="fa-solid fa-phone" />
                </button>
                <button className="btn btn-ghost btn-sm" title="Infos">
                  <i className="fa-solid fa-circle-info" />
                </button>
              </div>
            </div>

            <div className="messages-thread-body">
              {selected.messages.map((m, i) => {
                const prevMsg = selected.messages[i - 1];
                const showDate =
                  i === 0 ||
                  new Date(m.created_at).toDateString() !== new Date(prevMsg?.created_at ?? "").toDateString();

                return (
                  <div key={m.id}>
                    {showDate && (
                      <div style={{ textAlign: "center", margin: "8px 0" }}>
                        <span style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 20, padding: "3px 12px", fontSize: ".75rem", color: "var(--text-3)" }}>
                          {new Date(m.created_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                        </span>
                      </div>
                    )}
                    <div className={`thread-msg${m.isMe ? " thread-msg--me" : ""}`}>
                      {!m.isMe && (
                        <div style={{ fontSize: ".75rem", color: "var(--text-3)", marginBottom: 3, fontWeight: 600 }}>
                          {selected.otherName.split(" ")[0]}
                        </div>
                      )}
                      <div className="thread-msg-bubble">{m.contenu}</div>
                      <span className="thread-msg-time" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {fmtFull(m.created_at)}
                        {m.isMe && (
                          <i className={`fa-solid fa-check${m.lu ? "-double" : ""}`} style={{ fontSize: ".65rem", color: m.lu ? "var(--primary)" : "var(--text-3)" }} />
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form className="messages-reply-form" onSubmit={handleSend}>
              <button type="button" className="btn btn-ghost btn-sm" title="Joindre un fichier">
                <i className="fa-solid fa-paperclip" />
              </button>
              <input
                ref={inputRef}
                type="text"
                className="messages-reply-input"
                placeholder={`Message à ${selected.otherName.split(" ")[0]}…`}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!reply.trim()}
                style={{ borderRadius: "50%", width: 38, height: 38, padding: 0, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                title="Envoyer"
              >
                <i className="fa-solid fa-paper-plane" />
              </button>
            </form>
          </div>
        ) : (
          <div className="messages-empty" style={{ minHeight: 400 }}>
            <i className="fa-solid fa-comments" />
            <p>Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

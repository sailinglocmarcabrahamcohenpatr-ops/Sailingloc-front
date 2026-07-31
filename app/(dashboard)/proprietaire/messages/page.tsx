"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { messagesApi, utilisateursApi, useAuth, useMessages } from "@/shared/lib";
import type { MessageAPI, UtilisateurAPI } from "@/shared/lib";
import "./messages.css";

const PALETTE = ["#1866F2", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
const avatarColor = (id: number) => PALETTE[id % PALETTE.length];

function fmtRelative(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 86_400_000) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diff < 172_800_000) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
const fmtTime    = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const fmtFullDay = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

interface Partner { id: number; prenom: string; nom: string; email: string }
interface Conversation {
  partner: Partner;
  messages: MessageAPI[];
  unreadCount: number;
  lastMessage: MessageAPI;
}

function buildConversations(messages: MessageAPI[], myEmail: string): Conversation[] {
  // Key = sorted pair of both user IDs → groups all messages between the same
  // two people together regardless of who sent which message.
  const map = new Map<string, MessageAPI[]>();
  for (const msg of messages) {
    const a = msg.expediteur.id;
    const b = msg.destinataire.id;
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    const arr = map.get(key) ?? [];
    arr.push(msg);
    map.set(key, arr);
  }
  return Array.from(map.values())
    .map((msgs) => {
      const sorted  = msgs.slice().sort((a, b) => new Date(a.dateEnvoi).getTime() - new Date(b.dateEnvoi).getTime());
      const last    = sorted[sorted.length - 1];
      // Use email (always defined) to reliably identify which side is "me"
      const partner = last.expediteur.email === myEmail ? last.destinataire : last.expediteur;
      return { partner, messages: sorted, unreadCount: sorted.filter((m) => !m.lu && m.destinataire.email === myEmail).length, lastMessage: last };
    })
    .sort((a, b) => new Date(b.lastMessage.dateEnvoi).getTime() - new Date(a.lastMessage.dateEnvoi).getTime());
}

function Spinner({ size = 18 }: { size?: number }) {
  return <div style={{ width: size, height: size, flexShrink: 0, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "pub-spin .7s linear infinite" }} />;
}

function NewConvModal({ myId, onSelect, onClose }: { myId: number; onSelect: (p: Partner) => void; onClose: () => void }) {
  const [users, setUsers]     = useState<UtilisateurAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState("");
  const searchRef             = useRef<HTMLInputElement>(null);

  useEffect(() => {
    utilisateursApi.getAll().then(setUsers).catch(() => {}).finally(() => setLoading(false));
    setTimeout(() => searchRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return users.filter((u) => u.id !== myId && (`${u.prenom} ${u.nom}`.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)));
  }, [users, q, myId]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,18,34,.5)", backdropFilter: "blur(4px)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--card-bg)", borderRadius: "var(--radius-xl)", boxShadow: "0 24px 64px rgba(0,0,0,.25)", width: "100%", maxWidth: 480, overflow: "hidden", animation: "pub-slide-in .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <strong style={{ fontSize: ".9375rem" }}>Nouvelle discussion</strong>
            <p style={{ fontSize: ".8125rem", color: "var(--text-2)", marginTop: 2 }}>Choisissez un destinataire</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid var(--border)", background: "var(--card-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)", fontSize: ".8125rem" }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ position: "relative" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: ".8rem", pointerEvents: "none" }} />
            <input ref={searchRef} type="text" placeholder="Nom, email…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: "100%", padding: "9px 10px 9px 32px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-lg)", fontSize: ".875rem", outline: "none", background: "var(--bg)", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto", padding: "8px 0" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 32, color: "var(--text-3)", fontSize: ".875rem" }}><Spinner /> Chargement…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-3)", fontSize: ".875rem" }}>{q ? "Aucun résultat" : "Aucun utilisateur disponible"}</div>
          ) : filtered.map((u) => {
            const initials = `${u.prenom[0] ?? ""}${u.nom[0] ?? ""}`.toUpperCase();
            const role = u.roles?.includes("ROLE_ADMIN") ? "Admin" : u.roles?.includes("ROLE_PROPRIETAIRE") ? "Propriétaire" : "Locataire";
            return (
              <button key={u.id} onClick={() => onSelect({ id: u.id, prenom: u.prenom, nom: u.nom, email: u.email })}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: avatarColor(u.id), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: ".8125rem", flexShrink: 0 }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: ".9rem", color: "var(--text)" }}>{u.prenom} {u.nom}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{role} · {u.email}</div>
                </div>
                <i className="fa-solid fa-chevron-right" style={{ fontSize: ".7rem", color: "var(--text-3)", flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OwnerMessagesPage() {
  const { user } = useAuth();
  const myId    = user?.id ?? 0;
  const myEmail = user?.email ?? "";

  const { messages, setMessages, loading } = useMessages();
  const error = "";
  const [selectedId, setSelectedId]     = useState<number | null>(null);
  const [draftPartner, setDraftPartner] = useState<Partner | null>(null);
  const [reply, setReply]               = useState("");
  const [sending, setSending]           = useState(false);
  const [search, setSearch]             = useState("");
  const [newConvOpen, setNewConvOpen]   = useState(false);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const messagesRef = useRef(messages);
  const sendingRef  = useRef(false); // synchronous lock — prevents duplicate sends on rapid Enter/click
  messagesRef.current = messages;

  const conversations = useMemo(() => buildConversations(messages, myEmail), [messages, myEmail]);

  const filteredConvs = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => `${c.partner.prenom} ${c.partner.nom}`.toLowerCase().includes(q) || c.lastMessage.contenu.toLowerCase().includes(q));
  }, [conversations, search]);

  const selected      = conversations.find((c) => c.partner.id === selectedId) ?? null;
  const activePartner = selected?.partner ?? (selectedId && draftPartner?.id === selectedId ? draftPartner : null);
  const totalUnread   = conversations.reduce((n, c) => n + c.unreadCount, 0);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedId, messages.length]);

  function selectConversation(partnerId: number, partner?: Partner) {
    setSelectedId(partnerId);
    setDraftPartner(partner ?? null);
    setReply("");
    setTimeout(() => inputRef.current?.focus(), 60);
    const unread = messagesRef.current.filter((m) => !m.lu && m.destinataire.email === myEmail && m.expediteur.id === partnerId);
    if (!unread.length) return;
    Promise.allSettled(unread.map((m) => messagesApi.markAsRead(m.id))).then(() => {
      setMessages((prev) => prev.map((m) => (unread.some((u) => u.id === m.id) ? { ...m, lu: true } : m)));
    });
  }

  function handleNewConvSelect(partner: Partner) {
    setNewConvOpen(false);
    selectConversation(partner.id, partner);
  }

  function closeConversation() {
    setSelectedId(null);
    setDraftPartner(null);
  }

  async function sendMessage() {
    const text = reply.trim();
    if (!text || !selectedId || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setReply(""); // vidé tout de suite — restauré seulement si l'envoi échoue
    try {
      const sent = await messagesApi.send({ contenu: text, id_destinataire: selectedId });
      setMessages((prev) => [...prev, sent]);
      setDraftPartner(null);
    } catch {
      setReply(text);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    sendMessage();
  }

  function handleReplyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Empêche explicitement la soumission implicite du <form> pour Enter :
    // sans ce preventDefault ici, le navigateur peut aussi déclencher
    // onSubmit juste après, provoquant un envoi en double.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {newConvOpen && <NewConvModal myId={myId} onSelect={handleNewConvSelect} onClose={() => setNewConvOpen(false)} />}
      <div className="messages-full-wrap">
        <div className={`messages-layout${activePartner ? " conv-open" : ""}`}>

          {/* Left panel */}
          <div className="messages-list">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", gap: 8 }}>
              <div>
                <strong style={{ fontSize: ".9375rem" }}>Messages</strong>
                {!loading && (
                  <span style={{ marginLeft: 8, fontSize: ".75rem", fontWeight: 700, background: totalUnread > 0 ? "var(--primary)" : "var(--bg)", color: totalUnread > 0 ? "#fff" : "var(--text-3)", padding: "2px 7px", borderRadius: 20 }}>
                    {totalUnread > 0 ? `${totalUnread} non-lu${totalUnread > 1 ? "s" : ""}` : `${conversations.length} conv.`}
                  </span>
                )}
              </div>
              <button onClick={() => setNewConvOpen(true)} title="Nouvelle discussion"
                style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "var(--primary)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".875rem", flexShrink: 0 }}>
                <i className="fa-solid fa-pen-to-square" />
              </button>
            </div>
            <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ position: "relative" }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: ".75rem", pointerEvents: "none" }} />
                <input type="text" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px 7px 28px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-lg)", fontSize: ".8125rem", outline: "none", background: "var(--bg)", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
              </div>
            </div>
            {loading ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 32, color: "var(--text-3)", fontSize: ".875rem" }}><Spinner /> Chargement…</div>
            ) : error ? (
              <div style={{ flex: 1, padding: "20px 16px", color: "var(--red)", fontSize: ".875rem" }}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />{error}</div>
            ) : filteredConvs.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 20px", color: "var(--text-3)", gap: 10, textAlign: "center" }}>
                <i className="fa-solid fa-comments" style={{ fontSize: "2rem", opacity: .3 }} />
                <p style={{ fontSize: ".875rem" }}>{search ? "Aucun résultat" : "Aucune conversation"}</p>
                {!search && <button onClick={() => setNewConvOpen(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: "var(--radius-lg)", border: "1.5px solid var(--border)", background: "var(--card-bg)", color: "var(--text)", fontSize: ".8125rem", fontWeight: 600, cursor: "pointer" }}><i className="fa-solid fa-plus" /> Démarrer une discussion</button>}
              </div>
            ) : (
              <div className="messages-list-scroll">
                {filteredConvs.map((conv) => {
                  const isSelected = conv.partner.id === selectedId;
                  const last = conv.lastMessage;
                  const isLastMine = last.expediteur.id !== conv.partner.id;
                  const initials = `${conv.partner.prenom[0] ?? ""}${conv.partner.nom[0] ?? ""}`.toUpperCase();
                  return (
                    <div key={conv.partner.id} className={`message-item${conv.unreadCount > 0 ? " unread" : ""}${isSelected ? " selected" : ""}`}
                      onClick={() => selectConversation(conv.partner.id)} role="button" tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && selectConversation(conv.partner.id)}>
                      <div className="message-avatar" style={{ background: avatarColor(conv.partner.id) }}>{initials}</div>
                      <div className="message-content">
                        <div className="message-hd">
                          <strong>{conv.partner.prenom} {conv.partner.nom}</strong>
                          <span className="message-date">{fmtRelative(last.dateEnvoi)}</span>
                        </div>
                        <p className="message-preview">{isLastMine ? `Vous : ${last.contenu}` : last.contenu}</p>
                      </div>
                      {conv.unreadCount > 0 && <div className="message-unread-badge">{conv.unreadCount}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right panel */}
          {activePartner ? (
            <div className="messages-thread">
              <div className="messages-thread-hd">
                <button type="button" className="messages-thread-back" onClick={closeConversation} title="Retour aux conversations">
                  <i className="fa-solid fa-arrow-left" />
                </button>
                <div className="message-avatar" style={{ background: avatarColor(activePartner.id), width: 40, height: 40, fontSize: ".875rem", flexShrink: 0 }}>
                  {`${activePartner.prenom[0] ?? ""}${activePartner.nom[0] ?? ""}`.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>{activePartner.prenom} {activePartner.nom}</strong>
                  <p className="messages-thread-status" style={{ color: "var(--text-3)", fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{activePartner.email}</p>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                  {selected && <span style={{ fontSize: ".75rem", color: "var(--text-3)", background: "var(--bg)", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>{selected.messages.length} message{selected.messages.length !== 1 ? "s" : ""}</span>}
                  <a href={`mailto:${activePartner.email}`} className="messages-thread-icon-btn" title="Email externe"><i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: ".75rem" }} /></a>
                </div>
              </div>
              <div className="messages-thread-body">
                {!selected ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-3)", textAlign: "center", padding: "32px 24px" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: avatarColor(activePartner.id), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.125rem" }}>
                      {`${activePartner.prenom[0] ?? ""}${activePartner.nom[0] ?? ""}`.toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ display: "block", fontSize: ".9375rem", color: "var(--text)", marginBottom: 4 }}>{activePartner.prenom} {activePartner.nom}</strong>
                      <span style={{ fontSize: ".8125rem" }}>Démarrez la conversation en envoyant votre premier message.</span>
                    </div>
                  </div>
                ) : selected.messages.map((msg, i) => {
                  // A message is "mine" when the sender is NOT the partner
                  const isMe = msg.expediteur.id !== selected.partner.id;
                  const prev = selected.messages[i - 1];
                  const newDay = i === 0 || new Date(msg.dateEnvoi).toDateString() !== new Date(prev.dateEnvoi).toDateString();
                  return (
                    <div key={msg.id}>
                      {newDay && <div style={{ textAlign: "center", margin: "6px 0" }}><span style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 20, padding: "3px 12px", fontSize: ".72rem", color: "var(--text-3)" }}>{fmtFullDay(msg.dateEnvoi)}</span></div>}
                      <div className={`thread-msg${isMe ? " thread-msg--me" : ""}`}>
                        {!isMe && <div style={{ fontSize: ".75rem", color: "var(--text-3)", marginBottom: 3, fontWeight: 600 }}>{msg.expediteur.prenom}</div>}
                        <div className="thread-msg-bubble">{msg.contenu}</div>
                        <span className="thread-msg-time" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {fmtTime(msg.dateEnvoi)}
                          {isMe && <i className={`fa-solid fa-check${msg.lu ? "-double" : ""}`} style={{ fontSize: ".6rem", color: msg.lu ? "var(--primary)" : "var(--text-3)" }} />}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form className="messages-reply-form" onSubmit={handleSend}>
                <div className="messages-reply-input-wrap">
                  <input ref={inputRef} type="text" className="messages-reply-input" placeholder={`Message à ${activePartner.prenom}…`}
                    value={reply} onChange={(e) => setReply(e.target.value)}
                    onKeyDown={handleReplyKeyDown}
                    autoComplete="off" disabled={sending} />
                </div>
                <button type="submit" className="messages-reply-send" disabled={!reply.trim() || sending} title="Envoyer (Entrée)"
                  style={{ border: "none", background: reply.trim() ? "var(--primary)" : "var(--border)", color: reply.trim() ? "#fff" : "var(--text-3)", cursor: !reply.trim() || sending ? "not-allowed" : "pointer", transition: "background .18s, color .18s" }}>
                  {sending ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-paper-plane" />}
                </button>
              </form>
            </div>
          ) : (
            <div className="messages-empty" style={{ flexDirection: "column", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                <i className="fa-solid fa-comments" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Vos messages</p>
                <p style={{ fontSize: ".875rem", color: "var(--text-2)", maxWidth: 260 }}>Sélectionnez une conversation ou démarrez-en une nouvelle.</p>
              </div>
              <button onClick={() => setNewConvOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: "var(--radius-lg)", border: "none", background: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: ".875rem", cursor: "pointer" }}>
                <i className="fa-solid fa-pen-to-square" /> Nouvelle discussion
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}


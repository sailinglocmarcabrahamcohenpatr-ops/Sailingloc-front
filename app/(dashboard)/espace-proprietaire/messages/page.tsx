"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/shared/lib";

interface MockMsg {
  id: number;
  contenu: string;
  isMe: boolean;
  created_at: string;
  lu: boolean;
  imageUrl?: string;
  audioUrl?: string;
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
    otherName: "Jean-Pierre Moreau",
    otherInitials: "JM",
    otherRole: "Propriétaire",
    boatName: "Bénéteau Océanis 40",
    online: true,
    messages: [
      { id: 1, contenu: "Bonjour ! Votre Océanis 40 est-il disponible du 15 au 22 juillet ?", isMe: true, created_at: "2026-06-25T09:10:00Z", lu: true },
      { id: 2, contenu: "Bonjour Florian ! Oui, le bateau est bien disponible cette semaine 😊", isMe: false, created_at: "2026-06-25T09:32:00Z", lu: true },
      { id: 3, contenu: "Super, je confirme ma réservation alors !", isMe: true, created_at: "2026-06-25T09:45:00Z", lu: true },
      { id: 4, contenu: "Parfait, j'ai bien reçu votre demande. Le bateau sera prêt à 9h au port de La Rochelle. N'hésitez pas si vous avez des questions avant le départ !", isMe: false, created_at: "2026-06-28T08:15:00Z", lu: false },
    ],
  },
  {
    key: "conv-2",
    otherName: "Sophie Lambert",
    otherInitials: "SL",
    otherRole: "Propriétaire",
    boatName: "Jeanneau Sun Odyssey 35",
    online: false,
    messages: [
      { id: 5, contenu: "Bonjour Sophie, le Sun Odyssey 35 est-il disponible début août ?", isMe: true, created_at: "2026-06-20T14:00:00Z", lu: true },
      { id: 6, contenu: "Bonjour Florian ! Malheureusement il est réservé jusqu'au 12 août 😕", isMe: false, created_at: "2026-06-20T15:30:00Z", lu: true },
      { id: 7, contenu: "D'accord, merci pour l'info !", isMe: true, created_at: "2026-06-20T15:45:00Z", lu: true },
      { id: 8, contenu: "N'hésitez pas, j'ai aussi un Dufour 360 disponible si ça vous intéresse 🚤", isMe: false, created_at: "2026-06-20T16:00:00Z", lu: true },
    ],
  },
  {
    key: "conv-3",
    otherName: "Marc Dubois",
    otherInitials: "MD",
    otherRole: "Propriétaire",
    boatName: "Catamaran Leopard 42",
    online: false,
    messages: [
      { id: 9, contenu: "Bonjour Marc, est-il possible de visiter le catamaran avant de réserver ?", isMe: true, created_at: "2026-06-15T10:00:00Z", lu: true },
      { id: 10, contenu: "Bien sûr ! Je suis disponible ce weekend si vous voulez passer au port.", isMe: false, created_at: "2026-06-15T10:45:00Z", lu: true },
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

function fmtDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const EMOJIS = [
  "😀", "😂", "😊", "😍", "😉", "😘", "😅", "😭",
  "😎", "🤔", "😴", "😢", "😡", "🥳", "😱", "🤗",
  "👍", "👎", "👏", "🙏", "💪", "🤝", "✌️", "👌",
  "❤️", "🔥", "🎉", "⭐", "☀️", "🌊", "⛵", "🚤",
  "⚓", "🌴", "🍾", "☔", "✅", "❌", "⏰", "📍",
];

const AVATAR_COLORS = ["#F97316", "#8B5CF6", "#EC4899", "#0EA5E9", "#22C55E", "#EAB308"];
function avatarColor(seed: string) {
  const sum = seed.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function UserMessagesPage() {
  const { user } = useAuth();
  const [convs, setConvs] = useState<MockConv[]>(MOCK_CONVS);
  const [selectedKey, setSelectedKey] = useState<string | null>("conv-1");
  const [reply, setReply] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const handleEmojiSelect = (emoji: string) => {
    setReply((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedKey) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newMsg: MockMsg = {
        id: Date.now(),
        contenu: "",
        isMe: true,
        created_at: new Date().toISOString(),
        lu: true,
        imageUrl: reader.result as string,
      };
      setConvs((prev) =>
        prev.map((c) =>
          c.key === selectedKey ? { ...c, messages: [...c.messages, newMsg] } : c
        )
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startRecording = async () => {
    if (!selectedKey || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch (err) {
      console.error("getUserMedia error:", err);
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        alert(
          "Le microphone est bloqué pour ce site. Cliquez sur l'icône 🔒/ⓘ à gauche de l'adresse localhost:3000, passez \"Microphone\" sur Autoriser, puis rechargez la page."
        );
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        alert("Aucun microphone n'a été détecté sur cet appareil.");
      } else {
        alert("Impossible d'accéder au microphone. Vérifiez les autorisations de votre navigateur et de votre système.");
      }
    }
  };

  const stopRecording = (send: boolean) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    recorder.onstop = send
      ? () => {
          const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
          const url = URL.createObjectURL(blob);
          const newMsg: MockMsg = {
            id: Date.now(),
            contenu: "",
            isMe: true,
            created_at: new Date().toISOString(),
            lu: true,
            audioUrl: url,
          };
          setConvs((prev) =>
            prev.map((c) =>
              c.key === selectedKey ? { ...c, messages: [...c.messages, newMsg] } : c
            )
          );
        }
      : null;
    recorder.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsRecording(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  const firstName = user?.name?.split(" ")[0] ?? "Moi";

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div className="messages-page-hd">
          <div className="messages-page-hd-icon">
            <i className="fa-solid fa-comments" />
          </div>
          <div>
            <h1 className="dash-title" style={{ marginBottom: 0 }}>Messages</h1>
            <span className={`messages-page-hd-status ${unreadTotal > 0 ? "has-unread" : "all-read"}`}>
              <span className="dot" />
              {unreadTotal > 0
                ? `${unreadTotal} message${unreadTotal > 1 ? "s" : ""} non lu${unreadTotal > 1 ? "s" : ""}`
                : "Tous les messages lus"}
            </span>
          </div>
        </div>
      </div>

      <div className="messages-layout">
        {/* ── Liste des conversations ── */}
        <div className="messages-list">
          <div className="messages-list-search">
            <div style={{ position: "relative" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: ".8rem" }} />
              <input
                type="text"
                placeholder="Rechercher…"
                style={{ width: "100%", padding: "9px 10px 9px 34px", border: "1.5px solid var(--border)", borderRadius: 999, fontSize: ".8125rem", outline: "none", background: "var(--bg)", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div className="messages-list-section">Messages</div>

          <div className="messages-list-scroll">
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
                    <div className="message-avatar" style={{ background: avatarColor(c.otherName) }}>{c.otherInitials}</div>
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
                      {(() => {
                        const text = last?.imageUrl ? "📷 Photo" : last?.audioUrl ? "🎤 Message vocal" : last?.contenu ?? "";
                        return last?.isMe ? `Vous : ${text}` : text;
                      })()}
                    </p>
                  </div>
                  {unread > 0 && <div className="message-unread-badge">{unread}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Fil de conversation ── */}
        {selected ? (
          <div className="messages-thread">
            {/* Header */}
            <div className="messages-thread-hd">
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div className="message-avatar" style={{ background: avatarColor(selected.otherName) }}>{selected.otherInitials}</div>
                {selected.online && (
                  <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid var(--white)" }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <strong>{selected.otherName}</strong>
                <p className={`messages-thread-status${selected.online ? " online" : ""}`}>
                  {selected.online ? "En ligne" : selected.otherRole} · {selected.boatName}
                </p>
              </div>
            </div>

            {/* Messages */}
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
                      {m.imageUrl ? (
                        <a href={m.imageUrl} target="_blank" rel="noopener noreferrer" className="thread-msg-image-link">
                          <img src={m.imageUrl} alt="Photo envoyée" className="thread-msg-image" />
                        </a>
                      ) : m.audioUrl ? (
                        <div className="thread-msg-bubble thread-msg-audio">
                          <i className="fa-solid fa-microphone" />
                          <audio controls src={m.audioUrl} />
                        </div>
                      ) : (
                        <div className="thread-msg-bubble">{m.contenu}</div>
                      )}
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

            {/* Zone de saisie */}
            <form className="messages-reply-form" onSubmit={handleSend}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
              {isRecording ? (
                <>
                  <button type="button" className="messages-reply-icon-btn recording-cancel-btn" title="Annuler" onClick={() => stopRecording(false)}>
                    <i className="fa-solid fa-trash" />
                  </button>
                  <div className="messages-reply-input-wrap recording">
                    <span className="recording-dot" />
                    <span className="recording-label">Enregistrement… {fmtDuration(recordSeconds)}</span>
                  </div>
                  <button
                    type="button"
                    className="messages-reply-send"
                    title="Envoyer le message vocal"
                    onClick={() => stopRecording(true)}
                  >
                    <i className="fa-solid fa-check" />
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="messages-reply-icon-btn" title="Message vocal" onClick={startRecording}>
                    <i className="fa-solid fa-microphone" />
                  </button>
                  <div className="messages-reply-input-wrap">
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
                    <button type="button" className="messages-reply-icon-btn" title="Joindre une photo" onClick={handlePhotoClick}>
                      <i className="fa-solid fa-image" />
                    </button>
                    <div className="emoji-picker-wrap" ref={emojiPickerRef}>
                      <button
                        type="button"
                        className="messages-reply-icon-btn"
                        title="Emoji"
                        onClick={() => setShowEmojiPicker((v) => !v)}
                      >
                        <i className="fa-regular fa-face-smile" />
                      </button>
                      {showEmojiPicker && (
                        <div className="emoji-picker-popover">
                          {EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className="emoji-picker-item"
                              onClick={() => handleEmojiSelect(emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="messages-reply-send"
                    disabled={!reply.trim()}
                    title="Envoyer"
                  >
                    <i className="fa-solid fa-paper-plane" />
                  </button>
                </>
              )}
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

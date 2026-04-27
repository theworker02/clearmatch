import { Archive, Ban, BellOff, Flag, Send, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageBubble } from "../components/ui/MessageBubble";
import { Tooltip } from "../components/ui/Tooltip";
import { ChatMessage, ConversationBundle, useApp } from "../state";

export function ChatRoom() {
  const { matchId } = useParams();
  const { api, token, user } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<ConversationBundle | null>(null);
  const [body, setBody] = useState("");
  const [typing, setTyping] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [activeActions, setActiveActions] = useState("");
  const [archived, setArchived] = useState(false);
  const [muted, setMuted] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const pressTimer = useRef<number | null>(null);
  const wsUrl = useMemo(() => `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:4100/ws?token=${token}`, [token]);
  const otherProfile = conversation?.profiles?.[0];

  function timestamp(value: string) {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
  }

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    api<ConversationBundle>(`/matches/${matchId}/conversation`)
      .then((bundle) => {
        setConversation(bundle);
        setMessages(bundle.messages);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load this chat"))
      .finally(() => setLoading(false));
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message" && data.message.matchId === matchId) setMessages((current) => [...current, data.message]);
      if (data.type === "error") setError(data.error);
      if (data.type === "typing" && data.matchId === matchId && data.fromUserId !== user?.id) {
        setTyping("Typing...");
        window.setTimeout(() => setTyping(""), 1200);
      }
    };
    return () => socket.close();
  }, [matchId, wsUrl]);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function send() {
    if (!body.trim() || !matchId) return;
    setError("");
    setNotice("");
    socketRef.current?.send(JSON.stringify({ type: "message", matchId, body }));
    setNotice("Message sent");
    window.setTimeout(() => setNotice(""), 1400);
    setReplyTo(null);
    setBody("");
  }

  async function react(messageId: string, emoji: string) {
    try {
      await api(`/messages/${messageId}/reactions`, { method: "POST", body: JSON.stringify({ emoji }) });
      if (matchId) {
        const bundle = await api<ConversationBundle>(`/matches/${matchId}/conversation`);
        setConversation(bundle);
        setMessages(bundle.messages);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Reaction failed");
    }
  }

  function startPress(messageId: string) {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setActiveActions(messageId), 420);
  }

  function endPress() {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
  }

  const fadeStatus = conversation?.metrics.fadeStatus || (conversation?.metrics.status === "healthy" ? "active" : "slowing");
  const fadeLabel = fadeStatus === "active" ? "Active" : fadeStatus === "slowing" ? "Slowing" : "Fading";
  const fadeIcon = fadeStatus === "active" ? "●" : fadeStatus === "slowing" ? "●" : "●";

  return (
    <section className="chatPage">
      <header className="chatHeader">
        <div>
          <h1>Private chat</h1>
          <p>{typing ? <span className="typingDots" aria-label="Typing"><span /><span /><span /></span> : conversation?.metrics.nudge || "Read receipts follow your settings."}</p>
        </div>
        <div className="actionRow compact">
          <Tooltip text="Mute notifications for this match without blocking them."><button className="iconButton" onClick={() => { setMuted(!muted); setNotice(!muted ? "Conversation muted" : "Conversation unmuted"); }} aria-label="Mute"><BellOff /></button></Tooltip>
          <Tooltip text="Archive this conversation from your active attention."><button className="iconButton" onClick={() => { setArchived(true); setNotice("Conversation archived"); }} aria-label="Archive"><Archive /></button></Tooltip>
          <Tooltip text="Send this conversation to the moderation queue for review."><button className="iconButton" onClick={() => api("/reports", { method: "POST", body: JSON.stringify({ reportedUserId: "user-noah", reason: "Conversation concern", details: "Demo report from chat" }) }).then(() => setNotice("Report submitted"))} aria-label="Report"><Flag /></button></Tooltip>
          <Tooltip text="Block this person and close future contact."><button className="iconButton" onClick={() => api("/block", { method: "POST", body: JSON.stringify({ blockedUserId: "user-noah" }) }).then(() => setNotice("User blocked"))} aria-label="Block"><Ban /></button></Tooltip>
        </div>
      </header>
      {archived && <div className="healthBanner"><strong>Archived</strong><span>This conversation is hidden from your active attention until you return.</span></div>}
      {conversation && <Tooltip text={conversation.metrics.fadeExplanation || "Fade score uses response delay, frequency drop, balance, message depth, and recent activity."}><div className={`fadeIndicator ${fadeStatus}`}><strong><span>{fadeIcon}</span> Conversation Health: {fadeLabel}</strong><small>{conversation.metrics.fadePercentage ?? Math.round(conversation.metrics.ghostingRisk * 100)}% fade risk</small></div></Tooltip>}
      {conversation && <div className={`healthBanner ${conversation.metrics.status}`}><strong>Conversation {conversation.metrics.status.replace("_", " ")}</strong><span>{conversation.metrics.messageCount} messages · {Math.round(conversation.metrics.balanceScore * 100)}% balance</span></div>}
      {conversation?.quality && <div className="healthBanner"><ShieldCheck size={18} /><strong>{conversation.quality.compatibilityScore}% match</strong><span>{conversation.quality.communicationCompatibility}</span></div>}
      {conversation?.starters.length ? <div className="starterRail">{conversation.starters.map((starter) => <Tooltip key={starter.id} text="Use a contextual starter based on shared traits."><button onClick={() => setBody(starter.text)}>{starter.text}</button></Tooltip>)}</div> : null}
      {error && <p className="formError">{error}</p>}
      {notice && <p className="toast">{notice}</p>}
      {loading && <div className="emptyState"><h1>Loading chat</h1><p>Opening the matched conversation.</p></div>}
      <div className="messageStream" ref={streamRef}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            mine={message.fromUserId === user?.id}
            profile={otherProfile}
            timestamp={timestamp(message.createdAt)}
            actionsOpen={activeActions === message.id}
            onReply={() => setReplyTo(message)}
            onReact={(emoji) => react(message.id, emoji)}
            onPointerDown={() => startPress(message.id)}
            onPointerUp={endPress}
          />
        ))}
      </div>
      <div className="composer">
        {replyTo && <div className="replyPreview"><span>Replying to: {replyTo.body.slice(0, 48)}</span><button onClick={() => setReplyTo(null)}>Clear</button></div>}
        <input value={body} onChange={(event) => { setBody(event.target.value); if (matchId) socketRef.current?.send(JSON.stringify({ type: "typing", matchId })); }} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Write a message" />
        <Tooltip text="Send once your note has enough context to avoid low-effort openers."><button className="primaryButton" onClick={send}><Send size={18} />Send</button></Tooltip>
      </div>
    </section>
  );
}

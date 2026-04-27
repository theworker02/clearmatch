import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MatchListItem, useApp } from "../state";

export function Messages() {
  const { api } = useApp();
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  useEffect(() => { api<MatchListItem[]>("/matches").then(setMatches); }, []);

  function preview(item: MatchListItem) {
    if (item.lastMessage?.body) return item.lastMessage.body;
    return item.starters[0]?.text || "Start with a thoughtful opener.";
  }

  function when(value?: string) {
    if (!value) return "New match";
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
  }

  return (
    <section className="pageStack">
      <header className="pageHeader"><h1>Messages</h1><p>Chat opens only after a mutual match.</p></header>
      <div className="listPanel">
        {matches.length ? matches.map((item) => (
          <Link className="conversationItem" key={item.match.id} to={`/chat/${item.match.id}`}>
            {item.profiles[0]?.photos[0] ? <img src={item.profiles[0].photos[0]} alt="" /> : <MessageCircle size={22} />}
            <span className="conversationCopy">
              <strong>{item.profiles[0]?.displayName || "Match"}</strong>
              <small>{preview(item)}</small>
            </span>
            <span className="conversationMeta">
              <small>{when(item.lastMessage?.createdAt)}</small>
              {!!item.unreadCount && <i aria-label={`${item.unreadCount} unread messages`}>{item.unreadCount}</i>}
            </span>
          </Link>
        )) : <p>No mutual matches yet. Like someone who liked you back to unlock chat.</p>}
      </div>
    </section>
  );
}

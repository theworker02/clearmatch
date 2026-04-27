import { Flag, HeartHandshake, Send, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Compliment, ComplimentCategory, Profile } from "../../../shared/types";
import { DiscoverItem, useApp } from "../state";

type ComplimentItem = Compliment & { fromProfile?: Profile; toProfile?: Profile };

const suggestions: Record<ComplimentCategory, string> = {
  profile_answer: "I liked your answer about what makes a relationship healthy. It felt really genuine.",
  photo: "Your photo has such a warm, easygoing energy.",
  shared_interest: "I noticed we both care about quiet, thoughtful conversations. That stood out to me.",
  personality: "Your profile comes across grounded and emotionally present."
};

export function Compliments() {
  const { api, user } = useApp();
  const [items, setItems] = useState<ComplimentItem[]>([]);
  const [targets, setTargets] = useState<DiscoverItem[]>([]);
  const [toUserId, setToUserId] = useState("");
  const [category, setCategory] = useState<ComplimentCategory>("profile_answer");
  const [body, setBody] = useState(suggestions.profile_answer);
  const [notice, setNotice] = useState("");

  async function load() {
    const [compliments, discover] = await Promise.all([api<ComplimentItem[]>("/compliments"), api<DiscoverItem[]>("/discover")]);
    setItems(compliments);
    setTargets(discover);
    if (!toUserId && discover[0]) setToUserId(discover[0].profile.userId);
  }

  useEffect(() => { load(); }, []);

  async function send() {
    setNotice("");
    try {
      await api("/compliments", { method: "POST", body: JSON.stringify({ toUserId, category, body }) });
      setNotice("Compliment sent thoughtfully.");
      await load();
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Could not send compliment.");
    }
  }

  async function update(id: string, status: "accepted" | "ignored" | "reported") {
    await api(`/compliments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    setNotice(status === "accepted" ? "Compliment accepted." : status === "reported" ? "Compliment reported." : "Compliment ignored.");
    await load();
  }

  return (
    <section className="pageStack">
      <header className="pageHeader"><h1>Compliments</h1><p>Send one thoughtful note before matching, separate from likes.</p></header>
      {notice && <p className="toast">{notice}</p>}
      <article className="panel">
        <h2><Sparkles size={20} /> Thoughtful compliment</h2>
        <label>Recipient<select value={toUserId} onChange={(event) => setToUserId(event.target.value)}>{targets.map((item) => <option key={item.profile.userId} value={item.profile.userId}>{item.profile.displayName}</option>)}</select></label>
        <label>Category<select value={category} onChange={(event) => { const next = event.target.value as ComplimentCategory; setCategory(next); setBody(suggestions[next]); }}><option value="profile_answer">Profile answer compliment</option><option value="photo">Photo compliment</option><option value="shared_interest">Shared interest compliment</option><option value="personality">Personality compliment</option></select></label>
        <label>Message<textarea value={body} onChange={(event) => setBody(event.target.value)} /></label>
        <button className="primaryButton" onClick={send}><Send size={18} />Send compliment</button>
      </article>
      <div className="listPanel">
        {items.length ? items.map((item) => (
          <article className="listItem tall" key={item.id}>
            <span>{item.fromProfile?.displayName || "You"} to {item.toProfile?.displayName || "You"} · {item.category.replace("_", " ")}</span>
            <p>{item.body}</p>
            <small>{item.status}</small>
            {item.toUserId === user?.id ? <div className="actionRow compact"><button className="secondaryButton" onClick={() => update(item.id, "accepted")}><HeartHandshake size={16} />Accept</button><button className="secondaryButton" onClick={() => update(item.id, "ignored")}><X size={16} />Ignore</button><button className="secondaryButton" onClick={() => update(item.id, "reported")}><Flag size={16} />Report</button></div> : null}
          </article>
        )) : <div className="emptyState"><h2>No compliments yet</h2><p>Send a specific note about an answer, photo, shared interest, or personality signal.</p></div>}
      </div>
    </section>
  );
}

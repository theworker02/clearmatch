import { Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { LikeListItem, useApp } from "../state";

export function LikesReceived() {
  const { api } = useApp();
  const [likes, setLikes] = useState<LikeListItem[]>([]);
  const [notice, setNotice] = useState("");
  useEffect(() => { api<LikeListItem[]>("/likes").then(setLikes); }, []);
  return (
    <section className="pageStack">
      <header className="pageHeader"><h1>Likes received</h1><p>Private inbound interest. No public counters anywhere.</p></header>
      <div className="cardGrid">
        {likes.map((item) => (
          <article className="personTile" key={item.like.id}>
            <img src={item.profile.photos[0]} alt="" />
            <h2>{item.profile.displayName}</h2>
            <p>{item.like.type === "super_like" ? "Sent a standout like" : "Liked your profile"}</p>
            <button className="primaryButton" onClick={async () => { const result = await api<{ matched: boolean }>(`/profiles/${item.profile.userId}/like`, { method: "POST", body: "{}" }); setNotice(result.matched ? "It is a match. Chat is unlocked." : "Like sent."); }}><Heart size={18} />Like back</button>
          </article>
        ))}
      </div>
      {notice && <p className="toast"><Sparkles size={16} />{notice}</p>}
    </section>
  );
}

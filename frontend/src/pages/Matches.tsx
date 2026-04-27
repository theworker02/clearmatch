import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MatchListItem, useApp } from "../state";

export function Matches() {
  const { api } = useApp();
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<MatchListItem[]>("/matches")
      .then(setMatches)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load matches"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <section className="emptyState"><h1>Loading matches</h1><p>Finding your mutual connections.</p></section>;

  return (
    <section className="pageStack">
      <header className="pageHeader"><h1>Matches</h1><p>Mutual likes unlock private conversations.</p></header>
      <div className="listPanel">
        {error && <p className="formError">{error}</p>}
        {matches.length ? matches.map((item) => (
          <Link className="listItem" key={item.match.id} to={`/chat/${item.match.id}`}>
            <MessageCircle size={20} />
            <span>{item.profiles[0]?.displayName || "Match"}</span>
            <small>{item.metrics.status === "healthy" ? "Healthy" : item.metrics.status.replace("_", " ")}</small>
          </Link>
        )) : <p>No matches yet. Discover and like compatible profiles to start.</p>}
      </div>
    </section>
  );
}

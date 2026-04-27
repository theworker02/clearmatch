import { BarChart3, MessageCircle, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../state";
import type { MatchQualityDashboard as Dashboard } from "../../../shared/types";

export function MatchQualityDashboard() {
  const { api } = useApp();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  useEffect(() => { api<Dashboard>("/analytics/match-quality").then(setDashboard); }, []);
  if (!dashboard) return <div className="emptyState">Loading match quality...</div>;
  const stats = [
    ["Match success", `${dashboard.matchSuccessRate}%`, Target],
    ["Reply rate", `${dashboard.replyRate}%`, MessageCircle],
    ["Avg. chat length", `${dashboard.averageConversationLength}`, BarChart3]
  ] as const;
  return (
    <section className="pageStack">
      <header className="pageHeader"><h1>Match quality</h1><p>Simple feedback on how your matching and conversations are performing.</p></header>
      <div className="metricGrid">
        {stats.map(([label, value, Icon]) => <article className="metricCard" key={label}><Icon size={20} /><strong>{value}</strong><span>{label}</span></article>)}
      </div>
      <div className="gridTwo">
        <article className="panel"><TrendingUp size={22} /><h2>Adaptive traits</h2>{dashboard.adaptivePreferenceSummary.length ? dashboard.adaptivePreferenceSummary.map((item) => <p key={item}>{item}</p>) : <p>Your activity will shape recommendations as you browse.</p>}</article>
        <article className="panel"><h2>Top compatibility signals</h2><div className="chips">{dashboard.topCompatibilityTraits.map((trait) => <span key={trait}>{trait}</span>)}</div>{dashboard.lowEffortWarnings.map((warning) => <p className="formError" key={warning}>{warning}</p>)}</article>
      </div>
    </section>
  );
}

import { AlertTriangle, HeartHandshake, Sparkles, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { DiscoverItem } from "../state";
import { useApp } from "../state";
import { ScoreRing } from "../ui/ScoreRing";

export function MatchDetails() {
  const { profileId } = useParams();
  const { api } = useApp();
  const [item, setItem] = useState<DiscoverItem | null>(null);

  useEffect(() => { if (profileId) api<DiscoverItem>(`/profiles/${profileId}`).then(setItem); }, [profileId]);
  if (!item) return <div className="emptyState"><h1>Loading compatibility</h1><p>Building the match breakdown.</p></div>;

  const categoryLabels: Record<string, string> = {
    interests: "Interests",
    responseTime: "Response rhythm",
    goals: "Relationship goals",
    lifestyle: "Lifestyle",
    communication: "Communication",
    distance: "Distance",
    values: "Values",
    intent: "Intent",
    promptDepth: "Prompt depth",
    bioEffort: "Profile effort",
    weekendRhythm: "Weekend rhythm",
    relationshipReadiness: "Readiness",
    conversationPotential: "Conversation potential",
    valueTone: "Value tone",
    ageStage: "Life stage",
    personalityTest: "Personality test"
  };

  return (
    <section className="pageStack">
      <header className="detailHero">
        <img src={item.profile.photos[0]} alt="" />
        <div><h1>{item.profile.displayName}, {item.profile.age}</h1><p>{item.profile.bio}</p><div className="trustRow">{item.profile.personalityType && <span>{item.profile.personalityType}</span>}{item.trust.badges.map((badge) => <span key={badge}>{badge}</span>)}<span>{item.explanation.confidence}% confidence</span></div></div>
        <ScoreRing score={item.explanation.score} />
      </header>
      <div className="gridTwo">
        <article className="panel"><h2><HeartHandshake size={20} /> Compatibility breakdown</h2><div className="progressList">{Object.entries(item.explanation.categoryScores).map(([key, value]) => <div className="progressItem" key={key}><header><span>{categoryLabels[key] || key}</span><span>{Math.round(value * 100)}%</span></header><div className="progressTrack"><div className="progressFill" style={{ width: `${Math.round(value * 100)}%` }} /></div></div>)}</div></article>
        <article className="panel"><h2><Sparkles size={20} /> Why recommended</h2>{item.explanation.reasons.map((reason) => <p key={reason}>{reason}</p>)}</article>
        <article className="panel"><h2><Target size={20} /> Shared traits</h2><div className="chips">{item.explanation.sharedInterests.map((interest) => <span key={interest}>{interest}</span>)}</div></article>
        <article className="panel"><h2>Personality alignment</h2>{item.profile.personalityType && <p><strong>{item.profile.personalityType}:</strong> {item.profile.personalitySummary}</p>}<div className="chips">{item.profile.values.slice(0, 5).map((value) => <span key={value}>{value}</span>)}</div></article>
        <article className="panel warningPanel"><h2><AlertTriangle size={20} /> Differences</h2>{item.explanation.possibleDifferences.length ? item.explanation.possibleDifferences.map((diff) => <p key={diff}>{diff}</p>) : <p>No major differences surfaced.</p>}</article>
        <article className="panel"><h2>Adaptive signals</h2>{item.explanation.hiddenSignals.length ? item.explanation.hiddenSignals.map((signal) => <p key={signal}>{signal}</p>) : <p>More browsing activity will make adaptive signals clearer.</p>}{item.explanation.adaptiveReasons.map((reason) => <p key={reason}>{reason}</p>)}</article>
      </div>
    </section>
  );
}

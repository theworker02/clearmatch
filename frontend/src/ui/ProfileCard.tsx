import { Heart, RotateCcw, Sparkles, X } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Badge, type BadgeVariant } from "../components/ui/Badge";
import { Tooltip } from "../components/ui/Tooltip";
import type { DiscoverItem } from "../state";
import { ScoreRing } from "./ScoreRing";

export function ProfileCard({ item, onLike, onPass, onSuperLike, onUndo }: { item: DiscoverItem; onLike: () => void; onPass: () => void; onSuperLike: () => void; onUndo: () => void }) {
  const { profile, explanation } = item;
  const [drag, setDrag] = useState({ active: false, startX: 0, x: 0, leaving: "" as "" | "left" | "right" });
  const tilt = Math.max(-10, Math.min(10, drag.x / 16));
  const shift = drag.leaving === "right" ? 720 : drag.leaving === "left" ? -720 : drag.active ? drag.x : 0;
  const intentLabels: Record<string, { label: string; variant: BadgeVariant }> = {
    serious_relationship: { label: "Serious", variant: "serious" },
    casual_dating: { label: "Casual", variant: "casual" },
    just_exploring: { label: "Exploring", variant: "exploring" }
  };
  const badges = useMemo(() => {
    const next: { label: string; variant: BadgeVariant }[] = [];
    next.push(intentLabels[profile.datingIntent] || { label: "Intentional", variant: "serious" });
    if (profile.communicationStyle === "reflective" || profile.communicationStyle === "steady") next.push({ label: "Introvert energy", variant: "introvert" });
    if (profile.communicationStyle === "expressive" || profile.communicationStyle === "playful") next.push({ label: "Expressive", variant: "extrovert" });
    if (profile.lifestyle.some((value) => /active|fitness|outdoor|hiking|morning/i.test(value))) next.push({ label: "Active", variant: "active" });
    if (profile.lifestyle.some((value) => /home|quiet|cozy|routine/i.test(value))) next.push({ label: "Homebody", variant: "homebody" });
    if (profile.personalityType) next.push({ label: profile.personalityType, variant: "personality" });
    if (item.trust.badges.some((badge) => /verified/i.test(badge))) next.push({ label: "Verified", variant: "verified" });
    if (explanation.score >= 85) next.push({ label: "High match", variant: "highMatch" });
    return next.slice(0, 4);
  }, [profile, item.trust.badges, explanation.score]);
  const overlay = drag.x > 22 ? "like" : drag.x < -22 ? "pass" : "";
  const opacity = Math.max(0.88, 1 - Math.abs(drag.x) / 900);

  function complete(direction: "left" | "right", action: () => void) {
    setDrag((current) => ({ ...current, active: false, leaving: direction }));
    window.setTimeout(() => {
      action();
      setDrag({ active: false, startX: 0, x: 0, leaving: "" });
    }, 260);
  }

  function releaseDrag() {
    if (drag.x > 110) return complete("right", onLike);
    if (drag.x < -110) return complete("left", onPass);
    setDrag({ active: false, startX: 0, x: 0, leaving: "" });
  }

  return (
    <article
      className={`profileCard ${drag.active ? "dragging" : ""} ${drag.leaving ? `leaving-${drag.leaving}` : ""}`}
      style={{ "--tilt": `${tilt}deg`, "--shift": `${shift}px`, "--card-opacity": opacity } as CSSProperties}
      onPointerDown={(event) => setDrag({ active: true, startX: event.clientX, x: 0, leaving: "" })}
      onPointerMove={(event) => drag.active && setDrag((current) => ({ ...current, x: event.clientX - current.startX }))}
      onPointerUp={releaseDrag}
      onPointerCancel={() => setDrag({ active: false, startX: 0, x: 0, leaving: "" })}
    >
      <div className="profileImageStage">
        <img className="profilePhoto" src={profile.photos[0]} alt="" loading="lazy" />
        <div className="profileFade" />
        <div className={`swipeOverlay ${overlay}`} aria-hidden="true">{overlay === "like" ? "✓" : overlay === "pass" ? "✕" : ""}</div>
        <div className="profileHeroText">
          <div>
            <h2>{profile.displayName}, {profile.age}</h2>
            <p>{profile.city}</p>
          </div>
          <ScoreRing score={explanation.score} />
        </div>
      </div>
      <div className="profileBody floatingPanel">
        <div className="badgeRow">{badges.map((badge) => <Badge key={`${badge.variant}-${badge.label}`} variant={badge.variant} title={`${badge.label} is one signal used in compatibility scoring.`}>{badge.label}</Badge>)}</div>
        <div className="trustRow">
          <span>{explanation.confidence}% confidence</span>
          <span>{item.trust.score} trust</span>
          {item.trust.badges.slice(0, 2).map((badge) => <span key={badge}>{badge}</span>)}
        </div>
        <p className="bio">{profile.bio}</p>
        <div className="chips">
          {profile.interests.slice(0, 5).map((interest) => <span key={interest}>{interest}</span>)}
        </div>
        <p className="recommendation">{explanation.reasons[0] || "Recommended because your preferences have a healthy overlap."}</p>
        {explanation.adaptiveReasons[0] && <p className="adaptiveNote">{explanation.adaptiveReasons[0]}</p>}
        <div className="actionRow">
          <Tooltip text="Pass privately and improve future recommendations.">
            <button className="iconButton passButton" onClick={() => complete("left", onPass)} aria-label="Pass"><X /></button>
          </Tooltip>
          <Tooltip text="Restore your most recent pass if you changed your mind.">
            <button className="iconButton" onClick={onUndo} aria-label="Undo last pass"><RotateCcw /></button>
          </Tooltip>
          <Tooltip text="Like this profile and increase your chance of a mutual match.">
            <button className="primaryButton likeButton" onClick={() => complete("right", onLike)}><Heart size={18} />Like</button>
          </Tooltip>
          <Tooltip text="Send a stronger private signal without opening public attention.">
            <button className="iconButton accent" onClick={onSuperLike} aria-label="Send standout like"><Sparkles /></button>
          </Tooltip>
        </div>
        <Link className="textLink" to={`/match/${profile.id}`}>View compatibility details</Link>
      </div>
    </article>
  );
}

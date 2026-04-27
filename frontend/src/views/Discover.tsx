import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DiscoverItem, useApp } from "../state";
import { ProfileCard } from "../ui/ProfileCard";

export function Discover() {
  const { api, profile } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState<DiscoverItem[]>([]);
  const [notice, setNotice] = useState("");
  const [matchModal, setMatchModal] = useState<{ id: string; profile: DiscoverItem["profile"] } | null>(null);

  async function load() {
    setItems(await api<DiscoverItem[]>("/discover"));
  }

  useEffect(() => { load(); }, []);

  async function act(path: string, message: string) {
    const currentProfile = items[0]?.profile;
    try {
      const result = await api<{ matched?: boolean; match?: { id: string } }>(path, { method: "POST", body: "{}" });
      setNotice(result.matched ? "Mutual match created. Messaging is unlocked." : message);
      await load();
      if (result.match && currentProfile) setMatchModal({ id: result.match.id, profile: currentProfile });
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Action failed. Please try again.");
    }
  }

  if (!profile) return <section className="emptyState"><h1>Finish your profile</h1><p>Set up your age-gated profile before matching.</p><button className="primaryButton" onClick={() => navigate("/setup-profile")}>Open setup</button></section>;

  return (
    <section className="pageStack">
      <header className="pageHeader"><h1>Discover</h1><p>Compatibility-ranked suggestions with private actions only.</p></header>
      {notice && <p className="toast">{notice}</p>}
      {items[0] ? (
        <div className="discoverStack">
          {items[1] && <div className="nextProfilePreview" aria-hidden="true"><img src={items[1].profile.photos[0]} alt="" /><span>{items[1].profile.displayName}</span></div>}
          <ProfileCard
            item={items[0]}
            onPass={() => act(`/profiles/${items[0].profile.userId}/pass`, "Passed. You can undo your last pass.")}
            onUndo={async () => { await api("/passes/undo", { method: "POST", body: "{}" }); setNotice("Last pass restored."); await load(); }}
            onLike={() => act(`/profiles/${items[0].profile.userId}/like`, "Like sent privately.")}
            onSuperLike={() => api(`/profiles/${items[0].profile.userId}/like`, { method: "POST", body: JSON.stringify({ type: "super_like" }) }).then(async () => { setNotice("Standout like sent."); await load(); }).catch((caught) => setNotice(caught instanceof Error ? caught.message : "Standout like failed."))}
          />
        </div>
      ) : <div className="emptyState"><h2>No more profiles right now</h2><p>Try undoing a pass or updating your preferences.</p></div>}
      {matchModal && (
        <div className="modalBackdrop matchBackdrop" role="dialog" aria-modal="true">
          <div className="modalPanel matchModal">
            <p className="matchEyebrow">It's a Match</p>
            <div className="matchPhotos">
              {profile?.photos[0] && <img src={profile.photos[0]} alt="" />}
              <img src={matchModal.profile.photos[0]} alt="" />
            </div>
            <h2>You and {matchModal.profile.displayName} both showed interest.</h2>
            <p>Messaging is unlocked. Start with something specific from their profile to keep the energy warm.</p>
            <div className="actionRow">
              <button className="primaryButton" onClick={() => navigate(`/chat/${matchModal.id}`)}>Send message</button>
              <button className="secondaryButton" onClick={() => setMatchModal(null)}>Keep browsing</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

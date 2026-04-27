import { Ban, EyeOff, Flag, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useApp } from "../state";

export function PrivacySafety() {
  const { api } = useApp();
  const [notice, setNotice] = useState("");
  return (
    <section className="pageStack">
      <header className="pageHeader"><h1>Privacy & safety</h1><p>ClearMatch removes public drama mechanics and gives users direct controls.</p></header>
      <div className="gridTwo">
        <article className="panel"><ShieldAlert size={22} /><h2>Screenshot warning</h2><p>Show a safety reminder before sensitive screens.</p><button className="secondaryButton" onClick={() => setNotice("Screenshot warning screen enabled for this demo.")}>Preview warning</button></article>
        <article className="panel"><EyeOff size={22} /><h2>Hide profile</h2><p>Disappear from discovery while keeping matches intact.</p><button className="secondaryButton" onClick={() => api("/settings", { method: "PUT", body: JSON.stringify({ hidden: true }) }).then(() => setNotice("Profile hidden."))}>Hide profile</button></article>
        <article className="panel"><Ban size={22} /><h2>Block user</h2><p>Blocking closes access to messaging and discovery.</p><button className="secondaryButton" onClick={() => api("/block", { method: "POST", body: JSON.stringify({ blockedUserId: "user-eli" }) }).then(() => setNotice("User blocked."))}>Block demo user</button></article>
        <article className="panel"><Flag size={22} /><h2>Report concern</h2><p>Reports enter the moderation queue for review.</p><button className="secondaryButton" onClick={() => api("/reports", { method: "POST", body: JSON.stringify({ reportedUserId: "user-eli", reason: "Safety concern", details: "Demo safety report" }) }).then(() => setNotice("Report submitted."))}>Submit report</button></article>
      </div>
      {notice && <p className="toast">{notice}</p>}
    </section>
  );
}

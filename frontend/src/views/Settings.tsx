import { Bell, Copy, EyeOff, Mail, Palette, Save, Search, Send, Shield, UserRound } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { UserSettings } from "../../../shared/types";
import { Tooltip } from "../components/ui/Tooltip";
import { useApp } from "../state";

const sectionIcons = {
  account: UserRound,
  profile: UserRound,
  discovery: Search,
  privacy: EyeOff,
  notifications: Bell,
  safety: Shield,
  appearance: Palette
};

export function Settings() {
  const { api, refreshMe } = useApp();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [notice, setNotice] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const inviteLink = `${window.location.origin}/signup?invite=clearmatch`;

  useEffect(() => {
    api<UserSettings>("/settings").then(setSettings);
  }, []);

  async function save(next: UserSettings) {
    setSettings(next);
    setSaving(true);
    const saved = await api<UserSettings>("/settings", { method: "PATCH", body: JSON.stringify(next) });
    setSettings(saved);
    await refreshMe();
    setSaving(false);
    setNotice("Settings saved");
    window.setTimeout(() => setNotice(""), 1400);
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteLink);
    setNotice("Invite link copied.");
    window.setTimeout(() => setNotice(""), 1600);
  }

  async function shareInvite() {
    const payload = {
      title: "Join me on ClearMatch",
      text: "I thought you might like ClearMatch. It is a private dating app focused on compatibility and safety.",
      url: inviteLink
    };
    if (navigator.share) {
      await navigator.share(payload);
      setNotice("Invite ready to send.");
    } else {
      await copyInvite();
    }
  }

  function emailInvite() {
    const subject = encodeURIComponent("Join me on ClearMatch");
    const body = encodeURIComponent(`I thought you might like ClearMatch, a private dating app focused on compatibility and safety.\n\nSign up here: ${inviteLink}`);
    window.location.href = `mailto:${encodeURIComponent(inviteEmail)}?subject=${subject}&body=${body}`;
    setNotice("Opening your email app.");
  }

  if (!settings) return <section className="emptyState"><h1>Loading settings</h1><p>Gathering your account, privacy, and discovery controls.</p></section>;

  return (
    <section className="pageStack">
      <header className="pageHeader"><h1>Settings</h1><p>Full account, discovery, privacy, safety, notification, and appearance controls.</p></header>
      {notice && <p className="toast"><Save size={16} />{notice}</p>}
      <SettingsSection title="Account" icon="account">
        <label>Email<input value={settings.account.email} readOnly /></label>
        <SettingTip text="Verified email is required before dating features are fully trusted."><label className="toggle">Email verified<input type="checkbox" checked={settings.account.emailVerified} readOnly /></label></SettingTip>
        <SettingTip text="Deactivate hides your account while preserving private safety records."><label className="toggle">Deactivate account<input type="checkbox" checked={settings.account.deactivated} onChange={(event) => save({ ...settings, account: { ...settings.account, deactivated: event.target.checked } })} /></label></SettingTip>
      </SettingsSection>
      <SettingsSection title="Invite contacts" icon="notifications">
        <p>Invite someone privately with a signup link. ClearMatch does not import contacts or post anywhere.</p>
        <label>Invite link<input value={inviteLink} readOnly /></label>
        <label>Contact email<input type="email" placeholder="friend@example.com" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} /></label>
        <div className="actionRow inviteActions">
          <SettingTip text="Copy a private signup link you can send anywhere."><button className="secondaryButton" type="button" onClick={copyInvite}><Copy size={16} />Copy link</button></SettingTip>
          <SettingTip text="Use your device share sheet when available."><button className="secondaryButton" type="button" onClick={shareInvite}><Send size={16} />Share</button></SettingTip>
          <SettingTip text="Open an email draft with the signup link included."><button className="primaryButton" type="button" onClick={emailInvite}><Mail size={16} />Email invite</button></SettingTip>
        </div>
      </SettingsSection>
      <SettingsSection title="Profile" icon="profile">
        <SettingTip text="Get nudges when your profile could be more complete."><label className="toggle">Edit profile reminders<input type="checkbox" checked={settings.profile.editProfileReminder} onChange={(event) => save({ ...settings, profile: { ...settings.profile, editProfileReminder: event.target.checked } })} /></label></SettingTip>
        <SettingTip text="Control whether profile photos appear in discovery."><label className="toggle">Photos visible<input type="checkbox" checked={settings.profile.photosVisible} onChange={(event) => save({ ...settings, profile: { ...settings.profile, photosVisible: event.target.checked } })} /></label></SettingTip>
        <SettingTip text="Show interests so match explanations can feel more specific."><label className="toggle">Interests visible<input type="checkbox" checked={settings.profile.interestsVisible} onChange={(event) => save({ ...settings, profile: { ...settings.profile, interestsVisible: event.target.checked } })} /></label></SettingTip>
      </SettingsSection>
      <SettingsSection title="Discovery" icon="discovery">
        <label>Age range<input value={`${settings.discovery.ageRange[0]}-${settings.discovery.ageRange[1]}`} onChange={(event) => { const [min, max] = event.target.value.split("-").map(Number); if (min && max) save({ ...settings, discovery: { ...settings.discovery, ageRange: [min, max] } }); }} /></label>
        <label>Distance: {settings.discovery.distanceKm} km<input type="range" min={5} max={250} value={settings.discovery.distanceKm} onChange={(event) => save({ ...settings, discovery: { ...settings.discovery, distanceKm: Number(event.target.value) } })} /></label>
        <label>Intent<select value={settings.discovery.intent} onChange={(event) => save({ ...settings, discovery: { ...settings.discovery, intent: event.target.value as UserSettings["discovery"]["intent"] } })}><option value="open">Open</option><option value="serious_relationship">Serious relationship</option><option value="casual_dating">Casual dating</option><option value="just_exploring">Just exploring</option></select></label>
        <label>Show me<select value={settings.discovery.showMe} onChange={(event) => save({ ...settings, discovery: { ...settings.discovery, showMe: event.target.value as UserSettings["discovery"]["showMe"] } })}><option value="everyone">Everyone</option><option value="women">Women</option><option value="men">Men</option><option value="nonbinary">Nonbinary people</option></select></label>
        <label>Dealbreakers<input value={settings.discovery.dealbreakers.join(", ")} onChange={(event) => save({ ...settings, discovery: { ...settings.discovery, dealbreakers: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) } })} /></label>
      </SettingsSection>
      <SettingsSection title="Privacy" icon="privacy">
        {Object.entries(settings.privacy).map(([key, value]) => <SettingTip key={key} text={`Adjust ${key.replace(/([A-Z])/g, " $1").toLowerCase()} without adding public activity.`}><label className="toggle">{key.replace(/([A-Z])/g, " $1")}<input type="checkbox" checked={value} onChange={(event) => save({ ...settings, privacy: { ...settings.privacy, [key]: event.target.checked } })} /></label></SettingTip>)}
      </SettingsSection>
      <SettingsSection title="Notifications" icon="notifications">
        {Object.entries(settings.notifications).map(([key, value]) => <SettingTip key={key} text={`Choose whether ClearMatch alerts you about ${key.replace(/([A-Z])/g, " $1").toLowerCase()}.`}><label className="toggle">{key.replace(/([A-Z])/g, " $1")}<input type="checkbox" checked={value} onChange={(event) => save({ ...settings, notifications: { ...settings.notifications, [key]: event.target.checked } })} /></label></SettingTip>)}
      </SettingsSection>
      <SettingsSection title="Safety" icon="safety">
        <p>{settings.safety.moderationStatus}</p>
        <p>{settings.safety.blockedUsersCount} blocked users · {settings.safety.openReportsCount} open reports</p>
        <button className="secondaryButton" onClick={() => setNotice("Safety tip: meet in public, tell a friend, and trust your pace.")}>Emergency safety tips</button>
      </SettingsSection>
      <SettingsSection title="Appearance" icon="appearance">
        <label>Mode<select value={settings.appearance.mode} onChange={(event) => save({ ...settings, appearance: { ...settings.appearance, mode: event.target.value as UserSettings["appearance"]["mode"] } })}><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></select></label>
        <label>Accent<select value={settings.appearance.accentColor} onChange={(event) => save({ ...settings, appearance: { ...settings.appearance, accentColor: event.target.value as UserSettings["appearance"]["accentColor"] } })}><option value="pink">Pink</option><option value="blue">Blue</option><option value="violet">Violet</option></select></label>
      </SettingsSection>
      {saving && <p className="successText">Saving...</p>}
    </section>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon: keyof typeof sectionIcons; children: React.ReactNode }) {
  const Icon = sectionIcons[icon];
  return <article className="panel settingsSection"><h2><Icon size={20} />{title}</h2>{children}</article>;
}

function SettingTip({ text, children }: { text: string; children: React.ReactElement }) {
  return <Tooltip text={text} position="top">{children}</Tooltip>;
}

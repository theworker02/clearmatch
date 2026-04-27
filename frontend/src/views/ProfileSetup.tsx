import { Save, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { PromptQuestion } from "../../../shared/types";
import { useApp } from "../state";

const interests = ["coffee walks", "live jazz", "cooking", "hiking", "indie films", "design", "yoga", "volunteering"];
const lifestyles = ["early riser", "active", "dog friendly", "city weekends", "family oriented", "budget conscious"];
const values = ["kindness", "curiosity", "privacy", "emotional maturity", "family", "community", "growth", "humor"];

export function ProfileSetup() {
  const { profile, api, refreshMe, token } = useApp();
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState({
    displayName: profile?.displayName || "Maya",
    age: profile?.age || 31,
    city: profile?.city || "Brooklyn, NY",
    bio: profile?.bio || "Product designer, weekend baker, looking for something intentional and low-drama.",
    interests: profile?.interests || ["coffee walks", "live jazz", "cooking"],
    relationshipGoals: profile?.relationshipGoals || ["long_term", "life_partner"],
    datingIntent: profile?.datingIntent || "serious_relationship",
    lifestyle: profile?.lifestyle || ["early riser", "active", "dog friendly"],
    values: profile?.values || ["kindness", "privacy", "emotional maturity"],
    communicationStyle: profile?.communicationStyle || "steady",
    likelyResponseTime: profile?.likelyResponseTime || "hours",
    distancePreferenceKm: profile?.distancePreferenceKm || 40,
    dealbreakers: profile?.dealbreakers || ["casual_only"],
    prompts: profile?.prompts || [{ question: "A perfect slow Sunday", answer: "A long walk, a tiny bookstore, and cooking dinner for two." }],
    latitude: profile?.latitude || 40.6782,
    longitude: profile?.longitude || -73.9442
  });
  const [saved, setSaved] = useState("");
  const [photoStatus, setPhotoStatus] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [validatingPhotos, setValidatingPhotos] = useState(false);
  const [questions, setQuestions] = useState<PromptQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean | string[]>>({});

  useEffect(() => {
    api<PromptQuestion[]>("/questions").then(setQuestions);
  }, []);

  function toggle(key: "interests" | "lifestyle" | "values", value: string) {
    setForm((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (form.age < 18) {
      setSaved("You must be 18 or older to use ClearMatch.");
      return;
    }
    await api("/profile", { method: "PUT", body: JSON.stringify(form) });
    await api("/profile/answers", { method: "POST", body: JSON.stringify({ answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })) }) });
    await refreshMe();
    setSaved("Profile saved.");
    navigate("/discover");
  }

  function selectPhotos(files: FileList | null) {
    const next = Array.from(files || []);
    setPhotoFiles(next);
    setPhotoStatus("");
    setPhotoError("");
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setPhotoPreviews(next.map((file) => URL.createObjectURL(file)));
  }

  async function validatePhotos() {
    if (!photoFiles.length) {
      photoInputRef.current?.click();
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const invalid = photoFiles.find((file) => !allowed.includes(file.type));
    const oversized = photoFiles.find((file) => file.size > 4 * 1024 * 1024);
    if (photoFiles.length > 6) {
      setPhotoError("Choose up to 6 photos.");
      return;
    }
    if (invalid) {
      setPhotoError(`${invalid.name} is not supported. Use JPEG, PNG, or WEBP.`);
      return;
    }
    if (oversized) {
      setPhotoError(`${oversized.name} is too large. Each photo must be under 4 MB.`);
      return;
    }

    setValidatingPhotos(true);
    setPhotoError("");
    setPhotoStatus("");
    const body = new FormData();
    photoFiles.forEach((file) => body.append("photos", file));
    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Photo validation failed.");
      setPhotoStatus(data.message || `${photoFiles.length} photos passed validation.`);
      setSaved("Photo validation complete.");
    } catch (caught) {
      setPhotoError(caught instanceof Error ? caught.message : "Photo validation failed.");
    } finally {
      setValidatingPhotos(false);
    }
  }

  return (
    <section className="pageStack">
      <header className="pageHeader"><h1>Profile setup</h1><p>Build the private matching profile people see after compatibility screening.</p></header>
      <form className="setupGrid" onSubmit={submit}>
        <div className="panel">
          <h2>Basics</h2>
          <label>Display name<input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></label>
          <label>Age<input type="number" min={18} value={form.age} onChange={(event) => setForm({ ...form, age: Number(event.target.value) })} /></label>
          <label>City<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label>
          <label>Bio<textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
          <label>Profile photos
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => selectPhotos(event.target.files)} />
          </label>
          {photoPreviews.length ? <div className="photoPreviewGrid">{photoPreviews.map((preview, index) => <img key={preview} src={preview} alt={`Selected profile photo ${index + 1}`} />)}</div> : null}
          <button className="secondaryButton" type="button" onClick={validatePhotos} disabled={validatingPhotos}><Upload size={18} />{validatingPhotos ? "Validating..." : photoFiles.length ? `Validate ${photoFiles.length} photo${photoFiles.length === 1 ? "" : "s"}` : "Choose photos"}</button>
          {photoStatus && <p className="successText">{photoStatus}</p>}
          {photoError && <p className="formError">{photoError}</p>}
        </div>
        <div className="panel">
          <h2>Compatibility</h2>
          <fieldset><legend>Interests</legend><div className="chips selectable">{interests.map((item) => <button type="button" className={form.interests.includes(item) ? "selected" : ""} onClick={() => toggle("interests", item)} key={item}>{item}</button>)}</div></fieldset>
          <fieldset><legend>Lifestyle</legend><div className="chips selectable">{lifestyles.map((item) => <button type="button" className={form.lifestyle.includes(item) ? "selected" : ""} onClick={() => toggle("lifestyle", item)} key={item}>{item}</button>)}</div></fieldset>
          <fieldset><legend>Values</legend><div className="chips selectable">{values.map((item) => <button type="button" className={form.values.includes(item) ? "selected" : ""} onClick={() => toggle("values", item)} key={item}>{item}</button>)}</div></fieldset>
        </div>
        <div className="panel">
          <h2>Preferences</h2>
          <label>Communication style<select value={form.communicationStyle} onChange={(event) => setForm({ ...form, communicationStyle: event.target.value as typeof form.communicationStyle })}><option value="steady">Steady</option><option value="direct">Direct</option><option value="expressive">Expressive</option><option value="playful">Playful</option><option value="reflective">Reflective</option></select></label>
          <label>Likely response time<select value={form.likelyResponseTime} onChange={(event) => setForm({ ...form, likelyResponseTime: event.target.value as typeof form.likelyResponseTime })}><option value="minutes">Minutes</option><option value="hours">Hours</option><option value="daily">Daily</option><option value="few_days">Few days</option></select></label>
          <label>Dating intent<select value={form.datingIntent} onChange={(event) => setForm({ ...form, datingIntent: event.target.value as typeof form.datingIntent })}><option value="serious_relationship">Serious relationship</option><option value="casual_dating">Casual dating</option><option value="just_exploring">Just exploring</option></select></label>
          <label>Distance preference: {form.distancePreferenceKm} km<input type="range" min={5} max={250} value={form.distancePreferenceKm} onChange={(event) => setForm({ ...form, distancePreferenceKm: Number(event.target.value) })} /></label>
          <label>Conversation prompt<textarea value={form.prompts[0].answer} onChange={(event) => setForm({ ...form, prompts: [{ ...form.prompts[0], answer: event.target.value }] })} /></label>
          {saved && <p className="successText">{saved}</p>}
          <button className="primaryButton" type="submit"><Save size={18} />Save profile</button>
        </div>
        <div className="panel questionPanel">
          <h2>Deeper matching questions</h2>
          {questions.slice(0, 8).map((question) => (
            <label key={question.id}>{question.question}
              {question.type === "short_answer" && <textarea value={String(answers[question.id] || "")} onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })} />}
              {question.type === "multiple_choice" && <select value={String(answers[question.id] || "")} onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })}><option value="">Choose thoughtfully</option>{question.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select>}
              {question.type === "slider" && <><input type="range" min={1} max={10} value={Number(answers[question.id] || 5)} onChange={(event) => setAnswers({ ...answers, [question.id]: Number(event.target.value) })} /><span className="rangeLabels">{question.minLabel}<strong>{answers[question.id] || 5}</strong>{question.maxLabel}</span></>}
              {question.type === "yes_no" && <select value={String(answers[question.id] || "")} onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value === "true" })}><option value="">Choose</option><option value="true">Yes</option><option value="false">No</option></select>}
              {question.type === "ranked_preference" && <div className="chips selectable">{question.options?.map((option) => <button type="button" className={(answers[question.id] as string[] || []).includes(option) ? "selected" : ""} onClick={() => { const current = (answers[question.id] as string[] || []); setAnswers({ ...answers, [question.id]: current.includes(option) ? current.filter((item) => item !== option) : [...current, option] }); }} key={option}>{option}</button>)}</div>}
            </label>
          ))}
        </div>
      </form>
    </section>
  );
}

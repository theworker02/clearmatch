import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Landing() {
  return (
    <main className="landing">
      <nav className="topBar">
        <span className="wordmark"><img className="brandMark" src="/clearmatch-mark.svg" alt="" />ClearMatch</span>
        <Link className="secondaryButton" to="/login">Sign in</Link>
      </nav>
      <section className="hero">
        <div className="heroCopy">
          <h1>ClearMatch</h1>
          <p>Private dating for people who want compatibility, safety, and calm by default.</p>
          <div className="heroActions">
            <Link className="primaryButton" to="/signup">Start matching <ArrowRight size={18} /></Link>
            <Link className="secondaryButton" to="/discover">Open demo</Link>
          </div>
        </div>
        <div className="phonePreview">
          <div className="miniCard">
            <strong>92% compatible</strong>
            <span>Shared goals, similar response rhythm, and three aligned values.</span>
          </div>
          <div className="miniCard offset">
            <Sparkles size={20} />
            <span>No public feeds. No follower counts. No social-media dependency.</span>
          </div>
        </div>
      </section>
      <section className="featureBand">
        {[
          ["Weighted matching", "Interests, values, goals, communication, lifestyle, and distance scored together."],
          ["Private by design", "Messaging only after mutual matches, with blocking, reporting, and profile pause controls."],
          ["Explainable results", "Every suggestion includes shared interests, matched goals, and possible differences."]
        ].map(([title, copy]) => (
          <article key={title}>
            <ShieldCheck size={20} />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

import { useState } from "react";
import {
  RATING_LABELS, compare, groupScores, isComplete, ratedCount, traitLean, type GroupScore,
} from "./analysis";
import { ARTWORKS, imageUrl, type Artwork } from "./artworks";
import type { Participant } from "./store";

interface Props {
  me: Participant;
  people: Participant[];
  code: string;
  onRedo: () => void;
}

export function Results({ me, people, code, onRedo }: Props) {
  const others = people.filter((p) => p.id !== me.id);
  const loves = ARTWORKS.filter((art) => me.ratings[art.id] === 3);
  const traditions = groupScores(me.ratings, "tradition");

  return (
    <section className="results">
      <h1>{me.name}, you lean {traditions[0].label}</h1>
      <p className="lede">
        Least drawn to {traditions[traditions.length - 1].label}. You loved {loves.length} of {ARTWORKS.length}.
      </p>

      <div className="panels">
        <Bars title="By tradition" scores={traditions} />
        <Bars title="By subject" scores={groupScores(me.ratings, "subject")} />
      </div>
      <div className="panels">
        <Lean left="Lifelike" right="Abstract" value={traitLean(me.ratings, "abstraction")} />
        <Lean left="Muted" right="Vivid" value={traitLean(me.ratings, "vivid")} />
      </div>

      {loves.length > 0 && (
        <>
          <h2>Your loves</h2>
          <Thumbs works={loves} />
        </>
      )}

      <h2>Compare</h2>
      <Invite code={code} alone={others.length === 0} />
      {others.map((other) => (
        <Versus key={other.id} me={me} other={other} />
      ))}

      <p className="footer">
        <button className="link" onClick={() => confirm("Clear your ratings and start over?") && onRedo()}>
          Rate again
        </button>
        <span>Images: Art Institute of Chicago, public domain.</span>
      </p>
    </section>
  );
}

function Bars({ title, scores }: { title: string; scores: GroupScore[] }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      {scores.map((s) => (
        <div className="bar-row" key={s.label}>
          <span>{s.label}</span>
          <div className="bar"><div style={{ width: `${(s.mean / 3) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function Lean({ left, right, value }: { left: string; right: string; value: number }) {
  return (
    <div className="panel lean">
      <span>{left}</span>
      <div className="track" role="img" aria-label={`${left} to ${right}: ${value < -0.15 ? left : value > 0.15 ? right : "balanced"}`}>
        <div className="dot" style={{ left: `${50 + value * 50}%` }} />
      </div>
      <span>{right}</span>
    </div>
  );
}

function Thumbs({ works }: { works: Artwork[] }) {
  return (
    <div className="thumbs">
      {works.map((art) => (
        <figure key={art.id}>
          <img src={imageUrl(art)} alt="" loading="lazy" />
          <figcaption>
            <strong>{art.title}</strong>
            {art.artist}, {art.year}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function Invite({ code, alone }: { code: string; alone: boolean }) {
  const [copied, setCopied] = useState(false);
  const link = `${location.origin}${location.pathname}#/r/${code}`;
  return (
    <p className="invite">
      {alone ? "Nobody else is here yet. Send them" : "Invite someone else with"} code <strong>{code}</strong> or{" "}
      <button
        className="link"
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "link copied" : "copy the link"}
      </button>
      . This page updates as they rate.
    </p>
  );
}

function Versus({ me, other }: { me: Participant; other: Participant }) {
  const done = isComplete(other.ratings);
  if (!done) {
    return (
      <div className="versus pending">
        <h3>{other.name}</h3>
        <p>Still rating: {ratedCount(other.ratings)} of {ARTWORKS.length} done.</p>
      </div>
    );
  }
  const c = compare(me.ratings, other.ratings);
  return (
    <div className="versus">
      <div className="versus-head">
        <h3>You and {other.name}</h3>
        <span className="match">{c.match}% match</span>
      </div>

      <h4>Where you split</h4>
      {c.disagreements.length === 0 ? (
        <p className="hint">No real disagreements: you were never more than one step apart.</p>
      ) : (
        <ul className="splits">
          {c.disagreements.slice(0, 6).map(({ art, a, b }) => (
            <li key={art.id}>
              <img src={imageUrl(art)} alt="" loading="lazy" />
              <div>
                <strong>{art.title}</strong>
                <span className="by">{art.artist}, {art.year}</span>
                <span className="verdicts">
                  You: <b className={`c${a}`}>{RATING_LABELS[a]}</b> · {other.name}:{" "}
                  <b className={`c${b}`}>{RATING_LABELS[b]}</b>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h4>You both loved</h4>
      {c.bothLoved.length ? <Thumbs works={c.bothLoved} /> : <p className="hint">Nothing in common at the top.</p>}
    </div>
  );
}

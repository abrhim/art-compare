import { useEffect, useMemo } from "react";
import { RATING_LABELS, shuffledFor } from "./analysis";
import { imageUrl } from "./artworks";
import type { Participant, Ratings } from "./store";

export function Rate({ me, onChange }: { me: Participant; onChange: (r: Ratings) => void }) {
  const order = useMemo(() => shuffledFor(me.id), [me.id]);
  const index = order.findIndex((art) => me.ratings[art.id] === undefined);
  const art = order[index];

  const rate = (value: number) => onChange({ ...me.ratings, [art.id]: value });
  const back = () => {
    const { [order[index - 1].id]: _, ...rest } = me.ratings;
    onChange(rest);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 4) rate(n - 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  // Warm the next image so the swap feels instant.
  useEffect(() => {
    const next = order[index + 1];
    if (next) new Image().src = imageUrl(next);
  }, [index, order]);

  return (
    <section className="rate">
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={order.length} aria-valuenow={index}>
        <div style={{ width: `${(index / order.length) * 100}%` }} />
      </div>
      <p className="count">
        {index + 1} of {order.length}
        {index > 0 && <button className="link" onClick={back}>Undo last</button>}
      </p>
      <div className="frame">
        <img key={art.id} src={imageUrl(art)} alt="Painting to rate (label hidden until the end)" />
      </div>
      <div className="choices">
        {RATING_LABELS.map((label, value) => (
          <button key={label} className={`choice c${value}`} onClick={() => rate(value)}>
            {label}
            <kbd>{value + 1}</kbd>
          </button>
        ))}
      </div>
    </section>
  );
}

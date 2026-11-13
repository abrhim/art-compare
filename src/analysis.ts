import { ARTWORKS, type Artwork } from "./artworks";
import type { Ratings } from "./store";

export const RATING_LABELS = ["Dislike", "Meh", "Like", "Love"];

export const isComplete = (r: Ratings) => ARTWORKS.every((art) => r[art.id] !== undefined);
export const ratedCount = (r: Ratings) => ARTWORKS.filter((art) => r[art.id] !== undefined).length;

export interface GroupScore {
  label: string;
  /** Mean rating 0..3 */
  mean: number;
  count: number;
}

export function groupScores(r: Ratings, key: "tradition" | "subject"): GroupScore[] {
  const groups = new Map<string, number[]>();
  for (const art of ARTWORKS) {
    const v = r[art.id];
    if (v === undefined) continue;
    groups.set(art[key], [...(groups.get(art[key]) ?? []), v]);
  }
  return [...groups]
    .map(([label, vals]) => ({ label, mean: vals.reduce((s, v) => s + v, 0) / vals.length, count: vals.length }))
    .sort((x, y) => y.mean - x.mean);
}

/**
 * Where taste sits on a 0..1 trait: the rating-weighted average of the trait,
 * compared with the plain average across all works. Returns -1..1, where 0
 * means no lean (also when everything got the same rating).
 */
export function traitLean(r: Ratings, trait: "abstraction" | "vivid"): number {
  const rated = ARTWORKS.filter((art) => r[art.id] !== undefined);
  const total = rated.reduce((s, art) => s + r[art.id], 0);
  if (!rated.length || total === 0) return 0;
  const baseline = rated.reduce((s, art) => s + art[trait], 0) / rated.length;
  const weighted = rated.reduce((s, art) => s + art[trait] * r[art.id], 0) / total;
  // Scale so a typical strong preference fills most of the bar.
  return Math.max(-1, Math.min(1, (weighted - baseline) * 5));
}

export interface Comparison {
  /** 0..100: how close the two sets of ratings are, over works both rated. */
  match: number;
  shared: number;
  bothLoved: Artwork[];
  /** Largest gaps first; only gaps of 2 or more. */
  disagreements: { art: Artwork; a: number; b: number }[];
}

export function compare(a: Ratings, b: Ratings): Comparison {
  const both = ARTWORKS.filter((art) => a[art.id] !== undefined && b[art.id] !== undefined);
  const gap = both.reduce((s, art) => s + Math.abs(a[art.id] - b[art.id]), 0);
  return {
    match: both.length ? Math.round((1 - gap / (both.length * 3)) * 100) : 0,
    shared: both.length,
    bothLoved: both.filter((art) => a[art.id] === 3 && b[art.id] === 3),
    disagreements: both
      .map((art) => ({ art, a: a[art.id], b: b[art.id] }))
      .filter((d) => Math.abs(d.a - d.b) >= 2)
      .sort((x, y) => Math.abs(y.a - y.b) - Math.abs(x.a - x.b)),
  };
}

/** Stable per-person shuffle so nobody sees the works grouped by style. */
export function shuffledFor(seed: string): Artwork[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const out = [...ARTWORKS];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

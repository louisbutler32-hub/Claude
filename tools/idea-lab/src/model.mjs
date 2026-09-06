/**
 * The shipped model: everything the tool is entitled to claim, and nothing else.
 *
 * Two things live here:
 *   1. The BASELINE view model  — genuinely predictive (out-of-sample R^2 = 0.52).
 *   2. The CTR distribution     — derived from YouTube's own published figures.
 *
 * There is deliberately NO "title -> CTR" predictor. See title_form_validation
 * in data/model.json: that hypothesis was tested three ways on 677 real videos
 * and failed. Do not add one back without evidence that survives the
 * leave-one-niche-out test in scripts/build-model.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalQuantile, normalCdf, percentileOf, quantile } from './stats.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const MODEL = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'data', 'model.json'), 'utf8'));

/* ------------------------------------------------------------ view baseline */

/**
 * Expected views for a video of `ageDays` on a channel with `subs`, in `niche`.
 * Returns the median (the model is fitted in log space, so exp(fit) is the
 * median, not the mean) plus a prediction interval from the residual spread.
 */
export function expectedViews({ subs, ageDays = 90, niche = null }) {
  const b = MODEL.baseline.beta;
  const niches = MODEL.baseline.niches;
  let z = b[0] + b[1] * Math.log(Math.max(1, subs)) + b[2] * Math.log(Math.max(1, ageDays));
  // Niche fixed effects: niches[0] is the reference level and carries no term.
  const idx = niches.indexOf(niche);
  if (idx > 0) z += b[3 + (idx - 1)] ?? 0;
  const sd = MODEL.baseline.residual_sd_log;
  return {
    median: Math.exp(z),
    p10: Math.exp(z + normalQuantile(0.10) * sd),
    p25: Math.exp(z + normalQuantile(0.25) * sd),
    p75: Math.exp(z + normalQuantile(0.75) * sd),
    p90: Math.exp(z + normalQuantile(0.90) * sd),
    logMedian: z,
    residualSd: sd,
    nicheMatched: idx >= 0,
  };
}

/**
 * Probability of reaching `goalViews`, given channel size / age / niche.
 * This is a real probability: it reads off the fitted log-normal view
 * distribution, whose spread was measured from the corpus residuals.
 */
export function probabilityOfReaching(goalViews, ctx) {
  const e = expectedViews(ctx);
  const z = (Math.log(Math.max(1, goalViews)) - e.logMedian) / e.residualSd;
  return { p: 1 - normalCdf(z), zScore: z, expected: e };
}

/** Where a video's actual result sits against the corpus residual distribution. */
export function performancePercentile(views, ctx) {
  const e = expectedViews(ctx);
  const r = Math.log(Math.max(1, views)) - e.logMedian;
  return { residual: r, multiple: Math.exp(r), percentile: percentileOf(MODEL.baseline.residual_distribution, r) };
}

/* ---------------------------------------------------------------------- CTR */

/** CTR at a given percentile of YouTube's population distribution. */
export const ctrAtPercentile = (p) => Math.exp(MODEL.ctr.mu + MODEL.ctr.sigma * normalQuantile(p));

/** Where a CTR sits in that distribution (0..1). */
export const ctrPercentile = (ctr) => normalCdf((Math.log(ctr) - MODEL.ctr.mu) / MODEL.ctr.sigma);

/* -------------------------------------------------------------- niche stats */

/** Real observed view percentiles for a corpus niche, or null if unseen. */
export const nicheStats = (niche) => MODEL.niche_stats[niche] ?? null;

/** Nearest corpus niche by simple word overlap — used to pick a fallback. */
export function closestNiche(text) {
  const want = new Set(String(text || '').toLowerCase().split(/\W+/).filter(Boolean));
  let best = null, bestScore = 0;
  for (const n of MODEL.baseline.niches) {
    const have = new Set(n.toLowerCase().split(/\W+/).filter(Boolean));
    let hit = 0;
    for (const w of want) if (have.has(w)) hit++;
    const score = hit / Math.max(1, have.size);
    if (score > bestScore) { bestScore = score; best = n; }
  }
  return bestScore > 0 ? { niche: best, overlap: bestScore } : null;
}

/** Percentiles of a live-fetched sample of niche view counts. */
export function distributionOf(viewCounts) {
  const s = [...viewCounts].filter(Number.isFinite).sort((a, b) => a - b);
  if (!s.length) return null;
  return {
    n: s.length,
    p10: quantile(s, .1), p25: quantile(s, .25), p50: quantile(s, .5),
    p75: quantile(s, .75), p90: quantile(s, .9), max: s[s.length - 1],
    sorted: s,
  };
}

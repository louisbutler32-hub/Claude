/**
 * Real, repeatedly-used title formats — matching an existing title to a format,
 * and using formats as generation scaffolds.
 *
 * `uses` and `avg_views` are trustworthy aggregates. `avg_outlier` is an
 * arithmetic mean of a heavy-tailed quantity and is inflated by a few extreme
 * videos, so it is SHRUNK toward the corpus median before it can move a ranking.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { quantile } from './stats.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'data', 'formats.json'), 'utf8'));

const usesList = raw.rows.map((r) => r[1]).sort((a, b) => a - b);
const outlierLog = raw.rows.map((r) => Math.log(r[2])).sort((a, b) => a - b);
const GRAND_LOG_MEDIAN = quantile(outlierLog, 0.5);
/** Shrinkage strength: a format needs ~this many uses before its own mean is trusted half-way. */
const K = quantile(usesList, 0.5);

export const FORMATS = raw.rows.map(([format, uses, avgOutlier, avgViews, example]) => {
  const w = uses / (uses + K);
  const shrunkLog = GRAND_LOG_MEDIAN + w * (Math.log(avgOutlier) - GRAND_LOG_MEDIAN);
  return {
    format, uses, avgOutlier, avgViews, example,
    shrunkOutlier: Math.exp(shrunkLog),
    shrinkWeight: w,
    slots: [...format.matchAll(/\[(\w+)\]/g)].map((m) => m[1]),
    regex: formatToRegex(format),
  };
});

export const SHRINKAGE = { grandMedianOutlier: Math.exp(GRAND_LOG_MEDIAN), k: K };

/** Formats that stay grammatical with an abstract subject. See data/formats.json. */
export const TOPIC_SAFE = new Set(raw.topic_safe || []);
/** Formats that need a named human/character — unlocked by --people. */
export const PERSON_ONLY = new Set(raw.person_only || []);

/** Turn "[person] Reacts to [event]" into a loose but anchored matcher. */
function formatToRegex(format) {
  const escaped = format
    .split(/(\[\w+\])/)
    .map((part) => (/^\[\w+\]$/.test(part) ? '(.{1,60}?)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('');
  // Anchor loosely: the format may sit inside a longer title.
  return new RegExp(escaped.replace(/\s+/g, '\\s+').replace(/—/g, '[—-]'), 'i');
}

/** All formats a title plausibly matches, best-evidenced first. */
export function matchFormats(title, limit = 3) {
  return FORMATS
    .filter((f) => f.regex.test(title))
    // Prefer formats with more literal anchoring (fewer slots, longer fixed text).
    .map((f) => ({ ...f, anchorLen: f.format.replace(/\[\w+\]/g, '').trim().length }))
    .sort((a, b) => b.anchorLen - a.anchorLen || b.uses - a.uses)
    .slice(0, limit);
}

/**
 * Evidence weight for a format, 0..1. Combines how often it is really used with
 * its shrunk performance. Explicitly NOT a CTR or view prediction — it says
 * "this structure is well-attested", nothing more.
 */
export function formatEvidence(f) {
  const usesTerm = Math.log1p(f.uses) / Math.log1p(Math.max(...FORMATS.map((x) => x.uses)));
  const perfTerm = Math.min(1, f.shrunkOutlier / (SHRINKAGE.grandMedianOutlier * 2));
  return 0.6 * usesTerm + 0.4 * perfTerm;
}

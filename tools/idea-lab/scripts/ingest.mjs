/**
 * Merges saved vidIQ search results into data/corpus.json.
 * Run:  node scripts/ingest.mjs <dir-of-tool-result-json> 
 * Idempotent: dedupes on video id, so re-running never double-counts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORPUS = path.join(HERE, '..', 'data', 'corpus.json');
const dir = process.argv[2];

// File -> niche label. Timestamp order matches the order the searches were issued.
const QUERY_BY_FILE = {
  '1788737171674': 'personal finance',
  '1788737203605': 'tech review',
  '1788737204980': 'true crime',
  '1788737206715': 'movie explained',
  '1788737207994': 'science explained',
  '1788737222564': 'naruto explained',
  '1788737223894': 'dragon ball explained',
  '1788737225212': 'marvel dc theory',
  '1788737227777': 'fitness transformation',
  '1788737229150': 'car review',
  '1788737230766': 'cooking recipe',
  '1788737231713': 'football tactics',
  '1788737234752': 'minecraft tutorial',
};

/** "PT15M23S" -> 923 seconds. Returns null on anything unparseable. */
function isoDurationToSec(d) {
  if (typeof d !== 'string') return null;
  const m = d.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
}

const corpus = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));
const seen = new Set(corpus.rows.map((r) => r[0]));
const before = corpus.rows.length;
let added = 0, skippedDupe = 0, skippedBad = 0;
const perQuery = {};

for (const file of fs.readdirSync(dir).sort()) {
  const stamp = (file.match(/(\d{10,})/) || [])[1];
  const query = QUERY_BY_FILE[stamp];
  if (!query) continue;
  let parsed;
  try { parsed = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')); } catch { continue; }
  for (const v of parsed.results || []) {
    if (v.kind !== 'video' || !v.id) { skippedBad++; continue; }
    if (seen.has(v.id)) { skippedDupe++; continue; }
    // Require the fields the model actually needs.
    if (!Number.isFinite(v.viewCount) || !Number.isFinite(v.subscriberCount) || !v.publishedAt || !v.title) {
      skippedBad++; continue;
    }
    seen.add(v.id);
    corpus.rows.push([
      v.id,
      v.title,
      v.viewCount,
      v.subscriberCount,
      v.publishedAt.split('T')[0],
      isoDurationToSec(v.duration),
      Number.isFinite(v.likeCount) ? v.likeCount : null,
      Number.isFinite(v.commentCount) ? v.commentCount : null,
      query,
    ]);
    added++;
    perQuery[query] = (perQuery[query] || 0) + 1;
  }
}

corpus._provenance.collected_at = corpus._provenance.collected_at || '2026-09-06';
corpus._provenance.expanded_at = '2026-09-06';
corpus._provenance.total_rows = corpus.rows.length;
fs.writeFileSync(CORPUS, JSON.stringify(corpus, null, 1));

console.log(`corpus ${before} -> ${corpus.rows.length}  (+${added} added, ${skippedDupe} dupes, ${skippedBad} unusable)`);
console.log('\nper niche:');
Object.entries(perQuery).sort((a, b) => b[1] - a[1]).forEach(([q, n]) => console.log(`   ${String(n).padStart(3)}  ${q}`));

/** What did the word model actually learn, and does it survive an unseen niche? */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { extractFeatures, designRow, tokenize } from '../src/features.mjs';
import { fitLinear, auc, kFolds, dot, mean, sd, quantile } from '../src/stats.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const corpus = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'data', 'corpus.json'), 'utf8'));
const AS_OF = new Date('2026-09-06T00:00:00Z').getTime(), DAY = 86400e3;
const keep = corpus.rows.map(([id, title, views, subs, published, d, l, c, query]) => ({
  id, title, views, subs, query, ageDays: (AS_OF - new Date(published + 'T00:00:00Z').getTime()) / DAY,
})).filter(v => v.ageDays >= 14 && v.views >= 100 && v.subs >= 1 && v.title !== 'ウィーアー!');

const niches = [...new Set(keep.map(v => v.query))];
const bX = keep.map(v => [1, Math.log(v.subs), Math.log(v.ageDays), ...niches.slice(1).map(n => v.query === n ? 1 : 0)]);
const bY = keep.map(v => Math.log(v.views));
const base = fitLinear(bX, bY, 1e-6);
const resid = keep.map((v, i) => bY[i] - dot(bX[i], base.beta));
const cut = quantile([...resid].sort((a, b) => a - b), 2 / 3);
const label = resid.map(r => r >= cut ? 1 : 0);

const df = new Map();
keep.forEach(v => new Set(tokenize(v.title.toLowerCase())).forEach(w => df.set(w, (df.get(w) || 0) + 1)));
const vocab = [...df.entries()].filter(([, c]) => c >= 8).map(([w]) => w).sort();
const lens = keep.map(v => extractFeatures(v.title).len);
const norm = { lenMean: mean(lens), lenSd: sd(lens) };
const X = keep.map((v, i) => [...designRow(v.title, norm), ...vocab.map(w => new Set(tokenize(v.title.toLowerCase())).has(w) ? 1 : 0)]);

const fit = fitLinear(X, label, 10);
const off = designRow(keep[0].title, norm).length;
const wordW = vocab.map((w, i) => ({ w, b: fit.beta[off + i], n: df.get(w) })).sort((a, b) => b.b - a.b);

console.log('=== words most associated with OVERPERFORMANCE (within niche, size- and age-adjusted) ===');
wordW.slice(0, 18).forEach(x => console.log(`   +${x.b.toFixed(4)}  "${x.w}"  (in ${x.n} titles)`));
console.log('\n=== words most associated with UNDERPERFORMANCE ===');
wordW.slice(-18).reverse().forEach(x => console.log(`   ${x.b.toFixed(4)}  "${x.w}"  (in ${x.n} titles)`));

console.log('\n=== ACID TEST: leave-one-NICHE-out (predict in a niche never seen in training) ===');
const oof = new Array(keep.length).fill(0);
for (const n of niches) {
  const te = keep.map((v, i) => v.query === n ? i : -1).filter(i => i >= 0);
  const s = new Set(te);
  const trY = label.filter((_, i) => !s.has(i));
  if (!trY.some(v => v) || !trY.some(v => !v)) continue;
  const f = fitLinear(X.filter((_, i) => !s.has(i)), trY, 10);
  te.forEach(i => { oof[i] = dot(X[i], f.beta); });
}
const looAll = auc(oof, label);
console.log(`   pooled leave-one-niche-out AUC = ${looAll.toFixed(4)}`);
console.log('\n   per-niche (AUC computed only within that held-out niche):');
const perNiche = niches.map(n => {
  const idx = keep.map((v, i) => v.query === n ? i : -1).filter(i => i >= 0);
  const y = idx.map(i => label[i]);
  if (!y.some(v => v) || !y.some(v => !v)) return null;
  return { n, k: idx.length, a: auc(idx.map(i => oof[i]), y) };
}).filter(Boolean).sort((a, b) => b.a - a.a);
perNiche.forEach(p => console.log(`      ${p.a.toFixed(3)}  ${p.n} (n=${p.k})`));
console.log(`\n   mean within-niche AUC = ${mean(perNiche.map(p => p.a)).toFixed(4)}  (0.50 = chance)`);
console.log(`   niches above chance: ${perNiche.filter(p => p.a > 0.5).length}/${perNiche.length}`);

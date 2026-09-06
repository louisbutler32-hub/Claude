/** Final test: can a model trained INSIDE one niche predict within that same niche? */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { extractFeatures, designRow, tokenize } from '../src/features.mjs';
import { fitLinear, auc, kFolds, dot, mean, sd, quantile } from '../src/stats.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const corpus = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'data', 'corpus.json'), 'utf8'));
const AS_OF = new Date('2026-09-06T00:00:00Z').getTime(), DAY = 86400e3;
const all = corpus.rows.map(([id, title, views, subs, published, d, l, c, query]) => ({
  id, title, views, subs, query, ageDays: (AS_OF - new Date(published + 'T00:00:00Z').getTime()) / DAY,
})).filter(v => v.ageDays >= 14 && v.views >= 100 && v.subs >= 1 && v.title !== 'ウィーアー!');

const niches = [...new Set(all.map(v => v.query))].filter(n => all.filter(v => v.query === n).length >= 35);
const results = [];
for (const n of niches) {
  const g = all.filter(v => v.query === n);
  const X0 = g.map(v => [1, Math.log(v.subs), Math.log(v.ageDays)]);
  const y0 = g.map(v => Math.log(v.views));
  const b = fitLinear(X0, y0, 1e-6);
  const r = g.map((v, i) => y0[i] - dot(X0[i], b.beta));
  const cut = quantile([...r].sort((a, c) => a - c), 2 / 3);
  const lab = r.map(x => x >= cut ? 1 : 0);
  const lens = g.map(v => extractFeatures(v.title).len);
  const norm = { lenMean: mean(lens), lenSd: sd(lens) };
  const X = g.map(v => designRow(v.title, norm));
  const folds = kFolds(g.length, 5, 7); const oof = new Array(g.length).fill(0);
  for (const te of folds) {
    const s = new Set(te); const trY = lab.filter((_, i) => !s.has(i));
    if (!trY.some(v => v) || !trY.some(v => !v)) continue;
    const f = fitLinear(X.filter((_, i) => !s.has(i)), trY, 5);
    te.forEach(i => { oof[i] = dot(X[i], f.beta); });
  }
  results.push({ n, k: g.length, a: auc(oof, lab), r2: b.r2 });
}
console.log('within-niche 5-fold CV AUC (model trained and tested inside the same niche):\n');
results.sort((a, b) => b.a - a.a).forEach(x =>
  console.log(`   AUC ${x.a.toFixed(3)}   baseline R2 ${x.r2.toFixed(2)}   n=${String(x.k).padStart(2)}   ${x.n}`));
const m = mean(results.map(x => x.a));
console.log(`\n   mean = ${m.toFixed(4)}   sd across niches = ${sd(results.map(x => x.a)).toFixed(4)}`);
console.log(`   above chance: ${results.filter(x => x.a > 0.5).length}/${results.length}`);
console.log(`\n   A fair coin over ${results.length} niches would put ~${(results.length/2).toFixed(1)} above 0.50.`);

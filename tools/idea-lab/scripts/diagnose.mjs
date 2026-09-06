/** Diagnostic: is the null result a bad specification, or genuinely no signal? */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { extractFeatures, designRow, MODEL_FEATURES } from '../src/features.mjs';
import { fitLinear, fitLogistic, auc, kFolds, dot, mean, sd, quantile } from '../src/stats.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const corpus = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'data', 'corpus.json'), 'utf8'));
const AS_OF = new Date(corpus._provenance.collected_at + 'T00:00:00Z').getTime(), DAY = 86400e3;

const keep = corpus.rows.map(([id, title, views, subs, published, d, l, c, query]) => ({
  id, title, views, subs, query, ageDays: (AS_OF - new Date(published + 'T00:00:00Z').getTime()) / DAY,
})).filter(v => v.ageDays >= 14 && v.views >= 100 && v.subs >= 1 && v.title !== 'ウィーアー!');

const niches = [...new Set(keep.map(v => v.query))];
const bX = keep.map(v => [1, Math.log(v.subs), Math.log(v.ageDays), ...niches.slice(1).map(n => v.query === n ? 1 : 0)]);
const bY = keep.map(v => Math.log(v.views));
const base = fitLinear(bX, bY, 1e-6);
const resid = keep.map((v, i) => bY[i] - dot(bX[i], base.beta));

console.log('=== (a) UNIVARIATE signal per feature (no overfitting possible) ===');
console.log('    AUC vs top-tertile label. 0.50 = nothing. Sampling SE with n=90 is ~0.065,');
console.log('    so |AUC-0.50| < 0.13 is indistinguishable from noise.\n');
const cut = quantile([...resid].sort((a, b) => a - b), 2 / 3);
const label = resid.map(r => r >= cut ? 1 : 0);
const feats = keep.map(v => extractFeatures(v.title));
const binary = Object.keys(feats[0]).filter(k => k.startsWith('has'));
const rows = binary.map(k => {
  const col = feats.map(f => f[k]);
  const n1 = col.filter(Boolean).length;
  return { k, n1, a: auc(col, label) };
}).sort((a, b) => Math.abs(b.a - 0.5) - Math.abs(a.a - 0.5));
rows.forEach(r => console.log(`   ${r.k.padEnd(18)} present in ${String(r.n1).padStart(2)}/${keep.length}   AUC ${r.a.toFixed(3)}  ${Math.abs(r.a-0.5)>0.13?'<-- beyond noise':''}`));

// length, as a continuous feature
const lenA = auc(feats.map(f => f.len), label);
console.log(`   ${'len (chars)'.padEnd(18)}                    AUC ${lenA.toFixed(3)}  ${Math.abs(lenA-0.5)>0.13?'<-- beyond noise':''}`);

console.log('\n=== (b) alternative labels / specifications, all 5-fold CV ===');
const lens = feats.map(f => f.len), norm = { lenMean: mean(lens), lenSd: sd(lens) };
const X = keep.map(v => designRow(v.title, norm));
function cv(Xs, ys, lambda) {
  const folds = kFolds(Xs.length, 5); const oof = new Array(Xs.length).fill(0);
  for (const te of folds) {
    const s = new Set(te);
    const trX = Xs.filter((_, i) => !s.has(i)), trY = ys.filter((_, i) => !s.has(i));
    if (!trY.some(v => v) || !trY.some(v => !v)) continue;
    const w = fitLogistic(trX, trY, lambda);
    te.forEach(i => { oof[i] = dot(Xs[i], w); });
  }
  return auc(oof, ys);
}
console.log(`   top-tertile vs rest            CV AUC ${cv(X, label, 1).toFixed(3)}`);

// top vs bottom tertile (drop the middle -> cleaner contrast)
const lo = quantile([...resid].sort((a, b) => a - b), 1 / 3);
const idxTB = keep.map((_, i) => i).filter(i => resid[i] >= cut || resid[i] <= lo);
console.log(`   top vs BOTTOM tertile (n=${idxTB.length})     CV AUC ${cv(idxTB.map(i => X[i]), idxTB.map(i => resid[i] >= cut ? 1 : 0), 1).toFixed(3)}`);

// median split
const med = quantile([...resid].sort((a, b) => a - b), 0.5);
console.log(`   above/below median             CV AUC ${cv(X, resid.map(r => r >= med ? 1 : 0), 1).toFixed(3)}`);

// parsimonious: only the 4 strongest univariate features
const top4 = rows.slice(0, 4).map(r => r.k);
const Xp = keep.map((v, i) => [1, ...top4.map(k => feats[i][k])]);
console.log(`   parsimonious (${top4.join(',')})  CV AUC ${cv(Xp, label, 1).toFixed(3)}`);

console.log('\n=== (c) how much of the residual could a title even explain? ===');
const full = fitLinear(X, resid, 1);
console.log(`   linear resid ~ all title features:  in-sample R^2 = ${full.r2.toFixed(3)}`);
const foldsR = kFolds(keep.length, 5); let ssRes = 0, ssTot = 0; const rBar = mean(resid);
for (const te of foldsR) {
  const s = new Set(te);
  const f = fitLinear(X.filter((_, i) => !s.has(i)), resid.filter((_, i) => !s.has(i)), 1);
  te.forEach(i => { ssRes += (resid[i] - dot(X[i], f.beta)) ** 2; });
}
resid.forEach(r => { ssTot += (r - rBar) ** 2; });
console.log(`   out-of-sample R^2 = ${(1 - ssRes / ssTot).toFixed(3)}  (negative = worse than predicting the mean)`);
console.log(`\n   residual spread: sd = ${sd(resid).toFixed(3)} in log-views`);
console.log(`   i.e. a 1-sd swing in unexplained performance is a factor of ${Math.exp(sd(resid)).toFixed(2)}x in views.`);

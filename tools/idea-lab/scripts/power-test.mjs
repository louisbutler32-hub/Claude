/**
 * Is the title-feature signal real, or is CV AUC 0.539 just noise?
 * Answers with (1) a permutation test giving a real p-value, and
 * (2) a much richer bag-of-words model, so the hypothesis gets a fair shot.
 */
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
const N = keep.length;
console.log(`n = ${N}, positives = ${label.filter(Boolean).length}\n`);

/** Closed-form ridge ranker; fast enough for thousands of permutations. */
function cvAucRidge(X, y, lambda, seed = 42) {
  const folds = kFolds(X.length, 5, seed); const oof = new Array(X.length).fill(0);
  for (const te of folds) {
    const s = new Set(te);
    const f = fitLinear(X.filter((_, i) => !s.has(i)), y.filter((_, i) => !s.has(i)), lambda);
    te.forEach(i => { oof[i] = dot(X[i], f.beta); });
  }
  return auc(oof, y);
}

/* ---------------- model A: the 15 hand-built features ---------------- */
const lens = keep.map(v => extractFeatures(v.title).len);
const norm = { lenMean: mean(lens), lenSd: sd(lens) };
const XA = keep.map(v => designRow(v.title, norm));
const aucA = cvAucRidge(XA, label, 10);
console.log(`A. 15 hand-built title features      CV AUC = ${aucA.toFixed(4)}`);

/* ---------------- model B: bag of words (much richer) ---------------- */
const df = new Map();
keep.forEach(v => new Set(tokenize(v.title.toLowerCase())).forEach(w => df.set(w, (df.get(w) || 0) + 1)));
const vocab = [...df.entries()].filter(([, c]) => c >= 8).map(([w]) => w).sort();
const XB = keep.map(v => {
  const s = new Set(tokenize(v.title.toLowerCase()));
  return [1, ...vocab.map(w => s.has(w) ? 1 : 0)];
});
let bestB = { auc: 0, l: null };
for (const l of [1, 5, 10, 25, 50, 100, 200]) {
  const a = cvAucRidge(XB, label, l);
  if (a > bestB.auc) bestB = { auc: a, l };
}
console.log(`B. bag-of-words (${vocab.length} words, df>=8)   CV AUC = ${bestB.auc.toFixed(4)}  (best lambda ${bestB.l})`);

/* ---------------- model C: A + B combined ---------------- */
const XC = keep.map((v, i) => [...XA[i], ...XB[i].slice(1)]);
let bestC = { auc: 0, l: null };
for (const l of [5, 10, 25, 50, 100, 200]) {
  const a = cvAucRidge(XC, label, l);
  if (a > bestC.auc) bestC = { auc: a, l };
}
console.log(`C. features + words combined         CV AUC = ${bestC.auc.toFixed(4)}  (best lambda ${bestC.l})`);

/* ---------------- permutation test ---------------- */
console.log('\n--- permutation test: shuffle the labels, refit, repeat ---');
function permute(arr, seed) {
  const a = [...arr]; let s = seed;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) & 0x7fffffff; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const PERMS = 500;
for (const [name, X, lam, observed] of [['A (hand features)', XA, 10, aucA], ['C (features+words)', XC, bestC.l, bestC.auc]]) {
  const null_ = [];
  for (let p = 0; p < PERMS; p++) null_.push(cvAucRidge(X, permute(label, 1000 + p * 7), lam));
  null_.sort((a, b) => a - b);
  const pVal = (null_.filter(a => a >= observed).length + 1) / (PERMS + 1);
  console.log(`   ${name.padEnd(20)} observed ${observed.toFixed(4)} | null mean ${mean(null_).toFixed(4)} sd ${sd(null_).toFixed(4)} | 95th pct ${quantile(null_, 0.95).toFixed(4)} | p = ${pVal.toFixed(4)}`);
}

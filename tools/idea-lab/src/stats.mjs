/**
 * Small, dependency-free statistics kit.
 * Everything here is deliberately plain so the numbers the tool reports can be
 * audited by hand. No hidden library behaviour.
 */

/* ---------------------------------------------------------------- linear algebra */

/** Solve (A + lambda*I) x = b by Gauss-Jordan with partial pivoting. */
export function solveRidge(A, b, lambda = 0) {
  const n = A.length;
  const M = A.map((row, i) => [...row.map((v, j) => v + (i === j ? lambda : 0)), b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    if (Math.abs(M[piv][col]) < 1e-12) continue; // singular column; leave coefficient at 0
    [M[col], M[piv]] = [M[piv], M[col]];
    const d = M[col][col];
    for (let j = col; j <= n; j++) M[col][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col];
      if (f === 0) continue;
      for (let j = col; j <= n; j++) M[r][j] -= f * M[col][j];
    }
  }
  return M.map((row) => row[n]);
}

/**
 * Ordinary / ridge least squares. X must already include an intercept column.
 * Returns coefficients plus R-squared so callers can report fit quality.
 */
export function fitLinear(X, y, lambda = 0) {
  const p = X[0].length;
  const XtX = Array.from({ length: p }, () => new Array(p).fill(0));
  const Xty = new Array(p).fill(0);
  for (let i = 0; i < X.length; i++) {
    for (let a = 0; a < p; a++) {
      Xty[a] += X[i][a] * y[i];
      for (let b2 = a; b2 < p; b2++) XtX[a][b2] += X[i][a] * X[i][b2];
    }
  }
  for (let a = 0; a < p; a++) for (let b2 = 0; b2 < a; b2++) XtX[a][b2] = XtX[b2][a];
  const beta = solveRidge(XtX, Xty, lambda);
  const yBar = mean(y);
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < X.length; i++) {
    const pred = dot(X[i], beta);
    ssRes += (y[i] - pred) ** 2;
    ssTot += (y[i] - yBar) ** 2;
  }
  return { beta, r2: ssTot === 0 ? 0 : 1 - ssRes / ssTot, n: X.length };
}

/**
 * L2-regularised logistic regression, fitted by gradient descent with a
 * decaying step. The intercept (column 0) is never penalised.
 */
export function fitLogistic(X, y, lambda = 1, iters = 4000, lr = 0.12) {
  const p = X[0].length, n = X.length;
  let w = new Array(p).fill(0);
  for (let it = 0; it < iters; it++) {
    const g = new Array(p).fill(0);
    for (let i = 0; i < n; i++) {
      const err = sigmoid(dot(X[i], w)) - y[i];
      for (let j = 0; j < p; j++) g[j] += err * X[i][j];
    }
    const step = lr / (1 + it / 800);
    for (let j = 0; j < p; j++) {
      const penalty = j === 0 ? 0 : lambda * w[j];
      w[j] -= (step * (g[j] + penalty)) / n;
    }
  }
  return w;
}

export const sigmoid = (z) => 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, z))));
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);

/* ---------------------------------------------------------------- descriptives */

export const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
export function sd(a) {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1));
}
export function quantile(sorted, q) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
/** Fraction of `sorted` strictly below x — i.e. x's percentile in that sample. */
export function percentileOf(sorted, x) {
  let lo = 0, hi = sorted.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] < x) lo = mid + 1; else hi = mid; }
  return sorted.length ? lo / sorted.length : 0;
}

/* ---------------------------------------------------------------- evaluation */

/**
 * Area under the ROC curve, computed via the rank-sum identity so that it is
 * exact and ties are handled correctly (each tie group gets its average rank).
 */
export function auc(scores, labels) {
  const idx = scores.map((s, i) => [s, labels[i]]).sort((a, b) => a[0] - b[0]);
  const ranks = new Array(idx.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[k] = avg;
    i = j + 1;
  }
  let sumPos = 0, nPos = 0, nNeg = 0;
  idx.forEach(([, lab], k) => { if (lab === 1) { sumPos += ranks[k]; nPos++; } else nNeg++; });
  if (!nPos || !nNeg) return 0.5;
  return (sumPos - (nPos * (nPos + 1)) / 2) / (nPos * nNeg);
}

/** Deterministic k-fold split (seeded shuffle) so results are reproducible. */
export function kFolds(n, k, seed = 42) {
  const order = [...Array(n).keys()];
  let s = seed;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return Array.from({ length: k }, (_, f) => order.filter((_, i) => i % k === f));
}

/* ---------------------------------------------------------------- distributions */

/** Inverse error function (Winitzki approximation, ~1e-4 absolute). */
export function erfinv(x) {
  const a = 0.147;
  const ln = Math.log(1 - x * x);
  const t = 2 / (Math.PI * a) + ln / 2;
  return Math.sign(x) * Math.sqrt(Math.sqrt(t * t - ln / a) - t);
}
export const normalQuantile = (p) => Math.SQRT2 * erfinv(2 * p - 1);
export function normalCdf(z) {
  // Abramowitz & Stegun 7.1.26
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-z * z / 2);
  const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

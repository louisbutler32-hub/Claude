/** Shared number/string presentation helpers. */
export const compact = (n) => {
  if (n == null || !Number.isFinite(n)) return '—';
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(a >= 1e10 ? 0 : 1) + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M';
  if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'K';
  return String(Math.round(n));
};
export const pct = (x, d = 1) => (x == null || !Number.isFinite(x) ? '—' : (x * 100).toFixed(d) + '%');
export const ordinal = (x) => {
  if (x == null || !Number.isFinite(x)) return '—';
  const n = Math.round(x * 100);
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
export const pad = (s, n) => String(s).padEnd(n);
export const parseCount = (s) => {
  const m = String(s).trim().replace(/,/g, '').match(/^([\d.]+)\s*([kKmMbB])?$/);
  if (!m) return NaN;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1;
  return parseFloat(m[1]) * mult;
};
export const parsePercent = (s) => {
  const t = String(s).trim().replace('%', '');
  const v = parseFloat(t);
  if (!Number.isFinite(v)) return NaN;
  // "5" and "5%" both mean 0.05; "0.05" also means 0.05.
  return v > 1 ? v / 100 : v;
};

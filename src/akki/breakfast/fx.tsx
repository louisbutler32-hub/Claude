import React from "react";
import { H, INK, W } from "../common";
import { Part, smooth } from "../bowling/characters";

/**
 * The three Logia powers, drawn flat with hard cel edges and a glow:
 * magma (molten orange under a black crust, dripping), ice (pale-blue
 * faceted crystal with white highlights), light (white core, gold halo,
 * star sparkles). Plus the comic-explosion starburst, smoke puffs and the
 * white-on-black impact flash the channel cuts to on every big hit.
 */

type P = [number, number];
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
const fx = (p: P) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

export const FxDefs: React.FC = () => (
  <defs>
    <filter id="glowHot" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={18} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={30} /></filter>
    <radialGradient id="magmaCore"><stop offset="0" stopColor="#fff2a0" /><stop offset="0.45" stopColor="#ffb020" /><stop offset="1" stopColor="#e2401a" /></radialGradient>
    <linearGradient id="iceFace" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2fbff" /><stop offset="0.5" stopColor="#a8dcf6" /><stop offset="1" stopColor="#5aa6e0" /></linearGradient>
  </defs>
);

/** a molten blob: crust outline, glowing core, drips. `t` 0..1 animates the bubbling */
export const Magma: React.FC<{ x: number; y: number; r: number; t: number; seed?: number; drips?: number }> = ({ x, y, r, t, seed = 1, drips = 4 }) => {
  const n = 14;
  const pts: P[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 0.78 + 0.3 * rnd(i, seed) + 0.08 * Math.sin(t * 9 + i * 1.7);
    return [x + Math.cos(a) * r * k, y + Math.sin(a) * r * k];
  });
  return (
    <g>
      <circle cx={x} cy={y} r={r * 1.5} fill="#ff6a1a" opacity={0.35} filter="url(#glowSoft)" />
      <Part d={smooth(pts)} fill="url(#magmaCore)" lw={5} />
      {/* crust plates */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = rnd(i, seed + 2) * Math.PI * 2, d = r * (0.35 + 0.4 * rnd(i, seed + 3));
        const cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d, s = r * 0.18;
        return <path key={i} d={`M${cx - s},${cy} L${cx - s * 0.2},${cy - s * 0.8} L${cx + s},${cy - s * 0.3} L${cx + s * 0.6},${cy + s * 0.7} L${cx - s * 0.5},${cy + s * 0.6}Z`} fill="#3a1208" stroke={INK} strokeWidth={2} />;
      })}
      {Array.from({ length: drips }, (_, i) => {
        const dx = x + (rnd(i, seed + 4) - 0.5) * r * 1.4;
        const len = r * (0.4 + 0.7 * ((t * 1.3 + rnd(i, seed + 5)) % 1));
        return <path key={`d${i}`} d={`M${dx - 9},${y + r * 0.6} Q${dx - 8},${y + r * 0.6 + len} ${dx},${y + r * 0.62 + len} Q${dx + 8},${y + r * 0.6 + len} ${dx + 9},${y + r * 0.6}Z`} fill="#ff9a1a" stroke={INK} strokeWidth={3} />;
      })}
    </g>
  );
};

/** a faceted ice block around a box */
export const IceBlock: React.FC<{ x: number; y: number; w: number; h: number; grow?: number }> = ({ x, y, w, h, grow = 1 }) => {
  const g = Math.max(0, Math.min(1, grow));
  if (g <= 0) return null;
  const hh = h * g;
  const top = y + h - hh;
  return (
    <g>
      <path d={`M${x},${y + h} L${x - 20},${top + 40} L${x + w * 0.2},${top} L${x + w * 0.7},${top - 18} L${x + w + 20},${top + 30} L${x + w + 10},${y + h}Z`} fill="url(#iceFace)" opacity={0.72} stroke="#2a5a8a" strokeWidth={5} strokeLinejoin="round" />
      <path d={`M${x + w * 0.2},${top} L${x + w * 0.35},${y + h} M${x + w * 0.7},${top - 18} L${x + w * 0.62},${y + h} M${x - 20},${top + 40} L${x + w + 20},${top + 30}`} stroke="#ffffff" strokeWidth={4} opacity={0.6} />
      <path d={`M${x + 20},${top + 50} l40,-26 M${x + 30},${top + 90} l70,-44`} stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.85} />
    </g>
  );
};

/** ice spikes erupting along a baseline, left to right as `t` goes 0..1 */
export const IceSpikes: React.FC<{ y: number; t: number; x0?: number; x1?: number; hMax?: number; seed?: number }> = ({ y, t, x0 = -40, x1 = W + 40, hMax = 360, seed = 3 }) => {
  const n = 16;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1);
        const k = Math.max(0, Math.min(1, (t - u * 0.6) / 0.4));
        if (k <= 0) return null;
        const cx = x0 + (x1 - x0) * u + (rnd(i, seed) - 0.5) * 40;
        const h = hMax * (0.45 + 0.55 * rnd(i, seed + 1)) * k;
        const w = 50 + 50 * rnd(i, seed + 2);
        const lean = (rnd(i, seed + 3) - 0.5) * 60;
        return (
          <g key={i}>
            <path d={`M${cx - w},${y} L${cx + lean},${y - h} L${cx + w},${y}Z`} fill="url(#iceFace)" stroke="#2a5a8a" strokeWidth={4} strokeLinejoin="round" />
            <path d={`M${cx + lean},${y - h} L${cx + lean * 0.3},${y}`} stroke="#ffffff" strokeWidth={3} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
};

/** frost creeping over the whole frame from the edges */
export const Frost: React.FC<{ t: number }> = ({ t }) => (
  <g opacity={Math.min(1, t)}>
    <rect width={W} height={H} fill="#bfe6ff" opacity={0.18 * t} />
    {Array.from({ length: 26 }, (_, i) => {
      const side = i % 4;
      const u = rnd(i, 9);
      const [x, y] = side === 0 ? [u * W, 0] : side === 1 ? [W, u * H] : side === 2 ? [u * W, H] : [0, u * H];
      const len = 140 + 220 * rnd(i, 10);
      const a = Math.atan2(H / 2 - y, W / 2 - x) + (rnd(i, 11) - 0.5) * 0.8;
      const e: P = [x + Math.cos(a) * len * t, y + Math.sin(a) * len * t];
      return <path key={i} d={`M${x},${y} L${fx(e)} M${fx([(x + e[0]) / 2, (y + e[1]) / 2])} l${30 * Math.cos(a + 0.8)},${30 * Math.sin(a + 0.8)}`} stroke="#ffffff" strokeWidth={5} opacity={0.75} strokeLinecap="round" />;
    })}
  </g>
);

/** a beam of light from a to b: wide gold glow, white core, sparkles along it */
export const Beam: React.FC<{ a: P; b: P; w: number; t: number }> = ({ a, b, w, t }) => {
  const d = `M${fx(a)}L${fx(b)}`;
  return (
    <g>
      <path d={d} stroke="#ffd84a" strokeWidth={w * 2.6} strokeLinecap="round" opacity={0.45} filter="url(#glowSoft)" />
      <path d={d} stroke="#ffe680" strokeWidth={w * 1.4} strokeLinecap="round" />
      <path d={d} stroke="#ffffff" strokeWidth={w * 0.6} strokeLinecap="round" />
      {Array.from({ length: 8 }, (_, i) => {
        const u = (i / 8 + t * 2) % 1;
        const p: P = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + (rnd(i, 4) - 0.5) * w * 2];
        return <Sparkle key={i} x={p[0]} y={p[1]} r={w * 0.5} />;
      })}
    </g>
  );
};

export const Sparkle: React.FC<{ x: number; y: number; r: number; c?: string }> = ({ x, y, r, c = "#ffffff" }) => (
  <path d={`M${x},${y - r} Q${x + r * 0.15},${y - r * 0.15} ${x + r},${y} Q${x + r * 0.15},${y + r * 0.15} ${x},${y + r} Q${x - r * 0.15},${y + r * 0.15} ${x - r},${y} Q${x - r * 0.15},${y - r * 0.15} ${x},${y - r}Z`} fill={c} />
);

/** comic explosion: three nested starbursts, puffing out with `t` */
export const Boom: React.FC<{ x: number; y: number; r: number; t: number; seed?: number }> = ({ x, y, r, t, seed = 2 }) => {
  const burst = (k: number, n: number, fill: string, sd: number) => {
    const pts: P[] = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 + sd;
      const rr = r * k * (i % 2 ? 0.62 : 1) * (0.85 + 0.3 * rnd(i, seed + sd));
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    return <path d={"M" + pts.map(fx).join("L") + "Z"} fill={fill} stroke={INK} strokeWidth={6} strokeLinejoin="round" />;
  };
  const s = 0.4 + 0.6 * Math.min(1, t * 3);
  return (
    <g transform={`translate(${x},${y}) scale(${s}) translate(${-x},${-y})`} opacity={t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 1}>
      <circle cx={x} cy={y} r={r * 1.3} fill="#ff8a1a" opacity={0.45} filter="url(#glowSoft)" />
      {burst(1, 11, "#e2401a", 0.1)}
      {burst(0.72, 9, "#ffa21a", 0.5)}
      {burst(0.42, 7, "#fff2a0", 0.2)}
    </g>
  );
};

export const Smoke: React.FC<{ x: number; y: number; r: number; t: number; c?: string; seed?: number }> = ({ x, y, r, t, c = "#8a8690", seed = 5 }) => (
  <g opacity={Math.max(0, 1 - t * 0.8)}>
    {Array.from({ length: 7 }, (_, i) => {
      const a = rnd(i, seed) * Math.PI * 2;
      const d = r * (0.3 + 0.9 * t) * rnd(i, seed + 1);
      return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d - t * r * 0.8} r={r * (0.35 + 0.3 * rnd(i, seed + 2)) * (0.6 + t)} fill={c} stroke={INK} strokeWidth={4} />;
    })}
  </g>
);

/** the channel's impact frame: white silhouette burst on black */
export const ImpactFlash: React.FC<{ x?: number; y?: number; seed?: number }> = ({ x = 540, y = 960, seed = 1 }) => {
  const pts: P[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const rr = i % 2 ? 140 + 80 * rnd(i, seed) : 520 + 600 * rnd(i, seed + 1);
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  return (
    <g>
      <rect width={W} height={H} fill="#000" />
      <path d={"M" + pts.map(fx).join("L") + "Z"} fill="#fff" />
    </g>
  );
};

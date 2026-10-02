import React from "react";
import { H, INK, W } from "../common";
import { Part, smooth } from "../bowling/characters";
import { FxDefs } from "../breakfast/fx";

/** small props and effects for the buffet short: camera, whip-pan, steam, fly, berries, pops */

export type P = [number, number];
export const rnd = (i: number, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
export const fx = (p: P) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const kick = (f: number, at: number, amt = 26, decay = 4) => (f >= at ? amt * Math.exp(-(f - at) / decay) : 0);
/** overshoot ease: 0 → 1 with a bounce past 1 */
export const back = (t: number, k = 1.9) => { const x = clamp(t) - 1; return 1 + (k + 1) * x * x * x + k * x * x; };

export const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <FxDefs />
    {children}
  </svg>
);

/** camera: world point `at` lands on screen `to`; z zooms, rot (degrees) is a dutch tilt about the screen centre */
export const Cam: React.FC<{ at?: P; to?: P; z?: number; rot?: number; shake?: number; f?: number; children: React.ReactNode }> = ({ at = [540, 960], to = [540, 960], z = 1, rot = 0, shake = 0, f = 0, children }) => {
  const sx = shake ? Math.sin(f * 2.7) * shake : 0, sy = shake ? Math.cos(f * 3.3) * shake : 0;
  return <g transform={`translate(${sx},${sy}) translate(540,960) rotate(${rot}) translate(${to[0] - 540},${to[1] - 960}) scale(${z}) translate(${-at[0]},${-at[1]})`}>{children}</g>;
};

/** whip-pan smear: horizontal blur + slide, for the first/last frames of a shot */
export const Whip: React.FC<{ amt: number; dx: number; children: React.ReactNode }> = ({ amt, dx, children }) => {
  if (amt <= 0) return <>{children}</>;
  return (
    <>
      <defs><filter id="whipF" x="-40%" y="-5%" width="180%" height="110%"><feGaussianBlur stdDeviation={`${amt} 0`} /></filter></defs>
      <g filter="url(#whipF)" transform={`translate(${dx},0)`}>{children}</g>
    </>
  );
};

export const Steam: React.FC<{ x: number; y: number; t: number; n?: number; h?: number; w?: number }> = ({ x, y, t, n = 3, h = 110, w = 14 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const ph = (t * 0.05 + i / n) % 1;
      const yy = y - ph * h;
      const xx = x + (i - (n - 1) / 2) * 28 + Math.sin(ph * 7 + i * 2) * 10;
      return <path key={i} d={`M${xx},${yy} q${-w},${-h * 0.14} 0,${-h * 0.28} q${w},${-h * 0.14} 0,${-h * 0.28}`} stroke="#ffffff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.75 * (1 - ph)} />;
    })}
  </g>
);

/** a fly: little body, blurred wings, a dotted trail */
export const Fly: React.FC<{ x: number; y: number; t: number; r?: number; s?: number }> = ({ x, y, t, r = 70, s = 1 }) => {
  const pos = (u: number): P => [x + Math.sin(u * 0.55) * r + Math.sin(u * 1.7) * r * 0.25, y + Math.cos(u * 0.8) * r * 0.6 + Math.sin(u * 2.3) * r * 0.15];
  const [fx0, fy0] = pos(t);
  return (
    <g>
      {[1, 2, 3, 4].map((k) => { const q = pos(t - k * 1.2); return <circle key={k} cx={q[0]} cy={q[1]} r={2.4 * s} fill={INK} opacity={0.5 - k * 0.1} />; })}
      <g transform={`translate(${fx0},${fy0}) scale(${s})`}>
        <ellipse cx={-5} cy={-8} rx={9} ry={5} fill="#dfe8f0" stroke={INK} strokeWidth={1.6} transform={`rotate(${-30 + Math.sin(t * 9) * 18})`} />
        <ellipse cx={5} cy={-8} rx={9} ry={5} fill="#dfe8f0" stroke={INK} strokeWidth={1.6} transform={`rotate(${30 - Math.sin(t * 9) * 18})`} />
        <ellipse cx={0} cy={0} rx={6} ry={8} fill="#2a2a30" stroke={INK} strokeWidth={2} />
        <circle cx={-2.5} cy={5} r={2.6} fill="#c8362c" />
        <circle cx={2.5} cy={5} r={2.6} fill="#c8362c" />
      </g>
    </g>
  );
};

/** a gold berry coin */
export const Berry: React.FC<{ x: number; y: number; s?: number; rot?: number; lw?: number }> = ({ x, y, s = 1, rot = 0, lw = 4 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d="M-30,0a30,30 0 1 0 60,0a30,30 0 1 0 -60,0Z" fill="#f6c52a" shade="#c8901a" lw={lw / s} sh={[-5, -4]}>
      <circle r={21} fill="none" stroke="#b07a10" strokeWidth={3} />
      <text x={0} y={9} textAnchor="middle" fontFamily="Poppins Black" fontSize={26} fill="#a06a08">B</text>
    </Part>
    <path d="M-18,-16 Q-8,-24 6,-24" stroke="#fff6c0" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

/** radial or horizontal speed lines */
export const SpeedLines: React.FC<{ x?: number; y?: number; n?: number; r0?: number; r1?: number; seed?: number; c?: string; w?: number; o?: number }> = ({ x = 540, y = 960, n = 26, r0 = 260, r1 = 1400, seed = 1, c = "#ffffff", w = 0.05, o = 0.85 }) => (
  <g opacity={o}>
    {Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rnd(i, seed) * 0.2;
      const a0 = r0 * (0.85 + rnd(i, seed + 1) * 0.5);
      return <path key={i} d={`M${x + Math.cos(a) * a0},${y + Math.sin(a) * a0} L${x + Math.cos(a + w) * r1},${y + Math.sin(a + w) * r1} L${x + Math.cos(a - w) * r1},${y + Math.sin(a - w) * r1}Z`} fill={c} />;
    })}
  </g>
);

export const HLines: React.FC<{ y0: number; y1: number; n?: number; seed?: number; c?: string; x0?: number; x1?: number; o?: number; sw?: number }> = ({ y0, y1, n = 10, seed = 1, c = "#ffffff", x0 = -40, x1 = W + 40, o = 0.8, sw = 6 }) => (
  <g opacity={o} stroke={c} strokeLinecap="round" strokeWidth={sw}>
    {Array.from({ length: n }, (_, i) => {
      const y = y0 + (y1 - y0) * (i + rnd(i, seed)) / n;
      const a = x0 + rnd(i, seed + 1) * (x1 - x0) * 0.5, b = a + 260 + rnd(i, seed + 2) * 520;
      return <path key={i} d={`M${a},${y} L${b},${y}`} />;
    })}
  </g>
);

/** expanding shock-wave rings */
export const Shock: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 1300 }) => (
  <g fill="none">
    {[0, 0.18, 0.36].map((d, i) => {
      const u = clamp((t - d) / (1 - d));
      if (u <= 0 || u >= 1) return null;
      return <circle key={i} cx={x} cy={y} r={u * r} stroke="#ffffff" strokeWidth={46 * (1 - u) + 4} opacity={0.9 * (1 - u)} />;
    })}
    {[0, 0.18, 0.36].map((d, i) => {
      const u = clamp((t - d) / (1 - d));
      if (u <= 0 || u >= 1) return null;
      return <circle key={`k${i}`} cx={x} cy={y} r={u * r + 26 * (1 - u)} stroke={INK} strokeWidth={5} opacity={0.8 * (1 - u)} />;
    })}
  </g>
);

export const QMark: React.FC<{ x: number; y: number; s?: number; t: number; rot?: number }> = ({ x, y, s = 1, t, rot = -10 }) => {
  const k = back(t, 3);
  if (t <= 0) return null;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot + (1 - clamp(t)) * 30}) scale(${s * k})`}>
      <text x={0} y={0} textAnchor="middle" fontFamily="Poppins Black" fontSize={190} fill="#ffd400" stroke={INK} strokeWidth={30} paintOrder="stroke" strokeLinejoin="round">?</text>
      {[-1, 0, 1].map((a) => <path key={a} d={`M${a * 90 + (a === 0 ? 0 : a * 20)},-250 l${a * 22},-${44 - Math.abs(a) * 10}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />)}
    </g>
  );
};

export const PopText: React.FC<{ x: number; y: number; text: string; size?: number; rot?: number; fill?: string; t?: number; sw?: number }> = ({ x, y, text, size = 120, rot = -8, fill = "#ffffff", t = 1, sw }) => {
  if (t <= 0) return null;
  const k = back(t, 2.4);
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`}>
      <text x={0} y={0} textAnchor="middle" fontFamily="Poppins Black" fontSize={size} fill={fill} stroke={INK} strokeWidth={sw ?? size * 0.2} paintOrder="stroke" strokeLinejoin="round">{text}</text>
    </g>
  );
};

export const SweatDrop: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0,-34 Q22,0 20,14 Q18,34 0,34 Q-18,34 -20,14 Q-22,0 0,-34Z" fill="#8fd8ff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M-8,4 Q-10,16 -2,22" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

/** a thumbs-up fist, thumb straight up */
export const ThumbUp: React.FC<{ x: number; y: number; s?: number; rot?: number; lw?: number }> = ({ x, y, s = 1, rot = 0, lw = 4 }) => {
  const sk = "#f6c9a0", sh = "#d9946a";
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
      <Part d={smooth([[-34, -20], [30, -24], [40, 0], [36, 30], [10, 42], [-30, 38], [-40, 8]])} fill={sk} shade={sh} lw={lw / s} />
      <Part d={smooth([[-14, -18], [-18, -70], [-4, -92], [12, -86], [14, -50], [20, -22]])} fill={sk} shade={sh} lw={lw / s} />
      <path d="M-30,2 Q0,10 34,0 M-30,18 Q0,26 32,16" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Spark: React.FC<{ x: number; y: number; r: number; c?: string }> = ({ x, y, r, c = "#ffffff" }) => (
  <path d={`M${x},${y - r} Q${x + r * 0.15},${y - r * 0.15} ${x + r},${y} Q${x + r * 0.15},${y + r * 0.15} ${x},${y + r} Q${x - r * 0.15},${y + r * 0.15} ${x - r},${y} Q${x - r * 0.15},${y - r * 0.15} ${x},${y - r}Z`} fill={c} stroke={INK} strokeWidth={2} />
);

/** a warm dim bokeh backdrop for the gaunt close-up */
export const WarmBokeh: React.FC<{ seed?: number }> = ({ seed = 3 }) => (
  <g>
    <rect width={W} height={H} fill="#3a2418" />
    {Array.from({ length: 22 }, (_, i) => (
      <circle key={i} cx={rnd(i, seed) * W} cy={rnd(i, seed + 1) * 1300} r={50 + rnd(i, seed + 2) * 110} fill={["#e8a040", "#c8582a", "#f2d27a", "#8a3a22"][i % 4]} opacity={0.22 + rnd(i, seed + 3) * 0.2} />
    ))}
  </g>
);

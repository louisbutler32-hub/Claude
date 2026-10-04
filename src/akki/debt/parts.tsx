import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { INK } from "../common";
import { Characters, circ, ell, fx, P, Part, poly, rnd, rrect, smooth, tube } from "../kit2";

/** shared bits for the debt short: camera, drawn-layer helper, set pieces, fx */

export const W = 1080;
export const H = 1920;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const sstep = (f: number, a: number, b: number) => { const t = clamp((f - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------------------------------- camera ---------------------------------- */

export type CamSpec = { z?: number; at?: P; rot?: number; shake?: number; f?: number };
/** keep the camera inside the 1080x1920 world so no black edge shows */
const fitAt = (z: number, rot: number, at: P): P => {
  const r = (Math.abs(rot) * Math.PI) / 180;
  const hw = (540 * Math.cos(r) + 960 * Math.sin(r)) / z, hh = (540 * Math.sin(r) + 960 * Math.cos(r)) / z;
  const cl = (v: number, h: number, size: number) => (h >= size / 2 ? size / 2 : Math.min(size - h, Math.max(h, v)));
  return [cl(at[0], hw, 1080), cl(at[1], hh, 1920)];
};
export const camXf = ({ z = 1, at: at0 = [540, 960], rot = 0, shake = 0, f = 0 }: CamSpec) => {
  const at = fitAt(z, rot, at0);
  const sx = shake * (rnd(f, 11) - 0.5) * 2, sy = shake * (rnd(f, 12) - 0.5) * 2;
  return `translate(${540 + sx}px, ${960 + sy}px) rotate(${rot}deg) scale(${z}) translate(${-at[0]}px, ${-at[1]}px)`;
};
export const Cam: React.FC<CamSpec & { children: React.ReactNode }> = ({ children, ...c }) => (
  <AbsoluteFill style={{ transform: camXf(c), transformOrigin: "0 0", width: W, height: H }}>{children}</AbsoluteFill>
);
/** world point -> screen point under a camera (for bubble tails that sit outside the camera) */
export const toScreen = (pt: P, { z = 1, at: at0 = [540, 960], rot = 0 }: CamSpec): P => {
  const at = fitAt(z, rot, at0);
  const r = (rot * Math.PI) / 180, dx = (pt[0] - at[0]) * z, dy = (pt[1] - at[1]) * z;
  return [540 + dx * Math.cos(r) - dy * Math.sin(r), 960 + dx * Math.sin(r) + dy * Math.cos(r)];
};
/** decaying kick after a hit frame */
export const kick = (f: number, hit: number, len = 8, amp = 12) => (f >= hit && f < hit + len ? amp * (1 - (f - hit) / len) : 0);

/** a character layer that reads the (possibly hand-drawn-frozen) frame itself */
export const Drawn: React.FC<{ children: (f: number) => React.ReactNode[] }> = ({ children }) => {
  const f = useCurrentFrame();
  return <Characters>{children(f)}</Characters>;
};

/* ---------------------------------- weather ---------------------------------- */

export const Rain: React.FC<{ f: number; n?: number; o?: number }> = ({ f, n = 70, o = 0.5 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
    {Array.from({ length: n }, (_, i) => {
      const x = rnd(i, 1) * (W + 300) - 100, sp = 70 + rnd(i, 2) * 50;
      const y = ((rnd(i, 3) * H + f * sp) % (H + 200)) - 100;
      return <path key={i} d={`M${x},${y} l-22,60`} stroke="#cfe6ff" strokeWidth={2 + rnd(i, 4) * 2} strokeLinecap="round" />;
    })}
  </svg>
);

export const LightningFlash: React.FC<{ k: number }> = ({ k }) => (k > 0 ? <AbsoluteFill style={{ background: "#e8f0ff", opacity: 0.5 * k, mixBlendMode: "screen" }} /> : null);

export const Bolt: React.FC<{ x: number; k: number }> = ({ x, k }) => {
  if (k <= 0) return null;
  const pts: P[] = [[x, 0], [x - 40, 160], [x + 20, 300], [x - 50, 470], [x + 10, 600], [x - 70, 780]];
  const d = "M" + pts.map(fx).join("L");
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <path d={d} stroke="#9fc4ff" strokeWidth={26} fill="none" opacity={0.5} strokeLinejoin="round" />
      <path d={d} stroke="#fff" strokeWidth={10} fill="none" strokeLinejoin="round" />
    </svg>
  );
};

/* ------------------------------ ship, rock, lighthouse ----------------------------- */

/** a wooden deck across the bottom of the frame, rail and mast; ground line ~y=1560 */
export const ShipDeck: React.FC<{ f: number; y?: number }> = ({ f, y = 1560 }) => {
  const sway = Math.sin(f * 0.3) * 6;
  return (
    <g transform={`translate(0,${sway * 0.6}) rotate(${sway * 0.12} 540 ${y})`}>
      {/* mast */}
      <Part d={rrect(840, 460, 60, y - 440, 10)} fill="#8b5a30" shade="#5a3818" lw={6} sh={[-8, 0]} />
      <path d={`M870,520 L700,${y - 160} M870,520 L1040,${y - 160}`} stroke={INK} strokeWidth={8} />
      <path d={`M870,520 L700,${y - 160} M870,520 L1040,${y - 160}`} stroke="#c9a974" strokeWidth={3.4} />
      {/* deck */}
      <Part d={poly([[-60, y], [1140, y - 30], [1160, H + 40], [-80, H + 40]])} fill="#a56a38" shade="#6e4220" lw={7} sh={[-14, -10]}>
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-60,${y + 40 + i * 70} L1140,${y + 10 + i * 78}`} stroke="#6e4220" strokeWidth={4} opacity={0.7} />)}
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${100 + i * 240},${y + 20} l-30,520`} stroke="#6e4220" strokeWidth={3} opacity={0.4} />)}
      </Part>
      {/* rail */}
      <Part d={rrect(-60, y - 60, 1220, 26, 10)} fill="#c58b4e" shade="#8a5628" lw={6} />
      {[40, 240, 440, 640, 840, 1040].map((px) => <Part key={px} d={rrect(px - 14, y - 36, 28, 40, 6)} fill="#b57a42" shade="#7a4a22" lw={5} />)}
      {/* lantern */}
      <g transform={`translate(110,${y - 230}) rotate(${Math.sin(f * 0.25) * 4} 0 -60)`}>
        <path d="M0,-60 L0,-30" stroke={INK} strokeWidth={5} />
        <Part d={rrect(-22, -30, 44, 60, 8)} fill="#ffe08a" shade="#e0a030" lw={5} />
        <Part d={poly([[-28, -30], [28, -30], [0, -52]])} fill="#3a3a44" lw={5} />
      </g>
    </g>
  );
};

export const Rock: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 620, h = 560 }) => (
  <g transform={`translate(${x},${y})`}>
    <Part d={smooth([[-w * 0.5, 40], [-w * 0.46, -h * 0.34], [-w * 0.22, -h * 0.78], [w * 0.06, -h * 0.84], [w * 0.28, -h * 0.6], [w * 0.5, -h * 0.5], [w * 0.62, 40]], true, 0.6)} fill="#6d7686" shade="#454d5c" lw={7} sh={[-18, -12]}>
      <path d={`M${-w * 0.1},${-h * 0.8} l-30,160 l40,90 M${w * 0.2},${-h * 0.5} l-20,150 M${-w * 0.3},${-h * 0.4} l40,120`} stroke="#3a4150" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${-w * 0.2},${-h * 0.7} Q${w * 0.05},${-h * 0.86} ${w * 0.22},${-h * 0.62}`} stroke="#aab3c4" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
    </Part>
  </g>
);

/** a striped harbour lighthouse with a dented lantern roof and a gull on top; feet at (x,y) */
export const Lighthouse: React.FC<{ x: number; y: number; s?: number; f?: number; gullLook?: boolean }> = ({ x, y, s = 1, f = 0, gullLook }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Part d={poly([[-120, 0], [-70, -760], [70, -760], [120, 0]])} fill="#f4efe6" shade="#cfc7b8" lw={7} sh={[-16, -4]}>
      {[0, 1, 2].map((i) => <path key={i} d={poly([[-110 + i * 6 - 10, -90 - i * 240], [110 - i * 6 + 10, -90 - i * 240], [100 - i * 8 + 10, -230 - i * 240], [-100 + i * 8 - 10, -230 - i * 240]])} fill="#d3303c" />)}
      <path d="M-30,-120 l0,-50 q30,-14 60,0 l0,50Z" fill="#3a2a22" stroke={INK} strokeWidth={5} />
    </Part>
    <Part d={rrect(-100, -790, 200, 40, 8)} fill="#2e3340" shade="#1a1d26" lw={6} />
    <Part d={rrect(-62, -900, 124, 110, 10)} fill="#ffe99a" shade="#f0b840" lw={6}>
      <path d="M-30,-880 l0,70 M0,-880 l0,70 M30,-880 l0,70" stroke={INK} strokeWidth={4} />
    </Part>
    <Part d={poly([[-84, -900], [84, -900], [0, -1010]])} fill="#d3303c" shade="#9a1e28" lw={6} />
    <path d="M-10,-1000 l40,16" stroke={INK} strokeWidth={5} />
    {/* the gull */}
    <g transform={`translate(70,${-1018 + Math.sin(f * 0.4) * 2})`}>
      <Part d={ell([0, 0], 30, 20)} fill="#fff" shade="#c9d0dc" lw={4} />
      <Part d={circ([-24, -16], 13)} fill="#fff" shade="#c9d0dc" lw={4} />
      <path d={`M${gullLook ? -42 : -36},-14 l-18,${gullLook ? 4 : 2} l18,6Z`} fill="#f2a52a" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={gullLook ? -28 : -26} cy={-19} r={3.4} fill={INK} />
      <path d="M26,0 l24,-8 l-6,16Z" fill="#cfd5e0" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </g>
  </g>
);

/** a wooden market stall front: the counter the Boss stands behind */
export const StallCounter: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 560 }) => (
  <g transform={`translate(${x},${y})`}>
    <Part d={poly([[-w / 2, -150], [w / 2, -150], [w / 2 + 16, 20], [-w / 2 - 16, 20]])} fill="#b97a3c" shade="#7e4e22" lw={7} sh={[-12, -10]}>
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${-w / 2 + 60 + i * (w - 120) / 4},-146 L${-w / 2 + 60 + i * (w - 120) / 4},16`} stroke="#7e4e22" strokeWidth={4} opacity={0.6} />)}
    </Part>
    <Part d={rrect(-w / 2 - 22, -176, w + 44, 36, 10)} fill="#d79a54" shade="#9a6630" lw={7} />
    {/* a crate of fruit */}
    <Part d={rrect(w / 2 - 190, -250, 150, 76, 6)} fill="#a5703a" shade="#6e4620" lw={6} />
    {[0, 1, 2].map((i) => <g key={i}><circle cx={w / 2 - 160 + i * 44} cy={-262} r={24} fill={["#e0452e", "#f2b02a", "#7ac043"][i]} stroke={INK} strokeWidth={5} /><path d={`M${w / 2 - 160 + i * 44},-286 l6,-12`} stroke={INK} strokeWidth={4} strokeLinecap="round" /></g>)}
  </g>
);

/* ----------------------------------- fx ------------------------------------ */

export const Droplets: React.FC<{ x: number; y: number; t: number; n?: number; r?: number; seed?: number }> = ({ x, y, t, n = 14, r = 420, seed = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a = (-0.15 - rnd(i, seed) * 0.7) * Math.PI;
      const v = r * (0.4 + rnd(i, seed + 1) * 0.6);
      const px = x + Math.cos(a) * v * t * (i % 2 ? 1 : -1) * 0.9, py = y + Math.sin(a) * v * t + 520 * t * t;
      return <circle key={i} cx={px} cy={py} r={(10 + rnd(i, seed + 2) * 22) * (1 - t * 0.5)} fill="#eaf8ff" stroke={INK} strokeWidth={5} opacity={clamp(1.6 - t * 1.4)} />;
    })}
  </g>
);

export const SlashArc: React.FC<{ a: P; b: P; bend: number; k: number; w?: number }> = ({ a, b, bend, k, w = 54 }) => {
  if (k <= 0) return null;
  const mid: P = [(a[0] + b[0]) / 2 + bend * 0.5, (a[1] + b[1]) / 2 + bend];
  const d = `M${a[0]},${a[1]} Q${mid[0]},${mid[1]} ${b[0]},${b[1]}`;
  return (
    <g>
      <path d={d} pathLength={1} stroke={INK} strokeWidth={w + 16} strokeLinecap="round" fill="none" strokeDasharray={`${clamp(k)} 1`} />
      <path d={d} pathLength={1} stroke="#fff" strokeWidth={w} strokeLinecap="round" fill="none" strokeDasharray={`${clamp(k)} 1`} />
    </g>
  );
};

/** water rings + a splash where a foot lands */
export const Ripple: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 90 }) => (
  <g opacity={clamp(1.2 - t)}>
    <ellipse cx={x} cy={y} rx={r * (0.3 + t)} ry={r * (0.3 + t) * 0.28} fill="none" stroke="#fff" strokeWidth={6} />
    <ellipse cx={x} cy={y} rx={r * (0.15 + t * 0.6)} ry={r * (0.15 + t * 0.6) * 0.28} fill="none" stroke="#dff2ff" strokeWidth={4} />
    {[-1, 0, 1].map((k) => <path key={k} d={`M${x + k * 26 * (0.5 + t)},${y} q${k * 8},${-50 * (1 - t * 0.6)} ${k * 14},${-70 * (1 - t * 0.4)}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" fill="none" />)}
  </g>
);

export const DustPuff: React.FC<{ x: number; y: number; t: number; dir?: 1 | -1; r?: number }> = ({ x, y, t, dir = 1, r = 34 }) => (
  <g opacity={clamp(1.1 - t)}>
    {[0, 1, 2].map((i) => <circle key={i} cx={x - dir * (20 + i * 26 + t * 90)} cy={y - 14 - i * 8 - t * 30} r={r * (0.5 + i * 0.25 + t * 0.4)} fill="#ece6d8" stroke={INK} strokeWidth={4} />)}
  </g>
);

/** speed streaks over the frame (screen space) */
export const SpeedLines: React.FC<{ f: number; n?: number; o?: number; dir?: 1 | -1; color?: string }> = ({ f, n = 14, o = 0.5, dir = 1, color = "#fff" }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
    {Array.from({ length: n }, (_, i) => {
      const y = rnd(i, 5 + (f % 3)) * H, len = 260 + rnd(i, 6) * 520;
      const x = ((rnd(i, 7 + (f % 2)) * (W + 600) + f * 220 * dir) % (W + 600)) - 300;
      return <rect key={i} x={x} y={y} width={len} height={5 + rnd(i, 8) * 8} rx={4} fill={color} />;
    })}
  </svg>
);

export const SweatDrop: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x},${y}) scale(${s})`} d="M0,-26 q-18,26 0,40 q18,-14 0,-40Z" fill="#8fd4ff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
);

/* -------------------------------- the debt props ------------------------------- */

export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** a pouch of coins, tagged G; anchor bottom-centre */
export const GPouch: React.FC<{ x: number; y: number; s?: number; rot?: number; lw?: number }> = ({ x, y, s = 1, rot = 0, lw = 5 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d={smooth([[-60, -40], [-50, -110], [-20, -130], [20, -130], [50, -110], [60, -40], [40, 0], [-40, 0]], true, 0.8)} fill="#c9a060" shade="#8e6a30" lw={lw} sh={[-8, -6]}>
      <path d="M-50,-110 L50,-110" stroke="#5a3a14" strokeWidth={8} />
      <path d="M-30,-128 q-10,-16 -2,-30 M30,-128 q10,-16 2,-30" stroke="#8e6a30" strokeWidth={10} strokeLinecap="round" fill="none" />
    </Part>
    <text x={0} y={-48} textAnchor="middle" fontFamily="Poppins Black" fontSize={50} fill="#3a2a10">G</text>
  </g>
);

export const Coin: React.FC<{ x: number; y: number; r?: number; sq?: number; rot?: number }> = ({ x, y, r = 22, sq = 1, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <ellipse cx={0} cy={0} rx={r} ry={r * sq} fill="#f6c51c" stroke={INK} strokeWidth={4} />
    <ellipse cx={0} cy={0} rx={r * 0.66} ry={r * sq * 0.66} fill="none" stroke="#b98408" strokeWidth={2.4} />
    {sq > 0.5 && <text x={0} y={r * 0.32} textAnchor="middle" fontFamily="Poppins Black" fontSize={r * 0.95} fill="#9a640a">G</text>}
  </g>
);

/** a long ribbon of paper streaming from `from` along a wavy path (frame space) */
export const PaperStream: React.FC<{ from: P; t: number; len?: number; dir?: 1 | -1; w?: number; wave?: number; sag?: number }> = ({ from, t, len = 520, dir = -1, w = 26, wave = 1, sag = 40 }) => {
  const n = 10;
  const pts: P[] = Array.from({ length: n }, (_, i): P => {
    const u = i / (n - 1);
    return [from[0] + dir * u * len, from[1] + Math.sin(t * 0.9 + i * 0.9) * (14 + i * 4) * wave + u * sag];
  });
  return (
    <g>
      <path d={tube(pts, pts.map((_, i) => w * (0.9 + 0.1 * Math.sin(i + t))))} fill="#fffdf0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {pts.slice(1, -1).map((p, i) => <path key={i} d={`M${p[0]},${p[1] - w * 0.55} v${w * 1.1}`} stroke="#b8b8c0" strokeWidth={3} />)}
    </g>
  );
};

/** a ground slab across the bottom of the frame: dock planks or market cobbles */
export const Quay: React.FC<{ y: number; kind?: "dock" | "street" | "sand"; o?: number }> = ({ y, kind = "dock", o = 1 }) => {
  const base = kind === "dock" ? "#6b5a4a" : kind === "street" ? "#7c7468" : "#c9a96a";
  const dark = kind === "dock" ? "#463a2e" : kind === "street" ? "#544d44" : "#9a7c44";
  return (
    <g opacity={o}>
      <Part d={poly([[-80, y], [W + 80, y - 16], [W + 80, H + 60], [-80, H + 60]])} fill={base} shade={dark} lw={6} sh={[-10, -14]}>
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-80,${y + 30 + i * 52 + i * i * 4} L${W + 80},${y + 14 + i * 56 + i * i * 4}`} stroke={dark} strokeWidth={4} opacity={0.6} />)}
        {kind === "dock" && Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${i * 140 - 40},${y + 30} l${(i - 4) * 40},520`} stroke={dark} strokeWidth={3} opacity={0.35} />)}
      </Part>
    </g>
  );
};

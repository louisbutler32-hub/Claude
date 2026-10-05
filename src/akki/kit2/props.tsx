import React from "react";
import { INK } from "../common";
import { circ, ell, fx, P, Part, rnd, rrect, smooth } from "./draw";

/**
 * Props, drawn in the same flat-cel language. All are SVG nodes placed at
 * (x,y) — the anchor is the bottom-centre for things that sit on surfaces
 * and the grip point for things that are held.
 */

const money = (n: number) => n.toLocaleString("en-US");

/** the debt receipt: a long paper strip with the counter. `unroll` 0..1 extends the tail; anchor top-centre */
export const Receipt: React.FC<{ x: number; y: number; value: number; s?: number; rot?: number; unroll?: number; w?: number; label?: string; lw?: number }> = ({ x, y, value, s = 1, rot = 0, unroll = 1, w = 220, label = "ZORO — DEBT", lw = 4 }) => {
  const h = 160 + 420 * unroll;
  const zig = Array.from({ length: Math.floor(w / 18) + 1 }, (_, i) => `L${-w / 2 + i * 18},${h + (i % 2 ? 0 : -10)}`).join("");
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
      <Part d={`M${-w / 2},0 L${w / 2},0 L${w / 2},${h} ${zig} Z`} fill="#fbf8ee" shade="#d8d2c2" lw={lw} sh={[-6, -4]}>
        <path d={`M${-w / 2 + 16},40 L${w / 2 - 16},40 M${-w / 2 + 16},${h - 60} L${w / 2 - 16},${h - 60}`} stroke="#b8b2a2" strokeWidth={2} strokeDasharray="6 5" />
        {Array.from({ length: Math.max(0, Math.floor((h - 180) / 34)) }, (_, i) => <path key={i} d={`M${-w / 2 + 20},${120 + i * 34} L${w / 2 - 60},${120 + i * 34}`} stroke="#cdc7b6" strokeWidth={3} />)}
      </Part>
      <text x={0} y={30} textAnchor="middle" fontFamily="Poppins Black" fontSize={20} fill="#3a3a44">{label}</text>
      <text x={0} y={80} textAnchor="middle" fontFamily="Poppins Black" fontSize={w * 0.14} fill="#c81e2a">{money(value)} ฿</text>
      <path d={`M${-w / 2 + 30},${h - 36} l20,-14 l14,20 l30,-30 l20,16`} stroke="#c81e2a" strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** a pocket calculator; anchor centre; `display` is the text */
export const Calculator: React.FC<{ x: number; y: number; s?: number; rot?: number; display?: string; lw?: number }> = ({ x, y, s = 1, rot = 0, display = "405,000,000", lw = 4 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d={rrect(-60, -100, 120, 200, 14)} fill="#dfe3ea" shade="#a9b0bf" lw={lw} />
    <Part d={rrect(-48, -86, 96, 40, 6)} fill="#b9d9a8" shade="#8fb47e" lw={lw * 0.7} />
    <text x={42} y={-58} textAnchor="end" fontFamily="Poppins Black" fontSize={display.length > 9 ? 13 : 18} fill="#1f3a1a">{display}</text>
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-48 + (i % 3) * 34} y={-30 + Math.floor(i / 3) * 30} width={26} height={22} rx={5} fill={i === 11 ? "#f08a2a" : "#f7f7f5"} stroke={INK} strokeWidth={2} />)}
    <rect x={18} y={-30} width={26} height={52} rx={5} fill="#3a6fc4" stroke={INK} strokeWidth={2} transform="translate(36,0)" opacity={0} />
  </g>
);

/** a sealed wooden crate; anchor bottom-centre; `label` on the front */
export const Crate: React.FC<{ x: number; y: number; w?: number; h?: number; s?: number; rot?: number; label?: string; lw?: number; open?: boolean }> = ({ x, y, w = 260, h = 220, s = 1, rot = 0, label = "FRAGILE", lw = 5, open }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d={`M${-w / 2},${-h} L${w / 2},${-h} L${w / 2},0 L${-w / 2},0Z`} fill="#c58a4a" shade="#8e5a2a" lw={lw} sh={[-8, -6]}>
      {[0.33, 0.66].map((t) => <path key={t} d={`M${-w / 2},${-h * t} L${w / 2},${-h * t}`} stroke="#8e5a2a" strokeWidth={3} />)}
      <path d={`M${-w / 2 + 14},${-h + 14} L${w / 2 - 14},${-14} M${w / 2 - 14},${-h + 14} L${-w / 2 + 14},${-14}`} stroke="#8e5a2a" strokeWidth={5} opacity={0.6} />
    </Part>
    <g transform={open ? `rotate(-40 ${-w / 2 - 8} ${-h})` : undefined}><Part d={`M${-w / 2 - 8},${-h - 24} L${w / 2 + 8},${-h - 24} L${w / 2 + 8},${-h} L${-w / 2 - 8},${-h}Z`} fill="#d19a58" shade="#8e5a2a" lw={lw} /></g>
    <Part d={rrect(-w * 0.3, -h * 0.62, w * 0.6, h * 0.26, 6)} fill="#f8f4e6" shade="#cfc9b8" lw={lw * 0.7} />
    <text x={0} y={-h * 0.44} textAnchor="middle" fontFamily="Poppins Black" fontSize={w * 0.1} fill="#c81e2a">{label}</text>
    {[-1, 1].map((sd) => <circle key={sd} cx={sd * (w / 2 - 20)} cy={-h / 2} r={6} fill="#5a4a3a" stroke={INK} strokeWidth={2} />)}
  </g>
);

/** a wanted poster; anchor top-centre; render the portrait as children (in a 200×200 box at 0,0) */
export const WantedPoster: React.FC<{ x: number; y: number; s?: number; rot?: number; name: string; bounty: string; lw?: number; children?: React.ReactNode; pen?: boolean }> = ({ x, y, s = 1, rot = 0, name, bounty, lw = 4, children, pen }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d={smooth([[-150, 0], [150, 0], [154, 200], [148, 400], [-152, 404], [-148, 200]], true, 0.3)} fill="#f0dfb0" shade="#c9b27a" lw={lw} sh={[-6, -4]}>
      <path d="M-140,10 L140,10 L140,394 L-140,394Z" fill="none" stroke="#8a6a30" strokeWidth={3} />
    </Part>
    <text x={0} y={60} textAnchor="middle" fontFamily="Poppins Black" fontSize={52} fill="#3a2a10">WANTED</text>
    <rect x={-100} y={80} width={200} height={200} fill="#e7d39e" stroke="#8a6a30" strokeWidth={3} />
    <g transform="translate(-100,80)"><svg x={0} y={0} width={200} height={200} viewBox="0 0 200 200" overflow="hidden">{children}</svg></g>
    <text x={0} y={320} textAnchor="middle" fontFamily="Poppins Black" fontSize={34} fill="#3a2a10">{name}</text>
    <text x={0} y={370} textAnchor="middle" fontFamily="Poppins Black" fontSize={30} fill="#3a2a10">{bounty}</text>
    {pen && <path d="M60,360 l40,-40 l12,12 l-40,40 l-18,6Z" fill="#2a4aa0" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />}
  </g>
);

/** treasure chest, anchor bottom-centre; `open` 0..1 lifts the lid, gold shows when open */
export const TreasureChest: React.FC<{ x: number; y: number; s?: number; open?: number; lw?: number; rot?: number }> = ({ x, y, s = 1, open = 0, lw = 5, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d="M-150,-130 L150,-130 L150,0 L-150,0Z" fill="#8a4a24" shade="#5a2e14" lw={lw} sh={[-8, -6]}>
      <path d="M-100,-130 L-100,0 M100,-130 L100,0" stroke="#d8b040" strokeWidth={12} />
    </Part>
    {open > 0.15 && (
      <g>
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={-120 + (i % 8) * 34 + rnd(i, 1) * 10} cy={-140 - Math.floor(i / 8) * 22 - rnd(i, 2) * 16 * open} r={16} fill="#f6c51c" stroke={INK} strokeWidth={2.5} />)}
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-100 + i * 40},${-180 - rnd(i, 3) * 30 * open} l0,-18 M${-110 + i * 40},${-189 - rnd(i, 3) * 30 * open} l20,0`} stroke="#fff6a0" strokeWidth={4} strokeLinecap="round" />)}
      </g>
    )}
    <g transform={`rotate(${-110 * open} -150 -130)`}>
      <Part d="M-150,-130 Q-150,-220 0,-220 Q150,-220 150,-130Z" fill="#9c5a2e" shade="#5a2e14" lw={lw} sh={[-8, -6]}>
        <path d="M-100,-134 Q-100,-212 -90,-214 M100,-134 Q100,-212 90,-214" stroke="#d8b040" strokeWidth={12} fill="none" />
      </Part>
      <Part d={rrect(-26, -150, 52, 40, 8)} fill="#d8b040" shade="#9a7a20" lw={lw * 0.8} />
    </g>
  </g>
);

/** a berry pouch with a ฿ tag; anchor bottom-centre */
export const Pouch: React.FC<{ x: number; y: number; s?: number; rot?: number; lw?: number; tag?: boolean }> = ({ x, y, s = 1, rot = 0, lw = 5, tag = true }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d={smooth([[-60, -40], [-50, -110], [-20, -130], [20, -130], [50, -110], [60, -40], [40, 0], [-40, 0]], true, 0.8)} fill="#c9a060" shade="#8e6a30" lw={lw} sh={[-8, -6]}>
      <path d="M-50,-110 L50,-110" stroke="#5a3a14" strokeWidth={8} />
      <path d="M-30,-128 q-10,-16 -2,-30 M30,-128 q10,-16 2,-30" stroke="#8e6a30" strokeWidth={10} strokeLinecap="round" fill="none" />
    </Part>
    {tag && <text x={0} y={-50} textAnchor="middle" fontFamily="Poppins Black" fontSize={46} fill="#3a2a10">฿</text>}
  </g>
);

/** a scatter of gold coins around (x,y) */
export const Coins: React.FC<{ x: number; y: number; n?: number; r?: number; spread?: number; seed?: number; lw?: number }> = ({ x, y, n = 8, r = 18, spread = 120, seed = 4, lw = 3 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const cx = x + (rnd(i, seed) - 0.5) * spread * 2, cy = y - rnd(i, seed + 1) * spread * 0.4;
      return <g key={i}><ellipse cx={cx} cy={cy} rx={r} ry={r * (0.5 + rnd(i, seed + 2) * 0.5)} fill="#f6c51c" stroke={INK} strokeWidth={lw} /><text x={cx} y={cy + r * 0.3} textAnchor="middle" fontFamily="Poppins Black" fontSize={r} fill="#a07010">฿</text></g>;
    })}
  </g>
);

/** a big tiered cake; anchor bottom-centre; `eaten` 0..1 takes bites out */
export const Cake: React.FC<{ x: number; y: number; s?: number; eaten?: number; lw?: number; candle?: boolean }> = ({ x, y, s = 1, eaten = 0, lw = 5, candle = true }) => {
  const tiers: [number, number][] = [[150, 90], [110, 80], [70, 70]];
  let yy = 0;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {tiers.map(([w, h], i) => {
        const top = yy - h; const el = <g key={i}>
          <Part d={`M${-w},${top} L${w},${top} L${w},${yy} L${-w},${yy}Z`} fill="#f7c7d8" shade="#d88aa6" lw={lw} sh={[-8, -4]}>
            {Array.from({ length: Math.floor(w / 26) }, (_, j) => <circle key={j} cx={-w + 26 + j * 26} cy={top + 18} r={12} fill="#ffffff" />)}
            <path d={`M${-w},${top + 6} L${w},${top + 6}`} stroke="#ffffff" strokeWidth={12} />
          </Part>
          {eaten > 0 && <Part d={smooth([[w * (1 - eaten), top - 4], [w + 6, top - 4], [w + 6, yy + 4], [w * (1 - eaten) + 10, yy + 4], [w * (1 - eaten) - 10, (top + yy) / 2]], true, 0.6)} fill="#efe2b0" shade="#c9b88a" lw={lw * 0.7} />}
        </g>; yy = top; return el;
      })}
      {candle && <g transform={`translate(0,${yy})`}><rect x={-8} y={-50} width={16} height={50} fill="#4fa0e0" stroke={INK} strokeWidth={3} /><path d="M0,-50 q-14,-26 0,-46 q14,20 0,46Z" fill="#ffb020" stroke={INK} strokeWidth={2.5} /></g>}
    </g>
  );
};

/** the sunset timer: a sand-clock on a wall board with a sun arc; `t` 0 = dawn, 1 = sunset; anchor centre */
export const SunTimer: React.FC<{ x: number; y: number; s?: number; t: number; lw?: number }> = ({ x, y, s = 1, t, lw = 5 }) => {
  const a = Math.PI * (1 - t);
  const sx = Math.cos(a) * 150, sy = -Math.sin(a) * 110 - 10;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Part d={rrect(-210, -180, 420, 300, 18)} fill="#f3e6c6" shade="#c9b58a" lw={lw} sh={[-8, -6]} />
      <path d="M-170,0 A170,130 0 0 1 170,0" stroke="#8a6a30" strokeWidth={4} strokeDasharray="10 10" fill="none" />
      <path d="M-190,0 L190,0" stroke="#3a6fc4" strokeWidth={8} />
      <circle cx={sx} cy={sy} r={30} fill={t > 0.75 ? "#ff7a2a" : "#ffd23a"} stroke={INK} strokeWidth={4} />
      {Array.from({ length: 8 }, (_, i) => { const r = (i / 8) * Math.PI * 2; return <path key={i} d={`M${sx + Math.cos(r) * 38},${sy + Math.sin(r) * 38} L${sx + Math.cos(r) * 50},${sy + Math.sin(r) * 50}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />; })}
      {/* sand clock */}
      <Part d={["M-60,20 L60,20 L10,70 L60,110 L-60,110 L-10,70Z"]} fill="#dff3ff" shade="#a9d2ea" lw={lw * 0.8}>
        <path d={`M-60,20 L60,20 L${50 - 40 * t},${20 + 45 * (1 - t)} L${-50 + 40 * t},${20 + 45 * (1 - t)}Z`} fill="#f2c45a" transform={`translate(0,${0})`} opacity={t < 1 ? 1 : 0} />
        <path d={`M${-60 * t},110 L${60 * t},110 L${10 * t},${110 - 40 * t} L${-10 * t},${110 - 40 * t}Z`} fill="#f2c45a" />
        <path d="M0,70 L0,110" stroke="#f2c45a" strokeWidth={3} />
      </Part>
      <rect x={-70} y={10} width={140} height={12} fill="#8a4a24" stroke={INK} strokeWidth={3} />
      <rect x={-70} y={108} width={140} height={12} fill="#8a4a24" stroke={INK} strokeWidth={3} />
      <text x={0} y={-130} textAnchor="middle" fontFamily="Poppins Black" fontSize={30} fill="#3a2a10">DEADLINE: SUNSET</text>
    </g>
  );
};

/** a pint glass, anchor bottom-centre */
export const Beer: React.FC<{ x: number; y: number; s?: number; lw?: number }> = ({ x, y, s = 1, lw = 4 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Part d="M-30,-120 L30,-120 L24,0 L-24,0Z" fill="#f2b33a" shade="#c98a1a" lw={lw} />
    <Part d={smooth([[-32, -120], [-20, -140], [0, -134], [20, -142], [32, -120]], true, 0.6)} fill="#fff8e6" shade="#e0d6bc" lw={lw * 0.8} />
  </g>
);

/** a small helper: a flat circle marker for debugging anchor points */
export const Dot: React.FC<{ p: P; c?: string }> = ({ p, c = "#f0f" }) => <path d={circ(p, 6)} fill={c} />;
export const _unused = { ell, fx };

import React, { useId } from "react";
import { INK } from "../common";
import { add, circ, ell, fx, mix, mul, nrm, P, Part, perp, poly, rnd, rrect, smooth, sub, tube } from "../kit2";

/**
 * Kit 3 props — Ronan's cleaver + scarf + bells, Mira's abacus / clipboard /
 * quill, Pip's fork, Frost's mug, Gleam's pendant, the harbour badge, and
 * three small power effects. All SVG nodes in body or frame space.
 */

const BR = { b: "#e5b040", s: "#a8761c" };

/* ------------------------------------ Scarf ----------------------------------- */

/** ribbon centre-line points (exported so a costume can reuse the same curve) */
export const scarfPoints = (from: P, to: P, t: number, wind: number, sag: number, n = 9): P[] => {
  const pts: P[] = [];
  const nv = perp(from, to);
  const L = Math.hypot(to[0] - from[0], to[1] - from[1]);
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const base = mix(from, to, u);
    const wave = wind * 0.07 * L * u * Math.sin(t * 7 - u * 5.2) + wind * 0.02 * L * u * Math.sin(t * 13 - u * 9);
    pts.push(add(add(base, mul(nv, wave)), [0, sag * 4 * u * (1 - u)]));
  }
  return pts;
};

/** a long crimson scarf tail: `t` seconds drives the flutter, `wind` its strength, `sag` a droop when held taut-ish */
export const Scarf: React.FC<{
  from: P; to?: P; dir?: -1 | 1; len?: number; t?: number; wind?: number; sag?: number; w?: number; lw?: number;
  c?: string; cs?: string; stripe?: string; ink?: string; fringe?: boolean;
}> = ({ from, to, dir = -1, len = 380, t = 0, wind = 1, sag = 0, w = 24, lw = 4.5, c = "#c8203a", cs = "#8e1226", stripe = "#f4d9a0", ink = INK, fringe = true }) => {
  const end: P = to ?? [from[0] + dir * len, from[1] + len * 0.1];
  const pts = scarfPoints(from, end, t, wind, sag);
  const ws = pts.map((_, i) => w * (1 - 0.18 * (i / (pts.length - 1))) + (i === pts.length - 1 ? 0 : 0));
  const stripes = [0.62, 0.7].map((u, k) => {
    const i = Math.floor(u * (pts.length - 1));
    const a = pts[i], b = pts[Math.min(pts.length - 1, i + 1)];
    const nv = perp(a, b);
    return <path key={k} d={`M${fx(add(a, mul(nv, 60)))}L${fx(sub(a, mul(nv, 60)))}`} stroke={k ? stripe : cs} strokeWidth={k ? 5 : 9} />;
  });
  const last = pts[pts.length - 1], prev = pts[pts.length - 2];
  const dirv = nrm(sub(last, prev));
  return (
    <g>
      {fringe && [-1, -0.5, 0, 0.5, 1].map((k, i) => {
        const nv: P = [-dirv[1], dirv[0]];
        const base = add(last, mul(nv, k * ws[ws.length - 1] * 0.8));
        return <path key={i} d={`M${fx(base)}L${fx(add(base, add(mul(dirv, 24 + 4 * (i % 2)), mul(nv, k * 3))))}`} stroke={ink} strokeWidth={lw * 1.9} strokeLinecap="round" />;
      })}
      {fringe && [-1, -0.5, 0, 0.5, 1].map((k, i) => {
        const nv: P = [-dirv[1], dirv[0]];
        const base = add(last, mul(nv, k * ws[ws.length - 1] * 0.8));
        return <path key={"f" + i} d={`M${fx(base)}L${fx(add(base, add(mul(dirv, 24 + 4 * (i % 2)), mul(nv, k * 3))))}`} stroke={c} strokeWidth={lw * 0.8} strokeLinecap="round" />;
      })}
      <Part d={tube(pts, ws)} fill={c} shade={cs} lw={lw} ink={ink} sh={[-3, -7]}>{stripes}</Part>
    </g>
  );
};

/* ------------------------------------ Bells ----------------------------------- */

const bellPath = "M-13,40 L-13,30 Q-13,13 0,11 Q13,13 13,30 L13,40Z";
/** three small brass bells hanging off a cord from (x,y); they swing with `t` (seconds) and `amp` degrees */
export const Bells: React.FC<{ x: number; y: number; t?: number; n?: number; amp?: number; spacing?: number; lw?: number; s?: number }> = ({ x, y, t = 0, n = 3, amp = 14, spacing = 34, lw = 3, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {Array.from({ length: n }, (_, i) => {
      const a = amp * Math.sin(t * 9 + i * 1.7) * (0.7 + 0.3 * rnd(i, 3));
      const px = (i - (n - 1) / 2) * spacing, drop = 10 + (i % 2) * 14;
      return (
        <g key={i} transform={`translate(${px},${drop}) rotate(${a})`}>
          <path d="M0,-drop L0,12" stroke={INK} strokeWidth={lw * 1.8} fill="none" />
          <path d="M0,0 L0,14" stroke="#c9a974" strokeWidth={lw} />
          <Part d={[bellPath, rrect(-16, 37, 32, 8, 3)]} fill={BR.b} shade={BR.s} lw={lw} sh={[-4, -3]} />
          <path d="M0,33 L0,45" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={0} cy={50} r={4.4} fill={BR.b} stroke={INK} strokeWidth={2} />
          <path d="M-7,24 q0,-8 6,-9" stroke="#fff3c4" strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      );
    })}
  </g>
);

/* ------------------------------ Ronan's cleaver ------------------------------- */

/**
 * The cleaver-sword in local space: guard at the origin, grip behind it (-x),
 * blade/scabbard ahead (+x), ~500 units overall. `mode`: drawn blade, sheathed
 * (grip + scabbard) or just the empty scabbard.
 */
export const RonanSword: React.FC<{ x?: number; y?: number; rot?: number; s?: number; mode?: "drawn" | "sheathed" | "scabbard"; lw?: number; drawn?: boolean; flipX?: boolean; grey?: boolean }> = ({ x = 0, y = 0, rot = 0, s = 1, mode, drawn, lw = 4.5, flipX, grey }) => {
  const m = mode ?? (drawn ? "drawn" : "sheathed");
  const gk = (h: string) => h;
  const blade = smooth([[0, -36], [330, -36], [376, -22], [378, 4], [346, 30], [270, 40], [120, 42], [0, 38]], true, 0.28);
  const scab = smooth([[4, -44], [318, -44], [356, -30], [358, 30], [318, 44], [4, 46]], true, 0.2);
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flipX ? -s : s},${s})`}>
      {/* grip, wrapped in crimson cord */}
      {m !== "scabbard" && (
        <>
          <Part d={rrect(-122, -13, 118, 26, 8)} fill={gk("#6b3f22")} shade="#44250f" lw={lw}>
            {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-112 + i * 14},-16 l9,32`} stroke="#c8203a" strokeWidth={6} />)}
          </Part>
          <Part d={ell([-132, 0], 16, 20)} fill={BR.b} shade={BR.s} lw={lw} />
          <circle cx={-132} cy={0} r={6} fill="#2a1e14" />
          <Part d={rrect(-6, -50, 18, 100, 6)} fill={BR.b} shade={BR.s} lw={lw} />
        </>
      )}
      {m === "drawn" ? (
        <>
          <Part d={blade} fill="#b9c5d3" shade="#7d8a9e" lw={lw} sh={[-5, -9]}>
            {/* bevel along the cutting edge */}
            <path d="M0,24 L340,18 L360,6 L346,30 L270,40 L120,42 L0,38Z" fill="#eef3f8" opacity={0.95} />
            {/* fuller */}
            <path d="M22,-14 L300,-14" stroke="#7d8a9e" strokeWidth={5} strokeLinecap="round" />
            {/* three chop holes */}
            {[96, 170, 244].map((hx) => <ellipse key={hx} cx={hx} cy={2} rx={11} ry={11} fill="#262a35" stroke={INK} strokeWidth={3} />)}
            {/* notched spine */}
            {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${40 + i * 40},-36 l8,10`} stroke="#7d8a9e" strokeWidth={4} />)}
          </Part>
          <Part d={rrect(8, -42, 346, 14, 5)} fill={BR.b} shade={BR.s} lw={lw * 0.8} />
          <path d="M120,-6 q60,-4 150,-4" stroke="#fff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.8} />
        </>
      ) : (
        <>
          <Part d={scab} fill="#3a2a3a" shade="#1f1522" lw={lw} sh={[-5, -9]}>
            <path d="M20,-26 L330,-26" stroke="#5a455a" strokeWidth={5} strokeLinecap="round" />
          </Part>
          <Part d={rrect(52, -50, 22, 106, 6)} fill={BR.b} shade={BR.s} lw={lw * 0.9} />
          <Part d={rrect(180, -50, 22, 106, 6)} fill={BR.b} shade={BR.s} lw={lw * 0.9} />
          <Part d={smooth([[318, -48], [356, -34], [362, 0], [356, 34], [318, 48], [300, 0]], true, 0.3)} fill={BR.b} shade={BR.s} lw={lw} />
          {/* crimson tassel */}
          <path d="M190,50 q-8,40 -2,70" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M190,50 q-8,40 -2,70" stroke="#c8203a" strokeWidth={5} fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  );
};

/* ------------------------------ Mira's kit ------------------------------------ */

/** a brass abacus, long and narrow, three rods of coloured beads — worn as a bandolier it is rotated onto the strap */
export const Abacus: React.FC<{ x?: number; y?: number; rot?: number; w?: number; h?: number; s?: number; lw?: number; split?: number[]; frameC?: string }> = ({ x = 0, y = 0, rot = 0, w = 250, h = 66, s = 1, lw = 3.4, split = [3, 6, 4], frameC }) => {
  const rows = 3, n = 9, r = h / 8;
  const cols = ["#d9482f", "#f2c230", "#2aa79f"];
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
      <Part d={rrect(-w / 2, -h / 2, w, h, 9)} fill={frameC ?? BR.b} shade={BR.s} lw={lw} sh={[-3, -4]} />
      <path d={rrect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 4)} fill="#2a1a14" stroke="none" />
      {Array.from({ length: rows }, (_, ri) => {
        const ry = -h / 2 + 8 + ((h - 16) / rows) * (ri + 0.5);
        return (
          <g key={ri}>
            <path d={`M${-w / 2 + 8},${ry} L${w / 2 - 8},${ry}`} stroke="#c9a974" strokeWidth={2.4} />
            {Array.from({ length: n }, (_, bi) => {
              const left = bi < split[ri];
              const bx = left ? -w / 2 + 14 + r + bi * (r * 2 - 0.5) : w / 2 - 14 - r - (n - 1 - bi) * (r * 2 - 0.5);
              return <g key={bi}><ellipse cx={bx} cy={ry} rx={r * 0.95} ry={r * 1.12} fill={cols[ri]} stroke={INK} strokeWidth={lw * 0.55} /><path d={`M${bx - r * 0.35},${ry - r * 0.55} q0,-3 3,-3`} stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={0.85} /></g>;
            })}
          </g>
        );
      })}
    </g>
  );
};

/** a clipboard with a few ledger lines, held upright (no text, so it survives mirroring) */
export const Clipboard: React.FC<{ x?: number; y?: number; rot?: number; s?: number; lw?: number }> = ({ x = 0, y = 0, rot = 0, s = 1, lw = 4 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d={rrect(-46, -62, 92, 126, 8)} fill="#b8864e" shade="#7e5528" lw={lw} sh={[-5, -5]} />
    <Part d={rrect(-36, -48, 72, 104, 3)} fill="#fbf6e6" shade="#d8cfb4" lw={lw * 0.5} sh={[-3, -3]}>
      {[-30, -16, -2, 12, 26, 40].map((yy) => <path key={yy} d={`M-28,${yy} L${yy % 3 === 0 ? 14 : 26},${yy}`} stroke="#6a7a96" strokeWidth={3} strokeLinecap="round" />)}
      <path d="M-28,-38 L-8,-38" stroke="#c8203a" strokeWidth={4} strokeLinecap="round" />
      <path d="M12,28 l7,8 l14,-16" stroke="#2aa79f" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Part>
    <Part d={rrect(-22, -72, 44, 22, 5)} fill="#aab6c6" shade="#6f7c8f" lw={lw * 0.9} />
  </g>
);

/** a quill pen, base at the origin, pointing up (-y) */
export const Quill: React.FC<{ x?: number; y?: number; rot?: number; s?: number; lw?: number }> = ({ x = 0, y = 0, rot = 0, s = 1, lw = 3.4 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d={smooth([[0, 4], [-14, -24], [-18, -70], [-4, -118], [4, -126], [16, -70], [14, -24]], true, 0.7)} fill="#f4fbf8" shade="#a9dcd5" lw={lw} sh={[-4, -3]}>
      <path d="M0,0 L0,-120" stroke="#6bb5ad" strokeWidth={3} />
      {[-30, -50, -70, -90].map((yy) => <path key={yy} d={`M0,${yy} l-12,-8 M0,${yy} l12,-8`} stroke="#6bb5ad" strokeWidth={2} />)}
    </Part>
    <path d="M0,4 L0,18" stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/* ------------------------------ Pip, Frost, Gleam ----------------------------- */

/** a fork, upright; origin at the grip (handle runs down, tines up) */
export const Fork: React.FC<{ x?: number; y?: number; rot?: number; s?: number; lw?: number }> = ({ x = 0, y = 0, rot = 0, s = 1, lw = 3.6 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d={[tube([[0, 64], [0, -40]], [7, 8]), smooth([[-26, -40], [-26, -62], [26, -62], [26, -40], [0, -28]], true, 0.4), ...[-20, 0, 20].map((tx) => tube([[tx, -56], [tx, -104]], [5, 4]))]} fill="#e2e8f0" shade="#97a3b6" lw={lw} sh={[-3, -3]} />
  </g>
);

/** Frost's mug: pale-blue ceramic with a snowflake and steam curling up */
export const Mug: React.FC<{ x?: number; y?: number; s?: number; rot?: number; t?: number; steam?: boolean; lw?: number }> = ({ x = 0, y = 0, s = 1, rot = 0, t = 0, steam = true, lw = 4 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    {steam && [-16, 4, 22].map((sx, i) => {
      const ph = t * 5 + i * 1.9;
      return <path key={i} d={`M${sx},-40 q${10 * Math.sin(ph)},-18 0,-34 q${-12 * Math.sin(ph + 1)},-18 2,-36`} stroke="#fff" strokeWidth={8 - i} strokeLinecap="round" fill="none" opacity={0.8} />;
    })}
    <Part d={tube([[30, -16], [52, -12], [54, 12], [30, 20]], [7, 7, 7, 7])} fill="#cfe6f6" shade="#8fb8d8" lw={lw} sh={[-3, -3]} />
    <Part d={rrect(-32, -38, 64, 74, 12)} fill="#cfe6f6" shade="#8fb8d8" lw={lw} sh={[-6, -5]}>
      <path d="M0,-12 L0,22 M-14,-4 L14,16 M14,-4 L-14,16" stroke="#4a86c8" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={0} cy={-34} rx={24} ry={5} fill="#7a4a30" />
    </Part>
  </g>
);

/** Gleam's prism: a chain, a crystal kite, and a spill of rainbow glints. Origin = where the chain meets the crystal. */
export const PrismPendant: React.FC<{ x?: number; y?: number; s?: number; t?: number; rays?: boolean; lw?: number }> = ({ x = 0, y = 0, s = 1, t = 0, rays = true, lw = 3.6 }) => {
  const cols = ["#ff5a5a", "#ffb03a", "#fff04a", "#4adf6a", "#4ab0ff", "#9a6aff"];
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-46,-70 Q0,34 46,-70" stroke={INK} strokeWidth={8} fill="none" />
      <path d="M-46,-70 Q0,34 46,-70" stroke="#f2c53d" strokeWidth={4} fill="none" strokeDasharray="7 3" />
      {rays && cols.map((c, i) => <path key={i} d={`M12,30 L${70 + i * 9},${14 + i * 14 + 4 * Math.sin(t * 6 + i)}`} stroke={c} strokeWidth={4.5} strokeLinecap="round" opacity={0.95} />)}
      <Part d={poly([[0, -2], [-24, 38], [0, 62], [24, 38]])} fill="#e2f8ff" shade="#8fd0ee" lw={lw} sh={[-5, -6]}>
        <path d="M0,-2 L0,62 M-24,38 L24,38" stroke="#fff" strokeWidth={2.4} opacity={0.9} />
      </Part>
    </g>
  );
};

/* ------------------------------ the harbour badge ----------------------------- */

/** the shared harbour-command emblem: a gold anchor whose ring is a lit lantern, on a navy roundel */
export const HarbourBadge: React.FC<{ x?: number; y?: number; s?: number; lw?: number; grey?: boolean }> = ({ x = 0, y = 0, s = 1, lw = 3.4, grey }) => {
  const navy = grey ? "#9aa2b2" : "#1b3558", gold = grey ? "#d8dce4" : "#f2c53d";
  const strokeG = (d: string, w: number) => <><path d={d} stroke={INK} strokeWidth={w + 4} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={d} stroke={gold} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /></>;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Part d={circ([0, 0], 42)} fill={navy} lw={lw} />
      <circle cx={0} cy={0} r={35} fill="none" stroke={gold} strokeWidth={2.6} />
      {strokeG("M0,-8 L0,28", 6)}
      {strokeG("M-13,2 L13,2", 5)}
      {strokeG("M-24,12 Q-22,32 0,32 Q22,32 24,12", 5)}
      {strokeG("M-24,12 l-6,-2 M24,12 l6,-2", 4)}
      {/* lantern: cap, glass, flame */}
      <path d="M-8,-30 h16 v-4 l-8,-6 l-8,6Z" fill={gold} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <rect x={-7} y={-30} width={14} height={20} rx={3} fill={grey ? "#fff" : "#fff2a8"} stroke={INK} strokeWidth={2.4} />
      <path d="M0,-27 q-4,6 0,12 q4,-6 0,-12Z" fill={grey ? "#ddd" : "#ff9a1c"} />
    </g>
  );
};

/* ------------------------------- power effects -------------------------------- */

const lick = (bw: number, h: number, sway: number) => `M${-bw},0 Q${-bw * 1.15},${-h * 0.5} ${sway},${-h} Q${bw * 1.15},${-h * 0.42} ${bw},0Z`;

/** a ring of flame around a fist at (x,y); radius ~r. t in seconds. */
export const FireFist: React.FC<{ x: number; y: number; s?: number; t?: number; r?: number }> = ({ x, y, s = 1, t = 0, r = 34 }) => {
  const id = "ff" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const n = 9;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs><radialGradient id={id}><stop offset="0" stopColor="#fff3b0" stopOpacity={0.95} /><stop offset="0.45" stopColor="#ff9a2a" stopOpacity={0.55} /><stop offset="1" stopColor="#ff4a10" stopOpacity={0} /></radialGradient></defs>
      <circle r={r * 3.4} fill={`url(#${id})`} />
      {Array.from({ length: n }, (_, i) => {
        const a = -100 + (i / (n - 1)) * 200 + 8 * Math.sin(t * 6 + i);
        const h = (66 + 54 * rnd(i, 5)) * (0.8 + 0.28 * Math.sin(t * 9 + i * 1.7));
        const sw = 16 * Math.sin(t * 7 + i * 2.1);
        return (
          <g key={i} transform={`rotate(${a}) translate(0,${-r * 0.9})`}>
            <path d={lick(15, h, sw)} fill="#ff6a1a" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
            <path d={lick(9, h * 0.66, sw * 0.7)} fill="#ffb02e" />
            <path d={lick(4, h * 0.34, sw * 0.4)} fill="#fff2a0" />
          </g>
        );
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const u = (t * 0.7 + i / 8) % 1;
        return <circle key={i} cx={(rnd(i, 2) - 0.5) * 130} cy={-r - u * 170} r={(1 - u) * 6 + 1.5} fill={i % 2 ? "#ffd23a" : "#ff7a1c"} opacity={1 - u} />;
      })}
    </g>
  );
};

const flake = (r: number, rot: number, c = "#e8f8ff") => (
  <g transform={`rotate(${rot})`}>
    {[0, 60, 120].map((a) => <g key={a} transform={`rotate(${a})`}><path d={`M${-r},0 L${r},0`} stroke={INK} strokeWidth={7} strokeLinecap="round" /></g>)}
    {[0, 60, 120].map((a) => <g key={a} transform={`rotate(${a})`}><path d={`M${-r},0 L${r},0 M${r * 0.6},${-r * 0.25} L${r},0 L${r * 0.6},${r * 0.25} M${-r * 0.6},${-r * 0.25} L${-r},0 L${-r * 0.6},${r * 0.25}`} stroke={c} strokeWidth={3.4} strokeLinecap="round" fill="none" /></g>)}
  </g>
);

/** a cone of frosty breath from the mouth at (x,y), blowing toward +x (flip with dir=-1) */
export const IceBreath: React.FC<{ x: number; y: number; s?: number; t?: number; dir?: 1 | -1; len?: number }> = ({ x, y, s = 1, t = 0, dir = 1, len = 320 }) => (
  <g transform={`translate(${x},${y}) scale(${dir * s},${s})`}>
    {Array.from({ length: 9 }, (_, i) => {
      const u = i / 8;
      const cx = 10 + u * len, cy = 12 * Math.sin(t * 4 + i * 1.3) + u * 26;
      const r = 14 + u * 44 + 4 * Math.sin(t * 5 + i);
      return (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="#dff4ff" stroke={INK} strokeWidth={4.5} />
        </g>
      );
    }).reverse()}
    {Array.from({ length: 9 }, (_, i) => {
      const u = i / 8;
      const cx = 10 + u * len, cy = 12 * Math.sin(t * 4 + i * 1.3) + u * 26;
      const r = 14 + u * 44 + 4 * Math.sin(t * 5 + i);
      return <path key={i} d={`M${cx - r * 0.7},${cy + r * 0.45} Q${cx},${cy + r * 1.05} ${cx + r * 0.8},${cy + r * 0.3} Q${cx + r * 0.3},${cy + r * 0.55} ${cx - r * 0.7},${cy + r * 0.45}Z`} fill="#9ed2f4" />;
    }).reverse()}
    {Array.from({ length: 7 }, (_, i) => {
      const u = (i * 0.15 + t * 0.12) % 1;
      return <g key={i} transform={`translate(${60 + u * (len + 90)},${-46 + ((i * 37) % 120) * 0.9 + u * 40})`}>{flake(9 + (i % 3) * 6, t * 50 + i * 30)}</g>;
    })}
  </g>
);

/** a prism beam from a source at (x,y) along `rot` degrees: white-hot core, rainbow edges, sparkle at the tip */
export const LightBeam: React.FC<{ x: number; y: number; rot?: number; len?: number; s?: number; t?: number }> = ({ x, y, rot = 0, len = 420, s = 1, t = 0 }) => {
  const id = "lb" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const cols = ["#ff5a5a", "#ffb03a", "#fff04a", "#4adf6a", "#4ab0ff", "#9a6aff"];
  const w0 = 14, w1 = 46;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
      <defs><linearGradient id={id} x1="0" x2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.7" stopColor="#fff6c8" /><stop offset="1" stopColor="#fff6c8" stopOpacity={0.3} /></linearGradient></defs>
      <path d={`M0,${-w0} L${len},${-w1} L${len},${w1} L0,${w0}Z`} fill={`url(#${id})`} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {cols.map((c, i) => {
        const k = (i - 2.5) / 3;
        return <path key={i} d={`M0,${k * w0 * 0.9} L${len},${k * w1 * 0.9}`} stroke={c} strokeWidth={4.5} opacity={0.75} />;
      })}
      <g transform={`translate(${len},0) rotate(${t * 40})`}>
        <path d="M0,-52 L9,-9 L52,0 L9,9 L0,52 L-9,9 L-52,0 L-9,-9Z" fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
      <g transform={`rotate(${-t * 30})`}>
        <path d="M0,-40 L7,-7 L40,0 L7,7 L0,40 L-7,7 L-40,0 L-7,-7Z" fill="#fff8d0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
      {[0.35, 0.6, 0.8].map((u, i) => <path key={i} d={`M${len * u},${(i % 2 ? -1 : 1) * (w0 + (w1 - w0) * u + 22)} l6,-14 l6,14 l14,6 l-14,6 l-6,14 l-6,-14 l-14,-6Z`} fill="#fff6a0" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />)}
    </g>
  );
};

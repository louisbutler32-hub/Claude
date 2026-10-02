import React from "react";
import { INK } from "../common";
import { circ, Face, Hand, Luffy, LuffyHead, Part, Pose, Regular, SKIN, smooth, tube } from "../bowling/characters";
import { G } from "../guest";
import { P } from "./fx";

/**
 * Buffet cast: Luffy with an inflatable belly (and a chicken bone in his hair),
 * Luffy as a bouncing ball, and the owner (the guest) in his red apron.
 * All overlays are drawn in body space, after the base figure.
 */

/* ------------------------------------ Luffy ------------------------------------ */

export const Belly: React.FC<{ k: number; lw: number; wob?: number }> = ({ k, lw, wob = 0 }) => {
  const r = (58 + 142 * k) * (1 + wob);
  const cy = -560 - (r - 58) * 0.04;
  const shine = `M${-r * 0.62},${cy - r * 0.35} Q${-r * 0.5},${cy - r * 0.7} ${-r * 0.1},${cy - r * 0.78}`;
  return (
    <g>
      {k > 0.12 && [-1, 1].map((sd) => (
        <Part key={sd} d={smooth([[sd * 90, -810], [sd * (r + 34), -690], [sd * (r + 30), -520], [sd * (r * 0.8), -400], [sd * (r * 0.45), -430], [sd * (r * 0.5), -600], [sd * 40, -780]])} fill="#e0262e" shade="#9e1420" lw={lw} />
      ))}
      <Part d={circ([0, cy], r)} fill={SKIN.base} shade={SKIN.shade} lw={lw} sh={[-r * 0.1, -r * 0.08]}>
        {/* the yellow sash, stretched round the middle */}
        <path d={`M${-r - 4},${cy + r * 0.02} Q0,${cy + r * 0.2} ${r + 4},${cy + r * 0.02} L${r + 4},${cy + r * 0.2} Q0,${cy + r * 0.38} ${-r - 4},${cy + r * 0.2}Z`} fill="#f6c51c" />
        <path d={`M${-r - 4},${cy + r * 0.2} Q0,${cy + r * 0.38} ${r + 4},${cy + r * 0.2}`} stroke="#c48a0a" strokeWidth={4} fill="none" />
        {/* belly button */}
        <path d={`M-9,${cy - r * 0.28} q9,10 18,0`} stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />
        <path d={shine} stroke="#ffffff" strokeWidth={Math.max(6, r * 0.05)} fill="none" strokeLinecap="round" opacity={0.7} />
      </Part>
    </g>
  );
};

/** a chicken bone stuck in his hair, drawn in head space */
export const Bone: React.FC<{ lw?: number }> = ({ lw = 3 }) => (
  <g transform="translate(52,-34) rotate(-38)">
    <Part d={tube([[0, 0], [58, 0]], [7, 7])} fill="#f6f1e4" shade="#cfc6ae" lw={lw} />
    <Part d="M50,-8a10,10 0 1 0 20,0a10,10 0 1 0 -20,0Z M50,8a10,10 0 1 0 20,0a10,10 0 1 0 -20,0Z" fill="#f6f1e4" shade="#cfc6ae" lw={lw} />
    <path d="M10,-5 q6,6 0,10" stroke="#c8362c" strokeWidth={3} fill="none" />
  </g>
);

export type LuffyFigProps = { p: Pose; x: number; y: number; s?: number; face?: Face; belly?: number; wob?: number; bone?: boolean; lw?: number; flipX?: boolean; children?: React.ReactNode };

export const LuffyFig: React.FC<LuffyFigProps> = ({ p, x, y, s = 1, face = "grin", belly = 0, wob = 0, bone = false, lw = 4, flipX, children }) => (
  <g>
    <Luffy p={p} x={x} y={y} s={s} face={face} lw={lw} flipX={flipX} />
    <g transform={`translate(${x},${y}) scale(${flipX ? -s : s},${s})`}>
      {belly > 0.02 && <Belly k={belly} lw={lw} wob={wob} />}
      {bone && <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}><Bone lw={lw * 0.8} /></g>}
      {children}
    </g>
  </g>
);

/** Luffy rolled into a ball: belly out, limbs tucked, head on top. Squash (sx,sy) is applied outside the roll. */
export const LuffyBall: React.FC<{ x: number; y: number; r?: number; rot?: number; sx?: number; sy?: number; face?: Face; lw?: number; cheeks?: number }> = ({ x, y, r = 190, rot = 0, sx = 1, sy = 1, face = "laugh", lw = 5, cheeks = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${sx},${sy}) rotate(${rot})`}>
    {/* sandals */}
    {[-1, 1].map((sd) => (
      <Part key={sd} d={smooth([[sd * 42, r * 0.84], [sd * 98, r * 0.88], [sd * 112, r * 1.04], [sd * 70, r * 1.1], [sd * 36, r * 1.02]])} fill="#8a4a24" shade="#5e3010" lw={lw} />
    ))}
    {/* fists tucked at the sides */}
    {[-1, 1].map((sd) => (
      <Part key={sd} d={circ([sd * (r + 6), r * 0.02], 36)} fill={SKIN.base} shade={SKIN.shade} lw={lw} sh={[-5, -4]} />
    ))}
    <Part d={circ([0, 0], r)} fill={SKIN.base} shade={SKIN.shade} lw={lw} sh={[-r * 0.09, -r * 0.07]}>
      <path d={`M${-r},${r * 0.04} Q0,${r * 0.24} ${r},${r * 0.04} L${r},${r * 0.26} Q0,${r * 0.46} ${-r},${r * 0.26}Z`} fill="#f6c51c" />
      <path d={`M${-r},${r * 0.26} Q0,${r * 0.46} ${r},${r * 0.26}`} stroke="#c48a0a" strokeWidth={5} fill="none" />
      <path d={`M-10,${-r * 0.2} q10,11 20,0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d={`M${-r * 0.7},${-r * 0.45} Q${-r * 0.55},${-r * 0.78} ${-r * 0.15},${-r * 0.88}`} stroke="#fff" strokeWidth={r * 0.05} fill="none" strokeLinecap="round" opacity={0.65} />
    </Part>
    {[-1, 1].map((sd) => (
      <Part key={sd} d={smooth([[sd * 40, -r * 0.92], [sd * (r * 0.8), -r * 0.62], [sd * (r * 0.9), -r * 0.2], [sd * (r * 0.62), -r * 0.4], [sd * 30, -r * 0.7]])} fill="#e0262e" shade="#9e1420" lw={lw} />
    ))}
    <g transform={`translate(0,${-r * 0.8}) scale(1.08)`}>
      <LuffyHead face={face} lw={lw * 0.9} />
      {cheeks > 0 && [-1, 1].map((sd) => <Part key={sd} d={circ([sd * (40 + cheeks * 18), 38], 22 + cheeks * 16)} fill={SKIN.base} shade={SKIN.shade} lw={lw * 0.7} sh={[-3, -3]} />)}
    </g>
  </g>
);

/* ------------------------------------ the guest ------------------------------------ */

const lerpPts = (a: P[], b: P[], t: number): P[] => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]);
const APRON_N: P[] = [[-58, -776], [58, -776], [90, -572], [106, -300], [0, -276], [-106, -300], [-90, -572]];
const APRON_B: P[] = [[-58, -776], [58, -776], [62, -600], [-230, -560], [-380, -470], [-340, -380], [-80, -540]];

export const Apron: React.FC<{ lw?: number; blow?: number }> = ({ lw = 4, blow = 0 }) => {
  const pts = lerpPts(APRON_N, APRON_B, blow);
  return (
    <g>
      <Part d={tube([[-56, -776], [-20, -836]], [7, 7])} fill="#d8342c" shade="#9c1f1a" lw={lw * 0.8} />
      <Part d={tube([[56, -776], [20, -836]], [7, 7])} fill="#d8342c" shade="#9c1f1a" lw={lw * 0.8} />
      <Part d={smooth(pts, true, 0.5)} fill="#d8342c" shade="#9c1f1a" lw={lw} sh={[-8, -4]}>
        {blow < 0.5 && (
          <>
            <path d="M-96,-572 L96,-572" stroke="#9c1f1a" strokeWidth={5} />
            <path d="M-46,-500 h92 v62 h-92Z" fill="#e8584c" stroke="#9c1f1a" strokeWidth={4} />
            <circle cx={0} cy={-690} r={24} fill="#f6c52a" stroke={INK} strokeWidth={4} />
            <text x={0} y={-681} textAnchor="middle" fontFamily="Poppins Black" fontSize={22} fill="#a06a08">20</text>
          </>
        )}
        {blow >= 0.5 && <path d={`M${-90},-680 q-60,-20 -120,10 M${-120},-540 q-60,-20 -130,0`} stroke="#9c1f1a" strokeWidth={5} fill="none" />}
      </Part>
    </g>
  );
};

/** curls streaming back from the head, drawn in head space (heading left) */
export const HairStreaks: React.FC<{ k: number; lw?: number }> = ({ k, lw = 3 }) => {
  if (k <= 0) return null;
  const blobs = Array.from({ length: 11 }, (_, i) => {
    const row = i % 3, col = Math.floor(i / 3);
    const rr = 20 - col * 3.2;
    return circ([-50 - col * 52 * k - row * 8, -76 + row * 24 + col * (row - 1) * 6], rr);
  });
  return <Part d={blobs} fill={G.hair} shade={G.hairS} lw={lw} />;
};

export const XEyes: React.FC = () => (
  <g>
    {[-20, 20].map((ex) => (
      <g key={ex}>
        <ellipse cx={ex} cy={1} rx={17} ry={13} fill={G.skin.base} />
        <path d={`M${ex - 11},-8 L${ex + 11},10 M${ex + 11},-8 L${ex - 11},10`} stroke={INK} strokeWidth={4.6} strokeLinecap="round" />
      </g>
    ))}
    <ellipse cx={0} cy={46} rx={14} ry={10} fill="#5a1418" stroke={INK} strokeWidth={2.6} />
  </g>
);

export type GuestFigProps = { p: Pose; x: number; y: number; s?: number; rot?: number; face?: "grin" | "shock" | "blank"; apron?: boolean; blow?: number; streak?: number; dead?: boolean; lw?: number; children?: React.ReactNode };

export const GuestFig: React.FC<GuestFigProps> = ({ p, x, y, s = 1, rot = 0, face = "grin", apron = true, blow = 0, streak = 0, dead = false, lw = 4, children }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Regular p={p} x={0} y={0} s={1} face={face} lw={lw} />
    {apron && <Apron lw={lw} blow={blow} />}
    <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}>
      <HairStreaks k={streak} lw={lw * 0.7} />
      {dead && <XEyes />}
    </g>
    {children}
  </g>
);

export { Hand };

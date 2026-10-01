import React from "react";
import { INK } from "./common";
import { HeadBase, P, Part } from "./bowling/characters";

/**
 * The guest: the channel owner, drawn into both shorts in place of the
 * bystander in the cyan shirt (the sword-shop clerk, the bowling regular).
 * Drawn from a reference photo: a young guy with a dense mop of dark-brown
 * curls (full on top, falling onto the forehead, short at the sides), thick
 * straight dark brows, warm light skin, a wide toothy grin, and a dark green
 * crew-neck tee.
 */

export const G = {
  hair: "#3b261a", hairS: "#22140c", curl: "#5a3a26",
  skin: { base: "#f3c6a2", shade: "#d79a78" },
  blush: "#ec9a86",
  tee: "#2f5d3d", teeS: "#1d3f28",
  jeans: "#2c3446", jeansS: "#1a2030",
};

const circle = (c: P, r: number) => `M${(c[0] - r).toFixed(1)},${c[1].toFixed(1)}a${r},${r} 0 1 0 ${(r * 2).toFixed(1)},0a${r},${r} 0 1 0 ${(-r * 2).toFixed(1)},0Z`;
const rnd = (i: number, seed: number) => { const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453; return x - Math.floor(x); };

/**
 * A curly mop as a union of curls: rings of circles over a dome (centre cx,cy;
 * half-width w; height h above cy), a fringe row hanging to `fringeY`, and
 * short sides down to `sideY`. Returns the circle paths (for a <Part>, which
 * outlines the union) and the spiral marks to draw inside.
 */
export const curlyMop = (cx: number, cy: number, w: number, h: number, fringeY: number, sideY: number, r: number, seed = 1) => {
  const blobs: string[] = [];
  const marks: string[] = [];
  const add = (x: number, y: number, rr: number, i: number) => {
    blobs.push(circle([x, y], rr));
    if (rnd(i, seed + 3) > 0.35) {
      const a = rnd(i, seed + 5) * Math.PI * 2;
      const q = rr * 0.55;
      marks.push(`M${(x + Math.cos(a) * q).toFixed(1)},${(y + Math.sin(a) * q).toFixed(1)}a${q},${q} 0 1 1 ${(-Math.cos(a) * q * 1.3).toFixed(1)},${(-Math.sin(a) * q * 0.9).toFixed(1)}`);
    }
  };
  let i = 0;
  // the dome: three rings, outer to inner
  [[1, 15], [0.72, 11], [0.42, 7]].forEach(([k, n]) => {
    for (let j = 0; j <= n; j++) {
      const a = Math.PI * (1.02 + (j / n) * 0.96);
      const jr = r * (0.85 + rnd(i, seed) * 0.35) * (k === 1 ? 1 : 1.1);
      add(cx + Math.cos(a) * w * k, cy + Math.sin(a) * h * k, jr, i++);
    }
  });
  add(cx, cy - h * 0.15, r * 1.6, i++);
  // fringe falling onto the forehead
  for (let j = 0; j < 7; j++) {
    const x = cx - w * 0.78 + (j / 6) * w * 1.5;
    add(x, fringeY - Math.abs(j - 3) * r * 0.18 + rnd(i, seed) * r * 0.4, r * (0.8 + rnd(i, seed + 1) * 0.3), i++);
  }
  // short sides down to the top of the ears
  [-1, 1].forEach((s) => {
    for (let j = 0; j < 3; j++) add(cx + s * w * (0.98 - j * 0.04), cy + (sideY - cy) * ((j + 1) / 3), r * (0.75 - j * 0.1), i++);
  });
  return { blobs, marks };
};

export const Curls: React.FC<{ m: ReturnType<typeof curlyMop>; lw: number; markW?: number }> = ({ m, lw, markW }) => (
  <Part d={m.blobs} fill={G.hair} shade={G.hairS} lw={lw}>
    <path d={m.marks.join("")} stroke={G.curl} strokeWidth={markW ?? lw * 0.7} fill="none" strokeLinecap="round" />
  </Part>
);

export type GuestFace = "grin" | "blank" | "shock" | "yell";

/** head space as the figure kit's: eye line y=0, chin ≈ 70, crown ≈ -82 */
export const GuestHead: React.FC<{ face?: GuestFace; turn?: number; lw: number }> = ({ face = "grin", turn = 0, lw }) => {
  const sx = turn * 12;
  const mop = curlyMop(sx * 0.4, -52, 60, 52, -50, -18, 15, 7);
  return (
    <g>
      <HeadBase turn={turn} skin={G.skin} lw={lw} jaw={1.02} />
      {/* blush */}
      <ellipse cx={-30 + sx} cy={22} rx={11} ry={6} fill={G.blush} opacity={0.45} />
      <ellipse cx={30 + sx} cy={22} rx={11} ry={6} fill={G.blush} opacity={0.45} />
      {/* thick straight brows */}
      {face === "yell" ? (
        <path d={`M${-38 + sx},-24 L${-8 + sx},-12 L${-10 + sx},-6 L${-38 + sx},-16Z M${38 + sx},-24 L${8 + sx},-12 L${10 + sx},-6 L${38 + sx},-16Z`} fill={G.hair} stroke={INK} strokeWidth={1.6} />
      ) : (
        <path d={`M${-38 + sx},${face === "shock" ? -26 : -18} Q${-22 + sx},${face === "shock" ? -32 : -24} ${-8 + sx},${face === "shock" ? -26 : -18} L${-9 + sx},-12 Q${-22 + sx},-17 ${-37 + sx},-11Z M${38 + sx},${face === "shock" ? -26 : -18} Q${22 + sx},${face === "shock" ? -32 : -24} ${8 + sx},${face === "shock" ? -26 : -18} L${9 + sx},-12 Q${22 + sx},-17 ${37 + sx},-11Z`} fill={G.hair} stroke={INK} strokeWidth={1.6} />
      )}
      {/* eyes */}
      {face === "grin" ? (
        <path d={`M${-32 + sx},4 Q${-20 + sx},-8 ${-8 + sx},4 M${8 + sx},4 Q${20 + sx},-8 ${32 + sx},4`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      ) : face === "shock" ? (
        <>
          {[-20, 20].map((ex) => <g key={ex}><ellipse cx={ex + sx} cy={0} rx={11} ry={12} fill="#fff" stroke={INK} strokeWidth={2.4} /><circle cx={ex + sx} cy={0} r={3.2} fill="#3a2414" /></g>)}
        </>
      ) : (
        <>
          {[-20, 20].map((ex) => (
            <g key={ex}>
              <path d={`M${ex - 12 + sx},0 Q${ex + sx},-7 ${ex + 12 + sx},0 Q${ex + sx},7 ${ex - 12 + sx},0Z`} fill="#fff" stroke={INK} strokeWidth={1.8} />
              <circle cx={ex + sx} cy={0.5} r={4.6} fill="#4a2c18" />
              <path d={`M${ex - 13 + sx},-1 Q${ex + sx},-9 ${ex + 13 + sx},-1`} stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />
            </g>
          ))}
        </>
      )}
      {/* nose */}
      <path d={`M${sx + 2},10 Q${sx + 7},24 ${sx + 1},29 M${sx - 6},28 Q${sx - 1},31 ${sx + 4},28`} stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* mouth */}
      {face === "grin" && (
        <g>
          <path d={`M${sx - 26},38 Q${sx},46 ${sx + 26},38 Q${sx + 20},64 ${sx},66 Q${sx - 20},64 ${sx - 26},38Z`} fill="#7a2228" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
          <path d={`M${sx - 23},39.5 Q${sx},47 ${sx + 23},39.5 L${sx + 21},48 Q${sx},54 ${sx - 21},48Z`} fill="#fff" />
          <path d={`M${sx - 30},34 q-2,4 1,8 M${sx + 30},34 q2,4 -1,8`} stroke={INK} strokeWidth={1.8} fill="none" />
        </g>
      )}
      {face === "yell" && (
        <g>
          <path d={`M${sx - 24},36 L${sx + 24},36 L${sx + 18},68 L${sx - 18},68Z`} fill="#6a1418" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
          <path d={`M${sx - 22},37 L${sx + 22},37 L${sx + 21},44 L${sx - 21},44Z`} fill="#fff" />
          <path d={`M${sx - 14},68 Q${sx},55 ${sx + 14},68Z`} fill="#e0585a" />
        </g>
      )}
      {face === "shock" && <path d={`M${sx - 14},40 Q${sx},34 ${sx + 14},40 Q${sx + 12},64 ${sx},66 Q${sx - 12},64 ${sx - 14},40Z`} fill="#5a1418" stroke={INK} strokeWidth={2.6} />}
      {face === "blank" && <path d={`M${sx - 12},46 L${sx + 12},46`} stroke={INK} strokeWidth={2.8} strokeLinecap="round" />}
      <Curls m={mop} lw={lw} markW={2.2} />
    </g>
  );
};

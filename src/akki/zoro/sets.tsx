import React from "react";
import { H, INK, W } from "../common";
import { Part, smooth, tube } from "../bowling/characters";
import { Katana } from "./cast";

type P = [number, number];
const fx = (p: P) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

/* -------------------------------- perspective -------------------------------- */

/**
 * Projective map from the unit square onto a quad [p00, p10, p11, p01]
 * (Heckbert's square-to-quad), so a grid drawn in (u,v) lands in true
 * perspective — the checker ceiling, the floorboards, the wall panels.
 */
export const quadMap = (q: [P, P, P, P]) => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  let a, b, c, d, e, f, g, h;
  if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) {
    a = x1 - x0; b = x2 - x1; c = x0; d = y1 - y0; e = y2 - y1; f = y0; g = 0; h = 0;
  } else {
    const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
    const den = dx1 * dy2 - dx2 * dy1;
    g = (sx * dy2 - dx2 * sy) / den;
    h = (dx1 * sy - sx * dy1) / den;
    a = x1 - x0 + g * x1; b = x3 - x0 + h * x3; c = x0;
    d = y1 - y0 + g * y1; e = y3 - y0 + h * y3; f = y0;
  }
  return (u: number, v: number): P => {
    const w = g * u + h * v + 1;
    return [(a * u + b * v + c) / w, (d * u + e * v + f) / w];
  };
};
const cell = (m: (u: number, v: number) => P, u0: number, v0: number, u1: number, v1: number) =>
  `M${fx(m(u0, v0))}L${fx(m(u1, v0))}L${fx(m(u1, v1))}L${fx(m(u0, v1))}Z`;

/** a checkerboard on a quad, watercolour-soft: lavender squares on off-white */
export const Checker: React.FC<{ q: [P, P, P, P]; nu: number; nv: number; blur?: number; a?: string; b?: string; id: string }> = ({ q, nu, nv, blur = 0, a = "#9a8cd0", b = "#f3f0f8", id }) => {
  const m = quadMap(q);
  const cells: string[] = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) if ((i + j) % 2 === 0) cells.push(cell(m, i / nu, j / nv, (i + 1) / nu, (j + 1) / nv));
  return (
    <g filter={blur ? `url(#${id})` : undefined}>
      {blur ? <defs><filter id={id} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={blur} /></filter></defs> : null}
      <path d={`M${fx(q[0])}L${fx(q[1])}L${fx(q[2])}L${fx(q[3])}Z`} fill={b} />
      <path d={cells.join("")} fill={a} opacity={0.85} />
      {/* watercolour blooms: darker in the middle of each square */}
      <path d={cells.join("")} fill="#7a68c0" opacity={0.18} transform="translate(6,4)" />
    </g>
  );
};

/* ---------------------------------- props ---------------------------------- */

/** the horned helmet with two crossed scimitars and a purple ribbon — the shop's crest */
export const Crest: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {/* crossed curved blades behind */}
    {[-1, 1].map((k) => (
      <Part key={k} d={smooth([[k * -20, 90], [k * 70, 40], [k * 112, -40], [k * 118, -110], [k * 96, -40], [k * 50, 30], [k * -10, 70]], true, 0.6)} fill="#c9d0ea" shade="#8f98c4" lw={4}>
        <path d={`M${k * 110},-90 Q${k * 96},10 ${k * 10},70`} stroke="#ffffff" strokeWidth={5} fill="none" opacity={0.8} />
      </Part>
    ))}
    {/* ribbon + tassels */}
    <Part d={smooth([[-60, 70], [0, 54], [60, 70], [40, 96], [0, 86], [-40, 96]])} fill="#6a3aa0" shade="#46226e" lw={4} />
    {[-24, 24].map((tx) => (
      <g key={tx}>
        <path d={`M${tx},92 L${tx * 1.1},150`} stroke="#46226e" strokeWidth={5} />
        <Part d={smooth([[tx * 1.1 - 9, 146], [tx * 1.1 + 9, 146], [tx * 1.1 + 11, 190], [tx * 1.1 - 11, 190]], true, 0.4)} fill="#8a3a2a" shade="#5a2216" lw={3} />
      </g>
    ))}
    {/* helmet */}
    <Part d={smooth([[-56, 40], [-60, -20], [-36, -56], [0, -64], [36, -56], [60, -20], [56, 40], [0, 60]])} fill="#9aa0ae" shade="#62687a" lw={4}>
      <path d="M-60,-6 L60,-6" stroke={INK} strokeWidth={3} />
      <rect x={-30} y={4} width={22} height={12} rx={4} fill="#2a2a30" /><rect x={8} y={4} width={22} height={12} rx={4} fill="#2a2a30" />
      <path d="M0,-6 L0,46" stroke={INK} strokeWidth={3} />
      {[-40, -20, 20, 40].map((rx) => <circle key={rx} cx={rx} cy={-30} r={3} fill="#d8dce6" stroke={INK} strokeWidth={1} />)}
    </Part>
    {/* horns */}
    {[-1, 1].map((k) => (
      <Part key={`h${k}`} d={smooth([[k * 52, -24], [k * 84, -34], [k * 96, -66], [k * 88, -92], [k * 78, -64], [k * 60, -46], [k * 46, -36]], true, 0.6)} fill="#f2ecd8" shade="#c4b894" lw={4} />
    ))}
  </g>
);

const RackSword: React.FC<{ x: number; y: number; len: number; wrap: string; a?: number }> = ({ x, y, len, wrap, a = 0 }) => (
  <Katana x={x} y={y} a={a} len={len} w={9} lw={2.6} blade="#c4cbe4" edge="#ffffff" wrap={wrap} guard="#b89a5a" />
);

const Pistol: React.FC<{ x: number; y: number; s?: number; flip?: boolean }> = ({ x, y, s = 1, flip }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
    <Part d={smooth([[0, 0], [70, -6], [74, 6], [20, 10], [10, 36], [-8, 40], [-6, 10]], true, 0.4)} fill="#a8742e" shade="#6e4416" lw={3} />
    <Part d={tube([[30, -4], [96, -6]], [5, 5])} fill="#7a7e8a" lw={2.6} />
  </g>
);

/* ---------------------------------- the shop ---------------------------------- */

const WALL = "#b8d466", WALL_S = "#93b04a", WOOD = "#9a6430", WOOD_S = "#6a4018", FLOOR = "#c98d52", FLOOR_S = "#a26a36";

/**
 * The sword shop, laid out at the wide-shot camera (1080×1920 frame). Other
 * shots reuse it under a transform. Lavender-checker ceiling, a receding left
 * wall of sword racks, the lime back wall with the crest, racked swords and
 * pistols, a display counter on the right, and a warm plank floor.
 */
export const Shop: React.FC<{ id?: string }> = ({ id = "shop" }) => {
  const floorQ: [P, P, P, P] = [[-200, 1290], [1300, 1290], [2400, H + 200], [-1400, H + 200]];
  const fm = quadMap(floorQ);
  const ceilQ: [P, P, P, P] = [[-300, -260], [1400, -260], [1180, 250], [120, 250]];
  const leftQ: [P, P, P, P] = [[0, -200], [130, 250], [130, 1290], [0, 1760]];
  const lm = quadMap(leftQ);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9e07a" /><stop offset="1" stopColor="#a8c658" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b77a40" /><stop offset="0.5" stopColor="#d49a5c" /><stop offset="1" stopColor="#c08048" />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff6d0" stopOpacity={0.35} /><stop offset="1" stopColor="#fff6d0" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* back wall */}
      <rect x={0} y={200} width={W} height={1120} fill={`url(#${id}-wall)`} />
      {/* ceiling */}
      <Checker q={ceilQ} nu={7} nv={5} id={`${id}-ceil`} />
      {/* crown beam */}
      <Part d={`M120,240 L1180,240 L1180,282 L120,282Z`} fill={WOOD} shade={WOOD_S} lw={4} />
      {/* back-wall framing: posts and rails */}
      {[300, 760].map((px) => <Part key={px} d={`M${px - 12},282 L${px + 12},282 L${px + 12},1290 L${px - 12},1290Z`} fill={WOOD} shade={WOOD_S} lw={3} />)}
      <Part d="M130,560 L1080,560 L1080,592 L130,592Z" fill={WOOD} shade={WOOD_S} lw={3.4} />
      <Part d="M130,1180 L1080,1180 L1080,1214 L130,1214Z" fill={WOOD} shade={WOOD_S} lw={3.4} />
      {/* panel shading */}
      {[[142, 290, 146, 262], [322, 290, 426, 262], [782, 290, 298, 262], [142, 600, 146, 572], [322, 600, 426, 572], [782, 600, 298, 572]].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={WALL_S} opacity={0.25} />
      ))}
      {/* the crest */}
      <Crest x={530} y={410} s={1.15} />
      {/* racked swords, upper right */}
      {[340, 390, 440].map((ry, i) => <RackSword key={ry} x={1010} y={ry} a={180} len={250} wrap={["#7a2a22", "#2a2a30", "#6a4a2a"][i]} />)}
      {[340, 390, 440].map((ry) => <path key={`p${ry}`} d={`M800,${ry + 10} l0,12 M1000,${ry + 10} l0,12`} stroke={WOOD_S} strokeWidth={6} />)}
      {/* long swords on the lower wall */}
      {[690, 760].map((ry, i) => <RackSword key={ry} x={150} y={ry} a={0} len={i ? 560 : 640} wrap={i ? "#2a2a30" : "#e8e4dc"} />)}
      {/* pistols */}
      <Pistol x={880} y={650} s={1.1} /><Pistol x={880} y={730} s={1.1} /><Pistol x={1010} y={830} s={1.1} flip />
      {/* left wall: sword handles poking out of the rack, in perspective */}
      <path d={`M${fx(leftQ[0])}L${fx(leftQ[1])}L${fx(leftQ[2])}L${fx(leftQ[3])}Z`} fill="#a9c45a" />
      {[0.12, 0.3, 0.48, 0.66, 0.84].map((v) => {
        const a = lm(0, v), b = lm(1, v);
        return <path key={v} d={`M${fx(a)}L${fx(b)}`} stroke={["#c83a2a", "#f0ece0", "#c83a2a", "#3a3a40", "#f0ece0"][Math.round(v * 5) % 5]} strokeWidth={22 - v * 8} strokeLinecap="round" />;
      })}
      {[0.12, 0.3, 0.48, 0.66, 0.84].map((v) => {
        const a = lm(0, v), b = lm(1, v);
        return <path key={`d${v}`} d={`M${fx(a)}L${fx(b)}`} stroke={INK} strokeWidth={2} strokeDasharray="6 8" opacity={0.6} />;
      })}
      <Part d={`M120,250 L140,250 L140,1300 L120,1300Z`} fill={WOOD} shade={WOOD_S} lw={3} />
      {/* floor */}
      <path d={`M${fx(floorQ[0])}L${fx(floorQ[1])}L${fx(floorQ[2])}L${fx(floorQ[3])}Z`} fill={`url(#${id}-floor)`} />
      {Array.from({ length: 13 }, (_, i) => {
        const u = i / 12;
        return <path key={i} d={`M${fx(fm(u, 0))}L${fx(fm(u, 1))}`} stroke={FLOOR_S} strokeWidth={3} opacity={0.8} />;
      })}
      {[0.12, 0.3, 0.55].map((v, i) => (
        <path key={`j${i}`} d={Array.from({ length: 6 }, (_, k) => { const u = (k * 2 + (i % 2)) / 12; return `M${fx(fm(u, v))}L${fx(fm(u + 1 / 12, v))}`; }).join("")} stroke={FLOOR_S} strokeWidth={2.4} opacity={0.7} />
      ))}
      <rect x={0} y={1290} width={W} height={18} fill="#7a4a20" opacity={0.6} />
      {/* display counter, right */}
      <Part d="M930,1010 L1100,990 L1100,1460 L930,1440Z" fill="#8a5426" shade="#5e3612" lw={4}>
        <path d="M930,1060 L1100,1040" stroke={INK} strokeWidth={3} />
      </Part>
      <Part d="M920,960 L1100,940 L1100,1010 L930,1030Z" fill="#7a3aa8" shade="#4e2070" lw={4} />
      <Part d="M940,880 L1000,872 L1000,960 L940,966Z" fill="#c9a8e8" shade="#9a78c4" lw={3} />
      <rect x={0} y={0} width={W} height={H} fill={`url(#${id}-light)`} />
    </g>
  );
};

/* ---------------------------------- other sets ---------------------------------- */

/** looking straight up at the checker ceiling, soft-focus */
export const CeilingUp: React.FC<{ t: number }> = ({ t }) => {
  const k = 1 + t * 0.06;
  return (
    <g transform={`translate(540,960) scale(${k}) translate(-540,-960)`}>
      <rect width={W} height={H} fill="#f2eef8" />
      <Checker q={[[-500, -900], [1600, -900], [2600, 2900], [-1500, 2900]]} nu={6} nv={5} blur={14} id="ceilUp" />
    </g>
  );
};

/** the worm's-eye view: diamond checker ceiling with the top of the sword racks peeking in at the bottom */
export const CeilingLow: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#efeaf6" />
    <g transform="translate(540,700) rotate(45) translate(-540,-700)">
      <Checker q={[[-900, -900], [2000, -900], [2300, 2300], [-1200, 2300]]} nu={9} nv={9} blur={2} id="ceilLow" />
    </g>
    {/* the tops of the walls, converging: wood beam, racks of hilts */}
    <Part d="M-40,1500 L560,1360 L1120,1520 L1120,1980 L-40,1980Z" fill="#a9c45a" shade="#86a040" lw={5} />
    <Part d="M-40,1500 L560,1360 L1120,1520 L1120,1560 L560,1400 L-40,1540Z" fill={WOOD} shade={WOOD_S} lw={4} />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <path d={`M${40 + i * 60},${1600 + i * 60} l300,-70`} stroke="#d8dce8" strokeWidth={10} strokeLinecap="round" />
        <path d={`M${1040 - i * 60},${1610 + i * 60} l-300,-70`} stroke="#d8dce8" strokeWidth={10} strokeLinecap="round" />
      </g>
    ))}
    <Crest x={560} y={1520} s={0.7} />
  </g>
);

/** dark blue void with a soft vignette — the top-down shot */
export const BlueVoid: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="bluevoid" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0" stopColor="#0a1430" /><stop offset="0.6" stopColor="#0c1c4a" /><stop offset="1" stopColor="#1a3a9a" />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#bluevoid)" />
  </g>
);

export const DarkVoid: React.FC<{ c?: string }> = ({ c = "#0d0d16" }) => <rect width={W} height={H} fill={c} />;

/** floor-level close-up: barrel, lime wall, skirting, warm planks */
export const FloorClose: React.FC = () => {
  const fm = quadMap([[-400, 980], [1480, 980], [3000, 2300], [-1900, 2300]]);
  return (
    <g>
      <rect width={W} height={1000} fill="#c8de8a" />
      <rect y={60} width={W} height={40} fill={WOOD} />
      <path d="M0,60 L1080,60 M0,100 L1080,100" stroke={INK} strokeWidth={4} />
      {[200, 420, 650, 900].map((x) => <path key={x} d={`M${x},180 q10,30 -4,60 M${x + 40},400 q-8,24 4,50`} stroke="#a8c070" strokeWidth={3} fill="none" />)}
      <rect y={900} width={W} height={80} fill={WOOD} />
      <path d="M0,900 L1080,900 M0,980 L1080,980" stroke={INK} strokeWidth={4} />
      <path d="M-400,980 L1480,980 L3000,2300 L-1900,2300Z" fill="#cf9558" />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${fx(fm(i / 13, 0))}L${fx(fm(i / 13, 1))}`} stroke="#a26a36" strokeWidth={3.4} />)}
      {[0.15, 0.4, 0.7].map((v, i) => <path key={`h${i}`} d={`M${fx(fm(0, v))}L${fx(fm(1, v))}`} stroke="#a26a36" strokeWidth={2.6} opacity={0.6} />)}
      <rect y={980} width={W} height={940} fill="url(#floorGlow)" />
      <defs>
        <radialGradient id="floorGlow" cx="0.55" cy="0.2" r="0.8"><stop offset="0" stopColor="#ffe6b0" stopOpacity={0.45} /><stop offset="1" stopColor="#ffe6b0" stopOpacity={0} /></radialGradient>
      </defs>
      {/* the barrel */}
      <Part d="M-80,300 Q90,280 250,300 Q290,620 250,960 Q90,990 -80,960Z" fill="#d49a48" shade="#a06a26" lw={5}>
        {[20, 80, 140, 200].map((x) => <path key={x} d={`M${x},290 Q${x + 26},620 ${x},970`} stroke="#9a6224" strokeWidth={3} fill="none" />)}
      </Part>
      {[340, 640, 900].map((y) => (
        <g key={y}>
          <path d={`M-80,${y} Q90,${y - 16} 262,${y}`} stroke="#8a8e98" strokeWidth={26} fill="none" />
          <path d={`M-80,${y} Q90,${y - 16} 262,${y}`} stroke={INK} strokeWidth={30} fill="none" opacity={0.25} />
          {[0, 60, 120, 180, 230].map((x) => <circle key={x} cx={x} cy={y - 8 + Math.abs(x - 90) * 0.06} r={4.5} fill="#c8ccd6" stroke={INK} strokeWidth={1.4} />)}
        </g>
      ))}
    </g>
  );
};

/** black stage with a sickly-green spotlight cone */
export const Spotlight: React.FC<{ on: number }> = ({ on }) => (
  <g>
    <rect width={W} height={H} fill="#07070a" />
    <defs>
      <linearGradient id="spot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a8c070" stopOpacity={0.15 * on} />
        <stop offset="0.6" stopColor="#7c9a48" stopOpacity={0.45 * on} />
        <stop offset="1" stopColor="#5a7a34" stopOpacity={0.6 * on} />
      </linearGradient>
      <filter id="spotBlur"><feGaussianBlur stdDeviation={18} /></filter>
    </defs>
    <path d="M440,-20 L640,-20 L960,1820 L120,1820Z" fill="url(#spot)" filter="url(#spotBlur)" />
    <ellipse cx={540} cy={1800} rx={430} ry={90} fill="#6e8c40" opacity={0.5 * on} filter="url(#spotBlur)" />
  </g>
);

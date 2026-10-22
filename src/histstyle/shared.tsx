import React from "react";
import { continueRender, delayRender, Easing, interpolate, staticFile } from "remotion";

// ── History style tests: what all four looks share ───────────────────
//
// Four candidate looks for the history videos, each telling the same ten
// seconds of Waterloo so they can be compared on the same footing:
//
//   0–5 s   over Napoleon's shoulder as the French columns go in
//   5–10 s  the map: the two lines, then the Prussians arriving
//
// What keeps them from looking generated is the craft layer, which lives
// here: a fixed palette per style, one line weight, real typefaces, paper
// and film grain, and motion on twos or threes where a hand would draw it.

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 300;
export const SHOT2 = 150; // the map starts here
export const XFADE = 12; // overlap for the cut into the map

export const FONT = {
  fell: "'IM Fell English', Georgia, serif",
  fellSC: "'IM Fell English SC', Georgia, serif",
  playfair: "'Playfair Display', Georgia, serif",
  oswald: "Oswald, 'Arial Narrow', sans-serif",
  bebas: "'Bebas Neue', Oswald, sans-serif",
  montserrat: "Montserrat, 'Segoe UI', sans-serif",
  anton: "Anton, Impact, sans-serif",
};

let started = false;
export const useHistFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("loading history-style fonts");
  const face = (family: string, file: string, desc: FontFaceDescriptors = {}) =>
    new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("truetype")`, desc);
  const faces = [
    face("IM Fell English", "IMFellEnglish-Regular.ttf"),
    face("IM Fell English", "IMFellEnglish-Italic.ttf", { style: "italic" }),
    face("IM Fell English SC", "IMFellEnglishSC-Regular.ttf"),
    face("Playfair Display", "PlayfairDisplay-Variable.ttf", { weight: "400 900" }),
    face("Playfair Display", "PlayfairDisplay-Italic-Variable.ttf", { weight: "400 900", style: "italic" }),
    face("Oswald", "Oswald-Variable.ttf", { weight: "200 700" }),
    face("Bebas Neue", "BebasNeue-Regular.ttf"),
    face("Montserrat", "Montserrat-Variable.ttf", { weight: "100 900" }),
    face("Anton", "Anton-Regular.ttf"),
    face("Poppins", "Poppins-Black.ttf", { weight: "900" }),
  ];
  Promise.all(faces.map((f) => f.load().then((l) => document.fonts.add(l))))
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};

// ── timing helpers ────────────────────────────────────────────────────

export const EASE = Easing.bezier(0.45, 0, 0.2, 1);
export const EASE_OUT = Easing.bezier(0.15, 0.6, 0.25, 1);

/** 0→1 between frames a and b, clamped and eased. */
export const prog = (f: number, a: number, b: number, easing = EASE) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Hold each drawing for n frames, the way hand animation is shot on twos. */
export const onN = (f: number, n: number) => Math.floor(f / n) * n;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Cheap deterministic hash → 0..1, for scattering things without Math.random. */
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ── the narration, as each style captions it ──────────────────────────

export const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: 18, to: 78, text: "How did Napoleon lose" },
  { from: 78, to: 146, text: "everything in one afternoon?" },
  { from: 168, to: 222, text: "He thought he faced one army." },
  { from: 222, to: 300, text: "Then the Prussians arrived." },
];
export const captionAt = (f: number) => CAPTIONS.find((c) => f >= c.from && f < c.to) ?? null;

// ── figures ───────────────────────────────────────────────────────────
//
// Napoleon from behind on the ridge: bicorne worn side-on, greatcoat, hands
// clasped at his back. Box 300×700, feet on y = 700, centred on x = 150.

export const NAP = {
  hat: "M48,96 C60,70 88,54 116,48 C132,34 168,34 184,48 C212,54 240,70 252,96 C238,94 218,89 198,91 C170,98 130,98 102,91 C82,89 62,94 48,96 Z",
  head: "M122,90 C118,118 126,140 150,144 C174,140 182,118 178,90 Z",
  collar: "M110,122 C124,114 176,114 190,122 L196,156 L104,156 Z",
  coat:
    "M104,148 C84,154 70,170 67,198 C63,236 66,270 72,306 C64,390 56,490 48,580 C110,598 190,598 252,580 C244,490 236,390 228,306 C234,270 237,236 233,198 C230,170 216,154 196,148 C174,142 126,142 104,148 Z",
  legs:
    "M100,584 L98,640 C97,668 96,684 92,692 C88,696 80,698 78,700 L140,700 C142,690 142,670 142,640 L144,584 Z M156,584 L158,640 C158,670 158,690 160,700 L222,700 C220,698 212,696 208,692 C204,684 203,668 202,640 L200,584 Z",
  // inner lines for styles that draw detail over the silhouette
  seams: [
    "M150,322 L150,590", // back vent
    "M72,306 C100,320 128,330 150,334 C172,330 200,320 228,306", // the clasped arms
    "M84,200 C92,246 100,286 114,326", // left arm
    "M216,200 C208,246 200,286 186,326",
    "M104,172 C130,180 170,180 196,172", // shoulder cape
  ],
};

export const Napoleon: React.FC<{
  x: number;
  y: number; // feet
  scale?: number;
  fill: string;
  stroke?: string;
  seam?: string;
  seamWidth?: number;
  coatFill?: string;
  hatFill?: string;
  legFill?: string;
  filter?: string;
}> = ({ x, y, scale = 1, fill, stroke, seam, seamWidth = 3, coatFill, hatFill, legFill, filter }) => (
  <g transform={`translate(${x - 150 * scale},${y - 700 * scale}) scale(${scale})`} filter={filter}>
    <path d={NAP.legs} fill={legFill ?? fill} stroke={stroke} strokeWidth={stroke ? 3 : 0} strokeLinejoin="round" />
    <path d={NAP.coat} fill={coatFill ?? fill} stroke={stroke} strokeWidth={stroke ? 3 : 0} strokeLinejoin="round" />
    <path d={NAP.collar} fill={coatFill ?? fill} stroke={stroke} strokeWidth={stroke ? 3 : 0} strokeLinejoin="round" />
    <path d={NAP.head} fill={fill} stroke={stroke} strokeWidth={stroke ? 3 : 0} />
    <path d={NAP.hat} fill={hatFill ?? fill} stroke={stroke} strokeWidth={stroke ? 3 : 0} strokeLinejoin="round" />
    {seam &&
      NAP.seams.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={seam} strokeWidth={seamWidth} strokeLinecap="round" />
      ))}
  </g>
);

/**
 * A line infantryman, facing the viewer's right, feet at the origin, about
 * 84 units tall to the bayonet tip. Drawn small and in ranks.
 */
export const SOLDIER = {
  body:
    "M-8,-46 C-8,-50 8,-50 8,-46 L9,-22 L5,-22 L5,0 L1,0 L1,-20 L-1,-20 L-1,0 L-5,0 L-5,-22 L-9,-22 Z",
  head: "M-4,-48 a4.5,4.5 0 1,1 8,0 Z M-4.5,-50 C-4.5,-56 4.5,-56 4.5,-50 Z",
  shako: "M-5,-53 L-5.5,-65 L5.5,-65 L5,-53 Z M-1,-65 L-1.5,-71 L1.5,-71 L1,-65 Z",
  musket: "M7,-14 L9.6,-78 L11,-78 L8.6,-14 Z",
  bayonet: "M9.8,-78 L10.3,-92 L10.8,-78 Z",
  belts: "M-7,-45 L7,-26 M7,-45 L-7,-26",
};

export const Soldier: React.FC<{
  x: number;
  y: number;
  s?: number;
  fill: string;
  steel?: string;
  belts?: string;
  flip?: boolean;
  bob?: number;
  outline?: string;
}> = ({ x, y, s = 1, fill, steel, belts, flip, bob = 0, outline }) => (
  <g
    transform={`translate(${x},${y + bob}) scale(${flip ? -s : s},${s})`}
    stroke={outline}
    strokeWidth={outline ? 2.2 : 0}
    paintOrder="stroke"
    strokeLinejoin="round"
  >
    <path d={SOLDIER.musket} fill={steel ?? fill} />
    <path d={SOLDIER.bayonet} fill={steel ?? fill} />
    <path d={SOLDIER.body} fill={fill} />
    <path d={SOLDIER.head} fill={fill} />
    <path d={SOLDIER.shako} fill={fill} />
    {belts && <path d={SOLDIER.belts} stroke={belts} strokeWidth={1.6} fill="none" />}
  </g>
);

/** A block of soldiers, ranks staggered, for columns and lines. */
export const Ranks: React.FC<{
  x: number;
  y: number;
  cols: number;
  rows: number;
  dx: number;
  dy: number;
  s: number;
  fill: string | ((row: number) => string);
  steel?: string;
  belts?: string;
  flip?: boolean;
  march?: number; // frame, for the bob of a marching column
  shear?: number; // x shift per row, for a column seen at an angle
  outline?: string;
}> = ({ x, y, cols, rows, dx, dy, s, fill, steel, belts, flip, march, shear = 0, outline }) => {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = r * 31 + c * 7;
      const bob = march === undefined ? 0 : Math.abs(Math.sin((march + k * 3) / 4.5)) * -2.2 * s;
      out.push(
        <Soldier
          key={k}
          x={x + c * dx + r * shear + (r % 2) * dx * 0.5 + (hash(k) - 0.5) * dx * 0.25}
          y={y + r * dy}
          s={s * (1 + r * 0.04)}
          fill={typeof fill === "function" ? fill(r) : fill}
          steel={steel}
          belts={belts}
          flip={flip}
          bob={bob}
          outline={outline}
        />,
      );
    }
  }
  return <g>{out}</g>;
};

/** A cannon-smoke cloud: overlapping puffs that grow and drift as it ages. */
export const smokePuffs = (seed: number, age: number, size: number) => {
  const puffs: { x: number; y: number; r: number }[] = [];
  const grow = 1 - Math.exp(-age / 30);
  for (let i = 0; i < 7; i++) {
    const a = hash(seed * 13 + i) * Math.PI * 2;
    const d = hash(seed * 7 + i * 3) * 0.9;
    puffs.push({
      x: Math.cos(a) * d * size * grow * 1.3 + age * 0.35,
      y: Math.sin(a) * d * size * grow * 0.55 - age * 0.25 - i * size * 0.06,
      r: size * (0.35 + hash(seed + i * 5) * 0.4) * (0.4 + grow * 0.8),
    });
  }
  return puffs;
};

// ── the map ───────────────────────────────────────────────────────────
//
// The field of Waterloo in 1000×1000 map units, north up, roughly true to
// the 1815 layout: Wellington along the Mont-Saint-Jean ridge, the French
// across the valley at La Belle Alliance, Plancenoit in the south-east
// where Bülow's Prussians came in from Wavre.

export type Pt = [number, number];
export type Bez = [Pt, Pt, Pt, Pt];

export const MAP = {
  roads: [
    "M500,0 C505,200 512,420 522,640 C528,780 538,900 545,1000", // Brussels–Charleroi
    "M502,230 C430,360 300,560 90,1000", // Nivelles
    "M90,318 C300,334 640,322 980,292", // the Ohain lane along the ridge
  ],
  river: "M1000,40 C900,110 960,240 1000,300",
  allyRidge: "M60,262 C300,282 700,272 960,240 L980,360 C700,380 300,388 60,372 Z",
  frenchRidge: "M100,610 C340,630 660,640 940,600 L940,700 C660,724 340,720 100,700 Z",
  woods: [
    { x: 235, y: 470, rx: 70, ry: 48 }, // Hougoumont wood
    { x: 905, y: 540, rx: 80, ry: 120 }, // Bois de Paris
    { x: 120, y: 130, rx: 90, ry: 60 },
  ],
  places: [
    { name: "Hougoumont", x: 250, y: 440, anchor: "middle" as const },
    { name: "La Haye Sainte", x: 525, y: 395, anchor: "start" as const },
    { name: "Papelotte", x: 790, y: 395, anchor: "middle" as const },
    { name: "La Belle Alliance", x: 535, y: 662, anchor: "start" as const },
    { name: "Plancenoit", x: 840, y: 770, anchor: "middle" as const },
  ],
  allies: [
    [150, 300, 120, 26],
    [290, 306, 120, 26],
    [430, 308, 110, 26],
    [566, 304, 110, 26],
    [700, 296, 110, 26],
    [330, 236, 90, 20],
    [600, 232, 90, 20],
  ] as [number, number, number, number][],
  french: [
    [170, 596, 120, 26],
    [310, 606, 120, 26],
    [450, 612, 110, 26],
    [580, 610, 110, 26],
    [712, 600, 110, 26],
    [470, 708, 110, 30], // the Guard
  ] as [number, number, number, number][],
  prussians: [
    [
      [1060, 120],
      [1000, 260],
      [940, 560],
      [860, 735],
    ],
    [
      [1060, 40],
      [1000, 110],
      [920, 250],
      [810, 360],
    ],
  ] as Bez[],
};

const bezPt = (b: Bez, t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u, c = 3 * u * u * t, d = 3 * u * t * t, e = t * t * t;
  return [a * b[0][0] + c * b[1][0] + d * b[2][0] + e * b[3][0], a * b[0][1] + c * b[1][1] + d * b[2][1] + e * b[3][1]];
};

/** The first t of a cubic, as a new cubic (de Casteljau). */
export const bezHead = (b: Bez, t: number): Bez => {
  const L = (p: Pt, q: Pt): Pt => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  const p01 = L(b[0], b[1]), p12 = L(b[1], b[2]), p23 = L(b[2], b[3]);
  const p012 = L(p01, p12), p123 = L(p12, p23);
  return [b[0], p01, p012, L(p012, p123)];
};

export const bezD = (b: Bez) =>
  `M${b[0][0]},${b[0][1]} C${b[1][0]},${b[1][1]} ${b[2][0]},${b[2][1]} ${b[3][0]},${b[3][1]}`;

/**
 * A filled campaign arrow along the first t of a curve: the body tapers
 * from w0 to w1 and ends in a head. One closed path, so any style can fill,
 * stroke, hatch or print it.
 */
export const arrowD = (b: Bez, t: number, w0: number, w1: number, headLen: number, headW: number) => {
  if (t <= 0.001) return "";
  const N = 40;
  const pts: Pt[] = [];
  for (let i = 0; i <= N; i++) pts.push(bezPt(b, (i / N) * t));
  // trim the body so the head sits on the end
  let len = 0;
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    cum.push(len);
  }
  const hl = Math.min(headLen, len * 0.6);
  const bodyEnd = len - hl;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    if (cum[i] > bodyEnd && i > 0) break;
    const p = pts[i];
    const q = pts[Math.min(i + 1, pts.length - 1)];
    const o = pts[Math.max(i - 1, 0)];
    let tx = q[0] - o[0], ty = q[1] - o[1];
    const m = Math.hypot(tx, ty) || 1;
    tx /= m; ty /= m;
    const w = lerp(w0, w1, cum[i] / Math.max(bodyEnd, 1)) / 2;
    left.push([p[0] - ty * w, p[1] + tx * w]);
    right.push([p[0] + ty * w, p[1] - tx * w]);
  }
  const tip = pts[pts.length - 1];
  const back = pts[Math.max(0, pts.length - 4)];
  let tx = tip[0] - back[0], ty = tip[1] - back[1];
  const m = Math.hypot(tx, ty) || 1;
  tx /= m; ty /= m;
  const base: Pt = [tip[0] - tx * hl, tip[1] - ty * hl];
  const hw = headW / 2;
  const f = (p: Pt) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  return [
    `M${f(left[0])}`,
    ...left.slice(1).map((p) => `L${f(p)}`),
    `L${f([base[0] - ty * hw, base[1] + tx * hw])}`,
    `L${f(tip)}`,
    `L${f([base[0] + ty * hw, base[1] - tx * hw])}`,
    ...right.reverse().map((p) => `L${f(p)}`),
    "Z",
  ].join(" ");
};

/** Where a drawn arrow currently ends, for a label to ride. */
export const arrowTip = (b: Bez, t: number) => bezPt(b, Math.max(t, 0.001));

// ── texture ───────────────────────────────────────────────────────────

/**
 * Film / print grain over the whole frame. The noise is re-seeded every
 * `every` frames so it crawls like real grain instead of sitting still.
 */
export const Grain: React.FC<{ frame: number; opacity: number; every?: number; freq?: number; blend?: string; id: string }> = ({
  frame,
  opacity,
  every = 2,
  freq = 0.9,
  blend = "overlay",
  id,
}) => (
  <svg
    width={W}
    height={H}
    style={{ position: "absolute", inset: 0, mixBlendMode: blend as React.CSSProperties["mixBlendMode"], opacity, pointerEvents: "none" }}
  >
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={onN(frame, every)} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={W} height={H} filter={`url(#${id})`} />
  </svg>
);

/** A soft dark edge, the way a lens or a printed page falls off. */
export const Vignette: React.FC<{ strength: number; color?: string }> = ({ strength, color = "0,0,0" }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(${color},0) 55%, rgba(${color},${strength}) 100%)`,
    }}
  />
);

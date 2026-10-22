import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import {
  FONT,
  Grain,
  MAP,
  Napoleon,
  NAP,
  Ranks,
  SHOT2,
  XFADE,
  arrowD,
  arrowTip,
  captionAt,
  hash,
  lerp,
  onN,
  prog,
  smokePuffs,
  useHistFonts,
} from "./shared";

// ── Style A · Ink & Parchment ─────────────────────────────────────────
//
// A hand-tinted steel engraving from an 1830s history book, set moving.
// Everything is ink lines on laid paper: skies in ruled lines that thin
// toward the horizon, shade in crosshatch, ground in contour strokes. Colour
// is a watercolour wash laid over afterwards, slightly off the lines the way
// a colourist's brush is. The ink "boils" on threes, so it reads as drawn.

const PAPER = "#eadfc4";
const INK = "#2a1d12";
const RED = "#b3352b";
const BLUE = "#2f5a8f";
const PLATE = { x: 60, y: 150, w: 960, h: 1270 };

// the far ridge crest (Wellington's), the near ridge (Napoleon's), in frame px
const farCrest = (x: number) => 832 - (x - 60) * 0.035 + Math.sin(x / 95) * 7;
const nearCrest = (x: number) => 1185 + Math.pow((x - 60) / 960, 1.6) * 120 - Math.sin(x / 160) * 14;

const curve = (fn: (x: number) => number, dy = 0, x0 = PLATE.x, x1 = PLATE.x + PLATE.w, step = 12) => {
  let d = `M${x0},${fn(x0) + dy}`;
  for (let x = x0 + step; x <= x1 + step; x += step) d += ` L${Math.min(x, x1)},${(fn(Math.min(x, x1)) + dy).toFixed(1)}`;
  return d;
};

const Defs: React.FC<{ f: number }> = ({ f }) => (
  <defs>
    <pattern id="eg-a" width="4.2" height="4.2" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
      <path d="M0,2.1 H4.2" stroke={INK} strokeWidth={1.8} />
    </pattern>
    <pattern id="eg-b" width="4.4" height="4.4" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
      <path d="M0,2.2 H4.4" stroke={INK} strokeWidth={1.6} />
    </pattern>
    <pattern id="eg-c" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(90)">
      <path d="M0,2 H4" stroke={INK} strokeWidth={1.3} />
    </pattern>
    <pattern id="eg-light" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
      <path d="M0,3.5 H7" stroke={INK} strokeWidth={0.9} />
    </pattern>
    <linearGradient id="eg-lit" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor="#000" />
      <stop offset="0.38" stopColor="#000" />
      <stop offset="0.62" stopColor="#fff" />
    </linearGradient>
    <mask id="eg-shadowside" maskUnits="userSpaceOnUse">
      <rect x="0" y="0" width="300" height="700" fill="url(#eg-lit)" />
    </mask>
    {/* the ink boils: displacement re-seeded every third frame */}
    <filter id="eg-boil" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={onN(f, 3)} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    {/* the colourist's wash: soft, ragged edges */}
    <filter id="eg-wash" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={3} seed={7} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feGaussianBlur in="d" stdDeviation="1.6" />
    </filter>
  </defs>
);

/** Clouds and smoke, drawn the engraver's way: an outline round the union, ruled shade underneath. */
const InkCloud: React.FC<{
  id: string;
  puffs: { x: number; y: number; r: number }[];
  x: number;
  y: number;
  shade?: number;
  base?: number; // cut flat here, the way a cumulus sits on its condensation line
  sx?: number;
  sy?: number;
}> = ({ id, puffs, x, y, shade = 0.55, base = 9999, sx = 1, sy = 1 }) => {
  const top = Math.min(...puffs.map((p) => p.y - p.r));
  const bot = Math.min(base, Math.max(...puffs.map((p) => p.y + p.r)));
  const lines: React.ReactNode[] = [];
  for (let yy = lerp(top, bot, 1 - shade); yy < bot; yy += 4.2) {
    const k = (yy - lerp(top, bot, 1 - shade)) / (bot - top);
    lines.push(<line key={yy} x1={-400} x2={400} y1={yy} y2={yy} stroke={INK} strokeWidth={0.5 + k * 2.2} />);
  }
  return (
    <g transform={`translate(${x},${y}) scale(${sx},${sy})`}>
      <clipPath id={`${id}-b`}>
        <rect x={-600} y={-600} width={1200} height={600 + Math.min(base, 600)} />
      </clipPath>
      <g clipPath={`url(#${id}-b)`}>
      <clipPath id={id}>
        {puffs.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} />
        ))}
      </clipPath>
      {puffs.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="none" stroke={INK} strokeWidth={2.6} />
      ))}
      {puffs.map((p, i) => (
        <circle key={`f${i}`} cx={p.x} cy={p.y} r={p.r} fill={PAPER} />
      ))}
      <g clipPath={`url(#${id})`}>{lines}</g>
      </g>
    </g>
  );
};

const bank = (seed: number, n: number, w: number, r: number) =>
  Array.from({ length: n }, (_, i) => {
    const u = i / (n - 1);
    const lift = Math.sin(u * Math.PI);
    return { x: (u - 0.5) * w + (hash(seed + i) - 0.5) * r * 0.6, y: -lift * r * 0.9 - hash(seed * 3 + i) * r * 0.4, r: r * (0.55 + lift * 0.6 + hash(seed + i * 7) * 0.25) };
  });

const SKY_CLOUDS = [
  { x: 300, y: 640, puffs: bank(3, 9, 440, 46), base: 22 },
  { x: 820, y: 560, puffs: bank(9, 7, 300, 38), base: 18 },
];

const CANNON = [
  { x: 210, y: 846, t0: -60, s: 34 },
  { x: 610, y: 822, t0: -20, s: 40 },
  { x: 900, y: 806, t0: 30, s: 30 },
  { x: 330, y: 840, t0: 70, s: 30 },
];

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const push = prog(f, 0, SHOT2 + 10, Easing.linear);
  const cam = (depth: number) =>
    `translate(${540 - push * 22 * depth},${900}) scale(${1 + push * 0.07 * depth}) translate(-540,-900)`;

  // the sky, ruled: heavy at the top, hairlines at the horizon
  const sky: React.ReactNode[] = [];
  for (let y = PLATE.y; y < 860; y += 6.5) {
    const k = (y - PLATE.y) / (860 - PLATE.y);
    sky.push(<line key={y} x1={PLATE.x} x2={PLATE.x + PLATE.w} y1={y} y2={y} stroke={INK} strokeWidth={lerp(2.3, 0.35, Math.pow(k, 0.8))} />);
  }

  // the valley floor, ruled with the spacing opening up toward us
  const field: React.ReactNode[] = [];
  for (let i = 0, y = 846; y < 1300; i++, y += 4 + i * 0.55) {
    field.push(
      <path
        key={i}
        d={curve((x) => y + Math.sin(x / 140 + i) * 3, 0)}
        stroke={INK}
        strokeWidth={0.45 + i * 0.035}
        strokeDasharray={`${60 + hash(i) * 160} ${6 + hash(i + 9) * 18} ${30 + hash(i + 3) * 90} ${4 + hash(i + 5) * 30}`}
        strokeDashoffset={hash(i + 1) * 200}
        fill="none"
      />,
    );
  }

  // the near ridge: contour strokes under the crest, crosshatch at the bottom
  const near: React.ReactNode[] = [];
  for (let i = 0; i < 34; i++) near.push(<path key={i} d={curve(nearCrest, 6 + i * 7.5)} stroke={INK} strokeWidth={1 + i * 0.07} fill="none" />);
  const tufts: React.ReactNode[] = [];
  for (let x = PLATE.x; x < PLATE.x + PLATE.w; x += 9) {
    const y = nearCrest(x);
    const h = 8 + hash(x) * 16;
    tufts.push(<path key={x} d={`M${x},${y + 4} q${2 + hash(x + 1) * 4},${-h * 0.6} ${(hash(x + 2) - 0.3) * 10},${-h}`} stroke={INK} strokeWidth={1.4} fill="none" />);
  }

  const nearShape = `${curve(nearCrest)} L${PLATE.x + PLATE.w},${PLATE.y + PLATE.h} L${PLATE.x},${PLATE.y + PLATE.h} Z`;
  const farShape = `${curve(farCrest)} L${PLATE.x + PLATE.w},1300 L${PLATE.x},1300 Z`;

  // the standard by Napoleon, the cloth drawn on twos
  const ff = onN(f, 2);
  const flagPts = (yOff: number) => {
    let d = "";
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      const x = 486 + u * 150;
      const y = 905 + yOff + Math.sin(u * 5 - ff / 5) * 10 * u + u * 12;
      d += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)} `;
    }
    return d;
  };
  const flagTop = flagPts(0);
  const flagBot = flagPts(100).split(" ").filter(Boolean).reverse().map((s) => "L" + s.slice(1)).join(" ");
  const flag = `${flagTop} ${flagBot} Z`;

  return (
    <g>
      <g transform={cam(0.3)}>
        <g filter="url(#eg-boil)">{sky}</g>
        {SKY_CLOUDS.map((c, i) => (
          <g key={i} transform={`translate(${-push * 30 * (i + 1)},0)`} filter="url(#eg-boil)">
            <InkCloud id={`eg-sky${i}`} x={c.x} y={c.y} puffs={c.puffs} shade={0.5} base={c.base} />
          </g>
        ))}
      </g>

      {/* Wellington's ridge, and his line along it */}
      <g transform={cam(0.55)}>
        <g filter="url(#eg-boil)">
          <path d={farShape} fill={PAPER} />
          <clipPath id="eg-far">
            <path d={farShape} />
          </clipPath>
          <g clipPath="url(#eg-far)">{field}</g>
          <path d={curve(farCrest)} stroke={INK} strokeWidth={2.4} fill="none" />
          {[140, 418, 436, 760, 960, 975].map((x, i) => (
            <g key={x}>
              <ellipse cx={x} cy={farCrest(x) - 34 - hash(i) * 8} rx={9} ry={34 + hash(i) * 8} fill={PAPER} stroke={INK} strokeWidth={1.6} />
              <ellipse cx={x} cy={farCrest(x) - 34 - hash(i) * 8} rx={9} ry={34 + hash(i) * 8} fill="url(#eg-b)" />
            </g>
          ))}
          <g transform={`translate(560,${farCrest(560) + 26})`}>
            <path d="M-40,0 V-22 L-28,-36 H18 L30,-22 V0 Z" fill={PAPER} stroke={INK} strokeWidth={1.8} />
            <path d="M-40,-22 L-28,-36 H18 L30,-22 Z" fill="url(#eg-a)" />
            <path d="M30,0 V-14 L44,-22 L56,-14 V0 Z" fill="url(#eg-b)" stroke={INK} strokeWidth={1.6} />
            <rect x={-24} y={-14} width={7} height={9} fill={INK} />
            <rect x={-4} y={-14} width={7} height={9} fill={INK} />
          </g>
          {[0, 1].map((r) =>
            [120, 300, 470, 650, 830].map((x) => (
              <Ranks key={`${r}${x}`} x={x} y={farCrest(x) + 6 + r * 7} cols={9} rows={1} dx={11} dy={0} s={0.36} fill={INK} />
            )),
          )}
        </g>
        <g filter="url(#eg-wash)" style={{ mixBlendMode: "multiply" }}>
          {[120, 300, 470, 650, 830].map((x) => (
            <rect key={x} x={x - 8} y={farCrest(x) - 22} width={112} height={28} fill={RED} opacity={0.75} />
          ))}
        </g>
      </g>

      {/* the French columns going in across the valley */}
      <g transform={cam(0.8)}>
        <g filter="url(#eg-boil)">
          {[
            { x: 120, y: 958, s: 0.6, cols: 8, rows: 3 },
            { x: 560, y: 990, s: 0.68, cols: 7, rows: 3 },
            { x: 250, y: 1090, s: 0.84, cols: 8, rows: 3 },
          ].map((b, i) => (
            <g key={i} transform={`translate(${f * 0.18},${-f * 0.12})`}>
              <Ranks x={b.x} y={b.y} cols={b.cols} rows={b.rows} dx={17 * b.s} dy={11 * b.s} s={b.s} fill={INK} march={f} shear={-3} outline={PAPER} />
            </g>
          ))}
        </g>
        <g filter="url(#eg-wash)" style={{ mixBlendMode: "multiply" }} opacity={0.8}>
          {[
            { x: 120, y: 958, s: 0.6, cols: 8 },
            { x: 560, y: 990, s: 0.68, cols: 7 },
            { x: 250, y: 1090, s: 0.84, cols: 8 },
          ].map((b, i) => (
            <rect key={i} x={b.x - 8 * b.s + f * 0.18} y={b.y - 48 * b.s - f * 0.12} width={(b.cols * 17 + 12) * b.s} height={50 * b.s} fill={BLUE} />
          ))}
        </g>
        {CANNON.map((c, i) =>
          f >= c.t0 ? (
            <g key={i} filter="url(#eg-boil)">
              <InkCloud id={`eg-smoke${i}`} x={c.x} y={c.y} puffs={smokePuffs(i + 3, f - c.t0 + 20, c.s)} sx={1.7} sy={0.75} shade={0.4} />
            </g>
          ) : null,
        )}
      </g>

      {/* the near ridge, the standard, the man */}
      <g transform={cam(1.15)}>
        <g filter="url(#eg-boil)">
          <path d={nearShape} fill={PAPER} />
          <clipPath id="eg-near">
            <path d={nearShape} />
          </clipPath>
          <g clipPath="url(#eg-near)">
            {near}
          </g>
          {tufts}
          <line x1={486} y1={1240} x2={486} y2={880} stroke={INK} strokeWidth={5} />
          <path d="M478,882 l8,-26 l8,26 Z" fill={INK} />
          <path d={flag} fill="url(#eg-light)" stroke={INK} strokeWidth={2.4} />
          <g transform="translate(760,1266) scale(0.8) translate(-150,-700)">
            {(["legs", "coat", "collar", "head", "hat"] as const).map((k) => (
              <g key={k}>
                <path d={NAP[k]} fill={PAPER} />
                <path d={NAP[k]} fill="url(#eg-a)" />
                <path d={NAP[k]} fill="url(#eg-b)" mask="url(#eg-shadowside)" />
                <path d={NAP[k]} fill="url(#eg-c)" mask={k === "coat" ? "url(#eg-shadowside)" : undefined} />
                <path d={NAP[k]} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              </g>
            ))}
            {NAP.seams.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
            ))}
            <path d="M80,200 C74,260 72,330 70,420" stroke={PAPER} strokeWidth={3} fill="none" opacity={0.9} />
            <path d="M60,98 C80,74 110,58 140,52" stroke={PAPER} strokeWidth={3} fill="none" />
          </g>
        </g>
        <g filter="url(#eg-wash)" style={{ mixBlendMode: "multiply" }}>
          <path d={nearShape} fill="#8a7a3c" opacity={0.28} />
          <path d={flag} fill="none" />
          <clipPath id="eg-flagclip">
            <path d={flag} />
          </clipPath>
          <g clipPath="url(#eg-flagclip)">
            <rect x={480} y={880} width={58} height={150} fill={BLUE} opacity={0.85} />
            <rect x={586} y={880} width={60} height={150} fill={RED} opacity={0.85} />
          </g>
        </g>
      </g>

      {/* the colourist's sky */}
      <g filter="url(#eg-wash)" style={{ mixBlendMode: "multiply" }}>
        <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={330} fill="#6f8fa8" opacity={0.28} />
        <rect x={PLATE.x} y={730} width={PLATE.w} height={110} fill="#d4974a" opacity={0.25} />
      </g>
    </g>
  );
};

// the map, as a period cartographer would cut it
const crestA = (x: number) => 302 - (x - 60) * 0.03 + Math.sin(x / 90) * 8;
const crestF = (x: number) => 652 + (x - 100) * 0.015 + Math.sin(x / 70) * 6;

const MapPlate: React.FC<{ f: number }> = ({ f }) => {
  const push = prog(f, SHOT2, 300, Easing.linear);
  const hach: React.ReactNode[] = [];
  const ridge = (fn: (x: number) => number, x0: number, x1: number, south: number, north: number, key: string) => {
    for (let x = x0; x < x1; x += 6) {
      const y = fn(x);
      const ls = south * (0.7 + hash(x + key.length) * 0.5);
      const ln = north * (0.6 + hash(x * 3) * 0.6);
      hach.push(<line key={`${key}s${x}`} x1={x} y1={y + 3} x2={x + 2} y2={y + ls} stroke={INK} strokeWidth={1.7} />);
      hach.push(<line key={`${key}n${x}`} x1={x} y1={y - 3} x2={x - 1} y2={y - ln} stroke={INK} strokeWidth={1.1} />);
    }
  };
  ridge(crestA, 70, 960, 46, 22, "a");
  ridge(crestF, 110, 930, 22, 40, "f");

  const trees: React.ReactNode[] = [];
  MAP.woods.forEach((w, wi) => {
    for (let i = 0; i < 120; i++) {
      const a = hash(wi * 100 + i) * Math.PI * 2;
      const r = Math.sqrt(hash(wi * 100 + i + 50));
      const x = w.x + Math.cos(a) * r * w.rx;
      const y = w.y + Math.sin(a) * r * w.ry;
      const tr = 4 + hash(i * 3 + wi) * 2.5;
      trees.push(
        <g key={`${wi}-${i}`}>
          <path d={`M${x - tr + 1},${y + 1.5} a${tr},${tr} 0 0,0 ${tr * 2},0`} fill="none" stroke={INK} strokeWidth={2.4} />
          <circle cx={x} cy={y} r={tr} fill={PAPER} stroke={INK} strokeWidth={1.1} />
          <line x1={x} y1={y + tr} x2={x} y2={y + tr + 3} stroke={INK} strokeWidth={1.2} />
        </g>,
      );
    }
  });

  const unit = (u: [number, number, number, number], color: string, appear: number, i: number) => {
    const p = prog(f, appear + i * 4, appear + i * 4 + 10, Easing.out(Easing.cubic));
    const [x, y, w, h] = u;
    return (
      <g key={`${color}${i}`} transform={`translate(${x},${y + h / 2}) scale(1,${p}) translate(${-x},${-y - h / 2})`}>
        <rect x={x} y={y} width={w} height={h} fill={color} opacity={0.82} />
        <rect x={x} y={y} width={w} height={h / 2} fill="url(#eg-a)" />
        <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeWidth={2.2} />
      </g>
    );
  };

  const arrows = MAP.prussians.map((b, i) => {
    const t = prog(f, 214 + i * 22, 262 + i * 22, Easing.inOut(Easing.cubic));
    return { d: arrowD(b, t, 30, 22, 46, 64), t, tip: arrowTip(b, t) };
  });

  return (
    <g>
      {/* cartouche */}
      <g filter="url(#eg-boil)">
        <rect x={180} y={176} width={720} height={128} fill={PAPER} stroke={INK} strokeWidth={2} />
        <rect x={190} y={186} width={700} height={108} fill="none" stroke={INK} strokeWidth={1} />
        <text x={540} y={222} textAnchor="middle" fontFamily={FONT.fell} fontStyle="italic" fontSize={30} fill={INK}>
          A Plan of the
        </text>
        <text x={540} y={278} textAnchor="middle" fontFamily={FONT.fellSC} fontSize={56} letterSpacing={6} fill={INK}>
          Field of Waterloo
        </text>
      </g>
      <clipPath id="eg-mapclip">
        <rect x={PLATE.x + 14} y={324} width={PLATE.w - 28} height={PLATE.h - 188} />
      </clipPath>
      <g clipPath="url(#eg-mapclip)">
        <g transform={`translate(${540},${880}) scale(${1 + push * 0.06}) translate(${-540 - push * 14},${-880})`}>
          <g transform="translate(540,880) scale(1.06) translate(-520,-480)">
            <g filter="url(#eg-wash)" style={{ mixBlendMode: "multiply" }}>
              <rect x={-60} y={-60} width={1120} height={1120} fill="#9aa35a" opacity={0.18} />
              <path d={MAP.allyRidge} fill="#b07a3a" opacity={0.2} />
              <path d={MAP.frenchRidge} fill="#b07a3a" opacity={0.2} />
              <path d={MAP.river} stroke="#4f7fa8" strokeWidth={14} fill="none" opacity={0.5} />
            </g>
            <g filter="url(#eg-boil)">
              {hach}
              {trees}
              {MAP.roads.map((d, i) => (
                <g key={i}>
                  <path d={d} stroke={INK} strokeWidth={10} fill="none" />
                  <path d={d} stroke={PAPER} strokeWidth={6.5} fill="none" />
                </g>
              ))}
              <path d={MAP.river} stroke={INK} strokeWidth={2} fill="none" />
              {MAP.places.map((p) => (
                <rect key={p.name} x={p.x - 9} y={p.y - 40} width={18} height={16} fill={INK} />
              ))}
              {MAP.allies.map((u, i) => unit(u, RED, 160, i))}
              {MAP.french.map((u, i) => unit(u, BLUE, 170, i))}
              {arrows.map((a, i) => (
                <g key={i}>
                  <path d={a.d} fill={PAPER} />
                  <path d={a.d} fill="url(#eg-a)" />
                  <path d={a.d} fill="url(#eg-b)" />
                  <path d={a.d} fill="none" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
                </g>
              ))}
              {MAP.places.map((p) => (
                <text key={p.name} x={p.x + (p.anchor === "start" ? 16 : 0)} y={p.name === "Hougoumont" ? p.y - 52 : p.y - 2} textAnchor={p.anchor} fontFamily={FONT.fell} fontStyle="italic" fontSize={28} fill={INK} stroke={PAPER} strokeWidth={7} paintOrder="stroke">
                  {p.name}
                </text>
              ))}
              <g opacity={prog(f, 176, 196)}>
                <text x={420} y={186} textAnchor="middle" fontFamily={FONT.fellSC} fontSize={42} letterSpacing={8} fill={RED}>
                  Wellington
                </text>
                <text x={420} y={790} textAnchor="middle" fontFamily={FONT.fellSC} fontSize={42} letterSpacing={8} fill={BLUE}>
                  Napoleon
                </text>
              </g>
              <g opacity={prog(f, 232, 250)}>
                <text
                  x={0}
                  y={0}
                  transform="translate(862,222) rotate(-54)"
                  textAnchor="middle"
                  fontFamily={FONT.fellSC}
                  fontSize={44}
                  letterSpacing={9}
                  fill={INK}
                >
                  Blücher
                </text>
              </g>
            </g>
          </g>
        </g>
      </g>
      {/* compass */}
      <g transform="translate(176,1240)" filter="url(#eg-boil)" opacity={prog(f, SHOT2, SHOT2 + 20)}>
        <g transform="translate(150,40)">
          <rect x={0} y={0} width={240} height={10} fill="none" stroke={INK} strokeWidth={1.4} />
          <rect x={0} y={0} width={60} height={10} fill={INK} />
          <rect x={120} y={0} width={60} height={10} fill={INK} />
          <text x={120} y={-12} textAnchor="middle" fontFamily={FONT.fell} fontStyle="italic" fontSize={24} fill={INK}>
            Scale of One Mile
          </text>
        </g>
        <circle r={44} fill="none" stroke={INK} strokeWidth={1.5} />
        <circle r={38} fill="none" stroke={INK} strokeWidth={0.8} />
        <path d="M0,-58 L9,0 L0,58 L-9,0 Z" fill={PAPER} stroke={INK} strokeWidth={1.6} />
        <path d="M0,-58 L9,0 L-9,0 Z" fill={INK} />
        <path d="M-58,0 L0,-7 L58,0 L0,7 Z" fill={PAPER} stroke={INK} strokeWidth={1.4} />
        <text y={-66} textAnchor="middle" fontFamily={FONT.fellSC} fontSize={26} fill={INK}>
          N
        </text>
      </g>
    </g>
  );
};

export const EngravingStyle: React.FC = () => {
  useHistFonts();
  const f = useCurrentFrame();

  // the cut to the map: an ink-bleed dissolve, noise thresholded
  const reveal = prog(f, SHOT2 - XFADE, SHOT2 + 8, Easing.linear);
  const th = lerp(0.9, 0.05, reveal);

  const cap = captionAt(f);
  const capIn = cap ? Math.min(prog(f, cap.from, cap.from + 6), 1 - prog(f, cap.to - 5, cap.to)) : 0;
  const title = prog(f, 6, 34);

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <filter id="eg-paper" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={4} seed={11} result="stain" />
          <feColorMatrix in="stain" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.12  0 0 0 -2.2 1.35" result="s" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.05" numOctaves={2} seed={4} result="fib" />
          <feColorMatrix in="fib" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.35 -0.08" result="fb" />
          <feMerge>
            <feMergeNode in="s" />
            <feMergeNode in="fb" />
          </feMerge>
        </filter>
        <rect width={1080} height={1920} filter="url(#eg-paper)" opacity={0.55} />
      </svg>

      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Defs f={f} />
        <clipPath id="eg-plate">
          <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h} />
        </clipPath>
        <filter id="eg-bleed" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={21} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.3" />
          <feComponentTransfer>
            <feFuncA type="linear" slope={14} intercept={-14 * th} />
          </feComponentTransfer>
        </filter>
        <mask id="eg-mapmask" maskUnits="userSpaceOnUse">
          <rect width={1080} height={1920} fill="#fff" filter="url(#eg-bleed)" />
        </mask>

        <g clipPath="url(#eg-plate)">
          {f < SHOT2 + 8 && <Scene f={f} />}
          {f >= SHOT2 - XFADE && (
            <g mask={f < SHOT2 + 8 ? "url(#eg-mapmask)" : undefined}>
              <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h} fill={PAPER} />
              <MapPlate f={f} />
            </g>
          )}
        </g>

        {/* plate border, plate number */}
        <g filter="url(#eg-boil)">
          <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h} fill="none" stroke={INK} strokeWidth={4} />
          <rect x={PLATE.x - 12} y={PLATE.y - 12} width={PLATE.w + 24} height={PLATE.h + 24} fill="none" stroke={INK} strokeWidth={1.2} />
          <text x={PLATE.x - 10} y={PLATE.y - 34} fontFamily={FONT.fellSC} fontSize={30} fill={INK} letterSpacing={3}>
            Pl. I.
          </text>
          <text x={PLATE.x + PLATE.w + 10} y={PLATE.y - 34} textAnchor="end" fontFamily={FONT.fell} fontStyle="italic" fontSize={30} fill={INK}>
            The Hundred Days
          </text>
        </g>

        {/* title, inked into the sky */}
        {f < SHOT2 + 8 && (
          <g opacity={title * (1 - prog(f, SHOT2 - XFADE, SHOT2))} filter="url(#eg-boil)">
            <rect x={150} y={232} width={780} height={250} fill={PAPER} opacity={0.92} />
            <rect x={150} y={232} width={780} height={250} fill="none" stroke={INK} strokeWidth={2.4} />
            <rect x={162} y={244} width={756} height={226} fill="none" stroke={INK} strokeWidth={1} />
            <text x={540} y={392} textAnchor="middle" fontFamily={FONT.fellSC} fontSize={150} letterSpacing={lerp(30, 10, title)} fill={INK}>
              Waterloo
            </text>
            <text x={540} y={448} textAnchor="middle" fontFamily={FONT.fell} fontStyle="italic" fontSize={42} fill={INK}>
              the 18th of June, 1815
            </text>
            <path d="M300,272 H500 M580,272 H780" stroke={INK} strokeWidth={1.4} />
            <path d="M540,262 l8,10 l-8,10 l-8,-10 Z" fill={RED} />
          </g>
        )}

        {/* the plate caption */}
        {cap && (
          <text
            x={540}
            y={1528}
            textAnchor="middle"
            fontFamily={FONT.fell}
            fontStyle="italic"
            fontSize={62}
            fill={INK}
            opacity={capIn}
          >
            {cap.text}
          </text>
        )}
        <path d="M400,1566 H680" stroke={INK} strokeWidth={1.2} opacity={cap ? capIn * 0.8 : 0} />
      </svg>

      <Grain id="eg-grain" frame={f} opacity={0.22} every={2} freq={0.85} blend="multiply" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(80,50,20,0) 60%, rgba(80,50,20,0.35) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};


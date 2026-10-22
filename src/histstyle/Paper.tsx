import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import {
  FONT,
  Grain,
  MAP,
  NAP,
  Ranks,
  SHOT2,
  arrowD,
  captionAt,
  hash,
  lerp,
  onN,
  prog,
  smokePuffs,
  useHistFonts,
} from "./shared";

// ── Style B · Paper Diorama ───────────────────────────────────────────
//
// A cut-paper set, lit from the left and shot frame by frame. Every shape
// is a sheet with a hand-cut edge and real depth: it throws a shadow on
// the sheet behind it, and the nearest sheets fall out of focus the way a
// macro lens sees a tabletop. Everything moves on twos with a hair of
// jitter, because a hand put it there for each frame.

const C = {
  sky0: "#e9cfa6",
  sky1: "#d99d6c",
  sun: "#f6e4bd",
  cloud: "#f3e7d2",
  far: "#9aa08a",
  far2: "#7e8a6c",
  field: "#8c8d5a",
  near: "#4b5236",
  dark: "#2c3023",
  nap: "#23252b",
  red: "#a83a2d",
  blue: "#33568a",
  cream: "#efe3c8",
  slate: "#3a3e46",
  ink: "#2a2420",
  smoke: "#efe6d6",
};

/** A sheet of paper: a hand-cut edge, a fibre texture, a shadow by depth. */
const PaperFilter: React.FC<{ id: string; depth: number; seed: number; rough?: number }> = ({ id, depth, seed, rough = 5 }) => (
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={3} seed={seed} result="edge" />
    <feDisplacementMap in="SourceGraphic" in2="edge" scale={rough} xChannelSelector="R" yChannelSelector="G" result="cut" />
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={3} seed={seed + 40} result="fib" />
    <feColorMatrix in="fib" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.55 0.32" result="fibA" />
    <feComposite in="fibA" in2="cut" operator="in" result="fibIn" />
    <feMerge result="sheet">
      <feMergeNode in="cut" />
      <feMergeNode in="fibIn" />
    </feMerge>
    <feGaussianBlur in="cut" stdDeviation={2 + depth * 2.2} result="sb" />
    <feOffset in="sb" dx={depth * 2.5} dy={depth * 3.5} result="so" />
    <feFlood floodColor="#1b140c" floodOpacity={0.42} />
    <feComposite in2="so" operator="in" result="shadow" />
    <feMerge>
      <feMergeNode in="shadow" />
      <feMergeNode in="sheet" />
    </feMerge>
  </filter>
);

const jit = (f: number, k: number, amt = 1.1) => {
  const n = onN(f, 2);
  return [(hash(n * 0.37 + k * 11) - 0.5) * amt, (hash(n * 0.53 + k * 17) - 0.5) * amt];
};

const ridge = (fn: (x: number) => number, bottom: number) => {
  let d = `M-60,${fn(-60)}`;
  for (let x = -40; x <= 1140; x += 20) d += ` L${x},${fn(x).toFixed(1)}`;
  return `${d} L1140,${bottom} L-60,${bottom} Z`;
};

const farA = (x: number) => 840 - x * 0.04 + Math.sin(x / 120) * 16 + Math.sin(x / 41) * 4;
const farB = (x: number) => 890 + x * 0.02 + Math.sin(x / 90 + 1) * 12;
const fieldTop = (x: number) => 930 + Math.sin(x / 200) * 10;
const nearTop = (x: number) => 1215 + Math.pow(Math.max(0, x) / 1080, 1.7) * 110 - Math.sin(x / 150) * 16;

/** A cumulus cut from one sheet: uneven lobes on a flat base. */
const cloudD = (cx: number, cy: number, w: number, h: number, seed: number) => {
  const n = 5;
  const ws = Array.from({ length: n }, (_, i) => 0.5 + hash(seed * 5 + i) + Math.sin(((i + 0.5) / n) * Math.PI));
  const sum = ws.reduce((a, b) => a + b, 0);
  let x = cx - w / 2;
  let d = `M${x},${cy}`;
  ws.forEach((wi, i) => {
    const bw = (wi / sum) * w;
    const lift = Math.sin(((i + 0.5) / n) * Math.PI);
    const hh = h * (0.35 + lift * 0.75) * (0.8 + hash(seed + i) * 0.4);
    const ov = bw * 0.28; // lobes overlap their neighbours
    d += ` C${x - ov},${cy - hh * 1.1} ${x + bw + ov},${cy - hh * 1.1} ${x + bw},${cy - (i < n - 1 ? h * 0.25 * lift : 0)}`;
    x += bw;
  });
  return d + ` L${cx - w / 2},${cy} Z`;
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = onN(f, 2);
  const truck = prog(t, 0, SHOT2 + 12, Easing.linear);
  const L = (z: number, k: number) => {
    const [jx, jy] = jit(f, k, 0.9);
    return `translate(${-truck * 70 * z + jx},${-truck * 18 * z + jy}) translate(540,1000) scale(${1 + truck * 0.05 * z}) translate(-540,-1000)`;
  };

  const flagWave = (yOff: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      pts.push(`${(452 + u * 150).toFixed(1)},${(902 + yOff + Math.sin(u * 4.5 - t / 5) * 9 * u + u * 10).toFixed(1)}`);
    }
    return pts;
  };
  const ft = flagWave(0);
  const fb = flagWave(96).reverse();
  const flagD = `M${ft.join(" L")} L${fb.join(" L")} Z`;
  const stripe = (i0: number, i1: number) => {
    const top = flagWave(0).slice(i0, i1 + 1);
    const bot = flagWave(96).slice(i0, i1 + 1).reverse();
    return `M${top.join(" L")} L${bot.join(" L")} Z`;
  };

  const SMOKE = [
    { x: 200, y: 850, t0: -50, s: 40, z: 0.4 },
    { x: 620, y: 830, t0: -10, s: 48, z: 0.4 },
    { x: 930, y: 818, t0: 36, s: 36, z: 0.4 },
    { x: 360, y: 930, t0: 80, s: 44, z: 0.6 },
  ];

  return (
    <g>
      <defs>
        <linearGradient id="pp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sky0} />
          <stop offset="1" stopColor={C.sky1} />
        </linearGradient>
        <PaperFilter id="pp-d4" depth={3.4} seed={17} rough={7} />
        <filter id="pp-dof" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <rect x={-100} y={-100} width={1300} height={2200} fill="url(#pp-sky)" />

      {/* sun and clouds, the backdrop sheets */}
      <g transform={L(0.1, 1)}>
        <g filter="url(#pp-d0)">
          <circle cx={800} cy={700} r={120} fill={C.sun} opacity={0.6} />
          <circle cx={800} cy={700} r={78} fill={C.sun} />
        </g>
        <g filter="url(#pp-d1)">
          <path d={cloudD(260, 600, 460, 80, 3)} fill={C.cloud} />
          <path d={cloudD(860, 520, 320, 60, 9)} fill={C.cloud} />
          <path d={cloudD(560, 760, 260, 40, 5)} fill={C.cloud} opacity={0.92} />
        </g>
      </g>

      {/* Wellington's ridge: two sheets, his line on the crest */}
      <g transform={L(0.3, 2)}>
        <g filter="url(#pp-d1)">
          <path d={ridge(farA, 2600)} fill={C.far} />
          {[150, 330, 520, 700, 880].map((x) => (
            <Ranks key={x} x={x} y={farA(x) + 4} cols={8} rows={1} dx={12} dy={0} s={0.42} fill={C.red} />
          ))}
          {[110, 470, 490, 980].map((x, i) => (
            <path key={x} d={`M${x - 10},${farA(x) + 2} C${x - 14},${farA(x) - 40} ${x - 4},${farA(x) - 80 - i * 6} ${x},${farA(x) - 86 - i * 6} C${x + 4},${farA(x) - 80} ${x + 14},${farA(x) - 40} ${x + 10},${farA(x) + 2} Z`} fill={C.far2} />
          ))}
          <g transform={`translate(600,${farA(600) + 8})`}>
            <path d="M-40,0 V-22 L-26,-38 H20 L32,-22 V0 Z" fill={C.cream} />
            <path d="M-46,-20 L-26,-40 H20 L38,-20 Z" fill={C.red} opacity={0.85} />
          </g>
        </g>
        <g filter="url(#pp-d2)">
          <path d={ridge(farB, 2600)} fill={C.far2} />
        </g>
        {SMOKE.slice(0, 3).map((c, i) =>
          f >= c.t0 ? (
            <g key={i} filter="url(#pp-d1)" transform={`translate(${c.x},${c.y}) scale(1.6,0.8)`}>
              {smokePuffs(i + 3, onN(f, 2) - c.t0 + 20, c.s).map((p, j) => (
                <circle key={j} cx={p.x} cy={p.y} r={p.r} fill={C.smoke} />
              ))}
            </g>
          ) : null,
        )}
      </g>

      {/* the valley and the French columns crossing it */}
      <g transform={L(0.55, 3)}>
        <g filter="url(#pp-d2)">
          <path d={ridge(fieldTop, 2600)} fill={C.field} />
          <path d="M-60,1010 C200,990 520,1000 760,1020 C900,1030 1040,1024 1140,1018 L1140,1060 C900,1072 520,1062 -60,1066 Z" fill="#999a64" />
          <path d="M-60,1150 C300,1130 700,1150 1140,1140 L1140,1190 C700,1200 300,1186 -60,1200 Z" fill="#81834f" />
        </g>
        <g filter="url(#pp-d2)">
          {[
            { x: 120, y: 1000, s: 0.62, cols: 8 },
            { x: 560, y: 1030, s: 0.7, cols: 7 },
            { x: 240, y: 1120, s: 0.86, cols: 8 },
          ].map((b, i) => (
            <g key={i} transform={`translate(${t * 0.2},${-t * 0.12})`}>
              <Ranks x={b.x} y={b.y} cols={b.cols} rows={3} dx={17 * b.s} dy={11 * b.s} s={b.s} fill={C.blue} steel={C.ink} march={t} shear={-3} outline={C.field} />
            </g>
          ))}
        </g>
        {SMOKE.slice(3).map((c, i) =>
          f >= c.t0 ? (
            <g key={i} filter="url(#pp-d2)" transform={`translate(${c.x},${c.y}) scale(1.6,0.8)`}>
              {smokePuffs(i + 9, onN(f, 2) - c.t0 + 20, c.s).map((p, j) => (
                <circle key={j} cx={p.x} cy={p.y} r={p.r} fill={C.smoke} />
              ))}
            </g>
          ) : null,
        )}
      </g>

      {/* the near ridge, the standard, the man */}
      <g transform={L(0.85, 4)}>
        <g filter="url(#pp-d3)">
          <path d={ridge(nearTop, 2800)} fill={C.near} />
          {Array.from({ length: 70 }, (_, i) => {
            const x = i * 16 + hash(i) * 8;
            const y = nearTop(x) + 4;
            const h = 14 + hash(i + 3) * 22;
            return <path key={i} d={`M${x - 3},${y} L${x + (hash(i + 7) - 0.4) * 10},${y - h} L${x + 4},${y} Z`} fill={C.near} />;
          })}
        </g>
        <g filter="url(#pp-d3)">
          <rect x={448} y={880} width={7} height={350} fill={C.dark} />
          <path d="M444,884 l7.5,-26 l7.5,26 Z" fill="#b08a3e" />
          <path d={flagD} fill={C.cream} />
          <path d={stripe(0, 3)} fill={C.blue} />
          <path d={stripe(5, 8)} fill={C.red} />
        </g>
        <g filter="url(#pp-d4)" transform="translate(770,1294) scale(0.8) translate(-150,-700)">
          <path d={NAP.legs} fill={C.nap} />
          <path d={NAP.coat} fill="#2e3138" />
          <path d={NAP.collar} fill="#2e3138" />
          <path d={NAP.head} fill="#2a221d" />
          <path d={NAP.hat} fill={C.nap} />
        </g>
        {/* the layer cuts inside the coat, as separate sheets */}
        <g transform="translate(770,1294) scale(0.8) translate(-150,-700)" filter="url(#pp-d0)">
          <path d="M104,148 C84,154 70,170 67,198 C66,214 66,228 67,240 C100,224 200,224 233,240 C234,228 234,214 233,198 C230,170 216,154 196,148 C174,142 126,142 104,148 Z" fill="#363a42" />
          <path d="M60,98 C74,74 96,60 124,52" stroke="#555a66" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M70,248 C68,280 72,310 84,330 C110,342 190,342 216,330 C228,310 232,280 230,248 C214,262 206,300 186,318 C170,326 130,326 114,318 C94,300 86,262 70,248 Z" fill="#3a3e47" />
          <path d="M132,318 C140,308 160,308 168,318 C166,330 134,330 132,318 Z" fill="#d8c3a5" />
          <path d="M98,584 H145 V604 H98 Z M155,584 H202 V604 H155 Z" fill="#8a6a46" />
        </g>
      </g>

      {/* foreground grass, right under the lens, out of focus */}
      <g transform={L(1.6, 5)} filter="url(#pp-dof)">
        {Array.from({ length: 22 }, (_, i) => {
          const left = i < 11;
          const x = left ? -40 + i * 26 : 1120 - (i - 11) * 24;
          const h = 160 + hash(i) * 200;
          const lean = (hash(i + 4) - 0.5) * 80;
          return <path key={i} d={`M${x - 16},1940 C${x - 6},${1920 - h * 0.5} ${x + lean * 0.6},${1920 - h * 0.85} ${x + lean},${1920 - h} C${x + lean * 0.4},${1920 - h * 0.6} ${x + 14},${1920 - h * 0.3} ${x + 20},1940 Z`} fill={i % 3 ? C.dark : "#3c432c"} />;
        })}
      </g>
    </g>
  );
};

// the map: a relief model in layered card
const MapModel: React.FC<{ f: number }> = ({ f }) => {
  const t = onN(f, 2);
  const placed = (appear: number) => {
    const p = prog(t, appear, appear + 8, Easing.out(Easing.back(1.4)));
    return { s: lerp(1.35, 1, p), o: p > 0 ? 1 : 0, lift: (1 - p) * 18 };
  };
  const unit = (u: [number, number, number, number], color: string, appear: number, k: string) => {
    const { s, o, lift } = placed(appear);
    const [x, y, w, h] = u;
    const cx = x + w / 2, cy = y + h / 2;
    return (
      <g key={k} opacity={o} transform={`translate(${cx},${cy - lift}) scale(${s}) translate(${-cx},${-cy})`} filter="url(#pp-d2)">
        <rect x={x} y={y} width={w} height={h} rx={2} fill={color} />
        <rect x={x + 4} y={y + 4} width={w - 8} height={4} fill="#fff" opacity={0.18} />
      </g>
    );
  };
  const tag = (x: number, y: number, text: string, color: string, appear: number, rot = 0) => {
    const { s, o, lift } = placed(appear);
    const w = text.length * 27 + 40;
    return (
      <g opacity={o} transform={`translate(${x},${y - lift}) rotate(${rot}) scale(${s})`} filter="url(#pp-d2)">
        <rect x={-w / 2} y={-30} width={w} height={60} fill={C.cream} />
        <rect x={-w / 2} y={-30} width={10} height={60} fill={color} />
        <text x={6} y={13} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={600} fontSize={36} letterSpacing={5} fill={C.ink}>
          {text}
        </text>
      </g>
    );
  };

  return (
    <g>
      <rect x={-100} y={-100} width={1300} height={2200} fill="#6f7d4c" />
      <g transform="translate(540,900) scale(1.06) translate(-520,-480)">
        <g filter="url(#pp-d1)">
          <path d={MAP.river} stroke="#6f8fa6" strokeWidth={22} fill="none" />
        </g>
        <g filter="url(#pp-d1)">
          <path d={MAP.allyRidge} fill="#86935c" />
          <path d={MAP.frenchRidge} fill="#86935c" />
        </g>
        <g filter="url(#pp-d1)">
          <path d="M120,290 C340,304 660,296 900,272 L910,340 C660,354 340,358 120,346 Z" fill="#9aa66a" />
          <path d="M160,630 C360,646 640,652 900,620 L900,680 C640,700 360,698 160,684 Z" fill="#9aa66a" />
        </g>
        <g filter="url(#pp-d1)">
          {MAP.roads.map((d, i) => (
            <path key={i} d={d} stroke={C.cream} strokeWidth={14} fill="none" />
          ))}
        </g>
        <g filter="url(#pp-d2)">
          {MAP.woods.flatMap((w, wi) =>
            Array.from({ length: 34 }, (_, i) => {
              const a = hash(wi * 50 + i) * Math.PI * 2;
              const r = Math.sqrt(hash(wi * 50 + i + 20));
              return (
                <circle key={`${wi}-${i}`} cx={w.x + Math.cos(a) * r * w.rx} cy={w.y + Math.sin(a) * r * w.ry} r={11 + hash(i + wi) * 7} fill={i % 2 ? "#44543a" : "#4f6142"} />
              );
            }),
          )}
        </g>
        <g filter="url(#pp-d1)">
          {MAP.places.map((p) => (
            <g key={p.name} transform={`translate(${p.x},${p.y - 32})`}>
              <rect x={-12} y={-10} width={24} height={20} fill={C.cream} />
              <path d="M-15,-8 L0,-20 L15,-8 Z" fill={C.red} />
            </g>
          ))}
        </g>
        {MAP.places.map((p) => (
          <text key={p.name} x={p.x} y={p.name === "Hougoumont" ? p.y - 56 : p.y + 8} textAnchor="middle" fontFamily={FONT.playfair} fontStyle="italic" fontWeight={600} fontSize={27} fill="#1f2416" opacity={0.85}>
            {p.name}
          </text>
        ))}
        {MAP.allies.map((u, i) => unit(u, C.red, 160 + i * 3, `a${i}`))}
        {MAP.french.map((u, i) => unit(u, C.blue, 172 + i * 3, `f${i}`))}
        {MAP.prussians.map((b, i) => {
          const p = prog(t, 212 + i * 22, 260 + i * 22, Easing.inOut(Easing.quad));
          return (
            <g key={i} filter="url(#pp-d3)">
              <path d={arrowD(b, p, 38, 30, 56, 84)} fill="#24262a" />
            </g>
          );
        })}
        {tag(400, 180, "WELLINGTON", C.red, 184, -2)}
        {tag(400, 800, "NAPOLEON", C.blue, 194, 1.5)}
        {tag(820, 150, "BLÜCHER", "#24262a", 236, -4)}
      </g>
      <g transform="translate(540,250) rotate(-1)" filter="url(#pp-d2)">
        <rect x={-380} y={-80} width={760} height={160} fill={C.cream} />
      </g>
      <g transform="translate(540,250) rotate(-1)">
        <text x={0} y={-14} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={500} fontSize={30} letterSpacing={12} fill={C.ink}>
          THE FIELD OF
        </text>
        <text x={0} y={52} textAnchor="middle" fontFamily={FONT.playfair} fontWeight={900} fontSize={76} fill={C.ink}>
          Waterloo
        </text>
      </g>
    </g>
  );
};

export const PaperStyle: React.FC = () => {
  useHistFonts();
  const f = useCurrentFrame();
  const t = onN(f, 2);

  // the map sheet is slid in over the set by hand
  const slide = prog(t, SHOT2 - 14, SHOT2 + 6, Easing.inOut(Easing.cubic));
  const cap = captionAt(f);
  const title = prog(t, 6, 22, Easing.out(Easing.back(1.6)));
  const [tjx, tjy] = jit(f, 9, 1.4);

  return (
    <AbsoluteFill style={{ background: C.sky1, overflow: "hidden" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <PaperFilter id="pp-d0" depth={0.6} seed={2} />
          <PaperFilter id="pp-d1" depth={1} seed={5} />
          <PaperFilter id="pp-d2" depth={1.6} seed={8} />
          <PaperFilter id="pp-d3" depth={2.4} seed={13} />
          <PaperFilter id="pp-sheet" depth={6} seed={23} rough={3} />
          <PaperFilter id="pp-tag" depth={2.2} seed={31} rough={3} />
        </defs>
        {slide < 1 && <Scene f={f} />}
        {slide > 0 && (
          <g transform={`translate(${lerp(60, 0, slide)},${lerp(2000, 0, slide)}) rotate(${lerp(-5, 0, slide)},540,960)`} filter={slide < 1 ? "url(#pp-sheet)" : undefined}>
            <MapModel f={f} />
          </g>
        )}

        {/* title: a torn label pinned over the sky */}
        {f < SHOT2 + 4 && (
          <g opacity={title > 0 ? 1 - slide : 0} transform={`translate(${540 + tjx},${330 + tjy}) rotate(-1.5) scale(${title})`}>
            <g filter="url(#pp-tag)">
              <path d="M-410,-150 L400,-160 L412,130 L-404,142 Z" fill={C.cream} />
            </g>
            <text x={0} y={30} textAnchor="middle" fontFamily={FONT.playfair} fontWeight={900} fontSize={172} letterSpacing={2} fill={C.ink}>
              Waterloo
            </text>
            <rect x={-330} y={58} width={660} height={4} fill={C.red} />
            <text x={0} y={112} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={500} fontSize={40} letterSpacing={14} fill={C.ink}>
              18 JUNE 1815
            </text>
            <text x={0} y={-92} textAnchor="middle" fontFamily={FONT.playfair} fontStyle="italic" fontSize={36} fill={C.ink} opacity={0.8}>
              the last battle
            </text>
          </g>
        )}

        {/* caption: a paper slip */}
        {cap && (() => {
          const k = Math.floor(cap.from);
          const [cx, cy] = jit(f, k, 1);
          const w = cap.text.length * 27 + 90;
          const pop = prog(t, cap.from, cap.from + 6, Easing.out(Easing.back(1.8)));
          return (
            <g transform={`translate(${540 + cx},${1520 + cy}) rotate(${(hash(k) - 0.5) * 3}) scale(${pop})`}>
              <g filter="url(#pp-tag)">
                <rect x={-w / 2} y={-52} width={w} height={100} fill={C.cream} />
              </g>
              <text x={0} y={16} textAnchor="middle" fontFamily={FONT.playfair} fontStyle="italic" fontWeight={600} fontSize={52} fill={C.ink}>
                {cap.text}
              </text>
            </g>
          );
        })()}
      </svg>
      <Grain id="pp-grain" frame={f} opacity={0.18} every={2} freq={0.75} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(115deg, rgba(255,226,170,0.16) 0%, rgba(255,226,170,0) 45%), radial-gradient(ellipse 80% 65% at 45% 45%, rgba(30,15,5,0) 55%, rgba(30,15,5,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

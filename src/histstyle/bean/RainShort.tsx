import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, Grain, hash, lerp, onN, prog, useHistFonts } from "../shared";
import { Bean, OUTFITS, PocketWatch, Telescope } from "./Bean";

// ── Style E · Pebble People — "The rain that beat Napoleon" ────────────
//
// The bean-character history Short: simple cartoon people acting in rich,
// lit sets, a cut every second or two, a slow push on every shot, and the
// narration one word at a time in fat white type. Twenty seconds, 9:16.
//
// The story is the real one: it poured the night before Waterloo, the
// French guns couldn't move in the mud, Napoleon put off the attack until
// late morning, and the hours he lost helped the Prussians reach the field.

export const BEAN_FPS = 30;
export const BEAN_FRAMES = 600;

const SHOTS = [
  { from: 0, to: 96, line: "What if one rainstorm cost Napoleon an empire?" },
  { from: 96, to: 192, line: "The night before Waterloo, it poured." },
  { from: 192, to: 294, line: "By morning, his cannons were stuck in mud." },
  { from: 294, to: 396, line: "So Napoleon waited for the ground to dry." },
  { from: 396, to: 504, line: "Those lost hours helped the Prussians reach him." },
  { from: 504, to: 600, line: "One rainstorm. One empire. Gone." },
];

const WORDS = SHOTS.flatMap((s) => {
  const ws = s.line.split(" ");
  const a = s.from + 4;
  const b = s.to - 8;
  return ws.map((w, i) => ({ w, from: Math.round(lerp(a, b, i / ws.length)), to: Math.round(lerp(a, b, (i + 1) / ws.length)) }));
});

const KEY = new Set(["rainstorm", "empire?", "poured.", "mud.", "dry.", "Prussians", "Gone."]);

// ── shared set pieces ─────────────────────────────────────────────────

const Rain: React.FC<{ f: number; n: number; speed: number; len: number; opacity: number; seed: number; color?: string; w?: number }> = ({
  f, n, speed, len, opacity, seed, color = "#cfe0ff", w = 2,
}) => (
  <g opacity={opacity}>
    {Array.from({ length: n }, (_, i) => {
      const x = hash(i + seed) * 1300 - 110;
      const y = ((hash(i * 3 + seed) * 2400 + f * speed) % 2400) - 240;
      return <line key={i} x1={x} y1={y} x2={x - len * 0.18} y2={y + len} stroke={color} strokeWidth={w} strokeLinecap="round" />;
    })}
  </g>
);

const Glow: React.FC<{ x: number; y: number; r: number; color: string; o?: number }> = ({ x, y, r, color, o = 1 }) => {
  const id = `g${Math.round(x)}${Math.round(y)}${Math.round(r)}${color.replace("#", "")}`;
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={o}>
      <radialGradient id={id}>
        <stop offset="0" stopColor={color} stopOpacity="0.9" />
        <stop offset="0.35" stopColor={color} stopOpacity="0.35" />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </radialGradient>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    </g>
  );
};

const Flame: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const k = onN(f, 2);
  const w = 1 + (hash(k) - 0.5) * 0.25;
  const h = 1 + (hash(k + 7) - 0.5) * 0.3;
  return (
    <g transform={`translate(${x},${y}) scale(${s * w},${s * h})`}>
      <path d="M0,-60 C14,-36 22,-18 18,-4 C14,8 -14,8 -18,-4 C-22,-18 -10,-34 0,-60 Z" fill="#ffb347" stroke="#3a1a0a" strokeWidth={3} />
      <path d="M0,-36 C7,-22 10,-12 8,-4 C6,2 -6,2 -8,-4 C-10,-12 -4,-22 0,-36 Z" fill="#fff1b8" />
    </g>
  );
};

/** Each shot pushes in slowly from its first frame. */
const Push: React.FC<{ lf: number; dur: number; from?: number; to?: number; ox?: number; oy?: number; children: React.ReactNode }> = ({
  lf, dur, from = 1, to = 1.08, ox = 540, oy = 960, children,
}) => {
  const k = interpolate(lf, [0, dur], [from, to], { extrapolateRight: "clamp", easing: Easing.bezier(0.3, 0, 0.7, 1) });
  return <g transform={`translate(${ox},${oy}) scale(${k}) translate(${-ox},${-oy})`}>{children}</g>;
};

const LG: React.FC<{ id: string; stops: [number, string][]; x2?: number; y2?: number }> = ({ id, stops, x2 = 0, y2 = 1 }) => (
  <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
    {stops.map(([o, c]) => (
      <stop key={o} offset={o} stopColor={c} />
    ))}
  </linearGradient>
);

// ── 1 · the tent, the night before ────────────────────────────────────

const Tent: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const flash = lf >= 56 && lf < 64 ? (lf % 4 < 2 ? 1 : 0.4) : 0;
  const turned = lf >= 50;
  return (
    <Push lf={lf} dur={96} oy={900}>
      <defs>
        <radialGradient id="tn-bg" cx="0.75" cy="0.66" r="0.85">
          <stop offset="0" stopColor="#d99550" />
          <stop offset="0.35" stopColor="#8a5530" />
          <stop offset="0.75" stopColor="#3b2213" />
          <stop offset="1" stopColor="#1a0e07" />
        </radialGradient>
        <LG id="tn-night" stops={[[0, "#0d1730"], [1, "#22365e"]]} />
        <LG id="tn-wood" stops={[[0, "#6e4626"], [1, "#3a2210"]]} />
        <clipPath id="tn-door">
          <path d="M40,520 C140,700 300,1000 400,1360 L40,1360 Z" />
        </clipPath>
      </defs>
      <rect x={-60} y={-60} width={1200} height={2040} fill="url(#tn-bg)" />
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M540,-260 Q${-200 + i * 110},700 ${-260 + i * 120},1500`} stroke="#000" strokeOpacity={0.14} strokeWidth={10 + (i % 3) * 6} fill="none" />
      ))}
      {/* the open flap: rain outside */}
      <g clipPath="url(#tn-door)">
        <rect x={0} y={400} width={500} height={1000} fill="url(#tn-night)" />
        <path d="M0,1180 C120,1160 260,1170 420,1200 L420,1400 L0,1400 Z" fill="#0a0f1d" />
        {[120, 230, 330].map((x, i) => (
          <path key={x} d={`M${x - 40},1190 L${x},${1120 - i * 6} L${x + 40},1190 Z`} fill="#0f1628" />
        ))}
        <Rain f={lf} n={70} speed={58} len={70} opacity={0.55} seed={3} />
        <rect x={0} y={400} width={500} height={1000} fill="#cfe2ff" opacity={flash * 0.7} />
      </g>
      <path d="M40,520 C140,700 300,1000 400,1360" stroke="#2a170b" strokeWidth={22} fill="none" />
      <path d="M40,520 C160,690 330,960 470,1360 L520,1360 C380,980 210,690 60,500 Z" fill="#9a6538" stroke="#2a170b" strokeWidth={6} />

      <Bean
        id="nap1"
        x={640}
        y={1420}
        s={2.4}
        f={lf}
        outfit={OUTFITS.napoleon}
        hat="bicorne"
        expr={turned ? (flash ? "shocked" : "worried") : "worried"}
        look={turned ? -1 : 0.2}
        hands={{ l: [-84, -34], r: [84, -34] }}
        rim={flash ? "#cfe2ff" : "#ffcf8a"}
      />

      {/* the table, the map, the candle */}
      <path d="M-40,1330 L1120,1330 L1120,1980 L-40,1980 Z" fill="url(#tn-wood)" stroke="#1f1208" strokeWidth={6} />
      {[1420, 1530, 1660, 1810].map((y) => (
        <path key={y} d={`M-40,${y} L1120,${y - 10}`} stroke="#2a170b" strokeWidth={4} opacity={0.6} />
      ))}
      <path d="M250,1352 L860,1346 L920,1520 L190,1530 Z" fill="#e8d7ad" stroke="#3a2a14" strokeWidth={5} />
      <path d="M300,1420 C420,1400 600,1410 820,1396" stroke="#b33a2e" strokeWidth={14} strokeDasharray="40 16" fill="none" />
      <path d="M290,1480 C440,1470 620,1478 860,1466" stroke="#2c4f94" strokeWidth={14} strokeDasharray="40 16" fill="none" />
      <path d="M560,1370 L570,1510" stroke="#5a4a30" strokeWidth={4} />
      <rect x={880} y={1220} width={44} height={120} rx={6} fill="#efe4c8" stroke="#2a170b" strokeWidth={5} />
      <ellipse cx={902} cy={1342} rx={48} ry={12} fill="#b8894a" stroke="#2a170b" strokeWidth={5} />
      <Flame x={902} y={1222} s={0.9} f={f} />
      <Glow x={902} y={1190} r={520} color="#ffb766" o={0.75 + (hash(onN(f, 3)) - 0.5) * 0.15} />
      <rect x={-60} y={-60} width={1200} height={2040} fill="#cfe2ff" opacity={flash * 0.18} />
    </Push>
  );
};

// ── 2 · the night: rain on the camp ───────────────────────────────────

const Storm: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const flash = lf >= 26 && lf < 34 ? (lf % 4 < 2 ? 1 : 0.35) : 0;
  return (
    <Push lf={lf} dur={96} oy={1200} to={1.07}>
      <defs>
        <LG id="st-sky" stops={[[0, "#070c1c"], [0.45, "#16233f"], [0.55, "#2b3b5e"]]} />
        <LG id="st-mud" stops={[[0, "#2c2721"], [1, "#16120e"]]} />
      </defs>
      <rect x={-60} y={-60} width={1200} height={2040} fill="url(#st-sky)" />
      {[
        { y: 280, c: "#0f1830", d: 0.3 },
        { y: 480, c: "#17223e", d: 0.5 },
        { y: 680, c: "#1f2c4b", d: 0.8 },
      ].map((b, i) => (
        <g key={i} transform={`translate(${-lf * b.d},0)`}>
          {Array.from({ length: 8 }, (_, j) => (
            <ellipse key={j} cx={j * 190 - 40 + hash(j + i) * 60} cy={b.y + hash(j * 2 + i) * 50} rx={180 + hash(j) * 70} ry={80 + hash(j + 4) * 30} fill={b.c} />
          ))}
        </g>
      ))}
      {flash > 0 && (
        <g>
          <rect x={-60} y={-60} width={1200} height={1100} fill="#dbe7ff" opacity={flash * 0.45} />
          <path d="M760,120 L700,330 L760,330 L660,600 L720,600 L620,860" stroke="#fff" strokeWidth={10} fill="none" strokeLinejoin="round" />
          <Glow x={700} y={500} r={500} color="#cfe0ff" o={flash} />
        </g>
      )}
      {/* far hill, tents, dying fires */}
      <path d="M-60,960 C200,900 520,930 760,890 C900,870 1040,900 1140,880 L1140,1100 L-60,1100 Z" fill="#0b1122" />
      {[120, 250, 380, 700, 850, 980].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 34},${958 - (i > 2 ? 30 : 0)} L${x},${900 - (i > 2 ? 30 : 0)} L${x + 34},${958 - (i > 2 ? 30 : 0)} Z`} fill="#121a30" />
          <Glow x={x + 50} y={950 - (i > 2 ? 30 : 0)} r={60} color="#ff9a4a" o={0.5 + hash(onN(f, 4) + i) * 0.4} />
        </g>
      ))}
      <path d="M-60,1040 C300,1010 700,1030 1140,1000 L1140,2000 L-60,2000 Z" fill="url(#st-mud)" />
      {[
        [220, 1240, 160],
        [760, 1290, 200],
        [480, 1760, 260],
        [900, 1640, 120],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.18} fill="#33456a" opacity={0.75} />
          {[0, 1].map((k) => {
            const a = ((lf + i * 13 + k * 20) % 40) / 40;
            return <ellipse key={k} cx={x + (hash(i + k) - 0.5) * r} cy={y} rx={a * 40} ry={a * 8} fill="none" stroke="#9fb6dd" strokeWidth={2} opacity={1 - a} />;
          })}
        </g>
      ))}
      {/* three soaked men round a fire that won't stay lit */}
      <g>
        <path d="M480,1560 l90,-20 M500,1530 l80,30" stroke="#3a2412" strokeWidth={16} strokeLinecap="round" />
        <Flame x={540} y={1550} s={0.45 + hash(onN(f, 3)) * 0.2} f={f} />
        <Glow x={540} y={1520} r={260} color="#ff9a4a" o={0.55} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={540 + Math.sin((lf + i * 30) / 9) * 14} cy={1480 - ((lf * 2 + i * 40) % 120)} r={10 + ((lf * 2 + i * 40) % 120) / 8} fill="#4a5164" opacity={0.5 - ((lf * 2 + i * 40) % 120) / 260} />
        ))}
      </g>
      <Bean id="wet1" x={270} y={1600} s={1.55} f={lf} outfit={OUTFITS.soggy} hat="shako" expr="sad" look={0.5} shiver={5} drip rim="#ff9a4a" hands={{ l: [-40, -110], r: [40, -110] }} />
      <Bean id="wet2" x={810} y={1610} s={1.6} f={lf} outfit={OUTFITS.soggy} hat="shako" expr="worried" look={-0.6} shiver={4} drip rim="#ff9a4a" hands={{ l: [-40, -110], r: [40, -110] }} />
      <Bean id="wet3" x={560} y={1800} s={1.9} f={lf} outfit={OUTFITS.soggy} hat="shako" expr="sad" look={0} shiver={6} drip talk={lf > 40 && lf < 70} hands={{ l: [-40, -110], r: [40, -110] }} />
      <Rain f={lf} n={160} speed={64} len={80} opacity={0.4} seed={11} />
      <Rain f={lf} n={40} speed={90} len={170} opacity={0.35} seed={29} w={4} />
      <rect x={-60} y={-60} width={1200} height={2040} fill="#dbe7ff" opacity={flash * 0.12} />
    </Push>
  );
};

// ── 3 · morning: the guns won't move ──────────────────────────────────

const Mud: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const rock = Math.sin(lf / 3.2) * 5;
  const wheel = (cx: number, cy: number, r: number) => (
    <g transform={`translate(${cx},${cy}) rotate(${rock})`}>
      <circle r={r} fill="none" stroke="#2a170b" strokeWidth={34} />
      <circle r={r} fill="none" stroke="#7a4e2a" strokeWidth={22} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 6) * r} y2={Math.sin((i * Math.PI) / 6) * r} stroke="#2a170b" strokeWidth={14} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`s${i}`} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 6) * r} y2={Math.sin((i * Math.PI) / 6) * r} stroke="#8a5a32" strokeWidth={8} />
      ))}
      <circle r={30} fill="#8a5a32" stroke="#2a170b" strokeWidth={6} />
      <circle r={10} fill="#3a2a1a" />
    </g>
  );
  return (
    <Push lf={lf} dur={102} oy={1300}>
      <defs>
        <LG id="md-sky" stops={[[0, "#8794a3"], [0.6, "#c7c9c2"]]} />
        <LG id="md-mud" stops={[[0, "#6a4c33"], [1, "#3a2818"]]} />
        <filter id="md-dof">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect x={-60} y={-60} width={1200} height={2040} fill="url(#md-sky)" />
      <g filter="url(#md-dof)">
        {Array.from({ length: 7 }, (_, j) => (
          <ellipse key={j} cx={j * 190 + lf * 0.4} cy={300 + hash(j) * 160} rx={220} ry={60} fill="#dfe0da" opacity={0.6} />
        ))}
        <path d="M-60,900 C200,860 500,880 760,850 C900,840 1040,860 1140,850 L1140,1100 L-60,1100 Z" fill="#7d8a86" />
        {Array.from({ length: 22 }, (_, i) => (
          <ellipse key={i} cx={i * 55} cy={872 + Math.sin(i) * 10} rx={30} ry={42} fill="#5f6e66" />
        ))}
        <rect x={-60} y={880} width={1200} height={140} fill="#e6e6df" opacity={0.45} />
      </g>
      <path d="M-60,1000 C300,980 700,990 1140,970 L1140,2000 L-60,2000 Z" fill="url(#md-mud)" />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M${hash(i) * 1100},${1050 + hash(i + 3) * 850} q${60 + hash(i + 5) * 120},-8 ${140 + hash(i + 7) * 200},4`} stroke="#9b7752" strokeWidth={4 + hash(i) * 5} fill="none" opacity={0.7} strokeLinecap="round" />
      ))}
      {/* the gun */}
      <path d="M600,1250 L1000,1470 L980,1510 L580,1300 Z" fill="#7a4e2a" stroke="#2a170b" strokeWidth={8} strokeLinejoin="round" />
      <g transform="translate(720,1150) rotate(-18) scale(1.25)">
        <path d="M-150,-40 L260,-28 C278,-27 286,-20 286,0 C286,20 278,27 260,28 L-150,40 C-190,40 -200,20 -200,0 C-200,-20 -190,-40 -150,-40 Z" fill="#b48a52" stroke="#2a170b" strokeWidth={8} />
        <path d="M-130,-30 L250,-20" stroke="#e2c08a" strokeWidth={8} opacity={0.7} />
        <rect x={60} y={-36} width={16} height={72} fill="#8a6634" stroke="#2a170b" strokeWidth={4} />
        <circle cx={-205} cy={0} r={16} fill="#b48a52" stroke="#2a170b" strokeWidth={6} />
      </g>
      {wheel(720, 1300, 210)}
      {/* the mud has the bottom of the wheel */}
      <path d="M420,1400 C520,1370 620,1388 720,1380 C820,1374 920,1390 1040,1410 L1100,1560 L380,1560 Z" fill="#4c3524" stroke="#2a170b" strokeWidth={6} />
      <path d="M480,1410 C580,1390 680,1400 800,1394" stroke="#a07a54" strokeWidth={6} fill="none" opacity={0.8} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = ((lf * 3 + i * 17) % 40) / 40;
        const ang = -Math.PI / 2 - 0.9 + hash(i) * 1.8;
        return <circle key={i} cx={620 + Math.cos(ang) * a * 220} cy={1420 + Math.sin(ang) * a * 200 + a * a * 260} r={7 + hash(i + 2) * 7} fill="#4c3524" stroke="#2a170b" strokeWidth={3} opacity={1 - a * 0.6} />;
      })}
      <Bean id="gun1" x={370} y={1650} s={1.55} f={lf} outfit={OUTFITS.gunner} hat="shako" expr="angry" look={0.8} shiver={5} sweat hands={{ l: [96, -160], r: [112, -112] }} />
      <Bean id="gun2" x={150} y={1720} s={1.45} f={lf} outfit={OUTFITS.gunner} hat="shako" expr="worried" look={0.9} shiver={4} sweat talk={lf > 40} hands={{ l: [92, -150], r: [108, -104] }} />
      {/* and their boots are going under too */}
      <path d="M-60,1630 C120,1610 300,1640 480,1620 C620,1606 820,1640 1140,1620 L1140,2000 L-60,2000 Z" fill="#4c3524" stroke="#2a170b" strokeWidth={6} />
      <path d="M40,1660 q120,-14 260,0 M600,1650 q140,-12 300,4" stroke="#a07a54" strokeWidth={6} fill="none" opacity={0.7} />
      <rect x={-60} y={-60} width={1200} height={2040} fill="#9aa4ad" opacity={0.08} />
      {void f}
    </Push>
  );
};

// ── 4 · the wait ─────────────────────────────────────────────────────

const WATCH_CUT = 52;

const Wait: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const scene = (
    <g>
      <defs>
        <LG id="wt-sky" stops={[[0, "#6fa6d6"], [0.55, "#cfe3ee"], [0.62, "#f1e7cf"]]} />
        <LG id="wt-hill" stops={[[0, "#7d9a4c"], [1, "#4a6430"]]} />
      </defs>
      <rect x={-60} y={-60} width={1200} height={2040} fill="url(#wt-sky)" />
      <Glow x={860} y={420} r={420} color="#fff4cc" />
      {Array.from({ length: 6 }, (_, j) => (
        <ellipse key={j} cx={j * 220 - 60 + lf * 0.5} cy={260 + hash(j + 9) * 220} rx={160} ry={46} fill="#ffffff" opacity={0.75} />
      ))}
      <path d="M-60,1000 C240,960 600,980 1140,950 L1140,1200 L-60,1200 Z" fill="#9db37e" />
      {[180, 360, 540, 720].map((x) => (
        <rect key={x} x={x} y={968 + (x % 7)} width={110} height={14} rx={7} fill="#b8322a" />
      ))}
      {[220, 450, 680].map((x) => (
        <rect key={x} x={x} y={1100} width={130} height={18} rx={9} fill="#2c4f94" />
      ))}
      <path d="M-60,1180 C300,1120 700,1150 1140,1110 L1140,2000 L-60,2000 Z" fill="url(#wt-hill)" />
      {Array.from({ length: 40 }, (_, i) => (
        <path key={i} d={`M${i * 28},${1180 - Math.sin(i / 3) * 20} l${6 - hash(i) * 12},-22`} stroke="#3c5226" strokeWidth={5} strokeLinecap="round" />
      ))}
      <Bean id="aide" x={290} y={1660} s={1.7} f={lf} outfit={OUTFITS.officer} hat="bicorne" expr="worried" look={0.8} talk={lf > 10 && lf < 44} hands={{ l: [-60, -70], r: [70, -120] }} />
      <Bean
        id="nap4"
        x={700}
        y={1640}
        s={2.0}
        f={lf}
        outfit={OUTFITS.napoleon}
        hat="bicorne"
        expr={lf > 26 ? "angry" : "determined"}
        look={-0.3}
        hands={{ l: [-70, -70], r: [30, -150] }}
        holding={{ r: <PocketWatch r={26} t={f / 4} /> }}
        rim="#fff2c4"
      />
    </g>
  );
  if (lf < WATCH_CUT) return <Push lf={lf} dur={WATCH_CUT}>{scene}</Push>;

  // the watch, close: the morning goes by in a second and a half
  const w = lf - WATCH_CUT;
  const zin = prog(w, 0, 8, Easing.out(Easing.cubic));
  const hours = 9 + prog(w, 4, 46, Easing.inOut(Easing.quad)) * 2.5; // 9:00 → 11:30
  const hA = (hours / 12) * Math.PI * 2;
  const mA = (hours % 1) * Math.PI * 2 + Math.floor(hours - 9) * Math.PI * 2;
  const cx = 540, cy = 860, R = 330;
  return (
    <g>
      <defs>
        <filter id="wt-blur">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      <g filter="url(#wt-blur)" transform="translate(540,1000) scale(1.4) translate(-540,-1000)">
        {scene}
      </g>
      <rect x={-60} y={-60} width={1200} height={2040} fill="#10192a" opacity={0.35} />
      <g transform={`translate(${cx},${cy}) scale(${lerp(0.6, 1, zin)}) rotate(${lerp(-12, -3, zin)})`}>
        <path d={`M-20,${-R - 70} h40 v40 h-40 Z`} fill="#d8b45a" stroke="#231815" strokeWidth={8} />
        <circle cy={-R - 90} r={34} fill="none" stroke="#d8b45a" strokeWidth={14} />
        <circle r={R + 40} fill="#d8b45a" stroke="#231815" strokeWidth={10} />
        <circle r={R + 22} fill="#b8903e" />
        <circle r={R} fill="#f7f0dc" stroke="#231815" strokeWidth={6} />
        {["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"].map((n, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <text key={n} x={Math.sin(a) * (R - 58)} y={-Math.cos(a) * (R - 58) + 16} textAnchor="middle" fontFamily={FONT.playfair} fontWeight={700} fontSize={46} fill="#231815">
              {n}
            </text>
          );
        })}
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const l = i % 5 ? 10 : 22;
          return <line key={i} x1={Math.sin(a) * (R - 6)} y1={-Math.cos(a) * (R - 6)} x2={Math.sin(a) * (R - 6 - l)} y2={-Math.cos(a) * (R - 6 - l)} stroke="#231815" strokeWidth={i % 5 ? 3 : 6} />;
        })}
        <line x1={0} y1={0} x2={Math.sin(hA) * R * 0.5} y2={-Math.cos(hA) * R * 0.5} stroke="#231815" strokeWidth={18} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin(mA) * R * 0.78} y2={-Math.cos(mA) * R * 0.78} stroke="#231815" strokeWidth={10} strokeLinecap="round" />
        <circle r={18} fill="#d8b45a" stroke="#231815" strokeWidth={6} />
        <path d={`M${-R * 0.7},${-R * 0.5} A${R * 0.86},${R * 0.86} 0 0 1 ${R * 0.2},${-R * 0.84}`} stroke="#fff" strokeWidth={22} opacity={0.45} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

// ── 5 · the Prussians come over the hill ───────────────────────────────

const Prussians: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const rise = (d: number) => (1 - prog(lf, d, d + 26, Easing.out(Easing.cubic))) * 300;
  const crest = (x: number) => 1330 - x * 0.1 + Math.sin(x / 140) * 18;
  let ridge = `M-60,${crest(-60)}`;
  for (let x = -40; x <= 1140; x += 20) ridge += ` L${x},${crest(x).toFixed(1)}`;
  ridge += " L1140,2000 L-60,2000 Z";
  const bubble = prog(lf, 46, 54, Easing.out(Easing.back(2)));
  const flagWave = (k: number) => {
    let top = "", bot = "";
    for (let i = 0; i <= 6; i++) {
      const u = i / 6;
      const wy = Math.sin(u * 4 - f / 5 + k) * 10 * u;
      top += `${i ? "L" : "M"}${u * 190},${wy} `;
      bot = `L${u * 190},${120 + wy} ` + bot;
    }
    return `${top} ${bot} Z`;
  };
  return (
    <Push lf={lf} dur={108} oy={1100}>
      <defs>
        <LG id="pr-sky" stops={[[0, "#e58b4f"], [0.45, "#f3b56a"], [0.62, "#f9dc9a"]]} />
        <LG id="pr-ground" stops={[[0, "#8e7a3a"], [1, "#4c3f1c"]]} />
      </defs>
      <rect x={-60} y={-60} width={1200} height={2040} fill="url(#pr-sky)" />
      <Glow x={240} y={520} r={600} color="#fff0c0" />
      <circle cx={240} cy={520} r={90} fill="#fff4d2" />
      {Array.from({ length: 5 }, (_, j) => (
        <ellipse key={j} cx={j * 260 - lf * 0.6} cy={300 + hash(j + 2) * 200} rx={200} ry={40} fill="#ffd9a6" opacity={0.7} />
      ))}
      {/* the column behind the crest */}
      {[
        { x: 120, d: 6, s: 1.15 },
        { x: 960, d: 8, s: 1.15 },
        { x: 290, d: 12, s: 1.25 },
        { x: 800, d: 16, s: 1.25 },
        { x: 640, d: 20, s: 1.2 },
      ].map((b, i) => (
        <Bean key={i} id={`pr${i}`} x={b.x} y={crest(b.x) + 140 + rise(b.d)} s={b.s} f={lf} outfit={OUTFITS.prussian} hat="cap" expr="determined" look={i % 2 ? -0.3 : 0.3} rim="#ffe2a8" hands={{ l: [-60, -80], r: [60, -150] }} />
      ))}
      <g transform={`translate(470,${crest(470) - 470 + rise(0)})`}>
        <line x1={0} y1={0} x2={0} y2={560} stroke="#3a2a14" strokeWidth={12} />
        <path d={flagWave(0)} fill="#f2efe6" stroke="#231815" strokeWidth={6} />
        <path d={flagWave(0)} fill="none" />
        <path d="M70,40 l26,-18 l26,18 l-10,30 l-32,0 Z" fill="#231815" />
        <path d="M0,0 L0,20" stroke="#231815" strokeWidth={6} />
      </g>
      <path d={ridge} fill="url(#pr-ground)" />
      <path d={ridge} fill="none" stroke="#ffe2a8" strokeWidth={4} opacity={0.6} />
      <Bean
        id="blucher"
        x={470}
        y={1720 + rise(0) * 0.5}
        s={2.1}
        f={lf}
        outfit={OUTFITS.blucher}
        hat="cap"
        hatColor="#151b2c"
        skin="#efc4a2"
        expr="determined"
        mustache
        hair="#f0ede6"
        look={0.4}
        talk={lf > 46}
        hands={{ l: [-60, -80], r: [110, -260] }}
        rim="#ffe2a8"
      />
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={(hash(i) * 1200 + lf * (1 + hash(i + 1))) % 1200} cy={crest(hash(i) * 1080) - 20 - hash(i + 2) * 80} r={20 + hash(i + 3) * 30} fill="#e9c58a" opacity={0.25} />
      ))}
      {bubble > 0 && (
        <g transform={`translate(720,${700}) scale(${bubble})`}>
          <path d="M-230,-80 Q-230,-130 -180,-130 L180,-130 Q230,-130 230,-80 L230,40 Q230,90 180,90 L-60,90 L-140,150 L-120,90 L-180,90 Q-230,90 -230,40 Z" fill="#fffaf0" stroke="#231815" strokeWidth={8} strokeLinejoin="round" />
          <text x={0} y={-6} textAnchor="middle" fontFamily={FONT.anton} fontSize={88} fill="#231815">
            VORWÄRTS!
          </text>
          <text x={0} y={58} textAnchor="middle" fontFamily={FONT.montserrat} fontWeight={700} fontStyle="italic" fontSize={34} fill="#6b5a4a">
            (forward!)
          </text>
        </g>
      )}
    </Push>
  );
};

// ── 6 · Napoleon sees them ─────────────────────────────────────────────

const Shock: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const crash = interpolate(lf, [0, 7], [1.35, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const shake = lf < 10 ? (hash(lf) - 0.5) * 16 : 0;
  const dim = prog(lf, 80, 96);
  return (
    <g transform={`translate(${540 + shake},900) scale(${crash}) translate(-540,-900)`}>
      <Push lf={lf} dur={96} oy={900} to={1.1}>
        <defs>
          <LG id="sh-sky" stops={[[0, "#3b1630"], [0.4, "#b8402e"], [0.62, "#f39a4a"]]} />
        </defs>
        <rect x={-60} y={-60} width={1200} height={2040} fill="url(#sh-sky)" />
        <Glow x={540} y={1180} r={700} color="#ffb060" />
        <circle cx={540} cy={1200} r={180} fill="#ffd28a" opacity={0.9} />
        <filter id="sh-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        {[160, 420, 820, 980].map((x, i) => (
          <g key={x} filter="url(#sh-soft)">
            {Array.from({ length: 6 }, (_, k) => (
              <circle key={k} cx={x + Math.sin((lf + k * 9 + i * 20) / 14) * 30} cy={1180 - k * 120 - ((lf * 1.5) % 120)} r={50 + k * 16} fill="#2a1420" opacity={0.35 - k * 0.04} />
            ))}
          </g>
        ))}
        <path d="M-60,1240 C300,1210 700,1230 1140,1200 L1140,2000 L-60,2000 Z" fill="#2a1420" />
        <Bean
          id="nap6"
          x={540}
          y={1560}
          s={3.0}
          f={lf}
          outfit={OUTFITS.napoleon}
          hat="bicorne"
          expr="shocked"
          look={0.15}
          sweat
          hands={{ l: [-70, -70], r: [80, -110] }}
          holding={{ r: <Telescope angle={70} /> }}
          rim="#ffb060"
        />
        {void f}
      </Push>
      <rect x={-200} y={-200} width={1480} height={2400} fill="#000" opacity={dim * 0.55} />
    </g>
  );
};

// ── the Short ────────────────────────────────────────────────────────

const SCENES = [Tent, Storm, Mud, Wait, Prussians, Shock];

export const BeanRainShort: React.FC = () => {
  useHistFonts();
  const f = useCurrentFrame();
  const si = SHOTS.findIndex((s) => f >= s.from && f < s.to);
  const shot = SHOTS[si];
  const Scene = SCENES[si];
  const lf = f - shot.from;
  const word = WORDS.find((w) => f >= w.from && f < w.to);
  const pop = word ? interpolate(f - word.from, [0, 3], [1.18, 1], { extrapolateRight: "clamp" }) : 1;
  const key = word && KEY.has(word.w);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Scene lf={lf} f={f} />
      </svg>
      {/* a frame of white on every cut, the way the reference channel snaps between shots */}
      {lf < 2 && si > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: lf === 0 ? 0.25 : 0.1 }} />}
      {word && (
        <div
          style={{
            position: "absolute",
            top: 1440,
            width: "100%",
            textAlign: "center",
            fontFamily: "Poppins, Montserrat, sans-serif",
            fontWeight: 900,
            fontSize: 104,
            letterSpacing: -1,
            color: key ? "#ffd84a" : "#ffffff",
            textShadow: [...Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2;
              return `${(Math.cos(a) * 8).toFixed(1)}px ${(Math.sin(a) * 8).toFixed(1)}px 0 #111`;
            }), "0 12px 0 #111", "0 14px 18px rgba(0,0,0,0.5)"].join(", "),
            transform: `scale(${pop})`,
          }}
        >
          {word.w}
        </div>
      )}
      <Grain id="bn-grain" frame={f} opacity={0.08} every={1} freq={0.9} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.42) 100%)" }} />
    </AbsoluteFill>
  );
};

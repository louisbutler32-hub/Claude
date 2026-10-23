import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT, hash, lerp, onN, prog, smokePuffs, useHistFonts } from "../shared";
import { Bean, Binoculars, Musket, OUTFITS } from "../bean/Bean";
import timing from "./timing.json";

// ── Style F · Storybook explainer, 16:9 ───────────────────────────────
//
// The long-form "imagine you're a…" history explainer: second-person
// narration with no captions, flat vector sets (soft sky, peach clouds,
// layered hills, outlined trees), the pebble-people cast acting each line,
// and a few recurring set pieces — the year counter, the spotlight stage,
// the blueprint. Every shot is keyed to the narration's line timings.

type Line = { id: string; start: number; end: number; text: string };
const LINES = timing as Line[];
export const SQ_FPS = 30;
export const SQ_FRAMES = Math.ceil((LINES[LINES.length - 1].end + 0.45) * SQ_FPS);
const at = (id: string) => Math.round(LINES.find((l) => l.id === id)!.start * SQ_FPS);
const endOf = (id: string) => Math.round(LINES.find((l) => l.id === id)!.end * SQ_FPS);
/** The frame a word lands on, estimated from its position in the line. */
const wordAt = (id: string, word: string) => {
  const l = LINES.find((x) => x.id === id)!;
  const i = l.text.indexOf(word);
  return Math.round((l.start + ((l.end - l.start) * Math.max(0, i)) / l.text.length) * SQ_FPS);
};

const INK = "#2b2320";
const W = 1920;
const H = 1080;

// ── set pieces ────────────────────────────────────────────────────────

const Push: React.FC<{ lf: number; dur: number; from?: number; to?: number; ox?: number; oy?: number; dx?: number; children: React.ReactNode }> = ({
  lf, dur, from = 1, to = 1.06, ox = W / 2, oy = H / 2, dx = 0, children,
}) => {
  const p = interpolate(lf, [0, dur], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.33, 0, 0.67, 1) });
  return <g transform={`translate(${ox - p * dx},${oy}) scale(${lerp(from, to, p)}) translate(${-ox},${-oy})`}>{children}</g>;
};

const Cloud: React.FC<{ x: number; y: number; s: number; tint?: string }> = ({ x, y, s, tint = "#f6d9c8" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-120,20 C-130,-10 -100,-30 -74,-20 C-66,-52 -20,-60 0,-36 C16,-66 70,-62 76,-24 C108,-30 130,-4 118,20 Z" fill={tint} />
    <path d="M-120,20 C-90,8 90,8 118,20 Z" fill="#e9bfae" />
    <path d="M-60,-30 C-40,-46 -10,-46 0,-34" stroke="#fff3ea" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />
  </g>
);

const Tree: React.FC<{ x: number; y: number; s: number; c?: string; d?: string }> = ({ x, y, s, c = "#6fa64a", d = "#558a38" }) => {
  const blobs = [
    [0, -150, 62],
    [-46, -112, 48],
    [46, -110, 50],
    [0, -96, 52],
  ];
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-10,0 L-8,-90 L8,-90 L10,0 Z" fill="#7a5233" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {blobs.map(([bx, by, r], i) => (
        <circle key={`o${i}`} cx={bx} cy={by} r={r} fill="none" stroke={INK} strokeWidth={8} />
      ))}
      {blobs.map(([bx, by, r], i) => (
        <circle key={`f${i}`} cx={bx} cy={by} r={r} fill={c} />
      ))}
      <path d="M-40,-90 C-20,-70 30,-70 60,-96 C50,-60 -30,-58 -40,-90 Z" fill={d} />
      <circle cx={-22} cy={-168} r={14} fill="#8fc463" />
    </g>
  );
};

/** Sky, clouds, two hills and a field: the default outdoors. */
const Country: React.FC<{ f: number; sky?: [string, string]; field?: string; far?: string; mid?: string; trees?: boolean }> = ({
  f, sky = ["#9ccbe2", "#f3dcc4"], field = "#8fbf5c", far = "#a9c98a", mid = "#7fb257", trees = true,
}) => (
  <g>
    <defs>
      <linearGradient id="sq-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={sky[0]} />
        <stop offset="1" stopColor={sky[1]} />
      </linearGradient>
    </defs>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sq-sky)" />
    <Cloud x={300 + f * 0.25} y={170} s={1.7} />
    <Cloud x={1300 + f * 0.18} y={110} s={1.3} />
    <Cloud x={860 + f * 0.3} y={320} s={0.8} />
    <Cloud x={1700 + f * 0.22} y={330} s={0.7} />
    <path d={`M-200,560 C200,500 560,540 900,510 C1240,480 1600,520 ${W + 200},500 L${W + 200},${H + 200} L-200,${H + 200} Z`} fill={far} stroke={INK} strokeWidth={4} />
    {trees && [140, 520, 1500, 1760].map((x, i) => <Tree key={x} x={x} y={540 - (i % 2) * 14} s={0.5} c="#86b864" d="#6d9f4f" />)}
    {trees && (
      <g transform="translate(1080,520)">
        {[[-60, 0, 70, 46], [20, 4, 90, 54], [120, 2, 60, 40]].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y - h} width={w} height={h} fill="#efe2c6" stroke={INK} strokeWidth={4} />
            <path d={`M${x - 8},${y - h} L${x + w / 2},${y - h - 30} L${x + w + 8},${y - h} Z`} fill="#b5543c" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <rect x={x + w / 2 - 7} y={y - 22} width={14} height={22} fill="#6b4a32" />
          </g>
        ))}
        <rect x={210} y={-110} width={34} height={110} fill="#e6d6b4" stroke={INK} strokeWidth={4} />
        <path d="M204,-110 L227,-170 L250,-110 Z" fill="#6f7f8f" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
    )}
    <path d={`M-200,660 C300,610 800,650 1200,620 C1500,600 1750,630 ${W + 200},610 L${W + 200},${H + 200} L-200,${H + 200} Z`} fill={mid} stroke={INK} strokeWidth={4} />
    {trees && [80, 380, 1240, 1620].map((x, i) => (
      <g key={x}>
        <ellipse cx={x} cy={668 - (i % 2) * 6} rx={70} ry={34} fill="#5f9444" stroke={INK} strokeWidth={4} />
        <ellipse cx={x + 60} cy={672} rx={50} ry={26} fill="#6aa04c" stroke={INK} strokeWidth={4} />
      </g>
    ))}
    <path d={`M-200,780 C400,740 1100,770 ${W + 200},740 L${W + 200},${H + 200} L-200,${H + 200} Z`} fill={field} stroke={INK} strokeWidth={4} />
    <path d="M1180,752 C1150,820 1000,880 1060,960 C1110,1020 1300,1060 1360,1100 L1560,1100 C1440,1040 1240,1000 1220,950 C1190,880 1290,820 1250,750 Z" fill="#d9bf8c" stroke={INK} strokeWidth={4} />
    {Array.from({ length: 60 }, (_, i) => {
      const x = hash(i) * W;
      const y = 800 + hash(i + 7) * 260;
      return <path key={i} d={`M${x},${y} l6,-14 M${x + 8},${y} l2,-16 M${x + 16},${y} l-4,-12`} stroke="#5e8f3b" strokeWidth={3} strokeLinecap="round" />;
    })}
  </g>
);

const Label: React.FC<{ x: number; y: number; text: string; p: number; tx: number; ty: number }> = ({ x, y, text, p, tx, ty }) => {
  const s = Easing.out(Easing.back(1.8))(p);
  const w = text.length * 22 + 50;
  return (
    <g opacity={p > 0 ? 1 : 0}>
      <path d={`M${x},${y + 30} Q${(x + tx) / 2 + 40},${(y + ty) / 2} ${tx},${ty}`} stroke={INK} strokeWidth={5} fill="none" strokeDasharray={`${400 * p} 400`} />
      <g transform={`translate(${x},${y}) scale(${s}) rotate(-3)`}>
        <rect x={-w / 2} y={-30} width={w} height={60} rx={6} fill="#f7ecd2" stroke={INK} strokeWidth={5} />
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={700} fontSize={34} letterSpacing={3} fill="#b02a22">
          {text}
        </text>
      </g>
    </g>
  );
};

// ── 1 · August 1914, red trousers ────────────────────────────────────

const Marching: React.FC<{ lf: number; dur: number; f: number }> = ({ lf, dur, f }) => {
  const step = (k: number) => Math.abs(Math.sin((lf + k * 7) / 5)) * -10;
  const labelP = prog(f, wordAt("l0", "bright red"), wordAt("l0", "bright red") + 10);
  return (
    <Push lf={lf} dur={dur} to={1.1} ox={760} oy={760}>
      <Country f={lf} />
      {/* the column behind him, marching off to the right */}
      {Array.from({ length: 9 }, (_, i) => (
        <Bean key={i} id={`col${i}`} x={((i * 150 + lf * 2.2) % 1500) + 200} y={735 + step(i) * 0.5} s={0.5} f={lf} outfit={OUTFITS.fr1914} hat="kepi" expr="neutral" look={0.8} hands={{ l: [-50, -80], r: [40, -150] }} holding={{ r: <Musket angle={-80} /> }} />
      ))}
      <Bean id="hero" x={700} y={990 + step(0)} s={1.25} f={lf} outfit={OUTFITS.fr1914} hat="kepi" expr={labelP > 0.5 ? "worried" : "neutral"} look={labelP > 0.5 ? 0 : 0.6} talk={false} hands={{ l: [-60, -76], r: [52, -150] }} holding={{ r: <Musket angle={-80} /> }} />
      <Label x={1140} y={720} text="PANTALON ROUGE" p={labelP} tx={760} ty={960} />
    </Push>
  );
};

// ── 2 · the Germans, in grey, in the hedge ────────────────────────────

const Grey: React.FC<{ lf: number; dur: number; f: number }> = ({ lf, dur, f }) => {
  const pan = interpolate(lf, [0, dur], [0, 760], { extrapolateRight: "clamp", easing: Easing.bezier(0.45, 0, 0.3, 1) });
  const q = prog(f, wordAt("l1", "You can barely"), wordAt("l1", "You can barely") + 10, Easing.out(Easing.back(2)));
  return (
    <g transform={`translate(${-pan},0)`}>
      <g transform="scale(1.4) translate(0,-230)">
        <Country f={lf} sky={["#a7c8d8", "#ead8c2"]} field="#90b46a" mid="#7ea65a" />
      </g>
      {/* the French line, loud in the open */}
      {Array.from({ length: 6 }, (_, i) => (
        <Bean key={i} id={`fr${i}`} x={180 + i * 130} y={1000 - (i % 2) * 30} s={0.9} f={lf} outfit={OUTFITS.fr1914} hat="kepi" expr="neutral" look={0.7} hands={{ l: [-50, -80], r: [44, -150] }} holding={{ r: <Musket angle={-80} /> }} />
      ))}
      {/* the hedge on the far side, and the grey men in it */}
      <g transform="translate(1900,0)">
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={`h${i}`} cx={i * 85} cy={820 + (i % 3) * 8} rx={70} ry={62} fill="#7d846a" stroke="#6b7158" strokeWidth={4} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i} opacity={0.7}>
            <Bean id={`de${i}`} x={90 + i * 160} y={950} s={0.6} f={lf} outfit={{ ...OUTFITS.de1914, coat: "#7f8569" }} hat="pickelhaube" hatColor="#7f8569" skin="#b9ad94" expr="determined" look={-0.6} hands={{ l: [-50, -90], r: [50, -90] }} />
          </g>
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={`f${i}`} cx={40 + i * 85} cy={880 + (i % 2) * 10} rx={70} ry={52} fill="#80866b" stroke="#727860" strokeWidth={4} />
        ))}
        {q > 0 && (
          <g transform={`translate(520,640) scale(${q})`}>
            <circle r={44} fill="#f7ecd2" stroke={INK} strokeWidth={5} />
            <text y={20} textAnchor="middle" fontFamily={FONT.anton} fontSize={60} fill={INK}>
              ?
            </text>
          </g>
        )}
      </g>
    </g>
  );
};

// ── 3 · through the German field glasses ──────────────────────────────

const Glasses: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => {
  const sway = Math.sin(lf / 9) * 14;
  return (
    <g>
      <defs>
        <mask id="sq-bino">
          <rect width={W} height={H} fill="#000" />
          <circle cx={W / 2 - 230 + sway} cy={H / 2} r={420} fill="#fff" />
          <circle cx={W / 2 + 230 + sway} cy={H / 2} r={420} fill="#fff" />
        </mask>
      </defs>
      <rect width={W} height={H} fill="#0d0d0c" />
      <g mask="url(#sq-bino)">
        <Push lf={lf} dur={dur} from={1.6} to={1.75} ox={960} oy={720}>
          <Country f={lf} trees={false} />
          <Bean id="target" x={960} y={1000} s={1.2} f={lf} outfit={OUTFITS.fr1914} hat="kepi" expr="neutral" look={0.2} hands={{ l: [-60, -80], r: [96, -250] }} />
        </Push>
        <circle cx={W / 2 - 230 + sway} cy={H / 2} r={420} fill="none" stroke="#000" strokeWidth={60} opacity={0.35} />
        <circle cx={W / 2 + 230 + sway} cy={H / 2} r={420} fill="none" stroke="#000" strokeWidth={60} opacity={0.35} />
      </g>
    </g>
  );
};

// ── 4 · the spotlight: dressed like a target ──────────────────────────

const Spotlight: React.FC<{ lf: number; dur: number; f: number }> = ({ lf, dur, f }) => {
  const t = prog(f, wordAt("l3", "targets"), wordAt("l3", "targets") + 12, Easing.out(Easing.back(1.6)));
  return (
    <Push lf={lf} dur={dur} to={1.08} oy={640}>
      <rect width={W} height={H} fill="#2a1f1b" />
      <rect y={820} width={W} height={260} fill="#4a3426" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={i * 170} y1={820} x2={i * 170 - 120} y2={H} stroke="#3a281d" strokeWidth={6} />
      ))}
      <path d={`M860,-20 L1060,-20 L1340,900 L580,900 Z`} fill="#f5e3b5" opacity={0.18} />
      <ellipse cx={960} cy={900} rx={380} ry={70} fill="#f5e3b5" opacity={0.35} />
      {t > 0 && (
        <g transform={`translate(960,520) scale(${t})`}>
          {[300, 240, 180, 120, 60].map((r, i) => (
            <circle key={r} r={r} fill={i % 2 ? "#f7ecd2" : "#c8302a"} stroke={INK} strokeWidth={6} />
          ))}
        </g>
      )}
      <Bean id="spot" x={960} y={910} s={1.35} f={lf} outfit={OUTFITS.fr1914} hat="kepi" expr={t > 0.5 ? "worried" : "neutral"} sweat={t > 0.5} look={0} hands={{ l: [-70, -70], r: [70, -70] }} />
    </Push>
  );
};

// ── 5 · a hundred years back: the muskets and the smoke ───────────────

const Muskets: React.FC<{ lf: number; dur: number; f: number }> = ({ lf, dur, f }) => {
  const counter = 50; // frames of the year counter before the battle
  if (lf < counter) {
    const p = prog(lf, 4, counter - 8, Easing.inOut(Easing.cubic));
    const year = Math.round(lerp(1914, 1815, p));
    return (
      <g>
        <rect width={W} height={H} fill="#e8d6ae" />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={hash(i) * W} cy={hash(i + 3) * H} r={40 + hash(i + 5) * 120} fill="#d9c08c" opacity={0.25} />
        ))}
        <g transform={`translate(960,540) rotate(-2)`}>
          <path d="M-460,-150 L460,-150 L430,0 L460,150 L-460,150 L-430,0 Z" fill="#f3e6c6" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <text y={70} textAnchor="middle" fontFamily={FONT.playfair} fontWeight={900} fontSize={220} fill={INK}>
            {year}
          </text>
        </g>
      </g>
    );
  }
  const b = lf - counter;
  // volleys roll down each line; every shot leaves a puff that grows
  const shots: { x: number; y: number; t0: number; dir: number }[] = [];
  for (let i = 0; i < 6; i++) {
    shots.push({ x: 300 + i * 70 + 230, y: 690 - i * 6, t0: 14 + i * 3, dir: 1 });
    shots.push({ x: 1620 - i * 70 - 230, y: 690 - i * 6, t0: 30 + i * 3, dir: -1 });
  }
  const fill = prog(b, 40, dur - counter, Easing.in(Easing.quad));
  return (
    <Push lf={b} dur={dur - counter} to={1.08}>
      <Country f={lf} sky={["#a9c6d6", "#f0d8bd"]} field="#94b462" />
      {Array.from({ length: 6 }, (_, i) => (
        <Bean key={`r${i}`} id={`rc${i}`} x={300 + i * 70} y={860 + i * 12} s={0.85} f={b} outfit={OUTFITS.redcoat} hat="shako" expr="determined" look={0.9} hands={{ l: [70, -140], r: [30, -150] }} holding={{ r: <Musket angle={-6} /> }} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Bean key={`b${i}`} id={`bc${i}`} x={1620 - i * 70} y={860 + i * 12} s={0.85} f={b} outfit={OUTFITS.french} hat="shako" expr="determined" look={-0.9} hands={{ l: [70, -140], r: [30, -150] }} holding={{ r: <Musket angle={-6} /> }} flip />
      ))}
      {shots.map((s, i) => {
        const age = b - s.t0;
        if (age < 0) return null;
        return (
          <g key={i}>
            {age < 4 && <path d={`M${s.x},${s.y} l${s.dir * 40},-14 l${-s.dir * 10},14 l${s.dir * 44},10 l${-s.dir * 44},6 l${s.dir * 6},16 Z`} fill="#ffcf4a" stroke={INK} strokeWidth={3} />}
            {smokePuffs(i + 2, age + 6, 46).map((p, j) => (
              <circle key={j} cx={s.x + s.dir * (40 + p.x * 1.4)} cy={s.y + p.y} r={p.r * 1.25} fill={j % 2 ? "#f4f1ea" : "#e3ddd3"} stroke="#cfc7ba" strokeWidth={3} />
            ))}
          </g>
        );
      })}
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#eeeae2" opacity={fill * 0.9} />
      {void f}
    </Push>
  );
};

// ── 6 · inside the smoke ──────────────────────────────────────────────

const Fog: React.FC<{ lf: number; dur: number; f: number }> = ({ lf, dur, f }) => {
  const meet = Math.min(1, lf / (dur * 0.42));
  const bumped = lf > dur * 0.42;
  const bang = prog(lf, dur * 0.42, dur * 0.42 + 8, Easing.out(Easing.back(2.2)));
  const recog = prog(f, wordAt("l5", "bright colours"), wordAt("l5", "bright colours") + 10);
  const xr = lerp(380, 860, Easing.out(Easing.quad)(meet));
  const xb = lerp(1540, 1060, Easing.out(Easing.quad)(meet));
  const bob = (k: number) => (bumped ? 0 : Math.abs(Math.sin((lf + k) / 4.5)) * -8);
  return (
    <Push lf={lf} dur={dur} to={1.08} oy={700}>
      <rect width={W} height={H} fill="#e9e6df" />
      {Array.from({ length: 14 }, (_, i) => (
        <g key={i} opacity={0.18}>
          <Bean id={`gh${i}`} x={hash(i) * W} y={700 + hash(i + 2) * 180} s={0.55 + hash(i + 4) * 0.3} f={lf} outfit={{ coat: "#9a958c", shade: "#8b867d", trousers: "#a29d94" }} hat="shako" hatColor="#8b867d" skin="#b8b2a8" expr="neutral" />
        </g>
      ))}
      <path d={`M-200,900 C400,880 1300,910 ${W + 200},890 L${W + 200},${H + 200} L-200,${H + 200} Z`} fill="#d9d4c9" />
      <Bean id="lost-r" x={xr - (bumped ? 30 * bang : 0)} y={950 + bob(0)} s={1.15} f={lf} outfit={OUTFITS.redcoat} hat="shako" expr={bumped ? "shocked" : "worried"} look={bumped ? 0.8 : 0.4} hands={{ l: [-80, -150], r: [80, -150] }} />
      <Bean id="lost-b" x={xb + (bumped ? 30 * bang : 0)} y={950 + bob(9)} s={1.15} f={lf} outfit={OUTFITS.french} hat="shako" expr={bumped ? "shocked" : "worried"} look={bumped ? -0.8 : -0.4} hands={{ l: [-80, -150], r: [80, -150] }} />
      {bumped && (
        <g>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${960 + sd * 150},${520}) scale(${bang})`}>
              <path d="M-14,-60 L14,-60 L8,10 L-8,10 Z" fill="#c8302a" stroke={INK} strokeWidth={5} />
              <circle cy={34} r={10} fill="#c8302a" stroke={INK} strokeWidth={5} />
            </g>
          ))}
        </g>
      )}
      {recog > 0 && (
        <g opacity={recog}>
          <text x={xr - 30} y={500} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={700} fontSize={40} fill="#b02a22">
            RED = BRITISH
          </text>
          <text x={xb + 30} y={500} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={700} fontSize={40} fill="#2c4f94">
            BLUE = FRENCH
          </text>
        </g>
      )}
      {/* the smoke itself, drifting over everything */}
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={i} cx={((hash(i) * 2400 + lf * (1 + hash(i + 1))) % 2400) - 240} cy={300 + hash(i + 2) * 700} rx={260} ry={90} fill="#f6f4ef" opacity={0.55} />
      ))}
    </Push>
  );
};

// ── 7 · smokeless powder, then the bullseye ───────────────────────────

const Bullseye: React.FC<{ lf: number; dur: number; f: number; split: number }> = ({ lf, dur, f, split }) => {
  if (lf < split) {
    const draw = prog(lf, 0, split * 0.55, Easing.inOut(Easing.quad));
    return (
      <Push lf={lf} dur={split} to={1.05}>
        <rect width={W} height={H} fill="#1f4f86" />
        {Array.from({ length: 33 }, (_, i) => (
          <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={H} stroke="#3a6aa2" strokeWidth={i % 4 ? 1 : 2.5} />
        ))}
        {Array.from({ length: 19 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 60} x2={W} y2={i * 60} stroke="#3a6aa2" strokeWidth={i % 4 ? 1 : 2.5} />
        ))}
        <g transform="translate(960,540) scale(1.35) translate(-1000,-540)" fill="none" stroke="#eaf3ff" strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`}>
          <path pathLength={1} d="M560,460 L1180,460 L1180,620 L560,620 Z" />
          <path pathLength={1} d="M1180,470 L1300,470 C1380,470 1420,510 1440,540 C1420,570 1380,610 1300,610 L1180,610" />
          <path pathLength={1} d="M600,460 L600,620 M540,480 L560,480 M540,600 L560,600" />
        </g>
        <g transform="translate(960,540) scale(1.35) translate(-1000,-540)">
        {Array.from({ length: 70 }, (_, i) => (
          <rect key={i} x={620 + hash(i) * 540} y={480 + hash(i + 9) * 120} width={10} height={4} fill="#eaf3ff" opacity={draw > hash(i + 3) ? 0.8 : 0} transform={`rotate(${hash(i) * 180},${620 + hash(i) * 540},${480 + hash(i + 9) * 120})`} />
        ))}
        </g>
        <g opacity={prog(lf, 10, 22)}>
          <path d="M420,780 L1610,780 M420,766 L420,794 M1610,766 L1610,794" stroke="#eaf3ff" strokeWidth={3} />
          <text x={960} y={870} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={600} fontSize={54} letterSpacing={8} fill="#eaf3ff">
            SMOKELESS POWDER · 1884
          </text>
          <text x={960} y={250} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={500} fontSize={40} letterSpacing={6} fill="#a9c6e8">
            POUDRE B — NO CLOUD, LONGER RANGE
          </text>
        </g>
      </Push>
    );
  }
  const b = lf - split;
  const ring = prog(b, 6, 22, Easing.out(Easing.cubic));
  return (
    <Push lf={b} dur={dur - split} from={1} to={1.18} ox={900} oy={900}>
      <Country f={lf} />
      <Bean id="last" x={900} y={1000} s={1.3} f={b} outfit={OUTFITS.fr1914} hat="kepi" expr={ring > 0.6 ? "shocked" : "worried"} look={0} sweat hands={{ l: [-70, -70], r: [70, -70] }} />
      <g transform={`translate(900,950) scale(${lerp(4, 1, ring)})`} opacity={ring}>
        <circle r={110} fill="none" stroke="#c8302a" strokeWidth={10} />
        <circle r={60} fill="none" stroke="#c8302a" strokeWidth={8} />
        <path d="M-160,0 L-40,0 M40,0 L160,0 M0,-160 L0,-40 M0,40 L0,160" stroke="#c8302a" strokeWidth={8} />
      </g>
      {void f}
    </Push>
  );
};

// ── the video ────────────────────────────────────────────────────────

const SHOTS = [
  { from: 0, line: "l0", C: Marching },
  { from: at("l1") - 4, line: "l1", C: Grey },
  { from: at("l2") - 4, line: "l2", C: Glasses },
  { from: at("l3") - 6, line: "l3", C: Spotlight },
  { from: at("l4") - 8, line: "l4", C: Muskets },
  { from: at("l5") - 4, line: "l5", C: Fog },
  { from: at("l6") - 4, line: "l6", C: Bullseye },
];

export const TrouserVideo: React.FC<{ narration?: string | null }> = ({ narration = "assets/vo/histstyle-trousers.mp3" }) => {
  useHistFonts();
  const f = useCurrentFrame();
  let si = 0;
  for (let i = 0; i < SHOTS.length; i++) if (f >= SHOTS[i].from) si = i;
  const shot = SHOTS[si];
  const next = SHOTS[si + 1]?.from ?? SQ_FRAMES;
  const lf = f - shot.from;
  const dur = next - shot.from;
  const Scene = shot.C as React.FC<{ lf: number; dur: number; f: number; split: number }>;
  const split = wordAt("l6", "and those") - shot.from;
  // a soft dip between shots, the way the reference cuts are cushioned
  const dip = Math.max(0, 1 - Math.min(lf, next - f) / 3) * 0.25;
  void endOf;
  void onN;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {narration && <Audio src={staticFile(narration)} />}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Scene lf={lf} dur={dur} f={f} split={split} />
      </svg>
      <AbsoluteFill style={{ background: "#000", opacity: si > 0 ? dip : 0 }} />
      {/* paper grain and a soft edge, so the flat colour doesn't feel digital */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.12 }}>
        <filter id="sq-paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#sq-paper)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 75% at 50% 50%, rgba(40,20,10,0) 65%, rgba(40,20,10,0.28) 100%)" }} />
    </AbsoluteFill>
  );
};

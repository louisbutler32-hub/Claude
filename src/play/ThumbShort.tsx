import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import cfg from "./thumb-beat.json";
import { Bear, Bunny, Cat, Dog, type Pose } from "./chars";
import { HAND, loadPlayFonts, Marker } from "./text";

/**
 * "Move your thumb to the beat!" — the thumb-dance Short.
 *
 * Seven scenes of eight beats each, every one cut on the beat. The first is
 * the instruction: a big cartoon thumb that flips up and down on every beat
 * while the words go bold and thin. Then six little gags, one per scene,
 * each with something that lands exactly on the beat, for the viewer to
 * keep tapping along to.
 *
 * The timing (tempo, first beat, cut frames) was measured off the
 * reference clip and lives in thumb-beat.json. Everything on screen is a
 * function of the beat position, so it stays on the reference's audio.
 * Motion is drawn "on twos", like the reference: poses hold for two frames.
 */

export const W = 1080;
export const H = 1920;
export const THUMB_FRAMES = cfg.duration;
const FPS = cfg.fps;
const INK = "#2b2530";

/* ------------------------------------------------------------------ */
/* timing                                                              */
/* ------------------------------------------------------------------ */

type Clock = {
  /** beat position since the start of the video (0 = first beat) */
  b: number;
  /** beat position since the start of this scene */
  jb: number;
  /** whole beat within the scene (a hair early, so the hit frame is beat k) */
  k: number;
  /** position within the beat, roughly 0..1 (a little negative just before the hit) */
  ph: number;
  /** 1 on the beat, decaying to 0 */
  pulse: number;
  scene: number;
  frame: number;
  /** seconds, on twos */
  t: number;
};

const useClock = (): Clock => {
  const frame = useCurrentFrame();
  const fs = Math.floor(frame / 2) * 2 + 1; // hold poses for two frames
  const t = fs / FPS;
  const b = (t - cfg.t0) / cfg.period;
  let scene = 0;
  for (let i = 0; i < cfg.cuts.length - 1; i++) if (frame >= cfg.cuts[i]) scene = i;
  const jb = b - scene * cfg.beatsPerScene;
  const k = Math.max(0, Math.floor(jb + 0.15));
  const ph = jb - k;
  const pulse = ph < 0 ? 0 : Math.exp(-ph * 5.5);
  return { b, jb, k, ph, pulse, scene, frame, t };
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const backOut = (x: number) => {
  const c = clamp01(x) - 1;
  return 1 + c * c * (2.7 * c + 1.7);
};

/* ------------------------------------------------------------------ */
/* backgrounds and small props                                         */
/* ------------------------------------------------------------------ */

/** white hand-drawn loops, the doodle texture behind every scene */
export const Scribbles: React.FC<{ seed: number; n?: number; colour?: string; opacity?: number; y0?: number; y1?: number }> = ({
  seed,
  n = 26,
  colour = "#ffffff",
  opacity = 0.5,
  y0 = 0,
  y1 = H,
}) => {
  const rnd = (i: number) => {
    const x = Math.sin(seed * 91.7 + i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const loops: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const cx = rnd(i) * W;
    const cy = y0 + rnd(i + 100) * (y1 - y0);
    const r = 26 + rnd(i + 200) * 40;
    const pts: string[] = [];
    for (let a = 0; a <= 4.4 * Math.PI; a += 0.35) {
      const rr = r * (0.55 + 0.45 * Math.sin(a * 0.5 + i));
      pts.push(`${(cx + Math.cos(a) * rr + a * 6).toFixed(1)} ${(cy + Math.sin(a) * rr * 0.8).toFixed(1)}`);
    }
    loops.push(<path key={i} d={`M ${pts.join(" L ")}`} fill="none" stroke={colour} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />);
  }
  return <g opacity={opacity}>{loops}</g>;
};

export const Shadow: React.FC<{ x: number; y: number; rx: number; o?: number }> = ({ x, y, rx, o = 0.18 }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.16} fill="#2b2530" opacity={o} />
);

const Apple: React.FC<{ x: number; y: number; r: number; kind: number; spin: number }> = ({ x, y, r, kind, spin }) => {
  const body = ["#ee4b45", "#8fd14f", "#f7c73a"][kind % 3];
  const dark = ["#a92a2a", "#5c9a26", "#c48f12"][kind % 3];
  return (
    <g transform={`translate(${x} ${y}) rotate(${spin})`}>
      <path
        d={`M 0 ${-r * 0.7} C ${r * 0.5} ${-r * 1.15} ${r * 1.25} ${-r * 0.55} ${r * 1.05} ${r * 0.25} C ${r * 0.9} ${r * 0.95} ${r * 0.35} ${r * 1.15} 0 ${r * 0.95} C ${-r * 0.35} ${r * 1.15} ${-r * 0.9} ${r * 0.95} ${-r * 1.05} ${r * 0.25} C ${-r * 1.25} ${-r * 0.55} ${-r * 0.5} ${-r * 1.15} 0 ${-r * 0.7} Z`}
        fill={body}
        stroke={dark}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <ellipse cx={-r * 0.45} cy={-r * 0.3} rx={r * 0.2} ry={r * 0.32} fill="#ffffff" opacity={0.55} transform={`rotate(24 ${-r * 0.45} ${-r * 0.3})`} />
      <path d={`M 0 ${-r * 0.7} q 4 ${-r * 0.35} ${r * 0.28} ${-r * 0.5}`} stroke="#6a4a2a" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={`M 4 ${-r * 0.85} q ${r * 0.5} ${-r * 0.45} ${r * 0.85} ${-r * 0.1} q ${-r * 0.4} ${r * 0.3} ${-r * 0.85} ${r * 0.1} Z`} fill="#6bbf4a" stroke="#3f8a2a" strokeWidth={3.5} strokeLinejoin="round" />
    </g>
  );
};

const Carrot: React.FC = () => (
  <g>
    <path d="M -4 -26 C -16 -50 -34 -64 -46 -60 M 0 -28 C 0 -56 6 -74 0 -84 M 4 -26 C 18 -50 34 -60 46 -54" stroke="#4fae43" strokeWidth={9} strokeLinecap="round" fill="none" />
    <path d="M -22 -28 C -26 10 -10 60 0 88 C 10 60 26 10 22 -28 C 12 -36 -12 -36 -22 -28 Z" fill="#ff9b3d" stroke="#c4661a" strokeWidth={5} strokeLinejoin="round" />
    <path d="M -12 -6 h 12 M 2 22 h 12 M -8 44 h 10" stroke="#d97425" strokeWidth={4} strokeLinecap="round" />
    <ellipse cx={-10} cy={-8} rx={4} ry={14} fill="#ffffff" opacity={0.45} />
  </g>
);

/** a beach ball, striped in three colours */
const Ball: React.FC<{ x: number; y: number; r: number; spin: number }> = ({ x, y, r, spin }) => (
  <g transform={`translate(${x} ${y}) rotate(${spin})`}>
    <clipPath id="ballclip">
      <circle r={r} />
    </clipPath>
    <circle r={r} fill="#ffffff" />
    <g clipPath="url(#ballclip)">
      <path d={`M 0 0 L ${-r} ${-r} L ${r} ${-r} Z`} fill="#ff5f6d" />
      <path d={`M 0 0 L ${r} ${-r} L ${r} ${r} Z`} fill="#ffc94a" />
      <path d={`M 0 0 L ${r} ${r} L ${-r} ${r} Z`} fill="#4ab7ff" />
      <path d={`M 0 0 L ${-r} ${r} L ${-r} ${-r} Z`} fill="#7be495" />
    </g>
    <circle r={r} fill="none" stroke="#3b2f52" strokeWidth={6} />
    <circle r={9} fill="#ffffff" stroke="#3b2f52" strokeWidth={4} />
    <ellipse cx={-r * 0.42} cy={-r * 0.45} rx={r * 0.16} ry={r * 0.26} fill="#ffffff" opacity={0.6} transform={`rotate(30 ${-r * 0.42} ${-r * 0.45})`} />
  </g>
);

const Yarn: React.FC<{ x: number; y: number; r: number; spin: number }> = ({ x, y, r, spin }) => (
  <g transform={`translate(${x} ${y}) rotate(${spin})`}>
    <clipPath id="yarnclip">
      <circle r={r} />
    </clipPath>
    <circle r={r} fill="#ff8fb6" />
    <g clipPath="url(#yarnclip)" fill="none" stroke="#e2618f" strokeWidth={6} strokeLinecap="round">
      <path d={`M ${-r} ${-r * 0.5} Q 0 ${-r * 0.1} ${r} ${-r * 0.6}`} />
      <path d={`M ${-r} ${-r * 0.05} Q 0 ${r * 0.4} ${r} ${-r * 0.1}`} />
      <path d={`M ${-r} ${r * 0.4} Q 0 ${r * 0.9} ${r} ${r * 0.35}`} />
      <path d={`M ${-r * 0.6} ${-r} Q ${-r * 0.2} 0 ${-r * 0.5} ${r}`} />
      <path d={`M ${r * 0.1} ${-r} Q ${r * 0.5} 0 ${r * 0.2} ${r}`} />
    </g>
    <circle r={r} fill="none" stroke="#b03d69" strokeWidth={6} />
    <ellipse cx={-r * 0.4} cy={-r * 0.42} rx={r * 0.16} ry={r * 0.26} fill="#ffffff" opacity={0.6} transform={`rotate(30 ${-r * 0.4} ${-r * 0.42})`} />
  </g>
);

const Note: React.FC<{ x: number; y: number; s: number; c: string; r?: number }> = ({ x, y, s, c, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill={c} stroke="#ffffff" strokeWidth={5} strokeLinejoin="round" paintOrder="stroke">
    <ellipse cx={0} cy={0} rx={22} ry={16} transform="rotate(-20)" />
    <rect x={14} y={-72} width={9} height={68} rx={3} />
    <path d="M 23 -72 q 24 8 22 34 q -8 -14 -22 -14 Z" />
  </g>
);

const Watermark: React.FC = () => <Marker text="@boppitypals" size={44} x={834} y={1858} fill={INK} line="#ffffff" lineW={9} weight={400} letterSpacing={0.5} />;

/* ------------------------------------------------------------------ */
/* scene 0 — the instruction and the thumb                             */
/* ------------------------------------------------------------------ */

const SKIN_LINE = "#8a5a44";

const ThumbScene: React.FC<{ c: Clock }> = ({ c }) => {
  const { fromDeg, toDeg, transitionBeats } = cfg.thumb;
  // the thumb flips on every beat: each flip is centred on the beat
  const n = Math.round(c.b);
  const d = c.b - n;
  const target = n % 2 === 0 ? fromDeg : toDeg;
  const prev = n % 2 === 0 ? toDeg : fromDeg;
  const s = smooth((d + transitionBeats / 2) / transitionBeats);
  const angle = c.b < -0.4 ? fromDeg : prev + (target - prev) * s;
  // words go bold on one beat, thin on the next
  const bold = n % 2 === 0;
  const punch = 1 + 0.045 * Math.exp(-Math.abs(d) * 9);
  const tx = bold
    ? { fill: "#17101c", weight: 700, stroke: 3.2 }
    : { fill: "#7b6a72", weight: 400, stroke: 0 };
  const line = (text: string, size: number, x: number, y: number, rot: number) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(0, -50%) rotate(${rot}deg) scale(${punch})`,
        transformOrigin: "left center",
        fontFamily: HAND,
        fontSize: size,
        fontWeight: tx.weight,
        color: tx.fill,
        WebkitTextStroke: `${tx.stroke}px ${tx.fill}`,
        whiteSpace: "nowrap",
        lineHeight: 1,
        letterSpacing: 1,
      }}
    >
      {text}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#ffcabf, #ffbdb6)" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff0e4" />
            <stop offset="0.6" stopColor="#ffdcc4" />
            <stop offset="1" stopColor="#f6b99a" />
          </linearGradient>
        </defs>
        <g transform="translate(1080 1650) scale(1.2) translate(-1080 -1650)">
        {/* the thumb, drawn first so the fist covers its base */}
        <g transform={`translate(800 1300) rotate(${angle})`}>
          <path
            d="M 20 -100 C -100 -116 -200 -112 -290 -100 C -370 -90 -402 -50 -402 0 C -402 50 -370 90 -290 100 C -200 112 -100 116 20 100 Z"
            fill="url(#skin)"
            stroke={SKIN_LINE}
            strokeWidth={8}
            strokeLinejoin="round"
          />
          {/* nail */}
          <path d="M -376 -6 C -376 -44 -350 -60 -318 -56 C -284 -52 -272 -28 -274 0 C -276 28 -300 46 -334 44 C -362 42 -376 22 -376 -6 Z" fill="#ffffff" stroke={SKIN_LINE} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -352 -26 q 14 -14 34 -12" stroke="#f3d6c4" strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* joint creases */}
          <path d="M -170 -60 q 6 26 0 52 M -142 -54 q 6 24 0 46 M -198 -54 q 5 22 0 40" stroke={SKIN_LINE} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
        {/* the fist */}
        <path d="M 690 1250 C 690 1180 760 1150 840 1160 L 1200 1160 L 1200 1800 L 800 1800 C 720 1800 690 1740 690 1680 Z" fill="url(#skin)" stroke={SKIN_LINE} strokeWidth={8} strokeLinejoin="round" />
        {/* curled fingers */}
        {[1400, 1500, 1600, 1700].map((y, i) => (
          <g key={y}>
            <path d={`M ${880 - i * 6} ${y - 42} C ${770 - i * 10} ${y - 44} ${712 - i * 8} ${y - 26} ${712 - i * 8} ${y} C ${712 - i * 8} ${y + 26} ${770 - i * 10} ${y + 44} ${880 - i * 6} ${y + 42} Z`} fill="url(#skin)" stroke={SKIN_LINE} strokeWidth={7} strokeLinejoin="round" />
            <path d={`M ${790 - i * 8} ${y - 24} q -6 24 0 46`} stroke={SKIN_LINE} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
          </g>
        ))}
        {/* knuckle wrinkles */}
        <path d="M 840 1210 q 22 -14 44 0 M 900 1200 q 22 -14 44 0 M 960 1210 q 22 -14 44 0 M 850 1260 q 26 -12 50 2" stroke={SKIN_LINE} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
      </svg>
      {line("Move your", 138, 60, 168, -9)}
      {line("thumb to the", 116, 46, 318, -9)}
      {line("BEAT!", 236, 92, 528, -9)}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 1 — Poppy pops out of her burrow                              */
/* ------------------------------------------------------------------ */

const BurrowScene: React.FC<{ c: Clock }> = ({ c }) => {
  const GROUND = 1420;
  // up on the even beats, down on the odd ones, and up for the finish
  const isUp = (k: number) => k % 2 === 0 || k >= 7;
  const target = isUp(c.k) ? 1 : 0;
  const prev = isUp(c.k - 1) ? 1 : 0;
  const rise = clamp01((c.ph + 0.14) / 0.36);
  const e = target > prev ? backOut(rise) : smooth(rise);
  const up = prev + (target - prev) * e;
  const drop = (1 - up) * 1150;
  const offbeat = Math.abs(Math.sin(Math.PI * c.jb * 2));
  const showing = up > 0.5;
  const pose: Pose = {
    eyes: showing ? (c.pulse > 0.35 ? "happy" : "open") : "shock",
    mouth: showing ? (c.pulse > 0.35 ? "open" : "smile") : "o",
    handR: [86, -158 - offbeat * 14],
    handL: [-62, -70],
    tilt: showing ? Math.sin(Math.PI * c.jb) * 4 : 0,
    squash: 1 - 0.05 * c.pulse * target,
    look: [Math.sin(Math.PI * c.jb) * 0.8, 0],
  };
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#a9e2ff, #eafaff)" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Scribbles seed={3} n={14} y0={0} y1={1100} opacity={0.75} />
        <ellipse cx={540} cy={1900} rx={1100} ry={560} fill="#8fdc8c" stroke="#5fae5c" strokeWidth={8} />
        <ellipse cx={540} cy={GROUND + 8} rx={430} ry={100} fill="#8b5a36" stroke="#5c3a20" strokeWidth={8} />
        <ellipse cx={540} cy={GROUND} rx={330} ry={66} fill="#3b2416" />
        <clipPath id="hole">
          <rect x={0} y={0} width={W} height={GROUND} />
        </clipPath>
        <g clipPath="url(#hole)">
          <g transform={`translate(540 ${GROUND + drop}) scale(2.5)`}>
            <Bunny {...pose} />
            <g transform={`translate(${pose.handR![0]} ${pose.handR![1] - 40}) rotate(${Math.sin(Math.PI * c.jb) * 10}) scale(0.7)`}>
              <Carrot />
            </g>
          </g>
        </g>
        {/* the near lip of the hole, in front of her */}
        <path d={`M 110 ${GROUND + 8} C 140 ${GROUND + 128} 940 ${GROUND + 128} 970 ${GROUND + 8} C 880 ${GROUND + 60} 200 ${GROUND + 60} 110 ${GROUND + 8} Z`} fill="#8b5a36" stroke="#5c3a20" strokeWidth={8} strokeLinejoin="round" />
        {[240, 440, 640, 840].map((x, i) => (
          <ellipse key={x} cx={x} cy={GROUND + 86 + (i % 2) * 8} rx={14} ry={9} fill="#6d4526" opacity={0.7} />
        ))}
        {/* grass tufts */}
        {[90, 190, 900, 1000].map((x, i) => (
          <path key={x} d={`M ${x} 1700 q -10 -50 -30 -70 M ${x} 1700 q 4 -60 0 -84 M ${x} 1700 q 14 -46 34 -64`} stroke="#4f9d4b" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.8 - i * 0.05} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 2 — Bruno juggles apples                                      */
/* ------------------------------------------------------------------ */

const JuggleScene: React.FC<{ c: Clock }> = ({ c }) => {
  const ORIGIN: [number, number] = [540, 1640];
  const SC = 2.8;
  const REST_X = 112;
  const REST_Y = -58;
  const handWorld = (side: 0 | 1, dip: number): [number, number] => [ORIGIN[0] + (side === 0 ? -1 : 1) * REST_X * SC, ORIGIN[1] + (REST_Y + dip) * SC];
  const apples: React.ReactNode[] = [];
  const first = Math.floor(c.jb) - 3;
  for (let n = first; n <= Math.floor(c.jb + 0.2); n++) {
    const tau = (c.jb - n) / 3;
    if (tau < 0 || tau > 1) continue;
    const from = handWorld((((n % 2) + 2) % 2) as 0 | 1, 0);
    const to = handWorld((1 - (((n % 2) + 2) % 2)) as 0 | 1, 0);
    const x = from[0] + (to[0] - from[0]) * tau;
    const y = from[1] + (to[1] - from[1]) * tau - 820 * 4 * tau * (1 - tau);
    apples.push(<Apple key={n} x={x} y={y} r={66} kind={((n % 3) + 3) % 3} spin={tau * 420 * (n % 2 ? 1 : -1)} />);
  }
  const dip = c.pulse * 16;
  const pose: Pose = {
    eyes: c.pulse > 0.4 ? "happy" : "open",
    mouth: c.pulse > 0.4 ? "open" : "smile",
    handL: [-REST_X, REST_Y + (c.k % 2 === 0 ? dip : 0)],
    handR: [REST_X, REST_Y + (c.k % 2 === 1 ? dip : 0)],
    look: [Math.sin(Math.PI * c.jb) * 0.9, -0.7],
    squash: 1 - 0.035 * c.pulse,
    tilt: Math.sin(Math.PI * c.jb) * 2.2,
  };
  return (
    <AbsoluteFill style={{ background: "#fdeec2" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Scribbles seed={7} n={22} colour="#f3d488" opacity={0.7} y0={0} y1={1500} />
        <rect x={0} y={1630} width={W} height={290} fill="#f2c987" />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M ${i * 120 - 20} 1630 L ${i * 120 - 80} 1920`} stroke="#d9a860" strokeWidth={7} opacity={0.6} />
        ))}
        <path d="M 0 1630 H 1080" stroke="#d9a860" strokeWidth={8} />
        <Shadow x={540} y={1646} rx={400} />
        <g transform={`translate(${ORIGIN[0]} ${ORIGIN[1]}) scale(${SC})`}>
          <Bear {...pose} />
        </g>
        {apples}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 3 — Biscuit bops the ball on his nose                         */
/* ------------------------------------------------------------------ */

const BallScene: React.FC<{ c: Clock }> = ({ c }) => {
  const ORIGIN: [number, number] = [540, 1700];
  const SC = 2.9;
  const noseY = ORIGIN[1] + -146 * SC;
  const ph = c.jb - Math.floor(c.jb + 0.0001);
  const ballR = 100;
  const bounce = 4 * ph * (1 - ph) * 720;
  const by = noseY - ballR - 4 - bounce;
  const bx = 540 + Math.sin(Math.PI * c.jb) * 140;
  const squashBall = c.pulse * 0.12;
  const pose: Pose = {
    eyes: c.pulse > 0.3 ? "happy" : "open",
    mouth: c.pulse > 0.3 ? "open" : "smile",
    look: [(bx - 540) / 140, -1],
    squash: 1 - 0.06 * c.pulse,
    tilt: Math.sin(Math.PI * c.jb) * 4,
    wag: Math.sin(c.t * 34) * 24,
    armL: [-38, 30],
    armR: [38, 30],
  };
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#e5dbff, #d3c4ff)" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 7 }, (_, q) => <circle key={`${r}-${q}`} cx={q * 170 + (r % 2) * 85} cy={r * 250 + 120} r={20} fill="#ffffff" opacity={0.35} />),
        )}
        <Scribbles seed={11} n={10} colour="#ffffff" opacity={0.5} y0={0} y1={1300} />
        <rect x={0} y={1690} width={W} height={230} fill="#b9a4f2" />
        <Shadow x={540} y={1712} rx={400} o={0.22} />
        <g transform={`translate(${ORIGIN[0]} ${ORIGIN[1]}) scale(${SC})`}>
          <Dog {...pose} />
        </g>
        <g transform={`translate(0 ${c.pulse * 10})`}>
          <g transform={`translate(${bx} ${by}) scale(${1 + squashBall} ${1 - squashBall}) translate(${-bx} ${-by})`}>
            <Ball x={bx} y={by} r={ballR} spin={c.jb * 160} />
          </g>
        </g>
        {c.pulse > 0.45 ? (
          <g stroke="#ffffff" strokeWidth={9} strokeLinecap="round">
            <path d={`M ${bx - 130} ${noseY - 70} l -40 -26 M ${bx + 130} ${noseY - 70} l 40 -26 M ${bx} ${noseY - 150} l 0 -44`} />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 4 — Mimi and the swinging yarn                                */
/* ------------------------------------------------------------------ */

const YarnScene: React.FC<{ c: Clock }> = ({ c }) => {
  const ORIGIN: [number, number] = [540, 1730];
  const SC = 3.0;
  const L = 880;
  const theta = 28 * Math.cos(Math.PI * c.jb) * (Math.PI / 180);
  const px = 540 + L * Math.sin(theta);
  const py = -20 + L * Math.cos(theta);
  const side = Math.cos(Math.PI * c.jb) >= 0 ? 1 : -1; // which side the yarn is on
  const swat = c.pulse; // the paw goes up on the beat, when the yarn is out at the end of its swing
  const pose: Pose = {
    eyes: "shock",
    mouth: c.pulse > 0.35 ? "o" : "smile",
    look: [Math.sin(theta) * 2.4, -0.4],
    handL: side < 0 ? [-118 - swat * 12, -150 - swat * 60] : [-64, -50],
    handR: side > 0 ? [118 + swat * 12, -150 - swat * 60] : [64, -50],
    tilt: -Math.sin(theta) * 9,
    squash: 1 - 0.03 * c.pulse,
    wag: Math.sin(c.t * 20) * 18,
  };
  return (
    <AbsoluteFill style={{ background: "#c9f2e2" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Scribbles seed={19} n={24} colour="#ffffff" opacity={0.6} y0={0} y1={1600} />
        <rect x={0} y={1720} width={W} height={200} fill="#a6e0cb" />
        <Shadow x={540} y={1742} rx={400} o={0.2} />
        <g transform={`translate(${ORIGIN[0]} ${ORIGIN[1]}) scale(${SC})`}>
          <Cat {...pose} />
        </g>
        <line x1={540} y1={-20} x2={px} y2={py - 80} stroke="#5a4a63" strokeWidth={6} strokeLinecap="round" />
        <path d={`M ${px} ${py + 78} q ${-side * 40} 70 ${-side * 10} 120 q ${side * 30} 40 ${side * 5} 84`} stroke="#e2618f" strokeWidth={7} fill="none" strokeLinecap="round" />
        <Yarn x={px} y={py} r={84} spin={theta * 700} />
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 5 — the four pals jump in turn                                */
/* ------------------------------------------------------------------ */

const PalsScene: React.FC<{ c: Clock }> = ({ c }) => {
  const SC = 1.6;
  // clockwise from top-left; each keeps its own slot
  const slots: { id: "bear" | "cat" | "bunny" | "dog"; x: number; y: number }[] = [
    { id: "bear", x: 300, y: 900 },
    { id: "cat", x: 780, y: 900 },
    { id: "bunny", x: 780, y: 1590 },
    { id: "dog", x: 300, y: 1590 },
  ];
  const Comp = { bear: Bear, cat: Cat, bunny: Bunny, dog: Dog };
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#ffd9b8, #ffb9c9)" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Scribbles seed={29} n={22} colour="#ffffff" opacity={0.45} />
        {[900, 1590].map((y) => (
          <rect key={y} x={70} y={y + 6} width={940} height={60} rx={30} fill="#ffffff" opacity={0.35} />
        ))}
        {slots.map((s, i) => {
          const both = c.k >= 6; // the last two beats, everybody jumps
          // the jump for beat n takes off at n-0.6 and lands on the beat
          let air = 0;
          let crouch = 0;
          let jumpBeat = -1;
          for (let n = Math.max(0, Math.floor(c.jb)); n <= Math.floor(c.jb) + 1; n++) {
            const mine = both && n >= 6 ? true : n % 4 === i;
            if (!mine) continue;
            const tau = (c.jb - (n - 0.62)) / 0.62;
            if (tau >= 0 && tau <= 1) {
              air = 4 * tau * (1 - tau);
              jumpBeat = n;
            } else if (tau < 0 && tau > -0.5) {
              crouch = 1 + tau * 2;
            }
          }
          const landed = jumpBeat === -1 && c.pulse > 0.2 && (both && c.k >= 6 ? true : c.k % 4 === i);
          const Ch = Comp[s.id];
          const airborne = air > 0.02;
          const pose: Pose = {
            eyes: airborne || landed ? "happy" : "open",
            mouth: airborne || landed ? "open" : "smile",
            armL: airborne ? [-52, -70] : [-24, 42],
            armR: airborne ? [52, -70] : [24, 42],
            squash: 1 - crouch * 0.08 - (landed ? 0.07 * c.pulse : 0),
            tilt: airborne ? Math.sin(air * 3) * 6 * (i % 2 ? 1 : -1) : Math.sin(Math.PI * c.jb * 2 + i) * 1.5,
            wag: Math.sin(c.t * 20 + i) * 16,
            stomp: 0,
          };
          return (
            <g key={s.id}>
              <Shadow x={s.x} y={s.y + 6} rx={150 - air * 40} o={0.2 - air * 0.08} />
              <g transform={`translate(${s.x} ${s.y - air * 200}) scale(${SC})`}>
                <Ch {...pose} />
              </g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 6 — Biscuit, very close, tongue out                           */
/* ------------------------------------------------------------------ */

const TongueScene: React.FC<{ c: Clock }> = ({ c }) => {
  const SC = 3.35;
  const flip = c.k % 2 === 0 ? 1 : -1;
  const pose: Pose = {
    eyes: c.pulse > 0.5 ? "shock" : "sparkle",
    mouth: c.pulse > 0.25 ? "tongue" : "open",
    look: [flip * (0.4 + c.pulse * 0.6), -0.15],
    tilt: flip * (3 + c.pulse * 5),
    squash: 1 - 0.04 * c.pulse,
    armL: [-30, 50],
    armR: [30, 50],
  };
  const notes = [0, 1, 2, 3, 4].map((i) => {
    const t = (c.jb * 0.5 + i * 0.37) % 1;
    return <Note key={i} x={110 + i * 210 + Math.sin(t * 6 + i) * 30} y={1780 - t * 1500} s={0.9 + (i % 2) * 0.25} c={["#ff7b8a", "#ffd166", "#7be0c3", "#8fb4ff", "#ff9bd6"][i]} r={Math.sin(t * 8 + i) * 12} />;
  });
  return (
    <AbsoluteFill style={{ background: "#3b1f5e" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 700) rotate(${c.jb * 6})`} opacity={0.5}>
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d="M 0 0 L 1700 -130 L 1700 130 Z" fill={i % 2 ? "#5a2f8a" : "#4b2678"} transform={`rotate(${i * 30})`} />
          ))}
        </g>
        <Scribbles seed={37} n={12} colour="#8e5fd0" opacity={0.6} />
        {notes}
        <g transform={`translate(540 1500) scale(${SC})`}>
          <Dog {...pose} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

const SCENES: React.FC<{ c: Clock }>[] = [ThumbScene, BurrowScene, JuggleScene, BallScene, YarnScene, PalsScene, TongueScene];

export const ThumbShort: React.FC<{ audio?: string | null }> = ({ audio = "audio/play-thumb-ref.wav" }) => {
  loadPlayFonts();
  const c = useClock();
  const Scene = SCENES[c.scene];
  // every beat gives the whole picture a tiny push, like a speaker cone
  const push = 1 + 0.018 * c.pulse;
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <AbsoluteFill style={{ transform: `scale(${c.scene === 0 ? 1 : push})`, transformOrigin: "50% 60%" }}>
        <Scene c={c} />
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  );
};

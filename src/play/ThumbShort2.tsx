import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import cfg from "./thumb2-beat.json";
import { Bear, Bunny, Cat, Dog, type Pose } from "./chars";
import { loadPlayFonts } from "./text";
import { Scribbles, Shadow } from "./ThumbShort";

/**
 * "Move your thumb to the beat!" — take two, rebuilt on the second
 * reference clip.
 *
 * The first attempt let the characters move their faces and the gags drift
 * off the audio. This one hangs every scene on real, physical events that
 * land on the beat: something is thrown, dropped, sliced, popped or
 * landed on every beat, and the whole body or prop moves with it.
 *
 * Structure, measured off the reference (30 fps, 686 frames):
 *  - a white outlined thumb that snaps up on the even beats and settles
 *    on the odd ones, under a small headline;
 *  - six scenes, each eight beats: a pancake flip, characters dropping in
 *    and launching off the top, fruit sliced on the odd beats and a bomb,
 *    a bunny flop, a party popper, and a hopping line across the field.
 *
 * The audio is the same 147 BPM track as the first thumb clip: quarter
 * notes for the first eight beats, off-beat hats after. Cuts are the
 * reference's own frames (thumb2-beat.json); everything inside a scene is a
 * function of the beat position. Poses hold for two frames, like the
 * reference.
 */

export const W = 1080;
export const H = 1920;
export const THUMB2_FRAMES = cfg.duration;
const FPS = cfg.fps;
const INK = "#26202c";

/* ------------------------------------------------------------------ */
/* timing                                                              */
/* ------------------------------------------------------------------ */

type Clock = { b: number; jb: number; scene: number; frame: number; t: number };

const useClock = (): Clock => {
  const frame = useCurrentFrame();
  const fs = Math.floor(frame / 2) * 2 + 1.3; // hold poses for two frames; a hair ahead so impacts land on the beat
  const t = fs / FPS;
  const b = (t - cfg.t0) / cfg.period;
  let scene = 0;
  for (let i = 0; i < cfg.cuts.length - 1; i++) if (frame >= cfg.cuts[i]) scene = i;
  return { b, jb: b - scene * cfg.beatsPerScene, scene, frame, t };
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 1 the moment beat `at` lands, decaying to 0 */
const hitAt = (jb: number, at: number, k = 7) => (jb < at ? 0 : Math.exp(-(jb - at) * k));
/** position within a repeating cycle of `len` beats, always 0..len */
const cyc = (jb: number, len: number) => ((jb % len) + len) % len;

const rnd = (i: number, seed = 1) => {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Watermark: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 34,
      bottom: 34,
      fontFamily: "'Fredoka', 'ComicRelief', system-ui, sans-serif",
      fontWeight: 600,
      fontSize: 40,
      color: "#ffffff",
      WebkitTextStroke: "8px rgba(38,32,44,0.55)",
      paintOrder: "stroke fill",
      opacity: 0.9,
    }}
  >
    @boppitypals
  </div>
);

/* ------------------------------------------------------------------ */
/* scene 0 — the thumb                                                 */
/* ------------------------------------------------------------------ */

/** 0 = thumb flat, 1 = thumb straight up. Snaps up on the even beats and
 * settles back down across the odd beat, as in the reference. */
const thumbUp = (b: number) => {
  const m = cyc(b, 2);
  if (m > 1.85) return -0.06 * smooth((m - 1.85) / 0.15); // a small wind-up dip
  if (m < 0.08) return lerp(-0.06, 1, smooth(m / 0.08));
  if (m < 0.44) return 1;
  if (m < 1.1) return 1 - smooth((m - 0.44) / 0.66);
  return 0;
};

const LINE = "#1a1a1f";

const ThumbScene: React.FC<{ c: Clock }> = ({ c }) => {
  const a = thumbUp(c.b);
  const rot = -8 + a * 108;
  return (
    <AbsoluteFill style={{ backgroundColor: "#ff93ae" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* the thumb goes under the fist */}
        <g transform={`translate(860 1440) rotate(${rot}) scale(0.9 1.32)`}>
          <path
            d="M 40 -98 C -100 -104 -250 -98 -380 -88 C -520 -78 -610 -60 -648 -20 C -672 8 -658 52 -624 70 C -580 94 -480 98 -380 100 C -250 102 -100 106 40 102 Z"
            fill="#ffffff"
            stroke={LINE}
            strokeWidth={9}
            strokeLinejoin="round"
          />
          <path
            d="M -622 -28 C -612 -54 -570 -62 -530 -54 C -500 -48 -490 -20 -496 6 C -504 30 -548 42 -588 36 C -620 30 -632 0 -622 -28 Z"
            fill="#ffffff"
            stroke={LINE}
            strokeWidth={7}
            strokeLinejoin="round"
          />
          <path d="M -300 -78 q 10 40 0 80 M -262 -78 q 10 36 0 70" fill="none" stroke={LINE} strokeWidth={6} strokeLinecap="round" />
        </g>
        {/* the fist */}
        <path d="M 700 1290 C 700 1200 764 1160 846 1166 L 1120 1166 L 1120 1940 L 810 1940 C 738 1940 696 1866 696 1780 Z" fill="#ffffff" stroke={LINE} strokeWidth={9} strokeLinejoin="round" />
        {[1560, 1690, 1820].map((y, i) => (
          <path key={y} d={`M ${930 - i * 10} ${y - 56} C ${800 - i * 12} ${y - 60} ${716 - i * 10} ${y - 34} ${716 - i * 10} ${y} C ${716 - i * 10} ${y + 34} ${800 - i * 12} ${y + 60} ${930 - i * 10} ${y + 56}`} fill="#ffffff" stroke={LINE} strokeWidth={8} strokeLinecap="round" />
        ))}
        <path d="M 830 1240 q 44 -14 66 24 M 916 1218 q 34 16 44 62 M 872 1322 q 34 12 40 48 M 986 1240 q 20 20 22 52" fill="none" stroke={LINE} strokeWidth={7} strokeLinecap="round" />
      </svg>
      {["Move your thumb", "to the beat!"].map((t, i) => (
        <div
          key={t}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 500 + i * 84,
            textAlign: "center",
            fontFamily: "'Fredoka', 'ComicRelief', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 74,
            lineHeight: 1,
            color: "#ffffff",
            WebkitTextStroke: "14px #4d2233",
            paintOrder: "stroke fill",
            letterSpacing: 1,
          }}
        >
          {t}
        </div>
      ))}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 1 — Bruno flips a pancake                                     */
/* ------------------------------------------------------------------ */

const PanScene: React.FC<{ c: Clock }> = ({ c }) => {
  const BX = 320;
  const BY = 1500;
  const SC = 2.5;
  const u = cyc(c.jb, 2);
  // the pan flicks up on the even beat, and the pancake lands on the odd one
  let tilt = 0;
  if (u < 0.7) tilt = -26 * smooth(u / 0.14) * (1 - smooth((u - 0.14) / 0.5));
  else if (u > 1.85) tilt = 7 * smooth((u - 1.85) / 0.15);
  const flick = tilt < 0 ? -tilt / 26 : 0;
  const LAND = 1.14;
  const landHit = u >= LAND ? Math.exp(-(u - LAND) * 9) : 0;
  const dip = landHit * 12;
  const handR: [number, number] = [118 + flick * 8, -74 - flick * 44 + Math.max(0, tilt) * 1.5 + dip / SC];
  const hx = BX + handR[0] * SC;
  const hy = BY + handR[1] * SC;
  const rad = (tilt * Math.PI) / 180;
  const toWorld = (px: number, py: number): [number, number] => [hx + px * Math.cos(rad) - py * Math.sin(rad), hy + px * Math.sin(rad) + py * Math.cos(rad)];
  const PAN_X = 270;
  const [sx, sy] = toWorld(PAN_X, -18);
  const [rx0, ry0] = toWorld(PAN_X, -18);
  // pancake flight: leaves the pan just after the flick, lands as the next beat arrives
  const T0 = 0.14;
  const airborne = u >= T0 && u < LAND;
  const tau = clamp01((u - T0) / (LAND - T0));
  const restX = hx + PAN_X;
  const restY = hy - 18;
  const flightX = lerp(rx0, restX, tau);
  const flightY = lerp(ry0, restY, tau) - 620 * 4 * tau * (1 - tau);
  const phi = 360 * 2 * tau; // two full flips
  const cake = (cx: number, cy: number, sq: number, ph: number) => {
    const f = Math.cos((ph * Math.PI) / 180);
    return (
      <g transform={`translate(${cx} ${cy}) scale(1 ${sq})`}>
        <ellipse rx={126} ry={Math.max(8, 44 * Math.abs(f))} fill={f >= 0 ? "#f2b358" : "#f8dca4"} stroke="#8a5a2b" strokeWidth={7} />
        {f >= 0.35 ? <rect x={-22} y={-9} width={44} height={16} rx={4} fill="#ffe27a" stroke="#c99a2a" strokeWidth={4} /> : null}
      </g>
    );
  };
  const eyesUp = airborne;
  const pose: Pose = {
    eyes: eyesUp ? "shock" : "open",
    mouth: eyesUp ? "o" : "smile",
    handR,
    handL: [-84, -18],
    look: [0.9, eyesUp ? -1 : 0.3],
    squash: 1 - 0.06 * landHit + 0.05 * flick,
    tilt: -flick * 2,
    wag: 0,
  };
  return (
    <AbsoluteFill style={{ background: "#7ad7e8" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Scribbles seed={5} n={10} colour="#ffffff" opacity={0.55} y0={0} y1={900} />
        <rect x={0} y={1520} width={W} height={400} fill="#5fbfd6" />
        <Shadow x={BX} y={1524} rx={330} o={0.2} />
        <g transform={`translate(${BX} ${BY}) scale(${SC})`}>
          <Bear {...pose} />
        </g>
        {/* frying pan: handle in Bruno's paw, head out to the right */}
        <g transform={`translate(${hx} ${hy}) rotate(${tilt})`}>
          <rect x={-10} y={-16} width={180} height={32} rx={16} fill="#c99560" stroke="#7a5230" strokeWidth={7} />
          <path d="M 150 -34 C 190 -46 380 -46 400 -34 C 424 -20 420 26 396 38 C 340 58 220 58 160 40 C 130 28 128 -20 150 -34 Z" fill="#33303a" stroke="#141218" strokeWidth={8} strokeLinejoin="round" />
          <ellipse cx={PAN_X} cy={-14} rx={112} ry={16} fill="#4a4652" />
          {!airborne ? <g transform={`translate(${PAN_X} -18)`}>{cake(0, 0, 1 - 0.3 * landHit, 0)}</g> : null}
        </g>
        {airborne ? cake(flightX, flightY, 1, phi) : null}
        {/* the pancake's shadow on the wall gets smaller as it rises */}
        {airborne ? <ellipse cx={flightX} cy={restY + 30} rx={90 - 40 * (4 * tau * (1 - tau))} ry={10} fill="#1b6b80" opacity={0.25} /> : null}
        {landHit > 0.45 ? (
          <g stroke="#ffffff" strokeWidth={9} strokeLinecap="round">
            <path d={`M ${restX - 170} ${restY - 30} l -34 -24 M ${restX + 170} ${restY - 30} l 34 -24 M ${restX} ${restY - 96} l 0 -38`} />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 2 — the pals drop in and launch off the top                   */
/* ------------------------------------------------------------------ */

const DropScene: React.FC<{ c: Clock }> = ({ c }) => {
  const order = [
    { Ch: Dog, col: "#e0a45c" },
    { Ch: Bunny, col: "#f08bb0" },
    { Ch: Cat, col: "#f5a04a" },
    { Ch: Bear, col: "#b07a4a" },
  ];
  const FALL = 0.35;
  const idx = Math.max(0, Math.min(3, Math.floor((c.jb + FALL) / 2)));
  const u = c.jb - idx * 2;
  const { Ch, col } = order[idx];
  const ORIGIN_Y = 1430;
  const SC = 2.6;
  let y = 0;
  let sq = 1;
  let airborne = false;
  if (u < 0) {
    const f = clamp01((u + FALL) / FALL);
    y = -1500 * (1 - f * f);
    sq = 1.14;
    airborne = true;
  } else if (u < 1) {
    sq = 1 - 0.28 * Math.exp(-u * 9) + (u > 0.84 ? -0.2 * smooth((u - 0.84) / 0.16) : 0);
    // a small extra squash on the off-beat
    sq -= 0.07 * hitAt(u, 0.5, 12);
  } else {
    y = -9500 * (u - 1) * (u - 1);
    sq = 1.22;
    airborne = true;
  }
  const landRing = u >= 0 && u < 0.5 ? u : -1;
  const pose: Pose = {
    eyes: airborne ? "happy" : "open",
    mouth: airborne ? "open" : "smile",
    armL: airborne ? [-56, -78] : [-24, 42],
    armR: airborne ? [56, -78] : [24, 42],
    squash: sq,
    tilt: airborne ? Math.sin(c.jb * 9) * 3 : 0,
    wag: Math.sin(c.t * 24) * 16,
  };
  return (
    <AbsoluteFill style={{ background: "#fbf7f1" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Scribbles seed={13} n={16} colour="#efe6dc" opacity={0.9} />
        <Shadow x={540} y={ORIGIN_Y + 8} rx={200 - Math.min(0, y) * -0.02} o={airborne ? 0.08 : 0.2} />
        {landRing >= 0 ? <ellipse cx={540} cy={ORIGIN_Y + 6} rx={120 + landRing * 700} ry={(120 + landRing * 700) * 0.14} fill="none" stroke={col} strokeWidth={14 * (1 - landRing * 1.6)} opacity={1 - landRing * 1.7} /> : null}
        <g transform={`translate(540 ${ORIGIN_Y + y}) scale(${SC})`}>
          <Ch {...pose} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 3 — fruit is sliced on the odd beats; then the bomb           */
/* ------------------------------------------------------------------ */

const Wood: React.FC = () => (
  <g>
    <rect width={W} height={H} fill="#a2612f" />
    {Array.from({ length: 16 }, (_, i) => {
      const x = 30 + i * 70 + (i % 3) * 8;
      return <path key={i} d={`M ${x} 0 C ${x + 24} 400 ${x - 26} 900 ${x + 10} 1400 S ${x + 4} 1800 ${x - 6} 1920`} fill="none" stroke="#8a4f26" strokeWidth={5 + (i % 3)} opacity={0.75} />;
    })}
    <ellipse cx={880} cy={430} rx={34} ry={82} fill="none" stroke="#8a4f26" strokeWidth={6} opacity={0.7} />
    <ellipse cx={180} cy={1350} rx={30} ry={70} fill="none" stroke="#8a4f26" strokeWidth={6} opacity={0.7} />
  </g>
);

type FruitKind = "melon" | "coconut" | "pine";

const Half: React.FC<{ kind: FruitKind; side: -1 | 1 }> = ({ kind, side }) => {
  const clip = side < 0 ? "M -400 -400 L 0 -400 L 0 400 L -400 400 Z" : "M 0 -400 L 400 -400 L 400 400 L 0 400 Z";
  const id = `half-${kind}-${side}`;
  return (
    <g>
      <clipPath id={id}>
        <path d={clip} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <Fruit kind={kind} cut />
      </g>
    </g>
  );
};

const Fruit: React.FC<{ kind: FruitKind; cut?: boolean }> = ({ kind, cut }) => {
  if (kind === "melon")
    return (
      <g transform="scale(1.4)">
        <circle r={150} fill="#5a7d2e" stroke={INK} strokeWidth={9} />
        {cut ? <circle r={128} fill="#ff4b4b" /> : null}
        {cut ? <circle r={128} fill="none" stroke="#ffe3e3" strokeWidth={10} /> : null}
        {cut
          ? [[-60, -50], [30, -70], [70, 10], [-30, 40], [10, 80], [-90, 20]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={7} ry={11} fill="#3a1414" transform={`rotate(${i * 40} ${x} ${y})`} />)
          : [-90, -30, 30, 90].map((x, i) => <path key={i} d={`M ${x} -130 q -40 90 0 130 q 40 40 0 130`} fill="none" stroke="#a8c66a" strokeWidth={10} strokeLinecap="round" />)}
      </g>
    );
  if (kind === "coconut")
    return (
      <g transform="scale(1.5)">
        <circle r={120} fill="#6b4226" stroke={INK} strokeWidth={9} />
        {cut ? <circle r={98} fill="#fff7e8" /> : null}
        {cut ? <circle r={44} fill="#f0e2c8" /> : null}
        {!cut ? [[-30, -30], [30, -34], [0, 6]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={9} ry={13} fill="#3a2414" />) : null}
        <ellipse cx={-54} cy={-58} rx={14} ry={26} fill="#ffffff" opacity={0.25} transform="rotate(35 -54 -58)" />
      </g>
    );
  return (
    <g transform="scale(1.3)">
      <path d="M 0 -130 C -30 -190 -70 -210 -90 -190 C -50 -170 -30 -150 -20 -128 C -40 -160 -100 -170 -120 -140 C -70 -140 -40 -130 -24 -122 Z" fill="#3f8f3a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 0 -130 C 30 -200 80 -220 100 -200 C 60 -180 36 -160 24 -128 Z" fill="#4fae43" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <ellipse rx={104} ry={140} fill="#f5a623" stroke={INK} strokeWidth={9} />
      {cut ? <ellipse rx={84} ry={120} fill="#ffe27a" /> : <path d="M -70 -80 l 140 160 M -20 -120 l 120 140 M -100 -20 l 120 140 M 70 -80 l -140 160 M 20 -120 l -120 140 M 100 -20 l -120 140" stroke="#b86a10" strokeWidth={6} opacity={0.7} />}
      {cut ? <ellipse rx={30} ry={70} fill="#fff2b8" /> : null}
    </g>
  );
};

const Boom: React.FC<{ s: number }> = ({ s }) => {
  const pts = (rad: number, inner: number, n: number, rot: number) =>
    Array.from({ length: n * 2 }, (_, i) => {
      const r = i % 2 ? inner : rad;
      const jitter = 1 + (rnd(i, 4) - 0.5) * 0.25;
      const a = rot + (i * Math.PI) / n;
      return `${(Math.cos(a) * r * jitter).toFixed(1)},${(Math.sin(a) * r * jitter).toFixed(1)}`;
    }).join(" ");
  return (
    <g transform={`translate(540 960) scale(${s})`}>
      <polygon points={pts(520, 250, 9, 0.2)} fill="#ff9a1f" stroke="#c2570a" strokeWidth={10} strokeLinejoin="round" />
      <polygon points={pts(360, 190, 8, 0.5)} fill="#ffc531" />
      <polygon points={pts(190, 100, 7, 0.1)} fill="#fff4b0" />
    </g>
  );
};

const FruitScene: React.FC<{ c: Clock }> = ({ c }) => {
  const kinds: (FruitKind | "bomb")[] = ["melon", "coconut", "pine", "bomb"];
  const idx = Math.max(0, Math.min(3, Math.floor((c.jb + 0.36) / 2)));
  const u = c.jb - idx * 2;
  const kind = kinds[idx];
  const CY = 980;
  // it rolls in from the left and lands in the middle on the even beat
  const ROLL = 0.36;
  const enterK = clamp01((u + ROLL) / ROLL);
  const x = u < 0 ? lerp(-260, 540, 1 - (1 - enterK) * (1 - enterK)) : 540;
  const roll = u < 0 ? -(1 - enterK) * 360 : 0;
  const landPulse = u >= 0 ? hitAt(u, 0, 9) : 0;
  const sliced = u >= 1;
  const su = Math.max(0, u - 1);
  const slash = u >= 1 && u < 1.22 ? 1 - (u - 1) / 0.22 : 0;
  const boom = kind === "bomb" && sliced;
  const halfMove = (side: -1 | 1) => {
    const t = su;
    return {
      x: 540 + side * (90 + 620 * t),
      y: CY + 300 * t * t * 3.2 - 120 * t,
      r: side * 220 * t,
    };
  };
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Wood />
        {kind !== "bomb" && !sliced ? (
          <g transform={`translate(${x} ${CY + landPulse * 14}) rotate(${roll}) scale(${1 + 0.06 * landPulse} ${1 - 0.1 * landPulse})`}>
            <Fruit kind={kind} />
          </g>
        ) : null}
        {kind !== "bomb" && sliced
          ? ([-1, 1] as const).map((side) => {
              const m = halfMove(side);
              return (
                <g key={side} transform={`translate(${m.x} ${m.y}) rotate(${m.r})`}>
                  <Half kind={kind} side={side} />
                </g>
              );
            })
          : null}
        {kind !== "bomb" && slash > 0 ? <path d={`M ${540 - 250} ${CY + 250} L ${540 + 250} ${CY - 250}`} stroke="#ffffff" strokeWidth={14 * slash} strokeLinecap="round" opacity={slash} /> : null}
        {kind === "bomb" && !boom ? (
          <g transform={`translate(${x} ${CY + landPulse * 14}) scale(${1 + 0.06 * landPulse} ${1 - 0.1 * landPulse})`}>
            <g transform="scale(1.3)"><circle r={130} fill="#26232c" stroke="#0e0c12" strokeWidth={9} />
            <ellipse cx={-44} cy={-52} rx={26} ry={16} fill="#ffffff" opacity={0.28} transform="rotate(-30 -44 -52)" />
            <path d="M -30 -50 l 60 90 M 30 -50 l -60 90" stroke="#b02a2a" strokeWidth={16} strokeLinecap="round" />
            <path d="M 60 -110 C 90 -160 130 -150 150 -186" stroke="#c99560" strokeWidth={10} fill="none" strokeLinecap="round" />
            <g transform={`translate(150 -190) rotate(${c.jb * 500})`}>
              <polygon points="0,-30 8,-8 30,0 8,8 0,30 -8,8 -30,0 -8,-8" fill={Math.floor(c.jb * 8) % 2 ? "#ffd23a" : "#ff8a1f"} />
            </g>
          </g></g>
        ) : null}
        {boom ? <Boom s={0.15 + smooth(su / 0.7) * 3.1} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 4 — Poppy stands, flops, springs, lands                       */
/* ------------------------------------------------------------------ */

const FlopScene: React.FC<{ c: Clock }> = ({ c }) => {
  const u = cyc(c.jb, 4);
  const dir = Math.floor(c.jb / 4) % 2 === 0 ? 1 : -1;
  const ORIGIN_Y = 1400;
  const SC = 2.7;
  let tilt = 0;
  let y = 0;
  let sq = 1;
  let arms: [number, number] = [-24, 42];
  let eyes: Pose["eyes"] = "open";
  let mouth: Pose["mouth"] = "smile";
  let dust = 0;
  if (u < 1) {
    // beat 0: stands, small bounce
    sq = 1 - 0.14 * hitAt(u, 0, 10);
    tilt = 0;
    // lean back a touch before the flop
    tilt = -6 * smooth((u - 0.6) / 0.4) * dir;
  } else if (u < 2) {
    // beat 1: lands flat on her face
    const f = smooth((u - 1 + 0.42) / 0.42);
    tilt = lerp(-6, 90, f) * dir;
    eyes = "closed";
    mouth = "flat";
    arms = [-50, 20];
    dust = u - 1 < 0.5 ? (u - 1) / 0.5 : -1;
    sq = 1 - 0.1 * hitAt(u, 1, 10);
  } else if (u < 3) {
    // beat 2: springs up, stretched tall
    const up = (u - 2) / 1;
    tilt = lerp(90, 0, smooth(up / 0.25)) * dir;
    y = -420 * 4 * up * (1 - up) * 0.8;
    sq = up < 0.55 ? 1.22 : 1.1;
    eyes = "happy";
    mouth = "open";
    arms = [-56, -80];
  } else {
    // beat 3: lands upright with a squash
    tilt = 0;
    sq = 1 - 0.24 * hitAt(u, 3, 8);
    eyes = hitAt(u, 3, 8) > 0.4 ? "happy" : "open";
  }
  const pose: Pose = { eyes, mouth, armL: arms, armR: [-arms[0], arms[1]], tilt, squash: sq, wag: Math.sin(c.t * 22) * 14 };
  // she falls towards one side, so slide her over to keep her on screen
  const px = 540 - dir * 390 * (Math.abs(tilt) / 90);
  return (
    <AbsoluteFill style={{ background: "#d7b9ee" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Scribbles seed={23} n={14} colour="#ffffff" opacity={0.35} />
        <Shadow x={px} y={ORIGIN_Y + 8} rx={230 + (y < 0 ? y * 0.15 : 0)} o={y < -40 ? 0.08 : 0.2} />
        <g transform={`translate(${px} ${ORIGIN_Y + y}) scale(${SC})`}>
          <Bunny {...pose} />
        </g>
        {dust >= 0
          ? [-1, 1].map((s) => (
              <g key={s} opacity={1 - dust}>
                <circle cx={px + s * (240 + dust * 160)} cy={ORIGIN_Y - 20 - dust * 60} r={40 + dust * 60} fill="#f5ecfb" stroke="#ffffff" strokeWidth={6} />
                <circle cx={px + s * (180 + dust * 200)} cy={ORIGIN_Y + 10 - dust * 30} r={26 + dust * 40} fill="#f5ecfb" />
              </g>
            ))
          : null}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 5 — Mimi and the party popper                                 */
/* ------------------------------------------------------------------ */

const CONFETTI = Array.from({ length: 46 }, (_, i) => ({
  a: -Math.PI / 2 + (rnd(i, 7) - 0.5) * 1.5,
  v: 520 + rnd(i, 8) * 900,
  s: 16 + rnd(i, 9) * 22,
  rot: rnd(i, 10) * 360,
  spin: (rnd(i, 11) - 0.5) * 900,
  col: ["#ff6b81", "#ffd23a", "#5fd3c5", "#9b7bff", "#7bd96a", "#ff9f43"][i % 6],
  streamer: i % 5 === 0,
}));

const PopperScene: React.FC<{ c: Clock }> = ({ c }) => {
  const u = cyc(c.jb, 4);
  const ORIGIN_Y = 1700;
  const SC = 3.0;
  // beats: 0 lifts it, 1 pulls the string, 2 BANG, 3 jumps for joy
  const pull = u >= 1 ? Math.exp(-(u - 1) * 5) : 0;
  const bang = u >= 2 ? u - 2 : -1;
  const recoil = u >= 2 ? Math.exp(-(u - 2) * 9) : 0;
  const jumpU = u >= 3 ? u - 3 : -1;
  const jump = jumpU >= 0 ? Math.sin(Math.min(1, jumpU) * Math.PI) * 120 : 0;
  const lift = smooth(u / 0.2) * (u < 3.6 ? 1 : 1 - smooth((u - 3.6) / 0.4)) * 1;
  const body = ORIGIN_Y - jump;
  // the cone is held up beside her in the right paw; the left paw pulls the ring across her chest
  const coneX = 880;
  const coneY = body - 620 - recoil * 36 + (1 - lift) * 80;
  const ringX = 690 - pull * 34;
  const ringY = body - 200 + pull * 70 + (1 - lift) * 24;
  const pose: Pose = {
    eyes: bang >= 0 && bang < 0.9 ? "shock" : jumpU >= 0 ? "happy" : "open",
    mouth: bang >= 0 && bang < 0.9 ? "o" : jumpU >= 0 ? "open" : "smile",
    handR: [(coneX - 540) / SC, (coneY + 100 - ORIGIN_Y) / SC + jump / SC],
    handL: [(ringX - 540) / SC, (ringY - ORIGIN_Y) / SC + jump / SC],
    squash: 1 - 0.1 * recoil - 0.05 * pull + (jumpU >= 0 && jumpU < 0.5 ? 0.06 : 0),
    tilt: 0,
    wag: Math.sin(c.t * 24) * 16,
  };
  const mouthY = coneY - 290;
  return (
    <AbsoluteFill style={{ background: "#fdfdfb" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Scribbles seed={31} n={8} colour="#f1efe8" opacity={0.9} />
        <Shadow x={540} y={ORIGIN_Y + 8} rx={230 - jump * 0.3} o={jump > 20 ? 0.08 : 0.2} />
        <g transform={`translate(540 ${body}) scale(${SC})`}>
          <Cat {...pose} />
        </g>
        {/* the popper: a striped cone, string running down to the ring */}
        <path d={`M ${coneX} ${coneY + 125} Q ${(coneX + ringX) / 2} ${(coneY + ringY) / 2 + 60} ${ringX} ${ringY}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <circle cx={ringX} cy={ringY} r={14} fill="none" stroke={INK} strokeWidth={6} />
        <g transform={`translate(${coneX} ${coneY}) rotate(${-4 + recoil * 6}) scale(1.25)`}>
          <path d="M -90 -230 L 90 -230 L 0 100 Z" fill="#f2c84b" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          <path d="M -72 -170 L 72 -170 L 62 -124 L -62 -124 Z M -50 -66 L 50 -66 L 40 -22 L -40 -22 Z" fill="#8b6fd6" opacity={0.92} />
          <ellipse cy={-230} rx={90} ry={24} fill="#7a5fc2" stroke={INK} strokeWidth={8} />
        </g>
        {/* the burst */}
        {bang >= 0 && bang < 1.6
          ? CONFETTI.map((p, i) => {
              const tt = bang * 0.9;
              const px = coneX + Math.cos(p.a) * p.v * tt;
              const py = mouthY + Math.sin(p.a) * p.v * tt + 1500 * tt * tt;
              return p.streamer ? (
                <path key={i} d={`M ${px} ${py} q ${-30} ${-45} ${10} ${-90}`} stroke={p.col} strokeWidth={10} fill="none" strokeLinecap="round" />
              ) : (
                <rect key={i} x={px} y={py} width={p.s} height={p.s * 0.55} fill={p.col} transform={`rotate(${p.rot + p.spin * tt} ${px} ${py})`} />
              );
            })
          : null}
        {bang >= 0 && bang < 0.3 ? <circle cx={coneX} cy={mouthY} r={60 + bang * 900} fill="none" stroke="#ffd23a" strokeWidth={22 * (1 - bang / 0.3)} opacity={1 - bang / 0.3} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 6 — the line of pals hops across the field                    */
/* ------------------------------------------------------------------ */

const HopScene: React.FC<{ c: Clock }> = ({ c }) => {
  const rows: { Ch: React.FC<Pose>; y: number; dir: 1 | -1; col: string }[] = [
    { Ch: Bear, y: 560, dir: 1, col: "#b07a4a" },
    { Ch: Cat, y: 900, dir: -1, col: "#f5a04a" },
    { Ch: Dog, y: 1240, dir: 1, col: "#e0a45c" },
    { Ch: Bunny, y: 1580, dir: -1, col: "#f08bb0" },
  ];
  const SC = 1.35;
  const STEP = 190;
  const k = Math.floor(c.jb);
  const f = c.jb - k; // 0 right on the beat, 1 the next
  // each hop takes off just after a beat and lands on the next
  const AIR = 0.88;
  const air = f < AIR ? f / AIR : 1;
  const inAir = f < AIR && c.jb >= 0;
  const arc = inAir ? 4 * air * (1 - air) : 0;
  const landSq = f >= AIR ? 1 - 0.18 * Math.sin(((f - AIR) / (1 - AIR)) * Math.PI) : f < 0.16 ? 1 - 0.18 * hitAt(f, 0, 8) : 1;
  const hitNow = c.jb >= 0 ? hitAt(f, 0, 7) : 0;
  return (
    <AbsoluteFill style={{ background: "#a3c874" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Scribbles seed={41} n={14} colour="#8fb862" opacity={0.7} />
        {rows.map((r, i) => {
          const start = r.dir === 1 ? -170 : W + 170;
          const x = start + r.dir * STEP * (Math.max(0, k) + air);
          const Ch = r.Ch;
          const pose: Pose = {
            eyes: inAir ? "happy" : "open",
            mouth: inAir ? "open" : "smile",
            armL: inAir ? [-54, -60] : [-24, 42],
            armR: inAir ? [54, -60] : [24, 42],
            squash: inAir ? 1 + 0.12 * arc : landSq,
            wag: Math.sin(c.t * 24 + i) * 16,
          };
          return (
            <g key={i}>
              <Shadow x={x} y={r.y + 8} rx={120 - arc * 30} o={0.2 - arc * 0.1} />
              <g transform={`translate(${x} ${r.y - arc * 210}) scale(${r.dir * SC} ${SC})`}>
                <Ch {...pose} />
              </g>
              {hitNow > 0.3 ? (
                <g opacity={hitNow}>
                  <circle cx={x - r.dir * 90} cy={r.y - 10} r={22 + (1 - hitNow) * 30} fill="#eaf6d6" />
                  <circle cx={x + r.dir * 90} cy={r.y - 6} r={16 + (1 - hitNow) * 24} fill="#eaf6d6" />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

const SCENES: React.FC<{ c: Clock }>[] = [ThumbScene, PanScene, DropScene, FruitScene, FlopScene, PopperScene, HopScene];

export const ThumbShort2: React.FC<{ audio?: string | null }> = ({ audio = "audio/play-thumb2-ref.wav" }) => {
  loadPlayFonts();
  const c = useClock();
  const Scene = SCENES[c.scene];
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <Scene c={c} />
      <Watermark />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import pattern from "./beat-pattern.json";
import { Bear, Cat, Dog, type Pose } from "./chars";
import { Countdown, Headline, loadPlayFonts, Payoff } from "./text";

/**
 * "play along with the beat!" — the rhythm-game Short, rebuilt frame for
 * frame on the reference clip.
 *
 * A concert stage. Notes fall down two lanes onto a stomp button and a clap
 * button; every press frame is the reference's own (beat-pattern.json), so
 * the picture sits on the reference audio. Biscuit the puppy walks on after
 * the count and sings at the mic, Bruno the bear stomps on the left, Mimi
 * the cat claps on the right, and it ends on "BRAVO!!".
 */

export const W = 1080;
export const H = 1920;
export const BEAT_FRAMES = pattern.duration;

type Lane = "L" | "R";
export type Hit = { frame: number; lane: Lane };

export const beatHits = (): Hit[] =>
  [
    ...pattern.hits.L.map((frame) => ({ frame, lane: "L" as const })),
    ...pattern.hits.R.map((frame) => ({ frame, lane: "R" as const })),
  ].sort((a, b) => a.frame - b.frame);
const HITS = beatHits();
const HITS_L = HITS.filter((h) => h.lane === "L").map((h) => h.frame);
const HITS_R = HITS.filter((h) => h.lane === "R").map((h) => h.frame);

/** frames since the most recent hit in `list` (Infinity if none yet) */
const since = (list: number[], frame: number) => {
  let s = Infinity;
  for (const f of list) if (f <= frame && frame - f < s) s = frame - f;
  return s;
};
/** index of the most recent hit in `list`, -1 if none */
const lastIndex = (list: number[], frame: number) => {
  let k = -1;
  for (let i = 0; i < list.length; i++) if (list[i] <= frame) k = i;
  return k;
};

const LANE_X: Record<Lane, number> = { L: 270, R: 810 };
const LANE_COLOUR: Record<Lane, string> = { L: "#ff6470", R: "#7d8bff" };
const BTN_Y = 1462;
const BTN_R = 128;
const HEAD_Y = 578;
const COUNT_Y = 743;
const SINGER_X = 540;
const SINGER_Y = 1102;
const SINGER_SCALE = 1.45;
const MIC_X = 540;
const MIC_TOP = 962;
const SIDE_Y = 1346;
const SIDE_SCALE = 1.08;
const INK = "#2b2530";

/* ------------------------------------------------------------------ */
/* the stage                                                           */
/* ------------------------------------------------------------------ */

const Stage: React.FC<{ beams: number }> = ({ beams }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="bsBack" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6f5c4d" />
        <stop offset="100%" stopColor="#5a4839" />
      </linearGradient>
      <linearGradient id="bsTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a08bb8" />
        <stop offset="100%" stopColor="#7f68a0" />
      </linearGradient>
      <linearGradient id="bsFront" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5e4a78" />
        <stop offset="100%" stopColor="#42315a" />
      </linearGradient>
      <linearGradient id="bsCone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe6a3" stopOpacity={0.28} />
        <stop offset="100%" stopColor="#ffe6a3" stopOpacity={0} />
      </linearGradient>
      <radialGradient id="bsPool" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff1c9" stopOpacity={0.35} />
        <stop offset="1" stopColor="#fff1c9" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#bsBack)" />
    <rect x={165} y={230} width={750} height={700} fill="#8a7869" opacity={0.6} />
    <path d="M 0 230 L 165 230 L 165 930 L 0 930 Z" fill="#4e3e33" opacity={0.55} />
    <path d="M 915 230 L 1080 230 L 1080 930 L 915 930 Z" fill="#4e3e33" opacity={0.55} />
    <path d="M 0 230 L 165 500 L 0 700 Z" fill="#8a7869" opacity={0.25} />
    <path d="M 1080 230 L 915 500 L 1080 700 Z" fill="#8a7869" opacity={0.25} />
    {[140, 340, 540, 740, 940].map((x) => (
      <path key={x} d={`M ${x - 30} 150 L ${x + 30} 150 L ${x + 260} 930 L ${x - 260} 930 Z`} fill="url(#bsCone)" />
    ))}
    <rect x={LANE_X.L - 78} y={0} width={156} height={H} fill={LANE_COLOUR.L} opacity={0.2 * beams} />
    <rect x={LANE_X.R - 78} y={0} width={156} height={H} fill={LANE_COLOUR.R} opacity={0.2 * beams} />
    <rect x={0} y={0} width={W} height={72} fill="#3f322a" />
    <g stroke="#5c4b3d" strokeWidth={6}>
      {Array.from({ length: 19 }, (_, i) => (
        <path key={i} d={`M ${i * 60} 6 L ${i * 60 + 60} 66 M ${i * 60 + 60} 6 L ${i * 60} 66`} />
      ))}
      <path d="M 0 6 L 1080 6 M 0 66 L 1080 66" strokeWidth={8} />
    </g>
    {[140, 340, 540, 740, 940].map((x) => (
      <g key={x}>
        <rect x={x - 36} y={68} width={72} height={64} rx={16} fill="#3a2d25" stroke="#2a1f18" strokeWidth={4} />
        <circle cx={x} cy={138} r={30} fill="#f7d774" opacity={0.28} />
        <circle cx={x} cy={138} r={17} fill="#f5c95c" />
      </g>
    ))}
    <rect x={0} y={900} width={W} height={250} fill="url(#bsTop)" />
    <ellipse cx={540} cy={1060} rx={300} ry={70} fill="url(#bsPool)" />
    <rect x={0} y={1146} width={W} height={22} fill="#6b5688" />
    <rect x={0} y={1166} width={W} height={H - 1166} fill="url(#bsFront)" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* notes and buttons                                                   */
/* ------------------------------------------------------------------ */

const Note: React.FC<{ hit: Hit }> = ({ hit }) => {
  const frame = useCurrentFrame();
  const dt = hit.frame - frame;
  if (dt > pattern.fall || dt < -5) return null;
  const y = BTN_Y - (dt / pattern.fall) * (BTN_Y + 160);
  const after = dt < 0 ? -dt / 5 : 0;
  const c = LANE_COLOUR[hit.lane];
  return (
    <g transform={`translate(${LANE_X[hit.lane]} ${y}) scale(${1 - after * 0.5})`} opacity={0.72 * (1 - after)}>
      <defs>
        <linearGradient id={`note${hit.lane}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c} />
          <stop offset="1" stopColor={hit.lane === "L" ? "#ff9a6a" : "#a7b3ff"} />
        </linearGradient>
      </defs>
      <rect x={-62} y={-95} width={124} height={190} rx={14} fill={`url(#note${hit.lane})`} />
      <rect x={-50} y={-83} width={100} height={166} rx={10} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.3} />
    </g>
  );
};

const Footprint: React.FC<{ fill: string; bg: string }> = ({ fill, bg }) => (
  <g transform="rotate(20) scale(1.05)">
    <path
      d="M 2 -92 C 40 -92 50 -48 42 -14 C 36 10 28 22 28 44 C 28 74 14 90 -4 90 C -24 90 -36 74 -34 46 C -32 22 -42 6 -44 -20 C -48 -62 -32 -92 2 -92 Z"
      fill={fill}
    />
    <path d="M -40 18 Q -4 8 34 18" stroke={bg} strokeWidth={13} fill="none" strokeLinecap="round" />
  </g>
);

const Palm: React.FC<{ fill: string; line: string }> = ({ fill, line }) => (
  <g fill={fill} stroke={line} strokeWidth={4} strokeLinejoin="round">
    {[-21, -7, 7, 21].map((x, i) => (
      <rect key={x} x={x - 7} y={-62 + Math.abs(i - 1.5) * 7} width={14} height={50} rx={7} />
    ))}
    <rect x={-50} y={-20} width={14} height={40} rx={7} transform="rotate(-38 -43 0)" />
    <path d="M -30 -20 Q -32 40 0 44 Q 32 40 30 -20 Z" />
  </g>
);

const Hands: React.FC<{ fill: string; back: string; bg: string }> = ({ fill, back, bg }) => (
  <g>
    <g transform="translate(-16 8) rotate(-16) scale(0.95)">
      <Palm fill={back} line={bg} />
    </g>
    <g transform="translate(18 2) rotate(14) scale(-1 1)">
      <Palm fill={fill} line={bg} />
    </g>
  </g>
);

const Button: React.FC<{ lane: Lane }> = ({ lane }) => {
  const frame = useCurrentFrame();
  const s = since(lane === "L" ? HITS_L : HITS_R, frame);
  const pressed = s < pattern.pressFrames[lane];
  const burst = s < 10;
  const t = burst ? s / 10 : 1;
  const scale = 1 + (burst ? Math.sin(Math.PI * t) : 0) * 0.1;
  const face = pressed ? "#cdc6d2" : "#ffffff";
  const icon = pressed ? (lane === "L" ? "#b98a8e" : "#9d9ab8") : lane === "L" ? "#f0606a" : "#a3a6f5";
  const iconBack = pressed ? "#8f8ca6" : "#8b8ee6";
  return (
    <g transform={`translate(${LANE_X[lane]} ${BTN_Y})`}>
      {burst ? (
        <g opacity={1 - t} transform={`scale(${1 + t * 0.35})`}>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const r0 = BTN_R + 8;
            const r1 = BTN_R + (i % 2 ? 44 : 66);
            return (
              <path
                key={i}
                d={`M ${Math.cos(a + 0.16) * r0} ${Math.sin(a + 0.16) * r0} L ${Math.cos(a) * r1} ${Math.sin(a) * r1} L ${Math.cos(a - 0.16) * r0} ${Math.sin(a - 0.16) * r0} Z`}
                fill="#e6e0e8"
                opacity={0.85}
              />
            );
          })}
        </g>
      ) : null}
      <g transform={`scale(${scale})`}>
        <circle r={BTN_R} fill={face} />
        <circle r={BTN_R} fill="none" stroke="#d9d0e0" strokeWidth={6} opacity={0.6} />
        {lane === "L" ? (
          <Footprint fill={icon} bg={face} />
        ) : (
          <g transform="scale(1.45) translate(0 8)">
            <Hands fill={icon} back={iconBack} bg={face} />
          </g>
        )}
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* the band                                                            */
/* ------------------------------------------------------------------ */

const MicStand: React.FC = () => (
  <g>
    <ellipse cx={MIC_X} cy={1110} rx={52} ry={12} fill={INK} />
    <path d={`M ${MIC_X} 1106 L ${MIC_X} ${MIC_TOP + 70}`} stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <rect x={MIC_X - 30} y={MIC_TOP} width={60} height={88} rx={30} fill="#3b3346" stroke={INK} strokeWidth={5} />
    <g stroke="#5a5068" strokeWidth={3.5}>
      <path
        d={`M ${MIC_X - 18} ${MIC_TOP + 20} l 36 0 M ${MIC_X - 24} ${MIC_TOP + 36} l 48 0 M ${MIC_X - 24} ${MIC_TOP + 52} l 48 0 M ${MIC_X - 18} ${MIC_TOP + 68} l 36 0`}
      />
    </g>
    <ellipse cx={MIC_X - 10} cy={MIC_TOP + 22} rx={6} ry={12} fill="#ffffff" opacity={0.18} />
  </g>
);

/** Four singing poses; each clap moves the singer on to the next. */
const SING: Pose[] = [
  { eyes: "closed", armL: [-62, -46], armR: [34, 26] },
  { eyes: "open", armL: [-34, 26], armR: [62, -46] },
  { eyes: "happy", armL: [-66, -70], armR: [66, -70] },
  { eyes: "closed", armL: [-70, -10], armR: [70, -10] },
];

const Band: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [inA, inB] = pattern.singerIn;
  const onStage = frame >= inA;
  const bravo = frame >= pattern.bravoAt;

  // Biscuit walks on from the left
  const walkT = interpolate(frame, [inA, inB], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const walkEase = 1 - (1 - walkT) ** 2;
  const singerX = interpolate(walkEase, [0, 1], [-320, SINGER_X]);
  const walking = frame >= inA && frame < inB;
  const walkBob = walking ? -Math.abs(Math.sin(frame / 3)) * 16 : 0;

  const sL = since(HITS_L, frame);
  const sR = since(HITS_R, frame);
  const sAny = Math.min(sL, sR);
  const singing = frame >= inB && !bravo;
  const pose = SING[Math.max(0, lastIndex(HITS_R, frame)) % SING.length];
  const bounce = singing && sL < 10 ? Math.sin((sL / 10) * Math.PI) : 0;

  const bowS = bravo ? spring({ frame: frame - pattern.bravoAt, fps, config: { damping: 10, mass: 0.7, stiffness: 90 } }) : 0;

  let singerPose: Pose;
  if (bravo) {
    singerPose = { eyes: "closed", mouth: "smile", armL: [-78, -40], armR: [78, -40], tilt: Math.sin(bowS * Math.PI) * 5, wag: Math.sin(frame / 3) * 18 };
  } else if (walking || !singing) {
    singerPose = {
      eyes: "open",
      mouth: "smile",
      armL: walking ? [-30 + Math.sin(frame / 3) * 16, 40] : [-24, 42],
      armR: walking ? [30 - Math.sin(frame / 3) * 16, 40] : [24, 42],
      tilt: walking ? Math.sin(frame / 3) * 4 : 0,
      wag: Math.sin(frame / 4) * 14,
    };
  } else {
    singerPose = {
      ...pose,
      mouth: sAny < 12 ? "open" : "smile",
      squash: 1 - bounce * 0.05,
      tilt: (lastIndex(HITS_R, frame) % 2 ? 1 : -1) * 4,
      look: [0, -0.4],
      wag: Math.sin(frame / 3) * 18,
    };
  }

  // Bruno stomps on the stomp notes, Mimi claps on the clap notes
  const stomp = sL < 9 ? Math.sin((sL / 9) * Math.PI) : 0;
  const clap = sR < pattern.pressFrames.R;
  const bearPose: Pose = bravo
    ? { eyes: "happy", mouth: "open", armL: [-66, -104], armR: [66, -104] }
    : {
        eyes: stomp > 0.3 ? "happy" : "open",
        mouth: stomp > 0.3 ? "open" : "smile",
        stomp,
        armL: [-40, 20 - stomp * 60],
        armR: [40, 20 - stomp * 60],
        squash: 1 - stomp * 0.04,
        tilt: frame > 60 ? Math.sin(frame / 10) * 3 : 0,
      };
  const catPose: Pose = bravo
    ? { eyes: "happy", mouth: "open", armL: [-66, -104], armR: [66, -104], wag: Math.sin(frame / 3) * 20 }
    : {
        eyes: clap ? "happy" : "open",
        mouth: clap ? "open" : "smile",
        handL: clap ? [-6, -120] : [-84, -110],
        handR: clap ? [6, -120] : [84, -110],
        wag: Math.sin(frame / 5) * 14,
        tilt: frame > 60 ? -Math.sin(frame / 10) * 3 : 0,
      };

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {onStage ? (
        <g transform={`translate(${singerX} ${SINGER_Y + walkBob - bounce * 16}) scale(${SINGER_SCALE})`}>
          <Dog {...singerPose} />
        </g>
      ) : null}
      <MicStand />
      <g transform={`translate(128 ${SIDE_Y - stomp * 18}) scale(${SIDE_SCALE})`}>
        <Bear {...bearPose} />
      </g>
      <g transform={`translate(952 ${SIDE_Y - (clap ? 8 : 0)}) scale(${SIDE_SCALE})`}>
        <Cat {...catPose} />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */

export const BeatShort: React.FC<{ audio?: string | null; thumb?: boolean }> = ({ audio = "audio/play-beat-ref.wav", thumb = false }) => {
  loadPlayFonts();
  const frame = useCurrentFrame();
  const beams = interpolate(frame, pattern.beamsOut, [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#5a4839" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <Stage beams={beams} />
      <Band />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {HITS.filter((h) => h.frame >= pattern.notesFrom).map((h) => (
          <Note key={h.frame + h.lane} hit={h} />
        ))}
        <Button lane="L" />
        <Button lane="R" />
      </svg>
      {/* the thumbnail keeps the headline up over a singing frame */}
      <Headline text="play along with the beat!" from={thumb ? -30 : pattern.headline[0]} until={thumb ? 100000 : pattern.headline[1]} y={HEAD_Y} size={74} />
      <Countdown marks={pattern.count as [number, string][]} end={pattern.countEnd} gap={2} y={COUNT_Y} size={140} />
      <Payoff text="BRAVO!!" from={pattern.bravoAt} y={HEAD_Y} size={116} emoji="👏" fill="#ffffff" line="#2b2530" />
    </AbsoluteFill>
  );
};

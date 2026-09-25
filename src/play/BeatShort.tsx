import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import pattern from "./beat-pattern.json";
import { Bun, Capy, Pebblo } from "./chars";
import { Countdown, Headline, loadPlayFonts, Payoff } from "./text";

/**
 * "Play along with the beat!" — the rhythm-game Short.
 *
 * A concert stage. Notes fall down two lanes onto two big buttons (stomp
 * on the left, clap on the right) and land on the beat; the viewer plays
 * along. Pebblo walks on, takes the mic and sings; Capy and Bun bop at the
 * front. Count-in 4-3-2-1, ~43 beats of song, "BRAVO!!" and a bow.
 *
 * Every hit frame comes from beat-pattern.json, which the soundtrack
 * builder (scripts/build-play-audio.py) reads too, so a kick or a clap on
 * the track can never land off the note it belongs to.
 */

export const W = 1080;
export const H = 1920;
export const BEAT_FRAMES = pattern.duration;

type Lane = "L" | "R";
export type Hit = { frame: number; lane: Lane };

/** The full list of hits, in frame order. */
export const beatHits = (): Hit[] => {
  const out: Hit[] = [];
  pattern.bars.forEach((bar, b) => {
    bar.split("").forEach((ch, i) => {
      if (ch === "L" || ch === "R") {
        out.push({ frame: pattern.firstHit + (b * 4 + i) * pattern.beatFrames, lane: ch });
      }
    });
  });
  return out;
};
const HITS = beatHits();

const LANE_X: Record<Lane, number> = { L: 270, R: 810 };
const LANE_COLOUR: Record<Lane, string> = { L: "#ff6470", R: "#7d8bff" };
const BTN_Y = 1462;
const BTN_R = 128;
/** frames a note takes to fall from above the frame to the button */
const FALL = 48;
const HEAD_Y = 560;
const COUNT_Y = 720;
const SINGER_X = 540;
const SINGER_Y = 1100;
const SINGER_SCALE = 1.9;
const MIC_X = 540;
const SIDE_Y = 1336;
const SIDE_SCALE = 1.25;
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
    </defs>
    <rect width={W} height={H} fill="url(#bsBack)" />
    {/* the lit centre panel and the darker wings */}
    <rect x={165} y={230} width={750} height={700} fill="#8a7869" opacity={0.6} />
    <path d="M 0 230 L 165 230 L 165 930 L 0 930 Z" fill="#4e3e33" opacity={0.55} />
    <path d="M 915 230 L 1080 230 L 1080 930 L 915 930 Z" fill="#4e3e33" opacity={0.55} />
    <path d="M 0 230 L 165 500 L 0 700 Z" fill="#8a7869" opacity={0.25} />
    <path d="M 1080 230 L 915 500 L 1080 700 Z" fill="#8a7869" opacity={0.25} />
    {/* light cones */}
    {[140, 340, 540, 740, 940].map((x) => (
      <path key={x} d={`M ${x - 30} 150 L ${x + 30} 150 L ${x + 260} 930 L ${x - 260} 930 Z`} fill="url(#bsCone)" />
    ))}
    {/* lane beams */}
    <rect x={LANE_X.L - 78} y={0} width={156} height={H} fill={LANE_COLOUR.L} opacity={0.2 * beams} />
    <rect x={LANE_X.R - 78} y={0} width={156} height={H} fill={LANE_COLOUR.R} opacity={0.2 * beams} />
    {/* trusses */}
    <rect x={0} y={0} width={W} height={72} fill="#3f322a" />
    <g stroke="#5c4b3d" strokeWidth={6}>
      {Array.from({ length: 19 }, (_, i) => (
        <path key={i} d={`M ${i * 60} 6 L ${i * 60 + 60} 66 M ${i * 60 + 60} 6 L ${i * 60} 66`} />
      ))}
      <path d="M 0 6 L 1080 6 M 0 66 L 1080 66" strokeWidth={8} />
    </g>
    {/* spotlights */}
    {[140, 340, 540, 740, 940].map((x) => (
      <g key={x}>
        <rect x={x - 36} y={68} width={72} height={64} rx={16} fill="#3a2d25" stroke="#2a1f18" strokeWidth={4} />
        <circle cx={x} cy={138} r={30} fill="#f7d774" opacity={0.28} />
        <circle cx={x} cy={138} r={17} fill="#f5c95c" />
      </g>
    ))}
    {/* the stage: top surface, lip, front face */}
    <rect x={0} y={900} width={W} height={250} fill="url(#bsTop)" />
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
  if (dt > FALL || dt < -5) return null;
  const y = BTN_Y - (dt / FALL) * (BTN_Y + 160);
  const after = dt < 0 ? -dt / 5 : 0;
  return (
    <g transform={`translate(${LANE_X[hit.lane]} ${y}) scale(${1 - after * 0.5})`} opacity={0.78 * (1 - after)}>
      <rect x={-60} y={-95} width={120} height={190} rx={20} fill={LANE_COLOUR[hit.lane]} />
      <rect x={-48} y={-83} width={96} height={166} rx={14} fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.35} />
    </g>
  );
};

/** A shoe sole — wide toe, narrow waist, round heel — split by a white band. */
const Footprint: React.FC<{ fill: string; bg: string }> = ({ fill, bg }) => (
  <g transform="rotate(20) scale(1.05)">
    <path
      d="M 2 -92 C 40 -92 50 -48 42 -14 C 36 10 28 22 28 44 C 28 74 14 90 -4 90 C -24 90 -36 74 -34 46 C -32 22 -42 6 -44 -20 C -48 -62 -32 -92 2 -92 Z"
      fill={fill}
    />
    <path d="M -40 18 Q -4 8 34 18" stroke={bg} strokeWidth={13} fill="none" strokeLinecap="round" />
  </g>
);

/** One open palm: four fingers, a thumb, a round palm. */
const Palm: React.FC<{ fill: string; line: string }> = ({ fill, line }) => (
  <g fill={fill} stroke={line} strokeWidth={4} strokeLinejoin="round">
    {[-21, -7, 7, 21].map((x, i) => (
      <rect key={x} x={x - 7} y={-62 + Math.abs(i - 1.5) * 7} width={14} height={50} rx={7} />
    ))}
    <rect x={-50} y={-20} width={14} height={40} rx={7} transform="rotate(-38 -43 0)" />
    <path d="M -30 -20 Q -32 40 0 44 Q 32 40 30 -20 Z" />
  </g>
);

/** Two hands mid-clap, the back one a shade darker. */
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
  // the most recent hit in this lane, if it was within the last ten frames
  let since = Infinity;
  for (const h of HITS) {
    if (h.lane === lane && frame >= h.frame - 1 && frame - h.frame < since) since = frame - h.frame + 1;
  }
  const t = since <= 10 ? since / 10 : 1;
  const press = since <= 10 ? Math.sin(Math.PI * t) : 0;
  const pressed = since <= 7;
  const scale = 1 + press * 0.12;
  const x = LANE_X[lane];
  // pressed: the button goes grey and the icon dulls, as in the reference
  const face = pressed ? "#cdc6d2" : "#ffffff";
  const icon = pressed ? (lane === "L" ? "#b98a8e" : "#9d9ab8") : lane === "L" ? "#f0606a" : "#a3a6f5";
  const iconBack = pressed ? "#8f8ca6" : "#8b8ee6";
  return (
    <g transform={`translate(${x} ${BTN_Y})`}>
      {since <= 10 ? (
        <g opacity={1 - t} transform={`scale(${1 + t * 0.35})`}>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const r0 = BTN_R + 8;
            const r1 = BTN_R + (i % 2 ? 44 : 66);
            const a1 = a + 0.16;
            const a2 = a - 0.16;
            return (
              <path
                key={i}
                d={`M ${Math.cos(a1) * r0} ${Math.sin(a1) * r0} L ${Math.cos(a) * r1} ${Math.sin(a) * r1} L ${Math.cos(a2) * r0} ${Math.sin(a2) * r0} Z`}
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

/** Mic head sits at the singer's chest, like the reference's stand. */
const MIC_TOP = 964;
const MicStand: React.FC = () => (
  <g>
    <ellipse cx={MIC_X} cy={1108} rx={50} ry={12} fill={INK} />
    <path d={`M ${MIC_X} 1104 L ${MIC_X} ${MIC_TOP + 70}`} stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <rect x={MIC_X - 30} y={MIC_TOP} width={60} height={86} rx={30} fill="#3b3346" stroke={INK} strokeWidth={5} />
    <g stroke="#5a5068" strokeWidth={3.5}>
      <path
        d={`M ${MIC_X - 18} ${MIC_TOP + 20} l 36 0 M ${MIC_X - 24} ${MIC_TOP + 36} l 48 0 M ${MIC_X - 24} ${MIC_TOP + 52} l 48 0 M ${MIC_X - 18} ${MIC_TOP + 68} l 36 0`}
      />
    </g>
  </g>
);

const Band: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beatIdx = Math.floor((frame - pattern.firstHit) / pattern.beatFrames);
  const phase = (((frame - pattern.firstHit) % pattern.beatFrames) + pattern.beatFrames) % pattern.beatFrames / pattern.beatFrames;
  const singing = frame >= pattern.firstHit && frame < pattern.bravoAt;
  const bravo = frame >= pattern.bravoAt;

  // walk on from the left during the count-in
  const walkT = interpolate(frame, [56, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const walkEase = walkT * walkT * (3 - 2 * walkT);
  const singerX = interpolate(walkEase, [0, 1], [-300, SINGER_X]);
  const walkBob = walkT < 1 ? -Math.abs(Math.sin(frame / 3)) * 12 : 0;
  const walkTilt = walkT < 1 ? Math.sin(frame / 3) * 4 : 0;

  const bounce = singing ? -Math.abs(Math.sin(Math.PI * phase)) * 20 : 0;
  const armsUp = beatIdx % 4 < 2;
  const armL: [number, number] = singing ? (armsUp ? [-56, -66] : [-40, -6]) : [-40, 30];
  const armR: [number, number] = singing ? (armsUp ? [34, -10] : [56, -70]) : [40, 30];
  const mouth = singing ? (phase < 0.55 ? "open" : "smile") : "smile";

  const bowS = bravo ? spring({ frame: frame - pattern.bravoAt, fps, config: { damping: 10, mass: 0.7, stiffness: 90 } }) : 0;
  const bow = Math.sin(bowS * Math.PI) * 16;

  // the side characters bop; each jumps on its own lane's hits
  const bop = frame >= pattern.firstHit ? Math.sin((2 * Math.PI * (frame - pattern.firstHit)) / (pattern.beatFrames * 2)) * 6 : 0;
  const sinceHit = (lane: Lane) => {
    let s = Infinity;
    for (const h of HITS) if (h.lane === lane && frame >= h.frame && frame - h.frame < s) s = frame - h.frame;
    return s;
  };
  const sL = sinceHit("L");
  const sR = sinceHit("R");
  const jumpL = sL < 12 ? Math.sin((sL / 12) * Math.PI) : 0;
  const clapR = sR < 12 ? Math.sin((sR / 12) * Math.PI) : 0;

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {/* Pebblo, behind the mic stand */}
      <g transform={`translate(${singerX} ${SINGER_Y + bounce + walkBob}) scale(${SINGER_SCALE}) rotate(${walkTilt})`}>
        <Pebblo
          eyes={bravo ? "closed" : "open"}
          mouth={bravo ? "smile" : mouth}
          armL={bravo ? [-66, -54] : armL}
          armR={bravo ? [66, -54] : armR}
          tilt={bow}
          squash={singing ? 1 - Math.abs(Math.sin(Math.PI * phase)) * 0.04 : 1}
          look={singing ? [0, -0.4] : [0, 0]}
        />
      </g>
      <MicStand />
      {/* Capy, stomp side */}
      <g transform={`translate(150 ${SIDE_Y - jumpL * 40}) scale(${SIDE_SCALE})`}>
        <Capy
          eyes={bravo ? "happy" : "open"}
          mouth={bravo ? "open" : jumpL > 0.3 ? "o" : "flat"}
          tilt={bop}
          squash={1 - jumpL * 0.06}
          armL={bravo ? [-50, -70] : [-40, 30]}
          armR={bravo ? [50, -70] : [40, 30]}
        />
      </g>
      {/* Bun, clap side */}
      <g transform={`translate(930 ${SIDE_Y}) scale(${SIDE_SCALE})`}>
        <Bun
          eyes={bravo ? "happy" : "open"}
          mouth={bravo ? "open" : clapR > 0.3 ? "open" : "smile"}
          tilt={-bop}
          armL={bravo ? [-50, -70] : [-40 + clapR * 30, 30 - clapR * 90]}
          armR={bravo ? [50, -70] : [40 - clapR * 30, 30 - clapR * 90]}
        />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */

export const BeatShort: React.FC<{ audio?: string | null }> = ({ audio = "audio/play-beat-mix.mp3" }) => {
  loadPlayFonts();
  const frame = useCurrentFrame();
  // the coloured lane beams show the viewer where to look during the
  // intro, then clear once the first notes are falling
  const beams = interpolate(frame, [pattern.firstHit - 40, pattern.firstHit - 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#5a4839" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <Stage beams={beams} />
      <Band />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {HITS.map((h) => (
          <Note key={h.frame + h.lane} hit={h} />
        ))}
        <Button lane="L" />
        <Button lane="R" />
      </svg>
      <Headline text="play along with the beat!" from={pattern.headlineFrom} until={pattern.headlineUntil} y={HEAD_Y} size={74} />
      <Countdown steps={["4", "3", "2", "1"]} from={pattern.countFrom} beat={pattern.beatFrames} y={COUNT_Y} size={140} />
      <Payoff text="BRAVO!!" from={pattern.bravoAt} y={HEAD_Y} size={116} emoji="👏" fill="#ffffff" line="#2b2530" />
    </AbsoluteFill>
  );
};

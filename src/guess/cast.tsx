import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * The channel's own cast for the guess format — the "Peekaboo Pebblo" line.
 *
 * The first episodes borrowed the reference edit's crocodile and four
 * generic cheering animals. These six are ours, drawn in the same soft
 * picture-book style (chalky fills, coloured outlines, two-dot faces) so
 * an episode looks and feels identical — it just has characters a viewer
 * can learn to recognise:
 *
 *   Pebblo  the host — the channel's pebble, peeks over the bush while the
 *           viewer guesses, throws its arms up on the reveal
 *   Munch   the chomper — a round, fuzzy teal monster who eats whatever
 *           turned up this round (the crocodile's job)
 *   Pip     a yellow chick in an acorn cap          ┐
 *   Bloom   a pink tulip who walks on her leaves    │ the cheer squad at
 *   Tock    a little green turtle                    │ the board
 *   Wisp    a small cloud with a face, floats        ┘
 *
 * Every character has its origin at the centre of its body; Munch's is at
 * his feet so he can be dropped straight onto GROUND_Y.
 */

/* ------------------------------------------------------------------ */
/* Pebblo                                                              */
/* ------------------------------------------------------------------ */

export const PEBBLO = {
  stone: "#ddd6c9",
  stoneShade: "#c1b8a8",
  stoneLight: "#f2ede4",
  line: "#8c8375",
  moss: "#7cc25c",
  mossDark: "#4f8c35",
  freckle: "#a89e8f",
  blush: "#f0a9a0",
  eye: "#3a302a",
};

export type PebbloPose = "stand" | "wave" | "think" | "tada" | "cheer";

/** The pebble outline — one rounded stone with a chipped top-left corner. */
const PEBBLE =
  "M -84 -26 q 4 -66 62 -62 q 66 -6 96 40 q 12 60 -12 96 q -42 30 -110 20 q -52 -12 -50 -56 q 2 -20 14 -38 Z";

/**
 * Pebblo. `step` drives a gentle bob; `wave` (0..1) swings the raised
 * arm on the wave/cheer poses; `blink` 0..1 closes the eyes.
 */
export const PebbloKid: React.FC<{
  pose?: PebbloPose;
  step?: number;
  wave?: number;
  blink?: number;
  /** eye direction, -1 left .. 1 right, and -1 up .. 1 down */
  look?: [number, number];
}> = ({ pose = "stand", step = 0, wave = 0, blink = 0, look = [0, 0] }) => {
  const bob = Math.sin(step) * 3;
  const lx = look[0] * 6;
  const ly = look[1] * 5;

  // arm end points (relative to the pebble's centre)
  const arms: Record<PebbloPose, { l: [number, number]; r: [number, number] }> = {
    stand: { l: [-104, 52], r: [104, 52] },
    wave: { l: [-104, 52], r: [118 + wave * 6, -70 - wave * 22] },
    think: { l: [-104, 52], r: [56, 24] },
    tada: { l: [-124, -78], r: [124, -78] },
    cheer: { l: [-122 + wave * 8, -70 - wave * 16], r: [122 - wave * 8, -70 - wave * 16] },
  };
  const a = arms[pose];
  const lidH = 1 - blink;

  return (
    <g transform={`translate(0 ${bob})`}>
      {/* feet */}
      <g fill={PEBBLO.stoneShade} stroke={PEBBLO.line} strokeWidth={4.5}>
        <ellipse cx={-38} cy={92} rx={26} ry={13} />
        <ellipse cx={40} cy={92} rx={26} ry={13} />
      </g>
      {/* arms — a chunky stroke ending in a mitten */}
      <g stroke={PEBBLO.line} strokeWidth={12} strokeLinecap="round" fill="none">
        <path d={`M -70 20 Q ${(a.l[0] - 70) / 2} ${a.l[1] - 10} ${a.l[0]} ${a.l[1]}`} />
        <path d={`M 70 20 Q ${(a.r[0] + 70) / 2} ${a.r[1] - 10} ${a.r[0]} ${a.r[1]}`} />
      </g>
      <g fill={PEBBLO.stone} stroke={PEBBLO.line} strokeWidth={4.5}>
        <circle cx={a.l[0]} cy={a.l[1]} r={17} />
        <circle cx={a.r[0]} cy={a.r[1]} r={17} />
      </g>
      {/* body */}
      <path d={PEBBLE} fill={PEBBLO.stone} stroke={PEBBLO.line} strokeWidth={5.5} strokeLinejoin="round" />
      <clipPath id="pebbloKidClip">
        <path d={PEBBLE} />
      </clipPath>
      <g clipPath="url(#pebbloKidClip)">
        <path d="M -20 40 q 60 -20 110 40 l 0 60 l -180 0 Z" fill={PEBBLO.stoneShade} opacity={0.5} />
        <ellipse cx={-34} cy={-46} rx={22} ry={12} fill={PEBBLO.stoneLight} opacity={0.75} transform="rotate(-20 -34 -46)" />
      </g>
      {/* the chipped corner */}
      <path d="M -84 -26 l 18 -6 l -8 20 Z" fill={PEBBLO.stoneShade} stroke={PEBBLO.line} strokeWidth={4} strokeLinejoin="round" />
      {/* moss tuft */}
      <path
        d="M -46 -76 q 4 -40 40 -26 q 6 -34 38 -14 q 22 -18 34 8 q -26 -8 -46 6 q -22 -16 -66 26 Z"
        fill={PEBBLO.moss}
        stroke={PEBBLO.mossDark}
        strokeWidth={4.5}
        strokeLinejoin="round"
      />
      <path d="M -16 -92 q 8 -8 16 -2 M 14 -100 q 8 -6 14 2" fill="none" stroke={PEBBLO.mossDark} strokeWidth={3.5} strokeLinecap="round" />
      {/* freckles */}
      <g fill={PEBBLO.freckle}>
        <circle cx={-46} cy={14} r={3} />
        <circle cx={-56} cy={24} r={2.5} />
        <circle cx={52} cy={16} r={3} />
        <circle cx={62} cy={26} r={2.5} />
      </g>
      {/* blush */}
      <ellipse cx={-40} cy={26} rx={14} ry={8} fill={PEBBLO.blush} opacity={0.6} />
      <ellipse cx={44} cy={26} rx={14} ry={8} fill={PEBBLO.blush} opacity={0.6} />
      {/* eyes — big ovals with whites, Pebblo's signature */}
      <g>
        <ellipse cx={-26} cy={-10} rx={17} ry={22 * lidH + 1.5} fill="#ffffff" stroke={PEBBLO.line} strokeWidth={4} />
        <ellipse cx={28} cy={-10} rx={17} ry={22 * lidH + 1.5} fill="#ffffff" stroke={PEBBLO.line} strokeWidth={4} />
        {lidH > 0.25 ? (
          <>
            <circle cx={-24 + lx} cy={-6 + ly} r={8} fill={PEBBLO.eye} />
            <circle cx={30 + lx} cy={-6 + ly} r={8} fill={PEBBLO.eye} />
            <circle cx={-27 + lx} cy={-10 + ly} r={2.6} fill="#ffffff" />
            <circle cx={27 + lx} cy={-10 + ly} r={2.6} fill="#ffffff" />
          </>
        ) : null}
      </g>
      {pose === "think" ? (
        <g stroke={PEBBLO.line} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M -40 -40 l 26 -6" />
          <path d="M 44 -46 l -26 0" />
        </g>
      ) : null}
      {/* mouth */}
      {pose === "tada" || pose === "cheer" ? (
        <path d="M -16 22 q 16 26 32 0 Z" fill="#7a4a48" stroke={PEBBLO.line} strokeWidth={3.5} strokeLinejoin="round" />
      ) : pose === "think" ? (
        <path d="M -8 26 q 10 -8 20 2" stroke={PEBBLO.line} strokeWidth={4} fill="none" strokeLinecap="round" />
      ) : (
        <path d="M -14 22 q 14 16 28 0" stroke={PEBBLO.line} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Munch                                                               */
/* ------------------------------------------------------------------ */

export const MUNCH = {
  fur: "#63c4b2",
  furDark: "#3f9f8f",
  furLight: "#9adfd1",
  line: "#2f7f72",
  horn: "#f5d36a",
  hornLine: "#c9a634",
  mouth: "#7d3a4a",
  tongue: "#f28ba0",
  tooth: "#ffffff",
  belly: "#c9efe6",
};

/**
 * Munch, facing left. `chomp` 0 = mouth wide open, 1 = shut. `step` walks
 * the feet and bobs the body. Origin: between his feet, on the ground.
 */
export const Munch: React.FC<{ chomp?: number; step?: number }> = ({
  chomp = 0,
  step = 0,
}) => {
  const jaw = (1 - chomp) * 30;
  const bob = Math.abs(Math.sin(step)) * 6;
  const legA = Math.sin(step) * 14;
  const legB = Math.sin(step + Math.PI) * 14;
  // fuzzy body outline — a circle with soft bumps
  const bumps = 18;
  const body = Array.from({ length: bumps }, (_, i) => {
    const a0 = (i / bumps) * Math.PI * 2;
    const a1 = ((i + 0.5) / bumps) * Math.PI * 2;
    const r0 = 96;
    const r1 = 106;
    return `${i === 0 ? "M" : "L"} ${Math.cos(a0) * r0} ${-110 + Math.sin(a0) * r0 * 0.94} Q ${
      Math.cos(a1) * r1
    } ${-110 + Math.sin(a1) * r1 * 0.94} ${Math.cos(((i + 1) / bumps) * Math.PI * 2) * r0} ${
      -110 + Math.sin(((i + 1) / bumps) * Math.PI * 2) * r0 * 0.94
    }`;
  }).join(" ");

  return (
    <g>
      {/* feet — three toes each */}
      <g fill={MUNCH.furDark} stroke={MUNCH.line} strokeWidth={5} strokeLinejoin="round">
        <path d={`M ${-58 + legA} 0 q -30 -4 -30 -22 l 60 0 q 0 18 -30 22 Z`} />
        <path d={`M ${34 + legB} 0 q -30 -4 -30 -22 l 60 0 q 0 18 -30 22 Z`} />
      </g>
      <g fill={MUNCH.furDark}>
        {[-84, -60, -36].map((x) => (
          <circle key={x} cx={x + legA} cy={-2} r={9} />
        ))}
        {[8, 32, 56].map((x) => (
          <circle key={x} cx={x + legB} cy={-2} r={9} />
        ))}
      </g>
      <g transform={`translate(0 ${-bob})`}>
        {/* arms */}
        <g stroke={MUNCH.line} strokeWidth={14} strokeLinecap="round" fill="none">
          <path d={`M -80 -100 q -40 10 -50 ${44 - chomp * 30}`} />
          <path d="M 84 -96 q 40 14 44 50" />
        </g>
        <g fill={MUNCH.fur} stroke={MUNCH.line} strokeWidth={5}>
          <circle cx={-130} cy={-56 - chomp * 30} r={18} />
          <circle cx={128} cy={-46} r={18} />
        </g>
        {/* horns */}
        <g fill={MUNCH.horn} stroke={MUNCH.hornLine} strokeWidth={4.5} strokeLinejoin="round">
          <path d="M -66 -168 q -10 -44 14 -66 q 24 22 22 62 Z" />
          <path d="M 36 -170 q -2 -46 24 -64 q 20 26 12 66 Z" />
        </g>
        {/* body */}
        <path d={body} fill={MUNCH.fur} stroke={MUNCH.line} strokeWidth={5.5} strokeLinejoin="round" />
        <ellipse cx={0} cy={-70} rx={56} ry={40} fill={MUNCH.belly} opacity={0.75} />
        <g stroke={MUNCH.furLight} strokeWidth={4} strokeLinecap="round" opacity={0.7}>
          <path d="M -60 -170 q 14 -12 30 -6" />
          <path d="M 20 -178 q 12 -10 26 -2" />
        </g>
        {/* eyes */}
        <g>
          <circle cx={-44} cy={-134} r={22} fill="#ffffff" stroke={MUNCH.line} strokeWidth={4.5} />
          <circle cx={20} cy={-140} r={26} fill="#ffffff" stroke={MUNCH.line} strokeWidth={4.5} />
          <circle cx={-48} cy={-132} r={9} fill="#3a302a" />
          <circle cx={14} cy={-138} r={11} fill="#3a302a" />
          <circle cx={-51} cy={-136} r={3} fill="#ffffff" />
          <circle cx={10} cy={-142} r={3.5} fill="#ffffff" />
        </g>
        <ellipse cx={-70} cy={-104} rx={13} ry={8} fill="#f0a9a0" opacity={0.55} />
        <ellipse cx={58} cy={-106} rx={13} ry={8} fill="#f0a9a0" opacity={0.55} />
        {/* mouth — upper lip fixed, lower jaw swings open */}
        <g transform="translate(-16 -84)">
          <g transform={`rotate(${jaw} -70 0) scale(1 ${0.3 + 0.7 * (1 - chomp)})`}>
            <path d="M -70 0 q 30 46 100 34 q 24 -10 20 -34 Z" fill={MUNCH.mouth} stroke={MUNCH.line} strokeWidth={5} strokeLinejoin="round" />
            <ellipse cx={-6} cy={22} rx={30} ry={12} fill={MUNCH.tongue} />
            <g fill={MUNCH.tooth}>
              {[-50, -26, -2, 22].map((x) => (
                <rect key={x} x={x} y={18 + (x + 50) * 0.16} width={16} height={14} rx={3} />
              ))}
            </g>
          </g>
          <path d="M -70 0 q 40 -14 100 -8 q 20 4 20 8 q -60 12 -120 0 Z" fill={MUNCH.mouth} stroke={MUNCH.line} strokeWidth={5} strokeLinejoin="round" />
          <g fill={MUNCH.tooth}>
            {[-56, -32, -8, 16].map((x) => (
              <rect key={x} x={x} y={-4} width={16} height={14} rx={3} />
            ))}
          </g>
        </g>
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* the cheer squad                                                     */
/* ------------------------------------------------------------------ */

const EYE = "#3a302a";
const BLUSH = "#f0a9a0";

const dots = (gap: number, cy: number, r = 6) => (
  <>
    <circle cx={-gap} cy={cy} r={r} fill={EYE} />
    <circle cx={gap} cy={cy} r={r} fill={EYE} />
    <circle cx={-gap - 2} cy={cy - 2} r={r * 0.35} fill="#ffffff" />
    <circle cx={gap - 2} cy={cy - 2} r={r * 0.35} fill="#ffffff" />
  </>
);

const smile = (w: number, cy: number, color = EYE) => (
  <path d={`M ${-w} ${cy} q ${w} ${w * 0.9} ${w * 2} 0`} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />
);

/** Pip — a round yellow chick wearing an acorn cap. */
export const Pip: React.FC = () => {
  const f = useCurrentFrame();
  const flap = Math.sin(f / 3) * 10;
  return (
    <g>
      <g fill="#f2a93c">
        <ellipse cx={-20} cy={78} rx={16} ry={7} />
        <ellipse cx={22} cy={78} rx={16} ry={7} />
      </g>
      <g stroke="#e0932c" strokeWidth={4} strokeLinecap="round">
        <path d="M -16 56 l -4 20 M 18 56 l 4 20" />
      </g>
      <ellipse cx={0} cy={22} rx={56} ry={52} fill="#f7d65a" stroke="#d9b13a" strokeWidth={4} />
      <g fill="#f4c94a" stroke="#d9b13a" strokeWidth={4}>
        <ellipse cx={-54} cy={30} rx={13} ry={30} transform={`rotate(${18 + flap} -54 30)`} />
        <ellipse cx={54} cy={30} rx={13} ry={30} transform={`rotate(${-18 - flap} 54 30)`} />
      </g>
      <ellipse cx={0} cy={40} rx={30} ry={22} fill="#fbe8a0" opacity={0.8} />
      {/* acorn cap */}
      <path d="M -54 -20 q 0 -46 54 -46 q 54 0 54 46 q -54 12 -108 0 Z" fill="#a9703d" stroke="#7e5028" strokeWidth={4} strokeLinejoin="round" />
      <path d="M 0 -64 q -4 -14 8 -22" stroke="#7e5028" strokeWidth={5} fill="none" strokeLinecap="round" />
      <g stroke="#7e5028" strokeWidth={2.5} opacity={0.6}>
        <path d="M -36 -34 q 8 -8 16 0 M -12 -40 q 8 -8 16 0 M 14 -34 q 8 -8 16 0" fill="none" />
      </g>
      {dots(20, 6, 6.5)}
      <path d="M -10 20 l 10 12 l 10 -12 Z" fill="#f28a3c" stroke="#d9702c" strokeWidth={3} strokeLinejoin="round" />
      <ellipse cx={-34} cy={22} rx={11} ry={7} fill={BLUSH} opacity={0.7} />
      <ellipse cx={34} cy={22} rx={11} ry={7} fill={BLUSH} opacity={0.7} />
    </g>
  );
};

/** Bloom — a pink tulip who stands on her two leaves. */
export const Bloom: React.FC = () => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 11) * 4;
  return (
    <g>
      <g fill="#63bd57" stroke="#4a9a42" strokeWidth={4}>
        <ellipse cx={-26} cy={82} rx={30} ry={12} />
        <ellipse cx={26} cy={82} rx={30} ry={12} />
      </g>
      <path d="M 0 80 L 0 10" stroke="#63bd57" strokeWidth={9} strokeLinecap="round" />
      {/* leaf arms */}
      <path d="M -4 40 q -50 -10 -60 -50 q 40 4 60 40 Z" fill="#7cc25c" stroke="#4a9a42" strokeWidth={4} strokeLinejoin="round" />
      <path d="M 4 34 q 50 -14 62 -54 q -42 4 -62 44 Z" fill="#7cc25c" stroke="#4a9a42" strokeWidth={4} strokeLinejoin="round" />
      <g transform={`rotate(${sway} 0 20)`}>
        <path
          d="M -52 -22 q -4 -70 20 -82 q 14 20 32 0 q 18 20 32 0 q 24 12 20 82 q -20 26 -52 26 q -32 0 -52 -26 Z"
          fill="#f2559b"
          stroke="#d94180"
          strokeWidth={4.5}
          strokeLinejoin="round"
        />
        <path d="M -18 -96 q 10 20 8 40 M 24 -98 q -6 22 -4 40" stroke="#d94180" strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.6} />
        <ellipse cx={-22} cy={-44} rx={10} ry={16} fill="#ffffff" opacity={0.35} transform="rotate(-12 -22 -44)" />
        {dots(19, -30, 6)}
        {smile(11, -14, "#8c2a55")}
        <ellipse cx={-34} cy={-18} rx={11} ry={7} fill={BLUSH} opacity={0.75} />
        <ellipse cx={34} cy={-18} rx={11} ry={7} fill={BLUSH} opacity={0.75} />
      </g>
    </g>
  );
};

/** Tock — a small green turtle with a spotted shell. */
export const Tock: React.FC = () => (
  <g>
    <g fill="#8ecf6a" stroke="#5aa348" strokeWidth={4}>
      <ellipse cx={-44} cy={56} rx={20} ry={13} />
      <ellipse cx={44} cy={56} rx={20} ry={13} />
      <path d="M 66 22 q 30 -6 30 16 q -14 10 -30 0 Z" />
    </g>
    <ellipse cx={0} cy={22} rx={70} ry={48} fill="#5aa84f" stroke="#3d7f36" strokeWidth={5} />
    <path d="M -70 22 q 70 -18 140 0 q -70 22 -140 0 Z" fill="#7cc25c" opacity={0.7} />
    <g fill="#f5d36a" stroke="#c9a634" strokeWidth={3}>
      <circle cx={-30} cy={8} r={13} />
      <circle cx={12} cy={-4} r={15} />
      <circle cx={40} cy={22} r={11} />
      <circle cx={-6} cy={34} r={10} />
    </g>
    <path d="M -74 26 q -20 10 -8 22 q 30 8 74 4" fill="#c9e2a0" opacity={0.6} />
    {/* head */}
    <circle cx={-72} cy={-4} r={30} fill="#8ecf6a" stroke="#5aa348" strokeWidth={4} />
    <g transform="translate(-72 -6)">
      {dots(12, -2, 5.5)}
      {smile(8, 10, "#3d7f36")}
      <ellipse cx={-18} cy={9} rx={8} ry={5} fill={BLUSH} opacity={0.7} />
      <ellipse cx={18} cy={9} rx={8} ry={5} fill={BLUSH} opacity={0.7} />
    </g>
  </g>
);

/** Wisp — a little cloud with a face who hovers above the others. */
export const Wisp: React.FC = () => {
  const f = useCurrentFrame();
  const hover = Math.sin(f / 13) * 8;
  return (
    <g transform={`translate(0 ${hover})`}>
      <g fill="#ffffff" stroke="#b8cfd8" strokeWidth={4} strokeLinejoin="round">
        <path d="M -70 30 q -22 -6 -16 -30 q 4 -30 36 -22 q 10 -34 44 -24 q 34 6 34 36 q 30 -6 32 22 q 2 24 -26 26 q -60 8 -104 -8 Z" />
      </g>
      <ellipse cx={-14} cy={10} rx={44} ry={16} fill="#eaf3f7" opacity={0.7} />
      {dots(20, -2, 6)}
      {smile(10, 14, "#5f8fb0")}
      <ellipse cx={-36} cy={12} rx={11} ry={7} fill={BLUSH} opacity={0.75} />
      <ellipse cx={36} cy={12} rx={11} ry={7} fill={BLUSH} opacity={0.75} />
      <g fill="#9fd4ea" opacity={0.9}>
        <path d="M -46 40 q 6 12 -2 22 q -8 -10 2 -22 Z" />
        <path d="M 10 44 q 6 12 -2 22 q -8 -10 2 -22 Z" />
        <path d="M 52 40 q 6 12 -2 22 q -8 -10 2 -22 Z" />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* the cast as the engine sees it                                      */
/* ------------------------------------------------------------------ */

export type Cast = {
  /** shown on the title card and the thumbnails */
  Mascot: React.FC<{ step?: number }>;
  /** the one who eats things — subjects mount it in their mid beat */
  Chomper: React.FC<{ chomp?: number; step?: number }>;
  /** the friends who cheer at the board, left to right */
  cheer: { C: React.FC; x: number; y: number; scale?: number }[];
  /** what the narrator calls the chomper ("Uh oh! Here comes Munch.") */
  chomperName: string;
  /** where the mascot stands on the title card */
  mascotAt: { x: number; y: number; s: number };
  /** the line above the subject word on the title card */
  titleLine: string;
};

const MascotPebblo: React.FC<{ step?: number }> = ({ step = 0 }) => (
  <PebbloKid pose="wave" step={step} wave={(Math.sin(step * 1.6) + 1) / 2} />
);

/** Pebblo at the board, arms up, bouncing with the celebration. */
const CheerPebblo: React.FC = () => {
  const f = useCurrentFrame();
  return <PebbloKid pose="cheer" step={f / 5} wave={(Math.sin(f / 4) + 1) / 2} />;
};

/** The Peekaboo Pebblo cast. */
export const PEBBLO_CAST: Cast = {
  Mascot: MascotPebblo,
  Chomper: Munch,
  cheer: [
    { C: Pip, x: 150, y: 950 },
    { C: Bloom, x: 560, y: 930 },
    { C: CheerPebblo, x: 960, y: 960, scale: 0.95 },
    { C: Tock, x: 1360, y: 980 },
    { C: Wisp, x: 1770, y: 890, scale: 1.25 },
  ],
  chomperName: "Munch",
  mascotAt: { x: 1600, y: 850, s: 1.35 },
  titleLine: "Peekaboo Pebblo",
};

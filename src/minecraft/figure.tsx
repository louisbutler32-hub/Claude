import React from "react";

/**
 * The stick figure: a white circle for a head, an orange shirt, and thick
 * black limbs. Poses are hand and foot positions relative to the neck (the
 * top of the shirt), which makes every pose a handful of numbers that
 * interpolate cleanly. Scale 1 is the size it plays at in the wide cave shot.
 */

export type Pt = readonly [number, number];
export type Limb = readonly [Pt, Pt];
export type Pose = {
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  head: Pt;
};

export const HEAD_R = 92;
export const SHOULDER = { L: [-44, 16] as Pt, R: [44, 16] as Pt };
export const HIP = { L: [-38, 122] as Pt, R: [38, 122] as Pt };

export const limb = (ex: number, ey: number, hx: number, hy: number): Limb => [
  [ex, ey],
  [hx, hy],
];

const ARM_DOWN_L = limb(-70, 110, -66, 200);
const ARM_DOWN_R = limb(70, 110, 66, 200);
const LEG_L = limb(-46, 230, -50, 335);
const LEG_R = limb(46, 230, 50, 335);

export const pose = (p: Partial<Pose>): Pose => ({
  armL: ARM_DOWN_L,
  armR: ARM_DOWN_R,
  legL: LEG_L,
  legR: LEG_R,
  head: [0, -96],
  ...p,
});

export const POSE = {
  stand: pose({}),
  /** pickaxe up over the head */
  mine: pose({ armR: limb(76, -30, 14, -170) }),
  /** just respawned — arms out, feet apart */
  spread: pose({
    armL: limb(-132, -18, -134, 74),
    armR: limb(152, -26, 162, 62),
    legL: limb(-62, 225, -86, 335),
    legR: limb(62, 225, 86, 335),
  }),
  chin: pose({ armR: limb(96, 96, 34, -22) }),
  chinL: pose({ armL: limb(-96, 96, -34, -22) }),
  cheeks: pose({ armL: limb(-132, 24, -74, -96), armR: limb(132, 24, 74, -96) }),
  up: pose({ armL: limb(-112, -50, -128, -176), armR: limb(112, -50, 128, -176) }),
  upR: pose({ armR: limb(104, -60, 112, -186), armL: limb(-122, 62, -166, 12) }),
  upL: pose({ armL: limb(-104, -60, -112, -186), armR: limb(122, 62, 166, 12) }),
  headHold: pose({ armL: limb(-126, -28, -58, -150), armR: limb(126, -28, 58, -150) }),
  scratch: pose({ armR: limb(108, -64, 28, -194) }),
  out: pose({ armL: limb(-132, 32, -228, -4), armR: limb(132, 32, 228, -4) }),
  reach: pose({
    head: [-44, -84],
    armR: limb(-30, 132, -150, 246),
    armL: limb(-90, 100, -110, 190),
    legL: limb(-60, 228, -80, 335),
    legR: limb(40, 230, 56, 335),
  }),
  holdPick: pose({ armR: limb(76, 122, 82, 214) }),
  /** holding two things up at chest height */
  showOff: pose({ armL: limb(-120, 70, -139, 0), armR: limb(112, 84, 136, 36) }),
};

/** Shorten (or lengthen) the legs below the hip by `k` — the proportions vary shot to shot. */
export const withLegs = (p: Pose, k: number): Pose => {
  const sc = (l: Limb): Limb => [
    [l[0][0], 122 + (l[0][1] - 122) * k],
    [l[1][0], 122 + (l[1][1] - 122) * k],
  ];
  return { ...p, legL: sc(p.legL), legR: sc(p.legR) };
};

export const lerpPt = (a: Pt, b: Pt, t: number): Pt => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
const lerpLimb = (a: Limb, b: Limb, t: number): Limb => [
  lerpPt(a[0], b[0], t),
  lerpPt(a[1], b[1], t),
];
export const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  armL: lerpLimb(a.armL, b.armL, t),
  armR: lerpLimb(a.armR, b.armR, t),
  legL: lerpLimb(a.legL, b.legL, t),
  legR: lerpLimb(a.legR, b.legR, t),
  head: lerpPt(a.head, b.head, t),
});

/** Smoothstep 0-1 between two frames. */
export const ease = (f: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (f - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * A walk cycle. `phase` is in turns; the legs scissor by `stride` and lift
 * on the swing. Arms swing the other way unless the pose has them busy.
 */
export const walkPose = (
  phase: number,
  stride = 60,
  base: Pose = POSE.stand,
  armsToo = true
): Pose => {
  const s = Math.sin(phase * Math.PI * 2);
  const lift = (v: number) => Math.max(0, v) * 34;
  const legs = {
    legL: limb(-40 + s * stride * 0.45, 228 - lift(s) * 0.5, -46 + s * stride, 335 - lift(s)),
    legR: limb(40 - s * stride * 0.45, 228 - lift(-s) * 0.5, 46 - s * stride, 335 - lift(-s)),
  };
  const arms = armsToo
    ? {
        armL: limb(-72 - s * 26, 110, -70 - s * 60, 196),
        armR: limb(72 + s * 26, 110, 70 + s * 60, 196),
      }
    : {};
  return { ...base, ...legs, ...arms };
};

export type Tint = { head: string; line: string; shirt: string };
export const TINT = {
  normal: { head: "#ffffff", line: "#000000", shirt: "#fe9d48" },
  /** the damage flash */
  hurt: { head: "#fca0a1", line: "#5e0000", shirt: "#fd622d" },
  /** unlit stone room */
  dim: { head: "#b7b7b7", line: "#000000", shirt: "#b5692b" },
  /** in the shade of the cave mouth */
  shade: { head: "#e6e7ee", line: "#000000", shirt: "#ec8f41" },
  /** torchlight */
  warm: { head: "#fdf3e6", line: "#000000", shirt: "#fe9d48" },
  /** indoors, one torch */
  house: { head: "#dddddd", line: "#000000", shirt: "#c37636" },
  /** the lava's glow from below */
  lava: { head: "#e9e7ef", line: "#000000", shirt: "#fe9d48" },
} as const;

export type FaceKind =
  | "plain"
  | "worried"
  | "gritted"
  | "smile"
  | "content"
  | "happy"
  | "grin"
  | "joy"
  | "whistle"
  | "sly"
  | "thinking"
  | "scheming"
  | "crying"
  | "surprised"
  | "meh"
  | "shocked"
  | "scream"
  | "frown"
  | "hurt"
  | "back"
  | "side"
  | "sideOpen"
  | "none";

const Eyes: React.FC<{ look: Pt; line: string; r?: number; spread?: number }> = ({
  look,
  line,
  r = 12,
  spread = 30,
}) => (
  <>
    <circle cx={-spread + look[0]} cy={-12 + look[1]} r={r} fill={line} />
    <circle cx={spread + look[0]} cy={-12 + look[1]} r={r} fill={line} />
  </>
);

const HappyEyes: React.FC<{ line: string }> = ({ line }) => (
  <g fill="none" stroke={line} strokeWidth={9} strokeLinecap="round">
    <path d="M-46,-6 q16,-26 32,0" />
    <path d="M14,-6 q16,-26 32,0" />
  </g>
);

/** open smile, teeth on top */
const GrinMouth: React.FC<{ line: string; wide?: number }> = ({ line, wide = 42 }) => (
  <g>
    <path d={`M${-wide},24 q${wide},${wide * 1.5} ${wide * 2},0 z`} fill={line} />
    <path
      d={`M${-wide + 6},26 h${wide * 2 - 12} v10 q${-(wide - 6)},14 ${-(wide * 2 - 12)},0 z`}
      fill="#ffffff"
    />
    <path d={`M${-wide},24 q${wide},${wide * 1.5} ${wide * 2},0`} fill="none" stroke={line} strokeWidth={7} strokeLinecap="round" />
  </g>
);

export const Face: React.FC<{ kind: FaceKind; look?: Pt; line?: string }> = ({
  kind,
  look = [0, 0],
  line = "#000000",
}) => {
  const st = { stroke: line, strokeWidth: 8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const ln = { ...st, fill: "none" };
  switch (kind) {
    case "none":
      return null;
    case "plain":
      return (
        <>
          <Eyes look={look} line={line} />
          <path d="M-22,42 L22,42" {...ln} />
        </>
      );
    case "worried":
      return (
        <>
          <Eyes look={look} line={line} />
          <path d="M-32,44 q16,-16 32,0 q16,16 32,0" {...ln} />
        </>
      );
    case "gritted":
      return (
        <>
          <Eyes look={look} line={line} />
          <rect x={-40} y={28} width={80} height={28} rx={10} fill="#ffffff" {...st} />
          <path d="M-40,42 H40 M-24,29 V55 M-8,29 V55 M8,29 V55 M24,29 V55" fill="none" stroke={line} strokeWidth={4} />
        </>
      );
    case "smile":
      return (
        <>
          <Eyes look={look} line={line} />
          <path d="M-32,34 q32,34 64,0" {...ln} />
        </>
      );
    case "content":
      return (
        <>
          <Eyes look={look} line={line} />
          <path d="M-22,40 q22,20 44,0" {...ln} />
        </>
      );
    case "happy":
      return (
        <>
          <HappyEyes line={line} />
          <path d="M-32,34 q32,34 64,0" {...ln} />
        </>
      );
    case "grin":
      return (
        <>
          <Eyes look={look} line={line} />
          <GrinMouth line={line} />
        </>
      );
    case "joy":
      return (
        <>
          <HappyEyes line={line} />
          <GrinMouth line={line} wide={46} />
        </>
      );
    case "whistle":
      return (
        <>
          <Eyes look={[look[0], look[1] - 6]} line={line} />
          <ellipse cx={0} cy={44} rx={11} ry={13} fill="#ffffff" {...st} />
        </>
      );
    case "sly":
      return (
        <>
          <Eyes look={[look[0] + 12, look[1]]} line={line} />
          <path d="M-24,42 q26,12 50,-10" {...ln} />
        </>
      );
    case "thinking":
      return (
        <>
          <Eyes look={[look[0] - 6, look[1] - 6]} line={line} />
          <path d="M-58,-44 q22,-16 40,-4" {...ln} />
          <path d="M14,-50 q20,-12 38,2" {...ln} />
          <path d="M-30,46 q14,-12 30,0 q12,10 32,-6" {...ln} />
        </>
      );
    case "scheming":
      return (
        <>
          <ellipse cx={-52} cy={6} rx={20} ry={9} fill="#ffd6de" />
          <ellipse cx={52} cy={6} rx={20} ry={9} fill="#ffd6de" />
          <ellipse cx={-38} cy={-12} rx={26} ry={14} fill="#ffffff" {...st} />
          <ellipse cx={38} cy={-12} rx={26} ry={14} fill="#ffffff" {...st} />
          <circle cx={-30 + look[0]} cy={-10} r={9} fill={line} />
          <circle cx={46 + look[0]} cy={-10} r={9} fill={line} />
          <path d="M-62,-40 L-22,-22 M62,-40 L22,-22" {...ln} strokeWidth={10} />
          <path d="M-50,14 q50,74 100,0 q-50,26 -100,0 z" fill="#ffffff" {...st} strokeWidth={9} />
          <path d="M-42,24 q42,36 84,0" {...ln} strokeWidth={5} />
        </>
      );
    case "crying":
      return (
        <>
          <path d="M-62,-56 q24,6 42,-14 M62,-56 q-24,6 -42,-14" {...ln} strokeWidth={9} />
          <ellipse cx={-34} cy={-10} rx={22} ry={30} fill="#ffffff" {...st} />
          <ellipse cx={34} cy={-10} rx={22} ry={30} fill="#ffffff" {...st} />
          <circle cx={-32} cy={-6} r={12} fill={line} />
          <circle cx={36} cy={-6} r={12} fill={line} />
          <circle cx={-37} cy={-11} r={4} fill="#ffffff" />
          <circle cx={31} cy={-11} r={4} fill="#ffffff" />
          <ellipse cx={-52} cy={24} rx={10} ry={7} fill="#65c5fb" />
          <ellipse cx={54} cy={24} rx={10} ry={7} fill="#65c5fb" />
          <path d="M-40,52 q20,-22 40,-4 q20,16 44,-6" {...ln} strokeWidth={9} />
        </>
      );
    case "surprised":
      return (
        <>
          <Eyes look={look} line={line} />
          <ellipse cx={0} cy={44} rx={12} ry={16} fill="#ffffff" {...st} />
        </>
      );
    case "meh":
      return (
        <>
          <path d="M-42,-12 a12,12 0 0 0 24,0 z" fill={line} />
          <path d="M18,-12 a12,12 0 0 0 24,0 z" fill={line} />
          <path d="M-46,-14 H-14 M14,-14 H46" fill="none" stroke={line} strokeWidth={6} strokeLinecap="round" />
          <path d="M-22,44 L22,44" {...ln} />
        </>
      );
    case "shocked":
      return (
        <>
          <Eyes look={look} line={line} r={9} spread={18} />
          <path d="M-16,42 q8,-8 16,0 q8,8 16,0" {...ln} strokeWidth={7} />
        </>
      );
    case "scream":
      return (
        <>
          <path d="M-40,-20 h80 q6,0 6,8 v58 q0,32 -46,32 q-46,0 -46,-32 v-58 q0,-8 6,-8 z" fill="#ffffff" {...st} strokeWidth={9} />
        </>
      );
    case "frown":
      return (
        <>
          <Eyes look={look} line={line} />
          <path d="M-62,-52 q24,10 42,-8 M62,-52 q-24,10 -42,-8" {...ln} />
          <path d="M-30,52 q30,-30 60,0" {...ln} />
        </>
      );
    case "hurt":
      return (
        <>
          <path d="M-36,-22 L-26,0 M36,-22 L26,0" {...ln} strokeWidth={7} />
          <ellipse cx={0} cy={34} rx={20} ry={34} fill="#4a0c0c" stroke={line} strokeWidth={6} />
        </>
      );
    case "back":
      return <path d="M-64,-40 q30,-78 98,-24" {...ln} strokeWidth={14} />;
    case "side":
      return <path d="M52,-26 q40,26 0,54 q14,-27 0,-54 z" fill={line} />;
    case "sideOpen":
      return (
        <>
          <path d="M50,-8 q48,0 48,30 q0,30 -48,30 z" fill={line} />
          <path d="M56,-2 q30,2 32,14 h-32 z" fill="#ffffff" />
        </>
      );
    default:
      return null;
  }
};

export const Figure: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pose: Pose;
  face: FaceKind;
  tint?: Tint;
  look?: Pt;
  /** head rotation in degrees */
  tilt?: number;
  flip?: boolean;
  /** draw the arms over the head (hands on cheeks, on the chin) */
  armsOverHead?: boolean;
  /** extra drawing in figure space, given the hand positions */
  hands?: (hand: { L: Pt; R: Pt }) => React.ReactNode;
  lineWidth?: number;
  /** slide the features across the head, for a face turned toward something */
  faceOffset?: Pt;
}> = ({
  x,
  y,
  scale = 1,
  pose: p,
  face,
  tint = TINT.normal,
  look = [0, 0],
  tilt = 0,
  flip = false,
  armsOverHead = false,
  hands,
  lineWidth = 1,
  faceOffset = [0, 0],
}) => {
  const aw = 22 * lineWidth;
  const lw = 24 * lineWidth;
  const seg = (from: Pt, l: Limb, w: number) => (
    <polyline
      points={`${from[0]},${from[1]} ${l[0][0]},${l[0][1]} ${l[1][0]},${l[1][1]}`}
      fill="none"
      stroke={tint.line}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  const head = (
    <g transform={`translate(${p.head[0]} ${p.head[1]}) rotate(${tilt})`}>
      <circle r={HEAD_R} fill={tint.head} stroke={tint.line} strokeWidth={16 * lineWidth} />
      <g transform={`translate(${faceOffset[0]} ${faceOffset[1]})`}>
        <Face kind={face} look={look} line={tint.line} />
      </g>
    </g>
  );
  const arms = (
    <>
      {seg(SHOULDER.L, p.armL, aw)}
      {seg(SHOULDER.R, p.armR, aw)}
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      {seg(HIP.L, p.legL, lw)}
      {seg(HIP.R, p.legR, lw)}
      <path
        d="M-50,0 Q-56,60 -62,124 L62,124 Q56,60 50,0 Z"
        fill={tint.shirt}
        stroke={tint.line}
        strokeWidth={14 * lineWidth}
        strokeLinejoin="round"
      />
      {armsOverHead ? (
        <>
          {head}
          {arms}
        </>
      ) : (
        <>
          {arms}
          {head}
        </>
      )}
      {hands ? hands({ L: p.armL[1], R: p.armR[1] }) : null}
    </g>
  );
};

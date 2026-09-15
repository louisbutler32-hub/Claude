import React from "react";
import { FaceKind, HIP, Limb, Pose, Pt, SHOULDER } from "./figure";

/**
 * Pebblo — the channel's own character for the Minecraft Shorts.
 *
 * A pebble, not a stick figure: one rounded stone is the whole head and
 * body, with a tuft of moss for hair, a chipped corner, big oval eyes
 * with proper whites, freckles, and stick limbs that end in mitten hands
 * and little feet. Same pose format as the stick figure (hand and foot
 * positions relative to the origin), so every shot can swap between them.
 *
 * Origin is the centre of the pebble. Scale 1 is roughly the stick
 * figure's head-plus-torso, so it plays at the same size in the same shots.
 */

export const PEBBLO = {
  stone: "#d8d2c6",
  stoneShade: "#b7b0a3",
  stoneLight: "#efeae1",
  moss: "#6fb04c",
  mossDark: "#4f8c35",
  freckle: "#9a9184",
  blush: "#f2b8a6",
  line: "#141414",
};

export type PebbloTint = { stone: string; shade: string; moss: string; line: string; eye: string };
export const PEBBLO_TINT = {
  normal: { stone: PEBBLO.stone, shade: PEBBLO.stoneShade, moss: PEBBLO.moss, line: PEBBLO.line, eye: "#ffffff" },
  hurt: { stone: "#f0a3a0", shade: "#c97f7c", moss: "#c2775a", line: "#5e0000", eye: "#ffd9d6" },
  dim: { stone: "#9d988f", shade: "#7d786f", moss: "#4c7a36", line: "#141414", eye: "#cfcfcf" },
  warm: { stone: "#e8dcc6", shade: "#c2b294", moss: "#7fb551", line: "#141414", eye: "#fff6e6" },
  lava: { stone: "#e6d4bd", shade: "#c09a7a", moss: "#7fb04c", line: "#141414", eye: "#fff3e0" },
} as const;

/** The pebble outline, drawn once and reused for the fill, the shade clip and the stroke. */
const BODY = "M-96,-34 Q-92,-98 -22,-92 Q58,-100 94,-52 Q108,22 82,70 Q34,98 -42,88 Q-100,74 -96,-34 Z";

const Brow: React.FC<{ x: number; y: number; angle: number; line: string; len?: number }> = ({ x, y, angle, line, len = 34 }) => (
  <line
    x1={x - len / 2}
    y1={y}
    x2={x + len / 2}
    y2={y}
    stroke={line}
    strokeWidth={9}
    strokeLinecap="round"
    transform={`rotate(${angle} ${x} ${y})`}
  />
);

const Eye: React.FC<{ cx: number; look: Pt; line: string; white: string; ry?: number; lid?: number; sad?: boolean }> = ({
  cx,
  look,
  line,
  white,
  ry = 30,
  lid = 0,
  sad = false,
}) => (
  <g>
    <ellipse cx={cx} cy={-14} rx={24} ry={ry} fill={white} stroke={line} strokeWidth={8} />
    <circle cx={cx + look[0] * 0.9 + (cx > 0 ? 3 : -3)} cy={-10 + look[1] * 0.9} r={11} fill={line} />
    <circle cx={cx + look[0] * 0.9 + (cx > 0 ? -1 : -7)} cy={-16 + look[1] * 0.9} r={3.5} fill="#ffffff" />
    {lid > 0 && (
      <path
        d={`M${cx - 26},${-14 - ry + lid * ry * 2} h52 v${-ry * 2} h-52 z`}
        fill={PEBBLO.stone}
        stroke="none"
      />
    )}
    {lid > 0 && (
      <line x1={cx - 26} y1={-14 - ry + lid * ry * 2} x2={cx + 26} y2={-14 - ry + lid * ry * 2} stroke={line} strokeWidth={7} strokeLinecap="round" />
    )}
    {sad && null}
  </g>
);

export const PebbloFace: React.FC<{ kind: FaceKind; look?: Pt; tint?: PebbloTint }> = ({ kind, look = [0, 0], tint = PEBBLO_TINT.normal }) => {
  const line = tint.line;
  const white = tint.eye;
  const st = { stroke: line, strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const ln = { ...st, fill: "none" };
  const eyes = (ry = 30, lid = 0, lk: Pt = look) => (
    <>
      <Eye cx={-36} look={lk} line={line} white={white} ry={ry} lid={lid} />
      <Eye cx={36} look={lk} line={line} white={white} ry={ry} lid={lid} />
    </>
  );
  const freckles = (
    <g fill={PEBBLO.freckle}>
      <circle cx={-70} cy={22} r={4} />
      <circle cx={-58} cy={30} r={3.5} />
      <circle cx={64} cy={24} r={4} />
      <circle cx={74} cy={34} r={3} />
    </g>
  );
  switch (kind) {
    case "none":
      return null;
    case "back":
      return null;
    case "side":
      return <path d="M66,-30 q30,26 0,54 q12,-27 0,-54 z" fill={line} />;
    case "sideOpen":
      return <path d="M60,-4 q40,0 40,28 q0,28 -40,28 z" fill={line} />;
    case "hurt":
      return (
        <>
          <path d="M-52,-30 l32,32 M-20,-30 l-32,32 M20,-30 l32,32 M52,-30 l-32,32" {...ln} />
          <ellipse cx={0} cy={44} rx={22} ry={26} fill="#4a0c0c" stroke={line} strokeWidth={7} />
        </>
      );
    case "scream":
      return (
        <>
          {eyes(14, 0, [0, 0])}
          <path d="M-40,26 h80 q6,0 6,8 v34 q0,26 -46,26 q-46,0 -46,-26 v-34 q0,-8 6,-8 z" fill="#ffffff" {...st} />
          {freckles}
        </>
      );
    case "shocked":
      return (
        <>
          {eyes(34, 0, [0, 2])}
          <Brow x={-36} y={-56} angle={-14} line={line} />
          <Brow x={36} y={-56} angle={14} line={line} />
          <path d="M-14,48 q7,-8 14,0 q7,8 14,0" {...ln} strokeWidth={7} />
          {freckles}
        </>
      );
    case "crying":
      return (
        <>
          {eyes(34, 0, [0, 2])}
          <Brow x={-36} y={-56} angle={18} line={line} />
          <Brow x={36} y={-56} angle={-18} line={line} />
          <ellipse cx={-62} cy={22} rx={9} ry={12} fill="#65c5fb" />
          <ellipse cx={62} cy={24} rx={9} ry={12} fill="#65c5fb" />
          <path d="M-34,52 q17,-18 34,-2 q17,14 36,-4" {...ln} />
        </>
      );
    case "worried":
      return (
        <>
          {eyes()}
          <Brow x={-36} y={-54} angle={16} line={line} />
          <Brow x={36} y={-54} angle={-16} line={line} />
          <path d="M-30,50 q15,-14 30,0 q15,14 30,0" {...ln} />
          {freckles}
        </>
      );
    case "gritted":
      return (
        <>
          {eyes()}
          <Brow x={-36} y={-54} angle={16} line={line} />
          <Brow x={36} y={-54} angle={-16} line={line} />
          <rect x={-40} y={36} width={80} height={26} rx={9} fill="#ffffff" {...st} strokeWidth={8} />
          <path d="M-40,49 H40 M-22,37 V61 M-6,37 V61 M10,37 V61 M26,37 V61" fill="none" stroke={line} strokeWidth={4} />
        </>
      );
    case "frown":
      return (
        <>
          {eyes()}
          <Brow x={-36} y={-54} angle={16} line={line} />
          <Brow x={36} y={-54} angle={-16} line={line} />
          <path d="M-28,58 q28,-26 56,0" {...ln} />
          {freckles}
        </>
      );
    case "meh":
      return (
        <>
          {eyes(30, 0.5)}
          <path d="M-24,50 h48" {...ln} />
          {freckles}
        </>
      );
    case "sly":
      return (
        <>
          {eyes(30, 0.35, [10, 0])}
          <path d="M-22,48 q26,14 50,-10" {...ln} />
          {freckles}
        </>
      );
    case "scheming":
      return (
        <>
          {eyes(30, 0.45)}
          <Brow x={-36} y={-52} angle={-24} line={line} />
          <Brow x={36} y={-52} angle={24} line={line} />
          <path d="M-46,30 q46,60 92,0 q-46,22 -92,0 z" fill="#ffffff" {...st} />
          <ellipse cx={-70} cy={30} rx={16} ry={8} fill={PEBBLO.blush} />
          <ellipse cx={70} cy={30} rx={16} ry={8} fill={PEBBLO.blush} />
        </>
      );
    case "thinking":
      return (
        <>
          {eyes(30, 0, [-8, -8])}
          <Brow x={-36} y={-60} angle={-12} line={line} len={30} />
          <Brow x={38} y={-64} angle={-10} line={line} len={30} />
          <path d="M-26,52 q13,-12 26,0 q12,10 30,-6" {...ln} />
          {freckles}
        </>
      );
    case "surprised":
      return (
        <>
          {eyes(34)}
          <ellipse cx={0} cy={50} rx={12} ry={15} fill="#ffffff" {...st} strokeWidth={8} />
          {freckles}
        </>
      );
    case "whistle":
      return (
        <>
          {eyes(30, 0, [look[0], look[1] - 8])}
          <circle cx={0} cy={50} r={10} fill="#ffffff" {...st} strokeWidth={8} />
          {freckles}
        </>
      );
    case "happy":
      return (
        <>
          <path d="M-58,-10 q22,-30 44,0 M14,-10 q22,-30 44,0" {...ln} strokeWidth={10} />
          <path d="M-30,44 q30,30 60,0" {...ln} />
          {freckles}
        </>
      );
    case "joy":
      return (
        <>
          <path d="M-58,-10 q22,-30 44,0 M14,-10 q22,-30 44,0" {...ln} strokeWidth={10} />
          <path d="M-44,34 q44,60 88,0 z" fill={line} />
          <path d="M-36,36 h72 v10 q-36,12 -72,0 z" fill="#ffffff" />
          <ellipse cx={-72} cy={26} rx={14} ry={7} fill={PEBBLO.blush} />
          <ellipse cx={72} cy={26} rx={14} ry={7} fill={PEBBLO.blush} />
        </>
      );
    case "grin":
      return (
        <>
          {eyes()}
          <path d="M-44,34 q44,60 88,0 z" fill={line} />
          <path d="M-36,36 h72 v10 q-36,12 -72,0 z" fill="#ffffff" />
          {freckles}
        </>
      );
    case "smile":
    case "content":
      return (
        <>
          {eyes()}
          <path d="M-28,44 q28,26 56,0" {...ln} />
          {freckles}
        </>
      );
    case "plain":
    default:
      return (
        <>
          {eyes()}
          <path d="M-20,50 h40" {...ln} />
          {freckles}
        </>
      );
  }
};

export const Pebblo: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pose: Pose;
  face: FaceKind;
  tint?: PebbloTint;
  look?: Pt;
  tilt?: number;
  flip?: boolean;
  armsOverHead?: boolean;
  hands?: (hand: { L: Pt; R: Pt }) => React.ReactNode;
  lineWidth?: number;
}> = ({ x, y, scale = 1, pose: p, face, tint = PEBBLO_TINT.normal, look = [0, 0], tilt = 0, flip = false, armsOverHead = false, hands, lineWidth = 1 }) => {
  const lw = 22 * lineWidth;
  // the pebble sits where the stick figure's head and torso would be: the
  // pose's hip is 122 below the origin, its shoulders 16 below; we move the
  // whole pose so the limbs sprout from the pebble's sides and underside
  const dy = -60;
  // stubby legs: the pose's leg points are scaled toward the hip
  const HIPY = HIP.L[1] - 30;
  const stub = (l: Limb, k: number): Limb => [
    [l[0][0] * 0.9, HIPY + (l[0][1] - HIPY) * k],
    [l[1][0] * 0.9, HIPY + (l[1][1] - HIPY) * k],
  ];
  const seg = (from: Pt, l: Limb, hand: boolean) => (
    <g>
      <polyline
        points={`${from[0]},${from[1] + dy} ${l[0][0]},${l[0][1] + dy} ${l[1][0]},${l[1][1] + dy}`}
        fill="none"
        stroke={tint.line}
        strokeWidth={lw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {hand ? (
        <circle cx={l[1][0]} cy={l[1][1] + dy} r={15 * lineWidth} fill={tint.line} />
      ) : (
        <ellipse cx={l[1][0] + (l[1][0] < 0 ? -8 : 8)} cy={l[1][1] + dy} rx={22 * lineWidth} ry={11 * lineWidth} fill={tint.line} />
      )}
    </g>
  );
  const body = (
    <g transform={`rotate(${tilt})`}>
      <path d={BODY} fill={tint.stone} stroke={tint.line} strokeWidth={14 * lineWidth} strokeLinejoin="round" />
      <clipPath id="pebbloClip">
        <path d={BODY} />
      </clipPath>
      <g clipPath="url(#pebbloClip)">
        <path d="M-10,40 Q60,20 110,80 L110,120 L-40,120 Z" fill={tint.shade} opacity={0.55} />
        <path d="M-80,-70 q30,-16 60,-6 q-30,4 -52,22 z" fill={PEBBLO.stoneLight} opacity={0.7} />
      </g>
      {/* the chipped corner */}
      <path d="M-96,-34 l18,-4 l-6,18 z" fill={tint.shade} stroke={tint.line} strokeWidth={6} strokeLinejoin="round" />
      {/* moss tuft */}
      <path d="M-64,-82 q8,-44 44,-24 q4,-40 40,-16 q22,-22 36,10 q-30,-8 -52,6 q-26,-18 -68,24 z" fill={tint.moss} stroke={tint.line} strokeWidth={9 * lineWidth} strokeLinejoin="round" />
      <path d="M-30,-92 q10,-8 18,-2 M6,-100 q10,-6 16,2" fill="none" stroke={PEBBLO.mossDark} strokeWidth={5} strokeLinecap="round" />
      <PebbloFace kind={face} look={look} tint={tint} />
    </g>
  );
  const arms = (
    <>
      {seg([SHOULDER.L[0] - 30, SHOULDER.L[1] + 20], p.armL, true)}
      {seg([SHOULDER.R[0] + 30, SHOULDER.R[1] + 20], p.armR, true)}
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      {seg([HIP.L[0], HIPY], stub(p.legL, 0.62), false)}
      {seg([HIP.R[0], HIPY], stub(p.legR, 0.62), false)}
      {armsOverHead ? (
        <>
          {body}
          {arms}
        </>
      ) : (
        <>
          {arms}
          {body}
        </>
      )}
      {hands ? hands({ L: [p.armL[1][0], p.armL[1][1] + dy], R: [p.armR[1][0], p.armR[1][1] + dy] }) : null}
    </g>
  );
};

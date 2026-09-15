import React from "react";
import { HIP, Limb, Pose, Pt, SHOULDER } from "./figure";

/**
 * Volt — the channel's character for the Minecraft Shorts: a small robot
 * whose face is a pixel screen. Every expression is a little grid, so the
 * acting is Minecraft-shaped by construction. Same pose format as the stick
 * figure (hand and foot points relative to the neck), so shots swap freely.
 *
 * Origin is the neck: the top of the body box. The head sits above it.
 */

export type VoltMood =
  | "plain"
  | "happy"
  | "joy"
  | "worried"
  | "scream"
  | "sly"
  | "meh"
  | "shocked"
  | "angry"
  | "hurt"
  | "focus"
  | "sleepy"
  | "love"
  | "off";

/** 9 wide × 6 tall; X lights a pixel, o lights it dim */
export const SCREENS: Record<VoltMood, string[]> = {
  plain: [".........", ".XX...XX.", ".XX...XX.", ".........", "..XXXXX..", "........."],
  happy: [".........", "X..X.X..X", ".XX...XX.", ".........", "X.......X", ".XXXXXXX."],
  joy: ["X..X.X..X", ".XX...XX.", ".........", "XXXXXXXXX", ".XXXXXXX.", "..XXXXX.."],
  worried: ["..X...X..", ".XX...XX.", ".XX...XX.", ".........", "..XX.XX..", ".X..X..X."],
  scream: [".XX...XX.", ".XX...XX.", ".........", "...XXX...", "..X...X..", "...XXX..."],
  sly: [".........", "XXX...XXX", ".XX...XX.", ".........", "...XXXX..", "......X.."],
  meh: [".........", "XXX...XXX", ".XX...XX.", ".........", ".XXXXXXX.", "........."],
  shocked: [".X.....X.", "X.X...X.X", ".X.....X.", ".........", "....X....", "........."],
  angry: ["X.......X", ".XX...XX.", "..X...X..", ".........", ".XXXXXXX.", "X.......X"],
  hurt: ["X.X...X.X", ".X.....X.", "X.X...X.X", ".........", "...XXX...", "..X...X.."],
  focus: [".........", "XXXX.XXXX", ".XX...XX.", ".........", "...XXX...", "........."],
  sleepy: [".........", ".........", "XXX...XXX", ".........", "..XXXXX..", "........."],
  love: [".X.X.X.X.", "XXXXXXXXX", ".XXX.XXX.", "..X...X..", "..XXXXX..", "........."],
  off: [".........", ".........", ".........", ".........", ".........", "........."],
};

export type VoltTint = { head: string; body: string; screen: string; pixel: string; line: string; limb: string };
export const VOLT_TINT = {
  normal: { head: "#8fd3e6", body: "#cfd8dd", screen: "#101820", pixel: "#5cff8a", line: "#141414", limb: "#141414" },
  hurt: { head: "#f08a8a", body: "#e8a0a0", screen: "#2a0a0a", pixel: "#ff5c5c", line: "#5e0000", limb: "#5e0000" },
  dim: { head: "#5c8a97", body: "#8a9399", screen: "#0a0f14", pixel: "#3fb865", line: "#141414", limb: "#141414" },
  warm: { head: "#a8d6d8", body: "#e2d8c4", screen: "#141410", pixel: "#7dff9c", line: "#141414", limb: "#141414" },
  lava: { head: "#9fd0d6", body: "#e3d3b8", screen: "#141410", pixel: "#7dff9c", line: "#141414", limb: "#141414" },
} as const;

export const Screen: React.FC<{ mood: VoltMood; pixel: string; x: number; y: number; px: number; blink?: boolean }> = ({ mood, pixel, x, y, px, blink }) => {
  const rows = blink ? SCREENS.sleepy : SCREENS[mood];
  return (
    <g transform={`translate(${x} ${y})`}>
      {rows.map((row, r) =>
        row.split("").map((c, i) =>
          c === "X" ? <rect key={`${r}${i}`} x={i * px} y={r * px} width={px - 1} height={px - 1} fill={pixel} /> : c === "o" ? <rect key={`${r}${i}`} x={i * px} y={r * px} width={px - 1} height={px - 1} fill={pixel} opacity={0.4} /> : null
        )
      )}
    </g>
  );
};

export const Volt: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pose: Pose;
  mood: VoltMood;
  tint?: VoltTint;
  /** head turn/tilt in degrees */
  tilt?: number;
  flip?: boolean;
  blink?: boolean;
  /** draw arms after the head (hands on the face) */
  armsOverHead?: boolean;
  hands?: (hand: { L: Pt; R: Pt }) => React.ReactNode;
  lineWidth?: number;
  /** a screen glow behind the head (in the dark) */
  glow?: number;
}> = ({ x, y, scale = 1, pose: p, mood, tint = VOLT_TINT.normal, tilt = 0, flip = false, blink = false, armsOverHead = false, hands, lineWidth = 1, glow = 0 }) => {
  const lw = 18 * lineWidth;
  // legs are short on a robot: scale the pose's legs toward the hip
  const HIPY = 96;
  const stub = (l: Limb): Limb => [
    [l[0][0], HIPY + (l[0][1] - 122) * 0.55],
    [l[1][0], HIPY + (l[1][1] - 122) * 0.55],
  ];
  const seg = (from: Pt, l: Limb, w: number) => (
    <polyline
      points={`${from[0]},${from[1]} ${l[0][0]},${l[0][1]} ${l[1][0]},${l[1][1]}`}
      fill="none"
      stroke={tint.limb}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  const claw = (h: Pt, dir: number) => (
    <g transform={`translate(${h[0]} ${h[1]})`} fill="none" stroke={tint.limb} strokeWidth={9 * lineWidth} strokeLinecap="round">
      <path d={`M0,0 l${14 * dir},-12 M0,0 l${14 * dir},12`} />
    </g>
  );
  const foot = (f: Pt) => <ellipse cx={f[0]} cy={f[1]} rx={26} ry={12} fill="#4d5a63" stroke={tint.line} strokeWidth={6} />;
  const legL = stub(p.legL);
  const legR = stub(p.legR);
  const head = (
    <g transform={`translate(${p.head[0]} ${p.head[1] + 20}) rotate(${tilt})`}>
      {glow > 0 && <ellipse cx={0} cy={0} rx={150} ry={130} fill={tint.pixel} opacity={glow * 0.25} />}
      <rect x={-92} y={-80} width={184} height={160} rx={26} fill={tint.head} stroke={tint.line} strokeWidth={11 * lineWidth} />
      <rect x={-72} y={-62} width={144} height={110} rx={12} fill={tint.screen} stroke={tint.line} strokeWidth={6} />
      <Screen mood={mood} pixel={tint.pixel} x={-63} y={-54} px={14} blink={blink} />
      <path d="M0,-80 v-30" fill="none" stroke={tint.line} strokeWidth={10} strokeLinecap="round" />
      <circle cx={0} cy={-120} r={13} fill="#ff5a5a" stroke={tint.line} strokeWidth={6} />
      <rect x={-102} y={-24} width={16} height={40} rx={5} fill="#4d5a63" stroke={tint.line} strokeWidth={6} />
      <rect x={86} y={-24} width={16} height={40} rx={5} fill="#4d5a63" stroke={tint.line} strokeWidth={6} />
    </g>
  );
  const arms = (
    <>
      {seg([SHOULDER.L[0] - 12, SHOULDER.L[1] + 22], p.armL, lw)}
      {seg([SHOULDER.R[0] + 12, SHOULDER.R[1] + 22], p.armR, lw)}
      {claw(p.armL[1], -1)}
      {claw(p.armR[1], 1)}
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      {seg([HIP.L[0], HIPY], legL, lw + 2)}
      {seg([HIP.R[0], HIPY], legR, lw + 2)}
      {foot(legL[1])}
      {foot(legR[1])}
      <rect x={-58} y={0} width={116} height={100} rx={14} fill={tint.body} stroke={tint.line} strokeWidth={10 * lineWidth} />
      <circle cx={0} cy={50} r={12} fill="#ff5a5a" stroke={tint.line} strokeWidth={6} />
      <rect x={-40} y={78} width={80} height={8} rx={4} fill={tint.line} opacity={0.35} />
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

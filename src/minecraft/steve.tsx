import React from "react";
import { HIP, Limb, Pose, Pt, SHOULDER } from "./figure";

/**
 * Our Steve — the game's default character, redrawn the channel's way:
 * a chibi with a head the size of his torso, thick black outlines round
 * every block, and a pixel face that actually acts (the real one never
 * changes). Same pose format as the stick figure, so shots swap freely.
 *
 * Origin is the neck: the top of the torso. The head sits above it.
 */

export type SteveMood = "plain" | "happy" | "joy" | "worried" | "scream" | "sly" | "meh" | "shocked" | "angry" | "hurt" | "focus" | "sleepy" | "love" | "off";

/** the 8×8 face; letters map to the palette below, moods patch rows 3-6 */
const BASE = ["HHHHHHHH", "HHHHHHHH", "HSSSSSSH", "SWPSSPWS", "SSSNNSSS", "SSMMMMSS", "SSSMMSSS", "SSSSSSSS"];

const FACES: Record<SteveMood, string[]> = {
  plain: BASE,
  happy: patch(["SSSSSSSS", "SPSSSSPS", "SSSNNSSS", "SMSSSSMS", "SSMMMMSS", "SSSSSSSS"]),
  joy: patch(["SSSSSSSS", "SPSSSSPS", "SSSNNSSS", "SMMMMMMS", "SMTTTTMS", "SSMMMMSS"]),
  worried: patch(["SSHSSHSS", "SWPSSPWS", "SSSNNSSS", "SSMSSMSS", "SMSMMSMS", "SSSSSSSS"]),
  scream: patch(["SSSSSSSS", "SWPSSPWS", "SSSNNSSS", "SSMMMMSS", "SSMDDMSS", "SSMMMMSS"]),
  sly: patch(["SSSSSSSS", "SSWPSSWP", "SSSNNSSS", "SSSSMMSS", "SSMMSSSS", "SSSSSSSS"]),
  meh: patch(["SSSSSSSS", "SHHSSHHS", "SWPNNPWS", "SSSSSSSS", "SSMMMMSS", "SSSSSSSS"]),
  shocked: patch(["SSSSSSSS", "SWWSSWWS", "SWPNNPWS", "SSSSSSSS", "SSSMMSSS", "SSSSSSSS"]),
  angry: patch(["SHSSSSHS", "SWPSSPWS", "SSSNNSSS", "SSMMMMSS", "SMSSSSMS", "SSSSSSSS"]),
  hurt: patch(["SMSMSMSM", "SSMSSSMS", "SMSMNMSM", "SSSSSSSS", "SSSMMSSS", "SSMSSMSS"]),
  focus: patch(["SSSSSSSS", "SHHSSHHS", "SWPSSPWS", "SSSNNSSS", "SSSMMSSS", "SSSSSSSS"]),
  sleepy: patch(["SSSSSSSS", "SSSSSSSS", "SHHSNHHS", "SSSSSSSS", "SSMMMMSS", "SSSSSSSS"]),
  love: patch(["SRSRSRSR", "RRRRRRRR", "SRRRSRRR", "SSRNNRSS", "SSMMMMSS", "SSSSSSSS"]),
  off: patch(["SSSSSSSS", "SSSSSSSS", "SSSSSSSS", "SSSSSSSS", "SSSSSSSS", "SSSSSSSS"]),
};

function patch(rows: string[]): string[] {
  return [BASE[0], BASE[1], ...rows];
}

export type SteveTint = { skin: string; skinDark: string; hair: string; shirt: string; shirtDark: string; pants: string; pantsDark: string; shoe: string; line: string; eye: string; pupil: string; mouth: string };
export const STEVE_TINT = {
  normal: { skin: "#b4876a", skinDark: "#9a6f52", hair: "#3b2a1c", shirt: "#1fb9b3", shirtDark: "#159a95", pants: "#4b39b8", pantsDark: "#3b2b98", shoe: "#6b6b6b", line: "#141414", eye: "#ffffff", pupil: "#4a3aa8", mouth: "#5a3a26" },
  hurt: { skin: "#e08a8a", skinDark: "#c07070", hair: "#7a2a2a", shirt: "#e07f9a", shirtDark: "#c06a84", pants: "#a04a9a", pantsDark: "#883a84", shoe: "#a06a6a", line: "#5e0000", eye: "#ffd9d6", pupil: "#8a2a4a", mouth: "#7a2a2a" },
  dim: { skin: "#7a5c48", skinDark: "#634a3a", hair: "#221810", shirt: "#12807c", shirtDark: "#0d6a66", pants: "#30257a", pantsDark: "#261d62", shoe: "#444444", line: "#141414", eye: "#cfcfcf", pupil: "#33287a", mouth: "#3a2418" },
  warm: { skin: "#c9986f", skinDark: "#a97e5a", hair: "#4a3520", shirt: "#3fc4b8", shirtDark: "#2da59a", pants: "#5a48c0", pantsDark: "#4738a0", shoe: "#7a7068", line: "#141414", eye: "#fff6e6", pupil: "#4a3aa8", mouth: "#5a3a26" },
} as const;

const KEY: Record<string, keyof SteveTint | "T" | "D" | "R"> = { H: "hair", S: "skin", W: "eye", P: "pupil", N: "skinDark", M: "mouth", T: "T", D: "D", R: "R" };

export const SteveFace: React.FC<{ mood: SteveMood; tint: SteveTint; x: number; y: number; px: number }> = ({ mood, tint, x, y, px }) => (
  <g transform={`translate(${x} ${y})`}>
    {FACES[mood].map((row, r) =>
      row.split("").map((c, i) => {
        const k = KEY[c];
        const fill = k === "T" ? "#ffffff" : k === "D" ? "#2a1810" : k === "R" ? "#ff4d6d" : tint[k];
        return <rect key={`${r}${i}`} x={i * px} y={r * px} width={px + 0.4} height={px + 0.4} fill={fill} />;
      })
    )}
  </g>
);

/** a pixel-noise texture over a flat block, to read as the game's skin */
const Grain: React.FC<{ x: number; y: number; w: number; h: number; px: number; color: string; seed: number }> = ({ x, y, w, h, px, color, seed }) => {
  const cols = Math.floor(w / px), rows = Math.floor(h / px);
  const cells: React.ReactNode[] = [];
  let s = seed;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      s = (s * 9301 + 49297) % 233280;
      if (s / 233280 < 0.22) cells.push(<rect key={`${r}${c}`} x={x + c * px} y={y + r * px} width={px + 0.4} height={px + 0.4} fill={color} />);
    }
  return <>{cells}</>;
};

export const Steve: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pose: Pose;
  mood: SteveMood;
  tint?: SteveTint;
  tilt?: number;
  flip?: boolean;
  armsOverHead?: boolean;
  hands?: (hand: { L: Pt; R: Pt }) => React.ReactNode;
  lineWidth?: number;
}> = ({ x, y, scale = 1, pose: p, mood, tint = STEVE_TINT.normal, tilt = 0, flip = false, armsOverHead = false, hands, lineWidth = 1 }) => {
  const outline = tint.line;
  const ow = 10 * lineWidth;
  // chibi: short legs
  const HIPY = 100;
  const stub = (l: Limb): Limb => [
    [l[0][0], HIPY + (l[0][1] - 122) * 0.62],
    [l[1][0], HIPY + (l[1][1] - 122) * 0.62],
  ];
  /** a blocky limb: a wide square-capped polyline in two colours, outlined */
  const limb = (from: Pt, l: Limb, w: number, upper: string, lower: string, grain: string) => {
    const pts = `${from[0]},${from[1]} ${l[0][0]},${l[0][1]} ${l[1][0]},${l[1][1]}`;
    return (
      <g>
        <polyline points={pts} fill="none" stroke={outline} strokeWidth={w + ow * 2} strokeLinecap="square" strokeLinejoin="round" />
        <polyline points={pts} fill="none" stroke={lower} strokeWidth={w} strokeLinecap="square" strokeLinejoin="round" />
        <polyline points={`${from[0]},${from[1]} ${l[0][0]},${l[0][1]}`} fill="none" stroke={upper} strokeWidth={w} strokeLinecap="square" strokeLinejoin="round" />
        <polyline points={`${l[0][0]},${l[0][1]} ${l[1][0]},${l[1][1]}`} fill="none" stroke={grain} strokeWidth={w * 0.35} strokeDasharray="6 14" strokeLinecap="butt" opacity={0.5} />
      </g>
    );
  };
  const legL = stub(p.legL);
  const legR = stub(p.legR);
  const shoe = (f: Pt) => <rect x={f[0] - 26} y={f[1] - 6} width={52} height={22} fill={tint.shoe} stroke={outline} strokeWidth={8} />;
  const head = (
    <g transform={`translate(${p.head[0]} ${p.head[1] + 4}) rotate(${tilt})`}>
      <rect x={-100} y={-100} width={200} height={200} fill={tint.skin} stroke={outline} strokeWidth={11 * lineWidth} strokeLinejoin="round" />
      <SteveFace mood={mood} tint={tint} x={-100} y={-100} px={25} />
      {/* hair overhang, the block's top edge */}
      <rect x={-100} y={-100} width={200} height={50} fill={tint.hair} />
      <Grain x={-100} y={-100} w={200} h={50} px={25} color="#2a1c12" seed={7} />
      <rect x={-100} y={-100} width={200} height={200} fill="none" stroke={outline} strokeWidth={11 * lineWidth} strokeLinejoin="round" />
    </g>
  );
  const arms = (
    <>
      {limb([SHOULDER.L[0] - 20, SHOULDER.L[1] + 26], p.armL, 46, tint.shirt, tint.skin, tint.skinDark)}
      {limb([SHOULDER.R[0] + 20, SHOULDER.R[1] + 26], p.armR, 46, tint.shirt, tint.skin, tint.skinDark)}
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      {limb([HIP.L[0], HIPY], legL, 48, tint.pants, tint.pants, tint.pantsDark)}
      {limb([HIP.R[0], HIPY], legR, 48, tint.pants, tint.pants, tint.pantsDark)}
      {shoe(legL[1])}
      {shoe(legR[1])}
      <rect x={-64} y={0} width={128} height={110} fill={tint.shirt} stroke={outline} strokeWidth={10 * lineWidth} strokeLinejoin="round" />
      <Grain x={-64} y={0} w={128} h={110} px={16} color={tint.shirtDark} seed={3} />
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

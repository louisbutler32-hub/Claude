import React from "react";
import { HIP, Limb, Pose, Pt, SHOULDER } from "./figure";

/**
 * Pix — the channel's own character, built like a player skin (cube head,
 * block torso, block limbs) but nobody's skin in particular: navy hair with
 * a fringe over one eye, big green two-by-two eyes, freckles, an orange
 * hoodie with the hood down, grey jeans, red shoes, and a pixel headset.
 * Chibi proportions, thick outlines, and a face that acts.
 *
 * Origin is the neck: the top of the torso. The head sits above it.
 */

export type PixMood = "plain" | "happy" | "joy" | "worried" | "scream" | "sly" | "meh" | "shocked" | "angry" | "hurt" | "focus" | "sleepy" | "love" | "off";

/** the 8×8 face; letters map to the palette below, moods patch rows 3-6 */
const BASE = ["HHHHHHHH", "HHHHHHHH", "HHHSSSSH", "SWPSSWPS", "SWPSSWPS", "SFSSSSFS", "SSSMMSSS", "SSSSSSSS"];

const FACES: Record<PixMood, string[]> = {
  plain: BASE,
  happy: patch(["SPPSSPPS", "PSSPPSSP", "SFSSSSFS", "SMSSSSMS", "SSMMMMSS"]),
  joy: patch(["SPPSSPPS", "PSSPPSSP", "SFMMMMFS", "SMTTTTMS", "SSMMMMSS"]),
  worried: patch(["SSHSSHSS", "SWPSSWPS", "SFPSSPFS", "SSMSSMSS", "SMSMMSMS"]),
  scream: patch(["SWPSSWPS", "SWPSSWPS", "SFMMMMFS", "SSMDDMSS", "SSMMMMSS"]),
  sly: patch(["SHHSSHHS", "SSWPSSWP", "SFSSSSFS", "SSSSMMSS", "SSMMSSSS"]),
  meh: patch(["SHHSSHHS", "SWPSSWPS", "SFSSSSFS", "SSMMMMSS", "SSSSSSSS"]),
  shocked: patch(["SWWSSWWS", "SWPSSPWS", "SFSSSSFS", "SSSMMSSS", "SSSSSSSS"]),
  angry: patch(["HHSSSSHH", "SWPSSWPS", "SFPSSPFS", "SSMMMMSS", "SMSSSSMS"]),
  hurt: patch(["SMSMSMSM", "SSMSSSMS", "SMSMSMSM", "SSSMMSSS", "SSMSSMSS"]),
  focus: patch(["SHHSSHHS", "SWPSSWPS", "SFSSSSFS", "SSSMMSSS", "SSSSSSSS"]),
  sleepy: patch(["SSSSSSSS", "SHHSSHHS", "SFSSSSFS", "SSMMMMSS", "SSSSSSSS"]),
  love: patch(["SRRSSRRS", "RRRRRRRR", "SRRRSRRR", "SSRRRRSS", "SSSMMSSS"]),
  off: patch(["SSSSSSSS", "SSSSSSSS", "SSSSSSSS", "SSSSSSSS", "SSSSSSSS"]),
};

function patch(rows: string[]): string[] {
  return [BASE[0], BASE[1], BASE[2], ...rows];
}

export type PixTint = { skin: string; skinDark: string; hair: string; shirt: string; shirtDark: string; pants: string; pantsDark: string; shoe: string; line: string; eye: string; pupil: string; mouth: string };
export const PIX_TINT = {
  normal: { skin: "#f1c9a5", skinDark: "#d9a883", hair: "#1f2a44", shirt: "#ff7b1f", shirtDark: "#d95f0e", pants: "#4d5566", pantsDark: "#3b4250", shoe: "#e03a3a", line: "#141414", eye: "#ffffff", pupil: "#2fb86a", mouth: "#7a4a3a" },
  hurt: { skin: "#f0a8a8", skinDark: "#d08888", hair: "#5a1f2a", shirt: "#f07a7a", shirtDark: "#d06060", pants: "#8a5a6a", pantsDark: "#6e4656", shoe: "#c04040", line: "#5e0000", eye: "#ffd9d6", pupil: "#8a2a4a", mouth: "#7a2a2a" },
  dim: { skin: "#a68a72", skinDark: "#8c745e", hair: "#111726", shirt: "#b05614", shirtDark: "#8f4409", pants: "#353a46", pantsDark: "#282c36", shoe: "#8a2424", line: "#141414", eye: "#cfcfcf", pupil: "#238a50", mouth: "#4a2e24" },
  warm: { skin: "#f6d2ac", skinDark: "#dcb08a", hair: "#2a3350", shirt: "#ff8a30", shirtDark: "#e06a18", pants: "#5a6274", pantsDark: "#464c5a", shoe: "#e84848", line: "#141414", eye: "#fff6e6", pupil: "#2fb86a", mouth: "#7a4a3a" },
} as const;

const KEY: Record<string, keyof PixTint | "T" | "D" | "R" | "F"> = { H: "hair", S: "skin", W: "eye", P: "pupil", N: "skinDark", M: "mouth", T: "T", D: "D", R: "R", F: "F" };

export const PixFace: React.FC<{ mood: PixMood; tint: PixTint; x: number; y: number; px: number }> = ({ mood, tint, x, y, px }) => (
  <g transform={`translate(${x} ${y})`}>
    {FACES[mood].map((row, r) =>
      row.split("").map((c, i) => {
        const k = KEY[c];
        const fill = k === "T" ? "#ffffff" : k === "D" ? "#2a1810" : k === "R" ? "#ff4d6d" : k === "F" ? "#e0a07e" : tint[k];
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

export const Pix: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pose: Pose;
  mood: PixMood;
  tint?: PixTint;
  tilt?: number;
  flip?: boolean;
  armsOverHead?: boolean;
  hands?: (hand: { L: Pt; R: Pt }) => React.ReactNode;
  lineWidth?: number;
}> = ({ x, y, scale = 1, pose: p, mood, tint = PIX_TINT.normal, tilt = 0, flip = false, armsOverHead = false, hands, lineWidth = 1 }) => {
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
      <PixFace mood={mood} tint={tint} x={-100} y={-100} px={25} />
      {/* hair overhang, the block's top edge */}
      <rect x={-100} y={-100} width={200} height={50} fill={tint.hair} />
      <Grain x={-100} y={-100} w={200} h={50} px={25} color="#2e3c5e" seed={7} />
      <rect x={-100} y={-100} width={200} height={200} fill="none" stroke={outline} strokeWidth={11 * lineWidth} strokeLinejoin="round" />
      {/* the headset */}
      <path d="M-104,-30 v-50 q0,-40 104,-40 q104,0 104,40 v50" fill="none" stroke={outline} strokeWidth={22} strokeLinecap="round" />
      <path d="M-104,-30 v-50 q0,-40 104,-40 q104,0 104,40 v50" fill="none" stroke="#2b2f3a" strokeWidth={12} strokeLinecap="round" />
      <rect x={-124} y={-40} width={30} height={64} rx={8} fill="#2b2f3a" stroke={outline} strokeWidth={8} />
      <rect x={94} y={-40} width={30} height={64} rx={8} fill="#2b2f3a" stroke={outline} strokeWidth={8} />
      <rect x={-116} y={-28} width={14} height={40} rx={4} fill="#ff7b1f" />
      <rect x={102} y={-28} width={14} height={40} rx={4} fill="#ff7b1f" />
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
      <path d="M-78,-4 q0,-30 78,-30 q78,0 78,30 v22 h-156 z" fill={tint.shirtDark} stroke={outline} strokeWidth={9 * lineWidth} strokeLinejoin="round" />
      <rect x={-64} y={0} width={128} height={110} fill={tint.shirt} stroke={outline} strokeWidth={10 * lineWidth} strokeLinejoin="round" />
      <Grain x={-64} y={0} w={128} h={110} px={16} color={tint.shirtDark} seed={3} />
      <rect x={-44} y={64} width={88} height={34} fill={tint.shirtDark} stroke={outline} strokeWidth={6} />
      <path d="M-14,0 v40 M14,0 v40" fill="none" stroke={tint.shirtDark} strokeWidth={6} strokeLinecap="round" />
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

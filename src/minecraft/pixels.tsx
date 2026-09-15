import React from "react";
import { torch as torchC } from "./palette";

/**
 * Pixel-art props drawn as grids of squares, plus the few blocky things
 * (creeper, torch, dead bush, chest) that are easier as plain shapes.
 */

export const Pixels: React.FC<{
  rows: string[];
  colors: Record<string, string>;
  px: number;
  x?: number;
  y?: number;
  rotate?: number;
  opacity?: number;
}> = ({ rows, colors, px, x = 0, y = 0, rotate = 0, opacity = 1 }) => {
  const w = rows[0].length * px;
  const h = rows.length * px;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) translate(${-w / 2} ${-h / 2})`} opacity={opacity}>
      {rows.map((row, r) =>
        row.split("").map((c, i) =>
          c === "." ? null : (
            <rect key={`${r}-${i}`} x={i * px} y={r * px} width={px + 0.5} height={px + 0.5} fill={colors[c]} />
          )
        )
      )}
    </g>
  );
};

export type ItemName =
  | "cobble"
  | "pickaxe"
  | "goldIngot"
  | "goldApple"
  | "bread"
  | "bucket"
  | "redstone"
  | "ironIngot";

const ITEMS: Record<ItemName, { rows: string[]; colors: Record<string, string> }> = {
  goldApple: {
    rows: [
      "....t....",
      "...tt....",
      "..GgGGG..",
      ".GwgGGGG.",
      ".GwGGGGGd",
      ".GGGGGGdd",
      ".GGGGGddD",
      "..GGGddD.",
      "...dDD...",
    ],
    colors: { t: "#5b3a1a", G: "#f2c62e", g: "#ffe680", w: "#fff8d0", d: "#c1861a", D: "#8a5d10" },
  },
  goldIngot: {
    rows: [
      "....HHHHHHH.",
      "...HGGGGGGHD",
      "..HGGGGGGGDD",
      ".HGGGGGGGDDE",
      ".HGGGGGGDDE.",
      ".DDDDDDDDE..",
      "..EEEEEEE...",
    ],
    colors: { H: "#fff5b0", G: "#f4c93a", D: "#b0821a", E: "#7f5c0e" },
  },
  ironIngot: {
    rows: [
      "....HHHHHHH.",
      "...HGGGGGGHD",
      "..HGGGGGGGDD",
      ".HGGGGGGGDDE",
      ".HGGGGGGDDE.",
      ".DDDDDDDDE..",
      "..EEEEEEE...",
    ],
    colors: { H: "#ffffff", G: "#dcdcdc", D: "#9a9a9a", E: "#6a6a6a" },
  },
  bread: {
    rows: [
      ".......BBBB.",
      ".....BBbbbBB",
      "...BBbbbbbbD",
      "..BbbbbbbDDE",
      ".BbbbbbDDDE.",
      ".BbbbDDDEE..",
      ".DDDDDEE....",
      "..EEEEE.....",
    ],
    colors: { B: "#b5773b", b: "#8c5626", D: "#5c3413", E: "#3b1503" },
  },
  bucket: {
    rows: [
      "..hhhhh..",
      ".h.....h.",
      "WWWWWWWWW",
      "WwwwwwwwW",
      ".SsssssS.",
      ".SsssssS.",
      ".SsssssS.",
      ".SsssssS.",
      ".SsssskS.",
      "..SkkkS..",
      "..kkkkk..",
    ],
    colors: { h: "#8a8a8a", W: "#2f63d6", w: "#4f8bff", S: "#8f8f8f", s: "#d0d0d0", k: "#5a5a5a" },
  },
  redstone: {
    rows: [
      "..RRRRRRR.",
      ".RrRrRrRRd",
      "RRrRRRRrRd",
      "RrRRRrRRRd",
      "RRRRRRRRde",
      "RRrRRrRRde",
      "RRRRRRRdde",
      ".RRRRRddde",
      "..dddddde.",
    ],
    colors: { R: "#d80a0e", r: "#ff4040", d: "#8f0000", e: "#5a0000" },
  },
  cobble: {
    rows: [
      "..GGGGGGG.",
      ".GgGGgGGGD",
      "GGGgGGGgGD",
      "GgGGGGgGGD",
      "GGGgGGGGDD",
      "GGGGgGgGDE",
      "GgGGGGGGDE",
      ".GGGgGGDDE",
      "..DDDDDEE.",
    ],
    colors: { G: "#8c8c8c", g: "#b4b4b4", D: "#5f5f5f", E: "#3f3f3f" },
  },
  pickaxe: {
    rows: [
      ".......SSSSk",
      "......SsssSk",
      ".....SSkkSSk",
      "....Hk...kk.",
      "...HH....k..",
      "..HH........",
      ".HH.........",
      "HH..........",
      "h...........",
    ],
    colors: { S: "#9a9a9a", s: "#c8c8c8", k: "#5c5c5c", H: "#8b6a34", h: "#5c4520" },
  },
};

export const Item: React.FC<{
  name: ItemName;
  x: number;
  y: number;
  px?: number;
  rotate?: number;
  opacity?: number;
}> = ({ name, x, y, px = 11, rotate = 0, opacity = 1 }) => (
  <Pixels rows={ITEMS[name].rows} colors={ITEMS[name].colors} px={px} x={x} y={y} rotate={rotate} opacity={opacity} />
);

export const POPPY = {
  rows: [".RR.RR.", "RrRRRrR", "RRRkRRR", ".RRRRR.", "..RgR..", "...g...", "..Gg...", "...gG..", "...g..."],
  colors: { R: "#d21f2a", r: "#ff5c5c", k: "#1f1f1f", g: "#3f8f3a", G: "#6bbf4a" },
};

export const Poppy: React.FC<{ x: number; y: number; px?: number }> = ({ x, y, px = 12 }) => (
  <Pixels rows={POPPY.rows} colors={POPPY.colors} px={px} x={x} y={y} />
);

/** A cave spider's eyes, glowing in the dark. */
const EYES = {
  rows: ["P.......P", ".R.....R.", "P..RRR..P", "R..PRP..R", "...DRD..."],
  colors: { P: torchC.eye, R: torchC.eyeMid, D: torchC.eyeDark },
};
export const SpiderEyes: React.FC<{ x: number; y: number; px?: number; rotate?: number; opacity?: number }> = ({
  x,
  y,
  px = 22,
  rotate = 0,
  opacity = 1,
}) => <Pixels rows={EYES.rows} colors={EYES.colors} px={px} x={x} y={y} rotate={rotate} opacity={opacity} />;

/** The little figure on the house floor. */
const PLUSH = {
  rows: ["..hhhh..", ".hhhhhh.", ".hffffh.", ".hfkfkfh", "..ffff..", ".RRRRRR.", "fRRRRRRf", ".RRRRRR.", "..gg.gg.", "..gg.gg."],
  colors: { h: "#5a3a22", f: "#e0b48c", k: "#2a1a10", R: "#c0272d", g: "#8a8a8a" },
};
export const Plush: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <Pixels rows={PLUSH.rows} colors={PLUSH.colors} px={6} x={x} y={y} />
);

/** The creeper: green pixel face on a block head, a blocky body below. */
export const Creeper: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* body */}
    <rect x={-58} y={168} width={116} height={140} fill="#454574" stroke="#000" strokeWidth={13} strokeLinejoin="round" />
    <path d="M-58,230 H58 M-58,268 H58 M-20,168 V308 M20,168 V308" fill="none" stroke="#000" strokeWidth={9} />
    <rect x={-62} y={296} width={46} height={26} fill="#2f2f52" stroke="#000" strokeWidth={9} />
    <rect x={16} y={296} width={46} height={26} fill="#2f2f52" stroke="#000" strokeWidth={9} />
    {/* head */}
    <rect x={-96} y={-14} width={192} height={192} fill="#3f8b48" stroke="#000" strokeWidth={13} strokeLinejoin="round" />
    <rect x={-96} y={-14} width={192} height={192} fill="url(#creeperShade)" />
    <path d="M-70,30 h40 v40 h-40 z M30,30 h40 v40 h-40 z M-30,70 h60 v50 h-60 z M-50,110 h20 v40 h-20 z M30,110 h20 v40 h-20 z" fill="#0a1a0c" />
    {/* the arm reaching for you */}
    <path d="M-96,88 L-140,110" fill="none" stroke="#000" strokeWidth={13} strokeLinecap="round" />
  </g>
);

/** A torch: a tilted block of a stick with a bright top. */
export const Torch: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = -12 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <path d="M-42,-160 H22 V150 H-42 Z" fill={torchC.stick} stroke={torchC.edge} strokeWidth={7} strokeLinejoin="round" />
    <path d="M22,-160 L48,-145 V150 L22,150 Z" fill={torchC.stickDark} stroke={torchC.edge} strokeWidth={7} strokeLinejoin="round" />
    <path d="M-42,-160 H22 V-90 H-42 Z" fill={torchC.flame} stroke={torchC.edge} strokeWidth={7} strokeLinejoin="round" />
    <path d="M22,-160 L48,-145 V-78 L22,-90 Z" fill="#f4c672" stroke={torchC.edge} strokeWidth={7} strokeLinejoin="round" />
  </g>
);

/** A dead bush / sapling, blocky, outlined. */
export const DeadBush: React.FC<{ x: number; y: number; scale?: number; fill?: string }> = ({ x, y, scale = 1, fill = "#8fb98c" }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} fill={fill} stroke="#000" strokeWidth={9} strokeLinejoin="round">
    <path d="M-46,0 V-30 H-26 V-100 H-6 V-58 H2 V-118 H22 V-64 H30 V-96 H50 V-30 H62 V0 Z" />
    <path d="M-26,-70 H-6 M22,-64 H30" fill="none" />
  </g>
);

/** A blocky oak seen from above. */
export const TreeTop: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-16} y={40} width={32} height={110} fill="#7f7440" stroke="#000" strokeWidth={6} />
    <path d="M-40,-46 H-8 V-60 H60 V-30 H76 V30 H40 V50 H-30 V30 H-76 V-20 H-40 Z" fill="#7bab5c" stroke="#000" strokeWidth={7} strokeLinejoin="round" />
    <rect x={30} y={14} width={22} height={18} fill="#e6d24a" stroke="#000" strokeWidth={4} />
  </g>
);

/** An open chest sitting on a stone block, with the lid up. */
export const OpenChest: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} stroke="#000" strokeWidth={10} strokeLinejoin="round">
    {/* the block under it */}
    <path d="M0,0 H300 L360,-40 V150 L300,190 H0 Z" fill="#484848" />
    <path d="M300,0 V190 M0,0 L60,-40 H360" fill="none" />
    {/* chest base */}
    <path d="M60,-40 H280 L320,-70 V-10 L280,20 H60 Z" fill="#8a6a3d" />
    <path d="M280,-40 V20 M60,-40 L100,-70 H320" fill="none" />
    {/* lid, open */}
    <path d="M130,-70 H300 L330,-90 V-260 L300,-240 H130 Z" fill="#8a6a3d" />
    <rect x={150} y={-225} width={130} height={135} fill="#16110c" strokeWidth={8} />
    <path d="M300,-240 V-70 M130,-240 L160,-260 H330" fill="none" />
    <rect x={200} y={-282} width={36} height={22} fill="#5c4426" strokeWidth={7} />
    {/* the keyboard-ish slab in front */}
    <path d="M-30,205 H330 L300,235 H-60 Z" fill="#2c2c2c" strokeWidth={8} />
    <path d="M-10,220 H300" fill="none" stroke="#6b6b6b" strokeWidth={4} strokeDasharray="14 10" />
    <rect x={20} y={172} width={60} height={22} fill="#2c2c2c" strokeWidth={7} />
    <rect x={190} y={172} width={60} height={22} fill="#2c2c2c" strokeWidth={7} />
  </g>
);

/** The wall sign: a play button and a hand-lettered channel name. */
export const Sign: React.FC<{ x: number; y: number; text: string; color: string; size?: number }> = ({
  x,
  y,
  text,
  color,
  size = 58,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={-24} width={64} height={46} rx={14} fill="#8e3c3c" />
    <path d="M24,-14 L48,-1 L24,12 Z" fill="#e8e0d8" />
    <text x={84} y={14} fontFamily="ComicRelief, 'Comic Sans MS', cursive" fontSize={size} fill={color} letterSpacing={-1}>
      {text}
    </text>
  </g>
);

/** White explosion puffs. */
export const Puff: React.FC<{ x: number; y: number; r: number; opacity?: number }> = ({ x, y, r, opacity = 1 }) => (
  <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx={r * 0.35} fill="#ffffff" opacity={opacity} />
);

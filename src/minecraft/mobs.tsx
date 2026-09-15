import React from "react";
import { Pixels } from "./pixels";

/** A zombie: blocky, green, arms out front. */
export const Zombie: React.FC<{ x: number; y: number; scale?: number; flash?: boolean; walk?: number; flip?: boolean }> = ({ x, y, scale = 1, flash = false, walk = 0, flip = false }) => {
  const g = flash ? "#e07c7c" : "#4c9a4a";
  const gd = flash ? "#c05a5a" : "#3a7a38";
  const shirt = flash ? "#b06a8a" : "#3f9ab0";
  const pants = flash ? "#8c5a8c" : "#4a3f8a";
  const s = Math.sin(walk);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} stroke="#141414" strokeWidth={9} strokeLinejoin="round">
      <rect x={-40 + s * 10} y={150} width={36} height={80} fill={pants} />
      <rect x={4 - s * 10} y={150} width={36} height={80} fill={pants} />
      <rect x={-44} y={40} width={88} height={116} rx={6} fill={shirt} />
      {/* arms out front */}
      <rect x={-118} y={50} width={80} height={30} rx={6} fill={g} transform="rotate(-8 -78 65)" />
      <rect x={38} y={50} width={80} height={30} rx={6} fill={g} transform="rotate(8 78 65)" />
      <rect x={-50} y={-60} width={100} height={100} rx={8} fill={g} />
      <rect x={-34} y={-30} width={22} height={18} fill="#0f1f0f" stroke="none" />
      <rect x={12} y={-30} width={22} height={18} fill="#0f1f0f" stroke="none" />
      <rect x={-18} y={4} width={36} height={12} fill={gd} stroke="none" />
    </g>
  );
};

/** iron sword, pixel art, blade up-right */
export const Sword: React.FC<{ x: number; y: number; px?: number; rotate?: number; opacity?: number }> = ({ x, y, px = 9, rotate = 0, opacity = 1 }) => (
  <Pixels
    rows={[
      ".......SS.",
      "......SsS.",
      ".....SsS..",
      "....SsS...",
      "...SsS....",
      "HH.SS.....",
      ".HHS......",
      "..HH......",
      ".H.HH.....",
      "H.........",
    ]}
    colors={{ S: "#c9c9c9", s: "#f2f2f2", H: "#6b4a2a" }}
    px={px}
    x={x}
    y={y}
    rotate={rotate}
    opacity={opacity}
  />
);

/** a floating Minecraft-style name tag */
export const Tag: React.FC<{ x: number; y: number; text: string; tilt?: number; size?: number }> = ({ x, y, text, tilt = -4, size = 44 }) => {
  const w = text.length * size * 0.72 + 40;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <rect x={-w / 2} y={-size * 0.8} width={w} height={size * 1.5} fill="#2a3446" opacity={0.85} />
      <text x={0} y={size * 0.32} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={size} fill="#e9eef5">
        {text}
      </text>
    </g>
  );
};

/** a cow, side on */
export const Cow: React.FC<{ x: number; y: number; scale?: number; flash?: boolean; walk?: number }> = ({ x, y, scale = 1, flash = false, walk = 0 }) => {
  const b = flash ? "#e08a8a" : "#5b3f2e";
  const w = flash ? "#f0c0c0" : "#f2ece2";
  const s = Math.sin(walk) * 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="#141414" strokeWidth={9} strokeLinejoin="round">
      <rect x={-90 + s} y={40} width={28} height={70} fill={b} />
      <rect x={-50 - s} y={40} width={28} height={70} fill={b} />
      <rect x={30 + s} y={40} width={28} height={70} fill={b} />
      <rect x={70 - s} y={40} width={28} height={70} fill={b} />
      <rect x={-100} y={-50} width={200} height={100} rx={8} fill={b} />
      <path d="M-70,-40 h50 v40 h-50 z M20,-10 h60 v40 h-60 z" fill={w} stroke="none" />
      <rect x={70} y={-90} width={70} height={70} rx={6} fill={b} />
      <rect x={86} y={-46} width={54} height={22} fill="#e9d8c8" stroke="none" />
      <rect x={82} y={-78} width={12} height={12} fill="#141414" stroke="none" />
      <rect x={120} y={-78} width={12} height={12} fill="#141414" stroke="none" />
      <path d="M70,-96 l-14,-16 M140,-96 l14,-16" fill="none" strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};

/** a chicken */
export const Chicken: React.FC<{ x: number; y: number; scale?: number; flash?: boolean; walk?: number }> = ({ x, y, scale = 1, flash = false, walk = 0 }) => {
  const w = flash ? "#f0c0c0" : "#f7f4ee";
  const s = Math.sin(walk) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="#141414" strokeWidth={8} strokeLinejoin="round">
      <path d={`M-18,30 l${-4 + s},34 M18,30 l${4 - s},34`} fill="none" stroke="#e0a030" strokeWidth={9} />
      <rect x={-46} y={-20} width={92} height={60} rx={10} fill={w} />
      <rect x={16} y={-70} width={50} height={56} rx={8} fill={w} />
      <rect x={60} y={-50} width={26} height={14} fill="#e0a030" stroke="none" />
      <rect x={52} y={-36} width={16} height={14} fill="#c0272d" stroke="none" />
      <rect x={30} y={-58} width={10} height={10} fill="#141414" stroke="none" />
      <path d="M-46,-10 l-20,-14 M-46,10 l-20,14" fill="none" strokeWidth={7} strokeLinecap="round" />
    </g>
  );
};

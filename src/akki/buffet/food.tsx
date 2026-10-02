import React from "react";
import { INK } from "../common";
import { Part, smooth, tube } from "../bowling/characters";
import { P } from "./fx";

/**
 * The buffet food, drawn as cute cel props. Each sits on its own baseline
 * (0,0) and rises up (negative y); `s` scales it and `lw` is the outline in
 * screen pixels, so outlines stay the same weight whatever the size.
 */

type FoodProps = { x?: number; y?: number; s?: number; rot?: number; lw?: number };
const T = (x = 0, y = 0, s = 1, rot = 0) => `translate(${x},${y}) rotate(${rot}) scale(${s})`;

export const Drumstick: React.FC<FoodProps> = ({ x, y, s = 1, rot = 0, lw = 4 }) => {
  const L = lw / s;
  return (
    <g transform={T(x, y, s, rot)}>
      {/* the bone */}
      <Part d={tube([[-8, -20], [-34, 2]], [8, 7])} fill="#f6f1e4" shade="#cfc6ae" lw={L} />
      <Part d="M-44,-4a9,9 0 1 0 12,12a9,9 0 1 0 -12,-12Z M-30,10a9,9 0 1 0 10,6a9,9 0 1 0 -10,-6Z" fill="#f6f1e4" shade="#cfc6ae" lw={L} />
      {/* the meat */}
      <Part d={smooth([[-14, -26], [-6, -70], [24, -96], [58, -92], [76, -62], [66, -26], [34, -8], [4, -8]])} fill="#c5611f" shade="#8f3f10" lw={L} sh={[-7, -6]}>
        <path d="M18,-74 Q40,-86 58,-72" stroke="#ffcf7a" strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M2,-30 Q24,-20 54,-34" stroke="#8f3f10" strokeWidth={4} fill="none" strokeLinecap="round" />
      </Part>
    </g>
  );
};

export const RiceMound: React.FC<FoodProps> = ({ x, y, s = 1, rot = 0, lw = 4 }) => {
  const L = lw / s;
  return (
    <g transform={T(x, y, s, rot)}>
      <Part d={smooth([[-62, 0], [-54, -34], [-30, -74], [0, -96], [30, -74], [54, -34], [62, 0], [0, 8]])} fill="#fffdf6" shade="#d9d4c4" lw={L} sh={[-8, -4]}>
        {[[-30, -30], [-10, -52], [14, -34], [34, -14], [-40, -8], [6, -12], [-18, -18]].map(([a, b], i) => <path key={i} d={`M${a},${b} l9,-4`} stroke="#cfc8b4" strokeWidth={3.4} strokeLinecap="round" />)}
      </Part>
      <path d="M0,-92 L0,-140" stroke={INK} strokeWidth={L * 1.2} strokeLinecap="round" />
      <Part d="M0,-140 L38,-126 L0,-112Z" fill="#e0262e" shade="#9e1420" lw={L * 0.8} />
    </g>
  );
};

export const NoodleBowl: React.FC<FoodProps> = ({ x, y, s = 1, rot = 0, lw = 4 }) => {
  const L = lw / s;
  return (
    <g transform={T(x, y, s, rot)}>
      <Part d={smooth([[-52, -34], [-36, -62], [0, -70], [36, -62], [52, -34], [42, -66], [0, -82], [-42, -66]])} fill="#f8c24a" shade="#d99a20" lw={L} />
      {[-40, -20, 0, 20, 38].map((a, i) => <path key={i} d={`M${a},-70 q${i % 2 ? -12 : 12},-16 0,-30 q${i % 2 ? 12 : -12},-14 4,-26`} stroke="#d99a20" strokeWidth={9} fill="none" strokeLinecap="round" />)}
      {[-40, -20, 0, 20, 38].map((a, i) => <path key={`n${i}`} d={`M${a},-70 q${i % 2 ? -12 : 12},-16 0,-30 q${i % 2 ? 12 : -12},-14 4,-26`} stroke="#fbd870" strokeWidth={5} fill="none" strokeLinecap="round" />)}
      <circle cx={20} cy={-76} r={13} fill="#fff" stroke={INK} strokeWidth={L} />
      <path d="M20,-76 m-5,0 a5,5 0 1 1 5,5" stroke="#ee6a8a" strokeWidth={4} fill="none" />
      <Part d={smooth([[-64, -44], [64, -44], [54, -14], [28, 0], [-28, 0], [-54, -14]])} fill="#d8262c" shade="#9e1420" lw={L}>
        <path d="M-62,-36 L62,-36" stroke="#fff" strokeWidth={5} />
        <path d="M-40,-22 q10,-8 20,0 q10,8 20,0 q10,-8 20,0 q10,8 20,0" stroke="#fff" strokeWidth={3.4} fill="none" />
      </Part>
    </g>
  );
};

export const SoupPot: React.FC<FoodProps> = ({ x, y, s = 1, rot = 0, lw = 4 }) => {
  const L = lw / s;
  return (
    <g transform={T(x, y, s, rot)}>
      <Part d={tube([[-62, -40], [-80, -52]], [5, 5])} fill="#8a92a4" lw={L} />
      <Part d={tube([[62, -40], [80, -52]], [5, 5])} fill="#8a92a4" lw={L} />
      <Part d={smooth([[-58, -78], [58, -78], [62, -8], [40, 2], [-40, 2], [-62, -8]], true, 0.4)} fill="#c9cfda" shade="#8a92a4" lw={L} sh={[-7, -4]}>
        <path d="M-44,-66 L-48,-20" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
      </Part>
      <Part d="M-58,-80a58,14 0 1 0 116,0a58,14 0 1 0 -116,0Z" fill="#d4742a" shade="#a8501a" lw={L} sh={[-3, -3]}>
        <circle cx={-24} cy={-80} r={7} fill="#6aa83a" />
        <circle cx={18} cy={-84} r={6} fill="#6aa83a" />
        <circle cx={34} cy={-76} r={5} fill="#f8e07a" />
        <circle cx={-4} cy={-76} r={5} fill="#f8e07a" />
      </Part>
    </g>
  );
};

export const Nigiri: React.FC<FoodProps> = ({ x, y, s = 1, rot = 0, lw = 4 }) => {
  const L = lw / s;
  const piece = (px: number, fish: string, fishS: string, key: number) => (
    <g key={key} transform={`translate(${px},0)`}>
      <Part d={smooth([[-26, 0], [-28, -22], [-14, -32], [14, -32], [28, -22], [26, 0], [0, 6]])} fill="#fffdf6" shade="#d9d4c4" lw={L} />
      <Part d={smooth([[-34, -26], [-28, -46], [0, -54], [28, -46], [34, -26], [0, -20]])} fill={fish} shade={fishS} lw={L}>
        <path d="M-20,-44 q8,6 4,16 M0,-48 q8,6 4,18 M18,-44 q8,6 4,14" stroke="#fff" strokeWidth={3.4} fill="none" opacity={0.85} strokeLinecap="round" />
      </Part>
    </g>
  );
  return (
    <g transform={T(x, y, s, rot)}>
      {piece(-34, "#f2753a", "#c8501a", 0)}
      {piece(34, "#f08a9a", "#c85a70", 1)}
      <g transform="translate(0,-26)">{piece(0, "#f2753a", "#c8501a", 2)}</g>
    </g>
  );
};

export const Cake: React.FC<FoodProps> = ({ x, y, s = 1, rot = 0, lw = 4 }) => {
  const L = lw / s;
  return (
    <g transform={T(x, y, s, rot)}>
      <Part d={smooth([[-56, 0], [-58, -34], [58, -34], [56, 0], [0, 6]], true, 0.4)} fill="#f58ab0" shade="#c85a86" lw={L} />
      <Part d={smooth([[-56, -34], [-54, -42], [54, -42], [56, -34]], true, 0.3)} fill="#fffdf6" shade="#d9d4c4" lw={L} />
      <Part d={smooth([[-48, -42], [-50, -76], [50, -76], [48, -42]], true, 0.4)} fill="#f58ab0" shade="#c85a86" lw={L} />
      <Part d={`M-52,-78 Q-30,-96 0,-94 Q30,-96 52,-78 Q44,-60 36,-76 Q30,-52 20,-76 Q10,-62 0,-78 Q-12,-56 -20,-78 Q-30,-60 -38,-76 Q-46,-62 -52,-78Z`} fill="#fffdf6" shade="#d9d4c4" lw={L} />
      <circle cx={0} cy={-102} r={11} fill="#e0262e" stroke={INK} strokeWidth={L} />
      <path d="M0,-112 q6,-12 14,-14" stroke={INK} strokeWidth={L} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Olive: React.FC<FoodProps> = ({ x, y, s = 1, rot = 0, lw = 4 }) => {
  const L = lw / s;
  return (
    <g transform={T(x, y, s, rot)}>
      <Part d="M-16,-14a16,14 0 1 0 32,0a16,14 0 1 0 -32,0Z" fill="#7aa83a" shade="#4f7a22" lw={L} sh={[-3, -3]}>
        <circle cx={5} cy={-14} r={5.5} fill="#e0262e" />
      </Part>
      <path d="M-9,-22 q4,-5 10,-5" stroke="#d4ec9a" strokeWidth={3.4} fill="none" strokeLinecap="round" />
    </g>
  );
};

export type FoodKind = "meat" | "rice" | "noodles" | "soup" | "sushi" | "cake";
export const KINDS: FoodKind[] = ["meat", "rice", "noodles", "soup", "sushi", "cake"];

/** one tray's worth of a food, base at (0,0), about 120 wide */
export const Food: React.FC<{ kind: FoodKind; x?: number; y?: number; s?: number; lw?: number }> = ({ kind, x = 0, y = 0, s = 1, lw = 4 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {kind === "meat" && (
      <>
        <Drumstick x={-6} y={0} s={0.74} rot={-14} lw={lw / s} />
        <Drumstick x={34} y={4} s={0.8} rot={8} lw={lw / s} />
        <Drumstick x={8} y={-16} s={0.78} rot={-2} lw={lw / s} />
      </>
    )}
    {kind === "rice" && <RiceMound s={0.95} lw={lw / s} />}
    {kind === "noodles" && <NoodleBowl s={0.95} lw={lw / s} />}
    {kind === "soup" && <SoupPot s={0.95} lw={lw / s} />}
    {kind === "sushi" && <Nigiri s={0.82} lw={lw / s} />}
    {kind === "cake" && <Cake s={0.95} lw={lw / s} />}
  </g>
);

export type { P };

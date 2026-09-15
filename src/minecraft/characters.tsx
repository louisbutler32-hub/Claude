import React from "react";
import { AbsoluteFill } from "remotion";
import { loadMinecraftFonts } from "./fonts";

/**
 * Character concepts for the Minecraft Shorts — five different directions,
 * each drawn with the same four faces so they can be compared like for
 * like. Whichever is picked gets the full rig (poses, walk cycle, tints).
 */

export type Mood = "plain" | "happy" | "worried" | "scream" | "sly";

type CharProps = { x: number; y: number; scale?: number; mood: Mood; walk?: boolean };

const LINE = "#141414";
const st = { stroke: LINE, strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

/** eyes with whites, used by the cat, egg and duck */
const RoundEyes: React.FC<{ mood: Mood; cx?: number; cy?: number; r?: number }> = ({ mood, cx = 34, cy = -10, r = 22 }) => {
  if (mood === "happy")
    return <path d={`M${-cx - 20},${cy} q20,-26 40,0 M${cx - 20},${cy} q20,-26 40,0`} {...st} strokeWidth={10} />;
  const ry = mood === "scream" ? r * 0.55 : mood === "worried" ? r * 1.2 : r;
  const lid = mood === "sly";
  return (
    <>
      {[-cx, cx].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={cy} rx={r} ry={ry} fill="#fff" stroke={LINE} strokeWidth={8} />
          <circle cx={x + (lid ? 8 : 3)} cy={cy + (mood === "worried" ? 4 : 2)} r={r * 0.45} fill={LINE} />
          {lid && <path d={`M${x - r},${cy - 4} h${r * 2}`} {...st} strokeWidth={8} />}
          {lid && <rect x={x - r - 4} y={cy - ry - 6} width={r * 2 + 8} height={ry + 2} fill="inherit" opacity={0} />}
        </g>
      ))}
      {mood === "worried" && <path d={`M${-cx - 20},${cy - 44} l40,12 M${cx + 20},${cy - 44} l-40,12`} {...st} />}
      {mood === "sly" && <path d={`M${-cx - 22},${cy - 40} l44,-10 M${cx + 22},${cy - 40} l-44,-10`} {...st} />}
    </>
  );
};

const Mouth: React.FC<{ mood: Mood; y?: number }> = ({ mood, y = 40 }) => {
  switch (mood) {
    case "happy":
      return (
        <>
          <path d={`M-40,${y - 6} q40,56 80,0 z`} fill={LINE} />
          <path d={`M-32,${y - 4} h64 v9 q-32,12 -64,0 z`} fill="#fff" />
        </>
      );
    case "worried":
      return <path d={`M-28,${y + 6} q14,-14 28,0 q14,14 28,0`} {...st} />;
    case "scream":
      return <path d={`M-34,${y - 14} h68 q6,0 6,8 v30 q0,24 -40,24 q-40,0 -40,-24 v-30 q0,-8 6,-8 z`} {...st} fill="#fff" />;
    case "sly":
      return <path d={`M-22,${y} q26,14 50,-10`} {...st} />;
    default:
      return <path d={`M-20,${y} h40`} {...st} />;
  }
};

const Legs: React.FC<{ walk?: boolean; hip?: number; len?: number; shoe?: string }> = ({ walk, hip = 60, len = 90, shoe = LINE }) => {
  const s = walk ? 34 : 0;
  return (
    <g>
      <path d={`M-30,${hip} L${-30 - s},${hip + len}`} {...st} strokeWidth={20} />
      <path d={`M30,${hip} L${30 + s},${hip + len}`} {...st} strokeWidth={20} />
      <ellipse cx={-38 - s} cy={hip + len} rx={26} ry={12} fill={shoe} />
      <ellipse cx={38 + s} cy={hip + len} rx={26} ry={12} fill={shoe} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 1. Volt — a little robot whose face is a pixel screen               */
/* ------------------------------------------------------------------ */

const SCREEN: Record<Mood, string[]> = {
  plain: [".........", ".XX...XX.", ".XX...XX.", ".........", "..XXXXX..", "........."],
  happy: [".........", "X..X.X..X", ".XX...XX.", ".........", "X.......X", ".XXXXXXX."],
  worried: ["..X...X..", ".XX...XX.", ".XX...XX.", ".........", "..XX.XX..", ".X..X..X."],
  scream: [".XX...XX.", ".XX...XX.", ".........", "...XXX...", "..X...X..", "...XXX..."],
  sly: [".........", "XXX...XXX", ".XX...XX.", ".........", "...XXXX..", "......X.."],
};

export const Volt: React.FC<CharProps> = ({ x, y, scale = 1, mood, walk }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <Legs walk={walk} hip={70} len={70} shoe="#4d5a63" />
    {/* body */}
    <rect x={-58} y={-8} width={116} height={92} rx={14} fill="#cfd8dd" stroke={LINE} strokeWidth={10} />
    <circle cx={0} cy={38} r={12} fill="#ff5a5a" stroke={LINE} strokeWidth={6} />
    <path d="M-58,20 l-40,30 M58,20 l40,30" {...st} strokeWidth={18} />
    <path d="M-98,50 l-14,-10 M-98,50 l-12,14 M98,50 l14,-10 M98,50 l12,14" {...st} strokeWidth={10} />
    {/* head */}
    <rect x={-92} y={-176} width={184} height={160} rx={26} fill="#8fd3e6" stroke={LINE} strokeWidth={11} />
    <rect x={-72} y={-158} width={144} height={110} rx={12} fill="#101820" stroke={LINE} strokeWidth={6} />
    <g transform="translate(-63 -150)">
      {SCREEN[mood].map((row, r) =>
        row.split("").map((c, i) =>
          c === "X" ? <rect key={`${r}${i}`} x={i * 14} y={r * 14} width={13} height={13} fill="#5cff8a" /> : null
        )
      )}
    </g>
    <path d="M0,-176 v-30" {...st} strokeWidth={10} />
    <circle cx={0} cy={-216} r={13} fill="#ff5a5a" stroke={LINE} strokeWidth={6} />
    <rect x={-102} y={-120} width={16} height={40} rx={5} fill="#4d5a63" stroke={LINE} strokeWidth={6} />
    <rect x={86} y={-120} width={16} height={40} rx={5} fill="#4d5a63" stroke={LINE} strokeWidth={6} />
  </g>
);

/* ------------------------------------------------------------------ */
/* 2. Boo — a sheet ghost in a headband; floats, so no legs to animate */
/* ------------------------------------------------------------------ */

export const Boo: React.FC<CharProps> = ({ x, y, scale = 1, mood, walk }) => (
  <g transform={`translate(${x} ${y - (walk ? 20 : 0)}) scale(${scale})`}>
    <ellipse cx={0} cy={150} rx={70} ry={14} fill="#000" opacity={0.18} />
    <path d="M-100,-40 Q-100,-170 0,-170 Q100,-170 100,-40 L100,90 Q75,60 50,95 Q25,60 0,95 Q-25,60 -50,95 Q-75,60 -100,90 Z" fill="#f7f7fb" stroke={LINE} strokeWidth={11} strokeLinejoin="round" />
    {/* headband */}
    <path d="M-102,-110 Q0,-80 102,-110 L102,-84 Q0,-54 -102,-84 Z" fill="#ff4d5a" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
    <path d="M96,-96 l48,-30 l-6,40 l-10,-14 l-22,26" fill="#ff4d5a" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
    {/* nub arms */}
    <path d={`M-100,0 q-40,${walk ? -40 : 20} -60,40`} {...st} strokeWidth={22} />
    <path d={`M100,0 q40,${walk ? -40 : 20} 60,40`} {...st} strokeWidth={22} />
    <g transform="translate(0 -20)">
      <RoundEyes mood={mood} cx={38} cy={-10} r={22} />
      <Mouth mood={mood} y={44} />
    </g>
    <circle cx={-72} cy={26} r={8} fill="#ffb3b8" />
    <circle cx={72} cy={26} r={8} fill="#ffb3b8" />
  </g>
);

/* ------------------------------------------------------------------ */
/* 3. Mochi — a cat in a hoodie                                         */
/* ------------------------------------------------------------------ */

export const Mochi: React.FC<CharProps> = ({ x, y, scale = 1, mood, walk }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <Legs walk={walk} hip={80} len={80} shoe="#ffffff" />
    {/* hoodie body */}
    <path d="M-74,-10 Q-84,50 -70,96 L70,96 Q84,50 74,-10 Z" fill="#ff7b54" stroke={LINE} strokeWidth={10} strokeLinejoin="round" />
    <path d="M-20,-10 v40 M20,-10 v40" {...st} strokeWidth={7} />
    <path d="M-74,10 l-40,50 M74,10 l40,50" {...st} strokeWidth={18} />
    <circle cx={-118} cy={64} r={13} fill={LINE} />
    <circle cx={118} cy={64} r={13} fill={LINE} />
    {/* hood + head */}
    <path d="M-104,-60 Q-104,-190 0,-190 Q104,-190 104,-60 Q104,10 0,10 Q-104,10 -104,-60 Z" fill="#ff7b54" stroke={LINE} strokeWidth={10} />
    <path d="M-90,-130 l-14,-60 l60,26 M90,-130 l14,-60 l-60,26" fill="#ff7b54" stroke={LINE} strokeWidth={10} strokeLinejoin="round" />
    <path d="M-84,-56 Q-84,-158 0,-158 Q84,-158 84,-56 Q84,0 0,0 Q-84,0 -84,-56 Z" fill="#fff1e0" stroke={LINE} strokeWidth={8} />
    <g transform="translate(0 -70)">
      <RoundEyes mood={mood} cx={34} cy={-6} r={20} />
      <path d="M-8,30 l8,8 l8,-8 z" fill="#ff9db0" stroke={LINE} strokeWidth={4} />
      <g transform="translate(0 12)">
        {mood === "plain" ? <path d="M-14,36 q7,8 14,0 q7,8 14,0" {...st} strokeWidth={7} /> : <Mouth mood={mood} y={36} />}
      </g>
    </g>
    <path d="M-100,-56 l-40,-8 M-100,-42 l-40,6 M100,-56 l40,-8 M100,-42 l40,6" {...st} strokeWidth={5} />
  </g>
);

/* ------------------------------------------------------------------ */
/* 4. Yolk — a cracked egg on skinny legs                              */
/* ------------------------------------------------------------------ */

export const Yolk: React.FC<CharProps> = ({ x, y, scale = 1, mood, walk }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <Legs walk={walk} hip={70} len={90} shoe="#ff4d5a" />
    <path d="M-88,-20 Q-88,-176 0,-176 Q88,-176 88,-20 Q88,84 0,84 Q-88,84 -88,-20 Z" fill="#fff6e2" stroke={LINE} strokeWidth={11} />
    {/* the crack */}
    <path d="M-84,-60 l22,-14 l14,22 l20,-26 l18,18 l22,-24 l18,14 l16,-18" {...st} strokeWidth={8} />
    <path d="M-84,-60 l22,-14 l14,22 l20,-26 l18,18 l22,-24 l18,14 l16,-18 Q88,-140 0,-176 Q-88,-176 -84,-60 Z" fill="#ffd34d" stroke="none" opacity={0.9} />
    <path d="M-84,-60 l22,-14 l14,22 l20,-26 l18,18 l22,-24 l18,14 l16,-18" {...st} strokeWidth={8} />
    <path d="M-88,-20 l-40,40 M88,-20 l40,40" {...st} strokeWidth={18} />
    <circle cx={-128} cy={20} r={13} fill={LINE} />
    <circle cx={128} cy={20} r={13} fill={LINE} />
    <g transform="translate(0 -10)">
      <RoundEyes mood={mood} cx={34} cy={-10} r={22} />
      <Mouth mood={mood} y={44} />
    </g>
    <circle cx={-64} cy={30} r={8} fill="#ffb3b8" />
    <circle cx={64} cy={30} r={8} fill="#ffb3b8" />
  </g>
);

/* ------------------------------------------------------------------ */
/* 5. Quack — a duck in a backwards cap                                */
/* ------------------------------------------------------------------ */

export const Quack: React.FC<CharProps> = ({ x, y, scale = 1, mood, walk }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <Legs walk={walk} hip={70} len={60} shoe="#ff9a1f" />
    <ellipse cx={0} cy={20} rx={92} ry={78} fill="#ffd93b" stroke={LINE} strokeWidth={11} />
    {/* wings */}
    <path d={`M-90,10 q-50,${walk ? -60 : 20} -40,70 q30,-20 50,-30`} fill="#ffd93b" stroke={LINE} strokeWidth={9} strokeLinejoin="round" />
    <path d={`M90,10 q50,${walk ? -60 : 20} 40,70 q-30,-20 -50,-30`} fill="#ffd93b" stroke={LINE} strokeWidth={9} strokeLinejoin="round" />
    {/* head */}
    <circle cx={0} cy={-90} r={84} fill="#ffd93b" stroke={LINE} strokeWidth={11} />
    {/* cap, backwards */}
    <path d="M-86,-120 Q-70,-190 0,-190 Q70,-190 86,-120 Z" fill="#2f6df6" stroke={LINE} strokeWidth={9} strokeLinejoin="round" />
    <path d="M-88,-120 h176 v18 h-176 z" fill="#2f6df6" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
    <path d="M60,-104 l60,-2 l-4,22 l-52,-6 z" fill="#2f6df6" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
    <g transform="translate(0 -84)">
      <RoundEyes mood={mood} cx={34} cy={-6} r={20} />
    </g>
    {/* beak carries the mouth */}
    <g transform="translate(0 -46)">
      {mood === "scream" ? (
        <>
          <path d="M-42,-8 h84 l-14,22 h-56 z" fill="#ff9a1f" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
          <path d="M-36,14 h72 q0,34 -36,34 q-36,0 -36,-34 z" fill="#c23b2e" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
        </>
      ) : mood === "happy" ? (
        <path d="M-46,-4 h92 q-10,30 -46,30 q-36,0 -46,-30 z" fill="#ff9a1f" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
      ) : (
        <>
          <path d="M-44,-6 h88 l-10,16 h-68 z" fill="#ff9a1f" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
          <path d={mood === "worried" ? "M-34,10 q17,-10 34,0 q17,10 34,0" : "M-34,10 h68"} {...st} strokeWidth={7} />
        </>
      )}
    </g>
  </g>
);

/* ------------------------------------------------------------------ */

const OPTIONS: { name: string; blurb: string; C: React.FC<CharProps>; scale: number }[] = [
  { name: "Volt", blurb: "a small robot — its face is a pixel screen, so every expression is Minecraft-shaped", C: Volt, scale: 0.72 },
  { name: "Boo", blurb: "a sheet ghost in a headband — floats, so it never needs a walk cycle", C: Boo, scale: 0.72 },
  { name: "Mochi", blurb: "a cat in a hoodie — the internet's favourite animal, ears and tail do the acting", C: Mochi, scale: 0.68 },
  { name: "Yolk", blurb: "a cracked egg on skinny legs — fragile in a world that keeps exploding", C: Yolk, scale: 0.7 },
  { name: "Quack", blurb: "a duck in a backwards cap — loud, cocky, and the beak is the mouth", C: Quack, scale: 0.68 },
];
const MOODS: Mood[] = ["plain", "happy", "worried", "scream", "sly"];

export const CharacterOptions: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#f4efe6" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <text x={50} y={64} fontFamily="Selawik, sans-serif" fontSize={44} fill="#222">
          Character concepts — pick one
        </text>
        {OPTIONS.map(({ name, blurb, C, scale }, r) => {
          const cy = 178 + r * 192;
          return (
            <g key={name}>
              <text x={50} y={cy - 40} fontFamily="Selawik, sans-serif" fontSize={40} fill="#222">
                {r + 1}. {name}
              </text>
              <foreignObject x={50} y={cy - 24} width={330} height={150}>
                <div style={{ fontFamily: "Selawik, sans-serif", fontSize: 24, color: "#555", lineHeight: "30px" }}>{blurb}</div>
              </foreignObject>
              {MOODS.map((m, i) => (
                <C key={m} x={520 + i * 210} y={cy + 40} scale={scale} mood={m} />
              ))}
              <C x={1660} y={cy + 40} scale={scale} mood="happy" walk />
              {r === 0 &&
                [...MOODS, "walk"].map((m, i) => (
                  <text key={m} x={520 + i * 210 + (i === 5 ? 90 : 0)} y={100} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={24} fill="#777">
                    {m}
                  </text>
                ))}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

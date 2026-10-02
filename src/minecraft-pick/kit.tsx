import React from "react";
import { random } from "remotion";

/**
 * The cast and the set for "Wooden Pickaxe", drawn to the reference's look:
 * a stick-figure player (big white head with a thick black outline, a tiny
 * dot-eyed face, a plain orange torso, thick black limbs), and the neglected
 * old gear as characters with the same minimal faces. Everything is flat,
 * thick-lined and readable at a glance; the background is blurred behind them.
 */

export type Pt = [number, number];
export const LINE = "#000000";
export const ORANGE = "#fe9d48";
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const sm = (f: number, a: number, b: number) => {
  const t = clamp01((f - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ------------------------------ the player ------------------------------ */

export type ManFace = "plain" | "smile" | "grin" | "worried" | "shock" | "sad" | "cheer" | "smug";

/** head radius is 100 in local units; (0,0) is the head's centre */
export type ManPose = {
  /** hand targets, local; the elbows are solved so the arm bends naturally */
  L: Pt;
  R: Pt;
  legL: [Pt, Pt];
  legR: [Pt, Pt];
  lean?: number;
};

export const MAN = {
  stand: { L: [-95, 330], R: [95, 330], legL: [[-40, 400], [-48, 520]], legR: [[40, 400], [48, 520]] } as ManPose,
  point: { L: [-95, 330], R: [150, 380], legL: [[-40, 400], [-48, 520]], legR: [[40, 400], [48, 520]] } as ManPose,
  reach: { L: [-95, 330], R: [330, 190], legL: [[-40, 400], [-48, 520]], legR: [[40, 400], [48, 520]] } as ManPose,
  cheer: { L: [-150, -90], R: [150, -90], legL: [[-60, 400], [-80, 520]], legR: [[60, 400], [80, 520]] } as ManPose,
  hold: { L: [-60, 270], R: [80, 250], legL: [[-40, 400], [-48, 520]], legR: [[40, 400], [48, 520]] } as ManPose,
  droop: { L: [-80, 360], R: [80, 360], legL: [[-40, 400], [-48, 520]], legR: [[40, 400], [48, 520]] } as ManPose,
};

const solveArm = (shoulder: Pt, hand: Pt, len = 135): Pt => {
  const dx = hand[0] - shoulder[0], dy = hand[1] - shoulder[1];
  const d = Math.min(Math.hypot(dx, dy), len * 2 - 1);
  const mx = shoulder[0] + dx / 2, my = shoulder[1] + dy / 2;
  const h = Math.sqrt(Math.max(0, len * len - (d / 2) ** 2));
  // bend the elbow downward: of the two solutions take the lower one
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const e1: Pt = [mx + nx * h, my + ny * h], e2: Pt = [mx - nx * h, my - ny * h];
  return e1[1] >= e2[1] ? e1 : e2;
};

const ManFaceDraw: React.FC<{ kind: ManFace; gaze: Pt; blink?: boolean }> = ({ kind, gaze, blink }) => {
  const st = { stroke: LINE, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const eye = (x: number, ry = 11) => (blink ? <path d={`M${x - 8},-10 h16`} {...st} /> : <ellipse cx={x} cy={-10} rx={8} ry={ry} fill={LINE} />);
  return (
    <g transform={`translate(${gaze[0]} ${gaze[1]})`}>
      {kind === "shock" ? (
        <>
          <ellipse cx={-17} cy={-12} rx={13} ry={16} fill="#fff" stroke={LINE} strokeWidth={6} />
          <ellipse cx={17} cy={-12} rx={13} ry={16} fill="#fff" stroke={LINE} strokeWidth={6} />
          <circle cx={-17} cy={-12} r={5} fill={LINE} /><circle cx={17} cy={-12} r={5} fill={LINE} />
          <ellipse cx={0} cy={38} rx={13} ry={18} fill="#222" stroke={LINE} strokeWidth={6} />
        </>
      ) : kind === "cheer" ? (
        <>
          <path d="M-30,-8 q13,-20 26,0 M4,-8 q13,-20 26,0" {...st} />
          <path d="M-34,22 q34,50 68,0 z" fill="#3a1010" stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
        </>
      ) : (
        <>
          {eye(-14)}{eye(14)}
          {kind === "worried" && <path d="M-30,-34 l22,-8 M30,-34 l-22,-8" {...st} />}
          {kind === "sad" && <><path d="M-30,-36 l22,8 M30,-36 l-22,8" {...st} /><path d="M-22,44 q22,-22 44,0" {...st} /></>}
          {kind === "plain" && <path d="M-18,32 h36" {...st} />}
          {kind === "smile" && <path d="M-26,26 q26,26 52,0" {...st} />}
          {kind === "grin" && <path d="M-30,22 q30,40 60,0 z" fill="#fff" stroke={LINE} strokeWidth={6} strokeLinejoin="round" />}
          {kind === "smug" && <><path d="M-26,-26 h22 M4,-26 h22" {...st} /><path d="M-24,32 q26,14 52,-8" {...st} /></>}
          {kind === "worried" && <path d="M-24,40 q12,-12 24,0 q12,12 24,0" {...st} />}
        </>
      )}
    </g>
  );
};

/** the stick-figure player: head centre at (x, y), scale s (head radius = 100 s) */
export const Man: React.FC<{ x: number; y: number; s?: number; pose?: ManPose; face?: ManFace; gaze?: Pt; blink?: boolean; flip?: boolean; shirt?: string; hold?: (hands: { L: Pt; R: Pt }) => React.ReactNode; legs?: boolean; armLen?: number }> = ({
  x, y, s = 1, pose = MAN.stand, face = "plain", gaze = [0, 0], blink = false, flip = false, shirt = ORANGE, hold, legs = true, armLen = 135,
}) => {
  const SL: Pt = [-58, 128], SR: Pt = [58, 128];
  const eL = solveArm(SL, pose.L, armLen), eR = solveArm(SR, pose.R, armLen);
  const limb = (pts: Pt[]) => {
    const d = pts.map((p) => p.join(",")).join(" ");
    return <polyline points={d} fill="none" stroke={LINE} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      {legs && <>{limb([[-38, 300], ...pose.legL])}{limb([[38, 300], ...pose.legR])}</>}
      {limb([SL, eL, pose.L])}
      <rect x={-64} y={104} width={128} height={196} fill={shirt} stroke={LINE} strokeWidth={14} strokeLinejoin="round" />
      <circle r={100} fill="#fff" stroke={LINE} strokeWidth={17} />
      <ManFaceDraw kind={face} gaze={gaze} blink={blink} />
      {limb([SR, eR, pose.R])}
      {[pose.L, pose.R].map((h, i) => <circle key={i} cx={h[0]} cy={h[1]} r={19} fill={LINE} />)}
      {hold && hold({ L: pose.L, R: pose.R })}
    </g>
  );
};

/* ------------------------------ the pickaxes ------------------------------ */

export type PickFace = "sleep" | "wake" | "eager" | "shock" | "sad" | "cry" | "angry" | "smug" | "dead" | "happy" | "nooo";

const FACES: Record<PickFace, true> = { sleep: true, wake: true, eager: true, shock: true, sad: true, cry: true, angry: true, smug: true, dead: true, happy: true, nooo: true };
void FACES;

/** a pickaxe with a face on its hub. (x, y) is the hub's centre; s scales it; the handle hangs below. */
export const Pick: React.FC<{
  kind: "wood" | "diamond";
  x: number; y: number; s?: number; rot?: number; face: PickFace; f?: number;
  cracks?: number; glow?: number; look?: Pt; squash?: number; ghost?: boolean; handle?: number;
}> = ({ kind, x, y, s = 1, rot = 0, face, f = 0, cracks = 0, glow = 0, look = [0, 0], squash = 1, ghost = false, handle = 1 }) => {
  const head = kind === "wood" ? "#b98a45" : "#46e6dc";
  const headDk = kind === "wood" ? "#8c622b" : "#1fb9b0";
  const headLt = kind === "wood" ? "#d8ad6a" : "#c9fffb";
  const stick = "#8b5a2b";
  const eyeW = (ex: number, ry: number, pupil: Pt, r = 8) => (
    <g>
      <ellipse cx={ex} cy={-6} rx={25} ry={ry} fill="#fff" stroke={LINE} strokeWidth={6} />
      <circle cx={ex + pupil[0] + look[0]} cy={-6 + pupil[1] + look[1]} r={r} fill={LINE} />
    </g>
  );
  const closed = (ex: number) => <path d={`M${ex - 22},-6 q22,18 44,0`} fill="none" stroke={LINE} strokeWidth={7} strokeLinecap="round" />;
  const st = { stroke: LINE, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const tear = (ex: number, k: number) => (
    <g opacity={0.9}>
      {[0, 1].map((i) => {
        const u = ((f * 0.05 + k + i * 0.5) % 1);
        return <path key={i} d={`M${ex},${24 + u * 90} q-9,16 0,22 q9,-6 0,-22 z`} fill="#6fc0ff" stroke="#1d5f9a" strokeWidth={3} opacity={1 - u * 0.7} />;
      })}
    </g>
  );
  let faceEl: React.ReactNode = null;
  switch (face) {
    case "sleep":
      faceEl = <>{closed(-34)}{closed(34)}<path d="M-14,46 q14,8 28,0" {...st} /></>;
      break;
    case "wake":
      faceEl = <>{eyeW(-34, 12, [0, 3], 6)}{eyeW(34, 12, [0, 3], 6)}<path d="M-14,46 q14,8 28,0" {...st} /></>;
      break;
    case "eager": // wide, sparkling, hopeful
      faceEl = (
        <>
          {eyeW(-34, 28, [0, 0], 13)}{eyeW(34, 28, [0, 0], 13)}
          <circle cx={-28} cy={-14} r={5} fill="#fff" /><circle cx={40} cy={-14} r={5} fill="#fff" />
          <path d="M-26,36 q26,36 52,0 z" fill="#fff" stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
          <path d="M-66,-40 q14,-12 28,-6 M66,-40 q-14,-12 -28,-6" {...st} />
        </>
      );
      break;
    case "happy":
      faceEl = <><path d="M-58,-4 q24,-30 48,0 M10,-4 q24,-30 48,0" {...st} /><path d="M-30,30 q30,40 60,0 z" fill="#5a1a1a" stroke={LINE} strokeWidth={6} strokeLinejoin="round" /></>;
      break;
    case "shock":
      faceEl = (
        <>
          <ellipse cx={-34} cy={-6} rx={30} ry={36} fill="#fff" stroke={LINE} strokeWidth={6} /><ellipse cx={34} cy={-6} rx={30} ry={36} fill="#fff" stroke={LINE} strokeWidth={6} />
          <circle cx={-34} cy={-6} r={5} fill={LINE} /><circle cx={34} cy={-6} r={5} fill={LINE} />
          <ellipse cx={0} cy={52} rx={15} ry={22} fill="#331111" stroke={LINE} strokeWidth={6} />
          <path d="M-68,-52 l-16,-14 M68,-52 l16,-14 M0,-62 v-22" {...st} />
        </>
      );
      break;
    case "sad":
      faceEl = <>{eyeW(-34, 18, [0, 6], 9)}{eyeW(34, 18, [0, 6], 9)}<path d="M-66,-30 l32,-12 M66,-30 l-32,-12" {...st} /><path d="M-24,54 q24,-26 48,0" {...st} /></>;
      break;
    case "cry":
      faceEl = <>{eyeW(-34, 14, [0, 8], 8)}{eyeW(34, 14, [0, 8], 8)}<path d="M-66,-28 l32,-14 M66,-28 l-32,-14" {...st} /><path d="M-26,56 q26,-30 52,0" {...st} />{tear(-34, 0)}{tear(34, 0.3)}</>;
      break;
    case "angry":
      faceEl = <>{eyeW(-34, 14, [-4, 0], 9)}{eyeW(34, 14, [4, 0], 9)}<path d="M-70,-44 l38,18 M70,-44 l-38,18" {...st} strokeWidth={10} /><path d="M-30,44 h60" {...st} /><path d="M-18,44 v14 M0,44 v14 M18,44 v14" {...st} strokeWidth={5} /></>;
      break;
    case "smug":
      faceEl = <><path d="M-60,-8 h52 M8,-8 h52" {...st} strokeWidth={9} /><circle cx={-34} cy={4} r={10} fill={LINE} /><circle cx={34} cy={4} r={10} fill={LINE} /><path d="M-24,46 q30,22 56,-12" {...st} /></>;
      break;
    case "nooo":
      faceEl = <>{eyeW(-34, 34, [0, 0], 7)}{eyeW(34, 34, [0, 0], 7)}<path d="M-30,32 h60 v36 h-60 z" fill="#331111" stroke={LINE} strokeWidth={6} strokeLinejoin="round" /><path d="M-70,-54 l30,12 M70,-54 l-30,12" {...st} /></>;
      break;
    case "dead":
      faceEl = <><path d="M-58,-26 l40,40 M-18,-26 l-40,40 M18,-26 l40,40 M58,-26 l-40,40" {...st} strokeWidth={9} /><path d="M-22,52 q22,-12 44,0" {...st} /></>;
      break;
  }
  const crackPaths = ["M-60,-70 l20,30 l-18,24", "M50,-80 l-14,36 l22,18", "M-8,70 l10,40 l-16,30 M-8,-110 l-8,30", "M0,-20 l40,40 M-30,200 l60,20"];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s} ${s * squash})`} opacity={ghost ? 0.6 : 1}>
      {glow > 0 && <circle r={330} fill="#bdfbff" opacity={0.25 * glow} />}
      {/* handle */}
      <rect x={-24} y={70} width={48} height={470 * handle} fill={stick} stroke={LINE} strokeWidth={13} strokeLinejoin="round" />
      {[110, 190, 270, 350, 430].filter((y) => y < 470 * handle).map((y) => <path key={y} d={`M-10,${y} l20,26`} stroke="#5e3a17" strokeWidth={6} strokeLinecap="round" />)}
      {/* the head: a blocky crescent either side of the hub */}
      <path d="M-250,60 Q-250,-130 0,-130 Q250,-130 250,60 L172,52 Q150,-40 0,-48 Q-150,-40 -172,52 Z" fill={head} stroke={LINE} strokeWidth={13} strokeLinejoin="round" />
      <path d="M-200,34 Q-190,-70 0,-86 Q-120,-72 -160,40 Z" fill={headLt} opacity={0.75} />
      <path d="M232,48 q-6,-60 -62,-86 q70,22 80,98 z" fill={headDk} opacity={0.6} />
      {/* the hub, with the face on it */}
      <rect x={-96} y={-72} width={192} height={156} rx={22} fill={head} stroke={LINE} strokeWidth={13} />
      <rect x={-84} y={-60} width={168} height={22} rx={10} fill={headLt} opacity={0.8} />
      <g transform="translate(0 6)">{faceEl}</g>
      {kind === "diamond" && [[-200, -60], [210, -50], [-140, 30]].map(([sx, sy], i) => (
        <path key={i} d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z" transform={`translate(${sx} ${sy}) scale(${0.7 + 0.5 * Math.abs(Math.sin(f * 0.15 + i * 2))})`} fill="#fff" />
      ))}
      {Array.from({ length: cracks }, (_, i) => <path key={i} d={crackPaths[i % 4]} stroke="#1a0f08" strokeWidth={8} strokeLinecap="round" fill="none" />)}
    </g>
  );
};

/* ------------------------------ little effects ------------------------------ */

export const Star: React.FC<{ x: number; y: number; r: number; o?: number; color?: string }> = ({ x, y, r, o = 1, color = "#ffffff" }) => (
  <path d={`M0,${-r} L${r * 0.22},${-r * 0.22} L${r},0 L${r * 0.22},${r * 0.22} L0,${r} L${-r * 0.22},${r * 0.22} L${-r},0 L${-r * 0.22},${-r * 0.22} Z`} transform={`translate(${x} ${y})`} fill={color} opacity={o} />
);

export const Sparkles: React.FC<{ x: number; y: number; f: number; n?: number; spread?: number; color?: string }> = ({ x, y, f, n = 8, spread = 260, color = "#fff6a8" }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + 0.4, d = spread * (0.5 + 0.5 * random(`sp${i}`));
      const t = ((f * 0.04 + random(`st${i}`)) % 1);
      return <Star key={i} x={x + Math.cos(a) * d} y={y + Math.sin(a) * d * 0.8} r={10 + 18 * Math.sin(t * Math.PI)} o={Math.sin(t * Math.PI)} color={color} />;
    })}
  </g>
);

export const Zzz: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g fontFamily="Monocraft, monospace" fill="#ffffff" stroke="#000" strokeWidth={6} paintOrder="stroke" fontWeight="bold">
    {[0, 1, 2].map((i) => {
      const u = ((f * 0.02 + i / 3) % 1);
      return <text key={i} x={x + u * 70 + i * 6} y={y - u * 190} fontSize={52 + i * 16} opacity={Math.sin(u * Math.PI)}>z</text>;
    })}
  </g>
);

export const Bang: React.FC<{ x: number; y: number; s?: number; q?: boolean }> = ({ x, y, s = 1, q }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <text textAnchor="middle" fontFamily="Monocraft, monospace" fontSize={150} fill="#ff3b30" stroke="#000" strokeWidth={14} paintOrder="stroke" fontWeight="bold">{q ? "?" : "!"}</text>
  </g>
);

export const Puff: React.FC<{ x: number; y: number; f: number; n?: number; color?: string }> = ({ x, y, f, n = 5, color = "#ffffff" }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const u = ((f * 0.03 + i / n) % 1);
      return <circle key={i} cx={x + Math.sin(u * 6 + i) * 30} cy={y - u * 260} r={22 + u * 46} fill={color} stroke="#000" strokeWidth={6} opacity={(1 - u) * 0.85} />;
    })}
  </g>
);

/** a Minecraft item tooltip */
export const Tooltip: React.FC<{ x: number; y: number; name: string; nameColor?: string; lines: string[]; o?: number; scale?: number }> = ({ x, y, name, nameColor = "#ffffff", lines, o = 1, scale = 1 }) => {
  const w = Math.max(name.length * 30, ...lines.map((l) => l.length * 25)) + 54;
  const h = 56 + lines.length * 44;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={o} fontFamily="Monocraft, monospace">
      <rect x={-w / 2 - 6} y={-6} width={w + 12} height={h + 12} fill="#2a0a5e" />
      <rect x={-w / 2} y={0} width={w} height={h} fill="#14001e" opacity={0.95} />
      <text x={-w / 2 + 27} y={42} fontSize={36} fill={nameColor}>{name}</text>
      {lines.map((l, i) => <text key={i} x={-w / 2 + 27} y={86 + i * 44} fontSize={30} fill="#aaaaaa">{l}</text>)}
    </g>
  );
};

/* ------------------------------ the set ------------------------------ */

export const BG = { plank: ["#6b4a2b", "#5e4025"], dark: "#2a1b10" };

/** the workshop: planked wall, window, shelves, torch, chest, crafting table, stone floor, a wooden table in front */
export const Workshop: React.FC<{ f: number; tableY: number; blur?: number; night?: number }> = ({ f, tableY, blur = 5, night = 0 }) => (
  <g>
    <defs>
      <filter id="wsBlur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={blur} /></filter>
      <radialGradient id="torchGlow"><stop offset="0" stopColor="#ffb347" stopOpacity={0.55} /><stop offset="1" stopColor="#ffb347" stopOpacity={0} /></radialGradient>
    </defs>
    <g filter={blur > 0 ? "url(#wsBlur)" : undefined}>
      {/* the wall: planks */}
      <rect x={-60} y={-60} width={1200} height={tableY + 400} fill="#5e4025" />
      {Array.from({ length: 17 }, (_, r) => <rect key={r} x={-60} y={r * 110 - 40} width={1200} height={104} fill={BG.plank[r % 2]} stroke="#3a2614" strokeWidth={6} />)}
      {[80, 420, 760, 1040].map((x) => <rect key={x} x={x} y={-60} width={34} height={tableY + 400} fill="#4a3320" opacity={0.7} />)}
      {/* window with a night sky */}
      <rect x={60} y={420} width={300} height={380} fill="#16224a" stroke="#2a1b10" strokeWidth={22} />
      <path d="M210,420 V800 M60,610 H360" stroke="#2a1b10" strokeWidth={16} />
      <rect x={236} y={470} width={58} height={58} fill="#f4f4e4" />
      {[[110, 520], [300, 700], [140, 740], [320, 560]].map(([sx, sy], i) => <rect key={i} x={sx} y={sy} width={10} height={10} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f * 0.1 + i)} />)}
      {/* shelves with a few things on them */}
      <rect x={640} y={500} width={420} height={26} fill="#3a2614" stroke="#000" strokeWidth={6} />
      <rect x={640} y={760} width={420} height={26} fill="#3a2614" stroke="#000" strokeWidth={6} />
      {[[680, 440, "#c0392b"], [740, 440, "#2e86c1"], [800, 440, "#27ae60"], [860, 440, "#f1c40f"]].map(([bx, by, c], i) => <rect key={i} x={bx as number} y={(by as number) + 0} width={46} height={60} fill={c as string} stroke="#000" strokeWidth={5} />)}
      {[[700, 690, "#ff4d6d"], [800, 690, "#4dd0e1"], [900, 690, "#ffd54f"]].map(([bx, by, c], i) => (
        <g key={i}><rect x={bx as number} y={(by as number) + 24} width={44} height={46} rx={10} fill={c as string} stroke="#000" strokeWidth={5} /><rect x={(bx as number) + 12} y={by as number} width={20} height={26} fill="#dfe6e9" stroke="#000" strokeWidth={5} /></g>
      ))}
      {/* a painting */}
      <rect x={420} y={280} width={170} height={130} fill="#7ec850" stroke="#3a2614" strokeWidth={14} />
      <rect x={440} y={300} width={130} height={50} fill="#87ceeb" />
      {/* wall torch and its glow */}
      <circle cx={560} cy={640} r={260} fill="url(#torchGlow)" opacity={0.9 - night * 0.2} />
      <rect x={548} y={640} width={24} height={110} fill="#6b4a2b" stroke="#000" strokeWidth={5} />
      <rect x={540} y={586} width={40} height={56} fill="#ffb347" stroke="#000" strokeWidth={5} />
      <rect x={550} y={560 - Math.sin(f * 0.3) * 6} width={20} height={34} fill="#ffe08a" />
      {/* the stone floor */}
      <rect x={-60} y={tableY + 120} width={1200} height={1000} fill="#6f6f78" />
      {Array.from({ length: 7 }, (_, r) => <rect key={r} x={-60} y={tableY + 120 + r * 120} width={1200} height={6} fill="#4a4a52" />)}
      {Array.from({ length: 24 }, (_, i) => <rect key={i} x={(i % 8) * 150 - 40 + ((i / 8) | 0) * 60} y={tableY + 126 + ((i / 8) | 0) * 120} width={6} height={120} fill="#4a4a52" />)}
      {/* chest and crafting table either side */}
      <g transform={`translate(880 ${tableY + 60})`}>
        <rect x={0} y={0} width={200} height={140} fill="#9a6a2e" stroke="#000" strokeWidth={9} />
        <rect x={0} y={0} width={200} height={50} fill="#b07d3a" stroke="#000" strokeWidth={9} />
        <rect x={86} y={34} width={28} height={36} fill="#cfd8dc" stroke="#000" strokeWidth={6} />
      </g>
      <g transform={`translate(-20 ${tableY + 40})`}>
        <rect x={0} y={0} width={190} height={160} fill="#a07a45" stroke="#000" strokeWidth={9} />
        <rect x={0} y={0} width={190} height={34} fill="#6b4a2b" stroke="#000" strokeWidth={9} />
        {[0, 1, 2].map((i) => <rect key={i} x={26 + i * 52} y={60} width={40} height={40} fill="#c8a56a" stroke="#000" strokeWidth={5} />)}
      </g>
    </g>
    {/* the table the pickaxes stand on: sharp, in front */}
    <g>
      <rect x={90} y={tableY} width={900} height={64} fill="#a8743a" stroke="#000" strokeWidth={10} />
      <rect x={90} y={tableY} width={900} height={20} fill="#c28a4a" />
      <rect x={140} y={tableY + 64} width={60} height={330} fill="#7a5226" stroke="#000" strokeWidth={10} />
      <rect x={880} y={tableY + 64} width={60} height={330} fill="#7a5226" stroke="#000" strokeWidth={10} />
      <rect x={140} y={tableY + 150} width={800} height={34} fill="#8a5d2c" stroke="#000" strokeWidth={8} />
    </g>
    <rect x={-60} y={-60} width={1200} height={2100} fill="#0a0a28" opacity={night * 0.5} />
  </g>
);

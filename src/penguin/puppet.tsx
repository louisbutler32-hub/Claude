import React from "react";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import credits from "../../public/images/penguin/credits.json";

/**
 * The PinsGuy "photo-puppet" kit: real animal photo cutouts on real photo
 * habitats, brought to life with pasted-on cartoon eyes and emotion
 * stickers. Every image is a CC0 / CC BY / CC BY-SA iNaturalist photo —
 * see public/images/penguin/credits.json.
 *
 * Everything here is driven by `t` (seconds into the scene) so the scene
 * files read like a beat sheet.
 */

type Credit = { id: string; file: string; width: number; height: number };
const SIZE: Record<string, Credit> = Object.fromEntries(
  (credits as Credit[]).map((c) => [c.id, c])
);

export const W = 1080;
export const H = 1920;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const ease = (x: number) => x * x * (3 - 2 * x);
/** 0 → 1 with a little overshoot, for pops */
export const pop = (t: number, at: number, len = 0.22) => {
  const x = ramp(t, at, at + len);
  return x <= 0 ? 0 : 1 + Math.sin(x * Math.PI) * 0.25 * (1 - x) + (ease(x) - 1);
};

// ── Photo habitat: full-bleed cover with a constant slow push-in ───────
export const PhotoBg: React.FC<{
  id: string;
  t: number;
  zoom?: [number, number]; // scale at t=0 → per second growth
  focus?: [number, number]; // 0..1 crop focus
  pan?: number; // px per second, horizontal
  blur?: number;
  grade?: string; // css filter additions
}> = ({ id, t, zoom = [1.05, 0.02], focus = [0.5, 0.5], pan = 0, blur = 0, grade = "" }) => {
  const c = SIZE[id];
  const cover = Math.max(W / c.width, H / c.height);
  const s = cover * (zoom[0] + zoom[1] * t);
  const w = c.width * s;
  const h = c.height * s;
  const x = Math.min(0, Math.max(W - w, W / 2 - w * focus[0] - pan * t));
  const y = Math.min(0, Math.max(H - h, H / 2 - h * focus[1]));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0d1b2a" }}>
      <Img
        src={staticFile(`images/penguin/${c.file}`)}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          filter: `saturate(1.18) contrast(1.05) ${blur ? `blur(${blur}px)` : ""} ${grade}`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Cartoon eyes ───────────────────────────────────────────────────────
export type Mood = "happy" | "sad" | "scared" | "angry" | "dead" | "squint" | "shock";

export const Eyes: React.FC<{
  size: number; // eye diameter in px
  mood?: Mood;
  look?: [number, number];
  t: number;
  seed?: number;
  tears?: boolean;
}> = ({ size, mood = "happy", look = [0, 0], t, seed = 0, tears = false }) => {
  const r = size / 2;
  const blink = (t * 30 + seed * 37) % 96 < 4 && mood !== "dead" ? 0.1 : 1;
  const squint = mood === "squint" ? 0.4 : 1;
  const pr = mood === "scared" || mood === "shock" ? r * 0.3 : r * 0.5;
  const iris = mood === "angry" ? "#c3121b" : "#111";
  const one = (side: -1 | 1) => (
    <g transform={`translate(${side * r * 1.05} 0)`} key={side}>
      {mood === "dead" ? (
        <>
          <circle r={r} fill="#fff" stroke="#111" strokeWidth={r * 0.12} />
          <path
            d={`M ${-r * 0.5} ${-r * 0.5} L ${r * 0.5} ${r * 0.5} M ${r * 0.5} ${-r * 0.5} L ${-r * 0.5} ${r * 0.5}`}
            stroke="#111"
            strokeWidth={r * 0.22}
            strokeLinecap="round"
          />
        </>
      ) : (
        <g transform={`scale(1 ${blink * squint})`}>
          <ellipse rx={r} ry={r * 1.08} fill="#fff" stroke="#111" strokeWidth={r * 0.12} />
          <circle cx={look[0] * r * 0.42} cy={look[1] * r * 0.42} r={pr} fill={iris} />
          <circle cx={look[0] * r * 0.42 - pr * 0.35} cy={look[1] * r * 0.42 - pr * 0.4} r={pr * 0.38} fill="#fff" />
        </g>
      )}
      {(mood === "sad" || mood === "angry") && (
        <path
          d={
            mood === "sad"
              ? `M ${-side * r * 0.95} ${-r * 1.45} L ${side * r * 0.8} ${-r * 1.05}`
              : `M ${-side * r * 0.95} ${-r * 1.0} L ${side * r * 0.8} ${-r * 1.45}`
          }
          stroke="#111"
          strokeWidth={r * 0.24}
          strokeLinecap="round"
        />
      )}
    </g>
  );
  return (
    <g>
      {one(-1)}
      {one(1)}
      {tears &&
        [-1, 1].map((side) => {
          const k = ((t * 1.6 + (side > 0 ? 0.45 : 0)) % 1);
          return (
            <path
              key={side}
              d={`M 0 ${-r * 0.35} C ${r * 0.35} ${r * 0.15} ${r * 0.3} ${r * 0.55} 0 ${r * 0.55} C ${-r * 0.3} ${r * 0.55} ${-r * 0.35} ${r * 0.15} 0 ${-r * 0.35} Z`}
              transform={`translate(${side * r * 1.25} ${r * 0.9 + k * r * 2.6}) scale(${1 - k * 0.3})`}
              fill="#7fd0ff"
              stroke="#1d5a86"
              strokeWidth={r * 0.06}
              opacity={1 - k}
            />
          );
        })}
    </g>
  );
};

// ── A photo cutout, placed by its feet (or centre) on screen ───────────
export type EyeSpot = { x: number; y: number; size: number }; // fractions of the cutout box

export const EYES: Record<string, EyeSpot[]> = {
  front: [{ x: 0.66, y: 0.05, size: 0.07 }],
  pair: [{ x: 0.66, y: 0.045, size: 0.055 }],
  dad: [{ x: 0.56, y: 0.05, size: 0.075 }],
  edge: [{ x: 0.36, y: 0.06, size: 0.07 }],
  wave: [{ x: 0.22, y: 0.07, size: 0.09 }],
  huddle: [
    { x: 0.37, y: 0.18, size: 0.055 },
    { x: 0.78, y: 0.12, size: 0.055 },
  ],
  group: [
    { x: 0.11, y: 0.17, size: 0.04 },
    { x: 0.83, y: 0.28, size: 0.04 },
  ],
  petrel: [{ x: 0.87, y: 0.2, size: 0.05 }],
  petrel2: [{ x: 0.9, y: 0.3, size: 0.07 }],
  seal: [{ x: 0.19, y: 0.13, size: 0.08 }],
  juv: [{ x: 0.36, y: 0.055, size: 0.08 }],
  juvsad: [{ x: 0.22, y: 0.13, size: 0.1 }],
};

export const Cutout: React.FC<{
  id: string;
  t: number;
  x: number; // screen x of the box centre
  y: number; // screen y of the box bottom (feet)
  h: number; // rendered height in px
  flip?: boolean;
  rot?: number;
  squashX?: number;
  waddle?: number; // degrees of side-to-side rock
  bob?: number; // px of breathing bob
  mood?: Mood;
  look?: [number, number];
  tears?: boolean;
  eyes?: boolean;
  grade?: string;
  seed?: number;
}> = ({
  id,
  t,
  x,
  y,
  h,
  flip = false,
  rot = 0,
  squashX = 1,
  waddle = 0,
  bob = 6,
  mood = "happy",
  look = [0, 0],
  tears = false,
  eyes = true,
  grade = "",
  seed = 0,
}) => {
  const c = SIZE[id];
  const w = (c.width / c.height) * h;
  const rock = waddle ? Math.sin(t * 9 + seed) * waddle : 0;
  const breathe = Math.sin(t * 3.2 + seed) * bob;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h - breathe,
        width: w,
        height: h + breathe,
        transformOrigin: "50% 100%",
        transform: `rotate(${rot + rock}deg) scaleX(${(flip ? -1 : 1) * squashX})`,
      }}
    >
      <Img
        src={staticFile(`images/penguin/${c.file}`)}
        style={{
          width: "100%",
          height: "100%",
          filter: `drop-shadow(0 18px 22px rgba(0,0,0,0.45)) saturate(1.1) ${grade}`,
        }}
      />
      {eyes && (
        <svg
          width={w}
          height={h + breathe}
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
        >
          {(EYES[id] ?? []).map((e, i) => (
            <g
              key={i}
              transform={`translate(${e.x * w} ${e.y * (h + breathe)}) scale(${flip ? -1 : 1} 1)`}
            >
              <Eyes size={e.size * h} mood={mood} look={look} t={t} seed={seed + i} tears={tears} />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
};

// ── Stickers ───────────────────────────────────────────────────────────
export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    {children}
  </svg>
);

/** A photoreal-ish egg drawn with gradients (no licensed egg-on-feet photo exists). */
export const Egg: React.FC<{ x: number; y: number; s: number; rot?: number; frozen?: number; crack?: number }> = ({
  x,
  y,
  s,
  rot = 0,
  frozen = 0,
  crack = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <defs>
      <radialGradient id="eggShade" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#fffdf6" />
        <stop offset="60%" stopColor="#e9e1cf" />
        <stop offset="100%" stopColor="#b9ae96" />
      </radialGradient>
    </defs>
    <ellipse cx={0} cy={-52} rx={40} ry={52} fill="url(#eggShade)" />
    <ellipse cx={0} cy={-52} rx={40} ry={52} fill="#8fd8ff" opacity={frozen * 0.7} />
    {frozen > 0.3 &&
      [[-18, -70], [10, -40], [16, -82], [-8, -28]].map(([fx, fy], i) => (
        <path
          key={i}
          d={`M ${fx - 7} ${fy} L ${fx + 7} ${fy} M ${fx} ${fy - 7} L ${fx} ${fy + 7} M ${fx - 5} ${fy - 5} L ${fx + 5} ${fy + 5} M ${fx + 5} ${fy - 5} L ${fx - 5} ${fy + 5}`}
          stroke="#fff"
          strokeWidth={2.5}
          opacity={frozen}
        />
      ))}
    {crack > 0 && (
      <path
        d="M -38 -60 L -24 -50 L -12 -68 L 2 -48 L 16 -68 L 28 -52 L 39 -62"
        stroke="#3a3328"
        strokeWidth={3.5}
        fill="none"
        strokeDasharray={200}
        strokeDashoffset={200 * (1 - crack)}
      />
    )}
  </g>
);

/** Rounded label chip, like a diagram tag: "70 MILES", "-40°C". */
export const Tag: React.FC<{ x: number; y: number; text: string; s: number; color?: string; rot?: number }> = ({
  x,
  y,
  text,
  s,
  color = "#ffffff",
  rot = 0,
}) =>
  s <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`,
        background: color,
        color: "#111",
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 900,
        fontSize: 64,
        padding: "10px 30px",
        borderRadius: 22,
        border: "6px solid #111",
        boxShadow: "0 10px 0 rgba(0,0,0,0.35)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );

/** Big "!" pop */
export const Bang: React.FC<{ x: number; y: number; s: number; color?: string }> = ({ x, y, s, color = "#ff3b30" }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -26 -120 L 26 -120 L 14 10 L -14 10 Z" fill={color} stroke="#111" strokeWidth={8} strokeLinejoin="round" />
      <circle cx={0} cy={44} r={20} fill={color} stroke="#111" strokeWidth={8} />
    </g>
  );

/** Thought bubble with an icon inside, optionally crossed out. */
export const Thought: React.FC<{ x: number; y: number; s: number; children: React.ReactNode; crossed?: number }> = ({
  x,
  y,
  s,
  children,
  crossed = 0,
}) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={-150} cy={190} r={16} fill="#fff" stroke="#111" strokeWidth={5} />
      <circle cx={-110} cy={140} r={26} fill="#fff" stroke="#111" strokeWidth={5} />
      <ellipse cx={0} cy={0} rx={170} ry={130} fill="#fff" stroke="#111" strokeWidth={7} />
      {children}
      {crossed > 0 && (
        <>
          <circle r={95} fill="none" stroke="#e5262f" strokeWidth={18} opacity={crossed} />
          <path d="M -66 -66 L 66 66" stroke="#e5262f" strokeWidth={18} strokeLinecap="round" opacity={crossed} />
        </>
      )}
    </g>
  );

export const Fish: React.FC = () => (
  <g>
    <path d="M -80 0 Q -20 -55 50 0 Q -20 55 -80 0 Z" fill="#9fc5e0" stroke="#24506e" strokeWidth={6} />
    <path d="M 45 0 L 85 -32 L 85 32 Z" fill="#9fc5e0" stroke="#24506e" strokeWidth={6} />
    <circle cx={-52} cy={-8} r={7} fill="#111" />
  </g>
);

/** Red sniper reticle for "danger is watching". */
export const Reticle: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${t * 40})`} opacity={0.9}>
      <circle r={110} fill="none" stroke="#ff2d2d" strokeWidth={8} />
      <circle r={60} fill="none" stroke="#ff2d2d" strokeWidth={5} />
      {[0, 90, 180, 270].map((a) => (
        <line key={a} x1={70} x2={140} y1={0} y2={0} stroke="#ff2d2d" strokeWidth={8} transform={`rotate(${a})`} />
      ))}
    </g>
  );

/** Wind-driven snow, deterministic per frame. */
export const Snow: React.FC<{ t: number; n?: number; speed?: number; slant?: number; streak?: boolean }> = ({
  t,
  n = 120,
  speed = 220,
  slant = 0.5,
  streak = false,
}) => (
  <Svg>
    {Array.from({ length: n }, (_, i) => {
      const v = speed * (0.6 + random(`v${i}`) * 0.8);
      const y = ((random(`y${i}`) * (H + 200) + t * v) % (H + 200)) - 100;
      const x = ((((random(`x${i}`) * (W + 600) - t * v * slant) % (W + 600)) + W + 600) % (W + 600)) - 300;
      const r = 2 + random(`r${i}`) * 5;
      return streak ? (
        <line key={i} x1={x} y1={y} x2={x + 40 * slant + 10} y2={y - 22} stroke="#fff" strokeWidth={r * 0.7} opacity={0.6} />
      ) : (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.85} />
      );
    })}
  </Svg>
);

export const Vignette: React.FC<{ k?: number; rgb?: string }> = ({ k = 0.55, rgb = "0,0,0" }) => (
  <AbsoluteFill
    style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(${rgb},0) 50%, rgba(${rgb},${k}) 100%)` }}
  />
);

export const FlashFill: React.FC<{ t: number; at: number; color?: string; len?: number }> = ({
  t,
  at,
  color = "#fff",
  len = 0.25,
}) => {
  const o = t >= at ? Math.max(0, 0.85 * (1 - (t - at) / len)) : 0;
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o }} /> : null;
};

/** Screen shake offset for a hit at `at`. */
export const shake = (t: number, at: number, amp = 26, len = 0.45) => {
  if (t < at || t > at + len) return { x: 0, y: 0 };
  const k = amp * (1 - (t - at) / len);
  const f = Math.floor(t * 30);
  return { x: (random(`sx${f}`) - 0.5) * 2 * k, y: (random(`sy${f}`) - 0.5) * 2 * k };
};

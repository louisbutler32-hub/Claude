import React from "react";
import { HAND } from "./text";

/**
 * Shared pieces of the "put your finger on the screen" Shorts.
 *
 * The format is a trick on the viewer. A dashed ring tells them where to
 * rest a finger, and the video then does something at exactly that spot: a
 * lightning bolt, a red fingerprint in a NO box, a beam of blessings. So
 * every Short keeps one spot constant and builds its scenes around it.
 */

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const INK = "#26202c";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const backOut = (x: number) => {
  const c = clamp01(x) - 1;
  return 1 + c * c * (2.7 * c + 1.7);
};
/** 0 before a, 1 after b, eased in between (times in seconds) */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** 1 inside [a, b] with `edge` seconds of fade at both ends */
export const win = (t: number, a: number, b: number, edge = 0.18) => clamp01(Math.min((t - a) / edge, (b - t) / edge));
/** deterministic pseudo-random in 0..1 */
export const rnd = (i: number, seed = 1) => {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** mix two #rrggbb colours */
export const mix = (a: string, b: string, k: number) => {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const h = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  return `#${h(lerp(r1, r2, k))}${h(lerp(g1, g2, k))}${h(lerp(b1, b2, k))}`;
};

/** The dark rounded caption pill with white text, pinned to the top. */
export const Pill: React.FC<{ text: string; y?: number; size?: number; opacity?: number }> = ({ text, y = 150, size = 46, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y,
      display: "flex",
      justifyContent: "center",
      opacity,
    }}
  >
    <div
      style={{
        background: "#111114",
        color: "#ffffff",
        borderRadius: 34,
        padding: "16px 34px",
        fontFamily: "'Fredoka', 'ComicRelief', system-ui, sans-serif",
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.15,
        textAlign: "center",
        maxWidth: 880,
      }}
    >
      {text}
    </div>
  </div>
);

/** Hand-lettered text with an optional outline, centred on (x, y). */
export const Hand: React.FC<{
  text: string;
  x?: number;
  y: number;
  size?: number;
  fill?: string;
  line?: string;
  lineW?: number;
  opacity?: number;
  scale?: number;
  rotate?: number;
  family?: "hand" | "round";
  weight?: number;
}> = ({ text, x = 540, y, size = 64, fill = INK, line, lineW = 0, opacity = 1, scale = 1, rotate = 0, family = "hand", weight = 700 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
      fontFamily: family === "hand" ? HAND : "'Fredoka', 'ComicRelief', system-ui, sans-serif",
      fontWeight: family === "hand" ? weight : 600,
      fontSize: size,
      lineHeight: 1.08,
      textAlign: "center",
      whiteSpace: "pre",
      color: fill,
      WebkitTextStroke: line ? `${lineW}px ${line}` : undefined,
      paintOrder: "stroke fill",
      opacity,
      pointerEvents: "none",
    }}
  >
    {text}
  </div>
);

/** A dashed ring that marches round and pulses: "put your finger here". */
export const FingerRing: React.FC<{ x: number; y: number; r?: number; frame: number; colour?: string; opacity?: number; pulse?: number }> = ({
  x,
  y,
  r = 90,
  frame,
  colour = "#ffffff",
  opacity = 1,
  pulse = 0.05,
}) => {
  const s = 1 + pulse * Math.sin(frame / 4);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <circle r={r} fill={colour} opacity={0.18} />
      <circle r={r} fill="none" stroke={colour} strokeWidth={9} strokeLinecap="round" strokeDasharray="34 24" strokeDashoffset={-frame * 3} />
    </g>
  );
};

/** A fingerprint: concentric broken arcs. */
export const Fingerprint: React.FC<{ x: number; y: number; s?: number; colour?: string; opacity?: number }> = ({ x, y, s = 1, colour = "#d9262f", opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={colour} strokeLinecap="round" opacity={opacity}>
    {[7, 15, 23, 31, 39, 47, 55].map((r, i) => (
      <ellipse
        key={r}
        rx={r * 0.82}
        ry={r * 1.08}
        strokeWidth={4.2}
        strokeDasharray={i % 2 ? `${r * 2.6} ${r * 0.5} ${r * 1.2} ${r * 0.8}` : `${r * 3.2} ${r * 0.7} ${r * 0.9}`}
        strokeDashoffset={i * 9}
        transform={`rotate(${-18 + i * 7})`}
      />
    ))}
    <path d="M -34 40 q 6 18 24 22 M 30 -30 q 14 12 12 30" strokeWidth={4.2} />
  </g>
);

/** A four-point sparkle. */
export const Sparkle: React.FC<{ x: number; y: number; r: number; colour?: string; rot?: number; opacity?: number }> = ({ x, y, r, colour = "#7dff8c", rot = 0, opacity = 1 }) => (
  <path
    d={`M 0 ${-r} Q ${r * 0.16} ${-r * 0.16} ${r} 0 Q ${r * 0.16} ${r * 0.16} 0 ${r} Q ${-r * 0.16} ${r * 0.16} ${-r} 0 Q ${-r * 0.16} ${-r * 0.16} 0 ${-r} Z`}
    transform={`translate(${x} ${y}) rotate(${rot})`}
    fill={colour}
    stroke="#ffffff"
    strokeWidth={Math.max(2, r * 0.08)}
    strokeLinejoin="round"
    opacity={opacity}
  />
);

/** A four-leaf clover, for the good-luck beam and wand. */
export const Clover: React.FC<{ x: number; y: number; s?: number; rot?: number; opacity?: number }> = ({ x, y, s = 1, rot = 0, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    {[0, 90, 180, 270].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <path d="M 0 -4 C -34 -10 -40 -52 -4 -56 C 8 -58 4 -30 0 -4 Z M 0 -4 C 34 -10 40 -52 4 -56 C -8 -58 -4 -30 0 -4 Z" fill="#4fcf6b" stroke="#1f7a3a" strokeWidth={5} strokeLinejoin="round" />
        <path d="M 0 -8 L 0 -48" stroke="#1f7a3a" strokeWidth={3} opacity={0.5} />
      </g>
    ))}
    <circle r={7} fill="#2b9b4a" stroke="#1f7a3a" strokeWidth={3} />
  </g>
);

/** A little puff of smoke, grey and growing as it rises. */
export const Puff: React.FC<{ x: number; y: number; r: number; opacity: number; colour?: string }> = ({ x, y, r, opacity, colour = "#4a4452" }) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r} fill={colour} />
    <circle cx={x - r * 0.7} cy={y + r * 0.3} r={r * 0.7} fill={colour} />
    <circle cx={x + r * 0.7} cy={y + r * 0.2} r={r * 0.75} fill={colour} />
  </g>
);

/** Hearts rising, for the happy ending. */
export const Heart: React.FC<{ x: number; y: number; s: number; opacity?: number; colour?: string }> = ({ x, y, s, opacity = 1, colour = "#ff5c8a" }) => (
  <path
    d="M 0 14 C -34 -8 -22 -34 0 -18 C 22 -34 34 -8 0 14 Z"
    transform={`translate(${x} ${y}) scale(${s})`}
    fill={colour}
    stroke="#ffffff"
    strokeWidth={4 / s}
    strokeLinejoin="round"
    opacity={opacity}
  />
);

/** A wobbly little cloud. */
export const Cloud: React.FC<{ x: number; y: number; s?: number; fill?: string; opacity?: number }> = ({ x, y, s = 1, fill = "#ffffff", opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} opacity={opacity}>
    <ellipse cx={0} cy={0} rx={150} ry={50} />
    <circle cx={-70} cy={-30} r={52} />
    <circle cx={10} cy={-52} r={64} />
    <circle cx={80} cy={-24} r={48} />
  </g>
);

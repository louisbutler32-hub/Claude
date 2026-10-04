import React from "react";
import { useCurrentFrame } from "remotion";
import { INK } from "../common";
import { fx, P, rnd } from "./draw";

/**
 * Dialogue is speech bubbles: white, INK outline, a tail toward the speaker,
 * Poppins Black, ≤ 6 words on ≤ 2 lines, popping in (0.6 → 1.05 → 1 over 6
 * frames). Variants: speech, shout (spiky), think (cloud), whisper (dashed).
 * Plus `Caption` (bold lower-third) and `Sfx` (text pops: WHAM, ?, !!).
 *
 * All of these are SVG nodes — drop them inside a <Characters> layer (or any
 * svg) in frame coordinates.
 */

export type BubbleVariant = "speech" | "shout" | "think" | "whisper";

/** scale for the pop-in: f = frames since the bubble appeared */
export const popScale = (f: number) => (f < 0 ? 0 : f < 3 ? 0.6 + (f / 3) * 0.45 : f < 6 ? 1.05 - ((f - 3) / 3) * 0.05 : 1);

/** split ≤ 6 words into at most two balanced lines */
export const splitLines = (text: string): string[] => {
  const words = text.trim().split(/\s+/);
  if (words.length <= 2 || text.length <= 12) return [words.join(" ")];
  let best = 1, bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ").length, b = words.slice(i).join(" ").length;
    const d = Math.abs(a - b);
    if (d < bestDiff) { bestDiff = d; best = i; }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
};
/** Poppins Black is wide: ~0.66em per character on average */
const textW = (s: string, size: number) => s.length * size * 0.66;

export type BubbleProps = {
  x: number; y: number;
  /** where the tail points (the speaker's mouth) */
  tail?: P;
  text: string;
  variant?: BubbleVariant;
  /** frame the bubble appears on (pop-in runs from here); omit for always-on */
  at?: number;
  /** frame it disappears on */
  until?: number;
  size?: number;
  maxW?: number;
  fill?: string; color?: string; lw?: number;
  /** override the frame (for stills) */
  frame?: number;
};

export const SpeechBubble: React.FC<BubbleProps> = ({ x, y, tail, text, variant = "speech", at, until, size, maxW = 560, fill = "#ffffff", color = INK, lw = 6, frame }) => {
  const cur = useCurrentFrame();
  const f = frame ?? cur;
  if (at !== undefined && f < at) return null;
  if (until !== undefined && f >= until) return null;
  const sc = at === undefined ? 1 : popScale(f - at);
  const lines = splitLines(text);
  let fs = size ?? (text.length <= 8 ? 72 : text.length <= 16 ? 60 : 50);
  const longest = Math.max(...lines.map((l) => textW(l, fs)));
  if (longest > maxW) fs = fs * (maxW / longest);
  const tw = Math.max(...lines.map((l) => textW(l, fs)));
  const lh = fs * 1.05;
  const padX = fs * 0.7, padY = fs * 0.5;
  const w = tw + padX * 2, h = lines.length * lh + padY * 2;
  const r = Math.min(h / 2, fs * 0.9);
  // tail: from the bubble edge toward the point
  let tailD = "";
  if (tail && variant !== "think") {
    const dx = tail[0] - x, dy = tail[1] - y;
    const nx = -dy, ny = dx;
    const L = Math.hypot(dx, dy) || 1;
    const bw = Math.min(w, h) * 0.22;
    const base: P = [x + (dx / L) * Math.min(w / 2, h / 2) * 0.6, y + (dy / L) * Math.min(w / 2, h / 2) * 0.6];
    const b1: P = [base[0] + (nx / L) * bw, base[1] + (ny / L) * bw], b2: P = [base[0] - (nx / L) * bw, base[1] - (ny / L) * bw];
    tailD = `M${fx(b1)} L${fx(tail)} L${fx(b2)}Z`;
  }
  let body: React.ReactNode;
  const common = { fill, stroke: color, strokeWidth: lw, strokeLinejoin: "round" as const };
  if (variant === "shout") {
    const n = 22, pts: P[] = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const k = i % 2 ? 1 : 1.16 + 0.1 * rnd(i, 3);
      pts.push([x + Math.cos(a) * (w / 2 + fs * 0.25) * k, y + Math.sin(a) * (h / 2 + fs * 0.25) * k]);
    }
    body = <path d={"M" + pts.map(fx).join("L") + "Z"} {...common} />;
  } else if (variant === "think") {
    const n = 14, pts: P[] = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push([x + Math.cos(a) * (w / 2 + fs * 0.15), y + Math.sin(a) * (h / 2 + fs * 0.15)]); }
    const rr = Math.max(w, h) * 0.17;
    body = (
      <g>
        {tail && [0.75, 0.5, 0.25].map((t, i) => <circle key={i} cx={x + (tail[0] - x) * (1 - t)} cy={y + (tail[1] - y) * (1 - t)} r={rr * (0.55 - i * 0.14)} {...common} />)}
        <g {...common}>{pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={rr} />)}<rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={r} /></g>
        <g fill={fill}>{pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={rr - lw / 2} />)}<rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={r} /></g>
      </g>
    );
  } else {
    body = (
      <g>
        {tailD && <path d={tailD} {...common} strokeDasharray={variant === "whisper" ? "12 10" : undefined} />}
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={r} {...common} strokeDasharray={variant === "whisper" ? "12 10" : undefined} />
        {tailD && <path d={tailD} fill={fill} stroke="none" transform={`translate(${((tail![0] - x) / (Math.hypot(tail![0] - x, tail![1] - y) || 1)) * -lw * 0.6},${((tail![1] - y) / (Math.hypot(tail![0] - x, tail![1] - y) || 1)) * -lw * 0.6})`} />}
      </g>
    );
  }
  return (
    <g transform={`translate(${x},${y}) scale(${sc}) translate(${-x},${-y})`} style={{ opacity: sc > 0 ? 1 : 0 }}>
      {body}
      <text x={x} y={y - ((lines.length - 1) * lh) / 2 + fs * 0.36} textAnchor="middle" fontFamily="Poppins Black" fontSize={fs} fill={variant === "whisper" ? "#555" : color} letterSpacing={-0.5}>
        {lines.map((l, i) => <tspan key={i} x={x} dy={i === 0 ? 0 : lh}>{l}</tspan>)}
      </text>
    </g>
  );
};

/** a bold lower-third line, white with an INK stroke, for narration-free gags */
export const Caption: React.FC<{ text: string; y?: number; size?: number; color?: string; at?: number; until?: number; frame?: number; cx?: number }> = ({ text, y, size = 64, color = "#ffffff", at, until, frame, cx }) => {
  const cur = useCurrentFrame();
  const f = frame ?? cur;
  if (at !== undefined && f < at) return null;
  if (until !== undefined && f >= until) return null;
  const sc = at === undefined ? 1 : popScale(f - at);
  return (
    <g transform={`translate(${cx ?? 0},${y ?? 0}) scale(${sc}) translate(${-(cx ?? 0)},${-(y ?? 0)})`}>
      <text x={cx ?? 0} y={y ?? 0} textAnchor="middle" fontFamily="Poppins Black" fontSize={size} fill={color} stroke={INK} strokeWidth={size * 0.22} paintOrder="stroke" strokeLinejoin="round">{text}</text>
    </g>
  );
};

/** a comic sound-effect text pop: WHAM, ?, !! — rotated, outlined, scaling in */
export const Sfx: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; rot?: number; at?: number; until?: number; frame?: number; burst?: boolean }> = ({ x, y, text, size = 120, color = "#ffd23a", rot = -8, at, until, frame, burst }) => {
  const cur = useCurrentFrame();
  const f = frame ?? cur;
  if (at !== undefined && f < at) return null;
  if (until !== undefined && f >= until) return null;
  const sc = at === undefined ? 1 : popScale(f - at) * 1.1;
  const pts: P[] = [];
  const n = 12, rw = text.length * size * 0.42 + size * 0.5, rh = size * 0.85;
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2; const k = i % 2 ? 0.8 : 1.15 + 0.1 * rnd(i, 7); pts.push([Math.cos(a) * rw * k, Math.sin(a) * rh * k]); }
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${sc})`}>
      {burst && <path d={"M" + pts.map(fx).join("L") + "Z"} fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />}
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily="Poppins Black" fontSize={size} fill={color} stroke={INK} strokeWidth={size * 0.16} paintOrder="stroke" strokeLinejoin="round">{text}</text>
    </g>
  );
};

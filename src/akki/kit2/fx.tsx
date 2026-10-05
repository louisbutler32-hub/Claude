import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { INK } from "../common";
import { fx, P, Part, rnd, smooth } from "./draw";

/**
 * Impact frames and transitions: `Flash` (white-on-black burst), `Smear`
 * (whip-pan streaks), and the comic `Boom` + `Smoke` (SVG nodes). Flash and
 * Smear are full-frame AbsoluteFills; drop them above the Scene.
 */

/** the channel's impact frame: a white silhouette burst on black, for `frames` frames from `at` */
export const Flash: React.FC<{ at?: number; frames?: number; x?: number; y?: number; seed?: number; invert?: boolean; frame?: number }> = ({ at = 0, frames = 2, x, y, seed = 1, invert, frame }) => {
  const cur = useCurrentFrame();
  const f = frame ?? cur;
  const { width: W, height: H } = useVideoConfig();
  if (f < at || f >= at + frames) return null;
  const cx = x ?? W / 2, cy = y ?? H / 2;
  const pts: P[] = [];
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2;
    const rr = i % 2 ? W * 0.12 + W * 0.06 * rnd(i, seed) : W * 0.42 + W * 0.5 * rnd(i, seed + 1);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect width={W} height={H} fill={invert ? "#fff" : "#000"} />
        <path d={"M" + pts.map(fx).join("L") + "Z"} fill={invert ? "#000" : "#fff"} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Whip-pan transition: streaks sweep across in `dir` over `frames` frames
 * from `at`, fully covering the frame in the middle. Put it above both
 * shots and cut between them at at + frames/2.
 */
export const Smear: React.FC<{ at: number; frames?: number; dir?: 1 | -1; color?: string; frame?: number }> = ({ at, frames = 8, dir = 1, color = "#1a1a1e", frame }) => {
  const cur = useCurrentFrame();
  const f = frame ?? cur;
  const { width: W, height: H } = useVideoConfig();
  if (f < at || f >= at + frames) return null;
  const t = (f - at) / frames;
  const cover = Math.sin(t * Math.PI);
  const off = (t - 0.5) * W * 2.4 * dir;
  return (
    <AbsoluteFill style={{ opacity: 1 }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect width={W} height={H} fill={color} opacity={cover * 0.85} />
        {Array.from({ length: 26 }, (_, i) => {
          const y = (i / 26) * H + rnd(i, 3) * 30;
          const len = W * (0.4 + rnd(i, 4) * 0.8) * (0.3 + cover);
          const x0 = -W + ((i * 211 + off) % (W * 2));
          return <rect key={i} x={x0} y={y} width={len} height={10 + rnd(i, 5) * 26} fill={rnd(i, 6) > 0.5 ? "#ffffff" : color} opacity={0.5 + cover * 0.5} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** comic explosion: three nested starbursts puffing out with `t` (0..1) */
export const Boom: React.FC<{ x: number; y: number; r: number; t: number; seed?: number }> = ({ x, y, r, t, seed = 2 }) => {
  const burst = (k: number, n: number, fill: string, sd: number) => {
    const pts: P[] = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 + sd;
      const rr = r * k * (i % 2 ? 0.62 : 1) * (0.85 + 0.3 * rnd(i, seed + sd));
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    return <path d={"M" + pts.map(fx).join("L") + "Z"} fill={fill} stroke={INK} strokeWidth={6} strokeLinejoin="round" />;
  };
  const s = 0.4 + 0.6 * Math.min(1, t * 3);
  return (
    <g transform={`translate(${x},${y}) scale(${s}) translate(${-x},${-y})`} opacity={t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 1}>
      <circle cx={x} cy={y} r={r * 1.3} fill="#ff8a1a" opacity={0.3} />
      {burst(1, 11, "#e2401a", 0.1)}
      {burst(0.72, 9, "#ffa21a", 0.5)}
      {burst(0.42, 7, "#fff2a0", 0.2)}
    </g>
  );
};

/** cartoon smoke puffs drifting up and fading with `t` (0..1) */
export const Smoke: React.FC<{ x: number; y: number; r: number; t: number; c?: string; seed?: number }> = ({ x, y, r, t, c = "#8a8690", seed = 5 }) => (
  <g opacity={Math.max(0, 1 - t * 0.8)}>
    {Array.from({ length: 7 }, (_, i) => {
      const a = rnd(i, seed) * Math.PI * 2;
      const d = r * (0.3 + 0.9 * t) * rnd(i, seed + 1);
      const rr = r * (0.35 + 0.3 * rnd(i, seed + 2)) * (0.6 + t);
      return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d - t * r * 0.8} r={rr} fill={c} stroke={INK} strokeWidth={4} />;
    })}
  </g>
);

/** motion dust at a figure's feet (SVG) */
export const Dust: React.FC<{ x: number; y: number; t: number; dir?: 1 | -1; r?: number }> = ({ x, y, t, dir = 1, r = 40 }) => (
  <g opacity={Math.max(0, 1 - t)}>
    {Array.from({ length: 5 }, (_, i) => <Part key={i} d={smooth([[x - dir * (20 + i * 30 + t * 120), y - 10 - rnd(i, 2) * 20 * (1 + t)], [x - dir * (10 + i * 30 + t * 120), y - 20 - rnd(i, 3) * 20], [x - dir * (i * 30 + t * 120), y - 5]], true, 0.8)} fill="#e8e2d6" lw={3} />)}
    <circle cx={x} cy={y} r={r * 0.2} fill="none" />
  </g>
);

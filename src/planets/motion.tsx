import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, H, W, line } from "./kit";

// The retention layer.
//
// The videos before this one were slideshows: one narration line produced one
// static composition that popped in once and then sat there for seven seconds.
// Nothing in this file changes what a scene says — it changes whether the
// frame is ever still, which is the thing that actually loses viewers.
//
// Three rules it exists to enforce:
//   1. no frame is frozen        — Camera
//   2. nothing arrives all at once — Reveal
//   3. numbers earn their size    — Counter

/**
 * A slow move over the whole scene. `push` scales up, `drift` slides.
 * Deliberately small: at 1.05 over ten seconds it reads as life, not as a
 * zoom, and it never softens the linework enough to notice.
 */
export const Camera: React.FC<{
  children: React.ReactNode;
  push?: number;
  drift?: [number, number];
  seconds?: number;
  origin?: [number, number];
}> = ({ children, push = 0.045, drift = [0, 0], seconds = 10, origin = [W / 2, H / 2] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.min(1, frame / (seconds * fps));
  const s = 1 + push * t;
  const [dx, dy] = drift;
  return (
    <g
      transform={`translate(${origin[0]} ${origin[1]}) scale(${s}) translate(${-origin[0]} ${-origin[1]}) translate(${dx * t} ${dy * t})`}
    >
      {children}
    </g>
  );
};

/**
 * Staggered entrance. Index `i` delays the element, so a row of four cards
 * lands one after another rather than as a single block.
 */
export const Reveal: React.FC<{
  children: React.ReactNode;
  i?: number;
  delay?: number;
  stagger?: number;
  from?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}> = ({ children, i = 0, delay = 0, stagger = 4, from = "up", distance = 26 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay - i * stagger,
    fps,
    config: { damping: 14, mass: 0.5 },
  });
  const off = (1 - s) * distance;
  const dx = from === "left" ? -off : from === "right" ? off : 0;
  const dy = from === "up" ? off : from === "down" ? -off : 0;
  return (
    <g opacity={Math.min(1, s * 1.5)} transform={`translate(${dx} ${dy})`}>
      {children}
    </g>
  );
};

/** A number that counts up to its value instead of appearing at it. */
export const Counter: React.FC<{
  x: number;
  y: number;
  to: number;
  size?: number;
  color?: string;
  frames?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  commas?: boolean;
  anchor?: "start" | "middle" | "end";
}> = ({
  x,
  y,
  to,
  size = 150,
  color = "#111111",
  frames = 26,
  delay = 0,
  prefix = "",
  suffix = "",
  commas = true,
  anchor = "middle",
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // ease out, so it decelerates onto the real figure rather than snapping
  const v = Math.round(to * (1 - Math.pow(1 - t, 3)));
  return (
    <text x={x} y={y} fontFamily={FONT} fontSize={size} fill={color} textAnchor={anchor}>
      {prefix}
      {commas ? v.toLocaleString("en-GB") : String(v)}
      {suffix}
    </text>
  );
};

/**
 * The running spine of a numbered video: which item we are on, and the one
 * number the whole video is about. Gives a viewer a reason to stay to seven.
 */
export const Progress: React.FC<{
  n: number;
  total: number;
  label?: string;
  value?: string;
  color?: string;
  faint?: string;
}> = ({ n, total, label, value, color = "#111111", faint = "#c6c3bb" }) => (
  <g>
    {[...Array(total)].map((_, i) => (
      <rect
        key={i}
        x={W - 60 - (total - i) * 30}
        y={40}
        width={20}
        height={10}
        rx={2}
        fill={i < n ? color : faint}
      />
    ))}
    {label ? (
      <text x={W - 60} y={96} fontFamily={FONT} fontSize={26} fill={faint} textAnchor="end">
        {label}
      </text>
    ) : null}
    {value ? (
      <text x={W - 60} y={140} fontFamily={FONT} fontSize={40} fill={color} textAnchor="end">
        {value}
      </text>
    ) : null}
  </g>
);

/** A wipe across the frame, for the cut into a new chapter. */
export const Wipe: React.FC<{ frames?: number; color?: string }> = ({
  frames = 12,
  color = "#111111",
}) => {
  const frame = useCurrentFrame();
  if (frame > frames) return null;
  const t = frame / frames;
  return <rect x={W * t} y={0} width={W} height={H} fill={color} />;
};

/** A line that draws itself on, for arrows and paths. */
export const DrawOn: React.FC<{
  d: string;
  length: number;
  width?: number;
  color?: string;
  delay?: number;
  frames?: number;
  dash?: string;
}> = ({ d, length, width = 5, color = "#111111", delay = 0, frames = 24, dash }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <path
      d={d}
      {...line(width, color)}
      fill="none"
      strokeDasharray={dash ?? `${length}`}
      strokeDashoffset={dash ? undefined : length * (1 - t)}
      opacity={dash ? t : 1}
    />
  );
};

/** Continuous gentle bob, for anything that should feel alive rather than placed. */
export const bob = (frame: number, speed = 10, amount = 6) => Math.sin(frame / speed) * amount;

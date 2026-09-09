import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { H, W } from "./scene";

/** Confetti burst — fires once from the top of the frame. */
export const Confetti: React.FC<{ start: number; count?: number }> = ({
  start,
  count = 70,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const colors = ["#ef5b52", "#3f7fd4", "#f5cf4a", "#5aa84f", "#ef559b"];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: count }, (_, i) => {
        const delay = random(`cd${i}`) * 26;
        const life = t - delay;
        if (life < 0) return null;
        const x = 240 + random(`cx${i}`) * (W - 480);
        const fall = life * (5 + random(`cv${i}`) * 5);
        const y = -40 + fall;
        if (y > H) return null;
        const spin = life * (5 + random(`cs${i}`) * 9);
        const drift = Math.sin(life / 9 + i) * 26;
        const o = interpolate(life, [0, 8, 70, 92], [0, 1, 1, 0], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });
        return (
          <rect
            key={i}
            x={-9}
            y={-6}
            width={18}
            height={12}
            rx={2}
            fill={colors[i % colors.length]}
            opacity={o}
            transform={`translate(${x + drift} ${y}) rotate(${spin})`}
          />
        );
      })}
    </svg>
  );
};

/** Four-point twinkle stars — the "correct!" sparkle. */
export const Sparkles: React.FC<{
  start: number;
  cx?: number;
  cy?: number;
  spread?: number;
  count?: number;
  size?: number;
}> = ({ start, cx = W / 2, cy = H / 2, spread = 520, count = 14, size = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: count }, (_, i) => {
        const delay = random(`sd${i}`) * 30;
        const life = t - delay;
        if (life < 0 || life > 46) return null;
        const a = random(`sa${i}`) * Math.PI * 2;
        const r = spread * (0.35 + random(`sr${i}`) * 0.65);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.7;
        const s =
          interpolate(life, [0, 10, 30, 46], [0, 1, 0.9, 0], {
            extrapolateRight: "clamp",
          }) *
          size *
          (0.6 + random(`ss${i}`) * 0.8);
        return (
          <path
            key={i}
            d="M 0 -26 Q 5 -5 26 0 Q 5 5 0 26 Q -5 5 -26 0 Q -5 -5 0 -26 Z"
            fill="#ffffff"
            transform={`translate(${x} ${y}) scale(${s})`}
          />
        );
      })}
    </svg>
  );
};

/** The white pop the reference uses on every reveal. */
export const RevealFlash: React.FC<{ start: number; len?: number }> = ({
  start,
  len = 14,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > len) return null;
  const o = interpolate(t, [0, 3, len], [0, 0.85, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#ffffff",
        opacity: o,
      }}
    />
  );
};

/** Cartoon speed swipes that fly off the silhouette as it turns colour. */
export const PopLines: React.FC<{
  start: number;
  cx: number;
  cy: number;
  r?: number;
}> = ({ start, cx, cy, r = 240 }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > 20) return null;
  const grow = interpolate(t, [0, 20], [0.5, 1.5]);
  const o = interpolate(t, [0, 6, 20], [0, 0.85, 0]);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g opacity={o}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2 + 0.3;
          const r0 = r * grow;
          const r1 = r0 + 60;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r0}
              y1={cy + Math.sin(a) * r0}
              x2={cx + Math.cos(a) * r1}
              y2={cy + Math.sin(a) * r1}
              stroke="#ffffff"
              strokeWidth={11}
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </svg>
  );
};

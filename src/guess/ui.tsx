import React from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, textShadow } from "./palette";

/**
 * The on-screen type. Every label in the reference is white, rounded, and
 * sits on a slightly drunk baseline — each letter tipped a couple of
 * degrees and popped in one after the next.
 */
export const WobbleText: React.FC<{
  text: string;
  start: number;
  size?: number;
  x?: number;
  y?: number;
  /** stagger per character, in frames */
  stagger?: number;
  /** pop the whole word in at once instead of letter by letter */
  whole?: boolean;
  seed?: string;
  color?: string;
  font?: string;
  out?: number;
}> = ({
  text,
  start,
  size = 96,
  x = 960,
  y = 150,
  stagger = 2.4,
  whole = false,
  seed = "t",
  color = "#ffffff",
  font = fonts.display,
  out,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = text.split("");

  const fade =
    out === undefined
      ? 1
      : interpolate(frame, [out, out + 10], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  if (fade <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        transform: `translate(${x - 960}px, ${y}px)`,
        opacity: fade,
        pointerEvents: "none",
      }}
    >
      {chars.map((ch, i) => {
        const delay = whole ? 0 : i * stagger;
        const s = spring({
          frame: frame - start - delay,
          fps,
          config: { damping: 11, mass: 0.5, stiffness: 140 },
        });
        const tilt = (random(`${seed}${i}`) - 0.5) * 11;
        const lift = (random(`${seed}l${i}`) - 0.5) * size * 0.09;
        return (
          <span
            key={i}
            style={{
              fontFamily: font,
              fontSize: size,
              color,
              lineHeight: 1,
              textShadow,
              whiteSpace: "pre",
              display: "inline-block",
              transform: `translateY(${lift + (1 - s) * 26}px) scale(${
                0.4 + s * 0.6
              }) rotate(${tilt}deg)`,
              opacity: Math.min(1, s * 1.6),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Small corner caption used while the board fills in. */
export const CornerLabel: React.FC<{
  text: string;
  start: number;
  out?: number;
}> = ({ text, start, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - start,
    fps,
    config: { damping: 13, mass: 0.6 },
  });
  const fade =
    out === undefined
      ? 1
      : interpolate(frame, [out, out + 8], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  return (
    <div
      style={{
        position: "absolute",
        left: 34,
        top: 96,
        fontFamily: fonts.display,
        fontSize: 42,
        color: "#ffffff",
        textShadow,
        opacity: s * fade,
        transform: `translateX(${(1 - s) * -40}px)`,
      }}
    >
      {text}
    </div>
  );
};

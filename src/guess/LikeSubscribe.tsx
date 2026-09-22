import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, textShadow } from "./palette";

/**
 * The "like and subscribe" reminder. Shows up to three times per episode,
 * timed to the celebrate beat of a handful of rounds so it never competes
 * with the guessing itself — a small corner card, not a full-screen
 * interruption. Every episode picks up the same three moments
 * automatically via `LIKE_SUB_ROUNDS` below, so nothing per-subject is
 * needed to keep this consistent going forward.
 */

const OUT = "#3d5c34";

/** Which round indices (0-based) show the reminder, given the episode's
 *  total round count — spread across the video rather than clustered. */
export function likeSubRounds(totalRounds: number): number[] {
  if (totalRounds <= 1) return [0];
  const at = (frac: number) =>
    Math.min(totalRounds - 1, Math.round((totalRounds - 1) * frac));
  return Array.from(new Set([at(0.25), at(0.6), at(0.92)]));
}

export const LikeSubscribeBanner: React.FC<{ start: number; out: number }> = ({
  start,
  out,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - start,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 170 },
  });
  const fade = interpolate(frame, [out, out + 14], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (pop <= 0.01 || fade <= 0) return null;

  const bob = Math.sin(frame / 9) * 4;
  const thumbSpin = interpolate(pop, [0, 1], [-20, 0]);

  return (
    <div
      style={{
        position: "absolute",
        right: 46,
        top: 56 + bob,
        transform: `scale(${0.5 + pop * 0.5}) rotate(${(1 - pop) * 6}deg)`,
        opacity: fade,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "18px 30px 18px 22px",
          background: "#ffffff",
          border: "7px solid " + OUT,
          borderRadius: 44,
          boxShadow: "0 10px 0 rgba(60,80,50,.18)",
        }}
      >
        <div
          style={{
            fontSize: 56,
            lineHeight: 1,
            transform: `rotate(${thumbSpin}deg)`,
          }}
        >
          👍
        </div>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 34,
            lineHeight: 1.05,
            color: OUT,
            textShadow,
          }}
        >
          Like &amp; Subscribe
          <br />
          for more!
        </div>
        <div style={{ fontSize: 44, lineHeight: 1 }}>🔔</div>
      </div>
    </div>
  );
};

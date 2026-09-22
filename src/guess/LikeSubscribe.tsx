import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, textShadow } from "./palette";

/**
 * The "like and subscribe" reminder. Said three times per episode — once
 * out loud together with this on-screen card, during the very first
 * round's silent drift-in beat (nothing else is happening on screen or on
 * the soundtrack yet, so it doesn't compete with anything), and twice more
 * spoken only, later in the episode. The spoken lines live in
 * scripts/build-audio.py (search LIKE_SUB) — LIKE_SUB_START here must stay
 * in step with that script's LIKE_SUB_START_OFFSET, since the card is
 * timed to land with the voice line.
 */

const OUT = "#3d5c34";

/** Local-round frame the card pops in on, round 0 only — matches
 *  LIKE_SUB_START_OFFSET in build-audio.py (must stay in sync), and lands
 *  at 5.0s into the video exactly (INTRO_LEN 120 + 30 frames @ 30fps). */
export const LIKE_SUB_START = 30;
/** Frame the card starts fading out. */
export const LIKE_SUB_OUT = 118;

export const LikeSubscribeBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - LIKE_SUB_START,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 170 },
  });
  const fade = interpolate(frame, [LIKE_SUB_OUT, LIKE_SUB_OUT + 14], [1, 0], {
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

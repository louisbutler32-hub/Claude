import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, formatBerries } from "../theme";

// The "chart breaks its own axis" gag for Buggy's reveal: the bar rockets
// past the top of frame and the whole scene has to zoom out repeatedly to
// keep it in shot.
export const AxisBreakGag: React.FC<{
  name: string;
  from: number;
  to: number;
  multiplier: number;
  startFrame?: number;
}> = ({ name, from, to, multiplier, startFrame = 0 }) => {
  const frame = useCurrentFrame() - startFrame;
  const { fps } = useVideoConfig();

  const grow = spring({
    frame,
    fps,
    config: { damping: 26, mass: 1.4, stiffness: 60 },
    durationInFrames: 90,
  });

  // Camera "zooms out" in three discrete steps as the bar keeps outgrowing
  // the frame, landing on a final wide scale.
  const zoomStep = interpolate(frame, [0, 20, 45, 70, 100], [1, 1, 0.78, 0.55, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barHeightPct = Math.min(1, grow) * 88;
  const numeric = Math.min(1, grow) * (to - from) + from;

  const shakeFrame = Math.max(0, frame - 18);
  const shake =
    shakeFrame < 30
      ? Math.sin(shakeFrame * 2.2) * interpolate(shakeFrame, [0, 30], [6, 0])
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          transform: `scale(${zoomStep}) translateX(${shake}px)`,
          transformOrigin: "bottom center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 900,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: theme.fontDisplay,
              fontWeight: 700,
              fontSize: 46,
              color: theme.goldBright,
              textShadow: "0 0 24px rgba(230,66,58,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            {formatBerries(numeric)}
          </div>
          {grow > 0.75 && (
            <div
              style={{
                fontFamily: theme.fontBody,
                fontWeight: 700,
                fontSize: 26,
                color: theme.bg,
                background: theme.red,
                borderRadius: 20,
                padding: "4px 16px",
                whiteSpace: "nowrap",
                opacity: interpolate(grow, [0.75, 1], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {multiplier.toLocaleString()}x
            </div>
          )}
        </div>
        <div
          style={{
            width: 260,
            height: 620,
            background: theme.bgAlt,
            borderRadius: "8px 8px 0 0",
            display: "flex",
            alignItems: "flex-end",
            overflow: "visible",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              height: `${barHeightPct}%`,
              background: `linear-gradient(0deg, ${theme.red}, ${theme.goldBright})`,
              borderRadius: "8px 8px 0 0",
              boxShadow: "0 0 60px rgba(230,66,58,0.6)",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: theme.fontBody,
            fontSize: 30,
            color: theme.text,
            fontWeight: 600,
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
};

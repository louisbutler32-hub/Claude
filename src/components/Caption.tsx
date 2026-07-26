import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

// Lower-third VO caption. Fades in/out within its own Sequence, so
// startFrame/endFrame are local to that Sequence (0-based).
export const Caption: React.FC<{
  text: string;
  durationInFrames: number;
  fadeFrames?: number;
}> = ({ text, durationInFrames, fadeFrames = 12 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom: 90,
        opacity,
      }}
    >
      <div
        style={{
          background: "rgba(11,13,18,0.72)",
          borderLeft: `6px solid ${theme.gold}`,
          padding: "22px 32px",
          borderRadius: 4,
          maxWidth: 1400,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: theme.fontBody,
            fontSize: 34,
            lineHeight: 1.35,
            color: theme.text,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

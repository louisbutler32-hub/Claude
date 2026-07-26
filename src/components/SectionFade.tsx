import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

// Wraps a section so it crossfades in/out through black at its edges,
// instead of hard-cutting into the next Sequence.
export const SectionFade: React.FC<{
  durationInFrames: number;
  fadeFrames?: number;
  children: React.ReactNode;
}> = ({ durationInFrames, fadeFrames = 18, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

export const SectionLabel: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 80,
        opacity,
        fontFamily: theme.fontBody,
        letterSpacing: 4,
        textTransform: "uppercase",
        fontSize: 24,
        color: theme.gold,
      }}
    >
      {text}
    </div>
  );
};

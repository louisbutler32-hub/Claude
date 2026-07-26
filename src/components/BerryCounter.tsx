import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { formatBerries, theme } from "../theme";

export const BerryCounter: React.FC<{
  from: number;
  to: number;
  startFrame?: number;
  durationInFrames?: number;
  fontSize?: number;
  color?: string;
}> = ({
  from,
  to,
  startFrame = 0,
  durationInFrames = 45,
  fontSize = 64,
  color = theme.goldBright,
}) => {
  const frame = useCurrentFrame();
  const value = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, to],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <span
      style={{
        fontFamily: theme.fontDisplay,
        fontWeight: 700,
        fontSize,
        color,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {formatBerries(value)}
    </span>
  );
};

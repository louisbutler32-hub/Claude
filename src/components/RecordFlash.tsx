import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

// Quick white flash + stamp for "record broken" moments (Kid overtaking
// Blackbeard, Buggy overtaking Kid) — the SFX-sting beat from the script,
// rendered as a visual accent since there's no audio track yet.
export const RecordFlash: React.FC<{ label: string; startFrame: number }> = ({
  label,
  startFrame,
}) => {
  const frame = useCurrentFrame() - startFrame;
  if (frame < 0 || frame > 40) return null;

  const flashOpacity = interpolate(frame, [0, 4, 14], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stampOpacity = interpolate(frame, [4, 10, 32, 40], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stampScale = interpolate(frame, [4, 12], [1.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: theme.text, opacity: flashOpacity }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: stampOpacity,
        }}
      >
        <div
          style={{
            transform: `scale(${stampScale}) rotate(-4deg)`,
            border: `4px solid ${theme.red}`,
            color: theme.red,
            fontFamily: theme.fontBody,
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: 4,
            padding: "14px 36px",
            textTransform: "uppercase",
            background: "rgba(11,13,18,0.55)",
          }}
        >
          {label}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

export const TitleCard: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
}> = ({ eyebrow, title, subtitle }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(frame, [0, 25], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: theme.bg,
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      {eyebrow && (
        <div
          style={{
            fontFamily: theme.fontBody,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontSize: 26,
            color: theme.gold,
            marginBottom: 18,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          fontFamily: theme.fontDisplay,
          fontWeight: 700,
          fontSize: 84,
          color: theme.text,
          textAlign: "center",
          maxWidth: 1500,
          lineHeight: 1.15,
          whiteSpace: "pre-line",
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            marginTop: 24,
            fontFamily: theme.fontBody,
            fontSize: 32,
            color: theme.textDim,
            textAlign: "center",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};

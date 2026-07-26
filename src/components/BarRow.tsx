import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, formatBerries } from "../theme";

export const BarRow: React.FC<{
  name: string;
  value: number;
  maxValue: number;
  startFrame?: number;
  hot?: boolean;
  badge?: string;
  note?: string;
  barHeight?: number;
  labelSize?: number;
}> = ({
  name,
  value,
  maxValue,
  startFrame = 0,
  hot = false,
  badge,
  note,
  barHeight = 74,
  labelSize = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const growth = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, mass: 1, stiffness: 90 },
    durationInFrames: 40,
  });

  const widthPct = Math.max(0, Math.min(1, growth)) * (value / maxValue) * 100;
  const numeric = Math.max(0, Math.min(1, growth)) * value;

  return (
    <div style={{ width: "100%", marginBottom: 26 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: theme.fontBody,
            fontWeight: 600,
            fontSize: labelSize,
            color: theme.text,
          }}
        >
          {name}
          {badge && (
            <span
              style={{
                marginLeft: 14,
                fontFamily: theme.fontBody,
                fontSize: labelSize * 0.55,
                color: theme.bg,
                background: theme.goldBright,
                borderRadius: 20,
                padding: "3px 14px",
                fontWeight: 700,
              }}
            >
              {badge}
            </span>
          )}
        </span>
        <span
          style={{
            fontFamily: theme.fontDisplay,
            fontWeight: 700,
            fontSize: labelSize * 1.05,
            color: hot ? theme.red : theme.goldBright,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatBerries(numeric)}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: barHeight,
          background: theme.bgAlt,
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${widthPct}%`,
            height: "100%",
            background: hot
              ? `linear-gradient(90deg, ${theme.barFill}, ${theme.barFillHot})`
              : `linear-gradient(90deg, ${theme.barFill}, ${theme.goldBright})`,
            borderRadius: 6,
          }}
        />
      </div>
      {note && (
        <div
          style={{
            marginTop: 8,
            fontFamily: theme.fontBody,
            fontSize: labelSize * 0.5,
            color: theme.textDim,
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
};

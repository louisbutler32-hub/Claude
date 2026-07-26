import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Caption } from "../components/Caption";
import { SectionLabel } from "../components/SectionLabel";

const FormulaGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const Box: React.FC<{ label: string; color: string }> = ({ label, color }) => (
    <div
      style={{
        padding: "24px 40px",
        borderRadius: 8,
        border: `2px solid ${color}`,
        color,
        fontFamily: theme.fontBody,
        fontWeight: 700,
        fontSize: 32,
      }}
    >
      {label}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Box label="OLD BOUNTY" color={theme.textDim} />
        <span style={{ color: theme.gold, fontSize: 40 }}>→</span>
        <Box label="NEW BOUNTY" color={theme.goldBright} />
        <span style={{ color: theme.gold, fontSize: 40 }}>=</span>
        <Box label="DELTA" color={theme.red} />
      </div>
    </AbsoluteFill>
  );
};

export const RulesSection: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <SectionLabel text="The Rules" />
      <FormulaGraphic />

      <Sequence from={0} durationInFrames={330}>
        <Caption
          text="Quick ground rules before we rank anything. Bounty size isn't a power ranking — it's a threat ranking."
          durationInFrames={330}
        />
      </Sequence>
      <Sequence from={330} durationInFrames={360}>
        <Caption
          text="That's why some genuinely weaker pirates sit above stronger ones, and why a few of today's jumps come from politics, not fights."
          durationInFrames={360}
        />
      </Sequence>
      <Sequence from={690} durationInFrames={390}>
        <Caption
          text="We're ranking by raw number increase — old bounty to new bounty, biggest gap wins. Not percentage, not multiplier."
          durationInFrames={390}
        />
      </Sequence>
      <Sequence from={1080} durationInFrames={330}>
        <Caption
          text="Counting down from a few hundred million, all the way to the single biggest jump anyone's ever gotten in this series."
          durationInFrames={330}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

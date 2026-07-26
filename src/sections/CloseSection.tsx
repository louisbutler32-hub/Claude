import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Caption } from "../components/Caption";

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: theme.fontDisplay,
          fontWeight: 700,
          fontSize: 56,
          color: theme.goldBright,
          textAlign: "center",
          maxWidth: 1300,
        }}
      >
        Which one do you think it is?
      </div>
      <div
        style={{
          marginTop: 20,
          fontFamily: theme.fontBody,
          fontSize: 30,
          color: theme.textDim,
        }}
      >
        Comment your theory — best one gets pinned.
      </div>
      <div
        style={{
          marginTop: 60,
          fontFamily: theme.fontBody,
          fontSize: 24,
          letterSpacing: 3,
          color: theme.gold,
          textTransform: "uppercase",
        }}
      >
        Subscribe · Next video teaser
      </div>
    </AbsoluteFill>
  );
};

export const CloseSection: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Sequence from={0} durationInFrames={450}>
        <AbsoluteFill style={{ background: theme.bg }}>
          <Caption
            text="Bounties in this story were never a power ranking. They're a mirror held up to how scared the world is — and right now, the world is more scared of a clown than it's ever been of anyone else on this list."
            durationInFrames={450}
          />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={450} durationInFrames={900 - 450}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

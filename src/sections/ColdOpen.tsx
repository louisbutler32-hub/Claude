import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Caption } from "../components/Caption";
import { TitleCard } from "../components/TitleCard";
import { BerryCounter } from "../components/BerryCounter";

const BerrySymbolTicker: React.FC = () => {
  const frame = useCurrentFrame();
  const frozen = frame > 60;
  const opacity = interpolate(frame, [0, 15], [0, 1], {
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
      <BerryCounter
        from={0}
        to={3189000000}
        durationInFrames={60}
        fontSize={120}
        color={frozen ? theme.red : theme.goldBright}
      />
    </AbsoluteFill>
  );
};

export const ColdOpen: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Sequence from={0} durationInFrames={90}>
        <BerrySymbolTicker />
      </Sequence>

      <Sequence from={90} durationInFrames={1260 - 90}>
        <AbsoluteFill style={{ background: theme.bg }}>
          <Caption
            text="A bounty in One Piece isn't a compliment. It's the World Government looking at a person and saying: this is exactly how scared of you we are, in a number the whole planet can see."
            durationInFrames={330}
          />
        </AbsoluteFill>
        <Sequence from={330} durationInFrames={300}>
          <Caption
            text="Most pirates spend years clawing their number up a few million at a time. Some fight for a decade and barely move it."
            durationInFrames={300}
          />
        </Sequence>
        <Sequence from={630} durationInFrames={330}>
          <Caption
            text="And then there's the one jump on this list that doesn't just break the record. It embarrasses everyone else's record."
            durationInFrames={330}
          />
        </Sequence>
        <Sequence from={960} durationInFrames={210}>
          <Caption
            text="We're counting up to it. Every entry gets bigger. Stay for the last one — it's not what you think."
            durationInFrames={210}
          />
        </Sequence>
      </Sequence>

      <Sequence from={1260} durationInFrames={1350 - 1260}>
        <TitleCard
          eyebrow="One Piece — Bounty Data"
          title={"THE MOST BROKEN\nBOUNTY JUMP"}
          subtitle="in One Piece History"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

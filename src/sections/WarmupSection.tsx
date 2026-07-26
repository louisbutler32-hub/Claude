import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "../theme";
import { Caption } from "../components/Caption";
import { SectionLabel } from "../components/SectionLabel";
import { BarRow } from "../components/BarRow";
import data from "../data/bounty-data.json";

const byId = (id: string) => data.entries.find((e) => e.id === id)!;

const EntryReveal: React.FC<{ id: string; caption: string; dur: number }> = ({
  id,
  caption,
  dur,
}) => {
  const entry = byId(id);
  return (
    <AbsoluteFill style={{ background: theme.bg, padding: "0 140px" }}>
      <SectionLabel text="The Warm-Up Tier" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1300 }}>
          <BarRow
            name={entry.name}
            value={entry.delta}
            maxValue={250000000}
            note={`${entry.name} — up ${(entry.delta / 1_000_000).toFixed(0)}M berries`}
            labelSize={40}
            barHeight={90}
          />
        </div>
      </AbsoluteFill>
      <Caption text={caption} durationInFrames={dur} />
    </AbsoluteFill>
  );
};

const ComparisonSpread: React.FC = () => {
  const ids = ["bege", "sanji", "zoro"];
  return (
    <AbsoluteFill style={{ background: theme.bg, padding: "0 140px" }}>
      <SectionLabel text="The Warm-Up Tier — Side by Side" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1300 }}>
          {ids.map((id, i) => {
            const entry = byId(id);
            return (
              <BarRow
                key={id}
                name={entry.name}
                value={entry.delta}
                maxValue={250000000}
                startFrame={i * 8}
                note={`${entry.oldBounty.toLocaleString()} → ${entry.newBounty.toLocaleString()}`}
              />
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const WarmupSection: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Sequence from={0} durationInFrames={1400}>
        <EntryReveal
          id="bege"
          caption="Bege went from 138 million to 300 million after the timeskip. A 162 million berry jump — the New World reshuffled everyone's danger level the moment they stepped into it."
          dur={1400}
        />
      </Sequence>
      <Sequence from={1400} durationInFrames={1400}>
        <EntryReveal
          id="sanji"
          caption="Sanji's jump is almost identical in shape — 177 million to 330 million. 153 million gained. Two years off-screen and the world already recalculated him."
          dur={1400}
        />
      </Sequence>
      <Sequence from={2800} durationInFrames={1400}>
        <EntryReveal
          id="zoro"
          caption="Zoro's bounty climbed from 120 million to 320 million after Dressrosa — a 200 million jump. The first entry where you can feel the story escalating in real time."
          dur={1400}
        />
      </Sequence>
      <Sequence from={4200} durationInFrames={300}>
        <ComparisonSpread />
      </Sequence>
    </AbsoluteFill>
  );
};

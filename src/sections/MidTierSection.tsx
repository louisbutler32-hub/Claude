import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "../theme";
import { Caption } from "../components/Caption";
import { SectionLabel } from "../components/SectionLabel";
import { BarRow } from "../components/BarRow";
import data from "../data/bounty-data.json";

const byId = (id: string) => data.entries.find((e) => e.id === id)!;

const LawReveal: React.FC = () => {
  const law = byId("law");
  return (
    <AbsoluteFill style={{ background: theme.bg, padding: "0 140px" }}>
      <SectionLabel text="The Mid Tier" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1300 }}>
          <BarRow
            name={law.name}
            value={law.delta}
            maxValue={law.delta}
            note={`${law.oldBounty.toLocaleString()} → ${law.newBounty.toLocaleString()} — doubled across the timeskip`}
            labelSize={40}
            barHeight={90}
          />
        </div>
      </AbsoluteFill>
      <Caption
        text="Law's bounty doubled across the timeskip — 200 million to 440 million. Fine on its own. But keep his name in your head, because in a few minutes his number is going to do something completely different."
        durationInFrames={1600}
      />
    </AbsoluteFill>
  );
};

const RobinVsLaw: React.FC = () => {
  const law = byId("law");
  const robin = byId("robin");
  const maxV = law.delta;
  return (
    <AbsoluteFill style={{ background: theme.bg, padding: "0 140px" }}>
      <SectionLabel text="The Mid Tier — When the Numbers Start Lying" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 90,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: theme.fontBody,
              color: theme.textDim,
              fontSize: 26,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            CLEAN DOUBLING
          </div>
          <BarRow name={law.name} value={law.delta} maxValue={maxV} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: theme.fontBody,
              color: theme.textDim,
              fontSize: 26,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            ALMOST INVISIBLE
          </div>
          <BarRow name={robin.name} value={robin.delta} maxValue={maxV} hot />
        </div>
      </AbsoluteFill>
      <Sequence from={0} durationInFrames={900}>
        <Caption
          text="Robin's case is the opposite of every entry so far. Her bounty barely moved — 79 million to 80 million, a 1 million berry increase. The smallest jump of any major character ever recorded."
          durationInFrames={900}
        />
      </Sequence>
      <Sequence from={900} durationInFrames={700}>
        <Caption
          text="But she'd already been given a bounty of 79 million at age 8, before she'd done almost anything as a pirate. The government wasn't measuring what she'd done — they were measuring what she knew."
          durationInFrames={700}
        />
      </Sequence>
      <Sequence from={1600} durationInFrames={400}>
        <Caption
          text="That's the first crack in 'bounty equals threat.' Sometimes the number was never about the fight at all."
          durationInFrames={400}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const MidTierSection: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Sequence from={0} durationInFrames={1600}>
        <LawReveal />
      </Sequence>
      <Sequence from={1600} durationInFrames={2900}>
        <RobinVsLaw />
      </Sequence>
    </AbsoluteFill>
  );
};

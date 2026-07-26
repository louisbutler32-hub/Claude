import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "../theme";
import { Caption } from "../components/Caption";
import { SectionLabel } from "../components/SectionLabel";
import { BarRow } from "../components/BarRow";
import data from "../data/bounty-data.json";

const byId = (id: string) => data.entries.find((e) => e.id === id)!;

const BigMomReveal: React.FC = () => {
  const bm = byId("bigmom");
  return (
    <AbsoluteFill style={{ background: theme.bg, padding: "0 140px" }}>
      <SectionLabel text="Record Holders Before the Record Breaker" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1300 }}>
          <BarRow
            name={bm.name}
            value={bm.delta}
            maxValue={bm.delta}
            badge="10x"
            note={`${bm.oldBounty.toLocaleString()} → ${bm.newBounty.toLocaleString()}`}
            labelSize={40}
            barHeight={90}
          />
        </div>
      </AbsoluteFill>
      <Sequence from={0} durationInFrames={800}>
        <Caption
          text="Big Mom's bounty once jumped from 50 million to 500 million in a single update. Ten times. A full decuple increase — the largest multiplier jump in the series' history at the time."
          durationInFrames={800}
        />
      </Sequence>
      <Sequence from={800} durationInFrames={500}>
        <Caption
          text="Chopper holds the same 10x multiplier record on a much smaller number — which is its own joke the story is clearly in on."
          durationInFrames={500}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

const BlackbeardReveal: React.FC = () => {
  const bb = byId("blackbeard");
  return (
    <AbsoluteFill style={{ background: theme.bg, padding: "0 140px" }}>
      <SectionLabel text="Record Holders Before the Record Breaker" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1300 }}>
          <BarRow
            name={bb.name}
            value={bb.delta}
            maxValue={bb.delta}
            hot
            note={`Nobody → ${bb.newBounty.toLocaleString()} — overnight`}
            labelSize={40}
            barHeight={90}
          />
        </div>
      </AbsoluteFill>
      <Sequence from={0} durationInFrames={700}>
        <Caption
          text="Before Marineford, Blackbeard barely had a bounty worth mentioning. He was a nobody who'd betrayed his own captain to hand Ace to the Marines. Then he killed Whitebeard."
          durationInFrames={700}
        />
      </Sequence>
      <Sequence from={700} durationInFrames={600}>
        <Caption
          text="His bounty didn't climb — it detonated, into the billions, overnight. For years, this was the single largest raw increase anyone had ever seen."
          durationInFrames={600}
        />
      </Sequence>
      <Sequence from={1300} durationInFrames={400}>
        <Caption
          text="Which is exactly why what happens next is so absurd."
          durationInFrames={400}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const RecordHoldersSection: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Sequence from={0} durationInFrames={1300}>
        <BigMomReveal />
      </Sequence>
      <Sequence from={1300} durationInFrames={3200}>
        <BlackbeardReveal />
      </Sequence>
    </AbsoluteFill>
  );
};

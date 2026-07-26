import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "../theme";
import { Caption } from "../components/Caption";
import { SectionLabel } from "../components/SectionLabel";
import { AxisBreakGag } from "../components/AxisBreakGag";
import data from "../data/bounty-data.json";

const buggy = data.entries.find((e) => e.id === "buggy")!;

export const AnswerSection: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <SectionLabel text="The Actual Answer — Buggy the Clown" />

      <Sequence from={0} durationInFrames={3600}>
        <AxisBreakGag
          name={buggy.name}
          from={buggy.oldBounty}
          to={buggy.newBounty}
          multiplier={buggy.multiplier ?? 1594}
          startFrame={1400}
        />
      </Sequence>

      <Sequence from={0} durationInFrames={700}>
        <Caption
          text="Two years before Egghead, Buggy the Clown had a bounty of 2 million berries. The joke bounty. The one fans quote when they want to make fun of how bounties don't track power."
          durationInFrames={700}
        />
      </Sequence>
      <Sequence from={700} durationInFrames={650}>
        <Caption
          text="After Egghead, Buggy got recognized as one of the Four Emperors of the sea — a title that used to belong to legends like Whitebeard and Kaido."
          durationInFrames={650}
        />
      </Sequence>
      <Sequence from={1350} durationInFrames={550}>
        <Caption
          text="His new number: 3,189,000,000 berries. Two million, to over three billion, one hundred and eighty-nine million."
          durationInFrames={550}
        />
      </Sequence>
      <Sequence from={1900} durationInFrames={650}>
        <Caption
          text="That's a 1,594x multiplier — and in raw berries gained, currently the single largest bounty increase in the entire history of One Piece. Bigger than Kid. Bigger than Blackbeard. Bigger than everything else on this list, combined, several times over."
          durationInFrames={650}
        />
      </Sequence>
      <Sequence from={2550} durationInFrames={600}>
        <Caption
          text="And the funniest part? Buggy didn't fight for it. He didn't beat an Emperor. He backed into an alliance, got lucky at exactly the right moments, and let the story hand him a seat at the most powerful table in the world."
          durationInFrames={600}
        />
      </Sequence>
      <Sequence from={3150} durationInFrames={450}>
        <Caption
          text="The number that used to be a punchline is now, mathematically, the most broken bounty in the story's history. Because the World Government's math doesn't care about strength — it cares about how much chaos you're standing next to."
          durationInFrames={450}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

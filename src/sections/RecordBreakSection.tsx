import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { theme } from "../theme";
import { Caption } from "../components/Caption";
import { SectionLabel } from "../components/SectionLabel";
import { BarRow } from "../components/BarRow";
import data from "../data/bounty-data.json";

const byId = (id: string) => data.entries.find((e) => e.id === id)!;

export const RecordBreakSection: React.FC = () => {
  const kid = byId("kid");
  const bb = byId("blackbeard");
  const maxV = kid.delta;

  return (
    <AbsoluteFill style={{ background: theme.bg, padding: "0 140px" }}>
      <SectionLabel text="The Jump That Broke the Record Book — Eustass Kid" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1300 }}>
          <BarRow
            name={bb.name}
            value={bb.delta}
            maxValue={maxV}
            note="Previous record"
          />
          <BarRow
            name={kid.name}
            value={kid.delta}
            maxValue={maxV}
            hot
            startFrame={30}
            note={`${kid.oldBounty.toLocaleString()} → ${kid.newBounty.toLocaleString()} — new record`}
            labelSize={40}
            barHeight={90}
          />
        </div>
      </AbsoluteFill>
      <Sequence from={0} durationInFrames={700}>
        <Caption
          text="After Wano, three names got the exact same headline number: three billion berries. Luffy, Law, and Eustass Kid, all recognized for taking down two of the Four Emperors together."
          durationInFrames={700}
        />
      </Sequence>
      <Sequence from={700} durationInFrames={600}>
        <Caption
          text="For Kid, it wasn't believable — it was insane. His bounty before Wano was 470 million. After Wano: three billion. A jump of 2.53 billion berries — bigger than Blackbeard's entire Marineford spike."
          durationInFrames={600}
        />
      </Sequence>
      <Sequence from={1300} durationInFrames={500}>
        <Caption
          text="For a while, this was the new record. It held for exactly as long as it took Oda to write one more arc."
          durationInFrames={500}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

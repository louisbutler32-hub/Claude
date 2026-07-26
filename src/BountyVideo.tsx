import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { ColdOpen } from "./sections/ColdOpen";
import { RulesSection } from "./sections/RulesSection";
import { WarmupSection } from "./sections/WarmupSection";
import { MidTierSection } from "./sections/MidTierSection";
import { RecordHoldersSection } from "./sections/RecordHoldersSection";
import { RecordBreakSection } from "./sections/RecordBreakSection";
import { AnswerSection } from "./sections/AnswerSection";
import { CloseSection } from "./sections/CloseSection";
import { SectionFade } from "./components/SectionFade";
import { theme } from "./theme";

// Frame map at 30fps, matching the script's timestamps exactly.
export const TIMELINE = {
  coldOpen: { from: 0, duration: 1350 }, // 0:00–0:45
  rules: { from: 1350, duration: 2250 }, // 0:45–2:00
  warmup: { from: 3600, duration: 4500 }, // 2:00–4:30
  midTier: { from: 8100, duration: 4500 }, // 4:30–7:00
  recordHolders: { from: 12600, duration: 4500 }, // 7:00–9:30
  recordBreak: { from: 17100, duration: 1800 }, // 9:30–10:30
  answer: { from: 18900, duration: 3600 }, // 10:30–12:30
  close: { from: 22500, duration: 900 }, // 12:30–13:00
} as const;

export const TOTAL_DURATION_IN_FRAMES = 23400; // 13:00 @ 30fps

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame, [0, TOTAL_DURATION_IN_FRAMES], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 4,
        background: "rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: theme.gold,
        }}
      />
    </div>
  );
};

export const BountyVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Sequence from={TIMELINE.coldOpen.from} durationInFrames={TIMELINE.coldOpen.duration}>
        <SectionFade durationInFrames={TIMELINE.coldOpen.duration}>
          <ColdOpen />
        </SectionFade>
      </Sequence>
      <Sequence from={TIMELINE.rules.from} durationInFrames={TIMELINE.rules.duration}>
        <SectionFade durationInFrames={TIMELINE.rules.duration}>
          <RulesSection />
        </SectionFade>
      </Sequence>
      <Sequence from={TIMELINE.warmup.from} durationInFrames={TIMELINE.warmup.duration}>
        <SectionFade durationInFrames={TIMELINE.warmup.duration}>
          <WarmupSection />
        </SectionFade>
      </Sequence>
      <Sequence from={TIMELINE.midTier.from} durationInFrames={TIMELINE.midTier.duration}>
        <SectionFade durationInFrames={TIMELINE.midTier.duration}>
          <MidTierSection />
        </SectionFade>
      </Sequence>
      <Sequence
        from={TIMELINE.recordHolders.from}
        durationInFrames={TIMELINE.recordHolders.duration}
      >
        <SectionFade durationInFrames={TIMELINE.recordHolders.duration}>
          <RecordHoldersSection />
        </SectionFade>
      </Sequence>
      <Sequence from={TIMELINE.recordBreak.from} durationInFrames={TIMELINE.recordBreak.duration}>
        <SectionFade durationInFrames={TIMELINE.recordBreak.duration}>
          <RecordBreakSection />
        </SectionFade>
      </Sequence>
      <Sequence from={TIMELINE.answer.from} durationInFrames={TIMELINE.answer.duration}>
        <SectionFade durationInFrames={TIMELINE.answer.duration}>
          <AnswerSection />
        </SectionFade>
      </Sequence>
      <Sequence from={TIMELINE.close.from} durationInFrames={TIMELINE.close.duration}>
        <SectionFade durationInFrames={TIMELINE.close.duration}>
          <CloseSection />
        </SectionFade>
      </Sequence>
      <ProgressBar />
    </AbsoluteFill>
  );
};

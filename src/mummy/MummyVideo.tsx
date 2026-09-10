import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { H, Title, W, useDoodleFont } from "../planets/kit";
import { DARK_SCENES, renderScene } from "./scenes";
import timing from "./timing.json";

// "7 Ways to Become a Mummy" — exactly 8:00.
//
// Two audio tracks, no music: the narration, and a synthesised effects bed
// laid onto the same timeline. Every effect in it is generated from
// oscillators and noise at build time, so there is no sampled audio in the
// video and nothing for Content ID to claim.
//
//   python3 scripts/make-vo.py mummy      # narration + timing.json
//   python3 scripts/make-sfx.py mummy     # the effects track

export const MUMMY_DURATION_SECONDS = 480;

type Line = { id: string; scene: string; text: string; start: number; end: number };

const LINES = timing as Line[];

const CHAPTERS: Record<string, string> = {
  i: "", // the intro carries no chapter label
  a: "ICE",
  b: "BOG",
  c: "DESERT",
  d: "SALT",
  e: "NATRON",
  f: "SOKUSHINBUTSU",
  g: "PLASTIC",
  z: "",
};

const chapter = (id: string) => CHAPTERS[id[0]] ?? "";

export const MummyVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  useDoodleFont();

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <Audio src={staticFile("assets/vo/mummy.mp3")} />
      <Audio src={staticFile("assets/vo/mummy-sfx.mp3")} volume={0.85} />
      {LINES.map((l, i) => {
        const from = Math.round(l.start * fps);
        const next = LINES[i + 1];
        const to = Math.round((next ? next.start : MUMMY_DURATION_SECONDS) * fps);
        return (
          <Sequence key={l.id} from={from} durationInFrames={to - from} name={`${l.id} ${l.scene}`}>
            <AbsoluteFill>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
                {renderScene(l.scene)}
                {chapter(l.id) ? <Title text={chapter(l.id)} boxed={DARK_SCENES.has(l.scene)} /> : null}
              </svg>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

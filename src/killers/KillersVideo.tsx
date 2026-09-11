import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { H, Title, W, useDoodleFont } from "../planets/kit";
import { PAPER } from "./art";
import { DARK_SCENES, renderScene } from "./scenes";
import timing from "./timing.json";

// "Ten Serial Killers, and What Actually Caught Them" — 9:00.
//
// Narration only. This one carries no effects track: the palette is muted and
// the comic stings that suit the science essays would be grotesque over real
// victims. Nothing in the art depicts violence.
//
//   python3 scripts/make-vo.py killers

export const KILLERS_DURATION_SECONDS = 540;

type Line = { id: string; scene: string; text: string; start: number; end: number };

const LINES = timing as Line[];

const CHAPTERS: Record<string, string> = {
  i: "",
  a: "JACK THE RIPPER",
  b: "TED BUNDY",
  c: "JOHN WAYNE GACY",
  d: "PETER SUTCLIFFE",
  e: "ANDREI CHIKATILO",
  f: "JEFFREY DAHMER",
  g: "HAROLD SHIPMAN",
  h: "GARY RIDGWAY",
  j: "DENNIS RADER",
  k: "JOSEPH DEANGELO",
  z: "",
};

const chapter = (id: string) => CHAPTERS[id[0]] ?? "";

export const KillersVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  useDoodleFont();

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <Audio src={staticFile("assets/vo/killers.mp3")} />
      {LINES.map((l, i) => {
        const from = Math.round(l.start * fps);
        const next = LINES[i + 1];
        const to = Math.round((next ? next.start : KILLERS_DURATION_SECONDS) * fps);
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

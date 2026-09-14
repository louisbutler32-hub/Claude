import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { H, W, useDoodleFont } from "../planets/kit";
import { NIGHT, PAPER } from "../earth/art";
import { DARK, renderScene } from "./scenes";
import { usePhotos } from "./photo";
import timing from "./timing.json";

// "Seven Ways the Ground Under You Can Kill You" — 8:00, format v2.
//
// What is deliberately absent, against the version before it: chapter cards,
// section numbers, a ranking spine, a corner progress chip, and captions that
// repeat the narration. The 12.5M-view video on this topic has none of them,
// and every one of them was costing us either screen time or the payoff.
//
// What is present instead: a person things happen to, a photograph wherever
// the real thing was really photographed, and something moving in every shot.
//
//   python3 scripts/make-vo.py earth2
//   python3 scripts/make-sfx.py earth2

export const EARTH2_DURATION_SECONDS = 480;

type Line = { id: string; scene: string; text: string; start: number; end: number };

const LINES = timing as Line[];

export const Earth2Video: React.FC = () => {
  const { fps } = useVideoConfig();
  useDoodleFont();
  usePhotos();

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <Audio src={staticFile("assets/vo/earth2.mp3")} volume={0.86} />
      <Audio src={staticFile("assets/vo/earth2-sfx.mp3")} volume={0.5} />
      {LINES.map((l, i) => {
        const from = Math.round(l.start * fps);
        const next = LINES[i + 1];
        const to = Math.round((next ? next.start : EARTH2_DURATION_SECONDS) * fps);
        return (
          <Sequence
            key={l.id}
            from={from}
            durationInFrames={to - from}
            name={`${l.id} ${l.scene}`}
          >
            <AbsoluteFill style={{ backgroundColor: DARK.has(l.scene) ? NIGHT : PAPER }}>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
                {renderScene(l.scene)}
              </svg>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

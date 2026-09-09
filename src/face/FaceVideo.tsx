import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { H, Title, W, useDoodleFont } from "../planets/kit";
import { DARK_SCENES, renderScene } from "./scenes";
import timing from "./timing.json";

// "What's Living on Your Face Right Now" — exactly 8:00, narration only.
// Same construction as the planets video: scripts-vo/face-life.json is the
// script, scripts/make-vo.py turns it into the track plus timing.json, and
// every cut here is placed from those timings.
//
//   python3 scripts/make-vo.py face-life

export const FACE_DURATION_SECONDS = 480;

type Line = { id: string; scene: string; text: string; start: number; end: number };

const LINES = timing as Line[];

const CHAPTERS: Record<string, string> = {
  d: "MITES",
  b: "BACTERIA",
  f: "FUNGUS",
  v: "VIRUSES",
  w: "WASHING",
  z: "", // the closing board carries no chapter label
};

const chapter = (id: string) => CHAPTERS[id[0]] ?? "";

export const FaceVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  useDoodleFont();

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <Audio src={staticFile("assets/vo/face-life.mp3")} />
      {LINES.map((l, i) => {
        const from = Math.round(l.start * fps);
        const next = LINES[i + 1];
        const to = Math.round((next ? next.start : FACE_DURATION_SECONDS) * fps);
        return (
          <Sequence key={l.id} from={from} durationInFrames={to - from} name={`${l.id} ${l.scene}`}>
            <AbsoluteFill>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
                {renderScene(l.scene)}
                {chapter(l.id) ? (
                  <Title text={chapter(l.id)} boxed={DARK_SCENES.has(l.scene)} />
                ) : null}
              </svg>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

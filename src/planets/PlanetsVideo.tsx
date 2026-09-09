import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { H, Title, W, useDoodleFont, usePlanetImages } from "./kit";
import { DARK_SCENES, renderScene } from "./scenes";
import timing from "./timing.json";

// "How Long Would You Last on Every Planet?" — all eight, exactly 8:00.
// Narration only, no music: the reference channel runs its voice dry, and
// the gaps between its lines are true silence.
// The narration track is the master clock: src/planets/timing.json holds the
// start/end of every line, and each line owns the screen until the next one
// begins. Regenerate both with `python3 scripts/make-vo.py`.

export const PLANETS_DURATION_SECONDS = 480;

type Line = { id: string; scene: string; text: string; start: number; end: number };

const LINES = timing as Line[];

const CHAPTERS: Record<string, string> = {
  m: "MERCURY",
  v: "VENUS",
  r: "MARS",
  j: "JUPITER",
  s: "SATURN",
  u: "URANUS",
  n: "NEPTUNE",
  z: "", // the closing board carries no chapter label
};

const chapter = (id: string) => CHAPTERS[id[0]] ?? "";

export const PlanetsVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  useDoodleFont();
  usePlanetImages();

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <Audio src={staticFile("assets/vo/planets-survival.mp3")} />
      {LINES.map((l, i) => {
        const from = Math.round(l.start * fps);
        const next = LINES[i + 1];
        const to = Math.round((next ? next.start : PLANETS_DURATION_SECONDS) * fps);
        return (
          <Sequence key={l.id} from={from} durationInFrames={to - from} name={`${l.id} ${l.scene}`}>
            <AbsoluteFill>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
                {renderScene(l.scene, l.id)}
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

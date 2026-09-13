import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { H, Title, W, useDoodleFont } from "../planets/kit";
import { Progress } from "../planets/motion";
import { PAPER } from "./art";
import { DARK_SCENES, WARN, renderScene } from "./scenes";
import timing from "./timing.json";

// "7 Ways the Earth Kills You Without Warning" — 8:00.
//
// First video built on the motion kit. Two things are different from the ones
// before it: no frame is a still (every scene carries a slow camera move and
// staggered entrances), and the corner carries the running spine — which of
// the seven we are on, and how much warning that one gives you.
//
//   python3 scripts/make-vo.py earth
//   python3 scripts/make-sfx.py earth

export const EARTH_DURATION_SECONDS = 480;

type Line = { id: string; scene: string; text: string; start: number; end: number };

const LINES = timing as Line[];

const CHAPTERS: Record<string, string> = {
  i: "",
  a: "THE LAKE",
  b: "THE FLOW",
  c: "THE FLOOR",
  d: "THE SLOSH",
  e: "THE SUN",
  f: "THE MYTH",
  g: "FROM OUTSIDE",
  z: "",
};

const chapter = (id: string) => CHAPTERS[id[0]] ?? "";

export const EarthVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  useDoodleFont();

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <Audio src={staticFile("assets/vo/earth.mp3")} volume={0.86} />
      <Audio src={staticFile("assets/vo/earth-sfx.mp3")} volume={0.5} />
      {LINES.map((l, i) => {
        const from = Math.round(l.start * fps);
        const next = LINES[i + 1];
        const to = Math.round((next ? next.start : EARTH_DURATION_SECONDS) * fps);
        const warn = WARN[l.id[0]];
        const dark = DARK_SCENES.has(l.scene);
        // The corner asks the question all the way through a chapter and only
        // answers it on that chapter's verdict. Printing the answer on the
        // number card gave away the payoff before the section had started.
        const revealed = l.scene.endsWith("-verdict");
        return (
          <Sequence key={l.id} from={from} durationInFrames={to - from} name={`${l.id} ${l.scene}`}>
            <AbsoluteFill>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
                {renderScene(l.scene)}
                {chapter(l.id) ? (
                  <Title text={chapter(l.id)} color={dark ? "#e8e2d6" : undefined} />
                ) : null}
                {warn ? (
                  <Progress
                    n={warn.n}
                    total={7}
                    label="warning given"
                    value={revealed ? warn.label : "?"}
                    color={revealed ? "#d1402f" : dark ? "#e8e2d6" : "#16181c"}
                    faint={dark ? "#4a505c" : "#cdc7ba"}
                  />
                ) : null}
              </svg>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill } from "remotion";
import { H, Note, STROKE, W, line, useDoodleFont } from "../planets/kit";
import {
  AMBER,
  Burst,
  CraterLake,
  FAINT,
  GREY,
  INK,
  PAPER,
  Paper,
  RED,
  ROCK,
  Volcano,
} from "./art";

const Frame: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = PAPER }) => {
  useDoodleFont();
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <rect x={0} y={0} width={W} height={H} fill={bg} />
        {children}
      </svg>
    </AbsoluteFill>
  );
};

/** A: the hook is the countdown, not the disaster. */
export const EarthThumbA: React.FC = () => (
  <Frame bg="#12161f">
    <Volcano x={1520} y={1120} scale={1.15} flow={0.8} fill="#5a5750" />
    <Note x={90} y={250} size={104} color="#e8e2d6" anchor="start">
      HOW MUCH WARNING
    </Note>
    <Note x={90} y={370} size={104} color="#e8e2d6" anchor="start">
      WOULD YOU GET?
    </Note>
    {[
      ["Supervolcano", "months"],
      ["Solar storm", "17 hours"],
      ["Pyroclastic flow", "seconds"],
      ["The other four", "none"],
    ].map(([what, warn], i) => (
      <g key={what}>
        <Note x={90} y={550 + i * 110} size={54} color="#b9b2a4" anchor="start">
          {what}
        </Note>
        <Note x={900} y={550 + i * 110} size={54} color={i === 3 ? RED : AMBER} anchor="start">
          {warn}
        </Note>
        <path d={`M 90 ${576 + i * 110} l 810 0`} {...line(2, "#3a4049")} />
      </g>
    ))}
  </Frame>
);

/** B: the single image that starts the video. */
export const EarthThumbB: React.FC = () => (
  <Frame bg="#12161f">
    <CraterLake x={W / 2 + 40} y={1010} scale={1.35} charge={1} />
    <Note x={W / 2} y={210} size={118} color="#e8e2d6">
      THE LAKE THAT
    </Note>
    <Note x={W / 2} y={340} size={118} color={RED}>
      KILLED 1,746 PEOPLE
    </Note>
    <Note x={W / 2} y={430} size={52} color="#b9b2a4">
      in a single night, and nobody heard it happen
    </Note>
  </Frame>
);

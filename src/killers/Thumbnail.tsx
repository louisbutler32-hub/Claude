import React from "react";
import { AbsoluteFill } from "remotion";
import { H, Note, STROKE, W, line, useDoodleFont } from "../planets/kit";
import {
  ACCENT,
  Beetle,
  Crowd,
  Door,
  FAINT,
  Floppy,
  GREY,
  INK,
  Notebook,
  PAPER,
  Plate,
  Receipt,
  Silhouette,
  SwabBox,
  Will,
} from "./art";

// Two thumbnails, drawn from the video's own art. Restrained on purpose: no
// faces, no weapons, no crime scenes — the objects that ended the cases.

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

/** A: the ten objects, in a grid. */
export const KillersThumbA: React.FC = () => {
  const cell = (i: number): [number, number] => [265 + (i % 5) * 348, 590 + Math.floor(i / 5) * 300];
  const items: React.FC<{ x: number; y: number }>[] = [
    // 1888 — nothing at all
    ({ x, y }) => (
      <Note x={x} y={y + 46} size={150} color={GREY}>
        ?
      </Note>
    ),
    ({ x, y }) => <Beetle x={x} y={y + 50} scale={0.42} />,
    ({ x, y }) => <Receipt x={x} y={y} scale={0.52} rotate={-6} />,
    ({ x, y }) => <Plate x={x} y={y} scale={0.44} text="FHY" />,
    ({ x, y }) => <Notebook x={x} y={y} scale={0.42} name="a name" />,
    ({ x, y }) => <Door x={x} y={y + 130} scale={0.42} open={0.6} />,
    ({ x, y }) => <Will x={x} y={y} scale={0.46} rotate={-5} />,
    ({ x, y }) => <SwabBox x={x} y={y} scale={0.46} label="1987" />,
    ({ x, y }) => <Floppy x={x} y={y} scale={0.52} />,
    ({ x, y }) => (
      <g>
        <circle cx={x - 60} cy={y - 40} r={26} {...line(4, FAINT)} fill="#fff" />
        <circle cx={x + 60} cy={y - 40} r={26} {...line(4, FAINT)} fill="#fff" />
        <path d={`M ${x - 60} ${y - 14} l 0 44 l 120 0 l 0 -44`} {...line(5, ACCENT)} fill="none" />
        <circle cx={x} cy={y + 70} r={34} {...line(5, ACCENT)} fill="#fff" />
      </g>
    ),
  ];
  return (
    <Frame>
      <Note x={W / 2} y={180} size={118} color={INK}>
        WHAT ACTUALLY
      </Note>
      <Note x={W / 2} y={310} size={118} color={ACCENT}>
        CAUGHT THEM
      </Note>
      <Note x={W / 2} y={392} size={48} color={GREY}>
        ten serial killers, ten very small things
      </Note>
      {items.map((It, i) => {
        const [x, y] = cell(i);
        return <It key={i} x={x} y={y} />;
      })}
    </Frame>
  );
};

/** B: ten faceless figures, one picked out. */
export const KillersThumbB: React.FC = () => (
  <Frame bg="#eceae4">
    <Note x={W / 2} y={230} size={166} color={INK}>
      10 SERIAL KILLERS
    </Note>
    <Note x={W / 2} y={330} size={58} color={GREY}>
      and the small things that caught them
    </Note>
    <path d={`M 260 812 L ${W - 260} 812`} {...line(STROKE, FAINT)} />
    <Crowd n={10} x={330} y={800} cols={10} gap={140} scale={0.95} lit={0} />
    <g>
      <Silhouette x={330 + 4 * 140} y={800} scale={0.95} fill={ACCENT} />
    </g>
    <Note x={W / 2} y={930} size={50} color={GREY}>
      only one was stopped by an operation built to stop him
    </Note>
  </Frame>
);

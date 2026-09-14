import React from "react";
import { AbsoluteFill } from "remotion";
import { H, STROKE, W, blob, line, useDoodleFont } from "../planets/kit";
import { NIGHT, PAPER, RED, ROCK } from "../earth/art";
import { Bed, Figure } from "./figure";
import { Photo, usePhotos } from "./photo";

// Two concepts. A sells the cold open — you are asleep and the floor is
// already going. B sells what is actually new about this video: a real
// photograph and a drawn figure in the same frame.

const Head: React.FC<{ lines: string[]; color?: string; y?: number; size?: number }> = ({
  lines, color = "#ffffff", y = 130, size = 104,
}) => (
  <>
    {lines.map((l, i) => (
      <text
        key={i}
        x={W / 2}
        y={y + i * (size + 12)}
        textAnchor="middle"
        fontSize={size}
        fill={color}
        stroke={NIGHT}
        strokeWidth={12}
        paintOrder="stroke"
        style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive", fontWeight: 700 }}
      >
        {l}
      </text>
    ))}
  </>
);

/** A — the bedroom, mid-collapse. */
export const Earth2ThumbA: React.FC = () => {
  useDoodleFont();
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <path d={`M 0 760 L ${W} 760 L ${W} ${H} L 0 ${H} Z`} {...line(STROKE)} fill="#2a323f" />
        <path d={blob(W / 2 + 80, 900, 300, 6, 0.13)} {...line(0)} fill="#05070b" />
        <Bed x={W / 2 - 330} y={760} w={430} color="#cfc8ba" />
        <g transform="translate(150 120) rotate(26 960 700)">
          <Figure x={960} y={700} pose="fall" scale={1.5} color="#cfc8ba" breathe={false} />
        </g>
        <Head lines={["YOU ARE ASLEEP.", "THE FLOOR IS NOT."]} y={150} size={112} />
      </svg>
    </AbsoluteFill>
  );
};

/** B — the real eruption, with a drawn figure standing in front of it. */
export const Earth2ThumbB: React.FC = () => {
  useDoodleFont();
  usePhotos();
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <Photo slug="volcano-plume" x={-40} y={-40} w={W + 80} h={H + 80} push={0} seed={3} credit={false} />
        <path d={`M 0 940 ${""} L ${W} 940 L ${W} ${H} L 0 ${H} Z`} {...line(STROKE)} fill={ROCK} />
        <Figure x={330} y={940} pose="look" scale={1.9} color={NIGHT} breathe={false} />
        <Head lines={["IT REACHES YOU", "IN ONE MINUTE"]} y={190} size={116} color="#ffe9b8" />
        <text
          x={W - 60} y={H - 60} textAnchor="end" fontSize={62} fill={RED}
          stroke={NIGHT} strokeWidth={10} paintOrder="stroke"
          style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive", fontWeight: 700 }}
        >
          600 km/h
        </text>
      </svg>
    </AbsoluteFill>
  );
};

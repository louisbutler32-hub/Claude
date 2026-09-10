import React from "react";
import { AbsoluteFill } from "remotion";
import { H, Note, STROKE, W, ink, line, red, useDoodleFont } from "../planets/kit";
import { LINEN, Person } from "./art";

// Two thumbnails, both drawn from the video's own art so the click and the
// first frame match. 1920x1080; YouTube downscales, so nothing smaller than
// about 60px of stroke survives — everything here is big.

const Frame: React.FC<{ children: React.ReactNode; bg: string }> = ({ children, bg }) => {
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

/** A: the wrapped figure, and the question. */
export const MummyThumbA: React.FC = () => (
  <Frame bg="#f6ecd2">
    {/* wrapped from the neck down, so the face still reads at gallery size */}
    <Person x={1440} y={1040} scale={2.6} state="dried" wrap={1} wrapTop={-214} />
    <Note x={90} y={330} size={150} color={ink} anchor="start">
      7 WAYS
    </Note>
    <Note x={90} y={490} size={150} color={ink} anchor="start">
      TO BECOME
    </Note>
    <Note x={90} y={650} size={170} color={red} anchor="start">
      A MUMMY
    </Note>
    <Note x={96} y={790} size={64} color="#5a5347" anchor="start">
      ranked by how long each one lasts
    </Note>
  </Frame>
);

/** B: the same body, preserved seven ways, side by side. */
export const MummyThumbB: React.FC = () => (
  <Frame bg="#ffffff">
    <rect x={0} y={640} width={W} height={440} fill="#f1efe8" />
    <path d={`M 0 640 L ${W} 640`} {...line(STROKE)} />
    {(
      [
        ["dried", "SAND"],
        ["bog", "BOG"],
        ["frozen", "ICE"],
        ["linen", "LINEN"],
        ["dried", "SALT"],
        ["dried", "MONK"],
        ["plastic", "PLASTIC"],
      ] as const
    ).map(([state, label], i) => (
      <g key={label}>
        <Person
          x={190 + i * 258}
          y={1000}
          scale={1.25}
          state={state === "linen" ? "dried" : state}
          pose={i === 5 ? "lotus" : "stand"}
          wrap={state === "linen" ? 1 : 0}
          wrapTop={-214}
        />
        <Note x={190 + i * 258} y={1058} size={40} color={ink}>
          {label}
        </Note>
      </g>
    ))}
    <Note x={W / 2} y={230} size={148} color={ink}>
      SEVEN WAYS TO
    </Note>
    <Note x={W / 2} y={390} size={148} color={red}>
      NOT ROT
    </Note>
    <Note x={W / 2} y={520} size={60} color="#5a5347">
      one body, preserved seven different ways
    </Note>
    <rect x={0} y={0} width={W} height={10} fill={LINEN} />
  </Frame>
);

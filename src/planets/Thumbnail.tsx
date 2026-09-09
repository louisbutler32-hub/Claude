import React from "react";
import { AbsoluteFill } from "remotion";
import { Astronaut } from "./character";
import { FONT, Note, PlanetPhoto, ink, line, red, usePlanetImages, useDoodleFont } from "./kit";

// Two thumbnails, drawn with the same kit as the video so the click and the
// content look like the same thing. 1280x720; everything is sized to survive
// being shown at about 210px wide in a feed.

const TW = 1280;
const TH = 720;

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useDoodleFont();
  usePlanetImages();
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <svg viewBox={`0 0 ${TW} ${TH}`} width="100%" height="100%" style={{ fontFamily: FONT }}>
        <rect x={0} y={0} width={TW} height={TH} fill="#ffffff" />
        {children}
      </svg>
    </AbsoluteFill>
  );
};

/** A time stamped on a planet, tilted like a rubber stamp. */
const TimeTag: React.FC<{ x: number; y: number; text: string; rotate?: number; size?: number }> = ({
  x,
  y,
  text,
  rotate = -6,
  size = 46,
}) => {
  const w = text.length * size * 0.66 + 34;
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <rect x={x - w / 2} y={y - size * 0.86} width={w} height={size * 1.4} rx={8} {...line(5, red)} fill="#ffffff" />
      <Note x={x} y={y + size * 0.32} size={size} color={red}>
        {text}
      </Note>
    </g>
  );
};

/** Variant A — the question, and one planet that answers it fastest. */
export const ThumbnailA: React.FC = () => (
  <Frame>
    <PlanetPhoto src="venus" x={295} y={330} r={235} />
    <TimeTag x={300} y={600} text="1 SECOND" rotate={-7} size={62} />
    <Astronaut x={620} y={690} scale={1.05} face="shock" arms="out" suit="#f2e0ae" trim="#c9a95e" />
    <Note x={900} y={190} size={104} color={ink} anchor="middle">
      HOW LONG
    </Note>
    <Note x={900} y={300} size={104} color={ink} anchor="middle">
      WOULD YOU
    </Note>
    <Note x={900} y={410} size={104} color={ink} anchor="middle">
      LAST?
    </Note>
    <Note x={975} y={520} size={54} color={red} anchor="middle" outline>
      on every planet
    </Note>
  </Frame>
);

/** Variant B — the whole list at a glance, worst first. */
const ROW = [
  { id: "venus", t: "1 SEC" },
  { id: "mercury", t: "90 SEC" },
  { id: "mars", t: "2 MIN" },
  { id: "jupiter", t: "58 MIN" },
];

export const ThumbnailB: React.FC = () => (
  <Frame>
    <Note x={TW / 2} y={118} size={98} color={ink}>
      HOW LONG WOULD
    </Note>
    <Note x={TW / 2} y={222} size={98} color={ink}>
      YOU LAST?
    </Note>
    {ROW.map((p, i) => {
      const x = 200 + i * 293;
      return (
        <g key={p.id}>
          <PlanetPhoto src={p.id} x={x} y={430} r={112} />
          <TimeTag x={x} y={630} text={p.t} rotate={i % 2 ? 5 : -5} size={50} />
        </g>
      );
    })}
  </Frame>
);

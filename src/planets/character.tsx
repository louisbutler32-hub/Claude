import React from "react";
import { ink, line, STROKE } from "./kit";

// The little astronaut the whole video hangs on. Drawn in a local space
// where (0,0) is between the boots and the figure is ~300 units tall, so
// scenes place it with translate(x,y) scale(s).

export type Face = "calm" | "shock" | "dead" | "sweat" | "cold" | "happy";

const SUIT = "#ffffff";
const TRIM = "#c9c6bd";
const glass = "#a9d8f5";

const Eyes: React.FC<{ face: Face }> = ({ face }) => {
  if (face === "dead")
    return (
      <g {...line(4)}>
        <path d="M -20 -262 l 14 14 M -6 -262 l -14 14" />
        <path d="M 6 -262 l 14 14 M 20 -262 l -14 14" />
      </g>
    );
  if (face === "shock")
    return (
      <g {...line(4)}>
        <path d="M -22 -268 l 14 7 l -14 7" />
        <path d="M 22 -268 l -14 7 l 14 7" />
      </g>
    );
  if (face === "cold")
    return (
      <g {...line(4)}>
        <path d="M -22 -262 q 8 -8 16 0" />
        <path d="M 6 -262 q 8 -8 16 0" />
      </g>
    );
  return (
    <g>
      <ellipse cx={-14} cy={-261} rx={4.5} ry={6} fill={ink} />
      <ellipse cx={14} cy={-261} rx={4.5} ry={6} fill={ink} />
    </g>
  );
};

const Mouth: React.FC<{ face: Face }> = ({ face }) => {
  if (face === "shock" || face === "sweat")
    return <ellipse cx={0} cy={-243} rx={13} ry={14} {...line(3.5)} fill="#8d6b6b" />;
  if (face === "dead") return <path d="M -12 -238 q 12 -10 24 0" {...line(4)} />;
  if (face === "happy") return <path d="M -14 -244 q 14 14 28 0" {...line(4)} />;
  return <path d="M -11 -242 q 11 9 22 0" {...line(4)} />;
};

export const Astronaut: React.FC<{
  x: number;
  y: number;
  scale?: number;
  face?: Face;
  helmet?: boolean;
  arms?: "down" | "out" | "up" | "wave";
  squash?: number;
  /** the suit picks up the light of the place it is standing in */
  suit?: string;
  trim?: string;
}> = ({
  x,
  y,
  scale = 1,
  face = "calm",
  helmet = true,
  arms = "down",
  squash = 1,
  suit = SUIT,
  trim = TRIM,
}) => {
  const armPath =
    arms === "out"
      ? "M -52 -196 q -46 22 -58 62 M 52 -196 q 46 22 58 62"
      : arms === "up"
      ? "M -52 -196 q -44 -18 -50 -66 M 52 -196 q 44 -18 50 -66"
      : arms === "wave"
      ? "M -52 -196 q -44 20 -54 58 M 52 -196 q 46 -20 52 -70"
      : "M -52 -194 q -30 34 -26 76 M 52 -194 q 30 34 26 76";
  const hands: [number, number][] =
    arms === "out"
      ? [[-112, -132], [112, -132]]
      : arms === "up"
      ? [[-104, -262], [104, -262]]
      : arms === "wave"
      ? [[-108, -136], [106, -266]]
      : [[-78, -116], [78, -116]];

  return (
    <g transform={`translate(${x} ${y}) scale(${scale} ${scale * squash})`}>
      {/* boots */}
      <path d="M -46 0 l 0 -34 l 34 0 l 0 22 l 22 0 l 0 12 Z" {...line(STROKE - 1)} fill={trim} />
      <path d="M 46 0 l 0 -34 l -34 0 l 0 22 l -22 0 l 0 12 Z" {...line(STROKE - 1)} fill={trim} />
      {/* legs */}
      <path d="M -44 -32 l 0 -84 l 34 0 l 0 84 Z" {...line(STROKE - 1)} fill={suit} />
      <path d="M 44 -32 l 0 -84 l -34 0 l 0 84 Z" {...line(STROKE - 1)} fill={suit} />
      {/* torso */}
      <path
        d="M -56 -112 q -6 -60 4 -104 q 52 -16 104 0 q 10 44 4 104 Z"
        {...line(STROKE - 1)}
        fill={suit}
      />
      <path d="M -52 -150 q 52 12 104 0" {...line(STROKE - 1, trim)} />
      <rect x={-16} y={-198} width={32} height={9} rx={4} {...line(3)} fill={trim} />
      {/* arms: a thick black stroke under a slightly thinner suit stroke, so
          the sleeve reads as an outlined limb rather than a wire */}
      <path d={armPath} {...line(34, ink)} />
      <path d={armPath} {...line(26, suit)} />
      {hands.map(([hx, hy], i) => (
        <circle key={i} cx={hx} cy={hy} r={22} {...line(STROKE - 1)} fill={trim} />
      ))}
      {/* neck ring */}
      <rect x={-32} y={-232} width={64} height={20} rx={10} {...line(STROKE - 1)} fill={trim} />
      {/* head */}
      <circle cx={0} cy={-262} r={40} {...line(STROKE - 1)} fill={suit} />
      <Eyes face={face} />
      <Mouth face={face} />
      {face === "sweat" ? (
        <g {...line(4, "#3aa0e6")}>
          <path d="M 44 -286 q 10 12 0 22" />
          <path d="M 60 -262 q 10 12 0 22" />
        </g>
      ) : null}
      {/* helmet dome */}
      {helmet ? (
        <>
          <circle cx={0} cy={-266} r={58} fill={glass} opacity={0.55} />
          <circle cx={0} cy={-266} r={58} {...line(STROKE - 1)} />
          <path d="M -34 -296 q 16 -20 40 -16" {...line(6, "#ffffff")} />
        </>
      ) : null}
    </g>
  );
};

/** Squat lander with legs and a thruster flame — the reference's ship shape. */
export const Lander: React.FC<{ x: number; y: number; scale?: number; flame?: boolean }> = ({
  x,
  y,
  scale = 1,
  flame = true,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -60 0 l -34 52 M 60 0 l 34 52" {...line(STROKE)} />
    <path d="M -104 52 l 22 0 M 82 52 l 22 0" {...line(STROKE)} />
    <path d="M -66 0 q 0 -86 66 -86 q 66 0 66 86 Z" {...line(STROKE - 1)} fill="#ffffff" />
    <circle cx={0} cy={-42} r={19} {...line(STROKE - 1)} fill="#a9d8f5" />
    {flame ? (
      <path d="M -26 2 q 12 44 26 56 q 14 -12 26 -56 Z" {...line(STROKE - 2, "#e0341f")} fill="#f5a623" />
    ) : null}
  </g>
);

/** Venera-style probe: a sphere with a ring skirt and a dish. */
export const Probe: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* ring skirt it landed on */}
    <ellipse cx={0} cy={0} rx={86} ry={24} {...line(STROKE - 1)} fill="#cfcabd" />
    <ellipse cx={0} cy={-8} rx={62} ry={17} {...line(STROKE - 1)} fill="#e3dfd2" />
    {/* pressure sphere */}
    <circle cx={0} cy={-74} r={62} {...line(STROKE - 1)} fill="#efece3" />
    <path d="M -44 -74 q 44 26 88 0" {...line(4, "#b9b4a6")} />
    <circle cx={-22} cy={-92} r={13} {...line(4)} fill="#a9d8f5" />
    {/* camera port and mast */}
    <path d="M 40 -104 l 34 -22" {...line(STROKE - 1)} />
    <path d="M 62 -122 q 22 -20 44 -2" {...line(STROKE - 1)} />
    <path d="M 0 -136 l 0 -46" {...line(STROKE - 1)} />
    <path d="M -30 -182 l 60 0" {...line(STROKE - 1)} />
  </g>
);

/** Pressurised base: dome + airlock tube, for the Mars pay-off. */
export const Habitat: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -150 0 a 150 130 0 0 1 300 0 Z" {...line(STROKE - 1)} fill="#f2f0ea" />
    <path d="M -150 0 a 150 130 0 0 1 300 0" {...line(STROKE - 1)} />
    <circle cx={-58} cy={-52} r={26} {...line(STROKE - 1)} fill="#a9d8f5" />
    <circle cx={58} cy={-52} r={26} {...line(STROKE - 1)} fill="#a9d8f5" />
    <path d="M 150 0 l 0 -54 l 96 0 l 0 54 Z" {...line(STROKE - 1)} fill="#efece3" />
    <path d="M 246 -54 l 40 0 l 0 54 l -40 0" {...line(STROKE - 1)} fill="#d9d5cb" />
    <path d="M -18 0 l 0 -70 q 18 -14 36 0 l 0 70 Z" {...line(STROKE - 1)} fill="#d9d5cb" />
  </g>
);

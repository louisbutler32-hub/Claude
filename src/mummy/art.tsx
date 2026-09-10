import React from "react";
import { STROKE, blob, ink, line, rng, smooth } from "../planets/kit";

// The cast for "7 Ways to Become a Mummy". One figure carries the whole
// video, so Person takes a `state` — the same body, preserved seven
// different ways — rather than there being seven separate drawings.

export const SKIN = "#f2d3b6";
export const SKIN_DRY = "#c9a071";
export const SKIN_BOG = "#6b4326";
export const LINEN = "#efe6d2";
export const BONE = "#f4f0e4";
export const NATRON = "#f0eee4";
export const SALT = "#f4f6f8";

export type State = "fresh" | "dried" | "bog" | "frozen" | "wrapped" | "skeleton" | "plastic";
export type Pose = "stand" | "lie" | "lotus";

const FILL: Record<State, string> = {
  fresh: SKIN,
  dried: SKIN_DRY,
  bog: SKIN_BOG,
  frozen: "#dfeaf2",
  wrapped: LINEN,
  skeleton: BONE,
  plastic: "#e8c9c9",
};

/** Eyes that read at a glance: alive, dead, or long dead. */
const Face: React.FC<{ state: State }> = ({ state }) => {
  if (state === "skeleton")
    return (
      <g>
        <ellipse cx={-15} cy={-266} rx={9} ry={11} fill={ink} />
        <ellipse cx={15} cy={-266} rx={9} ry={11} fill={ink} />
        <path d="M -10 -238 l 0 10 M 0 -238 l 0 10 M 10 -238 l 0 10" {...line(3)} />
        <path d="M -16 -240 l 32 0" {...line(3)} />
      </g>
    );
  if (state === "fresh")
    return (
      <g>
        <circle cx={-14} cy={-268} r={5} fill={ink} />
        <circle cx={14} cy={-268} r={5} fill={ink} />
        <path d="M -12 -244 q 12 8 24 0" {...line(4)} />
      </g>
    );
  // everything else is dead: crosses for eyes, a flat mouth
  return (
    <g {...line(4)}>
      <path d="M -21 -274 l 13 13 M -8 -274 l -13 13" />
      <path d="M 8 -274 l 13 13 M 21 -274 l -13 13" />
      <path d="M -12 -242 l 24 0" />
    </g>
  );
};

export const Person: React.FC<{
  x: number;
  y: number;
  scale?: number;
  state?: State;
  pose?: Pose;
  rotate?: number;
  wrap?: number;
  /** Highest band to draw. Raise it to leave the face showing. */
  wrapTop?: number;
}> = ({ x, y, scale = 1, state = "fresh", pose = "stand", rotate = 0, wrap = 0, wrapTop = -302 }) => {
  const fill = FILL[state];
  const thin = state === "dried" || state === "bog" ? 0.82 : 1;
  // one torso for both poses; the lotus adds a mound of crossed legs over the
  // bottom of it, so the head never floats free of the body
  const body = "M -58 -114 q -8 -62 4 -108 q 54 -16 108 0 q 12 46 4 108 Z";
  const crossedLegs = "M -100 0 q 100 -34 200 0 q -20 -112 -100 -112 q -80 0 -100 112 Z";

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale * thin} ${scale})`}>
      {pose !== "lotus" ? (
        <>
          <path d="M -46 0 l 0 -30 l 36 0 l 0 30 Z" {...line(STROKE - 1)} fill={fill} />
          <path d="M 46 0 l 0 -30 l -36 0 l 0 30 Z" {...line(STROKE - 1)} fill={fill} />
          <path d="M -44 -28 l 0 -88 l 34 0 l 0 88 Z" {...line(STROKE - 1)} fill={fill} />
          <path d="M 44 -28 l 0 -88 l -34 0 l 0 88 Z" {...line(STROKE - 1)} fill={fill} />
        </>
      ) : null}
      <path d={body} {...line(STROKE - 1)} fill={fill} />
      {/* arms */}
      {pose === "lotus" ? (
        <>
          <path d="M -52 -196 q -46 56 -4 84 M 52 -196 q 46 56 4 84" {...line(28, ink)} />
          <path d="M -52 -196 q -46 56 -4 84 M 52 -196 q 46 56 4 84" {...line(20, fill)} />
        </>
      ) : (
        <>
          <path d="M -54 -196 q -34 40 -28 84 M 54 -196 q 34 40 28 84" {...line(30, ink)} />
          <path d="M -54 -196 q -34 40 -28 84 M 54 -196 q 34 40 28 84" {...line(22, fill)} />
        </>
      )}
      {pose === "lotus" ? (
        <g>
          <path d={crossedLegs} {...line(STROKE - 1)} fill={fill} />
          {/* a hint of the crossed shins */}
          <path d="M -62 -44 q 62 -34 124 0" {...line(3, "rgba(0,0,0,0.28)")} />
        </g>
      ) : null}
      {/* ribs, for the skeleton */}
      {state === "skeleton" ? (
        <g {...line(4, "#c9c2ae")}>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M -40 ${-190 + i * 24} q 40 14 80 0`} />
          ))}
          <path d="M 0 -200 l 0 100" />
        </g>
      ) : null}
      {/* the dried and bog bodies get creases */}
      {state === "dried" || state === "bog" ? (
        <g {...line(3, "rgba(0,0,0,0.28)")}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M -36 ${-186 + i * 30} q 36 12 72 0`} />
          ))}
        </g>
      ) : null}
      <circle cx={0} cy={-262} r={42} {...line(STROKE - 1)} fill={fill} />
      <Face state={state} />
      {/* linen, drawn on top and revealed a band at a time */}
      {wrap > 0 ? (
        <g>
          {/* the bands overlap, and narrow over the head, so a wrapped body
              reads as wrapped rather than as a figure behind a ladder */}
          {[...Array(11)].map((_, i) => {
            const yy = -302 + i * 30;
            const hw = yy < -222 ? 52 : 82;
            if (i / 11 > wrap || yy < wrapTop) return null;
            return (
              <path
                key={i}
                d={`M ${-hw} ${yy} q ${hw} ${i % 2 ? 16 : -16} ${hw * 2} 0`}
                {...line(40, LINEN)}
                strokeLinecap="butt"
              />
            );
          })}
          {[...Array(11)].map((_, i) => {
            const yy = -302 + i * 30;
            const hw = yy < -222 ? 52 : 82;
            if (i / 11 > wrap || yy < wrapTop) return null;
            return (
              <path
                key={`o${i}`}
                d={`M ${-hw} ${yy + 17} q ${hw} ${i % 2 ? 16 : -16} ${hw * 2} 0`}
                {...line(3)}
              />
            );
          })}
        </g>
      ) : null}
    </g>
  );
};

/** Layered ground: ice, peat, sand, salt — whichever the method needs. */
export const Strata: React.FC<{
  y: number;
  layers: { h: number; fill: string; label?: string }[];
  seed?: number;
  children?: React.ReactNode;
}> = ({ y, layers, seed = 5, children }) => {
  let top = y;
  return (
    <g>
      {layers.map((l, i) => {
        const edge = smooth([
          [-20, top],
          [520, top - 8],
          [1100, top + 7],
          [1940, top - 5],
        ]);
        const band = (
          <g key={i}>
            <path d={`${edge} L 1940 1120 L -20 1120 Z`} fill={l.fill} />
            <path d={edge} {...line(i === 0 ? STROKE : 3, i === 0 ? ink : "rgba(0,0,0,0.25)")} />
            {l.label ? (
              <text
                x={1740}
                y={top + l.h / 2}
                fontFamily="'ComicRelief', 'Comic Sans MS', cursive"
                fontSize={30}
                fill="rgba(0,0,0,0.45)"
                textAnchor="end"
              >
                {l.label}
              </text>
            ) : null}
          </g>
        );
        top += l.h;
        return band;
      })}
      {children}
    </g>
  );
};

/** A canopic jar, with the lid the scene asks for. */
export const Jar: React.FC<{ x: number; y: number; scale?: number; kind?: number }> = ({
  x,
  y,
  scale = 1,
  kind = 0,
}) => {
  const lids = [
    "M -26 0 q 0 -46 26 -46 q 26 0 26 46 Z",
    "M -30 0 q 4 -50 30 -50 q 26 0 30 50 Z",
    "M -24 0 q 24 -52 48 0 Z",
    "M -28 0 l 10 -44 l 36 0 l 10 44 Z",
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M -44 0 q -12 76 6 112 q 38 14 76 0 q 18 -36 6 -112 Z" {...line(STROKE - 1)} fill="#e0cfa8" />
      <path d="M -50 0 l 100 0" {...line(STROKE - 1)} />
      <path d={lids[kind % 4]} {...line(STROKE - 1)} fill="#d9bf82" />
      <path d="M -30 46 q 30 10 60 0" {...line(3, "#b39a63")} />
    </g>
  );
};

/** Salt / natron / sand grains scattered in a box. */
export const Grains: React.FC<{
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  seed: number;
  n?: number;
  fill?: string;
  size?: number;
}> = ({ x0, y0, x1, y1, seed, n = 90, fill = "#ffffff", size = 5 }) => {
  const r = rng(seed);
  return (
    <>
      {[...Array(n)].map((_, i) => {
        const x = x0 + r() * (x1 - x0);
        const y = y0 + r() * (y1 - y0);
        const w = size + r() * size * 1.2;
        // rotate about the grain, not about the SVG origin, or the grains
        // scatter across the whole frame
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={w}
            rx={size * 0.3}
            {...line(2, "rgba(0,0,0,0.3)")}
            fill={fill}
            transform={`rotate(${r() * 90} ${x + w / 2} ${y + w / 2})`}
          />
        );
      })}
    </>
  );
};

export const Bell: React.FC<{ x: number; y: number; scale?: number; swing?: number }> = ({
  x,
  y,
  scale = 1,
  swing = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${scale})`}>
    <path d="M 0 -70 l 0 20" {...line(4)} />
    <path d="M -46 20 q 0 -70 46 -70 q 46 0 46 70 Z" {...line(STROKE - 1)} fill="#d9b45c" />
    <path d="M -54 20 l 108 0" {...line(STROKE - 1)} />
    <circle cx={0} cy={32} r={9} {...line(3)} fill="#b08c33" />
  </g>
);

/** The stone chamber the monk is sealed into. */
export const Chamber: React.FC<{ x: number; y: number; scale?: number; sealed?: boolean }> = ({
  x,
  y,
  scale = 1,
  sealed,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-190} y={-260} width={380} height={260} {...line(STROKE)} fill="#cfc9bd" />
    <rect x={-160} y={-230} width={320} height={230} {...line(STROKE - 1)} fill="#efece3" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M ${-190 + i * 95} -260 l 0 -22`} {...line(3, "#a89f8f")} />
    ))}
    <rect x={-206} y={-286} width={412} height={30} rx={6} {...line(STROKE - 1)} fill="#b9b2a4" />
    {/* the breathing tube itself is drawn by the scene, so it can start at
        the monk's mouth rather than at an arbitrary point on the lid */}
    {sealed ? <path d="M -40 -300 l 80 0" {...line(10, "#8a7f6a")} /> : null}
  </g>
);

/** Vacuum chamber for the plastination beat. */
export const Tank: React.FC<{ x: number; y: number; scale?: number; children?: React.ReactNode }> = ({
  x,
  y,
  scale = 1,
  children,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-230} y={-300} width={460} height={340} rx={22} {...line(STROKE)} fill="#dff0fb" />
    <rect x={-230} y={-300} width={460} height={340} rx={22} {...line(STROKE)} fill="none" />
    {children}
    <rect x={-250} y={-320} width={500} height={30} rx={10} {...line(STROKE - 1)} fill="#c9d9ee" />
    <path d="M 250 -260 l 70 0 l 0 60" {...line(12, "#9fb0c4")} />
    <circle cx={320} cy={-180} r={34} {...line(STROKE - 1)} fill="#efece3" />
    <path d="M 320 -180 l 0 -22 M 320 -180 l 16 12" {...line(4)} />
  </g>
);

export const scatter = (seed: number, n: number, x0: number, y0: number, x1: number, y1: number) => {
  const r = rng(seed);
  return [...Array(n)].map(() => ({
    x: x0 + r() * (x1 - x0),
    y: y0 + r() * (y1 - y0),
    a: r() * 360,
    s: 0.6 + r() * 0.7,
  }));
};

export { blob };

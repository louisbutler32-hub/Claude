import React from "react";
import { STROKE, blob, ink, line, rng, smooth } from "../planets/kit";

// The cast of "What's Living on Your Face Right Now". Same marker-and-flat-
// fill language as the planets video, but the subjects are anatomy and
// microbes, so the shared drawing kit is imported and only the creatures
// live here.

export const skinTop = "#f7ddcc";
export const skinMid = "#eec3ac";
export const skinDeep = "#dda88f";
export const sebum = "#f4dc94";
export const miteBody = "#ddc9a2";

/** A plain front-on face, the recurring establishing shot. */
export const Face: React.FC<{ x: number; y: number; scale?: number; eyesShut?: boolean }> = ({
  x,
  y,
  scale = 1,
  eyesShut,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* Ears sit just outside the head and are drawn first, so whatever of
        them falls inside is covered by the head fill. The head is a plain
        ellipse rather than a scaled blob — a scaled blob left the hair and
        the ears sitting on a different silhouette from the face. */}
    <path d="M -186 -30 q -54 -10 -44 44 q 10 50 48 34" {...line(STROKE - 1)} fill={skinTop} />
    <path d="M 186 -30 q 54 -10 44 44 q -10 50 -48 34" {...line(STROKE - 1)} fill={skinTop} />
    {/* head */}
    <ellipse cx={0} cy={0} rx={196} ry={240} {...line(STROKE)} fill={skinTop} />
    {/* hair, clipped to the head so it can never overhang the jaw */}
    <g clipPath={`url(#face-head-${Math.round(x)}-${Math.round(y)})`}>
      <path
        d="M -210 -110 q 36 -170 210 -170 q 174 0 210 170 q -66 -84 -210 -84 q -144 0 -210 84 Z"
        fill="#4a3526"
      />
      {/* the hairline is clipped too, or its ends poke out past the temples */}
      <path d="M -200 -118 q 70 -84 200 -84 q 130 0 200 84" {...line(STROKE - 1)} />
    </g>
    <clipPath id={`face-head-${Math.round(x)}-${Math.round(y)}`}>
      <ellipse cx={0} cy={0} rx={196} ry={240} />
    </clipPath>
    {/* brows */}
    <path d="M -122 -60 q 44 -30 88 -4" {...line(9, "#4a3526")} />
    <path d="M 122 -60 q -44 -30 -88 -4" {...line(9, "#4a3526")} />
    {/* eyes */}
    {eyesShut ? (
      <>
        <path d="M -112 6 q 34 26 68 0" {...line(7)} />
        <path d="M 112 6 q -34 26 -68 0" {...line(7)} />
      </>
    ) : (
      <>
        <ellipse cx={-78} cy={6} rx={26} ry={19} {...line(STROKE - 1)} fill="#ffffff" />
        <ellipse cx={78} cy={6} rx={26} ry={19} {...line(STROKE - 1)} fill="#ffffff" />
        <circle cx={-74} cy={6} r={10} fill={ink} />
        <circle cx={82} cy={6} r={10} fill={ink} />
      </>
    )}
    {/* nose and mouth */}
    <path d="M 0 20 q 18 66 -20 74" {...line(STROKE - 1)} />
    <path d="M -56 168 q 56 34 112 0" {...line(STROKE - 1)} />
  </g>
);

/** Lens ring around a magnified detail — how every close-up is introduced. */
export const Magnifier: React.FC<{
  x: number;
  y: number;
  r: number;
  children: React.ReactNode;
  id: string;
  fill?: string;
}> = ({ x, y, r, children, id, fill = "#ffffff" }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={fill} />
    <g clipPath={`url(#lens-${id})`}>{children}</g>
    <clipPath id={`lens-${id}`}>
      <circle cx={x} cy={y} r={r} />
    </clipPath>
    <circle cx={x} cy={y} r={r} {...line(14, "#8ec6f0")} />
    <circle cx={x} cy={y} r={r} {...line(4)} />
  </g>
);

/** Skin in section: surface, layers, a follicle with its hair and oil gland. */
export const SkinSection: React.FC<{
  y: number;
  follicleX: number;
  children?: React.ReactNode;
  hair?: boolean;
}> = ({ y, follicleX, children, hair = true }) => {
  const top = smooth([
    [-20, y],
    [400, y - 9],
    [900, y + 7],
    [1400, y - 6],
    [1940, y + 5],
  ]);
  return (
    <g>
      <path d={`${top} L 1940 1120 L -20 1120 Z`} fill={skinTop} />
      <path d={`M -20 ${y + 190} L 1940 ${y + 190} L 1940 1120 L -20 1120 Z`} fill={skinMid} />
      <path d={`M -20 ${y + 430} L 1940 ${y + 430} L 1940 1120 L -20 1120 Z`} fill={skinDeep} />
      <path d={top} {...line(STROKE)} />
      <path d={`M -20 ${y + 190} L 1940 ${y + 190}`} {...line(3, "#c99a82")} strokeDasharray="16 14" />
      {/* the follicle: a shaft down into the dermis with a gland beside it */}
      <path
        d={`M ${follicleX - 66} ${y} q -6 200 26 300 q 40 66 100 0 q 32 -100 26 -300 Z`}
        {...line(STROKE - 1)}
        fill="#ffffff"
      />
      <path d={blob(follicleX + 168, y + 214, 96, 17, 0.09)} {...line(STROKE - 1)} fill={sebum} />
      <path d={`M ${follicleX + 96} ${y + 226} q 40 -14 78 -10`} {...line(STROKE - 1)} />
      {hair ? (
        <path d={`M ${follicleX} ${y + 286} q -14 -200 -8 -400`} {...line(12, "#4a3526")} />
      ) : null}
      {children}
    </g>
  );
};

/** Demodex: eight stubby legs bunched at the front, then a long bare tail. */
export const Mite: React.FC<{
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  wiggle?: number;
}> = ({ x, y, scale = 1, rotate = 0, wiggle = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    {/* tail */}
    <path
      d={`M -20 -34 q 90 ${-6 + wiggle} 150 ${-2 + wiggle * 2} q 26 ${34 + wiggle} 0 ${68 + wiggle * 2} q -60 ${4 + wiggle} -150 ${2 + wiggle}Z`}
      {...line(STROKE - 1)}
      fill={miteBody}
    />
    {[0, 1, 2, 3, 4].map((i) => (
      <path
        key={i}
        d={`M ${16 + i * 28} ${-30 + i * 1.5 + wiggle * 0.4} q 6 34 0 66`}
        {...line(3, "#a89273")}
      />
    ))}
    {/* head end */}
    <path d="M -96 -38 q 76 -14 78 0 l 0 76 q -2 14 -78 0 q -18 -38 0 -76 Z" {...line(STROKE - 1)} fill={miteBody} />
    {/* mouthparts */}
    <path d="M -96 -8 l -26 -12 M -96 8 l -26 12" {...line(4)} />
    {/* four pairs of stubby legs */}
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <path d={`M ${-84 + i * 24} 34 q 4 26 -12 38`} {...line(7)} />
        <path d={`M ${-84 + i * 24} -34 q 4 -26 -12 -38`} {...line(7)} />
      </g>
    ))}
  </g>
);

/** Rod-shaped bacterium — Cutibacterium acnes. */
export const Rod: React.FC<{ x: number; y: number; scale?: number; rotate?: number; fill?: string }> = ({
  x,
  y,
  scale = 1,
  rotate = 0,
  fill = "#8fbf7a",
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <rect x={-54} y={-19} width={108} height={38} rx={19} {...line(STROKE - 1)} fill={fill} />
    <path d="M -26 -4 q 22 12 46 -2" {...line(3, "#5f8a4c")} />
  </g>
);

/** Grape-cluster cocci — Staphylococcus. */
export const Cocci: React.FC<{ x: number; y: number; scale?: number; seed?: number; fill?: string }> = ({
  x,
  y,
  scale = 1,
  seed = 5,
  fill = "#e6b84f",
}) => {
  const r = rng(seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {[...Array(7)].map((_, i) => {
        const a = (i / 7) * Math.PI * 2;
        const d = i === 0 ? 0 : 30 + r() * 12;
        return (
          <circle
            key={i}
            cx={Math.cos(a) * d}
            cy={Math.sin(a) * d}
            r={22}
            {...line(STROKE - 1)}
            fill={fill}
          />
        );
      })}
    </g>
  );
};

/** Budding yeast — Malassezia. */
export const Yeast: React.FC<{ x: number; y: number; scale?: number; rotate?: number }> = ({
  x,
  y,
  scale = 1,
  rotate = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <ellipse cx={0} cy={0} rx={44} ry={34} {...line(STROKE - 1)} fill="#d9b7e0" />
    <ellipse cx={52} cy={-20} rx={22} ry={18} {...line(STROKE - 1)} fill="#e6cdeb" />
    <path d="M -14 -8 q 16 12 30 -2" {...line(3, "#a97fb3")} />
  </g>
);

/** Bacteriophage — the one thing up there that looks manufactured. */
export const Phage: React.FC<{ x: number; y: number; scale?: number; rotate?: number }> = ({
  x,
  y,
  scale = 1,
  rotate = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    {/* icosahedral head */}
    <path d="M 0 -96 L 52 -66 L 52 -6 L 0 24 L -52 -6 L -52 -66 Z" {...line(STROKE - 1)} fill="#9fc4ea" />
    <path d="M -52 -66 L 0 -36 L 52 -66 M 0 -36 L 0 24" {...line(3, "#5f83b5")} />
    {/* collar and shaft */}
    <rect x={-16} y={24} width={32} height={16} rx={5} {...line(4)} fill="#c9d9ee" />
    <rect x={-11} y={40} width={22} height={62} rx={5} {...line(4)} fill="#c9d9ee" />
    {/* baseplate and legs */}
    <rect x={-30} y={102} width={60} height={13} rx={5} {...line(4)} fill="#9fc4ea" />
    {[-1, -0.35, 0.35, 1].map((k, i) => (
      <path key={i} d={`M ${k * 26} 115 q ${k * 16} 34 ${k * 42} 46`} {...line(5)} />
    ))}
  </g>
);

/** A strip of pH paper, for the acid-mantle beat. */
export const PhStrip: React.FC<{ x: number; y: number; mark: number }> = ({ x, y, mark }) => {
  const cols = ["#e0341f", "#f07b1f", "#f0c419", "#a8cf4a", "#4aa84a", "#3f9fb8", "#3f63b8"];
  const w = 118;
  return (
    <g>
      {cols.map((c, i) => (
        <rect key={i} x={x + i * w} y={y} width={w} height={90} {...line(3)} fill={c} />
      ))}
      {cols.map((_, i) => (
        <text
          key={i}
          x={x + i * w + w / 2}
          y={y + 138}
          fontFamily="'ComicRelief', 'Comic Sans MS', cursive"
          fontSize={34}
          fill="#6c6c6c"
          textAnchor="middle"
        >
          {i + 2}
        </text>
      ))}
      <path
        d={`M ${x + (mark - 2) * w + w / 2} ${y - 74} l 0 54`}
        {...line(7, ink)}
      />
      <path
        d={`M ${x + (mark - 2) * w + w / 2 - 16} ${y - 36} l 16 20 l 16 -20`}
        {...line(7, ink)}
      />
    </g>
  );
};

/** Scatter helper: deterministic positions inside a box. */
export const scatter = (seed: number, n: number, x0: number, y0: number, x1: number, y1: number) => {
  const r = rng(seed);
  return [...Array(n)].map(() => ({
    x: x0 + r() * (x1 - x0),
    y: y0 + r() * (y1 - y0),
    a: r() * 360,
    s: 0.6 + r() * 0.7,
  }));
};

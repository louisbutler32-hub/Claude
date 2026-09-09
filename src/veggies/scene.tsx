import React from "react";
import { random, useCurrentFrame } from "remotion";
import { bushes, flower, ground, ink, sky, sun, tree } from "./palette";

export const W = 1920;
export const H = 1080;
/** Where the grass strip starts — everything "stands" on this line. */
export const GROUND_Y = 915;

/* ------------------------------------------------------------------ */
/* shared paper + crayon filters                                       */
/* ------------------------------------------------------------------ */

/**
 * Two filters used all over the video:
 *  - `wobble`   nudges vector edges around so nothing looks CAD-straight
 *  - `chalk`    softens fills into a chalky, slightly bleeding edge
 */
export const SceneFilters: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="wobble" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.022"
          numOctaves={3}
          seed={7}
          result="noise"
        />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={5} />
      </filter>
      <filter id="wobbleSoft" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.03"
          numOctaves={2}
          seed={19}
          result="n2"
        />
        <feDisplacementMap in="SourceGraphic" in2="n2" scale={3} />
      </filter>
      <filter id="chalk" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence baseFrequency="0.05" numOctaves={2} seed={3} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={2.4} />
        <feGaussianBlur stdDeviation={0.7} />
      </filter>
      <filter id="paperGrain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves={4}
          seed={11}
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>
  </svg>
);

/** Faint printed-paper tooth laid over the whole frame. */
export const PaperGrain: React.FC<{ opacity?: number }> = ({
  opacity = 0.16,
}) => (
  <svg
    width={W}
    height={H}
    style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity }}
  >
    <rect width={W} height={H} filter="url(#paperGrain)" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* sky                                                                 */
/* ------------------------------------------------------------------ */

export const Sky: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={sky.top} />
        <stop offset="100%" stopColor={sky.bottom} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#skyGrad)" />
  </svg>
);

/** One soft stacked-blob cloud. */
export const Cloud: React.FC<{
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
}> = ({ x, y, scale = 1, opacity = 0.92 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <g filter="url(#chalk)" fill={sky.cloud}>
      <ellipse cx={0} cy={22} rx={130} ry={26} />
      <ellipse cx={-58} cy={8} rx={52} ry={34} />
      <ellipse cx={8} cy={-8} rx={68} ry={46} />
      <ellipse cx={74} cy={10} rx={48} ry={32} />
    </g>
  </g>
);

/** Cloud layer — same three drifting clouds behind every scene. */
export const Clouds: React.FC<{ drift?: number }> = ({ drift = 0 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <Cloud x={330 + drift * 0.6} y={330} scale={1.15} />
    <Cloud x={1180 + drift} y={210} scale={1.0} />
    <Cloud x={760 + drift * 0.4} y={110} scale={0.72} opacity={0.7} />
    <Cloud x={1640 + drift * 0.8} y={470} scale={0.8} opacity={0.75} />
  </svg>
);

/* ------------------------------------------------------------------ */
/* sun                                                                 */
/* ------------------------------------------------------------------ */

/** Scribbled sun in the top-right corner. `happy` closes its eyes. */
export const Sun: React.FC<{ happy?: boolean }> = ({ happy = false }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 26) * 0.02;
  const rays = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const inner = 82;
    const outer = 82 + (i % 2 === 0 ? 44 : 28);
    return (
      <line
        key={i}
        x1={Math.cos(a) * inner}
        y1={Math.sin(a) * inner}
        x2={Math.cos(a) * outer}
        y2={Math.sin(a) * outer}
        stroke={sun.ray}
        strokeWidth={7}
        strokeLinecap="round"
      />
    );
  });

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(1740 165) scale(${pulse})`}>
        <g filter="url(#wobble)">{rays}</g>
        <g filter="url(#chalk)">
          <circle r={72} fill={sun.body} />
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={i}
              x1={-64 + i * 12}
              y1={-62}
              x2={-44 + i * 12}
              y2={62}
              stroke={sun.scribble}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.55}
            />
          ))}
        </g>
        {/* face */}
        <ellipse cx={-46} cy={12} rx={13} ry={9} fill={sun.blush} opacity={0.8} />
        <ellipse cx={46} cy={12} rx={13} ry={9} fill={sun.blush} opacity={0.8} />
        {happy ? (
          <>
            <path
              d="M -34 -6 q 12 -16 24 0"
              stroke={sun.face}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 10 -6 q 12 -16 24 0"
              stroke={sun.face}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <ellipse cx={-22} cy={-6} rx={7} ry={11} fill={sun.face} />
            <ellipse cx={22} cy={-6} rx={7} ry={11} fill={sun.face} />
          </>
        )}
        <path
          d="M -14 16 q 14 16 28 0"
          stroke={sun.face}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* bushes                                                              */
/* ------------------------------------------------------------------ */

/** Bumpy crayon bush — a mound of big rounded lumps under a thick outline. */
export const Bush: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: "dark" | "lite";
  seed?: number;
}> = ({ x, y, w, h, tone = "dark", seed = 1 }) => {
  const line = tone === "dark" ? bushes.darkLine : bushes.liteLine;
  const fill = tone === "dark" ? bushes.darkFill : bushes.liteFill;
  const hatch = tone === "dark" ? bushes.darkHatch : bushes.liteHatch;

  // Rounded lumps built from elliptical arcs of varying width and height,
  // so the top edge reads like something drawn with a fat green crayon
  // rather than a picket fence.
  const bumps = 3;
  const raw = Array.from(
    { length: bumps },
    (_, i) => 0.62 + random(`bw${seed}${i}`) * 0.9
  );
  const total = raw.reduce((a, b) => a + b, 0);
  const widths = raw.map((r) => (r / total) * w);
  const heights = Array.from(
    { length: bumps + 1 },
    (_, i) => h * (0.4 + random(`bh${seed}${i}`) * 0.6)
  );
  let d = `M 0 ${h} L 0 ${h - heights[0] * 0.5}`;
  let cx = 0;
  for (let i = 0; i < bumps; i++) {
    const bw = widths[i];
    const rise = Math.max(heights[i], heights[i + 1]) * 1.05;
    cx += bw;
    d += ` A ${bw / 2} ${rise} 0 0 1 ${cx} ${h - heights[i + 1] * 0.5}`;
  }
  d += ` L ${w} ${h} Z`;

  const clipId = `bushclip${seed}`;
  const hatches = Array.from({ length: Math.round(w / 26) }, (_, i) => {
    const hx = 16 + i * 26 + random(`h${seed}${i}`) * 14;
    const top = h * (0.22 + random(`t${seed}${i}`) * 0.5);
    const len = 46 + random(`hl${seed}${i}`) * 74;
    return (
      <line
        key={i}
        x1={hx}
        y1={top}
        x2={hx - len * 0.5}
        y2={top + len}
        stroke={hatch}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.5}
      />
    );
  });

  return (
    <g transform={`translate(${x} ${y})`} filter="url(#wobble)">
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={fill} stroke={line} strokeWidth={11} strokeLinejoin="round" />
      <g clipPath={`url(#${clipId})`}>{hatches}</g>
      {/* the little squiggles every bush in the reference carries */}
      <path
        d={`M ${w * 0.16} ${h - 46} q 30 -22 58 0 q 28 22 56 0`}
        stroke={line}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        opacity={0.85}
      />
      <path
        d={`M ${w * 0.58} ${h - 30} q 26 -18 50 0`}
        stroke={line}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        opacity={0.7}
      />
    </g>
  );
};

/** The standard two-bush arrangement that opens every round. */
export const BushPair: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <Bush x={20} y={GROUND_Y - 344} w={840} h={344} tone="dark" seed={2} />
    <Bush x={1120} y={GROUND_Y - 246} w={790} h={246} tone="lite" seed={6} />
  </svg>
);

/* ------------------------------------------------------------------ */
/* ground                                                              */
/* ------------------------------------------------------------------ */

export const Grass: React.FC<{ tulips?: boolean }> = ({ tulips = false }) => {
  const blades = Array.from({ length: 70 }, (_, i) => {
    const bx = 10 + i * 28 + random(`gx${i}`) * 18;
    const by = GROUND_Y + 30 + random(`gy${i}`) * 110;
    const lean = (random(`gl${i}`) - 0.5) * 10;
    return (
      <g key={i} stroke={ground.blade} strokeWidth={4.2} strokeLinecap="round">
        <line x1={bx} y1={by} x2={bx + lean - 6} y2={by - 30} />
        <line x1={bx + 9} y1={by} x2={bx + lean + 14} y2={by - 24} />
      </g>
    );
  });

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ground.grassTop} />
          <stop offset="100%" stopColor={ground.grassBottom} />
        </linearGradient>
      </defs>
      <rect
        x={0}
        y={GROUND_Y}
        width={W}
        height={H - GROUND_Y}
        fill="url(#grassGrad)"
      />
      <g filter="url(#wobbleSoft)" opacity={0.8}>
        {blades}
      </g>
      {tulips ? <TulipRow /> : null}
    </svg>
  );
};

/** Pink tulips — they only line the grass while the board is up. */
export const TulipRow: React.FC = () => (
  <g filter="url(#wobbleSoft)">
    {Array.from({ length: 9 }, (_, i) => {
      const tx = 70 + i * 218 + random(`tux${i}`) * 40;
      const ty = GROUND_Y + 120 + random(`tuy${i}`) * 24;
      const s = 0.85 + random(`tus${i}`) * 0.3;
      return (
        <g key={i} transform={`translate(${tx} ${ty}) scale(${s})`}>
          <path
            d="M 0 0 L 0 -54"
            stroke={flower.stem}
            strokeWidth={6}
            strokeLinecap="round"
          />
          <path
            d="M 0 -18 q -30 -14 -40 -40 q 30 2 40 26"
            fill={flower.stem}
            opacity={0.9}
          />
          <path
            d="M 0 -26 q 28 -12 38 -38 q -28 0 -38 24"
            fill={flower.stem}
            opacity={0.9}
          />
          <path
            d="M -26 -56 q 0 -34 26 -34 q 26 0 26 34 q -12 12 -26 12 q -14 0 -26 -12 Z"
            fill={flower.petal}
          />
          <path
            d="M -9 -84 q 9 10 9 30 M 9 -84 q -9 10 -9 30"
            stroke={flower.petalDark}
            strokeWidth={4}
            fill="none"
            opacity={0.55}
          />
        </g>
      );
    })}
  </g>
);

/* ------------------------------------------------------------------ */
/* the big tree                                                        */
/* ------------------------------------------------------------------ */

/** Crayon tree that fills the left edge on the "where it grows" beats. */
export const BigTree: React.FC<{ x?: number; scale?: number }> = ({
  x = 60,
  scale = 1,
}) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <g
      transform={`translate(${x} ${GROUND_Y}) scale(${scale})`}
      filter="url(#wobble)"
    >
      <path
        d="M -120 0 q 20 -140 6 -300 q -2 -70 46 -96 q 40 -22 78 6 q 34 26 26 92 q -16 156 6 298 Z"
        fill={tree.bark}
        stroke={tree.barkLine}
        strokeWidth={9}
        strokeLinejoin="round"
      />
      <path
        d="M -40 -300 q -12 -46 -58 -66 M 30 -330 q 26 -34 66 -34"
        stroke={tree.barkLine}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />
      <g transform="translate(-10 -430)">
        <path
          d="M -300 60 q -50 -70 10 -120 q -30 -90 70 -110 q 30 -80 130 -60 q 70 -50 140 16 q 90 6 74 96 q 46 60 -22 106 q -14 60 -100 46 q -60 40 -134 4 q -110 34 -168 22 Z"
          fill={tree.leafFill}
          stroke={tree.leafLine}
          strokeWidth={10}
          strokeLinejoin="round"
        />
        {Array.from({ length: 22 }, (_, i) => (
          <line
            key={i}
            x1={-280 + i * 26}
            y1={-140 + random(`lh${i}`) * 40}
            x2={-320 + i * 26}
            y2={40 + random(`lh2${i}`) * 30}
            stroke={tree.leafHatch}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.5}
          />
        ))}
      </g>
    </g>
  </svg>
);

/* ------------------------------------------------------------------ */
/* the full standard meadow                                            */
/* ------------------------------------------------------------------ */

export const Meadow: React.FC<{
  tulips?: boolean;
  happySun?: boolean;
  drift?: number;
  bushes?: boolean;
}> = ({ tulips = false, happySun = false, drift = 0, bushes: showBushes = true }) => (
  <>
    <Sky />
    <Clouds drift={drift} />
    <Sun happy={happySun} />
    {showBushes ? <BushPair /> : null}
    <Grass tulips={tulips} />
  </>
);

export const inkColor = ink;

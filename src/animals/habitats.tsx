import React from "react";
import { random } from "remotion";
import { ground } from "../guess/palette";
import { GROUND_Y, H, W } from "../guess/scene";

/**
 * "Where it lives" — one composed place per animal, rather than the row of
 * plants the vegetable episode uses. Each is built from a small kit of
 * props so twelve scenes stay in one visual language.
 */

const OUT = "#8a6a4e";
const LEAF = "#5aa84f";
const LEAF_DK = "#43893c";
const WOOD = "#c39a63";
const WOOD_DK = "#a3794a";
const WATER = "#8ec9dd";
const WATER_DK = "#63a9c2";

/* ── props ────────────────────────────────────────────────────────── */

const Fence: React.FC<{ x: number; w?: number; s?: number }> = ({
  x,
  w = 620,
  s = 1,
}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <g stroke={WOOD_DK} strokeWidth={7} strokeLinecap="round">
      <path d={`M 0 -14 L ${w} -14`} />
      <path d={`M 0 -74 L ${w} -74`} />
    </g>
    {Array.from({ length: Math.round(w / 130) + 1 }, (_, i) => (
      <path
        key={i}
        d={`M ${i * 130} 16 L ${i * 130} -116 l 12 -18 l 12 18 L ${
          i * 130 + 24
        } 16 Z`}
        fill={WOOD}
        stroke={WOOD_DK}
        strokeWidth={5}
        strokeLinejoin="round"
      />
    ))}
  </g>
);

const Barn: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -170 0 L -170 -170 L 0 -260 L 170 -170 L 170 0 Z" fill="#d4665c" stroke="#a84a42" strokeWidth={8} strokeLinejoin="round" />
    <path d="M -186 -168 L 0 -272 L 186 -168" fill="none" stroke="#a84a42" strokeWidth={12} strokeLinecap="round" />
    <path d="M -56 0 L -56 -118 q 56 -30 112 0 L 56 0 Z" fill="#f2ece0" stroke="#a84a42" strokeWidth={7} strokeLinejoin="round" />
    <path d="M -56 -70 L 56 -70 M 0 -118 L 0 0" stroke="#a84a42" strokeWidth={6} />
    <circle cx={0} cy={-186} r={26} fill="#f2ece0" stroke="#a84a42" strokeWidth={6} />
  </g>
);

const Pond: React.FC<{ x: number; w?: number; s?: number }> = ({
  x,
  w = 900,
  s = 1,
}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <ellipse cx={0} cy={40} rx={w / 2} ry={92} fill={WATER} stroke={WATER_DK} strokeWidth={8} />
    <g stroke="#b6e0ee" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.8}>
      <path d={`M ${-w / 4} 20 q 40 -14 80 0`} />
      <path d={`M ${w / 8} 54 q 40 -14 80 0`} />
      <path d={`M ${-w / 3} 66 q 34 -12 68 0`} />
    </g>
  </g>
);

const Reeds: React.FC<{ x: number; n?: number; s?: number }> = ({
  x,
  n = 5,
  s = 1,
}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    {Array.from({ length: n }, (_, i) => {
      const rx = i * 34 + random(`reed${i}`) * 16;
      const h = 130 + random(`reedh${i}`) * 80;
      return (
        <g key={i}>
          <path d={`M ${rx} 10 q ${6 - i} ${-h / 2} 0 ${-h}`} stroke={LEAF_DK} strokeWidth={7} fill="none" strokeLinecap="round" />
          <ellipse cx={rx} cy={-h - 14} rx={11} ry={26} fill="#8a5a34" />
        </g>
      );
    })}
  </g>
);

const LilyPad: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 0 m -54 0 a 54 54 0 1 1 108 0 a 54 54 0 1 1 -108 0" fill={LEAF} opacity={0} />
    <path d="M -54 0 a 54 30 0 1 0 108 0 a 54 30 0 1 0 -108 0" fill={LEAF} stroke={LEAF_DK} strokeWidth={4} />
    <path d="M 0 0 L 40 -14" stroke="#dceaee" strokeWidth={7} />
  </g>
);

const Kennel: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -120 0 L -120 -120 L 0 -206 L 120 -120 L 120 0 Z" fill={WOOD} stroke={WOOD_DK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -134 -118 L 0 -216 L 134 -118" fill="none" stroke="#b06a4a" strokeWidth={14} strokeLinecap="round" />
    <path d="M -46 0 L -46 -84 q 46 -40 92 0 L 46 0 Z" fill="#6b4a34" />
  </g>
);

const House: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <rect x={-160} y={-220} width={320} height={220} rx={12} fill="#f2e3c8" stroke={OUT} strokeWidth={8} />
    <path d="M -196 -216 L 0 -340 L 196 -216 Z" fill="#d4665c" stroke="#a84a42" strokeWidth={8} strokeLinejoin="round" />
    <rect x={-118} y={-172} width={92} height={82} rx={8} fill="#9fd4ea" stroke={OUT} strokeWidth={7} />
    <path d="M -72 -172 L -72 -90 M -118 -131 L -26 -131" stroke={OUT} strokeWidth={6} />
    <rect x={36} y={-140} width={90} height={140} rx={8} fill="#b0774f" stroke={OUT} strokeWidth={7} />
    <circle cx={54} cy={-70} r={7} fill="#f3c93f" />
  </g>
);

const Acacia: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -22 0 q -8 -140 -4 -220 q -30 -30 -50 -40 M 18 -230 q 34 -22 56 -30" stroke="#a37c50" strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d="M -200 -260 q 40 -70 200 -70 q 160 0 200 70 q -40 40 -200 40 q -160 0 -200 -40 Z" fill="#7fb865" stroke="#4e8f45" strokeWidth={8} strokeLinejoin="round" />
  </g>
);

const Rocks: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -160 0 q 20 -96 90 -96 q 74 0 92 96 Z" fill="#b6a894" stroke="#8d8070" strokeWidth={7} strokeLinejoin="round" />
    <path d="M 40 0 q 16 -62 70 -62 q 52 0 62 62 Z" fill="#c8bba7" stroke="#8d8070" strokeWidth={7} strokeLinejoin="round" />
  </g>
);

const HollowTree: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -78 0 q 16 -160 4 -280 q -4 -60 74 -60 q 78 0 74 60 q -12 120 4 280 Z" fill="#c88a5a" stroke="#a5663c" strokeWidth={8} strokeLinejoin="round" />
    <ellipse cx={0} cy={-150} rx={44} ry={58} fill="#6b4a34" />
    <path d="M -220 -350 q 30 -110 220 -110 q 190 0 220 110 q -30 76 -220 76 q -190 0 -220 -76 Z" fill="#8cc47a" stroke="#33a05a" strokeWidth={9} strokeLinejoin="round" />
  </g>
);

const Iceberg: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -260 20 q 40 -70 110 -70 q 30 -80 90 -80 q 60 0 86 80 q 70 4 104 70 Z" fill="#eaf6fa" stroke="#a9cfdd" strokeWidth={8} strokeLinejoin="round" />
    <path d="M -60 -128 q 26 40 20 148 M 40 -60 q 14 40 10 80" stroke="#c6e4ee" strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);

const Mud: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <ellipse cx={0} cy={34} rx={300} ry={62} fill={ground.soil} stroke={ground.soilDark} strokeWidth={7} />
    <g fill={ground.soilDark} opacity={0.5}>
      <ellipse cx={-120} cy={26} rx={42} ry={12} />
      <ellipse cx={60} cy={44} rx={54} ry={13} />
    </g>
  </g>
);

const Seaweed: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    {[0, 46, 92].map((dx, i) => (
      <path
        key={i}
        d={`M ${dx} 30 q ${i % 2 ? 34 : -34} -60 0 -120 q ${
          i % 2 ? -30 : 30
        } -50 6 -84`}
        stroke="#4e8f45"
        strokeWidth={13}
        fill="none"
        strokeLinecap="round"
      />
    ))}
  </g>
);

/* ── the twelve places ────────────────────────────────────────────── */

const SCENES: Record<string, React.FC> = {
  cow: () => (
    <>
      <Barn x={400} s={1.7} />
      <Fence x={780} w={1300} s={1.5} />
    </>
  ),
  duck: () => (
    <>
      <Pond x={1040} w={1500} s={1.3} />
      <Reeds x={200} n={5} s={1.9} />
      <Reeds x={1700} n={4} s={1.7} />
      <LilyPad x={720} y={60} s={1.5} />
      <LilyPad x={1380} y={96} s={1.7} />
    </>
  ),
  pig: () => (
    <>
      <Mud x={900} s={1.7} />
      <Fence x={100} w={1700} s={1.5} />
    </>
  ),
  sheep: () => (
    <>
      <Fence x={60} w={1800} s={1.55} />
      <Barn x={1660} s={1.05} />
    </>
  ),
  cat: () => <House x={620} s={1.5} />,
  dog: () => (
    <>
      <Kennel x={520} s={1.8} />
      <Fence x={1000} w={1000} s={1.4} />
    </>
  ),
  elephant: () => (
    <>
      <Acacia x={440} s={1.6} />
      <Acacia x={1620} s={1.05} />
      <Rocks x={1120} s={1.3} />
    </>
  ),
  lion: () => (
    <>
      <Rocks x={520} s={2.1} />
      <Acacia x={1520} s={1.5} />
    </>
  ),
  frog: () => (
    <>
      <Pond x={960} w={1600} s={1.3} />
      <LilyPad x={580} y={54} s={1.9} />
      <LilyPad x={1300} y={92} s={1.6} />
      <Reeds x={1620} n={5} s={1.9} />
    </>
  ),
  owl: () => (
    <>
      <HollowTree x={520} s={1.35} />
      <HollowTree x={1660} s={0.9} />
    </>
  ),
  fish: () => (
    <>
      <Pond x={960} w={1860} s={1.35} />
      <Seaweed x={220} s={1.7} />
      <Seaweed x={1500} s={1.45} />
      <Reeds x={1780} n={3} s={1.6} />
    </>
  ),
  penguin: () => (
    <>
      <Pond x={1220} w={1300} s={1.3} />
      <Iceberg x={520} s={1.6} />
    </>
  ),
};

/** The place one animal lives, sitting on the grass line. */
export const AnimalHabitat: React.FC<{ id: string; x?: number }> = ({
  id,
  x = 0,
}) => {
  const Scene = SCENES[id];
  if (!Scene) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} ${GROUND_Y + 26})`} filter="url(#wobbleSoft)">
        <Scene />
      </g>
    </svg>
  );
};

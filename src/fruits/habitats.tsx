import React from "react";
import { random } from "remotion";
import { ground } from "../guess/palette";
import { GROUND_Y, H, W } from "../guess/scene";

/**
 * "Where it grows" — the plant each fruit comes off, drawn as a row along
 * the horizon, the same trick as src/veggies/habitats.tsx.
 */

const LEAF = "#5aa84f";
const LEAF_DK = "#43893c";
const LEAF_LT = "#7cc25c";
const WOOD = "#a5754a";
const WOOD_DK = "#835a36";

/** Repeat a plant across the frame with a bit of scatter. */
const Row: React.FC<{
  n: number;
  base: number;
  from?: number;
  to?: number;
  seed: string;
  render: (i: number, x: number, s: number) => React.ReactNode;
}> = ({ n, base, from = 130, to = W - 130, seed, render }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = from + t * (to - from) + (random(`${seed}x${i}`) - 0.5) * 60;
      const s = base * (0.84 + random(`${seed}s${i}`) * 0.34);
      return <g key={i}>{render(i, x, s)}</g>;
    })}
  </>
);

/** Trunk + three leaf clusters shared by every tree fruit — the fruit
 *  itself is passed in so each tree still reads as its own plant. */
const FruitTree: React.FC<{ fruit: React.ReactNode }> = ({ fruit }) => (
  <g>
    <path d="M 0 0 L -6 -140" stroke={WOOD_DK} strokeWidth={14} strokeLinecap="round" />
    <g fill={LEAF}>
      <path d="M -10 -70 q -76 -30 -100 10 q 64 40 102 10 Z" />
      <path d="M 8 -140 q 80 -28 106 14 q -66 40 -108 8 Z" />
      <path d="M -8 -180 q -60 -20 -80 14 q 54 30 82 6 Z" />
      <path d="M 4 -110 q 60 -20 80 14 q -54 30 -82 6 Z" fill={LEAF_LT} />
    </g>
    {fruit}
  </g>
);

const AppleTree: React.FC = () => (
  <FruitTree
    fruit={
      <g fill="#e0433c" stroke="#b8332c" strokeWidth={4}>
        <circle cx={-38} cy={-96} r={22} />
        <circle cx={40} cy={-140} r={20} />
        <circle cx={-6} cy={-160} r={19} />
      </g>
    }
  />
);

const OrangeTree: React.FC = () => (
  <FruitTree
    fruit={
      <g fill="#f3941c" stroke="#d97b0f" strokeWidth={4}>
        <circle cx={-36} cy={-98} r={21} />
        <circle cx={38} cy={-138} r={20} />
        <circle cx={-4} cy={-162} r={19} />
      </g>
    }
  />
);

const MangoTree: React.FC = () => (
  <FruitTree
    fruit={
      <g fill="#ef8a3c" stroke="#c96a22" strokeWidth={4}>
        <path d="M -40 -110 q -18 -24 0 -42 q 18 18 0 42 q 20 26 0 48 q -20 -22 0 -48 Z" />
        <path d="M 34 -150 q -16 -22 0 -38 q 16 16 0 38 q 18 24 0 44 q -18 -20 0 -44 Z" />
      </g>
    }
  />
);

const CherryTree: React.FC = () => (
  <FruitTree
    fruit={
      <g>
        <path d="M -34 -100 q 4 20 4 28 M 36 -142 q -4 20 -4 28" stroke="#8a3a2a" strokeWidth={3} fill="none" />
        <g fill="#c8253a" stroke="#9c1c2c" strokeWidth={3}>
          <circle cx={-38} cy={-92} r={13} />
          <circle cx={-26} cy={-88} r={13} />
          <circle cx={32} cy={-134} r={13} />
          <circle cx={44} cy={-130} r={13} />
        </g>
      </g>
    }
  />
);

const PeachTree: React.FC = () => (
  <FruitTree
    fruit={
      <g fill="#f5b58a" stroke="#e0895a" strokeWidth={4}>
        <circle cx={-38} cy={-96} r={23} />
        <circle cx={40} cy={-140} r={21} />
        <path d="M -38 -119 q 4 12 0 24 M 40 -161 q 4 12 0 22" stroke="#e0895a" strokeWidth={3} />
      </g>
    }
  />
);

const PearTree: React.FC = () => (
  <FruitTree
    fruit={
      <g fill="#c4d96a" stroke="#a3b64f" strokeWidth={4}>
        <path d="M -38 -128 q -16 14 -8 30 q 8 18 24 18 q 16 0 20 -18 q 4 -18 -12 -28 q 2 -10 -6 -16 q -8 4 -18 14 Z" />
        <path d="M 36 -168 q -14 12 -6 26 q 6 16 22 16 q 14 0 18 -16 q 4 -16 -10 -24 q 2 -8 -6 -14 q -6 4 -18 12 Z" />
      </g>
    }
  />
);

const StrawberryPatch: React.FC = () => (
  <g>
    <g fill={LEAF}>
      <path d="M 0 0 q -50 -20 -66 6 q 42 26 68 6 Z" />
      <path d="M 0 0 q 50 -20 66 6 q -42 26 -68 6 Z" />
      <path d="M 0 0 q -8 -46 10 -60 q 18 14 10 60 Z" />
    </g>
    <g>
      <path d="M -30 -16 q -20 6 -18 30 q 2 26 24 30 q 22 4 26 -20 q 4 -24 -12 -36 q -6 -10 -20 -4 Z" fill="#e0433c" stroke="#b8332c" strokeWidth={3.5} />
      <path d="M -30 -22 q -8 -6 -16 -2 q 4 8 16 8 Z M -30 -22 q 8 -6 16 -2 q -4 8 -16 8 Z" fill={LEAF} />
      <g fill="#f8d9c8">
        <circle cx={-36} cy={-4} r={2} /><circle cx={-24} cy={0} r={2} /><circle cx={-30} cy={10} r={2} />
      </g>
    </g>
  </g>
);

const GrapeVine: React.FC = () => (
  <g>
    <g stroke={WOOD} strokeWidth={8} strokeLinecap="round">
      <path d="M -70 0 L -70 -220 M 70 0 L 70 -220 M -78 -200 L 78 -200" />
    </g>
    <path d="M -70 -20 q 40 -60 0 -110 q -40 -50 10 -92" stroke={LEAF_DK} strokeWidth={7} fill="none" strokeLinecap="round" />
    <g fill={LEAF}>
      <path d="M -50 -60 q -50 -22 -60 8 q 46 26 62 6 Z" />
      <path d="M -20 -150 q 54 -20 68 10 q -50 26 -70 4 Z" />
    </g>
    <g fill="#7a4f9e" stroke="#5f3b7d" strokeWidth={3}>
      {[[6, -100], [-6, -86], [16, -86], [-2, -70], [10, -58]].map(([dx, dy], i) => (
        <circle key={i} cx={dx} cy={dy} r={12} />
      ))}
    </g>
  </g>
);

const KiwiVine: React.FC = () => (
  <g>
    <g stroke={WOOD} strokeWidth={8} strokeLinecap="round">
      <path d="M -70 0 L -70 -220 M 70 0 L 70 -220 M -78 -190 L 78 -190" />
    </g>
    <path d="M -70 -20 q 44 -56 4 -104 q -38 -48 8 -86" stroke={LEAF_DK} strokeWidth={7} fill="none" strokeLinecap="round" />
    <g fill={LEAF_LT}>
      <path d="M -44 -66 q -52 -20 -60 10 q 48 24 62 4 Z" />
      <path d="M -14 -142 q 56 -18 68 12 q -52 24 -70 2 Z" />
    </g>
    <g fill="#8a6a3a" stroke="#6d5228" strokeWidth={3}>
      <ellipse cx={4} cy={-96} rx={15} ry={19} />
      <ellipse cx={-16} cy={-72} rx={14} ry={18} />
      <ellipse cx={20} cy={-58} rx={14} ry={18} />
    </g>
  </g>
);

const WatermelonVine: React.FC = () => (
  <g>
    <path d="M -120 -6 q 40 -50 110 -30 q 70 20 130 -14" stroke={LEAF_DK} strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M -60 -34 q -50 -60 -6 -84 q 52 -26 74 24 q 20 46 -22 62 q -30 12 -46 -2 Z" fill={LEAF} />
    <path d="M 70 -30 q -46 -56 -2 -78 q 48 -24 68 22 q 18 44 -22 58 q -28 10 -44 -2 Z" fill={LEAF_LT} />
    <ellipse cx={10} cy={-40} rx={62} ry={44} fill="#3f9450" stroke="#2e7a3d" strokeWidth={4} />
    <g stroke="#2e7a3d" strokeWidth={5} fill="none" opacity={0.6}>
      <path d="M -30 -66 q 30 40 10 76 M 10 -82 q 20 44 6 84 M 46 -70 q 12 44 -6 78" />
    </g>
  </g>
);

const PineapplePlant: React.FC = () => (
  <g>
    <g fill={LEAF_DK}>
      {[-30, -12, 6, 24, 42].map((deg, i) => (
        <path
          key={i}
          d="M 0 0 q -14 -60 -4 -120 q 14 60 4 120 Z"
          transform={`rotate(${deg - 6})`}
        />
      ))}
    </g>
    <ellipse cx={0} cy={-58} rx={40} ry={54} fill="#d9a441" stroke="#b8842f" strokeWidth={4} />
    <g stroke="#b8842f" strokeWidth={3} fill="none" opacity={0.7}>
      <path d="M -28 -92 q 28 14 56 0 M -30 -60 q 30 14 60 0 M -28 -28 q 28 14 56 0" />
    </g>
  </g>
);

const BananaPlant: React.FC = () => (
  <g>
    <path d="M 0 0 q -4 -140 4 -260" stroke="#7cae4e" strokeWidth={16} fill="none" strokeLinecap="round" />
    <g fill="#8fc35c">
      <path d="M 2 -220 q -90 -40 -130 -6 q 70 50 132 24 Z" />
      <path d="M -2 -260 q 90 -36 128 0 q -66 46 -128 20 Z" />
      <path d="M 4 -190 q -78 -34 -112 -2 q 60 42 114 20 Z" />
    </g>
    <g transform="translate(-10 -150)">
      <path d="M 0 0 q -6 40 6 70" stroke="#6b4a34" strokeWidth={6} fill="none" strokeLinecap="round" />
      {[0, 22, 44, 64].map((dy, i) => (
        <path
          key={i}
          d={`M -6 ${dy} q -30 6 -34 26 q 4 20 34 16 q 30 4 34 -16 q -4 -20 -34 -26 Z`}
          fill="#f3d34a"
          stroke="#d9b32e"
          strokeWidth={3}
        />
      ))}
    </g>
  </g>
);

/* ------------------------------------------------------------------ */

const HABITAT_PLANT: Record<string, React.FC> = {
  apple: AppleTree,
  banana: BananaPlant,
  orange: OrangeTree,
  strawberry: StrawberryPatch,
  grape: GrapeVine,
  watermelon: WatermelonVine,
  pineapple: PineapplePlant,
  kiwi: KiwiVine,
  mango: MangoTree,
  cherry: CherryTree,
  peach: PeachTree,
  pear: PearTree,
};

const HABITAT_COUNT: Record<string, number> = {
  apple: 3,
  banana: 2,
  orange: 3,
  strawberry: 5,
  grape: 3,
  watermelon: 3,
  pineapple: 3,
  kiwi: 3,
  mango: 3,
  cherry: 4,
  peach: 3,
  pear: 3,
};

const NEEDS_BED = ["strawberry", "watermelon", "pineapple"];

const HABITAT_SCALE: Record<string, number> = {
  apple: 1.75,
  banana: 1.5,
  orange: 1.75,
  strawberry: 1.5,
  grape: 1.8,
  watermelon: 1.9,
  pineapple: 1.8,
  kiwi: 1.8,
  mango: 1.7,
  cherry: 1.7,
  peach: 1.75,
  pear: 1.7,
};

/**
 * The plant row for one fruit, sitting on the grass line. `x` shifts the
 * whole row so it can drift with the camera.
 */
export const FruitHabitat: React.FC<{ id: string; x?: number }> = ({
  id,
  x = 0,
}) => {
  const Plant = HABITAT_PLANT[id];
  if (!Plant) return null;
  const n = HABITAT_COUNT[id];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} ${GROUND_Y + 30})`} filter="url(#wobbleSoft)">
        {NEEDS_BED.includes(id) ? (
          <rect
            x={-260}
            y={-16}
            width={W + 520}
            height={74}
            rx={26}
            fill={ground.soil}
          />
        ) : null}
        <Row
          n={n}
          base={HABITAT_SCALE[id]}
          seed={id}
          render={(i, px, s) => (
            <g
              transform={`translate(${px} 0) scale(${s}) rotate(${
                (random(`${id}r${i}`) - 0.5) * 8
              })`}
            >
              <Plant />
            </g>
          )}
        />
      </g>
    </svg>
  );
};

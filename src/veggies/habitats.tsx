import React from "react";
import { random } from "remotion";
import { GROUND_Y, H, W } from "./scene";
import { ground } from "./palette";
import type { VeggieId } from "./veggies";

/**
 * "Where it grows" — the plant each vegetable comes off, drawn as a row
 * along the horizon. This is the beat that replaces the fruit video's
 * apple tree / banana palm / vineyard shots.
 */

const LEAF = "#5aa84f";
const LEAF_DK = "#43893c";
const LEAF_LT = "#7cc25c";
const OUT = "#3d7f36";

/** A little heap of turned soil for the root crops. */
const SoilMound: React.FC<{ x: number; w?: number }> = ({ x, w = 240 }) => (
  <path
    d={`M ${x - w / 2} 0 q ${w / 4} -46 ${w / 2} -46 q ${w / 4} 0 ${
      w / 2
    } 46 Z`}
    fill={ground.soil}
    stroke={ground.soilDark}
    strokeWidth={6}
    strokeLinejoin="round"
  />
);

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

const CarrotTops: React.FC = () => (
  <g>
    <path d="M 0 0 q -8 -60 -4 -96" stroke={LEAF_DK} strokeWidth={7} fill="none" strokeLinecap="round" />
    <path d="M -2 -40 q -44 -18 -60 -70 q 40 -4 62 44 Z" fill={LEAF} />
    <path d="M 2 -46 q 44 -18 60 -70 q -40 -4 -62 44 Z" fill={LEAF_LT} />
    <path d="M -1 -60 q -12 -40 -2 -70 q 14 34 6 72 Z" fill={LEAF_DK} />
    <path d="M -22 -6 q 22 -8 44 0 q -6 20 -22 20 q -16 0 -22 -20 Z" fill="#ef8a3c" />
  </g>
);

const CornStalk: React.FC = () => (
  <g>
    <path d="M 0 0 q -6 -160 2 -300" stroke="#6fae4e" strokeWidth={12} fill="none" strokeLinecap="round" />
    <path d="M -2 -80 q -80 -30 -116 -6 q 62 42 116 26 Z" fill={LEAF} />
    <path d="M 2 -140 q 82 -34 118 -8 q -64 44 -118 28 Z" fill={LEAF_LT} />
    <path d="M -2 -200 q -74 -26 -104 0 q 56 38 104 22 Z" fill={LEAF} />
    <path d="M 2 -252 q 66 -26 96 -4 q -52 36 -96 20 Z" fill={LEAF_LT} />
    <g transform="translate(24 -168) rotate(16)">
      <path d="M 0 0 q 24 0 24 34 q 0 44 -24 60 q -24 -16 -24 -60 q 0 -34 24 -34 Z" fill="#f3c93f" />
      <path d="M -16 -6 q 16 -22 34 -2 q -14 44 -20 96 q -16 -46 -14 -94 Z" fill={LEAF} opacity={0.85} />
    </g>
  </g>
);

const TomatoPlant: React.FC = () => (
  <g>
    <path d="M 26 0 L 20 -230" stroke="#c39a63" strokeWidth={9} strokeLinecap="round" />
    <path d="M 0 0 q -10 -100 -2 -180" stroke={LEAF_DK} strokeWidth={9} fill="none" strokeLinecap="round" />
    <g fill={LEAF}>
      <path d="M -4 -60 q -64 -18 -86 12 q 56 30 88 6 Z" />
      <path d="M 2 -120 q 66 -16 88 16 q -58 28 -90 4 Z" />
      <path d="M -2 -168 q -56 -16 -76 12 q 50 26 78 4 Z" />
    </g>
    <g fill="#ea5b52" stroke="#d4453e" strokeWidth={4}>
      <circle cx={-40} cy={-46} r={22} />
      <circle cx={44} cy={-104} r={19} />
      <circle cx={-16} cy={-136} r={17} />
    </g>
    <g stroke={LEAF_DK} strokeWidth={4} fill="none">
      <path d="M -40 -66 q 2 -12 -6 -18 M 44 -122 q 2 -12 -6 -16" />
    </g>
  </g>
);

const PumpkinVine: React.FC = () => (
  <g>
    <path d="M -120 -6 q 40 -50 110 -30 q 70 20 130 -14" stroke={LEAF_DK} strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M -60 -34 q -50 -60 -6 -84 q 52 -26 74 24 q 20 46 -22 62 q -30 12 -46 -2 Z" fill={LEAF} />
    <path d="M 70 -30 q -46 -56 -2 -78 q 48 -24 68 22 q 18 44 -22 58 q -28 10 -44 -2 Z" fill={LEAF_LT} />
    <path d="M 10 -40 q -8 -34 16 -46" stroke={LEAF_DK} strokeWidth={6} fill="none" strokeLinecap="round" />
    <g fill="#ef8f3c" stroke="#d97724" strokeWidth={4}>
      <ellipse cx={0} cy={-26} rx={44} ry={30} />
      <ellipse cx={-28} cy={-26} rx={20} ry={28} />
      <ellipse cx={28} cy={-26} rx={20} ry={28} />
    </g>
    <path d="M 0 -54 q -4 -14 8 -20" stroke="#7d6034" strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);

const PepperBush: React.FC = () => (
  <g>
    <path d="M 0 0 q -6 -80 0 -140" stroke={LEAF_DK} strokeWidth={9} fill="none" strokeLinecap="round" />
    <g fill={LEAF}>
      <path d="M -2 -56 q -58 -22 -80 8 q 52 30 82 8 Z" />
      <path d="M 2 -108 q 60 -20 82 10 q -54 30 -84 6 Z" />
      <path d="M -2 -138 q -46 -16 -62 10 q 42 22 64 2 Z" />
    </g>
    <g fill="#ea5a4d" stroke="#d1443c" strokeWidth={4}>
      <path d="M -36 -40 q 26 -10 34 8 q 6 24 -14 32 q -22 8 -26 -14 q -2 -18 6 -26 Z" />
      <path d="M 40 -92 q 24 -8 30 8 q 6 22 -14 28 q -20 6 -22 -14 q -2 -16 6 -22 Z" />
    </g>
  </g>
);

const CucumberTrellis: React.FC = () => (
  <g>
    <g stroke="#c39a63" strokeWidth={8} strokeLinecap="round">
      <path d="M -70 0 L -70 -220 M 70 0 L 70 -220 M -78 -200 L 78 -200 M -78 -120 L 78 -120" />
    </g>
    <path d="M -70 -20 q 40 -60 0 -110 q -40 -50 10 -92" stroke={LEAF_DK} strokeWidth={7} fill="none" strokeLinecap="round" />
    <g fill={LEAF}>
      <path d="M -50 -60 q -50 -22 -60 8 q 46 26 62 6 Z" />
      <path d="M -20 -150 q 54 -20 68 10 q -50 26 -70 4 Z" />
      <path d="M 20 -196 q -46 -16 -60 10 q 42 22 62 2 Z" />
    </g>
    <g fill="#5da648" stroke="#478c37" strokeWidth={4}>
      <path d="M 6 -110 q 16 0 16 24 q 0 42 -16 58 q -16 -16 -16 -58 q 0 -24 16 -24 Z" />
      <path d="M -46 -172 q 14 0 14 20 q 0 34 -14 46 q -14 -12 -14 -46 q 0 -20 14 -20 Z" />
    </g>
    <path d="M 40 -140 q 14 -14 4 -26 q -10 -12 4 -20" stroke={LEAF_DK} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

const PotatoPlant: React.FC = () => (
  <g>
    <SoilMound x={0} w={260} />
    <path d="M 0 -34 q -6 -60 0 -110" stroke={LEAF_DK} strokeWidth={8} fill="none" strokeLinecap="round" />
    <g fill={LEAF}>
      <path d="M -2 -70 q -60 -22 -82 8 q 54 30 84 8 Z" />
      <path d="M 2 -114 q 62 -20 84 10 q -56 30 -86 6 Z" />
      <path d="M -2 -142 q -44 -14 -58 10 q 40 20 60 2 Z" />
    </g>
    <g fill="#cfa26b" stroke="#b88a55" strokeWidth={4} opacity={0.95}>
      <ellipse cx={-56} cy={-14} rx={26} ry={18} transform="rotate(-14 -56 -14)" />
      <ellipse cx={52} cy={-8} rx={22} ry={15} transform="rotate(10 52 -8)" />
    </g>
  </g>
);

const OnionRow: React.FC = () => (
  <g>
    <SoilMound x={0} w={200} />
    <path d="M -34 -34 q 96 22 68 -104" stroke={LEAF_DK} strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d="M 0 -34 q -14 -80 -46 -110" stroke={LEAF} strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d="M 16 -34 q 32 -60 74 -80" stroke={LEAF_LT} strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d="M 0 -30 q 52 12 52 44 q 0 30 -52 30 q -52 0 -52 -30 q 0 -32 52 -44 Z" fill="#c78bbd" stroke="#ab6ea3" strokeWidth={4} />
  </g>
);

const EggplantBush: React.FC = () => (
  <g>
    <path d="M 0 0 q -6 -80 0 -132" stroke={LEAF_DK} strokeWidth={9} fill="none" strokeLinecap="round" />
    <g fill={LEAF}>
      <path d="M -2 -50 q -66 -24 -88 8 q 58 32 90 8 Z" />
      <path d="M 2 -100 q 66 -22 88 10 q -60 32 -90 6 Z" />
      <path d="M -2 -132 q -48 -16 -64 10 q 44 22 66 2 Z" />
    </g>
    <g fill="#8b58b3" stroke="#71429a" strokeWidth={4}>
      <path d="M -42 -34 q 24 -6 28 20 q 4 30 -18 36 q -24 6 -28 -22 q -2 -26 18 -34 Z" />
      <path d="M 46 -86 q 20 -6 24 16 q 4 26 -16 30 q -20 4 -22 -18 q -2 -22 14 -28 Z" />
    </g>
  </g>
);

const PeaTrellis: React.FC = () => (
  <g>
    <g stroke="#c39a63" strokeWidth={7} strokeLinecap="round">
      <path d="M -50 0 L -50 -190 M 50 0 L 50 -190 M 0 -6 L 0 -190" />
      <path d="M -58 -170 L 58 -170 M -58 -100 L 58 -100" />
    </g>
    <path d="M -50 -20 q 44 -46 0 -96 q -42 -46 8 -80" stroke={LEAF_DK} strokeWidth={6} fill="none" strokeLinecap="round" />
    <g fill={LEAF}>
      <path d="M -34 -54 q -44 -18 -54 6 q 42 24 56 4 Z" />
      <path d="M -6 -126 q 48 -16 60 10 q -46 24 -62 2 Z" />
      <path d="M 24 -170 q -40 -14 -52 8 q 36 20 54 2 Z" />
    </g>
    <g fill="#77b755" stroke="#5e9c42" strokeWidth={4}>
      <path d="M 10 -84 q 30 -6 34 16 q 4 20 -26 26 q -28 6 -32 -14 q -4 -22 24 -28 Z" />
      <path d="M -40 -142 q 26 -6 30 12 q 4 18 -22 22 q -24 4 -28 -12 q -4 -18 20 -22 Z" />
    </g>
    <path d="M 40 -60 q 16 -12 6 -24 q -10 -12 6 -20" stroke={LEAF_DK} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

const BroccoliPlant: React.FC = () => (
  <g>
    <path d="M 0 0 q -4 -50 0 -84" stroke="#b7d48c" strokeWidth={16} fill="none" strokeLinecap="round" />
    <g fill={LEAF}>
      <path d="M -4 -34 q -78 -26 -102 8 q 68 36 104 10 Z" />
      <path d="M 4 -46 q 78 -24 100 12 q -68 34 -102 8 Z" />
    </g>
    <g fill="#4a9450">
      <circle cx={-32} cy={-98} r={26} />
      <circle cx={-2} cy={-118} r={30} />
      <circle cx={30} cy={-100} r={25} />
      <circle cx={-14} cy={-84} r={24} />
      <circle cx={18} cy={-80} r={22} />
    </g>
  </g>
);

const MushroomLog: React.FC = () => (
  <g>
    <g fill="#c08a5c" stroke="#a06f45" strokeWidth={6} strokeLinejoin="round">
      <path d="M -170 0 q -14 -54 14 -58 l 300 0 q 26 6 14 58 Z" />
      <ellipse cx={144} cy={-30} rx={20} ry={28} />
    </g>
    <ellipse cx={144} cy={-30} rx={11} ry={17} fill="#a06f45" />
    <g fill="#7cc25c" opacity={0.85}>
      <path d="M -140 -54 q 40 -18 90 -2 q 46 -16 90 0 q -90 12 -180 2 Z" />
    </g>
    <g>
      {[-96, -20, 56].map((x, i) => (
        <g key={i} transform={`translate(${x} -34) scale(${0.62 + i * 0.16})`}>
          <path d="M -22 0 q 22 -8 44 0 q 4 30 0 50 q -22 8 -44 0 q -4 -20 0 -50 Z" fill="#f2e4cd" stroke="#d9c3a8" strokeWidth={3.5} />
          <path d="M -54 -2 q -4 -50 54 -50 q 58 0 54 50 q -54 14 -108 0 Z" fill="#c4735a" stroke="#a95c46" strokeWidth={4} />
          <g fill="#f6e7cf">
            <ellipse cx={-28} cy={-24} rx={10} ry={7} />
            <ellipse cx={8} cy={-34} rx={8} ry={6} />
            <ellipse cx={34} cy={-18} rx={7} ry={5} />
          </g>
        </g>
      ))}
    </g>
  </g>
);

/* ------------------------------------------------------------------ */

const HABITAT_PLANT: Record<VeggieId, React.FC> = {
  carrot: CarrotTops,
  corn: CornStalk,
  tomato: TomatoPlant,
  pumpkin: PumpkinVine,
  pepper: PepperBush,
  cucumber: CucumberTrellis,
  potato: PotatoPlant,
  onion: OnionRow,
  eggplant: EggplantBush,
  peas: PeaTrellis,
  broccoli: BroccoliPlant,
  mushroom: MushroomLog,
};

/** How many of the plant to line up, and the soil bed under them. */
const HABITAT_COUNT: Record<VeggieId, number> = {
  carrot: 5,
  corn: 4,
  tomato: 3,
  pumpkin: 3,
  pepper: 3,
  cucumber: 3,
  potato: 3,
  onion: 5,
  eggplant: 3,
  peas: 3,
  broccoli: 4,
  mushroom: 2,
};

const NEEDS_BED: VeggieId[] = ["carrot", "onion", "potato"];

/** How big the plants play — the row has to fill the lower third. */
const HABITAT_SCALE: Record<VeggieId, number> = {
  carrot: 2.15,
  corn: 1.55,
  tomato: 1.75,
  pumpkin: 1.9,
  pepper: 2.0,
  cucumber: 1.8,
  potato: 1.95,
  onion: 2.1,
  eggplant: 2.0,
  peas: 1.9,
  broccoli: 2.2,
  mushroom: 1.7,
};

/**
 * The plant row for one vegetable, sitting on the grass line.
 * `x` shifts the whole row so it can drift with the camera.
 */
export const Habitat: React.FC<{ id: VeggieId; x?: number }> = ({
  id,
  x = 0,
}) => {
  const Plant = HABITAT_PLANT[id];
  const n = HABITAT_COUNT[id];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} ${GROUND_Y + 30})`} filter="url(#wobbleSoft)">
        {NEEDS_BED.includes(id) ? (
          <>
            <rect
              x={-260}
              y={-16}
              width={W + 520}
              height={74}
              rx={26}
              fill={ground.soil}
            />
            <path
              d={`M -260 -18 q 180 -22 380 -4 q 210 20 420 -6 q 200 -22 400 -2 q 200 20 400 -4 q 160 -18 320 2`}
              stroke={ground.soilDark}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
              opacity={0.65}
            />
          </>
        ) : null}
        <Row
          n={n}
          base={HABITAT_SCALE[id]}
          seed={id}
          render={(i, px, s) => (
            <g
              transform={`translate(${px} 0) scale(${s}) rotate(${
                (random(`${id}r${i}`) - 0.5) * 9
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

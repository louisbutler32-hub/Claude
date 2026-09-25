import React from "react";
import { random } from "remotion";
import { GROUND_Y, H, W } from "../guess/scene";
import { ground } from "../guess/palette";
import { FruitDefs, FRUIT_ART, type FruitId } from "./fruit";

/**
 * "Where it grows" — the tree, vine or plant each fruit comes off, drawn
 * as a row along the horizon. The fruit hanging on the plants are the same
 * drawings the rest of the episode uses, so a viewer sees the character
 * they just met sitting in its tree.
 */

const LEAF = "#5aa84f";
const LEAF_DK = "#43893c";
const LEAF_LT = "#7cc25c";
const BARK = "#c88a5a";
const BARK_LINE = "#a5663c";

/** A fruit from the set, hung at a point on a plant. */
const Hang: React.FC<{ id: FruitId; x: number; y: number; s?: number; r?: number }> = ({
  id,
  x,
  y,
  s = 0.34,
  r = 0,
}) => {
  const Art = FRUIT_ART[id];
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <Art />
    </g>
  );
};

/** Repeat a plant across the frame with a bit of scatter. */
const Row: React.FC<{
  n: number;
  base: number;
  from?: number;
  to?: number;
  seed: string;
  render: (i: number, x: number, s: number) => React.ReactNode;
}> = ({ n, base, from = 150, to = W - 150, seed, render }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = from + t * (to - from) + (random(`${seed}x${i}`) - 0.5) * 60;
      const s = base * (0.86 + random(`${seed}s${i}`) * 0.3);
      return <g key={i}>{render(i, x, s)}</g>;
    })}
  </>
);

/** A round crayon tree with the fruit hanging in its canopy. */
const FruitTree: React.FC<{ id: FruitId; canopy?: string; fruitScale?: number }> = ({
  id,
  canopy = LEAF,
  fruitScale = 0.34,
}) => (
  <g>
    <path
      d="M -22 0 q 6 -70 -2 -150 q -2 -30 24 -40 q 26 -6 34 24 q 6 82 -6 166 Z"
      fill={BARK}
      stroke={BARK_LINE}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    <path d="M 0 -150 q -10 -20 -34 -30 M 18 -170 q 12 -18 34 -22" stroke={BARK_LINE} strokeWidth={6} fill="none" strokeLinecap="round" />
    <g transform="translate(6 -230)">
      <path
        d="M -150 30 q -26 -36 4 -62 q -14 -48 36 -58 q 16 -42 66 -32 q 36 -28 72 8 q 46 2 40 50 q 24 30 -10 54 q -8 30 -50 24 q -30 20 -68 2 q -56 18 -90 14 Z"
        fill={canopy}
        stroke={LEAF_DK}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={i}
          x1={-120 + i * 28}
          y1={-70 + random(`th${id}${i}`) * 26}
          x2={-140 + i * 28}
          y2={20 + random(`th2${id}${i}`) * 20}
          stroke={LEAF_LT}
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.45}
        />
      ))}
      <Hang id={id} x={-84} y={-10} s={fruitScale} r={-8} />
      <Hang id={id} x={-10} y={-44} s={fruitScale} r={6} />
      <Hang id={id} x={62} y={-2} s={fruitScale} r={-5} />
      <Hang id={id} x={12} y={30} s={fruitScale * 0.9} r={10} />
    </g>
  </g>
);

/** A leaning palm with a bunch of bananas under the fronds. */
const BananaPalm: React.FC = () => (
  <g>
    <path d="M -16 0 q 10 -120 60 -240" stroke={BARK} strokeWidth={30} fill="none" strokeLinecap="round" />
    <path d="M -16 0 q 10 -120 60 -240" stroke={BARK_LINE} strokeWidth={30} fill="none" strokeLinecap="round" strokeDasharray="6 26" opacity={0.5} />
    <g transform="translate(46 -240)">
      {[-150, -110, -70, -30, 30, 70, 110, 150].map((a, i) => (
        <path
          key={i}
          d="M 0 0 q 40 -70 150 -60 q -60 40 -150 60 Z"
          fill={i % 2 ? LEAF : LEAF_LT}
          stroke={LEAF_DK}
          strokeWidth={4}
          strokeLinejoin="round"
          transform={`rotate(${a + 90})`}
        />
      ))}
      <circle r={16} fill={LEAF_DK} />
      <g transform="translate(-26 26)">
        <Hang id="banana" x={-20} y={30} s={0.24} r={70} />
        <Hang id="banana" x={12} y={36} s={0.24} r={80} />
        <Hang id="banana" x={44} y={30} s={0.24} r={90} />
        <Hang id="banana" x={-4} y={62} s={0.22} r={76} />
        <Hang id="banana" x={28} y={64} s={0.22} r={86} />
      </g>
    </g>
  </g>
);

/** A wooden trellis with a vine and grapes hanging off it. */
const GrapeTrellis: React.FC = () => (
  <g>
    <g stroke="#c39a63" strokeWidth={9} strokeLinecap="round">
      <path d="M -110 0 L -110 -230 M 110 0 L 110 -230 M -122 -220 L 122 -220 M -122 -140 L 122 -140" />
    </g>
    <path d="M -110 -30 q 60 -60 0 -120 q -50 -60 40 -90 q 80 -20 130 -10" stroke={LEAF_DK} strokeWidth={8} fill="none" strokeLinecap="round" />
    <g fill={LEAF} stroke={LEAF_DK} strokeWidth={3}>
      <path d="M -80 -100 q -50 -30 -60 10 q 46 26 60 -10 Z" />
      <path d="M -20 -190 q 50 -30 70 6 q -50 30 -70 -6 Z" />
      <path d="M 60 -230 q 50 -20 60 12 q -50 20 -60 -12 Z" />
    </g>
    <Hang id="grapes" x={-40} y={-130} s={0.42} r={-6} />
    <Hang id="grapes" x={56} y={-150} s={0.38} r={8} />
    <path d="M 20 -200 q 16 -14 6 -26 q -10 -12 6 -22" stroke={LEAF_DK} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

/** A sprawling ground vine with whole striped melons on it. */
const MelonVine: React.FC = () => (
  <g>
    <path d="M -160 -6 q 60 -60 140 -30 q 80 30 170 -20" stroke={LEAF_DK} strokeWidth={9} fill="none" strokeLinecap="round" />
    <g fill={LEAF} stroke={LEAF_DK} strokeWidth={4}>
      <path d="M -80 -40 q -60 -60 -4 -90 q 60 -30 80 30 q 20 50 -30 66 q -34 12 -46 -6 Z" transform="translate(-40 -20) scale(0.6)" />
      <path d="M 90 -34 q -50 -60 0 -84 q 50 -26 72 22 q 20 46 -24 62 q -30 10 -48 0 Z" transform="translate(50 -10) scale(0.6)" />
    </g>
    <g fill="#4a9450" stroke="#3d7f36" strokeWidth={5}>
      <ellipse cx={0} cy={-34} rx={70} ry={48} />
    </g>
    <g stroke="#7cc25c" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.85}>
      <path d="M -40 -78 q 10 44 0 86" />
      <path d="M -10 -82 q 12 48 2 96" />
      <path d="M 22 -82 q 12 48 4 94" />
      <path d="M 50 -70 q 8 36 0 70" />
    </g>
    <path d="M -2 -80 q -4 -14 10 -22" stroke="#7d6034" strokeWidth={7} fill="none" strokeLinecap="round" />
    <Hang id="watermelon" x={126} y={-40} s={0.4} r={-10} />
  </g>
);

/** Low strawberry plants with white flowers and berries hanging down. */
const StrawberryPlant: React.FC = () => (
  <g>
    <path d="M 0 0 q -6 -60 0 -100 M -10 -10 q -60 -30 -80 -70 M 10 -10 q 60 -30 80 -70" stroke={LEAF_DK} strokeWidth={7} fill="none" strokeLinecap="round" />
    <g fill={LEAF} stroke={LEAF_DK} strokeWidth={3}>
      <path d="M -6 -60 q -60 -30 -84 8 q 56 34 88 6 Z" />
      <path d="M 6 -66 q 60 -30 84 8 q -56 34 -88 6 Z" />
      <path d="M -2 -100 q -40 -34 -22 -60 q 34 10 26 62 Z" fill={LEAF_LT} />
      <path d="M 2 -100 q 40 -34 22 -60 q -34 10 -26 62 Z" fill={LEAF_LT} />
    </g>
    <g fill="#ffffff" stroke="#e8dcc0" strokeWidth={2}>
      {[[-50, -110], [56, -104]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={0} cy={-9} rx={6} ry={9} transform={`rotate(${a})`} />
          ))}
          <circle r={5} fill="#f5d36a" stroke="none" />
        </g>
      ))}
    </g>
    <Hang id="strawberry" x={-70} y={-32} s={0.3} r={-14} />
    <Hang id="strawberry" x={72} y={-30} s={0.3} r={12} />
  </g>
);

/** A spiky rosette with one pineapple growing out of the middle. */
const PineapplePlant: React.FC = () => (
  <g>
    <g fill={LEAF} stroke={LEAF_DK} strokeWidth={3} strokeLinejoin="round">
      {[-160, -135, -110, -85, -60, -30, 0, 30, 60, 85, 110, 135, 160].map((a, i) => (
        <path
          key={i}
          d="M 0 0 q -14 -80 0 -150 q 14 70 0 150 Z"
          fill={i % 2 ? LEAF : LEAF_LT}
          transform={`rotate(${a * 0.5}) scale(${1 - Math.abs(a) / 400})`}
        />
      ))}
    </g>
    <Hang id="pineapple" x={0} y={-100} s={0.52} />
  </g>
);

/** A kiwi vine on a wire, heart leaves and fuzzy fruit hanging in pairs. */
const KiwiVine: React.FC = () => (
  <g>
    <g stroke="#c39a63" strokeWidth={9} strokeLinecap="round">
      <path d="M -120 0 L -120 -210 M 120 0 L 120 -210" />
    </g>
    <path d="M -132 -200 L 132 -200" stroke="#8c8375" strokeWidth={4} />
    <path d="M -110 -200 q 40 30 90 10 q 60 -30 130 -6" stroke={LEAF_DK} strokeWidth={7} fill="none" strokeLinecap="round" />
    <g fill={LEAF} stroke={LEAF_DK} strokeWidth={3}>
      {[[-80, -176], [-10, -186], [70, -180]].map(([x, y], i) => (
        <path key={i} d="M 0 0 q -34 -30 -20 -56 q 20 -10 20 14 q 0 -24 20 -14 q 14 26 -20 56 Z" transform={`translate(${x} ${y}) scale(1.1) rotate(180)`} />
      ))}
    </g>
    <g fill="#8a6a45" stroke="#6e5334" strokeWidth={3}>
      {[[-70, -120], [-40, -130], [40, -122], [72, -132]].map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y - 40} x2={x} y2={y - 60} stroke={LEAF_DK} strokeWidth={4} />
          <ellipse cx={x} cy={y} rx={22} ry={30} />
        </g>
      ))}
    </g>
    <Hang id="kiwi" x={4} y={-96} s={0.34} r={8} />
  </g>
);

/* ------------------------------------------------------------------ */

const PLANT: Record<FruitId, React.FC> = {
  apple: () => <FruitTree id="apple" />,
  banana: BananaPalm,
  orange: () => <FruitTree id="orange" canopy="#6fb166" />,
  strawberry: StrawberryPlant,
  grapes: GrapeTrellis,
  watermelon: MelonVine,
  pineapple: PineapplePlant,
  pear: () => <FruitTree id="pear" canopy={LEAF_LT} />,
  cherry: () => <FruitTree id="cherry" canopy="#8cc47a" fruitScale={0.3} />,
  lemon: () => <FruitTree id="lemon" canopy="#6fb166" fruitScale={0.3} />,
  peach: () => <FruitTree id="peach" canopy="#8cc47a" />,
  kiwi: KiwiVine,
};

/** How many of the plant to line up. */
const COUNT: Record<FruitId, number> = {
  apple: 3,
  banana: 3,
  orange: 3,
  strawberry: 4,
  grapes: 3,
  watermelon: 3,
  pineapple: 4,
  pear: 3,
  cherry: 3,
  lemon: 3,
  peach: 3,
  kiwi: 3,
};

/** How big the plants play — the row has to fill the lower third. */
const SCALE: Record<FruitId, number> = {
  apple: 1.4,
  banana: 1.1,
  orange: 1.4,
  strawberry: 1.9,
  grapes: 1.35,
  watermelon: 1.5,
  pineapple: 1.5,
  pear: 1.4,
  cherry: 1.4,
  lemon: 1.4,
  peach: 1.4,
  kiwi: 1.35,
};

/** Root crops sit in a soil bed; none of the fruit do, but strawberries
 *  get a strip of turned earth so the low plants read as a patch. */
const NEEDS_BED: FruitId[] = ["strawberry", "watermelon"];

/**
 * The plant row for one fruit, sitting on the grass line.
 * `x` shifts the whole row so it can drift with the camera.
 */
export const Habitat: React.FC<{ id: FruitId; x?: number }> = ({ id, x = 0 }) => {
  const Plant = PLANT[id];
  const n = COUNT[id];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {/* the hanging fruit use the same gradients as the hero — they have to
          be in this svg too, or they go blank once the hero is eaten */}
      <FruitDefs />
      <g transform={`translate(${x} ${GROUND_Y + 30})`} filter="url(#wobbleSoft)">
        {NEEDS_BED.includes(id) ? (
          <>
            <rect x={-260} y={-16} width={W + 520} height={74} rx={26} fill={ground.soil} />
            <path
              d="M -260 -18 q 180 -22 380 -4 q 210 20 420 -6 q 200 -22 400 -2 q 200 20 400 -4 q 160 -18 320 2"
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
          base={SCALE[id]}
          seed={id}
          render={(i, px, s) => (
            <g transform={`translate(${px} 0) scale(${s}) rotate(${(random(`${id}r${i}`) - 0.5) * 6})`}>
              <Plant />
            </g>
          )}
        />
      </g>
    </svg>
  );
};

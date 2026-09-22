import React from "react";
import { random } from "remotion";
import { ground } from "../guess/palette";
import { GROUND_Y, H, W } from "../guess/scene";

/**
 * "Where it lives" for the Wild Animals episode — savanna, jungle, forest,
 * outback, bamboo grove, desert and garden, built from a small prop kit so
 * twelve very different homes still read as one visual language.
 */

const WOOD = "#a5754a";
const WOOD_DK = "#835a36";
const LEAF = "#5aa84f";
const LEAF_DK = "#3f8a3a";

/* ── props ────────────────────────────────────────────────────────── */

const Acacia: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -18 0 q -6 -140 -2 -220 q -26 -26 -46 -34 M 14 -228 q 30 -20 50 -26" stroke="#a37c50" strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d="M -190 -256 q 40 -68 190 -68 q 150 0 190 68 q -38 38 -190 38 q -152 0 -190 -38 Z" fill="#7fb865" stroke="#4e8f45" strokeWidth={8} strokeLinejoin="round" />
  </g>
);

const TallGrass: React.FC<{ x: number; w?: number; s?: number }> = ({
  x,
  w = 700,
  s = 1,
}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    {Array.from({ length: Math.round(w / 44) }, (_, i) => {
      const gx = i * 44 + random(`tg${i}`) * 20 - w / 2;
      const h = 130 + random(`tgh${i}`) * 90;
      const lean = random(`tgl${i}`) * 24 - 12;
      return (
        <path
          key={i}
          d={`M ${gx} 12 q ${lean} ${-h / 2} ${lean * 1.6} ${-h}`}
          stroke={i % 2 ? LEAF_DK : LEAF}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
      );
    })}
  </g>
);

const JungleTree: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -14 0 Q -30 -160 -8 -280" stroke={WOOD_DK} strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M -140 -260 Q -40 -360 60 -300 Q 160 -360 220 -260 Q 140 -190 20 -230 Q -60 -190 -140 -260 Z" fill="#4a9a4a" stroke="#357334" strokeWidth={8} strokeLinejoin="round" />
    <path d="M -20 -180 Q -70 -140 -60 -70" stroke="#5aa84f" strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

const Vine: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M 0 -420 Q 30 -280 -10 -140 Q -40 -60 10 0" stroke="#3f8a3a" strokeWidth={9} fill="none" strokeLinecap="round" />
    {[-360, -260, -160, -60].map((y, i) => (
      <ellipse key={i} cx={i % 2 ? 14 : -14} cy={y} rx={16} ry={10} fill="#5aa84f" stroke="#3f8a3a" strokeWidth={3} />
    ))}
  </g>
);

const PineTree: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <rect x={-9} y={-40} width={18} height={40} fill={WOOD_DK} />
    <path d="M 0 -320 L -80 -190 L -50 -190 L -110 -100 L -70 -100 L -130 -30 L 130 -30 L 70 -100 L 110 -100 L 50 -190 L 80 -190 Z" fill="#3f7a45" stroke="#2c5c33" strokeWidth={7} strokeLinejoin="round" />
  </g>
);

const River: React.FC<{ x: number; w?: number; s?: number }> = ({
  x,
  w = 900,
  s = 1,
}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <ellipse cx={0} cy={40} rx={w / 2} ry={80} fill="#8ec9dd" stroke="#63a9c2" strokeWidth={8} />
    <g stroke="#b6e0ee" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.8}>
      <path d={`M ${-w / 4} 18 q 36 -12 72 0`} />
      <path d={`M ${w / 8} 50 q 36 -12 72 0`} />
    </g>
  </g>
);

const FoxDen: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <ellipse cx={0} cy={20} rx={170} ry={60} fill="#b08256" stroke="#8a6440" strokeWidth={7} />
    <ellipse cx={20} cy={-4} rx={62} ry={54} fill="#4a3626" />
  </g>
);

const RedDirt: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <ellipse cx={0} cy={34} rx={320} ry={64} fill="#c67a4a" stroke="#a05a32" strokeWidth={7} />
    <g fill="#a05a32" opacity={0.5}>
      <ellipse cx={-130} cy={24} rx={44} ry={12} />
      <ellipse cx={70} cy={44} rx={58} ry={13} />
    </g>
  </g>
);

const Scrub: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -60 0 Q -80 -70 -30 -90 Q -10 -120 30 -96 Q 78 -110 84 -60 Q 100 -30 60 0 Z" fill="#8fae5c" stroke="#6c8c3e" strokeWidth={7} strokeLinejoin="round" />
  </g>
);

const Bamboo: React.FC<{ x: number; n?: number; s?: number }> = ({
  x,
  n = 5,
  s = 1,
}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    {Array.from({ length: n }, (_, i) => {
      const bx = i * 46 + random(`bam${i}`) * 14;
      const h = 260 + random(`bamh${i}`) * 100;
      return (
        <g key={i}>
          <path d={`M ${bx} 10 L ${bx} ${-h}`} stroke="#7fb84f" strokeWidth={16} strokeLinecap="round" />
          {Array.from({ length: 5 }, (_, j) => (
            <path key={j} d={`M ${bx} ${-30 - j * (h / 5)} L ${bx} ${-30 - j * (h / 5) - 6}`} stroke="#4e8f38" strokeWidth={18} strokeLinecap="round" />
          ))}
          <path d={`M ${bx} ${-h + 30} q ${i % 2 ? 50 : -50} -10 ${i % 2 ? 70 : -70} -40`} stroke="#5aa84f" strokeWidth={7} fill="none" strokeLinecap="round" />
        </g>
      );
    })}
  </g>
);

const EucalyptusBranch: React.FC<{ x: number; s?: number }> = ({
  x,
  s = 1,
}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -20 40 Q -30 -220 10 -420" stroke="#9a8264" strokeWidth={30} fill="none" strokeLinecap="round" />
    <path d="M 10 -320 Q 120 -360 200 -300" stroke="#9a8264" strokeWidth={20} fill="none" strokeLinecap="round" />
    <path d="M -10 -260 Q -110 -300 -180 -250" stroke="#9a8264" strokeWidth={18} fill="none" strokeLinecap="round" />
    {[
      [180, -320], [220, -280], [-160, -270], [-200, -230], [30, -400], [-40, -390],
    ].map(([lx, ly], i) => (
      <ellipse key={i} cx={lx} cy={ly} rx={30} ry={16} fill="#8fbb8a" stroke="#6b9967" strokeWidth={3} transform={`rotate(${(i - 2) * 18} ${lx} ${ly})`} />
    ))}
  </g>
);

const Dune: React.FC<{ x: number; w?: number; s?: number }> = ({
  x,
  w = 900,
  s = 1,
}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d={`M ${-w / 2} 40 Q ${-w / 4} -70 0 -40 Q ${w / 4} -10 ${w / 2} 40 Z`} fill="#e8c877" stroke="#c9a350" strokeWidth={8} strokeLinejoin="round" />
  </g>
);

const Cactus: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -14 0 L -14 -160 Q -14 -190 14 -190 Q 42 -190 42 -160 L 42 0 Z" fill="#5c9a5a" stroke="#3f7a3d" strokeWidth={7} strokeLinejoin="round" />
    <path d="M -14 -80 Q -70 -80 -70 -130 Q -70 -160 -40 -160" fill="none" stroke="#3f7a3d" strokeWidth={16} strokeLinecap="round" />
    <path d="M 42 -110 Q 90 -110 90 -150" fill="none" stroke="#3f7a3d" strokeWidth={14} strokeLinecap="round" />
  </g>
);

const FlowerBed: React.FC<{ x: number; w?: number; s?: number }> = ({
  x,
  w = 700,
  s = 1,
}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <ellipse cx={0} cy={30} rx={w / 2} ry={40} fill="#6cae55" stroke="#4e8f45" strokeWidth={6} />
    {Array.from({ length: Math.round(w / 90) }, (_, i) => {
      const fx = i * 90 - w / 2 + 45 + random(`fl${i}`) * 20;
      const petal = ["#ea8ab0", "#f3c93f", "#8b58b3", "#ea5b52"][i % 4];
      return (
        <g key={i} transform={`translate(${fx} ${10 + random(`fly${i}`) * 14})`}>
          <path d="M 0 0 L 0 30" stroke="#3f8a3a" strokeWidth={5} />
          <g fill={petal}>
            <circle cx={0} cy={-6} r={10} />
            <circle cx={-9} cy={0} r={10} />
            <circle cx={9} cy={0} r={10} />
            <circle cx={0} cy={6} r={10} />
          </g>
          <circle cx={0} cy={0} r={6} fill="#f3c93f" />
        </g>
      );
    })}
  </g>
);

const Hedge: React.FC<{ x: number; w?: number; s?: number }> = ({
  x,
  w = 700,
  s = 1,
}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d={`M ${-w / 2} 20 Q ${-w / 2} -90 ${-w / 4} -90 Q ${-w / 4} -140 0 -140 Q ${w / 4} -140 ${w / 4} -90 Q ${w / 2} -90 ${w / 2} 20 Z`} fill="#5aa84f" stroke="#3f8a3a" strokeWidth={8} strokeLinejoin="round" />
  </g>
);

/* ── the twelve places ────────────────────────────────────────────── */

const SCENES: Record<string, React.FC> = {
  zebra: () => (
    <>
      <TallGrass x={200} w={500} s={1.3} />
      <Acacia x={1550} s={1.3} />
      <TallGrass x={1750} w={400} s={1.1} />
    </>
  ),
  giraffe: () => (
    <>
      <Acacia x={480} s={1.9} />
      <Acacia x={1500} s={1.3} />
      <TallGrass x={1000} w={500} s={1} />
    </>
  ),
  tiger: () => (
    <>
      <JungleTree x={420} s={1.15} />
      <JungleTree x={1620} s={0.95} />
      <TallGrass x={1020} w={900} s={1.2} />
    </>
  ),
  monkey: () => (
    <>
      <JungleTree x={500} s={1.3} />
      <JungleTree x={1500} s={1.05} />
      <Vine x={960} s={1.1} />
    </>
  ),
  bear: () => (
    <>
      <PineTree x={340} s={1.2} />
      <PineTree x={640} s={0.9} />
      <PineTree x={1580} s={1.05} />
      <River x={1180} w={1000} s={1.15} />
    </>
  ),
  fox: () => (
    <>
      <PineTree x={380} s={1} />
      <PineTree x={1660} s={0.85} />
      <FoxDen x={1050} s={1.3} />
    </>
  ),
  kangaroo: () => (
    <>
      <RedDirt x={960} s={1.6} />
      <Scrub x={420} s={1.4} />
      <Scrub x={1600} s={1.2} />
    </>
  ),
  panda: () => <Bamboo x={700} n={6} s={1.35} />,
  koala: () => <EucalyptusBranch x={960} s={1.5} />,
  camel: () => (
    <>
      <Dune x={960} w={1900} s={1.3} />
      <Cactus x={340} s={1.1} />
      <Cactus x={1660} s={0.9} />
    </>
  ),
  hedgehog: () => (
    <>
      <FlowerBed x={960} w={1600} s={1.2} />
      <Hedge x={280} s={0.9} />
      <Hedge x={1700} s={0.8} />
    </>
  ),
  peacock: () => (
    <>
      <Hedge x={500} s={1.15} />
      <Hedge x={1500} s={1} />
      <FlowerBed x={1000} w={1000} s={1.1} />
    </>
  ),
};

/** The place one wild animal lives, sitting on the grass line. */
export const WildHabitat: React.FC<{ id: string; x?: number }> = ({
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

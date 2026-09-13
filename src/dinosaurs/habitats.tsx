import React from "react";
import { random } from "remotion";
import { GROUND_Y, H, W } from "../guess/scene";

/**
 * "Where it lived" — a prehistoric scene built from a small kit of props
 * (fern, palm, volcano, rock, swamp) so all twelve rounds share one world
 * without redrawing a background per dinosaur.
 */

const LEAF = "#5a9e4a";
const LEAF_DK = "#3f7a34";
const OUT = "#3a3226";

const Fern: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M 0 0 Q -6 -80 0 -140" stroke={LEAF_DK} strokeWidth={8} fill="none" strokeLinecap="round" />
    {[-100, -70, -40, -10].map((y, i) => (
      <g key={i}>
        <path d={`M 0 ${y} q -50 -18 -66 -46`} stroke={LEAF} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={`M 0 ${y - 10} q 50 -18 66 -46`} stroke={LEAF} strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
    ))}
  </g>
);

const Palm: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M 0 0 Q 10 -100 -4 -190" stroke="#8a6a3a" strokeWidth={16} fill="none" strokeLinecap="round" />
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 4) * Math.PI - Math.PI / 2;
      return (
        <path
          key={i}
          d={`M -4 -190 Q ${Math.cos(a) * 90 - 4} ${-190 + Math.sin(a) * 40} ${
            Math.cos(a) * 130 - 4
          } ${-190 + Math.sin(a) * 70}`}
          stroke={LEAF}
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
      );
    })}
  </g>
);

const Volcano: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -140 0 L -40 -220 L 40 -220 L 140 0 Z" fill="#8a7768" stroke="#6b5b4e" strokeWidth={7} strokeLinejoin="round" />
    <path d="M -18 -220 Q 0 -260 18 -220 Z" fill="#d9645a" opacity={0.85} />
    <circle cx={0} cy={-250} r={10} fill="#e88a3c" opacity={0.7} />
  </g>
);

const Rock: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -100 0 Q -80 -80 0 -80 Q 80 -80 100 0 Z" fill="#a89a86" stroke="#867863" strokeWidth={6} strokeLinejoin="round" />
  </g>
);

const Swamp: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <ellipse cx={0} cy={20} rx={220} ry={40} fill="#7fa896" stroke="#5c8272" strokeWidth={6} />
  </g>
);

const KIT: Record<string, React.FC> = {
  trex: () => (<><Fern x={-200} s={1.4} /><Rock x={1600} s={1.2} /></>),
  triceratops: () => (<><Fern x={200} s={1.3} /><Fern x={1500} s={1.1} /></>),
  stegosaurus: () => (<><Rock x={300} s={1.3} /><Fern x={1400} s={1.2} /></>),
  brachiosaurus: () => (<><Palm x={200} s={1.1} /><Palm x={1500} s={0.9} /></>),
  velociraptor: () => (<><Fern x={-100} s={1.5} /><Fern x={1300} s={1.3} /><Rock x={700} s={0.9} /></>),
  pterodactyl: () => (<><Volcano x={900} s={0.95} /></>),
  ankylosaurus: () => (<><Rock x={200} s={1.4} /><Fern x={1500} s={1.2} /></>),
  spinosaurus: () => (<><Swamp x={900} s={1.4} /><Fern x={-100} s={1.2} /></>),
  diplodocus: () => (<><Palm x={300} s={1.2} /><Palm x={1600} s={1.0} /></>),
  parasaurolophus: () => (<><Fern x={0} s={1.3} /><Volcano x={1500} s={0.75} /></>),
  iguanodon: () => (<><Fern x={200} s={1.3} /><Rock x={1500} s={1.1} /></>),
  allosaurus: () => (<><Rock x={-100} s={1.3} /><Fern x={1400} s={1.3} /></>),
};

export const DinoHabitat: React.FC<{ id: string; x?: number }> = ({
  id,
  x = 0,
}) => {
  const Scene = KIT[id];
  if (!Scene) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} ${GROUND_Y + 20})`} filter="url(#wobbleSoft)">
        <Scene />
      </g>
    </svg>
  );
};

import React from "react";
import { random } from "remotion";
import { GROUND_Y, H, W } from "../guess/scene";

/**
 * "Where it lives" — the seabed. One underwater world, varied per round
 * with coral, rocks, seaweed and a sandy floor, so all twelve share a
 * setting distinct from the other three episodes' grassy meadow.
 */

const SAND = "#e8d9a8";
const SAND_DK = "#d4c188";
const CORAL_PINK = "#ef8ba0";
const CORAL_DK = "#c96a7e";
const WEED = "#4e9c6e";
const WEED_DK = "#357850";
const ROCK = "#9aa6ad";
const ROCK_DK = "#7a868d";

const Coral: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    {[-30, 0, 30].map((dx, i) => (
      <path
        key={i}
        d={`M ${dx} 10 Q ${dx - 10} -40 ${dx + (i % 2 ? 20 : -20)} -70`}
        stroke={CORAL_DK}
        strokeWidth={14}
        fill="none"
        strokeLinecap="round"
      />
    ))}
    <g fill={CORAL_PINK}>
      <circle cx={-30} cy={-72} r={16} />
      <circle cx={0} cy={-92} r={18} />
      <circle cx={30} cy={-74} r={15} />
    </g>
  </g>
);

const Seaweed: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    {[0, 40, 80].map((dx, i) => (
      <path
        key={i}
        d={`M ${dx} 10 q ${i % 2 ? 26 : -26} -50 0 -100 q ${
          i % 2 ? -22 : 22
        } -40 4 -70`}
        stroke={i % 2 ? WEED : WEED_DK}
        strokeWidth={13}
        fill="none"
        strokeLinecap="round"
      />
    ))}
  </g>
);

const RockCluster: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -110 10 Q -90 -70 0 -70 Q 90 -70 110 10 Z" fill={ROCK} stroke={ROCK_DK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -60 -30 Q -40 -50 0 -50" stroke={ROCK_DK} strokeWidth={5} fill="none" opacity={0.5} />
  </g>
);

const Bubbles: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} 0)`} fill="#ffffff" opacity={0.55}>
    <circle cx={0} cy={-160} r={10} />
    <circle cx={16} cy={-220} r={7} />
    <circle cx={-10} cy={-280} r={5} />
  </g>
);

const KIT: Record<string, React.FC> = {
  octopus: () => (<><RockCluster x={200} s={1.2} /><Seaweed x={1500} s={1.0} /></>),
  crab: () => (<><Coral x={300} s={0.9} /><RockCluster x={1500} s={1.0} /></>),
  starfish: () => (<><RockCluster x={900} s={1.3} /></>),
  seahorse: () => (<><Seaweed x={200} s={1.2} /><Seaweed x={1500} s={1.0} /></>),
  whale: () => (<><Bubbles x={900} /></>),
  dolphin: () => (<><Bubbles x={600} /><Bubbles x={1300} /></>),
  jellyfish: () => (<><Bubbles x={900} /></>),
  turtle: () => (<><Coral x={300} s={1.0} /><Seaweed x={1500} s={1.1} /></>),
  shark: () => (<><RockCluster x={900} s={1.2} /></>),
  squid: () => (<><Bubbles x={600} /><RockCluster x={1500} s={0.9} /></>),
  lobster: () => (<><RockCluster x={300} s={1.1} /><Seaweed x={1500} s={1.0} /></>),
  clownfish: () => (<><Coral x={300} s={1.2} /><Coral x={1500} s={1.0} /></>),
};

/** The seabed floor + a coral/rock/weed dressing, at a given x offset. */
export const SeaHabitat: React.FC<{ id: string; x?: number }> = ({
  id,
  x = 0,
}) => {
  const Scene = KIT[id];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="seaWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe4ee" />
          <stop offset="100%" stopColor="#8ecadf" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={GROUND_Y + 60} fill="url(#seaWater)" opacity={0.55} />
      <g transform={`translate(${x} ${GROUND_Y + 60})`} filter="url(#wobbleSoft)">
        <rect x={-400} y={0} width={W + 800} height={200} fill={SAND} />
        <rect x={-400} y={0} width={W + 800} height={14} fill={SAND_DK} />
        {Array.from({ length: 20 }, (_, i) => (
          <circle
            key={i}
            cx={-380 + i * 100 + random(`sand${i}`) * 40}
            cy={20 + random(`sandy${i}`) * 100}
            r={4}
            fill={SAND_DK}
            opacity={0.5}
          />
        ))}
        {Scene ? <Scene /> : null}
      </g>
    </svg>
  );
};

import React from "react";
import { random } from "remotion";
import { ground } from "../guess/palette";
import { GROUND_Y, H, W } from "../guess/scene";

/**
 * "Where it goes" — road, sky, track or water, depending on the vehicle.
 * Four environments cover all twelve, reused rather than drawn per item.
 */

const ROAD = "#5a6270";
const ROAD_LINE = "#f3c93f";
const RAIL = "#8a8f96";
const SLEEPER = "#7a5a3a";
const WATER = "#8ec9dd";
const WATER_DK = "#63a9c2";

const Cone: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -20 0 L 0 -54 L 20 0 Z" fill="#ef8a3c" stroke="#c96a22" strokeWidth={4} strokeLinejoin="round" />
    <rect x={-10} y={-38} width={20} height={8} fill="#ffffff" />
    <rect x={-24} y={-4} width={48} height={8} rx={3} fill="#c96a22" />
  </g>
);

const Road: React.FC<{ withCones?: boolean }> = ({ withCones }) => (
  <g>
    <rect x={-400} y={0} width={W + 800} height={130} fill={ROAD} />
    <rect x={-400} y={0} width={W + 800} height={10} fill="#3d434e" />
    {Array.from({ length: 14 }, (_, i) => (
      <rect key={i} x={-380 + i * 190} y={58} width={90} height={14} rx={6} fill={ROAD_LINE} opacity={0.85} />
    ))}
    {withCones ? (
      <>
        <Cone x={220} s={0.9} />
        <Cone x={620} s={0.9} />
        <Cone x={1360} s={0.9} />
      </>
    ) : null}
  </g>
);

const Track: React.FC = () => (
  <g>
    <rect x={-400} y={30} width={W + 800} height={70} fill="#7a8088" />
    {Array.from({ length: 22 }, (_, i) => (
      <rect key={i} x={-390 + i * 98} y={20} width={20} height={92} fill={SLEEPER} />
    ))}
    <rect x={-400} y={44} width={W + 800} height={8} fill={RAIL} />
    <rect x={-400} y={92} width={W + 800} height={8} fill={RAIL} />
  </g>
);

const Water: React.FC = () => (
  <g>
    <rect x={-400} y={0} width={W + 800} height={130} fill={WATER} />
    <g stroke="#b6e0ee" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.85}>
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={`M ${-320 + i * 220} ${40 + (i % 2) * 30} q 40 -14 80 0`} />
      ))}
    </g>
  </g>
);

const SkyClouds: React.FC = () => (
  <g fill="#ffffff" opacity={0.9}>
    {[
      [180, 90, 1.1], [640, 160, 0.8], [1080, 70, 1.0], [1560, 150, 0.9],
    ].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx={0} cy={14} rx={70} ry={18} />
        <ellipse cx={-30} cy={4} rx={30} ry={20} />
        <ellipse cx={10} cy={-4} rx={38} ry={26} />
        <ellipse cx={44} cy={6} rx={26} ry={18} />
      </g>
    ))}
  </g>
);

const KIND: Record<string, "road" | "roadwork" | "track" | "sky" | "water"> = {
  car: "road",
  bus: "road",
  fireEngine: "road",
  policeCar: "road",
  train: "track",
  airplane: "sky",
  helicopter: "sky",
  boat: "water",
  tractor: "roadwork",
  digger: "roadwork",
  motorcycle: "road",
  bicycle: "road",
};

export const vehicleKind = (id: string) => KIND[id] ?? "road";

/** The ground / sky the vehicle travels through, at a given x offset. */
export const VehicleHabitat: React.FC<{ id: string; x?: number }> = ({
  id,
  x = 0,
}) => {
  const kind = vehicleKind(id);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {kind === "sky" ? (
        <g transform={`translate(${x * 0.3} 0)`}>
          <SkyClouds />
        </g>
      ) : (
        <g transform={`translate(${x} ${GROUND_Y + 40})`} filter="url(#wobbleSoft)">
          {kind === "track" ? <Track /> : null}
          {kind === "water" ? <Water /> : null}
          {kind === "road" ? <Road /> : null}
          {kind === "roadwork" ? <Road withCones /> : null}
        </g>
      )}
    </svg>
  );
};

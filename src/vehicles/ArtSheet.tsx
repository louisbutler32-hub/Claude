import React from "react";
import { AbsoluteFill } from "remotion";
import { loadVeggieFonts } from "../guess/fonts";
import { fonts } from "../guess/palette";
import { SceneFilters } from "../guess/scene";
import { VehicleDefs, VEHICLE_ART, VEHICLE_NAME } from "./vehicles";

export const VehicleArtSheet: React.FC = () => {
  loadVeggieFonts();
  const ids = Object.keys(VEHICLE_ART);
  return (
    <AbsoluteFill style={{ backgroundColor: "#eef4ea" }}>
      <SceneFilters />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <VehicleDefs />
        {ids.map((id, i) => {
          const Art = VEHICLE_ART[id];
          const col = i % 6;
          const row = Math.floor(i / 6);
          const cx = 170 + col * 300;
          const cy = 230 + row * 500;
          return (
            <g key={id}>
              <g transform={`translate(${cx} ${cy}) scale(0.85)`}>
                <Art />
              </g>
              <g transform={`translate(${cx + 130} ${cy + 190}) scale(0.42)`}>
                <Art sil />
              </g>
              <text
                x={cx}
                y={cy + 190}
                textAnchor="middle"
                fontFamily={fonts.display}
                fontSize={30}
                fill="#3a332c"
              >
                {VEHICLE_NAME[id]}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

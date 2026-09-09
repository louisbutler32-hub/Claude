import React from "react";
import { AbsoluteFill } from "remotion";
import { loadVeggieFonts } from "./fonts";
import { fonts } from "./palette";
import { SceneFilters } from "./scene";
import { BOARD_ORDER } from "./board";
import { Veggie, VeggieDefs, VEGGIE_NAME } from "./veggies";

/** Contact sheet of all twelve vegetables, colour beside silhouette. */
export const ArtSheet: React.FC = () => {
  loadVeggieFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#eef4ea" }}>
      <SceneFilters />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <VeggieDefs />
        {BOARD_ORDER.map((id, i) => {
          const col = i % 6;
          const row = Math.floor(i / 6);
          const cx = 170 + col * 300;
          const cy = 230 + row * 500;
          return (
            <g key={id}>
              <Veggie id={id} x={cx} y={cy} size={1.0} />
              <Veggie id={id} x={cx + 130} y={cy + 190} size={0.5} sil />
              <text
                x={cx}
                y={cy + 190}
                textAnchor="middle"
                fontFamily={fonts.display}
                fontSize={34}
                fill="#3a332c"
              >
                {VEGGIE_NAME[id]}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

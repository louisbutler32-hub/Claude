import React from "react";
import { AbsoluteFill } from "remotion";
import { Item } from "../guess/Board";
import { loadVeggieFonts } from "../guess/fonts";
import { fonts } from "../guess/palette";
import { SceneFilters } from "../guess/scene";
import { FruitDefs, FRUIT_NAME, type FruitId } from "./fruit";
import { fruitSubject } from "./subject";

/** Contact sheet of all twelve fruits, colour beside silhouette. */
export const FruitArtSheet: React.FC = () => {
  loadVeggieFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#eef4ea" }}>
      <SceneFilters />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <FruitDefs />
        {(fruitSubject.boardOrder as FruitId[]).map((id, i) => {
          const col = i % 6;
          const row = Math.floor(i / 6);
          const cx = 170 + col * 300;
          const cy = 230 + row * 500;
          return (
            <g key={id}>
              <Item subject={fruitSubject} id={id} x={cx} y={cy} size={1.0} />
              <Item subject={fruitSubject} id={id} x={cx + 130} y={cy + 190} size={0.5} sil />
              <text x={cx} y={cy + 190} textAnchor="middle" fontFamily={fonts.display} fontSize={34} fill="#3a332c">
                {FRUIT_NAME[id]}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

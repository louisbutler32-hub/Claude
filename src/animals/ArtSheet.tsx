import React from "react";
import { AbsoluteFill } from "remotion";
import { loadVeggieFonts } from "../guess/fonts";
import { fonts } from "../guess/palette";
import { SceneFilters } from "../guess/scene";
import { AnimalDefs, ANIMAL_ART, ANIMAL_NAME } from "./animals";

/** Contact sheet of all twelve animals, colour beside silhouette. */
export const AnimalArtSheet: React.FC = () => {
  loadVeggieFonts();
  const ids = Object.keys(ANIMAL_ART);
  return (
    <AbsoluteFill style={{ backgroundColor: "#eef4ea" }}>
      <SceneFilters />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <AnimalDefs />
        {ids.map((id, i) => {
          const Art = ANIMAL_ART[id];
          const col = i % 6;
          const row = Math.floor(i / 6);
          const cx = 170 + col * 300;
          const cy = 230 + row * 500;
          return (
            <g key={id}>
              <g transform={`translate(${cx} ${cy}) scale(0.95)`}>
                <Art />
              </g>
              <g transform={`translate(${cx + 130} ${cy + 190}) scale(0.48)`}>
                <Art sil />
              </g>
              <text
                x={cx}
                y={cy + 190}
                textAnchor="middle"
                fontFamily={fonts.display}
                fontSize={34}
                fill="#3a332c"
              >
                {ANIMAL_NAME[id]}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill } from "remotion";
import { loadVeggieFonts } from "../guess/fonts";
import { fonts } from "../guess/palette";
import { usePhotoArt } from "../guess/photoArt";
import { SceneFilters } from "../guess/scene";
import { FRUIT_NAME, FRUIT_PHOTO_ART, FRUIT_PHOTO_CREDITS } from "./fruits";

export const FruitArtSheet: React.FC = () => {
  loadVeggieFonts();
  usePhotoArt("fruits", FRUIT_PHOTO_CREDITS);
  const ids = Object.keys(FRUIT_PHOTO_ART);
  return (
    <AbsoluteFill style={{ backgroundColor: "#eef4ea" }}>
      <SceneFilters />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {ids.map((id, i) => {
          const Art = FRUIT_PHOTO_ART[id];
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
                fontSize={26}
                fill="#3a332c"
              >
                {FRUIT_NAME[id]}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

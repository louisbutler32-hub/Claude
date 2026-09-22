import React from "react";
import { AbsoluteFill } from "remotion";
import { loadVeggieFonts } from "../guess/fonts";
import { fonts } from "../guess/palette";
import { usePhotoArt } from "../guess/photoArt";
import { SceneFilters } from "../guess/scene";
import { DINO_NAME, DINO_PHOTO_ART, DINO_PHOTO_CREDITS } from "./dinosaurs";

export const DinoArtSheet: React.FC = () => {
  loadVeggieFonts();
  usePhotoArt("dinosaurs", DINO_PHOTO_CREDITS);
  const ids = Object.keys(DINO_PHOTO_ART);
  return (
    <AbsoluteFill style={{ backgroundColor: "#eef4ea" }}>
      <SceneFilters />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {ids.map((id, i) => {
          const Art = DINO_PHOTO_ART[id];
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
                {DINO_NAME[id]}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

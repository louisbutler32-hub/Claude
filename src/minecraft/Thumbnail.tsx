import React from "react";
import { AbsoluteFill } from "remotion";
import { H, PANEL_TOP, W } from "./beats";
import { Figure, POSE } from "./figure";
import { loadMinecraftFonts } from "./fonts";
import { Item } from "./pixels";
import { CaveWide } from "./worlds";
import { CaptionBand } from "./MinecraftShort";

/**
 * 9:16 thumbnail: the caption, and the moment it's all still there —
 * the one frame the whole joke turns on.
 */
export const MinecraftThumb: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="mcPanelT">
            <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} />
          </clipPath>
        </defs>
        <g clipPath="url(#mcPanelT)">
          <g transform="translate(-260 -330) scale(1.38)">
            <CaveWide />
            <Item name="cobble" x={135} y={1445} px={11} />
            <Item name="pickaxe" x={240} y={1545} px={11} rotate={8} />
            <Item name="goldIngot" x={400} y={1490} px={11} rotate={-8} />
            <Item name="goldApple" x={500} y={1410} px={11} />
            <Item name="bread" x={570} y={1530} px={11} rotate={-22} />
            <Item name="bucket" x={685} y={1395} px={11} />
            <Item name="redstone" x={840} y={1425} px={11} />
            <Item name="ironIngot" x={940} y={1515} px={11} rotate={-12} />
            <Figure x={715} y={1030} pose={POSE.cheeks} face="joy" armsOverHead tilt={-6} />
          </g>
        </g>
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};

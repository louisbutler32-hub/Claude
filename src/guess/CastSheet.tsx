import React from "react";
import { AbsoluteFill } from "remotion";
import { Bloom, Munch, PebbloKid, Pip, Tock, Wisp } from "./cast";
import { loadVeggieFonts } from "./fonts";
import { fonts } from "./palette";
import { Grass, GROUND_Y, H, PaperGrain, SceneFilters, Sky, W } from "./scene";

/** Model sheet for the Peekaboo Pebblo cast — every pose, on the meadow. */
export const CastSheet: React.FC = () => {
  loadVeggieFonts();
  const label = (x: number, y: number, t: string) => (
    <text x={x} y={y} textAnchor="middle" fontFamily={fonts.display} fontSize={34} fill="#3a332c">
      {t}
    </text>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#dceaee" }}>
      <SceneFilters />
      <Sky />
      <Grass />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {(["stand", "wave", "think", "tada", "cheer"] as const).map((pose, i) => (
          <g key={pose} transform={`translate(${200 + i * 300} 300)`}>
            <PebbloKid pose={pose} wave={0.7} look={pose === "think" ? [0.6, -0.8] : [0, 0]} />
            {label(0, 190, `Pebblo · ${pose}`)}
          </g>
        ))}
        <g transform="translate(1720 300)">
          <PebbloKid pose="stand" blink={1} />
          {label(0, 190, "Pebblo · blink")}
        </g>
        <g transform={`translate(260 ${GROUND_Y + 20}) scale(1.15)`}>
          <Munch chomp={0} step={0.8} />
        </g>
        {label(260, GROUND_Y + 80, "Munch · open")}
        <g transform={`translate(680 ${GROUND_Y + 20}) scale(1.15)`}>
          <Munch chomp={1} step={2.4} />
        </g>
        {label(680, GROUND_Y + 80, "Munch · shut")}
        {[
          [Pip, "Pip"],
          [Bloom, "Bloom"],
          [Tock, "Tock"],
          [Wisp, "Wisp"],
        ].map(([C, name], i) => {
          const Comp = C as React.FC;
          return (
            <g key={name as string} transform={`translate(${1060 + i * 250} ${GROUND_Y - 110}) scale(1.2)`}>
              <Comp />
              {label(0, 130, name as string)}
            </g>
          );
        })}
      </svg>
      <PaperGrain />
    </AbsoluteFill>
  );
};

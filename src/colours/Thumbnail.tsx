import React from "react";
import { AbsoluteFill } from "remotion";
import { BoardThumb, type ThumbConfig } from "../guess/Thumbnail";
import { Item } from "../guess/Board";
import { Crocodile } from "../guess/critters";
import { loadVeggieFonts } from "../guess/fonts";
import { fonts } from "../guess/palette";
import {
  Clouds,
  Grass,
  H,
  PaperGrain,
  SceneFilters,
  Sky,
  Sun,
  W,
} from "../guess/scene";
import { colourSubject } from "./subject";

/**
 * The colours episode has no shadow beat, so the format's usual "three
 * silhouettes and a question mark" thumbnail (ShadowThumb) would show the
 * wrong hook. Thumb A is bespoke instead: three heroes in full colour over
 * big soft colour-wash blobs, the same "wash" trick the mid-beat uses.
 * Thumb B reuses the generic board thumbnail unchanged.
 */

const config: ThumbConfig = {
  subject: colourSubject,
  noun: "COLOURS!",
  heroes: [
    { id: "red", x: 430, scale: 2.0 },
    { id: "blue", x: 960, scale: 1.85 },
    { id: "yellow", x: 1500, scale: 1.95 },
  ],
  boardLine: "CAN YOU NAME ALL 12?",
};

const TITLE_COLORS: [string, string][] = [
  ["#ea5b52", "#c23f38"],
  ["#ef8a3c", "#c96a22"],
  ["#f3c93f", "#cfa423"],
  ["#4a9450", "#357038"],
  ["#3f83bd", "#2d6699"],
  ["#8b58b3", "#6b3d92"],
];
const KICKER_COLORS: [string, string][] = [["#ffffff", "#2f5d2a"]];

const PunchLine: React.FC<{
  text: string;
  colors: [string, string][];
  size: number;
  top: number;
  steady?: boolean;
}> = ({ text, colors, size, top, steady = false }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      pointerEvents: "none",
    }}
  >
    {text.split("").map((ch, i) => {
      if (ch === " ") return <span key={i} style={{ width: size * 0.26 }} />;
      const [fill, shade] = colors[i % colors.length];
      const tilt = (i % 2 === 0 ? -1 : 1) * (steady ? 1.2 : 2 + (i % 3));
      return (
        <span
          key={i}
          style={{
            fontFamily: fonts.script,
            fontWeight: 800,
            fontSize: size,
            lineHeight: 0.92,
            color: fill,
            WebkitTextStroke: `${size * (steady ? 0.115 : 0.075)}px ${shade}`,
            paintOrder: "stroke fill",
            textShadow: `0 ${size * 0.055}px 0 ${shade}, 0 ${size * 0.1}px ${
              size * 0.09
            }px rgba(50,40,30,.35)`,
            transform: `rotate(${tilt}deg)`,
            display: "inline-block",
            margin: `0 -${size * 0.018}px`,
          }}
        >
          {ch}
        </span>
      );
    })}
  </div>
);

const WASHES: { x: number; y: number; r: number; hex: string }[] = [
  { x: 430, y: 700, r: 460, hex: "#ea5b52" },
  { x: 960, y: 660, r: 500, hex: "#3f83bd" },
  { x: 1500, y: 700, r: 460, hex: "#f3c93f" },
];

export const ColourThumbA: React.FC = () => {
  loadVeggieFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#dceaee", overflow: "hidden" }}>
      <SceneFilters />
      <Sky />
      <Clouds />
      <Sun happy />
      <Grass tulips />

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {WASHES.map((w) => (
          <circle
            key={w.hex}
            cx={w.x}
            cy={w.y}
            r={w.r}
            fill={w.hex}
            opacity={0.28}
            filter="url(#wobbleSoft)"
          />
        ))}
      </svg>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <colourSubject.Defs />
        {config.heroes.map((h) => (
          <Item
            key={h.id}
            subject={colourSubject}
            id={h.id}
            x={h.x}
            y={700}
            size={h.scale}
          />
        ))}
      </svg>

      <PunchLine text="LEARN" colors={KICKER_COLORS} size={150} top={40} steady />
      <PunchLine text="COLOURS!" colors={TITLE_COLORS} size={224} top={176} />

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(240 ${H - 96}) scale(1.02)`}>
          <Crocodile chomp={0.1} step={1.1} />
        </g>
      </svg>
      <PaperGrain opacity={0.12} />
    </AbsoluteFill>
  );
};

export const ColourThumbB: React.FC = () => <BoardThumb config={config} />;

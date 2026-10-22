import React from "react";
import { AbsoluteFill } from "remotion";
import { CinematicStyle } from "./Cinematic";
import { EngravingStyle } from "./Engraving";
import { PaperStyle } from "./Paper";
import { PosterStyle } from "./Poster";
import { FONT, useHistFonts } from "./shared";

// All four looks at once, half size in a 2×2 grid, for picking one.
const STYLES = [
  { key: "A", name: "Ink & Parchment", C: EngravingStyle },
  { key: "B", name: "Paper Diorama", C: PaperStyle },
  { key: "C", name: "Cinematic Dusk", C: CinematicStyle },
  { key: "D", name: "Two-Ink Print", C: PosterStyle },
];

export const StyleCompare: React.FC = () => {
  useHistFonts();
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {STYLES.map(({ key, name, C }, i) => (
        <div
          key={key}
          style={{
            position: "absolute",
            left: (i % 2) * 540,
            top: Math.floor(i / 2) * 960,
            width: 540,
            height: 960,
            overflow: "hidden",
          }}
        >
          <div style={{ width: 1080, height: 1920, transform: "scale(0.5)", transformOrigin: "0 0", position: "relative" }}>
            <C />
          </div>
          <div
            style={{
              position: "absolute",
              left: 14,
              top: 14,
              padding: "6px 14px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.72)",
              color: "#fff",
              fontFamily: FONT.montserrat,
              fontWeight: 800,
              fontSize: 24,
            }}
          >
            {key} · {name}
          </div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 539, top: 0, width: 2, height: 1920, background: "#111" }} />
      <div style={{ position: "absolute", left: 0, top: 959, width: 1080, height: 2, background: "#111" }} />
    </AbsoluteFill>
  );
};

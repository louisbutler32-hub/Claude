import React from "react";
import { AbsoluteFill } from "remotion";
import { PURCHASE } from "./louisiana/LouisianaShort";
import { FONT_SANS } from "./fonts";
import { GeoCanvas } from "./GeoCanvas";
import { Highlight, Label, Measure, Route, Wash } from "./layers";
import { LonLat } from "./projection";
import { patch, shapeNames } from "./shapes";

// ── Thumbnails, 9:16 ──────────────────────────────────────────────────
// A frame from the short with the hook written across the top in the
// channel's bold caps. Render at frame 45 so every pop-in has landed:
//
//   npm run geo:bering:thumb     → out/thumbnail-geo-bering.jpg
//
// Shorts only show a custom thumbnail on the channel page and in search;
// the feed shows the video itself. So the title is the first frame's job
// and this is the tidy version for the grid.

export const THUMB_FRAMES = 60;

const Title: React.FC<{ lines: { text: string; color?: string; size?: number }[]; y?: number }> = ({ lines, y = 210 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y,
      textAlign: "center",
      fontFamily: FONT_SANS,
      fontWeight: 900,
      lineHeight: 1.02,
      letterSpacing: "-0.01em",
      textShadow: "0 4px 0 rgba(0,0,0,0.35), 0 10px 30px rgba(0,0,0,0.75)",
      WebkitTextStroke: "3px rgba(0,0,0,0.35)",
      paintOrder: "stroke fill",
    }}
  >
    {lines.map((l, i) => (
      <div key={i} style={{ color: l.color ?? "#ffffff", fontSize: l.size ?? 132 }}>
        {l.text}
      </div>
    ))}
  </div>
);

const Bottom: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 150,
      textAlign: "center",
      fontFamily: FONT_SANS,
      fontWeight: 800,
      fontSize: 54,
      color: "#ffffff",
      textShadow: "0 3px 14px rgba(0,0,0,0.8)",
      letterSpacing: "0.04em",
    }}
  >
    {text}
  </div>
);

export const BeringThumb: React.FC = () => (
  <AbsoluteFill>
    <GeoCanvas
      camera={{ lon: -169.0, lat: 65.55, scale: 66000 }}
      hud={
        <>
          <Title lines={[{ text: "WHY NO" }, { text: "BRIDGE?", color: "#ffd23f" }]} />
          <Bottom text="RUSSIA · 82 KM · ALASKA" />
        </>
      }
    >
      <Highlight shape="chukotka" flag="russia" in={0} minArea={1} flagBox={[[-174.5, 67.0], [-169.4, 65.4]]} />
      <Highlight shape="alaska" flag="usa" in={0} minArea={1} flagBox={[[-168.3, 66.2], [-165.4, 64.4]]} />
      <Measure from={[-169.66, 66.05]} to={[-168.1, 65.62]} text="82 km" in={0} offset={-60} />
    </GeoCanvas>
  </AbsoluteFill>
);

export const LouisianaThumb: React.FC = () => (
  <AbsoluteFill>
    <GeoCanvas
      camera={{ lon: -97, lat: 36, scale: 4600 }}
      hud={
        <>
          <Title lines={[{ text: "SOLD FOR", size: 110 }, { text: "3¢ AN ACRE", color: "#ffd23f", size: 150 }]} />
          <Bottom text="1803 · $15 MILLION · 15 STATES" />
        </>
      }
    >
      <Highlight ring={PURCHASE} flag="france" in={0} />
      <Label at={[-99.5, 42.5]} text="LOUISIANA" size={64} in={0} rotate={-12} />
    </GeoCanvas>
  </AbsoluteFill>
);

const NORTH: LonLat[] = [
  [-148.35, 70.3], [-147.7, 64.84], [-135.05, 60.72], [-120.2, 55.76], [-113.5, 53.55], [-111.3, 47.5],
  [-104.99, 39.74], [-106.49, 31.76], [-99.13, 19.43], [-90.51, 14.63], [-86.25, 12.13], [-84.08, 9.93],
  [-79.52, 8.98], [-77.69, 8.16],
];
const SOUTH: LonLat[] = [
  [-76.72, 8.09], [-74.07, 4.71], [-78.47, -0.18], [-77.03, -12.05], [-70.3, -18.48], [-70.65, -33.45],
  [-58.38, -34.6], [-67.5, -45.87], [-68.3, -54.8],
];

export const DarienThumb: React.FC = () => (
  <AbsoluteFill>
    <GeoCanvas
      camera={{ lon: -92, lat: 12, scale: 3000 }}
      hud={
        <>
          <Title lines={[{ text: "YOU CAN'T DRIVE", size: 100 }, { text: "ALASKA → ARGENTINA", size: 88 }, { text: "GUESS WHY", color: "#ffd23f", size: 150 }]} y={170} />
          <Bottom text="30,000 KM · ONE 106 KM HOLE" />
        </>
      }
    >
      <Route points={NORTH} in={0} dur={0.01} color="#ffd23f" width={8} />
      <Route points={SOUTH} in={0} dur={0.01} color="#ffd23f" width={8} />
      <Route points={[[-77.69, 8.16], [-76.72, 8.09]]} in={0} dur={0.01} color="#ff4b3e" width={14} glow />
      <Label at={[-77.2, 8.1]} text="106 KM" size={54} in={0} dy={-90} color="#ff4b3e" />
    </GeoCanvas>
  </AbsoluteFill>
);

export const Ww1Thumb: React.FC = () => (
  <AbsoluteFill>
    <GeoCanvas
      camera={{ lon: 12, lat: 50.5, scale: 6600 }}
      hud={
        <>
          <Title lines={[{ text: "WHAT IF", size: 100 }, { text: "GERMANY WON", size: 118 }, { text: "WORLD WAR 1?", color: "#ffd23f", size: 118 }]} y={170} />
          <Bottom text="1918 · 56 KM FROM PARIS" />
        </>
      }
    >
      <Wash shapes={["france", "belgium", "netherlands", "luxembourg", "denmark", "austria", "hungary", "czechia", "poland", "italy", "sweden", "norway", "finland", "estonia", "latvia", "lithuania", "belarus", "ukraine"]} color="#8b1e1e" opacity={0.45} outline="#ffffff" outlineWidth={2.5} in={0} draw={0.01} />
      <Highlight shape="germany" flag="germany1914" in={0} />
    </GeoCanvas>
  </AbsoluteFill>
);

export const WaterlooThumb: React.FC = () => (
  <AbsoluteFill>
    <GeoCanvas
      camera={{ lon: 9, lat: 48.5, scale: 5600 }}
      hud={
        <>
          <Title lines={[{ text: "WHAT IF", size: 100 }, { text: "NAPOLEON WON", size: 112 }, { text: "WATERLOO?", color: "#ffd23f", size: 140 }]} y={170} />
          <Bottom text="1815 · 250,000 VS 850,000" />
        </>
      }
    >
      <Highlight shape="france" flag="napoleon" in={0} />
      <Route points={[[16.37, 48.2], [7.75, 48.58]]} in={0} dur={0.01} color="#e63946" width={10} head="dot" />
      <Route points={[[21.0, 52.2], [8.27, 50.0]]} in={0} dur={0.01} color="#e63946" width={10} head="dot" />
      <Route points={[[13.4, 52.5], [6.96, 50.94]]} in={0} dur={0.01} color="#e63946" width={10} head="dot" />
      <Route points={[[-0.13, 51.5], [4.35, 50.85]]} in={0} dur={0.01} color="#e63946" width={10} head="dot" />
      <Route points={[[7.69, 45.07], [5.6, 45.4]]} in={0} dur={0.01} color="#e63946" width={10} head="dot" />
    </GeoCanvas>
  </AbsoluteFill>
);

export const TexasThumb: React.FC = () => (
  <AbsoluteFill>
    <GeoCanvas
      camera={{ lon: -99.5, lat: 31.0, scale: 8200 }}
      hud={
        <>
          <Title lines={[{ text: "WHAT IF TEXAS", size: 104 }, { text: "STAYED A", size: 104 }, { text: "COUNTRY?", color: "#ffd23f", size: 150 }]} y={170} />
          <Bottom text="WORLD'S 8TH LARGEST ECONOMY" />
        </>
      }
    >
      <Highlight shape="state:Texas" flag="texas" in={0} />
    </GeoCanvas>
  </AbsoluteFill>
);

const LOWER48_THUMB = shapeNames().filter(
  (n) => n.startsWith("state:") && !["state:Alaska", "state:Hawaii", "state:District of Columbia"].includes(n)
);

export const StatesThumb: React.FC = () => (
  <AbsoluteFill>
    <GeoCanvas
      camera={{ lon: -97, lat: 37.5, scale: 4600 }}
      hud={
        <>
          <Title lines={[{ text: "50 STATES", size: 120 }, { text: "AT WAR", size: 120 }, { text: "WHO WINS?", color: "#ffd23f", size: 140 }]} y={170} />
          <Bottom text="THE ANSWER IS THREE STATES" />
        </>
      }
    >
      {LOWER48_THUMB.map((name, i) => (
        <Wash key={name} shape={name} color={patch(i)} opacity={0.62} outline="#ffffff" outlineWidth={2} in={0} draw={0.01} />
      ))}
    </GeoCanvas>
  </AbsoluteFill>
);

import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { StraitSection } from "../diagrams";
import { GeoCanvas } from "../GeoCanvas";
import { BigNumber, Callout, Captions, Slam, Tag } from "../hud";
import { Dashed, Highlight, Label, Measure, Pin, Route, Spot } from "../layers";
import { CameraKey, LonLat } from "../projection";
import { Line, beatsOf } from "../timing";
import timing from "./timing.json";

// ── Why is there no bridge between Russia and Alaska? ─────────────────
//
// 60 s, 9:16. The whole edit is keyed off timing.json, which the voice
// build writes, so every beat below is "when this line starts" plus an
// offset — never a number typed off the render.
//
//   python3 scripts/make-vo.py geo-bering     # narration + timing.json
//   npm run geo:bering                        # the render

export const BERING_SECONDS = 60;
export const BERING_FPS = 30;

const LINES = timing as Line[];
const B = beatsOf(LINES, BERING_SECONDS);

// ── places ────────────────────────────────────────────────────────────
const STRAIT: LonLat = [-169.0, 65.82];
const DEZHNEV: LonLat = [-169.66, 66.05]; // the Russian shore
const WALES: LonLat = [-168.1, 65.62]; // the Alaskan shore
const BIG_DIOMEDE: LonLat = [-169.05, 65.79];
const LITTLE_DIOMEDE: LonLat = [-168.925, 65.755];
const BIG_EAST_SHORE: LonLat = [-168.998, 65.785];
const LITTLE_WEST_SHORE: LonLat = [-168.95, 65.758];
const DATE_LINE: LonLat[] = [
  [-168.977, 66.4],
  [-168.977, 65.2],
];
const FAIRBANKS: LonLat = [-147.72, 64.84];
const NOME: LonLat = [-165.41, 64.5];
const MAGADAN: LonLat = [150.8, 59.56];
const ANADYR: LonLat = [177.5, 64.73];

const CAMERA: CameraKey[] = [
  { at: 0, lon: -175, lat: 62.5, scale: 3600 },
  { at: B.strait.start, lon: -172.5, lat: 63.8, scale: 5000 },
  { at: B.strait.start + 1.7, lon: -169.0, lat: 65.86, scale: 72000 },
  { at: B.islands.start, lon: -169.0, lat: 65.84, scale: 78000 },
  { at: B.islands.start + 1.9, lon: -168.985, lat: 65.775, scale: 560000 },
  { at: B.depth.start, lon: -168.985, lat: 65.775, scale: 600000 },
  { at: B.roads.start - 0.3, lon: -168.985, lat: 65.775, scale: 600000 },
  { at: B.roads.start + 1.4, lon: -173.5, lat: 63.4, scale: 5000 },
  { at: B.plans.start, lon: -172.5, lat: 64.0, scale: 5400 },
  { at: B.plans.start + 1.6, lon: -169.0, lat: 65.86, scale: 72000 },
  { at: B.swim.start, lon: -169.0, lat: 65.84, scale: 76000 },
  { at: B.swim.start + 1.7, lon: -168.985, lat: 65.775, scale: 560000 },
  { at: BERING_SECONDS, lon: -168.985, lat: 65.775, scale: 600000 },
];

const T_STRAIT_CLOSE = B.strait.start + 1.7;
const T_HOOK_OFF = B.strait.start + 0.8;
const T_ISLANDS_CLOSE = B.islands.start + 1.9;
const T_PANEL_END = B.roads.start + 0.4;
const T_ROADS_WIDE = B.roads.start + 1.4;
const T_PLANS_CLOSE = B.plans.start + 1.6;

export const BeringShort: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile("assets/vo/geo-bering.mp3")} />
    <Audio src={staticFile("assets/vo/geo-bed.mp3")} volume={0.22} />
    <GeoCanvas
      camera={CAMERA}
      hud={
        <>
          {/* ── the question ── */}
          <Tag text="?" in={0.6} until={B.strait.start + 0.6} at={STRAIT} size={64} bg="#e63946" />

          {/* ── the date line ── */}
          <Tag text="INTERNATIONAL DATE LINE" in={B.dateline.start + 0.2} until={B.depth.start} x={540} y={300} size={30} />
          <Callout text="SUNDAY" icon="calendar" in={B.dateline.start + 2.6} until={B.names.start + 0.2} at={BIG_DIOMEDE} dx={-80} dy={-250} size={50} font="sans" weight={800} glow="rgba(255,255,255,0.5)" />
          <Callout text="SATURDAY" icon="calendar" in={B.dateline.start + 3.2} until={B.names.start + 0.2} at={LITTLE_DIOMEDE} dx={110} dy={230} size={50} font="sans" weight={800} glow="rgba(255,255,255,0.5)" />
          <Callout text="TOMORROW ISLAND" in={B.names.start + 1.6} until={B.depth.start} at={BIG_DIOMEDE} dx={-40} dy={-250} size={46} font="sans" weight={800} glow="rgba(255,255,255,0.5)" />
          <Callout text="YESTERDAY ISLAND" in={B.names.start + 0.6} until={B.depth.start} at={LITTLE_DIOMEDE} dx={60} dy={230} size={46} font="sans" weight={800} glow="rgba(255,255,255,0.5)" />

          {/* ── the cut-away: depth, then the ice ── */}
          <StraitSection
            in={B.depth.start}
            until={T_PANEL_END}
            left="RUSSIA"
            right="ALASKA"
            depthM={55}
            depthText="55 M"
            depthSub="(180 FT)"
            compare={{
              at: B.depth.start + 3.5,
              title: "CHANNEL TUNNEL",
              waterM: 45,
              tunnelM: 75,
              tunnelText: "75 M",
              tunnelSub: "(246 FT)",
            }}
            iceAt={B.ice.start + 0.3}
            thermo={{ at: B.ice.start + 4.2, text: "−50 °C" }}
            bridge
          />

          {/* ── nothing to nothing ── */}
          <Tag text="1,200 km" in={B.roads.start + 4.2} until={B.plans.start + 0.6} at={[-157.5, 67.6]} size={36} bg="#e63946" />
          <Tag text="2,000 km" in={B.roads.start + 6.0} until={B.plans.start + 0.6} at={[166, 60.6]} size={36} bg="#e63946" />

          {/* ── the plans ── */}
          <BigNumber text="1890" in={B.plans.start + 0.3} until={B.plans.start + 2.7} y={360} size={150} />
          <BigNumber text="2011" in={B.plans.start + 2.7} until={B.nothing.start} y={360} size={150} />
          <Callout text="$65 BILLION" icon="coin" in={B.plans.start + 4.4} until={B.nothing.start + 0.2} y={560} size={58} />
          <Slam text={"NOTHING\nWAS BUILT"} in={B.nothing.start + 0.15} until={B.swim.start + 0.9} size={118} />

          {/* ── the swim ── */}
          <Callout text="1987" icon="calendar" in={B.swim.start + 0.4} until={BERING_SECONDS} y={330} size={64} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="2 H 6 MIN" icon="clock" in={B.swim.start + 4.6} until={BERING_SECONDS} y={470} size={54} />

          <Captions lines={LINES} />
        </>
      }
    >
      {/* ── hook: two countries, one strait ── */}
      <Highlight shape="russia" flag="russia" in={0.25} until={T_HOOK_OFF} flagBox={[[128, 74], [192, 50]]} />
      <Highlight shape="alaska" flag="usa" in={0.45} until={T_HOOK_OFF} flagBox={[[-171, 71.5], [-129, 54]]} />
      <Label at={[168, 67.5]} text="RUSSIA" size={60} in={0.9} until={B.strait.start + 0.4} rotate={-8} />
      <Label at={[-152, 63.5]} text="ALASKA" size={60} in={1.2} until={B.strait.start + 0.4} rotate={6} />

      {/* ── the strait, 82 km ── */}
      <Highlight shape="chukotka" flag="russia" in={T_HOOK_OFF - 0.1} until={T_ISLANDS_CLOSE - 0.9} minArea={1} flagBox={[[-174.5, 67.0], [-169.4, 65.4]]} />
      <Highlight shape="alaska" flag="usa" in={T_HOOK_OFF} until={T_ISLANDS_CLOSE - 0.9} minArea={1} flagBox={[[-168.3, 66.2], [-165.4, 64.4]]} />
      <Label at={[-170.7, 66.5]} text="RUSSIA" size={54} in={T_STRAIT_CLOSE + 0.1} until={T_ISLANDS_CLOSE - 0.4} />
      <Label at={[-167.55, 65.2]} text="ALASKA" size={54} in={T_STRAIT_CLOSE + 0.2} until={T_ISLANDS_CLOSE - 0.4} />
      <Measure from={DEZHNEV} to={WALES} text="82 km" in={B.strait.start + 2.2} until={T_ISLANDS_CLOSE - 0.6} offset={-60} />

      {/* ── the islands ── */}
      <Highlight shape="chukotka" flag="russia" in={T_ISLANDS_CLOSE - 1.0} until={B.depth.start + 0.4} minArea={1} />
      <Highlight shape="alaska" flag="usa" in={T_ISLANDS_CLOSE - 1.0} until={B.depth.start + 0.4} minArea={1} />
      <Label at={BIG_DIOMEDE} text="BIG DIOMEDE" size={44} in={B.islands.start + 2.4} until={B.dateline.start + 2.4} dy={-150} />
      <Label at={LITTLE_DIOMEDE} text="LITTLE DIOMEDE" size={44} in={B.islands.start + 3.6} until={B.dateline.start + 2.4} dy={130} />
      <Measure from={BIG_EAST_SHORE} to={LITTLE_WEST_SHORE} text="3.8 km" in={B.gap.start + 0.3} until={B.dateline.start + 0.4} offset={-90} />
      <Dashed points={DATE_LINE} in={B.dateline.start + 0.1} until={B.depth.start} color="#ffffff" width={5} />

      {/* ── nothing to nothing ── */}
      <Spot at={STRAIT} in={T_ROADS_WIDE - 0.4} until={B.plans.start + 0.6} color="#ffffff" r={46} />
      <Route points={[STRAIT, NOME, FAIRBANKS]} in={B.roads.start + 2.6} dur={1.6} until={B.plans.start + 0.6} color="#ff6b6b" width={6} dashed head="dot" />
      <Pin at={FAIRBANKS} label="Fairbanks" in={B.roads.start + 4.0} until={B.plans.start + 0.6} side="left" />
      <Route points={[STRAIT, ANADYR, MAGADAN]} in={B.roads.start + 5.4} dur={1.8} until={B.plans.start + 0.6} color="#ff6b6b" width={6} dashed head="dot" />
      <Pin at={MAGADAN} label="Magadan" in={B.roads.start + 6.8} until={B.plans.start + 0.6} side="right" />

      {/* ── the plans: a ghost bridge ── */}
      <Highlight shape="chukotka" flag="russia" in={T_PLANS_CLOSE - 0.5} until={B.swim.start + 1.6} minArea={1} glow={0.5} flagBox={[[-174.5, 67.0], [-169.4, 65.4]]} />
      <Highlight shape="alaska" flag="usa" in={T_PLANS_CLOSE - 0.4} until={B.swim.start + 1.6} minArea={1} glow={0.5} flagBox={[[-168.3, 66.2], [-165.4, 64.4]]} />
      <Route points={[DEZHNEV, BIG_DIOMEDE, LITTLE_DIOMEDE, WALES]} in={B.plans.start + 0.6} dur={1.8} until={B.nothing.start + 0.1} color="#ffffff" width={7} dashed glow={false} />
      <Route points={[DEZHNEV, BIG_DIOMEDE, LITTLE_DIOMEDE, WALES]} in={B.nothing.start + 0.1} dur={0.4} until={B.swim.start + 1.6} color="#e5322d" width={7} dashed glow={false} />

      {/* ── the swim ── */}
      <Highlight shape="chukotka" flag="russia" in={B.swim.start + 1.6} minArea={1} glow={0.6} />
      <Highlight shape="alaska" flag="usa" in={B.swim.start + 1.7} minArea={1} glow={0.6} />
      <Route points={[LITTLE_WEST_SHORE, BIG_EAST_SHORE]} in={B.swim.start + 2.3} dur={2.8} color="#5ce1ff" width={8} head="dot" />
    </GeoCanvas>
  </AbsoluteFill>
);

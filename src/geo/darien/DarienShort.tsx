import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { GeoCanvas } from "../GeoCanvas";
import { BigNumber, Callout, Captions, IconRow, Tag } from "../hud";
import { Highlight, Label, Measure, Pin, Route, Wash } from "../layers";
import { CameraKey, LonLat } from "../projection";
import { Line, beatsOf } from "../timing";
import timing from "./timing.json";

// ── The Darién Gap: the hole in the longest road in the world ─────────
//
// 60 s, 9:16. Timed off timing.json, which the voice build writes.
//
//   python3 scripts/make-vo.py geo-darien
//   npm run geo:darien

export const DARIEN_SECONDS = 60;
export const DARIEN_FPS = 30;

const LINES = timing as Line[];
const B = beatsOf(LINES, DARIEN_SECONDS);

// ── the road, city to city ────────────────────────────────────────────
const PRUDHOE: LonLat = [-148.35, 70.3];
const USHUAIA: LonLat = [-68.3, -54.8];
const YAVIZA: LonLat = [-77.69, 8.16];
const TURBO: LonLat = [-76.72, 8.09];

const NORTH_ROAD: LonLat[] = [
  PRUDHOE, [-147.7, 64.84], [-145.7, 64.0], [-143.0, 63.3], [-135.05, 60.72],
  [-128.7, 60.06], [-122.7, 58.8], [-120.2, 55.76], [-113.5, 53.55], [-114.07, 51.05],
  [-111.3, 47.5], [-104.99, 39.74], [-106.65, 35.08], [-106.49, 31.76], [-106.07, 28.63],
  [-99.13, 19.43], [-96.7, 17.07], [-93.1, 16.75], [-90.51, 14.63], [-89.19, 13.69],
  [-87.2, 14.07], [-86.25, 12.13], [-84.08, 9.93], [-79.52, 8.98], YAVIZA,
];
const SOUTH_ROAD: LonLat[] = [
  TURBO, [-75.57, 6.25], [-74.07, 4.71], [-76.52, 3.45], [-77.28, 1.21], [-78.47, -0.18],
  [-79.9, -2.19], [-80.63, -5.19], [-77.03, -12.05], [-71.54, -16.4], [-70.3, -18.48],
  [-70.4, -23.65], [-70.65, -33.45], [-68.83, -32.89], [-58.38, -34.6], [-62.27, -38.72],
  [-67.5, -45.87], [-69.22, -51.62], USHUAIA,
];
const GAP: LonLat[] = [YAVIZA, [-77.35, 8.02], [-77.05, 7.98], TURBO];

/** The Atrato floodplain on the Colombian side, and the park on the
 *  Panamanian side — both drawn by hand, both approximate. */
const ATRATO: LonLat[] = [
  [-77.15, 8.25], [-76.75, 8.3], [-76.55, 7.9], [-76.6, 7.3], [-76.9, 6.9], [-77.2, 7.1], [-77.3, 7.7],
];
const PARK: LonLat[] = [
  [-78.45, 8.75], [-77.95, 8.95], [-77.45, 8.7], [-77.25, 8.1], [-77.45, 7.5], [-77.95, 7.3], [-78.3, 7.6], [-78.5, 8.2],
];
const COLON: LonLat = [-79.9, 9.36];
const CARTAGENA: LonLat = [-75.5, 10.4];
const SEA_LANE: LonLat[] = [COLON, [-78.6, 10.3], [-77.0, 10.9], CARTAGENA];

const CAMERA: CameraKey[] = [
  { at: 0, lon: -96, lat: 4, scale: 2700 },
  { at: B.stops.start - 0.3, lon: -94, lat: 5, scale: 2850 },
  { at: B.stops.start + 2.0, lon: -77.4, lat: 8.15, scale: 95000 },
  { at: B.towns.start, lon: -77.3, lat: 8.1, scale: 100000 },
  { at: B.between.start, lon: -77.2, lat: 8.0, scale: 115000 },
  { at: B.expedition.start, lon: -77.2, lat: 8.05, scale: 120000 },
  { at: B.attempts.start, lon: -77.2, lat: 8.1, scale: 118000 },
  { at: B.why.start, lon: -77.4, lat: 8.15, scale: 110000 },
  { at: B.button.start - 0.2, lon: -77.4, lat: 8.2, scale: 108000 },
  { at: B.button.start + 1.5, lon: -77.8, lat: 9.3, scale: 24000 },
  { at: DARIEN_SECONDS, lon: -77.8, lat: 9.4, scale: 23000 },
];

const T_GAP_CLOSE = B.stops.start + 2.0;
const T_SEA = B.button.start + 1.5;
const ROAD_START = B.road.start + 0.8;
const ROAD_DUR = 4.6;

export const DarienShort: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile("assets/vo/geo-darien.mp3")} />
    <Audio src={staticFile("assets/vo/geo-bed.mp3")} volume={0.22} />
    <GeoCanvas
      camera={CAMERA}
      hud={
        <>
          {/* ── hook ── */}
          <Tag text="?" in={0.7} until={B.road.start + 0.6} at={[-77.5, 8.2]} size={64} bg="#e63946" />

          {/* ── the road ── */}
          <Callout text="30,000 KM" icon="road" in={B.road.start + 5.6} until={B.stops.start + 0.8} y={300} size={60} />
          <Callout text="14 COUNTRIES" in={B.road.start + 7.3} until={B.stops.start + 0.8} y={420} size={48} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Tag text="THE LONGEST ROAD IN THE WORLD" in={B.road.start + 8.6} until={B.stops.start + 0.8} x={540} y={510} size={30} bg="#f5a623" color="#1a1a1a" />

          {/* ── the gap ── */}
          <Tag text="DARIÉN GAP" in={B.stops.start + 5.6} until={B.expedition.start} at={[-77.35, 7.55]} size={38} bg="#e63946" />

          {/* ── in between ── */}
          <IconRow icons={["mountain", "tree", "swamp"]} in={B.between.start + 0.6} until={B.expedition.start + 0.2} y={430} step={0.75} size={130} />

          {/* ── the 1960 expedition ── */}
          <BigNumber text="1960" in={B.expedition.start + 0.2} until={B.attempts.start} y={300} size={140} />
          <Callout text="136 DAYS" icon="calendar" in={B.expedition.start + 4.3} until={B.attempts.start} y={450} size={56} />
          <Callout text="200 M PER HOUR" in={B.expedition.start + 6.2} until={B.attempts.start} y={560} size={44} font="caption" weight={700} glow="rgba(255,255,255,0.35)" />

          {/* ── the attempts ── */}
          <Callout text="1971 · WORK BEGINS" in={B.attempts.start + 0.4} until={B.why.start + 0.3} x={100} y={300} size={46} font="sans" weight={800} align="left" glow="rgba(255,255,255,0.4)" />
          <Callout text="1974 · HALTED" in={B.attempts.start + 3.0} until={B.why.start + 0.3} x={100} y={390} size={46} font="sans" weight={800} align="left" color="#ff6b6b" glow="rgba(255,80,60,0.5)" />
          <Callout text="1992 · SECOND ATTEMPT" in={B.attempts.start + 4.6} until={B.why.start + 0.3} x={100} y={480} size={46} font="sans" weight={800} align="left" glow="rgba(255,255,255,0.4)" />
          <Callout text="1994 · ABANDONED" in={B.attempts.start + 6.2} until={B.why.start + 0.3} x={100} y={570} size={46} font="sans" weight={800} align="left" color="#ff6b6b" glow="rgba(255,80,60,0.5)" />

          {/* ── why ── */}
          <IconRow icons={["disease", "tree", "people"]} in={B.why.start + 1.2} until={B.button.start + 0.3} y={330} step={2.5} size={130} />
          <Tag text="FOOT-AND-MOUTH" in={B.why.start + 1.6} until={B.button.start + 0.3} x={540} y={450} size={30} />
          <Tag text="NATIONAL PARK" in={B.why.start + 4.1} until={B.button.start + 0.3} x={540} y={450 + 60} size={30} />
          <Tag text="THE PEOPLE WHO LIVE THERE" in={B.why.start + 6.6} until={B.button.start + 0.3} x={540} y={450 + 120} size={30} />

          {/* ── button ── */}
          <Callout text="BY SHIP" icon="ship" in={T_SEA + 2.2} until={DARIEN_SECONDS} y={330} size={58} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />

          <Captions lines={LINES} />
        </>
      }
    >
      {/* ── hook: the two ends ── */}
      <Highlight shape="alaska" flag="usa" in={0.3} until={T_GAP_CLOSE - 0.3} flagBox={[[-170, 71.5], [-129, 54]]} glow={0.7} />
      <Highlight shape="argentina" flag="argentina" in={0.5} until={T_GAP_CLOSE - 0.3} glow={0.7} />
      <Pin at={PRUDHOE} label="Alaska" in={0.9} until={T_GAP_CLOSE - 0.3} side="right" />
      <Pin at={USHUAIA} label="Argentina" in={1.3} until={T_GAP_CLOSE - 0.3} side="top" />

      {/* ── the road draws down the continent ── */}
      <Route points={NORTH_ROAD} in={ROAD_START} dur={ROAD_DUR * 0.62} until={T_GAP_CLOSE + 0.5} color="#ffd23f" width={7} head="dot" />
      <Route points={SOUTH_ROAD} in={ROAD_START + ROAD_DUR * 0.62} dur={ROAD_DUR * 0.38} until={T_GAP_CLOSE + 0.5} color="#ffd23f" width={7} head="dot" />

      {/* ── the gap, close ── */}
      <Highlight shape="panama" flag="panama" in={T_GAP_CLOSE - 0.5} until={B.between.start + 0.4} minArea={1} flagBox={[[-79.6, 9.5], [-77.1, 7.2]]} glow={0.7} />
      <Highlight shape="colombia" flag="colombia" in={T_GAP_CLOSE - 0.4} until={B.between.start + 0.4} minArea={1} flagBox={[[-77.3, 9.5], [-75.0, 6.6]]} glow={0.7} />
      <Label at={[-78.6, 8.75]} text="PANAMA" size={50} in={T_GAP_CLOSE} until={B.between.start + 0.4} />
      <Label at={[-76.3, 7.1]} text="COLOMBIA" size={50} in={T_GAP_CLOSE + 0.2} until={B.between.start + 0.4} />
      <Route points={NORTH_ROAD} from={0.965} in={T_GAP_CLOSE - 0.4} dur={0.01} until={T_SEA} color="#ffd23f" width={9} />
      <Route points={SOUTH_ROAD} to={0.06} in={T_GAP_CLOSE - 0.4} dur={0.01} until={T_SEA} color="#ffd23f" width={9} />
      <Route points={GAP} in={B.stops.start + 2.4} dur={0.9} until={T_SEA} color="#ff4b3e" width={8} dashed glow={false} />
      <Measure from={YAVIZA} to={TURBO} text="106 km" in={B.stops.start + 3.4} until={B.expedition.start} offset={-110} color="#ffffff" width={0} />

      {/* ── the towns ── */}
      <Pin at={YAVIZA} label="Yaviza" in={B.towns.start + 0.8} until={B.button.start} side="left" />
      <Pin at={TURBO} label="Turbo" in={B.towns.start + 2.8} until={B.button.start} side="right" />

      {/* ── in between ── */}
      <Wash ring={ATRATO} color="#3aa6c9" opacity={0.5} outline="#bfe8f5" in={B.between.start + 2.6} until={B.expedition.start + 0.4} />
      <Label at={[-76.85, 7.62]} text="ATRATO SWAMPS" size={34} in={B.between.start + 3.0} until={B.expedition.start + 0.4} weight={800} />
      <Measure from={[-77.15, 7.45]} to={[-76.5, 7.45]} text="80 km" in={B.between.start + 4.2} until={B.expedition.start + 0.4} offset={70} />

      {/* ── the 1960 crawl ── */}
      <Route points={GAP} in={B.expedition.start + 1.2} dur={6.4} until={B.attempts.start + 0.3} color="#ffffff" width={6} dashed glow={false} headIcon="car" headSize={96} />

      {/* ── why: the park ── */}
      <Wash ring={PARK} color="#3ec46d" opacity={0.42} outline="#c8f5d6" in={B.why.start + 3.6} until={B.button.start + 0.3} dashed />
      <Label at={[-77.85, 8.05]} text="DARIÉN NATIONAL PARK" size={32} in={B.why.start + 4.0} until={B.button.start + 0.3} weight={800} />

      {/* ── button: the car goes by sea ── */}
      <Pin at={COLON} label="Colón" in={T_SEA + 0.2} side="left" labelSize={30} size={46} />
      <Pin at={CARTAGENA} label="Cartagena" in={T_SEA + 0.6} side="right" labelSize={30} size={46} />
      <Route points={SEA_LANE} in={T_SEA + 0.9} dur={2.6} color="#ffffff" width={6} dashed glow={false} headIcon="ship" headSize={100} />
    </GeoCanvas>
  </AbsoluteFill>
);

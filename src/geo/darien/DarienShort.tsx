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
// ~37 s, 9:16, built to loop: it opens on "This is why…", asks the viewer
// to guess, gives the three reasons and cuts on the last word, so the
// loop drops straight back into the answer's setup. Timed off timing.json.
//
//   python3 scripts/make-vo.py geo-darien
//   npm run geo:darien

export const DARIEN_FPS = 30;

const LINES = timing as Line[];
/** The short cuts 0.15 s after the last word, so the loop lands straight
 *  back on "This is why". */
export const DARIEN_SECONDS = LINES[LINES.length - 1].end + 0.15;
export const DARIEN_FRAMES = Math.round(DARIEN_SECONDS * DARIEN_FPS);
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

const CAMERA: CameraKey[] = [
  { at: 0, lon: -96, lat: 4, scale: 2700 },
  { at: B.stops.start - 0.3, lon: -94, lat: 5, scale: 2850 },
  { at: B.stops.start + 2.0, lon: -77.4, lat: 8.15, scale: 95000 },
  { at: B.expedition.start, lon: -77.25, lat: 8.05, scale: 112000 },
  { at: B.guess.start, lon: -77.2, lat: 8.05, scale: 120000 },
  { at: B.reveal.start, lon: -77.25, lat: 8.0, scale: 118000 },
  { at: DARIEN_SECONDS, lon: -77.3, lat: 7.95, scale: 112000 },
];

const T_GAP_CLOSE = B.stops.start + 2.0;
const ROAD_START = B.road.start + 0.8;
const ROAD_DUR = 4.4;
const END = DARIEN_SECONDS + 1;

/** Audio is two drop-in slots. The narration ships with the repo. The music
 *  is a licensed track cut by scripts/make-geo-music.py into public/audio
 *  (gitignored), so the default render carries no bed at all:
 *
 *    npm run geo:darien          narration only
 *    npm run geo:darien:music    narration + audio/geo-darien-music.mp3
 *    npm run geo:darien:mute     music only, for a voice recorded later
 */
export type DarienProps = { music?: string | null; narration?: string | null };

export const DarienShort: React.FC<DarienProps> = ({ music = null, narration = "assets/vo/geo-darien.mp3" }) => (
  <AbsoluteFill>
    {narration ? <Audio src={staticFile(narration)} /> : null}
    {music ? <Audio src={staticFile(music)} /> : null}
    <GeoCanvas
      camera={CAMERA}
      hud={
        <>
          {/* ── the road ── */}
          <Callout text="30,000 KM" icon="road" in={B.road.start + 5.5} until={B.stops.start + 0.8} y={300} size={60} />
          <Tag text="THE LONGEST ROAD IN THE WORLD" in={B.road.start + 7.2} until={B.stops.start + 0.8} x={540} y={420} size={30} bg="#f5a623" color="#1a1a1a" />

          {/* ── the gap ── */}
          <Tag text="DARIÉN GAP" in={B.stops.start + 5.4} until={B.guess.start} at={[-77.35, 7.55]} size={38} bg="#e63946" />

          {/* ── the 1960 expedition ── */}
          <BigNumber text="1960" in={B.expedition.start + 0.2} until={B.guess.start} y={300} size={140} />
          <Callout text="136 DAYS" icon="calendar" in={B.expedition.start + 4.1} until={B.guess.start} y={450} size={56} />
          <Callout text="200 M PER HOUR" in={B.expedition.start + 6.0} until={B.guess.start} y={560} size={44} font="caption" weight={700} glow="rgba(255,255,255,0.35)" />

          {/* ── guess ── */}
          <BigNumber text="?" in={B.guess.start + 0.2} until={B.reveal.start} y={420} size={260} color="#ffd23f" />
          <Tag text="CAN YOU GUESS WHY?" in={B.guess.start + 1.3} until={B.reveal.start} x={540} y={620} size={34} bg="#e63946" />

          {/* ── the reveal: three reasons, then the cut ── */}
          <IconRow icons={["mountain", "tree", "swamp"]} in={B.reveal.start + 0.15} until={END} y={360} step={0.95} size={150} />
          <Tag text="1,845 M PEAKS" in={B.reveal.start + 0.5} until={END} x={540} y={500} size={30} />
          <Tag text="RAINFOREST" in={B.reveal.start + 1.4} until={END} x={540} y={560} size={30} />
          <Tag text="80 KM OF SWAMP" in={B.reveal.start + 2.4} until={END} x={540} y={620} size={30} />

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
      <Highlight shape="panama" flag="panama" in={T_GAP_CLOSE - 0.5} until={B.expedition.start + 0.4} minArea={1} flagBox={[[-79.6, 9.5], [-77.1, 7.2]]} glow={0.7} />
      <Highlight shape="colombia" flag="colombia" in={T_GAP_CLOSE - 0.4} until={B.expedition.start + 0.4} minArea={1} flagBox={[[-77.3, 9.5], [-75.0, 6.6]]} glow={0.7} />
      <Label at={[-78.6, 8.75]} text="PANAMA" size={50} in={T_GAP_CLOSE} until={B.expedition.start + 0.4} />
      <Label at={[-76.3, 7.1]} text="COLOMBIA" size={50} in={T_GAP_CLOSE + 0.2} until={B.expedition.start + 0.4} />
      <Route points={NORTH_ROAD} from={0.965} in={T_GAP_CLOSE - 0.4} dur={0.01} until={END} color="#ffd23f" width={9} />
      <Route points={SOUTH_ROAD} to={0.06} in={T_GAP_CLOSE - 0.4} dur={0.01} until={END} color="#ffd23f" width={9} />
      <Route points={GAP} in={B.stops.start + 2.4} dur={0.9} until={END} color="#ff4b3e" width={8} dashed glow={false} />
      <Measure from={YAVIZA} to={TURBO} text="106 km" in={B.stops.start + 3.4} until={B.expedition.start} offset={-110} color="#ffffff" width={0} />
      <Pin at={YAVIZA} label="Yaviza" in={T_GAP_CLOSE + 0.6} until={B.reveal.start + 1.8} side="left" />
      <Pin at={TURBO} label="Turbo" in={T_GAP_CLOSE + 1.0} until={B.reveal.start + 1.8} side="right" />

      {/* ── the 1960 crawl ── */}
      <Route points={GAP} in={B.expedition.start + 1.2} dur={5.2} until={B.reveal.start} color="#ffffff" width={6} dashed glow={false} headIcon="car" headSize={96} />

      {/* ── the reveal ── */}
      <Wash ring={PARK} color="#3ec46d" opacity={0.35} outline="#c8f5d6" in={B.reveal.start + 1.3} until={END} dashed />
      <Wash ring={ATRATO} color="#3aa6c9" opacity={0.5} outline="#bfe8f5" in={B.reveal.start + 2.2} until={END} />
      <Label at={[-76.85, 7.62]} text="ATRATO SWAMPS" size={34} in={B.reveal.start + 2.5} until={END} weight={800} />
      <Measure from={[-77.15, 7.45]} to={[-76.5, 7.45]} text="80 km" in={B.reveal.start + 2.7} until={END} offset={70} />
    </GeoCanvas>
  </AbsoluteFill>
);

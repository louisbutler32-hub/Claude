import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { GeoCanvas } from "../GeoCanvas";
import { BigNumber, Callout, Captions, Tag } from "../hud";
import { Highlight, Label, Pin, Rings, Route, Wash } from "../layers";
import { CameraKey, LonLat } from "../projection";
import { Line, beatsOf } from "../timing";
import timing from "./timing.json";

// ── The Louisiana Purchase: the deal that doubled a country ───────────
//
// 60 s, 9:16. Timed off timing.json, which the voice build writes.
//
//   python3 scripts/make-vo.py geo-louisiana
//   npm run geo:louisiana

export const LOUISIANA_SECONDS = 60;
export const LOUISIANA_FPS = 30;

const LINES = timing as Line[];
const B = beatsOf(LINES, LOUISIANA_SECONDS);

// ── the ground ────────────────────────────────────────────────────────
// The purchase, drawn by hand from the usual map: the Mississippi's west
// bank up to its source, the 49th parallel, the Continental Divide, then
// the Arkansas and Red rivers and the Sabine back to the Gulf — plus the
// Isle of Orleans on the east bank. Good to a few tens of km, which is
// what a continental zoom can show.
export const PURCHASE: LonLat[] = [
  [-89.4, 29.2], [-90.3, 29.2], [-91.5, 29.4], [-92.6, 29.6], [-93.8, 29.7],
  [-93.7, 31.0], [-94.0, 32.0], [-94.0, 33.6], [-95.0, 33.9], [-96.5, 33.8],
  [-98.0, 34.1], [-100.0, 34.5], [-100.0, 38.0], [-102.0, 38.05], [-104.5, 38.3],
  [-105.9, 38.5], [-106.3, 39.2], [-106.5, 40.2], [-107.0, 41.1], [-108.5, 42.6],
  [-109.6, 43.6], [-110.3, 44.4], [-112.4, 45.1], [-113.4, 46.1], [-114.0, 47.1],
  [-114.4, 48.4], [-114.0, 49.6], [-112.8, 50.3], [-110.8, 50.2], [-108.5, 49.9],
  [-105.5, 49.9], [-103.5, 49.5], [-101.0, 49.05], [-97.2, 49.0], [-96.3, 48.3],
  [-95.2, 47.2], [-94.5, 46.3], [-93.3, 45.0], [-92.4, 44.3], [-91.3, 43.8],
  [-91.0, 42.7], [-90.6, 41.5], [-91.1, 40.4], [-90.5, 39.4], [-90.2, 38.63],
  [-89.5, 37.6], [-89.17, 36.98], [-89.6, 36.3], [-90.05, 35.15], [-90.9, 34.0],
  [-91.1, 33.4], [-91.2, 32.3], [-91.4, 31.5], [-91.0, 30.5], [-90.3, 30.35],
  [-89.7, 30.2], [-89.2, 29.8],
];

/** The Mississippi, source to delta. */
const MISSISSIPPI: LonLat[] = [
  [-95.2, 47.2], [-94.5, 46.3], [-93.27, 44.98], [-92.4, 44.3], [-91.6, 44.1],
  [-91.25, 43.8], [-90.9, 42.7], [-90.6, 41.5], [-91.1, 40.4], [-90.5, 39.4],
  [-90.2, 38.63], [-89.5, 37.6], [-89.17, 36.98], [-89.6, 36.3], [-90.05, 35.15],
  [-90.9, 34.0], [-91.1, 33.4], [-91.2, 32.3], [-91.4, 31.5], [-91.2, 30.9],
  [-91.2, 30.45], [-90.6, 30.05], [-90.07, 29.95], [-89.6, 29.5], [-89.25, 29.15],
];

const NEW_ORLEANS: LonLat = [-90.07, 29.95];
const IOWA_CENTRE: LonLat = [-93.5, 42.05];

/** The 1803 United States: everything east of the river bar Spanish Florida. */
const EAST_1803 = [
  "Maine", "New Hampshire", "Vermont", "Massachusetts", "Rhode Island", "Connecticut",
  "New York", "New Jersey", "Pennsylvania", "Delaware", "Maryland", "Virginia",
  "West Virginia", "North Carolina", "South Carolina", "Georgia", "Ohio", "Indiana",
  "Illinois", "Michigan", "Wisconsin", "Kentucky", "Tennessee", "Alabama", "Mississippi",
].map((n) => `state:${n}`);

/** All or part of fifteen states, in the order the wave pops them. */
const FIFTEEN = [
  "Louisiana", "Arkansas", "Missouri", "Iowa", "Minnesota", "Oklahoma", "Kansas",
  "Nebraska", "South Dakota", "North Dakota", "Texas", "New Mexico", "Colorado",
  "Wyoming", "Montana",
];

const CAMERA: CameraKey[] = [
  { at: 0, lon: -95, lat: 37.5, scale: 4300 },
  { at: B.year.start, lon: -96.5, lat: 38.5, scale: 4700 },
  { at: B.jefferson.start - 0.4, lon: -97, lat: 39, scale: 4900 },
  { at: B.jefferson.start + 1.4, lon: -91.5, lat: 37.0, scale: 9000 },
  { at: B.jefferson.start + 4.6, lon: -90.3, lat: 30.6, scale: 70000 },
  { at: B.napoleon.start - 0.3, lon: -90.2, lat: 30.4, scale: 76000 },
  { at: B.napoleon.start + 1.5, lon: -36.5, lat: 34, scale: 4200 },
  { at: B.offer.start - 0.2, lon: -34.5, lat: 34.5, scale: 4300 },
  { at: B.offer.start + 1.5, lon: -97, lat: 38.5, scale: 4700 },
  { at: B.states.start, lon: -98, lat: 40, scale: 4900 },
  { at: B.iowa.start - 0.3, lon: -98.5, lat: 40.5, scale: 5000 },
  { at: B.iowa.start + 1.6, lon: -93.5, lat: 42.0, scale: 17000 },
  { at: B.button.start - 0.2, lon: -93.5, lat: 42.0, scale: 17500 },
  { at: B.button.start + 1.4, lon: -97, lat: 38.5, scale: 4800 },
  { at: LOUISIANA_SECONDS, lon: -97, lat: 38.5, scale: 4700 },
];

const T_RIVER_WIDE = B.jefferson.start + 1.4;
const T_ATLANTIC = B.napoleon.start + 1.5;
const T_BACK = B.offer.start + 1.5;
const T_IOWA = B.iowa.start + 1.6;

export const LouisianaShort: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile("assets/vo/geo-louisiana.mp3")} />
    <Audio src={staticFile("assets/vo/geo-bed.mp3")} volume={0.22} />
    <GeoCanvas
      camera={CAMERA}
      hud={
        <>
          {/* ── hook ── */}
          <Callout text="3¢ PER ACRE" icon="coin" in={B.hook.start + 4.3} until={B.year.start + 0.4} y={330} size={58} />

          {/* ── 1803 ── */}
          <BigNumber text="1803" in={B.year.start + 0.2} until={B.jefferson.start} y={300} size={150} />
          <Callout text="2.1 MILLION KM²" icon="ruler" in={B.year.start + 7.0} until={B.jefferson.start + 0.6} y={470} size={54} />

          {/* ── Jefferson ── */}
          <Callout text="$10 MILLION" icon="coin" in={B.jefferson.start + 6.6} until={B.napoleon.start + 0.4} y={420} size={60} />

          {/* ── Napoleon ── */}
          <Callout text="MONEY, FAST" icon="coin" in={B.napoleon.start + 5.8} until={B.offer.start + 0.6} y={560} size={54} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />

          {/* ── the offer ── */}
          <Callout text="$15 MILLION" icon="coin" in={B.offer.start + 3.6} until={B.states.start} y={330} size={66} />
          <Callout text="$380 MILLION TODAY" icon="note" in={B.today.start + 0.7} until={B.states.start} y={470} size={50} />
          <Callout text="$18 PER SQUARE MILE" in={B.today.start + 3.4} until={B.states.start} y={570} size={44} font="caption" weight={700} glow="rgba(255,255,255,0.35)" />

          {/* ── fifteen states ── */}
          <Callout text="15 STATES" icon="check" in={B.states.start + 2.2} until={B.iowa.start + 0.5} y={330} size={64} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />

          {/* ── Iowa ── */}
          <Callout text="$11,467 PER ACRE" icon="gold" in={B.iowa.start + 3.3} until={LOUISIANA_SECONDS} y={330} size={58} />
          <Callout text="× 400,000" in={B.iowa.start + 5.9} until={LOUISIANA_SECONDS} y={470} size={96} font="sans" weight={900} color="#ff4b3e" glow="rgba(255,60,40,0.7)" />

          <Captions lines={LINES} />
        </>
      }
    >
      {/* ── hook: the country as it was, then what was added ── */}
      <Highlight shapes={EAST_1803} flag="usa" in={0.3} until={T_RIVER_WIDE} flagBox={[[-91.5, 47.5], [-67, 30.5]]} glow={0.6} />
      <Highlight ring={PURCHASE} flag="france" in={B.hook.start + 1.9} until={T_RIVER_WIDE + 0.5} />
      <Highlight ring={PURCHASE} flag="france" in={T_BACK - 0.6} until={B.offer.start + 3.2} />
      <Label at={[-99, 42.5]} text="LOUISIANA" size={60} in={B.year.start + 0.8} until={B.jefferson.start} rotate={-12} />
      <Label at={[-92, 25.5]} text="GULF OF MEXICO" size={40} in={B.year.start + 3.6} until={B.jefferson.start} weight={700} opacity={0.9} />
      <Label at={[-103, 51.8]} text="CANADA" size={44} in={B.year.start + 4.6} until={B.jefferson.start} weight={700} opacity={0.9} />

      {/* ── Jefferson and the river ── */}
      <Route points={MISSISSIPPI} in={B.jefferson.start + 2.6} dur={1.9} until={B.napoleon.start + 0.4} color="#5ce1ff" width={7} />
      <Label at={[-92.6, 34.6]} text="MISSISSIPPI" size={38} in={B.jefferson.start + 3.2} until={B.jefferson.start + 4.8} rotate={80} weight={700} />
      <Pin at={NEW_ORLEANS} label="New Orleans" in={B.jefferson.start + 1.9} until={B.napoleon.start + 0.4} side="right" />

      {/* ── Napoleon's problem ── */}
      <Highlight shape="france" flag="france" in={T_ATLANTIC - 0.4} until={T_BACK - 0.3} glow={0.9} />
      <Label at={[2.5, 50.5]} text="FRANCE" size={44} in={T_ATLANTIC} until={T_BACK - 0.3} dx={-70} dy={-90} />
      <Highlight shape="haiti" flag="haiti" in={B.napoleon.start + 2.0} until={T_BACK - 0.3} minArea={1} glow={0.9} />
      <Rings at={[-72.7, 19.0]} in={B.napoleon.start + 2.2} until={T_BACK - 0.3} color="#ff4b3e" maxR={130} />
      <Label at={[-72.7, 19.0]} text="HAITI" size={44} in={B.napoleon.start + 2.4} until={T_BACK - 0.3} dy={-120} />
      <Highlight shape="uk" flag="uk" in={B.napoleon.start + 4.0} until={T_BACK - 0.3} glow={0.9} />
      <Label at={[-2.5, 56.5]} text="BRITAIN" size={44} in={B.napoleon.start + 4.2} until={T_BACK - 0.3} dy={-80} />

      {/* ── the offer: the same ground, now under the Stars and Stripes ── */}
      <Highlight ring={PURCHASE} flag="usa" in={B.offer.start + 3.2} until={B.iowa.start + 1.2} />
      <Highlight shapes={EAST_1803} flag="usa" in={T_BACK - 0.5} until={B.iowa.start + 1.2} flagBox={[[-91.5, 47.5], [-67, 30.5]]} glow={0.3} />

      {/* ── fifteen states ── */}
      {FIFTEEN.map((name, i) => (
        <Wash
          key={name}
          shape={`state:${name}`}
          color="#f5a623"
          opacity={0.55}
          outline="#ffffff"
          outlineWidth={2.5}
          in={B.states.start + 0.3 + i * 0.16}
          until={B.iowa.start + 1.2}
          draw={0.45}
        />
      ))}
      <Label at={[-92.0, 31.0]} text="LOUISIANA" size={40} in={B.states.start + 3.2} until={B.iowa.start + 1.2} weight={800} />
      <Label at={[-110.0, 47.0]} text="MONTANA" size={40} in={B.states.start + 4.0} until={B.iowa.start + 1.2} weight={800} />

      {/* ── Iowa ── */}
      <Highlight shape="state:Iowa" flag="usa" in={T_IOWA - 0.6} until={B.button.start + 1.2} />
      <Label at={IOWA_CENTRE} text="IOWA" size={72} in={T_IOWA} until={B.button.start + 1.2} dy={20} />

      {/* ── button: the whole deal, back in the flag ── */}
      <Highlight ring={PURCHASE} flag="usa" in={B.button.start + 0.9} glow={1} />
      <Highlight shapes={EAST_1803} flag="usa" in={B.button.start + 0.9} flagBox={[[-91.5, 47.5], [-67, 30.5]]} glow={0.3} />
    </GeoCanvas>
  </AbsoluteFill>
);

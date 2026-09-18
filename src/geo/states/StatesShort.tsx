import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { GeoCanvas } from "../GeoCanvas";
import { BigNumber, Callout, Tag, WordCaptions } from "../hud";
import { Highlight, Label, Pin, Rings, Route, Wash } from "../layers";
import { CameraKey, LonLat } from "../projection";
import { patch, shapeNames } from "../shapes";
import { Line, beatsOf } from "../timing";
import timing from "./timing.json";

// ── What if every state became its own country and they went to war? ──
//
// ~62 s, 9:16, built to loop. The union breaks into a patchwork, three
// states show their cards, a guess, then the war played out day by day —
// the oil stops, the trains stop, the fleet needs both — until everyone
// remembers where the missiles are. Cut on the last word.
//
//   python3 scripts/make-vo.py geo-states && python3 scripts/align-words.py geo-states
//   npm run geo:states:music

export const STATES_FPS = 30;
const LINES = timing as Line[];
export const STATES_SECONDS = LINES[LINES.length - 1].end + 0.15;
export const STATES_FRAMES = Math.round(STATES_SECONDS * STATES_FPS);
const B = beatsOf(LINES, STATES_SECONDS);
const END = STATES_SECONDS + 1;

const NORFOLK: LonLat = [-76.3, 36.95];
const BOSTON: LonLat = [-70.9, 42.35];
const MIAMI: LonLat = [-80.1, 25.75];
const HOUSTON_SEA: LonLat = [-94.6, 29.2];
const TEXAS_C: LonLat = [-100.5, 31.5];
const CALI_C: LonLat = [-119.5, 36.5];
const IOWA_C: LonLat = [-93.5, 42.0];
const WARREN: LonLat = [-104.87, 41.13];
const MALMSTROM: LonLat = [-111.19, 47.5];
const MINOT: LonLat = [-101.36, 48.42];

const LOWER48 = shapeNames().filter(
  (n) => n.startsWith("state:") && !["state:Alaska", "state:Hawaii", "state:District of Columbia"].includes(n)
);
const CORN = ["state:Iowa", "state:Illinois"];
const SILOS = ["state:Wyoming", "state:Montana", "state:North Dakota"];

const CAMERA: CameraKey[] = [
  { at: 0, lon: -97, lat: 38.5, scale: 4600 },
  { at: B.california.start, lon: -98, lat: 38.5, scale: 4700 },
  { at: B.california.start + 1.4, lon: -119.3, lat: 37.2, scale: 9500 },
  { at: B.texas.start - 0.2, lon: -119, lat: 37.2, scale: 9700 },
  { at: B.texas.start + 1.2, lon: -99.3, lat: 31.4, scale: 9500 },
  { at: B.virginia.start - 0.2, lon: -99.3, lat: 31.4, scale: 9700 },
  { at: B.virginia.start + 1.2, lon: -78, lat: 37.8, scale: 15000 },
  { at: B.guess.start - 0.2, lon: -78, lat: 37.8, scale: 15500 },
  { at: B.guess.start + 1.2, lon: -97, lat: 38.5, scale: 4600 },
  { at: B.day1.start, lon: -97, lat: 38.5, scale: 4600 },
  { at: B.day1.start + 1.4, lon: -105, lat: 36.5, scale: 5400 },
  { at: B.food.start, lon: -103, lat: 37.5, scale: 5300 },
  { at: B.food.start + 1.2, lon: -101, lat: 38.5, scale: 5000 },
  { at: B.navy.start, lon: -97, lat: 37.5, scale: 4700 },
  { at: B.navy.start + 1.2, lon: -86, lat: 35.5, scale: 5200 },
  { at: B.missiles.start, lon: -90, lat: 37, scale: 4900 },
  { at: B.missiles.start + 2.2, lon: -97, lat: 39, scale: 4700 },
  { at: B.missiles.start + 4.2, lon: -105.5, lat: 44.8, scale: 8000 },
  { at: B.reveal.start, lon: -105.5, lat: 44.8, scale: 8000 },
  { at: B.reveal.start + 2.8, lon: -103, lat: 42.5, scale: 6200 },
  { at: END, lon: -102, lat: 42, scale: 6000 },
];

const T_CA = B.california.start + 1.4;
const T_TX = B.texas.start + 1.2;
const T_VA = B.virginia.start + 1.2;

export type StatesProps = { music?: string | null; narration?: string | null };

export const StatesShort: React.FC<StatesProps> = ({ music = null, narration = "assets/vo/geo-states.mp3" }) => (
  <AbsoluteFill>
    {narration ? <Audio src={staticFile(narration)} /> : null}
    {music ? <Audio src={staticFile(music)} /> : null}
    <GeoCanvas
      camera={CAMERA}
      hud={
        <>
          {/* ── California, Texas, Virginia ── */}
          <Callout text="39 MILLION PEOPLE" icon="people" in={B.california.start + 2.4} until={T_TX - 0.2} y={330} size={48} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="4TH LARGEST ECONOMY" sub="bigger than Japan" icon="coin" in={B.california.start + 4.6} until={T_TX - 0.2} y={470} size={48} />
          <Callout text="40% OF AMERICA'S OIL" icon="gold" in={B.texas.start + 2.4} until={T_VA - 0.2} y={330} size={50} />
          <Callout text="WORLD'S LARGEST NAVAL BASE" icon="ship" in={B.virginia.start + 2.6} until={B.guess.start + 0.8} y={330} size={40} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Tag text="THE ONLY CARRIER SHIPYARD" in={B.virginia.start + 5.8} until={B.guess.start + 0.8} x={540} y={440} size={30} bg="#0055a4" />

          {/* ── guess ── */}
          <BigNumber text="?" in={B.guess.start + 0.2} until={B.day1.start} y={420} size={260} color="#ffd23f" />
          <Tag text="WHO WINS?" in={B.guess.start + 1.2} until={B.day1.start} x={540} y={620} size={38} bg="#e63946" />

          {/* ── day one: the oil ── */}
          <BigNumber text="DAY 1" in={B.day1.start + 0.2} until={B.food.start} y={300} size={120} />
          <Callout text="OIL OFF" icon="cross" in={B.day1.start + 2.4} until={B.food.start} at={TEXAS_C} dy={-40} size={46} font="sans" weight={900} glow="rgba(255,80,60,0.5)" />
          <Tag text="NO FUEL" in={B.day1.start + 4.2} until={B.food.start} at={CALI_C} size={32} bg="#e63946" />
          <Tag text="NO FUEL" in={B.day1.start + 5.8} until={B.food.start} at={IOWA_C} size={32} bg="#e63946" />

          {/* ── the food ── */}
          <Tag text="TRAINS STOPPED" in={B.food.start + 0.8} until={B.navy.start} x={540} y={300} size={34} bg="#e63946" />
          <Callout text="HALF THE COUNTRY'S FRUIT & VEG" in={B.food.start + 5.0} until={B.navy.start} y={430} size={38} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />

          {/* ── the navy ── */}
          <Tag text="BLOCKADE" in={B.navy.start + 1.4} until={B.missiles.start} at={[-73.5, 33.5]} size={34} bg="#0055a4" />
          <Callout text="NEEDS TEXAS FUEL" icon="cross" in={B.navy.start + 3.6} until={B.missiles.start} y={330} size={42} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="NEEDS MIDWEST GRAIN" icon="cross" in={B.navy.start + 4.6} until={B.missiles.start} y={430} size={42} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />

          {/* ── the missiles ── */}
          <Callout text="400 NUCLEAR MISSILES" icon="missile" in={B.missiles.start + 2.2} until={END} y={300} size={50} font="sans" weight={900} glow="rgba(255,255,255,0.5)" />
          <Callout text="FEWER PEOPLE THAN BROOKLYN" icon="people" in={B.missiles.start + 9.0} until={END} y={430} size={44} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />

          {/* ── the answer, then the cut ── */}
          <Callout text="THE WAR NEVER STARTS" in={B.reveal.start + 3.4} until={END} y={560} size={58} font="sans" weight={900} color="#ffd23f" glow="rgba(255,210,63,0.6)" />

          <WordCaptions lines={LINES} />
        </>
      }
    >
      {/* ── fifty countries ── */}
      {LOWER48.map((name, i) => (
        <Wash key={name} shape={name} color={patch(i)} opacity={0.6} outline="#ffffff" outlineWidth={2} in={0.4 + i * 0.035} until={END} draw={0.5} fade={0.3} />
      ))}

      {/* ── California, Texas, Virginia ── */}
      <Highlight shape="state:California" color="#ffd23f" in={T_CA - 0.4} until={T_TX - 0.3} />
      <Label at={[-119.6, 37.3]} text="CALIFORNIA" size={52} in={T_CA} until={T_TX - 0.3} rotate={-62} />
      <Highlight shape="state:Texas" flag="texas" in={T_TX - 0.4} until={T_VA - 0.3} />
      <Label at={[-99.3, 31.3]} text="TEXAS" size={64} in={T_TX} until={T_VA - 0.3} />
      <Highlight shape="state:Virginia" color="#4cc9f0" in={T_VA - 0.4} until={B.guess.start + 0.8} />
      <Label at={[-79.2, 37.9]} text="VIRGINIA" size={46} in={T_VA} until={B.guess.start + 0.8} />
      <Pin at={NORFOLK} label="Norfolk" in={B.virginia.start + 2.2} until={B.guess.start + 0.8} side="right" />

      {/* ── day one: the oil ── */}
      <Highlight shape="state:Texas" flag="texas" in={B.day1.start + 0.4} until={B.food.start + 0.3} />
      <Route points={[TEXAS_C, [-110, 34.5], CALI_C]} in={B.day1.start + 1.0} dur={1.2} until={B.food.start} color="#ff4b3e" width={8} dashed head="dot" />
      <Route points={[TEXAS_C, [-96, 37], IOWA_C]} in={B.day1.start + 1.4} dur={1.2} until={B.food.start} color="#ff4b3e" width={8} dashed head="dot" />

      {/* ── the food ── */}
      <Highlight shapes={CORN} color="#ffd23f" in={B.food.start + 1.8} until={B.navy.start + 0.3} />
      <Label at={[-91.5, 41.4]} text="THE CORN" size={38} in={B.food.start + 2.2} until={B.navy.start + 0.3} weight={800} />
      <Highlight shape="state:California" color="#ffd23f" in={B.food.start + 4.2} until={B.navy.start + 0.3} />
      <Route points={[IOWA_C, [-84, 41.5], [-74.5, 40.7]]} in={B.food.start + 0.6} dur={1.2} until={B.navy.start} color="#ffffff" width={6} dashed glow={false} head="dot" />
      <Route points={[IOWA_C, [-105, 39.5], [-118, 34.5]]} in={B.food.start + 0.9} dur={1.2} until={B.navy.start} color="#ffffff" width={6} dashed glow={false} head="dot" />

      {/* ── the navy ── */}
      <Highlight shape="state:Virginia" color="#4cc9f0" in={B.navy.start + 0.3} until={B.missiles.start + 0.5} />
      <Route points={[NORFOLK, [-74.5, 38.6], BOSTON]} in={B.navy.start + 0.8} dur={1.6} until={B.missiles.start + 0.5} color="#ffffff" width={6} headIcon="ship" headSize={80} />
      <Route points={[NORFOLK, [-78, 31.5], MIAMI, [-86, 25.5], HOUSTON_SEA]} in={B.navy.start + 1.0} dur={2.2} until={B.missiles.start + 0.5} color="#ffffff" width={6} headIcon="ship" headSize={80} />

      {/* ── the missiles ── */}
      <Highlight shapes={SILOS} color="#e63946" in={B.missiles.start + 2.6} until={END} />
      <Rings at={WARREN} in={B.missiles.start + 2.0} until={END} color="#ffd23f" maxR={140} />
      <Rings at={MALMSTROM} in={B.missiles.start + 2.3} until={END} color="#ffd23f" maxR={140} />
      <Rings at={MINOT} in={B.missiles.start + 2.6} until={END} color="#ffd23f" maxR={140} />
      <Label at={[-107.6, 42.7]} text="WYOMING" size={34} in={B.missiles.start + 6.2} until={END} weight={800} />
      <Label at={[-111.2, 46.4]} text="MONTANA" size={34} in={B.missiles.start + 6.8} until={END} weight={800} />
      <Label at={[-100.4, 48.3]} text="NORTH DAKOTA" size={34} in={B.missiles.start + 7.6} until={END} weight={800} />
    </GeoCanvas>
  </AbsoluteFill>
);

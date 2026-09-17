import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { GeoCanvas } from "../GeoCanvas";
import { BigNumber, Callout, Captions, Tag } from "../hud";
import { Highlight, Label, Pin, Wash } from "../layers";
import { CameraKey, LonLat } from "../projection";
import { patch, shapeNames } from "../shapes";
import { Line, beatsOf } from "../timing";
import timing from "./timing.json";

// ── What if every state became its own country and they went to war? ──
//
// ~40 s, 9:16, built to loop. The union breaks into a patchwork, three
// states show their cards, a guess, and the answer: nobody wins, because
// the missiles are in three states with fewer people than Brooklyn.
//
//   python3 scripts/make-vo.py geo-states
//   npm run geo:states:music

export const STATES_FPS = 30;
const LINES = timing as Line[];
export const STATES_SECONDS = LINES[LINES.length - 1].end + 0.15;
export const STATES_FRAMES = Math.round(STATES_SECONDS * STATES_FPS);
const B = beatsOf(LINES, STATES_SECONDS);
const END = STATES_SECONDS + 1;

const NORFOLK: LonLat = [-76.3, 36.95];
const LOWER48 = shapeNames().filter(
  (n) => n.startsWith("state:") && !["state:Alaska", "state:Hawaii", "state:District of Columbia"].includes(n)
);
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
  { at: B.reveal.start + 3.0, lon: -97, lat: 38.5, scale: 4600 },
  { at: B.reveal.start + 4.6, lon: -105.5, lat: 44.8, scale: 8000 },
  { at: END, lon: -105.5, lat: 44.8, scale: 8100 },
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
          {/* ── California ── */}
          <Callout text="39 MILLION PEOPLE" icon="people" in={B.california.start + 2.4} until={T_TX - 0.2} y={330} size={48} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="4TH LARGEST ECONOMY" sub="bigger than Japan" icon="coin" in={B.california.start + 4.6} until={T_TX - 0.2} y={470} size={48} />

          {/* ── Texas ── */}
          <Callout text="40% OF AMERICA'S OIL" icon="gold" in={B.texas.start + 2.4} until={T_VA - 0.2} y={330} size={50} />

          {/* ── Virginia ── */}
          <Callout text="WORLD'S LARGEST NAVAL BASE" icon="ship" in={B.virginia.start + 2.6} until={B.guess.start + 0.8} y={330} size={40} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Tag text="THE ONLY CARRIER SHIPYARD" in={B.virginia.start + 5.8} until={B.guess.start + 0.8} x={540} y={440} size={30} bg="#0055a4" />

          {/* ── guess ── */}
          <BigNumber text="?" in={B.guess.start + 0.2} until={B.reveal.start} y={420} size={260} color="#ffd23f" />
          <Tag text="WHO WINS?" in={B.guess.start + 1.2} until={B.reveal.start} x={540} y={620} size={38} bg="#e63946" />

          {/* ── the reveal, then the cut ── */}
          <Callout text="400 NUCLEAR MISSILES" icon="missile" in={B.reveal.start + 1.8} until={END} y={300} size={50} font="sans" weight={900} glow="rgba(255,255,255,0.5)" />
          <Callout text="FEWER PEOPLE THAN BROOKLYN" icon="people" in={B.reveal.start + 9.4} until={END} y={430} size={44} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />

          <Captions lines={LINES} />
        </>
      }
    >
      {/* ── fifty countries ── */}
      {LOWER48.map((name, i) => (
        <Wash key={name} shape={name} color={patch(i)} opacity={0.6} outline="#ffffff" outlineWidth={2} in={0.4 + i * 0.035} until={END} draw={0.5} fade={0.3} />
      ))}

      {/* ── California ── */}
      <Highlight shape="state:California" color="#ffd23f" in={T_CA - 0.4} until={T_TX - 0.3} />
      <Label at={[-119.6, 37.3]} text="CALIFORNIA" size={52} in={T_CA} until={T_TX - 0.3} rotate={-62} />

      {/* ── Texas ── */}
      <Highlight shape="state:Texas" flag="texas" in={T_TX - 0.4} until={T_VA - 0.3} />
      <Label at={[-99.3, 31.3]} text="TEXAS" size={64} in={T_TX} until={T_VA - 0.3} />

      {/* ── Virginia ── */}
      <Highlight shape="state:Virginia" color="#4cc9f0" in={T_VA - 0.4} until={B.guess.start + 0.8} />
      <Label at={[-79.2, 37.9]} text="VIRGINIA" size={46} in={T_VA} until={B.guess.start + 0.8} />
      <Pin at={NORFOLK} label="Norfolk" in={B.virginia.start + 2.2} until={B.guess.start + 0.8} side="right" />

      {/* ── the three states with the missiles ── */}
      <Highlight shapes={SILOS} color="#e63946" in={B.reveal.start + 4.8} until={END} />
      <Label at={[-107.6, 42.7]} text="WYOMING" size={34} in={B.reveal.start + 6.4} until={END} weight={800} />
      <Label at={[-111.2, 46.4]} text="MONTANA" size={34} in={B.reveal.start + 7.0} until={END} weight={800} />
      <Label at={[-100.4, 48.3]} text="NORTH DAKOTA" size={34} in={B.reveal.start + 7.8} until={END} weight={800} />
    </GeoCanvas>
  </AbsoluteFill>
);

import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { GeoCanvas } from "../GeoCanvas";
import { BigNumber, Callout, Tag, WordCaptions } from "../hud";
import { Highlight, Label, Measure, Pin, Rings, Route, Wash } from "../layers";
import { CameraKey, LonLat } from "../projection";
import { Line, beatsOf } from "../timing";
import timing from "./timing.json";

// ── What if Germany had won the First World War? ──────────────────────
//
// ~62 s, 9:16, built to loop. The question, how close it came in 1918,
// a guess, then the scenario played out on the map — the 1914 peace
// terms, the Kaiser's eastern kingdoms, a customs union from the Atlantic
// to the Black Sea — and the answer cut on its last word.
//
//   python3 scripts/make-vo.py geo-ww1 && python3 scripts/align-words.py geo-ww1
//   npm run geo:ww1:music

export const WW1_FPS = 30;
const LINES = timing as Line[];
export const WW1_SECONDS = LINES[LINES.length - 1].end + 0.15;
export const WW1_FRAMES = Math.round(WW1_SECONDS * WW1_FPS);
const B = beatsOf(LINES, WW1_SECONDS);
const END = WW1_SECONDS + 1;

const PARIS: LonLat = [2.35, 48.86];
const FRONT: LonLat = [3.0, 49.3];
const GUN: LonLat = [3.52, 49.6];
const BRIEY: LonLat = [5.94, 49.25];
const BREST_FR: LonLat = [-4.5, 48.4];
const BERLIN: LonLat = [13.4, 52.52];
const ODESA: LonLat = [30.7, 46.5];

/** Brest-Litovsk: what Russia signed away in March 1918. */
const KINGDOMS = ["finland", "estonia", "latvia", "lithuania", "poland", "belarus", "ukraine"];
/** Mitteleuropa, as the September Programme listed it. */
const BLOC = ["france", "belgium", "netherlands", "luxembourg", "denmark", "austria", "hungary", "czechia", "italy", "sweden", "norway", "switzerland", "romania"];

const CAMERA: CameraKey[] = [
  { at: 0, lon: 12, lat: 51.5, scale: 7200 },
  { at: B.east.start, lon: 16, lat: 52.5, scale: 7000 },
  { at: B.east.start + 1.6, lon: 24, lat: 54, scale: 6400 },
  { at: B.west.start - 0.3, lon: 24, lat: 54, scale: 6300 },
  { at: B.west.start + 1.6, lon: 3.9, lat: 49.5, scale: 52000 },
  { at: B.guess.start, lon: 4.0, lat: 49.55, scale: 50000 },
  { at: B.peace.start, lon: 4.1, lat: 49.65, scale: 50000 },
  { at: B.empire.start - 0.2, lon: 4.3, lat: 49.8, scale: 48000 },
  { at: B.empire.start + 1.4, lon: 14, lat: 50.5, scale: 6400 },
  { at: B.nowar.start, lon: 12.5, lat: 50.5, scale: 6300 },
  { at: END, lon: 11.5, lat: 50.5, scale: 6100 },
];

const T_WEST = B.west.start + 1.6;
const T_EAST_OFF = B.west.start - 0.1;
const T_EMPIRE = B.empire.start + 1.4;

export type Ww1Props = { music?: string | null; narration?: string | null };

export const Ww1Short: React.FC<Ww1Props> = ({ music = null, narration = "assets/vo/geo-ww1.mp3" }) => (
  <AbsoluteFill>
    {narration ? <Audio src={staticFile(narration)} /> : null}
    {music ? <Audio src={staticFile(music)} /> : null}
    <GeoCanvas
      camera={CAMERA}
      hud={
        <>
          <BigNumber text="1918" in={B.hook.start + 2.4} until={B.east.start + 1.2} y={300} size={150} />

          {/* ── the east ── */}
          <Callout text="⅓ OF RUSSIA'S PEOPLE" icon="people" in={B.east.start + 7.2} until={B.west.start + 1.0} y={330} size={46} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="9/10 OF ITS COAL" icon="factory" in={B.east.start + 9.2} until={B.west.start + 1.0} y={450} size={46} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />

          {/* ── the west ── */}
          <Callout text="50 DIVISIONS" icon="arrow" in={B.west.start + 0.3} until={B.west.start + 4.0} y={330} size={54} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Tag text="PARIS GUN · 120 km" in={B.west.start + 7.2} until={B.guess.start + 0.4} at={GUN} dy={-70} size={30} bg="#e63946" />

          {/* ── guess ── */}
          <Callout text="100 DAYS" icon="calendar" in={B.guess.start + 0.6} until={B.guess.start + 3.2} y={330} size={58} />
          <BigNumber text="?" in={B.guess.start + 3.2} until={B.peace.start} y={420} size={260} color="#ffd23f" />
          <Tag text="WHAT IF IT HADN'T?" in={B.guess.start + 4.2} until={B.peace.start} x={540} y={620} size={34} bg="#e63946" />

          {/* ── the scenario: the peace ── */}
          <Callout text="PEACE TERMS · 1914" icon="flagpost" in={B.peace.start + 0.5} until={B.peace.start + 3.4} y={330} size={48} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Tag text="SIGNS IN BERLIN" in={B.peace.start + 3.2} until={T_EMPIRE} at={[2.0, 47.6]} size={30} bg="#1a1a1a" />
          <Tag text="IRON MINES" in={B.peace.start + 5.0} until={T_EMPIRE} at={BRIEY} size={30} dy={60} />
          <Callout text="PAYS FOR DECADES" icon="coin" in={B.peace.start + 6.4} until={T_EMPIRE} y={330} size={50} />
          <Tag text="SATELLITE" in={B.peace.start + 8.4} until={T_EMPIRE} at={[4.6, 50.55]} size={32} bg="#1a1a1a" />
          <Tag text="GERMAN STATE" in={B.peace.start + 10.4} until={T_EMPIRE} at={[6.1, 49.85]} size={30} bg="#1a1a1a" dy={-40} />

          {/* ── the scenario: the empire ── */}
          <Callout text="COMMON MARKET" sub="seventy years early" in={B.empire.start + 8.6} until={B.nowar.start + 0.4} y={300} size={56} font="sans" weight={900} glow="rgba(255,255,255,0.5)" />

          {/* ── the answer, then the cut ── */}
          <Callout text="NO VERSAILLES" icon="cross" in={B.nowar.start + 0.2} until={END} y={300} size={46} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="NO REPARATIONS" icon="cross" in={B.nowar.start + 1.5} until={END} y={400} size={46} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="NO HITLER" icon="cross" in={B.nowar.start + 7.0} until={END} y={520} size={64} font="sans" weight={900} color="#ff6b6b" glow="rgba(255,80,60,0.5)" />
          <Callout text="NO SECOND WORLD WAR" sub="as we know it — many historians argue" in={B.nowar.start + 8.6} until={END} y={650} size={48} font="sans" weight={900} glow="rgba(255,255,255,0.5)" />

          <WordCaptions lines={LINES} />
        </>
      }
    >
      {/* ── the question: the Kaiser's Germany ── */}
      <Highlight shape="germany" flag="germany1914" in={0.3} until={T_EAST_OFF} />
      <Label at={[10.4, 51.3]} text="GERMANY" size={56} in={0.8} until={B.east.start + 1.4} />

      {/* ── the east: Brest-Litovsk ── */}
      <Wash shapes={KINGDOMS} color="#1a1a1a" opacity={0.55} outline="#ffffff" outlineWidth={3} in={B.east.start + 1.6} until={T_EAST_OFF} draw={1.4} />
      <Label at={[26.5, 64]} text="FINLAND" size={36} in={B.east.start + 3.0} until={T_EAST_OFF} weight={800} />
      <Label at={[24.8, 57.2]} text="THE BALTICS" size={36} in={B.east.start + 3.8} until={T_EAST_OFF} weight={800} />
      <Label at={[19.6, 52.2]} text="POLAND" size={36} in={B.east.start + 4.4} until={T_EAST_OFF} weight={800} />
      <Label at={[28, 53.6]} text="BELARUS" size={36} in={B.east.start + 5.0} until={T_EAST_OFF} weight={800} />
      <Label at={[31.5, 49.0]} text="UKRAINE" size={36} in={B.east.start + 5.6} until={T_EAST_OFF} weight={800} />

      {/* ── the west: fifty divisions ── */}
      <Route points={[[6.1, 50.9], [3.6, 49.7]]} in={B.west.start + 0.6} dur={1.3} until={B.guess.start + 0.4} color="#e63946" width={9} head="dot" />
      <Route points={[[5.6, 49.6], [3.2, 49.25]]} in={B.west.start + 1.0} dur={1.3} until={B.guess.start + 0.4} color="#e63946" width={9} head="dot" />
      <Route points={[[6.9, 49.2], [4.1, 48.8]]} in={B.west.start + 1.4} dur={1.3} until={B.guess.start + 0.4} color="#e63946" width={9} head="dot" />
      <Pin at={PARIS} label="Paris" in={B.west.start + 2.4} until={T_EMPIRE} side="left" />
      <Measure from={FRONT} to={PARIS} text="56 km" in={B.west.start + 3.8} until={B.guess.start + 0.4} offset={60} />
      <Rings at={GUN} in={B.west.start + 6.4} until={B.guess.start + 0.4} color="#ffd23f" maxR={120} />
      <Route points={[GUN, PARIS]} in={B.west.start + 6.8} dur={0.8} until={B.guess.start + 0.4} color="#ffd23f" width={5} dashed glow={false} head="dot" />

      {/* ── the scenario: the peace ── */}
      <Wash shape="france" color="#1a1a1a" opacity={0.35} outline="#ffffff" outlineWidth={3} in={B.peace.start + 3.0} until={T_EMPIRE} draw={1.0} />
      <Pin at={BRIEY} label="Briey" in={B.peace.start + 4.6} until={T_EMPIRE} side="right" />
      <Wash shape="belgium" color="#1a1a1a" opacity={0.5} outline="#ffffff" outlineWidth={3} in={B.peace.start + 8.0} until={T_EMPIRE} />
      <Highlight shape="luxembourg" flag="germany1914" in={B.peace.start + 10.0} until={T_EMPIRE} minArea={1} />

      {/* ── the scenario: the empire ── */}
      <Highlight shape="germany" flag="germany1914" in={T_EMPIRE - 0.3} until={END} />
      <Wash shapes={KINGDOMS} color="#1a1a1a" opacity={0.55} outline="#ffffff" outlineWidth={2.5} in={B.empire.start + 1.6} until={END} draw={1.2} />
      <Label at={[26, 54.5]} text="THE KAISER'S KINGDOMS" size={34} in={B.empire.start + 2.6} until={B.empire.start + 6.0} weight={800} />
      <Wash shapes={BLOC} color="#8b1e1e" opacity={0.45} outline="#ffffff" outlineWidth={2.5} in={B.empire.start + 4.2} until={END} draw={2.6} />
      <Route points={[BREST_FR, BERLIN, ODESA]} in={B.empire.start + 4.6} dur={3.0} until={END} color="#ffd23f" width={7} head="dot" />
      <Label at={[-3.5, 47.0]} text="ATLANTIC" size={32} in={B.empire.start + 4.8} until={END} weight={800} />
      <Label at={[31.5, 44.6]} text="BLACK SEA" size={32} in={B.empire.start + 7.2} until={END} weight={800} />
    </GeoCanvas>
  </AbsoluteFill>
);

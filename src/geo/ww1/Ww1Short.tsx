import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { GeoCanvas } from "../GeoCanvas";
import { BigNumber, Callout, Captions, Tag } from "../hud";
import { Highlight, Label, Measure, Pin, Rings, Route, Wash } from "../layers";
import { CameraKey, LonLat } from "../projection";
import { Line, beatsOf } from "../timing";
import timing from "./timing.json";

// ── What if Germany had won the First World War? ──────────────────────
//
// ~50 s, 9:16, built to loop: the question, how close it came in 1918,
// what Berlin had already taken and planned, a guess, and the answer cut
// on its last word so the loop lands back on the question.
//
//   python3 scripts/make-vo.py geo-ww1
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

/** Brest-Litovsk: what Russia signed away in March 1918. */
const BREST = ["finland", "estonia", "latvia", "lithuania", "poland", "belarus", "ukraine"];
/** Mitteleuropa, as the September Programme listed it. */
const BLOC = ["france", "belgium", "netherlands", "luxembourg", "denmark", "austria", "hungary", "czechia", "poland", "italy", "sweden", "norway"];

const CAMERA: CameraKey[] = [
  { at: 0, lon: 12, lat: 51.5, scale: 7200 },
  { at: B.east.start, lon: 16, lat: 52.5, scale: 7000 },
  { at: B.east.start + 1.6, lon: 24, lat: 54, scale: 6400 },
  { at: B.west.start - 0.3, lon: 24, lat: 54, scale: 6300 },
  { at: B.west.start + 1.6, lon: 3.6, lat: 49.4, scale: 24000 },
  { at: B.plan.start, lon: 4.0, lat: 49.7, scale: 20000 },
  { at: B.bloc.start - 0.3, lon: 4.2, lat: 49.8, scale: 19000 },
  { at: B.bloc.start + 1.5, lon: 12, lat: 50.5, scale: 6600 },
  { at: B.reveal.start, lon: 11, lat: 50.5, scale: 6400 },
  { at: END, lon: 10.5, lat: 50.5, scale: 6200 },
];

const T_WEST = B.west.start + 1.6;
const T_BLOC = B.bloc.start + 1.5;

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
          <Tag text="PARIS GUN · 120 km" in={B.west.start + 7.2} until={B.plan.start + 0.4} at={[4.3, 49.95]} size={30} bg="#e63946" />

          {/* ── the plan ── */}
          <BigNumber text="1914" in={B.plan.start + 1.0} until={B.plan.start + 3.2} y={300} size={130} />
          <Tag text="VASSAL STATE" in={B.plan.start + 2.6} until={T_BLOC} at={[4.6, 50.55]} size={30} bg="#1a1a1a" />
          <Tag text="ANNEXED" in={B.plan.start + 4.6} until={T_BLOC} at={[6.1, 49.85]} size={30} bg="#1a1a1a" dy={-40} />
          <Tag text="IRON MINES" in={B.plan.start + 6.2} until={T_BLOC} at={BRIEY} size={30} dy={60} />
          <Callout text="INDEMNITY" icon="coin" in={B.plan.start + 8.0} until={B.bloc.start + 1.2} y={330} size={54} />

          {/* ── the bloc ── */}
          <Callout text="MITTELEUROPA" in={B.bloc.start + 4.2} until={B.reveal.start} y={1250} size={70} font="sans" weight={900} glow="rgba(255,255,255,0.45)" />

          {/* ── guess ── */}
          <Callout text="100 DAYS" icon="calendar" in={B.guess.start + 0.6} until={B.guess.start + 3.6} y={330} size={58} />
          <BigNumber text="?" in={B.guess.start + 3.6} until={B.reveal.start} y={420} size={260} color="#ffd23f" />
          <Tag text="WHAT WOULD HAVE CHANGED?" in={B.guess.start + 4.6} until={B.reveal.start} x={540} y={620} size={34} bg="#e63946" />

          {/* ── the reveal, then the cut ── */}
          <Callout text="NO TREATY OF VERSAILLES" icon="cross" in={B.reveal.start + 0.3} until={END} y={300} size={44} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="NO HUMILIATED GERMANY" icon="cross" in={B.reveal.start + 2.2} until={END} y={410} size={44} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="NO HITLER" sub="many historians argue" icon="cross" in={B.reveal.start + 4.6} until={END} y={540} size={64} font="sans" weight={900} glow="rgba(255,255,255,0.5)" />

          <Captions lines={LINES} />
        </>
      }
    >
      {/* ── the question: the Kaiser's Germany ── */}
      <Highlight shape="germany" flag="germany1914" in={0.3} until={T_WEST - 0.4} />
      <Label at={[10.4, 51.3]} text="GERMANY" size={56} in={0.8} until={B.east.start + 1.4} />

      {/* ── the east: Brest-Litovsk ── */}
      <Wash shapes={BREST} color="#1a1a1a" opacity={0.55} outline="#ffffff" outlineWidth={3} in={B.east.start + 1.6} until={T_WEST - 0.2} draw={1.4} />
      <Label at={[26.5, 64]} text="FINLAND" size={36} in={B.east.start + 3.0} until={T_WEST - 0.2} weight={800} />
      <Label at={[24.8, 57.2]} text="THE BALTICS" size={36} in={B.east.start + 3.8} until={T_WEST - 0.2} weight={800} />
      <Label at={[19.6, 52.2]} text="POLAND" size={36} in={B.east.start + 4.4} until={T_WEST - 0.2} weight={800} />
      <Label at={[28, 53.6]} text="BELARUS" size={36} in={B.east.start + 5.0} until={T_WEST - 0.2} weight={800} />
      <Label at={[31.5, 49.0]} text="UKRAINE" size={36} in={B.east.start + 5.6} until={T_WEST - 0.2} weight={800} />

      {/* ── the west: fifty divisions ── */}
      <Route points={[[6.1, 50.9], [3.6, 49.7]]} in={B.west.start + 0.6} dur={1.3} until={B.plan.start + 0.4} color="#e63946" width={9} head="dot" />
      <Route points={[[5.6, 49.6], [3.2, 49.25]]} in={B.west.start + 1.0} dur={1.3} until={B.plan.start + 0.4} color="#e63946" width={9} head="dot" />
      <Route points={[[6.9, 49.2], [4.1, 48.8]]} in={B.west.start + 1.4} dur={1.3} until={B.plan.start + 0.4} color="#e63946" width={9} head="dot" />
      <Pin at={PARIS} label="Paris" in={B.west.start + 2.4} until={T_BLOC} side="left" />
      <Measure from={FRONT} to={PARIS} text="56 km" in={B.west.start + 3.8} until={B.plan.start + 0.4} offset={60} />
      <Rings at={GUN} in={B.west.start + 6.4} until={B.plan.start + 0.4} color="#ffd23f" maxR={120} />
      <Route points={[GUN, PARIS]} in={B.west.start + 6.8} dur={0.8} until={B.plan.start + 0.4} color="#ffd23f" width={5} dashed glow={false} head="dot" />

      {/* ── the plan: Belgium, Luxembourg, Briey ── */}
      <Wash shape="belgium" color="#1a1a1a" opacity={0.5} outline="#ffffff" outlineWidth={3} in={B.plan.start + 2.2} until={T_BLOC} />
      <Highlight shape="luxembourg" flag="germany1914" in={B.plan.start + 4.2} until={T_BLOC} minArea={1} />
      <Pin at={BRIEY} label="Briey" in={B.plan.start + 5.8} until={T_BLOC} side="right" />

      {/* ── the bloc ── */}
      <Wash shapes={BLOC} color="#8b1e1e" opacity={0.45} outline="#ffffff" outlineWidth={2.5} in={B.bloc.start + 1.8} until={END} draw={1.6} />
      <Highlight shape="germany" flag="germany1914" in={T_BLOC - 0.3} until={END} />
    </GeoCanvas>
  </AbsoluteFill>
);

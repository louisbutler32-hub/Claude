import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { GeoCanvas } from "../GeoCanvas";
import { BigNumber, Callout, Captions, Tag } from "../hud";
import { Highlight, Label, Pin, Route, Spot } from "../layers";
import { CameraKey, LonLat } from "../projection";
import { Line, beatsOf } from "../timing";
import timing from "./timing.json";

// ── What if Napoleon had won at Waterloo? ─────────────────────────────
//
// ~45 s, 9:16, built to loop. The escape from Elba, the battle, a guess,
// and the answer: it changes almost nothing, because 850,000 allies were
// already marching on France. Cuts on the last word.
//
//   python3 scripts/make-vo.py geo-waterloo
//   npm run geo:waterloo:music

export const WATERLOO_FPS = 30;
const LINES = timing as Line[];
export const WATERLOO_SECONDS = LINES[LINES.length - 1].end + 0.15;
export const WATERLOO_FRAMES = Math.round(WATERLOO_SECONDS * WATERLOO_FPS);
const B = beatsOf(LINES, WATERLOO_SECONDS);
const END = WATERLOO_SECONDS + 1;

const ELBA: LonLat = [10.3, 42.78];
const GOLFE_JUAN: LonLat = [7.07, 43.55];
const GRENOBLE: LonLat = [5.72, 45.19];
const LYON: LonLat = [4.83, 45.76];
const PARIS: LonLat = [2.35, 48.86];
const WATERLOO: LonLat = [4.41, 50.68];
const BRUSSELS: LonLat = [4.35, 50.85];
const WAVRE: LonLat = [4.6, 50.72];
const PLANCENOIT: LonLat = [4.43, 50.665];
const VIENNA: LonLat = [16.37, 48.2];
const WARSAW: LonLat = [21.0, 52.2];
const BERLIN: LonLat = [13.4, 52.5];
const LONDON: LonLat = [-0.13, 51.5];
const TURIN: LonLat = [7.69, 45.07];
const STRASBOURG: LonLat = [7.75, 48.58];
const MAINZ: LonLat = [8.27, 50.0];
const COLOGNE: LonLat = [6.96, 50.94];

const CAMERA: CameraKey[] = [
  { at: 0, lon: 4, lat: 47.5, scale: 9000 },
  { at: B.escape.start, lon: 5, lat: 46.5, scale: 9500 },
  { at: B.escape.start + 1.4, lon: 7.5, lat: 44.6, scale: 15000 },
  { at: B.escape.start + 5.0, lon: 5.0, lat: 46.2, scale: 11000 },
  { at: B.battle.start - 0.3, lon: 4.0, lat: 47.5, scale: 10000 },
  { at: B.battle.start + 1.5, lon: 4.45, lat: 50.65, scale: 90000 },
  { at: B.guess.start, lon: 4.45, lat: 50.66, scale: 95000 },
  { at: B.fronts.start - 0.2, lon: 4.45, lat: 50.66, scale: 95000 },
  { at: B.fronts.start + 1.6, lon: 9, lat: 48.5, scale: 5600 },
  { at: END, lon: 8.5, lat: 48.5, scale: 5500 },
];

const T_BATTLE = B.battle.start + 1.5;
const T_FRONTS = B.fronts.start + 1.6;

export type WaterlooProps = { music?: string | null; narration?: string | null };

export const WaterlooShort: React.FC<WaterlooProps> = ({ music = null, narration = "assets/vo/geo-waterloo.mp3" }) => (
  <AbsoluteFill>
    {narration ? <Audio src={staticFile(narration)} /> : null}
    {music ? <Audio src={staticFile(music)} /> : null}
    <GeoCanvas
      camera={CAMERA}
      hud={
        <>
          <BigNumber text="1815" in={0.5} until={B.escape.start + 1.2} y={300} size={150} />
          {/* ── the escape ── */}
          <Callout text="1,000 MEN" icon="people" in={B.escape.start + 3.0} until={B.escape.start + 6.4} y={330} size={54} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="20 MARCH 1815" icon="calendar" in={B.escape.start + 7.4} until={B.battle.start + 0.6} y={330} size={52} />

          {/* ── the battle ── */}
          <BigNumber text="18 JUNE" in={B.battle.start + 0.3} until={B.guess.start} y={300} size={110} />

          {/* ── guess ── */}
          <BigNumber text="?" in={B.guess.start + 0.2} until={B.fronts.start} y={420} size={260} color="#ffd23f" />
          <Tag text="WHAT IF WELLINGTON HAD LOST?" in={B.guess.start + 1.3} until={B.fronts.start} x={540} y={620} size={34} bg="#e63946" />

          {/* ── the fronts ── */}
          <BigNumber text="850,000" in={B.fronts.start + 3.6} until={END} y={300} size={130} color="#ff6b6b" />
          <Tag text="ALLIED SOLDIERS" in={B.fronts.start + 3.9} until={END} x={540} y={420} size={32} bg="#e63946" />
          <BigNumber text="250,000" in={B.fronts.start + 8.6} until={END} y={1240} size={130} color="#7fb0ff" />
          <Tag text="NAPOLEON" in={B.fronts.start + 8.9} until={END} x={540} y={1360} size={32} bg="#0055a4" />

          {/* ── the reveal, then the cut ── */}
          <Callout text="OUTNUMBERED 3 TO 1" icon="cross" in={B.reveal.start + 0.3} until={END} y={560} size={54} font="sans" weight={900} glow="rgba(255,255,255,0.5)" />

          <Captions lines={LINES} />
        </>
      }
    >
      {/* ── the question ── */}
      <Highlight shape="france" flag="napoleon" in={0.3} until={T_BATTLE - 0.3} />
      <Label at={[2.4, 46.6]} text="FRANCE" size={60} in={0.8} until={B.escape.start + 1.2} />
      <Spot at={WATERLOO} in={1.0} until={B.escape.start + 1.0} color="#ffd23f" r={42} />
      <Label at={WATERLOO} text="WATERLOO" size={38} in={1.2} until={B.escape.start + 1.0} dy={-70} weight={800} />

      {/* ── the escape ── */}
      <Pin at={ELBA} label="Elba" in={B.escape.start + 0.8} until={B.battle.start} side="right" />
      <Route points={[ELBA, GOLFE_JUAN]} in={B.escape.start + 1.8} dur={1.0} until={B.battle.start} color="#ffffff" width={5} dashed glow={false} head="dot" />
      <Route points={[GOLFE_JUAN, GRENOBLE, LYON, PARIS]} in={B.escape.start + 4.8} dur={2.4} until={B.battle.start} color="#ffd23f" width={7} head="dot" />
      <Pin at={PARIS} label="Paris" in={B.escape.start + 6.8} until={B.battle.start} side="left" />

      {/* ── the battle ── */}
      <Pin at={BRUSSELS} label="Brussels" in={T_BATTLE} until={B.fronts.start} side="top" labelSize={30} size={44} />
      <Pin at={WATERLOO} label="Waterloo" in={T_BATTLE + 0.4} until={B.fronts.start} side="right" />
      <Label at={[4.41, 50.6]} text="NAPOLEON · 73,000" size={40} color="#7fb0ff" in={B.battle.start + 2.6} until={B.fronts.start} weight={800} />
      <Label at={[4.41, 50.745]} text="WELLINGTON · 68,000" size={40} color="#ff6b6b" in={B.battle.start + 4.6} until={B.fronts.start} weight={800} />
      <Route points={[WAVRE, PLANCENOIT]} in={B.battle.start + 8.4} dur={1.0} until={B.fronts.start} color="#ffffff" width={8} head="dot" />
      <Label at={[4.66, 50.72]} text="PRUSSIANS · 50,000" size={36} color="#ffffff" in={B.battle.start + 8.8} until={B.fronts.start} weight={800} dy={-50} />

      {/* ── four fronts ── */}
      <Highlight shape="france" flag="napoleon" in={T_FRONTS - 0.4} until={END} glow={0.6} />
      <Route points={[VIENNA, STRASBOURG]} in={B.fronts.start + 2.2} dur={1.4} until={END} color="#e63946" width={9} head="dot" />
      <Route points={[WARSAW, MAINZ]} in={B.fronts.start + 2.6} dur={1.6} until={END} color="#e63946" width={9} head="dot" />
      <Route points={[BERLIN, COLOGNE]} in={B.fronts.start + 3.0} dur={1.2} until={END} color="#e63946" width={9} head="dot" />
      <Route points={[LONDON, BRUSSELS]} in={B.fronts.start + 3.2} dur={1.0} until={END} color="#e63946" width={9} head="dot" />
      <Route points={[TURIN, [5.6, 45.4]]} in={B.fronts.start + 3.4} dur={1.0} until={END} color="#e63946" width={9} head="dot" />
      <Label at={[15.5, 47.4]} text="AUSTRIA" size={36} in={B.fronts.start + 5.2} until={END} weight={800} />
      <Label at={[22, 53.2]} text="RUSSIA" size={36} in={B.fronts.start + 5.8} until={END} weight={800} />
      <Label at={[13.4, 53.5]} text="PRUSSIA" size={36} in={B.fronts.start + 6.2} until={END} weight={800} />
      <Label at={[-1.8, 52.6]} text="BRITAIN" size={36} in={B.fronts.start + 6.6} until={END} weight={800} />
    </GeoCanvas>
  </AbsoluteFill>
);

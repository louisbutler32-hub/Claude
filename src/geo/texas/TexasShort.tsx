import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { BigStat, Leader, PlaceName, Region, Ring, ScaleSilhouette, YELLOW } from "../annotate";
import { GeoCanvas } from "../GeoCanvas";
import { Tag, WordCaptions } from "../hud";
import { Route } from "../layers";
import { MapProp, PropRow } from "../props";
import { CameraKey, LonLat } from "../projection";
import { Line, beatsOf } from "../timing";
import { Title3D, TitleSub } from "../title3d";
import timing from "./timing.json";

// ── Why did Texas give up being a country? ────────────────────────────
//
// ~73 s, 9:16, built to loop. Written against docs/dopamine-ladder.md:
// the question is asked out loud in the first four seconds, the obvious
// answer (money) is offered and knocked down at 24 s, the loop is reopened
// at 35 s, and the real answer — Britain — lands at 38 s with the
// consequence nobody expects at 59 s. It cuts on the last word so the loop
// restarts into the question.
//
// Clean style: flat fills, white outlines, names set on the map, yellow
// rings and leaders, scale silhouettes, 3D title words. No faces.
//
//   python3 scripts/make-vo.py geo-texas
//   python3 scripts/align-words.py geo-texas
//   python3 scripts/make-geo-sfx.py texas
//   npm run geo:texas:music

export const TEXAS_FPS = 30;
const LINES = timing as Line[];
export const TEXAS_SECONDS = LINES[LINES.length - 1].end + 0.15;
export const TEXAS_FRAMES = Math.round(TEXAS_SECONDS * TEXAS_FPS);
const B = beatsOf(LINES, TEXAS_SECONDS);
const END = TEXAS_SECONDS + 1;

const TX = "state:Texas";
const TEXAS_C: LonLat = [-99.6, 31.3];
const AUSTIN: LonLat = [-97.74, 30.27];
const HOUSTON: LonLat = [-95.37, 29.76];
const NEW_ORLEANS: LonLat = [-90.07, 29.95];
const PERMIAN: LonLat = [-102.4, 31.9];

const CESSION = ["state:California", "state:Nevada", "state:Utah", "state:Arizona"];
const US_1845 = [
  "state:Maine", "state:New Hampshire", "state:Vermont", "state:Massachusetts", "state:Rhode Island",
  "state:Connecticut", "state:New York", "state:New Jersey", "state:Pennsylvania", "state:Delaware",
  "state:Maryland", "state:Virginia", "state:West Virginia", "state:North Carolina", "state:South Carolina",
  "state:Georgia", "state:Florida", "state:Ohio", "state:Indiana", "state:Illinois", "state:Michigan",
  "state:Wisconsin", "state:Kentucky", "state:Tennessee", "state:Alabama", "state:Mississippi",
  "state:Louisiana", "state:Arkansas", "state:Missouri", "state:Iowa",
];

// the channel's palette — saturated, flat, white-edged
const TEX = "#c8382e";
const USA = "#2f6fc4";
const MEX = "#2f9e5f";
const BRIT = "#7b3fb8";
const GOLD = "#e8a33d";

const CAMERA: CameraKey[] = [
  { at: 0, lon: -99.6, lat: 31.6, scale: 26000 },
  { at: B.real.start, lon: -99.4, lat: 31.2, scale: 30000 },
  { at: B.real.start + 3.4, lon: -98.6, lat: 30.6, scale: 33000 },
  { at: B.size.start, lon: -99.6, lat: 31.3, scale: 27000 },
  { at: B.size.start + 2.2, lon: -101.5, lat: 28.0, scale: 15000 },
  { at: B.obvious.start, lon: -99.6, lat: 31.3, scale: 28000 },
  { at: B.debt.start, lon: -99.4, lat: 31.4, scale: 30000 },
  { at: B.but.start, lon: -96.5, lat: 33.5, scale: 13000 },
  { at: B.why.start, lon: -94.0, lat: 35.0, scale: 10000 },
  { at: B.reopen.start, lon: -95.0, lat: 33.5, scale: 12000 },
  { at: B.britain.start + 0.4, lon: -88.0, lat: 30.5, scale: 11000 },
  { at: B.panic.start, lon: -93.5, lat: 31.5, scale: 11500 },
  { at: B.yes.start, lon: -97.5, lat: 32.5, scale: 15000 },
  { at: B.twist.start, lon: -101.0, lat: 29.5, scale: 14000 },
  { at: B.war.start + 0.6, lon: -105.5, lat: 31.5, scale: 9500 },
  { at: B.reveal.start + 0.4, lon: -112.5, lat: 36.5, scale: 7600 },
  { at: END, lon: -114.5, lat: 37.5, scale: 7200 },
];

export type TexasProps = { music?: string | null; narration?: string | null; sfx?: string | null };

export const TexasShort: React.FC<TexasProps> = ({
  music = null,
  narration = "assets/vo/geo-texas.mp3",
  sfx = "audio/geo-texas-sfx.mp3",
}) => (
  <AbsoluteFill>
    {narration ? <Audio src={staticFile(narration)} /> : null}
    {sfx ? <Audio src={staticFile(sfx)} volume={0.5} /> : null}
    {music ? <Audio src={staticFile(music)} /> : null}
    <GeoCanvas
      camera={CAMERA}
      hud={
        <>
          {/* ── 1 · stimulation, 2 · captivation: the question, over motion ── */}
          <Title3D text="TEXAS" in={0.1} until={B.real.start + 0.2} y={470} size={200} turn={-26} tilt={12} roll={-5} glow="rgba(255,170,40,0.92)" />
          <TitleSub text="ITS OWN COUNTRY · 1836–1845" in={0.7} until={B.real.start + 0.2} y={630} size={40} />

          {/* ── circling the question ── */}
          <Tag text="PRESIDENT" in={B.real.start + 1.3} until={B.size.start} at={AUSTIN} dy={90} size={34} />
          <Tag text="ARMY" in={B.real.start + 2.1} until={B.size.start} at={[-101.8, 32.6]} dy={80} size={34} />
          <Tag text="ITS OWN CURRENCY" in={B.real.start + 3.0} until={B.size.start} at={[-95.4, 32.6]} dy={80} size={34} />
          <Tag text="LONDON · PARIS" in={B.real.start + 4.6} until={B.size.start} at={[-90.5, 27.6]} size={34} bg="#7b3fb8" />

          {/* ── bigger than France ── */}
          <BigStat value="BIGGER THAN FRANCE" in={B.size.start + 2.6} until={B.obvious.start} y={430} size={62} />

          {/* ── 3 · the obvious answer, offered ── */}
          <Title3D text="BROKE" in={B.obvious.start + 1.2} until={B.debt.start + 0.6} y={480} size={185} turn={-20} tilt={10} roll={4} glow="rgba(255,70,50,0.92)" />
          <BigStat value="$10,000,000" sub="IN DEBT" in={B.debt.start + 2.2} until={B.but.start} y={420} size={110} />

          {/* ── and knocked down ── */}
          <Title3D text="BUT NO" in={B.but.start + 0.9} until={B.why.start} y={380} size={140} turn={-18} tilt={9} glow="rgba(255,70,50,0.9)" />
          <Tag text="TEXAS ASKED TO JOIN" in={B.but.start + 2.4} until={B.why.start} x={540} y={1330} size={38} bg="#c8382e" />
          <Tag text="AMERICA SAID NO" in={B.but.start + 3.4} until={B.why.start} x={540} y={1400} size={38} bg="#1a1a1a" />
          <BigStat value="THE SENATE" sub="ADMITTING TEXAS WOULD TIP THE BALANCE" in={B.why.start + 2.4} until={B.reopen.start} y={430} size={78} />

          {/* ── the loop reopened ── */}
          <Title3D text="SO WHAT CHANGED?" in={B.reopen.start + 0.2} until={B.britain.start + 0.6} y={500} size={104} turn={-22} tilt={11} roll={-5} glow="rgba(255,205,45,0.95)" />

          {/* ── 4 · validation: Britain ── */}
          <Title3D text="BRITAIN" in={B.britain.start + 0.5} until={B.britain.start + 3.4} y={400} size={165} turn={-18} tilt={9} glow="rgba(150,90,255,0.9)" />
          <Tag text="COTTON" in={B.britain.start + 4.8} until={B.panic.start} at={[-92.0, 32.8]} size={36} bg="#7b3fb8" />
          <BigStat value="A BRITISH ALLY" sub="ON THE SOUTHERN BORDER" in={B.panic.start + 1.4} until={B.yes.start} y={430} size={82} color="#ff6b6b" />
          <Title3D text="1845" in={B.yes.start + 1.2} until={B.twist.start} y={430} size={175} turn={-16} tilt={9} glow="rgba(70,170,255,0.9)" />

          {/* ── the consequence nobody expects ── */}
          <Title3D text="AND THEN" in={B.twist.start + 0.3} until={B.war.start + 0.4} y={470} size={128} turn={-20} tilt={10} glow="rgba(255,90,40,0.92)" />
          <BigStat value="WAR WITH MEXICO" in={B.war.start + 1.4} until={B.reveal.start} y={400} size={74} color="#ff6b6b" />
          <Title3D text="NO TEXAS" in={B.reveal.start + 3.2} until={END} y={430} size={130} turn={-20} tilt={10} roll={-4} glow="rgba(255,60,50,0.95)" />
          <TitleSub text="NO WEST COAST" in={B.reveal.start + 4.0} until={END} y={570} size={62} />

          <WordCaptions lines={LINES} y={1180} size={82} />
        </>
      }
    >
      {/* ── the republic ── */}
      <Region shape={TX} color={TEX} in={0.15} until={B.but.start} glow />
      <PlaceName at={TEXAS_C} text="TEXAS" size={78} in={B.real.start + 0.3} until={B.size.start} />
      <MapProp at={AUSTIN} kind="capitol" in={B.real.start + 1.0} until={B.size.start} size={190} />
      <MapProp at={[-101.8, 32.6]} kind="flagpole" in={B.real.start + 1.8} until={B.size.start} size={185} />
      <MapProp at={[-95.4, 32.6]} kind="coin" in={B.real.start + 2.7} until={B.size.start} size={165} />
      <Route points={[HOUSTON, [-92.5, 28.2], [-88.0, 27.4]]} in={B.real.start + 4.3} dur={1.5} until={B.size.start} color={YELLOW} width={7} dashed glow={false} headIcon="ship" headSize={135} />

      {/* ── bigger than France ── */}
      <Region shape="mexico" color={MEX} in={B.size.start + 1.6} until={B.obvious.start} />
      <PlaceName at={[-102.5, 23.5]} text="MEXICO" size={54} in={B.size.start + 1.9} until={B.obvious.start} />
      <ScaleSilhouette shape="france" at={[-100.2, 31.2]} fit={330} label="FRANCE" in={B.size.start + 2.4} until={B.obvious.start} rotate={-6} />

      {/* ── the obvious answer ── */}
      <PropRow at={[-99.6, 35.9]} kind="people" count={5} in={B.debt.start + 0.4} until={B.but.start} size={150} />
      <MapProp at={[-97.2, 26.6]} kind="cash" in={B.debt.start + 1.9} until={B.but.start} size={215} />

      {/* ── knocked down: Texas asks, America refuses ── */}
      <Region shapes={US_1845} color={USA} in={B.but.start - 0.3} until={B.yes.start + 0.3} />
      <Region shape={TX} color={TEX} in={B.but.start} until={B.yes.start + 0.3} glow />
      <PlaceName at={[-86.0, 36.0]} text="UNITED STATES" size={52} in={B.but.start + 0.6} until={B.reopen.start} />
      <Route points={[TEXAS_C, [-92, 35], [-84, 38.5]]} in={B.but.start + 1.8} dur={1.3} until={B.why.start} color={YELLOW} width={8} head="dot" />
      <Route points={[[-84, 38.5], [-92, 35], TEXAS_C]} in={B.but.start + 3.2} dur={1.1} until={B.reopen.start} color="#ff4b3e" width={8} dashed glow={false} head="dot" />

      {/* ── Britain ── */}
      <Route points={[[-80.5, 27.5], [-86.0, 28.6], [-92.8, 29.2]]} in={B.britain.start + 0.7} dur={1.8} until={B.yes.start} color="#c9a4ff" width={9} headIcon="ship" headSize={155} />
      <Leader at={[-86.5, 28.4]} text="WANTS THE COTTON" in={B.britain.start + 3.6} until={B.panic.start} dx={-30} dy={-260} size={44} color="#c9a4ff" />
      <MapProp at={[-92.0, 32.8]} kind="wheat" in={B.britain.start + 4.4} until={B.panic.start} size={170} />
      <Ring at={[-95.0, 30.5]} in={B.panic.start + 0.5} until={B.yes.start} rx={260} ry={185} color="#ff6b6b" />

      {/* ── it joins ── */}
      <Region shapes={US_1845} color={USA} in={B.yes.start} until={B.twist.start + 0.4} />
      <Region shape={TX} color={USA} in={B.yes.start + 0.6} until={B.twist.start + 0.4} glow />
      <PlaceName at={TEXAS_C} text="1845" size={64} in={B.yes.start + 1.2} until={B.twist.start} color={YELLOW} />

      {/* ── the war, and what it bought ── */}
      <Region shape="mexico" color={MEX} in={B.twist.start + 0.5} until={B.reveal.start + 1.6} />
      <Region shape={TX} color={USA} in={B.twist.start + 0.4} until={END} />
      <Route points={[[-99.5, 27.4], [-104.0, 25.8], [-99.1, 19.4]]} in={B.war.start + 1.8} dur={1.6} until={B.reveal.start + 1.6} color="#ff4b3e" width={10} head="dot" />
      <Region shapes={CESSION} color={GOLD} in={B.reveal.start + 0.6} until={END} draw={1.5} glow />
      <PlaceName at={[-119.9, 37.0]} text="CALIFORNIA" size={44} in={B.reveal.start + 1.4} until={END} rotate={-64} />
      <PlaceName at={[-117.0, 40.4]} text="NEVADA" size={36} in={B.reveal.start + 1.9} until={END} rotate={-72} />
      <PlaceName at={[-111.6, 39.6]} text="UTAH" size={38} in={B.reveal.start + 2.3} until={END} />
      <PlaceName at={[-111.8, 34.2]} text="ARIZONA" size={38} in={B.reveal.start + 2.7} until={END} />
    </GeoCanvas>
  </AbsoluteFill>
);

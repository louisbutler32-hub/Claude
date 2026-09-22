import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Character, Dialogue, Solid, Spotlight } from "../characters";
import { GeoCanvas } from "../GeoCanvas";
import { Callout, Tag, WordCaptions } from "../hud";
import { Label, Route } from "../layers";
import { MapProp, PropRow } from "../props";
import { CameraKey, LonLat } from "../projection";
import { Line, beatsOf } from "../timing";
import { Title3D, TitleSub } from "../title3d";
import timing from "./timing.json";

// ── What if Texas had stayed a country? ───────────────────────────────
//
// ~79 s, 9:16, built to loop. Rebuilt to the reference-channel format:
// countries are characters with faces that talk to each other, the big
// words are 3D renders lying in the shot, objects get dropped on the map
// instead of written out, and a sound lands on nearly every beat.
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

// ── the board ─────────────────────────────────────────────────────────
const TX = "state:Texas";
const AUSTIN: LonLat = [-97.74, 30.27];
const SAN_JACINTO: LonLat = [-95.08, 29.75];
const TEXAS_C: LonLat = [-99.4, 31.3];
const WASHINGTON: LonLat = [-77.04, 38.91];
const LONDON: LonLat = [-0.13, 51.5];
const PARIS: LonLat = [2.35, 48.86];
const GULF: LonLat = [-94.0, 27.4];
const PERMIAN: LonLat = [-102.3, 31.9];
const HOUSTON: LonLat = [-95.37, 29.76];
const DALLAS: LonLat = [-96.8, 32.78];

/** The 1848 cession — what the war with Mexico actually bought. */
const CESSION = ["state:California", "state:Nevada", "state:Utah", "state:Arizona", "state:New Mexico", "state:Colorado"];
/** Everything the United States already held in 1845, for the "no Texas" map. */
const WEST_COAST = ["state:California", "state:Oregon", "state:Washington"];

const TEX_BLUE = "#2c5fa8";
const TEX_RED = "#c8382e";
const US_BLUE = "#3567b5";
const MEX_GREEN = "#2f9e5f";
const UK_PURPLE = "#8e4fc0";

const CAMERA: CameraKey[] = [
  { at: 0, lon: -99.4, lat: 31.4, scale: 30000 },
  { at: B.won.start - 0.2, lon: -99.6, lat: 31.0, scale: 31500 },
  { at: B.won.start + 1.4, lon: -101.5, lat: 27.0, scale: 17000 },
  { at: B.real.start, lon: -100.2, lat: 30.2, scale: 24000 },
  { at: B.real.start + 2.6, lon: -99.4, lat: 31.2, scale: 29000 },
  { at: B.real.start + 4.9, lon: -95.5, lat: 30.5, scale: 17000 },
  { at: B.problem.start, lon: -99.4, lat: 31.3, scale: 30000 },
  { at: B.debt.start, lon: -99.2, lat: 31.4, scale: 31000 },
  { at: B.mexico.start, lon: -101.8, lat: 26.5, scale: 15000 },
  { at: B.ask.start, lon: -97.5, lat: 33.0, scale: 15000 },
  { at: B.no.start, lon: -96.0, lat: 34.5, scale: 13000 },
  { at: B.no.end - 0.5, lon: -95.0, lat: 35.0, scale: 12500 },
  { at: B.britain.start + 1.2, lon: -93.5, lat: 30.0, scale: 13000 },
  { at: B.yes.start, lon: -97.5, lat: 33.0, scale: 14000 },
  { at: B.guess.start, lon: -99.4, lat: 31.3, scale: 28000 },
  { at: B.econ.start + 0.4, lon: -99.4, lat: 31.3, scale: 22000 },
  { at: B.oil.start, lon: -100.2, lat: 31.6, scale: 26000 },
  { at: B.people.start, lon: -98.8, lat: 31.2, scale: 27000 },
  { at: B.war.start, lon: -101.5, lat: 28.5, scale: 15000 },
  { at: B.cession.start + 0.6, lon: -106, lat: 32.5, scale: 10000 },
  { at: B.reveal.start + 0.6, lon: -114, lat: 38.5, scale: 8600 },
  { at: END, lon: -116.5, lat: 39.5, scale: 8200 },
];

const T_EUROPE = B.real.start + 4.9;
const GULF_OUT: LonLat = [-88.5, 26.5];
const T_ATLANTIC = B.britain.start + 1.2;

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
          {/* ── the open ── */}
          <Title3D text="TEXAS" in={0.15} until={B.won.start + 0.3} y={560} size={190} turn={-26} tilt={12} roll={-5} glow="rgba(255,170,40,0.9)" />
          <TitleSub text="ITS OWN COUNTRY · 1836–1845" in={0.9} until={B.won.start + 0.3} y={720} size={38} />

          {/* ── the war ── */}
          <Title3D text="1836" in={B.won.start + 0.5} until={B.real.start} y={430} size={165} turn={-18} tilt={9} glow="rgba(255,90,40,0.85)" />

          {/* ── a real country ── */}
          <Tag text="PRESIDENT" in={B.real.start + 1.5} until={B.problem.start} at={[-97.3, 27.6]} dy={60} size={32} />
          <Tag text="ITS OWN FLAG" in={B.real.start + 2.2} until={B.problem.start} at={[-103.6, 33.8]} dy={60} size={32} />
          <Tag text="ITS OWN MONEY" in={B.real.start + 3.2} until={B.problem.start} at={[-94.2, 33.8]} dy={60} size={32} />
          <Tag text="→ LONDON" in={T_EUROPE + 1.0} until={B.problem.start} at={[-89.5, 28.4]} size={32} bg="#8e4fc0" />
          <Tag text="→ PARIS" in={T_EUROPE + 1.6} until={B.problem.start} at={[-88.0, 24.6]} size={32} bg="#8e4fc0" />

          {/* ── broke ── */}
          <Title3D text="BROKE" in={B.problem.start + 1.3} until={B.debt.start + 0.4} y={520} size={185} turn={-20} tilt={10} roll={4} glow="rgba(255,60,50,0.9)" />
          <Callout text="$10 MILLION IN DEBT" icon="coin" in={B.debt.start + 2.6} until={B.mexico.start} y={1300} size={52} />

          {/* ── Mexico ── */}
          <Dialogue text={"Texas is still\nours."} shape="mexico" in={B.mexico.start + 2.0} until={B.ask.start} size={50} rise={230} />

          {/* ── the ask ── */}
          <Dialogue text={"Can we join?"} shape={TX} in={B.ask.start + 1.0} until={B.no.start + 0.4} size={56} rise={230} dx={-40} />
          <Dialogue text={"No."} at={[-88, 39]} in={B.no.start + 0.5} until={B.britain.start} size={84} rise={90} />

          {/* ── Britain ── */}
          <Dialogue text={"Britain here.\nWant a deal?"} at={[-88.0, 27.0]} in={T_ATLANTIC + 0.6} until={B.yes.start} size={46} rise={150} leader={false} />
          <Dialogue text={"...wait."} at={[-96.5, 38.5]} in={T_ATLANTIC + 2.2} until={B.yes.start} size={58} rise={80} leader={false} />

          {/* ── 1845 ── */}
          <Title3D text="1845" in={B.yes.start + 1.6} until={B.guess.start} y={470} size={170} turn={-16} tilt={9} glow="rgba(70,170,255,0.85)" />

          {/* ── guess ── */}
          <Title3D text="WHAT IF?" in={B.guess.start + 0.3} until={B.econ.start + 0.8} y={520} size={165} turn={-22} tilt={11} roll={-6} glow="rgba(255,200,40,0.95)" />

          {/* ── the payoff ── */}
          <Title3D text="#8" in={B.econ.start + 2.2} until={B.oil.start} y={420} size={230} turn={-14} tilt={8} glow="rgba(255,190,40,0.95)" />
          <TitleSub text="LARGEST ECONOMY ON EARTH" in={B.econ.start + 2.6} until={B.oil.start} y={590} size={40} />
          <Tag text="BIGGER THAN CANADA" in={B.econ.start + 4.2} until={B.oil.start} x={540} y={700} size={34} bg="#c8382e" />
          <Tag text="BIGGER THAN RUSSIA" in={B.econ.start + 5.2} until={B.oil.start} x={540} y={770} size={34} bg="#c8382e" />
          <Title3D text="40%" in={B.oil.start + 2.4} until={B.people.start} y={430} size={195} turn={-18} tilt={9} glow="rgba(60,60,60,0.9)" color="#ffffff" />
          <TitleSub text="OF AMERICA'S OIL" in={B.oil.start + 2.8} until={B.people.start} y={570} size={44} />
          <Title3D text="31 MILLION" in={B.people.start + 1.2} until={B.war.start} y={430} size={112} turn={-16} tilt={9} glow="rgba(255,150,40,0.85)" />

          {/* ── the twist ── */}
          <Title3D text="NO CALIFORNIA" in={B.reveal.start + 3.0} until={END} y={470} size={96} turn={-20} tilt={10} roll={-4} glow="rgba(255,60,50,0.95)" />

          <WordCaptions lines={LINES} y={1180} size={82} />
        </>
      }
    >
      {/* ── the open: Texas, proud ── */}
      <Character shape={TX} in={0.2} until={B.won.start} color={TEX_BLUE} mood="proud" look={[0, -0.3]} arms raise={0.25} />

      {/* ── the war with Mexico ── */}
      <Solid shape="mexico" color={MEX_GREEN} in={B.won.start + 0.2} until={B.real.start} />
      <Character shape={TX} in={B.won.start + 0.2} until={B.real.start} color={TEX_RED} mood="angry" look={[-0.6, 0.2]} arms raise={0.7} />
      <MapProp at={SAN_JACINTO} kind="star" in={B.won.start + 2.4} until={B.real.start} size={190} />

      {/* ── a real country ── */}
      <Character shape={TX} in={B.real.start} until={B.problem.start} color={TEX_BLUE} mood="happy" look={[0, 0]} />
      <MapProp at={[-97.3, 27.6]} kind="capitol" in={B.real.start + 1.2} until={B.problem.start} size={200} />
      <MapProp at={[-103.6, 33.8]} kind="flagpole" in={B.real.start + 2.0} until={B.problem.start} size={200} />
      <MapProp at={[-94.2, 33.8]} kind="coin" in={B.real.start + 3.0} until={B.problem.start} size={185} />
      <Route points={[HOUSTON, [-92.5, 27.6], [-86.5, 28.8]]} in={T_EUROPE + 0.2} dur={1.5} until={B.problem.start} color="#ffd23f" width={7} dashed glow={false} headIcon="ship" headSize={130} />
      <Route points={[HOUSTON, [-93.5, 26.0], [-85.5, 24.8]]} in={T_EUROPE + 0.8} dur={1.5} until={B.problem.start} color="#ffd23f" width={7} dashed glow={false} headIcon="ship" headSize={130} />

      {/* ── broke ── */}
      <Character shape={TX} in={B.problem.start} until={B.mexico.start} color={TEX_BLUE} mood="worried" look={[0, 0.4]} arms raise={0} />
      <PropRow at={[-99.6, 35.6]} kind="people" count={5} in={B.debt.start + 0.5} until={B.mexico.start} size={150} />
      <MapProp at={[-97.2, 26.6]} kind="cash" in={B.debt.start + 2.4} until={B.mexico.start} size={220} />

      {/* ── Mexico is not finished ── */}
      <Character shape="mexico" in={B.mexico.start} until={B.ask.start} color={MEX_GREEN} mood="angry" look={[0.5, -0.3]} arms raise={0.35} faceY={-0.12} />
      <Character shape={TX} in={B.mexico.start} until={B.ask.start} color={TEX_BLUE} mood="shocked" look={[0, 0.35]} />

      {/* ── the ask, and the no ── */}
      <Solid shape="usa" color={US_BLUE} in={B.ask.start - 0.2} until={B.yes.start + 0.4} opacity={0.88} />
      <Character shape={TX} in={B.ask.start - 0.1} until={B.no.start + 0.6} color={TEX_BLUE} mood="thinking" look={[0.8, -0.2]} />
      <Character shape="usa" in={B.no.start} until={B.britain.start} color={US_BLUE} mood="smug" look={[-0.7, 0.1]} faceX={0.06} faceY={-0.05} faceScale={0.3} />
      <Character shape={TX} in={B.no.start + 0.7} until={B.britain.start} color={TEX_BLUE} mood="sad" look={[0.2, 0.5]} />

      {/* ── Britain gets interested ── */}
      <Character shape={TX} in={T_ATLANTIC - 0.6} until={B.yes.start} color={TEX_BLUE} mood="happy" look={[0.9, -0.1]} />
      <Route points={[[-84.0, 26.0], [-88.5, 27.4], [-93.2, 28.6]]} in={T_ATLANTIC - 0.5} dur={1.6} until={B.yes.start} color="#c9a4ff" width={8} headIcon="ship" headSize={150} />
      <Character shape="usa" in={T_ATLANTIC + 1.6} until={B.yes.start} color={US_BLUE} mood="shocked" look={[0.6, 0.2]} faceX={0.02} faceY={-0.16} faceScale={0.26} />

      {/* ── it joins ── */}
      <Solid shape="usa" color={US_BLUE} in={B.yes.start} until={B.guess.start} opacity={0.9} />
      <Character shape={TX} in={B.yes.start + 0.3} until={B.guess.start} color={US_BLUE} mood="plain" look={[0, 0]} />
      <Spotlight shape={TX} in={B.yes.start + 1.4} until={B.guess.start} color="#ffd23f" />

      {/* ── the guess ── */}
      <Character shape={TX} in={B.guess.start} until={B.econ.start} color={TEX_BLUE} mood="thinking" look={[0.4, -0.4]} arms raise={0.2} />

      {/* ── bigger than Canada, bigger than Russia ── */}
      <Character shape={TX} in={B.econ.start + 0.2} until={B.oil.start} color={TEX_BLUE} mood="proud" look={[0, 0]} arms raise={0.5} />
      <PropRow at={[-99.4, 35.8]} kind="coin" count={8} in={B.econ.start + 3.4} until={B.oil.start} size={125} step={0.11} />

      {/* ── the oil ── */}
      <Character shape={TX} in={B.oil.start} until={B.people.start} color={TEX_BLUE} mood="smug" look={[0.2, 0]} />
      <MapProp at={[-103.4, 33.4]} kind="derrick" in={B.oil.start + 0.5} until={B.people.start} size={240} />
      <MapProp at={[-97.6, 27.4]} kind="derrick" in={B.oil.start + 0.9} until={B.people.start} size={200} />
      <MapProp at={[-94.4, 33.6]} kind="derrick" in={B.oil.start + 1.3} until={B.people.start} size={200} />
      <PropRow at={[-99.6, 25.4]} kind="barrel" count={10} in={B.oil.start + 3.4} until={B.people.start} size={120} dim={4} />

      {/* ── the people ── */}
      <Character shape={TX} in={B.people.start} until={B.war.start} color={TEX_BLUE} mood="happy" look={[0, 0]} />
      <PropRow at={[-98.6, 35.8]} kind="people" count={6} in={B.people.start + 0.4} until={B.war.start} size={140} />
      <MapProp at={DALLAS} kind="flagpole" in={B.people.start + 2.6} until={B.war.start} size={190} />

      {/* ── the war nobody expects ── */}
      <Character shape={TX} in={B.war.start} until={B.cession.start + 0.6} color={TEX_BLUE} mood="shocked" look={[-0.4, 0.2]} />
      <Solid shape="mexico" color={MEX_GREEN} in={B.war.start + 0.5} until={B.cession.start} opacity={0.9} />
      <MapProp at={[-101.2, 25.2]} kind="star" in={B.war.start + 1.1} until={B.cession.start + 0.6} size={150} />
      <Solid shape="mexico" color={MEX_GREEN} in={B.cession.start} until={B.reveal.start + 0.6} />
      <Route points={[[-99.5, 27.5], [-103.5, 25.5], [-99.1, 19.4]]} in={B.cession.start + 1.6} dur={1.6} until={B.reveal.start + 0.6} color="#ff4b3e" width={9} head="dot" />

      {/* ── the cession, then the twist ── */}
      <Solid shapes={CESSION} color="#e8a33d" in={B.cession.start + 3.4} until={B.reveal.start + 2.6} draw={1.4} />
      <Label at={[-119.4, 37.2]} text="CALIFORNIA" size={46} in={B.cession.start + 4.4} until={B.reveal.start + 2.6} rotate={-62} weight={800} />
      <Solid shapes={WEST_COAST} color="#c8382e" in={B.reveal.start + 2.6} until={END} draw={0.9} />
      <Character shape={TX} in={B.reveal.start + 1.2} until={END} color={TEX_BLUE} mood="smug" look={[-0.8, 0]} />
    </GeoCanvas>
  </AbsoluteFill>
);

import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { GeoCanvas } from "../GeoCanvas";
import { BigNumber, Callout, Captions, Tag } from "../hud";
import { Highlight, Label, Pin, Wash } from "../layers";
import { CameraKey, LonLat } from "../projection";
import { Line, beatsOf } from "../timing";
import timing from "./timing.json";

// ── What if Texas had stayed a country? ───────────────────────────────
//
// ~50 s, 9:16, built to loop. Nine years as a republic, what it claimed,
// why it joined, a guess, and what it would be today — cut on "Texas".
//
//   python3 scripts/make-vo.py geo-texas
//   npm run geo:texas:music

export const TEXAS_FPS = 30;
const LINES = timing as Line[];
export const TEXAS_SECONDS = LINES[LINES.length - 1].end + 0.15;
export const TEXAS_FRAMES = Math.round(TEXAS_SECONDS * TEXAS_FPS);
const B = beatsOf(LINES, TEXAS_SECONDS);
const END = TEXAS_SECONDS + 1;

const AUSTIN: LonLat = [-97.74, 30.27];

/** The Republic's claim: the Rio Grande to its source, due north to 42°,
 *  then the Adams–Onís line back round to the Gulf. Approximate. */
const CLAIM: LonLat[] = [
  [-97.15, 25.95], [-98.5, 26.3], [-99.5, 27.5], [-101.4, 29.7], [-103.0, 29.2], [-104.5, 29.6],
  [-106.5, 31.75], [-106.7, 33.0], [-106.9, 35.1], [-105.95, 36.5], [-105.9, 37.5], [-107.5, 37.75],
  [-107.5, 42.0], [-106.35, 42.0], [-106.35, 39.2], [-105.9, 38.5], [-104.5, 38.3], [-102.0, 38.05],
  [-100.0, 38.0], [-100.0, 34.5], [-98.0, 34.1], [-96.5, 33.8], [-94.0, 33.6], [-94.0, 32.0],
  [-93.7, 31.0], [-93.8, 29.7], [-95.0, 29.0], [-96.5, 28.3],
];

const CESSION = ["state:California", "state:Nevada", "state:Utah", "state:Arizona"];

const CAMERA: CameraKey[] = [
  { at: 0, lon: -99.5, lat: 31.5, scale: 8500 },
  { at: B.republic.start, lon: -99, lat: 32, scale: 8800 },
  { at: B.claim.start, lon: -101, lat: 34, scale: 7600 },
  { at: B.claim.start + 1.5, lon: -102.5, lat: 35.5, scale: 6200 },
  { at: B.broke.start, lon: -101, lat: 33.5, scale: 7000 },
  { at: B.guess.start, lon: -99.5, lat: 31.5, scale: 8500 },
  { at: B.reveal.start + 7.4, lon: -99.5, lat: 31.5, scale: 8600 },
  { at: B.reveal.start + 9.0, lon: -110, lat: 34.5, scale: 5200 },
  { at: END, lon: -111, lat: 34.5, scale: 5000 },
];

export type TexasProps = { music?: string | null; narration?: string | null };

export const TexasShort: React.FC<TexasProps> = ({ music = null, narration = "assets/vo/geo-texas.mp3" }) => (
  <AbsoluteFill>
    {narration ? <Audio src={staticFile(narration)} /> : null}
    {music ? <Audio src={staticFile(music)} /> : null}
    <GeoCanvas
      camera={CAMERA}
      hud={
        <>
          {/* ── the republic ── */}
          <BigNumber text="1836 – 1845" in={B.republic.start + 1.2} until={B.claim.start} y={300} size={104} />
          <Callout text="EMBASSIES IN LONDON AND PARIS" icon="flagpost" in={B.republic.start + 7.4} until={B.claim.start + 0.4} y={450} size={38} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />

          {/* ── broke ── */}
          <Callout text="135,000 PEOPLE" icon="people" in={B.broke.start + 1.4} until={B.guess.start} y={330} size={50} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="$10 MILLION DEBT" icon="coin" in={B.broke.start + 3.4} until={B.guess.start} y={450} size={54} />
          <BigNumber text="1845" in={B.broke.start + 5.4} until={B.guess.start + 0.6} y={1250} size={130} />

          {/* ── guess ── */}
          <BigNumber text="?" in={B.guess.start + 0.2} until={B.reveal.start} y={420} size={260} color="#ffd23f" />
          <Tag text="WHAT WOULD TEXAS BE TODAY?" in={B.guess.start + 1.4} until={B.reveal.start} x={540} y={620} size={34} bg="#e63946" />

          {/* ── the reveal, then the cut ── */}
          <Callout text="8TH LARGEST ECONOMY" sub="bigger than Canada or Russia" icon="coin" in={B.reveal.start + 0.3} until={END} y={300} size={50} />
          <Callout text="31 MILLION PEOPLE" icon="people" in={B.reveal.start + 4.4} until={END} y={450} size={46} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Callout text="40% OF AMERICA'S OIL" icon="gold" in={B.reveal.start + 6.0} until={END} y={560} size={46} font="sans" weight={800} glow="rgba(255,255,255,0.45)" />
          <Tag text="MEXICAN CESSION · 1848" in={B.reveal.start + 10.6} until={END} at={[-114.5, 40.2]} size={30} bg="#e63946" />

          <Captions lines={LINES} />
        </>
      }
    >
      {/* ── the Lone Star ── */}
      <Highlight shape="state:Texas" flag="texas" in={0.3} until={B.broke.start + 5.8} />
      <Label at={[-99.3, 31.3]} text="TEXAS" size={72} in={0.9} until={B.republic.start + 1.6} />

      {/* ── the republic ── */}
      <Pin at={AUSTIN} label="Austin" in={B.republic.start + 3.6} until={B.broke.start} side="right" />

      {/* ── the claim ── */}
      <Wash ring={CLAIM} color="#bf0a30" opacity={0.35} outline="#ffffff" outlineWidth={3} in={B.claim.start + 0.6} until={B.guess.start} dashed draw={1.4} />
      <Label at={[-105.4, 34.4]} text="NEW MEXICO" size={32} in={B.claim.start + 3.6} until={B.guess.start} weight={800} />
      <Label at={[-106.9, 38.9]} text="COLORADO" size={32} in={B.claim.start + 4.6} until={B.guess.start} weight={800} />
      <Label at={[-100.6, 36.3]} text="OKLAHOMA" size={32} in={B.claim.start + 5.4} until={B.guess.start} weight={800} />
      <Label at={[-101.2, 37.7]} text="KANSAS" size={32} in={B.claim.start + 6.0} until={B.guess.start} weight={800} />
      <Label at={[-106.9, 41.6]} text="WYOMING" size={32} in={B.claim.start + 6.6} until={B.guess.start} weight={800} />

      {/* ── it joins: the flag changes ── */}
      <Highlight shape="state:Texas" flag="usa" in={B.broke.start + 6.0} until={B.guess.start + 0.8} />

      {/* ── what it would be: the Lone Star again ── */}
      <Highlight shape="state:Texas" flag="texas" in={B.guess.start + 0.6} until={END} />
      <Wash shapes={CESSION} color="#ff4b3e" opacity={0.45} outline="#ffffff" outlineWidth={2.5} in={B.reveal.start + 9.6} until={END} draw={1.2} />
      <Label at={[-119.6, 37.2]} text="CALIFORNIA" size={44} in={B.reveal.start + 10.0} until={END} rotate={-62} weight={800} />
    </GeoCanvas>
  </AbsoluteFill>
);

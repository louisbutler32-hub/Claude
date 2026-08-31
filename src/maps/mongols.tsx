import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { MapCanvas } from "./MapCanvas";
import { CityMarker, EraChip, LinkLine, MapArrow, MapLabel, Territory } from "./layers";
import { CameraKey } from "./projection";
import { BRIGHT_ATLAS } from "./theme";
import { PerspectiveTitle, makeTitle } from "./titles-bridge";

// ── Why The Mongols Never Conquered Europe ─────────────────────────────
//
// Built to scripts-vo/mongols-europe.md. 35 seconds, one beat per line of
// voiceover, so the numbers below and the numbers in the script are the
// same numbers — retime the read and you retime the map.
//
// Borders are modern outlines standing in for 13th-century ones. At this
// pace that reads fine; the shapes people recognise are Poland and Hungary,
// and both are close enough to their medieval footprint to carry the story.

export const MONGOLS_DURATION_IN_FRAMES = 1050; // 35s @ 30fps

const HORDE = [
  "Mongolia", "China", "Kazakhstan", "Uzbekistan", "Turkmenistan",
  "Kyrgyzstan", "Tajikistan", "Afghanistan", "Iran", "Russia", "Belarus",
  "Ukraine", "Moldova", "Georgia", "Armenia", "Azerbaijan",
];
const POLAND = ["Poland"];
const HUNGARY = ["Hungary", "Slovakia", "Croatia", "Slovenia"];

const KARAKORUM: [number, number] = [102.8, 47.2];

// scale is the world width in px: the frame shows 360*1080/scale degrees of
// longitude. 4000 is continental (~97 deg), 14000 is one country (~28 deg).
const CAMERA: CameraKey[] = [
  { at: 0, lon: 60, lat: 45, scale: 4000 },      // the whole horde
  { at: 3.0, lon: 40, lat: 48, scale: 5200 },
  { at: 4.2, lon: 17.5, lat: 51.4, scale: 16000 },  // Legnica
  { at: 7.0, lon: 18.5, lat: 51.0, scale: 16600 },
  { at: 8.6, lon: 20.9, lat: 48.1, scale: 16000 },  // Mohi
  { at: 11.0, lon: 19.5, lat: 50.4, scale: 19000 },  // both kingdoms
  { at: 14.0, lon: 17.5, lat: 48.6, scale: 14000 }, // the Danube
  { at: 17.5, lon: 15.5, lat: 48.3, scale: 17000 }, // Vienna
  { at: 21.5, lon: 20.0, lat: 49.0, scale: 7000 },  // they leave
  { at: 25.5, lon: 60.0, lat: 47.0, scale: 4000 },  // rip east
  { at: 29.0, lon: 100.0, lat: 47.5, scale: 9000 }, // Karakorum
  { at: 32.0, lon: 98.0, lat: 47.5, scale: 8000 },
  { at: 35, lon: 45.0, lat: 47.0, scale: 3400 },    // out wide
];

export const MongolsEurope: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BRIGHT_ATLAS.seaDeep }}>
    <MapCanvas
      camera={CAMERA}
      theme={BRIGHT_ATLAS}
      hud={
        <EraChip
          steps={[
            { at: 4.0, text: "1241", sub: "Legnica · 9 April" },
            { at: 7.4, text: "1241", sub: "Mohi · 11 April" },
            { at: 11.2, text: "48 HOURS", sub: "Two kingdoms gone" },
            { at: 14.2, text: "WINTER", sub: "The Danube freezes" },
            { at: 22.4, text: "SPRING 1242", sub: "They turn around" },
            { at: 25.6, text: "1241", sub: "11 December · Karakorum" },
            { at: 32.8, text: "1242", sub: "They never came back" },
          ]}
        />
      }
    >
      {/* ── "Europe never beat the Mongols" ── */}
      <Territory countries={HORDE} color="oxblood" in={0.2} draw={1.4} />
      <Territory countries={POLAND} color="indigo" in={1.2} until={5.6} />
      <Territory countries={HUNGARY} color="ochre" in={1.5} until={9.8} />

      {/* ── Legnica: the Polish army, gone in an afternoon ── */}
      <MapArrow from={[24.0, 51.8]} to={[17.4, 51.3]} bow={0.1} in={4.3} dur={0.8} until={11.6} width={18} />
      <CityMarker at={[16.16, 51.21]} name="Legnica" in={4.6} until={11.6} size={14} side="below" />
      <Territory countries={POLAND} color="#8e2a22" in={5.4} draw={0.8} />

      {/* ── Mohi: two days later, four hundred miles south ── */}
      <MapArrow from={[22.6, 49.4]} to={[20.9, 48.1]} bow={-0.16} in={8.7} dur={0.8} until={13.6} width={18} />
      <CityMarker at={[20.98, 48.05]} name="Mohi" in={9.0} until={13.6} size={14} side="right" />
      <Territory countries={HUNGARY} color="#8e2a22" in={9.6} draw={0.8} />

      {/* ── two kingdoms, forty-eight hours ── */}
      <MapLabel at={[19.2, 52.6]} text="POLAND" size={44} in={11.4} until={13.8} bow={18} />
      <MapLabel at={[19.4, 46.9]} text="HUNGARY" size={44} in={11.7} until={13.8} bow={-16} />

      {/* ── across the frozen Danube, fifty km from Vienna ── */}
      <MapArrow from={[19.6, 47.9]} to={[16.2, 48.0]} bow={0.12} in={14.4} dur={0.9} until={22.2} width={16} />
      <MapArrow from={[18.4, 48.9]} to={[16.4, 48.6]} bow={-0.14} in={15.2} dur={0.8} until={22.2} width={14} />
      <CityMarker at={[16.37, 48.21]} name="Vienna" in={17.6} until={23.0} size={16} side="left" />
      <MapArrow from={[16.9, 48.3]} to={[16.25, 47.82]} bow={0.1} in={18.0} dur={0.7} until={22.2} width={13} />

      {/* ── then they just… leave ── */}
      <MapArrow from={[18.0, 48.4]} to={[30.0, 49.5]} bow={-0.12} in={22.3} dur={1.3} until={27.0} width={17} />
      <MapArrow from={[19.0, 51.2]} to={[31.0, 52.5]} bow={0.1} in={22.8} dur={1.3} until={27.0} width={15} />

      {/* ── six thousand kilometres away ── */}
      <CityMarker at={KARAKORUM} name="Karakorum" in={26.4} until={32.6} size={17} side="below" />
      <LinkLine from={[20.0, 49.0]} to={KARAKORUM} bow={-0.18} in={26.8} dur={2.0} color="ochre" width={5} />
      <LinkLine from={[48.0, 41.0]} to={KARAKORUM} bow={0.2} in={27.4} dur={1.7} color="ochre" width={4} />
      <LinkLine from={[75.0, 30.0]} to={KARAKORUM} bow={-0.22} in={27.9} dur={1.6} color="ochre" width={4} />
      <MapLabel at={[102.8, 44.4]} text="THE KHAN IS DEAD" size={40} in={29.2} until={33.4} />

      {/* ── it got lucky ── */}
      <MapLabel at={[24, 44]} text="EUROPE" size={54} in={33.2} bow={14} />
    </MapCanvas>

    {/* hook card */}
    <Sequence from={6} durationInFrames={84}>
      <PerspectiveTitle
        config={makeTitle({
          eyebrow: "1241",
          title: "NOT ONE BATTLE",
          x: 74,
          y: 1580,
          titleSize: 96,
          eyebrowSize: 32,
          eyebrowTracking: 8,
          perspective: 1800,
          rotateX: 4,
          rotateY: -14,
          rotateZ: -1,
          exitStart: 2.4,
        })}
      />
    </Sequence>

    {/* payoff card */}
    <Sequence from={1000}>
      <PerspectiveTitle
        config={makeTitle({
          eyebrow: "EUROPE DIDN'T SURVIVE",
          title: "IT GOT LUCKY",
          x: 74,
          y: 1580,
          titleSize: 104,
          eyebrowSize: 32,
          eyebrowTracking: 8,
          perspective: 1800,
          rotateX: 4,
          rotateY: -14,
          rotateZ: -1,
        })}
      />
    </Sequence>
  </AbsoluteFill>
);

import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { MapCanvas } from "./MapCanvas";
import { BattleMarker, CityMarker, FlagPin, LinkLine, MapArrow, MapLabel, Territory } from "./layers";
import { CameraKey } from "./projection";
import { BRIGHT_ATLAS } from "./theme";

// ── Why The Mongols Never Conquered Europe ─────────────────────────────
//
// Cut to the voiceover in public/assets/vo/mongols.mp3 (29.44s).
//
// The sync is structural: the read was analysed for silences, and the six
// sections below start on its five long pauses, so every camera move and
// territory change lands inside a gap in the narration rather than across a
// word. Section boundaries, from the audio:
//
//   A  0.00 - 2.30   the hook
//   B  2.85 - 5.63   Legnica
//   C  6.29 - 10.95  Mohi, and both kingdoms gone
//   D  11.50 - 18.85 the Danube, Vienna, nothing left to stop them
//   E  19.49 - 24.89 they leave, and the camera goes east
//   F  25.37 - 29.44 the khan is dead
//
// Re-cut for a different read: run the silencedetect pass again, put the new
// section starts here, and move the beats inside each section to match.

export const MONGOLS_DURATION_IN_FRAMES = 890; // 29.67s @ 30fps

const HORDE = [
  "Mongolia", "China", "Kazakhstan", "Uzbekistan", "Turkmenistan",
  "Kyrgyzstan", "Tajikistan", "Afghanistan", "Iran", "Russia", "Belarus",
  "Ukraine", "Moldova", "Georgia", "Armenia", "Azerbaijan",
];
const POLAND = ["Poland"];
const HUNGARY = ["Hungary", "Slovakia", "Croatia", "Slovenia"];

const KARAKORUM: [number, number] = [102.8, 47.2];

// scale is the world width in px: the frame shows 360*1080/scale degrees of
// longitude. 4000 is continental (~97 deg), 16000 is one country (~24 deg).
const CAMERA: CameraKey[] = [
  { at: 0, lon: 60, lat: 45, scale: 4000 },        // A · the whole horde
  { at: 2.4, lon: 40, lat: 48, scale: 5200 },
  { at: 3.4, lon: 17.5, lat: 51.4, scale: 16000 }, // B · Legnica
  { at: 5.8, lon: 18.5, lat: 51.0, scale: 16600 },
  { at: 6.9, lon: 20.9, lat: 48.1, scale: 16000 }, // C · Mohi
  { at: 9.4, lon: 19.5, lat: 50.4, scale: 19000 }, //     both kingdoms
  { at: 11.9, lon: 17.5, lat: 48.6, scale: 14000 },// D · the Danube
  { at: 14.6, lon: 15.5, lat: 48.3, scale: 17000 },//     Vienna
  { at: 19.4, lon: 20.0, lat: 49.0, scale: 7000 }, // E · they leave
  { at: 22.8, lon: 60.0, lat: 47.0, scale: 4000 }, //     rip east
  { at: 25.6, lon: 100.0, lat: 47.5, scale: 9000 },// F · Karakorum
  { at: 27.6, lon: 98.0, lat: 47.5, scale: 8000 },
  { at: 29.7, lon: 45.0, lat: 47.0, scale: 3400 }, //     out wide
];

export const MongolsEurope: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BRIGHT_ATLAS.seaDeep }}>
    <MapCanvas camera={CAMERA} theme={BRIGHT_ATLAS}>
      {/* ── A · the board ── */}
      <Territory countries={HORDE} color="oxblood" in={0.1} draw={1.2} />
      <Territory countries={POLAND} color="indigo" in={0.8} until={4.2} />
      <Territory countries={HUNGARY} color="ochre" in={1.0} until={7.8} />
      <FlagPin at={[48, 50]} flag="mongol" in={0.7} until={3.2} size={78} />
      <FlagPin at={[19.6, 53.4]} flag="piast" in={1.1} until={4.6} size={74} />
      <FlagPin at={[18.6, 46.6]} flag="arpad" in={1.4} until={8.4} size={74} />

      {/* ── B · Legnica, the Polish army gone in an afternoon ── */}
      <MapArrow from={[24.0, 51.8]} to={[17.4, 51.3]} bow={0.1} in={3.0} dur={0.8} until={10.6} width={18} />
      <CityMarker at={[16.16, 51.21]} name="Legnica" in={3.1} until={11.4} size={13} side="left" />
      <BattleMarker at={[16.16, 51.21]} date="9 APRIL 1241" in={3.7} until={11.4} size={54} />
      <Territory countries={POLAND} color="#8e2a22" in={4.1} draw={0.8} />
      <FlagPin at={[19.6, 53.4]} flag="mongol" in={4.7} until={11.4} size={74} />

      {/* ── C · Mohi, two days later ── */}
      <MapArrow from={[22.6, 49.4]} to={[20.9, 48.1]} bow={-0.16} in={6.5} dur={0.8} until={11.4} width={18} />
      <CityMarker at={[20.98, 48.05]} name="Mohi" in={6.6} until={11.4} size={13} side="right" />
      <BattleMarker at={[20.98, 48.05]} date="11 APRIL 1241" in={7.0} until={11.4} size={54} />
      <Territory countries={HUNGARY} color="#8e2a22" in={7.7} draw={0.8} />
      <FlagPin at={[18.6, 46.6]} flag="mongol" in={8.5} until={11.4} size={74} />
      <MapLabel at={[19.2, 52.6]} text="POLAND" size={44} in={9.5} until={11.3} bow={18} />
      <MapLabel at={[19.4, 46.9]} text="HUNGARY" size={44} in={9.8} until={11.3} bow={-16} />

      {/* ── D · across the frozen Danube, fifty km from Vienna ── */}
      <MapArrow from={[19.6, 47.9]} to={[16.2, 48.0]} bow={0.12} in={11.9} dur={0.9} until={19.2} width={16} />
      <MapArrow from={[18.4, 48.9]} to={[16.4, 48.6]} bow={-0.14} in={12.6} dur={0.8} until={19.2} width={14} />
      <FlagPin at={[19.4, 48.9]} flag="mongol" in={12.2} until={19.4} size={70} />
      <CityMarker at={[16.37, 48.21]} name="Vienna" in={13.9} until={19.8} size={15} side="left" />
      <FlagPin at={[12.9, 46.7]} flag="babenberg" in={14.3} until={19.8} size={66} />
      <MapArrow from={[16.9, 48.3]} to={[16.25, 47.82]} bow={0.1} in={15.4} dur={0.7} until={19.2} width={13} />

      {/* ── E · then they just… leave ── */}
      <MapArrow from={[18.0, 48.4]} to={[30.0, 49.5]} bow={-0.12} in={19.6} dur={1.3} until={24.2} width={17} />
      <MapArrow from={[19.0, 51.2]} to={[31.0, 52.5]} bow={0.1} in={20.1} dur={1.3} until={24.2} width={15} />

      {/* ── F · six thousand kilometres away ── */}
      <CityMarker at={KARAKORUM} name="Karakorum" in={23.4} until={28.0} size={17} side="below" />
      <LinkLine from={[20.0, 49.0]} to={KARAKORUM} bow={-0.18} in={23.8} dur={1.8} color="ochre" width={5} />
      <LinkLine from={[48.0, 41.0]} to={KARAKORUM} bow={0.2} in={24.2} dur={1.5} color="ochre" width={4} />
      <LinkLine from={[75.0, 30.0]} to={KARAKORUM} bow={-0.22} in={24.6} dur={1.4} color="ochre" width={4} />
      <FlagPin at={[102.8, 50.6]} flag="mongol" in={23.6} until={25.3} size={96} />
      <FlagPin at={[102.8, 50.6]} flag="mongolBlack" in={25.5} size={96} />

      {/* ── the last wide ── */}
      <MapLabel at={[24, 44]} text="EUROPE" size={54} in={28.2} bow={14} />
    </MapCanvas>

    <Audio src={staticFile("assets/vo/mongols.mp3")} />
  </AbsoluteFill>
);

import React from "react";
import { AbsoluteFill } from "remotion";
import { MapCanvas } from "./MapCanvas";
import { CityMarker, FlagPin, MapArrow, MapLabel, Portrait, Territory } from "./layers";
import { CameraKey, LonLat } from "./projection";
import { BRIGHT_ATLAS } from "./theme";

// ── The Richest Man in History ─────────────────────────────────────────
//
// Built to scripts-vo/mansa-musa.md. 50 seconds, one beat per line, timings
// in seconds and identical to the ones in the script.
//
// The closing image is the Catalan Atlas of 1375 — a Spanish mapmaker who
// had never left Europe drawing Mansa Musa enthroned with a gold nugget.
// It is 14th century and public domain, and it means the video ends on a
// real medieval map.

export const MANSA_DURATION_IN_FRAMES = 1500; // 50s @ 30fps

const MALI = [
  "Mali", "Senegal", "Gambia", "Guinea", "Guinea-Bissau",
  "Burkina Faso", "Mauritania",
];

const NIANI: LonLat = [-8.4, 11.4];
const TIMBUKTU: LonLat = [-3.0, 16.77];
const CAIRO: LonLat = [31.24, 30.04];
const MECCA: LonLat = [39.83, 21.42];

// Gold lands on Cairo in handfuls, scattered so it reads as a pile rather
// than a row. Each one is a beat of the line "he pays whatever he's told".
const COINS: { at: LonLat; in: number; size: number }[] = [
  { at: [30.6, 30.5], in: 20.6, size: 46 },
  { at: [31.9, 30.6], in: 21.4, size: 40 },
  { at: [30.9, 29.6], in: 22.3, size: 44 },
  { at: [32.1, 29.7], in: 23.2, size: 38 },
  { at: [30.2, 29.9], in: 24.4, size: 42 },
  { at: [31.5, 31.0], in: 25.6, size: 36 },
  { at: [32.5, 30.3], in: 26.8, size: 44 },
  { at: [29.9, 30.7], in: 28.0, size: 38 },
  { at: [31.2, 28.9], in: 29.2, size: 46 },
  { at: [32.8, 29.2], in: 30.4, size: 36 },
  { at: [29.6, 29.3], in: 31.6, size: 42 },
  { at: [33.2, 30.8], in: 32.6, size: 34 },
];

// scale is the world width in px: the frame shows 360*1080/scale degrees of
// longitude. 3000 is a hemisphere, 14000 is one country.
const CAMERA: CameraKey[] = [
  { at: 0, lon: -6, lat: 15, scale: 8000 },      // West Africa
  { at: 4.4, lon: -7.6, lat: 13.0, scale: 13000 }, // Niani
  { at: 9.4, lon: 14, lat: 20, scale: 7000 },    // Mali and Mecca in one frame
  { at: 13.0, lon: 8, lat: 19, scale: 7200 },
  { at: 17.5, lon: 10, lat: 22, scale: 7000 },   // the crossing
  { at: 21.0, lon: 28, lat: 28, scale: 9500 },
  { at: 24.5, lon: 31.2, lat: 30.0, scale: 13000 }, // Cairo
  { at: 34.0, lon: 31.4, lat: 30.0, scale: 13600 },
  { at: 38.5, lon: 20, lat: 25, scale: 6600 },   // the road home
  { at: 43.0, lon: 8, lat: 26, scale: 4200 },    // the known world
  { at: 50, lon: 7, lat: 26, scale: 4000 },
];

export const MansaMusa: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BRIGHT_ATLAS.seaDeep }}>
    <MapCanvas camera={CAMERA} theme={BRIGHT_ATLAS}>
      {/* ── he rules Mali, and nobody can count how rich he is ── */}
      <Territory countries={MALI} color="ochre" in={0.2} draw={1.6} />
      <MapLabel at={[-6.5, 15.6]} text="MALI" size={56} in={1.4} until={9.2} bow={12} />
      <CityMarker at={NIANI} name="Niani" in={4.6} until={13.4} size={15} side="below" />

      {/* ── in 1324 he decides to walk to Mecca ── */}
      <CityMarker at={MECCA} name="Mecca" in={9.8} size={16} side="right" />

      {/* ── sixty thousand people, and camels carrying gold ── */}
      <MapArrow from={NIANI} to={TIMBUKTU} bow={-0.14} in={12.4} dur={1.1} until={40.0} width={17} />
      <CityMarker at={TIMBUKTU} name="Timbuktu" in={13.6} until={40.0} size={14} side="above" />

      {/* ── they cross the Sahara ── */}
      <MapArrow from={TIMBUKTU} to={CAIRO} bow={-0.1} in={17.2} dur={3.4} until={40.0} width={19} />
      <CityMarker at={CAIRO} name="Cairo" in={19.8} size={17} side="below" />

      {/* ── he starts giving the gold away ── */}
      {COINS.map((coin, i) => (
        <FlagPin
          key={i}
          at={coin.at}
          flag="gold"
          shape="circle"
          in={coin.in}
          until={41.0}
          size={coin.size}
        />
      ))}

      {/* ── on to Mecca, and then the road home ── */}
      <MapArrow from={CAIRO} to={MECCA} bow={-0.16} in={34.4} dur={1.2} until={41.0} width={15} />
      <MapArrow from={CAIRO} to={[10, 22]} bow={0.12} in={37.8} dur={1.4} until={41.6} width={13} />

      {/* ── fifty years later, a mapmaker in Spain ── */}
      <Portrait
        at={[-19, 31]}
        src="assets/props/catalan-atlas-mansa-musa.jpg"
        in={43.2}
        size={300}
        shape="panel"
      />
    </MapCanvas>
  </AbsoluteFill>
);

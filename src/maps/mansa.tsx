import React from "react";
import { AbsoluteFill } from "remotion";
import { MapCanvas } from "./MapCanvas";
import { CityMarker, FlagPin, MapArrow, MapLabel, Portrait, Territory } from "./layers";
import { CameraKey, LonLat } from "./projection";
import { BRIGHT_ATLAS } from "./theme";

// ── The Richest Man in History ─────────────────────────────────────────
//
// Built to scripts-vo/mansa-musa.md. 33 seconds, one beat per line, timings
// in seconds and identical to the ones in the script.
//
// Cut like a short, not like a documentary: the camera holds, then zooms
// the whole way in about two thirds of a second, and props pop in on the
// word rather than fading. No jump cuts — the travel is always visible.
// The only slow move is the push over the gold, the one beat that should
// feel like it is getting away from you.
//
// The closing image is the Catalan Atlas of 1375 — a Spanish mapmaker who
// had never left Europe drawing Mansa Musa enthroned with a gold nugget.
// 14th century, public domain, so the video ends on a real medieval map.

export const MANSA_DURATION_IN_FRAMES = 990; // 33s @ 30fps

const MALI = [
  "Mali", "Senegal", "Gambia", "Guinea", "Guinea-Bissau",
  "Burkina Faso", "Mauritania",
];

const NIANI: LonLat = [-8.4, 11.4];
const TIMBUKTU: LonLat = [-3.0, 16.77];
const CAIRO: LonLat = [31.24, 30.04];
const MECCA: LonLat = [39.83, 21.42];

// Gold lands on Cairo in handfuls, scattered so it reads as a pile rather
// than a row. Roughly three a second — faster than the ear can count, which
// is the point.
const COINS: { at: LonLat; in: number; size: number }[] = [
  { at: [30.6, 30.9], in: 15.6, size: 46 },
  { at: [31.9, 31.0], in: 16.0, size: 40 },
  { at: [30.9, 30.1], in: 16.5, size: 44 },
  { at: [32.1, 30.2], in: 17.0, size: 38 },
  { at: [30.2, 30.4], in: 17.6, size: 42 },
  { at: [31.5, 31.4], in: 18.2, size: 36 },
  { at: [32.5, 30.7], in: 18.8, size: 44 },
  { at: [29.9, 30.7], in: 19.4, size: 38 },
  { at: [31.2, 29.4], in: 20.0, size: 46 },
  { at: [32.8, 29.7], in: 20.6, size: 36 },
  { at: [29.6, 29.4], in: 21.2, size: 42 },
  { at: [33.2, 31.2], in: 21.8, size: 34 },
  { at: [30.4, 28.9], in: 22.4, size: 40 },
  { at: [32.2, 28.7], in: 23.0, size: 38 },
];

// scale is the world width in px: the frame shows 360*1080/scale degrees of
// longitude. Raking pushes everything away, so these run ~1.6x what a
// top-down camera would need.
//
// No jump cuts. The energy comes from FAST ZOOMS: the camera holds, then
// travels the whole distance in about two thirds of a second and settles.
// That is a `snap` key placed a short interval after the one before it —
// the shorter the gap, the harder the zoom. Long gaps between keys are the
// slow drifts underneath, so the fast moves have something to be fast
// against.
const CAMERA: CameraKey[] = [
  { at: 0, lon: -6, lat: 15, scale: 13000, tilt: 40, bearing: -10 },
  { at: 3.4, lon: -6.3, lat: 14.6, scale: 13800, tilt: 41, bearing: -7, ease: "smooth" },

  // "This is Mansa Musa" — hard zoom down onto Niani
  { at: 4.1, lon: -7.8, lat: 12.6, scale: 22000, tilt: 46, bearing: 0, ease: "snap" },
  { at: 7.4, lon: -7.5, lat: 12.7, scale: 23000, tilt: 46, bearing: 4, ease: "smooth" },

  // "he walks to Mecca" — rip back out so both ends fit
  { at: 8.2, lon: 15, lat: 20, scale: 10500, tilt: 30, bearing: 1, ease: "snap" },
  { at: 11.0, lon: 13, lat: 19.6, scale: 10800, tilt: 33, bearing: 5, ease: "smooth" },

  // the caravan leaves — quick reframe east along the route
  { at: 11.7, lon: 8, lat: 20, scale: 11500, tilt: 37, bearing: 9, ease: "snap" },
  { at: 14.6, lon: 14, lat: 22.5, scale: 12500, tilt: 40, bearing: 13, ease: "smooth" },

  // "In Cairo" — hard zoom onto the city
  { at: 15.3, lon: 31.2, lat: 30.2, scale: 20000, tilt: 45, bearing: 4, ease: "snap" },
  // the one slow move in the video: the push over the gold
  { at: 26.2, lon: 31.6, lat: 30.0, scale: 24000, tilt: 48, bearing: -6, ease: "smooth" },

  // "fifty years later" — pull all the way out to the known world
  { at: 27.2, lon: 6, lat: 26, scale: 5600, tilt: 17, bearing: -3, ease: "snap" },
  { at: 33, lon: 5, lat: 26, scale: 5200, tilt: 14, bearing: 2, ease: "smooth" },
];

export const MansaMusa: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BRIGHT_ATLAS.seaDeep }}>
    <MapCanvas camera={CAMERA} theme={BRIGHT_ATLAS}>
      {/* 0:00 — he rules Mali, and nobody can count how rich he is */}
      <Territory countries={MALI} color="ochre" in={0.2} draw={1.0} />
      <MapLabel at={[-6.5, 15.6]} text="MALI" size={56} in={1.0} until={8.4} bow={12} />

      {/* 0:04 — cut to Niani */}
      <CityMarker at={NIANI} name="Niani" in={4.1} until={11.8} size={15} side="below" />

      {/* 0:08 — Mecca, the far end of the walk */}
      <CityMarker at={MECCA} name="Mecca" in={8.8} until={26.6} size={16} side="right" />

      {/* 0:11 — sixty thousand people, and camels carrying gold */}
      <MapArrow from={NIANI} to={TIMBUKTU} bow={-0.14} in={11.5} dur={0.7} until={26.6} width={17} />
      <CityMarker at={TIMBUKTU} name="Timbuktu" in={12.2} until={26.6} size={14} side="above" />
      <MapArrow from={TIMBUKTU} to={CAIRO} bow={-0.1} in={12.9} dur={1.9} until={26.6} width={19} />

      {/* 0:15 — cut to Cairo, and the gold starts landing */}
      <CityMarker at={CAIRO} name="Cairo" in={15.1} until={26.6} size={17} side="below" />
      {COINS.map((coin, i) => (
        <FlagPin
          key={i}
          at={coin.at}
          flag="gold"
          shape="circle"
          in={coin.in}
          until={26.6}
          size={coin.size}
        />
      ))}

      {/* 0:27 — fifty years later, a mapmaker in Spain */}
      <Portrait
        at={[-19, 31]}
        src="assets/props/catalan-atlas-mansa-musa.jpg"
        in={27.3}
        size={300}
        shape="panel"
      />
    </MapCanvas>
  </AbsoluteFill>
);

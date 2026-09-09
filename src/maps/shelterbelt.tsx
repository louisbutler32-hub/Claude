import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { MapCanvas } from "./MapCanvas";
import { CityMarker, MapLabel, Territory } from "./layers";
import { Graticule, GroundLabel, ScaleBar, TreeBelt } from "./ground";
import { CameraKey, LonLat } from "./projection";
import { TERRAIN } from "./theme";

// ── America Tried To Stop The Weather ──────────────────────────────────
//
// Built to scripts-vo/shelterbelt.md. 58 seconds, one beat per line.
//
// It opens on the answer: the wall draws itself down the map before a word
// of explanation, and only then does the video rewind to 1934 and spend
// thirty seconds earning it.
//
// The 1934 Shelterbelt: the Dust Bowl blows the Plains away, Roosevelt
// answers with a wall of trees a hundred miles wide from Canada to Texas,
// and most of it is still standing.
//
// Cut like a short: the camera holds, then travels the whole distance in
// about two thirds of a second. Props pop on the word.

export const SHELTERBELT_DURATION_IN_FRAMES = 1740; // 58s @ 30fps

// The dry heart of the Plains, drawn by hand — this is a region, not a set
// of countries, so it cannot come from the country data.
const DUST_BOWL: LonLat[] = [
  [-104.0, 49.0], [-96.5, 49.0], [-95.8, 43.0], [-96.4, 39.0],
  [-97.2, 35.0], [-99.0, 32.2], [-103.0, 32.0], [-105.0, 36.5],
  [-105.2, 43.0], [-104.6, 47.0],
];

// The belt itself: about two degrees of longitude, which is roughly the
// hundred miles the project was planned at, from the Canadian line to the
// Texas panhandle.
const BELT: LonLat[] = [
  [-101.4, 48.9], [-99.3, 48.9], [-98.4, 43.0], [-98.0, 39.0],
  [-98.4, 35.2], [-99.2, 34.3], [-101.3, 34.5], [-100.6, 39.0],
  [-101.0, 43.0], [-101.9, 46.0],
];

// The spine the trees are scattered along, north to south.
const BELT_SPINE: LonLat[] = [
  [-100.4, 48.6], [-99.6, 44.5], [-98.9, 40.5], [-99.3, 36.5], [-100.2, 34.6],
];

// China's Three-North Shelterbelt, begun 1978 and still going.
const CHINA_BELT: LonLat[] = [
  [76, 41], [88, 42.5], [100, 40.5], [110, 41.5], [120, 43.5],
];

const NEW_YORK: LonLat = [-74.0, 40.71];
const BISMARCK: LonLat = [-100.78, 46.81];
const AMARILLO: LonLat = [-101.83, 35.22];

// scale is the world width in px. Raked cameras need ~1.6x what a top-down
// one would. ease: `snap` travels fast and settles, `smooth` drifts.
const CAMERA: CameraKey[] = [
  // the wall, before anything is explained
  { at: 0, lon: -98, lat: 44, scale: 5000, tilt: 32, bearing: -5 },
  { at: 4.8, lon: -98.4, lat: 43.4, scale: 5300, tilt: 34, bearing: -2, ease: "smooth" },

  // "it was built to stop the weather"
  { at: 5.6, lon: -99.2, lat: 42.2, scale: 6200, tilt: 37, bearing: 1, ease: "snap" },
  { at: 8.2, lon: -99.0, lat: 42.0, scale: 6400, tilt: 38, bearing: 3, ease: "smooth" },

  // 1934 — dive onto the plains
  { at: 8.9, lon: -99.5, lat: 41.5, scale: 11000, tilt: 43, bearing: 4, ease: "snap" },
  { at: 17.5, lon: -99.0, lat: 40.5, scale: 11800, tilt: 45, bearing: 9, ease: "smooth" },

  // dust reaches New York — rip east
  { at: 18.4, lon: -87, lat: 41.5, scale: 6400, tilt: 30, bearing: -5, ease: "snap" },
  { at: 21.6, lon: -85, lat: 41.2, scale: 6600, tilt: 29, bearing: -8, ease: "smooth" },

  // Roosevelt orders a wall — back to the plains for the title
  { at: 22.3, lon: -99.2, lat: 41.0, scale: 11500, tilt: 44, bearing: 2, ease: "snap" },
  { at: 33.6, lon: -99.6, lat: 42.5, scale: 12600, tilt: 46, bearing: 7, ease: "smooth" },

  // planting: push down the belt as the trees land
  { at: 34.4, lon: -100.3, lat: 46.8, scale: 24000, tilt: 47, bearing: 4, ease: "snap" },
  { at: 47.6, lon: -99.6, lat: 36.2, scale: 25000, tilt: 48, bearing: -4, ease: "smooth" },

  // most of it is still standing — pull all the way out
  { at: 48.4, lon: -98, lat: 41, scale: 5000, tilt: 27, bearing: -1, ease: "snap" },
  { at: 54.2, lon: -97, lat: 41, scale: 5200, tilt: 25, bearing: 2, ease: "smooth" },

  // China started copying it in 1978
  { at: 55.0, lon: 100, lat: 41, scale: 5200, tilt: 32, bearing: 6, ease: "snap" },
  { at: 58, lon: 103, lat: 41, scale: 5400, tilt: 33, bearing: 9, ease: "smooth" },
];

export const Shelterbelt: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: TERRAIN.seaDeep }}>
    <MapCanvas
      camera={CAMERA}
      theme={TERRAIN}
      hud={
        <>
          {/* the title lies on the ground, raking with the terrain */}
          <GroundLabel
            at={[-99.5, 43.5]}
            spanLon={30}
            spanLat={8.5}
            text="GREAT PLAINS SHELTERBELT"
            sub="1934"
            in={22.6}
            until={33.8}
          />
          <GroundLabel
            at={[100, 44.5]}
            spanLon={34}
            spanLat={9}
            text="THREE-NORTH SHELTERBELT"
            sub="1978 —"
            in={55.6}
          />
        </>
      }
    >
      <Graticule step={5} in={0.4} until={54.4} opacity={0.18} />

      {/* the plains are dry country before anything happens to them */}
      <Territory polygon={DUST_BOWL} color="#9a9a63" in={0} draw={0.01} until={54.2} fillOpacity={0.4} />

      {/* 0:00 — the wall itself, drawn before it is explained */}
      <Territory polygon={BELT} color="belt" in={0.3} draw={2.4} until={8.6} fillOpacity={0.55} />
      <MapLabel at={[-97.0, 48.6]} text="CANADA" size={38} in={1.6} until={8.4} />
      <MapLabel at={[-97.4, 33.4]} text="TEXAS" size={38} in={2.6} until={8.4} />

      {/* 0:09 — the plains dry out and start to move */}
      <Territory polygon={DUST_BOWL} color="dust" in={9.0} draw={1.4} until={22.6} />
      <MapLabel at={[-99.6, 45.6]} text="THE GREAT PLAINS" size={44} in={10.0} until={17.8} bow={16} />

      {/* 0:18 — the dust reaches the east coast */}
      <CityMarker at={NEW_YORK} name="New York" in={18.6} until={21.9} size={16} side="right" />

      {/* 0:22 — the wall, this time explained */}
      <Territory polygon={BELT} color="belt" in={26.4} draw={1.2} until={54.2} fillOpacity={0.5} />
      <ScaleBar
        from={[-101.4, 46.2]}
        to={[-99.3, 46.2]}
        label="100 mi"
        sub="160 km"
        in={29.6}
        until={33.8}
      />
      <CityMarker at={BISMARCK} name="North Dakota" in={30.4} until={33.8} size={13} side="left" />
      <CityMarker at={AMARILLO} name="Texas" in={31.6} until={33.8} size={13} side="left" />

      {/* 0:34 — two hundred and twenty million of them, top to bottom */}
      <TreeBelt
        path={BELT_SPINE}
        count={150}
        spread={1.0}
        size={40}
        in={34.6}
        through={47.4}
        until={54.2}
      />

      {/* 0:55 — China is still planting */}
      <Territory countries={["China"]} color="#3f7f3f" in={55.3} draw={1.0} fillOpacity={0.35} />
      <TreeBelt path={CHINA_BELT} count={70} spread={1.4} size={34} in={55.7} through={58} />
    </MapCanvas>

    {/* Synthesised in scripts/build-sfx.mjs — nothing sampled, nothing to
        license. Retime the film by editing the CUES table there. */}
    <Audio src={staticFile("assets/sfx/shelterbelt.mp3")} volume={0.85} />
  </AbsoluteFill>
);

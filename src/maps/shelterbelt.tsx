import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { MapCanvas } from "./MapCanvas";
import { CityMarker, MapLabel, Territory } from "./layers";
import { Graticule, GroundLabel, ScaleBar, TreeBelt } from "./ground";
import { CameraKey, LonLat } from "./projection";
import { TERRAIN } from "./theme";

// ── America Tried To Stop The Weather ──────────────────────────────────
//
// Built to scripts-vo/shelterbelt.md. 56 seconds, one beat per line.
//
// The 1934 Shelterbelt: the Dust Bowl blows the Plains away, Roosevelt
// answers with a wall of trees a hundred miles wide from Canada to Texas,
// and most of it is still standing.
//
// Cut like a short: the camera holds, then travels the whole distance in
// about two thirds of a second. Props pop on the word.

export const SHELTERBELT_DURATION_IN_FRAMES = 1680; // 56s @ 30fps

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
  { at: 0, lon: -98, lat: 42, scale: 5200, tilt: 34, bearing: -6 },
  { at: 4.6, lon: -98.6, lat: 41.6, scale: 5600, tilt: 36, bearing: -3, ease: "smooth" },

  // "1934. The Great Plains are blowing away." — dive onto the plains
  { at: 5.3, lon: -99.5, lat: 41.5, scale: 11000, tilt: 43, bearing: 3, ease: "snap" },
  { at: 14.2, lon: -99.0, lat: 40.5, scale: 11800, tilt: 45, bearing: 8, ease: "smooth" },

  // "Dust storms reach New York" — rip east
  { at: 15.1, lon: -87, lat: 41.5, scale: 6400, tilt: 30, bearing: -5, ease: "snap" },
  { at: 18.2, lon: -85, lat: 41.2, scale: 6600, tilt: 29, bearing: -8, ease: "smooth" },

  // "So Roosevelt orders a wall" — back to the plains for the title
  { at: 19.0, lon: -99.2, lat: 41.0, scale: 11500, tilt: 44, bearing: 2, ease: "snap" },
  { at: 31.4, lon: -99.6, lat: 42.5, scale: 12600, tilt: 46, bearing: 7, ease: "smooth" },

  // planting: push down the belt as the trees land
  { at: 32.2, lon: -100.3, lat: 46.8, scale: 24000, tilt: 47, bearing: 4, ease: "snap" },
  { at: 45.8, lon: -99.6, lat: 36.2, scale: 25000, tilt: 48, bearing: -4, ease: "smooth" },

  // "most of it is still standing" — pull all the way out
  { at: 46.6, lon: -98, lat: 41, scale: 5000, tilt: 27, bearing: -1, ease: "snap" },
  { at: 52.4, lon: -97, lat: 41, scale: 5200, tilt: 25, bearing: 2, ease: "smooth" },

  // "China started copying it in 1978"
  { at: 53.1, lon: 100, lat: 41, scale: 5200, tilt: 32, bearing: 6, ease: "snap" },
  { at: 56, lon: 103, lat: 41, scale: 5400, tilt: 33, bearing: 9, ease: "smooth" },
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
            in={19.4}
            until={31.6}
          />
          <GroundLabel
            at={[100, 44.5]}
            spanLon={34}
            spanLat={9}
            text="THREE-NORTH SHELTERBELT"
            sub="1978 —"
            in={53.6}
          />
        </>
      }
    >
      <Graticule step={5} in={0.4} until={52.6} opacity={0.18} />

      {/* the plains are dry country before anything happens to them */}
      <Territory polygon={DUST_BOWL} color="#9a9a63" in={0} draw={0.01} until={52.4} fillOpacity={0.4} />

      {/* 0:05 — the plains dry out and start to move */}
      <Territory polygon={DUST_BOWL} color="dust" in={5.4} draw={1.4} until={19.2} />
      <MapLabel at={[-99.6, 45.6]} text="THE GREAT PLAINS" size={44} in={6.4} until={14.8} bow={16} />

      {/* 0:15 — the dust reaches the east coast */}
      <CityMarker at={NEW_YORK} name="New York" in={15.3} until={18.8} size={16} side="right" />

      {/* 0:19 — the wall */}
      <Territory polygon={BELT} color="belt" in={23.4} draw={1.2} until={52.4} fillOpacity={0.5} />
      <ScaleBar
        from={[-101.4, 46.2]}
        to={[-99.3, 46.2]}
        label="100 mi"
        sub="160 km"
        in={26.6}
        until={31.6}
      />
      <CityMarker at={BISMARCK} name="North Dakota" in={27.4} until={31.6} size={13} side="left" />
      <CityMarker at={AMARILLO} name="Texas" in={28.6} until={31.6} size={13} side="left" />

      {/* 0:32 — two hundred and twenty million of them, planted top to bottom */}
      <TreeBelt
        path={BELT_SPINE}
        count={150}
        spread={1.0}
        size={40}
        in={32.4}
        through={45.4}
        until={52.4}
      />

      {/* 0:53 — China is still planting */}
      <Territory countries={["China"]} color="#3f7f3f" in={53.4} draw={1.0} fillOpacity={0.35} />
      <TreeBelt path={CHINA_BELT} count={70} spread={1.4} size={34} in={53.8} through={56} />
    </MapCanvas>

    {/* Synthesised in scripts/build-sfx.mjs — nothing sampled, nothing to
        license. Retime the film by editing the CUES table there. */}
    <Audio src={staticFile("assets/sfx/shelterbelt.mp3")} volume={0.85} />
  </AbsoluteFill>
);

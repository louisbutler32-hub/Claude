import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { MapCanvas } from "./MapCanvas";
import { CityMarker, EraChip, FlagPin, MapArrow, MapLabel, Territory, UnitIcon } from "./layers";
import { CameraKey } from "./projection";
import { BRIGHT_ATLAS } from "./theme";
import { PerspectiveTitle } from "../titles/PerspectiveTitle";
import { DOC_LOOK } from "../titles/presets";
import { makeTitle } from "../titles/PerspectiveTitle";

// ── Demo: Europe, 1939–1941 ────────────────────────────────────────────
//
// A worked example of the whole map kit — camera moves, territory fills,
// engraved labels, city markers and offensive arrows, cut to a 22-second
// vertical short. Every beat below is just data; retime or restage it by
// editing the numbers, which are all seconds.
//
// Borders are modern national outlines used as a stand-in for 1939 ones
// (Natural Earth has no historical borders). That reads fine at this zoom
// for arrows and blocs; for period-accurate frontiers, supply your own
// polygons — Territory takes any country set, and the same components draw
// custom GeoJSON if you extend the data build.

export const WW2_DURATION_IN_FRAMES = 660; // 22s @ 30fps

const REICH = ["Germany", "Austria", "Czechia"];
const POLAND = ["Poland"];
const FRANCE = ["France", "Belgium", "Netherlands", "Luxembourg"];
const USSR = ["Russia", "Belarus", "Ukraine", "Estonia", "Latvia", "Lithuania", "Moldova"];
const BRITAIN = ["United Kingdom", "Ireland"];
const ITALY = ["Italy"];

const CAMERA: CameraKey[] = [
  { at: 0, lon: 11, lat: 51.5, scale: 6500 },
  { at: 3.6, lon: 13, lat: 52, scale: 7100 },
  { at: 6.2, lon: 19.6, lat: 52.2, scale: 16500 },
  { at: 9.4, lon: 20.4, lat: 52.3, scale: 17400 },
  { at: 11.8, lon: 3.6, lat: 49.4, scale: 15500 },
  { at: 15.2, lon: 3.0, lat: 49.7, scale: 16400 },
  { at: 18.4, lon: 28.5, lat: 54.0, scale: 6400 },
  { at: 22, lon: 30, lat: 54.2, scale: 6100 },
];

export const WW2Europe: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BRIGHT_ATLAS.seaDeep }}>
    <MapCanvas
      camera={CAMERA}
      theme={BRIGHT_ATLAS}
      hud={
        <EraChip
          steps={[
            { at: 0.4, text: "1939", sub: "Europe on the brink" },
            { at: 4.4, text: "1939", sub: "Invasion of Poland" },
            { at: 10.0, text: "1940", sub: "Fall of France" },
            { at: 16.2, text: "1941", sub: "Operation Barbarossa" },
          ]}
        />
      }
    >
      {/* ── the board, every power in its own colour ── */}
      <Territory countries={REICH} color="oxblood" in={0.4} />
      <Territory countries={POLAND} color="ochre" in={0.8} until={9.6} />
      <Territory countries={FRANCE} color="indigo" in={1.1} until={15.4} />
      <Territory countries={BRITAIN} color="plum" in={1.4} />
      <Territory countries={ITALY} color="teal" in={1.7} />
      <Territory countries={USSR} color="moss" in={2.0} />

      {/* ── conquest: the colour changes hands ── */}
      <Territory countries={POLAND} color="oxblood" in={8.6} draw={0.9} />
      <Territory countries={FRANCE} color="oxblood" in={14.4} draw={0.9} />

      {/* ── flags, pinned to capitals ── */}
      <FlagPin at={[12.0, 53.9]} flag="germany" in={1.2} until={4.4} size={50} />
      <FlagPin at={[22.6, 53.4]} flag="poland" in={1.5} until={4.4} size={50} />
      <FlagPin at={[2.35, 48.86]} flag="france" in={1.8} until={4.4} size={50} />
      <FlagPin at={[-0.13, 51.5]} flag="britain" in={2.1} until={4.4} size={50} offset={[-34, -26]} />
      <FlagPin at={[12.5, 41.9]} flag="italy" in={2.4} until={4.4} size={46} />
      <FlagPin at={[30.5, 56.4]} flag="soviet" in={2.7} until={4.4} size={50} />

      {/* ── the wide establishing beat ── */}
      <MapLabel at={[10.4, 51]} text="GERMANY" size={54} in={1.0} until={4.4} />
      <MapLabel at={[19.6, 52.4]} text="POLAND" size={44} in={1.6} until={4.4} bow={26} />
      <MapLabel at={[2.4, 46.8]} text="FRANCE" size={44} in={2.0} until={4.4} />
      <MapLabel at={[28.5, 58.4]} text="SOVIET UNION" size={42} in={2.4} until={4.4} bow={-24} />

      {/* ── September 1939 ── */}
      <MapLabel at={[17.3, 50.0]} text="POLAND" size={52} in={4.6} until={9.4} bow={22} />
      <CityMarker at={[21.01, 52.23]} name="Warsaw" in={5.0} until={9.4} size={15} />
      <FlagPin at={[17.4, 53.3]} flag="poland" in={4.9} until={8.7} size={64} />
      <FlagPin at={[17.4, 53.3]} flag="germany" in={8.9} until={9.6} size={64} label="OCCUPIED" />
      <MapArrow from={[14.6, 52.3]} to={[20.2, 52.3]} bow={0.1} in={5.2} dur={1.0} until={9.4} />
      <MapArrow from={[19.9, 54.9]} to={[21.0, 52.9]} bow={-0.26} in={5.9} dur={0.9} until={9.4} />
      <MapArrow from={[19.4, 49.0]} to={[20.6, 51.6]} bow={0.22} in={6.6} dur={0.9} until={9.4} />
      <MapArrow
        from={[26.8, 52.4]}
        to={[23.2, 52.3]}
        bow={0.16}
        in={7.7}
        dur={0.9}
        until={9.4}
        color="mossLight"
      />

      {/* ── May 1940 ── */}
      <MapLabel at={[1.9, 46.9]} text="FRANCE" size={62} in={10.6} until={15.0} bow={22} />
      <CityMarker at={[2.35, 48.86]} name="Paris" in={11.2} until={15.4} size={15} side="right" />
      <FlagPin at={[-1.8, 48.4]} flag="france" in={11.0} until={14.5} size={66} />
      <FlagPin at={[-1.8, 48.4]} flag="germany" in={14.7} until={15.4} size={66} label="OCCUPIED" />
      <CityMarker at={[2.38, 51.03]} name="Dunkirk" in={12.8} until={15.4} size={13} side="left" />
      <MapArrow from={[6.8, 50.3]} to={[2.9, 49.2]} bow={0.14} in={11.6} dur={1.0} until={15.4} />
      <MapArrow from={[5.2, 51.6]} to={[2.6, 51.0]} bow={-0.2} in={12.3} dur={0.9} until={15.4} />
      <MapArrow from={[7.6, 48.6]} to={[4.2, 47.4]} bow={0.18} in={13.0} dur={1.0} until={15.4} />

      {/* ── June 1941 ── */}
      <MapLabel at={[44, 59.5]} text="SOVIET UNION" size={50} in={16.8} bow={-20} />
      <MapArrow from={[21.5, 55.6]} to={[30.0, 59.6]} bow={-0.16} in={17.5} dur={1.3} width={19} />
      <MapArrow from={[23.6, 53.6]} to={[37.0, 55.7]} bow={0.12} in={18.0} dur={1.4} width={19} />
      <MapArrow from={[24.2, 50.4]} to={[30.3, 50.5]} bow={0.16} in={18.5} dur={1.2} width={19} />
      <FlagPin at={[41, 56.5]} flag="soviet" in={16.9} size={58} />
      <FlagPin at={[15.5, 51.0]} flag="germany" in={17.2} size={54} />
      <UnitIcon at={[21.4, 56.3]} kind="armour" color="oxblood" label="NORTH" in={17.6} />
      <UnitIcon at={[22.6, 53.2]} kind="armour" color="oxblood" label="CENTRE" in={18.1} />
      <UnitIcon at={[23.4, 49.6]} kind="armour" color="oxblood" label="SOUTH" in={18.6} />
      <CityMarker at={[30.31, 59.94]} name="Leningrad" in={18.9} size={14} side="above" />
      <CityMarker at={[37.62, 55.75]} name="Moscow" in={19.3} size={16} side="right" />
      <CityMarker at={[30.52, 50.45]} name="Kiev" in={19.6} size={14} side="below" />

    </MapCanvas>

    {/* The perspective name card from src/titles, landing on the last beat —
        the two systems share one type identity. */}
    <Sequence from={531}>
      <PerspectiveTitle
        config={makeTitle(DOC_LOOK, {
          eyebrow: "22 JUNE 1941",
          title: "BARBAROSSA",
          x: 74,
          y: 1560,
          titleSize: 112,
          eyebrowSize: 34,
          eyebrowTracking: 8,
          perspective: 1800,
          rotateX: 4,
          rotateY: -14,
          rotateZ: -1,
          color: "#ffffff",
        })}
      />
    </Sequence>
  </AbsoluteFill>
);

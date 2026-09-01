import React, { createContext, useContext, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import europe from "./data/europe.json";
import {
  Camera,
  CameraKey,
  LonLat,
  cameraAt,
  makeProject,
  makeWorldProject,
  toWorld,
} from "./projection";
import { INK_AMBER, MapTheme } from "./theme";

// ── The map ────────────────────────────────────────────────────────────
//
// Coastlines come from Natural Earth (public domain — safe to monetise),
// pre-clipped to the region by scripts/build-map-data.mjs. They are real
// vectors, not a screenshot of somebody's basemap, so they stay sharp at any
// resolution and every colour in the frame is yours to set.
//
// The camera can turn and rake, not just pan and zoom, so every point on
// screen has to run through the projector every frame — a cached transform
// can't do perspective. Coordinates are projected to world space once, up
// front; per frame we only walk those numbers and build path strings.

type Feature = {
  properties: { name: string };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};

const FEATURES = europe.features as unknown as Feature[];

/** Every country as flat [x0,y0,x1,y1,…] rings in world units. Built once. */
const RINGS: Record<string, Float64Array[]> = {};
for (const feature of FEATURES) {
  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates as number[][][]]
      : (feature.geometry.coordinates as number[][][][]);

  const rings: Float64Array[] = [];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      const flat = new Float64Array(ring.length * 2);
      for (let i = 0; i < ring.length; i++) {
        const [x, y] = toWorld(ring[i] as LonLat);
        flat[i * 2] = x;
        flat[i * 2 + 1] = y;
      }
      rings.push(flat);
    }
  }
  RINGS[feature.properties.name] = rings;
}

const ALL_NAMES = Object.keys(RINGS);

const buildPath = (
  rings: Float64Array[],
  project: (x: number, y: number) => [number, number]
): string => {
  let d = "";
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i += 2) {
      const [sx, sy] = project(ring[i], ring[i + 1]);
      d += `${i === 0 ? "M" : "L"}${sx.toFixed(1)} ${sy.toFixed(1)}`;
    }
    d += "Z";
  }
  return d;
};

// ── Context ────────────────────────────────────────────────────────────

type MapContextValue = {
  project: (p: LonLat) => [number, number];
  camera: Camera;
  theme: MapTheme;
  /** seconds into the composition */
  t: number;
  /** this frame's screen-space path for each country */
  paths: Record<string, string>;
};

const MapContext = createContext<MapContextValue | null>(null);

export const useMap = (): MapContextValue => {
  const value = useContext(MapContext);
  if (!value) throw new Error("Map layers must be rendered inside <MapCanvas>");
  return value;
};

/** Screen-space path for a set of countries, this frame. */
export const useCountryPath = (names: string[]): string => {
  const { paths } = useMap();
  return names.map((n) => paths[n] ?? "").join("");
};

// ── Canvas ─────────────────────────────────────────────────────────────

export const MapCanvas: React.FC<{
  camera: CameraKey[] | Camera;
  theme?: MapTheme;
  /** Film grain and a vignette. On by default — it is most of what stops a
   *  vector map looking like a chart. */
  grade?: boolean;
  /** SVG map layers — territories, labels, markers, arrows. */
  children?: React.ReactNode;
  /** HTML layers over the map but still inside the map context. */
  hud?: React.ReactNode;
}> = ({ camera, theme = INK_AMBER, grade = true, children, hud }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const live = Array.isArray(camera) ? cameraAt(camera, t) : camera;

  const { paths, allLand, project } = useMemo(() => {
    const world = makeWorldProject(live, width, height);
    const built: Record<string, string> = {};
    let land = "";
    for (const name of ALL_NAMES) {
      const d = buildPath(RINGS[name], world);
      built[name] = d;
      land += d;
    }
    return {
      paths: built,
      allLand: land,
      project: makeProject(live, width, height),
    };
  }, [live.lon, live.lat, live.scale, live.tilt, live.bearing, width, height]);

  const value: MapContextValue = { project, camera: live, theme, t, paths };
  const raked = (live.tilt ?? 0) > 4;

  return (
    <MapContext.Provider value={value}>
      <AbsoluteFill style={{ backgroundColor: theme.sea }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <radialGradient id="seaLight" cx="50%" cy="38%" r="75%">
              <stop offset="0%" stopColor={theme.sea} />
              <stop offset="100%" stopColor={theme.seaDeep} />
            </radialGradient>
            <linearGradient id="landShade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.landHigh} />
              <stop offset="100%" stopColor={theme.land} />
            </linearGradient>
            <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.seaDeep} stopOpacity="0.55" />
              <stop offset="55%" stopColor={theme.seaDeep} stopOpacity="0.2" />
              <stop offset="100%" stopColor={theme.seaDeep} stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width={width} height={height} fill="url(#seaLight)" />

          {/* a dark rim inside every coastline, so land reads as raised */}
          <path
            d={allLand}
            fill="none"
            stroke={theme.coastGlow}
            strokeWidth={7}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            opacity={0.85}
          />
          <path d={allLand} fill="url(#landShade)" />
          <path
            d={allLand}
            fill="none"
            stroke={theme.border}
            strokeWidth={1.1}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />

          {/* distance haze along the horizon, only when the map is raked */}
          {raked ? (
            <rect width={width} height={height * 0.34} fill="url(#haze)" />
          ) : null}

          {children}
        </svg>

        {hud}
        {grade ? <Grade theme={theme} /> : null}
      </AbsoluteFill>
    </MapContext.Provider>
  );
};

const GRAIN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>" +
      "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/></filter>" +
      "<rect width='180' height='180' filter='url(#n)'/></svg>"
  );

/** Vignette + a static grain wash. Cheap, and it beds the vectors down into
 *  something that reads as footage rather than a diagram. */
const Grade: React.FC<{ theme: MapTheme }> = ({ theme }) => (
  <>
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 78% at 50% 42%, rgba(0,0,0,0) 45%, ${theme.seaDeep} 100%)`,
        pointerEvents: "none",
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN}")`,
        backgroundSize: "180px 180px",
        mixBlendMode: "overlay",
        opacity: 0.22,
        pointerEvents: "none",
      }}
    />
  </>
);

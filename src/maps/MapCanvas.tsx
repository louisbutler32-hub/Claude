import React, { createContext, useContext, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import europe from "./data/europe.json";
import { Camera, CameraKey, LonLat, WORLD, cameraAt, makeProject, toWorld } from "./projection";
import { INK_AMBER, MapTheme } from "./theme";

// ── The map ────────────────────────────────────────────────────────────
//
// Coastlines come from Natural Earth (public domain — safe to monetise),
// pre-clipped to the region by scripts/build-map-data.mjs. They are real
// vectors, not a screenshot of somebody's basemap, so they stay sharp at any
// resolution and every colour in the frame is yours to set.

type Feature = {
  properties: { name: string };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};

const FEATURES = europe.features as unknown as Feature[];

// Project each country once, into world units. Cached for the whole render.
const worldPath = (feature: Feature): string => {
  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates as number[][][]]
      : (feature.geometry.coordinates as number[][][][]);

  const parts: string[] = [];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      let d = "";
      for (let i = 0; i < ring.length; i++) {
        const [x, y] = toWorld(ring[i] as LonLat);
        d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      if (d) parts.push(d + "Z");
    }
  }
  return parts.join("");
};

const PATHS: Record<string, string> = {};
for (const feature of FEATURES) PATHS[feature.properties.name] = worldPath(feature);
const ALL_LAND = Object.values(PATHS).join("");

export const countryPath = (names: string[]): string =>
  names.map((n) => PATHS[n] ?? "").join("");

// ── Context ────────────────────────────────────────────────────────────

type MapContextValue = {
  project: (p: LonLat) => [number, number];
  camera: Camera;
  /** screen px per world unit — use it to keep marker sizes stable */
  k: number;
  theme: MapTheme;
  /** seconds into the composition */
  t: number;
  /** SVG transform that maps world units to the screen — layers that draw
   *  geography (rather than type) wrap themselves in it */
  worldTransform: string;
};

const MapContext = createContext<MapContextValue | null>(null);

export const useMap = (): MapContextValue => {
  const value = useContext(MapContext);
  if (!value) throw new Error("Map layers must be rendered inside <MapCanvas>");
  return value;
};

// ── Canvas ─────────────────────────────────────────────────────────────

export const MapCanvas: React.FC<{
  camera: CameraKey[] | Camera;
  theme?: MapTheme;
  /** Adds film grain and a vignette. On by default — it is most of what
   *  stops a vector map looking like a chart. */
  grade?: boolean;
  /** SVG map layers — territories, labels, markers, arrows. */
  children?: React.ReactNode;
  /** HTML layers drawn over the map but still inside the map context, for
   *  things that are type rather than geography (the era chip, a legend). */
  hud?: React.ReactNode;
}> = ({ camera, theme = INK_AMBER, grade = true, children, hud }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const live = Array.isArray(camera) ? cameraAt(camera, t) : camera;
  const k = live.scale / WORLD;
  const [cx, cy] = toWorld([live.lon, live.lat]);
  const project = useMemo(
    () => makeProject(live, width, height),
    [live.lon, live.lat, live.scale, width, height]
  );

  const transform = `translate(${width / 2 - cx * k} ${height / 2 - cy * k}) scale(${k})`;
  const value: MapContextValue = {
    project,
    camera: live,
    k,
    theme,
    t,
    worldTransform: transform,
  };

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
          </defs>

          <rect width={width} height={height} fill="url(#seaLight)" />

          <g transform={transform}>
            {/* a dark rim inside every coastline, so land reads as raised out
                of the water without an expensive blur filter */}
            <path
              d={ALL_LAND}
              fill="none"
              stroke={theme.coastGlow}
              strokeWidth={7}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              opacity={0.85}
            />
            <path d={ALL_LAND} fill="url(#landShade)" />
            {/* borders and coastline, hairline at any zoom */}
            <path
              d={ALL_LAND}
              fill="none"
              stroke={theme.border}
              strokeWidth={1.1}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </g>

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
        // A tiled turbulence texture. A repeating gradient would moire badly
        // against the pixel grid at this size; a real noise tile does not.
        backgroundImage: `url("${GRAIN}")`,
        backgroundSize: "180px 180px",
        mixBlendMode: "overlay",
        opacity: 0.22,
        pointerEvents: "none",
      }}
    />
  </>
);

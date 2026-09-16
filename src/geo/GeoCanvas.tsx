import React, { createContext, useContext, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Basemap } from "./Basemap";
import { useGeoFonts } from "./fonts";
import {
  CameraKey,
  FlatCamera,
  LonLat,
  Projector,
  cameraAt,
  makeProjector,
} from "./projection";
import { ScreenShape, projectPoint, projectRing, projectShape } from "./shapes";

// ── The canvas ────────────────────────────────────────────────────────
//
// One satellite map, one camera, and three stacks over it:
//
//   children   SVG layers pinned to the ground (highlights, routes, labels)
//   hud        HTML pinned to the screen (callouts, years, captions, panels)
//
// Everything reads the same projector from context, so a label placed in
// lon/lat and a flag clipped to a coastline agree about where a place is.

export const SEA = "#0b2c4f";

type GeoContextValue = {
  t: number;
  camera: FlatCamera;
  proj: Projector;
  width: number;
  height: number;
  shape: (name: string) => ScreenShape;
  ring: (points: LonLat[], close?: boolean) => string;
  point: (p: LonLat) => [number, number];
};

const GeoContext = createContext<GeoContextValue | null>(null);

export const useGeo = (): GeoContextValue => {
  const value = useContext(GeoContext);
  if (!value) throw new Error("geo layers must be rendered inside <GeoCanvas>");
  return value;
};

/** Seconds → the frame-accurate time the whole short runs on. */
export const useSeconds = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

export const GeoCanvas: React.FC<{
  camera: CameraKey[] | FlatCamera;
  children?: React.ReactNode;
  hud?: React.ReactNode;
  /** The colour grade over the satellite. On by default. */
  grade?: boolean;
}> = ({ camera, children, hud, grade = true }) => {
  useGeoFonts();
  const t = useSeconds();
  const { width, height } = useVideoConfig();
  const cam = Array.isArray(camera) ? cameraAt(camera, t) : camera;

  const value = useMemo<GeoContextValue>(() => {
    const proj = makeProjector(cam, width, height);
    const cache = new Map<string, ScreenShape>();
    return {
      t,
      camera: cam,
      proj,
      width,
      height,
      shape: (name) => {
        let s = cache.get(name);
        if (!s) {
          s = projectShape(name, proj);
          cache.set(name, s);
        }
        return s;
      },
      ring: (points, close = true) => projectRing(points, proj, close),
      point: (p) => projectPoint(p, proj),
    };
  }, [cam.lon, cam.lat, cam.scale, width, height, t]);

  return (
    <GeoContext.Provider value={value}>
      <AbsoluteFill style={{ backgroundColor: SEA, overflow: "hidden" }}>
        <Basemap proj={value.proj} scale={cam.scale} />
        {grade ? <Grade scale={cam.scale} /> : null}
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <Defs />
          {children}
        </svg>
        {hud}
      </AbsoluteFill>
    </GeoContext.Provider>
  );
};

/** Shared filters. Ids are global to the document, which is fine: there is
 *  one canvas per composition. */
const Defs: React.FC = () => (
  <defs>
    <filter id="geo-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    <filter id="geo-glow-soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
    <filter id="geo-shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.6" />
    </filter>
    <filter id="geo-ripple" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.011 0.019" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
);

/** The satellite is a little dark and blue for a phone. Lift the sea toward
 *  teal, then a vignette so the middle of the frame is where the light is.
 *  Past the zoom the imagery was made for, the ocean floor texture blows up
 *  into blotches, so a flat sea fades over it. */
const Grade: React.FC<{ scale: number }> = ({ scale }) => (
  <>
    <AbsoluteFill
      style={{
        background: "#17577f",
        opacity: 0.62 * Math.min(1, Math.max(0, (Math.log2(scale) - Math.log2(140000)) / 1.6)),
        pointerEvents: "none",
      }}
    />
    <AbsoluteFill
      style={{
        background: "#2a8ea6",
        mixBlendMode: "screen",
        opacity: 0.16,
        pointerEvents: "none",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(90% 62% at 50% 46%, rgba(0,0,0,0) 48%, rgba(2,12,26,0.55) 100%)",
        pointerEvents: "none",
      }}
    />
  </>
);

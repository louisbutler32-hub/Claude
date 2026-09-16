// ── Flat Mercator camera ──────────────────────────────────────────────
//
// The geo shorts look straight down at a satellite map, so the camera is a
// pan and a zoom and nothing else: one similarity transform from world
// units to screen pixels. World space is the Web Mercator square from
// src/maps/projection (WORLD units wide, 85° to -85°), and the camera
// keyframes and easing are the same, so a camera written for the atlas maps
// reads here unchanged.

import { CameraKey, LonLat, WORLD, cameraAt, toWorld } from "../maps/projection";

export { WORLD, cameraAt, toWorld };
export type { CameraKey, LonLat };

export type FlatCamera = { lon: number; lat: number; scale: number };

export type Projector = {
  /** screen px per world unit */
  k: number;
  /** camera centre, world units */
  cx: number;
  cy: number;
  width: number;
  height: number;
  /** world units → screen */
  world: (wx: number, wy: number) => [number, number];
  /** longitude/latitude → screen */
  point: (p: LonLat) => [number, number];
  /** Which ±360° copy of something centred at world-x `wx` is nearest the
   *  camera. Rings that cross the antimeridian are stored unwrapped past
   *  +180°, so a camera parked over the Bering Strait sees Russia's east
   *  coast by drawing the copy one world to the left. */
  wrap: (wx: number) => number;
  /** metres on the ground per screen pixel at the camera's latitude */
  metresPerPixel: number;
};

const EARTH_CIRCUMFERENCE_M = 40_075_017;

export const makeProjector = (cam: FlatCamera, width: number, height: number): Projector => {
  const k = cam.scale / WORLD;
  const [cx, cy] = toWorld([cam.lon, cam.lat]);
  const world = (wx: number, wy: number): [number, number] => [
    width / 2 + (wx - cx) * k,
    height / 2 + (wy - cy) * k,
  ];
  const cosLat = Math.cos((cam.lat * Math.PI) / 180);
  return {
    k,
    cx,
    cy,
    width,
    height,
    world,
    point: (p) => {
      const [wx, wy] = toWorld(p);
      return world(wx, wy);
    },
    wrap: (wx) => {
      const d = wx - cx;
      return d > WORLD / 2 ? -WORLD : d < -WORLD / 2 ? WORLD : 0;
    },
    metresPerPixel: (EARTH_CIRCUMFERENCE_M * cosLat) / cam.scale,
  };
};

/** World-y fraction (0 at the north edge) → latitude in degrees. */
export const mercLat = (f: number): number =>
  (2 * Math.atan(Math.exp(Math.PI * (1 - 2 * f))) - Math.PI / 2) * (180 / Math.PI);

/** Latitude → world-y fraction. */
export const mercY = (lat: number): number => {
  const phi = (Math.max(-85.0511, Math.min(85.0511, lat)) * Math.PI) / 180;
  return 0.5 - Math.log(Math.tan(Math.PI / 4 + phi / 2)) / (2 * Math.PI);
};

/** The finest tile level at which tiles are still drawn at or below their
 *  native size — the map is always downsampled, never blown up. */
export const tileLevel = (scale: number, tileSize: number, maxZoom: number): number =>
  Math.max(0, Math.min(maxZoom, Math.ceil(Math.log2(scale / tileSize) - 1e-9)));

/** Geodesic distance between two points, km (haversine). Used to label
 *  measures from the coordinates instead of typing the number twice. */
export const distanceKm = (a: LonLat, b: LonLat): number => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// ── Vector shapes ─────────────────────────────────────────────────────
//
// The countries and states a short highlights, from Natural Earth 10m via
// scripts/build-geo-data.mjs. Projected to world units once at load; per
// frame we only run the camera's affine transform over the numbers and
// build path strings for the polygons that are actually on screen.

import raw from "./data/shapes.json";
import { LonLat, Projector, WORLD, toWorld } from "./projection";

type Ring = number[][];
type Polygon = Ring[];

type WorldPolygon = {
  rings: Float64Array[];
  /** world-space bounds: [west, north, east, south] */
  bounds: [number, number, number, number];
  centreX: number;
};

const SHAPES: Record<string, WorldPolygon[]> = {};

const build = (polygons: Polygon[]): WorldPolygon[] =>
  polygons.map((polygon) => {
    let west = Infinity;
    let east = -Infinity;
    let north = Infinity;
    let south = -Infinity;
    const rings = polygon.map((ring) => {
      const flat = new Float64Array(ring.length * 2);
      for (let i = 0; i < ring.length; i++) {
        const [x, y] = toWorld(ring[i] as LonLat);
        flat[i * 2] = x;
        flat[i * 2 + 1] = y;
        if (x < west) west = x;
        if (x > east) east = x;
        if (y < north) north = y;
        if (y > south) south = y;
      }
      return flat;
    });
    return { rings, bounds: [west, north, east, south], centreX: (west + east) / 2 };
  });

const data = raw as unknown as Record<string, Polygon[] | Record<string, Polygon[]>>;
for (const [name, value] of Object.entries(data)) {
  if (name === "states") {
    for (const [state, polygons] of Object.entries(value as Record<string, Polygon[]>)) {
      SHAPES[`state:${state}`] = build(polygons);
    }
  } else {
    SHAPES[name] = build(value as Polygon[]);
  }
}

export const shapeNames = () => Object.keys(SHAPES);

export type ScreenPolygon = {
  d: string;
  /** screen-space bounds [x0, y0, x1, y1] */
  box: [number, number, number, number];
  area: number;
};

export type ScreenShape = {
  /** every visible polygon as one path */
  d: string;
  polygons: ScreenPolygon[];
};

const EMPTY: ScreenShape = { d: "", polygons: [] };

/** A shape as it sits on screen this frame. Polygons off screen are
 *  skipped; polygons that straddle the antimeridian are drawn at whichever
 *  ±360° copy is nearest the camera. */
export const projectShape = (name: string, proj: Projector, margin = 0.6): ScreenShape => {
  const polygons = SHAPES[name];
  if (!polygons) {
    if (typeof console !== "undefined") console.warn(`geo: no shape called "${name}"`);
    return EMPTY;
  }
  const { width, height } = proj;
  const mx = width * margin;
  const my = height * margin;
  const out: ScreenPolygon[] = [];
  let all = "";
  for (const polygon of polygons) {
    const shift = proj.wrap(polygon.centreX);
    const [w, n, e, s] = polygon.bounds;
    const [x0, y0] = proj.world(w + shift, n);
    const [x1, y1] = proj.world(e + shift, s);
    if (x1 < -mx || x0 > width + mx || y1 < -my || y0 > height + my) continue;
    let d = "";
    for (const ring of polygon.rings) {
      for (let i = 0; i < ring.length; i += 2) {
        const [sx, sy] = proj.world(ring[i] + shift, ring[i + 1]);
        d += `${i === 0 ? "M" : "L"}${sx.toFixed(1)} ${sy.toFixed(1)}`;
      }
      d += "Z";
    }
    out.push({ d, box: [x0, y0, x1, y1], area: (x1 - x0) * (y1 - y0) });
    all += d;
  }
  return { d: all, polygons: out };
};

/** A hand-drawn ring in lon/lat → screen path. For regions that are not a
 *  country: a purchase, a park, a stretch of missing road. */
export const projectRing = (ring: LonLat[], proj: Projector, close = true): string => {
  if (ring.length === 0) return "";
  // pick one wrap for the whole ring, off its first point
  const [wx0] = toWorld(ring[0]);
  const shift = proj.wrap(wx0);
  let d = "";
  ring.forEach((p, i) => {
    const [wx, wy] = toWorld(p);
    const [sx, sy] = proj.world(wx + shift, wy);
    d += `${i === 0 ? "M" : "L"}${sx.toFixed(1)} ${sy.toFixed(1)}`;
  });
  return close ? d + "Z" : d;
};

/** Screen-space point with the wrap applied. */
export const projectPoint = (p: LonLat, proj: Projector): [number, number] => {
  const [wx, wy] = toWorld(p);
  return proj.world(wx + proj.wrap(wx), wy);
};

export { WORLD };

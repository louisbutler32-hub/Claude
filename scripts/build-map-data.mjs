// Builds the vector map data the map compositions render.
//
//   node scripts/build-map-data.mjs
//
// Source is Natural Earth (public domain, no attribution required) shipped as
// TopoJSON by the world-atlas package. We decode it, clip it to the region we
// care about, drop precision we can't see, and write plain GeoJSON into
// src/maps/data/ so it is bundled with the render, not fetched at runtime.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

// Which countries to keep: anything whose outline touches this box. Features
// are kept WHOLE — clipping a concave country against a box leaves connecting
// edges along that box (the Sutherland–Hodgman artifact) which fill as bands
// of land across the sea. Simplification, not clipping, is what keeps the
// file small.
const REGION = { west: -30, east: 76, south: 18, north: 84 };

// Douglas–Peucker tolerance in degrees. At our tightest framing one screen
// pixel is about 0.013°, so 0.006° is invisible and roughly halves the file.
const TOLERANCE = 0.006;
const PRECISION = 3; // ~100 m at the equator — far below one screen pixel

// ── TopoJSON → GeoJSON ────────────────────────────────────────────────
// Arcs are delta-encoded integers with a quantisation transform; a ring is a
// list of arc indices, where a negative index means "that arc, reversed".

const decodeArcs = (topology) => {
  const [sx, sy] = topology.transform.scale;
  const [tx, ty] = topology.transform.translate;
  return topology.arcs.map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return [x * sx + tx, y * sy + ty];
    });
  });
};

const ringFrom = (indices, arcs) => {
  const points = [];
  for (const index of indices) {
    const arc = index < 0 ? [...arcs[~index]].reverse() : arcs[index];
    // The joint point is shared between consecutive arcs — drop the repeat.
    points.push(...(points.length ? arc.slice(1) : arc));
  }
  return points;
};

const toGeometry = (geometry, arcs) => {
  if (geometry.type === "Polygon") {
    return { type: "Polygon", coordinates: geometry.arcs.map((r) => ringFrom(r, arcs)) };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geometry.arcs.map((p) => p.map((r) => ringFrom(r, arcs))),
    };
  }
  return null;
};

// ── Simplify ──────────────────────────────────────────────────────────

/** Perpendicular distance from p to the segment a→b. */
const segmentDistance = (p, a, b) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
};

/** Douglas–Peucker, iterative so a 40 000-point coastline can't blow the stack. */
const simplify = (points, tolerance) => {
  if (points.length <= 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let index = -1;
    let worst = tolerance;
    for (let i = first + 1; i < last; i++) {
      const distance = segmentDistance(points[i], points[first], points[last]);
      if (distance > worst) {
        worst = distance;
        index = i;
      }
    }
    if (index !== -1) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  return points.filter((_, i) => keep[i]);
};

const round = (ring) => {
  const out = [];
  for (const [x, y] of ring) {
    const p = [Number(x.toFixed(PRECISION)), Number(y.toFixed(PRECISION))];
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  }
  return out.length >= 4 ? out : null;
};

const bounds = (geometry) => {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  for (const polygon of polygons) {
    for (const [x, y] of polygon[0]) {
      if (x < west) west = x;
      if (x > east) east = x;
      if (y < south) south = y;
      if (y > north) north = y;
    }
  }
  return { west, east, south, north };
};

const intersects = (a, b) =>
  a.west <= b.east && a.east >= b.west && a.south <= b.north && a.north >= b.south;

/** A ring that crosses the antimeridian holds longitudes at both +179 and
 *  -179, so its projected shape spans the entire map and fills the ocean at
 *  its latitudes. Shifting the negative side to +360 makes it continuous;
 *  the far-eastern part then simply projects off the right of frame. */
const unwrapRing = (ring) => {
  let west = Infinity;
  let east = -Infinity;
  for (const [x] of ring) {
    if (x < west) west = x;
    if (x > east) east = x;
  }
  if (east - west <= 180) return ring;
  return ring.map(([x, y]) => [x < 0 ? x + 360 : x, y]);
};

const ringBounds = (ring) => {
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  for (const [x, y] of ring) {
    if (x < west) west = x;
    if (x > east) east = x;
    if (y < south) south = y;
    if (y > north) north = y;
  }
  return { west, east, south, north };
};

const simplifyGeometry = (geometry) => {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const kept = [];
  for (const raw of polygons) {
    const polygon = raw.map(unwrapRing);
    // Per PART, not per country: Russia's Chukotka lobe and similar far-side
    // pieces are dropped here rather than dragging the whole map east.
    if (!intersects(ringBounds(polygon[0]), REGION)) continue;
    const rings = [];
    for (const ring of polygon) {
      const thinned = round(simplify(ring, TOLERANCE));
      // An outer ring that simplified away takes its island with it.
      if (!thinned) {
        if (rings.length === 0) break;
        continue;
      }
      rings.push(thinned);
    }
    if (rings.length) kept.push(rings);
  }
  if (!kept.length) return null;
  return kept.length === 1
    ? { type: "Polygon", coordinates: kept[0] }
    : { type: "MultiPolygon", coordinates: kept };
};

// ── Build ─────────────────────────────────────────────────────────────

const main = async () => {
  process.stdout.write(`fetching ${SOURCE}\n`);
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`source returned ${response.status}`);
  const topology = await response.json();

  const arcs = decodeArcs(topology);
  const features = [];

  for (const geometry of topology.objects.countries.geometries) {
    const full = toGeometry(geometry, arcs);
    if (!full) continue;
    if (!intersects(bounds(full), REGION)) continue;
    const simplified = simplifyGeometry(full);
    if (!simplified) continue;
    features.push({
      type: "Feature",
      properties: { name: geometry.properties.name, id: geometry.id },
      geometry: simplified,
    });
  }

  features.sort((a, b) => a.properties.name.localeCompare(b.properties.name));

  const out = resolve(ROOT, "src/maps/data/europe.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify({ type: "FeatureCollection", features }));

  const kb = (JSON.stringify(features).length / 1024).toFixed(0);
  process.stdout.write(`wrote ${features.length} features (${kb} kB) to ${out}\n`);
};

main().catch((error) => {
  process.stderr.write(String(error?.stack ?? error) + "\n");
  process.exit(1);
});

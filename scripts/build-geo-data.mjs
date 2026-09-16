// Extracts the vector shapes the geo shorts highlight — countries, states,
// the two Diomede islands — from Natural Earth 10m (public domain) and
// writes them, simplified, into src/geo/data/shapes.json so they bundle
// with the render.
//
//   node scripts/build-geo-data.mjs
//
// Source files are the raw GeoJSON from the natural-earth-vector repo,
// cached in .geo/ by scripts/build-geo-basemap.py's neighbour download
// (see src/geo/README.md). Everything here is at 1:10m: the tightest
// framing in a short is ~300 m per pixel, so 0.002° (~200 m) is invisible.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = resolve(ROOT, ".geo");
const OUT = resolve(ROOT, "src/geo/data/shapes.json");

// name → [file, property, value, tolerance in degrees]
const WANT = {
  // admin-0, coarse: these are shown whole, at continental zoom
  usa: ["ne_10m_admin_0_countries.geojson", "NAME", "United States of America", 0.01],
  russia: ["ne_10m_admin_0_countries.geojson", "NAME", "Russia", 0.01],
  france: ["ne_10m_admin_0_countries.geojson", "NAME", "France", 0.01],
  spain: ["ne_10m_admin_0_countries.geojson", "NAME", "Spain", 0.01],
  haiti: ["ne_10m_admin_0_countries.geojson", "NAME", "Haiti", 0.004],
  panama: ["ne_10m_admin_0_countries.geojson", "NAME", "Panama", 0.003],
  colombia: ["ne_10m_admin_0_countries.geojson", "NAME", "Colombia", 0.005],
  argentina: ["ne_10m_admin_0_countries.geojson", "NAME", "Argentina", 0.01],
  canada: ["ne_10m_admin_0_countries.geojson", "NAME", "Canada", 0.01],
  mexico: ["ne_10m_admin_0_countries.geojson", "NAME", "Mexico", 0.01],
  uk: ["ne_10m_admin_0_countries.geojson", "NAME", "United Kingdom", 0.01],
  // Europe, for the what-ifs
  germany: ["ne_10m_admin_0_countries.geojson", "NAME", "Germany", 0.006],
  belgium: ["ne_10m_admin_0_countries.geojson", "NAME", "Belgium", 0.004],
  luxembourg: ["ne_10m_admin_0_countries.geojson", "NAME", "Luxembourg", 0.003],
  netherlands: ["ne_10m_admin_0_countries.geojson", "NAME", "Netherlands", 0.006],
  denmark: ["ne_10m_admin_0_countries.geojson", "NAME", "Denmark", 0.008],
  austria: ["ne_10m_admin_0_countries.geojson", "NAME", "Austria", 0.006],
  switzerland: ["ne_10m_admin_0_countries.geojson", "NAME", "Switzerland", 0.006],
  italy: ["ne_10m_admin_0_countries.geojson", "NAME", "Italy", 0.008],
  poland: ["ne_10m_admin_0_countries.geojson", "NAME", "Poland", 0.008],
  czechia: ["ne_10m_admin_0_countries.geojson", "NAME", "Czechia", 0.008],
  hungary: ["ne_10m_admin_0_countries.geojson", "NAME", "Hungary", 0.008],
  ukraine: ["ne_10m_admin_0_countries.geojson", "NAME", "Ukraine", 0.01],
  belarus: ["ne_10m_admin_0_countries.geojson", "NAME", "Belarus", 0.01],
  lithuania: ["ne_10m_admin_0_countries.geojson", "NAME", "Lithuania", 0.008],
  latvia: ["ne_10m_admin_0_countries.geojson", "NAME", "Latvia", 0.008],
  estonia: ["ne_10m_admin_0_countries.geojson", "NAME", "Estonia", 0.008],
  finland: ["ne_10m_admin_0_countries.geojson", "NAME", "Finland", 0.01],
  sweden: ["ne_10m_admin_0_countries.geojson", "NAME", "Sweden", 0.01],
  norway: ["ne_10m_admin_0_countries.geojson", "NAME", "Norway", 0.01],
  romania: ["ne_10m_admin_0_countries.geojson", "NAME", "Romania", 0.01],
  moldova: ["ne_10m_admin_0_countries.geojson", "NAME", "Moldova", 0.01],
  georgia_country: ["ne_10m_admin_0_countries.geojson", "NAME", "Georgia", 0.01],
  turkey: ["ne_10m_admin_0_countries.geojson", "NAME", "Turkey", 0.01],
  // admin-1, fine: the close-ups
  alaska: ["ne_10m_admin_1_states_provinces.geojson", "name", "Alaska", 0.003],
  chukotka: ["ne_10m_admin_1_states_provinces.geojson", "name", "Chukchi Autonomous Okrug", 0.003],
  louisiana: ["ne_10m_admin_1_states_provinces.geojson", "name", "Louisiana", 0.003],
};

// Every US state, coarse, for the "fifteen states" beat.
const US_STATES = true;

// Douglas–Peucker, iterative.
const segmentDistance = (p, a, b) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
};
const simplify = (points, tolerance) => {
  if (points.length <= 4) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let index = -1;
    let worst = tolerance;
    for (let i = first + 1; i < last; i++) {
      const d = segmentDistance(points[i], points[first], points[last]);
      if (d > worst) {
        worst = d;
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

// Rings that hold longitudes on both sides of the antimeridian (Russia, the
// Aleutians) get their negative side shifted to +360, so they project as one
// shape instead of a band across the whole map. The renderer draws every
// ring at whichever ±360° copy is nearest the camera.
const unwrap = (ring) => {
  let min = Infinity;
  let max = -Infinity;
  for (const [x] of ring) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  if (max - min <= 180) return ring;
  return ring.map(([x, y]) => [x < 0 ? x + 360 : x, y]);
};

const round = (ring) => {
  const out = [];
  for (const [x, y] of ring) {
    const p = [Number(x.toFixed(3)), Number(y.toFixed(3))];
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  }
  return out.length >= 4 ? out : null;
};

const polygons = (geometry) =>
  geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

const convert = (feature, tolerance) => {
  const out = [];
  for (const polygon of polygons(feature.geometry)) {
    const rings = [];
    for (const ring of polygon) {
      const r = round(simplify(unwrap(ring), tolerance));
      if (r) rings.push(r);
    }
    if (rings.length) out.push(rings);
  }
  return out;
};

const files = new Map();
const load = (name) => {
  if (!files.has(name)) files.set(name, JSON.parse(readFileSync(resolve(CACHE, name), "utf8")));
  return files.get(name);
};

const shapes = {};
let points = 0;
for (const [key, [file, prop, value, tol]] of Object.entries(WANT)) {
  const feature = load(file).features.find((f) => f.properties[prop] === value);
  if (!feature) throw new Error(`${value} not found in ${file}`);
  shapes[key] = convert(feature, tol);
  points += shapes[key].flat(2).length;
  console.log(`${key.padEnd(10)} ${shapes[key].length} polygons`);
}
if (US_STATES) {
  const states = {};
  for (const f of load("ne_10m_admin_1_states_provinces.geojson").features) {
    if (f.properties.adm0_a3 !== "USA") continue;
    states[f.properties.name] = convert(f, 0.01);
  }
  shapes.states = states;
  console.log(`states     ${Object.keys(states).length}`);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(shapes));
console.log(`wrote ${OUT} (${(readFileSync(OUT).length / 1024).toFixed(0)} kB, ${points} points)`);

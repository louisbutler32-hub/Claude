// ── Projection and camera ──────────────────────────────────────────────
//
// Coastlines are projected once into a fixed "world" square (Web Mercator,
// WORLD units wide) and cached. The camera is then just an SVG transform on
// that cached geometry, so panning and zooming costs nothing per frame no
// matter how much coastline is on screen.

export type LonLat = [number, number];

export const WORLD = 1000;

export const toWorld = ([lon, lat]: LonLat): [number, number] => {
  const x = ((lon + 180) / 360) * WORLD;
  const clamped = Math.max(Math.min(lat, 85.05), -85.05);
  const phi = (clamped * Math.PI) / 180;
  const y =
    (0.5 - Math.log(Math.tan(Math.PI / 4 + phi / 2)) / (2 * Math.PI)) * WORLD;
  return [x, y];
};

/** `scale` is how many screen px the full world width would occupy, so it
 *  reads like a zoom level: 3000 is continental, 12000 is a country.
 *
 *  `tilt` lays the map down away from the viewer, in degrees: 0 is straight
 *  down, 35-55 is the raked table-map look. `bearing` turns it, in degrees
 *  clockwise. Both default to 0, so a camera written before they existed
 *  behaves exactly as it did. */
export type Camera = {
  lon: number;
  lat: number;
  scale: number;
  tilt?: number;
  bearing?: number;
};

/** How far the eye sits from the map, in screen heights. Lower is a wider
 *  lens and a more aggressive rake. */
const EYE = 2.2;

export type CameraKey = Camera & {
  /** Seconds into the composition at which the camera is exactly here. */
  at: number;
  /** How the camera arrives here.
   *  - `smooth` (default): eases in and out. Documentary drift.
   *  - `snap`: most of the move happens immediately, then settles. Use this
   *    for nearly everything in a short — it reads as energy.
   *  - `cut`: no move at all. Holds the previous frame, then jumps. */
  ease?: "smooth" | "snap" | "cut";
};

const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

/** Camera at time `t`, easing between keys. Zoom interpolates
 *  logarithmically — the way a lens actually moves — so a push from 3000 to
 *  12000 doesn't lurch at the start. */
export const cameraAt = (keys: CameraKey[], t: number): Camera => {
  if (keys.length === 0) return { lon: 0, lat: 0, scale: 3000 };
  if (t <= keys[0].at) return keys[0];
  const last = keys[keys.length - 1];
  if (t >= last.at) return last;

  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].at) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const raw = (t - a.at) / Math.max(b.at - a.at, 1e-6);
  const p =
    b.ease === "cut"
      ? 0 // hold, then jump when the next key becomes current
      : b.ease === "snap"
      ? 1 - Math.pow(1 - Math.min(1, Math.max(0, raw)), 5)
      : easeInOutCubic(raw);

  const lerp = (from: number, to: number) => from + (to - from) * p;
  return {
    lon: lerp(a.lon, b.lon),
    lat: lerp(a.lat, b.lat),
    scale: Math.exp(Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * p),
    tilt: lerp(a.tilt ?? 0, b.tilt ?? 0),
    bearing: lerp(a.bearing ?? 0, b.bearing ?? 0),
  };
};

/** Screen-space projector: world → turned → raked → perspective → screen.
 *
 *  Everything on the map goes through this one function — coastlines,
 *  arrows, labels, shields — so geometry that lies down in perspective and
 *  type that stays upright always agree about where a place is. */
export const makeWorldProject = (
  camera: Camera,
  width: number,
  height: number
): ((wx: number, wy: number) => [number, number]) => {
  const k = camera.scale / WORLD;
  const [cx, cy] = toWorld([camera.lon, camera.lat]);
  const tilt = ((camera.tilt ?? 0) * Math.PI) / 180;
  const bearing = ((camera.bearing ?? 0) * Math.PI) / 180;
  const cosB = Math.cos(bearing);
  const sinB = Math.sin(bearing);
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const eye = height * EYE;

  return (wx: number, wy: number) => {
    const x = (wx - cx) * k;
    const y = (wy - cy) * k;

    // turn
    const xb = x * cosB - y * sinB;
    const yb = x * sinB + y * cosB;

    // rake: ground north of centre falls away from the eye
    const z = yb * sinT;
    // Clamp so geometry near the horizon stretches instead of inverting.
    const denom = Math.max(eye - z, eye * 0.18);
    const s = eye / denom;

    return [width / 2 + xb * s, height / 2 + yb * cosT * s];
  };
};

/** The same projector, addressed in longitude/latitude. Layers use this;
 *  the base map uses the world-space one on its cached geometry. */
export const makeProject = (
  camera: Camera,
  width: number,
  height: number
): ((p: LonLat) => [number, number]) => {
  const world = makeWorldProject(camera, width, height);
  return (p: LonLat) => {
    const [wx, wy] = toWorld(p);
    return world(wx, wy);
  };
};

// ── Curves ─────────────────────────────────────────────────────────────

export type Point = [number, number];

/** Quadratic bezier control point offset perpendicular to a→b. Positive
 *  `bow` bends left of travel, negative right. */
export const bowControl = (a: Point, b: Point, bow: number): Point => {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return [mx + (-dy / len) * bow * len, my + (dx / len) * bow * len];
};

export const quadAt = (a: Point, c: Point, b: Point, t: number): Point => {
  const u = 1 - t;
  return [
    u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
    u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
  ];
};

export const quadTangent = (a: Point, c: Point, b: Point, t: number): Point => {
  const u = 1 - t;
  const x = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]);
  const y = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
  const len = Math.hypot(x, y) || 1;
  return [x / len, y / len];
};

/** A tapered ribbon with an arrowhead, as one filled path — the thing that
 *  makes a map arrow look drawn rather than stroked. `progress` grows the
 *  arrow along its curve. */
export const arrowPath = (
  a: Point,
  b: Point,
  bow: number,
  progress: number,
  opts: { startWidth: number; endWidth: number; headWidth: number; headLength: number }
): string => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.001) return "";

  const c = bowControl(a, b, bow);
  const total = Math.hypot(b[0] - a[0], b[1] - a[1]) * (1 + Math.abs(bow) * 0.6);
  const headT = Math.max(0, 1 - opts.headLength / Math.max(total, 1));

  // The head keeps its shape while the shaft grows behind it.
  const tipT = p;
  const shaftEnd = Math.max(0, tipT - (1 - headT));

  const steps = 26;
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (shaftEnd * i) / steps;
    const pt = quadAt(a, c, b, t);
    const tan = quadTangent(a, c, b, t);
    const n: Point = [-tan[1], tan[0]];
    const w =
      (opts.startWidth + (opts.endWidth - opts.startWidth) * (t / Math.max(shaftEnd, 1e-6))) / 2;
    left.push([pt[0] + n[0] * w, pt[1] + n[1] * w]);
    right.push([pt[0] - n[0] * w, pt[1] - n[1] * w]);
  }

  const tip = quadAt(a, c, b, tipT);
  const tipTan = quadTangent(a, c, b, tipT);
  const tipNormal: Point = [-tipTan[1], tipTan[0]];
  const headScale = Math.min(1, p / 0.12);
  const hw = (opts.headWidth / 2) * headScale;
  const base = quadAt(a, c, b, shaftEnd);

  const d: string[] = [];
  d.push(`M ${left[0][0].toFixed(1)} ${left[0][1].toFixed(1)}`);
  for (const pt of left.slice(1)) d.push(`L ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`);
  d.push(`L ${(base[0] + tipNormal[0] * hw).toFixed(1)} ${(base[1] + tipNormal[1] * hw).toFixed(1)}`);
  d.push(`L ${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`);
  d.push(`L ${(base[0] - tipNormal[0] * hw).toFixed(1)} ${(base[1] - tipNormal[1] * hw).toFixed(1)}`);
  for (const pt of [...right].reverse()) d.push(`L ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`);
  d.push("Z");
  return d.join(" ");
};

// ── Timing ─────────────────────────────────────────────────────────────

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const ramp = (t: number, from: number, to: number) =>
  to === from ? (t >= to ? 1 : 0) : clamp01((t - from) / (to - from));

export const easeOutCubic = (p: number) => 1 - Math.pow(1 - clamp01(p), 3);

/** Fade in at `from`, hold, fade out before `until`. */
export const visibility = (
  t: number,
  from: number,
  until: number | undefined,
  fade = 0.45
): number => {
  const inP = easeOutCubic(ramp(t, from, from + fade));
  if (until === undefined) return inP;
  const outP = easeOutCubic(ramp(t, until, until + fade));
  return inP * (1 - outP);
};

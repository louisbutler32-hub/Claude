import React from "react";
import { H, INK, W } from "../common";

/**
 * The bowling alley, built as a tiny 3D scene and projected into SVG, so every
 * shot of the lane (front, angled, down at the pin deck) is the same room seen
 * from a different camera. Units are metres: x across, y up, z down the lane.
 * Lane 0 runs z 0 → 18.3 with its pins at the far end; neighbouring lanes sit
 * every LANE_PITCH metres either side. Ceiling neon "clouds" are drawn as
 * plane-projected outlines with a blur glow, and mirrored into the glossy lane
 * as blurred reflections.
 */

export type P = [number, number];
export type V3 = [number, number, number];
export type Cam = { x: number; h: number; z: number; yaw: number; f: number; cx: number; cy: number; pitch?: number };

export const LANE_HALF = 0.53;
export const GUTTER = 0.24;
export const LANE_PITCH = 2.05;
export const LANE_END = 18.3;
export const HEAD_PIN = 17.4;
export const CEIL = 3.4;
export const BACK = 19.6;

const toCam = (c: Cam, [X, Y, Z]: V3): V3 => {
  const dx = X - c.x, dy = Y - c.h, dz = Z - c.z;
  const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
  const rx = dx * cy - dz * sy;
  let rz = dx * sy + dz * cy;
  let ry = dy;
  if (c.pitch) {
    const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    const nz = rz * cp + ry * sp;
    ry = -rz * sp + ry * cp;
    rz = nz;
  }
  return [rx, ry, rz];
};
const NEAR = 0.25;
const scr = (c: Cam, [x, y, z]: V3): P => [c.cx + (c.f * x) / z, c.cy - (c.f * y) / z];

export const proj = (c: Cam, p: V3): [number, number, number] => {
  const q = toCam(c, p);
  const s = scr(c, [q[0], q[1], Math.max(q[2], 0.001)]);
  return [s[0], s[1], q[2]];
};

/** a world polygon, near-clipped and projected, as an SVG path ("" when behind the camera) */
export const poly = (c: Cam, pts: V3[]): string => {
  const cam = pts.map((p) => toCam(c, p));
  const out: V3[] = [];
  for (let i = 0; i < cam.length; i++) {
    const a = cam[i], b = cam[(i + 1) % cam.length];
    const ain = a[2] >= NEAR, bin = b[2] >= NEAR;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = (NEAR - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]);
    }
  }
  if (out.length < 2) return "";
  return "M" + out.map((p) => scr(c, p).map((v) => v.toFixed(1)).join(",")).join("L") + "Z";
};
/** an open polyline */
export const line = (c: Cam, pts: V3[]): string => {
  const segs: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const d = poly(c, [pts[i], pts[i + 1]]);
    if (d) segs.push(d.replace("Z", ""));
  }
  return segs.join(" ");
};

/** depth of a world point from the camera (for scaling sprites) */
export const depth = (c: Cam, p: V3) => toCam(c, p)[2];

/** affine matrix taking a w×h local box onto three projected corners (top-left, top-right, bottom-left) */
export const affine = (c: Cam, tl: V3, tr: V3, bl: V3, w: number, h: number) => {
  const a = proj(c, tl), b = proj(c, tr), d = proj(c, bl);
  return `matrix(${(b[0] - a[0]) / w},${(b[1] - a[1]) / w},${(d[0] - a[0]) / h},${(d[1] - a[1]) / h},${a[0]},${a[1]})`;
};

/* --------------------------------- shapes --------------------------------- */

/** the four-lobed neon cloud, as points in a unit box (u across, v deep) */
const CLOUD: P[] = (() => {
  const pts: P[] = [];
  const lobes: [number, number, number][] = [[-0.55, 0, 0.42], [-0.18, -0.32, 0.4], [0.18, -0.32, 0.4], [0.55, 0, 0.42], [0.18, 0.32, 0.4], [-0.18, 0.32, 0.4]];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    let best = 0;
    for (const [lx, ly, r] of lobes) {
      // ray from centre: distance to the far side of each lobe circle
      const dx = Math.cos(a), dy = Math.sin(a);
      const bq = dx * lx + dy * ly;
      const cq = lx * lx + ly * ly - r * r;
      const disc = bq * bq - cq;
      if (disc > 0) best = Math.max(best, bq + Math.sqrt(disc));
    }
    pts.push([Math.cos(a) * best, Math.sin(a) * best]);
  }
  return pts;
})();

export const NEON = {
  red: { core: "#ffd2d6", glow: "#ff2448" },
  blue: { core: "#d8e4ff", glow: "#2f5bff" },
  pink: { core: "#ffd6f4", glow: "#ff38c8" },
  cyan: { core: "#dbffff", glow: "#21c8ff" },
  orange: { core: "#ffe9c4", glow: "#ff8a1c" },
  purple: { core: "#eedcff", glow: "#a24bff" },
  lime: { core: "#f3ffd0", glow: "#9cff2e" },
};
export type NeonKey = keyof typeof NEON;

/** the shared glow filters (defined once per SVG) */
export const GlowDefs: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <>
    <filter id="glowS" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={4 * k} result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="glowL" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={14 * k} result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="blurR" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={16 * k} /></filter>
    <filter id="blurXL" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={26 * k} /></filter>
  </>
);

/* ------------------------------ comic panels ------------------------------ */

const burst = (cx: number, cy: number, r0: number, r1: number, n: number, seed = 1) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 + 0.2;
    const j = 1 + 0.18 * Math.sin(i * 7.3 + seed);
    const r = i % 2 === 0 ? r1 * j : r0;
    pts.push(`${(cx + Math.cos(a) * r * 1.35).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return "M" + pts.join("L") + "Z";
};
const bolt = (x: number, y: number, s: number, flip = 1) =>
  `M${x},${y} l${22 * s * flip},${-30 * s} l${-6 * s * flip},${24 * s} l${26 * s * flip},${-18 * s} l${-14 * s * flip},${40 * s} l${6 * s * flip},${-22 * s} l${-30 * s * flip},${16 * s}Z`;

/** the comic "STRIKE!" burst panel, 400×220 local units */
export const StrikePanel: React.FC = () => (
  <g>
    <rect x={0} y={0} width={400} height={220} fill="#2a1d8f" />
    {/* painted wall texture: purple/blue cloud blobs */}
    {[[40, 40, 60, "#5a2bc9"], [360, 60, 70, "#3b2cd0"], [60, 190, 70, "#7a2fd6"], [350, 190, 60, "#2140c8"], [200, 20, 50, "#4b2ec4"]].map(([x, y, r, c], i) => (
      <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={c as string} opacity={0.85} />
    ))}
    {/* orange/yellow lightning fringe */}
    {[[30, 140, 1.2, 1], [60, 90, 1.0, 1], [350, 110, 1.3, -1], [380, 170, 1.0, -1], [330, 60, 0.9, -1], [50, 200, 0.9, 1]].map(([x, y, s, fl], i) => (
      <path key={i} d={bolt(x, y, s * 1.4, fl)} fill={i % 2 ? "#ffcc1a" : "#ff6a14"} stroke="#7a1d00" strokeWidth={2} />
    ))}
    <path d={burst(200, 112, 62, 102, 14, 2)} fill="#ff2e63" stroke="#4a0820" strokeWidth={4} />
    <path d={burst(200, 112, 50, 80, 14, 5)} fill="#ff5a8a" />
    <g transform="rotate(-10 200 112)">
      <text x={200} y={134} textAnchor="middle" fontFamily="Poppins Black" fontSize={64} fill="#9ef02a" stroke="#1d2a08" strokeWidth={12} paintOrder="stroke" strokeLinejoin="round" letterSpacing={-1}>STRIKE!</text>
      <text x={200} y={134} textAnchor="middle" fontFamily="Poppins Black" fontSize={64} fill="none" stroke="#e8ff9a" strokeWidth={1.5} opacity={0.6}>STRIKE!</text>
    </g>
    <rect x={0} y={0} width={400} height={220} fill="none" stroke="#0c0820" strokeWidth={6} />
  </g>
);

/** a neon word sign: text with a glow; local origin at the text centre */
export const NeonText: React.FC<{ text: string; color: NeonKey; size: number; x?: number; y?: number; lines?: string[] }> = ({ text, color, size, x = 0, y = 0, lines }) => {
  const n = NEON[color];
  const ls = lines ?? [text];
  return (
    <g>
      {ls.map((t, i) => (
        <g key={i}>
          <text x={x} y={y + i * size * 1.05} textAnchor="middle" fontFamily="Poppins Black" fontSize={size} fill="none" stroke={n.glow} strokeWidth={size * 0.16} filter="url(#glowS)">{t}</text>
          <text x={x} y={y + i * size * 1.05} textAnchor="middle" fontFamily="Poppins Black" fontSize={size} fill="none" stroke={n.core} strokeWidth={size * 0.05}>{t}</text>
        </g>
      ))}
    </g>
  );
};

/* --------------------------------- pins ----------------------------------- */

const PIN_PATH = "M0,-38 C5,-38 6,-33 5.5,-29 C5,-25 3.4,-23 3.6,-20 C4,-15 9,-10 9.6,-4 C10.2,2 7,4 6,6 L-6,6 C-7,4 -10.2,2 -9.6,-4 C-9,-10 -4,-15 -3.6,-20 C-3.4,-23 -5,-25 -5.5,-29 C-6,-33 -5,-38 0,-38Z";
/** one pin, 38 units tall from base; `tint` lets the blue-lit shots stain them */
export const Pin: React.FC<{ x: number; y: number; s: number; rot?: number; tint?: string; lw?: number }> = ({ x, y, s, rot = 0, tint = "#f7f5f2", lw = 1.2 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d={PIN_PATH} transform="translate(0,-6)" fill={tint} stroke={INK} strokeWidth={lw / s} />
    <path d="M3,-35 C5,-33 5,-30 4,-27 C3,-24 2.5,-22 3,-20 C5,-14 8.5,-9 8.6,-4 C8.6,1 6,3 5,4 L2,4 C5,0 5,-8 2,-20 C1,-25 3,-30 3,-35Z" transform="translate(0,-6)" fill="#000" opacity={0.18} />
    <rect x={-4.4} y={-31} width={8.8} height={1.6} fill="#e3233a" />
    <rect x={-4.2} y={-28.6} width={8.4} height={1.6} fill="#e3233a" />
  </g>
);

/** pin positions in the triangle (x, z) on lane 0 */
export const PIN_SPOTS: [number, number][] = (() => {
  const out: [number, number][] = [];
  const sp = 0.305;
  for (let row = 0; row < 4; row++) for (let k = 0; k <= row; k++) out.push([(k - row / 2) * sp, HEAD_PIN + row * sp * 0.866]);
  return out;
})();

/* --------------------------------- balls ---------------------------------- */

export const BALL = {
  red: ["#e8343a", "#a51a26", "#ff8f8a"],
  yellow: ["#e9f23a", "#b3b80e", "#fbffb0"],
  purple: ["#4a2466", "#2c1240", "#7a4f9a"],
  pink: ["#ec2d8c", "#a3165c", "#ff86c3"],
  lime: ["#93e82c", "#5fa816", "#d4ff8a"],
  magenta: ["#ee3c9a", "#a81c66", "#ff9ccd"],
} as const;
export type BallKey = keyof typeof BALL;

/** a flat cel bowling ball: base, one hard shadow crescent, a highlight, thick outline */
export const Ball: React.FC<{ x: number; y: number; r: number; c: BallKey; lw?: number; holes?: boolean; spin?: number; shade?: boolean }> = ({ x, y, r, c, lw, holes = false, spin = 0, shade = true }) => {
  const [base, dark, hi] = BALL[c];
  const w = lw ?? Math.max(2.5, r * 0.07);
  const id = `bc${c}${Math.round(x)}${Math.round(y)}${Math.round(r)}`;
  return (
    <g>
      <defs><clipPath id={id}><circle cx={x} cy={y} r={r} /></clipPath></defs>
      <circle cx={x} cy={y} r={r} fill={base} />
      {shade && <g clipPath={`url(#${id})`}><circle cx={x - r * 0.32} cy={y - r * 0.3} r={r * 1.12} fill="none" stroke={dark} strokeWidth={r * 0.5} /></g>}
      {shade && <ellipse cx={x - r * 0.38} cy={y - r * 0.42} rx={r * 0.2} ry={r * 0.12} transform={`rotate(-35 ${x - r * 0.38} ${y - r * 0.42})`} fill={hi} opacity={0.8} />}
      {holes && (
        <g transform={`rotate(${spin} ${x} ${y})`}>
          <circle cx={x + r * 0.1} cy={y - r * 0.28} r={r * 0.08} fill={INK} opacity={0.75} />
          <circle cx={x + r * 0.32} cy={y - r * 0.16} r={r * 0.08} fill={INK} opacity={0.75} />
          <circle cx={x + r * 0.2} cy={y + r * 0.12} r={r * 0.09} fill={INK} opacity={0.75} />
        </g>
      )}
      <circle cx={x} cy={y} r={r} fill="none" stroke={INK} strokeWidth={w} />
    </g>
  );
};

/* --------------------------------- the alley ---------------------------------- */

type AlleyProps = {
  cam: Cam;
  /** stain the lane blue (the pin-deck close shots) */
  blueLane?: boolean;
  pins?: { fallen?: number[]; t?: number; scatter?: number };
  /** extra 3D-anchored content drawn after the lanes (balls etc.) */
  children?: React.ReactNode;
  lanes?: number[];
  dim?: number;
  /** turn the far end into a short-throw pin deck with a big STRIKE panel */
  bigPanel?: boolean;
};

const CLOUD_ROWS = (() => {
  const out: { x: number; z: number; c: NeonKey; s: number }[] = [];
  const cols: [number, NeonKey[]][] = [
    [0, ["red", "pink", "red"]], [-1.25, ["blue"]], [1.25, ["blue"]], [-2.6, ["red", "blue"]], [2.6, ["red", "blue"]], [-3.9, ["blue"]], [3.9, ["blue"]], [-5.2, ["red"]], [5.2, ["red"]],
  ];
  for (let i = 0; i < 11; i++) {
    const z = 1.6 + i * 1.75;
    for (const [x, cs] of cols) out.push({ x, z, c: cs[i % cs.length], s: x === 0 ? 0.44 : 0.36 });
  }
  return out;
})();

const cloudPts = (cx: number, y: number, cz: number, s: number, mirror = false): V3[] =>
  CLOUD.map(([u, v]) => [cx + u * s, mirror ? -y : y, cz + v * s * 0.9] as V3);

/** the whole room for one camera */
export const Alley: React.FC<AlleyProps> = ({ cam, blueLane = false, pins, children, lanes = [-2, -1, 0, 1, 2], dim = 0, bigPanel = false }) => {
  const c = cam;
  const pl = (pts: V3[]) => poly(c, pts);
  const laneX = (k: number) => k * LANE_PITCH;
  const zEnd = LANE_END;
  // floor reflection clip: the union of the lane surfaces
  const laneSurf = lanes.map((k) => pl([[laneX(k) - LANE_HALF, 0, 0], [laneX(k) + LANE_HALF, 0, 0], [laneX(k) + LANE_HALF, 0, zEnd], [laneX(k) - LANE_HALF, 0, zEnd]]));
  const fallen = new Set(pins?.fallen ?? []);
  const pinT = pins?.t ?? 0;
  const scatter = pins?.scatter ?? 0;
  const woodNear = blueLane ? "#1f2fd8" : "#7a3a22";
  const woodFar = blueLane ? "#0d0f6a" : "#2a1020";

  const reflClouds = CLOUD_ROWS.filter((k) => depth(c, [k.x, CEIL, k.z]) > 0.6);
  const clouds = reflClouds.filter((k) => depth(c, [k.x, CEIL, k.z]) > 2.2);
  const panelY0 = 1.05, panelY1 = bigPanel ? 2.95 : 2.55;
  const panelHalf = bigPanel ? 1.55 : 1.15;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <GlowDefs />
        <linearGradient id="alleyBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0820" />
          <stop offset="0.45" stopColor="#1a1036" />
          <stop offset="1" stopColor="#07050f" />
        </linearGradient>
        <linearGradient id="woodG" gradientUnits="userSpaceOnUse" x1="0" y1={c.cy} x2="0" y2={H}>
          <stop offset="0" stopColor={woodFar} />
          <stop offset="0.5" stopColor={blueLane ? "#1520a8" : "#4e2218"} />
          <stop offset="1" stopColor={woodNear} />
        </linearGradient>
        <clipPath id="laneClip">{laneSurf.map((d, i) => <path key={i} d={d} />)}</clipPath>
      </defs>
      <rect width={W} height={H} fill="url(#alleyBg)" />

      {/* ceiling structure */}
      <g stroke="#2a2350" strokeWidth={3} opacity={0.9} fill="none">
        {[-6, -4.6, -3.25, -1.9, -0.65, 0.65, 1.9, 3.25, 4.6, 6].map((x) => <path key={x} d={line(c, [[x, CEIL, 0.3], [x, CEIL, BACK]])} />)}
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={line(c, [[-7, CEIL, 1 + i * 2.15], [7, CEIL, 1 + i * 2.15]])} strokeWidth={2} />)}
      </g>
      {/* screens hanging over the lanes */}
      {lanes.map((k) => {
        const x = laneX(k), z = 15.5;
        return <path key={`scr${k}`} d={pl([[x - 0.7, 3.0, z], [x + 0.7, 3.0, z], [x + 0.7, 2.45, z], [x - 0.7, 2.45, z]])} fill="#141a30" stroke="#2c3560" strokeWidth={2} />;
      })}

      {/* back wall */}
      <path d={pl([[-8, 0, BACK], [8, 0, BACK], [8, CEIL, BACK], [-8, CEIL, BACK]])} fill="#1b1033" />
      {/* side walls with arcade cabinets */}
      {[-1, 1].map((side) => (
        <g key={side}>
          <path d={pl([[side * 6.4, 0, 0.3], [side * 6.4, 0, BACK], [side * 6.4, CEIL, BACK], [side * 6.4, CEIL, 0.3]])} fill="#160d2a" />
          {Array.from({ length: 8 }, (_, i) => {
            const z0 = 3 + i * 2, x = side * 6.3, xf = side * 5.6;
            const col = (["#ff3fb8", "#3f7bff", "#ffb02e", "#ae4bff"] as const)[(i + (side > 0 ? 1 : 0)) % 4];
            return (
              <g key={i}>
                <path d={pl([[xf, 0, z0], [xf, 0, z0 + 1.3], [xf, 1.9, z0 + 1.3], [xf, 1.9, z0]])} fill="#251640" stroke="#0a0614" strokeWidth={2} />
                <path d={pl([[xf, 1.0, z0 + 0.2], [xf, 1.0, z0 + 1.1], [xf, 1.6, z0 + 1.1], [xf, 1.6, z0 + 0.2]])} fill={col} opacity={0.85} filter="url(#glowS)" />
                <path d={pl([[xf, 1.72, z0 + 0.1], [xf, 1.72, z0 + 1.2], [xf, 1.86, z0 + 1.2], [xf, 1.86, z0 + 0.1]])} fill="#ffe36a" opacity={0.8} />
                <path d={pl([[x, 0.02, z0], [xf, 0.02, z0], [xf, 0.02, z0 + 1.3], [x, 0.02, z0 + 1.3]])} fill={col} opacity={0.12} />
              </g>
            );
          })}
        </g>
      ))}
      {/* arcade row on the back wall */}
      {[-6.2, -5.1, -4, -2.9, 2.9, 4, 5.1, 6.2].map((x, i) => {
        const col = (["#ff3fb8", "#3f7bff", "#ffb02e", "#ae4bff", "#3fd8ff"] as const)[i % 5];
        return (
          <g key={`ab${i}`}>
            <path d={pl([[x - 0.45, 0, BACK - 0.6], [x + 0.45, 0, BACK - 0.6], [x + 0.45, 1.9, BACK - 0.6], [x - 0.45, 1.9, BACK - 0.6]])} fill="#2a1a46" stroke="#0a0614" strokeWidth={1.5} />
            <path d={pl([[x - 0.34, 1.0, BACK - 0.62], [x + 0.34, 1.0, BACK - 0.62], [x + 0.34, 1.55, BACK - 0.62], [x - 0.34, 1.55, BACK - 0.62]])} fill={col} filter="url(#glowS)" />
            <path d={pl([[x - 0.4, 1.68, BACK - 0.62], [x + 0.4, 1.68, BACK - 0.62], [x + 0.4, 1.84, BACK - 0.62], [x - 0.4, 1.84, BACK - 0.62]])} fill="#ffe8a0" opacity={0.85} />
          </g>
        );
      })}
      {/* wall signs */}
      <g transform={affine(c, [-4.6, 2.75, BACK - 0.1], [-2.8, 2.75, BACK - 0.1], [-4.6, 2.2, BACK - 0.1], 360, 110)}>
        <NeonText text="ARCADE" color="pink" size={78} x={180} y={82} />
      </g>
      <g transform={affine(c, [-2.6, 2.75, BACK - 0.1], [-1.9, 2.75, BACK - 0.1], [-2.6, 2.2, BACK - 0.1], 140, 110)}>
        <rect x={20} y={20} width={100} height={64} rx={30} fill="none" stroke={NEON.blue.glow} strokeWidth={9} filter="url(#glowS)" />
        <rect x={20} y={20} width={100} height={64} rx={30} fill="none" stroke={NEON.blue.core} strokeWidth={3} />
      </g>
      <g transform={affine(c, [2.05, 2.85, BACK - 0.1], [3.1, 2.85, BACK - 0.1], [2.05, 1.95, BACK - 0.1], 200, 170)}>
        <NeonText text="" lines={["BOWL", "YOUR", "GAME!"]} color="cyan" size={44} x={100} y={50} />
      </g>
      <g transform={affine(c, [3.6, 2.8, BACK - 0.1], [5.8, 2.8, BACK - 0.1], [3.6, 2.3, BACK - 0.1], 440, 100)}>
        <NeonText text="SNACKS & DRINKS" color="orange" size={56} x={220} y={70} />
      </g>

      {/* the STRIKE panel above lane 0's pin deck */}
      <g transform={affine(c, [-panelHalf, panelY1, BACK - 0.15], [panelHalf, panelY1, BACK - 0.15], [-panelHalf, panelY0, BACK - 0.15], 400, 220)}>
        <StrikePanel />
      </g>
      {/* pin-deck masking + pit openings for each lane */}
      {lanes.map((k) => {
        const x = laneX(k);
        return (
          <g key={`pit${k}`}>
            <path d={pl([[x - 0.95, 0, BACK - 0.2], [x + 0.95, 0, BACK - 0.2], [x + 0.95, 0.95, BACK - 0.2], [x - 0.95, 0.95, BACK - 0.2]])} fill="#05040c" />
            <path d={pl([[x - 0.95, 0.95, BACK - 0.2], [x + 0.95, 0.95, BACK - 0.2], [x + 0.95, 1.05, BACK - 0.2], [x - 0.95, 1.05, BACK - 0.2]])} fill="#2b2a5a" />
            {k !== 0 && <path d={pl([[x - 0.8, 1.05, BACK - 0.2], [x + 0.8, 1.05, BACK - 0.2], [x + 0.8, 1.9, BACK - 0.2], [x - 0.8, 1.9, BACK - 0.2]])} fill="#25184a" />}
            <path d={pl([[x - LANE_HALF, 0.001, zEnd], [x + LANE_HALF, 0.001, zEnd], [x + LANE_HALF, 0.001, BACK - 0.2], [x - LANE_HALF, 0.001, BACK - 0.2]])} fill={blueLane ? "#2a3dd8" : "#3a2a3a"} />
          </g>
        );
      })}

      {/* floor between/around lanes */}
      <path d={pl([[-8, 0, 0], [8, 0, 0], [8, 0, BACK], [-8, 0, BACK]])} fill="#120a1e" />
      {/* the lanes */}
      {lanes.map((k) => {
        const x = laneX(k);
        const gl = x - LANE_HALF - GUTTER, gr = x + LANE_HALF + GUTTER;
        return (
          <g key={`lane${k}`}>
            {/* capping between lanes */}
            <path d={pl([[gl - 0.28, 0.06, 0], [gl, 0.06, 0], [gl, 0.06, zEnd], [gl - 0.28, 0.06, zEnd]])} fill="#1a1440" />
            <path d={pl([[gr, 0.06, 0], [gr + 0.28, 0.06, 0], [gr + 0.28, 0.06, zEnd], [gr, 0.06, zEnd]])} fill="#1a1440" />
            {/* gutters */}
            <path d={pl([[gl, -0.05, 0], [x - LANE_HALF, -0.05, 0], [x - LANE_HALF, -0.05, zEnd], [gl, -0.05, zEnd]])} fill="#0a0820" />
            <path d={pl([[x + LANE_HALF, -0.05, 0], [gr, -0.05, 0], [gr, -0.05, zEnd], [x + LANE_HALF, -0.05, zEnd]])} fill="#0a0820" />
            <path d={laneSurf[lanes.indexOf(k)]} fill="url(#woodG)" />
          </g>
        );
      })}
      {/* board lines */}
      <g clipPath="url(#laneClip)" stroke="#000" strokeWidth={1.2} opacity={0.22}>
        {lanes.flatMap((k) => Array.from({ length: 9 }, (_, i) => {
          const x = laneX(k) - LANE_HALF + ((i + 1) * 2 * LANE_HALF) / 10;
          return <path key={`b${k}${i}`} d={line(c, [[x, 0, 0.3], [x, 0, zEnd]])} />;
        }))}
      </g>
      {/* reflections in the gloss: mirrored ceiling clouds, panel glow, long streaks */}
      <g clipPath="url(#laneClip)">
        <g filter="url(#blurR)" opacity={blueLane ? 0.45 : 0.85}>
          {reflClouds.map((k, i) => (
            <path key={i} d={pl(cloudPts(k.x, CEIL - 0.25, k.z, k.s, true))} fill="none" stroke={k.c === "blue" ? NEON.blue.glow : "#ff5a2a"} strokeWidth={Math.max(4, (c.f * 0.12) / Math.max(1, depth(c, [k.x, 0, k.z])))} />
          ))}
        </g>
        {!blueLane && (
          <g filter="url(#glowS)" opacity={0.6}>
            {reflClouds.filter((k) => Math.abs(k.x) < 2).map((k, i) => (
              <path key={i} d={pl(cloudPts(k.x, CEIL - 0.25, k.z, k.s * 0.9, true))} fill="none" stroke={k.c === "blue" ? "#9ab4ff" : "#ffb070"} strokeWidth={Math.max(1.5, (c.f * 0.02) / Math.max(1, depth(c, [k.x, 0, k.z])))} />
            ))}
          </g>
        )}
        <g filter="url(#blurR)" opacity={0.42}>
          <g transform={affine(c, [-panelHalf, -panelY1, BACK - 0.15], [panelHalf, -panelY1, BACK - 0.15], [-panelHalf, -panelY0, BACK - 0.15], 400, 220)}><StrikePanel /></g>
        </g>
        <g filter="url(#blurXL)" opacity={0.5}>
          {lanes.map((k) => <path key={`st${k}`} d={pl([[laneX(k) - 0.06, 0, 2], [laneX(k) + 0.06, 0, 2], [laneX(k) + 0.06, 0, zEnd], [laneX(k) - 0.06, 0, zEnd]])} fill="#ff9a5a" opacity={0.6} />)}
        </g>
      </g>
      {/* neon gutter strips (the blue V lines) */}
      <g>
        {lanes.map((k) => {
          const x = laneX(k);
          const edges = [x - LANE_HALF - GUTTER - 0.02, x + LANE_HALF + GUTTER + 0.02];
          return edges.map((e, j) => {
            const d = line(c, [[e, 0.07, 0], [e, 0.07, zEnd]]);
            const near = Math.max(2.5, c.f * 0.007 / Math.max(0.5, Math.abs(depth(c, [e, 0, 1.5]))));
            return (
              <g key={`n${k}${j}`}>
                <path d={d} stroke={NEON.blue.glow} strokeWidth={near * 2.6} fill="none" filter="url(#glowL)" opacity={0.85} />
                <path d={d} stroke={NEON.blue.core} strokeWidth={near * 0.5} fill="none" />
              </g>
            );
          });
        })}
      </g>

      {/* pins on lane 0 (other lanes get a distant set too) */}
      {lanes.map((k) => {
        const spots = [...PIN_SPOTS].sort((a, b) => b[1] - a[1]);
        return spots.map(([px, pz], i) => {
          const idx = PIN_SPOTS.findIndex((s) => s[0] === px && s[1] === pz);
          if (k === 0 && fallen.has(idx) && pinT >= 1) return null;
          const wx = laneX(k) + px, wz = pz;
          let x = wx, y = 0, z = wz, rot = 0;
          if (k === 0 && scatter > 0) {
            const a = (idx * 2.399) % (Math.PI * 2);
            x += Math.cos(a) * scatter * (0.4 + (idx % 3) * 0.25);
            y += Math.abs(Math.sin(a * 1.3)) * scatter * 0.9;
            z += 0.4 * scatter;
            rot = (idx % 2 ? 1 : -1) * scatter * (90 + idx * 23);
          } else if (k === 0 && fallen.has(idx)) {
            rot = (px >= 0 ? 1 : -1) * 85 * Math.min(1, pinT);
          }
          const [sx, sy, dz] = proj(c, [x, y, z]);
          if (dz < 0.3) return null;
          const s = (c.f * 0.38) / dz / 38;
          return <Pin key={`p${k}${i}`} x={sx} y={sy} s={s} rot={rot} tint={blueLane ? "#9fd2ff" : "#f7f5f2"} lw={Math.max(0.6, s * 1.4)} />;
        });
      })}

      {/* ceiling neon clouds */}
      <g>
        {clouds.map((k, i) => {
          const dz = depth(c, [k.x, CEIL, k.z]);
          const w = Math.max(1.6, (c.f * 0.03) / dz);
          const d = pl(cloudPts(k.x, CEIL - 0.25, k.z, k.s));
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={NEON[k.c].glow} strokeWidth={w * 2.2} filter="url(#glowS)" opacity={0.9} />
              <path d={d} fill="none" stroke={NEON[k.c].core} strokeWidth={w * 0.6} />
            </g>
          );
        })}
        {/* warm downlights */}
        {[-3.25, 3.25, -1.9, 1.9].flatMap((x) => [4, 8.3, 12.6, 16.9].map((z) => {
          const [sx, sy, dz] = proj(c, [x, CEIL - 0.05, z]);
          if (dz < 0.6) return null;
          const r = (c.f * 0.06) / dz;
          return <ellipse key={`dl${x}${z}`} cx={sx} cy={sy} rx={r * 1.6} ry={r * 0.6} fill="#ffcf7a" filter="url(#glowS)" />;
        }))}
      </g>

      {children}
      {dim > 0 && <rect width={W} height={H} fill="#000" opacity={dim} />}
    </svg>
  );
};

/** world point → screen, plus the pixel radius of a ball sitting on the lane there */
export const ballOnLane = (c: Cam, x: number, z: number, lift = 0) => {
  const r = 0.11;
  const [sx, sy, dz] = proj(c, [x, r + lift, z]);
  return { x: sx, y: sy, r: (c.f * r) / Math.max(dz, 0.05), z: dz };
};

/* ------------------------------- flat backdrops --------------------------------- */

/** saturated blue brush-stroke wall, for the Regular's deadpan close-up */
export const BrushBlue: React.FC<{ seed?: number }> = ({ seed = 1 }) => {
  const strokes = Array.from({ length: 46 }, (_, i) => {
    const r = (k: number) => {
      const v = Math.sin((i + 1) * 12.9898 * k + seed * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    const x = r(1) * 1300 - 110, y = r(2) * 2100 - 90, len = 160 + r(3) * 320, w = 20 + r(4) * 46;
    const a = -32 + r(5) * 18;
    const col = ["#0d3fae", "#1550c6", "#0a2f8c", "#2461d6", "#0b47b8", "#3a74e0"][Math.floor(r(6) * 6)];
    return { x, y, len, w, a, col };
  });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <rect width={W} height={H} fill="#1048b8" />
      {strokes.map((s, i) => (
        <path key={i} d={`M${s.x},${s.y} q${s.len * 0.5},${-s.w * 0.6} ${s.len},0`} transform={`rotate(${s.a} ${s.x} ${s.y})`} stroke={s.col} strokeWidth={s.w} strokeLinecap="round" fill="none" opacity={0.9} />
      ))}
    </svg>
  );
};

/** soft cyan → royal blue mottled wall (the chibi close-up) */
export const CyanMottle: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="cyanM" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#3fd2ff" />
        <stop offset="0.45" stopColor="#1a7ef0" />
        <stop offset="1" stopColor="#0a2fb8" />
      </linearGradient>
      <filter id="mottle" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={3} seed={4} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.1  0 0 0 0 0.45  0 0 0 1.4 -0.55" />
      </filter>
    </defs>
    <rect width={W} height={H} fill="url(#cyanM)" />
    <rect width={W} height={H} filter="url(#mottle)" opacity={0.75} />
  </svg>
);

/** a dark neon room, heavily out of focus: used behind close-ups and the Sanji/Zoro two-shot */
export const NeonBokeh: React.FC<{ variant: "arcade" | "room" | "two" }> = ({ variant }) => {
  const items: React.ReactNode[] = [];
  if (variant === "arcade") {
    items.push(
      <rect key="a" x={0} y={0} width={W} height={H} fill="#1a0c2c" />,
      <path key="b" d="M-40,300 L240,240 L300,1300 L-40,1380Z" fill="#ff7a1a" />,
      <path key="b2" d="M20,420 L200,380 L230,1100 L20,1150Z" fill="#7a3cff" />,
      <path key="b3" d="M60,560 L160,520 L180,900 L70,930Z" fill="#ffd23a" />,
      <rect key="c" x={330} y={260} width={760} height={1100} fill="#2a1240" />,
      <g key="d" filter="url(#glowS)"><text x={760} y={520} fontFamily="Poppins Black" fontSize={170} fill="none" stroke="#ff4fd8" strokeWidth={14} textAnchor="middle">ARCADE</text></g>,
      <rect key="e" x={420} y={760} width={170} height={300} fill="#ff4fae" opacity={0.85} />,
      <rect key="f" x={680} y={760} width={170} height={300} fill="#ff6ad0" opacity={0.75} />,
      <rect key="g" x={930} y={760} width={170} height={300} fill="#c040ff" opacity={0.75} />,
      <rect key="h" x={0} y={1360} width={W} height={600} fill="#0e0718" />,
    );
  } else if (variant === "room") {
    items.push(
      <rect key="a" x={0} y={0} width={W} height={H} fill="#0d0718" />,
      <rect key="b" x={0} y={120} width={W} height={50} fill="#2a1840" />,
      <rect key="b2" x={0} y={300} width={W} height={40} fill="#22143a" />,
      <rect key="c" x={60} y={1000} width={220} height={360} fill="#5a2a1a" />,
      <circle key="c2" cx={170} cy={1120} r={60} fill="#ff8a3a" opacity={0.7} />,
      <rect key="d" x={720} y={760} width={300} height={130} fill="#3a2aa0" opacity={0.6} />,
      <text key="e" x={860} y={850} fontFamily="Poppins Black" fontSize={70} fill="#ff5ae0" textAnchor="middle" opacity={0.7}>ARCADE</text>,
      <rect key="f" x={-20} y={400} width={140} height={700} fill="#3a1a70" opacity={0.6} />,
    );
  } else {
    items.push(
      <rect key="a" x={0} y={0} width={W} height={H} fill="#100a22" />,
      <rect key="b" x={460} y={420} width={140} height={260} fill="#ff4f6a" opacity={0.7} />,
      <rect key="b2" x={640} y={430} width={130} height={240} fill="#ff6a3a" opacity={0.7} />,
      <rect key="b3" x={820} y={440} width={150} height={240} fill="#b84aff" opacity={0.6} />,
      <rect key="c" x={380} y={720} width={700} height={240} fill="#1c1236" />,
      <rect key="d" x={0} y={1380} width={W} height={540} fill="#1a0e1e" />,
      <path key="e" d="M560,1300 L1080,1180 L1080,1240 L600,1360Z" fill="#3c6aff" opacity={0.9} />,
      <path key="f" d="M380,1700 L1080,1500 L1080,1920 L380,1920Z" fill="#3a1a2e" />,
    );
  }
  const signs =
    variant === "two" ? (
      <g filter="url(#glowS)" fill="none" strokeWidth={10}>
        <path d="M640,90 l-60,0 l-30,40 l30,40 l60,0 l30,-40Z" stroke="#3c7bff" />
        <circle cx={610} cy={130} r={14} stroke="#3c7bff" />
        <path d="M560,230 l40,-30 l40,30 M560,270 l40,-30 l40,30" stroke="#5aa8ff" />
        <path d="M720,230 l40,-30 l40,30 M720,270 l40,-30 l40,30" stroke="#5aa8ff" />
        <text x={380} y={170} fontFamily="Poppins Black" fontSize={60} stroke="#ff5ad8" strokeWidth={6}>BIG</text>
        <text x={240} y={1380} fontFamily="Poppins Black" fontSize={60} stroke="#ff4fd0" strokeWidth={6}>WIN</text>
      </g>
    ) : variant === "room" ? (
      <g filter="url(#glowS)">
        <path d={`M${900 - 120},${150} c-60,-10 -60,-80 0,-80 c10,-50 90,-50 110,-10 c40,-30 110,0 90,50 c50,10 40,80 -10,80 c-10,50 -90,40 -100,10 c-40,30 -110,10 -90,-50Z`} fill="none" stroke="#ff2448" strokeWidth={12} />
      </g>
    ) : null;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs><GlowDefs /><filter id="bokehBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={variant === "room" ? 10 : 16} /></filter></defs>
      <g filter="url(#bokehBlur)">{items}</g>
      <g opacity={0.9}>{signs}</g>
    </svg>
  );
};

/** the bar: SNACKS & DRINKS neon, shelves of bottles, a lit counter and round stools */
export const BarSet: React.FC = () => <div style={{ position: "absolute", inset: 0, filter: "blur(2.5px)" }}><BarInner /></div>;
const BarInner: React.FC = () => {
  const bottles: React.ReactNode[] = [];
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 22; i++) {
      const x = 40 + i * 46 + (row % 2) * 12, y = 900 + row * 120;
      const col = ["#ffb347", "#8a4a20", "#c7a040", "#6a2a10", "#e0e0a0"][(i * 3 + row) % 5];
      bottles.push(<path key={`${row}-${i}`} d={`M${x},${y} l0,-50 l6,-8 l0,-18 l8,0 l0,18 l6,8 l0,50Z`} fill={col} opacity={0.75} />);
    }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <GlowDefs />
        <linearGradient id="barWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120a26" />
          <stop offset="0.45" stopColor="#24143a" />
          <stop offset="0.7" stopColor="#3a1e22" />
          <stop offset="1" stopColor="#0c0610" />
        </linearGradient>
        <linearGradient id="barTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e88a3a" />
          <stop offset="1" stopColor="#6a2a14" />
        </linearGradient>
        <radialGradient id="warmPool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff9a3a" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ff9a3a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#barWall)" />
      {/* ceiling beams + purple glow */}
      <ellipse cx={540} cy={60} rx={500} ry={90} fill="#5a3aff" opacity={0.35} filter="url(#blurXL)" />
      <rect x={0} y={250} width={W} height={26} fill="#1a1030" />
      <rect x={300} y={276} width={10} height={160} fill="#1a1030" />
      <rect x={760} y={276} width={10} height={160} fill="#1a1030" />
      {/* pendant lamps */}
      {[305, 765].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={445} rx={70} ry={30} fill="url(#warmPool)" />
          <path d={`M${x - 26},${448} q26,-26 52,0Z`} fill="#ffcf7a" filter="url(#glowS)" />
        </g>
      ))}
      {/* back bar: shelves of bottles */}
      <rect x={0} y={760} width={W} height={440} fill="#2a1418" />
      {[0, 1, 2].map((r) => <rect key={r} x={0} y={900 + r * 120} width={W} height={10} fill="#e8963a" opacity={0.7} />)}
      {bottles}
      <rect x={0} y={760} width={W} height={440} fill="#000" opacity={0.25} />
      {/* SNACKS & DRINKS neon */}
      <g transform="rotate(-2 400 640)">
        <NeonText text="SNACKS & DRINKS" color="orange" size={92} x={360} y={660} />
      </g>
      {/* BOWL YOUR GAME + pin icon */}
      <g transform="translate(960,900)">
        <NeonText text="" lines={["BOWL", "YOUR", "GAME"]} color="blue" size={64} x={30} y={0} />
        <g filter="url(#glowS)" fill="none" stroke={NEON.pink.glow} strokeWidth={10}>
          <path d="M-40,180 c-20,-30 -10,-60 0,-80 c-12,-20 -10,-40 0,-40 c10,0 12,20 0,40 c10,20 20,50 0,80Z" />
          <circle cx={30} cy={160} r={34} />
        </g>
      </g>
      {/* counter */}
      <rect x={0} y={1290} width={W} height={34} fill="url(#barTop)" />
      <rect x={0} y={1324} width={W} height={300} fill="#24120e" />
      <rect x={0} y={1324} width={W} height={300} fill="url(#warmPool)" opacity={0.6} />
      {/* stools */}
      {[150, 330, 510, 690, 870].map((x, i) => (
        <g key={x}>
          <rect x={x - 10} y={1530} width={20} height={300} fill="#140a0e" />
          <ellipse cx={x} cy={1520} rx={84} ry={28} fill={["#e83a5a", "#d63aa0", "#3a8ad6", "#e8503a", "#8a3ad6"][i]} />
          <ellipse cx={x} cy={1512} rx={84} ry={24} fill={["#ff6a8a", "#ff6ad0", "#6ab4ff", "#ff8a5a", "#b46aff"][i]} />
        </g>
      ))}
      <rect x={0} y={1700} width={W} height={220} fill="#0a0508" opacity={0.8} />
      <rect width={W} height={H} fill="#1c0a3a" opacity={0.32} />
    </svg>
  );
};

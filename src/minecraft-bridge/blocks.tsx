import React from "react";
import { random } from "remotion";

/**
 * Blocks for the bridging Short, in the hand-drawn look: flat pixel texture
 * (the same 8×8 pattern on every block, the way the game tiles it), a shade
 * per face, and the plum outline Oofy is drawn with.
 *
 * Faces are quads mapped with a homography, so a bridge forty blocks long
 * foreshortens properly into its vanishing point — whether the quad came
 * from a measured screen shape or from the little pinhole camera below.
 */

export type P2 = readonly [number, number];
export type P3 = readonly [number, number, number];
export const LINE = "#2a1b3d";

export type Palette = { base: string[]; weights: number[] };
/** Java's grass: the bright lime Garrett's bridges are, not a dirt-sided grass block */
export const GRASS: Palette = { base: ["#72c23c", "#5fae31", "#86d24c", "#4f9a2a"], weights: [0.42, 0.3, 0.18, 0.1] };
/** Bedrock's blocks: blue, so the two editions never share a colour */
export const BLUE: Palette = { base: ["#5f8be0", "#4c77cf", "#7ea5ee", "#3f65bb"], weights: [0.42, 0.3, 0.18, 0.1] };

export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 0xff) * k)));
  return `#${((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1)}`;
};

/** one texel of the shared 8×8 texture */
const texel = (pal: Palette, i: number, j: number) => {
  const r = random(`tx${((i % 8) + 8) % 8}-${((j % 8) + 8) % 8}`);
  let acc = 0;
  for (let k = 0; k < pal.base.length; k++) {
    acc += pal.weights[k];
    if (r < acc) return k;
  }
  return 0;
};

/** unit square → quad [p00, p10, p11, p01] */
export const homography = (q: readonly P2[]) => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  let g = 0, h = 0;
  if (Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9) {
    const den = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / den;
    h = (dx1 * dy3 - dx3 * dy1) / den;
  }
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + h * y3, f = y0;
  return (u: number, v: number): P2 => {
    const w = g * u + h * v + 1;
    return [(a * u + b * v + c) / w, (d * u + e * v + f) / w];
  };
};

const f1 = (n: number) => n.toFixed(1);

/**
 * A textured quad. `nu`×`nv` texels; `seams` draws the block joins every
 * 8 texels. Texels of one colour are merged into a single path, so even a
 * long bridge face stays a handful of elements.
 */
export const TexQuad: React.FC<{
  q: readonly P2[];
  nu: number;
  nv: number;
  pal: Palette;
  k?: number;
  line?: string;
  lw?: number;
  seams?: boolean;
  u0?: number;
  v0?: number;
  opacity?: number;
}> = ({ q, nu, nv, pal, k = 1, line = LINE, lw = 6, seams = true, u0 = 0, v0 = 0, opacity = 1 }) => {
  const H = homography(q);
  const paths: string[] = pal.base.map(() => "");
  const pts: P2[][] = [];
  for (let i = 0; i <= nu; i++) {
    pts.push([]);
    for (let j = 0; j <= nv; j++) pts[i].push(H(i / nu, j / nv));
  }
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const t = texel(pal, i + u0, j + v0);
      const a = pts[i][j], b = pts[i + 1][j], c = pts[i + 1][j + 1], d = pts[i][j + 1];
      paths[t] += `M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}L${f1(c[0])},${f1(c[1])}L${f1(d[0])},${f1(d[1])}Z`;
    }
  }
  let seam = "";
  if (seams) {
    for (let i = 8 - (((u0 % 8) + 8) % 8); i < nu; i += 8) seam += `M${f1(pts[i][0][0])},${f1(pts[i][0][1])}L${f1(pts[i][nv][0])},${f1(pts[i][nv][1])}`;
    for (let j = 8 - (((v0 % 8) + 8) % 8); j < nv; j += 8) seam += `M${f1(pts[0][j][0])},${f1(pts[0][j][1])}L${f1(pts[nu][j][0])},${f1(pts[nu][j][1])}`;
  }
  const outline = q.map((p, i) => `${i ? "L" : "M"}${f1(p[0])},${f1(p[1])}`).join("") + "Z";
  return (
    <g opacity={opacity}>
      {paths.map((d, t) => d && <path key={t} d={d} fill={shade(pal.base[t], k)} stroke={shade(pal.base[t], k)} strokeWidth={0.8} />)}
      {seam && <path d={seam} stroke={shade(pal.base[3], k * 0.85)} strokeWidth={Math.max(1, lw * 0.35)} fill="none" />}
      {lw > 0 && <path d={outline} fill="none" stroke={line} strokeWidth={lw} strokeLinejoin="round" />}
    </g>
  );
};

/** a flat, face-on block (side views): texture, a lit top edge, outline */
export const Block2D: React.FC<{ x: number; y: number; s: number; pal: Palette; lw?: number; k?: number }> = ({ x, y, s, pal, lw, k = 1 }) => (
  <TexQuad q={[[x, y], [x + s, y], [x + s, y + s], [x, y + s]]} nu={8} nv={8} pal={pal} k={k} lw={lw ?? Math.max(1.5, s * 0.035)} seams={false} />
);

/**
 * A row of face-on blocks drawn as one textured strip per run — far cheaper
 * than one Block2D each when a staircase or a loop has a hundred of them.
 */
export const Blocks2D: React.FC<{ cells: readonly P2[]; ox: number; oy: number; s: number; pal: Palette }> = ({ cells, ox, oy, s, pal }) => {
  const lw = Math.max(1.2, s * 0.035);
  const tex: string[] = pal.base.map(() => "");
  let outline = "";
  const px = s / 8;
  for (const [cx, cy] of cells) {
    const x = ox + cx * s, y = oy + cy * s;
    if (x < -s || x > 1080 + s || y < -s || y > 1920 + s) continue;
    if (s < 10) {
      tex[0] += `M${f1(x)},${f1(y)}h${f1(s)}v${f1(s)}h${f1(-s)}Z`;
    } else {
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) tex[texel(pal, i, j)] += `M${f1(x + i * px)},${f1(y + j * px)}h${f1(px)}v${f1(px)}h${f1(-px)}Z`;
    }
    outline += `M${f1(x)},${f1(y)}h${f1(s)}v${f1(s)}h${f1(-s)}Z`;
  }
  return (
    <g>
      {tex.map((d, t) => d && <path key={t} d={d} fill={pal.base[t]} stroke={pal.base[t]} strokeWidth={0.6} />)}
      <path d={outline} fill="none" stroke={LINE} strokeWidth={lw} strokeLinejoin="round" />
    </g>
  );
};

/** the little iso cube in a hand */
export const MiniCube: React.FC<{ x: number; y: number; s: number; pal: Palette; rot?: number }> = ({ x, y, s, pal, rot = 0 }) => {
  const h = s * 0.5;
  const top: P2[] = [[0, -h], [h, -h / 2], [0, 0], [-h, -h / 2]];
  const left: P2[] = [[-h, -h / 2], [0, 0], [0, h], [-h, h / 2]];
  const right: P2[] = [[0, 0], [h, -h / 2], [h, h / 2], [0, h]];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <TexQuad q={top} nu={4} nv={4} pal={pal} k={1.08} lw={s * 0.07} seams={false} />
      <TexQuad q={left} nu={4} nv={4} pal={pal} k={0.8} lw={s * 0.07} seams={false} />
      <TexQuad q={right} nu={4} nv={4} pal={pal} k={0.92} lw={s * 0.07} seams={false} />
    </g>
  );
};

/* ------------------------------ 3D camera ------------------------------ */

export type Cam = { e: P3; yaw: number; pitch: number; roll: number; F: number };

const sub = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: P3, b: P3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: P3): P3 => {
  const l = Math.hypot(...a);
  return [a[0] / l, a[1] / l, a[2] / l];
};

const basis = (c: Cam) => {
  const fwd: P3 = [Math.cos(c.pitch) * Math.sin(c.yaw), Math.sin(c.pitch), -Math.cos(c.pitch) * Math.cos(c.yaw)];
  const right = norm(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);
  const cr = Math.cos(c.roll), sr = Math.sin(c.roll);
  return { fwd, right: [right[0] * cr + up[0] * sr, right[1] * cr + up[1] * sr, right[2] * cr + up[2] * sr] as P3, up: [up[0] * cr - right[0] * sr, up[1] * cr - right[1] * sr, up[2] * cr - right[2] * sr] as P3 };
};

/** world → [screen x, screen y, depth] */
export const project = (c: Cam, p: P3): [number, number, number] => {
  const b = basis(c);
  const d = sub(p, c.e);
  const z = dot(d, b.fwd);
  return [540 + (c.F * dot(d, b.right)) / z, 960 - (c.F * dot(d, b.up)) / z, z];
};

/** pixels per world unit at a point — for sizing sprites standing there */
export const pxPerUnit = (c: Cam, p: P3) => Math.abs(c.F / project(c, p)[2]);

export type Box = { min: P3; max: P3; pal: Palette; key: string; skip?: ("-z" | "+z" | "-x" | "+x")[]; label?: { face: "-z"; text: string; u: number; v: number; size: number } };

type Face = { q: P2[]; nu: number; nv: number; k: number; dist: number; pal: Palette; key: string; label?: Box["label"] };

/** every visible face of every box, far to near */
export const boxFaces = (c: Cam, boxes: Box[]): Face[] => {
  const faces: Face[] = [];
  for (const bx of boxes) {
    const [x0, y0, z0] = bx.min, [x1, y1, z1] = bx.max;
    const L = [x1 - x0, y1 - y0, z1 - z0];
    // corners ordered p00, p10, p11, p01 — u runs along the first-named axis
    const defs: { n: P3; pts: P3[]; nu: number; nv: number; k: number }[] = [
      { n: [0, 1, 0], pts: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], nu: L[0], nv: L[2], k: 1.06 },
      { n: [0, -1, 0], pts: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], nu: L[0], nv: L[2], k: 0.6 },
      { n: [0, 0, -1], pts: [[x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [x0, y0, z0]], nu: L[0], nv: L[1], k: 0.86 },
      { n: [0, 0, 1], pts: [[x0, y1, z1], [x1, y1, z1], [x1, y0, z1], [x0, y0, z1]], nu: L[0], nv: L[1], k: 0.86 },
      { n: [1, 0, 0], pts: [[x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [x1, y0, z0]], nu: L[2], nv: L[1], k: 0.74 },
      { n: [-1, 0, 0], pts: [[x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [x0, y0, z0]], nu: L[2], nv: L[1], k: 0.74 },
    ];
    const names = ["top", "bottom", "-z", "+z", "+x", "-x"];
    for (const [di, d] of defs.entries()) {
      if (bx.skip?.includes(names[di] as "-z")) continue; // a face buried against a neighbour, which the painter would get wrong
      const ctr: P3 = [(d.pts[0][0] + d.pts[2][0]) / 2, (d.pts[0][1] + d.pts[2][1]) / 2, (d.pts[0][2] + d.pts[2][2]) / 2];
      if (dot(d.n, sub(c.e, ctr)) <= 0) continue;
      const q = d.pts.map((p) => {
        const s = project(c, p);
        return [s[0], s[1]] as P2;
      });
      faces.push({
        q, nu: Math.max(1, Math.round(d.nu * 8)), nv: Math.max(1, Math.round(d.nv * 8)), k: d.k,
        dist: Math.hypot(...sub(ctr, c.e)), pal: bx.pal, key: `${bx.key}${d.n.join("")}`,
        label: d.n[2] === -1 ? bx.label : undefined,
      });
    }
  }
  return faces.sort((a, b) => b.dist - a.dist);
};

/** a line of text laid on a face, following the face's perspective at its centre */
const FaceText: React.FC<{ q: P2[]; label: NonNullable<Box["label"]>; nu: number; nv: number }> = ({ q, label, nu, nv }) => {
  const H = homography(q);
  const u = label.u, v = label.v, e = 0.01;
  const p = H(u, v), pu = H(u + e, v), pv = H(u, v + e);
  // one world unit along u and v, in pixels, from the local derivative
  const a = ((pu[0] - p[0]) / e) * (8 / nu), b = ((pu[1] - p[1]) / e) * (8 / nu);
  const c = ((pv[0] - p[0]) / e) * (8 / nv), d = ((pv[1] - p[1]) / e) * (8 / nv);
  return (
    <text transform={`matrix(${a / 8} ${b / 8} ${c / 8} ${d / 8} ${p[0]} ${p[1]})`} fontFamily="Monocraft, monospace" fontSize={label.size * 8} fill="#ffffff" opacity={0.32} textAnchor="middle" dominantBaseline="middle">
      {label.text}
    </text>
  );
};

export const Boxes: React.FC<{ cam: Cam; boxes: Box[]; lw?: number }> = ({ cam, boxes, lw = 6 }) => (
  <g>
    {boxFaces(cam, boxes).map((f) => (
      <g key={f.key}>
        <TexQuad q={f.q} nu={f.nu} nv={f.nv} pal={f.pal} k={f.k} lw={lw} />
        {f.label && <FaceText q={f.q} label={f.label} nu={f.nu} nv={f.nv} />}
      </g>
    ))}
  </g>
);

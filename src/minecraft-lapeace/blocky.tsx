import React from "react";
import { random, staticFile } from "remotion";

/**
 * A tiny 3D engine for Minecraft-skin characters, drawn as SVG.
 *
 * Every part is a box with a texture rectangle on each face; a face is
 * drawn as the skin atlas mapped onto its projected parallelogram (an affine
 * transform, so pixels stay crisp), shaded by the angle to a light. Faces are
 * painter-sorted. Expressions are painted pixel-by-pixel over the head's
 * front face, so the same skin can shout, gape, grin or doze.
 */

export type V3 = [number, number, number];
const D2R = Math.PI / 180;
const rx = (v: V3, a: number): V3 => { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; };
const ry = (v: V3, a: number): V3 => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; };
const rz = (v: V3, a: number): V3 => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; };
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

type FaceName = "front" | "back" | "right" | "left" | "top" | "bottom";

export type Part = {
  /** x0 y0 z0 x1 y1 z1, in model units (1 unit = 1 skin pixel), feet at y = 0, front towards +z */
  box: [number, number, number, number, number, number];
  /** atlas, and the standard Minecraft texture layout origin for this box */
  atlas: string;
  uv: [number, number];
  /** joint the part swings about, and how (degrees: rx, ry, rz) */
  pivot?: V3;
  rot?: V3;
  /** drawn after the head's other faces, with a depth bias, e.g. a fluffy afro that wraps the head */
  bias?: number | Partial<Record<FaceName, number>>;
  /** the face drawn over this part's front, in texel units (w x h) */
  front?: React.ReactNode;
  atlasSize?: number;
  only?: FaceName[];
  tint?: string;
  /** every face shows the whole atlas picture (a textured cube) */
  full?: boolean;
  /** lighter shading (marble, cloth) */
  soft?: boolean;
};

type Quad = { pts: [number, number][]; z: number; shade: number; name: FaceName; part: Part; p0: [number, number]; e1: [number, number]; e2: [number, number]; rect: [number, number, number, number] };

const faceDefs = (b: Part["box"]) => {
  const [x0, y0, z0, x1, y1, z1] = b;
  const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
  return {
    front: { n: [0, 0, 1] as V3, p0: [x0, y1, z1] as V3, e1: [dx, 0, 0] as V3, e2: [0, -dy, 0] as V3 },
    back: { n: [0, 0, -1] as V3, p0: [x1, y1, z0] as V3, e1: [-dx, 0, 0] as V3, e2: [0, -dy, 0] as V3 },
    right: { n: [-1, 0, 0] as V3, p0: [x0, y1, z0] as V3, e1: [0, 0, dz] as V3, e2: [0, -dy, 0] as V3 },
    left: { n: [1, 0, 0] as V3, p0: [x1, y1, z1] as V3, e1: [0, 0, -dz] as V3, e2: [0, -dy, 0] as V3 },
    top: { n: [0, 1, 0] as V3, p0: [x0, y1, z0] as V3, e1: [dx, 0, 0] as V3, e2: [0, 0, dz] as V3 },
    bottom: { n: [0, -1, 0] as V3, p0: [x0, y0, z1] as V3, e1: [dx, 0, 0] as V3, e2: [0, 0, -dz] as V3 },
  };
};

/** the six texture rectangles of a box laid out like a Minecraft skin: [u, v, w, h] */
const uvRects = (u: number, v: number, dx: number, dy: number, dz: number): Record<FaceName, [number, number, number, number]> => ({
  top: [u + dz, v, dx, dz], bottom: [u + dz + dx, v, dx, dz],
  right: [u, v + dz, dz, dy], front: [u + dz, v + dz, dx, dy], left: [u + dz + dx, v + dz, dz, dy], back: [u + 2 * dz + dx, v + dz, dx, dy],
});

export type View = { yaw: number; pitch: number; roll?: number; s: number; x: number; y: number };

const LIGHT: V3 = (() => { const l: V3 = [-0.45, 0.8, 0.55]; const m = Math.hypot(...l); return [l[0] / m, l[1] / m, l[2] / m]; })();

/** project every part's faces and return them drawn in order */
export const renderParts = (parts: Part[], view: View, key = "b"): React.ReactNode => {
  const quads: Quad[] = [];
  const toScreen = (v: V3): V3 => {
    let w = rz(v, (view.roll ?? 0) * D2R);
    w = ry(w, view.yaw * D2R);
    w = rx(w, view.pitch * D2R);
    return w;
  };
  const toNormal = toScreen;
  parts.forEach((part) => {
    const defs = faceDefs(part.box);
    const dx = part.box[3] - part.box[0], dy = part.box[4] - part.box[1], dz = part.box[5] - part.box[2];
    const A = part.atlasSize ?? 64;
    const whole: [number, number, number, number] = [0, 0, A, A];
    const rects = part.full ? { top: whole, bottom: whole, right: whole, front: whole, left: whole, back: whole } : uvRects(part.uv[0], part.uv[1], dx, dy, dz);
    const pivot = part.pivot ?? [0, 0, 0];
    const prot = part.rot ?? [0, 0, 0];
    const partT = (v: V3): V3 => {
      let q = sub(v, pivot);
      q = rx(q, prot[0] * D2R); q = rz(q, prot[2] * D2R); q = ry(q, prot[1] * D2R);
      return add(q, pivot);
    };
    const partN = (n: V3): V3 => ry(rz(rx(n, prot[0] * D2R), prot[2] * D2R), prot[1] * D2R);
    (Object.keys(defs) as FaceName[]).forEach((name) => {
      if (part.only && !part.only.includes(name)) return;
      const d = defs[name];
      const n = toNormal(partN(d.n));
      if (n[2] <= 0.01) return;
      const c0 = toScreen(partT(d.p0));
      const c1 = toScreen(partT(add(d.p0, d.e1)));
      const c2 = toScreen(partT(add(add(d.p0, d.e1), d.e2)));
      const c3 = toScreen(partT(add(d.p0, d.e2)));
      const sx = (c: V3): [number, number] => [view.x + c[0] * view.s, view.y - c[1] * view.s];
      const bz = typeof part.bias === "number" ? part.bias : part.bias?.[name] ?? 0;
      const z = (c0[2] + c1[2] + c2[2] + c3[2]) / 4 + bz;
      const shade = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
      const p0 = sx(c0), pa = sx(c1), pb = sx(c3);
      quads.push({ pts: [p0, sx(c1), sx(c2), sx(c3)], z, shade, name, part, p0, e1: [pa[0] - p0[0], pa[1] - p0[1]], e2: [pb[0] - p0[0], pb[1] - p0[1]], rect: rects[name] });
    });
  });
  quads.sort((a, b) => a.z - b.z);
  return (
    <g key={key}>
      {quads.map((q, i) => {
        const [u, v, w, h] = q.rect;
        const m = [q.e1[0] / w, q.e1[1] / w, q.e2[0] / h, q.e2[1] / h, q.p0[0], q.p0[1]];
        const size = q.part.atlasSize ?? 64;
        const dark = Math.max(0, 0.46 - q.shade * 0.46) * (q.part.soft ? 0.4 : 1);
        const lit = Math.max(0, q.shade - 0.8) * 0.5;
        const pts = q.pts.map((p) => p.join(",")).join(" ");
        return (
          <g key={i}>
            <g transform={`matrix(${m.join(" ")})`}>
              <svg width={w} height={h} viewBox={`${u} ${v} ${w} ${h}`} overflow="hidden">
                <image href={staticFile(`images/skins/${q.part.atlas}.png`)} x={0} y={0} width={size} height={size} style={{ imageRendering: "pixelated" }} />
              </svg>
              {q.name === "front" && q.part.front && <g>{q.part.front}</g>}
            </g>
            <polygon points={pts} fill="#000" opacity={dark} />
            {lit > 0 && <polygon points={pts} fill="#fff" opacity={lit} />}
          </g>
        );
      })}
    </g>
  );
};

/* ------------------------------ the two characters ------------------------------ */

export type Pose = {
  /** degrees: head pitch (+ down), yaw, roll */
  head?: [number, number, number];
  /** arms: raise forward/back (+ forward) and out sideways (+ out) */
  armL?: [number, number];
  armR?: [number, number];
  legL?: number;
  legR?: number;
  /** vertical bounce, in model units */
  bounce?: number;
};

export type Look = "speed" | "kai";

const PX: Record<string, string> = { W: "#ffffff", D: "#1a1018", R: "#8a1c2c", T: "#ffffff", N: "rgba(0,0,0,0.2)", B: "rgba(24,12,12,0.78)", b: "rgba(24,12,12,0.4)", S: "#f2c29b", s: "#d9a07a" };

export type Mood = "shout" | "plain" | "shock" | "smile" | "calm" | "grin";

const rowsFor = (who: Look, m: Mood): string[] => {
  const base: Record<Mood, string[]> = {
    shout: ["........", "........", ".DD..DD.", ".DD..DD.", "......S.", "...NN...", ".TTTTTT.", "..RRRR.."],
    plain: ["........", "........", ".DD..DD.", ".WD..DW.", "......S.", "...NN...", "........", "..DDDD.."],
    shock: ["........", "........", ".DD..DD.", ".WW..WW.", ".WD..DW.", "...NN...", "...RR...", "...RR..."],
    smile: ["........", "........", ".DD..DD.", ".WD..DW.", "......S.", "...NN...", ".D....D.", "..DDDD.."],
    calm: ["........", "........", "..D..D..", ".DD..DD.", "......S.", "...NN...", "........", "..DDDD.."],
    grin: ["........", "........", ".DD..DD.", ".WD..DW.", "......S.", "...NN...", ".TTTTTT.", "..TTTT.."],
  };
  const rows = base[m].map((r) => r.split(""));
  if (who === "kai") {
    // a full beard along the jaw and chin, around the mouth
    const beard = ["B......B", "B......B"];
    rows[5][0] = "B"; rows[5][7] = "B";
    rows[6][0] = "B"; rows[6][1] = "B"; rows[6][6] = "B"; rows[6][7] = "B";
    for (let i = 0; i < 8; i++) if (rows[7][i] === ".") rows[7][i] = "B";
    void beard;
  } else {
    // stubble along the jaw
    for (let i = 0; i < 8; i++) if (rows[7][i] === ".") rows[7][i] = "b";
    rows[6][0] = "b"; rows[6][7] = "b";
  }
  return rows.map((r) => r.join(""));
};

const FaceRows: React.FC<{ rows: string[] }> = ({ rows }) => (
  <g>
    {rows.map((r, j) => r.split("").map((c, i) => (c === "." ? null : <rect key={`${j}${i}`} x={i} y={j} width={1.02} height={1.02} fill={PX[c]} />)))}
  </g>
);

export type Outfit = { toga?: boolean; laurel?: boolean };

export const characterParts = (who: Look, mood: Mood, pose: Pose = {}, outfit: Outfit = {}): Part[] => {
  const atlas = who;
  const bounce = pose.bounce ?? 0;
  const head = pose.head ?? [0, 0, 0];
  const aL = pose.armL ?? [0, 4], aR = pose.armR ?? [0, 4];
  const lL = pose.legL ?? 0, lR = pose.legR ?? 0;
  const face = <FaceRows rows={rowsFor(who, mood)} />;
  const parts: Part[] = [];
  const dy = bounce;
  const B = (b: [number, number, number, number, number, number]): Part["box"] => [b[0], b[1] + dy, b[2], b[3], b[4] + dy, b[5]];
  // legs
  parts.push({ box: B([0.0, 0, -2, 4, 12, 2]), atlas, uv: [0, 16], pivot: [2, 12 + dy, 0], rot: [lL, 0, 0] });
  parts.push({ box: B([-4, 0, -2, 0, 12, 2]), atlas, uv: [0, 16], pivot: [-2, 12 + dy, 0], rot: [lR, 0, 0] });
  // body
  parts.push({ box: B([-4, 12, -2, 4, 24, 2]), atlas, uv: [16, 16] });
  if (outfit.toga) parts.push({ box: B([-4.5, 11.4, -2.5, 4.5, 23.4, 2.5]), atlas: "toga", uv: [0, 0], atlasSize: 64, full: true, bias: 0.3 });
  // arms: the character's left arm is at +x
  parts.push({ box: B([4, 12, -2, 8, 24, 2]), atlas, uv: [40, 16], pivot: [6, 22 + dy, 0], rot: [-aL[0], 0, aL[1]] });
  parts.push({ box: B([-8, 12, -2, -4, 24, 2]), atlas, uv: [40, 16], pivot: [-6, 22 + dy, 0], rot: [-aR[0], 0, -aR[1]] });
  // head with its face
  const hp: V3 = [0, 24 + dy, 0];
  parts.push({ box: B([-4, 24, -4, 4, 32, 4]), atlas, uv: [0, 0], pivot: hp, rot: [head[0], head[1], head[2]], front: face });
  if (who === "kai") {
    // the afro: a big curly puff wrapped round the head
    parts.push({ box: B([-6.6, 25, -6.6, 6.6, 38.5, 3.7]), atlas: "kai-hair", uv: [0, 0], pivot: hp, rot: [head[0], head[1], head[2]], bias: { front: -1.5, back: 0, right: 1.6, left: 1.6, top: 1, bottom: -1 } });
    parts.push({ box: B([-5.0, 30.6, 3.5, 5.0, 36, 4.4]), atlas: "kai-hair", uv: [0, 0], pivot: hp, rot: [head[0], head[1], head[2]], bias: { front: 0.6, top: 0.5 }, only: ["front", "top"] });
  } else {
    // locs: a cap and a crown of twisted strands thrown out in every direction
    parts.push({ box: B([-4.4, 30.6, -4.4, 4.4, 33.2, 4.4]), atlas: "speed-hair", uv: [0, 0], pivot: hp, rot: [head[0], head[1], head[2]], bias: 0.4 });
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2;
      const r = 2.6 + (i % 3) * 0.7;
      const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
      const lean = 28 + (i % 4) * 9;
      parts.push({
        box: B([cx - 0.9, 32.6, cz - 0.9, cx + 0.9, 38 + (i % 3), cz + 0.9]),
        atlas: "speed-hair", uv: [0, 0], pivot: [cx, 32.6 + dy, cz],
        rot: [Math.sin(a) * lean + head[0], head[1], -Math.cos(a) * lean + head[2]],
        bias: 0.2,
      });
    }
    // fringe locs across the forehead
    for (let i = 0; i < 5; i++) {
      parts.push({ box: B([-3.8 + i * 1.9, 30.8, 4.0, -2.4 + i * 1.9, 32.3, 4.9]), atlas: "speed-hair", uv: [0, 0], pivot: hp, rot: [head[0], head[1], head[2]], bias: 0.6 });
    }
  }
  if (outfit.laurel) {
    // a ring of leaves around the top of the head, leaning outward
    const n = who === "kai" ? 18 : 14;
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.02 + 0.96 * (i / (n - 1)));
      const rr = who === "kai" ? 7.2 : 4.9;
      const cx = -Math.cos(a) * rr, cy = (who === "kai" ? 31.5 : 31.4) + Math.sin(a) * (who === "kai" ? 5.2 : 1.6), cz = (who === "kai" ? 1.5 : 0) + Math.sin(a) * 0.6;
      parts.push({ box: B([cx - 1.4, cy - 0.6, cz - 1.6, cx + 1.4, cy + 0.6, cz + 1.6]), atlas: "leaf", uv: [0, 0], atlasSize: 16, full: true, pivot: [cx, cy + dy, cz], rot: [head[0], head[1], (i % 2 ? 1 : -1) * 25 + (a * 180) / Math.PI - 90], bias: 2.5 });
    }
  }
  return parts;
};

/** world position of a character's right and left hand centres (screen px), for hanging items on them */
export const handPos = (pose: Pose, view: View, side: "L" | "R"): [number, number] => {
  const a = side === "L" ? pose.armL ?? [0, 4] : pose.armR ?? [0, 4];
  const dy = pose.bounce ?? 0;
  const pivot: V3 = side === "L" ? [6, 22 + dy, 0] : [-6, 22 + dy, 0];
  let v: V3 = [side === "L" ? 6 : -6, 12 + dy, 0];
  v = sub(v, pivot);
  v = rx(v, -a[0] * D2R); v = rz(v, (side === "L" ? a[1] : -a[1]) * D2R);
  v = add(v, pivot);
  let w = rz(v, (view.roll ?? 0) * D2R); w = ry(w, view.yaw * D2R); w = rx(w, view.pitch * D2R);
  return [view.x + w[0] * view.s, view.y - w[1] * view.s];
};

/** the character at the given place; y is the feet's screen y, s is px per skin pixel */
export const Blocky: React.FC<{ who: Look; mood?: Mood; pose?: Pose; outfit?: Outfit; x: number; y: number; s: number; yaw?: number; pitch?: number; roll?: number; extra?: (hands: { L: [number, number]; R: [number, number] }) => React.ReactNode }> = ({
  who, mood = "plain", pose = {}, outfit = {}, x, y, s, yaw = 0, pitch = 0, roll = 0, extra,
}) => {
  const view: View = { yaw, pitch, roll, s, x, y };
  const parts = characterParts(who, mood, pose, outfit);
  void random;
  return (
    <g>
      {renderParts(parts, view)}
      {extra && extra({ L: handPos(pose, view, "L"), R: handPos(pose, view, "R") })}
    </g>
  );
};

/** a plain cube (a lapis block, say) with its own atlas covering all six faces */
export const Cube: React.FC<{ atlas: string; atlasSize: number; x: number; y: number; s: number; size?: number; yaw?: number; pitch?: number; tint?: string }> = ({ atlas, atlasSize, x, y, s, size = 16, yaw = 25, pitch = 20 }) => {
  const h = size / 2;
  // every face shows the whole picture
  const part: Part = { box: [-h, 0, -h, h, size, h], atlas, uv: [0, 0], atlasSize, full: true };
  return <g>{renderParts([part], { yaw, pitch, s, x, y }, "cube")}</g>;
};

/** where a model-space point lands on screen for a view */
export const project = (view: View, v: V3): [number, number] => {
  let w = rz(v, (view.roll ?? 0) * D2R);
  w = ry(w, view.yaw * D2R);
  w = rx(w, view.pitch * D2R);
  return [view.x + w[0] * view.s, view.y - w[1] * view.s];
};

/** a solid marble box (a column, a step) */
export const marbleBox = (box: Part["box"], tint?: string): Part => ({ box, atlas: "marble", uv: [0, 0], atlasSize: 64, full: true, tint, soft: true });

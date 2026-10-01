import React, { useId } from "react";
import { INK } from "../common";
import { Ball, BallKey } from "./sets";

/**
 * The cast, drawn as flat cel figures from a skeleton pose. Every body part is
 * a <Part>: an outline pass (the shape stroked thick in INK), a hard shadow
 * tone, and the base colour clipped to the shape and nudged toward the light
 * (upper-left) so a sliver of shadow is left on the lower-right edges — one
 * hard cel shadow, the way TV anime is painted.
 *
 * Figures stand with their feet at y=0 and are ~1000 units tall (One Piece
 * proportions: long legs, ~6.5–7 heads). "L" is the limb on the viewer's
 * left, "R" the viewer's right.
 */

export type P = [number, number];
export const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
export const len = (a: P) => Math.hypot(a[0], a[1]);
export const nrm = (a: P): P => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
export const mix = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const ang = (a: P, b: P) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
export const fx = (p: P) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

/** Catmull-Rom through the points, as cubic beziers */
export const smooth = (pts: P[], closed = true, k = 1): string => {
  const n = pts.length;
  const get = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${fx(pts[0])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1: P = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2: P = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += `C${fx(c1)} ${fx(c2)} ${fx(p2)}`;
  }
  return closed ? d + "Z" : d;
};

/** a tapered tube through the points with round caps — arms, legs, sleeves */
export const tube = (pts: P[], ws: number[]): string => {
  const n = pts.length;
  const Ls: P[] = [], Rs: P[] = [];
  for (let i = 0; i < n; i++) {
    const t = nrm(sub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)]));
    const no: P = [-t[1], t[0]];
    Ls.push(add(pts[i], mul(no, ws[i])));
    Rs.push(sub(pts[i], mul(no, ws[i])));
  }
  const left = smooth(Ls, false);
  const right = smooth([...Rs].reverse(), false).replace(/^M[^C]*/, "");
  return `${left}A${ws[n - 1]},${ws[n - 1]} 0 0 0 ${fx(Rs[n - 1])}${right}A${ws[0]},${ws[0]} 0 0 0 ${fx(Ls[0])}Z`;
};
export const circ = (c: P, r: number) => `M${c[0] - r},${c[1]}a${r},${r} 0 1 0 ${r * 2},0a${r},${r} 0 1 0 ${-r * 2},0Z`;

/** an outlined, cel-shaded shape (or union of shapes) */
export const Part: React.FC<{ d: string | string[]; fill: string; shade?: string; lw: number; sh?: P; noLine?: boolean; children?: React.ReactNode }> = ({ d, fill, shade, lw, sh, noLine, children }) => {
  const id = "pt" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const ds = Array.isArray(d) ? d.filter(Boolean) : [d];
  const paths = ds.map((p, i) => <path key={i} d={p} />);
  const s = sh ?? [-lw * 2.4, -lw * 1.6];
  return (
    <g>
      {!noLine && <g fill={INK} stroke={INK} strokeWidth={lw * 2} strokeLinejoin="round">{paths}</g>}
      {shade ? (
        <>
          <defs><clipPath id={id}>{paths}</clipPath></defs>
          <g fill={shade}>{paths}</g>
          <g clipPath={`url(#${id})`}><g transform={`translate(${s[0]},${s[1]})`} fill={fill}>{paths}</g>{children}</g>
        </>
      ) : (
        <>
          <g fill={fill}>{paths}</g>
          {children && <><defs><clipPath id={id}>{paths}</clipPath></defs><g clipPath={`url(#${id})`}>{children}</g></>}
        </>
      )}
    </g>
  );
};

/* ---------------------------------- poses ---------------------------------- */

export type Pose = {
  head: P; tilt: number; turn: number;
  neck: P;
  shL: P; elL: P; haL: P; shR: P; elR: P; haR: P;
  hipL: P; knL: P; ftL: P; hipR: P; knR: P; ftR: P;
  /** hand shapes */
  hL?: HandKind; hR?: HandKind;
  /** foot directions: -1 points left, 1 right, 0 toward camera */
  fdL?: number; fdR?: number;
  /** draw this arm behind the torso */
  backL?: boolean; backR?: boolean;
};

export const STAND: Pose = {
  head: [0, -905], tilt: 0, turn: 0, neck: [0, -830],
  shL: [-94, -806], elL: [-114, -616], haL: [-120, -450],
  shR: [94, -806], elR: [114, -616], haR: [120, -450],
  hipL: [-48, -492], knL: [-52, -254], ftL: [-58, -14],
  hipR: [48, -492], knR: [52, -254], ftR: [58, -14],
  fdL: 0, fdR: 0,
};

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => {
  const o: Record<string, unknown> = { ...(t < 0.5 ? a : b) };
  for (const k of Object.keys(a) as (keyof Pose)[]) {
    const va = a[k], vb = b[k];
    if (Array.isArray(va) && Array.isArray(vb)) o[k] = mix(va as P, vb as P, t);
    else if (typeof va === "number" && typeof vb === "number") o[k] = va + (vb - va) * t;
  }
  return o as Pose;
};
/** build a pose from STAND with overrides */
export const pose = (o: Partial<Pose>, base: Pose = STAND): Pose => ({ ...base, ...o });

/* ---------------------------------- hands ---------------------------------- */

export type HandKind = "relax" | "fist" | "open" | "spread" | "point" | "hold" | "none" | "pocket";

export const Hand: React.FC<{ at: P; dir: number; kind: HandKind; s?: number; skin: string; shade: string; lw: number; flip?: boolean }> = ({ at, dir, kind, s = 1, skin, shade, lw, flip }) => {
  if (kind === "none" || kind === "pocket") return null;
  const fl = flip ? -1 : 1;
  let shapes: string[] = [];
  if (kind === "fist") shapes = [smooth([[-4, -15], [14, -17], [28, -10], [30, 6], [20, 16], [2, 15], [-6, 4]]), tube([[10, -14], [24, -22]], [6, 5])];
  if (kind === "relax") shapes = [smooth([[-4, -13], [16, -15], [34, -8], [38, 4], [26, 14], [4, 14], [-6, 2]]), tube([[8, -12], [22, -20]], [5.5, 4.5])];
  if (kind === "point") shapes = [smooth([[-4, -14], [14, -16], [26, -9], [28, 6], [18, 15], [2, 14], [-6, 3]]), tube([[18, -8], [58, -10]], [6, 5]), tube([[8, -12], [20, -20]], [6, 5])];
  if (kind === "open" || kind === "hold") {
    const curl = kind === "hold" ? -14 : 0;
    shapes = [smooth([[-4, -14], [18, -16], [28, -6], [28, 10], [14, 17], [-4, 12]])];
    for (let i = 0; i < 4; i++) {
      const y = -10 + i * 7.5;
      shapes.push(tube([[24, y], [40, y + (i - 1.5) * 2 + curl * 0.5], [50, y + (i - 1.5) * 3 + curl]], [4.6, 4.2, 3.8]));
    }
    shapes.push(tube([[6, -12], [18, -26], [28, -30]], [5.5, 5, 4.5]));
  }
  if (kind === "spread") {
    shapes = [smooth([[-4, -16], [20, -18], [30, -6], [30, 12], [14, 19], [-4, 13]])];
    const fingers: [number, number, number][] = [[-50, 46, 6], [-18, 54, 4], [8, 56, 2], [32, 48, 0]];
    fingers.forEach(([a, l], i) => {
      const r = (a * Math.PI) / 180;
      const base: P = [26, -8 + i * 7];
      shapes.push(tube([base, [base[0] + Math.cos(r) * l * 0.55, base[1] + Math.sin(r) * l * 0.55], [base[0] + Math.cos(r * 0.9 + 0.25) * l, base[1] + Math.sin(r * 0.9 + 0.25) * l]], [5, 4.4, 3.6]));
    });
    shapes.push(tube([[6, -14], [10, -40], [20, -58]], [6, 5, 4]));
  }
  return (
    <g transform={`translate(${at[0]},${at[1]}) rotate(${dir}) scale(${s},${s * fl})`}>
      <Part d={shapes} fill={skin} shade={shade} lw={lw / s} />
    </g>
  );
};

/* ---------------------------------- feet ----------------------------------- */

export const footShape = (dir: number, l = 1): string => {
  if (Math.abs(dir) < 0.3) return smooth([[-24, -14], [24, -14], [30, 2], [20, 12], [-20, 12], [-30, 2]]);
  const s = Math.sign(dir) * l;
  return smooth([[-22 * s, -24], [10 * s, -18], [56 * s, -6], [64 * s, 6], [50 * s, 12], [-24 * s, 12], [-30 * s, -6]]);
};

/* ---------------------------------- torso ---------------------------------- */

export const torsoPts = (p: Pose, waistIn = 0.18, hipOut = 12): P[] => {
  const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
  const mid = mix(midS, midH, 0.62);
  const wl = mix(mix(p.shL, p.hipL, 0.62), mid, waistIn), wr = mix(mix(p.shR, p.hipR, 0.62), mid, waistIn);
  const across = nrm(sub(p.hipR, p.hipL));
  const up = nrm(sub(midS, midH));
  const pitL = add(mix(p.shL, p.hipL, 0.2), mul(across, 6)), pitR = sub(mix(p.shR, p.hipR, 0.2), mul(across, 6));
  const nl = add(p.neck, add(mul(across, -30), mul(up, -16))), nr = add(p.neck, add(mul(across, 30), mul(up, -16)));
  return [p.shL, nl, nr, p.shR, pitR, wr, add(p.hipR, mul(across, hipOut)), add(p.hipL, mul(across, -hipOut)), wl, pitL];
};

/* ----------------------------------- heads ---------------------------------- */

export type Face = "grin" | "focus" | "smug" | "angry" | "laugh" | "calm" | "blank" | "shock" | "grit" | "smirk" | "neutral";

export const SKIN = { base: "#f6c9a0", shade: "#d9946a" };
export const SKIN_TAN = { base: "#e9b080", shade: "#c27d52" };

/** face outline in head space (eye-line y=0, chin y≈68), squeezed on the far side when turned */
export const faceShape = (turn: number, jaw = 1) => {
  const t = turn;
  const lx = -50 * (1 - Math.max(0, t) * 0.22), rx = 50 * (1 - Math.max(0, -t) * 0.22);
  const cx = t * 12;
  return smooth([[lx, -70], [lx - 1, -10], [lx + 6, 26], [cx - 22 * jaw, 54], [cx, 68 * jaw], [cx + 22 * jaw, 54], [rx - 6, 26], [rx + 1, -10], [rx, -70], [cx, -82]]);
};

export const Eye: React.FC<{ x: number; y: number; kind: "round" | "sharp" | "closed" | "half" | "dot" | "shock" | "angry" | "laugh"; flip?: boolean; s?: number; iris?: string }> = ({ x, y, kind, flip, s = 1, iris = INK }) => {
  const k = flip ? -1 : 1;
  const T = `translate(${x},${y}) scale(${k * s},${s})`;
  if (kind === "round") return (
    <g transform={T}>
      <ellipse cx={0} cy={0} rx={10} ry={12} fill="#fff" stroke={INK} strokeWidth={1.6} />
      <ellipse cx={1} cy={1} rx={6.5} ry={9.5} fill={iris} />
      <circle cx={-1.5} cy={-3.5} r={2.4} fill="#fff" />
      <path d="M-12,-8 Q0,-17 12,-9" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
  if (kind === "sharp") return (
    <g transform={T}>
      <path d="M-14,-2 Q-2,-11 13,-6 Q8,5 -2,5 Q-10,4 -14,-2Z" fill="#fff" stroke={INK} strokeWidth={1.6} />
      <circle cx={2} cy={-1} r={4.2} fill={iris} />
      <path d="M-15,-1 Q-2,-12 15,-7" stroke={INK} strokeWidth={4.2} fill="none" strokeLinecap="round" />
    </g>
  );
  if (kind === "half") return (
    <g transform={T}>
      <path d="M-13,0 Q0,-4 13,-2 Q8,6 -2,6 Q-10,5 -13,0Z" fill="#fff" stroke={INK} strokeWidth={1.4} />
      <circle cx={2} cy={2} r={3.6} fill={iris} />
      <path d="M-14,0 Q0,-6 14,-3" stroke={INK} strokeWidth={4.4} fill="none" strokeLinecap="round" />
    </g>
  );
  if (kind === "angry") return (
    <g transform={T}>
      <path d="M-13,-6 L13,2 Q6,7 -4,6 Q-11,3 -13,-6Z" fill="#fff" stroke={INK} strokeWidth={1.6} />
      <circle cx={1} cy={2.5} r={3} fill={INK} />
      <path d="M-15,-8 L15,1" stroke={INK} strokeWidth={4.6} strokeLinecap="round" />
    </g>
  );
  if (kind === "closed") return <path transform={T} d="M-13,0 Q0,6 13,0" stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" />;
  if (kind === "laugh") return <path transform={T} d="M-12,3 Q0,-9 12,3" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
  if (kind === "shock") return (
    <g transform={T}>
      <ellipse cx={0} cy={0} rx={10} ry={12} fill="#fff" stroke={INK} strokeWidth={2.2} />
      <circle cx={0} cy={0} r={2.6} fill={INK} />
    </g>
  );
  return <circle cx={x} cy={y} r={3.4 * s} fill={INK} />;
};

export const Mouth: React.FC<{ kind: Face; cx: number }> = ({ kind, cx }) => {
  const T = `translate(${cx},44)`;
  switch (kind) {
    case "grin":
      return (
        <g transform={T}>
          <path d="M-24,-6 Q0,26 24,-6 Q0,0 -24,-6Z" fill="#7a1e22" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
          <path d="M-21,-4 Q0,2 21,-4 L19,2 Q0,6 -19,2Z" fill="#fff" />
        </g>
      );
    case "laugh":
      return (
        <g transform={T}>
          <path d="M-20,-10 Q0,-6 20,-10 Q22,22 0,30 Q-22,22 -20,-10Z" fill="#6a1418" stroke={INK} strokeWidth={2.6} />
          <path d="M-18,-8 Q0,-4 18,-8 L17,-2 Q0,1 -17,-2Z" fill="#fff" />
          <ellipse cx={0} cy={20} rx={10} ry={6} fill="#e0585a" />
        </g>
      );
    case "grit":
      return (
        <g transform={T}>
          <path d="M-22,-6 L22,-6 L18,10 L-18,10Z" fill="#fff" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
          <path d="M-20,2 L20,2 M-10,-6 L-10,10 M0,-6 L0,10 M10,-6 L10,10" stroke={INK} strokeWidth={1.4} />
        </g>
      );
    case "smug":
    case "smirk":
      return <path transform={T} d="M-14,0 Q2,4 16,-6" stroke={INK} strokeWidth={2.8} fill="none" strokeLinecap="round" />;
    case "shock":
      return <ellipse transform={T} cx={0} cy={2} rx={6} ry={8} fill="#5a1418" stroke={INK} strokeWidth={2.4} />;
    case "angry":
      return <path transform={T} d="M-14,2 Q0,-5 14,2" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
    default:
      return <path transform={T} d="M-10,0 L10,0" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />;
  }
};

/** the shared head base: ears, neck, face plate. Hair is drawn by each character. */
export const HeadBase: React.FC<{ turn: number; skin: typeof SKIN; lw: number; jaw?: number; neckW?: number }> = ({ turn, skin, lw, jaw = 1, neckW = 16 }) => (
  <>
    <Part d={tube([[turn * 6, 40], [turn * 6, 110]], [neckW, neckW + 2])} fill={skin.base} shade={skin.shade} lw={lw} sh={[-8, 0]} />
    <Part d={[smooth([[-48 + Math.max(0, turn) * 10, -14], [-62 + Math.max(0, turn) * 10, -8], [-60 + Math.max(0, turn) * 10, 14], [-46 + Math.max(0, turn) * 10, 22]]), smooth([[48 - Math.max(0, -turn) * 10, -14], [62 - Math.max(0, -turn) * 10, -8], [60 - Math.max(0, -turn) * 10, 14], [46 - Math.max(0, -turn) * 10, 22]])]} fill={skin.base} shade={skin.shade} lw={lw} />
    <Part d={faceShape(turn, jaw)} fill={skin.base} shade={skin.shade} lw={lw} sh={[-5, -3]} />
  </>
);

/** spiky hair silhouette: a dome with n spikes of length `spike` */
export const spikyCap = (cx: number, top: number, w: number, bottom: number, n: number, spike: number, seed = 1): string => {
  const pts: P[] = [];
  pts.push([cx - w, bottom]);
  for (let i = 0; i <= n * 2; i++) {
    const a = Math.PI + (i / (n * 2)) * Math.PI;
    const r = i % 2 === 1 ? 1 + (spike / w) * (0.75 + 0.5 * Math.abs(Math.sin(i * 1.7 + seed))) : 1;
    const x = cx + Math.cos(a) * w * r;
    const y = bottom + Math.sin(a) * (bottom - top) * r;
    pts.push([x, y]);
  }
  pts.push([cx + w, bottom]);
  return "M" + pts.map(fx).join("L") + "Z";
};

export const LuffyHead: React.FC<{ face?: Face; turn?: number; lw: number }> = ({ face = "grin", turn = 0, lw }) => {
  const sx = turn * 12;
  return (
    <g>
      {/* hair behind */}
      <Part d={spikyCap(sx * 0.5, -96, 66, 22, 7, 22, 3)} fill="#1a1820" lw={lw} />
      <HeadBase turn={turn} skin={SKIN} lw={lw} />
      {/* bangs */}
      <Part d={"M" + [[-56 + sx, -58], [-48 + sx, -10], [-38 + sx, -46], [-24 + sx, -14], [-14 + sx, -50], [0 + sx, -18], [10 + sx, -52], [24 + sx, -16], [32 + sx, -50], [46 + sx, -12], [56 + sx, -56], [0, -80]].map((p) => fx(p as P)).join("L") + "Z"} fill="#1a1820" lw={lw} />
      <Eye x={-20 + sx} y={-2} kind={face === "focus" ? "sharp" : face === "laugh" ? "laugh" : "round"} />
      <Eye x={21 + sx} y={-2} kind={face === "focus" ? "sharp" : face === "laugh" ? "laugh" : "round"} flip />
      {/* scar under his left eye */}
      <path d={`M${12 + sx},16 Q${22 + sx},20 ${32 + sx},15 M${17 + sx},13 L${16 + sx},21 M${27 + sx},13 L${28 + sx},20`} stroke={INK} strokeWidth={2} fill="none" />
      <path d={`M${sx + 2},14 Q${sx + 6},24 ${sx},26`} stroke={INK} strokeWidth={2} fill="none" />
      <Mouth kind={face === "focus" ? "smirk" : face} cx={sx} />
      {/* the straw hat */}
      <g transform={`translate(${sx * 0.6},0)`}>
        <Part d={smooth([[-110, -50], [-60, -66], [0, -72], [60, -66], [110, -50], [96, -36], [0, -40], [-96, -36]])} fill="#f0c95a" shade="#c9952c" lw={lw} />
        <Part d={smooth([[-46, -60], [-50, -96], [-30, -122], [0, -128], [30, -122], [50, -96], [46, -60], [0, -54]])} fill="#f3d266" shade="#cfa03a" lw={lw} />
        <Part d={smooth([[-48, -62], [-49, -80], [0, -84], [49, -80], [48, -62], [0, -56]])} fill="#d8262c" shade="#9e141e" lw={lw} />
        <path d="M-80,-48 Q0,-60 80,-48" stroke="#b07a20" strokeWidth={1.6} fill="none" opacity={0.6} />
      </g>
    </g>
  );
};

export const ZoroHead: React.FC<{ face?: Face; turn?: number; lw: number }> = ({ face = "calm", turn = 0, lw }) => {
  const sx = turn * 12;
  const open: "sharp" | "half" | "angry" | "closed" | "laugh" = face === "smug" ? "half" : face === "angry" || face === "grit" ? "angry" : face === "laugh" ? "laugh" : "sharp";
  return (
    <g>
      <HeadBase turn={turn} skin={SKIN_TAN} lw={lw} jaw={1.04} neckW={19} />
      {/* earrings on his left ear (viewer's right) */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${56 - Math.max(0, -turn) * 10},${14 + i * 2}) rotate(${-10 + i * 8})`}>
          <path d={`M${-4 + i * 3},0 l0,8 q-4,6 0,12 q4,-6 0,-12`} fill="#f2c230" stroke={INK} strokeWidth={1.4} transform={`translate(${-3 + i * 3},2)`} />
        </g>
      ))}
      <Part d={spikyCap(sx * 0.4, -92, 56, -36, 9, 12, 5)} fill="#7fd36a" shade="#4c9a44" lw={lw} />
      {/* hairline spikes on the forehead */}
      <Part d={"M" + ([[-52 + sx, -40], [-40 + sx, -28], [-30 + sx, -44], [-14 + sx, -34], [0 + sx, -48], [14 + sx, -34], [30 + sx, -44], [40 + sx, -28], [52 + sx, -40], [40 + sx, -60], [-40 + sx, -60]] as P[]).map(fx).join("L") + "Z"} fill="#7fd36a" shade="#4c9a44" lw={lw} />
      {/* brows */}
      <path d={`M${-36 + sx},-16 L${-8 + sx},-10`} stroke={INK} strokeWidth={5} strokeLinecap="round" transform={face === "angry" || face === "grit" ? `rotate(14 ${-20 + sx} -12)` : ""} />
      <path d={`M${8 + sx},-10 L${36 + sx},-16`} stroke={INK} strokeWidth={5} strokeLinecap="round" transform={face === "angry" || face === "grit" ? `rotate(-14 ${20 + sx} -12)` : ""} />
      {/* scarred eye, closed (viewer's left) */}
      <path d={`M${-31 + sx},2 Q${-20 + sx},6 ${-9 + sx},1`} stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <path d={`M${-22 + sx},-22 L${-18 + sx},24`} stroke="#8a3a2a" strokeWidth={2.4} />
      <Eye x={20 + sx} y={0} kind={open} flip />
      <path d={`M${sx + 3},12 L${sx + 6},28 L${sx},30`} stroke={INK} strokeWidth={2} fill="none" />
      <Mouth kind={face === "calm" ? "neutral" : face} cx={sx + 2} />
      {face === "grit" && <path d={`M${44 + sx},-62 l8,8 m4,-14 l-2,12 m10,-4 l-10,4`} stroke="#e02020" strokeWidth={5} strokeLinecap="round" />}
    </g>
  );
};

export const SanjiHead: React.FC<{ face?: Face; turn?: number; lw: number }> = ({ face = "calm", turn = 0, lw }) => {
  const sx = turn * 12;
  const eye = face === "laugh" ? "laugh" : face === "shock" ? "shock" : "half";
  return (
    <g>
      <Part d={smooth([[-60 + sx, 20], [-64 + sx, -40], [-40, -92], [10, -98], [52, -78], [64 + sx, -30], [58 + sx, 10], [50 + sx, -20], [40 + sx, -50]])} fill="#f5d84a" shade="#c9a420" lw={lw} />
      <HeadBase turn={turn} skin={SKIN} lw={lw} jaw={1.06} />
      {/* goatee */}
      <path d={`M${sx - 6},${66} q6,8 12,0 l-2,-6 h-8Z`} fill="#e3c03a" stroke={INK} strokeWidth={1.4} />
      {/* visible eye + curly brow (viewer's right) */}
      <Eye x={21 + sx} y={0} kind={eye} flip />
      <path d={`M${8 + sx},-14 q2,-8 8,-6 q4,3 -1,5 M${10 + sx},-14 Q${24 + sx},-22 ${38 + sx},-14`} stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" />
      <path d={`M${sx + 4},12 L${sx + 7},28 L${sx + 1},30`} stroke={INK} strokeWidth={2} fill="none" />
      <Mouth kind={face === "calm" ? "smirk" : face} cx={sx + 4} />
      {/* fringe sweeping over the left eye */}
      <Part d={smooth([[-62 + sx, -40], [-30, -88], [20, -86], [46 + sx, -60], [30 + sx, -50], [12 + sx, -30], [-2 + sx, 0], [-14 + sx, 26], [-30 + sx, 34], [-52 + sx, 26]])} fill="#f8e05a" shade="#cfa824" lw={lw} />
      <path d={`M${-10 + sx},-60 Q${-24 + sx},-20 ${-30 + sx},20 M${10 + sx},-62 Q${-4 + sx},-30 ${-10 + sx},4`} stroke="#b8901c" strokeWidth={2} fill="none" />
    </g>
  );
};

export const RegularHead: React.FC<{ face?: Face; turn?: number; lw: number }> = ({ face = "blank", turn = 0, lw }) => {
  const sx = turn * 12;
  const ek = face === "shock" ? "shock" : "dot";
  return (
    <g>
      <Part d={circ([sx * 0.3, -104], 18)} fill="#1c1a22" lw={lw} />
      <Part d={smooth([[-54, 10], [-56, -50], [-30, -86], [20, -88], [54, -54], [54, 10], [40, -36], [-40, -36]])} fill="#1c1a22" lw={lw} />
      <HeadBase turn={turn} skin={SKIN} lw={lw} />
      <Part d={smooth([[-54 + sx, -20], [-40, -76], [30, -80], [54 + sx, -24], [30 + sx, -46], [-30 + sx, -46]])} fill="#1c1a22" lw={lw} />
      <Eye x={-19 + sx} y={2} kind={ek} s={face === "shock" ? 1.05 : 1} />
      <Eye x={19 + sx} y={2} kind={ek} s={face === "shock" ? 1.05 : 1} flip />
      <path d={`M${-28 + sx},-14 l16,-2 M${12 + sx},-16 l16,2`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${sx},16 l2,12`} stroke={INK} strokeWidth={2} />
      <Mouth kind={face === "shock" ? "shock" : "neutral"} cx={sx} />
    </g>
  );
};

/* --------------------------------- bodies ----------------------------------- */

export type BodyProps = { p: Pose; lw?: number; face?: Face; x?: number; y?: number; s?: number; flipX?: boolean; children?: React.ReactNode; held?: { L?: BallKey; R?: BallKey; head?: BallKey; r?: number } };

export const armDir = (el: P, ha: P) => ang(el, ha);
export const Wrap: React.FC<{ x: number; y: number; s: number; flipX?: boolean; children: React.ReactNode }> = ({ x, y, s, flipX, children }) => (
  <g transform={`translate(${x},${y}) scale(${flipX ? -s : s},${s})`}>{children}</g>
);
const HeldBall: React.FC<{ at: P; c?: BallKey; r: number; lw: number; dy?: number }> = ({ at, c, r, lw, dy = -0.75 }) =>
  c ? <Ball x={at[0]} y={at[1] + r * dy} r={r} c={c} lw={lw * 1.1} holes /> : null;

export const Luffy: React.FC<BodyProps> = ({ p, lw = 4, face = "grin", x = 0, y = 0, s = 1, flipX, held }) => {
  const skin = SKIN;
  const leg = (hip: P, kn: P, ft: P, fd = 0, key: string) => {
    const cuff = mix(hip, kn, 0.98);
    const d = ang(hip, kn);
    return (
      <g key={key}>
        <Part d={tube([mix(hip, kn, 0.7), kn, ft], [15, 13, 10])} fill={skin.base} shade={skin.shade} lw={lw} />
        <g transform={`translate(${ft[0]},${ft[1] + 6})`}>
          <Part d={footShape(fd)} fill={skin.base} shade={skin.shade} lw={lw} />
          <Part d={footShape(fd).replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (_m, a, b) => `${(+a * 1.08).toFixed(1)},${(+b * 0.5 + 8).toFixed(1)}`)} fill="#8a4a24" lw={lw * 0.8} />
        </g>
        <Part d={tube([hip, cuff], [38, 36])} fill="#2f6fd0" shade="#1d4a98" lw={lw} />
        <g transform={`translate(${cuff[0]},${cuff[1]}) rotate(${d - 90})`}>
          <Part d={"M-40,-8 " + Array.from({ length: 8 }, (_, i) => `q${5},${i % 2 ? 12 : 16} 10,0`).join(" ") + " L40,-12 Q0,-20 -40,-8Z"} fill="#f4f1ea" shade="#c9c2b4" lw={lw} />
        </g>
      </g>
    );
  };
  const arm = (sh: P, el: P, ha: P, hk: HandKind, side: number, key: string) => (
    <g key={key}>
      <Part d={tube([sh, el, ha], [17, 14, 12])} fill={skin.base} shade={skin.shade} lw={lw} />
      <Part d={tube([sh, el, mix(el, ha, 0.6)], [25, 22, 21])} fill="#e0262e" shade="#9e1420" lw={lw} />
      <Hand at={ha} dir={armDir(el, ha)} kind={hk} skin={skin.base} shade={skin.shade} lw={lw} flip={side < 0} />
    </g>
  );
  const T = torsoPts(p, 0.2, 18);
  const midH = mix(p.hipL, p.hipR, 0.5);
  const waistL = T[8], waistR = T[5];
  return (
    <Wrap x={x} y={y} s={s} flipX={flipX}>
      {p.backL && arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {p.backR && arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      {leg(p.hipL, p.knL, p.ftL, p.fdL, "lL")}
      {leg(p.hipR, p.knR, p.ftR, p.fdR, "lR")}
      {/* bare chest */}
      <Part d={smooth(T)} fill={skin.base} shade={skin.shade} lw={lw} sh={[-10, -4]}>
        {/* pecs and abs */}
        <path d={smooth([mix(p.neck, p.shL, 0.55), mix(mix(p.shL, waistL, 0.35), p.neck, 0.3), mix(mix(p.shL, p.shR, 0.5), waistL, 0.25)], false)} stroke={INK} strokeWidth={2.4} fill="none" />
        <path d={smooth([mix(p.neck, p.shR, 0.55), mix(mix(p.shR, waistR, 0.35), p.neck, 0.3), mix(mix(p.shL, p.shR, 0.5), waistR, 0.25)], false)} stroke={INK} strokeWidth={2.4} fill="none" />
        {/* the X scar */}
        <path d={`M${fx(mix(mix(p.shL, p.shR, 0.5), waistL, 0.12))}L${fx(mix(mix(p.shL, p.shR, 0.5), waistR, 0.42))}M${fx(mix(mix(p.shL, p.shR, 0.5), waistR, 0.12))}L${fx(mix(mix(p.shL, p.shR, 0.5), waistL, 0.42))}`} stroke="#b05a3a" strokeWidth={4} />
        {[0.5, 0.65, 0.8].map((t) => <path key={t} d={`M${fx(mix(mix(waistL, waistR, 0.38), mix(p.shL, p.shR, 0.4), 1 - t))}l14,2 M${fx(mix(mix(waistL, waistR, 0.62), mix(p.shL, p.shR, 0.6), 1 - t))}l-14,2`} stroke={INK} strokeWidth={2} />)}
      </Part>
      {/* shorts seat */}
      <Part d={smooth([add(waistL, [-4, 16]), add(waistR, [4, 16]), add(p.hipR, [18, 30]), add(midH, [0, 40]), add(p.hipL, [-18, 30])])} fill="#2f6fd0" shade="#1d4a98" lw={lw} />
      {/* the open red shirt: two panels */}
      <Part d={smooth([p.shL, mix(p.neck, p.shL, 0.25), mix(mix(p.neck, waistL, 0.55), p.shL, 0.05), mix(waistL, waistR, 0.18), add(waistL, [-8, 20]), T[9]])} fill="#e0262e" shade="#9e1420" lw={lw} />
      <Part d={smooth([p.shR, mix(p.neck, p.shR, 0.25), mix(mix(p.neck, waistR, 0.55), p.shR, 0.05), mix(waistR, waistL, 0.18), add(waistR, [8, 20]), T[4]])} fill="#e0262e" shade="#9e1420" lw={lw} />
      {/* yellow sash with a knot and long tail */}
      <Part d={smooth([add(waistL, [-10, -6]), add(waistR, [10, -6]), add(waistR, [8, 40]), add(waistL, [-8, 40])])} fill="#f6c51c" shade="#c48a0a" lw={lw} />
      <Part d={smooth([add(waistR, [-24, 10]), add(waistR, [4, 14]), add(waistR, [22, 110]), add(waistR, [16, 210]), add(waistR, [-4, 214]), add(waistR, [-6, 110])])} fill="#f6c51c" shade="#c48a0a" lw={lw} />
      {!p.backL && arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {!p.backR && arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}><LuffyHead face={face} turn={p.turn} lw={lw} /></g>
      {held && <HeldBall at={p.haL} c={held.L} r={held.r ?? 64} lw={lw} />}
      {held && <HeldBall at={p.haR} c={held.R} r={held.r ?? 64} lw={lw} />}
    </Wrap>
  );
};

export const Zoro: React.FC<BodyProps> = ({ p, lw = 4, face = "calm", x = 0, y = 0, s = 1, flipX, held, children }) => {
  const skin = SKIN_TAN;
  const robe = "#2f6a3a", robeSh = "#1c4426";
  const T = torsoPts(p, 0.1, 26);
  const waistL = T[8], waistR = T[5];
  const kneeY = (p.knL[1] + p.knR[1]) / 2;
  const hemL = add(p.knL, [-50, 118 + (p.knL[1] - kneeY) * 0.2]), hemR = add(p.knR, [50, 118 + (p.knR[1] - kneeY) * 0.2]);
  const midS = mix(p.shL, p.shR, 0.5);
  const vBot = mix(midS, mix(waistL, waistR, 0.5), 0.92);
  const leg = (hip: P, kn: P, ft: P, fd = 0, key: string) => (
    <g key={key}>
      <Part d={tube([hip, kn, ft], [25, 21, 18])} fill="#26262e" shade="#15151a" lw={lw} />
      <Part d={tube([mix(kn, ft, 0.45), ft], [21, 20])} fill="#1a1a20" shade="#0c0c10" lw={lw} />
      <g transform={`translate(${ft[0]},${ft[1] + 4})`}><Part d={footShape(fd, 1.05)} fill="#1a1a20" shade="#0c0c10" lw={lw} /></g>
    </g>
  );
  const arm = (sh: P, el: P, ha: P, hk: HandKind, side: number, key: string) => (
    <g key={key}>
      <Part d={tube([sh, el, ha], [19, 16, 13])} fill={skin.base} shade={skin.shade} lw={lw} />
      <Part d={tube([sh, el, mix(el, ha, 0.32)], [30, 30, 33])} fill={robe} shade={robeSh} lw={lw} />
      <Hand at={ha} dir={armDir(el, ha)} kind={hk} skin={skin.base} shade={skin.shade} lw={lw} s={1.05} flip={side < 0} />
    </g>
  );
  return (
    <Wrap x={x} y={y} s={s} flipX={flipX}>
      {p.backL && arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {p.backR && arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      {leg(p.hipL, p.knL, p.ftL, p.fdL, "lL")}
      {leg(p.hipR, p.knR, p.ftR, p.fdR, "lR")}
      {/* sheaths behind the robe */}
      {[0, 1, 2].map((i) => <Part key={`sh${i}`} d={tube([add(waistL, [-10 + i * 8, 30]), add(waistL, [-60 + i * 22, 330 + i * 10])], [6, 6])} fill={["#202028", "#2a1a14", "#5a1a1a"][i]} lw={lw * 0.8} />)}
      {/* robe body */}
      <Part d={smooth(T)} fill={robe} shade={robeSh} lw={lw} />
      {/* robe skirt, split down the front */}
      <Part d={smooth([add(waistL, [-6, 0]), add(mix(waistL, waistR, 0.5), [0, 10]), add(mix(p.hipL, p.hipR, 0.5), [6, 120]), add(mix(hemL, hemR, 0.5), [-6, 0]), hemL, add(p.hipL, [-40, 60])], true, 0.5)} fill={robe} shade={robeSh} lw={lw} />
      <Part d={smooth([add(waistR, [6, 0]), add(p.hipR, [44, 60]), hemR, add(mix(hemL, hemR, 0.5), [14, 6]), add(mix(p.hipL, p.hipR, 0.5), [4, 110]), add(mix(waistL, waistR, 0.5), [-4, 10])], true, 0.5)} fill={robe} shade={robeSh} lw={lw}>
        <path d={`M${fx(add(p.hipR, [10, 80]))}L${fx(add(hemR, [-30, -20]))}`} stroke={INK} strokeWidth={2} />
      </Part>
      {/* open chest */}
      <Part d={smooth([mix(p.neck, p.shL, 0.42), mix(p.neck, p.shR, 0.42), add(vBot, [10, -40]), vBot, add(vBot, [-10, -40])], true, 0.6)} fill={skin.base} shade={skin.shade} lw={lw}>
        <path d={smooth([mix(midS, p.shL, 0.4), add(mix(midS, vBot, 0.35), [-30, 0]), add(mix(midS, vBot, 0.38), [0, 4])], false)} stroke={INK} strokeWidth={2.4} fill="none" />
        <path d={smooth([mix(midS, p.shR, 0.4), add(mix(midS, vBot, 0.35), [30, 0]), add(mix(midS, vBot, 0.38), [0, 4])], false)} stroke={INK} strokeWidth={2.4} fill="none" />
        {/* the big diagonal scar with stitches */}
        <path d={`M${fx(mix(midS, p.shL, 0.45))}L${fx(add(vBot, [26, -20]))}`} stroke="#8a4a2a" strokeWidth={4} />
        {[0.2, 0.35, 0.5, 0.65, 0.8].map((t) => { const c = mix(mix(midS, p.shL, 0.45), add(vBot, [26, -20]), t); return <path key={t} d={`M${fx(add(c, [-7, -6]))}L${fx(add(c, [7, 6]))}`} stroke="#8a4a2a" strokeWidth={2} />; })}
      </Part>
      {/* haramaki */}
      <Part d={smooth([add(mix(midS, vBot, 0.62), [-40, 0]), add(mix(midS, vBot, 0.62), [40, 0]), add(vBot, [14, 10]), add(vBot, [-14, 10])], true, 0.4)} fill="#a6e04a" shade="#6aa82a" lw={lw * 0.8} />
      {/* lapels */}
      <path d={`M${fx(mix(p.neck, p.shL, 0.42))}L${fx(vBot)}L${fx(mix(p.neck, p.shR, 0.42))}`} stroke={INK} strokeWidth={lw} fill="none" />
      {/* maroon sash + long tail */}
      <Part d={smooth([add(waistL, [-14, -10]), add(waistR, [14, -10]), add(waistR, [12, 46]), add(waistL, [-12, 46])], true, 0.5)} fill="#8a2a3c" shade="#5a1626" lw={lw} />
      <Part d={smooth([add(waistR, [-22, 20]), add(waistR, [8, 20]), add(waistR, [30, 160]), add(waistR, [30, 330]), add(waistR, [8, 334]), add(waistR, [4, 160])])} fill="#8a2a3c" shade="#5a1626" lw={lw} />
      {/* katana hilts poking out at the left hip */}
      {[0, 1, 2].map((i) => (
        <g key={`k${i}`}>
          <Part d={tube([add(waistL, [8 + i * 6, 10 + i * 4]), add(waistL, [-62 + i * 10, -66 + i * 14])], [7, 7])} fill={["#f2f0ea", "#e8e4dc", "#c83030"][i]} lw={lw * 0.8} />
          <path d={`M${fx(add(waistL, [-10 + i * 6, -8 + i * 4]))}l-8,-4 l16,-10`} stroke="#d0a030" strokeWidth={5} />
        </g>
      ))}
      {!p.backL && arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {!p.backR && arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}><ZoroHead face={face} turn={p.turn} lw={lw} /></g>
      {held?.head && <Ball x={p.head[0]} y={p.head[1] - 92 - (held.r ?? 62)} r={held.r ?? 62} c={held.head} lw={lw * 1.1} holes />}
      {held && <HeldBall at={add(p.haL, [-10, 0])} c={held.L} r={held.r ?? 62} lw={lw} dy={-0.9} />}
      {held && <HeldBall at={add(p.haR, [10, 0])} c={held.R} r={held.r ?? 62} lw={lw} dy={-0.9} />}
      {children}
    </Wrap>
  );
};

export const Sanji: React.FC<BodyProps> = ({ p, lw = 4, face = "calm", x = 0, y = 0, s = 1, flipX, held }) => {
  const skin = SKIN;
  const suit = "#232a44", suitSh = "#121628";
  const T = torsoPts(p, 0.14, 22);
  const waistL = T[8], waistR = T[5];
  const midS = mix(p.shL, p.shR, 0.5);
  const midH = mix(p.hipL, p.hipR, 0.5);
  const vBot = mix(midS, midH, 0.45);
  const leg = (hip: P, kn: P, ft: P, fd = 0, key: string) => (
    <g key={key}>
      <Part d={tube([hip, kn, ft], [24, 20, 17])} fill={suit} shade={suitSh} lw={lw} />
      <g transform={`translate(${ft[0]},${ft[1] + 4})`}><Part d={footShape(fd, 1.05)} fill="#141418" shade="#050508" lw={lw} /></g>
    </g>
  );
  const arm = (sh: P, el: P, ha: P, hk: HandKind, side: number, key: string) => (
    <g key={key}>
      {hk !== "pocket" && <Hand at={ha} dir={armDir(el, ha)} kind={hk} skin={skin.base} shade={skin.shade} lw={lw} flip={side < 0} />}
      <Part d={tube([sh, el, hk === "pocket" ? ha : mix(el, ha, 0.92)], [20, 17, 16])} fill={suit} shade={suitSh} lw={lw} />
    </g>
  );
  return (
    <Wrap x={x} y={y} s={s} flipX={flipX}>
      {p.backL && arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {p.backR && arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      {leg(p.hipL, p.knL, p.ftL, p.fdL, "lL")}
      {leg(p.hipR, p.knR, p.ftR, p.fdR, "lR")}
      {/* jacket, hem below the hips */}
      <Part d={smooth([...T.slice(0, 6), add(p.hipR, [26, 70]), add(midH, [0, 84]), add(p.hipL, [-26, 70]), ...T.slice(8)])} fill={suit} shade={suitSh} lw={lw}>
        <path d={`M${fx(add(midH, [0, 84]))}L${fx(add(vBot, [0, 60]))}`} stroke="#0a0c18" strokeWidth={2.4} />
        {[0, 1, 2].map((i) => [-1, 1].map((sd) => <circle key={`${i}${sd}`} cx={vBot[0] + sd * 26} cy={vBot[1] + 40 + i * 52} r={6} fill="#e8b830" stroke={INK} strokeWidth={1.5} />))}
        <path d={`M${fx(add(p.hipL, [0, 0]))}l40,4 M${fx(add(p.hipR, [-40, 4]))}l40,-4`} stroke="#0a0c18" strokeWidth={2.4} />
      </Part>
      {/* shirt + tie */}
      <Part d={smooth([mix(p.neck, p.shL, 0.28), mix(p.neck, p.shR, 0.28), vBot], true, 0.3)} fill="#f2b62a" shade="#c48a10" lw={lw * 0.8} />
      <Part d={smooth([add(p.neck, [-6, 12]), add(p.neck, [6, 12]), add(vBot, [6, -10]), add(vBot, [0, 4]), add(vBot, [-6, -10])], true, 0.3)} fill="#1a1a24" lw={lw * 0.6} />
      {/* lapels */}
      <path d={`M${fx(mix(p.neck, p.shL, 0.3))}L${fx(add(vBot, [-6, 10]))}M${fx(mix(p.neck, p.shR, 0.3))}L${fx(add(vBot, [6, 10]))}`} stroke="#0a0c18" strokeWidth={3} />
      {!p.backL && arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {!p.backR && arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}><SanjiHead face={face} turn={p.turn} lw={lw} /></g>
      {held && <HeldBall at={p.haL} c={held.L} r={held.r ?? 62} lw={lw} />}
      {held && <HeldBall at={p.haR} c={held.R} r={held.r ?? 62} lw={lw} />}
    </Wrap>
  );
};

export const Regular: React.FC<BodyProps> = ({ p, lw = 4, face = "blank", x = 0, y = 0, s = 1, flipX }) => {
  const skin = SKIN;
  const T = torsoPts(p, 0.06, 16);
  const midH = mix(p.hipL, p.hipR, 0.5);
  const leg = (hip: P, kn: P, ft: P, fd = 0, key: string) => (
    <g key={key}>
      <Part d={tube([hip, kn, ft], [25, 22, 19])} fill="#4a4a26" shade="#2e2e16" lw={lw} />
      <g transform={`translate(${ft[0]},${ft[1] + 4})`}><Part d={footShape(fd)} fill="#18181c" lw={lw} /></g>
    </g>
  );
  const arm = (sh: P, el: P, ha: P, hk: HandKind, side: number, key: string) => (
    <g key={key}>
      <Part d={tube([sh, el, ha], [16, 13, 11])} fill={skin.base} shade={skin.shade} lw={lw} />
      <Part d={tube([sh, mix(sh, el, 0.62)], [25, 23])} fill="#8fe0ec" shade="#5ab0c4" lw={lw} />
      <Hand at={ha} dir={armDir(el, ha)} kind={hk} skin={skin.base} shade={skin.shade} lw={lw} flip={side < 0} />
    </g>
  );
  return (
    <Wrap x={x} y={y} s={s} flipX={flipX}>
      {leg(p.hipL, p.knL, p.ftL, p.fdL, "lL")}
      {leg(p.hipR, p.knR, p.ftR, p.fdR, "lR")}
      <Part d={smooth([add(T[8], [-6, 0]), add(T[5], [6, 0]), add(p.hipR, [18, 10]), add(midH, [0, 26]), add(p.hipL, [-18, 10])])} fill="#4a4a26" shade="#2e2e16" lw={lw} />
      <Part d={smooth([...T.slice(0, 6), add(p.hipR, [20, -10]), add(p.hipL, [-20, -10]), ...T.slice(8)])} fill="#8fe0ec" shade="#5ab0c4" lw={lw}>
        <path d={smooth([add(p.neck, [-30, 12]), add(p.neck, [0, 26]), add(p.neck, [30, 12])], false)} stroke={INK} strokeWidth={2.4} fill="none" />
      </Part>
      {arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}><RegularHead face={face} turn={p.turn} lw={lw} /></g>
    </Wrap>
  );
};

/** Luffy's rubber arm: a long skin tube from `from` to the hand at `to`, red sleeve at the start */
export const RubberArm: React.FC<{ from: P; to: P; w: number; lw: number; hand?: HandKind; sag?: number }> = ({ from, to, w, lw, hand = "open", sag = 0 }) => {
  const mid = add(mix(from, to, 0.5), [0, sag]);
  const d = ang(mix(from, to, 0.9), to);
  return (
    <g>
      <Part d={tube([from, mid, to], [w, w * 0.92, w * 0.85])} fill={SKIN.base} shade={SKIN.shade} lw={lw} sh={[0, -w * 0.35]} />
      <Hand at={to} dir={d} kind={hand} skin={SKIN.base} shade={SKIN.shade} lw={lw} s={w / 18} />
    </g>
  );
};

import React, { useId } from "react";
import { INK } from "../common";

/**
 * Kit v2 drawing primitives. Everything on screen is built from these:
 * a Catmull-Rom `smooth` outline, a tapered `tube` for limbs, and `Part`,
 * which paints a shape the house way — thick near-black outline, one hard
 * cel shadow tone on the lower-right, flat base colour nudged to the light.
 *
 * Also here: the face engine (eyes, brows, mouths as named kinds so every
 * character shares one expressive vocabulary), hands with fingers, and feet
 * with shoes. Head space: eye line y=0, chin ≈ +72, crown ≈ -86, ±56 wide.
 */

export type P = [number, number];
export const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
export const len = (a: P) => Math.hypot(a[0], a[1]);
export const nrm = (a: P): P => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
export const mix = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const ang = (a: P, b: P) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
export const perp = (a: P, b: P): P => { const t = nrm(sub(b, a)); return [-t[1], t[0]]; };
export const fx = (p: P) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
export const rnd = (i: number, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

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
export const poly = (pts: P[]) => "M" + pts.map(fx).join("L") + "Z";

/** a tapered tube through the points with round caps — arms, legs, fingers */
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
export const ell = (c: P, rx: number, ry: number) => `M${c[0] - rx},${c[1]}a${rx},${ry} 0 1 0 ${rx * 2},0a${rx},${ry} 0 1 0 ${-rx * 2},0Z`;
export const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(w - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(h - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z`;

/** an outlined, cel-shaded shape (or union of shapes) */
export const Part: React.FC<{ d: string | string[]; fill: string; shade?: string; lw: number; sh?: P; noLine?: boolean; ink?: string; opacity?: number; children?: React.ReactNode }> = ({ d, fill, shade, lw, sh, noLine, ink = INK, opacity, children }) => {
  const id = "k2" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const ds = Array.isArray(d) ? d.filter(Boolean) : [d];
  const paths = ds.map((p, i) => <path key={i} d={p} />);
  const s = sh ?? [-lw * 2.2, -lw * 1.5];
  return (
    <g opacity={opacity}>
      {!noLine && <g fill={ink} stroke={ink} strokeWidth={lw * 2} strokeLinejoin="round">{paths}</g>}
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

/* ---------------------------------- skin ---------------------------------- */

export type Skin = { base: string; shade: string };
export const SKIN: Skin = { base: "#f7cba3", shade: "#dc9a6e" };
export const SKIN_TAN: Skin = { base: "#ecb382", shade: "#c47e52" };
export const SKIN_PALE: Skin = { base: "#f6d6b4", shade: "#d9a884" };
export const SKIN_GREY: Skin = { base: "#e6e8ec", shade: "#b9bec8" };

/* ---------------------------------- eyes ---------------------------------- */

export type EyeKind = "round" | "sharp" | "half" | "closed" | "content" | "angry" | "shock" | "dot" | "x" | "money" | "heart" | "spiral" | "blank" | "tear" | "squint" | "wide";

/** one eye in head space. `flip` mirrors it for the viewer's-right eye. */
export const Eye: React.FC<{ x: number; y: number; kind: EyeKind; flip?: boolean; s?: number; iris?: string; lash?: boolean; ink?: string }> = ({ x, y, kind, flip, s = 1, iris = "#2a1c14", lash, ink = INK }) => {
  const k = flip ? -1 : 1;
  const T = `translate(${x},${y}) scale(${k * s},${s})`;
  const lid = (d: string, w = 4.6) => <path d={d} stroke={ink} strokeWidth={w} fill="none" strokeLinecap="round" />;
  const lashes = lash ? <path d="M12,-14 l5,-6 M16,-9 l7,-3 M4,-16 l2,-7" stroke={ink} strokeWidth={3} strokeLinecap="round" /> : null;
  switch (kind) {
    case "round":
    case "wide": {
      const rx = kind === "wide" ? 16 : 14, ry = kind === "wide" ? 18 : 16;
      return (
        <g transform={T}>
          <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="#fff" stroke={ink} strokeWidth={2} />
          <ellipse cx={2} cy={2} rx={8.5} ry={11} fill={iris} />
          <ellipse cx={2.5} cy={3} rx={4.5} ry={6} fill={ink} />
          <circle cx={-1.5} cy={-4} r={3.2} fill="#fff" />
          {lid(`M${-rx - 1},-7 Q0,${-ry - 4} ${rx + 1},-8`, 5.2)}
          {lashes}
        </g>
      );
    }
    case "sharp":
      return (
        <g transform={T}>
          <path d="M-17,-2 Q-4,-13 16,-7 Q12,6 -2,7 Q-13,6 -17,-2Z" fill="#fff" stroke={ink} strokeWidth={2} />
          <circle cx={3} cy={-1} r={5.5} fill={iris} />
          <circle cx={3.5} cy={-0.5} r={2.6} fill={ink} />
          {lid("M-18,-1 Q-4,-15 18,-8", 5)}
        </g>
      );
    case "half":
      return (
        <g transform={T}>
          <path d="M-16,1 Q0,-3 16,-1 Q10,8 -2,8 Q-12,7 -16,1Z" fill="#fff" stroke={ink} strokeWidth={1.8} />
          <circle cx={3} cy={3} r={4.6} fill={iris} />
          {lid("M-17,1 Q0,-6 17,-2", 5.2)}
        </g>
      );
    case "squint":
      return <g transform={T}>{lid("M-15,0 Q0,-2 15,-1", 5.2)}</g>;
    case "angry":
      return (
        <g transform={T}>
          <path d="M-16,-7 L16,2 Q8,9 -4,8 Q-13,5 -16,-7Z" fill="#fff" stroke={ink} strokeWidth={2} />
          <circle cx={2} cy={3} r={4} fill={ink} />
          {lid("M-18,-9 L18,1", 5.4)}
        </g>
      );
    case "closed":
      return <g transform={T}>{lid("M-15,-2 Q0,9 15,-2", 4.6)}{lashes}</g>;
    case "content":
      return <g transform={T}>{lid("M-15,3 Q0,-9 15,3", 4.6)}</g>;
    case "shock":
      return (
        <g transform={T}>
          <ellipse cx={0} cy={0} rx={15} ry={17} fill="#fff" stroke={ink} strokeWidth={2.4} />
          <circle cx={1} cy={1} r={3.2} fill={ink} />
        </g>
      );
    case "blank":
      return <g transform={T}><ellipse cx={0} cy={0} rx={14} ry={16} fill="#fff" stroke={ink} strokeWidth={2.2} /></g>;
    case "x":
      return <g transform={T}><path d="M-10,-10 L10,10 M10,-10 L-10,10" stroke={ink} strokeWidth={5} strokeLinecap="round" /></g>;
    case "money":
      return (
        <g transform={T}>
          <circle cx={0} cy={0} r={16} fill="#ffd23a" stroke={ink} strokeWidth={2.4} />
          <text x={0} y={8} textAnchor="middle" fontFamily="Poppins Black" fontSize={24} fill="#9a640a" transform={`scale(${k},1)`}>฿</text>
        </g>
      );
    case "heart":
      return <g transform={T}><path d="M0,14 C-20,0 -16,-16 -4,-12 Q0,-10 0,-5 Q0,-10 4,-12 C16,-16 20,0 0,14Z" fill="#ff3a6a" stroke={ink} strokeWidth={2.4} /></g>;
    case "spiral":
      return <g transform={T}><path d="M0,0 m-2,0 a2,2 0 1 1 4,0 a5,5 0 1 1 -10,0 a8,8 0 1 1 16,0 a11,11 0 1 1 -22,0 a14,14 0 1 1 28,0" stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" /></g>;
    case "tear":
      return (
        <g transform={T}>
          <ellipse cx={0} cy={0} rx={14} ry={16} fill="#fff" stroke={ink} strokeWidth={2} />
          <ellipse cx={1} cy={3} rx={8} ry={10} fill={iris} />
          <path d="M-14,8 Q0,24 14,8" fill="#8fd4ff" opacity={0.85} />
          <path d="M-6,16 q-2,20 4,26 q6,-6 2,-22Z" fill="#8fd4ff" stroke={ink} strokeWidth={1.4} />
          {lid("M-15,-7 Q0,-19 15,-8", 5)}
        </g>
      );
    default:
      return <circle cx={x} cy={y} r={4 * s} fill={ink} />;
  }
};

/* ---------------------------------- brows --------------------------------- */

export type BrowKind = "flat" | "up" | "down" | "worry" | "none" | "thick" | "thickDown" | "thickUp";

export const Brows: React.FC<{ kind: BrowKind; sx?: number; c?: string; y?: number; gap?: number; ink?: string }> = ({ kind, sx = 0, c, y = -24, gap = 10, ink = INK }) => {
  if (kind === "none") return null;
  const col = c ?? ink;
  const o = gap, i = gap + 28;
  const thick = kind.startsWith("thick");
  if (thick) {
    const base = kind === "thickDown" ? [-6, 6] : kind === "thickUp" ? [8, -6] : [0, 0];
    const d = (s: number) => `M${s * i + sx},${y - 4 + base[0]} Q${s * (i + o) / 2 + sx},${y - 10 + (base[0] + base[1]) / 2} ${s * o + sx},${y + base[1]} L${s * o + sx},${y + 8 + base[1]} Q${s * (i + o) / 2 + sx},${y + 2 + (base[0] + base[1]) / 2} ${s * i + sx},${y + 6 + base[0]}Z`;
    return <g><path d={d(-1)} fill={col} stroke={ink} strokeWidth={1.8} strokeLinejoin="round" /><path d={d(1)} fill={col} stroke={ink} strokeWidth={1.8} strokeLinejoin="round" /></g>;
  }
  let dOut = 0, dIn = 0, yy = y;
  if (kind === "up") { yy = y - 12; dOut = 2; dIn = -2; }
  if (kind === "down") { dOut = -8; dIn = 10; }
  if (kind === "worry") { dOut = 2; dIn = -10; yy = y - 4; }
  return (
    <g stroke={col} strokeWidth={6} strokeLinecap="round" fill="none">
      <path d={`M${-i + sx},${yy + dOut} Q${-(i + o) / 2 + sx},${yy - 6 + (dOut + dIn) / 2} ${-o + sx},${yy + dIn}`} />
      <path d={`M${i + sx},${yy + dOut} Q${(i + o) / 2 + sx},${yy - 6 + (dOut + dIn) / 2} ${o + sx},${yy + dIn}`} />
    </g>
  );
};

/* ---------------------------------- mouths -------------------------------- */

export type MouthKind = "line" | "smile" | "grin" | "bigGrin" | "smirk" | "frown" | "o" | "shout" | "grit" | "wobble" | "sob" | "stuffed" | "tongue" | "cat" | "flat" | "yell" | "pout";
const RED = "#7a1e22", RED_D = "#5a1418", TONGUE = "#e0585a";

export const Mouth: React.FC<{ kind: MouthKind; cx?: number; y?: number; s?: number; ink?: string }> = ({ kind, cx = 0, y = 46, s = 1, ink = INK }) => {
  const T = `translate(${cx},${y}) scale(${s})`;
  const st = { stroke: ink, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (kind) {
    case "smile":
      return <path transform={T} d="M-18,-2 Q0,12 18,-2" {...st} strokeWidth={3.4} fill="none" />;
    case "grin":
      return (
        <g transform={T}>
          <path d="M-28,-6 Q0,2 28,-6 Q22,24 0,26 Q-22,24 -28,-6Z" fill={RED} {...st} strokeWidth={3} />
          <path d="M-25,-4 Q0,3 25,-4 L23,6 Q0,11 -23,6Z" fill="#fff" />
          <path d="M-32,-10 q-2,5 1,10 M32,-10 q2,5 -1,10" {...st} strokeWidth={2.2} fill="none" />
        </g>
      );
    case "bigGrin":
      return (
        <g transform={T}>
          <path d="M-36,-10 Q0,-2 36,-10 Q30,30 0,34 Q-30,30 -36,-10Z" fill={RED} {...st} strokeWidth={3} />
          <path d="M-32,-7 Q0,0 32,-7 L29,6 Q0,12 -29,6Z" fill="#fff" />
          <ellipse cx={0} cy={24} rx={12} ry={6} fill={TONGUE} />
        </g>
      );
    case "smirk":
      return <path transform={T} d="M-16,2 Q4,8 20,-8" {...st} strokeWidth={3.4} fill="none" />;
    case "frown":
      return <path transform={T} d="M-16,6 Q0,-6 16,6" {...st} strokeWidth={3.4} fill="none" />;
    case "pout":
      return <path transform={T} d="M-10,4 Q0,-2 10,4" {...st} strokeWidth={3.6} fill="none" />;
    case "o":
      return <ellipse transform={T} cx={0} cy={4} rx={8} ry={11} fill={RED_D} {...st} strokeWidth={2.8} />;
    case "shout":
      return (
        <g transform={T}>
          <path d="M-26,-8 Q0,-14 26,-8 Q30,22 0,36 Q-30,22 -26,-8Z" fill={RED_D} {...st} strokeWidth={3} />
          <path d="M-22,-6 Q0,-11 22,-6 L20,0 Q0,5 -20,0Z" fill="#fff" />
          <path d="M-12,34 Q0,20 12,34Z" fill={TONGUE} />
        </g>
      );
    case "yell":
      return (
        <g transform={T}>
          <path d="M-26,-4 L26,-4 L20,30 L-20,30Z" fill={RED_D} {...st} strokeWidth={3} />
          <path d="M-24,-3 L24,-3 L23,5 L-23,5Z" fill="#fff" />
          <path d="M-14,30 Q0,16 14,30Z" fill={TONGUE} />
        </g>
      );
    case "grit":
      return (
        <g transform={T}>
          <path d="M-26,-6 L26,-6 L22,12 L-22,12Z" fill="#fff" {...st} strokeWidth={3} />
          <path d="M-24,3 L24,3 M-13,-6 L-13,12 M0,-6 L0,12 M13,-6 L13,12" stroke={ink} strokeWidth={1.6} />
        </g>
      );
    case "wobble":
      return <path transform={T} d="M-22,2 q5,-8 11,0 t11,0 t11,0 t11,0" {...st} strokeWidth={3.4} fill="none" />;
    case "sob":
      return (
        <g transform={T}>
          <path d="M-24,-4 Q0,4 24,-4 Q26,30 0,36 Q-26,30 -24,-4Z" fill={RED_D} {...st} strokeWidth={3} />
          <path d="M-14,32 Q0,22 14,32Z" fill={TONGUE} />
        </g>
      );
    case "stuffed":
      return (
        <g transform={T}>
          <ellipse cx={-34} cy={-6} rx={22} ry={20} fill="#f3b48e" stroke={ink} strokeWidth={2.6} />
          <ellipse cx={34} cy={-6} rx={22} ry={20} fill="#f3b48e" stroke={ink} strokeWidth={2.6} />
          <path d="M-8,4 Q0,10 8,4" {...st} strokeWidth={3} fill="none" />
        </g>
      );
    case "tongue":
      return (
        <g transform={T}>
          <path d="M-16,-2 Q0,10 16,-2Z" fill={RED_D} {...st} strokeWidth={3} />
          <path d="M-7,2 q7,16 14,0Z" fill={TONGUE} stroke={ink} strokeWidth={2} />
        </g>
      );
    case "cat":
      return <path transform={T} d="M-18,-2 Q-9,10 0,-2 Q9,10 18,-2" {...st} strokeWidth={3.4} fill="none" />;
    case "flat":
      return <path transform={T} d="M-14,0 L14,0" {...st} strokeWidth={3.4} />;
    default:
      return <path transform={T} d="M-10,0 L10,0" {...st} strokeWidth={3} />;
  }
};

/* ---------------------------------- face spec ----------------------------- */

export type FaceSpec = { eye: EyeKind; eyeL?: EyeKind; brow: BrowKind; mouth: MouthKind; blush?: boolean; sweat?: boolean; tears?: boolean; vein?: boolean; mouthS?: number; mouthY?: number; eyeS?: number; browY?: number; shade?: boolean };

/** the shared head: ears, neck, face plate. Hair is drawn by each character. */
export const HeadBase: React.FC<{ turn: number; skin: Skin; lw: number; jaw?: number; neckW?: number; ink?: string; wide?: number }> = ({ turn, skin, lw, jaw = 1, neckW = 18, ink, wide = 1 }) => {
  const t = turn;
  const lx = -56 * wide * (1 - Math.max(0, t) * 0.2), rx = 56 * wide * (1 - Math.max(0, -t) * 0.2);
  const cx = t * 14;
  const face = smooth([[lx, -70], [lx - 2, -14], [lx + 5, 30], [cx - 26 * jaw, 60], [cx, 72 * jaw], [cx + 26 * jaw, 60], [rx - 5, 30], [rx + 2, -14], [rx, -70], [cx * 0.5, -86]]);
  const earL = smooth([[lx + 6, -12], [lx - 10, -8], [lx - 9, 16], [lx + 6, 24]]), earR = smooth([[rx - 6, -12], [rx + 10, -8], [rx + 9, 16], [rx - 6, 24]]);
  return (
    <>
      <Part d={tube([[t * 6, 40], [t * 6, 112]], [neckW, neckW + 3])} fill={skin.base} shade={skin.shade} lw={lw} sh={[-8, 0]} ink={ink} />
      <Part d={[earL, earR]} fill={skin.base} shade={skin.shade} lw={lw} ink={ink} />
      <Part d={face} fill={skin.base} shade={skin.shade} lw={lw} sh={[-6, -4]} ink={ink}>
        {/* under-chin shadow so the head sits on the neck */}
        <path d={`M${cx - 30},${60 * jaw} Q${cx},${80 * jaw} ${cx + 30},${60 * jaw} L${cx + 40},${90} L${cx - 40},${90}Z`} fill={skin.shade} opacity={0.9} />
      </Part>
    </>
  );
};

/** eyes + brows + mouth + extras from a spec, in head space */
export const FaceFeatures: React.FC<{ f: FaceSpec; sx?: number; iris?: string; lash?: boolean; browC?: string; eyeX?: number; eyeY?: number; ink?: string; nose?: boolean }> = ({ f, sx = 0, iris, lash, browC, eyeX = 24, eyeY = 0, ink = INK, nose = true }) => (
  <g>
    {f.blush && <><ellipse cx={-34 + sx} cy={24} rx={12} ry={6} fill="#f08a7a" opacity={0.5} /><ellipse cx={34 + sx} cy={24} rx={12} ry={6} fill="#f08a7a" opacity={0.5} /></>}
    {f.shade && <path d={`M${-54 + sx},-60 L${54 + sx},-60 L${50 + sx},-8 L${-50 + sx},-8Z`} fill="#6a7bb8" opacity={0.35} />}
    <Eye x={-eyeX + sx} y={eyeY} kind={f.eyeL ?? f.eye} s={f.eyeS} iris={iris} lash={lash} ink={ink} />
    <Eye x={eyeX + sx} y={eyeY} kind={f.eye} s={f.eyeS} iris={iris} lash={lash} ink={ink} flip />
    <Brows kind={f.brow} sx={sx} c={browC} y={f.browY} ink={ink} />
    {nose && <path d={`M${sx + 3},14 L${sx + 7},30 L${sx},32`} stroke={ink} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    <Mouth kind={f.mouth} cx={sx + 1} s={f.mouthS} y={f.mouthY} ink={ink} />
    {f.sweat && <path d={`M${50 + sx},-50 q-10,16 0,24 q10,-8 0,-24Z`} fill="#8fd4ff" stroke={ink} strokeWidth={1.8} />}
    {f.tears && <g fill="#8fd4ff" stroke={ink} strokeWidth={1.6}><path d={`M${-30 + sx},14 q-10,30 0,44 q10,-14 0,-44Z`} /><path d={`M${30 + sx},14 q10,30 0,44 q-10,-14 0,-44Z`} /></g>}
    {f.vein && <path d={`M${44 + sx},-62 l8,8 m4,-14 l-2,12 m10,-4 l-10,4 M${40 + sx},-54 l-6,6`} stroke="#e02020" strokeWidth={4.5} strokeLinecap="round" fill="none" />}
  </g>
);

/* ---------------------------------- hands --------------------------------- */

export type HandKind = "relax" | "fist" | "open" | "spread" | "point" | "hold" | "thumb" | "flat" | "none" | "pocket";

/**
 * A hand with fingers. Local space: wrist at the origin, fingers along +x,
 * thumb toward -y; `dir` is the forearm angle and `flip` mirrors for the
 * other side. Drawn larger than life — hands read at a glance in cel work.
 */
export const Hand: React.FC<{ at: P; dir: number; kind: HandKind; s?: number; skin: Skin; lw: number; flip?: boolean; ink?: string }> = ({ at, dir, kind, s = 1, skin, lw, flip, ink }) => {
  if (kind === "none" || kind === "pocket") return null;
  const fl = flip ? -1 : 1;
  const sh: string[] = [];
  const finger = (a: P, b: P, c: P, w = 7) => sh.push(tube([a, b, c], [w, w * 0.95, w * 0.85]));
  const palm = (pts: P[]) => sh.push(smooth(pts, true, 0.8));
  switch (kind) {
    case "relax":
      palm([[-6, -18], [22, -22], [40, -10], [42, 10], [28, 22], [2, 20], [-8, 4]]);
      for (let i = 0; i < 4; i++) { const y = -12 + i * 9; finger([34, y], [50, y + 6 + i], [56, y + 14 + i * 1.5], 7 - i * 0.4); }
      finger([8, -16], [22, -28], [34, -32], 7.5);
      break;
    case "fist":
      palm([[-6, -20], [20, -26], [40, -18], [44, 8], [30, 24], [4, 22], [-8, 6]]);
      [[42, -12], [46, 0], [44, 12], [36, 20]].forEach(([x, y], i) => sh.push(circ([x, y], 8 - i)));
      finger([14, -18], [30, -14], [40, -2], 7.5);
      break;
    case "open":
      palm([[-6, -18], [20, -24], [38, -12], [40, 12], [24, 24], [0, 22], [-8, 4]]);
      for (let i = 0; i < 4; i++) { const y = -14 + i * 9.5; const sp = (i - 1.5) * 4; finger([34, y], [52, y + sp * 0.6], [68, y + sp], 7 - i * 0.4); }
      finger([6, -16], [16, -34], [26, -46], 7.5);
      break;
    case "spread":
      palm([[-6, -20], [20, -26], [38, -14], [40, 14], [24, 26], [0, 24], [-8, 4]]);
      [[-34, 66], [-12, 70], [10, 68], [32, 58]].forEach(([a, l], i) => {
        const r = (a * Math.PI) / 180; const b: P = [34, -12 + i * 9];
        finger(b, [b[0] + Math.cos(r) * l * 0.55, b[1] + Math.sin(r) * l * 0.55], [b[0] + Math.cos(r) * l, b[1] + Math.sin(r) * l], 7 - i * 0.4);
      });
      finger([4, -18], [8, -42], [16, -62], 7.5);
      break;
    case "point":
      palm([[-6, -18], [20, -24], [38, -12], [40, 12], [24, 24], [0, 22], [-8, 4]]);
      finger([34, -12], [56, -14], [78, -14], 7.5);
      for (let i = 1; i < 4; i++) { const y = -2 + (i - 1) * 9; finger([36, y], [44, y + 4], [40, y + 10], 6.5); }
      finger([10, -16], [18, -32], [26, -44], 7.5);
      break;
    case "hold":
      // a grip seen from the side: four stacked finger segments wrapped round the object, thumb over the top
      palm([[-6, -18], [22, -22], [40, -12], [40, 14], [22, 24], [0, 22], [-8, 4]]);
      for (let i = 0; i < 4; i++) { const y = -14 + i * 9.5; finger([34, y], [50, y + 2], [46, y + 8], 7 - i * 0.4); }
      finger([10, -18], [30, -26], [48, -20], 7.5);
      break;
    case "thumb":
      palm([[-6, -16], [22, -22], [42, -14], [44, 10], [30, 24], [4, 22], [-8, 6]]);
      [[42, -8], [46, 2], [44, 12], [36, 20]].forEach(([x, y], i) => sh.push(circ([x, y], 8 - i)));
      finger([14, -18], [16, -40], [18, -58], 8);
      break;
    case "flat":
      palm([[-6, -18], [20, -24], [38, -12], [40, 12], [24, 24], [0, 22], [-8, 4]]);
      sh.push(smooth([[30, -18], [62, -22], [74, -8], [72, 10], [58, 22], [30, 20]], true, 0.8));
      finger([6, -16], [14, -34], [22, -46], 7.5);
      break;
  }
  return (
    <g transform={`translate(${at[0]},${at[1]}) rotate(${dir}) scale(${s},${s * fl})`}>
      <Part d={sh} fill={skin.base} shade={skin.shade} lw={lw / s} sh={[-lw * 1.6, -lw * 1.2]} ink={ink}>
        {(kind === "open" || kind === "flat" || kind === "spread") && <path d="M4,-6 q14,6 28,0" stroke={skin.shade} strokeWidth={3} fill="none" strokeLinecap="round" />}
      </Part>
    </g>
  );
};

/* ---------------------------------- feet ---------------------------------- */

export type ShoeKind = "boot" | "shoe" | "sandal" | "bare" | "sneaker" | "loafer";

/** foot outline at the ankle: dir 0 faces the camera, ±1 is a profile pointing left/right */
export const footShape = (dir: number, l = 1): string => {
  if (Math.abs(dir) < 0.3) return smooth([[-28, -16], [28, -16], [34, 4], [24, 16], [-24, 16], [-34, 4]]);
  const s = Math.sign(dir) * l;
  return smooth([[-26 * s, -26], [12 * s, -20], [62 * s, -8], [72 * s, 6], [56 * s, 16], [-26 * s, 16], [-34 * s, -6]]);
};

export const Foot: React.FC<{ ft: P; fd: number; kind: ShoeKind; c?: string; cs?: string; skin?: Skin; lw: number; ink?: string; s?: number }> = ({ ft, fd, kind, c = "#1a1a20", cs = "#0a0a0e", skin = SKIN, lw, ink, s = 1 }) => {
  const d = footShape(fd);
  const sideways = Math.abs(fd) >= 0.3;
  const sg = sideways ? Math.sign(fd) : 1;
  return (
    <g transform={`translate(${ft[0]},${ft[1] + 6}) scale(${s})`}>
      {kind === "bare" && <Part d={d} fill={skin.base} shade={skin.shade} lw={lw} ink={ink} />}
      {kind === "sandal" && (
        <>
          <Part d={d} fill={skin.base} shade={skin.shade} lw={lw} ink={ink}>
            {sideways ? <path d={`M${10 * sg},-18 L${26 * sg},6 M${34 * sg},-10 L${22 * sg},8`} stroke={c} strokeWidth={8} /> : <path d="M-22,-4 L22,-4 M0,-16 L0,0" stroke={c} strokeWidth={8} />}
          </Part>
          <Part d={sideways ? smooth([[-30 * sg, 8], [70 * sg, 2], [72 * sg, 18], [-30 * sg, 22]], true, 0.3) : smooth([[-34, 6], [34, 6], [30, 22], [-30, 22]], true, 0.3)} fill={c} shade={cs} lw={lw} ink={ink} />
        </>
      )}
      {(kind === "boot" || kind === "shoe" || kind === "loafer") && (
        <Part d={d} fill={c} shade={cs} lw={lw} ink={ink}>
          {kind === "loafer" && sideways && <path d={`M${0},-6 L${30 * sg},-2`} stroke="#c9a040" strokeWidth={4} />}
          {kind === "shoe" && <path d={sideways ? `M${-24 * sg},10 L${66 * sg},6` : "M-30,10 L30,10"} stroke={cs} strokeWidth={5} />}
        </Part>
      )}
      {kind === "sneaker" && (
        <Part d={d} fill={c} shade={cs} lw={lw} ink={ink}>
          <path d={sideways ? `M${-26 * sg},6 L${70 * sg},2` : "M-30,8 L30,8"} stroke="#f4f4f0" strokeWidth={7} />
          {sideways && <path d={`M${6 * sg},-20 l${10 * sg},4 m${-10 * sg},4 l${10 * sg},4`} stroke="#f4f4f0" strokeWidth={3} />}
        </Part>
      )}
    </g>
  );
};

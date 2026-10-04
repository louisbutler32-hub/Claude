import React from "react";
import { INK } from "./toon";

/**
 * A face-style system for the cube-head cast. A style is a bundle of choices (eye shape,
 * brows, mouth, nose, extras, sizes, positions); an expression is a few numbers (how open
 * the eyes are, the slope of the brows, how wide and curved the mouth is). Any style can
 * wear any expression, so fifty styles can be compared on the same five faces.
 */

export type Emo = { open: number; tilt: number; brow: number; mo: number; mc: number; happy?: boolean; shock?: boolean; wr?: number };
export const EMOS: Record<string, Emo> = {
  plain: { open: 1, tilt: 0, brow: 0, mo: 0, mc: 0.15 },
  joy: { open: 0.2, happy: true, tilt: 0, brow: 0.6, mo: 1, mc: 1 },
  sad: { open: 0.75, tilt: -1, brow: -0.4, mo: 0.4, mc: -1, wr: 2 },
  angry: { open: 0.6, tilt: 1, brow: -0.5, mo: 0.55, mc: -0.4 },
  shock: { open: 1.3, tilt: 0, brow: 1, mo: 0.8, mc: 0, shock: true, wr: 1 },
};

export type EyeKind = "oval" | "bar" | "dot" | "sclera" | "anime" | "half" | "slit" | "ring" | "line" | "hoval" | "pixel" | "bean" | "sketch" | "star";
export type MouthKind = "trap" | "smile" | "cat" | "line" | "dot" | "zig" | "tongue" | "fang" | "block" | "curve";
export type BrowKind = "thin" | "thick" | "none" | "uni" | "angled" | "dash";
export type NoseKind = "none" | "dot" | "hook" | "tri" | "bar";

export type FaceStyle = {
  name: string;
  eye: EyeKind; eyeS: number; gap: number; eyeY: number;
  brow: BrowKind; browY: number;
  mouth: MouthKind; mouthY: number; mouthS: number;
  nose: NoseKind;
  iris?: string;
  blush?: number; freckles?: boolean; bags?: boolean; lashes?: boolean; cheeks?: boolean; scar?: boolean;
  ink?: number; tiltBias?: number; wrinkles?: boolean; look?: number; mi?: string;
};

const BASE: FaceStyle = { name: "", eye: "oval", eyeS: 1, gap: 36, eyeY: 64, brow: "thin", browY: -30, mouth: "trap", mouthY: 106, mouthS: 1, nose: "dot", ink: 8 };

const MOUTH_IN = "#2a1520";
const TEETH = "#dcdce4";
const TONGUE = "#ff7d93";

/* --------------------------------- pieces --------------------------------- */

const Eye: React.FC<{ st: FaceStyle; e: Emo; cx: number; side: -1 | 1 }> = ({ st, e, cx, side }) => {
  const s = st.eyeS * (e.shock ? 1.12 : 1);
  const cy = st.eyeY;
  const o = Math.max(0.18, Math.min(1.3, e.open));
  const rot = (e.tilt + (st.tiltBias ?? 0)) * 15 * -side;
  const sw = st.ink ?? 8;
  const happy = e.happy;
  const arc = (w: number) => <path d={`M${cx - w},${cy + 8} Q${cx},${cy - 26} ${cx + w},${cy + 8}`} fill="none" stroke={INK} strokeWidth={sw + 1} strokeLinecap="round" />;
  const look = (st.look ?? 0) * side;
  if (happy && st.eye !== "line") return arc(22 * s);
  const T = (n: React.ReactNode) => <g transform={`rotate(${rot} ${cx} ${cy})`}>{n}</g>;
  switch (st.eye) {
    case "oval": return T(<g><ellipse cx={cx} cy={cy} rx={15 * s} ry={22 * s * Math.min(1.2, o)} fill={INK} /><ellipse cx={cx + 5 * s} cy={cy - 8 * s * o} rx={5 * s} ry={6 * s} fill="#fff" /></g>);
    case "bar": return T(<rect x={cx - 24 * s} y={cy - 13 * s * o} width={48 * s} height={26 * s * o} rx={12 * s * o} fill={INK} />);
    case "dot": return T(<ellipse cx={cx} cy={cy} rx={10 * s} ry={10 * s * Math.min(1.2, o)} fill={INK} />);
    case "sclera": return <g><circle cx={cx} cy={cy} r={21 * s} fill="#fff" stroke={INK} strokeWidth={sw - 1} /><circle cx={cx + look * 8} cy={cy + 1} r={(e.shock ? 4.5 : 8) * s} fill={INK} /></g>;
    case "anime": return T(<g><ellipse cx={cx} cy={cy} rx={18 * s} ry={26 * s * Math.min(1.15, o)} fill={INK} /><ellipse cx={cx} cy={cy + 6 * s} rx={13 * s} ry={17 * s * Math.min(1.1, o)} fill={st.iris ?? "#3b7bd9"} /><ellipse cx={cx + 6 * s} cy={cy - 9 * s} rx={6 * s} ry={7 * s} fill="#fff" /><circle cx={cx - 6 * s} cy={cy + 9 * s} r={3.2 * s} fill="#fff" /></g>);
    case "half": return T(<g><path d={`M${cx - 17 * s},${cy - 2} A${17 * s},${(e.shock ? 24 : 18) * s} 0 0 0 ${cx + 17 * s},${cy - 2} Z`} fill={INK} /><path d={`M${cx - 20 * s},${cy - 2} H${cx + 20 * s}`} stroke={INK} strokeWidth={sw} strokeLinecap="round" /></g>);
    case "slit": return T(<g><ellipse cx={cx} cy={cy} rx={17 * s} ry={22 * s * Math.min(1.2, o)} fill={st.iris ?? "#e8c93a"} stroke={INK} strokeWidth={sw - 2} /><ellipse cx={cx} cy={cy} rx={(e.shock ? 9 : 4.5) * s} ry={19 * s * Math.min(1.1, o)} fill={INK} /></g>);
    case "ring": return <g><circle cx={cx} cy={cy} r={19 * s} fill="#fff" stroke={INK} strokeWidth={sw} /><circle cx={cx + look * 6} cy={cy} r={(e.shock ? 3 : 6) * s} fill={INK} /></g>;
    case "line": return happy ? arc(20 * s) : T(<path d={`M${cx - 18 * s},${cy + 2} H${cx + 18 * s}`} stroke={INK} strokeWidth={sw + 1} strokeLinecap="round" />);
    case "hoval": return T(<g><ellipse cx={cx} cy={cy} rx={21 * s} ry={13 * s * o} fill={INK} /><ellipse cx={cx + 6 * s} cy={cy - 4 * s} rx={5 * s} ry={4 * s} fill="#fff" /></g>);
    case "pixel": return <g><rect x={cx - 14 * s} y={cy - 16 * s} width={28 * s} height={32 * s} fill="#fff" stroke={INK} strokeWidth={sw - 2} /><rect x={cx - 6 * s + look * 4} y={cy - 8 * s} width={13 * s} height={(e.shock ? 12 : 17) * s} fill={st.iris ?? INK} /></g>;
    case "bean": return T(<g><rect x={cx - 11 * s} y={cy - 19 * s * Math.min(1.2, o)} width={22 * s} height={38 * s * Math.min(1.2, o)} rx={11 * s} fill={INK} /><ellipse cx={cx + 3 * s} cy={cy - 9 * s} rx={3.5 * s} ry={4.5 * s} fill="#fff" /></g>);
    case "sketch": return <g><ellipse cx={cx} cy={cy} rx={17 * s} ry={21 * s * Math.min(1.2, o)} fill="#fff" stroke={INK} strokeWidth={sw - 2} /><circle cx={cx + look * 5 + 2} cy={cy + 2} r={(e.shock ? 3.5 : 7) * s} fill={INK} /></g>;
    case "star": return T(<g><ellipse cx={cx} cy={cy} rx={17 * s} ry={24 * s * Math.min(1.2, o)} fill={INK} /><path d={`M${cx + 5 * s},${cy - 15 * s} l2.4,6 l6,2.4 l-6,2.4 l-2.4,6 l-2.4,-6 l-6,-2.4 l6,-2.4 Z`} fill="#fff" /></g>);
  }
};

const Brows: React.FC<{ st: FaceStyle; e: Emo; ex: [number, number] }> = ({ st, e, ex }) => {
  if (st.brow === "none") return null;
  const y = st.eyeY + st.browY - e.brow * 9;
  const tilt = (e.tilt + (st.tiltBias ?? 0)) * 17;
  const sw = st.brow === "thick" || st.brow === "angled" ? 11 : st.brow === "dash" ? 8 : 6;
  const one = (cx: number, side: -1 | 1) => {
    const r = tilt * -side;
    if (st.brow === "angled") return <path key={side} d={`M${cx - 18},${y} L${cx + 18},${y}`} stroke={INK} strokeWidth={sw} strokeLinecap="round" transform={`rotate(${r} ${cx} ${y})`} />;
    if (st.brow === "dash") return <path key={side} d={`M${cx - 9},${y} h18`} stroke={INK} strokeWidth={sw} strokeLinecap="round" transform={`rotate(${r} ${cx} ${y})`} />;
    return <path key={side} d={`M${cx - 18},${y} Q${cx},${y - 7 - e.brow * 4} ${cx + 18},${y}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" transform={`rotate(${r} ${cx} ${y})`} />;
  };
  if (st.brow === "uni") return <path d={`M${ex[0] - 18},${y + tilt * 0.3} Q75,${y - 10 - e.brow * 4} ${ex[1] + 18},${y + tilt * 0.3}`} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />;
  return <g>{one(ex[0], -1)}{one(ex[1], 1)}</g>;
};

const Mouth: React.FC<{ st: FaceStyle; e: Emo }> = ({ st, e }) => {
  const k = st.mouthS;
  const w = 26 * k;
  const open = e.mo;
  const sw = st.ink ?? 8;
  const inn = st.mi ?? MOUTH_IN;
  const curveLine = (amt: number, ww = w) => <path d={`M${-ww},${2} Q0,${2 + amt * 22 * k} ${ww},${2}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />;
  const grin = (h: number, extra?: React.ReactNode) => (
    <g>
      <path d={`M${-w * 1.2},0 Q0,${h * 1.7} ${w * 1.2},0 Z`} fill={inn} stroke={INK} strokeWidth={sw - 1} strokeLinejoin="round" />
      {extra}
    </g>
  );
  const trap = (ww: number, h: number, teeth: boolean) => (
    <g>
      <path d={`M${-ww},0 L${ww},0 L${ww * 0.6},${h} Q0,${h * 1.18} ${-ww * 0.6},${h} Z`} fill={inn} stroke={INK} strokeWidth={sw - 1} strokeLinejoin="round" />
      {teeth && <path d={`M${-ww + 5},3 L${ww - 5},3 L${ww * 0.6 + 3},${h * 0.42} Q0,${h * 0.55} ${-ww * 0.6 - 3},${h * 0.42} Z`} fill={TEETH} />}
    </g>
  );
  let body: React.ReactNode;
  switch (st.mouth) {
    case "trap": body = open < 0.2 ? curveLine(e.mc) : e.mc > 0.6 ? grin(34 * open, <><path d={`M${-w},4 H${w}`} stroke={TEETH} strokeWidth={8} /><ellipse cx={0} cy={22 * open + 6} rx={13 * k} ry={7 * k} fill={TONGUE} /></>) : trap(w * 1.1, 46 * open, true); break;
    case "smile": body = open < 0.2 ? curveLine(e.mc) : grin(34 * open, <ellipse cx={0} cy={20 * open + 6} rx={13 * k} ry={7 * k} fill={TONGUE} />); break;
    case "cat": body = <g><path d={`M${-w * 0.9},2 Q${-w * 0.45},${14 * (0.5 + e.mc * 0.5)} 0,2 Q${w * 0.45},${14 * (0.5 + e.mc * 0.5)} ${w * 0.9},2`} fill="none" stroke={INK} strokeWidth={sw - 1} strokeLinecap="round" />{open > 0.25 && <ellipse cx={0} cy={10 + open * 8} rx={9 * k} ry={(5 + open * 9) * k} fill={inn} stroke={INK} strokeWidth={4} />}</g>; break;
    case "line": body = <path d={`M${-w * 0.7},${e.mc < -0.3 ? 8 : 4} L${w * 0.7},${e.mc < -0.3 ? 4 : 4}`} stroke={INK} strokeWidth={sw + 1} strokeLinecap="round" transform={`rotate(${-e.mc * 8})`} />; break;
    case "dot": body = <ellipse cx={0} cy={8} rx={(5 + open * 10) * k} ry={(5 + open * 15) * k} fill={open > 0.2 ? inn : INK} stroke={INK} strokeWidth={5} />; break;
    case "zig": body = <path d={`M${-w},6 l${w / 3},${e.mc > 0 ? 8 : -8} l${w / 3},${e.mc > 0 ? -8 : 8} l${w / 3},${e.mc > 0 ? 8 : -8} l${w / 3},${e.mc > 0 ? -8 : 8} l${w / 3},${e.mc > 0 ? 8 : -8} l${w / 3},${e.mc > 0 ? -8 : 8}`} fill="none" stroke={INK} strokeWidth={sw - 1} strokeLinecap="round" strokeLinejoin="round" />; break;
    case "tongue": body = <g>{curveLine(Math.max(0.3, e.mc))}{open > 0.35 && <path d={`M${-8 * k},${4} Q${-8 * k},${26 * k} 0,${26 * k} Q${8 * k},${26 * k} ${8 * k},${4} Z`} fill={TONGUE} stroke={INK} strokeWidth={5} strokeLinejoin="round" />}</g>; break;
    case "fang": body = open < 0.2 ? curveLine(e.mc) : <g>{grin(30 * open)}<path d={`M${-w * 0.7},2 l${7 * k},${15 * k} l${7 * k},${-15 * k} Z M${w * 0.7 - 14 * k},2 l${7 * k},${15 * k} l${7 * k},${-15 * k} Z`} fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" /></g>; break;
    case "block": body = <g><rect x={-w} y={2} width={w * 2} height={(10 + open * 30) * k} fill={open > 0.15 ? inn : INK} stroke={INK} strokeWidth={5} />{open > 0.4 && <rect x={-w * 0.8} y={4} width={w * 1.6} height={9 * k} fill={TEETH} />}</g>; break;
    case "curve": body = curveLine(e.mc * 1.2 + (open > 0.4 ? 0.3 : 0)); break;
  }
  return <g transform={`translate(77 ${st.mouthY})`}>{body}</g>;
};

const Nose: React.FC<{ st: FaceStyle }> = ({ st }) => {
  const y = (st.eyeY + st.mouthY) / 2 + 3;
  switch (st.nose) {
    case "dot": return <circle cx={77} cy={y} r={3.2} fill={INK} opacity={0.7} />;
    case "hook": return <path d={`M72,${y - 10} q10,6 -2,16 q4,3 12,0`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />;
    case "tri": return <path d={`M70,${y + 4} L84,${y + 4} L77,${y - 7} Z`} fill={INK} opacity={0.65} />;
    case "bar": return <rect x={68} y={y - 3} width={18} height={8} rx={3} fill={INK} opacity={0.55} />;
    default: return null;
  }
};

export const StyledFace: React.FC<{ st: FaceStyle; emo: keyof typeof EMOS }> = ({ st: raw, emo }) => {
  const st = { ...BASE, ...raw };
  const e = EMOS[emo];
  const ex: [number, number] = [75 - st.gap, 75 + st.gap];
  return (
    <g transform="translate(3 0)">
      {st.blush ? <><ellipse cx={ex[0] - 6} cy={st.eyeY + 28} rx={16 * st.blush} ry={9 * st.blush} fill="#ff8ea8" opacity={0.6} /><ellipse cx={ex[1] + 6} cy={st.eyeY + 28} rx={16 * st.blush} ry={9 * st.blush} fill="#ff8ea8" opacity={0.6} /></> : null}
      <Eye st={st} e={e} cx={ex[0]} side={-1} />
      <Eye st={st} e={e} cx={ex[1]} side={1} />
      {st.lashes && !e.happy && [ex[0], ex[1]].map((cx, i) => <path key={i} d={`M${cx - 18 * st.eyeS},${st.eyeY - 14 * st.eyeS} l-8,-6 M${cx + 18 * st.eyeS},${st.eyeY - 14 * st.eyeS} l8,-6`} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
      <Brows st={st} e={e} ex={ex} />
      {st.bags && [ex[0], ex[1]].map((cx, i) => <path key={i} d={`M${cx - 15},${st.eyeY + 26} q15,9 30,0`} fill="none" stroke={INK} strokeWidth={4} opacity={0.6} strokeLinecap="round" />)}
      {st.freckles && [[-18, 30], [-8, 36], [-26, 38], [18, 30], [8, 36], [26, 38]].map(([dx, dy], i) => <circle key={i} cx={(i < 3 ? ex[0] : ex[1]) + dx} cy={st.eyeY + dy} r={2.6} fill={INK} opacity={0.55} />)}
      {st.cheeks && <path d={`M${ex[0] - 22},${st.mouthY - 6} q-6,10 0,20 M${ex[1] + 22},${st.mouthY - 6} q6,10 0,20`} fill="none" stroke={INK} strokeWidth={4} opacity={0.6} strokeLinecap="round" />}
      {st.scar && <path d={`M${ex[1] - 14},${st.eyeY - 24} l22,42 M${ex[1] - 22},${st.eyeY - 2} l12,-6 M${ex[1] - 4},${st.eyeY + 14} l12,-6`} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.8} />}
      {(st.wrinkles || e.wr) && e.wr ? <g fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.7}>{Array.from({ length: e.wr }, (_, k) => <path key={k} d={`M${52 + k * 4},${st.eyeY + st.browY - 14 - k * 8} q23,${k % 2 ? 5 : -7} 46,0`} />)}</g> : null}
      <Nose st={st} />
      <Mouth st={st} e={e} />
    </g>
  );
};

/* --------------------------------- the fifty --------------------------------- */

const S = (o: Partial<FaceStyle> & { name: string }): FaceStyle => ({ ...BASE, ...o });

export const FACE_STYLES: FaceStyle[] = [
  S({ name: "Reference zombie", eye: "bar", mouth: "trap", wrinkles: true, nose: "dot" }),
  S({ name: "Reference skeleton", eye: "oval", eyeS: 1.25, gap: 38, mouth: "smile", brow: "thick", nose: "none" }),
  S({ name: "Kawaii dots", eye: "dot", eyeS: 1.15, gap: 34, eyeY: 78, mouthY: 112, mouth: "curve", brow: "none", blush: 1, nose: "none" }),
  S({ name: "Googly", eye: "sclera", eyeS: 1.1, mouth: "zig", look: 1, nose: "none" }),
  S({ name: "Anime blue", eye: "anime", mouth: "smile", mouthS: 0.8, lashes: true, blush: 1, nose: "none", brow: "thin" }),
  S({ name: "Sleepy cool", eye: "half", eyeS: 1.15, mouth: "line", brow: "thick", nose: "none" }),
  S({ name: "Cat", eye: "slit", mouth: "cat", cheeks: false, nose: "tri", brow: "none" }),
  S({ name: "Roblox", eye: "oval", eyeS: 0.8, gap: 30, mouth: "curve", brow: "none", nose: "none", eyeY: 66 }),
  S({ name: "Minecraft pixel", eye: "pixel", iris: "#3b4a9a", mouth: "block", brow: "none", nose: "bar", eyeS: 1.1 }),
  S({ name: "Doodle", eye: "sketch", ink: 6, mouth: "curve", brow: "thin", nose: "none" }),
  S({ name: "Big eyes tiny mouth", eye: "oval", eyeS: 1.45, gap: 38, eyeY: 62, mouth: "dot", mouthS: 0.7, brow: "none", nose: "none", mouthY: 112 }),
  S({ name: "Tiny eyes big mouth", eye: "dot", eyeS: 0.8, mouth: "trap", mouthS: 1.4, nose: "none", brow: "thin" }),
  S({ name: "Unibrow grump", eye: "bar", eyeS: 0.9, brow: "uni", mouth: "line", bags: true, nose: "bar" }),
  S({ name: "Bean", eye: "bean", mouth: "smile", mouthS: 0.9, blush: 0.9, brow: "none", nose: "none" }),
  S({ name: "Ring eyes", eye: "ring", mouth: "zig", brow: "thin", nose: "none" }),
  S({ name: "Line eyes (peaceful)", eye: "line", mouth: "curve", blush: 1, brow: "none", nose: "none" }),
  S({ name: "Wide set", eye: "oval", gap: 50, mouth: "trap", nose: "dot" }),
  S({ name: "Close set", eye: "oval", gap: 22, mouth: "curve", nose: "dot" }),
  S({ name: "Low face", eye: "oval", eyeY: 88, mouthY: 124, brow: "thin", browY: -32, mouth: "smile", mouthS: 0.9, nose: "none" }),
  S({ name: "High face", eye: "oval", eyeY: 48, mouthY: 94, mouth: "trap", mouthS: 0.9, nose: "dot" }),
  S({ name: "Heavy lids", eye: "half", eyeS: 1.25, brow: "thick", bags: true, mouth: "line", nose: "dot" }),
  S({ name: "Always scowling", eye: "bar", tiltBias: 0.8, brow: "angled", mouth: "trap", nose: "dot" }),
  S({ name: "Fangs", eye: "oval", mouth: "fang", brow: "thin", nose: "none" }),
  S({ name: "Tongue out", eye: "oval", mouth: "tongue", blush: 1, brow: "none", nose: "none" }),
  S({ name: "Stitched", eye: "bar", scar: true, mouth: "trap", brow: "thin", nose: "none" }),
  S({ name: "Freckles", eye: "dot", eyeS: 1.1, freckles: true, mouth: "smile", mouthS: 0.9, brow: "none", nose: "none" }),
  S({ name: "Lashes", eye: "oval", eyeS: 1.1, lashes: true, mouth: "smile", mouthS: 0.8, blush: 1, brow: "none", nose: "none" }),
  S({ name: "Anime brown", eye: "anime", iris: "#8a5a32", mouth: "cat", blush: 1, brow: "none", nose: "none" }),
  S({ name: "Deadpan ovals", eye: "hoval", mouth: "line", brow: "thin", nose: "none" }),
  S({ name: "Big sclera", eye: "sclera", eyeS: 1.35, gap: 38, mouth: "dot", brow: "none", nose: "none" }),
  S({ name: "Starry", eye: "star", mouth: "smile", blush: 1, brow: "none", nose: "none" }),
  S({ name: "Derp", eye: "sclera", look: -1, eyeS: 1.15, mouth: "tongue", brow: "none", nose: "none" }),
  S({ name: "Pixel big", eye: "pixel", eyeS: 1.4, gap: 38, iris: "#2a1b3d", mouth: "curve", brow: "none", nose: "none" }),
  S({ name: "Thick ink", eye: "bar", ink: 11, mouth: "trap", brow: "thick", nose: "none" }),
  S({ name: "Thin ink", eye: "oval", ink: 5, mouth: "curve", brow: "thin", nose: "none" }),
  S({ name: "Bar + block mouth", eye: "bar", mouth: "block", brow: "none", nose: "none" }),
  S({ name: "Triangle nose", eye: "oval", nose: "tri", mouth: "curve", brow: "thin" }),
  S({ name: "Hook nose", eye: "bar", nose: "hook", mouth: "trap", brow: "thin" }),
  S({ name: "Dash brows", eye: "dot", eyeS: 1.2, brow: "dash", mouth: "curve", nose: "none", browY: -28 }),
  S({ name: "Eye bags", eye: "half", bags: true, mouth: "zig", brow: "thin", nose: "dot" }),
  S({ name: "Smile lines", eye: "oval", cheeks: true, mouth: "smile", brow: "thin", nose: "dot" }),
  S({ name: "Yellow iris", eye: "anime", iris: "#e8c93a", mouth: "cat", brow: "thin", nose: "none" }),
  S({ name: "Red slit", eye: "slit", iris: "#d9342b", mouth: "fang", brow: "angled", nose: "none" }),
  S({ name: "Big sketch", eye: "sketch", eyeS: 1.25, mouth: "zig", ink: 6, brow: "none", nose: "none" }),
  S({ name: "Bean + fangs", eye: "bean", mouth: "fang", brow: "thin", nose: "none" }),
  S({ name: "Ring + tongue", eye: "ring", mouth: "tongue", blush: 1, brow: "none", nose: "none" }),
  S({ name: "Dot + big blush", eye: "dot", eyeS: 1.2, blush: 1.6, mouth: "cat", brow: "none", nose: "none", eyeY: 70 }),
  S({ name: "Half + fangs", eye: "half", mouth: "fang", brow: "thick", nose: "none" }),
  S({ name: "Oval + block mouth", eye: "oval", mouth: "block", brow: "thin", nose: "bar" }),
  S({ name: "Minimal", eye: "dot", eyeS: 0.9, mouth: "line", mouthS: 0.5, brow: "none", nose: "none", eyeY: 70, mouthY: 108 }),
];

/* --------------------------------- the test sheet --------------------------------- */

const HEAD = 150, DX = 34, DY = 24;
const CubeHead: React.FC<{ skin: string; skinD: string; children: React.ReactNode }> = ({ skin, skinD, children }) => (
  <g stroke={INK} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round">
    <polygon points={`${HEAD},0 ${HEAD + DX},${-DY} ${HEAD + DX},${HEAD - DY} ${HEAD},${HEAD}`} fill={skinD} />
    <polygon points={`0,0 ${DX},${-DY} ${HEAD + DX},${-DY} ${HEAD},0`} fill={skin} />
    <rect width={HEAD} height={HEAD} rx={8} fill={skin} />
    <g stroke="none">{children}</g>
  </g>
);

const SKINS = [
  { skin: "#4f8f4a", skinD: "#3b6e38" },
  { skin: "#c68a5b", skinD: "#a8714a" },
  { skin: "#d9d9de", skinD: "#b9b9c2" },
  { skin: "#f0d2aa", skinD: "#d9b88c" },
];

/** ten styles to a page, each wearing plain / joy / sad / angry / shock */
export const FaceStyleSheet: React.FC<{ page?: number }> = ({ page = 0 }) => {
  const emos = ["plain", "joy", "sad", "angry", "shock"] as const;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ background: "#5b5e69" }}>
      {FACE_STYLES.slice(page * 10, page * 10 + 10).map((st, r) => {
        const n = page * 10 + r;
        const sk = SKINS[n % SKINS.length];
        return (
          <g key={n} transform={`translate(0 ${r * 192})`}>
            <text x={14} y={96} fontSize={54} fontWeight={700} fill="#ffffff" fontFamily="sans-serif">{n + 1}</text>
            <text x={96} y={184} fontSize={20} fill="#e3e6f0" fontFamily="sans-serif">{st.name}</text>
            {emos.map((em, i) => (
              <g key={em} transform={`translate(${96 + i * 190} 30) scale(0.92)`}>
                <CubeHead skin={sk.skin} skinD={sk.skinD}><StyledFace st={st} emo={em} /></CubeHead>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

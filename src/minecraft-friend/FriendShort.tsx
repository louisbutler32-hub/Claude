import React from "react";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Audio, random, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../minecraft/beats";
import { ease } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { DrawnContext } from "../minecraft/handdrawn";
import { Item } from "../minecraft/pixels";
import { Actor, FaceKind, INK, Look, T0, TPose, lerpT, tp } from "../minecraft-lapeace/toon";

/**
 * "He just wanted a friend": a zombie keeps trying to make friends with a Steve who keeps
 * hitting him, until a skeleton's arrow gives him the chance to prove it. About 20 s,
 * original story, original music (scripts/build-friend-audio.py), cartoon cube-head cast.
 *
 * One continuous night-forest set with a virtual camera on a keyframe timeline, comic
 * captions on top, hit-stops and screen shake on every impact.
 */

export const FRIEND_FRAMES = 600;
const FLOOR = 1500;
const FIRE_X = 640;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const seg = (f: number, a: number, b: number) => ease(f, a, b);
const lin = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
const over = (f: number, a: number, b: number) => { const t = clamp01((f - a) / (b - a)), c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const bell = (f: number, a: number, b: number) => Math.sin(Math.PI * clamp01((f - a) / (b - a)));

/* ------------------------------ the cast ------------------------------ */

const ZOMBIE: Look = { skin: "#4f8f4a", skinD: "#3b6e38", hair: "#3b6e38", hairStyle: "none", shirt: "#3f7fb5", shirtD: "#2f628f", sleeve: "short", pants: "#4a3f8a", pantsD: "#382f6c", shoe: "#2b2b33", blush: "#3b6e38" };
const STEVE: Look = { skin: "#c68a5b", skinD: "#a8714a", hair: "#4a2f1b", shirt: "#2fb5b0", shirtD: "#23908c", sleeve: "short", pants: "#3b43a8", pantsD: "#2f3585", shoe: "#6e6e78", blush: "#b5603f" };
const SKEL: Look = { skin: "#d9d9de", skinD: "#b9b9c2", hair: "#d9d9de", hairStyle: "none", shirt: "#cfcfd6", shirtD: "#aeaeb8", sleeve: "none", pants: "#bdbdc6", pantsD: "#9d9da8", shoe: "#9d9da8", blush: "#d9d9de" };

const Sword: React.FC = () => (
  <g transform="rotate(8)" stroke={INK} strokeWidth={8} strokeLinejoin="round">
    <rect x={-9} y={26} width={18} height={132} rx={4} fill="#dbe4ef" />
    <rect x={-3} y={30} width={5} height={110} fill="#fff" stroke="none" opacity={0.7} />
    <rect x={-30} y={16} width={60} height={14} rx={4} fill="#8a5a32" />
    <rect x={-6} y={-6} width={12} height={22} rx={3} fill="#6a4426" />
  </g>
);
const PoppyHeld: React.FC = () => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round" transform="rotate(-10)">
    <rect x={-4} y={0} width={8} height={70} fill="#3f8f3a" />
    <rect x={-22} y={62} width={44} height={36} rx={8} fill="#d21f2a" />
    <rect x={-6} y={74} width={12} height={12} fill="#1f1f1f" stroke="none" />
  </g>
);
const Bow: React.FC<{ draw: number }> = ({ draw }) => (
  <g stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round">
    <path d="M0,10 Q70,70 0,130" stroke="#8a5a32" strokeWidth={12} transform="translate(10 0)" />
    <path d={`M10,10 L${10 - draw * 34},70 L10,130`} stroke="#f0f0f0" strokeWidth={4} />
  </g>
);
const Arrow: React.FC<{ len?: number }> = ({ len = 130 }) => (
  <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={-len / 2} y={-4} width={len} height={8} rx={3} fill="#c9a36b" />
    <polygon points={`${len / 2},-14 ${len / 2 + 26},0 ${len / 2},14`} fill="#dbe4ef" />
    <polygon points={`${-len / 2},-4 ${-len / 2 - 20},-16 ${-len / 2 - 6},-2`} fill="#fff" />
    <polygon points={`${-len / 2},4 ${-len / 2 - 20},16 ${-len / 2 - 6},2`} fill="#fff" />
  </g>
);

/* ------------------------------ the story ------------------------------ */

type Bit = { x: number; y: number; rot: number; pose: TPose; face: FaceKind; flip?: boolean; back?: boolean; hold?: React.ReactNode; torso?: React.ReactNode; vis?: boolean };

const walk = (f: number, amt = 1, rate = 0.8): TPose => {
  const s = Math.sin(f * rate) * amt;
  return tp({ lL: [s * 30, -Math.max(0, s) * 22], lR: [-s * 30, -Math.max(0, -s) * 22], bob: Math.abs(Math.sin(f * rate)) * 10 * amt });
};
const ZOMBIE_ARMS = tp({ aL: [76, 6], aR: [84, 4] });
const mixArms = (p: TPose, q: TPose) => ({ ...p, aL: q.aL, aR: q.aR });

/** Steve's frames at which he swings, and the zombie's hits: the same moments the soundtrack lands on */
export const HITS = [80, 176];
export const ARROW_HIT = 368;
const STOP = [[80, 3], [176, 3], [368, 4]];
const frozen = (f: number) => { for (const [h, d] of STOP) if (f > h && f < h + d) return h; return f; };

const zombie = (f: number): Bit => {
  let x = 170, y = FLOOR, rot = 0, face: FaceKind = "joy", pose: TPose = T0, hold: React.ReactNode = null, torso: React.ReactNode = null, flip = false;
  if (f < 80) {
    x = lerp(170, 400, lin(f, 0, 62));
    const wave = lin(f, 56, 72);
    pose = mixArms(walk(f, f < 62 ? 1 : 0.2), tp({ aL: [76, 6], aR: [lerp(84, 156 + Math.sin(f * 0.6) * 16, wave), 10] }));
  } else if (f < 112) {
    // the blow: flung back and down
    const u = lin(f, 80, 104);
    x = lerp(400, 130, ease(u, 0, 1)); y = FLOOR - Math.sin(Math.PI * Math.min(1, u * 1.1)) * 110 + lerp(0, 0, u); rot = lerp(0, -88, ease(u, 0, 0.8));
    face = "scream"; pose = tp({ aL: [lerp(76, -150, u), 10], aR: [lerp(84, 150, u), 10], lL: [-20, 0], lR: [30, -20] });
    if (f >= 100) { y = FLOOR - 56; face = "worry"; pose = tp({ aL: [-70, 10], aR: [70, 10], lL: [10, 0], lR: [-10, 0] }); }
  } else if (f < 140) {
    // he sits up, shakes it off, stands: still smiling
    const u = seg(f, 114, 134);
    x = 130 + u * 10; rot = lerp(-88, 0, u); y = FLOOR - lerp(56, 0, u);
    face = f < 128 ? "worry" : "joy"; pose = tp({ aL: [lerp(-70, 20, u), 10], aR: [lerp(70, 20, u), 10], sq: 0.05 * bell(f, 114, 134) });
  } else if (f < 182) {
    // picks the poppy, holds it out
    const pick = bell(f, 142, 156);
    x = f < 150 ? 140 + lin(f, 140, 150) * 90 : lerp(230, 400, seg(f, 154, 172));
    pose = tp({ ...walk(f, f > 154 && f < 172 ? 0.9 : 0, 0.8), lean: pick * 38, aL: [14, 6], aR: f > 152 ? [lerp(30, 88, seg(f, 152, 164)), 6] : [30, 6] });
    face = "smile"; hold = null;
  } else if (f < 240) {
    // the second blow: the flower goes, and he stands there
    const u = seg(f, 176, 190);
    x = lerp(400, 270, u); rot = -22 * bell(f, 176, 196); y = FLOOR - bell(f, 176, 188) * 40;
    face = f < 184 ? "scream" : "cry"; pose = tp({ aL: [14, 6], aR: [lerp(88, 24, u), 6], tilt: lerp(0, 14, seg(f, 190, 214)), lean: lerp(0, 8, seg(f, 190, 214)), sq: 0.03 });
  } else if (f < 318) {
    // night two: he leaves an apple and sits alone across the fire
    const throwT = lin(f, 252, 266);
    x = lerp(270, 150, seg(f, 240, 258));
    const sit = seg(f, 276, 292);
    y = FLOOR + 96 * sit;
    pose = tp({ ...walk(f, f < 258 ? 0.6 : 0, 0.7), aL: lerp2([20, 6], [34, 70], sit), aR: lerp2([lerp(20, 140, throwT * (1 - lin(f, 266, 274))), 6], [60, 62], sit), lL: lerp2([-3, 0], [88, 4], sit), lR: lerp2([3, 0], [86, 2], sit), tilt: 10 * sit });
    face = "worry";
  } else if (f < 346) {
    // night three: he sits up close, watching over him; spots the skeleton
    const sit = 1 - seg(f, 338, 346);
    x = lerp(150, 400, seg(f, 318, 326)); y = FLOOR + 96 * sit;
    face = f < 336 ? "calm" : "shock";
    pose = tp({ aL: lerp2([20, 6], [34, 70], sit), aR: lerp2([20, 6], [60, 62], sit), lL: lerp2([-3, 0], [88, 4], sit), lR: lerp2([3, 0], [86, 2], sit), tilt: 6 * sit });
  } else if (f < ARROW_HIT) {
    // the dash across the fire into the arrow's path
    x = lerp(400, 840, lin(f, 346, ARROW_HIT - 2));
    face = "scream"; pose = tp({ ...walk(f, 1.2, 1.2), aL: [92, 6], aR: [96, 4], lean: 12 });
  } else if (f < 400) {
    // hit: staggers, drops to his knees
    const u = seg(f, ARROW_HIT, 384);
    x = lerp(840, 910, u); face = f < 385 ? "shock" : "smile";
    const k = seg(f, 384, 398);
    y = FLOOR + 62 * k; pose = tp({ aL: [lerp(92, 8, u), 8], aR: [lerp(96, 12, u), 8], lL: lerp2([-3, 0], [28, -48], k), lR: lerp2([3, 0], [24, -44], k), sq: 0.05 * k, lean: lerp(12, -6, u), tilt: lerp(0, 12, k) });
    torso = <g transform="translate(14 56) rotate(80)"><Arrow len={110} /></g>;
  } else if (f < 508) {
    x = 910; y = FLOOR + 62; face = f < 478 ? "smile" : "joy";
    pose = tp({ aL: [10, 8], aR: [14, 8], lL: [28, -48], lR: [24, -44], sq: 0.05, lean: -6, tilt: 12 + Math.sin(f * 0.3) * 1.5 });
    torso = <g transform="translate(14 56) rotate(80)"><Arrow len={110} /></g>;
  } else {
    // healed: stands, shuffles over, sits by the fire
    const u = seg(f, 510, 530), sit = seg(f, 548, 566);
    x = lerp(910, 975, seg(f, 530, 548)); y = FLOOR + 62 * (1 - u) + 96 * sit;
    face = "joy"; flip = f >= 530;
    pose = tp({ aL: lerp2([10, 8], [34, 70], sit), aR: lerp2([lerp(14, 154 + Math.sin(f * 0.5) * 18, lin(f, 574, 586)), 8], [60, 62], sit), lL: lerp2(lerp2([28, -48], [-3, 0], u), [88, 4], sit), lR: lerp2(lerp2([24, -44], [3, 0], u), [86, 2], sit), sq: 0.1 * bell(f, 510, 526) });
  }
  return { x, y, rot, pose, face, hold, torso, flip };
};
const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

const steve = (f: number): Bit => {
  let x = 820, y = FLOOR, rot = 0, face: FaceKind = "plain", pose: TPose = T0, flip = true, back = false, hold: React.ReactNode = <Sword />;
  if (f < 56) {
    pose = tp({ aR: [16, 4], aL: [-8, -4] });
  } else if (f < 80) {
    const run = lin(f, 62, 78);
    x = lerp(820, 540, seg(f, 62, 78));
    face = "scream"; const jump = bell(f, 56, 64) * 26;
    pose = tp({ ...walk(f, f > 62 ? 1.2 : 0, 1.1), aR: [lerp(16, 164, seg(f, 56, 70)), -8], aL: [-70, -20], lean: lerp(0, -6, run), bob: jump });
  } else if (f < 112) {
    const u = seg(f, 78, 84);
    x = lerp(540, 590, seg(f, 86, 108));
    face = "grit"; pose = tp({ aR: [lerp(164, 20, u), lerp(-8, 14, u)], aL: [-30, -10], lean: lerp(-6, 8, u) * (1 - seg(f, 90, 108)), sq: 0.04 * bell(f, 78, 90) });
  } else if (f < 176) {
    x = 590; face = "grit";
    const wind = seg(f, 164, 174);
    pose = tp({ aR: [lerp(20, 164, wind), lerp(14, -8, wind)], aL: [-30, -10], lean: lerp(0, -5, wind) });
    if (f < 120) pose = tp({ aR: [20, 14], aL: [-30, -10] });
  } else if (f < 240) {
    x = 590; const u = seg(f, 176, 184);
    face = f < 200 ? "grit" : "worry";
    pose = tp({ aR: [lerp(164, 20, u), 12], aL: [-24, -10], lean: lerp(-5, 7, u) * (1 - seg(f, 186, 204)), tilt: seg(f, 204, 236) * 8 });
  } else if (f < 318) {
    x = 720; face = "plain";
    const away = seg(f, 292, 304);
    back = away > 0.5; flip = away < 0.5 ? true : false;
    pose = tp({ aR: [18, 4], aL: [-8, -4], tilt: away * 4 });
    hold = null;
    if (f > 266 && f < 292) { face = "plain"; pose = tp({ aR: [18, 4], aL: [-8, -4], tilt: -6 }); }
  } else if (f < ARROW_HIT + 2) {
    // asleep by the fire, sitting up, chin on his chest
    x = 780; y = FLOOR + 96; face = "sleep"; hold = null;
    pose = tp({ aL: [34, 70], aR: [60, 62], lL: [88, 4], lR: [86, 2], tilt: 18 + Math.sin(f * 0.1) * 2 });
  } else if (f < 420) {
    // woken by the thunk: shoots up and turns round
    const u = over(f, ARROW_HIT + 2, ARROW_HIT + 24);
    y = FLOOR + lerp(96, 0, Math.min(1, u)); x = lerp(780, 740, seg(f, ARROW_HIT + 2, 404)); flip = f < ARROW_HIT + 8;
    face = f < 396 ? "shock" : "worry"; hold = null;
    pose = tp({ aL: [-14, -6], aR: [14, 6], sq: -0.03 * bell(f, ARROW_HIT + 2, ARROW_HIT + 14), bob: bell(f, ARROW_HIT + 2, ARROW_HIT + 16) * 24 });
  } else if (f < 478) {
    x = lerp(740, 690, seg(f, 420, 450)); flip = false; face = f < 440 ? "worry" : "cry"; hold = null;
    pose = tp({ aL: [-20, -10], aR: [22, 10], tilt: 10, lean: seg(f, 440, 470) * 8 });
  } else if (f < 520) {
    // YES: a nod, then the golden apple
    x = 690; flip = false; face = "cry"; const feed = seg(f, 494, 508);
    hold = f > 486 && f < 508 ? <g transform="translate(0 6)"><Item name="goldApple" x={0} y={30} px={10} /></g> : null;
    pose = tp({ aL: [-20, -10], aR: [lerp(22, 78, feed), lerp(10, 2, feed)], tilt: lerp(10, 18, bell(f, 478, 488)) - bell(f, 488, 496) * 8, lean: 8 });
    if (f >= 508) face = "smile";
  } else {
    // sits beside him by the fire
    const sit = seg(f, 548, 566);
    x = lerp(690, 780, seg(f, 524, 548)); y = FLOOR + 96 * sit; flip = f >= 540 ? true : false; face = "joy"; hold = null;
    pose = tp({ ...walk(f, f < 548 && f > 540 ? 0.7 : 0, 0.7), aL: lerp2([-12, -6], [34, 70], sit), aR: lerp2([14, 6], [60, 62], sit), lL: lerp2([-3, 0], [88, 4], sit), lR: lerp2([3, 0], [86, 2], sit), tilt: 4 * sit });
  }
  return { x, y, rot, pose, face, flip, back, hold };
};

const skeleton = (f: number): Bit => {
  const vis = f >= 330 && f < 440;
  const draw = seg(f, 338, 356);
  const run = seg(f, 384, 392);
  const x = lerp(1120, 1500, lin(f, 384, 430) * run);
  const pulling: [number, number] = [lerp(88, 40, draw), lerp(2, 140, draw)];
  const pose = f < 358 ? tp({ aL: [88, 2], aR: pulling }) : f < 384 ? tp({ aL: [88, 2], aR: [88, 2] }) : tp({ ...walk(f, 1.1, 1.2), aL: [88, 2], aR: [88, 2] });
  const hold = f < 384 ? <Bow draw={f < 358 ? draw : 0} /> : null;
  return { x, y: FLOOR, rot: 0, pose, face: f < 358 ? "grit" : f < 384 ? "grin" : "scream", flip: true, hold, vis };
};

/* ------------------------------ the camera ------------------------------ */

const CAM: [number, number, number, number][] = [
  [0, 520, 1162, 1.2], [50, 530, 1162, 1.2], [64, 500, 1205, 1.45], [78, 480, 1205, 1.6], [90, 380, 1190, 1.3],
  [104, 270, 1230, 1.3], [136, 290, 1190, 1.25], [152, 400, 1180, 1.25], [170, 440, 1215, 1.5], [180, 420, 1225, 1.4],
  [190, 300, 1230, 2.1], [226, 270, 1190, 2.4], [248, 520, 1162, 1.2], [300, 520, 1162, 1.2], [318, 260, 1215, 1.7],
  [336, 400, 1215, 1.7], [350, 700, 1180, 1.15], [372, 800, 1190, 1.35], [392, 800, 1215, 1.5], [470, 810, 1195, 1.65],
  [490, 810, 1205, 1.55], [540, 820, 1190, 1.35], [600, 840, 1190, 1.25],
];
const camAt = (f: number) => {
  for (let i = 0; i < CAM.length - 1; i++) {
    const a = CAM[i], b = CAM[i + 1];
    if (f >= a[0] && f <= b[0]) { const t = ease(f, a[0], b[0]); return { cx: lerp(a[1], b[1], t), cy: lerp(a[2], b[2], t), z: lerp(a[3], b[3], t) }; }
  }
  const l = CAM[CAM.length - 1];
  return { cx: l[1], cy: l[2], z: l[3] };
};
const shakeAt = (f: number) => {
  let a = 0;
  for (const h of [80, 176, ARROW_HIT]) { const u = f - h; if (u >= 0 && u < 14) a = Math.max(a, (1 - u / 14) * (h === ARROW_HIT ? 22 : 18)); }
  return a;
};

/* ------------------------------ the set ------------------------------ */

const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, t));
  return `#${((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1)}`;
};

const TREES = [[-380, 1.1], [-120, 0.9], [980, 1.0], [1260, 1.2], [1500, 0.9], [-640, 1.0]];
const STARS = Array.from({ length: 46 }, (_, i) => ({ x: random(`sx${i}`) * 2600 - 700, y: random(`sy${i}`) * 900 + 100, r: 3 + random(`sr${i}`) * 5, p: random(`sp${i}`) * 6 }));

const Forest: React.FC<{ f: number }> = ({ f }) => {
  const dawn = seg(f, 520, 600);
  const top = mixHex("#0c1230", "#6d6fa8", dawn), bot = mixHex("#243a78", "#f2b58e", dawn);
  return (
    <g>
      <defs>
        <linearGradient id="fSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient>
        <radialGradient id="fHeal"><stop offset="0" stopColor="#fffbd0" stopOpacity={0.95} /><stop offset="0.5" stopColor="#ffe45c" stopOpacity={0.45} /><stop offset="1" stopColor="#ffe45c" stopOpacity={0} /></radialGradient>
        <radialGradient id="fGlow"><stop offset="0" stopColor="#ffb347" stopOpacity={0.7} /><stop offset="1" stopColor="#ff7a1a" stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-900} y={-600} width={3000} height={2400} fill="url(#fSky)" />
      {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r * (0.7 + 0.3 * Math.sin(f * 0.1 + s.p))} fill="#fff" opacity={(1 - dawn) * 0.9} />)}
      <g transform={`translate(${lerp(900, 1100, dawn)} ${lerp(500, 800, dawn)})`}>
        <circle r={96} fill="#fff6cf" stroke={INK} strokeWidth={9} opacity={1 - dawn * 0.7} />
        <circle cx={-26} cy={-14} r={18} fill="#e3d9a8" /><circle cx={30} cy={26} r={13} fill="#e3d9a8" />
      </g>
      {TREES.map(([x, k], i) => (
        <g key={i} transform={`translate(${x} ${FLOOR - 20}) scale(${k})`} stroke={INK} strokeWidth={10} strokeLinejoin="round">
          <rect x={-34} y={-420} width={68} height={420} fill="#4a3220" />
          <rect x={-190} y={-760} width={380} height={230} fill="#23512f" />
          <rect x={-130} y={-910} width={260} height={170} fill="#2d6a3b" />
          <rect x={-190} y={-600} width={90} height={14} fill="#1b3f25" stroke="none" />
        </g>
      ))}
      {/* the ground: grass blocks over dirt, one inked row */}
      <rect x={-900} y={FLOOR - 16} width={3000} height={900} fill="#6b4a2c" stroke={INK} strokeWidth={10} />
      <rect x={-900} y={FLOOR - 16} width={3000} height={64} fill="#3f8f45" stroke={INK} strokeWidth={10} />
      {Array.from({ length: 36 }, (_, i) => <rect key={i} x={-900 + i * 84} y={FLOOR + 48} width={84} height={84} fill={i % 2 ? "#5e4126" : "#6b4a2c"} stroke="#4a3220" strokeWidth={4} />)}
      {Array.from({ length: 22 }, (_, i) => {
        const x = -300 + random(`gx${i}`) * 1900;
        return <path key={i} d={`M${x},${FLOOR - 16} l-8,-26 M${x + 14},${FLOOR - 16} l0,-34 M${x + 28},${FLOOR - 16} l8,-26`} stroke={INK} strokeWidth={6} strokeLinecap="round" fill="none" />;
      })}
    </g>
  );
};

const Campfire: React.FC<{ f: number }> = ({ f }) => {
  const fl = (k: number) => 1 + Math.sin(f * 0.5 + k) * 0.12;
  return (
    <g transform={`translate(${FIRE_X} ${FLOOR - 10})`}>
      <ellipse cx={0} cy={6} rx={120} ry={16} fill="#10081c" opacity={0.3} />
      <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
        <rect x={-90} y={-26} width={180} height={34} rx={8} fill="#6a4426" transform="rotate(-8)" />
        <rect x={-90} y={-26} width={180} height={34} rx={8} fill="#7a5230" transform="rotate(8)" />
      </g>
      <g stroke={INK} strokeWidth={8} strokeLinejoin="round" transform={`scale(1 ${fl(0)})`}>
        <polygon points="-62,-20 -36,-110 -14,-60 6,-150 30,-70 52,-110 64,-20" fill="#ff8a1a" />
        <polygon points="-34,-20 -14,-76 4,-48 16,-104 36,-20" fill="#ffd23a" strokeWidth={6} />
      </g>
    </g>
  );
};

/* particles and pops */
const Burst: React.FC<{ x: number; y: number; f: number; at: number; r?: number }> = ({ x, y, f, at, r = 150 }) => {
  const u = f - at;
  if (u < 0 || u > 9) return null;
  const k = ease(u, 0, 5), a = 1 - ease(u, 5, 9);
  return (
    <g transform={`translate(${x} ${y}) scale(${0.4 + k * 0.9})`} opacity={a}>
      <polygon points={Array.from({ length: 16 }, (_, i) => { const ang = (i / 16) * Math.PI * 2, rr = i % 2 ? r * 0.55 : r; return `${Math.cos(ang) * rr},${Math.sin(ang) * rr}`; }).join(" ")} fill="#fff6a8" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    </g>
  );
};

const Pop: React.FC<{ x: number; y: number; f: number; at: number; text: string; rot?: number; color?: string }> = ({ x, y, f, at, text, rot = -8, color = "#ffe14a" }) => {
  const u = f - at;
  if (u < 0 || u > 22) return null;
  const s = over(u, 0, 6) * (1 - ease(u, 16, 22) * 0.3);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={1 - ease(u, 16, 22)} fontFamily="ComicRelief, Comic Sans MS, sans-serif" fontWeight={700} fontSize={120} textAnchor="middle">
      <text fill={color} stroke={INK} strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">{text}</text>
    </g>
  );
};

const Drops: React.FC<{ f: number; z: Bit; from: number; to: number }> = ({ f, z, from, to }) => {
  if (f < from || f > to) return null;
  return (
    <g>
      {[0, 1].map((k) => {
        const u = ((f - from) * 0.05 + k * 0.5) % 1;
        return <path key={k} d="M0,-14 Q10,2 0,10 Q-10,2 0,-14 Z" transform={`translate(${z.x + (k ? 48 : -34)} ${z.y - 360 + u * 90})`} fill="#7fc4ff" stroke={INK} strokeWidth={5} opacity={1 - u * 0.6} />;
      })}
    </g>
  );
};

const Zzz: React.FC<{ f: number; x: number; y: number }> = ({ f, x, y }) => (
  <g fontFamily="ComicRelief, sans-serif" fontWeight={700} textAnchor="middle">
    {[0, 1, 2].map((k) => {
      const u = ((f * 0.02 + k / 3) % 1);
      return <text key={k} x={x + u * 90} y={y - u * 150} fontSize={50 + k * 16} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={1 - u}>Z</text>;
    })}
  </g>
);

const Hearts: React.FC<{ f: number; x: number; y: number; from: number }> = ({ f, x, y, from }) => {
  if (f < from) return null;
  return (
    <g>
      {Array.from({ length: 6 }, (_, k) => {
        const u = ((f - from) * 0.022 + k / 6) % 1;
        const hx = x + Math.sin(k * 2.4 + u * 4) * 110, hy = y - u * 340;
        return <path key={k} d="M0,12 C-30,-14 -22,-40 0,-24 C22,-40 30,-14 0,12 Z" transform={`translate(${hx} ${hy}) scale(${0.8 + (k % 3) * 0.2})`} fill="#ff5c8a" stroke={INK} strokeWidth={6} opacity={Math.sin(u * Math.PI)} />;
      })}
    </g>
  );
};

/* ------------------------------ composing a frame ------------------------------ */

const CAPTIONS: [number, number, string][] = [
  [0, 58, "CAN WE BE FRIENDS?"], [60, 84, "AAAH! NO!!"], [86, 112, "OW..."], [120, 172, "FRIENDS...?"], [172, 188, "NO!!"],
  [372, 398, "?!"], [446, 480, "...friends?"], [480, 548, "YES."], [552, 600, "BEST FRIENDS"],
];

const Caption: React.FC<{ f: number }> = ({ f }) => {
  const c = CAPTIONS.find(([a, b]) => f >= a && f < b);
  if (!c) return null;
  const text = c[2].toUpperCase();
  const k = over(f - c[0], 0, 6);
  return (
    <g transform={`translate(540 270) scale(${0.85 + 0.15 * k})`} fontFamily="ComicRelief, Comic Sans MS, sans-serif" fontWeight={700} fontSize={text.length > 14 ? 88 : 104} textAnchor="middle" opacity={clamp01(k * 1.4)}>
      <text fill="#ffffff" stroke={INK} strokeWidth={17} strokeLinejoin="round" paintOrder="stroke">{text}</text>
    </g>
  );
};

const Cards: React.FC<{ f: number }> = ({ f }) => {
  const card = (a: number, b: number, text: string) => {
    const fade = f < a + 8 ? ease(f, a, a + 8) : 1 - ease(f, b - 8, b);
    return f >= a && f < b ? (
      <g key={text} opacity={fade}>
        <rect width={W} height={H} fill="#06081a" />
        <g transform="translate(540 940)" fontFamily="ComicRelief, sans-serif" fontWeight={700} textAnchor="middle">
          <text fill="#ffffff" fontSize={150} stroke={INK} strokeWidth={20} strokeLinejoin="round" paintOrder="stroke">{text}</text>
          <circle cx={0} cy={-260} r={70} fill="#fff6cf" stroke={INK} strokeWidth={9} />
        </g>
      </g>
    ) : null;
  };
  return <>{card(228, 252, "NIGHT 2")}{card(312, 326, "NIGHT 3")}</>;
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const ff = frozen(f);
  const cam = camAt(f);
  const sh = shakeAt(f);
  const dx = Math.sin(f * 9) * sh, dy = Math.cos(f * 11) * sh * 0.7;
  const z = zombie(ff), s = steve(ff), k = skeleton(ff);
  const arrowT = f - 358;
  const arrowX = lerp(960, 860, lin(f, 358, ARROW_HIT));
  const apple = f >= 262 && f < 300 ? { x: lerp(160, 420, seg(f, 262, 284)), y: FLOOR - 250 - Math.sin(Math.PI * lin(f, 262, 284)) * 150 + (f >= 284 ? 220 + Math.min(0, 0) : 0) * 0 } : null;
  const petals = f >= 176 && f < 206;
  const glow = f > 508 && f < 560 ? bell(f, 508, 560) : 0;
  const bits: [string, Bit][] = [["z", z], ["s", s]];
  return (
    <g>
      <g transform={`translate(540 960) scale(${cam.z}) translate(${-cam.cx + dx} ${-cam.cy + dy})`}>
        <Forest f={f} />
        <Campfire f={f} />
        <circle cx={FIRE_X} cy={FLOOR - 60} r={560} fill="url(#fGlow)" opacity={0.55 + Math.sin(f * 0.5) * 0.08} style={{ mixBlendMode: "screen" }} />
        {f < 90 && <PoppyGround />}
        {f >= 90 && f < 152 && <PoppyGround />}
        {k.vis && <Actor x={k.x} y={k.y} s={1} look={SKEL} pose={k.pose} face={k.face} flip holdL={k.hold} t={f} />}
        {f >= 358 && f < ARROW_HIT && <g transform={`translate(${arrowX} ${FLOOR - 250}) scale(-1 1)`}><Arrow /></g>}
        {bits.map(([id, b]) => (
          <g key={id} transform={`rotate(${b.rot} ${b.x} ${b.y + (b.rot ? 0 : 0)})`}>
            <Actor x={b.x} y={b.y} s={1} look={id === "z" ? ZOMBIE : STEVE} pose={b.pose} face={b.face} flip={b.flip} back={b.back} t={f} holdR={b.hold} torso={b.torso} />
          </g>
        ))}
        {f >= 152 && f < 178 && (
          <g transform={`translate(${z.x + 205} ${FLOOR - 244})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
            <rect x={-5} y={-90} width={10} height={96} fill="#3f8f3a" />
            <rect x={-26} y={-134} width={52} height={46} rx={9} fill="#d21f2a" />
            <rect x={-7} y={-120} width={14} height={14} fill="#1f1f1f" stroke="none" />
          </g>
        )}
        {apple && f < 296 && <Item name="goldApple" x={apple.x} y={apple.y} px={8} />}
        {f >= 284 && f < 340 && <g transform={`translate(420 ${FLOOR - 30})`}><Item name="goldApple" x={0} y={0} px={9} /></g>}
        {petals && Array.from({ length: 10 }, (_, i) => {
          const u = f - 176, a = random(`pt${i}`) * Math.PI - Math.PI, v = 10 + random(`pv${i}`) * 16;
          return <rect key={i} x={400 + Math.cos(a) * v * u} y={FLOOR - 300 + Math.sin(a) * v * u + u * u * 0.7} width={20} height={20} fill="#d21f2a" stroke={INK} strokeWidth={4} transform={`rotate(${u * 14 * (i % 2 ? 1 : -1)} ${400 + Math.cos(a) * v * u} ${FLOOR - 300 + Math.sin(a) * v * u + u * u * 0.7})`} />;
        })}
        <Drops f={f} z={z} from={186} to={236} />
        <Drops f={f} z={s} from={430} to={520} />
        {f >= 318 && f < ARROW_HIT && <Zzz f={f} x={s.x - 40} y={FLOOR - 250} />}
        <Hearts f={f} x={870} y={FLOOR - 200} from={524} />
        {glow > 0 && <circle cx={z.x} cy={FLOOR - 160} r={150 + 330 * glow} fill="url(#fHeal)" opacity={0.9 * glow} style={{ mixBlendMode: "screen" }} />}
        <Burst x={455} y={FLOOR - 270} f={f} at={80} />
        <Burst x={430} y={FLOOR - 270} f={f} at={176} r={120} />
        <Burst x={z.x + 20} y={FLOOR - 230} f={f} at={ARROW_HIT} r={130} />
        <Pop x={470} y={FLOOR - 470} f={f} at={80} text="WHAM!" />
        <Pop x={440} y={FLOOR - 470} f={f} at={176} text="WHAM!" rot={7} />
        <Pop x={z.x} y={FLOOR - 470} f={f} at={ARROW_HIT} text="THUNK!" color="#ff6a6a" />
      </g>
      <Cards f={f} />
    </g>
  );
};

const PoppyGround: React.FC = () => (
  <g transform={`translate(230 ${FLOOR - 16})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={-4} y={-62} width={8} height={62} fill="#3f8f3a" />
    <rect x={-22} y={-96} width={44} height={36} rx={8} fill="#d21f2a" />
    <rect x={-6} y={-84} width={12} height={12} fill="#1f1f1f" stroke="none" />
  </g>
);

export const FriendShort: React.FC<{ audio?: string | null; captions?: boolean; blur?: boolean }> = ({ audio = null, captions = true, blur = true }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  const body = (
    <DrawnContext.Provider value>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="fVig" cx="50%" cy="48%" r="75%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#05030f" stopOpacity={0.55} /></radialGradient>
          <linearGradient id="fDirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05030f" stopOpacity={0} /><stop offset="1" stopColor="#05030f" stopOpacity={0.7} /></linearGradient>
        </defs>
        <Scene f={f} />
        <rect width={W} height={H} fill="url(#fVig)" />
        <rect y={1250} width={W} height={670} fill="url(#fDirt)" />
      </svg>
    </DrawnContext.Provider>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio && <Audio src={staticFile(audio)} />}
      {blur ? <CameraMotionBlur shutterAngle={180} samples={5}>{body}</CameraMotionBlur> : body}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {captions && <Caption f={f} />}
      </svg>
    </AbsoluteFill>
  );
};

export const FriendThumb: React.FC = () => {
  loadMinecraftFonts();
  const f = 206; // the zombie, tear on his cheek, the flower's petals still falling
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <DrawnContext.Provider value>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="fVig" cx="50%" cy="55%" r="75%"><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#05030f" stopOpacity={0.6} /></radialGradient>
            <linearGradient id="fTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05030f" stopOpacity={0.55} /><stop offset="1" stopColor="#05030f" stopOpacity={0} /></linearGradient>
          </defs>
          <Scene f={f} />
          <rect width={W} height={H} fill="url(#fVig)" />
          <rect width={W} height={560} fill="url(#fTop)" />
          <g transform="translate(540 0)" fontFamily="ComicRelief, Comic Sans MS, sans-serif" fontWeight={700} textAnchor="middle">
            <text y={190} fill="#ffffff" fontSize={102} stroke={INK} strokeWidth={21} strokeLinejoin="round" paintOrder="stroke">HE JUST WANTED</text>
            <text y={390} fill="#ffe14a" fontSize={206} stroke={INK} strokeWidth={30} strokeLinejoin="round" paintOrder="stroke">A FRIEND</text>
          </g>
        </svg>
      </DrawnContext.Provider>
    </AbsoluteFill>
  );
};

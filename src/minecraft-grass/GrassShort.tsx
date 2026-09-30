import React from "react";
import { AbsoluteFill, Audio, random, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease, FaceKind, lerpPose, limb, Pose, pose, POSE, Pt } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { HandDrawn } from "../minecraft/handdrawn";
import { Cow } from "../minecraft/mobs";
import { Oofy, OofyTint, OOFY_TINT } from "../minecraft/oofy";
import { Item, Puff } from "../minecraft/pixels";
import { Blocks2D, Palette } from "../minecraft-bridge/blocks";
import B from "./beats.json";

/**
 * "POV: You finally reach grass" — 12 seconds, starring Oofy.
 *
 * A cutaway of the ground. Oofy pillars his way up a one-wide shaft, a block at
 * a time: stone, then dirt, the camera riding up with him, the rhythm speeding
 * up as he gets into it — and you can see the sunlit surface above him the
 * whole time, which is half the joke. The last block leaks light at the
 * edges; he sees it, breathes, and breaks through into a meadow. Then the
 * best part of the whole thing: lying on the grass.
 */

export const GRASS_FRAMES = B.frames;
export const GRASS_CAPTION = ["POV: You finally", "reach grass"];

const LINE = "#2a1b3d";
const S = 190; // one block
const ROWS = 12; // blocks between him and the sky
const FLOOR_ROW = 14; // row of the floor he starts on
const SO = 0.76; // Oofy scale in the shaft
const SHAFT_X = 540; // screen x of the shaft's centre line
const CAVE: OofyTint = { ...OOFY_TINT.normal, skin: "#ecebf3", hoodie: "#7a54d8", pants: "#2a3048" };
const MONO = "Monocraft, monospace";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

const STONE: Palette = { base: ["#8d8d96", "#7c7c86", "#9d9da6", "#6c6c76"], weights: [0.42, 0.3, 0.18, 0.1] };
const DIRT: Palette = { base: ["#8b5a34", "#7a4b2a", "#9c6a40", "#6a3f22"], weights: [0.42, 0.3, 0.18, 0.1] };

/* ------------------------- where he is, step by step ------------------------- */

const STRIKES = B.strikes;
/** how many blocks he has risen by frame f (fractional during a rise) */
const risen = (f: number) => {
  let k = 0;
  for (let i = 0; i < STRIKES.length - 1; i++) {
    const a = STRIKES[i] + 3, len = B.riseLen[i];
    k += ease(f, a, a + len);
  }
  return k;
};
/** which step we are on, and time since its strike */
const stepAt = (f: number) => {
  let i = 0;
  for (let n = 0; n < STRIKES.length; n++) if (f >= STRIKES[n] - 14) i = n;
  return i;
};

/* ----------------------------- the cutaway ----------------------------- */

const ORE = ["#2b2b2b", "#e8c9a0", "#f4d03f", "#4fe8e0"];

const Terrain: React.FC<{ camY: number; broken: number }> = ({ camY, broken }) => {
  // world y of row r's top edge is r*S; screen = world - camY
  const cellsStone: [number, number][] = [], cellsDirt: [number, number][] = [];
  for (let r = -1; r < 22; r++) {
    const sy = r * S - camY;
    if (sy > H || sy < PANEL_TOP - S) continue;
    for (let c = -5; c <= 4; c++) {
      const inShaft = c === -1 || c === 0;
      if (inShaft && r >= ROWS - broken) continue; // dug out (rows below the ceiling)
      if (inShaft && r > FLOOR_ROW - 2) continue;
      const cell: [number, number] = [c, r];
      if (r < 0) continue;
      (r >= 6 ? cellsStone : cellsDirt).push(cell);
    }
  }
  const ox = SHAFT_X, oy = -camY;
  return (
    <g>
      {/* the back wall of the shaft */}
      <rect x={ox - S} y={Math.max(PANEL_TOP, oy)} width={S * 2} height={H} fill="#15121b" />
      <Blocks2D cells={cellsStone} ox={ox} oy={oy} s={S} pal={STONE} />
      <Blocks2D cells={cellsDirt} ox={ox} oy={oy} s={S} pal={DIRT} />
      {/* the grass top, only on the surface row */}
      {Array.from({ length: 10 }, (_, i) => {
        const c = i - 5;
        if ((c === -1 || c === 0) && ROWS - broken <= 0) return null;
        return <rect key={i} x={ox + c * S} y={oy - 4} width={S} height={44} fill="#5fb04a" stroke={LINE} strokeWidth={6} />;
      })}
      {/* a few ores, to tell you how deep you are */}
      {Array.from({ length: 26 }, (_, i) => {
        const r = 6 + Math.floor(random(`or${i}`) * 16), c = -5 + Math.floor(random(`oc${i}`) * 10);
        if (c === -1 || c === 0) return null;
        const x = ox + c * S + 30 + random(`ox${i}`) * 60, y = oy + r * S + 30 + random(`oy${i}`) * 60;
        if (y < PANEL_TOP - 40 || y > H) return null;
        const col = ORE[i % ORE.length];
        return <g key={i}><rect x={x} y={y} width={26} height={26} fill={col} /><rect x={x + 26} y={y + 14} width={20} height={20} fill={col} /></g>;
      })}
      {/* torches on the back wall, where he placed them on the way up */}
      {[2, 6, 10, 14].map((r) => {
        const y = oy + r * S + S * 0.9;
        if (y < PANEL_TOP - 100 || y > H + 100 || r < ROWS - broken - 0.5 + 0) return null;
        return (
          <g key={r}>
            <circle cx={ox + 70} cy={y} r={150} fill="#ffb24a" opacity={0.10} />
            <rect x={ox + 62} y={y} width={16} height={56} fill="#8a5a2a" stroke={LINE} strokeWidth={5} />
            <rect x={ox + 56} y={y - 34} width={28} height={40} fill="#ffb02e" stroke={LINE} strokeWidth={5} />
          </g>
        );
      })}
    </g>
  );
};

const Sky: React.FC<{ camY: number; f: number }> = ({ camY, f }) => {
  const top = -camY; // screen y of the surface line
  if (top < PANEL_TOP - 60) return null;
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={Math.max(0, top - PANEL_TOP + 4)} fill="#8fd2ff" />
      <rect x={0} y={Math.max(PANEL_TOP, top - 360)} width={W} height={Math.min(360, top - PANEL_TOP)} fill="#b8e4ff" />
      <rect x={720} y={top - 560} width={150} height={150} fill="#fff6c8" stroke="#fff" strokeWidth={0} />
      {[[80, 380, 240], [560, 520, 300], [880, 330, 200]].map(([x, y, w], i) => (
        <rect key={i} x={x + ((f * (0.3 + i * 0.1)) % 200)} y={top - y} width={w} height={70} fill="#ffffff" opacity={0.92} />
      ))}
      {/* surface life, seen from below */}
      <Cow x={190} y={top - 210} scale={0.8} />
    </g>
  );
};

/* ------------------------------- particles ------------------------------- */

const Burst: React.FC<{ x: number; y: number; t: number; pal: Palette; n?: number }> = ({ x, y, t, pal, n = 9 }) =>
  t < 0 || t > 18 ? null : (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3, v = 10 + random(`bv${i}`) * 10;
        const px = x + Math.cos(a) * v * t * 0.9, py = y + Math.sin(a) * v * t * 0.5 + 1.2 * t * t;
        return <rect key={i} x={px - 11} y={py - 11} width={22} height={22} fill={pal.base[i % 4]} stroke={LINE} strokeWidth={3} opacity={1 - t / 19} />;
      })}
    </g>
  );

/* ------------------------------ in the shaft ------------------------------ */

const ShaftScene: React.FC<{ f: number }> = ({ f }) => {
  const k = risen(f);
  const i = stepAt(f);
  const Fy = (FLOOR_ROW - k) * S; // world y of his feet
  const camY = Fy - 1500;
  const fin = f >= B.strikes[B.strikes.length - 1];
  const t = f - STRIKES[i]; // frames since this step's strike
  const finalStep = i === STRIKES.length - 1;
  // how many blocks have been broken (the last one breaks at its strike)
  const broken = STRIKES.filter((s) => f >= s).length;
  // pose: tired slump -> wind-up -> strike overhead -> a little hop up
  const SLUMP = pose({ head: [10, -84], armL: limb(-72, 120, -60, 208), armR: limb(72, 120, 62, 208) });
  const WIND = pose({ head: [6, -92], armR: limb(112, 46, 140, -10), armL: limb(-74, 116, -64, 200) });
  const HIT = pose({ head: [0, -98], armR: limb(56, -70, 8, -196), armL: limb(-96, 40, -130, -60) });
  const TOSS = pose({ head: [0, -96], armR: limb(70, -40, 40, -150), armL: limb(-90, 30, -120, -100) });
  let p: Pose = SLUMP, face: FaceKind = "meh", gaze: Pt = [0, -10];
  const pre = STRIKES[i] - f; // frames until the strike
  if (pre > 0 && pre <= (finalStep ? 14 : i < 3 ? 9 : 5)) {
    p = lerpPose(SLUMP, WIND, ease(f, STRIKES[i] - (finalStep ? 14 : i < 3 ? 9 : 5), STRIKES[i] - 1));
    face = "gritted";
  } else if (t >= 0 && t < 4) {
    p = lerpPose(WIND, HIT, ease(t, 0, 1.5));
    face = "gritted";
  } else if (t >= 4 && t < 4 + 10) {
    p = lerpPose(HIT, SLUMP, ease(t, 4, 12));
    face = i < 3 ? "meh" : "gritted";
  }
  // the sigh and the stretch after the first steps
  if (f >= B.sigh[0] && f < B.sigh[1] && i === 0) {
    const s = (f - B.sigh[0]) / (B.sigh[1] - B.sigh[0]);
    p = lerpPose(SLUMP, pose({ head: [6, -74], armL: limb(-70, 120, -60, 208), armR: limb(72, 124, 64, 210) }), Math.sin(s * Math.PI));
    face = "meh";
  }
  // the suspense before the last block: light is leaking through; he sees it, breathes, raises the pick
  const [s0, s1] = B.suspense;
  if (f >= s0 && f < s1 - 14) {
    const u = (f - s0) / (s1 - 14 - s0);
    p = lerpPose(SLUMP, pose({ head: [4, -100], armR: limb(80, 10, 100, -80), armL: limb(-74, 116, -64, 200) }), ease(u, 0, 0.4));
    face = u < 0.35 ? "surprised" : u < 0.7 ? "calm" : "worried";
    gaze = [0, -24];
  }
  if (f >= B.leak && f < s1) face = f < 214 ? "surprised" : f < 226 ? "worried" : face;
  // hop up while rising; squash on landing
  const rising = k - Math.floor(k + 0.0001) > 0.001 && k < ROWS;
  const fr = k - Math.floor(k);
  const stretch = rising ? 1 + Math.sin(fr * Math.PI) * 0.10 : 1;
  const squash = f >= STRIKES[i] + 3 && t < 18 && !rising && t > 7 && !finalStep ? 1 - Math.max(0, 1 - (t - 7) / 3) * 0.08 : 1;
  const sy = stretch * squash, sx = 1 / Math.sqrt(sy);
  // camera shake on each hit
  const shake = t >= 0 && t < 5 && !finalStep ? Math.sin(t * 7) * 4 * (1 - t / 5) : 0;
  const hitRow = ROWS - broken; // the row he is mining now
  const crack = pre > -1 && pre <= 14 ? clamp01((14 - pre) / 14) : 0;
  const blockTopY = (FLOOR_ROW - k - 3) * S - camY; // the ceiling block's top edge on screen
  const oofyY = Fy - camY - 335 * SO * sy;
  const fuse = fin ? 0 : 1;
  void fuse;
  return (
    <g transform={`translate(${shake} ${shake * 0.6})`}>
      <rect x={0} y={PANEL_TOP} width={W} height={H} fill="#15121b" />
      <Sky camY={camY} f={f} />
      <Terrain camY={camY} broken={Math.min(broken + (k - Math.floor(k) > 0 ? 0 : 0), ROWS)} />
      {/* cracks on the block he is about to break */}
      {!fin && crack > 0 && (
        <g stroke="#1a1a22" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.75 * crack}>
          <path d={`M${SHAFT_X - 140},${blockTopY + 30} l60,50 l-30,36 M${SHAFT_X + 20},${blockTopY + 20} l-20,70 l56,30`} />
          {crack > 0.5 && <path d={`M${SHAFT_X - 50},${blockTopY + 10} l-16,40 l44,30 l-14,40`} />}
        </g>
      )}
      {/* the leak: light round the edges of the last block */}
      {f >= B.leak && f < B.breakFinal && (
        <g fill="#fff6c8" opacity={0.6 + 0.4 * Math.sin(f * 0.6)}>
          <rect x={SHAFT_X - S} y={blockTopY - 4} width={8} height={S + 8} />
          <rect x={SHAFT_X + S - 8} y={blockTopY - 4} width={8} height={S + 8} />
          <rect x={SHAFT_X - S} y={blockTopY - 4} width={S * 2} height={8} />
          <path d={`M${SHAFT_X - S},${blockTopY + S} h${S * 2} l${S * 1.2},${S * 1.6} h${-S * 4.4} z`} opacity={0.22} />
        </g>
      )}
      <g transform={`translate(${SHAFT_X} ${Fy - camY}) scale(${sx} ${sy}) translate(${-SHAFT_X} ${-(Fy - camY)})`}>
        <Oofy
          x={SHAFT_X} y={oofyY / 1 - (335 * SO * (1 - 1)) + 0} scale={SO} pose={p} face={face} tint={CAVE} shadow={false} faceOffset={gaze} look={[0, -3]}
          hands={({ R }) => <Item name="pickaxe" x={R[0] + 40} y={R[1] - 70} px={10} rotate={-10} />}
        />
      </g>
      {/* the floor he placed under himself, popping in on each rise */}
      {Array.from({ length: 6 }, (_, j) => (
        <rect key={j} x={SHAFT_X - S} y={Fy - camY + j * S} width={S * 2} height={S} fill={j % 2 ? "#7b7b84" : "#6f6f78"} stroke={LINE} strokeWidth={8} />
      ))}
      {/* break bursts */}
      {STRIKES.map((s, n) => {
        const row = ROWS - 1 - n; // row that broke at this strike
        const kk = n; // he has risen n blocks by then
        const y = (FLOOR_ROW - kk - 2.5) * S - camY;
        return <Burst key={s} x={SHAFT_X} y={y} t={f - s} pal={row >= 6 ? STONE : DIRT} />;
      })}
      {/* dust falling from the ceiling on each hit */}
      {f >= 0 && t >= 0 && t < 14 && !finalStep && (
        <g fill="#b9b9c4">
          {[0, 1, 2, 3, 4].map((n) => <rect key={n} x={SHAFT_X - 100 + n * 50 + random(`dd${i}${n}`) * 20} y={blockTopY + S + t * 14 + n * 6} width={8} height={8} opacity={1 - t / 14} />)}
        </g>
      )}
    </g>
  );
};

/* -------------------------------- outside -------------------------------- */

const GROUND = 1340;
const LIE_X = 790; // where his feet end up, so the whole of him lies across the middle of the frame

const Bird: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const flap = Math.sin(f * 0.9) * 26;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={LINE} strokeWidth={5} strokeLinejoin="round">
      <ellipse rx={30} ry={20} fill="#6aa0ff" />
      <circle cx={24} cy={-10} r={14} fill="#6aa0ff" />
      <path d="M36,-12 L50,-8 L36,-4 Z" fill="#f4b73c" />
      <path d={`M-6,0 L14,0 L4,${-28 - flap} Z`} fill="#4c82ea" />
    </g>
  );
};

const Butterfly: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => {
  const w = 0.35 + 0.65 * Math.abs(Math.sin(f * 0.7));
  return (
    <g transform={`translate(${x} ${y})`} stroke={LINE} strokeWidth={4} strokeLinejoin="round">
      <ellipse cx={-16 * w} cy={-6} rx={18 * w} ry={14} fill="#ffb347" />
      <ellipse cx={16 * w} cy={-6} rx={18 * w} ry={14} fill="#ffb347" />
      <ellipse cx={-12 * w} cy={10} rx={12 * w} ry={10} fill="#ff7a59" />
      <ellipse cx={12 * w} cy={10} rx={12 * w} ry={10} fill="#ff7a59" />
      <rect x={-3} y={-14} width={6} height={32} fill={LINE} />
    </g>
  );
};

const Outside: React.FC<{ f: number }> = ({ f }) => {
  const { headPop, look, climb, arms, flop } = B;
  const l = f - B.outside;
  // the camera starts tight, then pulls back and up while he lies in the grass
  const pull = ease(f, flop + 4, B.frames - 4);
  const z = lerp(1, 0.72, pull);
  let rise = 0, p: Pose = POSE.stand, face: FaceKind = "meh", rot = 0, gaze: Pt = [0, 0], over = false, x = 540, y = GROUND;
  // he climbs out of the hole and steps off to the right, so he is never standing in it
  x = lerp(540, LIE_X, ease(f, climb[0] + 6, arms[0]));
  let clip = true;
  if (f < climb[0]) {
    // head and shoulders come up out of the hole, squinting, then wide-eyed
    rise = ease(f, headPop[0], headPop[1]);
    p = pose({ armL: limb(-120, 70, -150, 120), armR: limb(120, 70, 150, 120) });
    face = f < look[0] ? "meh" : "surprised";
    gaze = f < look[0] ? [0, -8] : [Math.sin((f - look[0]) * 0.6) * 26, -8];
  } else if (f < arms[0]) {
    // he hauls himself out
    rise = 1;
    const u = ease(f, climb[0], climb[1]);
    p = lerpPose(pose({ armL: limb(-120, 70, -150, 120), armR: limb(120, 70, 150, 120) }), POSE.stand, u);
    face = "joy";
    clip = u < 0.8;
  } else if (f < flop) {
    rise = 1; clip = false;
    const u = ease(f, arms[0], arms[1]);
    p = lerpPose(POSE.stand, pose({ armL: limb(-150, 10, -240, -70), armR: limb(150, 10, 240, -70) }), u);
    face = "calm";
    gaze = [0, -10];
  } else {
    rise = 1; clip = false;
    // he lets himself fall straight back onto the grass and lies there, arms out
    const u = ease(f, flop - 6, flop + 4);
    rot = lerp(0, -90, u);
    p = pose({ armL: limb(-150, 10, -240, -70), armR: limb(150, 10, 240, -70) });
    p = lerpPose(p, pose({ armL: limb(-140, 30, -220, 20), armR: limb(140, 30, 220, 20) }), u);
    face = "calm";
    x = LIE_X;
    y = GROUND - 64 * u; // lying on top of the grass, not in it
  }
  // a bob of relief
  const breathe = f > flop + 10 ? Math.sin((f - flop) * 0.12) * 4 : 0;
  const hopPx = rise < 1 ? (1 - rise) * 380 : 0;
  const feetY = y + hopPx;
  const zx = 540, zy = GROUND - 100;
  return (
    <g>
      <g transform={`translate(${zx} ${zy}) scale(${z}) translate(${-zx} ${-zy})`}>
        {/* the meadow */}
        <rect x={-600} y={PANEL_TOP - 400} width={W + 1200} height={GROUND - PANEL_TOP + 400} fill="#8fd2ff" />
        <rect x={-600} y={GROUND - 420} width={W + 1200} height={420} fill="#b8e4ff" />
        <rect x={760} y={PANEL_TOP + 120} width={170} height={170} fill="#fff6c8" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={760 + 85 - 4 + Math.cos(i * 0.785) * 160 - 18} y={PANEL_TOP + 205 + Math.sin(i * 0.785) * 160 - 18} width={36} height={36} fill="#fff6c8" opacity={0.45} />)}
        {[[60, 580, 280], [480, 700, 340], [820, 520, 220]].map(([cx, cy, w], i) => (
          <rect key={i} x={cx + ((f * (0.6 + i * 0.2)) % 260) - 200} y={cy} width={w} height={84} fill="#ffffff" opacity={0.95} />
        ))}
        {/* hills */}
        <path d={`M-600,${GROUND} V${GROUND - 200} h700 v-110 h420 v90 h500 v-140 h500 V${GROUND} Z`} fill="#6cbf55" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
        {/* the ground, with the hole he came out of */}
        <rect x={-600} y={GROUND} width={W + 1200} height={2400} fill="#8b5a34" stroke={LINE} strokeWidth={8} />
        <rect x={-600} y={GROUND - 12} width={W + 1200} height={64} fill="#5fb04a" stroke={LINE} strokeWidth={8} />
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-560 + i * 80 + random(`gr${i}`) * 30} y={GROUND - 28} width={12} height={22} fill="#4a9a3a" />)}
        <rect x={455} y={GROUND - 12} width={170} height={64} fill="#15121b" stroke={LINE} strokeWidth={8} />
        {[[90, 18], [220, -10], [880, 6], [990, -8], [330, 14]].map(([fx, dy], i) => (
          <g key={i}>
            <rect x={fx - 4} y={GROUND - 54 + dy} width={8} height={40} fill="#3f8a32" />
            <rect x={fx - 15} y={GROUND - 74 + dy} width={30} height={26} fill={i % 2 ? "#ffd84a" : "#e8483a"} stroke={LINE} strokeWidth={4} />
          </g>
        ))}
        <Cow x={150} y={GROUND - 210} scale={0.85} walk={f * 0.12} />
        {f >= B.birds[0] && <Bird x={250 + f * 1.2} y={PANEL_TOP + 330 + Math.sin(f * 0.1) * 24} f={f} s={1.2} />}
        {f >= B.birds[1] && <Bird x={900 - f * 0.8} y={PANEL_TOP + 230 + Math.sin(f * 0.13 + 1) * 20} f={f + 4} s={0.9} />}
        {/* Oofy: rising out of the hole (clipped at the ground line), then free */}
        <g>
          {clip && <clipPath id="holeClip"><rect x={0} y={PANEL_TOP - 600} width={W} height={GROUND - 12 + 40 - (PANEL_TOP - 600)} /></clipPath>}
          <g clipPath={clip ? "url(#holeClip)" : undefined}>
            <g transform={`translate(${x} ${feetY + breathe}) rotate(${rot})`}>
              <Oofy x={0} y={-335 * 1.05} scale={1.05} pose={p} face={face} tint={OOFY_TINT.normal} shadow={false} faceOffset={gaze} armsOverHead={over}
                hands={() => (f < arms[0] ? <Item name="pickaxe" x={150} y={90} px={10} rotate={10} /> : null)} />
            </g>
          </g>
        </g>
        {f >= B.butterfly && <Butterfly x={lerp(980, 318, ease(f, B.butterfly, B.butterfly + 30))} y={lerp(GROUND - 520, GROUND - 168, ease(f, B.butterfly, B.butterfly + 30)) + Math.sin(f * 0.5) * 10} f={f} />}
        {/* the landing: a puff of grass at the flop */}
        {f >= flop - 1 && f < flop + 9 && [0, 1, 2, 3].map((i) => <Puff key={i} x={470 + i * 50 + (f - flop) * (i - 1.5) * 4} y={GROUND - 30 - (f - flop) * 6} r={16 * (1 - (f - flop) / 10)} opacity={1 - (f - flop) / 10} />)}
      </g>
    </g>
  );
};

/* -------------------------------- assembly -------------------------------- */

const Whiteout: React.FC<{ f: number }> = ({ f }) => {
  const a = B.breakFinal, b = B.outside;
  // a flash as the last block goes, a burst of light down the shaft, fading out into the meadow
  const o = f < a ? 0 : f < a + 3 ? 1 : f < b + 16 ? 1 - ease(f, a + 3, b + 16) * 0.98 : 0;
  return o <= 0 ? null : <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#fffbe0" opacity={o} />;
};

const Scene: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {f < B.outside ? <ShaftScene f={f} /> : <Outside f={f} />}
  </g>
);

const CaptionBand: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PANEL_TOP, background: "#ffffff" }}>
    <div style={{ position: "absolute", left: 80, top: 111, fontFamily: "Selawik, 'Segoe UI', sans-serif", fontSize: 88, lineHeight: "118px", color: "#000", whiteSpace: "pre" }}>
      {GRASS_CAPTION.join("\n")}
    </div>
  </div>
);

const YReadout: React.FC<{ f: number }> = ({ f }) => {
  const k = f >= B.breakFinal ? ROWS : risen(f);
  const y = f >= B.breakFinal ? 64 : Math.round(lerp(-52, 63, clamp01(k / ROWS)));
  return (
    <g>
      <rect x={30} y={PANEL_TOP + 24} width={250} height={84} fill="#000" opacity={0.55} />
      <text x={56} y={PANEL_TOP + 82} fontFamily={MONO} fontSize={42} fill={y >= 60 ? "#7dff7d" : "#ffffff"}>{`Y: ${y}`}</text>
    </g>
  );
};

export const GrassShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#15121b" }}>
      {audio && <Audio src={staticFile(audio)} />}
      <HandDrawn enabled={drawn} hold={1} boilEvery={2} boil={0.75} grain={0}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs><clipPath id="grassPanel"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
          <g clipPath="url(#grassPanel)"><Scene f={f} /></g>
        </svg>
      </HandDrawn>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Whiteout f={f} />
        <YReadout f={f} />
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};

export const GrassThumb: React.FC = () => {
  loadMinecraftFonts();
  const f = B.leak + 10; // the last block leaking light, with the sky and the cow already showing above him
  return (
    <AbsoluteFill style={{ backgroundColor: "#8fd2ff" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs><clipPath id="grassPanelT"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
        <g clipPath="url(#grassPanelT)"><Scene f={f} /></g>
        <YReadout f={f} />
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};

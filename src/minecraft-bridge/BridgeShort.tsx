import { noise2D } from "@remotion/noise";
import React from "react";
import { AbsoluteFill, Audio, random, staticFile, useCurrentFrame } from "remotion";
import { ease, FaceKind, limb, lerpPose, Pose, pose, Pt, walkPose } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { HandDrawn } from "../minecraft/handdrawn";
import { Tag } from "../minecraft/mobs";
import { Oofy, OofyTint, OOFY_TINT } from "../minecraft/oofy";
import { BLUE, Blocks2D, Box, Boxes, Cam, GRASS, MiniCube, P2, Palette, project, pxPerUnit, TexQuad } from "./blocks";
import B from "./beats.json";

/**
 * "Java Players vs Bedrock Players: bridging" — 13.9 seconds.
 *
 * A shot-for-shot remake of GarrettTheCarrot's "Bridging in Minecraft
 * (REANIMATED)", on his soundtrack, with our cast and our look. Java Oofy
 * (purple hoodie, band-aid) sneak-bridges one terrified block at a time,
 * wobbles on the end of his bridge and falls off. Bedrock Oofy (blue
 * hoodie, never needs a band-aid) strolls forward placing blocks, builds a
 * staircase into space and a loop-the-loop, then blasts past Java on a
 * bridge of his own and knocks him off.
 *
 * Every cut and beat is on the reference's frame (beats.json), so the lifted
 * track lines up. The world is drawn on twos with a boiling line; the
 * name tags ride along inside it, as they do in the game.
 */

export const BRIDGE_FRAMES = B.frames;

const JAVA: OofyTint = OOFY_TINT.normal;
const BED: OofyTint = { skin: "#fff1e0", line: "#2a1b3d", hoodie: "#2563eb", pants: "#2f3654", shoe: "#f7f3ee" };
/** Minecraft players are 1.8 blocks; Garrett draws them nearer two, and so do we */
const TALL = 1.95;
const oofyScale = (pxPerBlock: number) => (pxPerBlock * TALL) / 431;

/* ------------------------------ helpers ------------------------------ */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(lerp((pa >> s) & 0xff, (pb >> s) & 0xff, t));
  return `#${((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1)}`;
};

/** Oofy standing on (x, y), turned `rot` degrees about his feet, blocks in hand */
const Guy: React.FC<{
  x: number; y: number; s: number; p: Pose; face: FaceKind; tint: OofyTint; rot?: number; look?: Pt; flip?: boolean;
  hold?: { L?: Palette; R?: Palette }; cube?: number; tilt?: number;
}> = ({ x, y, s, p, face, tint, rot = 0, look, flip, hold, cube = 74, tilt }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <Oofy
      x={0} y={-335 * s} scale={s} pose={p} face={face} tint={tint} look={look} flip={flip} tilt={tilt}
      shadow={false} bandAid={tint === JAVA}
      hands={(h) => (
        <>
          {hold?.L && <MiniCube x={h.L[0]} y={h.L[1] - 8} s={cube} pal={hold.L} />}
          {hold?.R && <MiniCube x={h.R[0]} y={h.R[1] - 8} s={cube} pal={hold.R} />}
        </>
      )}
    />
  </g>
);

/** where a Guy's head centre lands on screen, for pinning his name tag */
const headOf = (x: number, y: number, s: number, rot: number, p: Pose): Pt => {
  const hx = p.head[0] * s, hy = -335 * s + p.head[1] * s;
  const r = (rot * Math.PI) / 180;
  return [x + hx * Math.cos(r) - hy * Math.sin(r), y + hx * Math.sin(r) + hy * Math.cos(r)];
};

/** a name tag floating clear of the quiff: `s` is the Oofy scale, since his hair stands 140 units above his head's centre */
const NameTag: React.FC<{ at: Pt; text: string; size: number; s: number; tilt?: number }> = ({ at, text, size, s, tilt = 0 }) => {
  const r = (tilt * Math.PI) / 180, d = 165 * s + size * 1.05;
  return <Tag x={at[0] + Math.sin(r) * d} y={at[1] - Math.cos(r) * d} text={text} size={size} tilt={tilt} font="monocraft" />;
};

const Sky: React.FC<{ top: string; bottom: string; id: string }> = ({ top, bottom, id }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={top} />
        <stop offset="100%" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#${id})`} />
  </>
);

const Stars: React.FC<{ opacity: number; below?: number }> = ({ opacity, below = 1300 }) => (
  <g fill="#ffffff" opacity={opacity}>
    {Array.from({ length: 70 }, (_, i) => {
      const x = random(`sx${i}`) * 1080, y = random(`sy${i}`) * below, s = 4 + random(`ss${i}`) * 7;
      return <rect key={i} x={x} y={y} width={s} height={s} opacity={0.35 + random(`so${i}`) * 0.5} />;
    })}
  </g>
);

/** Minecraft's blocky cloud layer seen from above, in perspective between two screen heights */
const CloudBand: React.FC<{ y0: number; y1: number; drift: number; seed: string; opacity?: number }> = ({ y0, y1, drift, seed, opacity = 0.78 }) => {
  const rows = 24;
  let d = "";
  for (let r = 0; r < rows; r++) {
    const t0 = r / rows, t1 = (r + 1) / rows;
    const ya = y0 + (y1 - y0) * t0 ** 1.7, yb = y0 + (y1 - y0) * t1 ** 1.7;
    const w = 12 + 150 * t1 ** 1.7;
    const off = drift * (0.2 + t1);
    for (let c = -2; c * w < 1080 + 2 * w; c++) {
      const col = c + Math.floor(off / w);
      if (noise2D(seed, col * 0.23, (rows - r) * 0.33) > 0.34) d += `M${(c * w - (off % w)).toFixed(1)},${ya.toFixed(1)}h${w.toFixed(1)}V${yb.toFixed(1)}h${(-w).toFixed(1)}Z`;
    }
  }
  return <path d={d} fill="#f4f9ff" opacity={opacity} />;
};

/** face-on blocky clouds, for the side views */
const FlatClouds: React.FC<{ y: number; cell: number; drift: number; seed: string; opacity?: number }> = ({ y, cell, drift, seed, opacity = 0.75 }) => {
  let d = "";
  for (let r = 0; r < 7; r++) {
    for (let c = -2; c * cell < 1080 + 2 * cell; c++) {
      const col = c + Math.floor(drift / cell);
      if (noise2D(seed, col * 0.17, r * 0.45) > 0.12) d += `M${(c * cell - (drift % cell)).toFixed(1)},${(y + r * cell * 0.6).toFixed(1)}h${cell}v${(cell * 0.6).toFixed(1)}h${-cell}Z`;
    }
  }
  return <path d={d} fill="#ffffff" opacity={opacity} />;
};

/* ------------------------------- poses ------------------------------- */

const P = {
  peek: pose({ armL: limb(-150, -20, -122, 26), armR: limb(150, -20, 122, 26) }),
  peekReach: pose({ armL: limb(-150, -20, -122, 26), armR: limb(176, -22, 240, 18) }),
  peekHold: pose({ armL: limb(-150, -20, -122, 26), armR: limb(160, -40, 168, -140) }),
  lookBack: pose({
    head: [-6, -104],
    armL: limb(-70, 70, -40, 150), armR: limb(90, -60, 60, -210),
    legL: limb(-6, 250, 40, 420), legR: limb(6, 250, -44, 420),
  }),
  brace: pose({
    armL: limb(-160, 60, -176, 170), armR: limb(160, 60, 176, 170),
    legL: limb(-60, 270, -100, 440), legR: limb(60, 270, 96, 440),
  }),
  flailA: pose({ armL: limb(-130, -10, -236, -60), armR: limb(104, -60, 160, -150), legL: limb(-50, 230, -60, 335), legR: limb(40, 230, 56, 335) }),
  flailB: pose({ armL: limb(-100, -70, -150, -160), armR: limb(130, -10, 236, -40), legL: limb(-50, 230, -60, 335), legR: limb(40, 230, 56, 335) }),
  tee: pose({ armL: limb(-130, 20, -236, 20), armR: limb(130, 20, 236, 20) }),
  windA: pose({ armL: limb(-120, -80, -200, -170), armR: limb(130, 60, 230, 110), legL: limb(-40, 230, -56, 335), legR: limb(46, 228, 60, 335) }),
  windB: pose({ armL: limb(-130, 60, -230, 120), armR: limb(120, -80, 210, -170), legL: limb(-40, 230, -56, 335), legR: limb(46, 228, 60, 335) }),
  /** Bedrock's forward bridge: bent over the edge, one block up, one going down */
  lean: pose({
    head: [34, -88],
    armR: limb(96, -16, 128, -86), armL: limb(86, 96, 150, 176),
    legL: limb(-54, 222, -118, 335), legR: limb(40, 222, 30, 335),
  }),
  leanDip: pose({
    head: [40, -84],
    armR: limb(96, -10, 132, -76), armL: limb(96, 120, 176, 214),
    legL: limb(-54, 222, -118, 335), legR: limb(44, 220, 34, 335),
  }),
  blockUp: pose({ armR: limb(96, -10, 118, -96) }),
  crouch: pose({ head: [10, -80], armR: limb(96, -10, 130, -80), armL: limb(90, 110, 150, 170), legL: limb(-70, 190, -60, 335), legR: limb(70, 190, 60, 335) }),
  tuck: pose({ head: [10, -90], armR: limb(100, -30, 120, -120), armL: limb(90, 100, 140, 160), legL: limb(-70, 180, -40, 260), legR: limb(70, 170, 80, 260) }),
  hug: pose({ armL: limb(-96, 110, -28, 124), armR: limb(96, 110, 28, 124) }),
  raise: pose({ armL: limb(-70, 110, -66, 200), armR: limb(112, -6, 168, -124) }),
  startle: pose({ armL: limb(-120, 30, -226, 10), armR: limb(120, -10, 206, -90) }),
  blown: pose({ head: [-24, -94], armL: limb(-136, -40, -232, -100), armR: limb(136, 20, 236, 40), legL: limb(-60, 226, -110, 330), legR: limb(40, 232, 80, 330) }),
  tumble: pose({ head: [-10, -96], armL: limb(-120, -90, -130, -210), armR: limb(140, 10, 240, -40), legL: limb(-80, 210, -170, 280), legR: limb(60, 230, 150, 300) }),
};

const shiver = (f: number, amp = 3) => Math.sin(f * 2.9) * amp;

/* -------------------------- 1. Java: the peek -------------------------- */

const javaPeek = (f: number) => {
  const { risen, reach, pullBack, place } = B.peek;
  const s = 1.6;
  const neck: Pt = [440 + shiver(f, f >= risen ? 3 : 0), 914 + (1 - ease(f, 0, risen)) * 420];
  let p = P.peek;
  if (f >= reach - 2 && f < pullBack) p = lerpPose(P.peek, P.peekReach, ease(f, reach - 2, reach));
  if (f >= pullBack) p = lerpPose(P.peekReach, P.peekHold, ease(f, pullBack, pullBack + 2));
  if (f >= place - 2) p = lerpPose(P.peekHold, P.peekReach, ease(f, place - 2, place));
  const face: FaceKind = f < reach - 1 ? "worried" : "gritted";
  return { neck, s, p, face, holding: f >= reach - 3 && f < place };
};

const JavaPeek: React.FC<{ f: number }> = ({ f }) => {
  const d = javaPeek(f);
  const zoom = 0.86 + 0.14 * ease(f, 0, 7);
  const placed = f >= B.peek.place;
  const feetY = d.neck[1] + 335 * d.s;
  return (
    <g>
      <Sky top="#2f7fdc" bottom="#8fc3f3" id="skyPeek" />
      <g transform={`translate(150 1920) scale(${zoom}) translate(-150 -1920)`}>
        <Guy x={d.neck[0]} y={feetY} s={d.s} p={d.p} face={d.face} tint={JAVA} look={[6, 8]} hold={d.holding ? { R: GRASS } : undefined} cube={70} />
        {!placed ? (
          <>
            <TexQuad q={[[250, 1290], [784, 1300], [468, 1990], [61, 1990]]} nu={8} nv={16} pal={GRASS} k={0.7} />
            <TexQuad q={[[260, 910], [700, 980], [784, 1300], [250, 1290]]} nu={8} nv={8} pal={GRASS} k={0.95} />
          </>
        ) : (
          <>
            <TexQuad q={[[336, 570], [390, 744], [100, 1990], [62, 1990]]} nu={8} nv={16} pal={GRASS} k={0.8} />
            <TexQuad q={[[390, 744], [1016, 850], [590, 1990], [100, 1990]]} nu={8} nv={20} pal={GRASS} k={0.7} />
            <TexQuad q={[[336, 570], [810, 676], [1016, 850], [390, 744]]} nu={8} nv={8} pal={GRASS} k={0.95} />
          </>
        )}
        <NameTag at={headOf(d.neck[0], feetY, d.s, 0, d.p)} text="Java Players" size={62} tilt={7} s={d.s} />
      </g>
    </g>
  );
};

/* ---------------------- 2. Java: on top, from above ---------------------- */

const JavaTop: React.FC<{ f: number }> = ({ f }) => {
  const [s0] = B.shots.javaTop;
  let jolt = 0;
  for (const j of B.top.jolts) if (f >= j) jolt += 9 * Math.exp(-(f - j) / 2.5) * Math.sin((f - j) * 1.9);
  const [w0, w1] = B.top.sway;
  const sway = f >= w0 && f < w1 + 6 ? 11 * Math.sin((Math.PI * (f - w0)) / 7) * Math.exp(-(f - w0) / 9) : 0;
  const turned = f >= B.top.turn;
  const s = 1.45;
  const p = turned ? P.brace : P.lookBack;
  const neck: Pt = [738 + jolt * 0.4, 996];
  const drift = (f - s0) * 3;
  return (
    <g transform={`rotate(${sway} 540 1150) translate(${jolt} 0)`}>
      <rect x={-300} y={-300} width={1680} height={2520} fill="#86bdf0" />
      <CloudBand y0={900} y1={2300} drift={drift} seed="topclouds" opacity={0.7} />
      <TexQuad q={[[880, 715], [906, 736], [862, 2000], [810, 2000]]} nu={8} nv={28} pal={GRASS} k={0.72} />
      <TexQuad q={[[600, 700], [880, 715], [810, 2000], [90, 2000]]} nu={8} nv={28} pal={GRASS} k={1} />
      <g transform={`rotate(13 ${neck[0]} ${neck[1]})`}>
        <Oofy
          x={neck[0]} y={neck[1]} scale={s} pose={p} face={turned ? "worried" : "back"} tint={JAVA} shadow={false}
          look={[0, 4]} bandAid={turned}
          hands={(h) => (!turned && f < 33 ? <MiniCube x={h.R[0]} y={h.R[1]} s={70} pal={GRASS} /> : null)}
        />
      </g>
      <NameTag at={[neck[0] + 20, neck[1] - 96 * s]} text="Java Players" size={60} tilt={6} s={s} />
    </g>
  );
};

/* ------------------- 3. Bedrock: walking it out forward ------------------- */

const BW = { ground: 1110, blk: 130, s: 1.15 };

const bedrockWalk = (f: number) => {
  const { standUp, walkFrom } = B.walk;
  const [s0] = B.shots.bedrockWalk;
  if (f < standUp) {
    const t = f - s0;
    const x = 150 + t * 2.6;
    const dip = 0.5 - 0.5 * Math.cos((t / 9) * Math.PI * 2);
    return { x, lead: 205, p: lerpPose(P.lean, P.leanDip, dip), rot: 22 + dip * 6, face: "sly" as FaceKind, hold: { R: BLUE, L: BLUE } };
  }
  const xStand = 150 + (standUp - s0) * 2.6;
  if (f < walkFrom) {
    const t = ease(f, standUp, walkFrom);
    return { x: lerp(xStand, 300, t), lead: lerp(205, 300, t), p: lerpPose(P.lean, P.blockUp, t), rot: 22 * (1 - t), face: "sly" as FaceKind, hold: { R: BLUE, L: BLUE } };
  }
  const x = 300 + (f - walkFrom) * 9.2;
  const base = walkPose(x / 150, 50, P.blockUp, false);
  const sw = Math.sin((x / 150) * Math.PI * 2);
  return { x, lead: 300, p: { ...base, armL: limb(-72 - sw * 26, 110, -70 - sw * 60, 196) }, rot: 0, face: "sly" as FaceKind, hold: { R: BLUE, L: BLUE } };
};

const Bird: React.FC<{ x: number; y: number; f: number; flip?: boolean; s?: number }> = ({ x, y, f, flip, s = 1 }) => {
  const flap = Math.sin(f * 0.9) * 28;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke="#2a1b3d" strokeWidth={5} strokeLinejoin="round">
      <path d="M-34,6 L-58,-6 L-50,14 Z" fill="#3f6fd1" />
      <ellipse cx={0} cy={4} rx={36} ry={24} fill="#6aa0ff" />
      <circle cx={28} cy={-14} r={17} fill="#6aa0ff" />
      <path d="M43,-16 L58,-11 L43,-6 Z" fill="#f4b73c" />
      <circle cx={32} cy={-17} r={3.5} fill="#2a1b3d" stroke="none" />
      <path d={`M-6,0 L14,0 L0,${-30 - flap} Z`} fill="#4c82ea" />
    </g>
  );
};

const BedrockWalk: React.FC<{ f: number }> = ({ f }) => {
  const d = bedrockWalk(f);
  const { ground, blk, s } = BW;
  const front = d.x + d.lead;
  const n = Math.ceil(front / blk);
  const cells: P2[] = [];
  for (let i = -1; i < n; i++) cells.push([i, 0], [i, 1]);
  const t = f - B.shots.bedrockWalk[0];
  const head = headOf(d.x, ground, s, d.rot, d.p);
  return (
    <g>
      <Sky top="#4f9eee" bottom="#cfe7ff" id="skyWalk" />
      <rect x={330} y={120} width={420} height={420} fill="#fff6d8" opacity={0.3} />
      <rect x={395} y={185} width={290} height={290} fill="#fff1c2" />
      <rect x={430} y={220} width={220} height={220} fill="#ffffff" />
      <Bird x={540 + Math.cos(t * 0.05) * 420} y={200 - Math.sin(t * 0.1) * 40} f={f} flip={Math.sin(t * 0.05) > 0} s={1.9} />
      <Bird x={940 - t * 1.6} y={150 + Math.sin(t * 0.13) * 30} f={f + 5} flip s={1.5} />
      <FlatClouds y={1500} cell={120} drift={t * 1.5} seed="walkclouds" />
      <Blocks2D cells={cells} ox={0} oy={ground} s={blk} pal={BLUE} />
      <Guy x={d.x} y={ground} s={s} p={d.p} face={d.face} tint={BED} rot={d.rot} hold={d.hold} cube={60} />
      <NameTag at={head} text="Bedrock Players" size={40} s={s} />
    </g>
  );
};

/* ----------------------- 4. Java: wobbling on the end ----------------------- */

const JavaWobble: React.FC<{ f: number }> = ({ f }) => {
  const { freeze, tip } = B.wobble;
  const [s0] = B.shots.javaWobble;
  let p: Pose, rot: number, face: FaceKind = "worried", s = 1.42;
  if (f < freeze) {
    p = lerpPose(P.flailA, P.flailB, 0.5 + 0.5 * Math.sin((f - s0) * 1.1));
    rot = 7 * Math.sin((f - s0) * 0.55);
  } else if (f < tip) {
    p = P.tee;
    rot = 0;
    face = "shocked";
  } else {
    const k = f - tip;
    p = lerpPose(P.windA, P.windB, 0.5 + 0.5 * Math.sin(k * 1.2));
    rot = 20 + 6 * Math.sin(k * 0.8) + k * 0.6;
    s = 1.42 + 0.14 * ease(f, tip, tip + 4);
    face = "scream";
  }
  const feet: Pt = [482, 1135];
  const head = headOf(feet[0], feet[1], s, rot, p);
  return (
    <g>
      <Sky top="#3a86d8" bottom="#b5d9fb" id="skyWobble" />
      <CloudBand y0={1230} y1={1990} drift={(f - s0) * 4} seed="wobclouds" />
      <defs>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6aa8e8" stopOpacity={1} />
          <stop offset="100%" stopColor="#6aa8e8" stopOpacity={0} />
        </linearGradient>
      </defs>
      <TexQuad q={[[568, 690], [604, 690], [730, 1170], [360, 1170]]} nu={8} nv={40} pal={GRASS} k={1.02} />
      <rect x={540} y={680} width={100} height={260} fill="url(#haze)" />
      <TexQuad q={[[360, 1170], [730, 1170], [690, 1412], [410, 1412]]} nu={8} nv={8} pal={GRASS} k={0.74} />
      <Guy x={feet[0]} y={feet[1]} s={s} p={p} face={face} tint={JAVA} rot={rot} look={f >= tip ? [8, 14] : [0, 0]} />
      <NameTag at={head} text="Java Players" size={60} tilt={-12 + rot * 1.1} s={s} />
    </g>
  );
};

/* ------------------------ 5. Java: over the edge ------------------------ */

const JavaFall: React.FC<{ f: number }> = ({ f }) => {
  const [s0, s1] = B.shots.javaFall;
  const dy = 160 * ease(f, s0, s1);
  const hy = f < s0 + 4 ? 1990 - (f - s0) * 4 : 1974 + 7.5 * (f - s0 - 4) ** 2;
  const k = 480 / 104;
  return (
    <g>
      <Sky top="#4a8fdc" bottom="#9fcdf7" id="skyFall" />
      <CloudBand y0={640} y1={1150} drift={(f - s0) * 3} seed="fallclouds" />
      <TexQuad q={[[62, 1230 + dy], [950, 1230 + dy], [1150, 2150 + dy], [-140, 2150 + dy]]} nu={8} nv={8} pal={GRASS} k={1} />
      {/* the back of his head, dropping out of frame: quiff, no face */}
      <g transform={`translate(500 ${hy}) scale(${-k} ${k})`}>
        {[[-46, -104, 30, 34], [-20, -124, 30, 50], [6, -138, 30, 58], [32, -118, 24, 36]].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="#4a3426" stroke={JAVA.line} strokeWidth={5} strokeLinejoin="round" />
        ))}
        <ellipse rx={104} ry={98} fill={JAVA.skin} stroke={JAVA.line} strokeWidth={6} />
      </g>
    </g>
  );
};

/* ---------------------- 6. Bedrock: stairs into space ---------------------- */

const bedrockStairs = (f: number) => {
  const [s0] = B.shots.bedrockStairs;
  const top = B.stairs.top;
  const kf = 2 + (Math.min(f, top) - s0) / B.stairs.stepFrames;
  const k0 = Math.floor(kf), t = kf - k0;
  if (f < top) {
    const x = k0 + 0.5 + t, y = -k0 - t - 0.9 * Math.sin(Math.PI * t) * 0.6;
    return { x, y, k: k0, t, flat: 0, p: t > 0.12 && t < 0.88 ? P.tuck : P.crouch };
  }
  const k = 2 + (top - s0) / B.stairs.stepFrames;
  const w = (f - top) * 0.16;
  const base = walkPose(w * 1.6, 44, P.blockUp, false);
  return { x: k + 0.5 + w, y: -k, k, t: 0, flat: w, p: base };
};

const BedrockStairs: React.FC<{ f: number }> = ({ f }) => {
  const [s0] = B.shots.bedrockStairs;
  const d = bedrockStairs(f);
  const z = ease(f, s0, 224);
  const u = Math.exp(lerp(Math.log(240), Math.log(70), z)) * (f > B.stairs.top ? 1 - 0.14 * ease(f, B.stairs.top, 249) : 1);
  // the camera keeps him at a spot that drifts up-left as it pulls back, then lets him walk on
  const track = bedrockStairs(Math.min(f, B.stairs.top));
  const anchor: Pt = [lerp(560, 470, z), lerp(960, 880, z)];
  const ox = anchor[0] - track.x * u, oy = anchor[1] - track.y * u;
  const cells: P2[] = [];
  const built = f < B.stairs.top ? d.k + (d.t > 0.45 ? 1 : 0) : d.k;
  for (let i = 0; i <= built; i++) cells.push([i, -i], [i, -i + 1]);
  if (f >= B.stairs.top) for (let m = 1; m <= Math.ceil(d.flat + 1.2); m++) cells.push([d.k + m, -d.k]);
  const s = oofyScale(u);
  const gx = ox + d.x * u, gy = oy + d.y * u;
  const head = headOf(gx, gy, s, 0, d.p);
  return (
    <g>
      <Sky top={mix("#3f8fe6", "#1c5fd8", z)} bottom={mix("#bddfff", "#6fb2f5", z)} id="skyStairs" />
      <Stars opacity={0.45 * z} below={900} />
      <FlatClouds y={1480 + z * 260} cell={lerp(130, 60, z)} drift={(f - s0) * 2} seed="stairclouds" opacity={0.8} />
      <Blocks2D cells={cells} ox={ox} oy={oy} s={u} pal={BLUE} />
      <Guy x={gx} y={gy} s={s} p={d.p} face="sly" tint={BED} hold={{ R: BLUE, L: BLUE }} cube={60} />
      <NameTag at={head} text="Bedrock Players" size={Math.max(14, 44 * s / 1.06)} s={s} />
    </g>
  );
};

/* -------------------- 7. Bedrock: the loop-the-loop -------------------- */

const R = B.loop.radius;
const X0 = 0;
const WALK_START = -13;

const loopCells = (() => {
  const seen = new Set<string>();
  const out: { c: P2; phi: number }[] = [];
  for (let phi = 0; phi <= Math.PI * 2 + 0.001; phi += 0.004) {
    const px = X0 + (R + 0.5) * Math.sin(phi), py = -R + (R + 0.5) * Math.cos(phi);
    const c: P2 = [Math.floor(px), Math.floor(py)];
    const key = c.join(",");
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ c, phi });
    }
  }
  return out;
})();

const bedrockLoop = (f: number) => {
  const { enter, exit } = B.loop;
  const [s0] = B.shots.bedrockLoop;
  if (f < enter) {
    // a jog that winds up into a sprint
    const t = (f - s0) / (enter - s0);
    const x = WALK_START + (X0 - WALK_START) * (0.35 * t + 0.65 * t * t);
    return { x, y: 0, rot: 0, phi: -1, run: x * 1.3 };
  }
  if (f < exit) {
    const phi = Math.PI * 2 * ((f - enter) / (exit - enter));
    return { x: X0 + R * Math.sin(phi), y: -(R - R * Math.cos(phi)), rot: (-phi * 180) / Math.PI, phi, run: (f - enter) * 0.5 };
  }
  const x = X0 + 1.5 * (f - exit);
  return { x, y: 0, rot: 0, phi: 7, run: x * 1.3 + 20 };
};

const BedrockLoop: React.FC<{ f: number }> = ({ f }) => {
  const [s0] = B.shots.bedrockLoop;
  const d = bedrockLoop(f);
  const z = ease(f, s0, 322);
  const u = Math.exp(lerp(Math.log(175), Math.log(30), z));
  // the camera starts on him and finishes framing the whole loop
  const start = bedrockLoop(s0);
  const c0: Pt = [start.x + 2.54, -1.49];
  const follow: Pt = [d.x + 2.54, -1.49];
  const c1: Pt = [X0, -R];
  const cx = lerp(lerp(c0[0], follow[0], clamp01((f - s0) / 30)), c1[0], z), cy = lerp(c0[1], c1[1], z);
  const ox = 545 - cx * u, oy = 890 - cy * u;
  const cells: P2[] = [];
  const reach = d.phi < 0 ? d.x + 2 : X0;
  for (let i = Math.floor(WALK_START - 60); i < reach; i++) cells.push([i, 0]);
  for (const lc of loopCells) if (d.phi >= 0 && lc.phi <= d.phi + 0.35) cells.push(lc.c);
  if (d.phi > 6.3) for (let i = X0; i < d.x + 2; i++) cells.push([i, 0]);
  const s = oofyScale(u);
  const gx = ox + d.x * u, gy = oy + d.y * u;
  const p = walkPose(d.run / 2, 66, P.blockUp, false);
  const head = headOf(gx, gy, s, d.rot, p);
  const { star, twinkle } = B.loop;
  const st = clamp01((f - star[0]) / (star[1] - star[0]));
  const sx = lerp(200, 780, st), sy = lerp(100, 262, st);
  const tw = clamp01((f - twinkle[0]) / (twinkle[1] - twinkle[0]));
  return (
    <g>
      <Sky top="#0b3fb8" bottom="#5aa6f2" id="skyLoop" />
      <Stars opacity={0.6} />
      {f >= star[0] && f < star[1] && <line x1={sx - 150} y1={sy - 42} x2={sx} y2={sy} stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.9} />}
      {f >= twinkle[0] && f < twinkle[1] && (
        <g transform={`translate(780 262) rotate(${tw * 40})`} stroke="#ffffff" strokeLinecap="round" opacity={1 - tw * 0.6}>
          {tw < 0.6 ? (
            <path d={`M0,${-60 * Math.sin(tw * 5)} V${60 * Math.sin(tw * 5)} M${-60 * Math.sin(tw * 5)},0 H${60 * Math.sin(tw * 5)}`} strokeWidth={9} />
          ) : (
            [0, 90, 180, 270].map((a) => <line key={a} x1={0} y1={-40 - tw * 40} x2={0} y2={-60 - tw * 40} strokeWidth={6} transform={`rotate(${a + 45})`} />)
          )}
        </g>
      )}
      <Blocks2D cells={cells} ox={ox} oy={oy} s={u} pal={BLUE} />
      <Guy x={gx} y={gy} s={s} p={p} face={d.phi >= 0 && d.phi < 6.3 ? "joy" : "sly"} tint={BED} rot={d.rot} hold={{ R: BLUE }} cube={60} />
      <NameTag at={head} text="Bedrock Players" size={Math.max(9, 44 * s / 1.06)} tilt={d.rot} s={s} />
    </g>
  );
};

/* ----------------- 8. Java: proud, then passed and blown off ----------------- */

/** fitted to the reference's end shot: the bridge's end corners and its vanishing point */
const CAM8: Cam = { e: [6.153, 2.343, -2.403], yaw: 82.788, pitch: 169.823, roll: -135.045, F: 1957.5 };

const runnerX = (f: number) => {
  const { farRunner, passBy } = B.end;
  if (f < farRunner) return -60;
  const t = (f - farRunner) / (passBy - farRunner);
  return lerp(-14, 1.2, t ** 1.3) + Math.max(0, f - passBy) * 2;
};

const JavaEnd: React.FC<{ f: number }> = ({ f }) => {
  const { phew, meh, proud, farRunner, passBy, knocked, gone } = B.end;
  const [s0] = B.shots.javaEnd;
  const feet3: [number, number, number] = [-0.46, 1, 0.5];
  const base = project(CAM8, feet3);
  const s = oofyScale(pxPerUnit(CAM8, feet3)) * 1.2;
  let p = P.hug, face: FaceKind = "hurt", rot = 0, dx = 0, dy = 0;
  let hold: { L?: Palette; R?: Palette } | undefined = { R: GRASS };
  let look: Pt = [0, 0];
  if (f >= phew) face = "calm";
  if (f >= meh) face = "meh";
  if (f >= proud) {
    p = lerpPose(P.hug, P.raise, ease(f, proud, proud + 4));
    face = "smile";
  }
  if (f >= passBy - 1) {
    p = P.startle;
    face = "shocked";
    look = [12, -4];
    hold = undefined;
  }
  if (f >= knocked) {
    const t = f - knocked;
    p = lerpPose(P.blown, P.tumble, clamp01(t / 6));
    face = "scream";
    rot = -Math.min(100, t * 5);
    dx = -26 * t;
    dy = -14 * t + 1.05 * t * t;
  }
  const shake = f < phew ? shiver(f, 2.5) : 0;
  const gx = base[0] + dx + shake, gy = base[1] + dy;
  const head = headOf(gx, gy, s, rot, p);
  // the block he was showing off, knocked out of his hand
  const cubeT = f - (passBy - 1);
  const handAt = headOf(base[0], base[1], s, 0, { ...P.raise, head: P.raise.armR[1] });
  const rx = runnerX(f);
  const blueEnd = Math.min(rx + 0.6, 4.2);
  const boxes: Box[] = [{ min: [-40, 0, 0], max: [0, 1, 1], pal: GRASS, key: "g" }];
  if (f >= farRunner) {
    boxes.push({ min: [-40, 0, 1], max: [Math.min(blueEnd, 0), 1, 2], pal: BLUE, key: "bf", skip: ["-z"] });
    if (blueEnd > 0) boxes.push({ min: [0, 0, 1], max: [blueEnd, 1, 2], pal: BLUE, key: "bn", label: { face: "-z", text: "Oof Craft", u: clamp01(2.1 / blueEnd), v: 0.5, size: 0.42 } });
  }
  const r3: [number, number, number] = [rx, 1, 1.5];
  const rs = project(CAM8, r3);
  const runS = oofyScale(pxPerUnit(CAM8, r3));
  const runnerOn = f >= farRunner && rs[2] * base[2] > 0 && Math.abs(rs[2]) > 1 && f < passBy + 2;
  const runP = walkPose((f - farRunner) * 0.34, 80, P.blockUp, false);
  return (
    <g>
      <Sky top="#0b3fb8" bottom="#6fb5f6" id="skyEnd" />
      <Stars opacity={0.55} below={900} />
      <CloudBand y0={1540} y1={1990} drift={(f - s0) * 3} seed="endclouds" />
      <Boxes cam={CAM8} boxes={boxes} lw={5} />
      {f < gone && <Guy x={gx} y={gy} s={s} p={p} face={face} tint={JAVA} rot={rot} look={look} hold={hold} cube={78} />}
      {f >= passBy - 1 && cubeT < 20 && <MiniCube x={handAt[0] + cubeT * 30} y={handAt[1] - cubeT * 26 + cubeT * cubeT * 2.2} s={78 * s} pal={GRASS} rot={cubeT * 24} />}
      {f < gone && <NameTag at={head} text="Java Players" size={52} tilt={rot * 0.5 + 4} s={s} />}
      {runnerOn && (
        <>
          {f >= passBy - 2 && [0, 1, 2, 3].map((i) => (
            <line key={i} x1={rs[0] - 420 - i * 60} y1={rs[1] - 300 + i * 110} x2={rs[0] - 120 - i * 40} y2={rs[1] - 240 + i * 110} stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.75} />
          ))}
          <Guy x={rs[0]} y={rs[1]} s={runS} p={runP} face="sly" tint={BED} hold={{ R: BLUE }} cube={60} />
          <NameTag at={headOf(rs[0], rs[1], runS, 0, runP)} text="Bedrock Players" size={Math.max(8, 52 * runS / 1.06)} s={runS} />
        </>
      )}
    </g>
  );
};

/* ------------------------------ assembly ------------------------------ */

const shotAt = (f: number) => {
  const S = B.shots;
  if (f < S.javaPeek[1]) return <JavaPeek f={f} />;
  if (f < S.javaTop[1]) return <JavaTop f={f} />;
  if (f < S.bedrockWalk[1]) return <BedrockWalk f={f} />;
  if (f < S.javaWobble[1]) return <JavaWobble f={f} />;
  if (f < S.javaFall[1]) return <JavaFall f={f} />;
  if (f < S.bedrockStairs[1]) return <BedrockStairs f={f} />;
  if (f < S.bedrockLoop[1]) return <BedrockLoop f={f} />;
  return <JavaEnd f={f} />;
};

const World: React.FC<{ at?: number }> = ({ at }) => {
  const now = useCurrentFrame();
  const f = at ?? now;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", overflow: "hidden" }}>
      {shotAt(f)}
    </svg>
  );
};

export const BridgeShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#3a86d8" }}>
      <HandDrawn enabled={drawn}>
        <World />
      </HandDrawn>
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

/** the Short's own thumbnail: the pass-by, Java mid-shock with the block leaving his hand */
export const BridgeThumb: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#3a86d8" }}>
      <World at={B.end.passBy} />
    </AbsoluteFill>
  );
};

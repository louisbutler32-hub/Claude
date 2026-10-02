import React from "react";
import { AbsoluteFill, Audio, Sequence, random, staticFile, useCurrentFrame } from "remotion";
import { ease } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { Skeleton, Zombie, Knight, Sword, SkelFace, ZombFace, KnightFace, T0, TPose, tp, lerpT, INK } from "./cast";
import { W, H, Cam, Hall, HallBox, OakBox, OakBand, WaterRect, Splash, FlatWall, Bricks, Moss, Sky, Oak, Grass, Rays, Tower, Bone, Arrow, WATER, STONE_D, GROUT, proj } from "./scenery";
import B from "./beats.json";

/**
 * "I spawned in a cave!!" — a shot-for-shot remake, in our cartoon look, of a Minecraft
 * animation Short: a skeleton spawns in a trial chamber, mistakes it for a cave, a tired
 * old zombie tells it otherwise, the skeleton finds the water channels and rides them,
 * wee, straight off a ledge, dies, respawns, climbs out into the sunshine — and a player
 * in netherite is waiting at the door. The cuts and lines are on the reference's own
 * times (beats.json); the voice track is lifted off the reference at mux time.
 */

export const SPAWN_FRAMES = B.frames;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** an overshoot: 0 → 1 with a bounce past the end */
const over = (f: number, a: number, b: number) => { const t = clamp01((f - a) / (b - a)), c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const bell = (f: number, a: number, b: number) => Math.sin(Math.PI * clamp01((f - a) / (b - a)));
/** hand-animators hold each drawing for two frames; the characters move on twos, the camera on ones */
const twos = (t: number) => Math.floor(t / 2) * 2;
/** the skeleton's size from the hall's projection: it stands about 2.7 blocks tall */
const sizeAt = (cam: Cam, z: number, k = 0.00706) => (k * cam.F) / z;

const SPREAD = tp({ aL: [-105, -25], aR: [105, 25], lL: [-30, -10], lR: [30, 10] });
const ARMS_UP = tp({ aL: [-162, -8], aR: [162, 8] });
const CLASP = tp({ aL: [-34, -128], aR: [34, 128], sq: 0.015 });
const SIT = tp({ lL: [-88, 84], lR: [-70, 96], aL: [-18, -10], aR: [30, -122] });
const walk = (t: number, amt: number): TPose => {
  const s = Math.sin(t * 0.9) * amt;
  return tp({ lL: [s * 32, -Math.max(0, s) * 24], lR: [-s * 32, -Math.max(0, -s) * 24], aL: [-8 + s * 26, -10], aR: [8 - s * 26, 10], bob: Math.abs(Math.sin(t * 0.9)) * 12 * amt });
};

/* ------------------------------------ framing ------------------------------------ */

const Cam2: React.FC<{ z?: number; cx?: number; cy?: number; r?: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ z = 1, cx = 540, cy = 960, r = 0, dx = 0, dy = 0, children }) => (
  <g transform={`translate(${dx} ${dy}) translate(${cx} ${cy}) rotate(${r}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);

/** place a figure by where its head should be: the rig's origin is at the feet, the head centre 311 units up */
const ByHead: React.FC<{ x: number; y: number; s: number; r?: number; children: React.ReactNode }> = ({ x, y, s, r = 0, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) translate(0 ${311 * s})`}>{children}</g>
);

const Svg: React.FC<{ children: React.ReactNode; vig?: number }> = ({ children, vig = 0.3 }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="spVig" cx="50%" cy="50%" r="72%"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#0a0812" stopOpacity={vig} /></radialGradient>
      <clipPath id="spAll"><rect x={0} y={0} width={W} height={H} /></clipPath>
    </defs>
    <g clipPath="url(#spAll)">{children}</g>
    <rect x={0} y={0} width={W} height={H} fill="url(#spVig)" />
  </svg>
);

/* ------------------------------------ shots 0–4: the hall ------------------------------------ */

const HALL_A: Hall = { HW: 1.5, CH: 3.2, z0: 0.5, Z1: 4.5 };

/** shot 0: the hall, the skeleton pops into it and claps its hands: OOOH!! */
const Spawn: React.FC<{ t: number }> = ({ t }) => {
  const cam: Cam = { F: 700, cx: 540, cy: 900, eh: 1.4 };
  const t2 = twos(t);
  const pop = over(t2, 3, 10);
  const clasp = over(t2, 12, 20);
  const pose = lerpT(T0, CLASP, clasp);
  const foot = proj(cam, 0, 0, 1.55);
  return (
    <Cam2 z={lerp(1, 1.04, t / 26)}>
      <HallBox cam={cam} hall={HALL_A} seed="a" detail={1.2}>
        {t2 >= 3 && (
          <g transform={`translate(${foot[0]} ${foot[1]}) scale(${pop}) translate(${-foot[0]} ${-foot[1]})`}>
            <Skeleton x={foot[0]} y={foot[1]} s={3.1} pose={{ ...pose, bob: pose.bob + bell(t2, 12, 20) * 26 }} face={t2 < 12 ? "plain" : "happy"} t={t2} />
          </g>
        )}
      </HallBox>
    </Cam2>
  );
};

/** shot 1: close on the skeleton, arm pumping: I SPAWNED IN A CAVE!! — then it hears something */
const Closeup: React.FC<{ t: number }> = ({ t }) => {
  const cam: Cam = { F: 900, cx: 540, cy: 800, eh: 1.0 };
  const t2 = twos(t);
  const hear = ease(t2, 18, 26);
  const pump = Math.sin(t2 * 0.55) * 16;
  const pose = tp({ aL: [lerp(-150 + pump, -40, hear), lerp(-20, -16, hear)], aR: [18, 10], tilt: lerp(-4, 3, hear), bob: (1 - hear) * Math.abs(Math.sin(t2 * 0.55)) * 10 });
  return (
    <Cam2 z={lerp(1.02, 1, t / 27)}>
      <HallBox cam={cam} hall={HALL_A} seed="b" detail={1.3} />
      <Skeleton x={600} y={2070} s={4.5} pose={pose} face={t2 < 18 ? "grin" : "glance"} headTurn={hear * 6} t={t2} />
    </Cam2>
  );
};

/** shot 2: the hall from higher up, the skeleton small at the back, a green head walks in from the front: HA HA HA HA... */
const HallEnter: React.FC<{ t: number }> = ({ t }) => {
  const cam: Cam = { F: 700, cx: 540, cy: 820, eh: 2.3 };
  const hall: Hall = { HW: 1.7, CH: 3.4, z0: 0.5, Z1: 7 };
  const t2 = twos(t);
  const foot = proj(cam, -0.35, 0, 4.0);
  const nervous = t2 >= 19;
  const zx = lerp(120, 480, ease(t2, 0, 30));
  const wk = walk(t2, 0.6);
  return (
    <Cam2 z={lerp(1, 1.05, t / 34)}>
      <HallBox cam={cam} hall={hall} seed="c" detail={1.6}>
        <Skeleton x={foot[0]} y={foot[1]} s={sizeAt(cam, 4.0)} pose={nervous ? tp({ aL: [-30, -110], aR: [30, 110], bob: Math.abs(Math.sin(t2 * 0.8)) * 8 }) : tp({ aL: [-140, -20], aR: [20, 10] })} face={nervous ? "nervous" : "grin"} t={t2} />
      </HallBox>
      <Zombie back x={zx} y={1960} s={2.5} pose={{ ...wk, bob: wk.bob }} face="sleepy" t={t2} />
    </Cam2>
  );
};

/** shot 3 and 8: the zombie close, sat against the wall, old and tired */
const ZombieClose: React.FC<{ t: number; sorry?: boolean }> = ({ t, sorry = false }) => {
  const cam: Cam = { F: 900, cx: 540, cy: 760, eh: 0.9 };
  const t2 = twos(t);
  let face: ZombFace, turn = 0;
  if (!sorry) {
    face = t2 < 17 ? "sleepy" : t2 < 33 ? "smug" : "grump";
    turn = lerp(-6, 4, ease(t2, 33, 41));
  } else {
    face = t2 < 15 ? "sad" : t2 < 36 ? "sigh" : "sad";
    turn = lerp(-8, 0, ease(t2, 0, 20)) + (t2 >= 15 && t2 < 36 ? Math.sin(t2 * 0.35) * 3 : 0);
  }
  const breathe = Math.sin(t2 * 0.15) * 4;
  return (
    <Cam2 z={lerp(1, 1.03, t / 60)}>
      <HallBox cam={cam} hall={HALL_A} seed={sorry ? "i" : "d"} detail={1.4} />
      <Zombie x={sorry ? 560 : 520} y={(sorry ? 1980 : 1900) + breathe} s={sorry ? 4.5 : 4.3} pose={{ ...SIT, bob: 0, tilt: sorry ? -4 : 2 }} face={face} headTurn={turn} t={t2} />
    </Cam2>
  );
};

/** shot 4: the long hall from the floor, the two of them tiny at the far end: BUT LOOK AT THIS STONE! IT'S EVEN GOT— */
const LowHall: React.FC<{ t: number }> = ({ t }) => {
  const cam: Cam = { F: 720, cx: 540, cy: 760, eh: 0.75 };
  const hall: Hall = { HW: 1.7, CH: 3.6, z0: 0.6, Z1: 7.5 };
  const t2 = twos(t);
  const run = t2 >= 26;
  const sx = run ? lerp(-0.6, 2.0, ease(t2, 26, 45)) : -0.6;
  const sf = proj(cam, sx, 0, 4.4), zf = proj(cam, 0.95, 0, 4.4);
  let pose: TPose;
  if (run) pose = walk(t2, 1);
  else if (t2 >= 18) pose = { ...ARMS_UP, bob: bell(t2, 18, 26) * 30 };
  else pose = tp({ aL: [lerp(-120, -140, bell(t2, 0, 14)), -50], aR: [lerp(100, 120, bell(t2, 4, 18)), 30], bob: Math.abs(Math.sin(t2 * 0.5)) * 6 });
  return (
    <Cam2 z={lerp(1, 1.06, t / 45)}>
      <HallBox cam={cam} hall={hall} seed="e" detail={2}>
        <Zombie flip x={zf[0]} y={zf[1]} s={sizeAt(cam, 4.4, 0.0066)} pose={tp({ lL: [-92, 6], lR: [-78, 18], aL: [-14, -8], aR: [26, -118] })} face="sleepy" t={t2} />
        <Skeleton x={sf[0]} y={sf[1]} s={sizeAt(cam, 4.4)} pose={pose} face={run ? "joy" : "happy"} flip={false} t={t2} />
      </HallBox>
    </Cam2>
  );
};

/* ------------------------------------ shots 5–7: into the water ------------------------------------ */

/** shot 5: WOAH!! — it vaults the walkway rail and tumbles over */
const Jump: React.FC<{ t: number }> = ({ t }) => {
  const t2 = twos(t);
  const u = t2 / 15;
  const x = lerp(230, 1060, u), y = 1520 - Math.sin(Math.PI * Math.min(1, u)) * 640, r = -u * 200;
  return (
    <g>
      <Cam2 r={-22} z={1.3}>
        <FlatWall x={-300} y={-300} w={W + 600} h={H + 600} block={320} seed="j" />
        <OakBand x={-400} y={1330} w={W + 800} h={170} planks={12} />
        <rect x={-400} y={1500} width={W + 800} height={600} fill={STONE_D} />
      </Cam2>
      <g transform={`translate(${x} ${y}) rotate(${r})`}>
        <Skeleton x={0} y={0} s={3.0} pose={tp({ aL: [-150, -20], aR: [150, 20], lL: [-40, -30], lR: [50, 20] })} face="joy" t={t2} />
      </g>
    </g>
  );
};

/** shot 6: head first, upside down, water flying */
const FallHead: React.FC<{ t: number }> = ({ t }) => {
  const t2 = twos(t);
  const water = t2 >= 12 ? 1980 - (t2 - 12) * 60 : 2200;
  return (
    <g>
      <Cam2 r={-32} z={1.35}>
        <FlatWall x={-400} y={-400} w={W + 800} h={H + 800} block={300} scroll={-t * 36} seed="k" />
      </Cam2>
      <WaterRect x={0} y={water} w={W} h={H} f={t} />
      <ByHead x={560 + t2 * 6} y={520 + t2 * 44} s={4.6} r={168 - t2 * 1.2}>
        <Skeleton x={0} y={0} s={4.6} pose={tp({ aL: [-120, -40], aR: [120, 40], lL: [-30, -40], lR: [30, 40] })} face="shock" t={t2} />
      </ByHead>
      <Splash x={560} y={1500} t={t2 - 2} n={9} seed="fh" k={1.8} />
      <Splash x={300} y={1400} t={t2 - 8} n={7} seed="fh2" k={1.5} />
    </g>
  );
};

/** shot 7: sat in the channel between the two walkways: WOW, IT'S GOT WATER TOO! */
const Channel: React.FC<{ t: number }> = ({ t }) => {
  const cam: Cam = { F: 650, cx: 540, cy: 740, eh: 0.85 };
  const hall: Hall = { HW: 1.35, CH: 3.0, z0: 0.6, Z1: 7 };
  const t2 = twos(t);
  const foot = proj(cam, 0, 0, 1.6);
  const s = 2.7;
  const up = over(t2, 27, 36);
  const wave = Math.sin(t2 * 0.4);
  const pose = lerpT(tp({ aL: [-100 + wave * 24, -30], aR: [100 - wave * 24, 30] }), ARMS_UP, up);
  const bob = Math.sin(t2 * 0.25) * 10 + bell(t2, 27, 40) * 40;
  const face: SkelFace = t2 < 27 ? "joy" : t2 < 42 ? "laugh" : "happy";
  const floorPts = [[-hall.HW, 0, hall.z0], [hall.HW, 0, hall.z0], [hall.HW, 0, hall.Z1], [-hall.HW, 0, hall.Z1]] as [number, number, number][];
  const water = floorPts.map((p) => proj(cam, p[0], p[1], p[2]).join(",")).join(" ");
  const waist = foot[1] - 20;
  return (
    <Cam2 z={lerp(1, 1.05, t / 51)}>
      <HallBox cam={cam} hall={hall} seed="f" detail={1.3}>
        <polygon points={water} fill={WATER} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <OakBox cam={cam} x0={-1.35} x1={-1.0} y0={-1.55} y1={-1.3} z0={0.6} z1={7} planks={16} />
        <OakBox cam={cam} x0={1.0} x1={1.35} y0={-1.55} y1={-1.3} z0={0.6} z1={7} planks={16} />
      </HallBox>
      <Skeleton x={foot[0]} y={foot[1] + 150 * s * 0.6 - bob} s={s} pose={pose} face={face} t={t2} />
      <clipPath id="chWaist"><rect x={0} y={waist} width={W} height={H} /></clipPath>
      <g clipPath="url(#chWaist)">
        <polygon points={water} fill={WATER} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={120 + i * 200 + ((t * 2 + i * 50) % 160)} y={waist + 60 + i * 150} width={90 + i * 20} height={10} rx={5} fill="#8aa6f0" opacity={0.55} />)}
      </g>
      <Splash x={foot[0] - 160} y={waist} t={t2 - 30} n={6} seed="ch1" />
      <Splash x={foot[0] + 160} y={waist} t={t2 - 31} n={6} seed="ch2" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={160 + i * 240 + Math.sin(t * 0.3 + i) * 10} y={waist - 120 - ((t * 3 + i * 70) % 220)} width={16} height={22} rx={7} fill={WATER} stroke={INK} strokeWidth={4} opacity={0.9} />)}
    </Cam2>
  );
};

/* ------------------------------------ shots 9–13: the ride ------------------------------------ */

/** shot 9: down the shaft of water, walls streaming up: HAHAHA. WHERE WE GOING? HA, HA. WEE!! */
const Column: React.FC<{ t: number }> = ({ t }) => {
  const t2 = twos(t);
  const wee = t2 >= 57;
  const kick = Math.sin(t2 * 0.7) * 20;
  const pose = wee ? tp({ aL: [-160, -10], aR: [160, 10], lL: [-30 + kick, -20], lR: [30 - kick, 20] }) : { ...SPREAD, aL: [-105 + Math.sin(t2 * 0.3) * 10, -25] as [number, number], aR: [105 - Math.sin(t2 * 0.3) * 10, 25] as [number, number] };
  const face: SkelFace = t2 < 18 ? "joy" : t2 < 39 ? "happy" : t2 < 57 ? "joy" : "laugh";
  const y = 1000 + Math.sin(t2 * 0.1) * 30 + t2 * 1.4, x = 540 + Math.sin(t2 * 0.07) * 20;
  return (
    <g>
      <WaterRect x={150} y={-50} w={780} h={H + 100} f={t * 4} streaks={10} vertical />
      <FlatWall x={0} y={-50} w={160} h={H + 100} block={260} scroll={-t * 11} seed="l" shade={0.1} />
      <FlatWall x={920} y={-50} w={160} h={H + 100} block={260} scroll={-t * 11} seed="r" shade={0.1} />
      <path d={`M160,-50 V${H + 50} M920,-50 V${H + 50}`} stroke={INK} strokeWidth={9} />
      <g transform={`translate(${x} ${y}) rotate(${Math.sin(t2 * 0.1) * 6})`}>
        <Skeleton x={0} y={0} s={1.35} pose={pose} face={face} t={t2} />
      </g>
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={240 + i * 150 + Math.sin(t * 0.2 + i) * 8} y={((random(`cb${i}`) * H + H - t * 12 * (1 + i * 0.1)) % H)} width={14} height={14} rx={7} fill="#fff" opacity={0.35} />)}
    </g>
  );
};

/** shot 10: in the side channel, from the side: HEH... OH... W- WOAH! */
const SideChannel: React.FC<{ t: number }> = ({ t }) => {
  const t2 = twos(t);
  const face: SkelFace = t2 < 12 ? "relief" : t2 < 24 ? "glance" : "shock";
  const slide = t2 >= 30 ? (t2 - 30) * 48 : 0;
  const x = 540 + Math.sin(t2 * 0.2) * 5 + slide;
  const s = 2.1;
  const pose = t2 < 24 ? tp({ aL: [-40, -60], aR: [40, 60], tilt: 4 }) : tp({ aL: [-140, -30], aR: [140, 30], tilt: -6 });
  return (
    <Cam2 z={1} dx={-slide * 0.35}>
      <FlatWall x={-400} y={-50} w={W + 800} h={810} block={300} seed="s1" />
      <OakBand x={-400} y={760} w={W + 800} h={140} planks={10} light />
      <rect x={-400} y={900} width={W + 800} height={110} fill="#77777f" stroke={INK} strokeWidth={7} />
      <path d={`M-400,955 H${W + 400}`} stroke={GROUT} strokeWidth={4} opacity={0.7} />
      <Skeleton x={x} y={1270} s={s} pose={pose} face={face} headTurn={t2 >= 12 && t2 < 24 ? 10 : 0} t={t2} />
      <WaterRect x={-400} y={1010} w={W + 800} h={150} f={t * 3} streaks={8} />
      <path d={`M-400,1010 H${W + 400}`} stroke={INK} strokeWidth={6} opacity={0.5} />
      <OakBand x={-400} y={1160} w={W + 800} h={130} planks={10} />
      <FlatWall x={-400} y={1290} w={W + 800} h={700} block={300} seed="s2" shade={0.22} moss={0.3} />
      <path d={`M-400,1290 H${W + 400}`} stroke={INK} strokeWidth={8} />
    </Cam2>
  );
};

/** shot 11: the channel runs off the edge, the skeleton big in the corner of the frame: WAOAH!! */
const Diagonal: React.FC<{ t: number }> = ({ t }) => {
  const cam: Cam = { F: 620, cx: 720, cy: 520, eh: 1.7 };
  const hall: Hall = { HW: 1.0, CH: 2.6, z0: 0.5, Z1: 7 };
  const t2 = twos(t);
  const s = 5.2;
  const floorPts = [[-hall.HW, 0, hall.z0], [hall.HW, 0, hall.z0], [hall.HW, 0, hall.Z1], [-hall.HW, 0, hall.Z1]] as [number, number, number][];
  return (
    <Cam2 r={-18} z={1.15}>
      <HallBox cam={cam} hall={hall} seed="g" detail={1.5}>
        <polygon points={floorPts.map((p) => proj(cam, p[0], p[1], p[2]).join(",")).join(" ")} fill={WATER} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <OakBox cam={cam} x0={-1.0} x1={-0.62} y0={-0.4} y1={0} z0={0.5} z1={7} planks={16} />
        <OakBox cam={cam} x0={0.62} x1={1.0} y0={-0.4} y1={0} z0={0.5} z1={7} planks={16} />
      </HallBox>
      <ByHead x={300 + t2 * 5} y={1320 + t2 * 7} s={s} r={-24 + t2 * 1.4}>
        <Skeleton x={0} y={0} s={s} pose={tp({ aL: [-150, -20], aR: [140, 30] })} face="shock" t={t2} />
      </ByHead>
    </Cam2>
  );
};

/** shot 12: WHAT IS THAT?!? — hands on cheeks, then over it goes */
const ScreamClose: React.FC<{ t: number }> = ({ t }) => {
  const t2 = twos(t);
  const tumble = Math.max(0, t2 - 9);
  const jx = t2 < 9 ? Math.sin(t2 * 9) * 9 : 0;
  const s = 5.6;
  return (
    <g>
      <FlatWall x={-100} y={-100} w={W + 200} h={700} block={320} seed="sc" />
      <WaterRect x={-100} y={560} w={W + 200} h={H} f={t} streaks={7} />
      <g transform="rotate(-8 540 520)"><OakBand x={-300} y={430} w={W + 600} h={190} planks={12} light /></g>
      <ByHead x={540 + jx - tumble * 24} y={920 + tumble * 46} s={s} r={-tumble * 15}>
        <Skeleton x={0} y={0} s={s} pose={t2 < 9 ? tp({ aL: [-176, 52], aR: [176, -52], lL: [-20, -10], lR: [20, 10] }) : tp({ aL: [-150, -30], aR: [150, 30], lL: [-40, -30], lR: [50, 20] })} face={t2 < 9 ? "scream" : "wince"} t={t2} />
      </ByHead>
      <Splash x={300} y={1500} t={t2 - 12} n={10} seed="scs" k={2.2} />
    </g>
  );
};

/** shot 13: flat on the stone by the pool: WAAAAGH!!! */
const Landing: React.FC<{ t: number }> = ({ t }) => {
  const cam: Cam = { F: 600, cx: 540, cy: 300, eh: 3.2 };
  const hall: Hall = { HW: 2.2, CH: 2.0, z0: 0.9, Z1: 6 };
  const t2 = twos(t);
  const foot = proj(cam, 0.8, 0, 1.9);
  const pool = [[-2.2, 0, 1.0], [-0.1, 0, 1.0], [-0.1, 0, 2.5], [-2.2, 0, 2.5]] as [number, number, number][];
  return (
    <Cam2 r={-10} z={1.2}>
      <HallBox cam={cam} hall={hall} seed="n" detail={1.6}>
        <polygon points={pool.map((p) => proj(cam, p[0], p[1], p[2]).join(",")).join(" ")} fill={WATER} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <OakBox cam={cam} x0={-2.2} x1={2.2} y0={-0.35} y1={0} z0={2.55} z1={2.95} planks={14} />
        <OakBox cam={cam} x0={1.6} x1={2.2} y0={-0.35} y1={0} z0={0.9} z1={2.55} planks={8} />
      </HallBox>
      <g transform={`translate(${foot[0]} ${foot[1]}) rotate(-82)`}>
        <Skeleton x={0} y={0} s={1.8} pose={tp({ aL: [-70, -60], aR: [60, 50], lL: [-20, 10], lR: [30, -10], sq: 0.06 * bell(t2, 0, 8) })} face="wince" t={t2} />
      </g>
      <Splash x={foot[0] - 200} y={foot[1] - 20} t={t2 + 2} n={8} seed="ld" k={1.4} />
    </Cam2>
  );
};

/* ------------------------------------ shots 14–16: dead, alive, out ------------------------------------ */

/** shot 14: a dark corner. Nothing. Then it drops in, pink, lands with a bump, and the colour comes back */
const DarkCorner: React.FC<{ t: number }> = ({ t }) => {
  const cam: Cam = { F: 800, cx: 540, cy: 980, eh: 1.3 };
  const hall: Hall = { HW: 1.4, CH: 3.0, z0: 0.5, Z1: 2.4 };
  const t2 = twos(t);
  const LAND = 45;
  const floor = 1560, s = 2.6;
  const y = t2 < LAND ? floor - (LAND - t2) * 125 : floor;
  const hurt = t2 < 54 ? 1 : 0;
  const face: SkelFace = t2 < LAND + 4 ? "worry" : t2 < 58 ? "ouch" : "plain";
  const sq = 0.16 * bell(t2, LAND, LAND + 7);
  return (
    <g>
      <HallBox cam={cam} hall={hall} seed="o" dark={0.45} detail={1.2} moss={1.3} />
      {t2 >= 39 && <Skeleton x={540} y={y} s={s} pose={tp({ aL: [-40, -30], aR: [40, 30], lL: [-12, 0], lR: [12, 0], sq })} face={face} hurt={hurt} t={t2} />}
      {t2 >= LAND && t2 < LAND + 16 && [0, 1, 2, 3, 4].map((i) => {
        const u = t2 - LAND, px = 420 + i * 60 + Math.sin(i * 3) * 30, py = floor - 20 - u * 9 - i * 12;
        return <path key={i} d={`M${px - 16},${py} h32 M${px},${py - 16} v32`} stroke="#9a9aa2" strokeWidth={10} strokeLinecap="round" opacity={1 - u / 16} />;
      })}
    </g>
  );
};

/** shot 15: OH... I- I'M ALIVE!! — laughing up at the hole it fell through, then a wicked little smile */
const Alive: React.FC<{ t: number }> = ({ t }) => {
  const cam: Cam = { F: 800, cx: 560, cy: 1400, eh: 2.0 };
  const hall: Hall = { HW: 1.6, CH: 3.2, z0: 0.6, Z1: 3 };
  const t2 = twos(t);
  const face: SkelFace = t2 < 21 ? "relief" : t2 < 39 ? "laugh" : "smug";
  const hole = [[-0.6, -3.2, 1.2], [0.6, -3.2, 1.2], [0.6, -3.2, 2.2], [-0.6, -3.2, 2.2]] as [number, number, number][];
  const s = 4.4;
  const bob = bell(t2, 21, 30) * 30 + bell(t2, 30, 39) * 18;
  return (
    <Cam2 r={-14} z={1.1}>
      <HallBox cam={cam} hall={hall} seed="p" dark={0.4} detail={1.3}>
        <polygon points={hole.map((p) => proj(cam, p[0], p[1], p[2]).join(",")).join(" ")} fill="#111016" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      </HallBox>
      <ByHead x={560} y={780 - bob} s={s} r={-6 + Math.sin(t2 * 0.2) * 2}>
        <Skeleton x={0} y={0} s={s} pose={tp({ aL: [-16, -10], aR: [lerp(150, 120, ease(t2, 39, 48)), 70], tilt: t2 < 39 ? -8 : 2 })} face={face} t={t2} />
      </ByHead>
    </Cam2>
  );
};

/** shot 16: I'M GONNA LIVE!! — hauling itself up over the wall into daylight, from behind */
const ClimbOut: React.FC<{ t: number }> = ({ t }) => {
  const t2 = twos(t);
  const y = 1780 - ease(t2, 0, 24) * 420;
  const kick = Math.sin(t2 * 0.6) * 26;
  return (
    <g>
      <rect x={-50} y={-50} width={W + 100} height={H + 100} fill="#b3bfd0" />
      <g transform="rotate(20 540 0)"><Rays o={0.5} /></g>
      <Bricks x={-50} y={1000} w={W + 100} h={H} seed="cl" />
      <rect x={-50} y={985} width={W + 100} height={30} fill="#6fbf4a" stroke={INK} strokeWidth={7} />
      <Moss x={60} y={700} s={120} seed="clm" />
      <Moss x={-40} y={880} s={90} seed="clm2" />
      <Skeleton back x={560} y={y + 120} s={3.6} pose={tp({ aL: [-166, -8], aR: [166, 8], lL: [-18 + kick, -24], lR: [18 - kick, 24] })} face="plain" t={t2} />
    </g>
  );
};

/* ------------------------------------ shots 17–18: outside ------------------------------------ */

/** shot 17: a player in netherite drops into the meadow, grinning */
const KnightDrop: React.FC<{ t: number }> = ({ t }) => {
  const t2 = twos(t);
  const LAND = 18;
  const settle = ease(t, 0, 26);
  const u = Math.min(1, t2 / LAND);
  const y = t2 < LAND ? 900 + 600 * u * u : 1500;
  const run = t2 >= 46;
  const sq = 0.16 * bell(t2, LAND, LAND + 8);
  const pose = run ? walk(t2, 1.1) : t2 < LAND ? tp({ aL: [-85, -40], aR: [85, 40], lL: [-55, 85], lR: [50, 85] }) : tp({ aL: [-40 - bell(t2, LAND + 8, LAND + 22) * 30, -40], aR: [40 + bell(t2, LAND + 8, LAND + 22) * 30, 40], sq, bob: bell(t2, LAND + 8, LAND + 22) * 14 });
  const face: KnightFace = t2 < LAND + 6 ? "grin" : "laugh";
  return (
    <Cam2 r={lerp(-22, 0, settle)} z={lerp(1.18, 1, settle)}>
      <Sky horizon={1010} f={t} />
      <Oak x={150} y={1010} s={1.5} seed="o1" />
      <Oak x={780} y={1000} s={1.8} seed="o2" />
      <Oak x={1050} y={1010} s={1.2} seed="o3" />
      <Grass y={1000} />
      <Knight x={run ? 540 - (t2 - 46) * 42 : 540} y={y} s={2.7} pose={pose} face={face} flip={run} t={t2} />
    </Cam2>
  );
};

/** shot 18: the chamber's tower from outside: the player leaps off it, sword out, and bones fly */
const TowerEnd: React.FC<{ t: number }> = ({ t }) => {
  const t2 = twos(t);
  const LAND = 14;
  const u = Math.min(1, t2 / LAND);
  const kx = lerp(430, 790, u), ky = 1120 + 380 * u * u - Math.sin(Math.PI * u) * 120;
  const swing = ease(t2, 4, 10);
  const pose = t2 < LAND ? tp({ aL: [-110, -40], aR: [lerp(165, 70, swing), lerp(10, -30, swing)], lL: [-50, 80], lR: [40, 80] }) : tp({ aL: [-30, -30], aR: [70, -20], sq: 0.14 * bell(t2, LAND, LAND + 8), bob: bell(t2, LAND + 8, LAND + 20) * 12 });
  const bones = [[-14, -26, 0.9], [-6, -32, 1.1], [6, -28, 1.0], [14, -22, 0.8], [0, -36, 1.2]];
  return (
    <Cam2 z={lerp(1, 1.06, t / 34)}>
      <Sky horizon={1500} f={t} />
      <Rays o={0.4} />
      <Oak x={820} y={1500} s={2.2} seed="t1" />
      <Oak x={1080} y={1500} s={1.6} seed="t2" />
      <Grass y={1500} seed="tg" />
      <Tower x={20} w={380} top={-50} base={1500} />
      {t2 >= 6 && bones.map(([vx, vy, sc], i) => {
        const u2 = t2 - 6;
        const bx = 330 + vx * u2, by = 1400 + vy * u2 + u2 * u2 * 2.1;
        if (by > 1540) return <Bone key={i} x={330 + vx * 10} y={1510 + i * 14} r={i * 40} s={sc} />;
        return <Bone key={i} x={bx} y={by} r={u2 * 25 * (i % 2 ? 1 : -1)} s={sc} />;
      })}
      {t2 >= 8 && <Arrow x={330 + (t2 - 8) * 18} y={1380 + (t2 - 8) * 10} r={30} />}
      <g transform={`translate(${kx} ${ky}) rotate(${(1 - u) * -28})`}>
        <Knight x={0} y={0} s={2.1} pose={pose} face="laugh" t={t2} holdR={<Sword />} />
      </g>
    </Cam2>
  );
};

/* ------------------------------------ the captions ------------------------------------ */

const Caption: React.FC<{ f: number }> = ({ f }) => {
  const s = B.subs.find(([a, b]) => f >= (a as number) && f < (b as number));
  if (!s) return null;
  const text = s[2] as string;
  const k = (s[3] as number | undefined) ?? 1;
  const size = 66 * k;
  return (
    <text x={540} y={340 + (k - 1) * 40} fontFamily="ComicRelief, 'Comic Sans MS', sans-serif" fontSize={size} fontWeight={700} textAnchor="middle" fill="#ffffff" stroke={INK} strokeWidth={Math.max(8, 7 * k)} strokeLinejoin="round" paintOrder="stroke" letterSpacing={1}>
      {text}
    </text>
  );
};

/* ------------------------------------ assembly ------------------------------------ */

const ShotBody: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  switch (i) {
    case 0: return <Spawn t={t} />;
    case 1: return <Closeup t={t} />;
    case 2: return <HallEnter t={t} />;
    case 3: return <ZombieClose t={t} />;
    case 4: return <LowHall t={t} />;
    case 5: return <Jump t={t} />;
    case 6: return <FallHead t={t} />;
    case 7: return <Channel t={t} />;
    case 8: return <ZombieClose t={t} sorry />;
    case 9: return <Column t={t} />;
    case 10: return <SideChannel t={t} />;
    case 11: return <Diagonal t={t} />;
    case 12: return <ScreamClose t={t} />;
    case 13: return <Landing t={t} />;
    case 14: return <DarkCorner t={t} />;
    case 15: return <Alive t={t} />;
    case 16: return <ClimbOut t={t} />;
    case 17: return <KnightDrop t={t} />;
    default: return <TowerEnd t={t} />;
  }
};

const Shot: React.FC<{ i: number }> = ({ i }) => {
  const t = Math.max(0, useCurrentFrame());
  return <Svg vig={i === 14 || i === 15 ? 0.55 : 0.3}><ShotBody i={i} t={t} /></Svg>;
};

export const SpawnShort: React.FC<{ audio?: string | null; captions?: boolean }> = ({ audio = null, captions = true }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio && <Audio src={staticFile(audio)} />}
      {B.cuts.slice(0, -1).map((c, i) => (
        <Sequence key={i} from={c} durationInFrames={B.cuts[i + 1] - c} layout="none">
          <Shot i={i} />
        </Sequence>
      ))}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {captions && <Caption f={f} />}
      </svg>
    </AbsoluteFill>
  );
};

/** the 9:16 thumbnail: the skeleton happy in the water, the title in the caption's lettering over the water */
export const SpawnThumb: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Svg><Channel t={12} /></Svg>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g fontFamily="ComicRelief, 'Comic Sans MS', sans-serif" fontWeight={700} textAnchor="middle" fill="#fff" stroke={INK} strokeLinejoin="round" paintOrder="stroke">
          <text x={540} y={1440} fontSize={132} strokeWidth={18}>I SPAWNED</text>
          <text x={540} y={1590} fontSize={132} strokeWidth={18}>IN A CAVE!!</text>
          <text x={540} y={1780} fontSize={100} strokeWidth={14} fill="#ffe14a">(it was not a cave)</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

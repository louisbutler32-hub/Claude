import React from "react";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Audio, continueRender, delayRender, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../minecraft/beats";
import { ease } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { limb, lerpPose, Pose, POSE, Pt } from "../minecraft/figure";
import { Cap, Monk, Straw, Wise } from "./cast";
import { Poppy } from "../minecraft/pixels";
import B from "./beats.json";

/**
 * "That's La Peace" — a shot-for-shot remake, in our look, of a viral Minecraft
 * animation: two friends in a lava cave shout DIAMOND at a wall of ore, a
 * miner breaks through into a sunbeam over an impossible meadow, a glowing
 * treasure hangs in the light, a Greek temple stands in the flowers, and the
 * last close-up finds a hero crowned with laurel. The picture is redrawn with
 * Oofy and the subtitle bar of the game; the voice track is the original's, so
 * the cuts and the lines are on the reference's own times (beats.json).
 */

export const LAPEACE_FRAMES = B.frames;

const LINE = "#2a1b3d";
const MONO = "Monocraft, monospace";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const sm = (f: number, a: number, b: number) => ease(f, a, b);

const ORE = staticFile("images/pov2/lapis-ore.png"); // "La Peace" is lapis
const STONE = staticFile("images/pov2/stone.png");
const PICK = staticFile("images/pov2/iron-pickaxe.png");
const BREAKS = [0, 1, 2, 3, 4, 5].map((i) => staticFile(`images/pov2/break-${i}.png`));
const PX: React.CSSProperties = { imageRendering: "pixelated" };

/* ----------------------------- the cast ----------------------------- */

/** the cast (./cast.tsx): the cap guy, the straw-hat guy, the wise one in laurel: the reference's three, drawn as Oofy */
const stand = (extra?: Partial<Pose>): Pose => ({ ...POSE.stand, ...extra });

/** the iron pickaxe in a hand, head up and forward */
const pickInHand = (h: Pt, rot = -25, sc = 0.9) => (
  <g transform={`translate(${h[0]} ${h[1]}) rotate(${rot}) scale(${sc}) translate(-70 -310)`}>
    <image href={PICK} x={0} y={0} width={360} height={360} style={PX} />
  </g>
);

/** a lapis ore block, outlined like everything else */
const Ore: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g>
    <image href={ORE} x={x} y={y} width={s} height={s} style={PX} />
    <rect x={x} y={y} width={s} height={s} fill="none" stroke={LINE} strokeWidth={8} />
  </g>
);

/* ----------------------------- shared scenery ----------------------------- */

/** the air between you and the far mountains: a pale gradient that lifts off the foot of the range */
const Haze: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <defs><linearGradient id="lpHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfeeff" stopOpacity={0} /><stop offset="1" stopColor="#dfeeff" stopOpacity={0.7} /></linearGradient></defs>
    <rect x={-100} y={y - 380} width={W + 200} height={400} fill="url(#lpHaze)" />
  </g>
);

/** the finish over every shot: soft focus defs, a sun grade from the top right, and a vignette */
const Svg: React.FC<{ children: React.ReactNode; sun?: number }> = ({ children, sun = 0.3 }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <filter id="lpDof" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={2.6} /></filter>
      <radialGradient id="lpVig" cx="50%" cy="46%" r="75%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#0a0518" stopOpacity={0.5} /></radialGradient>
      <radialGradient id="lpSun" cx="82%" cy="6%" r="70%"><stop offset="0" stopColor="#fff2b0" stopOpacity={sun} /><stop offset="1" stopColor="#fff2b0" stopOpacity={0} /></radialGradient>
      <linearGradient id="lpFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0.6" stopColor="#10081c" stopOpacity={0} /><stop offset="1" stopColor="#10081c" stopOpacity={0.3} /></linearGradient>
      <clipPath id="lpAll"><rect x={0} y={0} width={W} height={H} /></clipPath>
    </defs>
    <g clipPath="url(#lpAll)">{children}</g>
    <rect x={0} y={0} width={W} height={H} fill="url(#lpSun)" style={{ mixBlendMode: "screen" }} />
    <rect x={0} y={0} width={W} height={H} fill="url(#lpFloor)" />
    <rect x={0} y={0} width={W} height={H} fill="url(#lpVig)" />
  </svg>
);

const cloudRects = Array.from({ length: 16 }, (_, i) => ({ x: random(`cx${i}`) * 1500 - 200, y: 40 + random(`cy${i}`) * 700, w: 160 + random(`cw${i}`) * 260, h: 40 + random(`ch${i}`) * 40, v: 0.3 + random(`cv${i}`) * 0.8 }));

const SLABS = Array.from({ length: 26 }, (_, i) => ({ u: random(`cu${i}`), v: random(`cv${i}`), w: 0.6 + random(`cw${i}`) * 0.9, o: 0.55 + random(`co${i}`) * 0.4 }));
const Sky: React.FC<{ f: number; horizon: number; top?: string; bottom?: string }> = ({ f, horizon, top = "#1f78f0", bottom = "#bfe4ff" }) => (
  <g>
    <defs>
      <linearGradient id={`sky${top}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="0.7" stopColor="#5aa9ff" /><stop offset="1" stopColor={bottom} /></linearGradient>
    </defs>
    <rect x={-100} y={-100} width={W + 200} height={horizon + 100} fill={`url(#sky${top})`} />
    {/* translucent cloud slabs: big and tilted overhead, small and flat toward the horizon */}
    {SLABS.map((c, i) => {
      const y = c.v * horizon * 0.92;
      const near = 1 - y / horizon; // 1 overhead, 0 at the horizon
      const w = (180 + 520 * near) * c.w, h = (26 + 70 * near) * c.w;
      const x = ((c.u * 1500 + f * (0.4 + near) * 0.9) % 1500) - 260;
      return <rect key={i} x={x} y={y} width={w} height={h} fill="#ffffff" opacity={c.o * (0.5 + 0.5 * near)} transform={`translate(${x} ${y}) skewX(${-38 * near - 8}) translate(${-x} ${-y})`} />;
    })}
  </g>
);

/** stepped, voxel-style mountain ranges: columns of rock with snow caps, a bluer far range behind */
const Mountains: React.FC<{ y: number; k?: number }> = ({ y, k = 1 }) => {
  const range = (seed: string, base: number, amp: number, rock: string, rockLo: string, snow: string, shade: string, snowLine: number, off: number) => {
    const cols: React.ReactNode[] = [];
    const cw = 26;
    for (let i = -1; i < 44; i++) {
      const n = 0.5 + 0.5 * (0.55 * Math.sin(i * 0.23 + off) + 0.3 * Math.sin(i * 0.61 + off * 2.1) + 0.15 * Math.sin(i * 1.7 + off * 3.3));
      const h = Math.max(24, (base + amp * Math.abs(n)) * k);
      const x = i * cw;
      const topY = y - h;
      const snowH = Math.max(0, h - snowLine * k);
      cols.push(
        <g key={i}>
          <rect x={x} y={topY} width={cw + 1} height={h + 60} fill={rock} />
          <rect x={x} y={y - h * 0.45} width={cw + 1} height={h * 0.45 + 60} fill={rockLo} />
          <rect x={x + cw * 0.55} y={topY} width={cw * 0.45 + 1} height={h + 60} fill={shade} opacity={0.3} />
          {snowH > 0 && <rect x={x} y={topY} width={cw + 1} height={snowH} fill={snow} />}
          {snowH > 0 && <rect x={x + cw * 0.55} y={topY} width={cw * 0.45 + 1} height={snowH} fill="#c4d6f2" opacity={0.75} />}
        </g>
      );
    }
    return cols;
  };
  return (
    <g>
      <g opacity={0.95}>{range("mfar", 140, 200, "#8ea3c4", "#9fb4d0", "#ffffff", "#5a6f94", 230, 0.7)}</g>
      <g>{range("mnear", 70, 150, "#7b8798", "#667362", "#fbfdff", "#3b4656", 150, 2.6)}</g>
      <rect x={-100} y={y - 6} width={W + 200} height={80} fill="#4f7d3c" />
    </g>
  );
};

const Flowers: React.FC<{ y0: number; y1: number; n?: number; seed?: string; big?: number }> = ({ y0, y1, n = 40, seed = "fl", big = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const t = random(`${seed}y${i}`);
      const y = lerp(y0, y1, t);
      const sc = (0.25 + t * 1.2) * big;
      const c = ["#e8483a", "#ffd84a", "#9a6bd6", "#ffffff"][Math.floor(random(`${seed}c${i}`) * 4)];
      const x = random(`${seed}x${i}`) * 1100 - 20;
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${sc})`}>
          <rect x={-4} y={0} width={8} height={26} fill="#3f8a32" />
          <rect x={-16} y={-16} width={32} height={20} fill={c} stroke={LINE} strokeWidth={4} />
        </g>
      );
    })}
  </g>
);

const GREENS = ["#4f9a3a", "#5fb04a", "#6cc152", "#3f8a32", "#7ccf5c"];
const Meadow: React.FC<{ y: number; riverX?: number }> = ({ y, riverX = 380 }) => {
  const rows: React.ReactNode[] = [];
  let yy = y;
  let r = 0;
  while (yy < H + 60) {
    const h = 12 + r * 8.5;
    const w = h * 1.35;
    for (let x = -w; x < W + w; x += w) {
      const g = GREENS[Math.floor(random(`mg${r}${Math.round(x)}`) * GREENS.length)];
      rows.push(<rect key={`${r}${x}`} x={x} y={yy} width={w + 1} height={h + 1} fill={g} />);
      // every so often a flower sits on a block
      const fr = random(`mf${r}${Math.round(x)}`);
      if (fr > 0.78) {
        const c = ["#e8483a", "#ff6b81", "#ffd84a", "#9a6bd6", "#ffffff"][Math.floor(random(`mc${r}${Math.round(x)}`) * 5)];
        rows.push(<rect key={`f${r}${x}`} x={x + w * 0.3} y={yy + h * 0.1} width={Math.max(4, h * 0.34)} height={Math.max(4, h * 0.34)} fill={c} />);
      }
    }
    yy += h;
    r++;
  }
  const rv = `M${riverX},${y + 10} C${riverX - 120},${y + 220} ${riverX + 260},${y + 380} ${riverX - 80},${y + 640} S${riverX - 200},${y + 900} ${riverX - 300},${H + 60}`;
  return (
    <g>
      {rows}
      <path d={rv} fill="none" stroke="#2f63c4" strokeWidth={80} strokeLinecap="round" />
      <path d={rv} fill="none" stroke="#4f8bf0" strokeWidth={56} strokeLinecap="round" />
      <path d={rv} fill="none" stroke="#bcd8ff" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
      {/* a few blocky trees */}
      {[[860, y + 60, 0.5], [120, y + 90, 0.6], [700, y + 40, 0.35], [980, y + 140, 0.8]].map(([tx, ty, ts], i) => (
        <g key={i} transform={`translate(${tx} ${ty}) scale(${ts})`}>
          <rect x={-12} y={-20} width={24} height={90} fill="#5e3f1c" />
          <rect x={-80} y={-110} width={160} height={100} fill="#2f7a2a" />
          <rect x={-50} y={-170} width={100} height={70} fill="#3f8f33" />
        </g>
      ))}
    </g>
  );
};

const Beam: React.FC<{ x0: number; x1: number; tx: number; ty: number; o?: number }> = ({ x0, x1, tx, ty, o = 1 }) => (
  <g opacity={o} style={{ mixBlendMode: "screen" }}>
    <defs>
      <linearGradient id="beamg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6b0" stopOpacity={0.55} /><stop offset="0.6" stopColor="#fff2a0" stopOpacity={0.75} /><stop offset="1" stopColor="#fff2a0" stopOpacity={0.95} /></linearGradient>
    </defs>
    <polygon points={`${x0 - 80},-100 ${x1 + 60},-100 ${tx + 260},${ty + 340} ${tx - 260},${ty + 340}`} fill="url(#beamg)" opacity={0.55} />
    <polygon points={`${x0},-100 ${x1},-100 ${tx + 150},${ty + 160} ${tx - 150},${ty + 160}`} fill="url(#beamg)" />
    {[0.15, 0.4, 0.62, 0.85].map((u, i) => (
      <polygon key={i} points={`${lerp(x0, x1, u) - 20},-100 ${lerp(x0, x1, u) + 22},-100 ${lerp(tx - 90, tx + 90, u) + 8},${ty + 120} ${lerp(tx - 90, tx + 90, u) - 8},${ty + 120}`} fill="#ffffff" opacity={0.3} />
    ))}
    <circle cx={tx} cy={ty} r={230} fill="#fff6b0" opacity={0.35} />
  </g>
);

/** the glowing treasure in the beam: a little monk (the wise one, cross-legged and calm), bobbing in the light */
const Treasure: React.FC<{ x: number; y: number; k: number; f: number }> = ({ x, y, k, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.12) * 12 * k}) scale(${k})`}>
    <circle r={190} fill="#fff6b0" opacity={0.35} />
    <circle r={125} fill="#fff6b0" opacity={0.55} />
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-5} y={-230} width={10} height={80} fill="#fff6b0" opacity={0.6} transform={`rotate(${i * 45 + f * 3})`} />
    ))}
    <g transform="scale(1.15)"><Monk f={f} /></g>
  </g>
);

const Cam: React.FC<{ z?: number; cx?: number; cy?: number; r?: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ z = 1, cx = 540, cy = 960, r = 0, dx = 0, dy = 0, children }) => (
  <g transform={`translate(${dx} ${dy}) translate(${cx} ${cy}) rotate(${r}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);

/* ------------------------------- shot 1: the cave ------------------------------- */

const LAVA = ["#6a1c14", "#8a2418", "#4d130e", "#7a1e14", "#c0381a"];
const Cave: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const lava: React.ReactNode[] = [];
  for (let r = 0; r < 24; r++) for (let c = 0; c < 9; c++) {
    const rr = random(`lv${r}${c}`);
    const x = c * 60 + (r % 2) * 20, y = r * 60;
    if (x > 560 - r * 6) continue;
    lava.push(<rect key={`${r}${c}`} x={x} y={y} width={62} height={62} fill={LAVA[Math.floor(rr * 4)]} opacity={0.85 + 0.15 * Math.sin(t * 0.2 + r + c)} />);
  }
  // the voice: DIAMOND on frames 0 and 34 (then 55, 75 in the next shot): arms up and a bounce on each
  const hits = [0, 34];
  const bounce = Math.max(...hits.map((h) => (t >= h && t < h + 10 ? Math.sin(((t - h) / 10) * Math.PI) : 0)));
  const shout = hits.some((h) => t >= h && t < h + 14);
  // the arms rise and fall on a curve instead of snapping between two poses
  const shoutK = Math.max(...hits.map((h) => ease(t, h - 2, h + 3) * (1 - ease(t, h + 9, h + 17))));
  // the straw-hat guy walks up to the camera
  const walk = sm(t, 22, 54);
  const ox = lerp(690, 800, walk), oy = lerp(1214, 1380, walk) - shoutK * 12, os = lerp(0.68, 1.05, walk);
  const step = walk > 0 && walk < 1 ? Math.sin(t * 0.8) * 24 : 0;
  const up = { ...POSE.stand, armR: limb(90, 40, 150, 20), armL: limb(-90, 40, -150, 20) };
  const down = stand({ legL: limb(-40, 190 + step * 0.2, -46 - step, 335), legR: limb(40, 190 - step * 0.2, 46 + step, 335), armR: limb(80, 70, 118 + step * 0.4, 150), armL: limb(-80, 70, -116, 150) });
  const capDown = stand({ armL: limb(-60, 60, -100, 138), armR: limb(60, 60, 110, 130) });
  const capUp = { ...POSE.stand, armR: limb(80, 40, 120, -60), armL: limb(-80, 40, -120, -60) };
  const capPose = lerpPose(capDown, capUp, shoutK);
  return (
    <Cam z={lerp(1, 1.1, t / 56)} cx={540} cy={1200}>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#1b1124" />
      <rect x={-100} y={-100} width={560} height={1500} fill="#7a1c14" />
      {lava}
      <rect x={-100} y={-100} width={760} height={1500} fill="#ff6a1a" opacity={0.12 + 0.05 * Math.sin(t * 0.3)} />
      {[[330, 120, 1260], [560, 160, 1260], [820, 200, 1260]].map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={1260 - h} width={w} height={h} fill={i % 2 ? "#241830" : "#2d2038"} stroke={LINE} strokeWidth={7} />
          <rect x={x} y={1260 - h} width={14} height={h} fill="#ff8a24" opacity={0.25} />
        </g>
      ))}
      <rect x={-100} y={1190} width={W + 200} height={90} fill="#3a2c4a" stroke={LINE} strokeWidth={7} />
      <rect x={-100} y={1190} width={W + 200} height={18} fill="#5a4a72" />
      <rect x={-100} y={1280} width={W + 200} height={700} fill="#241830" />
      {Array.from({ length: 16 }, (_, i) => {
        const u = ((t * 0.02 + random(`em${i}`)) % 1);
        return <rect key={i} x={60 + random(`ex${i}`) * 500 + Math.sin(u * 8 + i) * 20} y={1180 - u * 900} width={10} height={10} fill="#ffb347" opacity={1 - u} />;
      })}
      <Cap x={290} y={1216 - bounce * 8} s={0.68} p={capPose} face={shout ? "joy" : "grin"} gaze={[10, 2]} idle={t} />
      <Straw x={ox} y={oy} s={os} p={lerpPose(down, up, shoutK)} face={shout ? "joy" : "grin"} gaze={[-14, 4]} idle={t} />
      {/* the ore in front: a tall pillar and a big block */}
      {[0, 1].map((i) => <Ore key={i} x={-70} y={880 + i * 290} s={300} />)}
      <polygon points="-120,1500 1200,1500 1260,1620 -180,1620" fill="#4a52a8" stroke={LINE} strokeWidth={8} />
      {[0, 1, 2, 3].map((i) => <Ore key={i} x={-120 + i * 330} y={1620} s={330} />)}
      <ellipse cx={540} cy={1840} rx={760} ry={230} fill="#2a5bd6" opacity={0.13} />
    </Cam>
  );
};

/* ------------------------------- shot 2: mining ------------------------------- */

const Mine: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const swing = (Math.sin(t * 0.46 - 1.2) + 1) / 2;
  const pose: Pose = lerpPose(POSE.holdPick, POSE.mine, swing);
  const shout = (t >= 0 && t < 9) || (t >= 19 && t < 28);
  return (
    <Cam z={lerp(1.04, 1, t / 44)} dx={Math.sin(t * 0.8) * 4}>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#0c0c2a" />
      {/* steps of ore up the back wall */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Ore x={640 + i * 140} y={520 + i * 200} s={340} />
          <rect x={640 + i * 140} y={520 + i * 200} width={340} height={340} fill="#000" opacity={0.25 + i * 0.1} />
        </g>
      ))}
      {/* the floor of ore */}
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => (
        <g key={`${r}${c}`} opacity={0.9}><Ore x={-110 + c * 330 + (r % 2) * 90} y={1000 + r * 250} s={330} /></g>
      )))}
      <rect x={-100} y={900} width={W + 200} height={1100} fill="#0a0a30" opacity={0.35} />
      {/* the straw-hat guy from behind, swinging */}
      <Straw back x={430} y={1560} s={1.05} p={pose} face="back" tilt={swing * 4 - 2} idle={t} hands={(h) => pickInHand(h.R, -20 - swing * 10, 1.1)} />
      {shout && <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#1a2cff" opacity={0.08} />}
    </Cam>
  );
};

/* ------------------------------- shot 3: breaking through ------------------------------- */

/** Speed swings at the tunnel wall: a crack on the first hit, the wall bursts on the second and daylight floods in */
const HIT1 = 4, HIT2 = 24;
const Breakthrough: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const hitOf = (h: number) => {
    const k = ease(t, h - 9, h - 3) * (1 - ease(t, h - 3, h)) + ease(t, h - 3, h) * (1 - ease(t, h, h + 9));
    return k; // 0 away, 1 wound up, then struck and recoiling
  };
  const wind = Math.max(hitOf(HIT1) * (t < HIT1 + 9 ? 1 : 0), hitOf(HIT2));
  const striking = (t >= HIT1 - 3 && t < HIT1 + 6) || (t >= HIT2 - 3 && t < HIT2 + 6);
  const sx = Math.sin(t * 7) * (t >= HIT1 && t < HIT1 + 8 ? 14 : t >= HIT2 && t < HIT2 + 10 ? 26 : 0);
  const sy = Math.cos(t * 6) * (t >= HIT1 && t < HIT1 + 8 ? 10 : t >= HIT2 && t < HIT2 + 10 ? 20 : 0);
  const stage = t < HIT1 ? -1 : t < HIT2 - 6 ? 2 : t < HIT2 - 3 ? 4 : t < HIT2 ? 5 : -1;
  const hole = ease(t, HIT2, HIT2 + 14);
  const pickPose = striking ? { x: 1090, y: 1510, r: 0 } : { x: lerp(1300, 1200, wind), y: lerp(2000, 1720, wind), r: lerp(25, 15, wind) };
  return (
    <g>
      <Cam z={lerp(1, 1.06, t / 40)} dx={sx} dy={sy}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#2b2b33" />
        {Array.from({ length: 5 }, (_, r) => Array.from({ length: 3 }, (_, c) => (
          <g key={`${r}${c}`}>
            <image href={STONE} x={-130 + c * 400 + (r % 2) * 130} y={-60 + r * 400} width={400} height={400} style={PX} />
            <rect x={-130 + c * 400 + (r % 2) * 130} y={-60 + r * 400} width={400} height={400} fill="none" stroke={LINE} strokeWidth={8} />
          </g>
        )))}
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#000" opacity={0.35} />
        {stage >= 0 && <image href={BREAKS[stage]} x={90} y={420} width={900} height={900} style={PX} />}
        {/* the hole: daylight pouring through */}
        {hole > 0 && (
          <g>
            <circle cx={540} cy={960} r={hole * 1100} fill="#fff7c8" />
            <circle cx={540} cy={960} r={hole * 900} fill="#bfe4ff" />
            <circle cx={540} cy={960} r={hole * 560} fill="#eaf6ff" />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={540 - 14} y={960 - hole * 1000} width={28} height={hole * 700} fill="#ffffff" opacity={0.35} transform={`rotate(${i * 30} 540 960)`} />
            ))}
          </g>
        )}
        {/* chips of stone flying out of the break */}
        {t >= HIT2 && t < HIT2 + 16 && Array.from({ length: 22 }, (_, i) => {
          const a = random(`bt${i}`) * Math.PI * 2, v = 18 + random(`bv${i}`) * 34, d = t - HIT2;
          return <rect key={i} x={540 + Math.cos(a) * v * d} y={960 + Math.sin(a) * v * d + d * d * 2} width={46} height={46} fill={i % 2 ? "#8d8d96" : "#6c6c76"} stroke={LINE} strokeWidth={5} />;
        })}
      </Cam>
      <g transform={`translate(${pickPose.x} ${pickPose.y}) rotate(${pickPose.r}) scale(2.5) translate(-295 -325)`}>
        <image href={PICK} x={0} y={0} width={360} height={360} style={PX} transform="translate(360 0) scale(-1 1)" />
      </g>
    </g>
  );
};

/* ------------------------------- the meadow shots ------------------------------- */

const SunMeadow: React.FC<{ f: number; k: number; drift: number }> = ({ f, k, drift }) => (
  <Cam z={k} cx={540} cy={920} dx={drift}>
    <g filter="url(#lpDof)"><Sky f={f} horizon={1300} /></g>
    <Beam x0={500} x1={1020} tx={540} ty={960} />
    <g filter="url(#lpDof)"><Mountains y={1180} k={2} /><Haze y={1180} /></g>
    <Meadow y={1170} />
    <Treasure x={540} y={960} k={1} f={f} />
  </Cam>
);

const MeadowBack: React.FC<{ f: number; z?: number; dx?: number }> = ({ f, z = 1, dx = 0 }) => (
  <Cam z={z} cx={540} cy={1000} dx={dx}>
    <g filter="url(#lpDof)"><Sky f={f} horizon={1100} /></g>
    <g filter="url(#lpDof)"><Mountains y={1060} k={1.7} /><Haze y={1060} /></g>
    <Meadow y={1050} riverX={230} />
  </Cam>
);

/* shot 5: he meets the meadow, a lapis in his raised fist */
const Hero: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const turn = sm(t, 28, 40);
  const arms = sm(t, 36, 50);
  const p = lerpPose({ ...POSE.stand, armL: limb(-110, 60, -190, 40), armR: limb(90, 90, 70, 190) }, { ...POSE.out, armL: limb(-132, 32, -240, -10), armR: limb(132, 32, 250, -10) }, arms);
  return (
    <g>
      <MeadowBack f={f} z={lerp(1, 1.06, t / 65)} />
      <g>
        {[[120, 1560], [60, 1700], [240, 1830]].map(([x, y], i) => <Poppy key={i} x={x} y={y} px={26} />)}
      </g>
      <Cam z={1} dx={lerp(0, -20, turn)}>
        <Straw x={700} y={2250} s={2.1} p={p} face={t < 28 ? "surprised" : "shocked"} gaze={[lerp(-22, 12, turn), 0]} idle={t} hands={(h) => (
          <g transform={`translate(${h.L[0]} ${h.L[1]}) rotate(-12)`}>
            <image href={ORE} x={-40} y={-90} width={90} height={90} style={PX} />
            <rect x={-40} y={-90} width={90} height={90} fill="none" stroke={LINE} strokeWidth={7} />
          </g>
        )} />
      </Cam>
    </g>
  );
};

/* shot 6: the temple */
const Temple: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const cols = Array.from({ length: 11 }, (_, i) => 90 + i * 90);
  return (
    <Cam z={lerp(1, 1.1, t / 32)} cx={540} cy={1000}>
      <g filter="url(#lpDof)"><Sky f={f} horizon={1150} /></g>
      <g filter="url(#lpDof)"><Mountains y={900} k={0.7} /><Haze y={900} /></g>
      <rect x={-100} y={950} width={W + 200} height={1100} fill="#5fb04a" stroke={LINE} strokeWidth={6} />
      <g stroke={LINE} strokeWidth={6} strokeLinejoin="round">
        <polygon points="60,830 540,640 1020,830" fill="#f4efe6" />
        <polygon points="130,825 540,670 950,825" fill="#e6dfd0" />
        {[[360, 770], [540, 730], [720, 770]].map(([x, y], i) => <rect key={i} x={x - 14} y={y - 20} width={28} height={36} fill="#d8b24a" />)}
        <rect x={70} y={830} width={940} height={60} fill="#f4efe6" />
        {cols.map((x, i) => <rect key={i} x={x - 22} y={890} width={44} height={240} fill="#fbf8f0" />)}
        {cols.map((x, i) => <path key={`s${i}`} d={`M${x + 4},895 V1125`} stroke="#d9d2c2" strokeWidth={8} fill="none" />)}
        <rect x={50} y={1130} width={980} height={42} fill="#f4efe6" />
        <rect x={20} y={1172} width={1040} height={42} fill="#ece6d8" />
        <rect x={-10} y={1214} width={1100} height={42} fill="#e4ddcc" />
      </g>
      <Flowers y0={1260} y1={1880} n={110} seed="tp" big={1.3} />
      {/* the two of them, small, in the flowers, looking up at it */}
      <Cap back x={200} y={1830} s={0.4} p={stand({ armL: limb(-60, 60, -80, 140), armR: limb(60, 60, 80, 140) })} face="back" idle={t} />
      <Straw back x={320} y={1850} s={0.4} p={stand({ armL: limb(-60, 60, -80, 140), armR: limb(60, 60, 80, 140) })} face="back" idle={t + 9} />
    </Cam>
  );
};

/* shot 7: the shock */
const Shock: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const jx = Math.sin(t * 5.2) * 10, jy = Math.cos(t * 4.4) * 8;
  const arms = sm(t, 0, 8);
  const p = lerpPose({ ...POSE.stand }, { ...POSE.out, armL: limb(-132, 32, -240, 30), armR: limb(132, 32, 250, 30) }, arms);
  return (
    <g>
      <MeadowBack f={f} z={1.1} />
      <Cam dx={jx} dy={jy}>
        <Straw x={560} y={2300} s={2.3} p={p} face="scream" gaze={[0, -6]} tilt={Math.sin(t * 0.9) * 3} idle={t} />
      </Cam>
    </g>
  );
};

/* shot 9: crowned in laurel: the wise one, thinking it over, in a toga */
const Crowned: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const sway = Math.sin(t * 0.05) * 3;
  return (
    <g>
      <Cam z={1.18} cx={540} cy={1000}>
        <Sky f={f} horizon={1100} />
        <Mountains y={1110} k={1.1} />
        <rect x={-100} y={1110} width={W + 200} height={900} fill="#c9a24a" />
        <rect x={-100} y={1110} width={W + 200} height={140} fill="#e6c870" />
      </Cam>
      <Cam r={sway} cx={460} cy={1500} z={lerp(1, 1.04, t / 61)}>
        <Wise x={460} y={2640} s={3.1} p={POSE.stand} face={t < 25 ? "calm" : "content"} gaze={[0, -4]} tilt={-4} idle={t} />
      </Cam>
    </g>
  );
};

/* ------------------------------- the subtitle bar ------------------------------- */

const SubBar: React.FC<{ f: number }> = ({ f }) => {
  const s = B.subs.find(([a, b]) => f >= (a as number) && f < (b as number));
  if (!s) return null;
  const text = s[2] as string;
  const size = 46;
  const w = text.length * size * 0.62 + 70;
  return (
    <g>
      <rect x={540 - w / 2} y={1380} width={w} height={84} fill="#000000" opacity={0.55} />
      <text x={540} y={1380 + 56} textAnchor="middle" fontFamily={MONO} fontSize={size} fill="#ffffff">{text}</text>
    </g>
  );
};

/* ------------------------------- assembly ------------------------------- */

const shotAt = (f: number) => {
  const c = B.cuts;
  for (let i = 0; i < c.length - 1; i++) if (f >= c[i] && f < c[i + 1]) return { i, t: f - c[i], len: c[i + 1] - c[i] };
  return { i: 8, t: 0, len: 1 };
};

const ShotBody: React.FC<{ i: number; t: number; len: number; f: number }> = ({ i, t, len, f }) => {
  switch (i) {
    case 0: return <Cave f={t} />;
    case 1: return <Mine f={t} />;
    case 2: return <Breakthrough f={t} />;
    case 3: return <SunMeadow f={f} k={lerp(1, 1.12, t / len)} drift={0} />;
    case 4: return <Hero f={t} />;
    case 5: return <Temple f={t} />;
    case 6: return <Shock f={t} />;
    case 7: return <SunMeadow f={f} k={lerp(1.15, 1.5, t / len)} drift={0} />;
    default: return <Crowned f={t} />;
  }
};

/** one shot, on its own clock, with motion blur: the shutter never straddles a cut */
const Shot: React.FC<{ i: number }> = ({ i }) => {
  const t = Math.max(0, useCurrentFrame());
  const len = B.cuts[i + 1] - B.cuts[i];
  return <Svg sun={i >= 3 ? 0.35 : 0.1}><ShotBody i={i} t={t} len={len} f={t + B.cuts[i]} /></Svg>;
};

/** hold the render until every picture is cached, so no frame is missing a sprite */
const usePreload = () => {
  const [handle] = React.useState(() => delayRender("loading the textures"));
  React.useEffect(() => {
    const urls = [ORE, STONE, PICK, ...BREAKS];
    Promise.all(urls.map((u) => new Promise<void>((r) => { const im = new window.Image(); im.onload = () => r(); im.onerror = () => r(); im.src = u; }))).then(() => continueRender(handle));
  }, [handle]);
};

export const LaPeaceShort: React.FC<{ audio?: string | null; captions?: boolean; blur?: boolean }> = ({ audio = null, captions = true, blur = true }) => {
  loadMinecraftFonts();
  usePreload();
  const f = useCurrentFrame();
  const shots = B.cuts.slice(0, -1).map((c, i) => (
    <Sequence key={i} from={c} durationInFrames={B.cuts[i + 1] - c} layout="none">
      {blur ? <CameraMotionBlur shutterAngle={180} samples={5}><Shot i={i} /></CameraMotionBlur> : <Shot i={i} />}
    </Sequence>
  ));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio && <Audio src={staticFile(audio)} />}
      {shots}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {captions && <SubBar f={f} />}
      </svg>
    </AbsoluteFill>
  );
};

export const LaPeaceThumb: React.FC = () => {
  usePreload();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Svg sun={0.35}><ShotBody i={3} t={30} len={45} f={170} /></Svg>
    </AbsoluteFill>
  );
};

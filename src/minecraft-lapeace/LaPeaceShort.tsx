import React from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, random, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../minecraft/beats";
import { ease } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { Blocky, Cube, Mood, Part, Pose, marbleBox, project, renderParts } from "./blocky";
import { HandDrawn } from "../minecraft/handdrawn";
import { Item, Pixels, Poppy } from "../minecraft/pixels";
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
const DIAMOND_ROWS = ["..DDDDD..", ".DwwCCCD.", "DwCCCCCCD", "DCCCCCCCD", ".DCCCCCD.", "..DCCCD..", "...DCD...", "....D...."];
const DIAMOND_COL = { D: "#0e6f7a", w: "#e8fffd", C: "#3df0e6" };
const PX: React.CSSProperties = { imageRendering: "pixelated" };

/* ----------------------------- the cast ----------------------------- */

/**
 * The cast: Minecraft-skin versions of the owner's two characters, built by
 * scripts/make-skins.py and drawn by ./blocky.tsx (a small 3D engine), the way the
 * reference's blocky characters are. IShowSpeed: dark locs, stubble, purple hoodie.
 * Kai Cenat: afro, full beard, green hoodie.
 */
const LAPIS = (x: number, y: number, s: number, yaw = 25, pitch = 22, size = 16) => <Cube atlas="lapis" atlasSize={640} x={x} y={y} s={s} size={size} yaw={yaw} pitch={pitch} />;

/* ----------------------------- shared scenery ----------------------------- */

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

/** the glowing treasure in the beam: a golden apple, spinning and bobbing */
const Treasure: React.FC<{ x: number; y: number; k: number; f: number }> = ({ x, y, k, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.12) * 12 * k}) scale(${k})`}>
    <circle r={150} fill="#fff6b0" opacity={0.35} />
    <circle r={95} fill="#fff6b0" opacity={0.55} />
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-5} y={-190} width={10} height={70} fill="#fff6b0" opacity={0.6} transform={`rotate(${i * 45 + f * 3})`} />
    ))}
    <Item name="goldApple" x={0} y={0} px={18} rotate={Math.sin(f * 0.08) * 10} />
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
  // the voice: DIAMOND on frames 0 and 34 (then 55, 75 in the next shot): he throws his arms up and bounces on each
  const hits = [0, 34];
  const bounce = Math.max(...hits.map((h) => (t >= h && t < h + 10 ? Math.sin(((t - h) / 10) * Math.PI) : 0)));
  const walk = sm(t, 22, 54);
  const ox = lerp(690, 820, walk), oy = lerp(1214, 1334, walk), os = lerp(12.5, 17, walk);
  const shouting = hits.some((h) => t >= h && t < h + 14);
  const stride = walk > 0 && walk < 1 ? Math.sin(t * 0.8) * 30 : 0;
  const speedPose: Pose = { armL: [0, shouting ? 155 : 40], armR: [0, shouting ? 155 : 40], bounce: bounce * 3, legL: stride, legR: -stride };
  const kaiPose: Pose = { armR: [shouting ? 20 : 95, shouting ? 40 : 8], armL: [0, shouting ? 150 : 6], bounce: shouting ? bounce * 1.5 : 0 };
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
      <Blocky who="kai" mood={shouting ? "grin" : "smile"} pose={kaiPose} x={300} y={1216} s={12.5} yaw={24} pitch={6} />
      <Blocky who="speed" mood={shouting ? "shout" : "grin"} pose={speedPose} x={ox} y={oy} s={os} yaw={-22} pitch={6} />
      {LAPIS(-20, 1520, 20, 22, 20)}
      {LAPIS(-20, 1190, 20, 22, 20)}
      <ellipse cx={540} cy={1840} rx={760} ry={230} fill="#2a5bd6" opacity={0.13} />
      {LAPIS(150, 1930, 26, 22, 24)}
      {LAPIS(610, 2010, 26, 22, 24)}
    </Cam>
  );
};

/* ------------------------------- shot 2: mining ------------------------------- */

const Mine: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const beat = (Math.sin(t * 0.46 - 1.2) + 1) / 2;
  const shout = (t >= 0 && t < 9) || (t >= 19 && t < 28);
  const pose: Pose = { armR: [lerp(60, 150, beat), 6], armL: [20, 14], bounce: beat * 1.2, legL: beat * 6, legR: -beat * 6 };
  // the floor and stair of lapis, laid out in the same camera as the character
  const view = { yaw: 168, pitch: 42, s: 15, x: 560, y: 1500 };
  const cubes: { z: number; node: React.ReactNode }[] = [];
  for (let gz = -4; gz <= 5; gz++) for (let gx = -5; gx <= 5; gx++) {
    const stairH = gx >= 1 && gz >= 0 ? Math.min(gx, gz + 1, 3) * 16 : 0;
    const [px, py] = project(view, [gx * 16, stairH, gz * 16]);
    const depth = -gz * 10 + gx;
    cubes.push({ z: depth - stairH * 0.001, node: <Cube key={`${gx}_${gz}`} atlas="lapis" atlasSize={640} x={px} y={py} s={view.s} size={16} yaw={view.yaw} pitch={view.pitch} /> });
  }
  cubes.sort((a, b) => b.z - a.z);
  return (
    <Cam z={lerp(1.04, 1, t / 44)} dx={Math.sin(t * 0.8) * 4}>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#0c0c2a" />
      {cubes.map((c) => c.node)}
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#1a2cff" opacity={0.18} />
      <Blocky who="speed" mood={shout ? "shout" : "grin"} pose={pose} x={330} y={1760} s={26} yaw={172} pitch={34}
        extra={(h) => (
          <g transform={`translate(${h.R[0]} ${h.R[1]}) rotate(${lerp(-35, 40, beat)}) scale(2.1) translate(-70 -310)`}>
            <image href={PICK} x={0} y={0} width={360} height={360} style={PX} />
          </g>
        )} />
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
    <Sky f={f} horizon={1300} />
    <Beam x0={500} x1={1020} tx={540} ty={960} />
    <Mountains y={1180} k={2} />
    <Meadow y={1170} />
    <Treasure x={540} y={960} k={1} f={f} />
  </Cam>
);

const MeadowBack: React.FC<{ f: number; z?: number; dx?: number }> = ({ f, z = 1, dx = 0 }) => (
  <Cam z={z} cx={540} cy={1000} dx={dx}>
    <Sky f={f} horizon={1100} />
    <Mountains y={1060} k={1.7} />
    <Meadow y={1050} riverX={230} />
  </Cam>
);

/* shot 5: he meets the meadow, a diamond in his raised fist */
const Hero: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const turn = sm(t, 28, 40);
  const hype = [t - 22, t - 5].map((d) => (d >= 0 && d < 12 ? Math.sin((d / 12) * Math.PI) : 0));
  const mood: Mood = t < 24 ? "shock" : "shout";
  const pose: Pose = { armL: [30, lerp(110, 150, turn)], armR: [0, lerp(40, 150, turn)], head: [0, lerp(8, -4, turn), 0], bounce: Math.max(...hype) * 2 };
  return (
    <g>
      <MeadowBack f={f} z={lerp(1, 1.06, t / 65)} />
      <g>
        {[[120, 1560], [60, 1700], [240, 1830]].map(([x, y], i) => <Poppy key={i} x={x} y={y} px={26} />)}
      </g>
      <Cam z={1} dx={lerp(0, -20, turn)}>
        <Blocky who="speed" mood={mood} pose={pose} x={650} y={2330} s={31} yaw={lerp(-30, -12, turn)} pitch={-6} roll={Math.sin(t * 0.12) * 2}
          extra={(h) => <g transform={`translate(${h.L[0]} ${h.L[1] - 30})`}>{LAPIS(0, 50, 7, 20, 20, 16)}</g>} />
      </Cam>
    </g>
  );
};

/* shot 6: the temple, built from marble boxes and seen at three-quarters like the reference */
const Temple: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const view = { yaw: -30, pitch: 8, s: lerp(11, 12.2, t / 32), x: 560, y: 1380 };
  const parts: Part[] = [
    marbleBox([-36, 0, -16, 36, 2, 16]),
    marbleBox([-34, 2, -14, 34, 4, 14]),
    marbleBox([-32, 4, -12, 32, 6, 12]),
  ];
  // the colonnade: eight along the front, nine down the long side, with the cella wall behind
  for (let i = 0; i < 8; i++) parts.push(marbleBox([-30 + i * 8.4 - 1.5, 6, 10 - 1.5, -30 + i * 8.4 + 1.5, 28, 10 + 1.5]));
  for (let j = 0; j < 9; j++) parts.push(marbleBox([28.8 - 1.5, 6, -10 + j * 2.5 * 1.0 + 0 - 1.5, 28.8 + 1.5, 28, -10 + j * 2.5 + 1.5]));
  parts.push(marbleBox([-24, 6, -8, 24, 26, 8]));
  parts.push(marbleBox([-32, 28, -12.5, 32, 31, 12.5]));
  parts.push(marbleBox([-33, 31, -13, 33, 32.4, 13]));
  const pedi = [project(view, [-32, 32.4, 13]), project(view, [32, 32.4, 13]), project(view, [0, 40.5, 13])];
  return (
    <Cam z={lerp(1, 1.1, t / 32)} cx={540} cy={1000}>
      <Sky f={f} horizon={1150} />
      <Mountains y={1000} k={0.9} />
      <Meadow y={980} riverX={800} />
      {renderParts(parts, view, "temple")}
      <polygon points={pedi.map((p) => p.join(",")).join(" ")} fill="#efe8d8" stroke="#8a8272" strokeWidth={4} />
      {[0.25, 0.5, 0.75].map((u, i) => <rect key={i} x={lerp(pedi[0][0], pedi[1][0], u) - 8} y={lerp(pedi[0][1], pedi[1][1], u) - 36 - Math.sin(u * Math.PI) * 20} width={16} height={26} fill="#d8b24a" />)}
      <Flowers y0={1300} y1={1900} n={90} seed="tp" big={1.8} />
      <Blocky who="speed" mood="plain" pose={{ armL: [0, 20], armR: [0, 20] }} x={170} y={1830} s={7.5} yaw={186} pitch={14} />
      <Blocky who="kai" mood="plain" pose={{ armL: [0, 12], armR: [0, 12] }} x={262} y={1846} s={7.5} yaw={176} pitch={14} />
    </Cam>
  );
};

/* shot 7: the shock */
const Shock: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const jx = Math.sin(t * 5.2) * 10, jy = Math.cos(t * 4.4) * 8;
  return (
    <g>
      <MeadowBack f={f} z={1.1} />
      <Cam dx={jx} dy={jy}>
        <Blocky who="speed" mood="shock" pose={{ armL: [0, 120 + Math.sin(t * 0.9) * 14], armR: [0, 120 - Math.sin(t * 0.9) * 14], head: [0, 0, Math.sin(t * 0.9) * 4] }} x={560} y={2520} s={44} yaw={-8} pitch={-4} />
      </Cam>
    </g>
  );
};

/* shot 9: crowned in laurel — Kai, thinking it over, in a toga */
const Crowned: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  return (
    <g>
      <Cam z={1.18} cx={540} cy={1000}>
        <Sky f={f} horizon={1100} />
        <Mountains y={1110} k={1.1} />
        <rect x={-100} y={1110} width={W + 200} height={900} fill="#c9a24a" />
        <rect x={-100} y={1110} width={W + 200} height={140} fill="#e6c870" />
      </Cam>
      <Cam r={Math.sin(t * 0.05) * 1.5} cx={440} cy={1500} z={lerp(1, 1.04, t / 61)}>
        <Blocky who="kai" mood={t < 25 ? "calm" : "smile"} outfit={{ toga: true, laurel: true }} pose={{ armR: [30, 10], armL: [0, 8], head: [0, 0, 0] }} x={480} y={2640} s={46} yaw={26} pitch={-12} />
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

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const { i, t, len } = shotAt(f);
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

/** hold the render until every picture is cached, so no frame is missing a sprite */
const usePreload = () => {
  const [handle] = React.useState(() => delayRender("loading the characters"));
  React.useEffect(() => {
    const urls = [ORE, STONE, PICK, ...BREAKS, ...["speed", "kai", "speed-hair", "kai-hair", "lapis", "toga", "leaf", "marble"].map((n) => staticFile(`images/skins/${n}.png`))];
    Promise.all(urls.map((u) => new Promise<void>((r) => { const im = new window.Image(); im.onload = () => r(); im.onerror = () => r(); im.src = u; }))).then(() => continueRender(handle));
  }, [handle]);
};

export const LaPeaceShort: React.FC<{ audio?: string | null; drawn?: boolean; captions?: boolean }> = ({ audio = null, drawn = true, captions = true }) => {
  loadMinecraftFonts();
  usePreload();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio && <Audio src={staticFile(audio)} />}
      <HandDrawn enabled={drawn} hold={1} boilEvery={2} boil={0.75} grain={0}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs><clipPath id="lpAll"><rect x={0} y={0} width={W} height={H} /></clipPath></defs>
          <g clipPath="url(#lpAll)"><Scene f={f} /></g>
        </svg>
      </HandDrawn>
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
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <Scene f={150} />
    </svg>
  </AbsoluteFill>
);
};

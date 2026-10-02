import React from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, random, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../minecraft/beats";
import { ease } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { Blocky, Cube, Mood, Pose } from "./blocky";
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

const Sky: React.FC<{ f: number; horizon: number; top?: string; bottom?: string }> = ({ f, horizon, top = "#3d93ff", bottom = "#bfe4ff" }) => (
  <g>
    <defs>
      <linearGradient id={`sky${top}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient>
    </defs>
    <rect x={-100} y={-100} width={W + 200} height={horizon + 100} fill={`url(#sky${top})`} />
    {cloudRects.map((c, i) => (
      <rect key={i} x={((c.x + f * c.v * 2) % 1500) - 300} y={c.y} width={c.w} height={c.h} fill="#ffffff" opacity={0.72} transform={`skewX(-30)`} />
    ))}
  </g>
);

const Mountains: React.FC<{ y: number; k?: number }> = ({ y, k = 1 }) => {
  const pts: [number, number][] = [[-100, 0], [60, -150], [160, -150], [240, -250], [380, -250], [470, -330], [600, -330], [680, -230], [800, -270], [900, -180], [1020, -230], [1180, -120], [1180, 0]];
  const d = "M" + pts.map(([x, h]) => `${x},${y + h * k}`).join(" L") + ` L1180,${y + 40} L-100,${y + 40} Z`;
  const snow = "M" + pts.map(([x, h]) => `${x},${y + h * k}`).join(" L") + ` L1180,${y - 60 * k} ` + [...pts].reverse().map(([x, h]) => `L${x},${y + h * k * 0.55}`).join(" ") + " Z";
  return (
    <g stroke={LINE} strokeWidth={6} strokeLinejoin="round">
      <path d={d} fill="#8d99ad" />
      <path d={snow} fill="#ffffff" stroke="none" opacity={0.95} />
      <path d={d} fill="none" />
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

const Meadow: React.FC<{ y: number; riverX?: number }> = ({ y, riverX = 380 }) => (
  <g>
    <rect x={-100} y={y} width={W + 200} height={H - y + 100} fill="#5fb04a" stroke={LINE} strokeWidth={6} />
    <rect x={-100} y={y} width={W + 200} height={110} fill="#79c85a" />
    <path d={`M${riverX},${y + 20} C${riverX - 120},${y + 220} ${riverX + 260},${y + 380} ${riverX - 80},${y + 640} S${riverX - 200},${y + 900} ${riverX - 300},${H}`} fill="none" stroke="#3f76e4" strokeWidth={70} strokeLinecap="round" />
    <path d={`M${riverX},${y + 20} C${riverX - 120},${y + 220} ${riverX + 260},${y + 380} ${riverX - 80},${y + 640} S${riverX - 200},${y + 900} ${riverX - 300},${H}`} fill="none" stroke="#9cc2ff" strokeWidth={14} strokeLinecap="round" opacity={0.7} />
    <Flowers y0={y + 80} y1={H + 40} n={90} seed="mf" big={2.2} />
  </g>
);

const Beam: React.FC<{ x0: number; x1: number; tx: number; ty: number; o?: number }> = ({ x0, x1, tx, ty, o = 1 }) => (
  <g opacity={o}>
    <defs>
      <linearGradient id="beamg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6b0" stopOpacity={0.4} /><stop offset="0.7" stopColor="#fff2a0" stopOpacity={0.85} /><stop offset="1" stopColor="#fff2a0" stopOpacity={1} /></linearGradient>
    </defs>
    <polygon points={`${x0},-100 ${x1},-100 ${tx + 120},${ty + 80} ${tx - 120},${ty + 80}`} fill="url(#beamg)" />
    <polygon points={`${x0 + 140},-100 ${x1 - 90},-100 ${tx + 60},${ty + 60} ${tx - 60},${ty + 60}`} fill="#ffffff" opacity={0.25} />
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

const LAVA = ["#e8441c", "#f06a1a", "#b52a14", "#ff8a24"];
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
  return (
    <Cam z={lerp(1.04, 1, t / 44)} dx={Math.sin(t * 0.8) * 4}>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#15153a" />
      {[[840, 1010, 12], [900, 1300, 15], [760, 1560, 17], [980, 1800, 19]].map(([x, y, sc], i) => <g key={i} opacity={0.9}>{LAPIS(x, y, sc, 168, 30)}</g>)}
      {[0, 1, 2, 3, 4].map((i) => <g key={i}>{LAPIS(-50 + i * 270, 1960 + (i % 2) * 40, 17, 168, 30)}</g>)}
      <rect x={-100} y={900} width={W + 200} height={1100} fill="#0a0a30" opacity={0.3} />
      <Blocky who="speed" mood={shout ? "shout" : "grin"} pose={pose} x={400} y={1760} s={23} yaw={172} pitch={30}
        extra={(h) => (
          <g transform={`translate(${h.R[0]} ${h.R[1]}) rotate(${lerp(-35, 40, beat)}) scale(1.9) translate(-70 -310)`}>
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

/* shot 6: the temple */
const Temple: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const cols = Array.from({ length: 11 }, (_, i) => 90 + i * 90);
  return (
    <Cam z={lerp(1, 1.1, t / 32)} cx={540} cy={1000}>
      <Sky f={f} horizon={1150} />
      <Mountains y={900} k={0.7} />
      <rect x={-100} y={950} width={W + 200} height={1100} fill="#5fb04a" stroke={LINE} strokeWidth={6} />
      {/* the temple */}
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
      <Blocky who="speed" mood="plain" pose={{ armL: [0, 20], armR: [0, 20] }} x={170} y={1830} s={7.5} yaw={186} pitch={14} />
      <Blocky who="kai" mood="plain" pose={{ armL: [0, 12], armR: [0, 12] }} x={262} y={1846} s={7.5} yaw={176} pitch={14} />
      {[[140, 1560], [880, 1700]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} stroke={LINE} strokeWidth={5}>
          <rect x={-40} y={-80} width={80} height={90} fill="#3a2f5a" />
          <rect x={-60} y={-40} width={120} height={60} fill="#4d3d7a" />
        </g>
      ))}
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
    const urls = [ORE, STONE, PICK, ...BREAKS, ...["speed", "kai", "speed-hair", "kai-hair", "lapis", "toga", "leaf"].map((n) => staticFile(`images/skins/${n}.png`))];
    Promise.all(urls.map((u) => new Promise<void>((r) => { const im = new window.Image(); im.onload = () => r(); im.onerror = () => r(); im.src = u; }))).then(() => continueRender(handle));
  }, [handle]);
};

export const LaPeaceShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
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

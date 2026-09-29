import { noise2D } from "@remotion/noise";
import React from "react";
import { AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { EV, H, PANEL_TOP, SHOT, W } from "../minecraft/beats";
import { ease, FaceKind, lerpPose, limb, Pose, pose, POSE, Pt, walkPose } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { HandDrawn } from "../minecraft/handdrawn";
import { Fireball, Ghast } from "../minecraft/mobs";
import { NetherPortal, NetherWorld } from "../minecraft/nether";
import { Oofy, OofyTint, OOFY_TINT } from "../minecraft/oofy";
import { Item, ItemName, Puff } from "../minecraft/pixels";
import { LavaLake, Overworld, OverworldProps } from "../minecraft/worlds";
import { Room } from "../minecraft-sleep/SleepShort";

/**
 * "Dying in the Nether with your best gear" — 17 seconds, starring Oofy.
 *
 * Built on the audio of GarrettTheCarrot's "Losing your stuff in Minecraft",
 * so every cut and sound cue sits on the frame it does in that video
 * (minecraft/beats.ts) — but the picture is its own story: a ghast fireball
 * in the Nether instead of a creeper, a respawn in his bedroom, a map, a
 * portal, a strider across the lava, a piglin who pays him in cobblestone, and
 * an item-despawn countdown you can watch running out.
 */

export const LOSE2_FRAMES = 506;
export const LOSE2_CAPTION = ["POV: you died in the", "Nether with your gear:"];

const LINE = "#2a1b3d";
const GROUND = 1500;
const WARM: OofyTint = { ...OOFY_TINT.normal, skin: "#fff0e4", hoodie: "#9a62f2" };
const MONO = "Monocraft, monospace";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const inRange = (f: number, [a, b]: readonly [number, number]) => f >= a && f < b;

/** Oofy standing with his feet on (x, y); `s` is his scale */
const Guy: React.FC<{
  x: number; y: number; s: number; p: Pose; face: FaceKind; tint?: OofyTint; rot?: number; flip?: boolean; tilt?: number;
  look?: Pt; gaze?: Pt; armsOverHead?: boolean; hands?: (h: { L: Pt; R: Pt }) => React.ReactNode; shadow?: boolean;
}> = ({ x, y, s, p, face, tint = WARM, rot = 0, flip, tilt, look, gaze = [0, 0], armsOverHead, hands, shadow = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <Oofy x={0} y={-335 * s} scale={s} pose={p} face={face} tint={tint} flip={flip} tilt={tilt} look={look} faceOffset={gaze} armsOverHead={armsOverHead} hands={hands} shadow={shadow} />
  </g>
);

/** the pile of everything he owned, lying where he died */
const PILE: { name: ItemName; x: number; y: number; rot: number }[] = [
  { name: "cobble", x: 135, y: 1500, rot: 0 },
  { name: "pickaxe", x: 240, y: 1590, rot: 8 },
  { name: "goldIngot", x: 400, y: 1545, rot: -8 },
  { name: "goldApple", x: 500, y: 1490, rot: 0 },
  { name: "bread", x: 570, y: 1590, rot: -22 },
  { name: "bucket", x: 685, y: 1480, rot: 0 },
  { name: "redstone", x: 840, y: 1510, rot: 0 },
  { name: "ironIngot", x: 940, y: 1580, rot: -12 },
];

const Poof: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 30 }) =>
  t < 0 || t > 1 ? null : (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Puff key={i} x={x + Math.cos(i * 1.05) * t * 90} y={y + Math.sin(i * 1.7) * t * 70 - t * 50} r={r * (1 - t * 0.7)} opacity={1 - t} />
      ))}
    </g>
  );

/* -------------------- 1. the ghast (0–17) -------------------- */

const GhastShot: React.FC<{ f: number }> = ({ f }) => {
  const boom = f >= EV.explosion;
  const t = f - EV.explosion;
  const fly = boom ? clamp01(t / (EV.landed - EV.explosion)) : 0;
  const gone = f >= EV.bodyGone;
  // he is blown up and back, spinning, and lands on his back
  // the spin is about his middle, so he tumbles through the air and ends flat on his back
  const x = boom ? 520 - 300 * fly : 520;
  const cy = boom ? lerp(GROUND - 200, GROUND - 60, fly) - Math.sin(fly * Math.PI) * 330 : GROUND - 200;
  const rot = boom ? -fly * 450 : 0;
  const mining = f < EV.explosion;
  const p = mining ? pose({ armR: limb(76, -30, 14, -170) }) : POSE.spread;
  const tint = boom ? OOFY_TINT.hurt : WARM;
  const t2 = clamp01(f / EV.explosion);
  return (
    <g>
      <NetherWorld t={f} />
      <Ghast x={900} y={760} scale={0.62} angry charging bob={f * 0.2} />
      {f < EV.explosion + 1 && <Fireball x0={830} y0={790} x1={560} y1={GROUND - 300} t={t2} />}
      {!gone && (
        <g transform={`translate(${x} ${cy}) rotate(${rot})`}>
          <Guy x={0} y={200} s={1.35} p={p} face={boom ? "hurt" : "plain"} tint={tint}
            hands={({ R }) => (mining ? <Item name="pickaxe" x={R[0] + 40} y={R[1] - 30} px={9} rotate={-20} /> : null)} />
        </g>
      )}
      {/* the blast */}
      {boom && t < 8 && (
        <g>
          <circle cx={560} cy={GROUND - 300} r={40 + t * 60} fill="#ffe08a" opacity={1 - t / 8} />
          <circle cx={560} cy={GROUND - 300} r={20 + t * 46} fill="#ff8a2a" opacity={0.9 - t / 8} />
          <circle cx={560} cy={GROUND - 300} r={70 + t * 96} fill="none" stroke="#ffffff" strokeWidth={10} opacity={0.8 - t / 8} />
        </g>
      )}
      {/* everything he owned, flying out and settling */}
      {boom && PILE.map((it, i) => {
        const k = clamp01(t / (EV.landed - EV.explosion + 2));
        const ix = lerp(560, it.x, k), iy = lerp(GROUND - 300, it.y, k) - Math.sin(k * Math.PI) * (160 + i * 30);
        return <Item key={it.name} name={it.name} x={ix} y={iy} px={11} rotate={it.rot + (1 - k) * 200} />;
      })}
      <Poof x={230} y={GROUND - 60} t={(f - EV.bodyGone) / 8} r={36} />
    </g>
  );
};

/* -------------------- 2. respawn in the bedroom (17–147) -------------------- */

type Beat = { at: number; face: FaceKind; arms?: "spread" | "down" | "chin" | "chinL" | "open"; walk?: boolean; look?: Pt };
const BEATS: Beat[] = [
  { at: 19, face: "worried", arms: "spread" },
  { at: 28, face: "gritted", arms: "spread" },
  { at: 34, face: "smile", arms: "chin", walk: true },
  { at: 41, face: "smile", arms: "down", walk: true },
  { at: 46, face: "joy", arms: "open", walk: true },
  { at: 58, face: "happy", arms: "down", walk: true },
  { at: 65, face: "whistle", arms: "down", walk: true, look: [0, -6] },
  { at: 70, face: "joy", arms: "chin" },
  { at: 80, face: "joy", arms: "open", walk: true },
  { at: 90, face: "sly", arms: "open", walk: true },
  { at: 95, face: "whistle", arms: "down", walk: true, look: [4, -6] },
  { at: 103, face: "sly", arms: "down", walk: true },
  { at: 109, face: "whistle", arms: "down", walk: true, look: [-4, -6] },
  { at: 114, face: "sly", arms: "chin" },
  { at: 122, face: "surprised", arms: "down", look: [0, -8] },
  { at: 126, face: "worried", arms: "down" },
  { at: 130, face: "worried", arms: "chinL" },
  { at: 138, face: "gritted", arms: "down" },
];
const beatAt = (f: number) => BEATS.reduce((c, b) => (f >= b.at ? b : c), BEATS[0]);
const armsFor = (k: Beat["arms"]): Pose => {
  switch (k) {
    case "spread": return POSE.spread;
    case "chin": return POSE.chin;
    case "chinL": return POSE.chinL;
    case "open": return pose({ armL: limb(-130, 60, -200, 110), armR: limb(130, 60, 200, 110) });
    default: return POSE.stand;
  }
};

const roomX = (f: number) => interpolate(f, [19, 34, 58, 70, 90, 110, 122, 146], [660, 560, 400, 440, 640, 480, 430, 470], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const RespawnShot: React.FC<{ f: number }> = ({ f }) => {
  const b = beatAt(f);
  const x = roomX(f), x1 = roomX(f + 1);
  const walking = b.walk === true;
  const flip = x1 < x - 0.5;
  const pop = interpolate(f, [EV.respawn, EV.respawn + 3], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const base = armsFor(b.arms);
  const p = walking ? walkPose(f / 9, 46, base, b.arms === "down") : base;
  const bob = walking ? Math.abs(Math.sin(f / 9 * Math.PI * 2)) * 8 : 0;
  return (
    <g>
      <Room f={0} doorOpen={0} />
      {f >= EV.respawn && (
        <Guy x={x} y={GROUND - bob} s={1.05 * pop} p={p} face={b.face} flip={flip} look={b.look} armsOverHead={b.arms === "chin" || b.arms === "chinL"} />
      )}
      {f >= EV.respawn && f < EV.respawn + 8 && (
        <Poof x={x} y={GROUND - 200} t={(f - EV.respawn) / 8} r={26} />
      )}
    </g>
  );
};

/* -------------------- 3. the map (147–175) -------------------- */

const TERRAIN = ["#5f9a4a", "#6aa955", "#4f8a3f", "#d6c48a", "#4a78c8", "#8a8a8a"];
const MapShot: React.FC<{ f: number }> = ({ f }) => {
  const l = f - SHOT.aerial[0];
  const k = ease(f, SHOT.aerial[0] + 2, SHOT.aerial[1] - 2);
  const start: Pt = [250, 1560], death: Pt = [770, 800];
  const pos: Pt = [lerp(start[0], death[0], k * 0.62), lerp(start[1], death[1], k * 0.62)];
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#3a2a1e" />
      <rect x={70} y={560} width={940} height={1160} fill="#e7d5a5" stroke={LINE} strokeWidth={12} />
      <rect x={100} y={590} width={880} height={1100} fill="#d1bd8a" />
      {Array.from({ length: 11 }, (_, r) => Array.from({ length: 9 }, (_, c) => {
        const n = noise2D("map", c * 0.45, r * 0.45);
        const t = n > 0.42 ? 5 : n > 0.18 ? 3 : n < -0.35 ? 4 : Math.floor(random(`mc${r}${c}`) * 3);
        return <rect key={`${r}-${c}`} x={100 + c * 97.7} y={590 + r * 100} width={98} height={101} fill={TERRAIN[t]} />;
      }))}
      <path d={`M${start[0]},${start[1]} L${death[0]},${death[1]}`} stroke="#ffffff" strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" opacity={0.8} />
      {/* the X where it all is */}
      <g stroke="#d3212b" strokeWidth={22} strokeLinecap="round" transform={`translate(${death[0]} ${death[1]}) scale(${1 + 0.12 * Math.sin(l * 0.8)})`}>
        <path d="M-46,-46 L46,46 M46,-46 L-46,46" />
      </g>
      {/* you are here */}
      <g transform={`translate(${pos[0]} ${pos[1]}) rotate(${(Math.atan2(death[1] - start[1], death[0] - start[0]) * 180) / Math.PI + 90})`}>
        <path d="M0,-34 L24,26 L0,12 L-24,26 Z" fill="#ffffff" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
      </g>
      <rect x={70} y={PANEL_TOP + 10} width={940} height={110} fill="#00000088" />
      <text x={540} y={PANEL_TOP + 84} textAnchor="middle" fontFamily={MONO} fontSize={44} fill="#ffffff">Death: X -214  Z 388</text>
    </g>
  );
};

/* -------------------- 4. the portal (175–195) -------------------- */

const PortalShot: React.FC<{ f: number }> = ({ f }) => {
  const l = f - SHOT.tunnel[0];
  const step = ease(f, SHOT.tunnel[0] + 6, SHOT.tunnel[1] - 1);
  const x = lerp(210, 640, step);
  const p = l < 6 ? POSE.stand : walkPose(l / 6, 40, POSE.stand, true);
  const vanish = clamp01((l - 15) / 4);
  return (
    <g>
      <Overworld pan={0} />
      <NetherPortal x={760} y={GROUND + 60} scale={1.15} lit={1} t={f} />
      {vanish < 1 && (
        <Guy x={x} y={GROUND + 60} s={0.95 * (1 - vanish * 0.4)} p={p} face={l < 8 ? "worried" : "gritted"} shadow />
      )}
    </g>
  );
};

/* -------------------- 5. the fortress corridor (195–221) -------------------- */

const FortressShot: React.FC<{ f: number }> = ({ f }) => {
  const l = f - SHOT.darkRoom[0];
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#241014" />
      {Array.from({ length: 13 }, (_, r) => Array.from({ length: 6 }, (_, c) => (
        <rect key={`${r}-${c}`} x={-90 + c * 200 + (r % 2) * 100} y={PANEL_TOP + r * 118} width={196} height={114} fill={random(`nb${r}${c}`) > 0.85 ? "#3d1a20" : "#33151a"} stroke="#1b0a0d" strokeWidth={7} />
      )))}
      <rect x={200} y={700} width={680} height={900} fill="#120709" stroke="#0a0304" strokeWidth={12} />
      <path d="M200,700 Q540,540 880,700" fill="#33151a" stroke="#0a0304" strokeWidth={12} />
      <rect x={0} y={1500} width={W} height={420} fill="#4a1c22" stroke="#1b0a0d" strokeWidth={10} />
      <rect x={0} y={1650} width={W} height={270} fill="#ff8a2a" opacity={0.55} />
      <Guy x={540} y={1560} s={1.25} p={POSE.chin} face="thinking" armsOverHead look={[Math.sin(l / 5) * 4, -3]} shadow />
    </g>
  );
};

/* -------------------- 6. the strider (221–254) -------------------- */

const Strider: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`} stroke={LINE} strokeWidth={9} strokeLinejoin="round">
    {[-90, 90].map((lx, i) => <rect key={i} x={lx - 12} y={20} width={24} height={110 + Math.sin(t / 5 + i * 2) * 10} fill="#7a1f1f" />)}
    {[-30, 130].map((lx, i) => <rect key={`b${i}`} x={lx - 12} y={20} width={24} height={90 + Math.sin(t / 5 + i * 3 + 1) * 10} fill="#8f2626" />)}
    <rect x={-170} y={-80} width={340} height={130} rx={26} fill="#c0392b" />
    <rect x={-150} y={-70} width={300} height={40} rx={16} fill="#d9574a" stroke="none" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-150 + i * 37},-84 q${Math.sin(t / 4 + i) * 8},-44 ${Math.sin(t / 6 + i) * 10},-70`} stroke="#e8b06a" strokeWidth={8} fill="none" strokeLinecap="round" />)}
    <rect x={130} y={-40} width={52} height={70} rx={10} fill="#a5301f" />
    <circle cx={160} cy={-16} r={9} fill="#141414" stroke="none" />
  </g>
);

const StriderShot: React.FC<{ f: number }> = ({ f }) => {
  const l = f - SHOT.lava[0];
  const drift = l * 1.1;
  const bobY = Math.sin(l / 6) * 5;
  const SIT = pose({ head: [0, -96], legL: limb(-118, 34, -78, 84), legR: limb(118, 34, 78, 84), armL: limb(-136, 54, -122, 36), armR: limb(28, 96, -104, 44) });
  return (
    <g>
      <LavaLake t={l} />
      <Strider x={620 + drift} y={1440 + bobY} t={l} />
      <Guy x={600 + drift} y={1480 + bobY + 30} s={1.5} p={SIT} face="scheming" tint={OOFY_TINT.warm} look={[Math.sin(l / 5) * 6, 0]} gaze={[0, -6]} />
    </g>
  );
};

/* -------------------- 7. the dark and the eyes (254–289) -------------------- */

const EYES = [
  { x: 235, y: 640, at: EV.eyesA, rot: -8 },
  { x: 560, y: 540, at: EV.eyesB, rot: 6 },
  { x: 880, y: 620, at: EV.eyesC, rot: -5 },
  { x: 540, y: 730, at: EV.eyesD, rot: 4 },
];
/** a pair of Enderman eyes: hot purple slits in the black */
const EnderEyes: React.FC<{ x: number; y: number; rot: number; o: number }> = ({ x, y, rot, o }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    {[-52, 52].map((ex) => (
      <g key={ex}>
        <rect x={ex - 36} y={-13} width={72} height={26} fill="#d94bff" />
        <rect x={ex - 12} y={-13} width={24} height={26} fill="#ffe6ff" />
      </g>
    ))}
  </g>
);

const DarkShot: React.FC<{ f: number }> = ({ f }) => {
  const l = f - SHOT.torch[0];
  const leave = Math.max(0, f - EV.leaveTorch);
  const nx = 920 + leave * leave * 80;
  const light = interpolate(f, [EV.torchOut, EV.torchOut + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const armL = limb(-110, 40 + Math.sin(l / 4) * 2, -150, -17 + Math.sin(l / 4) * 3);
  const p = pose({ armL });
  const s = 3.2;
  const hand: Pt = [Math.min(nx, 920) + armL[1][0] * s + leave * 120, 1685 + armL[1][1] * s];
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#050208" />
      <circle cx={hand[0] - 30} cy={hand[1] - 300} r={860} fill="#5a3a1a" opacity={0.55 * light} />
      <circle cx={hand[0] - 30} cy={hand[1] - 300} r={520} fill="#8a6a32" opacity={0.45 * light} />
      {EYES.map((e, i) => {
        const o = interpolate(f, [e.at, e.at + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return o > 0 ? <EnderEyes key={i} x={e.x} y={e.y} rot={e.rot} o={o} /> : null;
      })}
      {nx < 1600 && <Guy x={nx} y={1685 + 335 * s} s={s} p={p} face="crying" tint={OOFY_TINT.warm} tilt={-4} gaze={[-14, -2]} />}
      {hand[0] < 1300 && (
        <g transform={`translate(${hand[0] - 30} ${hand[1] - 170}) rotate(-12)`}>
          <rect x={-14} y={0} width={28} height={130} fill="#8a5a2a" stroke="#141414" strokeWidth={8} />
          <rect x={-22} y={-46} width={44} height={56} fill="#ffb02e" stroke="#141414" strokeWidth={8} />
          <rect x={-10} y={-32} width={20} height={30} fill="#fff1a8" />
        </g>
      )}
    </g>
  );
};

/* -------------------- 8. the piglin (289–333) -------------------- */

const Piglin: React.FC<{ x: number; y: number; scale?: number; jiggle?: number; spit?: boolean }> = ({ x, y, scale = 1, jiggle = 0, spit }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${jiggle})`} stroke="#141414" strokeWidth={9} strokeLinejoin="round">
    <rect x={-40} y={150} width={36} height={80} fill="#6b4a2a" />
    <rect x={4} y={150} width={36} height={80} fill="#6b4a2a" />
    <rect x={-46} y={40} width={92} height={116} rx={6} fill="#c98a5e" />
    <rect x={-46} y={118} width={92} height={40} fill="#e0b040" />
    <rect x={-112} y={56} width={68} height={28} rx={6} fill="#e6a1a1" transform="rotate(-10 -78 70)" />
    <rect x={40} y={56} width={68} height={28} rx={6} fill="#e6a1a1" transform="rotate(10 74 70)" />
    <rect x={-72} y={-44} width={30} height={64} rx={8} fill="#d4787f" transform="rotate(20 -57 -12)" />
    <rect x={42} y={-44} width={30} height={64} rx={8} fill="#d4787f" transform="rotate(-20 57 -12)" />
    <rect x={-52} y={-60} width={104} height={100} rx={8} fill="#e6a1a1" />
    <rect x={-28} y={-14} width={56} height={40} rx={6} fill="#d4787f" />
    <rect x={-16} y={-4} width={10} height={16} fill="#141414" stroke="none" />
    <rect x={6} y={-4} width={10} height={16} fill="#141414" stroke="none" />
    <rect x={-40} y={-38} width={18} height={14} fill="#141414" stroke="none" />
    <rect x={22} y={-38} width={18} height={14} fill="#141414" stroke="none" />
    <path d="M-20,30 l-4,10 M20,30 l4,10" stroke="#fff" strokeWidth={8} />
    {spit && <ellipse cx={0} cy={26} rx={10} ry={6} fill="#141414" stroke="none" />}
  </g>
);

const PiglinShot: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SHOT.house;
  const l = f - a;
  const give = ease(f, a + 4, a + 12);
  const spitT = clamp01((f - 313) / 8);
  const hopeful = f >= EV.houseGrin - 2 && f < EV.houseMeh;
  const face: FaceKind = f < EV.houseGrin - 2 ? "smile" : f < EV.houseMeh ? "grin" : "meh";
  const jig = f >= a + 12 && f < 313 ? Math.sin(l * 1.7) * 5 : 0;
  const px = 780, ox = 320;
  const holdingIngot = f < a + 12;
  const p = f < a + 4 ? lerpPose(POSE.stand, POSE.showOff, ease(f, a, a + 4)) : POSE.stand;
  const pocket = ease(f, 326, 331);
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#1d1013" />
      {Array.from({ length: 12 }, (_, r) => Array.from({ length: 6 }, (_, c) => (
        <rect key={`${r}-${c}`} x={-60 + c * 200 + (r % 2) * 100} y={PANEL_TOP + r * 112} width={196} height={108} fill={random(`pb${r}${c}`) > 0.8 ? "#2c1518" : "#26120f"} stroke="#150a0b" strokeWidth={7} />
      )))}
      <rect x={880} y={1010} width={150} height={150} fill="#f4c542" stroke={LINE} strokeWidth={9} />
      <rect x={30} y={1240} width={150} height={150} fill="#f4c542" stroke={LINE} strokeWidth={9} />
      <rect x={0} y={1560} width={W} height={360} fill="#3d1a1e" stroke="#150a0b" strokeWidth={10} />
      <Guy x={ox} y={1580} s={1.25} p={p} face={face} shadow
        hands={({ R }) => (holdingIngot ? <Item name="goldIngot" x={R[0] + 20} y={R[1] - 50} px={7} rotate={-8} /> : f >= 316 && f < 331 ? <Item name="cobble" x={R[0] + 20} y={R[1] - 40} px={7} opacity={1 - pocket} /> : null)} />
      <Piglin x={px} y={1580 - 230} scale={1.15} jiggle={jig} spit={f >= 313 && f < 318} />
      {/* the ingot travels across */}
      {f >= a + 4 && f < a + 14 && <Item name="goldIngot" x={lerp(ox + 130, px - 60, give)} y={1300 - Math.sin(give * Math.PI) * 120} px={7} rotate={give * 240} />}
      {/* …and the payment comes flying back */}
      {f >= 313 && f < 321 && <Item name="cobble" x={lerp(px - 60, ox + 150, spitT)} y={1330 - Math.sin(spitT * Math.PI) * 150} px={7} rotate={spitT * -200} />}
      {f >= a + 14 && f < 313 && (
        <g fill="#fff" stroke={LINE} strokeWidth={5}>
          {[0, 1, 2].map((i) => <circle key={i} cx={720 + i * 40} cy={1000} r={10 + (Math.floor(l / 4) % 3 === i ? 8 : 0)} />)}
        </g>
      )}
    </g>
  );
};

/* -------------------- 9. the close-up (333–351) -------------------- */

const CloseShot: React.FC<{ f: number }> = ({ f }) => {
  const l = f - SHOT.closeup[0];
  const p = pose({ armR: limb(110, 60, 39, -34 + Math.sin(l / 3) * 2) });
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#2b1512" />
      <rect x={0} y={1580} width={W} height={340} fill="#5a2a1f" stroke="#150a0b" strokeWidth={12} />
      <rect x={0} y={1830} width={W} height={90} fill="#ff8a2a" />
      <g opacity={0.75}>{PILE.slice(0, 5).map((it, i) => <Item key={it.name} name={it.name} x={100 + i * 190} y={1690} px={8} rotate={it.rot} />)}</g>
      <Guy x={575} y={1685 + Math.sin(l / 7) * 4 + 335 * 3.2 - 0} s={3.2} p={p} face="thinking" armsOverHead look={[-2 + Math.sin(l / 6) * 3, 0]} />
    </g>
  );
};

/* -------------------- 10. it's all still there (351–506) -------------------- */

const FinaleShot: React.FC<{ f: number }> = ({ f }) => {
  const l = f - SHOT.finale[0];
  const t = ease(f, SHOT.finale[0], EV.pullBackEnd);
  const s = lerp(1.75, 1, t);
  const ax = lerp(480, 715, t), ay = lerp(1690, GROUND, t);
  let p: Pose = POSE.chin, face: FaceKind = "thinking", over = false, dx = 0, dy = 0, tilt = 0, hold: ItemName | null = null;
  let hx = 0;
  if (f < EV.joyFace) { p = POSE.chin; over = true; }
  else if (f < EV.wiggleEnd) {
    const k = ease(f, EV.joyFace, EV.joyFace + 3);
    p = lerpPose(POSE.chin, POSE.cheeks, k); face = "joy"; over = true;
    tilt = Math.sin(l * 0.9) * 7 * k; dx = Math.sin(l * 0.9) * 8 * k;
  } else if (f < EV.danceStart) { p = POSE.cheeks; face = "happy"; over = true; }
  else if (f < EV.despawn) {
    const d = f - EV.danceStart, beat = Math.floor(d / 6) % 4;
    const target = beat === 0 ? POSE.up : beat === 1 ? POSE.upR : beat === 2 ? POSE.up : POSE.upL;
    const prev = beat === 0 ? POSE.upL : beat === 1 ? POSE.up : beat === 2 ? POSE.upR : POSE.up;
    p = lerpPose(prev, target, ease(d % 6, 0, 4));
    dy = -Math.abs(Math.sin((d / 6) * Math.PI)) * 44;
    face = beat % 2 === 0 ? "joy" : "grin"; tilt = beat % 2 === 0 ? -6 : 8;
  } else if (f < EV.scratch) { p = POSE.stand; face = "plain"; }
  else if (f < EV.gasp) { p = lerpPose(POSE.stand, POSE.scratch, ease(f, EV.scratch, EV.scratch + 2)); face = "meh"; }
  else if (f < EV.handsOnHead) { p = lerpPose(POSE.scratch, POSE.headHold, ease(f, EV.gasp, EV.gasp + 6)); face = "surprised"; tilt = -8; over = true; }
  else if (f < EV.scream) { p = POSE.headHold; face = "shocked"; dx = Math.sin(l * 2.1) * 3; over = true; }
  else if (f < EV.frown) {
    const k = ease(f, EV.scream, EV.scream + 3);
    p = lerpPose(POSE.headHold, POSE.out, k); face = "scream";
    dx = Math.sin(l * 2.6) * 7 * k; dy = Math.sin(l * 1.9) * 5 * k; tilt = Math.sin(l * 1.3) * 5 * k;
  } else if (f < EV.deadpan) { p = lerpPose(POSE.out, POSE.stand, ease(f, EV.frown, EV.frown + 3)); face = "frown"; }
  else if (f < EV.pickUp) { p = POSE.stand; face = "meh"; }
  else if (f < EV.pickHeld) {
    p = lerpPose(POSE.stand, POSE.holdPick, ease(f, EV.pickUp, EV.pickHeld)); face = "meh";
    hold = f >= EV.pickUp + 2 ? "cobble" : null; hx = -75 * ease(f, EV.pickUp, EV.pickHeld);
  } else if (f < EV.pickRaised) { p = POSE.holdPick; face = "meh"; hold = "cobble"; hx = -75; }
  else {
    const k = ease(f, EV.pickRaised, EV.pickRaised + 5);
    p = lerpPose(POSE.holdPick, POSE.mine, k); face = f > EV.pickRaised + 5 ? "sly" : "meh"; hold = "cobble"; hx = -75;
  }
  const gone = f >= EV.despawn;
  return (
    <g transform={`translate(${ax - 715 * s} ${ay - GROUND * s}) scale(${s})`}>
      <NetherWorld t={f} />
      {!gone && PILE.map((it) => <Item key={it.name} name={it.name} x={it.x} y={it.y} px={11} rotate={it.rot} />)}
      {gone && f < EV.despawn + 8 && PILE.map((it, i) => <Poof key={i} x={it.x + 45} y={it.y + 40} t={(f - EV.despawn) / 8} r={26} />)}
      <Guy x={715 + hx + dx} y={GROUND + dy} s={1.3} p={p} face={face} armsOverHead={over} tilt={tilt}
        hands={({ R }) => (hold ? <Item name={hold} x={R[0] + 40} y={R[1] - 44} px={9} rotate={-10} /> : null)} />
    </g>
  );
};

/* ------------------------------ assembly ------------------------------ */

const shotAt = (f: number) => {
  if (f < SHOT.death[1]) return <GhastShot f={f} />;
  if (f < SHOT.overworld[1]) return <RespawnShot f={f} />;
  if (f < SHOT.aerial[1]) return <MapShot f={f} />;
  if (f < SHOT.tunnel[1]) return <PortalShot f={f} />;
  if (f < SHOT.darkRoom[1]) return <FortressShot f={f} />;
  if (f < SHOT.lava[1]) return <StriderShot f={f} />;
  if (f < SHOT.torch[1]) return <DarkShot f={f} />;
  if (f < SHOT.house[1]) return <PiglinShot f={f} />;
  if (f < SHOT.closeup[1]) return <CloseShot f={f} />;
  return <FinaleShot f={f} />;
};

const CaptionBand: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PANEL_TOP, background: "#ffffff" }}>
    <div style={{ position: "absolute", left: 80, top: 111, fontFamily: "Selawik, 'Segoe UI', sans-serif", fontSize: 82, lineHeight: "118px", color: "#000", whiteSpace: "pre" }}>
      {LOSE2_CAPTION.join("\n")}
    </div>
  </div>
);

/** the despawn timer: a real item lives five minutes, so this one is in a hurry */
const Timer: React.FC<{ f: number }> = ({ f }) => {
  const a = SHOT.finale[0] + 6, b = EV.despawn;
  if (f < a || f > b + 3) return null;
  const p = clamp01((f - a) / (b - a));
  const secs = Math.max(0, Math.ceil(300 * Math.pow(1 - p, 3)));
  const mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, "0");
  const late = secs <= 10;
  const blink = late && Math.floor(f / 3) % 2 === 0;
  return (
    <g>
      <rect x={40} y={PANEL_TOP + 26} width={520} height={92} fill="#000" opacity={0.6} />
      <text x={64} y={PANEL_TOP + 90} fontFamily={MONO} fontSize={38} fill="#ffffff">Items despawn:</text>
      <text x={528} y={PANEL_TOP + 90} textAnchor="end" fontFamily={MONO} fontSize={44} fill={late ? (blink ? "#ff4a4a" : "#ffffff") : "#ffe08a"}>{`${mm}:${ss}`}</text>
    </g>
  );
};

export const LoseStuff2Short: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      {audio && <Audio src={staticFile(audio)} />}
      <HandDrawn enabled={drawn} hold={1} boilEvery={2} boil={0.75} grain={0}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs><clipPath id="l2Panel"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
          <g clipPath="url(#l2Panel)">{shotAt(f)}</g>
        </svg>
      </HandDrawn>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Timer f={f} />
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};

export const LoseStuff2Thumb: React.FC = () => {
  loadMinecraftFonts();
  const f = EV.despawn - 14;
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs><clipPath id="l2PanelT"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
        <g clipPath="url(#l2PanelT)"><FinaleShot f={f} /></g>
        <Timer f={EV.despawn - 3} />
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};

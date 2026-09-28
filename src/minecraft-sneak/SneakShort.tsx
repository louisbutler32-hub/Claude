import { CameraMotionBlur } from "@remotion/motion-blur";
import { noise2D } from "@remotion/noise";
import React from "react";
import { AbsoluteFill, Audio, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease, FaceKind, limb, Pose, pose, POSE, Pt, Vignette, walkPose } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { Oofy, OofyTint, OOFY_TINT } from "../minecraft/oofy";
import { Pixels, Puff } from "../minecraft/pixels";
import { Block, Caption, Chat, Hearts } from "../minecraft-fall/hud";
import B from "./beats.json";

/**
 * "Minecraft crouching makes no sense" — 16 seconds, starring Oofy.
 *
 * Holding shift means you can't walk off an edge. Oofy crouch-walks to a
 * ravine over lava, the edge stops him dead, and he leans out further and
 * further — 30°, 62°, 86°, a plank over the void — to grab a diamond off a
 * floating block. Perfectly safe. Then he celebrates with a jump, and
 * sneaking doesn't protect you in the air. A pressed-keys overlay (W,
 * SHIFT, SPACE) tells the whole joke without a word. He respawns without
 * the diamond and crouch-walks straight back into the loop.
 */

export const SNEAK_FRAMES = B.frames;
export const SNEAK_CAPTION = ["When you hold shift", "in Minecraft:"];

const GROUND = 1000, EDGE = 470, LAVA = 1700, BLK = 110, S = 0.9, CROUCH = 40;
const PIVOT: Pt = [EDGE - 6, GROUND]; // his toe, glued to the block edge
const DIAMOND = ["..DD..", ".DddD.", "DddddD", ".DddD.", "..DD.."];
const DIAMOND_C = { D: "#2fb8c4", d: "#9ff3ee" };

/* ------------------------------ poses -------------------------------- */

/** a sneak: knees bent and forward, head dipped, everything CROUCH units lower */
const crouch = (base: Pose, amt = 1): Pose => {
  const c = CROUCH * amt;
  const leg = (l: Pose["legL"]): Pose["legL"] => [[l[0][0] + 26 * amt, l[0][1] - c * 0.6], [l[1][0], l[1][1] - c]];
  return { ...base, head: [base.head[0] + 14 * amt, base.head[1] + 10 * amt], legL: leg(base.legL), legR: leg(base.legR) };
};
const sneakWalk = (x: number) => crouch(walkPose(x / 70, 34));
const REACH = pose({ armR: limb(110, 30, 182, 42), armL: limb(-80, 70, -60, 150) });
const CHEER = pose({ armR: limb(100, -60, 120, -170), armL: limb(-110, -50, -130, -160) });

/* ---------------------------- the scene state ---------------------------- */

const lean = (f: number) => {
  let a = 0;
  for (const [s, e, deg] of B.leans) if (f >= s) a = (ease(f, s, e) * (deg - a)) + a;
  if (f >= B.back[0]) a = a * (1 - ease(f, B.back[0], B.back[1]));
  // the edge catch: momentum carries him over, the sneak holds his feet
  if (f >= B.catch && f < B.catch + 24) a += 16 * Math.exp(-(f - B.catch) / 6) * Math.sin((f - B.catch) * 0.7);
  if (f >= B.back[1] && f < B.back[1] + 14) a -= 10 * Math.exp(-(f - B.back[1]) / 4) * Math.sin((f - B.back[1]) * 0.9);
  return a;
};

const walkX = (f: number) => {
  if (f < B.walk.end) return B.walk.x0 + B.walk.speed * f;
  return B.walk.x0 + B.walk.speed * B.walk.end;
};
const STAND_X = walkX(B.walk.end);

/** where his reaching hand is, in world space, at a given lean — so the diamond sits exactly at the full stretch */
const handAt = (deg: number): Pt => {
  const ox = STAND_X, oy = GROUND - (335 - CROUCH) * S;
  const [px, py] = PIVOT;
  const hx = ox + REACH.armR[1][0] * S, hy = oy + REACH.armR[1][1] * S;
  const r = (deg * Math.PI) / 180;
  const dx = hx - px, dy = hy - py;
  return [px + dx * Math.cos(r) - dy * Math.sin(r), py + dx * Math.sin(r) + dy * Math.cos(r)];
};
const PRIZE = handAt(B.leans[2][2]);

type Dude = { x: number; feet: number; p: Pose; face: FaceKind; look: Pt; tint: OofyTint; rot: number; pivot: Pt; holding: boolean; gone: boolean; lower: number };

const dude = (f: number): Dude => {
  const d: Dude = { x: STAND_X, feet: GROUND, p: crouch(POSE.stand), face: "plain", look: [0, 0], tint: OOFY_TINT.normal, rot: 0, pivot: PIVOT, holding: f >= B.grab && f < B.fall[1] + 6, gone: false, lower: CROUCH };
  if (f < B.walk.end) {
    d.x = walkX(f); d.p = sneakWalk(d.x); d.face = "sly"; d.look = [10, 4];
  } else if (f < B.jump) {
    d.rot = lean(f);
    d.face = f < B.catch + 10 ? "shocked" : f < B.lookDown[1] ? "worried" : "gritted";
    d.look = f >= B.lookDown[0] && f < B.lookDown[1] ? [8, 14] : [12, 8];
    if (f >= B.leans[0][0] && f < B.back[0]) d.p = crouch(REACH);
    if (f >= B.grab) { d.face = "joy"; d.look = [0, 0]; }
    if (f >= B.back[1]) { d.p = crouch(CHEER, 0.6); d.face = "joy"; }
  } else if (f < B.hang[1]) {
    const t = Math.min(1, (f - B.jump) / B.jumpFrames);
    d.x = STAND_X + 160 * t;
    d.feet = GROUND - 110 * (1 - (1 - t) ** 2);
    d.p = CHEER; d.lower = 0;
    d.face = f < B.hang[0] + 6 ? "joy" : "meh";
    d.look = f >= B.hang[0] + 6 ? [0, 0] : [6, -6];
  } else if (f < B.fall[1]) {
    const t = f - B.fall[0], T = B.fall[1] - B.fall[0];
    const top = GROUND - 110, dist = LAVA + 40 - top;
    d.x = STAND_X + 160 + 30 * (t / T);
    d.feet = top + dist * (t / T) ** 2;
    d.p = pose({ armL: limb(-120, -40 + 30 * Math.sin(f), -150, -150), armR: limb(120, -40 - 30 * Math.sin(f), 150, -150) });
    d.face = "scream"; d.lower = 0;
  } else if (f < B.poof + 2) {
    const t = f - B.fall[1];
    d.x = STAND_X + 190;
    d.feet = LAVA + 40 + Math.min(120, t * 2.6);
    d.p = walkPose(f / 3, 70, pose({ armL: limb(-120, -40 + 50 * Math.sin(f * 1.1), -160, -140), armR: limb(120, -40 - 50 * Math.sin(f * 1.1), 160, -140) }), false);
    d.face = "scream"; d.lower = 0;
    d.tint = Math.floor(f / 3) % 2 ? OOFY_TINT.hurt : OOFY_TINT.normal;
    d.gone = f >= B.poof;
  } else if (f < B.respawn) {
    d.gone = true;
  } else {
    d.x = f >= B.walkAgain ? B.walk.x0 - B.walk.speed * (B.frames - f) : B.walk.x0 - B.walk.speed * (B.frames - B.walkAgain);
    const c = ease(f, B.crouch, B.crouch + 6);
    d.p = f >= B.walkAgain ? sneakWalk(d.x) : crouch(POSE.stand, c);
    d.lower = CROUCH * c;
    d.face = f < B.chatWorth + 20 ? "meh" : "sly";
    d.look = f < B.chatWorth ? [0, 14] : f < B.chatWorth + 20 ? [0, 0] : [10, 4];
  }
  return d;
};

/* ------------------------------ scenery ------------------------------ */

const Scenery: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <linearGradient id="snSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5aa0f2" />
        <stop offset="100%" stopColor="#c4e2ff" />
      </linearGradient>
      <linearGradient id="snGlow" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#ff7a1a" stopOpacity={0.75} />
        <stop offset="100%" stopColor="#ff7a1a" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="snLava" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffb02e" />
        <stop offset="100%" stopColor="#d4380d" />
      </linearGradient>
    </defs>
    <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="url(#snSky)" />
    {/* the far wall of the ravine, darker and flatter so it reads as distance */}
    {/* its top sits well above the action, so a body leaning out reads as over the void, not lying on a ledge */}
    {Array.from({ length: 10 }, (_, r) => Array.from({ length: 11 }, (_, c) => (
      <rect key={`${r}-${c}`} x={c * 100} y={700 + r * 100} width={100} height={100} fill={random(`fw${r}${c}`) > 0.85 ? "#4d4d57" : "#5c5c68"} stroke="#44444d" strokeWidth={4} />
    )))}
    <rect x={0} y={680} width={W} height={30} fill="#5d8d56" />
    <rect x={0} y={1100} width={W} height={LAVA - 1100} fill="url(#snGlow)" />
    {/* the cliff he stands on */}
    {Array.from({ length: 7 }, (_, r) => Array.from({ length: 6 }, (_, c) => (
      <Block key={`${r}-${c}`} kind={r === 0 ? "grass" : r < 3 ? "dirt" : "stone"} x={EDGE - (c + 1) * BLK} y={GROUND + r * BLK} s={BLK} />
    )))}
    {/* the prize, bobbing on a floating block */}
    <Block kind="stone" x={PRIZE[0] - BLK / 2} y={PRIZE[1] + 34} s={BLK} />
    {f < B.grab && <Pixels rows={DIAMOND} colors={DIAMOND_C} px={9} x={PRIZE[0]} y={PRIZE[1] + 8 + Math.sin(f / 7) * 6} />}
  </g>
);

const Lava: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={0} y={LAVA} width={W} height={H - LAVA + 20} fill="url(#snLava)" />
    <path d={`M0,${LAVA} ${Array.from({ length: 12 }, (_, i) => `Q${i * 90 + 45},${LAVA - 10 + Math.sin(f / 8 + i) * 8} ${(i + 1) * 90},${LAVA}`).join(" ")}`} fill="none" stroke="#7a1d05" strokeWidth={8} />
    {Array.from({ length: 9 }, (_, i) => {
      const x = 60 + random(`lb${i}`) * 960, y = LAVA + 50 + random(`lc${i}`) * 150;
      return <ellipse key={i} cx={x + Math.sin(f / 13 + i) * 20} cy={y} rx={40 + random(`ld${i}`) * 30} ry={14} fill="#ffe066" opacity={0.55 + 0.3 * Math.sin(f / 9 + i * 2)} />;
    })}
  </g>
);

const Flames: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g>
    {Array.from({ length: 7 }, (_, i) => {
      const fx = x - 90 + i * 30 + noise2D("fl", i, f / 5) * 12;
      const h = 70 + 40 * Math.abs(noise2D("fh", i, f / 4));
      return <path key={i} d={`M${fx},${y} q-20,${-h * 0.5} 0,${-h} q20,${h * 0.5} 0,${h} z`} fill={i % 2 ? "#ffcf3a" : "#ff6a1a"} stroke="#7a1d05" strokeWidth={4} />;
    })}
  </g>
);

/* -------------------------------- keys -------------------------------- */

const Keycap: React.FC<{ x: number; y: number; w: number; label: string; down: boolean; alarm?: boolean }> = ({ x, y, w, label, down, alarm = false }) => {
  const dy = down ? 8 : 0;
  return (
    <g>
      <rect x={x} y={y + 12} width={w} height={80} rx={14} fill="#1f1a2b" opacity={0.55} />
      <rect x={x} y={y + dy} width={w} height={80} rx={14} fill={down ? (alarm ? "#ff5a5a" : "#a78bfa") : "#eeeaf4"} stroke="#2a1b3d" strokeWidth={6} />
      <text x={x + w / 2} y={y + dy + 53} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={34} fill={down ? "#ffffff" : "#2a1b3d"}>{label}</text>
    </g>
  );
};

const Keys: React.FC<{ f: number }> = ({ f }) => {
  const moving = f < B.walk.end || f >= B.walkAgain || (f >= B.jump && f < B.jump + B.jumpFrames);
  const shift = f < B.hang[1] + 20 || f >= B.crouch;
  const space = f >= B.jump && f < B.jump + 8;
  const alarm = f >= B.hang[0] && f < B.fall[1] && Math.floor(f / 4) % 2 === 0;
  return (
    <g>
      <Keycap x={150} y={1470} w={90} label="W" down={moving} />
      <Keycap x={40} y={1570} w={200} label="SHIFT" down={shift} alarm={alarm} />
      <Keycap x={260} y={1570} w={380} label="SPACE" down={space} />
    </g>
  );
};

/* ------------------------------ assembly ------------------------------ */

const World: React.FC<{ offset: number }> = ({ offset }) => {
  const f = useCurrentFrame() + offset;
  const d = dude(f);
  const splash = f - B.fall[1];
  const shake = splash >= 0 && splash < 16 ? 22 * Math.exp(-splash / 5) : 0;
  const origin = d.feet - (335 - d.lower) * S;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${noise2D("sk", f / 3, 0) * shake} ${noise2D("sk", 0, f / 3) * shake})`}>
        <Scenery f={f} />
        {!d.gone && (
          <g transform={`rotate(${d.rot} ${d.pivot[0]} ${d.pivot[1]})`}>
            <Oofy x={d.x} y={origin} scale={S} pose={d.p} face={d.face} look={d.look} tint={d.tint} shadow={f < B.jump || f >= B.respawn}
              hands={d.holding ? ({ R }) => <Pixels rows={DIAMOND} colors={DIAMOND_C} px={8} x={R[0] + 6} y={R[1] - 24} /> : undefined} />
          </g>
        )}
        {f >= B.fall[1] && f < B.poof && <Flames x={d.x} y={LAVA + 10} f={f} />}
        <Lava f={f} />
        {splash >= 0 && splash < 20 && Array.from({ length: 14 }, (_, i) => {
          const a = -Math.PI / 2 + (random(`ls${i}`) - 0.5) * 2;
          const v = 12 + random(`lv${i}`) * 14;
          return <circle key={i} cx={d.x + Math.cos(a) * v * splash} cy={LAVA + Math.sin(a) * v * splash + 0.9 * splash * splash} r={10 + random(`lr${i}`) * 8} fill="#ffb02e" stroke="#7a1d05" strokeWidth={3} opacity={1 - splash / 20} />;
        })}
        {f >= B.poof && f < B.poof + 18 && [0, 1, 2, 3].map((i) => (
          <Puff key={i} x={STAND_X + 150 + i * 40} y={LAVA - 30 - (f - B.poof) * 6 - i * 16} r={30} opacity={Math.max(0, 1 - (f - B.poof) / 18)} />
        ))}
        {f >= B.grab && f < B.grab + 14 && (
          <g opacity={1 - (f - B.grab) / 14} fill="#9ff3ee" stroke="#2a1b3d" strokeWidth={3}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i / 6) * Math.PI * 2, r = 30 + (f - B.grab) * 7;
              return <rect key={i} x={PRIZE[0] + Math.cos(a) * r - 7} y={PRIZE[1] + Math.sin(a) * r - 7} width={14} height={14} transform={`rotate(45 ${PRIZE[0] + Math.cos(a) * r} ${PRIZE[1] + Math.sin(a) * r})`} />;
            })}
          </g>
        )}
      </g>
      {f >= B.respawn - 4 && f < B.respawn + 8 && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#ffffff" opacity={1 - Math.abs(f - B.respawn) / 8} />}
    </svg>
  );
};

const Hud: React.FC = () => {
  const f = useCurrentFrame();
  let hp = 20;
  if (f >= B.oofs[0] && f < B.respawn) hp = f >= B.chatLava ? 0 : f >= B.oofs[2] ? 2 : f >= B.oofs[1] ? 8 : 14;
  const flash = B.oofs.some((o) => f >= o && f < o + 6);
  const chats: [number, string][] = [[B.grab + 8, "<Oofy> shift is OP"], [B.chatLava, "Oofy tried to swim in lava"], [B.chatWorth, "<Oofy> worth it"]];
  const chat = chats.filter(([at]) => f >= at).pop();
  const op = chat ? Math.min(1, (f - chat[0]) / 3) * (1 - ease(f, chat[0] + 40, chat[0] + 48)) : 0;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      {chat && <Chat text={chat[1]} opacity={op} y={1330} />}
      <Hearts x={40} y={1410} hp={hp} frame={f} flash={flash} />
      <Keys f={f} />
    </svg>
  );
};

export const SneakShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  const [f0, f1] = B.fall;
  return (
    <AbsoluteFill style={{ backgroundColor: "#5aa0f2" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <Sequence durationInFrames={f0}><World offset={0} /></Sequence>
      <Sequence from={f0} durationInFrames={f1 - f0}>
        <CameraMotionBlur shutterAngle={200} samples={6}><AbsoluteFill><World offset={f0} /></AbsoluteFill></CameraMotionBlur>
      </Sequence>
      <Sequence from={f1} durationInFrames={B.frames - f1}><World offset={f1} /></Sequence>
      <Hud />
      <Vignette w={W} h={H} />
      <Caption lines={SNEAK_CAPTION} />
    </AbsoluteFill>
  );
};

/* ------------------------------ thumbnail ------------------------------ */

export const SneakThumb: React.FC = () => {
  loadMinecraftFonts();
  const f = B.leans[2][1] - 2;
  const d = dude(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#5aa0f2" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Scenery f={f} />
        <g transform={`rotate(${d.rot} ${d.pivot[0]} ${d.pivot[1]})`}>
          <Oofy x={d.x} y={d.feet - (335 - d.lower) * S} scale={S} pose={d.p} face="gritted" look={d.look} />
        </g>
        <Lava f={f} />
        <text x={540} y={560} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={84} fill="#ffffff" stroke="#2a1b3d" strokeWidth={12} paintOrder="stroke">86° LEAN</text>
        <text x={540} y={655} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={64} fill="#7CFC6A" stroke="#2a1b3d" strokeWidth={10} paintOrder="stroke">totally safe</text>
        <Keys f={0} />
      </svg>
      <Vignette w={W} h={H} />
      <Caption lines={SNEAK_CAPTION} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Audio, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../minecraft/beats";
import { ease, FaceKind, Figure, lerpPose, limb, Pose, pose } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { Chicken, Cow, Sword, Tag, Zombie } from "../minecraft/mobs";
import { Item, Puff } from "../minecraft/pixels";
import { Overworld, OverworldProps } from "../minecraft/worlds";

/**
 * "Java Players vs Bedrock Players: PvP" — 13 seconds.
 *
 * Java has an attack cooldown: swing, wait for the little bar, swing.
 * Bedrock has no cooldown: a spam-click blur that evaporates the zombie,
 * then the cow, then the chicken, then the ground. Cut back to Java, still
 * waiting for the bar — which fills exactly as the loop closes, so the last
 * frame hands straight back to the first.
 */

export const PVP_FRAMES = 390;
const SHOT = { java: [0, 130], bedrock: [130, 320], back: [320, 390] } as const;

const GROUND = 1500;
const VOLT_X = 380;
const ZOMBIE_X = 760;

/** the sword arm: raised, or brought down in front */
const RAISED = pose({ armR: limb(96, -30, 70, -150), armL: limb(-80, 60, -96, 130) });
const STRIKE = pose({ armR: limb(120, 40, 200, 70), armL: limb(-80, 60, -96, 130) });
const REST = pose({ armR: limb(96, 30, 110, 120), armL: limb(-80, 60, -96, 130) });

const swordAt = (R: readonly [number, number], t: number, worn = 1) => (
  <Sword x={R[0] + 30 - t * 10} y={R[1] - 60 + t * 40} px={worn < 0.5 ? 6 : 8} rotate={interpolate(t, [0, 1], [-20, 80])} />
);

const Crit: React.FC<{ x: number; y: number; seed: string; n?: number; spread?: number }> = ({ x, y, seed, n = 4, spread = 120 }) => (
  <g stroke="#ff4d4d" strokeWidth={7} strokeLinecap="round" fill="none">
    {Array.from({ length: n }, (_, i) => {
      const px = x + (random(`${seed}x${i}`) - 0.5) * spread;
      const py = y + (random(`${seed}y${i}`) - 0.5) * spread;
      return <path key={i} d={`M${px - 10},${py - 10} l20,20 M${px + 10},${py - 10} l-20,20`} />;
    })}
  </g>
);

/** Minecraft's attack-cooldown bar, under a crosshair */
const Cooldown: React.FC<{ x: number; y: number; fill: number }> = ({ x, y, fill }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-16,0 h32 M0,-16 v32" stroke="#ffffff" strokeWidth={6} opacity={0.9} />
    <rect x={-60} y={30} width={120} height={16} fill="#2a2a2a" stroke="#ffffff" strokeWidth={4} opacity={0.9} />
    <rect x={-56} y={34} width={112 * Math.min(1, fill)} height={8} fill="#ffffff" />
  </g>
);

/* ---------------------------------------------------------------- */

const JavaShot: React.FC<{ from: number; swings: number[]; killAt?: number; end: number; startMood?: FaceKind; fillOver?: number; zombie?: boolean }> = ({ swings, killAt, end, startMood = "thinking", fillOver, zombie = true }) => {
  const f = useCurrentFrame();
  // arm: 4 frames up-to-strike at each swing, then back to raised over 8
  let t = 0;
  let lastSwing = -999;
  for (const s of swings) if (f >= s) lastSwing = s;
  if (lastSwing >= 0) {
    const d = f - lastSwing;
    t = d < 4 ? d / 4 : d < 12 ? 1 - (d - 4) / 8 : 0;
  }
  const p: Pose = lerpPose(RAISED, STRIKE, t);
  const hitFrames = swings.map((s) => s + 3);
  const hit = hitFrames.some((h) => f >= h && f < h + 6);
  const knock = hitFrames.reduce((k, h) => (f >= h ? k + Math.max(0, 60 - (f - h) * 6) : k), 0);
  const cooldownFill = fillOver !== undefined ? Math.min(1, f / fillOver) : lastSwing < 0 ? 1 : Math.min(1, (f - lastSwing - 3) / 22);
  const zEnter = ease(f, 0, 30);
  const zx = interpolate(zEnter, [0, 1], [1250, ZOMBIE_X]) + Math.min(knock, 60);
  const dead = killAt !== undefined && f >= killAt;
  const fallT = dead ? ease(f, killAt!, killAt! + 10) : 0;
  const gone = dead && f > killAt! + 12;
  const mood: FaceKind = dead ? (f > killAt! + 20 ? "happy" : "plain") : fillOver !== undefined ? (cooldownFill < 1 ? startMood : "plain") : t > 0 ? "gritted" : cooldownFill < 1 ? "thinking" : "plain";
  const tap = cooldownFill < 1 && !dead ? Math.abs(Math.sin(f * 0.9)) * 10 : 0;
  return (
    <g>
      <Overworld />
      <OverworldProps />
      {!gone && zombie && (
        <g transform={`translate(${zx} ${GROUND - 322}) rotate(${fallT * 90} 0 322)`}>
          <Zombie x={0} y={0} scale={1.4} flash={hit} walk={zEnter < 1 ? f / 3 : 0} flip />
        </g>
      )}
      {dead && f <= killAt! + 16 && [0, 1, 2, 3].map((i) => <Puff key={i} x={zx - 60 + i * 50} y={GROUND - 120 - (f - killAt!) * 8 - i * 12} r={22} opacity={Math.max(0, 1 - (f - killAt!) / 14)} />)}
      {hit && <Crit x={zx} y={GROUND - 200} seed={`j${f}`} />}
      <Figure x={VOLT_X} y={GROUND - 250} scale={1.5} pose={p} face={mood} hands={({ R }) => swordAt(R, t)} />
      {/* foot tap while waiting */}
      {tap > 0 && <rect x={VOLT_X + 30} y={GROUND - 6 - tap} width={40} height={6} fill="#141414" opacity={0.25} />}
      {!dead && <Cooldown x={VOLT_X} y={GROUND - 640} fill={cooldownFill} />}
      <Tag x={VOLT_X} y={GROUND - 720} text="Java Players" />
      {f >= end && null}
    </g>
  );
};

/* ---------------------------------------------------------------- */

const BedrockShot: React.FC = () => {
  const f = useCurrentFrame();
  const zEnter = ease(f, 0, 30);
  const spam = f >= 35;
  const t = spam ? (f % 2 === 0 ? 1 : 0.2) : 0;
  const p: Pose = spam ? lerpPose(RAISED, STRIKE, t) : RAISED;
  const zx = interpolate(zEnter, [0, 1], [1250, ZOMBIE_X]) + (spam ? (random(`zv${f}`) - 0.5) * 16 : 0);
  const zombieGone = f >= 60;
  const cowIn = f >= 92;
  const cowX = interpolate(ease(f, 92, 112), [0, 1], [1300, ZOMBIE_X + 20]);
  const cowGone = f >= 118;
  const chickIn = f >= 128;
  const chickX = interpolate(ease(f, 128, 142), [0, 1], [1300, ZOMBIE_X]);
  const chickGone = f >= 148;
  const holeT = ease(f, 150, 185);
  const worn = 1 - ease(f, 100, 180);
  const shake = spam ? [(random(`sx${f}`) - 0.5) * 12, (random(`sy${f}`) - 0.5) * 12] : [0, 0];
  const mood: FaceKind = f < 20 ? "plain" : f < 35 ? "sly" : f < 60 ? "gritted" : "joy";
  const drops = (at: number, items: { name: "bread" | "goldIngot" | "ironIngot" | "cobble" }[], x: number) =>
    f >= at && f < at + 30
      ? items.map((it, i) => {
          const d = f - at;
          return <Item key={i} name={it.name} x={x + (i - 1) * 70 + d * (i - 1) * 4} y={GROUND - 200 - Math.sin(Math.min(1, d / 30) * Math.PI) * 160 + d * 3} px={8} rotate={d * 12} opacity={1 - d / 30} />;
        })
      : null;
  return (
    <g transform={`translate(${shake[0]} ${shake[1]})`}>
      <Overworld />
      <OverworldProps />
      {/* the ground gets carved */}
      {holeT > 0 && (
        <g>
          <rect x={ZOMBIE_X - 170} y={GROUND - 40} width={340} height={40 + 420 * holeT} fill="#6b5a45" stroke="#141414" strokeWidth={9} strokeLinejoin="round" />
          <rect x={ZOMBIE_X - 140} y={GROUND - 10} width={280} height={420 * holeT} fill="#221a12" />
        </g>
      )}
      {!zombieGone && <Zombie x={zx} y={GROUND - 322} scale={1.4} flash={spam} walk={zEnter < 1 ? f / 3 : 0} flip />}
      {f >= 60 && f < 76 && [0, 1, 2, 3, 4].map((i) => <Puff key={i} x={zx - 80 + i * 40} y={GROUND - 140 - (f - 60) * 9 - i * 14} r={24} opacity={Math.max(0, 1 - (f - 60) / 14)} />)}
      {cowIn && !cowGone && <Cow x={cowX} y={GROUND - 110} scale={1.05} flash={f > 112} walk={f / 3} />}
      {drops(118, [{ name: "bread" }, { name: "bread" }, { name: "bread" }], ZOMBIE_X)}
      {chickIn && !chickGone && <Chicken x={chickX} y={GROUND - 64} scale={1.1} flash={f > 142} walk={f / 2} />}
      {f >= 148 && f < 176 && [0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={ZOMBIE_X - 90 + i * 36 + Math.sin(f / 3 + i) * 10} y={GROUND - 120 - (f - 148) * 5 - i * 20} width={14} height={22} fill="#f7f4ee" stroke="#141414" strokeWidth={3} transform={`rotate(${(f - 148) * 9 + i * 40} ${ZOMBIE_X - 90 + i * 36} ${GROUND - 120})`} />)}
      {spam && <Crit x={ZOMBIE_X} y={GROUND - 220 + holeT * 260} seed={`b${f}`} n={7} spread={260} />}
      {/* dirt chunks while carving */}
      {holeT > 0 && holeT < 1 && [0, 1, 2].map((i) => <rect key={i} x={ZOMBIE_X - 60 + i * 60 + random(`dc${f}${i}`) * 30} y={GROUND - 80 - random(`dy${f}${i}`) * 300} width={18} height={18} fill="#5b4a3a" />)}
      {/* sword ghosts: the blur */}
      {spam &&
        [0.25, 0.5, 0.75].map((k) => {
          const g = lerpPose(RAISED, STRIKE, k);
          return (
            <g key={k} opacity={0.3} transform={`translate(${VOLT_X} ${GROUND - 250}) scale(1.5)`}>
              <polyline points={`56,38 ${g.armR[0][0]},${g.armR[0][1]} ${g.armR[1][0]},${g.armR[1][1]}`} fill="none" stroke="#141414" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
              {swordAt(g.armR[1], k, worn)}
            </g>
          );
        })}
      <Figure x={VOLT_X} y={GROUND - 250} scale={1.5} pose={p} face={mood} hands={({ R }) => swordAt(R, t, worn)} />
      <Tag x={VOLT_X} y={GROUND - 720} text="Bedrock Players" />
    </g>
  );
};

/* ---------------------------------------------------------------- */

export const PvpShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#7fb7ff" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <Sequence from={SHOT.java[0]} durationInFrames={SHOT.java[1] - SHOT.java[0]} name="java">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <JavaShot from={0} swings={[34, 62, 90]} killAt={94} end={130} startMood="plain" />
          </svg>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHOT.bedrock[0]} durationInFrames={SHOT.bedrock[1] - SHOT.bedrock[0]} name="bedrock">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <BedrockShot />
          </svg>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHOT.back[0]} durationInFrames={SHOT.back[1] - SHOT.back[0]} name="back">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <JavaShot from={0} swings={[]} end={70} startMood="meh" fillOver={64} zombie={false} />
          </svg>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

/** thumbnail: the two, one above the other */
export const PvpThumb: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#7fb7ff" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(0 -420)">
          <Overworld />
        </g>
        <rect x={0} y={750} width={W} height={H - 750} fill="#6ba264" />
        <path d="M0,750 H1080" stroke="#000" strokeWidth={9} />
        <Tag x={300} y={330} text="Java Players" size={44} />
        <Cooldown x={300} y={410} fill={0.4} />
        <Figure x={300} y={790} scale={1.6} pose={RAISED} face="meh" hands={({ R }) => swordAt(R, 0)} />
        <Tag x={720} y={1130} text="Bedrock Players" size={44} />
        {[0.25, 0.5, 0.75].map((k) => {
          const g = lerpPose(RAISED, STRIKE, k);
          return (
            <g key={k} opacity={0.3} transform="translate(720 1590) scale(1.6)">
              <polyline points={`56,38 ${g.armR[0][0]},${g.armR[0][1]} ${g.armR[1][0]},${g.armR[1][1]}`} fill="none" stroke="#141414" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
              {swordAt(g.armR[1], k)}
            </g>
          );
        })}
        <Figure x={720} y={1590} scale={1.6} pose={STRIKE} face="joy" hands={({ R }) => swordAt(R, 1)} />
        <Crit x={1000} y={1670} seed="thumb" n={9} spread={300} />
        <text x={540} y={1020} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={150} fill="#ffffff" stroke="#141414" strokeWidth={10} paintOrder="stroke">
          PvP
        </text>
      </svg>
    </AbsoluteFill>
  );
};

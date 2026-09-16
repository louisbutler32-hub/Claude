import React from "react";
import { AbsoluteFill, Audio, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../minecraft/beats";
import { ease, pose, limb, walkPose, POSE } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { CreeperFace, CreeperMob, Tag } from "../minecraft/mobs";
import { Steve, SteveMood, STEVE_TINT } from "../minecraft/steve";
import { Puff } from "../minecraft/pixels";
import { Overworld, OverworldProps } from "../minecraft/worlds";

/**
 * "You" vs "The creeper" — 13 seconds.
 *
 * You: a hissing green thing, horror, sprinting. The creeper: walking up
 * to say hello, arms out for a hug, hissing because it is nervous, and
 * then everything goes white. Its last frame is a smile. Both halves open
 * and close on white, so the loop is seamless.
 */

export const CREEPER_FRAMES = 390;
const SHOT = { you: [0, 165], creeper: [165, 390] } as const;
const GROUND = 1500;

const Flash: React.FC<{ o: number }> = ({ o }) => (o > 0 ? <rect x={0} y={0} width={W} height={H} fill="#ffffff" opacity={o} /> : null);

const Crater: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <path d={`M${x - 260},${GROUND - 10} q40,-60 120,-40 q60,-70 140,-30 q80,-40 160,10 q60,50 -40,90 h-300 q-100,-20 -80,-30 z`} fill="#5b4a3a" stroke="#141414" strokeWidth={9} strokeLinejoin="round" />
    <path d={`M${x - 200},${GROUND + 20} q60,-40 140,-20 q80,-30 160,10 q20,30 -40,40 h-220 z`} fill="#3a2e22" />
  </g>
);

/** the run: fast walk cycle, whole body leaning into it */
const runPose = (f: number) => walkPose(f / 5, 120, pose({ armL: limb(-90, 40, -140, -20), armR: limb(90, 40, 140, -20) }), false);

/* ---------------------------------------------------------------- */

const YouShot: React.FC = () => {
  const f = useCurrentFrame();
  const enter = ease(f, 0, 40);
  const creeperX = interpolate(enter, [0, 1], [1300, 900]) - Math.max(0, f - 60) * 4;
  const noticed = f >= 30;
  const running = f >= 42;
  const pixX = running ? 640 - (f - 42) * 3 : 640;
  const swell = interpolate(f, [96, 126], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boom = f >= 126;
  const fling = ease(f, 126, 134);
  const mood: SteveMood = boom ? "hurt" : noticed ? (f < 40 ? "shocked" : "scream") : "plain";
  const p = boom ? POSE.spread : running ? runPose(f) : noticed ? POSE.headHold : POSE.stand;
  const flashIn = interpolate(f, [0, 10], [1, 0], { extrapolateRight: "clamp" });
  const flashBoom = boom ? interpolate(f, [126, 130, 165], [1, 0.9, 0], { extrapolateRight: "clamp" }) : 0;
  const shake = swell > 0 && !boom ? (random(`s${f}`) - 0.5) * swell * 16 : 0;
  return (
    <g transform={`translate(${shake} 0)`}>
      <Overworld />
      <OverworldProps />
      {boom && <Crater x={creeperX - 60} />}
      {!boom && <CreeperMob x={creeperX} y={GROUND - 200} scale={1.15} face="normal" walk={f / 4} swell={swell} flip />}
      {boom && f < 150 && [0, 1, 2, 3, 4].map((i) => <Puff key={i} x={creeperX - 160 + i * 80} y={GROUND - 200 - (f - 126) * 10 - i * 30} r={50 - i * 4} opacity={Math.max(0, 1 - (f - 126) / 22)} />)}
      <g transform={boom ? `translate(${-fling * 900} ${-fling * 500}) rotate(${-fling * 200} ${pixX} ${GROUND - 250})` : running ? `rotate(-14 ${pixX} ${GROUND})` : ""}>
        <Steve x={pixX} y={GROUND - 250} scale={1.4} pose={p} mood={mood} tint={boom ? STEVE_TINT.hurt : STEVE_TINT.normal} flip={running || boom} />
      </g>
      {noticed && !running && f < 42 && <text x={pixX + 130} y={GROUND - 560} fontFamily="Silkscreen, monospace" fontSize={70} fill="#141414">!</text>}
      <Tag x={pixX} y={GROUND - 690} text="You" />
      <Flash o={Math.max(flashIn, flashBoom)} />
    </g>
  );
};

/* ---------------------------------------------------------------- */

const CreeperShot: React.FC = () => {
  const f = useCurrentFrame();
  const enter = ease(f, 0, 40);
  const creeperX = interpolate(enter, [0, 1], [1300, 900]) - Math.max(0, f - 60) * 4;
  const running = f >= 42;
  const pixX = running ? 640 - (f - 42) * 3 : 640;
  const p = running ? runPose(f) : f >= 30 ? POSE.headHold : POSE.stand;
  const face: CreeperFace = f < 44 ? "happy" : f < 96 ? "sad" : f < 150 ? "nervous" : "smile";
  const swell = interpolate(f, [100, 150], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = f >= 100 && f < 150 ? (random(`c${f}`) - 0.5) * swell * 18 : 0;
  const closeup = f >= 150;
  const boom = f >= 205;
  const flashIn = interpolate(f, [0, 10], [1, 0], { extrapolateRight: "clamp" });
  const flashOut = interpolate(f, [205, 212, 225], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hearts = f < 44 ? 3 : 0;
  return (
    <g transform={`translate(${shake} 0)`}>
      <Overworld />
      <OverworldProps />
      {!closeup && (
        <>
          <Steve x={pixX} y={GROUND - 250} scale={1.4} pose={p} mood={running ? "scream" : f >= 30 ? "shocked" : "plain"} flip={running} />
          <CreeperMob x={creeperX} y={GROUND - 200} scale={1.15} face={face} walk={f / 4} swell={swell} arms flip hearts={hearts} />
          <Tag x={creeperX} y={GROUND - 690} text="The creeper" />
        </>
      )}
      {closeup && (
        <g>
          <rect x={0} y={0} width={W} height={H} fill="#1a1a1a" opacity={0.2} />
          <CreeperMob x={540} y={1330} scale={3.2} face="smile" swell={Math.min(0.5, (f - 150) / 110)} arms flip />
          <Tag x={540} y={560} text="The creeper" size={52} />
        </g>
      )}
      {!boom && <Flash o={flashIn} />}
      {boom && <Flash o={flashOut} />}
    </g>
  );
};

/* ---------------------------------------------------------------- */

export const CreeperShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#7fb7ff" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <Sequence from={SHOT.you[0]} durationInFrames={SHOT.you[1] - SHOT.you[0]} name="you">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <YouShot />
          </svg>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHOT.creeper[0]} durationInFrames={SHOT.creeper[1] - SHOT.creeper[0]} name="creeper">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <CreeperShot />
          </svg>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export const CreeperThumb: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#7fb7ff" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(0 -420)">
          <Overworld />
        </g>
        <rect x={0} y={750} width={W} height={H - 750} fill="#6ba264" />
        <path d="M0,750 H1080" stroke="#000" strokeWidth={9} />
        <Tag x={300} y={250} text="You" size={44} />
        <g transform="rotate(-14 300 900)">
          <Steve x={300} y={700} scale={1.5} pose={walkPose(0.3, 120, pose({ armL: limb(-90, 40, -140, -20), armR: limb(90, 40, 140, -20) }), false)} mood="scream" flip />
        </g>
        <Tag x={720} y={1040} text="The creeper" size={44} />
        <CreeperMob x={720} y={1560} scale={1.5} face="happy" arms flip hearts={3} />
      </svg>
    </AbsoluteFill>
  );
};

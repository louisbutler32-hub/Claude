import React from "react";
import { AbsoluteFill, Audio, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../minecraft/beats";
import { ease, Figure, POSE, walkPose } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { Cow, Tag } from "../minecraft/mobs";
import { TreeTop } from "../minecraft/pixels";
import { Overworld, OverworldProps } from "../minecraft/worlds";

/**
 * "Java Players vs Bedrock Players: the chunk loads" — 14 seconds.
 *
 * Java walks over a hill and the world is simply there. Bedrock walks
 * over the hill into a pale, empty void, and stands on one floating
 * grass block while the trees pop into existence one at a time around
 * him. He sits down to wait. A cow loads in mid-air and falls past him.
 *
 * Reuses everything already built for the last comparison Short (the
 * stick figure, the Cow, the floating name tag) — only the void and the
 * floating block are new, since that's the whole joke.
 */

export const CHUNKLOAD_FRAMES = 420;
const SHOT = { java: [0, 150], bedrock: [150, 420] } as const;
const useAbs = (shot: keyof typeof SHOT) => useCurrentFrame() + SHOT[shot][0];
const GROUND = 1500;

/** the pale, featureless nothing Bedrock renders into before a chunk loads. */
const Void: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#eef2f6" }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="voidVignette" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0%" stopColor="#f6f9fb" />
          <stop offset="100%" stopColor="#d7e0e8" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#voidVignette)" />
    </svg>
  </AbsoluteFill>
);

/** one block of grass, floating, the only ground in the void. */
const FloatingBlock: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-230,0 L230,0 L230,120 L-230,120 Z" fill="#8a6a45" stroke="#141414" strokeWidth={11} strokeLinejoin="round" />
    <path d="M-230,0 L230,0 L230,-34 L-230,-34 Z" fill="#6ba264" stroke="#141414" strokeWidth={11} strokeLinejoin="round" />
    <path d="M-230,-34 H230" stroke="#5d8d60" strokeWidth={6} />
  </g>
);

/* ------------------------------------------------------------------ */
/* 1. Java: it's just there                                            */
/* ------------------------------------------------------------------ */

const JavaShot: React.FC = () => {
  const f = useAbs("java");
  const l = f - SHOT.java[0];
  const walking = l < 90;
  const x = interpolate(l, [0, 90], [280, 640], { extrapolateRight: "clamp" });
  const p = walking ? walkPose(l / 6, 60) : undefined;
  return (
    <g>
      <Overworld />
      <OverworldProps />
      <Figure x={x} y={GROUND - 250} scale={1.35} pose={p ?? walkPose(0, 60)} face="plain" />
      <Tag x={640} y={GROUND - 690} text="Java Players" />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 2. Bedrock: waiting on the chunk                                    */
/* ------------------------------------------------------------------ */

/** trees pop in one at a time; each entry is [frame it appears, x, y, scale]. */
const TREES: [number, number, number, number][] = [
  [20, 220, 1140, 0.85],
  [45, 860, 1080, 0.9],
  [70, 120, 1360, 0.7],
  [95, 940, 1300, 0.75],
  [130, 500, 1040, 0.8],
  [165, 760, 1420, 0.65],
];

const ChunkBorder: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g opacity={Math.max(0, 1 - t)} transform={`translate(${x} ${y}) scale(${1 + t * 1.4})`}>
    <rect x={-90} y={-90} width={180} height={180} fill="none" stroke="#9fd9ff" strokeWidth={5} strokeDasharray="10 8" />
  </g>
);

const BedrockShot: React.FC = () => {
  const f = useAbs("bedrock");
  const l = f - SHOT.bedrock[0];
  const walking = l < 40;
  const x = interpolate(l, [0, 40], [280, 540], { extrapolateRight: "clamp" });
  const blockPop = ease(l, 30, 46);
  const sitting = l >= 60;
  const cowStart = 190, cowFallT = Math.min(1, Math.max(0, (l - cowStart) / 26));
  const cowY = interpolate(cowFallT, [0, 1], [560, GROUND - 40]);
  const cowGone = l > cowStart + 34;
  return (
    <g>
      <Void />
      {blockPop > 0 && <FloatingBlock x={540} y={GROUND + 50} scale={0.75 + blockPop * 0.25} />}
      {TREES.map(([at, tx, ty, sc], i) => {
        const t = ease(l, at, at + 14);
        if (t <= 0) return null;
        return (
          <g key={i}>
            <g opacity={t} transform={`translate(${tx} ${ty}) scale(${0.6 + t * 0.4})`}>
              <TreeTop x={0} y={0} scale={sc} />
            </g>
            <ChunkBorder x={tx} y={ty} t={ease(l, at, at + 20)} />
          </g>
        );
      })}
      {!cowGone && cowFallT > 0 && <Cow x={700} y={cowY} scale={0.9 + cowFallT * 0.2} />}
      {blockPop > 0.3 && (
        <Figure
          x={walking ? x : 540}
          y={GROUND - 250}
          scale={1.35}
          pose={walking ? walkPose(l / 6, 60) : sitting ? POSE.stand : walkPose(0, 60)}
          face={sitting ? "meh" : "worried"}
          armsOverHead={false}
        />
      )}
      <Tag x={540} y={GROUND - 690} text="Bedrock Players" />
    </g>
  );
};

/* ------------------------------------------------------------------ */

export const ChunkLoadShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#7fb7ff" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <Sequence from={SHOT.java[0]} durationInFrames={SHOT.java[1] - SHOT.java[0]} name="java">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <JavaShot />
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
    </AbsoluteFill>
  );
};

export const ChunkLoadThumb: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#eef2f6" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Void />
        <FloatingBlock x={540} y={GROUND + 50} scale={1} />
        <TreeTop x={860} y={1060} scale={0.9} />
        <TreeTop x={220} y={1140} scale={0.85} />
        <Cow x={780} y={780} scale={1.1} />
        <Figure x={540} y={GROUND - 250} scale={1.6} face="worried" pose={walkPose(0, 60)} />
        <Tag x={540} y={GROUND - 720} text="Bedrock Players" size={48} />
        <text x={540} y={230} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={82} fill="#141414" stroke="#ffffff" strokeWidth={10} paintOrder="stroke">
          THE CHUNK
        </text>
        <text x={540} y={330} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={82} fill="#3a8fd6" stroke="#ffffff" strokeWidth={10} paintOrder="stroke">
          HASN'T LOADED
        </text>
      </svg>
    </AbsoluteFill>
  );
};

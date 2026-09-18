import React from "react";
import { random } from "remotion";
import { H, PANEL_TOP, W } from "./beats";
import { Streaks } from "./worlds";

/**
 * The Nether: a setting the channel hasn't used yet. Deep red-brown rock,
 * a black cave ceiling instead of sky, a lava ocean below, glowstone as
 * the only warm light, soul sand patches, and netherrack pillars instead
 * of the overworld's green hills. Same flat-fill/thick-outline drawing
 * rules as everywhere else, different palette entirely.
 */

const NETHERRACK = "#6b3a34";
const NETHERRACK_DK = "#4a2620";
const NETHERRACK_LT = "#7f453e";
const SOUL_SAND = "#4a3d34";
const GLOWSTONE = "#f2c85a";
const GLOWSTONE_DK = "#c99a2e";
const CEILING = "#241414";
const LAVA = "#ff8a2a";
const LAVA_DK = "#e05f10";

const GlowCluster: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-40} y={-30} width={80} height={60} fill={GLOWSTONE} stroke="#141414" strokeWidth={9} strokeLinejoin="round" />
    <rect x={-28} y={-18} width={20} height={16} fill={GLOWSTONE_DK} />
    <rect x={10} y={4} width={16} height={14} fill={GLOWSTONE_DK} />
    <rect x={-8} y={-4} width={14} height={12} fill={GLOWSTONE_DK} />
  </g>
);

export const NetherWorld: React.FC<{ t?: number; pan?: number }> = ({ t = 0, pan = 0 }) => (
  <g>
    <defs>
      <radialGradient id="glowHalo1" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor={GLOWSTONE} stopOpacity={0.55} />
        <stop offset="100%" stopColor={GLOWSTONE} stopOpacity={0} />
      </radialGradient>
      <linearGradient id="netherAir" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2a1512" />
        <stop offset="100%" stopColor="#4a2018" />
      </linearGradient>
    </defs>
    {/* the black ceiling, where sky would be */}
    <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="url(#netherAir)" />
    <rect x={0} y={PANEL_TOP} width={W} height={280} fill={CEILING} />
    <path d="M0,397 h200 v40 h180 v-30 h260 v50 h240 v-40 h200 v50 h180" fill="none" stroke="#141414" strokeWidth={10} />
    <rect x={0} y={397} width={W} height={280} fill={CEILING} clipPath="url(#netherCeilClip)" />
    <clipPath id="netherCeilClip">
      <path d="M0,397 h200 v40 h180 v-30 h260 v50 h240 v-40 h200 v50 h180 v-110 h-1260 z" />
    </clipPath>
    {/* haze drifting across, cheap parallax so it doesn't feel static */}
    <g opacity={0.18} fill="#ff9a4a">
      <ellipse cx={(200 + t * 8) % (W + 400) - 200} cy={520} rx={220} ry={40} />
      <ellipse cx={(700 + t * 5) % (W + 400) - 200} cy={640} rx={260} ry={50} />
    </g>
    {/* distant netherrack pillars / mid-ground */}
    <g transform={`translate(${pan * 0.4} 0)`}>
      <path d="M-100,900 h260 v-160 h180 v90 h300 v-200 h220 v220 h300 v-100 h300 v250 h-1560 z" fill={NETHERRACK_DK} stroke="#141414" strokeWidth={9} strokeLinejoin="round" />
      <GlowCluster x={40} y={760} scale={0.7} />
      <GlowCluster x={880} y={680} scale={0.6} />
    </g>
    {/* near ground: netherrack floor with soul sand patches */}
    <g transform={`translate(${pan * 0.7} 0)`}>
      <rect x={-400} y={1150} width={W + 800} height={H - 1150} fill={NETHERRACK} />
      <Streaks x={-380} y={1170} w={W + 760} h={H - 1170} n={26} seed="nrf" light={NETHERRACK_LT} dark={NETHERRACK_DK} len={110} />
      <path d="M-400,1150 H1480" stroke="#141414" strokeWidth={10} />
      {/* soul sand patches */}
      <ellipse cx={220} cy={1230} rx={160} ry={40} fill={SOUL_SAND} />
      <ellipse cx={840} cy={1290} rx={200} ry={46} fill={SOUL_SAND} />
      <g fill="#2a2018" opacity={0.6}>
        <circle cx={180} cy={1220} r={6} /><circle cx={230} cy={1235} r={5} /><circle cx={270} cy={1215} r={6} />
        <circle cx={800} cy={1280} r={6} /><circle cx={860} cy={1300} r={5} /><circle cx={900} cy={1285} r={6} />
      </g>
      {/* glowstone on the ground plane, close */}
      <GlowCluster x={140} y={1140} scale={1.1} />
      <rect x={80} y={1140} width={120} height={140} fill="url(#glowHalo1)" />
    </g>
    {/* the lava ocean, visible past the ledge */}
    <path d="M-400,1700 h1880 v220 h-1880 z" fill={LAVA} />
    <g fill={LAVA_DK} opacity={0.6}>
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse key={i} cx={-350 + i * 130 + Math.sin(t * 0.04 + i) * 20} cy={1750 + (i % 3) * 60} rx={50} ry={16} />
      ))}
    </g>
    <path d="M-400,1700 H1480" stroke="#141414" strokeWidth={10} />
  </g>
);

/** A rectangular obsidian frame; `lit` fills the inside with the portal shimmer. */
export const NetherPortal: React.FC<{ x: number; y: number; scale?: number; lit: number; t?: number }> = ({ x, y, scale = 1, lit, t = 0 }) => {
  const W_ = 260, H_ = 420;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* frame: obsidian blocks */}
      <g fill="#1c1424" stroke="#141414" strokeWidth={9} strokeLinejoin="round">
        <rect x={-W_ / 2 - 40} y={-H_} width={40} height={H_ + 40} />
        <rect x={W_ / 2} y={-H_} width={40} height={H_ + 40} />
        <rect x={-W_ / 2 - 40} y={-H_ - 40} width={W_ + 80} height={40} />
        <rect x={-W_ / 2 - 40} y={0} width={W_ + 80} height={40} />
      </g>
      <g fill="#2e2038" opacity={0.7}>
        <rect x={-W_ / 2 - 32} y={-H_ + 20} width={16} height={40} />
        <rect x={W_ / 2 + 16} y={-H_ + 120} width={16} height={40} />
      </g>
      {/* the shimmer inside, once lit */}
      {lit > 0 && (
        <g opacity={lit}>
          <rect x={-W_ / 2} y={-H_} width={W_} height={H_} fill="#3a1a6b" />
          {Array.from({ length: 10 }, (_, i) => (
            <rect
              key={i}
              x={-W_ / 2 + ((i * 47 + t * 6) % W_)}
              y={-H_ + ((i * 83 + t * 3) % H_)}
              width={18}
              height={26}
              fill={i % 2 ? "#c79bff" : "#8a5ad6"}
              opacity={0.85}
            />
          ))}
          <rect x={-W_ / 2} y={-H_} width={W_} height={H_} fill="url(#portalGlow)" />
          <defs>
            <radialGradient id="portalGlow" cx="0.5" cy="0.5" r="0.6">
              <stop offset="0%" stopColor="#d9b8ff" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#d9b8ff" stopOpacity={0} />
            </radialGradient>
          </defs>
        </g>
      )}
    </g>
  );
};

/** the obsidian blocks placed one at a time during the build montage; `count` 0-10 */
export const PortalBuildProgress: React.FC<{ x: number; y: number; scale?: number; count: number }> = ({ x, y, scale = 1, count }) => {
  const W_ = 260, H_ = 420;
  const slots: { x: number; y: number; w: number; h: number }[] = [
    { x: -W_ / 2 - 40, y: -H_ - 40, w: 100, h: 40 },
    { x: -W_ / 2 - 40, y: -H_, w: 40, h: 105 },
    { x: -W_ / 2 - 40, y: -H_ + 105, w: 40, h: 105 },
    { x: -W_ / 2 - 40, y: -H_ + 210, w: 40, h: 130 },
    { x: W_ / 2, y: -H_, w: 40, h: 105 },
    { x: W_ / 2, y: -H_ + 105, w: 40, h: 105 },
    { x: W_ / 2, y: -H_ + 210, w: 40, h: 130 },
    { x: -W_ / 2 - 40, y: 0, w: 100, h: 40 },
    { x: -W_ / 2 + 40, y: 0, w: 100, h: 40 },
    { x: W_ / 2 - 80, y: 0, w: 100, h: 40 },
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#1c1424" stroke="#141414" strokeWidth={8} strokeLinejoin="round">
      {slots.slice(0, count).map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} />
      ))}
    </g>
  );
};

import React from "react";
import { AbsoluteFill } from "remotion";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { POSE, pose, limb } from "../minecraft/figure";
import { Pix } from "../minecraft/pix";
import { Sword } from "../minecraft/mobs";
import { Item } from "../minecraft/pixels";

/**
 * Channel art for the rebrand of @LaughQuakees: "Oof Craft" — Minecraft
 * animations with Pix.
 *
 * Avatar: 800×800, Pix's face filling the circle YouTube crops to.
 * Banner: 2560×1440 as uploaded; everything that matters sits inside the
 * 1546×423 centre band, which is all a phone ever shows.
 */

const ORANGE = "#ff7b1f";
const NAVY = "#1f2a44";
const SKY = "#7fb7ff";
const GRASS = "#6ba264";
const DIRT = "#665e52";

const Wordmark: React.FC<{ x: number; y: number; size: number }> = ({ x, y, size }) => (
  <g transform={`translate(${x} ${y})`} fontFamily="Silkscreen, monospace" textAnchor="middle">
    <text y={0} fontSize={size} fill="#ffffff" stroke={NAVY} strokeWidth={size * 0.16} strokeLinejoin="round" paintOrder="stroke">
      OOF
    </text>
    <text y={size * 1.05} fontSize={size} fill={ORANGE} stroke={NAVY} strokeWidth={size * 0.16} strokeLinejoin="round" paintOrder="stroke">
      CRAFT
    </text>
  </g>
);

export const BrandAvatar: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: ORANGE }}>
      <svg width={800} height={800} viewBox="0 0 800 800" style={{ position: "absolute", inset: 0 }}>
        <rect width={800} height={800} fill={ORANGE} />
        <rect x={0} y={560} width={800} height={240} fill={GRASS} />
        <rect x={0} y={560} width={800} height={12} fill={NAVY} opacity={0.5} />
        {/* the face, big: the head is a 200 block at scale 1, so 2.6 fills the circle */}
        <g transform="translate(400 700) scale(2.6)">
          <Pix x={0} y={0} pose={POSE.stand} mood="happy" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Hills: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <path d={`M0,${y + 60} h300 v-40 h260 v-30 h420 v40 h360 v-50 h520 v-30 h700 v300 h-2560 z`} fill={DIRT} stroke={NAVY} strokeWidth={10} strokeLinejoin="round" />
    <path d={`M0,${y + 60} h300 v-40 h260 v-30 h420 v40 h360 v-50 h520 v-30 h700 v36 h-700 v30 h-520 v50 h-360 v-40 h-420 v30 h-260 v40 h-300 z`} fill="#5d8d60" />
  </g>
);

export const BrandBanner: React.FC<{ guides?: boolean }> = ({ guides = false }) => {
  loadMinecraftFonts();
  const cx = 1280, cy = 720;
  const raised = pose({ armR: limb(96, -30, 70, -150), armL: limb(-80, 60, -96, 130) });
  return (
    <AbsoluteFill style={{ backgroundColor: SKY }}>
      <svg width={2560} height={1440} viewBox="0 0 2560 1440" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="bannerSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6aaaff" />
            <stop offset="100%" stopColor="#a9d0fe" />
          </linearGradient>
        </defs>
        <rect width={2560} height={1440} fill="url(#bannerSky)" />
        {/* sun and clouds, up in the part only desktop sees */}
        <rect x={2140} y={300} width={170} height={170} fill="#fcefac" />
        <rect x={2160} y={320} width={130} height={130} fill="#fefaec" />
        <g fill="#e2ebf2" stroke={NAVY} strokeWidth={8} strokeLinejoin="round">
          <path d="M300,380 h90 v-30 h85 v30 h115 v60 h-75 v30 h-125 v-30 h-90 z" />
          <path d="M1700,330 h160 v-35 h125 v60 h-85 v35 h-130 v-25 h-70 z" />
          <path d="M900,250 h85 v40 h-85 z" />
        </g>
        <Hills y={870} />
        <rect x={0} y={930} width={2560} height={510} fill={GRASS} />
        <path d="M0,930 H2560" stroke={NAVY} strokeWidth={8} />
        {/* centre band: wordmark left of centre, Pix right of centre */}
        <Wordmark x={cx - 280} y={cy - 40} size={130} />
        <rect x={cx - 640} y={cy + 118} width={720} height={64} rx={32} fill={NAVY} />
        <text x={cx - 280} y={cy + 162} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={40} fill="#ffffff">
          Minecraft animations · new every week
        </text>
        <Pix x={cx + 400} y={cy - 12} scale={0.82} pose={raised} mood="joy" hands={({ R }) => <Sword x={R[0] + 30} y={R[1] - 60} px={7} rotate={-20} />} />
        <Item name="goldApple" x={cx + 220} y={cy + 150} px={8} />
        <Item name="cobble" x={cx + 640} y={cy + 160} px={8} />
        {guides && (
          <g fill="none" stroke="#ff0000" strokeWidth={4} strokeDasharray="20 12">
            <rect x={(2560 - 1546) / 2} y={(1440 - 423) / 2} width={1546} height={423} />
            <rect x={(2560 - 2560) / 2} y={(1440 - 423) / 2} width={2560} height={423} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
export const BrandBannerGuides: React.FC = () => <BrandBanner guides />;

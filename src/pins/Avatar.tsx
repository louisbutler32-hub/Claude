import React from "react";
import { AbsoluteFill } from "remotion";
import { Actor, Asset, Mood } from "./engine";
import { ASSETS as TALK } from "./talk/assets";
import { ASSETS as SLEEP } from "./sleep/assets";

/**
 * The channel's profile picture: one of the episode animals, cartoon eyes on,
 * over the reference's round orange badge. 800 × 800 (YouTube's size); it's
 * shown as a circle, so everything that matters sits inside the middle ~85%.
 */
export const AVATAR = 800;

const PICKS: Record<string, { a: Asset; x: number; y: number; w: number; rot?: number; mood?: Mood; look?: [number, number] }> = {
  elephant: { a: TALK.elephant, x: 400, y: 600, w: 720, look: [0, 0.15] },
  beluga: { a: TALK.belugaUp, x: 400, y: 650, w: 520, look: [0, 0.15] },
  frigate: { a: SLEEP.frigateHead, x: 430, y: 700, w: 1000, look: [0.5, 0.1] },
};

export const PinsAvatar: React.FC<{ pick?: string }> = ({ pick = "elephant" }) => {
  const p = PICKS[pick] ?? PICKS.elephant;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #ffb15e 0%, #ff7a14 48%, #e85d00 100%)", overflow: "hidden" }}>
      {/* sunburst rays, for punch at thumbnail size */}
      <svg viewBox="-400 -400 800 800" style={{ position: "absolute", inset: 0, width: AVATAR, height: AVATAR, opacity: 0.18 }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16;
          return <path key={i} d={`M 0 0 L ${Math.cos(a0) * 700} ${Math.sin(a0) * 700} L ${Math.cos(a1) * 700} ${Math.sin(a1) * 700} Z`} fill="#fff" />;
        })}
      </svg>
      <Actor a={p.a} t={1} x={p.x} y={p.y} w={p.w} rot={p.rot} bob={0} moods={[[-99, p.mood ?? "open"]]} look={p.look} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill } from "remotion";
import { Actor, Asset, Mood } from "./engine";
import { CartoonHead, Face, HeadLook } from "./people";
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

/** the channel's comic human (the tourist from the robbers Short), head and shoulders */
const MAN: HeadLook = { hair: "short", skin: "#e8b694", hairColor: "#5a3a1e", beard: "stubble" };
const FACES: Record<string, Face> = { "man-happy": "happy", "man-shocked": "shocked", "man-smirk": "smirk" };
const HumanBust: React.FC<{ face: Face }> = ({ face }) => (
  <>
    {/* blue t-shirt shoulders, so the head isn't floating */}
    <svg viewBox="0 0 800 800" style={{ position: "absolute", inset: 0, width: AVATAR, height: AVATAR, filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.3))" }}>
      <path d="M 90 820 C 100 690, 200 640, 320 625 L 480 625 C 600 640, 700 690, 710 820 Z" fill="#9cc9e8" stroke="#2a1a10" strokeWidth={8} />
      <path d="M 330 628 Q 400 690 470 628" fill="#7fb3d6" stroke="#2a1a10" strokeWidth={8} />
    </svg>
    <div style={{ position: "absolute", left: 400 - 230, top: 60, width: 460, height: 575, filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.3))" }}>
      <CartoonHead t={1} id="avatar" look={MAN} face={face} since={-99} gaze={[0, 0]} neck />
    </div>
  </>
);

export const PinsAvatar: React.FC<{ pick?: string }> = ({ pick = "elephant" }) => {
  const p = PICKS[pick] ?? PICKS.elephant;
  const face = FACES[pick];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #ffb15e 0%, #ff7a14 48%, #e85d00 100%)", overflow: "hidden" }}>
      {/* sunburst rays, for punch at thumbnail size */}
      <svg viewBox="-400 -400 800 800" style={{ position: "absolute", inset: 0, width: AVATAR, height: AVATAR, opacity: 0.18 }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16;
          return <path key={i} d={`M 0 0 L ${Math.cos(a0) * 700} ${Math.sin(a0) * 700} L ${Math.cos(a1) * 700} ${Math.sin(a1) * 700} Z`} fill="#fff" />;
        })}
      </svg>
      {face ? <HumanBust face={face} /> : <Actor a={p.a} t={1} x={p.x} y={p.y} w={p.w} rot={p.rot} bob={0} moods={[[-99, p.mood ?? "open"]]} look={p.look} />}
    </AbsoluteFill>
  );
};

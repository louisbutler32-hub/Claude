import React from "react";
import { useCurrentFrame } from "remotion";
import { STROKE, blob, ink, line, rng } from "../planets/kit";

// The person things happen to.
//
// The 12.5M-view video on this exact topic has an astronaut who waves his
// arms when the air gets thick and whose suit cracks and changes colour as
// the acid takes it. Ours had nobody in it at all — which is most of why it
// reads as a diagram with a voice over it rather than a story.
//
// So: one wonky figure, posable, who can sleep, stand, look, run, fall and
// be taken. Deliberately crude — it has to read at a glance and it has to
// look drawn by the same hand as everything else.

export type Pose =
  | "sleep" | "stand" | "look" | "point" | "run" | "fall" | "flail" | "drop" | "gone";

type Limb = { arm: [number, number]; leg: [number, number]; lean: number };

// Angles in degrees, measured from straight down. Left then right.
const POSES: Record<Pose, Limb> = {
  sleep: { arm: [82, -82], leg: [88, -88], lean: 90 },
  stand: { arm: [18, -18], leg: [10, -10], lean: 0 },
  look:  { arm: [26, -8],  leg: [12, -12], lean: -4 },
  point: { arm: [64, -18], leg: [12, -12], lean: 2 },
  run:   { arm: [58, -44], leg: [42, -30], lean: 12 },
  fall:  { arm: [128, -128], leg: [38, -20], lean: 18 },
  flail: { arm: [148, -140], leg: [26, -34], lean: -6 },
  // arms out near horizontal — reads as falling without sweeping
  // the limbs up through the head, which "fall" does at big scale
  drop:  { arm: [102, -102], leg: [34, -16], lean: 6 },
  gone:  { arm: [0, 0], leg: [0, 0], lean: 0 },
};

const limb = (x: number, y: number, deg: number, len: number) => {
  const r = ((deg + 180) * Math.PI) / 180;
  return [x + Math.sin(r) * len, y - Math.cos(r) * len] as const;
};

export const Figure: React.FC<{
  x: number;
  y: number;              // ground line — the feet stand here
  scale?: number;
  pose?: Pose;
  color?: string;
  seed?: number;
  /** 0 = untouched, 1 = fully taken. Fades the figure out and reddens it. */
  taken?: number;
  /** Adds a little life so a held pose doesn't look frozen. */
  breathe?: boolean;
}> = ({
  x, y, scale = 1, pose = "stand", color = ink, seed = 5,
  taken = 0, breathe = true,
}) => {
  const frame = useCurrentFrame();
  if (pose === "gone" || taken >= 1) return null;

  if (pose === "sleep") {
    const S = 180 * scale;
    const hr = 40 * scale;
    const st = { ...line(STROKE * scale * 0.9, color), strokeLinecap: "round" as const };
    const rise = breathe ? Math.sin(frame / 24) * 2 : 0;   // the chest
    const midY = y - hr * 0.55 + rise;
    const head = x + S * 0.42;
    return (
      <g opacity={1 - taken * 0.85}>
        <path d={blob(head + hr, midY - hr * 0.1, hr, seed, 0.05)} {...line(STROKE * scale * 0.9, color)} fill="none" />
        <path d={`M ${x - S * 0.38} ${midY} L ${head} ${midY}`} {...st} />
        {/* legs, trailing off the near end */}
        <path d={`M ${x - S * 0.38} ${midY} L ${x - S * 0.66} ${midY + S * 0.1}`} {...st} />
        <path d={`M ${x - S * 0.38} ${midY} L ${x - S * 0.64} ${midY - S * 0.06}`} {...st} />
        {/* one arm across the body */}
        <path d={`M ${x + S * 0.1} ${midY} L ${x - S * 0.04} ${midY + S * 0.16}`} {...st} />
      </g>
    );
  }

  const p = POSES[pose];
  const S = 180 * scale;                   // body height, head excluded
  const sway = breathe ? Math.sin(frame / 11) * 1.6 : 0;
  const wob = breathe ? Math.sin(frame / 7 + seed) * 1.1 : 0;

  // Lean tips the whole figure about its feet.
  const lean = p.lean + sway * 0.4;
  const headR = 46 * scale;
  const hipY = y - S * 0.46;
  const shoY = y - S * 0.92;
  const headY = shoY - headR * 0.95;

  const [alx, aly] = limb(x, shoY, p.arm[0] + wob, S * 0.46);
  const [arx, ary] = limb(x, shoY, p.arm[1] - wob, S * 0.46);
  const [llx, lly] = limb(x, hipY, p.leg[0], S * 0.5);
  const [lrx, lry] = limb(x, hipY, p.leg[1], S * 0.5);

  const stroke = { ...line(STROKE * scale * 0.9, color), strokeLinecap: "round" as const };
  const fade = 1 - taken * 0.85;
  const tint = taken > 0.02 ? "#c8402f" : color;

  return (
    <g
      opacity={fade}
      transform={`rotate(${lean} ${x} ${y})`}
    >
      {/* head */}
      <path d={blob(x, headY, headR, seed, 0.05)} {...line(STROKE * scale * 0.9, tint)} fill="none" />
      {/* spine */}
      <path d={`M ${x} ${shoY} L ${x} ${hipY}`} {...stroke} stroke={tint} />
      {/* arms */}
      <path d={`M ${x} ${shoY} L ${alx} ${aly}`} {...stroke} stroke={tint} />
      <path d={`M ${x} ${shoY} L ${arx} ${ary}`} {...stroke} stroke={tint} />
      {/* legs */}
      <path d={`M ${x} ${hipY} L ${llx} ${lly}`} {...stroke} stroke={tint} />
      <path d={`M ${x} ${hipY} L ${lrx} ${lry}`} {...stroke} stroke={tint} />
    </g>
  );
};

/** A bed, for the scene that opens the video. */
export const Bed: React.FC<{ x: number; y: number; w?: number; color?: string }> = ({
  x, y, w = 420, color = ink,
}) => {
  const h = w * 0.17;
  return (
    <g>
      <path d={`M ${x - w / 2} ${y} L ${x - w / 2} ${y - h * 1.9}`} {...line(STROKE, color)} />
      <path d={`M ${x + w / 2} ${y} L ${x + w / 2} ${y - h * 1.3}`} {...line(STROKE, color)} />
      <path
        d={`M ${x - w / 2} ${y - h} L ${x + w / 2} ${y - h} L ${x + w / 2} ${y - h * 0.1} L ${x - w / 2} ${y - h * 0.1} Z`}
        {...line(STROKE, color)}
        fill="#dfd8c8"
      />
      {/* pillow */}
      <path d={blob(x - w * 0.34, y - h * 1.28, w * 0.1, 12, 0.09)} {...line(STROKE - 1, color)} fill="#efe9dc" />
    </g>
  );
};

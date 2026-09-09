import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * The supporting cast: the crocodile that eats each vegetable, the four
 * animals that cheer at the board, and the little things that drift past
 * during the quiet beats between rounds.
 */

const OUT = "#2f5d2a";

/* ------------------------------------------------------------------ */
/* crocodile                                                           */
/* ------------------------------------------------------------------ */

/**
 * Walks on the grass with its jaw hinged open. `chomp` 0..1 closes it.
 * Drawn facing left (the direction it travels in the reference edit).
 */
export const Crocodile: React.FC<{ chomp?: number; step?: number }> = ({
  chomp = 0,
  step = 0,
}) => {
  const jaw = (1 - chomp) * 26;
  const bob = Math.sin(step) * 4;
  const legA = Math.sin(step) * 12;
  const legB = Math.sin(step + Math.PI) * 12;

  return (
    <g transform={`translate(0 ${bob})`}>
      {/* tail */}
      <path
        d="M 150 10 q 90 -6 118 -54 q 8 32 -18 58 q -32 32 -100 22 Z"
        fill="#5aa84f"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* legs */}
      <g stroke={OUT} strokeWidth={5} fill="#4c9a44">
        <path d={`M 62 46 q 6 30 ${-6 + legA} 40 l 26 2 l -4 -44 Z`} />
        <path d={`M 152 46 q 6 30 ${-6 + legB} 40 l 26 2 l -4 -44 Z`} />
      </g>
      {/* body */}
      <path
        d="M 26 4 q 40 -46 112 -42 q 66 4 92 40 q 12 40 -22 54 q -80 22 -160 4 q -36 -18 -22 -56 Z"
        fill="#57a44b"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* back ridges */}
      <g fill="#4a9440" stroke={OUT} strokeWidth={3.5}>
        {[52, 84, 116, 148, 180].map((x, i) => (
          <path key={i} d={`M ${x} -18 l 10 -20 l 10 20 Z`} />
        ))}
      </g>
      {/* belly stripes */}
      <g stroke="#f0b449" strokeWidth={5} strokeLinecap="round" opacity={0.85}>
        {[70, 96, 122, 148].map((x) => (
          <path key={x} d={`M ${x} 30 q 4 14 0 24`} />
        ))}
      </g>
      {/* lower jaw */}
      <g transform={`rotate(${jaw} 32 6)`}>
        <path
          d="M 32 6 q -60 4 -96 20 q 34 22 96 16 Z"
          fill="#f2c24e"
          stroke={OUT}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        <g fill="#ffffff">
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M ${-58 + i * 20} ${20 - i * 0.5} l 9 -14 l 9 14 Z`}
            />
          ))}
        </g>
      </g>
      {/* upper jaw + head */}
      <path
        d="M 40 -14 q -56 -8 -96 12 q 30 16 96 12 Z"
        fill="#5aa84f"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <g fill="#ffffff">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${-54 + i * 20} 8 l 9 -13 l 9 13 Z`} />
        ))}
      </g>
      <path
        d="M 6 -20 q 22 -34 52 -18 q 22 12 12 34 q -34 8 -64 -16 Z"
        fill="#5aa84f"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <circle cx={16} cy={-30} r={11} fill="#ffffff" stroke={OUT} strokeWidth={4} />
      <circle cx={46} cy={-30} r={11} fill="#ffffff" stroke={OUT} strokeWidth={4} />
      <circle cx={16} cy={-29} r={5} fill="#2a2520" />
      <circle cx={46} cy={-29} r={5} fill="#2a2520" />
      <g fill="#4a9440">
        <circle cx={-20} cy={-6} r={5} />
        <circle cx={-36} cy={-2} r={4} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* the four cheering animals                                           */
/* ------------------------------------------------------------------ */

const eyes = (gap: number, cy: number, r = 6) => (
  <>
    <circle cx={-gap} cy={cy} r={r} fill="#3a302a" />
    <circle cx={gap} cy={cy} r={r} fill="#3a302a" />
  </>
);

export const Cat: React.FC = () => (
  <g>
    <path d="M -44 -34 l -6 -44 l 40 20 Z" fill="#e8c9a0" stroke="#c8a172" strokeWidth={4} />
    <path d="M 44 -34 l 6 -44 l -40 20 Z" fill="#d79a5e" stroke="#c8a172" strokeWidth={4} />
    <ellipse cx={0} cy={30} rx={54} ry={48} fill="#f6ecdc" stroke="#c8a172" strokeWidth={4} />
    <path d="M 46 46 q 46 6 40 44 q -4 20 -22 12 q 12 -28 -22 -34 Z" fill="#e0b183" stroke="#c8a172" strokeWidth={4} />
    <ellipse cx={0} cy={-14} rx={54} ry={48} fill="#f8f0e2" stroke="#c8a172" strokeWidth={4} />
    <path d="M -54 -30 q 24 -22 46 -6 q -22 12 -46 6 Z" fill="#e0b183" />
    <path d="M 54 -30 q -24 -22 -46 -6 q 22 12 46 6 Z" fill="#d79a5e" />
    {eyes(20, -14)}
    <path d="M -6 0 q 6 6 12 0" stroke="#c07a5c" strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M -10 8 q 10 10 20 0" stroke="#3a302a" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    <g stroke="#c8a172" strokeWidth={3} strokeLinecap="round">
      <path d="M -26 4 l -34 -6 M -26 12 l -34 8 M 26 4 l 34 -6 M 26 12 l 34 8" />
    </g>
    <ellipse cx={-34} cy={2} rx={11} ry={7} fill="#f2b3a6" opacity={0.7} />
    <ellipse cx={34} cy={2} rx={11} ry={7} fill="#f2b3a6" opacity={0.7} />
  </g>
);

export const Frog: React.FC = () => (
  <g>
    <ellipse cx={0} cy={26} rx={58} ry={44} fill="#8ecf6a" stroke="#5aa348" strokeWidth={4} />
    <ellipse cx={0} cy={40} rx={34} ry={24} fill="#dff0bf" />
    <circle cx={-30} cy={-22} r={24} fill="#8ecf6a" stroke="#5aa348" strokeWidth={4} />
    <circle cx={30} cy={-22} r={24} fill="#8ecf6a" stroke="#5aa348" strokeWidth={4} />
    <circle cx={-30} cy={-22} r={12} fill="#ffffff" />
    <circle cx={30} cy={-22} r={12} fill="#ffffff" />
    <circle cx={-29} cy={-20} r={6} fill="#3a302a" />
    <circle cx={31} cy={-20} r={6} fill="#3a302a" />
    <path d="M -22 22 q 22 20 44 0" stroke="#4e9640" strokeWidth={4.5} fill="none" strokeLinecap="round" />
    <ellipse cx={-40} cy={16} rx={10} ry={6} fill="#f2b3a6" opacity={0.6} />
    <ellipse cx={40} cy={16} rx={10} ry={6} fill="#f2b3a6" opacity={0.6} />
    <g fill="#7cc25c" stroke="#5aa348" strokeWidth={4}>
      <ellipse cx={-52} cy={62} rx={20} ry={11} />
      <ellipse cx={52} cy={62} rx={20} ry={11} />
    </g>
  </g>
);

export const Penguin: React.FC = () => (
  <g>
    <ellipse cx={0} cy={10} rx={52} ry={62} fill="#4a4f74" stroke="#33375a" strokeWidth={4} />
    <ellipse cx={0} cy={22} rx={34} ry={46} fill="#f6f2e8" />
    <ellipse cx={-52} cy={16} rx={14} ry={34} fill="#3f4568" transform="rotate(12 -52 16)" />
    <ellipse cx={52} cy={16} rx={14} ry={34} fill="#3f4568" transform="rotate(-12 52 16)" />
    {eyes(18, -10, 6.5)}
    <path d="M -11 4 l 22 0 l -11 14 Z" fill="#f2a93c" />
    <ellipse cx={-32} cy={4} rx={11} ry={7} fill="#f2b3a6" opacity={0.7} />
    <ellipse cx={32} cy={4} rx={11} ry={7} fill="#f2b3a6" opacity={0.7} />
    <g fill="#f2a93c">
      <ellipse cx={-20} cy={70} rx={17} ry={8} />
      <ellipse cx={20} cy={70} rx={17} ry={8} />
    </g>
  </g>
);

export const Dog: React.FC = () => (
  <g>
    <ellipse cx={0} cy={44} rx={44} ry={38} fill="#e8cba2" stroke="#c9a274" strokeWidth={4} />
    <ellipse cx={-48} cy={-6} rx={20} ry={40} fill="#d2a97c" stroke="#c9a274" strokeWidth={4} />
    <ellipse cx={48} cy={-6} rx={20} ry={40} fill="#d2a97c" stroke="#c9a274" strokeWidth={4} />
    <ellipse cx={0} cy={-10} rx={50} ry={44} fill="#f0dcbc" stroke="#c9a274" strokeWidth={4} />
    {eyes(19, -14)}
    <ellipse cx={0} cy={8} rx={9} ry={7} fill="#4a3b30" />
    <path d="M -10 18 q 10 10 20 0" stroke="#4a3b30" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    <ellipse cx={-32} cy={4} rx={11} ry={7} fill="#f2b3a6" opacity={0.7} />
    <ellipse cx={32} cy={4} rx={11} ry={7} fill="#f2b3a6" opacity={0.7} />
  </g>
);

/* ------------------------------------------------------------------ */
/* drifters — one crosses the meadow at the top of every round          */
/* ------------------------------------------------------------------ */

export const Bee: React.FC = () => {
  const f = useCurrentFrame();
  const wing = 1 + Math.sin(f * 1.4) * 0.35;
  return (
    <g>
      <g transform={`scale(1 ${wing})`} opacity={0.75}>
        <ellipse cx={-6} cy={-16} rx={16} ry={9} fill="#dcecf2" stroke="#9fb8c2" strokeWidth={2} />
        <ellipse cx={12} cy={-18} rx={14} ry={8} fill="#dcecf2" stroke="#9fb8c2" strokeWidth={2} />
      </g>
      <ellipse cx={0} cy={0} rx={22} ry={16} fill="#f5cf4a" stroke="#3a302a" strokeWidth={3} />
      <path d="M -6 -14 q 4 28 0 30 M 8 -14 q 3 26 0 28" stroke="#3a302a" strokeWidth={4} fill="none" />
      <circle cx={-20} cy={-4} r={3} fill="#3a302a" />
      <path d="M -22 -14 q -6 -10 -14 -12 M -14 -16 q -2 -12 6 -16" stroke="#3a302a" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Butterfly: React.FC = () => {
  const f = useCurrentFrame();
  const flap = 0.55 + Math.abs(Math.sin(f * 0.42)) * 0.45;
  return (
    <g>
      <g transform={`scale(${flap} 1)`}>
        <path d="M -4 0 q -34 -32 -30 -10 q -22 -14 -12 12 q -14 12 12 18 q -6 20 30 -8 Z" fill="#f39ac0" stroke="#d9739f" strokeWidth={2.5} />
        <path d="M 4 0 q 34 -32 30 -10 q 22 -14 12 12 q 14 12 -12 18 q 6 20 -30 -8 Z" fill="#f39ac0" stroke="#d9739f" strokeWidth={2.5} />
        <g fill="#e4749f">
          <circle cx={-20} cy={-6} r={4} />
          <circle cx={20} cy={-6} r={4} />
          <circle cx={-16} cy={10} r={3} />
          <circle cx={16} cy={10} r={3} />
        </g>
      </g>
      <ellipse cx={0} cy={2} rx={4} ry={16} fill="#5d4a3c" />
      <path d="M -2 -14 q -6 -12 -12 -14 M 2 -14 q 6 -12 12 -14" stroke="#5d4a3c" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Kite: React.FC = () => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 14) * 8;
  return (
    <g transform={`rotate(${sway})`}>
      <path d="M 0 -46 L 34 0 L 0 46 L -34 0 Z" fill="#9fd4ea" stroke="#5f8fb0" strokeWidth={3.5} />
      <path d="M 0 -46 L 0 46 M -34 0 L 34 0" stroke="#5f8fb0" strokeWidth={3} />
      <path d="M 0 -46 L 34 0 L 0 0 Z" fill="#f5d95e" opacity={0.9} />
      <path d="M -34 0 L 0 46 L 0 0 Z" fill="#a8dfa0" opacity={0.9} />
      <path d="M 0 46 q 14 22 -6 34 q -20 12 -6 34" stroke="#5f8fb0" strokeWidth={3} fill="none" strokeLinecap="round" />
      <g fill="#7fa8c6">
        <path d="M 2 62 l 12 6 l -12 6 l -12 -6 Z" />
        <path d="M -8 96 l 12 6 l -12 6 l -12 -6 Z" />
      </g>
    </g>
  );
};

export const Airplane: React.FC = () => (
  <g>
    <path d="M -56 0 q 40 -18 96 -6 q 16 4 14 12 q -2 8 -18 10 q -54 8 -92 -10 Z" fill="#8fc4e6" stroke="#5f8fb0" strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -18 -4 q -12 -34 -2 -36 q 14 2 30 32 Z" fill="#b8dcf2" stroke="#5f8fb0" strokeWidth={3} />
    <path d="M -46 2 q -18 16 -10 20 q 12 2 24 -14 Z" fill="#b8dcf2" stroke="#5f8fb0" strokeWidth={3} />
    <circle cx={26} cy={2} r={6} fill="#f6f2e8" stroke="#5f8fb0" strokeWidth={2.5} />
    <circle cx={44} cy={3} r={5} fill="#f6f2e8" stroke="#5f8fb0" strokeWidth={2.5} />
  </g>
);

export const Snail: React.FC = () => (
  <g>
    <path d="M -46 14 q -14 0 -14 -12 q 0 -12 18 -12 q 14 0 20 6 q 4 -18 22 -18" stroke="#c9a274" strokeWidth={4} fill="#e6cba4" strokeLinejoin="round" />
    <path d="M -58 14 q 44 8 74 0 q 8 6 0 10 q -46 8 -76 -2 Z" fill="#e6cba4" stroke="#c9a274" strokeWidth={3.5} />
    <circle cx={8} cy={-6} r={30} fill="#e6a35c" stroke="#c07f3c" strokeWidth={4} />
    <path d="M 8 -6 m 0 -20 a 20 20 0 1 1 -14 34 a 13 13 0 1 1 12 -22" fill="none" stroke="#c07f3c" strokeWidth={4} strokeLinecap="round" />
    <path d="M -48 -8 q -4 -18 -14 -22 M -40 -8 q 2 -18 12 -22" stroke="#c9a274" strokeWidth={3} fill="none" strokeLinecap="round" />
    <circle cx={-62} cy={-32} r={4} fill="#3a302a" />
    <circle cx={-28} cy={-32} r={4} fill="#3a302a" />
    <circle cx={-52} cy={2} r={3} fill="#3a302a" />
  </g>
);

export const Crab: React.FC = () => {
  const f = useCurrentFrame();
  const claw = Math.sin(f / 6) * 14;
  return (
    <g>
      <g stroke="#c94b3e" strokeWidth={4} fill="#ef6a52" strokeLinejoin="round">
        <g transform={`rotate(${claw} -40 -6)`}>
          <path d="M -40 -6 q -22 -6 -30 -22 q 16 -6 26 4 q -10 -16 4 -22 q 10 12 8 30 Z" />
        </g>
        <g transform={`rotate(${-claw} 40 -6)`}>
          <path d="M 40 -6 q 22 -6 30 -22 q -16 -6 -26 4 q 10 -16 -4 -22 q -10 12 -8 30 Z" />
        </g>
      </g>
      <g stroke="#c94b3e" strokeWidth={4} strokeLinecap="round">
        <path d="M -30 14 l -22 16 M -26 22 l -18 20 M 30 14 l 22 16 M 26 22 l 18 20" />
      </g>
      <ellipse cx={0} cy={6} rx={40} ry={26} fill="#ef6a52" stroke="#c94b3e" strokeWidth={4} />
      <circle cx={-14} cy={-16} r={8} fill="#ffffff" stroke="#c94b3e" strokeWidth={3} />
      <circle cx={14} cy={-16} r={8} fill="#ffffff" stroke="#c94b3e" strokeWidth={3} />
      <circle cx={-14} cy={-15} r={4} fill="#3a302a" />
      <circle cx={14} cy={-15} r={4} fill="#3a302a" />
      <path d="M -10 12 q 10 8 20 0" stroke="#c94b3e" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Bunny: React.FC = () => (
  <g>
    <ellipse cx={10} cy={16} rx={38} ry={28} fill="#f6ece0" stroke="#d9c3a8" strokeWidth={4} />
    <circle cx={44} cy={10} r={11} fill="#f6ece0" stroke="#d9c3a8" strokeWidth={4} />
    <ellipse cx={-26} cy={0} rx={26} ry={22} fill="#f8f2ea" stroke="#d9c3a8" strokeWidth={4} />
    <ellipse cx={-30} cy={-32} rx={8} ry={26} fill="#f8f2ea" stroke="#d9c3a8" strokeWidth={4} transform="rotate(-12 -30 -32)" />
    <ellipse cx={-12} cy={-34} rx={8} ry={26} fill="#f8f2ea" stroke="#d9c3a8" strokeWidth={4} transform="rotate(8 -12 -34)" />
    <circle cx={-38} cy={-2} r={4} fill="#3a302a" />
    <ellipse cx={-48} cy={6} rx={5} ry={4} fill="#f0a9a0" />
    <ellipse cx={-16} cy={8} rx={9} ry={6} fill="#f2b3a6" opacity={0.6} />
    <g stroke="#d9c3a8" strokeWidth={4} strokeLinecap="round">
      <path d="M -4 40 l -4 10 M 22 42 l 2 10" />
    </g>
  </g>
);

export const Dino: React.FC = () => (
  <g>
    <path d="M -80 30 q -34 -4 -54 -34 q 34 -6 54 8 Z" fill="#7cc25c" stroke="#4e9640" strokeWidth={4} />
    <ellipse cx={0} cy={16} rx={70} ry={44} fill="#8ecf6a" stroke="#4e9640" strokeWidth={4} />
    <g fill="#5aa84f" stroke="#4e9640" strokeWidth={3}>
      {[-40, -14, 12, 38].map((x, i) => (
        <path key={i} d={`M ${x} -24 l 12 -22 l 12 22 Z`} />
      ))}
    </g>
    <ellipse cx={62} cy={-16} rx={34} ry={28} fill="#8ecf6a" stroke="#4e9640" strokeWidth={4} />
    <circle cx={70} cy={-24} r={6} fill="#3a302a" />
    <path d="M 78 -6 q 12 6 16 0" stroke="#4e9640" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    <g fill="#7cc25c" stroke="#4e9640" strokeWidth={4}>
      <path d="M -24 52 q -4 22 4 26 l 24 0 q -8 -12 -6 -26 Z" />
      <path d="M 24 52 q -4 22 4 26 l 24 0 q -8 -12 -6 -26 Z" />
    </g>
    <ellipse cx={0} cy={26} rx={40} ry={22} fill="#c8e9a0" opacity={0.6} />
  </g>
);

export const Ladybug: React.FC = () => (
  <g>
    <path d="M -8 -22 q -8 -16 -20 -18 M 8 -22 q 8 -16 20 -18" stroke="#3a302a" strokeWidth={3} fill="none" strokeLinecap="round" />
    <circle cx={-28} cy={-42} r={4} fill="#3a302a" />
    <circle cx={28} cy={-42} r={4} fill="#3a302a" />
    <ellipse cx={0} cy={0} rx={32} ry={28} fill="#ef5b52" stroke="#c94b3e" strokeWidth={3.5} />
    <path d="M 0 -28 q -30 0 -32 22 q 0 -20 0 -22 Z" fill="#3a302a" />
    <path d="M -32 -6 q 32 -10 64 0" stroke="#3a302a" strokeWidth={3.5} fill="none" />
    <path d="M 0 -28 L 0 28" stroke="#3a302a" strokeWidth={3.5} />
    <g fill="#3a302a">
      <circle cx={-16} cy={6} r={6} />
      <circle cx={16} cy={6} r={6} />
      <circle cx={-14} cy={-14} r={5} />
      <circle cx={14} cy={-14} r={5} />
    </g>
    <ellipse cx={0} cy={-22} rx={20} ry={12} fill="#3a302a" />
    <circle cx={-8} cy={-24} r={3.5} fill="#f6f2e8" />
    <circle cx={8} cy={-24} r={3.5} fill="#f6f2e8" />
  </g>
);

export type DrifterId =
  | "bee"
  | "butterfly"
  | "kite"
  | "airplane"
  | "snail"
  | "crab"
  | "bunny"
  | "dino"
  | "ladybug";

export const DRIFTERS: Record<DrifterId, React.FC> = {
  bee: Bee,
  butterfly: Butterfly,
  kite: Kite,
  airplane: Airplane,
  snail: Snail,
  crab: Crab,
  bunny: Bunny,
  dino: Dino,
  ladybug: Ladybug,
};

/** Drifters that fly (higher path) vs. ones that walk the grass line. */
export const DRIFTER_FLIES: Record<DrifterId, boolean> = {
  bee: true,
  butterfly: true,
  kite: true,
  airplane: true,
  snail: false,
  crab: false,
  bunny: false,
  dino: false,
  ladybug: false,
};

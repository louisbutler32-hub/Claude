import React from "react";

/**
 * The characters that walk the path. Each is drawn facing right in a
 * ~400×400 box with the ground at y = 0 and the feet on it, outlined heavy
 * so it pops off a busy scene the way a sticker does. `phase` is the gait
 * clock in radians: it drives legs, bob, tail — the character stays put and
 * the walk cycle loops, matching the reference's waddle-in-place.
 */

export type AnimalId = "cat" | "frog";

export type AnimalProps = { phase: number };

export type AnimalSpec = {
  id: AnimalId;
  /** Plural noun for the title: "Find 10 cats". */
  plural: string;
  /** Height of the drawing in its own units, ground to top. */
  height: number;
  /** How tall the front (nearest) one stands on screen, in pixels. */
  frontHeight: number;
  /** Ground-shadow ellipse: centre x and radii. */
  shadow: { cx: number; rx: number; ry: number };
  /** Gait cycle length in frames. */
  cycle: number;
  Art: React.FC<AnimalProps>;
};

const INK = "#231810";
const SW = 9;

/* ------------------------------------------------------------------ */
/* cat — an orange tabby, stub legs, tail up                            */
/* ------------------------------------------------------------------ */

const CAT = {
  fur: "#f5a23a",
  furDark: "#d9822a",
  stripe: "#c66a1c",
  cream: "#fde9c7",
  pink: "#f28aa0",
};

const Leg: React.FC<{ x: number; hipY: number; angle: number; dark?: boolean }> = ({
  x,
  hipY,
  angle,
  dark,
}) => (
  <g transform={`rotate(${angle} ${x} ${hipY})`}>
    <rect
      x={x - 27}
      y={hipY}
      width={54}
      height={-hipY + 4}
      rx={24}
      fill={dark ? CAT.furDark : CAT.fur}
      stroke={INK}
      strokeWidth={SW}
    />
  </g>
);

export const CatArt: React.FC<AnimalProps> = ({ phase }) => {
  const swing = Math.sin(phase) * 24;
  const bob = -Math.abs(Math.sin(phase)) * 10;
  const tailWag = Math.sin(phase * 0.5 + 1) * 10;
  return (
    <g transform={`translate(0 ${bob})`}>
      {/* tail */}
      <g transform={`rotate(${tailWag} -120 -150)`}>
        <path
          d="M -120 -150 C -220 -170 -250 -260 -200 -330"
          fill="none"
          stroke={INK}
          strokeWidth={52}
          strokeLinecap="round"
        />
        <path
          d="M -120 -150 C -220 -170 -250 -260 -200 -330"
          fill="none"
          stroke={CAT.fur}
          strokeWidth={34}
          strokeLinecap="round"
        />
        <path
          d="M -205 -232 c 10 -16 20 -20 34 -18 M -218 -290 c 10 -16 22 -18 34 -14"
          fill="none"
          stroke={CAT.stripe}
          strokeWidth={9}
          strokeLinecap="round"
        />
      </g>
      {/* far legs */}
      <Leg x={-78} hipY={-120} angle={-swing} dark />
      <Leg x={62} hipY={-120} angle={swing} dark />
      {/* near legs */}
      <Leg x={-108} hipY={-120} angle={swing} />
      <Leg x={92} hipY={-120} angle={-swing} />
      {/* body */}
      <ellipse cx={0} cy={-160} rx={158} ry={104} fill={CAT.fur} stroke={INK} strokeWidth={SW} />
      <ellipse cx={20} cy={-112} rx={100} ry={44} fill={CAT.cream} />
      <g fill="none" stroke={CAT.stripe} strokeWidth={13} strokeLinecap="round">
        <path d="M -70 -258 q 8 40 -6 74" />
        <path d="M -20 -262 q 10 42 -2 78" />
        <path d="M 30 -258 q 10 40 2 74" />
      </g>
      {/* head */}
      <g transform={`rotate(${Math.sin(phase) * 3} 130 -230)`}>
        <path d="M 62 -300 L 78 -392 L 136 -318 Z" fill={CAT.fur} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M 152 -318 L 196 -394 L 212 -298 Z" fill={CAT.fur} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M 82 -318 L 88 -362 L 118 -324 Z" fill={CAT.pink} />
        <path d="M 168 -322 L 190 -364 L 198 -316 Z" fill={CAT.pink} />
        <circle cx={130} cy={-230} r={100} fill={CAT.fur} stroke={INK} strokeWidth={SW} />
        <path d="M 96 -318 q 10 28 -2 52 M 132 -326 q 10 30 0 56" fill="none" stroke={CAT.stripe} strokeWidth={11} strokeLinecap="round" />
        <ellipse cx={176} cy={-196} rx={52} ry={38} fill={CAT.cream} />
        {/* eyes */}
        <ellipse cx={100} cy={-240} rx={19} ry={22} fill="#fff" stroke={INK} strokeWidth={6} />
        <ellipse cx={162} cy={-240} rx={19} ry={22} fill="#fff" stroke={INK} strokeWidth={6} />
        <circle cx={106} cy={-238} r={10} fill={INK} />
        <circle cx={168} cy={-238} r={10} fill={INK} />
        <circle cx={110} cy={-244} r={3.5} fill="#fff" />
        <circle cx={172} cy={-244} r={3.5} fill="#fff" />
        {/* nose + mouth */}
        <path d="M 168 -208 l 24 0 l -12 14 Z" fill={CAT.pink} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 180 -194 q 0 14 -14 12 M 180 -194 q 0 14 14 12" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        {/* whiskers */}
        <g stroke={INK} strokeWidth={4} strokeLinecap="round">
          <path d="M 200 -214 l 48 -12 M 204 -200 l 50 2 M 200 -186 l 46 14" />
          <path d="M 60 -214 l -40 -12 M 58 -200 l -42 2 M 60 -186 l -38 14" opacity={0.7} />
        </g>
        <ellipse cx={76} cy={-198} rx={16} ry={9} fill={CAT.pink} opacity={0.55} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* frog — a fat green frog that hops in place                          */
/* ------------------------------------------------------------------ */

const FROG = {
  skin: "#6fc248",
  skinDark: "#4f9e34",
  belly: "#e9f4c4",
  blush: "#f2a3a3",
};

/** 0..1 within a hop: crouch, launch, hang, land. */
const hopCurve = (u: number) => {
  // airborne for the first 55% of the cycle, resting for the rest
  if (u < 0.55) {
    const a = u / 0.55;
    return Math.sin(Math.PI * a);
  }
  return 0;
};

export const FrogArt: React.FC<AnimalProps> = ({ phase }) => {
  const u = ((phase / (2 * Math.PI)) % 1 + 1) % 1;
  const air = hopCurve(u); // 0 on ground, 1 at apex
  const squash = u > 0.55 ? 1 - 0.08 * Math.sin(((u - 0.55) / 0.45) * Math.PI) : 1;
  const lift = -air * 70;
  const tilt = -air * 14;
  const legStretch = air; // 0 folded, 1 extended
  const blink = u > 0.8 && u < 0.86 ? 0.15 : 1;
  return (
    <g transform={`translate(0 ${lift}) rotate(${tilt} 0 -100)`}>
      <g transform={`translate(0 0) scale(${1 + (1 - squash) * 0.6} ${squash})`}>
        {/* back leg (behind body): thigh, shin, three toes */}
        <g transform={`rotate(${-legStretch * 40} -90 -90)`}>
          <ellipse cx={-120} cy={-70} rx={74} ry={48} fill={FROG.skinDark} stroke={INK} strokeWidth={SW} />
          <path d="M -150 -50 q -40 20 -40 50" fill="none" stroke={INK} strokeWidth={34} strokeLinecap="round" />
          <path d="M -150 -50 q -40 20 -40 50" fill="none" stroke={FROG.skinDark} strokeWidth={18} strokeLinecap="round" />
          <path d="M -190 0 l -44 0 M -190 0 l -36 -16 M -190 0 l -20 -28" fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
          <path d="M -190 0 l -44 0 M -190 0 l -36 -16 M -190 0 l -20 -28" fill="none" stroke={FROG.skinDark} strokeWidth={9} strokeLinecap="round" />
        </g>
        {/* near back foot peeking out under the belly */}
        <path d="M -40 0 l -40 0 M -40 0 l -30 -14" fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
        <path d="M -40 0 l -40 0 M -40 0 l -30 -14" fill="none" stroke={FROG.skin} strokeWidth={9} strokeLinecap="round" />
        {/* body */}
        <ellipse cx={0} cy={-118} rx={158} ry={100} fill={FROG.skin} stroke={INK} strokeWidth={SW} />
        <ellipse cx={40} cy={-84} rx={100} ry={48} fill={FROG.belly} />
        <g fill={FROG.skinDark} opacity={0.6}>
          <circle cx={-70} cy={-160} r={12} />
          <circle cx={-20} cy={-190} r={9} />
          <circle cx={-110} cy={-120} r={8} />
        </g>
        {/* front arm */}
        <g transform={`rotate(${legStretch * 25} 100 -90)`}>
          <path d="M 100 -90 q 30 40 34 86" fill="none" stroke={INK} strokeWidth={38} strokeLinecap="round" />
          <path d="M 100 -90 q 30 40 34 86" fill="none" stroke={FROG.skin} strokeWidth={20} strokeLinecap="round" />
          <path d="M 134 -4 l 34 -8 M 134 -4 l 32 6 M 134 -4 l 14 14" fill="none" stroke={INK} strokeWidth={18} strokeLinecap="round" />
          <path d="M 134 -4 l 34 -8 M 134 -4 l 32 6 M 134 -4 l 14 14" fill="none" stroke={FROG.skin} strokeWidth={7} strokeLinecap="round" />
        </g>
        {/* eyes */}
        <circle cx={70} cy={-208} r={46} fill={FROG.skin} stroke={INK} strokeWidth={SW} />
        <circle cx={150} cy={-200} r={46} fill={FROG.skin} stroke={INK} strokeWidth={SW} />
        <ellipse cx={74} cy={-206} rx={30} ry={30 * blink} fill="#fff" stroke={INK} strokeWidth={5} />
        <ellipse cx={154} cy={-198} rx={30} ry={30 * blink} fill="#fff" stroke={INK} strokeWidth={5} />
        <ellipse cx={80} cy={-204} rx={15} ry={17 * blink} fill={INK} />
        <ellipse cx={160} cy={-196} rx={15} ry={17 * blink} fill={INK} />
        <circle cx={86} cy={-212} r={4.5} fill="#fff" opacity={blink} />
        <circle cx={166} cy={-204} r={4.5} fill="#fff" opacity={blink} />
        {/* mouth + cheeks */}
        <path d="M 30 -132 q 80 44 170 -4" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <ellipse cx={186} cy={-148} rx={20} ry={12} fill={FROG.blush} opacity={0.6} />
        <ellipse cx={28} cy={-152} rx={18} ry={11} fill={FROG.blush} opacity={0.6} />
      </g>
    </g>
  );
};

export const ANIMALS: Record<AnimalId, AnimalSpec> = {
  cat: {
    id: "cat",
    plural: "cats",
    height: 394,
    frontHeight: 600,
    shadow: { cx: 20, rx: 190, ry: 26 },
    cycle: 16,
    Art: CatArt,
  },
  frog: {
    id: "frog",
    plural: "frogs",
    height: 254,
    frontHeight: 500,
    shadow: { cx: 10, rx: 180, ry: 26 },
    cycle: 34,
    Art: FrogArt,
  },
};

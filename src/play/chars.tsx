import React from "react";

/**
 * The cast of the interactive Shorts line — four chibi characters in the
 * reference look: one flat pastel fill, a thick outline in a darker shade
 * of that same colour, a lighter belly patch, dot eyes, a tiny mouth, no
 * black anywhere. Bodies are about 200 units wide; the origin is the
 * bottom-centre of the body (where it stands), so `translate(x, groundY)`
 * puts a character on the floor.
 *
 *   Pebblo   the channel's pebble — grey stone, moss tuft, chipped corner
 *   Capy     a capybara — loaf-shaped, warm tan, always unbothered
 *   Bun      a lilac bunny — long ears, the fastest of the four
 *   Mint     a mint-green frog — wide mouth, two eye bumps
 *
 * Every character takes the same `Pose`, so the two formats animate the
 * cast with one vocabulary.
 */

export type Eyes = "open" | "happy" | "shock" | "dizzy" | "closed";
export type Mouth = "smile" | "open" | "o" | "flat" | "grin";

export type Pose = {
  eyes?: Eyes;
  mouth?: Mouth;
  /** arm end points relative to the shoulder, in body units */
  armL?: [number, number];
  armR?: [number, number];
  /** vertical squash (1 = rest); climbing and landing use it */
  squash?: number;
  /** whole-body tilt in degrees */
  tilt?: number;
  /** eye offset, for looking around */
  look?: [number, number];
  blush?: boolean;
  /** seen from behind — no face, no belly; how the reference draws a climber */
  back?: boolean;
  /** absolute hand positions in body coords; override armL/armR (gripping a rope) */
  handL?: [number, number];
  handR?: [number, number];
};

export const REST: Required<Pick<Pose, "armL" | "armR">> = {
  armL: [-40, 30],
  armR: [40, 30],
};

export type CharId = "pebblo" | "capy" | "bun" | "mint";

export const CHAR_NAME: Record<CharId, string> = {
  pebblo: "Pebblo",
  capy: "Capy",
  bun: "Bun",
  mint: "Mint",
};

/** Fill, outline (a darker shade of the fill), and belly patch per character. */
export const CHAR_COLOURS: Record<CharId, { fill: string; line: string; belly: string; accent: string }> = {
  pebblo: { fill: "#d9d2c6", line: "#6d6259", belly: "#ece7de", accent: "#7cc25c" },
  capy: { fill: "#d9a870", line: "#7d5a30", belly: "#efd2a6", accent: "#6b4a28" },
  bun: { fill: "#cbb6ea", line: "#6b4fa6", belly: "#e9def7", accent: "#f2a0c0" },
  mint: { fill: "#a6e0c6", line: "#2f8a68", belly: "#daf3e6", accent: "#2f8a68" },
};

const EYE = "#3b3346";
const LW = 7;

/* ------------------------------------------------------------------ */
/* shared face parts                                                   */
/* ------------------------------------------------------------------ */

const FaceEyes: React.FC<{ eyes: Eyes; gap: number; cy: number; r?: number; look: [number, number]; line: string }> = ({
  eyes,
  gap,
  cy,
  r = 9,
  look,
  line,
}) => {
  const lx = look[0] * 5;
  const ly = look[1] * 4;
  switch (eyes) {
    case "happy":
      return (
        <g stroke={EYE} strokeWidth={6} fill="none" strokeLinecap="round">
          <path d={`M ${-gap - 12} ${cy + 4} q 12 -14 24 0`} />
          <path d={`M ${gap - 12} ${cy + 4} q 12 -14 24 0`} />
        </g>
      );
    case "closed":
      return (
        <g stroke={EYE} strokeWidth={6} fill="none" strokeLinecap="round">
          <path d={`M ${-gap - 12} ${cy} q 12 8 24 0`} />
          <path d={`M ${gap - 12} ${cy} q 12 8 24 0`} />
        </g>
      );
    case "shock":
      return (
        <g>
          <circle cx={-gap} cy={cy} r={r + 6} fill="#ffffff" stroke={line} strokeWidth={4} />
          <circle cx={gap} cy={cy} r={r + 6} fill="#ffffff" stroke={line} strokeWidth={4} />
          <circle cx={-gap + lx} cy={cy + ly} r={r * 0.6} fill={EYE} />
          <circle cx={gap + lx} cy={cy + ly} r={r * 0.6} fill={EYE} />
        </g>
      );
    case "dizzy":
      return (
        <g stroke={EYE} strokeWidth={5} fill="none" strokeLinecap="round">
          <path d={`M ${-gap - 9} ${cy - 9} l 18 18 M ${-gap + 9} ${cy - 9} l -18 18`} />
          <path d={`M ${gap - 9} ${cy - 9} l 18 18 M ${gap + 9} ${cy - 9} l -18 18`} />
        </g>
      );
    default:
      return (
        <g>
          <circle cx={-gap + lx} cy={cy + ly} r={r} fill={EYE} />
          <circle cx={gap + lx} cy={cy + ly} r={r} fill={EYE} />
          <circle cx={-gap + lx - 3} cy={cy + ly - 3} r={r * 0.28} fill="#ffffff" />
          <circle cx={gap + lx - 3} cy={cy + ly - 3} r={r * 0.28} fill="#ffffff" />
        </g>
      );
  }
};

const FaceMouth: React.FC<{ mouth: Mouth; cy: number; line: string; w?: number }> = ({ mouth, cy, line, w = 12 }) => {
  switch (mouth) {
    case "open":
      return <path d={`M ${-w} ${cy} q ${w} ${w * 1.9} ${w * 2} 0 Z`} fill="#7a3c4c" stroke={line} strokeWidth={4} strokeLinejoin="round" />;
    case "o":
      return <ellipse cx={0} cy={cy + 6} rx={w * 0.6} ry={w * 0.75} fill="#7a3c4c" stroke={line} strokeWidth={4} />;
    case "flat":
      return <path d={`M ${-w} ${cy + 2} l ${w * 2} 0`} stroke={line} strokeWidth={5} fill="none" strokeLinecap="round" />;
    case "grin":
      return <path d={`M ${-w * 1.6} ${cy - 2} q ${w * 1.6} ${w * 1.6} ${w * 3.2} 0`} stroke={line} strokeWidth={5} fill="none" strokeLinecap="round" />;
    default:
      return <path d={`M ${-w} ${cy} q ${w} ${w * 0.9} ${w * 2} 0`} stroke={line} strokeWidth={5} fill="none" strokeLinecap="round" />;
  }
};

const Blush: React.FC<{ gap: number; cy: number }> = ({ gap, cy }) => (
  <g fill="#f29aa8" opacity={0.55}>
    <ellipse cx={-gap} cy={cy} rx={13} ry={8} />
    <ellipse cx={gap} cy={cy} rx={13} ry={8} />
  </g>
);

/** A stubby arm: a thick stroke from the shoulder to the hand, hand as a dot. */
const Arm: React.FC<{ from: [number, number]; to: [number, number]; fill: string; line: string }> = ({ from, to, fill, line }) => (
  <g>
    <path
      d={`M ${from[0]} ${from[1]} Q ${(from[0] + to[0]) / 2} ${(from[1] + to[1]) / 2 + 6} ${to[0]} ${to[1]}`}
      stroke={line}
      strokeWidth={LW + 12}
      fill="none"
      strokeLinecap="round"
    />
    <path
      d={`M ${from[0]} ${from[1]} Q ${(from[0] + to[0]) / 2} ${(from[1] + to[1]) / 2 + 6} ${to[0]} ${to[1]}`}
      stroke={fill}
      strokeWidth={LW + 2}
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

const Feet: React.FC<{ y: number; gap: number; fill: string; line: string; rx?: number }> = ({ y, gap, fill, line, rx = 22 }) => (
  <g fill={fill} stroke={line} strokeWidth={LW - 1}>
    <ellipse cx={-gap} cy={y} rx={rx} ry={11} />
    <ellipse cx={gap} cy={y} rx={rx} ry={11} />
  </g>
);

const wrap = (pose: Pose, children: React.ReactNode) => (
  <g transform={`rotate(${pose.tilt ?? 0}) scale(1 ${pose.squash ?? 1})`}>{children}</g>
);

/* ------------------------------------------------------------------ */
/* Pebblo                                                              */
/* ------------------------------------------------------------------ */

export const Pebblo: React.FC<Pose> = (pose) => {
  const c = CHAR_COLOURS.pebblo;
  const { eyes = "open", mouth = "smile", armL = REST.armL, armR = REST.armR, look = [0, 0], blush = true } = pose;
  const SH: [number, number] = [-70, -92];
  const SR: [number, number] = [70, -92];
  const hl: [number, number] = pose.handL ?? [SH[0] + armL[0], SH[1] + armL[1]];
  const hr: [number, number] = pose.handR ?? [SR[0] + armR[0], SR[1] + armR[1]];
  const back = !!pose.back;
  return wrap(
    pose,
    <g>
      <Feet y={-8} gap={40} fill={c.fill} line={c.line} />
      <Arm from={SH} to={hl} fill={c.fill} line={c.line} />
      <Arm from={SR} to={hr} fill={c.fill} line={c.line} />
      {/* the stone, with a chipped top-left corner */}
      <path
        d="M -86 -70 q 6 -84 58 -104 q 60 -14 100 30 q 26 46 10 96 q -28 42 -90 40 q -74 -4 -86 -56 q -4 -20 4 -34 l 12 -8 Z"
        fill={c.fill}
        stroke={c.line}
        strokeWidth={LW}
        strokeLinejoin="round"
      />
      {back ? (
        <path d="M -30 -140 q 40 -20 70 8" stroke={c.belly} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.8} />
      ) : (
        <>
          <path d="M -44 -84 q 34 -14 68 6 q -12 44 -34 62 q -30 -16 -34 -68 Z" fill={c.belly} opacity={0.9} />
          <g fill="#a89f92">
            <circle cx={-52} cy={-70} r={3} />
            <circle cx={-62} cy={-58} r={2.5} />
            <circle cx={58} cy={-66} r={3} />
            <circle cx={68} cy={-54} r={2.5} />
          </g>
        </>
      )}
      {/* moss tuft */}
      <path
        d="M -36 -160 q 6 -34 36 -26 q 6 -30 34 -14 q 20 -14 30 8 q -26 -6 -44 6 q -20 -14 -56 26 Z"
        fill={c.accent}
        stroke="#4f8c35"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {back ? null : (
        <>
          {blush ? <Blush gap={46} cy={-72} /> : null}
          <FaceEyes eyes={eyes} gap={26} cy={-98} r={10} look={look} line={c.line} />
          <FaceMouth mouth={mouth} cy={-72} line={c.line} />
        </>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Capy                                                                */
/* ------------------------------------------------------------------ */

export const Capy: React.FC<Pose> = (pose) => {
  const c = CHAR_COLOURS.capy;
  const { eyes = "open", mouth = "flat", armL = REST.armL, armR = REST.armR, look = [0, 0], blush = true } = pose;
  const SH: [number, number] = [-74, -86];
  const SR: [number, number] = [74, -86];
  const hl: [number, number] = pose.handL ?? [SH[0] + armL[0], SH[1] + armL[1]];
  const hr: [number, number] = pose.handR ?? [SR[0] + armR[0], SR[1] + armR[1]];
  const back = !!pose.back;
  return wrap(
    pose,
    <g>
      <Feet y={-8} gap={44} fill={c.fill} line={c.line} rx={24} />
      <Arm from={SH} to={hl} fill={c.fill} line={c.line} />
      <Arm from={SR} to={hr} fill={c.fill} line={c.line} />
      {/* ears */}
      <g fill={c.fill} stroke={c.line} strokeWidth={LW}>
        <circle cx={-66} cy={-172} r={20} />
        <circle cx={66} cy={-172} r={20} />
      </g>
      {/* loaf body: flat top, rounded */}
      <path
        d="M -96 -60 q -6 -110 40 -128 q 56 -12 112 0 q 46 18 40 128 q -4 50 -96 50 q -92 0 -96 -50 Z"
        fill={c.fill}
        stroke={c.line}
        strokeWidth={LW}
        strokeLinejoin="round"
      />
      {back ? (
        <>
          <path d="M -50 -150 q 50 -16 100 0" stroke={c.belly} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.6} />
        </>
      ) : (
        <>
          <ellipse cx={0} cy={-38} rx={56} ry={30} fill={c.belly} opacity={0.9} />
          {/* snout */}
          <ellipse cx={0} cy={-92} rx={46} ry={28} fill={c.belly} />
          <ellipse cx={-14} cy={-100} rx={6} ry={4} fill={c.accent} />
          <ellipse cx={14} cy={-100} rx={6} ry={4} fill={c.accent} />
          {blush ? <Blush gap={62} cy={-96} /> : null}
          <FaceEyes eyes={eyes} gap={44} cy={-124} r={8} look={look} line={c.line} />
          <FaceMouth mouth={mouth} cy={-84} line={c.line} w={10} />
        </>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Bun                                                                 */
/* ------------------------------------------------------------------ */

export const Bun: React.FC<Pose> = (pose) => {
  const c = CHAR_COLOURS.bun;
  const { eyes = "open", mouth = "smile", armL = REST.armL, armR = REST.armR, look = [0, 0], blush = true } = pose;
  const SH: [number, number] = [-66, -84];
  const SR: [number, number] = [66, -84];
  const hl: [number, number] = pose.handL ?? [SH[0] + armL[0], SH[1] + armL[1]];
  const hr: [number, number] = pose.handR ?? [SR[0] + armR[0], SR[1] + armR[1]];
  const back = !!pose.back;
  return wrap(
    pose,
    <g>
      <Feet y={-8} gap={40} fill={c.fill} line={c.line} rx={24} />
      <Arm from={SH} to={hl} fill={c.fill} line={c.line} />
      <Arm from={SR} to={hr} fill={c.fill} line={c.line} />
      {/* ears */}
      <g stroke={c.line} strokeWidth={LW} strokeLinejoin="round">
        <path d="M -44 -150 q -36 -70 -14 -128 q 34 30 40 122 Z" fill={c.fill} />
        <path d="M 44 -150 q 36 -70 14 -128 q -34 30 -40 122 Z" fill={c.fill} />
      </g>
      {back ? null : (
        <g fill={c.accent} opacity={0.8}>
          <path d="M -40 -160 q -24 -56 -12 -100 q 22 30 26 96 Z" />
          <path d="M 40 -160 q 24 -56 12 -100 q -22 30 -26 96 Z" />
        </g>
      )}
      {/* round body */}
      <path
        d="M -84 -70 q 0 -96 84 -96 q 84 0 84 96 q 0 74 -84 74 q -84 0 -84 -74 Z"
        fill={c.fill}
        stroke={c.line}
        strokeWidth={LW}
        strokeLinejoin="round"
      />
      {back ? (
        <>
          {/* cotton tail */}
          <circle cx={0} cy={-26} r={24} fill="#ffffff" stroke={c.line} strokeWidth={5} />
        </>
      ) : (
        <>
          <ellipse cx={0} cy={-36} rx={48} ry={30} fill={c.belly} opacity={0.9} />
          {blush ? <Blush gap={48} cy={-82} /> : null}
          <FaceEyes eyes={eyes} gap={28} cy={-104} r={9} look={look} line={c.line} />
          <ellipse cx={0} cy={-86} rx={7} ry={5} fill={c.accent} />
          <FaceMouth mouth={mouth} cy={-78} line={c.line} w={9} />
        </>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Mint                                                                */
/* ------------------------------------------------------------------ */

export const Mint: React.FC<Pose> = (pose) => {
  const c = CHAR_COLOURS.mint;
  const { eyes = "open", mouth = "grin", armL = REST.armL, armR = REST.armR, look = [0, 0], blush = true } = pose;
  const SH: [number, number] = [-78, -78];
  const SR: [number, number] = [78, -78];
  const hl: [number, number] = pose.handL ?? [SH[0] + armL[0], SH[1] + armL[1]];
  const hr: [number, number] = pose.handR ?? [SR[0] + armR[0], SR[1] + armR[1]];
  const back = !!pose.back;
  return wrap(
    pose,
    <g>
      <Feet y={-8} gap={50} fill={c.fill} line={c.line} rx={28} />
      <Arm from={SH} to={hl} fill={c.fill} line={c.line} />
      <Arm from={SR} to={hr} fill={c.fill} line={c.line} />
      {/* eye bumps */}
      <g fill={c.fill} stroke={c.line} strokeWidth={LW}>
        <circle cx={-54} cy={-140} r={30} />
        <circle cx={54} cy={-140} r={30} />
      </g>
      {/* wide body */}
      <path
        d="M -100 -60 q -4 -90 100 -90 q 104 0 100 90 q -2 64 -100 64 q -98 0 -100 -64 Z"
        fill={c.fill}
        stroke={c.line}
        strokeWidth={LW}
        strokeLinejoin="round"
      />
      {back ? (
        <>
          <g fill={c.line} opacity={0.25}>
            <circle cx={-30} cy={-80} r={12} />
            <circle cx={24} cy={-100} r={9} />
            <circle cx={40} cy={-56} r={11} />
          </g>
        </>
      ) : (
        <>
          <ellipse cx={0} cy={-30} rx={60} ry={28} fill={c.belly} opacity={0.9} />
          {blush ? <Blush gap={62} cy={-86} /> : null}
          <FaceEyes eyes={eyes} gap={54} cy={-138} r={9} look={look} line={c.line} />
          <FaceMouth mouth={mouth} cy={-92} line={c.line} w={14} />
        </>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */

export const CHAR: Record<CharId, React.FC<Pose>> = {
  pebblo: Pebblo,
  capy: Capy,
  bun: Bun,
  mint: Mint,
};

export const CHAR_IDS: CharId[] = ["pebblo", "capy", "bun", "mint"];

/** Height of each body above its origin, for placing hats and crowns. */
export const CHAR_TOP: Record<CharId, number> = {
  pebblo: 186,
  capy: 190,
  bun: 278,
  mint: 170,
};

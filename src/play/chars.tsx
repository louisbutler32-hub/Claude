import React from "react";

/**
 * The cast of the play-along Shorts: a puppy, a bunny, a bear and a little
 * cat, drawn as big-headed chibi characters with volume and finish.
 *
 * Every character is built from the same parts so they read as one set:
 *  - a "mochi" head and a pear body, filled with a soft radial gradient
 *    (light top-left, base, shaded edge), outlined in a darker shade of the
 *    same colour, never black
 *  - a lighter belly and muzzle, a gloss highlight on the head, and a soft
 *    shadow the head casts on the body
 *  - glossy eyes (gradient iris, two catch-lights), gradient blush, and a
 *    species nose and mouth
 *  - stubby limbs ending in paws, and a species tail
 *
 * Origin: bottom-centre, where the feet touch the ground. Standing height
 * is ~250 units without ears. Every character takes the same `Pose`.
 */

export type Eyes = "open" | "happy" | "closed" | "shock" | "angry" | "dizzy" | "sparkle";
export type Mouth = "smile" | "open" | "o" | "flat" | "grin" | "shout" | "tongue";
export type Fx = "anger" | "shock" | "sweat" | "hearts" | "zzz";

export type Pose = {
  eyes?: Eyes;
  mouth?: Mouth;
  /** arm end points relative to the shoulder */
  armL?: [number, number];
  armR?: [number, number];
  /** absolute hand positions in body coords; override armL/armR */
  handL?: [number, number];
  handR?: [number, number];
  /** vertical squash (1 = rest) */
  squash?: number;
  /** whole-body tilt in degrees */
  tilt?: number;
  /** eye offset, -1..1 each way */
  look?: [number, number];
  /** seen from behind: no face, tail in front */
  back?: boolean;
  /** tail wag angle, degrees */
  wag?: number;
  /** a little effect by the head */
  fx?: Fx;
  /** lift one foot (stomp): 0..1 */
  stomp?: number;
};

export type CharId = "dog" | "bunny" | "bear" | "cat";
export const CHAR_IDS: CharId[] = ["bear", "cat", "dog", "bunny"];
export const CHAR_NAME: Record<CharId, string> = { dog: "Biscuit", bunny: "Poppy", bear: "Bruno", cat: "Mimi" };
/** Height above the origin to the top of the head (without ears), for hats and crowns. */
export const CHAR_TOP: Record<CharId, number> = { dog: 252, bunny: 250, bear: 254, cat: 250 };

type Pal = {
  fill: string;
  light: string;
  shade: string;
  line: string;
  belly: string;
  inner: string;
  nose: string;
  paw: string;
};

const PAL: Record<CharId, Pal> = {
  dog: { fill: "#fbf1e3", light: "#ffffff", shade: "#e8d3b8", line: "#9b7355", belly: "#ffffff", inner: "#d9a066", nose: "#4a3430", paw: "#fbf1e3" },
  bunny: { fill: "#f8cfdc", light: "#fde8ef", shade: "#e9aec0", line: "#b0647f", belly: "#fff6f9", inner: "#f4a0b9", nose: "#ef7e9b", paw: "#fff6f9" },
  bear: { fill: "#c89063", light: "#dcad82", shade: "#aa7349", line: "#6c4529", belly: "#f1d4b0", inner: "#eab98c", nose: "#3d2a22", paw: "#c89063" },
  cat: { fill: "#f7b26a", light: "#fcd19e", shade: "#e2934d", line: "#a15c2a", belly: "#fff2df", inner: "#f6a8a6", nose: "#ef7f89", paw: "#fff2df" },
};

const EYE_DARK = "#21182b";
const EYE_LOW = "#56477a";

/* ------------------------------------------------------------------ */
/* shared defs                                                         */
/* ------------------------------------------------------------------ */

const Defs: React.FC<{ id: CharId; p: Pal }> = ({ id, p }) => (
  <defs>
    <radialGradient id={`${id}-fur`} cx="0.34" cy="0.28" r="0.85">
      <stop offset="0" stopColor={p.light} />
      <stop offset="0.5" stopColor={p.fill} />
      <stop offset="1" stopColor={p.shade} />
    </radialGradient>
    <radialGradient id={`${id}-belly`} cx="0.4" cy="0.3" r="0.8">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="1" stopColor={p.belly} />
    </radialGradient>
    <linearGradient id="play-eye" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={EYE_DARK} />
      <stop offset="0.65" stopColor="#2f2440" />
      <stop offset="1" stopColor={EYE_LOW} />
    </linearGradient>
    <radialGradient id="play-blush" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ff8aa1" stopOpacity={0.75} />
      <stop offset="1" stopColor="#ff8aa1" stopOpacity={0} />
    </radialGradient>
  </defs>
);

/* ------------------------------------------------------------------ */
/* face parts                                                          */
/* ------------------------------------------------------------------ */

const Eye: React.FC<{ cx: number; cy: number; kind: Eyes; look: [number, number]; line: string; flip: boolean; s?: number }> = ({
  cx,
  cy,
  kind,
  look,
  line,
  flip,
  s = 1,
}) => {
  const lx = look[0] * 4;
  const ly = look[1] * 4;
  const rx = 12.5 * s;
  const ry = 15.5 * s;
  switch (kind) {
    case "happy":
      return <path d={`M ${cx - 13} ${cy + 5} q 13 -18 26 0`} stroke={EYE_DARK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    case "closed":
      return <path d={`M ${cx - 13} ${cy - 1} q 13 11 26 0`} stroke={EYE_DARK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    case "shock":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={rx + 3} ry={ry + 3} fill="#ffffff" stroke={line} strokeWidth={3.5} />
          <circle cx={cx + lx} cy={cy + ly} r={5.5} fill={EYE_DARK} />
          <circle cx={cx + lx + 1.5} cy={cy + ly - 2} r={1.6} fill="#ffffff" />
        </g>
      );
    case "dizzy":
      return (
        <path
          d={`M ${cx} ${cy} m -2 0 a 2 2 0 1 1 4 0 a 5 5 0 1 1 -9 0 a 8 8 0 1 1 15 0 a 11 11 0 1 1 -20 0`}
          stroke={EYE_DARK}
          strokeWidth={3.5}
          fill="none"
          strokeLinecap="round"
        />
      );
    default: {
      const glossX = flip ? -3.5 : 3.5;
      return (
        <g>
          <ellipse cx={cx + lx * 0.4} cy={cy + ly * 0.4} rx={rx} ry={ry} fill="url(#play-eye)" />
          {kind === "sparkle" ? (
            <path
              d={`M ${cx + glossX} ${cy - 13} l 2.4 5.6 l 5.6 2.4 l -5.6 2.4 l -2.4 5.6 l -2.4 -5.6 l -5.6 -2.4 l 5.6 -2.4 Z`}
              fill="#ffffff"
            />
          ) : (
            <circle cx={cx + glossX + lx} cy={cy - 5.5 + ly} r={5.2 * s} fill="#ffffff" />
          )}
          <circle cx={cx - glossX * 1.1 + lx} cy={cy + 6 + ly} r={2.3 * s} fill="#ffffff" opacity={0.85} />
          {kind === "angry" ? (
            <path
              d={flip ? `M ${cx + 16} ${cy - 29} L ${cx - 13} ${cy - 17}` : `M ${cx - 16} ${cy - 29} L ${cx + 13} ${cy - 17}`}
              stroke={line}
              strokeWidth={6}
              strokeLinecap="round"
            />
          ) : null}
        </g>
      );
    }
  }
};

/** Mouth, anchored at the bottom of the nose. */
const MouthShape: React.FC<{ kind: Mouth; y: number; line: string; tongue?: string }> = ({ kind, y, line, tongue = "#f47f95" }) => {
  switch (kind) {
    case "open":
      return (
        <g>
          <path d={`M -17 ${y + 5} Q 0 ${y + 40} 17 ${y + 5} Q 0 ${y + 10} -17 ${y + 5} Z`} fill="#7c3445" stroke={line} strokeWidth={3.5} strokeLinejoin="round" />
          <path d={`M -9 ${y + 25} Q 0 ${y + 17} 9 ${y + 25} Q 5 ${y + 32} 0 ${y + 32} Q -5 ${y + 32} -9 ${y + 25} Z`} fill={tongue} />
        </g>
      );
    case "tongue":
      return (
        <g>
          <path d={`M -15 ${y + 4} q 7.5 9 15 0 q 7.5 9 15 0`} stroke={line} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={`M -7 ${y + 11} Q -7 ${y + 28} 0 ${y + 28} Q 7 ${y + 28} 7 ${y + 11} Z`} fill={tongue} stroke={line} strokeWidth={3} />
        </g>
      );
    case "o":
      return <ellipse cx={0} cy={y + 14} rx={7.5} ry={9.5} fill="#7c3445" stroke={line} strokeWidth={3.5} />;
    case "flat":
      return <path d={`M -10 ${y + 10} L 10 ${y + 10}`} stroke={line} strokeWidth={4.5} strokeLinecap="round" />;
    case "grin":
      return (
        <path d={`M -22 ${y + 3} Q 0 ${y + 30} 22 ${y + 3} Q 0 ${y + 11} -22 ${y + 3} Z`} fill="#ffffff" stroke={line} strokeWidth={3.5} strokeLinejoin="round" />
      );
    case "shout":
      return (
        <g>
          <path d={`M -24 ${y + 2} L 24 ${y + 2} Q 20 ${y + 42} 0 ${y + 44} Q -20 ${y + 42} -24 ${y + 2} Z`} fill="#7c3445" stroke={line} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M -20 ${y + 4} L 20 ${y + 4} L 18 ${y + 11} L -18 ${y + 11} Z`} fill="#ffffff" />
          <ellipse cx={0} cy={y + 34} rx={11} ry={6} fill={tongue} />
        </g>
      );
    default:
      return <path d={`M -15 ${y + 4} q 7.5 9 15 0 q 7.5 9 15 0`} stroke={line} strokeWidth={4} fill="none" strokeLinecap="round" />;
  }
};

const Blush: React.FC<{ gap: number; y: number }> = ({ gap, y }) => (
  <g>
    <ellipse cx={-gap} cy={y} rx={19} ry={11} fill="url(#play-blush)" />
    <ellipse cx={gap} cy={y} rx={19} ry={11} fill="url(#play-blush)" />
  </g>
);

/** A small effect by the head: anger mark, shock lines, sweat drop, hearts, zzz. */
const FxMark: React.FC<{ fx: Fx; x: number; y: number }> = ({ fx, x, y }) => {
  switch (fx) {
    case "anger":
      return (
        <g transform={`translate(${x} ${y})`} stroke="#e8414f" strokeWidth={6} fill="none" strokeLinecap="round">
          <path d="M -14 -4 q 8 -2 10 -10 M 4 -14 q 2 8 10 10 M 14 4 q -8 2 -10 10 M -4 14 q -2 -8 -10 -10" />
        </g>
      );
    case "shock":
      return (
        <g transform={`translate(${x} ${y})`} stroke="#4a3d5c" strokeWidth={5} strokeLinecap="round">
          <path d="M -24 0 l -6 -22 M 0 -6 l 0 -24 M 24 0 l 6 -22" />
        </g>
      );
    case "sweat":
      return <path d={`M ${x} ${y - 16} q 12 16 0 22 q -12 -6 0 -22 Z`} fill="#9fd6f5" stroke="#5aa6d6" strokeWidth={3} />;
    case "hearts":
      return (
        <g transform={`translate(${x} ${y})`} fill="#ff6f8f">
          <path d="M 0 6 c -12 -8 -14 -18 -6 -20 c 4 -1 6 2 6 4 c 0 -2 2 -5 6 -4 c 8 2 6 12 -6 20 Z" />
        </g>
      );
    case "zzz":
      return (
        <text x={x} y={y} fontFamily="'ComicRelief', sans-serif" fontSize={34} fontWeight={700} fill="#7a6a95">
          z
        </text>
      );
  }
};

/* ------------------------------------------------------------------ */
/* limbs                                                               */
/* ------------------------------------------------------------------ */

const Limb: React.FC<{ from: [number, number]; to: [number, number]; p: Pal; w?: number; paw?: string }> = ({ from, to, p, w = 16, paw }) => {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2 + 4;
  const d = `M ${from[0]} ${from[1]} Q ${mx} ${my} ${to[0]} ${to[1]}`;
  return (
    <g>
      <path d={d} stroke={p.line} strokeWidth={w + 8} fill="none" strokeLinecap="round" />
      <path d={d} stroke={p.fill} strokeWidth={w} fill="none" strokeLinecap="round" />
      <circle cx={to[0]} cy={to[1]} r={w * 0.78} fill={paw ?? p.fill} stroke={p.line} strokeWidth={4} />
      <circle cx={to[0] - 3} cy={to[1] - 4} r={w * 0.22} fill="#ffffff" opacity={0.6} />
    </g>
  );
};

const Feet: React.FC<{ p: Pal; stomp: number; paw?: string }> = ({ p, stomp, paw }) => {
  const lift = stomp * 26;
  return (
    <g stroke={p.line} strokeWidth={4.5}>
      <g transform={`translate(-30 ${-12 - lift}) rotate(${-stomp * 10})`}>
        <ellipse rx={27} ry={15} fill={paw ?? p.fill} />
        <path d="M -8 -9 l 0 7 M 6 -9 l 0 7" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      </g>
      <g transform="translate(30 -12)">
        <ellipse rx={27} ry={15} fill={paw ?? p.fill} />
        <path d="M -6 -9 l 0 7 M 8 -9 l 0 7" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* shared body + head                                                  */
/* ------------------------------------------------------------------ */

const HEAD = (w: number) =>
  `M ${-w} -162 C ${-w} -226 ${-w * 0.56} -252 0 -252 C ${w * 0.56} -252 ${w} -226 ${w} -162 C ${w} -112 ${w * 0.6} -88 0 -88 C ${-w * 0.6} -88 ${-w} -112 ${-w} -162 Z`;
const BODY = "M -56 -100 C -72 -62 -66 -22 -40 -14 L 40 -14 C 66 -22 72 -62 56 -100 Z";
const SH_L: [number, number] = [-48, -86];
const SH_R: [number, number] = [48, -86];

type Parts = {
  id: CharId;
  headW: number;
  earsBack?: React.ReactNode; // behind the head
  earsFront?: React.ReactNode; // over the head edge
  headMarks?: React.ReactNode; // patches and stripes on the head, under the face
  backMarks?: React.ReactNode; // on the back of the head
  face: (pose: Required<Pick<Pose, "eyes" | "mouth" | "look">>) => React.ReactNode;
  neck?: React.ReactNode; // collar etc.
  tail: (wag: number) => React.ReactNode;
  paw?: string;
  fxAt?: [number, number];
};

const Character: React.FC<{ parts: Parts; pose: Pose }> = ({ parts, pose }) => {
  const p = PAL[parts.id];
  const {
    eyes = "open",
    mouth = "smile",
    armL = [-24, 42],
    armR = [24, 42],
    look = [0, 0],
    back = false,
    wag = 0,
    squash = 1,
    tilt = 0,
    stomp = 0,
    fx,
  } = pose;
  const hl: [number, number] = pose.handL ?? [SH_L[0] + armL[0], SH_L[1] + armL[1]];
  const hr: [number, number] = pose.handR ?? [SH_R[0] + armR[0], SH_R[1] + armR[1]];
  const fur = `url(#${parts.id}-fur)`;
  const arms = (
    <>
      <Limb from={SH_L} to={hl} p={p} paw={parts.paw} />
      <Limb from={SH_R} to={hr} p={p} paw={parts.paw} />
    </>
  );
  const fxAt = parts.fxAt ?? [86, -236];
  return (
    <g transform={`rotate(${tilt}) scale(1 ${squash})`}>
      <Defs id={parts.id} p={p} />
      {!back ? parts.tail(wag) : null}
      <Feet p={p} stomp={stomp} paw={parts.paw} />
      <path d={BODY} fill={fur} stroke={p.line} strokeWidth={5.5} strokeLinejoin="round" />
      {!back ? <ellipse cx={0} cy={-50} rx={33} ry={28} fill={`url(#${parts.id}-belly)`} /> : null}
      {back ? parts.tail(wag) : null}
      {parts.neck}
      <ellipse cx={0} cy={-94} rx={50} ry={9} fill={p.shade} opacity={0.55} />
      {parts.earsBack}
      <path d={HEAD(parts.headW)} fill={fur} stroke={p.line} strokeWidth={5.5} strokeLinejoin="round" />
      <ellipse cx={-parts.headW * 0.48} cy={-214} rx={24} ry={12} fill="#ffffff" opacity={0.45} transform={`rotate(-24 ${-parts.headW * 0.48} -214)`} />
      {back ? parts.backMarks : parts.headMarks}
      {!back ? parts.face({ eyes, mouth, look }) : null}
      {parts.earsFront}
      {!back ? arms : null}
      {back ? (
        // from behind only the paws show, gripping the rope above the head
        <g fill={parts.paw ?? p.fill} stroke={p.line} strokeWidth={4.5}>
          {[hl, hr].map(([x, y], i) => (
            <g key={i} transform={`translate(${x + (i ? 5 : -5)} ${y})`}>
              <ellipse rx={18} ry={15} />
              <path d="M -6 -12 l 0 7 M 6 -12 l 0 7" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
            </g>
          ))}
        </g>
      ) : null}
      {fx ? <FxMark fx={fx} x={fxAt[0]} y={fxAt[1]} /> : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* the four                                                            */
/* ------------------------------------------------------------------ */

const DOG: Parts = {
  id: "dog",
  headW: 100,
  headMarks: <ellipse cx={40} cy={-172} rx={32} ry={28} fill={PAL.dog.inner} opacity={0.85} transform="rotate(-18 40 -172)" />,
  backMarks: <ellipse cx={-34} cy={-200} rx={34} ry={26} fill={PAL.dog.inner} opacity={0.85} transform="rotate(18 -34 -200)" />,
  earsFront: (
    <g fill={PAL.dog.inner} stroke={PAL.dog.line} strokeWidth={5} strokeLinejoin="round">
      <path d="M -62 -240 C -104 -250 -132 -212 -124 -164 C -120 -134 -100 -122 -86 -130 C -76 -160 -72 -204 -62 -240 Z" />
      <path d="M 62 -240 C 104 -250 132 -212 124 -164 C 120 -134 100 -122 86 -130 C 76 -160 72 -204 62 -240 Z" />
      <path d="M -94 -210 q -14 30 -8 62 M 94 -210 q 14 30 8 62" stroke="#c08650" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
    </g>
  ),
  face: ({ eyes, mouth, look }) => (
    <g>
      <ellipse cx={0} cy={-128} rx={36} ry={25} fill="#ffffff" opacity={0.9} />
      <Blush gap={62} y={-128} />
      <Eye cx={-38} cy={-164} kind={eyes} look={look} line={PAL.dog.line} flip={false} />
      <Eye cx={38} cy={-164} kind={eyes} look={look} line={PAL.dog.line} flip={true} />
      <path d="M -12 -146 Q 0 -153 12 -146 Q 10 -134 0 -131 Q -10 -134 -12 -146 Z" fill={PAL.dog.nose} />
      <ellipse cx={-4} cy={-145} rx={4} ry={2.4} fill="#ffffff" opacity={0.7} />
      <MouthShape kind={mouth} y={-133} line={PAL.dog.line} />
    </g>
  ),
  neck: (
    <g>
      <path d="M -52 -104 Q 0 -84 52 -104 L 50 -90 Q 0 -70 -50 -90 Z" fill="#e2554e" stroke="#a63a34" strokeWidth={4} strokeLinejoin="round" />
      <circle cx={0} cy={-72} r={9} fill="#f5c84a" stroke="#c4952a" strokeWidth={3.5} />
    </g>
  ),
  tail: (wag) => (
    <g transform={`rotate(${wag} 44 -40)`}>
      <path d="M 44 -40 C 74 -46 86 -76 72 -96 C 66 -104 56 -100 60 -90 C 66 -78 60 -60 40 -54 Z" fill={PAL.dog.fill} stroke={PAL.dog.line} strokeWidth={5} strokeLinejoin="round" />
    </g>
  ),
  fxAt: [104, -250],
};

const BEAR: Parts = {
  id: "bear",
  headW: 104,
  earsBack: (
    <g stroke={PAL.bear.line} strokeWidth={5.5}>
      <circle cx={-72} cy={-230} r={30} fill="url(#bear-fur)" />
      <circle cx={72} cy={-230} r={30} fill="url(#bear-fur)" />
      <circle cx={-72} cy={-228} r={15} fill={PAL.bear.inner} stroke="none" />
      <circle cx={72} cy={-228} r={15} fill={PAL.bear.inner} stroke="none" />
    </g>
  ),
  headMarks: <path d="M -6 -252 q 4 -14 14 -12 q -8 4 -6 12" fill={PAL.bear.fill} stroke={PAL.bear.line} strokeWidth={3.5} strokeLinejoin="round" />,
  backMarks: <path d="M -6 -252 q 4 -14 14 -12 q -8 4 -6 12" fill={PAL.bear.fill} stroke={PAL.bear.line} strokeWidth={3.5} strokeLinejoin="round" />,
  face: ({ eyes, mouth, look }) => (
    <g>
      <ellipse cx={0} cy={-127} rx={40} ry={28} fill={PAL.bear.belly} stroke={PAL.bear.shade} strokeWidth={2.5} />
      <Blush gap={66} y={-130} />
      <Eye cx={-40} cy={-166} kind={eyes} look={look} line={PAL.bear.line} flip={false} />
      <Eye cx={40} cy={-166} kind={eyes} look={look} line={PAL.bear.line} flip={true} />
      <ellipse cx={0} cy={-141} rx={14} ry={9.5} fill={PAL.bear.nose} />
      <ellipse cx={-4} cy={-144} rx={4.5} ry={2.4} fill="#ffffff" opacity={0.6} />
      <MouthShape kind={mouth} y={-134} line={PAL.bear.line} />
    </g>
  ),
  tail: () => <circle cx={0} cy={-34} r={16} fill={PAL.bear.light} stroke={PAL.bear.line} strokeWidth={4.5} />,
  fxAt: [100, -250],
};

const CAT: Parts = {
  id: "cat",
  headW: 98,
  earsBack: (
    <g strokeLinejoin="round">
      <path d="M -92 -186 L -84 -290 L -24 -240 Z" fill="url(#cat-fur)" stroke={PAL.cat.line} strokeWidth={5.5} />
      <path d="M 92 -186 L 84 -290 L 24 -240 Z" fill="url(#cat-fur)" stroke={PAL.cat.line} strokeWidth={5.5} />
      <path d="M -78 -214 L -76 -266 L -44 -238 Z" fill={PAL.cat.inner} />
      <path d="M 78 -214 L 76 -266 L 44 -238 Z" fill={PAL.cat.inner} />
    </g>
  ),
  headMarks: (
    <g fill="#e08a3c">
      <path d="M -22 -252 q 6 18 4 30 q -8 -10 -12 -28 Z" />
      <path d="M -3 -253 q 4 20 3 34 q -6 -14 -8 -34 Z" />
      <path d="M 16 -252 q 2 18 -2 30 q -6 -12 -4 -28 Z" />
      <path d="M -98 -168 q 16 2 24 8 q -14 4 -24 2 Z M 98 -168 q -16 2 -24 8 q 14 4 24 2 Z" />
    </g>
  ),
  backMarks: (
    <g fill="#e08a3c">
      <path d="M -40 -250 q 8 22 4 40 q -10 -14 -14 -38 Z" />
      <path d="M -6 -254 q 6 26 3 46 q -8 -18 -10 -44 Z" />
      <path d="M 28 -250 q 2 22 -4 40 q -6 -16 -4 -38 Z" />
      <path d="M -60 -236 q 8 16 4 28 q -10 -10 -12 -26 Z M 60 -236 q -8 16 -4 28 q 10 -10 12 -26 Z" />
    </g>
  ),
  face: ({ eyes, mouth, look }) => (
    <g>
      <ellipse cx={0} cy={-126} rx={32} ry={21} fill={PAL.cat.belly} />
      <Blush gap={62} y={-128} />
      <Eye cx={-38} cy={-164} kind={eyes} look={look} line={PAL.cat.line} flip={false} s={1.08} />
      <Eye cx={38} cy={-164} kind={eyes} look={look} line={PAL.cat.line} flip={true} s={1.08} />
      <path d="M -8 -144 L 8 -144 L 0 -136 Z" fill={PAL.cat.nose} stroke={PAL.cat.nose} strokeWidth={3} strokeLinejoin="round" />
      <MouthShape kind={mouth} y={-137} line={PAL.cat.line} />
      <g stroke={PAL.cat.line} strokeWidth={2.5} strokeLinecap="round" opacity={0.7}>
        <path d="M -52 -138 l -34 -6 M -52 -130 l -34 4 M 52 -138 l 34 -6 M 52 -130 l 34 4" />
      </g>
    </g>
  ),
  tail: (wag) => (
    <g transform={`rotate(${wag} 40 -30)`}>
      <path d="M 40 -30 C 84 -30 100 -70 84 -110 C 78 -126 92 -140 104 -130" stroke={PAL.cat.line} strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d="M 40 -30 C 84 -30 100 -70 84 -110 C 78 -126 92 -140 104 -130" stroke={PAL.cat.fill} strokeWidth={17} fill="none" strokeLinecap="round" />
      <path d="M 92 -52 l -14 -6 M 94 -80 l -14 -2" stroke="#e08a3c" strokeWidth={6} strokeLinecap="round" />
      <circle cx={104} cy={-130} r={8} fill={PAL.cat.belly} />
    </g>
  ),
  paw: PAL.cat.belly,
  fxAt: [96, -256],
};

const Flower: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={0} cy={-8} rx={6} ry={9} fill="#fff6b8" stroke="#e0b93a" strokeWidth={2} transform={`rotate(${a})`} />
    ))}
    <circle r={5} fill="#f5b83a" />
  </g>
);

const BUNNY: Parts = {
  id: "bunny",
  headW: 96,
  earsBack: (
    <g strokeLinejoin="round">
      <g transform="rotate(-6 -32 -240)">
        <path d="M -52 -236 C -76 -300 -70 -382 -36 -388 C -4 -384 -8 -300 -18 -240 Z" fill="url(#bunny-fur)" stroke={PAL.bunny.line} strokeWidth={5.5} />
        <path d="M -44 -250 C -60 -300 -56 -360 -36 -366 C -20 -360 -22 -300 -28 -254 Z" fill={PAL.bunny.inner} />
      </g>
      <g transform="rotate(16 32 -240)">
        <path d="M 18 -240 C 8 -300 4 -334 22 -350 C 40 -362 60 -350 62 -330 C 64 -300 56 -270 52 -236 Z" fill="url(#bunny-fur)" stroke={PAL.bunny.line} strokeWidth={5.5} />
        <path d="M 28 -252 C 22 -296 20 -320 30 -332 C 40 -340 50 -332 50 -318 C 50 -296 46 -274 42 -254 Z" fill={PAL.bunny.inner} />
      </g>
    </g>
  ),
  headMarks: <Flower x={-58} y={-236} />,
  backMarks: <Flower x={58} y={-236} />,
  face: ({ eyes, mouth, look }) => (
    <g>
      <Blush gap={58} y={-130} />
      <Eye cx={-36} cy={-164} kind={eyes} look={look} line={PAL.bunny.line} flip={false} />
      <Eye cx={36} cy={-164} kind={eyes} look={look} line={PAL.bunny.line} flip={true} />
      <path d="M -8 -145 Q 0 -150 8 -145 Q 6 -138 0 -136 Q -6 -138 -8 -145 Z" fill={PAL.bunny.nose} />
      {mouth === "smile" || mouth === "grin" ? (
        <g>
          <path d="M 0 -136 l 0 6 M -12 -128 q 6 6 12 -2 q 6 8 12 2" stroke={PAL.bunny.line} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          {mouth === "grin" ? <rect x={-6} y={-127} width={12} height={9} rx={2} fill="#ffffff" stroke={PAL.bunny.line} strokeWidth={2} /> : null}
        </g>
      ) : (
        <g>
          <MouthShape kind={mouth} y={-137} line={PAL.bunny.line} />
          {mouth === "open" || mouth === "shout" ? <rect x={-6} y={-133} width={12} height={9} rx={2} fill="#ffffff" stroke={PAL.bunny.line} strokeWidth={2} /> : null}
        </g>
      )}
    </g>
  ),
  tail: () => (
    <g>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 10} cy={-34 + Math.sin((a * Math.PI) / 180) * 10} r={13} fill="#ffffff" stroke={PAL.bunny.shade} strokeWidth={3} />
      ))}
      <circle cx={0} cy={-34} r={15} fill="#ffffff" />
    </g>
  ),
  fxAt: [92, -250],
};

const PARTS: Record<CharId, Parts> = { dog: DOG, bear: BEAR, cat: CAT, bunny: BUNNY };

export const Dog: React.FC<Pose> = (pose) => <Character parts={PARTS.dog} pose={pose} />;
export const Bunny: React.FC<Pose> = (pose) => <Character parts={PARTS.bunny} pose={pose} />;
export const Bear: React.FC<Pose> = (pose) => <Character parts={PARTS.bear} pose={pose} />;
export const Cat: React.FC<Pose> = (pose) => <Character parts={PARTS.cat} pose={pose} />;

export const CHAR: Record<CharId, React.FC<Pose>> = { dog: Dog, bunny: Bunny, bear: Bear, cat: Cat };

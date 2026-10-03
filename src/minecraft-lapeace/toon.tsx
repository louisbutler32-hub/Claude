import React from "react";

/**
 * Cartoon Minecraft cast, in the look of the CircleToons-style reference: cube heads seen
 * three-quarters (front, top and right side), blocky torsos and limbs, thick brown-black ink,
 * flat colour with one darker tone, faces made of heavy bars, brows and wrinkle lines.
 *
 * A character is posed with a handful of angles (0 = hanging straight down, +90 = pointing
 * to the right of the screen), so every pose interpolates cleanly and can be overshot with
 * springs for squash-and-stretch animation.
 */

export const INK = "#2b1d14";
const S = 150, DX = 34, DY = 24; // head front size and the depth of its top and side
const LU = 78, LL = 72, AT = 40; // arm: upper, lower, thickness
const GU = 70, GL = 66, GT = 48; // leg
const TW = 124, TH = 150, TDX = 22, TDY = 14; // torso
const HIP_Y = -(GU + GL);
const TORSO_TOP = HIP_Y - TH + 8;
const LW = 8; // line width

export type Look = {
  skin: string; skinD: string; hair: string; hairStyle?: "short" | "none";
  shirt: string; shirtD: string; sleeve: "long" | "short" | "none";
  pants: string; pantsD: string; legLower?: string; shoe: string; blush: string;
};

export type TPose = { aL: [number, number]; aR: [number, number]; lL: [number, number]; lR: [number, number]; tilt: number; lean: number; bob: number; sq: number };
export const T0: TPose = { aL: [-6, -4], aR: [6, 4], lL: [-3, 0], lR: [3, 0], tilt: 0, lean: 0, bob: 0, sq: 0 };
export const tp = (p: Partial<TPose>): TPose => ({ ...T0, ...p });
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix2 = (a: [number, number], b: [number, number], t: number): [number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
export const lerpT = (a: TPose, b: TPose, t: number): TPose => ({
  aL: mix2(a.aL, b.aL, t), aR: mix2(a.aR, b.aR, t), lL: mix2(a.lL, b.lL, t), lR: mix2(a.lR, b.lR, t),
  tilt: mix(a.tilt, b.tilt, t), lean: mix(a.lean, b.lean, t), bob: mix(a.bob, b.bob, t), sq: mix(a.sq, b.sq, t),
});

export type FaceKind = "plain" | "smile" | "grin" | "joy" | "shout" | "shock" | "calm" | "grit" | "worry" | "scream" | "sleep" | "cry";

/* --------------------------------- parts --------------------------------- */

const ink = { stroke: INK, strokeWidth: LW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** one block of a limb: a rounded rect hanging from its origin, rotated by deg (0 = down, +90 = to the right) */
const Seg: React.FC<{ x: number; y: number; deg: number; len: number; t: number; fill: string; shade?: string; children?: React.ReactNode }> = ({ x, y, deg, len, t, fill, shade, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${-deg})`}>
    <rect x={-t / 2} y={-8} width={t} height={len + 8} rx={t * 0.42} fill={fill} {...ink} />
    {shade && <rect x={t / 2 - 13} y={4} width={8} height={len - 14} rx={4} fill={shade} opacity={0.4} />}
    {children}
  </g>
);

const Arm: React.FC<{ x: number; a: [number, number]; look: Look; hold?: React.ReactNode; bareLower?: boolean }> = ({ x, a, look, hold }) => {
  const up = look.sleeve === "none" ? look.skin : look.shirt;
  const upD = look.sleeve === "none" ? look.skinD : look.shirtD;
  const lo = look.sleeve === "long" ? look.shirt : look.skin;
  const loD = look.sleeve === "long" ? look.shirtD : look.skinD;
  return (
    <Seg x={x} y={TORSO_TOP + 24} deg={a[0]} len={LU} t={AT} fill={up} shade={upD}>
      <Seg x={0} y={LU - 4} deg={a[1]} len={LL} t={AT - 2} fill={lo} shade={loD}>
        <rect x={-AT / 2 + 1} y={LL - 6} width={AT - 2} height={38} rx={16} fill={look.skin} {...ink} />
        {hold && <g transform={`translate(0 ${LL + 14})`}>{hold}</g>}
      </Seg>
    </Seg>
  );
};

const Leg: React.FC<{ x: number; a: [number, number]; look: Look }> = ({ x, a, look }) => (
  <Seg x={x} y={HIP_Y + 8} deg={a[0]} len={GU} t={GT} fill={look.pants} shade={look.pantsD}>
    <Seg x={0} y={GU - 6} deg={a[1]} len={GL} t={GT - 4} fill={look.legLower ?? look.pants} shade={look.pantsD}>
      <rect x={-GT / 2 - 2} y={GL - 18} width={GT + 24} height={32} rx={15} fill={look.shoe} {...ink} />
    </Seg>
  </Seg>
);

/* ------------------------------ the faces ------------------------------ */
/* Drawn like the reference's: features are big and heavy and fill the face. Eyes are thick
   slanted bars or large black ovals, brows are thin curved strokes above them, a few
   wrinkle lines sit on the forehead, and the mouth is a wide open shape with grey teeth. */

const MOUTH = "#2a1520";
const TEETH = "#d9d9e2";
const LX = 40, RX_ = 112, EY0 = 64;

const EyeBar: React.FC<{ cx: number; cy?: number; w?: number; h?: number; rot?: number }> = ({ cx, cy = EY0, w = 48, h = 26, rot = 0 }) => (
  <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h * 0.46} fill={INK} transform={`rotate(${rot} ${cx} ${cy})`} />
);
const EyeOval: React.FC<{ cx: number; cy?: number; rx?: number; ry?: number; rot?: number }> = ({ cx, cy = EY0, rx = 19, ry = 27, rot = 0 }) => (
  <g transform={`rotate(${rot} ${cx} ${cy})`}>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={INK} />
    <ellipse cx={cx + rx * 0.3} cy={cy - ry * 0.38} rx={rx * 0.34} ry={ry * 0.26} fill="#fff" />
  </g>
);
const EyeWide: React.FC<{ cx: number; cy?: number; r?: number; px?: number; py?: number }> = ({ cx, cy = EY0, r = 27, px = 0, py = 0 }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={INK} strokeWidth={7} />
    <circle cx={cx + px} cy={cy + py} r={r * 0.36} fill={INK} />
  </g>
);
const Arc: React.FC<{ cx: number; cy?: number; w?: number; up?: boolean; sw?: number }> = ({ cx, cy = EY0, w = 24, up = true, sw = 9 }) => (
  <path d={`M${cx - w},${cy + (up ? 8 : -8)} Q${cx},${cy + (up ? -26 : 26)} ${cx + w},${cy + (up ? 8 : -8)}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
);
/** a thin curved brow: rot > 0 tilts the right end down */
const Brow: React.FC<{ cx: number; cy: number; w?: number; rot?: number; bow?: number }> = ({ cx, cy, w = 34, rot = 0, bow = -6 }) => (
  <path d={`M${cx - w / 2},${cy} Q${cx},${cy + bow} ${cx + w / 2},${cy}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${rot} ${cx} ${cy})`} />
);
const Wrinkles: React.FC<{ y?: number; n?: number }> = ({ y: y0 = 22, n = 2 }) => {
  const y = y0 + 9;
  return (
  <g fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.75}>
    {Array.from({ length: n }, (_, k) => <path key={k} d={`M${52 + k * 4},${y + k * 9} q23,${k % 2 ? 5 : -7} 46,0`} />)}
  </g>
  );
};
const Trap: React.FC<{ w: number; h: number; teeth?: boolean; round?: number }> = ({ w, h, teeth = true, round = 0.6 }) => (
  <g>
    <path d={`M${-w},0 L${w},0 L${w * round},${h} Q0,${h * 1.18} ${-w * round},${h} Z`} fill={MOUTH} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {teeth && <path d={`M${-w + 5},3 L${w - 5},3 L${w * round + 3},${h * 0.42} Q0,${h * 0.55} ${-w * round - 3},${h * 0.42} Z`} fill={TEETH} />}
  </g>
);

const Face: React.FC<{ kind: FaceKind; blink: boolean; look: Look }> = ({ kind, blink }) => {
  const closed = blink && !["grin", "joy", "sleep", "cry", "grit", "shout"].includes(kind);
  return (
    <g transform="translate(3 0)">
      {/* ---- eyes and brows ---- */}
      {kind === "plain" && !closed && <><EyeOval cx={LX} rx={15} ry={22} /><EyeOval cx={RX_} rx={15} ry={22} /><Brow cx={LX} cy={32} /><Brow cx={RX_} cy={32} /></>}
      {kind === "smile" && !closed && <><EyeOval cx={LX} rx={16} ry={23} /><EyeOval cx={RX_} rx={16} ry={23} /><Brow cx={LX} cy={29} rot={-4} /><Brow cx={RX_} cy={29} rot={4} /></>}
      {kind === "calm" && !closed && <><EyeBar cx={LX} h={20} w={46} /><EyeBar cx={RX_} h={20} w={46} /><Brow cx={LX} cy={40} w={40} /><Brow cx={RX_} cy={40} w={40} /></>}
      {kind === "grin" && <><Arc cx={LX} w={22} /><Arc cx={RX_} w={22} /><Brow cx={LX} cy={26} rot={-6} /><Brow cx={RX_} cy={26} rot={6} /></>}
      {kind === "joy" && <><Arc cx={LX} w={24} sw={10} /><Arc cx={RX_} w={24} sw={10} /><Brow cx={LX} cy={22} rot={-8} bow={-8} /><Brow cx={RX_} cy={22} rot={8} bow={-8} /></>}
      {(kind === "shout" || kind === "grit") && <><EyeBar cx={LX} rot={15} w={50} h={26} /><EyeBar cx={RX_} rot={-15} w={50} h={26} /><Brow cx={LX} cy={36} rot={18} w={42} bow={-3} /><Brow cx={RX_} cy={36} rot={-18} w={42} bow={-3} /></>}
      {kind === "worry" && !closed && <><EyeBar cx={LX} rot={-13} w={50} h={25} /><EyeBar cx={RX_} rot={13} w={50} h={25} /><Brow cx={LX} cy={34} rot={-14} w={40} /><Brow cx={RX_} cy={34} rot={14} w={40} /><Wrinkles y={14} n={2} /></>}
      {kind === "shock" && <><EyeWide cx={LX} r={25} /><EyeWide cx={RX_} r={25} /><Brow cx={LX} cy={26} w={36} bow={-12} rot={-4} /><Brow cx={RX_} cy={26} w={36} bow={-12} rot={4} /><Wrinkles y={8} n={2} /></>}
      {kind === "scream" && <><EyeOval cx={LX} rx={21} ry={31} /><EyeOval cx={RX_} rx={21} ry={31} /><Brow cx={LX} cy={22} w={40} bow={-14} rot={-6} /><Brow cx={RX_} cy={22} w={40} bow={-14} rot={6} /><Wrinkles y={6} n={2} /></>}
      {(kind === "sleep") && <><Arc cx={LX} up={false} w={22} sw={8} cy={60} /><Arc cx={RX_} up={false} w={22} sw={8} cy={60} /></>}
      {kind === "cry" && <><Arc cx={LX} up={false} w={22} sw={9} cy={62} /><Arc cx={RX_} up={false} w={22} sw={9} cy={62} /><Brow cx={LX} cy={34} rot={-16} w={40} /><Brow cx={RX_} cy={34} rot={16} w={40} /><Wrinkles y={12} n={2} /></>}
      {closed && <><path d={`M${LX - 20},${EY0 + 2} Q${LX},${EY0 + 14} ${LX + 20},${EY0 + 2}`} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" /><path d={`M${RX_ - 20},${EY0 + 2} Q${RX_},${EY0 + 14} ${RX_ + 20},${EY0 + 2}`} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" /></>}
      {/* ---- nose ---- */}
      {kind !== "scream" && <path d="M71,86 q5,6 10,0" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.6} />}
      {/* ---- mouth ---- */}
      <g transform="translate(77 106)">
        {kind === "plain" && <path d="M-18,6 Q0,10 18,4" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />}
        {kind === "calm" && <path d="M-14,8 H14" stroke={INK} strokeWidth={8} strokeLinecap="round" />}
        {kind === "smile" && <path d="M-26,0 Q0,28 26,0" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />}
        {kind === "grin" && <g><path d="M-34,0 Q0,58 34,0 Z" fill={MOUTH} stroke={INK} strokeWidth={7} strokeLinejoin="round" /><path d="M-22,22 Q0,12 22,22 Q0,40 -22,22 Z" fill="#ff7d93" /><path d="M-30,3 H30" stroke={TEETH} strokeWidth={8} /></g>}
        {kind === "joy" && <g><path d="M-38,-4 Q0,70 38,-4 Z" fill={MOUTH} stroke={INK} strokeWidth={7} strokeLinejoin="round" /><path d="M-24,28 Q0,16 24,28 Q0,48 -24,28 Z" fill="#ff7d93" /><path d="M-33,0 H33" stroke={TEETH} strokeWidth={9} /></g>}
        {(kind === "shout") && <Trap w={32} h={42} />}
        {(kind === "scream") && <g><ellipse cx={0} cy={14} rx={30} ry={38} fill={MOUTH} stroke={INK} strokeWidth={7} /><path d="M-24,-14 Q0,-6 24,-14 L22,-2 Q0,6 -22,-2 Z" fill={TEETH} /><ellipse cx={0} cy={34} rx={16} ry={10} fill="#ff7d93" /></g>}
        {kind === "shock" && <ellipse cx={0} cy={10} rx={15} ry={22} fill={MOUTH} stroke={INK} strokeWidth={7} />}
        {kind === "grit" && <g><rect x={-32} y={-2} width={64} height={30} rx={8} fill={TEETH} stroke={INK} strokeWidth={7} /><path d="M-16,-2 V28 M0,-2 V28 M16,-2 V28" stroke={INK} strokeWidth={4} /></g>}
        {kind === "worry" && <g transform="translate(0 4)"><Trap w={26} h={30} round={0.55} /></g>}
        {kind === "cry" && <path d="M-26,18 Q-13,-6 0,18 Q13,-6 26,18" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />}
        {kind === "sleep" && <path d="M-10,6 Q0,18 10,6" fill={MOUTH} stroke={INK} strokeWidth={6} strokeLinecap="round" />}
      </g>
    </g>
  );
};

/** the head: front, right side and top faces, hair on top, then the face and any hat */
const Head: React.FC<{ look: Look; face: FaceKind; blink: boolean; back: boolean; hat?: React.ReactNode }> = ({ look, face, blink, back, hat }) => {
  const hair = look.hairStyle !== "none";
  const front = back ? look.hair : look.skin;
  return (
    <g>
      <polygon points={`${S},0 ${S + DX},${-DY} ${S + DX},${S - DY} ${S},${S}`} fill={back ? look.hair : look.skinD} {...ink} />
      <polygon points={`0,0 ${DX},${-DY} ${S + DX},${-DY} ${S},0`} fill={hair ? look.hair : look.skin} {...ink} />
      <rect x={0} y={0} width={S} height={S} rx={8} fill={front} {...ink} />
      {!back && <rect x={10} y={10} width={40} height={30} rx={8} fill="#ffffff" opacity={0.14} />}
      {!back && hair && <path d={`M4,3 H${S - 4} V26 L122,26 L122,38 L98,28 L74,40 L50,28 L26,38 L4,26 Z`} fill={look.hair} stroke={INK} strokeWidth={6} strokeLinejoin="round" />}
      {!back && <Face kind={face} blink={blink} look={look} />}
      {hat}
    </g>
  );
};

/* ---------------------------------- the actor ---------------------------------- */

type ActorProps = {
  x: number; y: number; s: number; look: Look; pose: TPose; face: FaceKind;
  flip?: boolean; back?: boolean; t?: number; torso?: React.ReactNode; hat?: React.ReactNode;
  holdL?: React.ReactNode; holdR?: React.ReactNode; legs?: boolean; shadow?: boolean;
};

export const Actor: React.FC<ActorProps> = ({ x, y, s, look, pose, face, flip = false, back = false, t, torso, hat, holdL, holdR, shadow = true }) => {
  const blink = t !== undefined && t % 84 > 80;
  const br = t === undefined ? 0 : Math.sin(t * 0.2 + x * 0.01);
  const sw = t === undefined ? 0 : Math.sin(t * 0.11 + x * 0.02);
  const neckY = TORSO_TOP + 12;
  return (
    <g transform={`translate(${x} ${y - pose.bob * s}) scale(${flip ? -s : s} ${s})`}>
      {shadow && <ellipse cx={0} cy={pose.bob + 4} rx={96} ry={16} fill="#10081c" opacity={0.28} />}
      <g transform={`scale(${1 + (pose.sq + br * 0.012) * 0.5} ${1 - pose.sq - br * 0.012})`}>
        <Leg x={-26} a={pose.lL} look={look} />
        <Leg x={26} a={pose.lR} look={look} />
        <g transform={`translate(0 ${HIP_Y}) rotate(${pose.lean}) translate(0 ${-HIP_Y})`}>
          <Arm x={-TW / 2 + 6} a={pose.aL} look={look} hold={holdL} />
          <g>
            <polygon points={`${TW / 2},${TORSO_TOP} ${TW / 2 + TDX},${TORSO_TOP - TDY} ${TW / 2 + TDX},${TORSO_TOP + TH - TDY} ${TW / 2},${TORSO_TOP + TH}`} fill={look.shirtD} {...ink} />
            <polygon points={`${-TW / 2},${TORSO_TOP} ${-TW / 2 + TDX},${TORSO_TOP - TDY} ${TW / 2 + TDX},${TORSO_TOP - TDY} ${TW / 2},${TORSO_TOP}`} fill={look.shirt} {...ink} />
            <rect x={-TW / 2} y={TORSO_TOP} width={TW} height={TH} rx={8} fill={look.shirt} {...ink} />
            {!back && <g transform={`translate(0 ${TORSO_TOP})`}>{torso}</g>}
          </g>
          <g transform={`translate(0 ${neckY}) rotate(${pose.tilt + sw * 1.4}) translate(${-S / 2} ${-S})`}>
            <Head look={look} face={face} blink={blink} back={back} hat={hat} />
          </g>
          <Arm x={TW / 2 - 6} a={pose.aR} look={look} hold={holdR} />
        </g>
      </g>
    </g>
  );
};

/* ---------------------------------- the three ---------------------------------- */

export const CAP_LOOK: Look = { skin: "#6b3f2b", skinD: "#573322", hair: "#17111a", shirt: "#f6f6f6", shirtD: "#d4d4d8", sleeve: "short", pants: "#3f73c9", pantsD: "#2f58a0", shoe: "#ffffff", blush: "#8a4a34" };
export const STRAW_LOOK: Look = { skin: "#e0955e", skinD: "#c27a47", hair: "#17111a", shirt: "#e32b2b", shirtD: "#b81f1f", sleeve: "long", pants: "#2f62d6", pantsD: "#244aa8", legLower: "#e0955e", shoe: "#8a5a32", blush: "#c4603a" };
export const WISE_LOOK: Look = { skin: "#f0d2aa", skinD: "#d9b88c", hair: "#e08a3a", shirt: "#fbf8f0", shirtD: "#dcd4c0", sleeve: "none", pants: "#f1e9d6", pantsD: "#d6cdb8", legLower: "#f0d2aa", shoe: "#c9a05a", blush: "#e59a74" };

const sk = { stroke: INK, strokeWidth: 9, strokeLinejoin: "round" as const };

const CapHat: React.FC<{ back: boolean }> = ({ back }) => (
  <g {...sk}>
    <path d={`M-8,12 L-8,-26 Q-8,-84 ${S / 2},-84 Q${S + 8},-84 ${S + 8},-26 L${S + 8},12 Z`} fill="#d42a2a" />
    <path d={`M${S + 8},-20 Q${S + 34},-30 ${S + 34},-4 L${S + 8},12 Z`} fill="#a81c1c" />
    <path d={`M12,-62 Q30,-76 56,-76`} fill="none" stroke="#ff8a7a" strokeWidth={8} strokeLinecap="round" />
    {!back && (
      <>
        <rect x={-18} y={6} width={S + 44} height={28} rx={14} fill="#a81c1c" />
        <rect x={48} y={-52} width={54} height={40} rx={9} fill="#fff" strokeWidth={6} />
        <path d="M63,-24 L75,-40 L87,-24 M75,-38 V-16" stroke="#d42a2a" strokeWidth={6} fill="none" strokeLinecap="round" />
      </>
    )}
  </g>
);

const StrawHat: React.FC = () => (
  <g {...sk}>
    <ellipse cx={80} cy={2} rx={136} ry={34} fill="#f4d160" />
    <path d={`M18,6 L18,-52 Q18,-112 80,-112 Q142,-112 142,-52 L142,6 Z`} fill="#f4d160" />
    <path d={`M18,-36 L142,-36 L142,6 L18,6 Z`} fill="#d82a2a" />
    <path d="M34,-80 Q48,-96 72,-98" fill="none" stroke="#fff6c8" strokeWidth={8} strokeLinecap="round" />
  </g>
);

const Laurel: React.FC = () => (
  <g {...sk} strokeWidth={6}>
    {Array.from({ length: 11 }, (_, i) => {
      const x = -2 + i * 16.5, y = -6 - Math.sin((i / 10) * Math.PI) * 4;
      return <ellipse key={i} cx={x} cy={y} rx={19} ry={9} fill={i % 2 ? "#4f9a3a" : "#7bc45a"} transform={`rotate(${i % 2 ? -34 : 34} ${x} ${y})`} />;
    })}
    {[0, 1, 2].map((i) => <ellipse key={`s${i}`} cx={S + 12 + i * 8} cy={-14 - i * 7} rx={17} ry={8} fill={i % 2 ? "#4f9a3a" : "#7bc45a"} transform={`rotate(${-50} ${S + 12 + i * 8} ${-14 - i * 7})`} />)}
  </g>
);

const CapTee: React.FC = () => (
  <g {...sk} strokeWidth={6}>
    <path d="M-30,6 Q0,64 30,6" fill="none" stroke="#e8c23a" strokeWidth={8} strokeLinecap="round" />
    <circle cx={0} cy={58} r={11} fill="#e8c23a" />
  </g>
);

const StrawChest: React.FC = () => (
  <g {...sk} strokeWidth={7}>
    <path d="M-28,2 L28,2 L18,108 L-18,108 Z" fill="#e0955e" />
    <path d="M-12,34 L14,70 M14,34 L-12,70" stroke="#8a3a2a" strokeWidth={6} fill="none" strokeLinecap="round" />
    <rect x={-TW / 2} y={112} width={TW} height={30} fill="#f5c518" />
    <path d="M-62,128 H62" stroke="#d9a400" strokeWidth={5} fill="none" />
  </g>
);

const Toga: React.FC = () => (
  <g {...sk} strokeWidth={7}>
    <path d="M-62,2 L-24,2 L62,100 L62,148 L26,148 Z" fill="#ece4d0" />
    <rect x={-TW / 2} y={102} width={TW} height={18} fill="#d8b24a" />
    <circle cx={-44} cy={14} r={10} fill="#d8b24a" />
  </g>
);

type Who = Omit<ActorProps, "look" | "torso" | "hat">;
export const Cap: React.FC<Who> = (w) => <Actor {...w} look={CAP_LOOK} hat={<CapHat back={!!w.back} />} torso={<CapTee />} />;
export const Straw: React.FC<Who> = (w) => <Actor {...w} look={STRAW_LOOK} hat={<StrawHat />} torso={<StrawChest />} />;
export const Wise: React.FC<Who> = (w) => <Actor {...w} look={WISE_LOOK} hat={<Laurel />} torso={<Toga />} />;

/* ---------------------------------- the monk ---------------------------------- */

/** the wise one as a tiny cross-legged figure: robe, laurel and a halo. The glowing treasure. */
export const Monk: React.FC = () => (
  <g {...sk}>
    <ellipse cx={0} cy={-104} rx={62} ry={14} fill="none" stroke="#fff6b0" strokeWidth={11} />
    <ellipse cx={0} cy={54} rx={84} ry={30} fill="#e8862a" strokeWidth={8} />
    <rect x={-46} y={-36} width={92} height={86} rx={10} fill="#f09a3a" strokeWidth={8} />
    <polygon points="-34,-32 -12,-36 40,30 18,44" fill="#fbf8f0" strokeWidth={6} />
    <rect x={-22} y={20} width={44} height={22} rx={8} fill="#f0d2aa" strokeWidth={6} />
    <rect x={-40} y={-100} width={80} height={72} rx={8} fill="#f0d2aa" strokeWidth={8} />
    <path d="M-22,-66 q9,-8 18,0 M6,-66 q9,-8 18,0" fill="none" strokeWidth={6} strokeLinecap="round" />
    <path d="M-12,-46 q12,10 24,0" fill="none" strokeWidth={6} strokeLinecap="round" />
    {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={-38 + i * 13} cy={-104} rx={11} ry={6} fill={i % 2 ? "#4f9a3a" : "#7bc45a"} strokeWidth={4} transform={`rotate(${i % 2 ? -30 : 30} ${-38 + i * 13} -104)`} />)}
  </g>
);

/* ---------------------------------- cast sheet ---------------------------------- */

export const ToonSheet: React.FC = () => {
  const faces: FaceKind[] = ["plain", "smile", "grin", "shout", "shock", "scream", "worry", "grit"];
  const wave = tp({ aL: [-150, -10], aR: [150, 10] });
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ background: "#c9d6e6" }}>
      <rect width={1080} height={1920} fill="#7d8aa6" />
      <Cap x={190} y={470} s={0.9} pose={wave} face="shout" t={3} />
      <Straw x={540} y={470} s={0.9} pose={wave} face="grin" t={3} />
      <Wise x={890} y={470} s={0.9} pose={T0} face="calm" t={3} />
      {faces.map((f, i) => <Straw key={f} x={130 + (i % 4) * 270} y={1010 + Math.floor(i / 4) * 330} s={0.33} pose={T0} face={f} />)}
      <Cap back x={200} y={1820} s={0.55} pose={tp({ aR: [160, 20] })} face="plain" flip />
      <Straw back x={540} y={1820} s={0.55} pose={tp({ aR: [160, 20] })} face="plain" flip />
      <Wise x={880} y={1820} s={0.55} pose={tp({ aR: [40, 40], aL: [-30, -10] })} face="smile" flip />
    </svg>
  );
};

/* ---------------------------------- face test sheet ---------------------------------- */

const SHEET_FACES: FaceKind[] = ["plain", "smile", "grin", "joy", "shout", "grit", "worry", "cry", "shock", "scream", "calm", "sleep"];
export const FaceSheet: React.FC = () => {
  const zombie: Look = { ...STRAW_LOOK, skin: "#4f8f4a", skinD: "#3b6e38", hair: "#3b6e38", hairStyle: "none" };
  const steve: Look = { ...STRAW_LOOK, skin: "#c68a5b", skinD: "#a8714a", hair: "#4a2f1b" };
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ background: "#585a63" }}>
      {SHEET_FACES.map((f, i) => (
        <g key={f} transform={`translate(${60 + (i % 3) * 340} ${150 + Math.floor(i / 3) * 235}) scale(1.4)`}>
          <Head look={zombie} face={f} blink={false} back={false} />
        </g>
      ))}
      {SHEET_FACES.slice(0, 6).map((f, i) => (
        <g key={`s${f}`} transform={`translate(${60 + (i % 3) * 340} ${1130 + Math.floor(i / 3) * 235}) scale(1.4)`}>
          <Head look={steve} face={f} blink={false} back={false} />
        </g>
      ))}
    </svg>
  );
};

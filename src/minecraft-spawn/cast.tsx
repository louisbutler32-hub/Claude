import React from "react";
import { TPose, T0, tp, lerpT } from "../minecraft-lapeace/toon";

/**
 * The cast of "I spawned in a cave": a skeleton, a zombie and a player in netherite,
 * drawn the way the CircleToons-style reference draws Minecraft mobs — cube heads seen
 * three-quarters (front, top and right side), blocky torsos and limbs, thick black ink,
 * flat colour with one darker tone, and faces made of heavy black bars.
 *
 * Every character is the same rig (`Figure`) with its own measurements and colours, and
 * its own head drawn in head space (0..S square, the face on the front). Poses are the
 * La Peace toon poses (`TPose`: two angles per limb, 0 = hanging down, +90 = to the
 * right of the screen), so they interpolate and overshoot the same way.
 */

export { T0, tp, lerpT };
export type { TPose };

export const INK = "#1f1c1c";

export type Rig = {
  S: number; DX: number; DY: number;              // head cube: front size, depth of the side and top
  TW: number; TH: number; TDX: number; TDY: number; // torso box
  LU: number; LL: number; AT: number;             // arm: upper, lower, thickness
  GU: number; GL: number; GT: number;             // leg
  HAND: [number, number]; FOOT: [number, number]; // hand and foot blocks
  armUp: string; armUpD: string; armLo: string; armLoD: string; hand: string;
  legUp: string; legUpD: string; legLo: string; shoe: string;
  torso: string; torsoD: string; torsoTop: string;
  ink: string; lw: number;
  pelvis?: [number, number, string];              // the skeleton's little hip block
  torsoDeco?: React.ReactNode;                     // drawn in torso space: origin at the torso's top centre
  backDeco?: React.ReactNode;
};

/* ------------------------------------ parts ------------------------------------ */

/** one block of a limb: a rounded rect hanging from its origin, rotated by deg (0 = down, +90 = to the right) */
const Seg: React.FC<{ x: number; y: number; deg: number; len: number; t: number; fill: string; shade?: string; ink: string; lw: number; children?: React.ReactNode }> = ({ x, y, deg, len, t, fill, shade, ink, lw, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${-deg})`}>
    <rect x={-t / 2} y={-8} width={t} height={len + 8} rx={t * 0.38} fill={fill} stroke={ink} strokeWidth={lw} strokeLinejoin="round" />
    {shade && <rect x={t / 2 - Math.max(5, t * 0.3)} y={2} width={Math.max(4, t * 0.22)} height={len - 10} rx={3} fill={shade} opacity={0.45} />}
    {children}
  </g>
);

const Arm: React.FC<{ R: Rig; x: number; a: [number, number]; hold?: React.ReactNode }> = ({ R, x, a, hold }) => {
  const TORSO_TOP = -(R.GU + R.GL) - R.TH + 8;
  return (
    <Seg x={x} y={TORSO_TOP + 22} deg={a[0]} len={R.LU} t={R.AT} fill={R.armUp} shade={R.armUpD} ink={R.ink} lw={R.lw}>
      <Seg x={0} y={R.LU - 4} deg={a[1]} len={R.LL} t={R.AT - 2} fill={R.armLo} shade={R.armLoD} ink={R.ink} lw={R.lw}>
        <rect x={-R.HAND[0] / 2} y={R.LL - 8} width={R.HAND[0]} height={R.HAND[1]} rx={R.HAND[1] * 0.42} fill={R.hand} stroke={R.ink} strokeWidth={R.lw} strokeLinejoin="round" />
        {hold && <g transform={`translate(0 ${R.LL + R.HAND[1] * 0.4})`}>{hold}</g>}
      </Seg>
    </Seg>
  );
};

const Leg: React.FC<{ R: Rig; x: number; a: [number, number] }> = ({ R, x, a }) => {
  const HIP_Y = -(R.GU + R.GL);
  return (
    <Seg x={x} y={HIP_Y + 8} deg={a[0]} len={R.GU} t={R.GT} fill={R.legUp} shade={R.legUpD} ink={R.ink} lw={R.lw}>
      <Seg x={0} y={R.GU - 6} deg={a[1]} len={R.GL} t={R.GT - 3} fill={R.legLo} shade={R.legUpD} ink={R.ink} lw={R.lw}>
        <rect x={-R.GT / 2 - 2} y={R.GL - R.FOOT[1] + 10} width={R.FOOT[0]} height={R.FOOT[1]} rx={R.FOOT[1] * 0.4} fill={R.shoe} stroke={R.ink} strokeWidth={R.lw} strokeLinejoin="round" />
      </Seg>
    </Seg>
  );
};

/** a cube seen three-quarters: front square, right side, top. In head space the front is 0..S. */
export const Cube: React.FC<{ S: number; DX: number; DY: number; front: string; side: string; top: string; ink: string; lw: number; back?: boolean; children?: React.ReactNode }> = ({ S, DX, DY, front, side, top, ink, lw, back, children }) => (
  <g>
    <polygon points={`${S},0 ${S + DX},${-DY} ${S + DX},${S - DY} ${S},${S}`} fill={side} stroke={ink} strokeWidth={lw} strokeLinejoin="round" />
    <polygon points={`0,0 ${DX},${-DY} ${S + DX},${-DY} ${S},0`} fill={top} stroke={ink} strokeWidth={lw} strokeLinejoin="round" />
    <rect x={0} y={0} width={S} height={S} rx={6} fill={back ? side : front} stroke={ink} strokeWidth={lw} strokeLinejoin="round" />
    {!back && children}
  </g>
);

/* ------------------------------------ the rig ------------------------------------ */

export type FigProps = {
  x: number; y: number; s: number; pose: TPose; rig: Rig;
  head: React.ReactNode;              // drawn in head space (0..S front square), face included
  flip?: boolean; back?: boolean; t?: number;
  holdL?: React.ReactNode; holdR?: React.ReactNode;
  headTurn?: number;                  // extra head rotation, degrees
  shadow?: boolean;
};

export const Figure: React.FC<FigProps> = ({ x, y, s, pose, rig: R, head, flip = false, back = false, t, holdL, holdR, headTurn = 0, shadow = false }) => {
  const HIP_Y = -(R.GU + R.GL);
  const TORSO_TOP = HIP_Y - R.TH + 8;
  const neckY = TORSO_TOP + 10;
  const br = t === undefined ? 0 : Math.sin(t * 0.2 + x * 0.01);
  const sw = t === undefined ? 0 : Math.sin(t * 0.11 + x * 0.02);
  const armL = <Arm R={R} x={-R.TW / 2 + 4} a={pose.aL} hold={holdL} />;
  const armR = <Arm R={R} x={R.TW / 2 - 4} a={pose.aR} hold={holdR} />;
  return (
    <g transform={`translate(${x} ${y - pose.bob * s}) scale(${flip ? -s : s} ${s})`}>
      {shadow && <ellipse cx={0} cy={pose.bob + 4} rx={R.TW * 0.8} ry={14} fill="#000" opacity={0.22} />}
      <g transform={`scale(${1 + (pose.sq + br * 0.01) * 0.5} ${1 - pose.sq - br * 0.01})`}>
        <Leg R={R} x={-R.TW * 0.22} a={pose.lL} />
        <Leg R={R} x={R.TW * 0.22} a={pose.lR} />
        {R.pelvis && <rect x={-R.pelvis[0] / 2} y={HIP_Y - 6} width={R.pelvis[0]} height={R.pelvis[1]} rx={6} fill={R.pelvis[2]} stroke={R.ink} strokeWidth={R.lw} strokeLinejoin="round" />}
        <g transform={`translate(0 ${HIP_Y}) rotate(${pose.lean}) translate(0 ${-HIP_Y})`}>
          {back ? armR : armL}
          <g>
            <polygon points={`${R.TW / 2},${TORSO_TOP} ${R.TW / 2 + R.TDX},${TORSO_TOP - R.TDY} ${R.TW / 2 + R.TDX},${TORSO_TOP + R.TH - R.TDY} ${R.TW / 2},${TORSO_TOP + R.TH}`} fill={R.torsoD} stroke={R.ink} strokeWidth={R.lw} strokeLinejoin="round" />
            <polygon points={`${-R.TW / 2},${TORSO_TOP} ${-R.TW / 2 + R.TDX},${TORSO_TOP - R.TDY} ${R.TW / 2 + R.TDX},${TORSO_TOP - R.TDY} ${R.TW / 2},${TORSO_TOP}`} fill={R.torsoTop} stroke={R.ink} strokeWidth={R.lw} strokeLinejoin="round" />
            <rect x={-R.TW / 2} y={TORSO_TOP} width={R.TW} height={R.TH} rx={7} fill={back ? R.torsoD : R.torso} stroke={R.ink} strokeWidth={R.lw} strokeLinejoin="round" />
            <g transform={`translate(0 ${TORSO_TOP})`}>{back ? R.backDeco : R.torsoDeco}</g>
          </g>
          <g transform={`translate(0 ${neckY}) rotate(${pose.tilt + headTurn + sw * 1.2}) translate(${-R.S / 2} ${-R.S})`}>
            {head}
          </g>
          {back ? armL : armR}
        </g>
      </g>
    </g>
  );
};

/* ------------------------------------ the skeleton ------------------------------------ */

const Ribs: React.FC<{ ink: string }> = ({ ink }) => (
  <g fill="none" stroke={ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M0,10 V96" />
    <path d="M-30,30 H-8 V44 H-34" />
    <path d="M30,30 H8 V44 H34" />
    <path d="M-32,58 H-8 V72 H-28" />
    <path d="M32,58 H8 V72 H28" />
    <path d="M-20,86 H20" />
  </g>
);

const skelRig = (hurt: number): Rig => {
  const mixc = (a: string, b: string) => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * hurt).toString(16).padStart(2, "0")).join("");
  };
  const bone = mixc("#d6d6d6", "#f3aab2"), boneD = mixc("#a9a9ab", "#d88a95"), boneL = mixc("#ececec", "#f9c6cc");
  const ink = mixc(INK, "#5a1e28");
  return {
    S: 150, DX: 30, DY: 22,
    TW: 90, TH: 112, TDX: 14, TDY: 9,
    LU: 70, LL: 62, AT: 24,
    GU: 64, GL: 60, GT: 30,
    HAND: [32, 26], FOOT: [44, 22],
    armUp: bone, armUpD: boneD, armLo: bone, armLoD: boneD, hand: bone,
    legUp: bone, legUpD: boneD, legLo: bone, shoe: bone,
    torso: bone, torsoD: boneD, torsoTop: boneL,
    ink, lw: 8,
    pelvis: [72, 26, bone],
    torsoDeco: <Ribs ink={ink} />,
  };
};

export type SkelFace = "plain" | "happy" | "joy" | "grin" | "nervous" | "glance" | "worry" | "shock" | "scream" | "smug" | "wince" | "laugh" | "ouch" | "relief";

/** the skeleton's face: heavy black bar eyes and a flat little mouth, as the reference draws it */
export const SkelFaceArt: React.FC<{ kind: SkelFace; ink: string; blink?: boolean }> = ({ kind, ink, blink }) => {
  const ex = [44, 106], ey = 62;
  const bar = (x: number, w = 46, h = 28, dy = 0, rot = 0) => <rect key={`b${x}`} x={x - w / 2} y={ey - h / 2 + dy} width={w} height={h} rx={7} fill={ink} transform={`rotate(${rot} ${x} ${ey + dy})`} />;
  const arcUp = (x: number, dy = 0) => <path key={`a${x}`} d={`M${x - 20},${ey + 8 + dy} Q${x},${ey - 24 + dy} ${x + 20},${ey + 8 + dy}`} fill="none" stroke={ink} strokeWidth={10} strokeLinecap="round" />;
  const arcDown = (x: number) => <path key={`d${x}`} d={`M${x - 20},${ey - 6} Q${x},${ey + 22} ${x + 20},${ey - 6}`} fill="none" stroke={ink} strokeWidth={10} strokeLinecap="round" />;
  const brow = (x: number, dy: number, rot: number, w = 36) => <path key={`w${x}`} d={`M${x - w / 2},${dy} L${x + w / 2},${dy}`} stroke={ink} strokeWidth={8} strokeLinecap="round" transform={`rotate(${rot} ${x} ${dy})`} />;
  const mouthY = 108;
  const flat = <rect x={48} y={mouthY - 7} width={54} height={14} rx={6} fill="none" stroke={ink} strokeWidth={6} />;
  const openSmall = <ellipse cx={75} cy={mouthY + 2} rx={13} ry={12} fill={ink} />;
  const openBig = <path d={`M48,${mouthY - 10} Q75,${mouthY + 50} 102,${mouthY - 10} Z`} fill={ink} />;
  const grin = (
    <g>
      <path d={`M40,${mouthY - 8} Q75,${mouthY + 44} 110,${mouthY - 8} Z`} fill={ink} />
      <path d={`M48,${mouthY - 2} H102`} stroke="#fff" strokeWidth={9} />
    </g>
  );
  const wavy = <path d={`M48,${mouthY} q9,-8 18,0 t18,0 t18,0`} fill="none" stroke={ink} strokeWidth={7} strokeLinecap="round" />;
  const frown = <path d={`M54,${mouthY + 6} Q75,${mouthY - 10} 96,${mouthY + 6}`} fill="none" stroke={ink} strokeWidth={7} strokeLinecap="round" />;
  const yell = <ellipse cx={75} cy={mouthY + 8} rx={26} ry={32} fill={ink} />;
  const smirk = <path d={`M46,${mouthY + 4} Q80,${mouthY + 26} 108,${mouthY - 12}`} fill="none" stroke={ink} strokeWidth={8} strokeLinecap="round" />;
  const closedArcs = ex.map((x) => arcUp(x));
  switch (kind) {
    case "plain": return <g>{blink ? ex.map((x) => bar(x, 40, 8)) : ex.map((x) => bar(x))}{flat}</g>;
    case "happy": return <g>{ex.map((x) => arcUp(x))}{openSmall}</g>;
    case "joy": return <g>{closedArcs}{openBig}</g>;
    case "grin": return <g>{ex.map((x) => bar(x, 46, 28))}{grin}</g>;
    case "nervous": return <g>{ex.map((x) => bar(x, 40, 22))}{brow(44, 34, 12)}{brow(106, 34, -12)}{wavy}</g>;
    case "glance": return <g>{ex.map((x) => bar(x + 12, 40, 22))}{brow(50, 32, -8)}{brow(112, 30, -8)}<path d={`M60,${mouthY} q8,-6 16,0 t16,0`} fill="none" stroke={ink} strokeWidth={7} strokeLinecap="round" /></g>;
    case "worry": return <g>{ex.map((x) => bar(x, 38, 24))}{brow(44, 30, -18)}{brow(106, 30, 18)}{frown}</g>;
    case "shock": return <g>{ex.map((x) => bar(x, 46, 36, -4))}{brow(44, 20, -8)}{brow(106, 20, 8)}{yell}</g>;
    case "scream": return (
      <g>
        {ex.map((x) => <path key={`s${x}`} d={`M${x - 24},${ey + 14} Q${x - 26},${ey - 30} ${x},${ey - 26} Q${x + 26},${ey - 30} ${x + 24},${ey + 14} Z`} fill={ink} />)}
        {ex.map((x) => <ellipse key={`p${x}`} cx={x} cy={ey - 4} rx={9} ry={11} fill="#fff" />)}
        <path d={`M24,34 q20,-10 40,-2 M86,32 q20,-8 40,2`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
        <ellipse cx={75} cy={mouthY + 10} rx={30} ry={36} fill={ink} />
      </g>
    );
    case "smug": return <g>{ex.map((x) => bar(x, 42, 16, 4))}{brow(44, 42, 10)}{brow(106, 42, -10)}{smirk}</g>;
    case "wince": return <g>{ex.map((x) => <path key={`x${x}`} d={`M${x - 16},${ey - 12} L${x + 16},${ey} L${x - 16},${ey + 12}`} fill="none" stroke={ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" transform={x > 75 ? `scale(-1 1) translate(${-2 * x} 0)` : undefined} />)}{wavy}</g>;
    case "laugh": return <g>{ex.map((x) => arcUp(x, -6))}<path d="M52,20 q22,-10 46,0" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" opacity={0.6} />{yell}</g>;
    case "ouch": return <g>{ex.map((x) => bar(x, 40, 22))}{brow(44, 28, -16)}{brow(106, 28, 16)}<path d={`M50,${mouthY + 2} q6,-10 12,0 t12,0 t12,0 t12,0`} fill="none" stroke={ink} strokeWidth={7} strokeLinecap="round" /></g>;
    case "relief": return <g>{ex.map((x) => arcDown(x))}{openBig}</g>;
  }
};

export const SkelHead: React.FC<{ face: SkelFace; hurt?: number; back?: boolean; blink?: boolean }> = ({ face, hurt = 0, back, blink }) => {
  const R = skelRig(hurt);
  return (
    <Cube S={R.S} DX={R.DX} DY={R.DY} front={R.torso} side={R.torsoD} top={R.torsoTop} ink={R.ink} lw={R.lw} back={back}>
      <SkelFaceArt kind={face} ink={R.ink} blink={blink} />
    </Cube>
  );
};

type Who = Omit<FigProps, "rig" | "head">;
export const Skeleton: React.FC<Who & { face: SkelFace; hurt?: number }> = ({ face, hurt = 0, ...w }) => {
  const blink = w.t !== undefined && face === "plain" && w.t % 90 > 86;
  return <Figure {...w} rig={skelRig(hurt)} head={<SkelHead face={face} hurt={hurt} back={w.back} blink={blink} />} />;
};

/* ------------------------------------ the zombie ------------------------------------ */

const ZG = "#4f8c47", ZGD = "#3b6b35", ZGL = "#63a257";
const ZOMBIE_RIG: Rig = {
  S: 150, DX: 36, DY: 26,
  TW: 134, TH: 150, TDX: 24, TDY: 16,
  LU: 80, LL: 72, AT: 44,
  GU: 72, GL: 66, GT: 52,
  HAND: [44, 34], FOOT: [66, 34],
  armUp: "#47598f", armUpD: "#38477a", armLo: ZG, armLoD: ZGD, hand: ZG,
  legUp: "#5c4f88", legUpD: "#4a3f70", legLo: "#5c4f88", shoe: "#2a2736",
  torso: "#47598f", torsoD: "#38477a", torsoTop: "#54679f",
  ink: INK, lw: 8,
  torsoDeco: <path d="M-67,0 V12 H67 V0" fill="none" stroke="#38477a" strokeWidth={6} opacity={0.5} />,
};

export type ZombFace = "sleepy" | "smug" | "grump" | "sad" | "look" | "sigh";

/** the zombie: long low black bar eyes, a wrinkled forehead, a tired little mouth */
export const ZombFaceArt: React.FC<{ kind: ZombFace }> = ({ kind }) => {
  const ex = [40, 110], ey = 72;
  const bar = (x: number, h: number, dy = 0, rot = 0) => <rect key={`b${x}`} x={x - 27} y={ey - h / 2 + dy} width={54} height={h} rx={6} fill={INK} transform={`rotate(${rot} ${x} ${ey + dy})`} />;
  const wrinkles = (n: number, y0 = 22) => <g fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round">{Array.from({ length: n }, (_, i) => <path key={i} d={`M${34 + i * 4},${y0 + i * 11} q20,-7 40,0 t42,0`} />)}</g>;
  const my = 118;
  const mouthOpen = (rx: number, ry: number) => <g><ellipse cx={75} cy={my} rx={rx} ry={ry} fill="#2a2a2e" stroke={INK} strokeWidth={6} /><ellipse cx={75} cy={my + ry * 0.35} rx={rx * 0.6} ry={ry * 0.45} fill="#9a9aa0" /></g>;
  const lid = (x: number, rot: number) => <path key={`l${x}`} d={`M${x - 30},${ey - 14} L${x + 30},${ey - 14}`} stroke={INK} strokeWidth={9} strokeLinecap="round" transform={`rotate(${rot} ${x} ${ey - 14})`} />;
  switch (kind) {
    case "sleepy": return <g>{wrinkles(2)}{ex.map((x) => bar(x, 14, 4, x < 75 ? 6 : -6))}<path d={`M58,${my} q17,8 34,0`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" /></g>;
    case "smug": return <g>{wrinkles(2)}{ex.map((x) => bar(x, 22))}{lid(40, 14)}{lid(110, -14)}<path d={`M52,${my + 2} q23,14 46,-8`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" /></g>;
    case "grump": return <g>{wrinkles(3, 18)}{ex.map((x) => bar(x, 26))}{lid(40, 16)}{lid(110, -16)}{mouthOpen(16, 20)}</g>;
    case "sad": return <g>{wrinkles(3, 16)}{ex.map((x) => <path key={x} d={`M${x - 26},${ey - 2} Q${x},${ey + 18} ${x + 26},${ey - 2}`} fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" />)}{lid(40, -12)}{lid(110, 12)}{mouthOpen(22, 16)}</g>;
    case "look": return <g>{wrinkles(2)}{ex.map((x) => bar(x - 10, 24))}{lid(30, 6)}{lid(100, -6)}<path d={`M60,${my} h30`} stroke={INK} strokeWidth={7} strokeLinecap="round" /></g>;
    case "sigh": return <g>{wrinkles(3, 16)}{ex.map((x) => bar(x, 12, 2, x < 75 ? 8 : -8))}{mouthOpen(14, 12)}</g>;
  }
};

export const ZombHead: React.FC<{ face: ZombFace; back?: boolean }> = ({ face, back }) => (
  <Cube S={150} DX={36} DY={26} front={ZG} side={ZGD} top={ZGL} ink={INK} lw={8} back={back}>
    <ZombFaceArt kind={face} />
  </Cube>
);

export const Zombie: React.FC<Who & { face: ZombFace }> = ({ face, ...w }) => <Figure {...w} rig={ZOMBIE_RIG} head={<ZombHead face={face} back={w.back} />} />;

/* ------------------------------------ the player in netherite ------------------------------------ */

const NK = "#4b4a55", NKD = "#36353f", NKL = "#5a5964", RED = "#c92a2a";
const KNIGHT_RIG: Rig = {
  S: 150, DX: 34, DY: 24,
  TW: 130, TH: 148, TDX: 22, TDY: 14,
  LU: 78, LL: 70, AT: 44,
  GU: 72, GL: 64, GT: 50,
  HAND: [46, 38], FOOT: [64, 32],
  armUp: NK, armUpD: NKD, armLo: NK, armLoD: NKD, hand: "#f2f2f2",
  legUp: NK, legUpD: NKD, legLo: "#42414b", shoe: "#2b2a32",
  torso: NK, torsoD: NKD, torsoTop: NKL,
  ink: INK, lw: 8,
  torsoDeco: (
    <g fill="none" stroke={RED} strokeWidth={9} strokeLinecap="round">
      <path d="M-56,26 q56,16 112,0" />
      <path d="M-50,96 q50,16 100,0" />
    </g>
  ),
};

export type KnightFace = "grin" | "laugh" | "smirk";

export const KnightHead: React.FC<{ face: KnightFace; back?: boolean }> = ({ face, back }) => (
  <Cube S={150} DX={34} DY={24} front={NK} side={NKD} top={NKL} ink={INK} lw={8} back={back}>
    {/* the red trim on the helmet's brow */}
    <path d="M8,30 q30,-14 54,-4 M88,26 q30,-10 54,4" fill="none" stroke={RED} strokeWidth={9} strokeLinecap="round" />
    {/* the visor slot, and the white face in it */}
    <rect x={10} y={54} width={130} height={46} rx={10} fill="#141316" />
    <rect x={20} y={62} width={110} height={30} rx={8} fill="#f4f4f4" />
    {face === "smirk" ? (
      <g><path d="M34,76 h26 M90,76 h26" stroke={INK} strokeWidth={8} strokeLinecap="round" /></g>
    ) : (
      <g><path d="M30,84 q16,-22 32,0 M88,84 q16,-22 32,0" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" /></g>
    )}
    {/* the mouth under the visor: a wide grin with a white row of teeth */}
    <rect x={30} y={104} width={90} height={38} rx={10} fill="#f4f4f4" stroke={INK} strokeWidth={6} />
    <path d={face === "laugh" ? "M40,112 Q75,150 110,112 Z" : "M40,114 Q75,140 110,114 Z"} fill={INK} />
    <path d="M46,118 H104" stroke="#fff" strokeWidth={7} />
  </Cube>
);

export const Knight: React.FC<Who & { face: KnightFace }> = ({ face, ...w }) => <Figure {...w} rig={KNIGHT_RIG} head={<KnightHead face={face} back={w.back} />} />;

/** a diamond sword, drawn blade-up in hand space */
export const Sword: React.FC = () => (
  <g transform="rotate(-30)" stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={-9} y={-10} width={18} height={70} rx={6} fill="#6b4a2a" />
    <rect x={-30} y={-26} width={60} height={18} rx={6} fill="#8a8a92" />
    <polygon points="-16,-26 16,-26 12,-190 0,-215 -12,-190" fill="#5fd3d6" />
    <path d="M-2,-40 V-180" stroke="#bff6f7" strokeWidth={5} />
  </g>
);

/* ------------------------------------ cast sheet ------------------------------------ */

export const SpawnCastSheet: React.FC = () => {
  const skf: SkelFace[] = ["plain", "happy", "joy", "grin", "nervous", "glance", "worry", "shock", "scream", "smug", "wince", "laugh", "ouch", "relief"];
  const zf: ZombFace[] = ["sleepy", "smug", "grump", "sad", "look", "sigh"];
  const wave = tp({ aL: [-150, -10], aR: [150, 10] });
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ background: "#8f8f96" }}>
      <rect width={1080} height={1920} fill="#8f8f96" />
      <Skeleton x={190} y={520} s={0.95} pose={wave} face="joy" t={3} />
      <Zombie x={540} y={520} s={0.95} pose={tp({ aL: [-20, -80], aR: [20, 60] })} face="grump" t={3} />
      <Knight x={890} y={520} s={0.95} pose={tp({ aL: [-120, -20], aR: [120, 20], lL: [-30, 60], lR: [40, 70] })} face="grin" t={3} holdR={<Sword />} />
      {skf.map((f, i) => <g key={f} transform={`translate(${100 + (i % 5) * 220} ${640 + Math.floor(i / 5) * 230})`}><g transform="scale(0.9)"><SkelHead face={f} /></g></g>)}
      {zf.map((f, i) => <g key={f} transform={`translate(${100 + i * 170} ${1360})`}><g transform="scale(0.8)"><ZombHead face={f} /></g></g>)}
      <g transform="translate(120 1560) scale(0.8)"><SkelHead face="worry" hurt={1} /></g>
      <g transform="translate(320 1560) scale(0.8)"><KnightHead face="laugh" /></g>
      <Skeleton back x={640} y={1860} s={0.7} pose={tp({ aL: [-160, -20], aR: [160, 20] })} face="plain" />
      <Zombie back x={880} y={1860} s={0.7} pose={T0} face="sleepy" />
    </svg>
  );
};

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

/** forehead lines and the heavy bar brows the reference draws on every face */
const Face: React.FC<{ kind: FaceKind; blink: boolean; look: Look }> = ({ kind, blink, look }) => {
  const ex = [42, 108], ey = 66;
  const eyesOpen = !blink && ["plain", "smile", "shock", "scream", "worry", "calm", "shout", "grit"].includes(kind);
  const happyEyes = kind === "grin" || kind === "joy";
  const brow = (x: number, dy: number, rot: number, w = 34) => <path d={`M${x - w / 2},${dy} L${x + w / 2},${dy}`} stroke={INK} strokeWidth={9} strokeLinecap="round" transform={`rotate(${rot} ${x} ${dy})`} />;
  const shock = kind === "shock" || kind === "scream";
  return (
    <g>
      {/* blush */}
      {/* eyes */}
      {shock && ex.map((x) => (
        <g key={x}><circle cx={x} cy={ey} r={20} fill="#fff" {...ink} strokeWidth={7} /><circle cx={x + 2} cy={ey + 1} r={7} fill={INK} /></g>
      ))}
      {eyesOpen && !shock && ex.map((x) => (
        <g key={x}><ellipse cx={x} cy={ey} rx={13} ry={19} fill={INK} /><circle cx={x + 4} cy={ey - 7} r={5} fill="#fff" /></g>
      ))}
      {happyEyes && ex.map((x) => <path key={x} d={`M${x - 15},${ey + 6} Q${x},${ey - 16} ${x + 15},${ey + 6}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />)}
      {(blink || kind === "sleep") && !happyEyes && ex.map((x) => <path key={x} d={`M${x - 14},${ey + 2} L${x + 14},${ey + 2}`} stroke={INK} strokeWidth={8} strokeLinecap="round" />)}
      {/* brows: cross when shouting or gritting, high when shocked, slanted up when worried */}
      {(kind === "shout" || kind === "grit") && <>{brow(42, 40, 14)}{brow(108, 40, -14)}</>}
      {shock && <>{brow(42, 28, -6)}{brow(108, 28, 6)}</>}
      {kind === "worry" && <>{brow(42, 38, -16)}{brow(108, 38, 16)}</>}
      {(kind === "plain" || kind === "calm") && <>{brow(42, 40, 0, 30)}{brow(108, 40, 0, 30)}</>}
      {kind === "scream" && <path d="M26,14 q10,-6 20,0 M104,14 q10,-6 20,0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />}
      {kind === "cry" && ex.map((x) => <path key={x} d={`M${x - 15},${ey - 2} Q${x},${ey + 16} ${x + 15},${ey - 2}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />)}
      {kind === "cry" && <>{brow(42, 38, -16)}{brow(108, 38, 16)}</>}
      {/* nose */}
      <path d="M70,84 q5,7 10,0" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      {/* mouth */}
      <g transform="translate(75 108)">
        {(kind === "grin" || kind === "joy") && (
          <g>
            <path d="M-30,-2 Q0,50 30,-2 Z" fill="#4a1020" {...ink} strokeWidth={7} />
            <path d="M-18,22 Q0,12 18,22 Q0,36 -18,22 Z" fill="#ff7d93" />
            <path d="M-26,0 H26" stroke="#fff" strokeWidth={9} />
          </g>
        )}
        {(kind === "shout" || kind === "scream") && (
          <g>
            <ellipse cx={0} cy={10} rx={kind === "scream" ? 28 : 22} ry={kind === "scream" ? 34 : 26} fill="#4a1020" {...ink} strokeWidth={7} />
            <rect x={-18} y={-14} width={36} height={10} rx={3} fill="#fff" />
            <ellipse cx={0} cy={26} rx={13} ry={9} fill="#ff7d93" />
          </g>
        )}
        {kind === "shock" && <ellipse cx={0} cy={8} rx={13} ry={19} fill="#4a1020" {...ink} strokeWidth={6} />}
        {(kind === "smile" || kind === "calm") && <path d={kind === "calm" ? "M-16,4 Q0,14 16,4" : "M-24,0 Q0,24 24,0"} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />}
        {kind === "grit" && (
          <g>
            <rect x={-28} y={-4} width={56} height={24} rx={6} fill="#fff" {...ink} strokeWidth={6} />
            <path d="M-14,-4 V20 M0,-4 V20 M14,-4 V20" stroke={INK} strokeWidth={4} />
          </g>
        )}
        {kind === "worry" && <path d="M-20,14 Q0,-6 20,14" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />}
        {kind === "cry" && <path d="M-22,16 Q-11,-2 0,16 Q11,-2 22,16" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />}
        {kind === "sleep" && <path d="M-10,6 Q0,14 10,6" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />}
        {kind === "plain" && <path d="M-14,6 H14" stroke={INK} strokeWidth={7} strokeLinecap="round" />}
      </g>
      {/* wrinkle lines: the little curved strokes on a brow */}
      {(kind === "shock" || kind === "worry" || kind === "scream") && <path d="M52,20 q22,-8 46,0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.6} />}
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
      {!back && <g transform="translate(75 75) scale(0.92) translate(-75 -75)"><Face kind={face} blink={blink} look={look} /></g>}
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

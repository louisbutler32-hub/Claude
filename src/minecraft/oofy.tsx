import React from "react";
import { AbsoluteFill } from "remotion";
import { FaceKind, limb, Limb, pose, Pose, POSE, Pt, walkPose } from "./figure";
import { loadMinecraftFonts } from "./fonts";
import { useDrawn } from "./handdrawn";

/**
 * Oofy — the Oof Craft mascot, drawn his own way rather than as a stick
 * figure. He runs on the same pose system as the reference figure (the
 * same Pose, POSE presets, walkPose, lerpPose), so any scene that animates
 * a Figure animates him, and callers position him the same way: origin at
 * the neck, feet 335 units below.
 *
 * What makes him him: a big head (chibi proportions) with spiky brown
 * hair and ears, glossy dot eyes with brows and blush, a purple hoodie whose
 * hood sits round his neck, chunky sleeves with mitten hands, a short sturdy
 * build in dark trousers and white sneakers, soft plum outlines instead of
 * black — and the band-aid on his cheek (always gets hurt, survives anyway).
 * OOFY_DESIGNS keeps the other looks that were tried, "A" being the first.
 */

export type OofyTint = { skin: string; line: string; hoodie: string; pants: string; shoe: string };

export const OOFY_TINT = {
  normal: { skin: "#fff1e0", line: "#2a1b3d", hoodie: "#8b5cf6", pants: "#2f3654", shoe: "#f7f3ee" },
  hurt: { skin: "#ffb0ae", line: "#5e0000", hoodie: "#e0457b", pants: "#7a2440", shoe: "#ffd0d0" },
  dim: { skin: "#bdb3a8", line: "#1a1026", hoodie: "#5b3fa0", pants: "#232840", shoe: "#b8b4ae" },
  warm: { skin: "#ffe9cf", line: "#2a1b3d", hoodie: "#9a68f7", pants: "#363b5c", shoe: "#fff4e0" },
} as const;

const HAIR = "#4a3426", HAIR_LIT = "#6f4c36", BLUSH = "#ff9fb4";

/**
 * The knobs a redesign turns. The first version ("A") was a bald head with a
 * pixel tuft, no ears, the head floating over a small torso on long legs —
 * it read as a baby or an alien. The others trade that for hair, ears, a
 * hood that joins head to body, bigger features set lower, and a sturdier,
 * shorter build.
 */
export type OofyDesign = {
  key: string;
  name: string;
  hair: "tuft" | "bangs" | "blocky" | "spiky" | "swoop" | "beanie";
  ears: boolean;
  nose: boolean;
  hood: boolean;
  /** feature scale, and how far down the head the features sit */
  face: number;
  faceY: number;
  /** leg length and torso width, 1 = the original */
  legs: number;
  torso: number;
  bandAid: "forehead" | "cheek";
};

export const OOFY_DESIGNS: OofyDesign[] = [
  { key: "A", name: "original", hair: "tuft", ears: false, nose: false, hood: false, face: 1, faceY: 0, legs: 1, torso: 1, bandAid: "forehead" },
  { key: "B", name: "bangs", hair: "bangs", ears: true, nose: false, hood: true, face: 1.12, faceY: 10, legs: 0.84, torso: 1.1, bandAid: "cheek" },
  { key: "C", name: "blocky", hair: "blocky", ears: true, nose: false, hood: true, face: 1.14, faceY: 12, legs: 0.82, torso: 1.12, bandAid: "cheek" },
  { key: "D", name: "spiky", hair: "spiky", ears: true, nose: true, hood: true, face: 1.14, faceY: 12, legs: 0.84, torso: 1.1, bandAid: "cheek" },
  { key: "E", name: "swoop", hair: "swoop", ears: true, nose: true, hood: true, face: 1.16, faceY: 12, legs: 0.8, torso: 1.14, bandAid: "cheek" },
  { key: "F", name: "beanie", hair: "beanie", ears: true, nose: false, hood: true, face: 1.12, faceY: 12, legs: 0.84, torso: 1.1, bandAid: "cheek" },
];
/** the look he ships with: D, picked from the ten-style lineup (oofyStyles.tsx) for its silhouette and faces */
export const OOFY_DESIGN: OofyDesign = OOFY_DESIGNS[3];
const DesignContext = React.createContext<OofyDesign>(OOFY_DESIGN);
/** draw every Oofy inside with this design */
export const OofyDesignProvider = DesignContext.Provider;

/** how much lower his neck sits than the original's, for callers that pin things to his head */
export const oofyNeckDrop = (d: OofyDesign) => (1 - d.legs) * (335 - 118);
const HEAD_RX = 104, HEAD_RY = 98;
const SH = { L: [-46, 18] as Pt, R: [46, 18] as Pt };
const HP = { L: [-34, 118] as Pt, R: [34, 118] as Pt };

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => {
    const v = (n >> s) & 0xff;
    return Math.round(v + ((amt < 0 ? 0 : 255) - v) * Math.abs(amt));
  };
  return `#${((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1)}`;
};

/** an outlined tube along from → elbow → end: the outline stroke underneath, the colour on top */
const Tube: React.FC<{ from: Pt; l: Limb; end?: Pt; w: number; color: string; line: string }> = ({ from, l, end, w, color, line }) => {
  const pts = `${from[0]},${from[1]} ${l[0][0]},${l[0][1]} ${(end ?? l[1])[0]},${(end ?? l[1])[1]}`;
  const common = { points: pts, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <>
      <polyline {...common} stroke={line} strokeWidth={w + 14} />
      <polyline {...common} stroke={color} strokeWidth={w} />
    </>
  );
};

/* -------------------------------- faces -------------------------------- */

const EX = 33, EY = -12;

const Eyes: React.FC<{ look: Pt; line: string; lids?: number; skin?: string }> = ({ look, line, lids = 0, skin = "#fff1e0" }) => (
  <g>
    {[-EX, EX].map((x) => (
      <g key={x}>
        <ellipse cx={x + look[0]} cy={EY + look[1]} rx={13} ry={19} fill={line} />
        <circle cx={x + look[0] + 4} cy={EY + look[1] - 8} r={5} fill="#ffffff" />
        {lids > 0 && <rect x={x - 26 + look[0]} y={EY - 26 + look[1]} width={52} height={26 * lids + 4} fill={skin} />}
        {lids > 0 && <path d={`M${x - 17 + look[0]},${EY - 22 + 26 * lids + look[1]} h34`} stroke={line} strokeWidth={6} strokeLinecap="round" />}
      </g>
    ))}
  </g>
);

const Wide: React.FC<{ look: Pt; line: string; pupil?: number }> = ({ look, line, pupil = 7 }) => (
  <g>
    {[-EX, EX].map((x) => (
      <g key={x}>
        <circle cx={x} cy={EY} r={21} fill="#ffffff" stroke={line} strokeWidth={6} />
        <circle cx={x + look[0] * 0.6} cy={EY + look[1] * 0.6} r={pupil} fill={line} />
      </g>
    ))}
  </g>
);

/** tilt > 0 raises the outer ends (cross, determined); tilt < 0 raises the inner ends (worried) */
const Brows: React.FC<{ line: string; tilt: number; lift?: number; only?: "L" | "R" }> = ({ line, tilt, lift = 0, only }) => (
  <g stroke={line} strokeWidth={8} strokeLinecap="round">
    {only !== "R" && <path d={`M${-EX - 14},${EY - 30 - lift - tilt} L${-EX + 12},${EY - 30 - lift + tilt}`} />}
    {only !== "L" && <path d={`M${EX - 12},${EY - 30 - lift + tilt} L${EX + 14},${EY - 30 - lift - tilt}`} />}
  </g>
);

const OpenMouth: React.FC<{ line: string; w: number; h: number; y?: number }> = ({ line, w, h, y = 34 }) => (
  <g>
    <path d={`M${-w},${y} Q${-w},${y + h} 0,${y + h} Q${w},${y + h} ${w},${y} Z`} fill="#5a1a2e" stroke={line} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={0} cy={y + h * 0.72} rx={w * 0.55} ry={h * 0.22} fill="#ff7d93" />
  </g>
);

export const OofyFace: React.FC<{ kind: FaceKind; look?: Pt; line?: string; skin?: string }> = ({ kind, look = [0, 0], line = "#2a1b3d", skin = "#fff1e0" }) => {
  const ln = { fill: "none", stroke: line, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const happyEyes = (
    <g {...ln} strokeWidth={8}>
      <path d={`M${-EX - 14},${EY + 4} q14,-22 28,0`} />
      <path d={`M${EX - 14},${EY + 4} q14,-22 28,0`} />
    </g>
  );
  switch (kind) {
    case "none":
    case "back":
      return null;
    case "joy":
    case "grin":
      return <>{happyEyes}<OpenMouth line={line} w={30} h={34} y={28} /></>;
    case "happy":
      return <>{happyEyes}<path d="M-24,34 q24,24 48,0" {...ln} /></>;
    case "smile":
    case "content":
      return <><Eyes look={look} line={line} /><path d="M-22,34 q22,20 44,0" {...ln} /></>;
    case "sly":
    case "scheming":
      return <><Eyes look={[look[0] + 6, look[1]]} line={line} lids={0.45} skin={skin} /><Brows line={line} tilt={-4} lift={-4} only="L" /><Brows line={line} tilt={6} lift={4} only="R" /><path d="M-12,40 q18,8 30,-8" {...ln} /></>;
    case "surprised":
    case "shocked":
      return <><Wide look={look} line={line} /><Brows line={line} tilt={-3} lift={8} /><ellipse cx={0} cy={44} rx={9} ry={12} fill="#5a1a2e" stroke={line} strokeWidth={5} /></>;
    case "scream":
      return <><Wide look={look} line={line} pupil={5} /><Brows line={line} tilt={-6} lift={12} /><OpenMouth line={line} w={26} h={46} y={26} /></>;
    case "hurt":
    case "crying":
      return (
        <>
          <g {...ln} strokeWidth={8}>
            <path d={`M${-EX - 12},${EY - 12} l20,10 l-20,10`} />
            <path d={`M${EX + 12},${EY - 12} l-20,10 l20,10`} />
          </g>
          <path d="M-20,46 q10,-14 20,0 q10,14 20,0" {...ln} />
          {kind === "crying" && [-EX, EX].map((x) => <path key={x} d={`M${x},${EY + 14} q-6,20 0,34`} stroke="#7ec8ff" strokeWidth={8} fill="none" strokeLinecap="round" />)}
        </>
      );
    case "calm": // eyes shut, breathing out: the "phew"
      return (
        <>
          <g {...ln} strokeWidth={8}>
            <path d={`M${-EX - 14},${EY - 2} q14,14 28,0`} />
            <path d={`M${EX - 14},${EY - 2} q14,14 28,0`} />
          </g>
          <path d="M-12,42 q12,6 24,0" {...ln} />
        </>
      );
    case "meh":
      return <><Eyes look={look} line={line} lids={0.55} skin={skin} /><path d="M-16,42 h32" {...ln} /></>;
    case "gritted":
      return (
        <>
          <Eyes look={look} line={line} />
          <Brows line={line} tilt={7} lift={-2} />
          <rect x={-28} y={30} width={56} height={24} rx={8} fill="#ffffff" stroke={line} strokeWidth={6} />
          <path d="M-28,42 H28 M-10,31 V53 M10,31 V53" stroke={line} strokeWidth={4} />
        </>
      );
    case "worried":
      return <><Eyes look={look} line={line} /><Brows line={line} tilt={-7} lift={6} /><path d="M-22,44 q11,-10 22,0 q11,10 22,0" {...ln} /></>;
    case "frown":
      return <><Eyes look={look} line={line} /><Brows line={line} tilt={7} /><path d="M-22,50 q22,-20 44,0" {...ln} /></>;
    case "whistle":
      return <><Eyes look={[look[0] - 4, look[1] - 6]} line={line} /><ellipse cx={14} cy={42} rx={8} ry={10} fill="#5a1a2e" stroke={line} strokeWidth={5} /></>;
    case "thinking":
      return <><Eyes look={[look[0] - 6, look[1] - 8]} line={line} /><Brows line={line} tilt={0} lift={10} only="R" /><path d="M-14,44 q12,-8 24,0 q8,6 14,-2" {...ln} /></>;
    default:
      return <><Eyes look={look} line={line} /><path d="M-14,40 q14,8 28,0" {...ln} /></>;
  }
};

const hairPath = (style: OofyDesign["hair"]) => {
  const top = "M-112,-6 A112,106 0 0 1 112,-6";
  switch (style) {
    case "bangs": // rounded fringe, scalloped
      return `${top} L104,-10 Q98,-50 72,-52 Q58,-32 38,-50 Q20,-34 2,-52 Q-16,-32 -34,-50 Q-54,-30 -72,-50 Q-100,-46 -104,-10 Z`;
    case "blocky": // pixel steps, the Minecraft nod
      return `${top} L104,-6 L104,-40 L74,-40 L74,-58 L32,-58 L32,-46 L-6,-46 L-6,-62 L-48,-62 L-48,-44 L-78,-44 L-78,-26 L-104,-26 L-104,-6 Z`;
    case "spiky": // a few bold spikes swept forward: reads as him even when he's tiny on screen
      return "M-112,-6 L-124,-50 L-100,-60 L-114,-102 L-68,-96 L-62,-140 L-22,-106 L4,-150 L30,-108 L70,-136 L78,-92 L122,-94 L102,-56 L128,-34 L112,-6 " +
        "L104,-12 L82,-46 L66,-26 L44,-58 L26,-32 L2,-62 L-18,-34 L-42,-58 L-60,-30 L-84,-50 L-104,-12 Z";
    case "swoop": // side-swept fringe
      return `${top} L108,-28 C64,-62 34,-74 12,-60 C-22,-38 -70,-40 -108,-4 Z`;
    default:
      return "";
  }
};

/** hair seen from behind: everything above the ears */
const BACK_HAIR = "M-113,14 A113,108 0 0 1 113,14 Q0,34 -113,14 Z";

const Hair: React.FC<{ style: OofyDesign["hair"]; line: string; back?: boolean }> = ({ style, line, back }) => {
  if (style === "tuft") return null;
  if (style === "beanie") {
    return (
      <g stroke={line} strokeWidth={9} strokeLinejoin="round">
        {!back && <path d="M-86,-30 L-70,-12 L-56,-30 L-40,-14 L-24,-30" fill={HAIR} strokeWidth={6} />}
        <path d="M-114,-30 A114,116 0 0 1 114,-30 Z" fill="#f2b53a" />
        <path d="M-118,-20 Q0,-52 118,-20 L114,-56 Q0,-88 -114,-56 Z" fill="#e39a1f" />
        {[-80, -48, -16, 16, 48, 80].map((x) => <path key={x} d={`M${x},${-26 - (1 - (x / 118) ** 2) * 28} v-28`} strokeWidth={5} stroke="#b8741a" />)}
        <circle cx={0} cy={-128} r={20} fill="#fff4dc" />
      </g>
    );
  }
  return (
    <g>
      <path d={back ? BACK_HAIR : hairPath(style)} fill={HAIR} stroke={line} strokeWidth={9} strokeLinejoin="round" />
      {!back && <path d="M-58,-84 Q-24,-102 14,-98" stroke={HAIR_LIT} strokeWidth={9} fill="none" strokeLinecap="round" />}
      {/* the cowlick he keeps from the old quiff */}
      {style !== "spiky" && <path d="M8,-104 q6,-34 36,-30 q-14,8 -16,32" fill={HAIR} stroke={line} strokeWidth={7} strokeLinejoin="round" />}
    </g>
  );
};

const BandAid: React.FC<{ line: string; at: OofyDesign["bandAid"] }> = ({ line, at }) => (
  <g transform={at === "cheek" ? "translate(70 14) rotate(-24) scale(0.62)" : "translate(58 -58) rotate(-34)"}>
    <rect x={-38} y={-13} width={76} height={26} rx={12} fill="#f2c29b" stroke={line} strokeWidth={5} />
    <rect x={-13} y={-13} width={26} height={26} fill="#dca07a" stroke={line} strokeWidth={4} />
    {[-28, -21, 21, 28].map((x) => <circle key={x} cx={x} cy={0} r={2.2} fill="#b98163" />)}
  </g>
);

/** the whole head, in head space: skin, blush, face, quiff, band-aid */
export const OofyHead: React.FC<{ face: FaceKind; look?: Pt; tint?: OofyTint; bandAid?: boolean; faceOffset?: Pt; id?: string; design?: OofyDesign }> = ({
  face, look = [0, 0], tint = OOFY_TINT.normal, bandAid = true, faceOffset = [0, 0], id = "oofyHead", design,
}) => {
  const drawn = useDrawn(); // hand-drawn: flat skin, no shine
  const ctx = React.useContext(DesignContext);
  const d = design ?? ctx;
  const back = face === "back";
  return (
  <g>
    <defs>
      <radialGradient id={`${id}-skin`} cx="38%" cy="32%" r="75%">
        <stop offset="0%" stopColor={shade(tint.skin, 0.5)} />
        <stop offset="70%" stopColor={tint.skin} />
        <stop offset="100%" stopColor={shade(tint.skin, -0.08)} />
      </radialGradient>
    </defs>
    {d.hair === "tuft" && (
      /* quiff: stepped pixel blocks leaning right, rooted under the outline */
      [[-46, -104, 30, 34], [-20, -124, 30, 50], [6, -138, 30, 58], [32, -118, 24, 36]].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} fill={HAIR} stroke={tint.line} strokeWidth={7} strokeLinejoin="round" />
          <rect x={x + 5} y={y + 5} width={w * 0.35} height={w * 0.35} fill={HAIR_LIT} />
        </g>
      ))
    )}
    {d.ears && [-1, 1].map((sd) => (
      <g key={sd}>
        <ellipse cx={sd * 100} cy={10} rx={19} ry={25} fill={tint.skin} stroke={tint.line} strokeWidth={8} />
        <path d={`M${sd * 104},0 q${sd * 8},10 0,22`} stroke={tint.line} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    ))}
    <ellipse rx={HEAD_RX} ry={HEAD_RY} fill={drawn ? tint.skin : `url(#${id}-skin)`} stroke={tint.line} strokeWidth={12} />
    {back ? (
      <Hair style={d.hair} line={tint.line} back />
    ) : (
      <>
        <Hair style={d.hair} line={tint.line} />
        {/* blush, features and a cheek band-aid all travel together when he looks somewhere */}
        <g transform={`translate(${faceOffset[0]} ${faceOffset[1] + d.faceY})`}>
          <ellipse cx={-56} cy={20} rx={17} ry={10} fill={BLUSH} opacity={0.65} />
          <ellipse cx={56} cy={20} rx={17} ry={10} fill={BLUSH} opacity={0.65} />
          <g transform={`scale(${d.face})`}>
            <OofyFace kind={face} look={look} line={tint.line} skin={tint.skin} />
            {d.nose && <path d="M-7,16 q7,9 14,0" stroke={tint.line} strokeWidth={6} fill="none" strokeLinecap="round" />}
          </g>
          {bandAid && d.bandAid === "cheek" && <BandAid line={tint.line} at="cheek" />}
        </g>
        {bandAid && d.bandAid === "forehead" && <BandAid line={tint.line} at="forehead" />}
      </>
    )}
  </g>
  );
};

/* ------------------------------- the body ------------------------------- */

export const Oofy: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pose: Pose;
  face: FaceKind;
  tint?: OofyTint;
  look?: Pt;
  tilt?: number;
  flip?: boolean;
  armsOverHead?: boolean;
  hands?: (hand: { L: Pt; R: Pt }) => React.ReactNode;
  faceOffset?: Pt;
  shadow?: boolean;
  bandAid?: boolean;
  design?: OofyDesign;
}> = ({ x, y, scale = 1, pose: p0, face, tint = OOFY_TINT.normal, look = [0, 0], tilt = 0, flip = false, armsOverHead = false, hands, faceOffset = [0, 0], shadow = true, bandAid = true, design }) => {
  const id = React.useId().replace(/:/g, "");
  const drawn = useDrawn();
  const ctx = React.useContext(DesignContext);
  const d = design ?? ctx;
  // shorter legs: the leg joints pull up toward the hip, and the whole body drops so his feet stay on the ground
  const legY = (l: Limb): Limb => [[l[0][0], 118 + (l[0][1] - 118) * d.legs], [l[1][0], 118 + (l[1][1] - 118) * d.legs]];
  const p = { ...p0, legL: legY(p0.legL), legR: legY(p0.legR) };
  const drop = oofyNeckDrop(d);
  const SH = { L: [-46 * d.torso, 18] as Pt, R: [46 * d.torso, 18] as Pt };
  const HP = { L: [-34 * d.torso, 118] as Pt, R: [34 * d.torso, 118] as Pt };
  const shoe = (foot: Pt) => (
    <g>
      <ellipse cx={foot[0] + 9} cy={foot[1] - 13} rx={31} ry={15} fill={tint.shoe} stroke={tint.line} strokeWidth={7} />
      <path d={`M${foot[0] - 20},${foot[1] - 5} h56`} stroke={tint.hoodie} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
  const knee = (l: Limb): Limb => [l[0], [l[1][0], l[1][1] - 18]];
  const legs = (
    <>
      <Tube from={HP.L} l={knee(p.legL)} w={34} color={tint.pants} line={tint.line} />
      <Tube from={HP.R} l={knee(p.legR)} w={34} color={tint.pants} line={tint.line} />
      {shoe(p.legL[1])}
      {shoe(p.legR[1])}
    </>
  );
  const arms = (
    <>
      <Tube from={SH.L} l={p.armL} w={32} color={tint.hoodie} line={tint.line} />
      <Tube from={SH.R} l={p.armR} w={32} color={tint.hoodie} line={tint.line} />
      {[p.armL[1], p.armR[1]].map((h, i) => (
        <circle key={i} cx={h[0]} cy={h[1]} r={19} fill={tint.skin} stroke={tint.line} strokeWidth={7} />
      ))}
    </>
  );
  const torso = (
    <g transform={`scale(${d.torso} 1)`}>
      <defs>
        <linearGradient id={`${id}-hood`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={shade(tint.hoodie, 0.18)} />
          <stop offset="60%" stopColor={tint.hoodie} />
          <stop offset="100%" stopColor={shade(tint.hoodie, -0.2)} />
        </linearGradient>
      </defs>
      <path d="M-56,6 Q-70,64 -66,118 Q-66,136 -48,136 L48,136 Q66,136 66,118 Q70,64 56,6 Q0,-12 -56,6 Z" fill={drawn ? tint.hoodie : `url(#${id}-hood)`} stroke={tint.line} strokeWidth={11} strokeLinejoin="round" />
      <path d="M-34,86 L34,86 L30,120 L-30,120 Z" fill={shade(tint.hoodie, -0.12)} stroke={shade(tint.hoodie, -0.4)} strokeWidth={5} strokeLinejoin="round" />
      <path d="M-44,6 Q0,26 44,6" fill="none" stroke={shade(tint.hoodie, -0.35)} strokeWidth={9} strokeLinecap="round" />
      {[-14, 14].map((dx) => (
        <g key={dx}>
          <path d={`M${dx},14 q${dx > 0 ? 3 : -3},16 ${dx > 0 ? 1 : -1},34`} stroke="#f7f3ee" strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={dx + (dx > 0 ? 1 : -1)} cy={50} r={4} fill="#f7f3ee" />
        </g>
      ))}
    </g>
  );
  const head = (
    <g transform={`translate(${p.head[0]} ${p.head[1]}) rotate(${tilt})`}>
      <OofyHead face={face} look={look} tint={tint} bandAid={bandAid} faceOffset={faceOffset} id={`${id}h`} design={d} />
    </g>
  );
  const feetY = Math.max(p.legL[1][1], p.legR[1][1]);
  // the hood lying round his neck: joins the head to the body
  const hood = d.hood && (
    <path d="M-76,10 Q-84,-30 -40,-40 L40,-40 Q84,-30 76,10 Q0,34 -76,10 Z" fill={shade(tint.hoodie, -0.14)} stroke={tint.line} strokeWidth={10} strokeLinejoin="round" />
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) translate(0 ${drop})`}>
      {shadow && <ellipse cx={(p.legL[1][0] + p.legR[1][0]) / 2} cy={feetY + 4} rx={92} ry={17} fill="#000000" opacity={0.18} />}
      {legs}
      {torso}
      {hood}
      {armsOverHead ? <>{head}{arms}</> : <>{arms}{head}</>}
      {hands ? hands({ L: p.armL[1], R: p.armR[1] }) : null}
    </g>
  );
};

/* ------------------------------ model sheet ------------------------------ */

const PIX = "Silkscreen, monospace";

const Label: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; fill?: string }> = ({ x, y, children, size = 30, fill = "#141414" }) => (
  <text x={x} y={y} fontFamily={PIX} fontSize={size} fill={fill} textAnchor="middle">{children}</text>
);

const FACES: FaceKind[] = ["plain", "joy", "sly", "shocked", "scream", "gritted", "meh", "hurt"];

export const OofySheet: React.FC = () => {
  loadMinecraftFonts();
  const T = OOFY_TINT.normal;
  return (
    <AbsoluteFill style={{ backgroundColor: "#f4f1ea" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={0} width={620} height={1080} fill="#e7e0f7" />
        <text x={310} y={130} fontFamily={PIX} fontSize={120} fill="#8b5cf6" stroke={T.line} strokeWidth={10} paintOrder="stroke" textAnchor="middle">OOFY</text>
        <Label x={310} y={190} size={26} fill="#4a3d6b">always gets hurt.</Label>
        <Label x={310} y={226} size={26} fill="#4a3d6b">survives anyway.</Label>
        <Oofy x={310} y={560} scale={1.1} pose={pose({ armL: limb(-112, -50, -138, -170), armR: limb(118, 40, 150, -30) })} face="joy" />
        {[[T.hoodie, "hoodie"], [T.skin, "skin"], [T.line, "line"], [T.pants, "pants"], [T.shoe, "shoes"]].map(([c, n], i) => (
          <g key={n} transform={`translate(${70 + i * 104} 960)`}>
            <rect width={84} height={60} fill={c} stroke={T.line} strokeWidth={5} />
            <Label x={42} y={96} size={17}>{n}</Label>
          </g>
        ))}

        <Label x={1270} y={70} size={34}>faces</Label>
        {FACES.map((f, i) => (
          <g key={f} transform={`translate(${780 + (i % 4) * 170} ${i < 4 ? 190 : 400}) scale(0.66)`}>
            <OofyHead face={f} id={`sheet${f}`} />
            <Label x={0} y={165} size={30}>{f}</Label>
          </g>
        ))}
        <Label x={1270} y={596} size={34}>poses</Label>
        {([
          [POSE.stand, "plain", false],
          [walkPose(0.2, 60), "whistle", false],
          [pose({ armL: limb(-100, 90, -150, 20), armR: limb(100, 90, 150, 20) }), "sly", false],
          [pose({ armR: limb(96, 96, 34, -22) }), "thinking", false],
          [POSE.cheeks, "shocked", true],
          [POSE.headHold, "meh", false],
          [walkPose(0.1, 90, pose({ armL: limb(-90, 40, -140, -20), armR: limb(90, 40, 140, -20) }), false), "gritted", false],
          [pose({ armL: limb(-120, -30, -150, -140), armR: limb(120, -70, 150, -170) }), "scream", false],
        ] as [Pose, FaceKind, boolean][]).map(([ps, f, over], i) => (
          <Oofy key={i} x={740 + i * 150} y={720} scale={0.46} pose={ps} face={f} armsOverHead={over} />
        ))}
        <g transform="rotate(90 1180 1010)">
          <Oofy x={1180} y={1010 - 335 * 0.46} scale={0.46} pose={POSE.spread} face="hurt" tint={OOFY_TINT.hurt} shadow={false} />
        </g>
        <Label x={1000} y={1000} size={24}>and, eventually:</Label>
      </svg>
    </AbsoluteFill>
  );
};

/* --------------------------- design variations --------------------------- */

/** every entry in OOFY_DESIGNS side by side: two expressions and a full body each */
export const OofyVariants: React.FC = () => {
  loadMinecraftFonts();
  const col = 1920 / OOFY_DESIGNS.length;
  return (
    <AbsoluteFill style={{ backgroundColor: "#f3efe8" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {OOFY_DESIGNS.map((d, i) => {
          const cx = col * i + col / 2;
          return (
            <g key={d.key}>
              {i % 2 === 0 && <rect x={col * i} y={0} width={col} height={1080} fill="#ebe5f7" />}
              <Label x={cx} y={70} size={48}>{d.key}</Label>
              <Label x={cx} y={112} size={24} fill="#6b6380">{d.name}</Label>
              <g transform={`translate(${cx - 78} 262) scale(0.56)`}><OofyHead face="joy" design={d} id={`vj${i}`} /></g>
              <g transform={`translate(${cx + 78} 262) scale(0.56)`}><OofyHead face="shocked" design={d} id={`vs${i}`} /></g>
              <Oofy x={cx} y={610} scale={0.78} pose={POSE.stand} face="plain" design={d} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** two designs at the sizes they play at: a close-up, a medium shot, and the tiny wide-shot figure */
export const OofyShortlist: React.FC<{ keys?: string[] }> = ({ keys = ["D", "E"] }) => {
  loadMinecraftFonts();
  const ds = keys.map((k) => OOFY_DESIGNS.find((d) => d.key === k)!);
  const faces: FaceKind[] = ["plain", "joy", "sly", "scream", "worried", "calm"];
  return (
    <AbsoluteFill style={{ backgroundColor: "#7db9f5" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {ds.map((d, r) => (
          <g key={d.key} transform={`translate(0 ${r * 540})`}>
            <rect width={1920} height={540} fill={r ? "#6aaaf0" : "#7db9f5"} />
            <Label x={70} y={80} size={60} fill="#ffffff">{d.key}</Label>
            {faces.map((f, i) => (
              <g key={f} transform={`translate(${230 + i * 190} 150) scale(0.7)`}><OofyHead face={f} design={d} id={`sl${r}${i}`} /></g>
            ))}
            <Oofy x={1400} y={250} scale={0.62} pose={POSE.up} face="joy" design={d} shadow={false} />
            <Oofy x={1640} y={250} scale={0.62} pose={walkPose(0.2, 60)} face="sly" design={d} shadow={false} tint={{ ...OOFY_TINT.normal, hoodie: "#2563eb" }} bandAid={false} />
            {[0.28, 0.16, 0.09].map((sc, i) => (
              <Oofy key={sc} x={260 + i * 260} y={420 - 200 * sc} scale={sc} pose={walkPose(0.3, 60)} face="plain" design={d} shadow={false} />
            ))}
            <Label x={500} y={520} size={20} fill="#ffffff">the sizes he plays at in the wide shots</Label>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

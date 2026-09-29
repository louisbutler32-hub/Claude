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
 * What makes him him: a big head (chibi proportions), glossy oversized
 * eyes with brows and blush, a purple hoodie with a pocket and drawstrings,
 * chunky sleeves with mitten hands, dark trousers and white sneakers, soft
 * plum outlines instead of black — plus the two signatures: a blocky pixel
 * quiff (the Minecraft nod) and the band-aid (always gets hurt, survives
 * anyway).
 */

export type OofyTint = { skin: string; line: string; hoodie: string; pants: string; shoe: string };

export const OOFY_TINT = {
  normal: { skin: "#fff1e0", line: "#2a1b3d", hoodie: "#8b5cf6", pants: "#2f3654", shoe: "#f7f3ee" },
  hurt: { skin: "#ffb0ae", line: "#5e0000", hoodie: "#e0457b", pants: "#7a2440", shoe: "#ffd0d0" },
  dim: { skin: "#bdb3a8", line: "#1a1026", hoodie: "#5b3fa0", pants: "#232840", shoe: "#b8b4ae" },
  warm: { skin: "#ffe9cf", line: "#2a1b3d", hoodie: "#9a68f7", pants: "#363b5c", shoe: "#fff4e0" },
} as const;

const HAIR = "#4a3426", HAIR_LIT = "#6f4c36", BLUSH = "#ff9fb4";
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

/** the whole head, in head space: skin, blush, face, quiff, band-aid */
export const OofyHead: React.FC<{ face: FaceKind; look?: Pt; tint?: OofyTint; bandAid?: boolean; faceOffset?: Pt; id?: string }> = ({
  face, look = [0, 0], tint = OOFY_TINT.normal, bandAid = true, faceOffset = [0, 0], id = "oofyHead",
}) => {
  const drawn = useDrawn(); // hand-drawn: flat skin, no shine
  return (
  <g>
    <defs>
      <radialGradient id={`${id}-skin`} cx="38%" cy="32%" r="75%">
        <stop offset="0%" stopColor={shade(tint.skin, 0.5)} />
        <stop offset="70%" stopColor={tint.skin} />
        <stop offset="100%" stopColor={shade(tint.skin, -0.08)} />
      </radialGradient>
    </defs>
    {/* quiff: stepped pixel blocks leaning right, rooted under the outline */}
    {[[-46, -104, 30, 34], [-20, -124, 30, 50], [6, -138, 30, 58], [32, -118, 24, 36]].map(([x, y, w, h], i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} fill={HAIR} stroke={tint.line} strokeWidth={7} strokeLinejoin="round" />
        <rect x={x + 5} y={y + 5} width={w * 0.35} height={w * 0.35} fill={HAIR_LIT} />
      </g>
    ))}
    <ellipse rx={HEAD_RX} ry={HEAD_RY} fill={drawn ? tint.skin : `url(#${id}-skin)`} stroke={tint.line} strokeWidth={12} />
    <ellipse cx={-56} cy={20} rx={17} ry={10} fill={BLUSH} opacity={0.65} />
    <ellipse cx={56} cy={20} rx={17} ry={10} fill={BLUSH} opacity={0.65} />
    <g transform={`translate(${faceOffset[0]} ${faceOffset[1]})`}>
      <OofyFace kind={face} look={look} line={tint.line} skin={tint.skin} />
    </g>
    {bandAid && (
      <g transform="translate(58 -58) rotate(-34)">
        <rect x={-38} y={-13} width={76} height={26} rx={12} fill="#f2c29b" stroke={tint.line} strokeWidth={5} />
        <rect x={-13} y={-13} width={26} height={26} fill="#dca07a" stroke={tint.line} strokeWidth={4} />
        {[-28, -21, 21, 28].map((x) => <circle key={x} cx={x} cy={0} r={2.2} fill="#b98163" />)}
      </g>
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
}> = ({ x, y, scale = 1, pose: p, face, tint = OOFY_TINT.normal, look = [0, 0], tilt = 0, flip = false, armsOverHead = false, hands, faceOffset = [0, 0], shadow = true, bandAid = true }) => {
  const id = React.useId().replace(/:/g, "");
  const drawn = useDrawn();
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
    <g>
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
      <OofyHead face={face} look={look} tint={tint} bandAid={bandAid} faceOffset={faceOffset} id={`${id}h`} />
    </g>
  );
  const feetY = Math.max(p.legL[1][1], p.legR[1][1]);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      {shadow && <ellipse cx={(p.legL[1][0] + p.legR[1][0]) / 2} cy={feetY + 4} rx={92} ry={17} fill="#000000" opacity={0.18} />}
      {legs}
      {torso}
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

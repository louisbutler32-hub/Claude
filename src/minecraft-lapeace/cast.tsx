import React from "react";
import { FaceKind, Pose, Pt } from "../minecraft/figure";
import { Oofy, OofyDesign, OofyTint, SHIRT_DESIGN } from "../minecraft/oofy";

/**
 * The three from the reference, drawn as Oofy: the cap guy (red cap, white tee, chain),
 * the straw-hat guy (red band, open red vest, yellow sash, scar under the eye) and the
 * wise one (white toga, laurel). Same costumes, our hand-drawn look. Plus the little monk
 * who floats in the sunbeam.
 */

const LINE = "#2a1b3d";
const sk = { stroke: LINE, strokeLinejoin: "round" as const };

/* ------------------------------ the cap guy ------------------------------ */

const CAP_DESIGN: OofyDesign = { ...SHIRT_DESIGN, key: "CAP", name: "cap", hair: "tuft" };
const CAP_TINT: OofyTint = { skin: "#5a3524", line: LINE, hoodie: "#f4f4f4", pants: "#3f73c9", shoe: "#ffffff", hair: "#1b1520", hairLit: "#3a3045", blush: "#8a4a34" };
const CapHat: React.FC<{ back?: boolean }> = ({ back }) => (
  <g {...sk}>
    <path d="M-100,-32 Q-112,-150 0,-152 Q112,-150 100,-32 Q0,-56 -100,-32 Z" fill="#d42a2a" strokeWidth={9} />
    {!back && (
      <>
        <path d="M-106,-34 Q0,-2 106,-34 L98,-54 Q0,-72 -98,-54 Z" fill="#a81c1c" strokeWidth={8} />
        <rect x={-26} y={-120} width={52} height={36} rx={6} fill="#ffffff" strokeWidth={6} />
        <path d="M-12,-100 L0,-114 L12,-100 M0,-112 V-90" stroke="#d42a2a" strokeWidth={6} fill="none" strokeLinecap="round" />
      </>
    )}
  </g>
);
const Chain: React.FC = () => (
  <g>
    <path d="M-30,10 Q0,66 30,10" fill="none" stroke="#e8c23a" strokeWidth={7} strokeLinecap="round" />
    <circle cx={0} cy={56} r={9} fill="#e8c23a" stroke={LINE} strokeWidth={4} />
  </g>
);

/* ------------------------------ the straw-hat guy ------------------------------ */

const STRAW_DESIGN: OofyDesign = { ...SHIRT_DESIGN, key: "STRAW", name: "straw", hair: "tuft" };
const STRAW_TINT: OofyTint = { skin: "#e2975f", line: LINE, hoodie: "#e32b2b", pants: "#2f62d6", shoe: "#8a5a32", hair: "#1b1520", hairLit: "#3a3045", blush: "#c4603a" };
const StrawHat: React.FC<{ back?: boolean }> = ({ back }) => (
  <g {...sk}>
    <ellipse cx={0} cy={-52} rx={146} ry={32} fill="#f4d160" strokeWidth={9} />
    <path d="M-78,-48 Q-84,-156 0,-158 Q84,-156 78,-48 Q0,-34 -78,-48 Z" fill="#f4d160" strokeWidth={9} />
    <path d="M-79,-86 Q0,-72 79,-86 L78,-52 Q0,-36 -78,-52 Z" fill="#d82a2a" strokeWidth={8} />
    <path d="M-60,-136 Q-34,-148 -10,-146" fill="none" stroke="#fff3b0" strokeWidth={7} strokeLinecap="round" />
    {!back && <path d="M-34,30 L-18,46 M-40,40 l8,-5 M-30,48 l8,-5" stroke={LINE} strokeWidth={5} fill="none" strokeLinecap="round" />}
  </g>
);
const StrawVest: React.FC = () => (
  <g {...sk}>
    <path d="M-22,6 L22,6 L14,100 L-14,100 Z" fill="#e2975f" strokeWidth={6} />
    <path d="M-12,32 L12,60 M12,32 L-12,60" stroke="#8a3a2a" strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d="M-66,98 L66,98 L66,128 L-66,128 Z" fill="#f5c518" strokeWidth={7} />
    <path d="M-66,112 L66,112" stroke="#d9a400" strokeWidth={5} />
  </g>
);

/* ------------------------------ the wise one ------------------------------ */

const WISE_DESIGN: OofyDesign = { ...SHIRT_DESIGN, key: "WISE", name: "wise", hair: "swoop" };
const WISE_TINT: OofyTint = { skin: "#f0d2aa", line: LINE, hoodie: "#fbf8f0", pants: "#f1e9d6", shoe: "#c9a05a", hair: "#e08a3a", hairLit: "#f2b066", blush: "#e59a74" };
const Laurel: React.FC = () => (
  <g {...sk} strokeWidth={5}>
    {Array.from({ length: 13 }, (_, i) => {
      const a = Math.PI * (1.08 + 0.84 * (i / 12));
      const x = Math.cos(a) * 98, y = Math.sin(a) * 88 - 6;
      const rot = (a * 180) / Math.PI + 90 + (i % 2 ? 24 : -24);
      return <ellipse key={i} cx={x} cy={y} rx={27} ry={12} fill={i % 2 ? "#4f9a3a" : "#7bc45a"} transform={`rotate(${rot} ${x} ${y})`} />;
    })}
  </g>
);
const Toga: React.FC = () => (
  <g {...sk}>
    <path d="M-56,6 L-22,6 L66,98 L66,136 L28,136 Z" fill="#ece4d0" strokeWidth={6} />
    <rect x={-66} y={98} width={132} height={16} fill="#d8b24a" strokeWidth={6} />
    <circle cx={-40} cy={14} r={9} fill="#d8b24a" strokeWidth={5} />
  </g>
);

/* ------------------------------ placing them ------------------------------ */

export type Who = { x: number; y: number; s: number; p: Pose; face: FaceKind; gaze?: Pt; look?: Pt; flip?: boolean; tilt?: number; back?: boolean; hands?: (h: { L: Pt; R: Pt }) => React.ReactNode };
const Person: React.FC<Who & { tint: OofyTint; design: OofyDesign; head: React.ReactNode; torso?: React.ReactNode }> = ({ x, y, s, p, face, tint, design, head, torso, gaze = [0, 0], look, flip, tilt, back, hands }) => (
  <g transform={`translate(${x} ${y})`}>
    <Oofy x={0} y={-335 * s} scale={s} pose={p} face={back ? "back" : face} tint={tint} design={design} look={look} faceOffset={gaze} flip={flip} tilt={tilt} shadow={false} bandAid={false} plain headExtras={head} torsoExtras={torso} hands={hands} />
  </g>
);
export const Cap: React.FC<Who> = (w) => <Person {...w} tint={CAP_TINT} design={CAP_DESIGN} head={<CapHat back={w.back} />} torso={<Chain />} />;
export const Straw: React.FC<Who> = (w) => <Person {...w} tint={STRAW_TINT} design={STRAW_DESIGN} head={<StrawHat back={w.back} />} torso={w.back ? null : <StrawVest />} />;
export const Wise: React.FC<Who> = (w) => <Person {...w} tint={WISE_TINT} design={WISE_DESIGN} head={<Laurel />} torso={<Toga />} />;

/* ------------------------------ the monk in the beam ------------------------------ */

/** the wise one, small and cross-legged, in a robe with a laurel and a halo: the glowing treasure */
export const Monk: React.FC<{ f: number }> = ({ f }) => (
  <g {...sk}>
    <ellipse cx={0} cy={-96} rx={58} ry={14} fill="none" stroke="#fff6b0" strokeWidth={10} opacity={0.95} />
    <ellipse cx={0} cy={50} rx={78} ry={30} fill="#e8862a" strokeWidth={7} />
    <path d="M-44,44 Q-50,-24 -24,-40 L24,-40 Q50,-24 44,44 Z" fill="#f09a3a" strokeWidth={7} />
    <path d="M-30,-36 L-10,-40 L40,34 L16,42 Z" fill="#fbf8f0" strokeWidth={6} />
    <ellipse cx={0} cy={30} rx={22} ry={13} fill="#f0d2aa" strokeWidth={6} />
    <circle cx={0} cy={-68} r={38} fill="#f0d2aa" strokeWidth={7} />
    <path d="M-20,-68 q8,7 16,0 M4,-68 q8,7 16,0" fill="none" strokeWidth={5} strokeLinecap="round" />
    <path d="M-10,-50 q10,8 20,0" fill="none" strokeWidth={5} strokeLinecap="round" />
    <g transform="translate(0 -70) scale(0.4)"><Laurel /></g>
  </g>
);

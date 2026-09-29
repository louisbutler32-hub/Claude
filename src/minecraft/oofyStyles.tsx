import React from "react";
import { AbsoluteFill } from "remotion";
import { Figure, Limb, Pose, POSE, Pt, walkPose } from "./figure";
import { loadMinecraftFonts } from "./fonts";
import { Oofy, OOFY_DESIGNS } from "./oofy";

/**
 * Ten whole-character styles for Oofy, side by side, to pick a look from.
 * Every one reads the same Pose rig (hands and feet relative to the neck,
 * feet 335 below), so whichever wins can animate straight away. Each style
 * draws two faces: "happy" and "scream".
 */

type Mood = "happy" | "scream";
type StyleProps = { p: Pose; mood: Mood };

const PURPLE = "#8b5cf6", PURPLE_D = "#6d3fe0", SKIN = "#ffe3c8", INK = "#1d1330", HAIR = "#4a3426", PANTS = "#2f3654";

const poly = (...pts: Pt[]) => pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join("");
/** a noodle through the elbow, for the rubber-hose limbs */
const noodle = (a: Pt, l: Limb) => `M${a[0]},${a[1]} Q${l[0][0] * 2 - (a[0] + l[1][0]) / 2},${l[0][1] * 2 - (a[1] + l[1][1]) / 2} ${l[1][0]},${l[1][1]}`;
/** a limb as a straight slab, the Minecraft way */
const slab = (a: Pt, b: Pt, w: number) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const nx = (-dy / l) * (w / 2), ny = (dx / l) * (w / 2);
  return poly([a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]) + "Z";
};
const shortLegs = (p: Pose, k: number): Pose => {
  const f = (l: Limb): Limb => [[l[0][0], 122 + (l[0][1] - 122) * k], [l[1][0], 122 + (l[1][1] - 122) * k]];
  return { ...p, legL: f(p.legL), legR: f(p.legR) };
};

/** dot eyes and a mouth, the face most styles share */
const DotFace: React.FC<{ mood: Mood; r?: number; gap?: number; y?: number; ink?: string; w?: number }> = ({ mood, r = 9, gap = 26, y = -8, ink = INK, w = 7 }) =>
  mood === "happy" ? (
    <g>
      <circle cx={-gap} cy={y} r={r} fill={ink} />
      <circle cx={gap} cy={y} r={r} fill={ink} />
      <path d={`M${-gap * 0.9},${y + 34} q${gap * 0.9},${gap * 0.9} ${gap * 1.8},0`} stroke={ink} strokeWidth={w} fill="none" strokeLinecap="round" />
    </g>
  ) : (
    <g>
      <circle cx={-gap} cy={y - 4} r={r * 1.5} fill="#fff" stroke={ink} strokeWidth={w * 0.8} />
      <circle cx={gap} cy={y - 4} r={r * 1.5} fill="#fff" stroke={ink} strokeWidth={w * 0.8} />
      <circle cx={-gap} cy={y - 4} r={r * 0.55} fill={ink} />
      <circle cx={gap} cy={y - 4} r={r * 0.55} fill={ink} />
      <ellipse cx={0} cy={y + 44} rx={gap * 0.7} ry={gap * 0.95} fill={ink} />
    </g>
  );

/* ----------------------------- 1. basic stick ----------------------------- */
const BasicStick: React.FC<StyleProps> = ({ p, mood }) => (
  <g>
    <g stroke={INK} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={poly([0, -30], [0, 122])} />
      <path d={poly([0, 16], p.armL[0], p.armL[1])} />
      <path d={poly([0, 16], p.armR[0], p.armR[1])} />
      <path d={poly([0, 122], p.legL[0], p.legL[1])} />
      <path d={poly([0, 122], p.legR[0], p.legR[1])} />
    </g>
    <g transform={`translate(${p.head[0]} ${p.head[1]})`}>
      <circle r={68} fill="#fff" stroke={INK} strokeWidth={9} />
      <DotFace mood={mood} r={7} gap={22} w={6} />
    </g>
  </g>
);

/* ----------------------------- 2. classic stick ----------------------------- */
const ClassicStick: React.FC<StyleProps> = ({ p, mood }) => (
  <Figure x={0} y={0} pose={p} face={mood === "happy" ? "joy" : "scream"} tint={{ head: "#ffffff", line: "#000000", shirt: PURPLE }} shadow={false} />
);

/* ----------------------------- 3. chibi hoodie ----------------------------- */
const Chibi: React.FC<StyleProps> = ({ p, mood }) => (
  <Oofy x={0} y={0} pose={p} face={mood === "happy" ? "joy" : "scream"} design={OOFY_DESIGNS.find((d) => d.key === "D")} shadow={false} />
);

/* ----------------------------- 4. blocky (Minecraft skin) ----------------------------- */
const PX = (x: number, y: number, c: string, s = 18) => <rect key={`${x},${y}`} x={x * s} y={y * s} width={s + 0.5} height={s + 0.5} fill={c} />;
const Blocky: React.FC<StyleProps> = ({ p, mood }) => {
  const H = 8, s = 19; // an 8×8 face, like the game's
  const face: React.ReactNode[] = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < H; x++) face.push(PX(x, y, y < 2 || ((x === 0 || x === 7) && y < 3) ? HAIR : y === 2 && x % 3 === 1 ? "#5d4230" : SKIN, s));
  if (mood === "happy") {
    face.push(PX(1, 4, "#fff", s), PX(2, 4, "#4b2fa6", s), PX(5, 4, "#4b2fa6", s), PX(6, 4, "#fff", s));
    face.push(PX(2, 6, "#7a3b2e", s), PX(3, 6, "#7a3b2e", s), PX(4, 6, "#7a3b2e", s), PX(5, 6, "#7a3b2e", s), PX(1, 5, "#7a3b2e", s), PX(6, 5, "#7a3b2e", s));
  } else {
    face.push(PX(1, 3, "#fff", s), PX(2, 3, "#fff", s), PX(1, 4, "#fff", s), PX(2, 4, "#4b2fa6", s), PX(5, 3, "#fff", s), PX(6, 3, "#fff", s), PX(5, 4, "#4b2fa6", s), PX(6, 4, "#fff", s));
    face.push(PX(3, 5, "#3a1414", s), PX(4, 5, "#3a1414", s), PX(3, 6, "#3a1414", s), PX(4, 6, "#3a1414", s));
  }
  const limb = (a: Pt, l: Limb, col: string, end: string) => (
    <g>
      <path d={slab(a, l[1], 44)} fill={col} stroke={INK} strokeWidth={5} />
      <path d={slab([a[0] + (l[1][0] - a[0]) * 0.7, a[1] + (l[1][1] - a[1]) * 0.7], l[1], 44)} fill={end} stroke={INK} strokeWidth={5} />
    </g>
  );
  return (
    <g>
      {limb([-24, 122], p.legL, PANTS, "#5b5b66")}
      {limb([24, 122], p.legR, PANTS, "#5b5b66")}
      <rect x={-50} y={0} width={100} height={128} fill={PURPLE} stroke={INK} strokeWidth={5} />
      <rect x={-50} y={100} width={100} height={28} fill={PURPLE_D} stroke={INK} strokeWidth={5} />
      {limb([-68, 18], p.armL, PURPLE, SKIN)}
      {limb([68, 18], p.armR, PURPLE, SKIN)}
      <g transform={`translate(${p.head[0] - (H * s) / 2} ${p.head[1] - (H * s) / 2 + 10})`}>
        {face}
        <rect width={H * s} height={H * s} fill="none" stroke={INK} strokeWidth={6} />
      </g>
    </g>
  );
};

/* ----------------------------- 5. bean ----------------------------- */
const Bean: React.FC<StyleProps> = ({ p, mood }) => {
  const q = shortLegs(p, 0.45);
  const hand = (h: Pt) => [h[0] * 0.8, h[1] * 0.75 + 10] as Pt;
  return (
    <g>
      {[q.legL, q.legR].map((l, i) => (
        <g key={i}>
          <path d={poly([i ? 34 : -34, 110], l[1])} stroke={PURPLE_D} strokeWidth={40} strokeLinecap="round" />
          <ellipse cx={l[1][0] + (i ? 8 : -8)} cy={l[1][1] - 4} rx={34} ry={20} fill="#f7f3ee" stroke={INK} strokeWidth={7} />
        </g>
      ))}
      <rect x={-104} y={-200} width={208} height={330} rx={104} fill={PURPLE} stroke={INK} strokeWidth={10} />
      <ellipse cx={0} cy={-104} rx={78} ry={60} fill={SKIN} stroke={INK} strokeWidth={7} />
      <g transform="translate(0 -100) scale(0.9)"><DotFace mood={mood} r={9} gap={26} y={-12} /></g>
      {[[-96, -10, p.armL[1]], [96, -10, p.armR[1]]].map(([x, y, h], i) => {
        const e = hand(h as Pt);
        return (
          <g key={i}>
            <path d={poly([x as number, y as number], e)} stroke={PURPLE} strokeWidth={28} strokeLinecap="round" />
            <circle cx={e[0]} cy={e[1]} r={20} fill={SKIN} stroke={INK} strokeWidth={7} />
          </g>
        );
      })}
      <path d="M-10,-196 q10,-40 44,-34 q-18,10 -18,36" fill={PURPLE} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    </g>
  );
};

/* ----------------------------- 6. rubber hose ----------------------------- */
const RubberHose: React.FC<StyleProps> = ({ p, mood }) => {
  const eye = (x: number) => (
    <g>
      <ellipse cx={x} cy={-18} rx={17} ry={30} fill="#fff" stroke={INK} strokeWidth={6} />
      <path d={`M${x - 7},${mood === "happy" ? -12 : -26} a9,16 0 1 0 14,0 l-7,6 Z`} fill={INK} />
    </g>
  );
  return (
    <g>
      {[p.legL, p.legR].map((l, i) => (
        <g key={i}>
          <path d={noodle([i ? 22 : -22, 118], l)} stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />
          <ellipse cx={l[1][0] + (i ? 18 : -18)} cy={l[1][1] - 12} rx={40} ry={22} fill="#7a3b2e" stroke={INK} strokeWidth={6} />
        </g>
      ))}
      <path d="M-50,10 Q-78,90 -58,132 L58,132 Q78,90 50,10 Q0,-6 -50,10 Z" fill={INK} />
      <path d="M-62,96 L62,96 L60,136 L-60,136 Z" fill={PURPLE} stroke={INK} strokeWidth={6} />
      {[-20, 20].map((x) => <circle key={x} cx={x} cy={112} r={7} fill="#fff" />)}
      {[[-40, 20, p.armL], [40, 20, p.armR]].map(([x, y, l], i) => {
        const L = l as Limb;
        return (
          <g key={i}>
            <path d={noodle([x as number, y as number], L)} stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />
            <circle cx={L[1][0]} cy={L[1][1]} r={25} fill="#fff" stroke={INK} strokeWidth={6} />
            <path d={`M${L[1][0] - 14},${L[1][1] + 18} h28`} stroke={INK} strokeWidth={6} />
          </g>
        );
      })}
      <g transform={`translate(${p.head[0]} ${p.head[1]})`}>
        <circle r={86} fill={INK} />
        <path d="M-72,10 Q-76,-60 -24,-46 Q0,-30 24,-46 Q76,-60 72,10 Q60,80 0,82 Q-60,80 -72,10 Z" fill={SKIN} stroke={INK} strokeWidth={6} />
        {eye(-20)}
        {eye(20)}
        <ellipse cx={0} cy={22} rx={16} ry={11} fill={INK} />
        {mood === "happy" ? <path d="M-46,34 Q0,82 46,34 Q0,56 -46,34 Z" fill="#7a1f2b" stroke={INK} strokeWidth={6} /> : <ellipse cx={0} cy={54} rx={22} ry={24} fill="#7a1f2b" stroke={INK} strokeWidth={6} />}
      </g>
    </g>
  );
};

/* ----------------------------- 7. flat (no outlines) ----------------------------- */
const Flat: React.FC<StyleProps> = ({ p, mood }) => (
  <g strokeLinecap="round">
    {[p.legL, p.legR].map((l, i) => <path key={i} d={poly([i ? 26 : -26, 118], l[0], l[1])} stroke={PANTS} strokeWidth={40} fill="none" strokeLinejoin="round" />)}
    <rect x={-64} y={0} width={128} height={138} rx={40} fill={PURPLE} />
    <rect x={-64} y={70} width={128} height={68} rx={30} fill={PURPLE_D} opacity={0.55} />
    {[p.armL, p.armR].map((l, i) => (
      <g key={i}>
        <path d={poly([i ? 50 : -50, 24], l[0], l[1])} stroke={PURPLE} strokeWidth={34} fill="none" strokeLinejoin="round" />
        <circle cx={l[1][0]} cy={l[1][1]} r={20} fill={SKIN} />
      </g>
    ))}
    <g transform={`translate(${p.head[0]} ${p.head[1]})`}>
      <circle r={88} fill={SKIN} />
      <path d="M-90,-6 A90,90 0 0 1 90,-6 Q60,-40 20,-34 Q-30,-60 -90,-6 Z" fill={HAIR} />
      <circle cx={-50} cy={24} r={14} fill="#ffb0b8" opacity={0.7} />
      <circle cx={50} cy={24} r={14} fill="#ffb0b8" opacity={0.7} />
      <DotFace mood={mood} r={8} gap={24} y={4} ink="#2b2440" w={6} />
    </g>
  </g>
);

/* ----------------------------- 8. anime chibi ----------------------------- */
const Anime: React.FC<StyleProps> = ({ p: p0, mood }) => {
  const p = shortLegs(p0, 0.55);
  const eye = (x: number) =>
    mood === "happy" ? (
      <path d={`M${x - 22},-2 q22,-26 44,0`} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
    ) : (
      <g>
        <ellipse cx={x} cy={-4} rx={24} ry={32} fill="#fff" stroke={INK} strokeWidth={5} />
        <ellipse cx={x} cy={2} rx={16} ry={24} fill="#6b3fd6" />
        <ellipse cx={x} cy={4} rx={8} ry={12} fill={INK} />
        <circle cx={x - 6} cy={-10} r={6} fill="#fff" />
      </g>
    );
  return (
    <g transform="translate(0 70)">
      {[p.legL, p.legR].map((l, i) => (
        <g key={i}>
          <path d={poly([i ? 22 : -22, 110], l[1])} stroke={INK} strokeWidth={34} strokeLinecap="round" />
          <path d={poly([i ? 22 : -22, 110], l[1])} stroke={PANTS} strokeWidth={24} strokeLinecap="round" />
        </g>
      ))}
      <path d="M-46,4 L46,4 L58,124 L-58,124 Z" fill={PURPLE} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[p.armL, p.armR].map((l, i) => {
        const h: Pt = [l[1][0] * 0.7, l[1][1] * 0.7];
        return (
          <g key={i}>
            <path d={poly([i ? 40 : -40, 16], h)} stroke={INK} strokeWidth={28} strokeLinecap="round" />
            <path d={poly([i ? 40 : -40, 16], h)} stroke={PURPLE} strokeWidth={18} strokeLinecap="round" />
            <circle cx={h[0]} cy={h[1]} r={14} fill={SKIN} stroke={INK} strokeWidth={5} />
          </g>
        );
      })}
      <g transform="translate(0 -130)">
        <path d="M-150,40 L-170,-40 L-120,-60 L-140,-130 L-70,-110 L-50,-180 L0,-130 L40,-190 L70,-120 L140,-150 L120,-80 L170,-50 L140,40 Z" fill={HAIR} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <ellipse rx={132} ry={122} fill={SKIN} stroke={INK} strokeWidth={6} />
        <path d="M-136,-20 L-120,-100 L-90,-60 L-60,-120 L-30,-60 L10,-130 L30,-60 L70,-116 L90,-56 L126,-96 L136,-20 Q60,-70 0,-60 Q-80,-70 -136,-20 Z" fill={HAIR} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {eye(-48)}
        {eye(48)}
        <ellipse cx={-80} cy={40} rx={20} ry={11} fill="#ff9fb4" opacity={0.7} />
        <ellipse cx={80} cy={40} rx={20} ry={11} fill="#ff9fb4" opacity={0.7} />
        {mood === "happy" ? <path d="M-18,50 q18,20 36,0 Z" fill="#8a2a3b" stroke={INK} strokeWidth={5} /> : <ellipse cx={0} cy={62} rx={16} ry={20} fill="#8a2a3b" stroke={INK} strokeWidth={5} />}
      </g>
    </g>
  );
};

/* ----------------------------- 9. paper cut-out ----------------------------- */
const Paper: React.FC<StyleProps> = ({ p: p0, mood }) => {
  const p = shortLegs(p0, 0.35);
  const body = (dx: number, dy: number, sh?: boolean) => (
    <g transform={`translate(${dx} ${dy})`} opacity={sh ? 0.18 : 1}>
      {[p.legL, p.legR].map((l, i) => <ellipse key={i} cx={l[1][0] + (i ? 10 : -10)} cy={l[1][1] - 6} rx={40} ry={18} fill={sh ? "#000" : "#222"} />)}
      <path d="M-78,40 L78,40 L96,200 L-96,200 Z" transform="translate(0 -40)" fill={sh ? "#000" : PURPLE} />
      <path d="M0,4 V156" stroke={sh ? "#000" : PURPLE_D} strokeWidth={6} />
      {[p.armL, p.armR].map((l, i) => {
        const h: Pt = [l[1][0] * 0.8 + (i ? 20 : -20), Math.min(l[1][1] * 0.7 + 40, 150)];
        return (
          <g key={i}>
            <path d={poly([i ? 70 : -70, 30], h)} stroke={sh ? "#000" : PURPLE} strokeWidth={36} strokeLinecap="round" />
            <circle cx={h[0]} cy={h[1]} r={22} fill={sh ? "#000" : "#f2b53a"} />
          </g>
        );
      })}
      <g transform={`translate(${p.head[0]} ${p.head[1] + 10})`}>
        <ellipse rx={118} ry={96} fill={sh ? "#000" : SKIN} />
        {!sh && (
          <>
            <path d="M-110,-30 Q-100,-120 0,-122 Q100,-120 110,-30 Z" fill="#f2b53a" />
            <rect x={-116} y={-46} width={232} height={26} rx={10} fill="#e39a1f" />
            <circle cx={0} cy={-128} r={22} fill="#fff4dc" />
            <ellipse cx={-26} cy={4} rx={30} ry={34} fill="#fff" />
            <ellipse cx={26} cy={4} rx={30} ry={34} fill="#fff" />
            <circle cx={mood === "happy" ? -20 : -26} cy={mood === "happy" ? 8 : 4} r={mood === "happy" ? 6 : 4} fill="#111" />
            <circle cx={mood === "happy" ? 20 : 26} cy={mood === "happy" ? 8 : 4} r={mood === "happy" ? 6 : 4} fill="#111" />
            {mood === "happy" ? <path d="M-24,58 q24,12 48,0" stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" /> : <ellipse cx={0} cy={62} rx={20} ry={16} fill="#3a1414" />}
          </>
        )}
      </g>
    </g>
  );
  return <g>{body(10, 10, true)}{body(0, 0)}</g>;
};

/* ----------------------------- 10. limbless ----------------------------- */
const Limbless: React.FC<StyleProps> = ({ p, mood }) => (
  <g>
    {[p.legL, p.legR].map((l, i) => (
      <ellipse key={i} cx={l[1][0] + (i ? 14 : -14)} cy={l[1][1] - 18} rx={44} ry={26} fill="#f7f3ee" stroke={INK} strokeWidth={8} />
    ))}
    <ellipse cx={0} cy={80} rx={70} ry={84} fill={PURPLE} stroke={INK} strokeWidth={9} />
    <path d="M-40,40 Q0,60 40,40" stroke={PURPLE_D} strokeWidth={8} fill="none" strokeLinecap="round" />
    {[p.armL, p.armR].map((l, i) => (
      <g key={i}>
        <circle cx={l[1][0]} cy={l[1][1]} r={30} fill="#fff" stroke={INK} strokeWidth={8} />
        <path d={`M${l[1][0] - 10},${l[1][1] - 26} v22`} stroke={INK} strokeWidth={5} />
      </g>
    ))}
    <g transform={`translate(${p.head[0]} ${p.head[1] - 30})`}>
      <path d="M-100,-10 L-120,-70 L-80,-66 L-86,-120 L-40,-96 L-20,-150 L14,-104 L50,-140 L60,-90 L110,-100 L96,-50 L124,-24 L100,-10 Z" fill={HAIR} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <circle r={96} fill={SKIN} stroke={INK} strokeWidth={9} />
      <path d="M-96,-16 Q-80,-100 0,-100 Q80,-100 96,-16 Q70,-50 30,-40 L20,-62 L0,-38 L-24,-60 L-40,-36 Q-70,-50 -96,-16 Z" fill={HAIR} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <g transform="translate(0 16)"><DotFace mood={mood} r={10} gap={28} /></g>
    </g>
  </g>
);

export const STYLES: { key: string; name: string; C: React.FC<StyleProps> }[] = [
  { key: "1", name: "basic stick", C: BasicStick },
  { key: "2", name: "classic stick", C: ClassicStick },
  { key: "3", name: "chibi hoodie", C: Chibi },
  { key: "4", name: "blocky", C: Blocky },
  { key: "5", name: "bean", C: Bean },
  { key: "6", name: "rubber hose", C: RubberHose },
  { key: "7", name: "flat", C: Flat },
  { key: "8", name: "anime chibi", C: Anime },
  { key: "9", name: "paper cut-out", C: Paper },
  { key: "10", name: "limbless", C: Limbless },
];

const Label: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; fill?: string }> = ({ x, y, children, size = 30, fill = "#141414" }) => (
  <text x={x} y={y} fontFamily="Silkscreen, monospace" fontSize={size} fill={fill} textAnchor="middle">{children}</text>
);

/** the ten, in a 5×2 grid: each standing happy and screaming with arms up */
export const OofyStyles: React.FC = () => {
  loadMinecraftFonts();
  const cw = 1920 / 5, ch = 1080 / 2;
  const cheer: Pose = POSE.up;
  const walk = walkPose(0.2, 60);
  return (
    <AbsoluteFill style={{ backgroundColor: "#f3efe8" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {STYLES.map(({ key, name, C }, i) => {
          const x0 = (i % 5) * cw, y0 = Math.floor(i / 5) * ch;
          return (
            <g key={key}>
              <rect x={x0} y={y0} width={cw} height={ch} fill={(i + Math.floor(i / 5)) % 2 ? "#e9f3fb" : "#eef7ea"} />
              <Label x={x0 + cw / 2} y={y0 + 42} size={30}>{`${key}. ${name}`}</Label>
              <g transform={`translate(${x0 + cw * 0.28} ${y0 + 250}) scale(0.5)`}><C p={walk} mood="happy" /></g>
              <g transform={`translate(${x0 + cw * 0.73} ${y0 + 250}) scale(0.5)`}><C p={cheer} mood="scream" /></g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

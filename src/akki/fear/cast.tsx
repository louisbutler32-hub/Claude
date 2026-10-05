import React, { useId } from "react";
import { INK } from "../common";
import {
  add, armDir, Eye, footShape, Hand, HandKind, HeadBase, mix, mul, nrm, P, Part, Pose, SKIN, smooth, sub, torsoPts, tube, Wrap,
} from "../bowling/characters";

/**
 * The cast of "Zoro's Biggest Fear": the Sea King, a crowd of identical Marines,
 * the hawk-eyed swordsman, Nami (original take: short orange hair, striped top,
 * denim skirt, calculator) and the props — receipt, berry pouch. Everything is
 * drawn here in SVG on the shared figure kit (src/akki/bowling/characters.tsx).
 */

const fx = (p: P) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
export const rnd = (i: number, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };

/* ------------------------------------ the Sea King ------------------------------------ */

const SPINE: P[] = [[130, 120], [160, -240], [100, -560], [-20, -820], [-190, -960], [-350, -990]];
const SPINE_LUNGE: P[] = [[130, 120], [170, -180], [110, -360], [-40, -470], [-230, -470], [-400, -380]];
const SW = [138, 122, 104, 92, 86, 88];
const SK = { base: "#35a58f", shade: "#1d6e68", belly: "#d9efb8", fin: "#e8613a", finS: "#a63a22" };

/** the Sea King's head in local space: neck joint at (0,0), snout toward -x; `jaw` opens the lower jaw (degrees) */
const KingHead: React.FC<{ jaw: number; lw: number }> = ({ jaw, lw }) => {
  const piv: P = [30, 62];
  const rot = (p: P): P => {
    const a = (-jaw * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    const d = sub(p, piv);
    return [piv[0] + d[0] * c - d[1] * s, piv[1] + d[0] * s + d[1] * c];
  };
  const upperEdge = (u: number): P => [-400 + 430 * u, 14 + 40 * u];
  const lowerTop = (u: number): P => [-340 + 370 * u, 56 + (u > 0.5 ? 0 : 0)];
  const tip = rot([-340, 56]);
  return (
    <g>
      {/* frill fin behind the head */}
      <Part d={smooth([[60, -70], [90, -190], [20, -150], [30, -250], [-40, -170], [-60, -220], [-90, -130], [-20, -30]], true, 0.4)} fill={SK.fin} shade={SK.finS} lw={lw} />
      {/* inside of the mouth */}
      <path d={`M30,36 L-396,12 L${fx(tip)} L${fx(rot([30, 118]))}Z`} fill="#6a1822" stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
      <path d={`M-60,50 Q-120,${tip[1] - 6} -250,${tip[1] - 14} Q-150,${tip[1] - 46} -60,50Z`} fill="#e0585a" />
      {/* lower jaw */}
      <g transform={`rotate(${-jaw} ${piv[0]} ${piv[1]})`}>
        <Part d={smooth([[30, 40], [-150, 52], [-330, 52], [-392, 74], [-352, 128], [-170, 140], [30, 124]], true, 0.8)} fill={SK.base} shade={SK.shade} lw={lw} sh={[-8, -10]}>
          <path d="M-370,100 Q-170,128 20,108" stroke={SK.belly} strokeWidth={22} fill="none" opacity={0.9} />
        </Part>
        {Array.from({ length: 6 }, (_, i) => {
          const b = lowerTop(0.1 + i * 0.15);
          return <path key={i} d={`M${b[0] - 17},${b[1] + 1} L${b[0] + 2},${b[1] - 46 - (i % 2) * 12} L${b[0] + 17},${b[1] + 1}Z`} fill="#fffdf2" stroke={INK} strokeWidth={lw * 0.7} strokeLinejoin="round" />;
        })}
      </g>
      {/* skull + upper jaw */}
      <Part d={smooth([[50, -130], [-90, -165], [-260, -128], [-392, -66], [-424, -14], [-392, 22], [-250, 30], [-100, 40], [50, 66]], true, 0.9)} fill={SK.base} shade={SK.shade} lw={lw} sh={[-10, -12]}>
        <path d="M-420,-20 L-300,-40 M-160,-150 q30,26 10,60 M-30,-150 q30,30 6,70" stroke={SK.shade} strokeWidth={8} fill="none" strokeLinecap="round" />
      </Part>
      {Array.from({ length: 7 }, (_, i) => {
        const b = upperEdge(0.04 + i * 0.13);
        return <path key={i} d={`M${b[0] - 20},${b[1] - 2} L${b[0] + 3},${b[1] + 52 + (i % 2) * 16} L${b[0] + 22},${b[1] + 2}Z`} fill="#fffdf2" stroke={INK} strokeWidth={lw * 0.7} strokeLinejoin="round" />;
      })}
      {/* crest spikes */}
      {[-200, -110, -20].map((x, i) => (
        <path key={i} d={`M${x - 30},${-150 + i * 8} L${x + 6},${-236 + i * 14} L${x + 34},${-140 + i * 8}Z`} fill={SK.fin} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
      ))}
      {/* nostril + eye */}
      <ellipse cx={-392} cy={-34} rx={14} ry={9} fill={INK} />
      <ellipse cx={-170} cy={-72} rx={44} ry={32} fill="#ffd23a" stroke={INK} strokeWidth={lw} />
      <ellipse cx={-176} cy={-72} rx={9} ry={26} fill={INK} />
      <path d="M-232,-122 L-118,-76" stroke={INK} strokeWidth={22} strokeLinecap="round" />
    </g>
  );
};

type KingProps = { x: number; y: number; s?: number; jaw?: number; lean?: number; head?: number; lw?: number; wob?: number; rear?: number };

/** a gigantic cartoon sea serpent; base at (x,y) in the water, head rearing over to the left */
export const SeaKing: React.FC<KingProps> = ({ x, y, s = 1, jaw = 30, lean = 0, head = 8, lw = 7, wob = 0, rear = 1 }) => {
  const sp = SPINE.map((p, i): P => { const m = mix(SPINE_LUNGE[i], p, rear); return [m[0] + Math.sin(wob + i) * 10 * (i / 5), m[1]]; });
  const neck = sp[sp.length - 1];
  return (
    <g transform={`translate(${x},${y}) rotate(${lean}) scale(${s})`}>
      {/* back fins */}
      {sp.slice(0, 5).map((p, i) => (
        <path key={i} d={`M${p[0] + SW[i] * 0.7},${p[1] + 60} L${p[0] + SW[i] + 90},${p[1] - 20} L${p[0] + SW[i] * 0.8},${p[1] - 80}Z`} fill={SK.fin} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />
      ))}
      <Part d={tube(sp, SW)} fill={SK.base} shade={SK.shade} lw={lw} sh={[-24, -6]}>
        {/* pale belly on the near side */}
        <path d={`M${fx(add(sp[0], [-SW[0] * 0.7, 0]))} ${sp.slice(1).map((p, i) => `L${fx(add(p, [-SW[i + 1] * 0.62, i > 2 ? SW[i + 1] * 0.5 : 0]))}`).join(" ")}`} stroke={SK.belly} strokeWidth={46} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
        {/* scale rows */}
        {sp.slice(0, 5).map((p, i) => <path key={i} d={`M${p[0] - SW[i]},${p[1]} q${SW[i]},${40} ${SW[i] * 2},0`} stroke={SK.shade} strokeWidth={7} fill="none" />)}
        {sp.slice(0, 5).map((p, i) => <path key={`b${i}`} d={`M${p[0] - SW[i]},${p[1] + 130} q${SW[i]},${40} ${SW[i] * 2},0`} stroke={SK.shade} strokeWidth={7} fill="none" />)}
      </Part>
      <g transform={`translate(${neck[0]},${neck[1]}) rotate(${head})`}><KingHead jaw={jaw} lw={lw} /></g>
    </g>
  );
};

/**
 * the Sea King, cut in two along a line through `at` (local space) in direction `dir`:
 * `k` 0..1 slides the halves apart (the head half flies off to the left and drops, the body sinks)
 */
export const SeaKingCut: React.FC<KingProps & { k: number; at?: P; dir?: P }> = ({ k, x, y, s = 1, at = [-130, -470], dir = [0.42, -1], ...rest }) => {
  const id = "kc" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const L = Math.hypot(dir[0], dir[1]);
  const d: P = [dir[0] / L, dir[1] / L];
  const n: P = [d[1], -d[0]]; // normal, pointing to the +x side of a near-vertical line
  const far = 4000;
  const A: P = [at[0] - d[0] * far, at[1] - d[1] * far], Bp: P = [at[0] + d[0] * far, at[1] + d[1] * far];
  const poly = (sg: number) => `M${fx(A)} L${fx(Bp)} L${fx([Bp[0] + sg * n[0] * far, Bp[1] + sg * n[1] * far])} L${fx([A[0] + sg * n[0] * far, A[1] + sg * n[1] * far])}Z`;
  const e = 1 - Math.pow(1 - k, 2.4);
  const fall = Math.pow(k, 2.2);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs>
        <clipPath id={id + "r"}><path d={poly(1)} /></clipPath>
        <clipPath id={id + "l"}><path d={poly(-1)} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}r)`} transform={`translate(${60 * e},${190 * e})`}><SeaKing x={0} y={0} s={1} {...rest} /></g>
      <g clipPath={`url(#${id}l)`} transform={`translate(${-520 * e},${-260 * e + 700 * fall}) rotate(${-44 * e} ${at[0]} ${at[1]})`}><SeaKing x={0} y={0} s={1} {...rest} /></g>
      {k < 0.5 && <path d={`M${fx(A)} L${fx(Bp)}`} stroke="#fff" strokeWidth={16 * (1 - k * 2)} strokeLinecap="round" opacity={1 - k * 2} />}
    </g>
  );
};

/* ------------------------------------ the Marines ------------------------------------ */

export const MARINE = { cap: "#f7f7f2", capS: "#c9cfdc", blue: "#2f5da8", blueS: "#1e3c70", white: "#f2f2ec", whiteS: "#c4cadb", pants: "#27304f" };

/**
 * One identical Marine (feet at 0,0, ~440 tall at s=1): white cap, sailor collar,
 * dot eyes, shouting mouth, cutlass up. `run` is the run-cycle phase, `fall` 0..1
 * topples him backwards, `face` flips him to charge toward -x.
 */
export const Marine: React.FC<{ x: number; y: number; s?: number; run?: number; fall?: number; dir?: 1 | -1; seed?: number; fwd?: boolean }> = ({ x, y, s = 1, run = 0, fall = 0, dir = -1, seed = 0, fwd = false }) => {
  const sw = 5;
  const a = Math.sin(run), b = Math.sin(run + Math.PI);
  const lift = (v: number) => Math.max(0, v) * 34;
  const rot = fall * 96 * (fwd ? dir : -dir); // topple backwards (away from the charge), or face-plant
  const hop = fall > 0 ? -Math.sin(fall * Math.PI) * 30 : -Math.abs(a) * 10;
  const leg = (v: number, side: number) => <path key={side} d={`M${side * 20},-190 L${side * 20 + v * 56},${-100 - lift(v)} L${side * 20 + v * 88},${-lift(v) - 20}`} stroke={INK} strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  const legF = (v: number, side: number) => <path key={`f${side}`} d={`M${side * 20},-190 L${side * 20 + v * 56},${-100 - lift(v)} L${side * 20 + v * 88},${-lift(v) - 20}`} stroke={MARINE.pants} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  const sword = fall > 0.1 ? 40 : -50 + Math.sin(run * 2) * 14;
  return (
    <g transform={`translate(${x},${y + hop}) rotate(${rot}) scale(${s * dir},${s})`}>
      {/* legs */}
      {leg(a, -1)}{leg(b, 1)}{legF(a, -1)}{legF(b, 1)}
      <ellipse cx={a * 88 + -20} cy={-lift(a) - 14} rx={30} ry={14} fill="#15151a" stroke={INK} strokeWidth={sw} />
      <ellipse cx={b * 88 + 20} cy={-lift(b) - 14} rx={30} ry={14} fill="#15151a" stroke={INK} strokeWidth={sw} />
      {/* back arm */}
      <path d={`M-34,-300 L-70,-250 L-92,${-200 + b * 20}`} stroke={INK} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M-34,-300 L-70,-250 L-92,${-200 + b * 20}`} stroke="#f0c29a" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* body */}
      <path d="M-46,-322 Q0,-340 46,-322 L52,-190 L-52,-190Z" fill={MARINE.white} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M12,-322 L46,-322 L52,-190 L30,-190Z" fill={MARINE.whiteS} />
      <path d="M-34,-324 L0,-270 L34,-324 L22,-330 L0,-304 L-22,-330Z" fill={MARINE.blue} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-52} y={-206} width={104} height={16} fill={MARINE.pants} stroke={INK} strokeWidth={4} />
      {/* sword arm, raised */}
      <g transform={`translate(34,-300) rotate(${sword})`}>
        <path d="M0,0 L40,-40 L50,-100" stroke={INK} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M0,0 L40,-40 L50,-100" stroke="#f0c29a" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M50,-100 L58,-230" stroke={INK} strokeWidth={16} strokeLinecap="round" />
        <path d="M50,-100 L58,-226" stroke="#dfe6f2" strokeWidth={7} strokeLinecap="round" />
        <path d="M38,-108 L64,-104" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      </g>
      {/* head */}
      <g transform={`translate(0,-376)`}>
        <ellipse cx={0} cy={0} rx={44} ry={46} fill="#f0c29a" stroke={INK} strokeWidth={sw} />
        <path d="M14,-40 Q46,-20 40,22 Q26,40 8,44 Q34,10 14,-40Z" fill="#d9946a" />
        <path d="M-30,-8 L-10,-3 M30,-8 L10,-3" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <circle cx={-18} cy={4} r={4.6} fill={INK} /><circle cx={18} cy={4} r={4.6} fill={INK} />
        <path d="M-16,22 Q0,44 16,22Z" fill="#7a1e22" stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
        {/* the white cap */}
        <path d="M-54,-12 Q-60,-78 0,-84 Q60,-78 54,-12 Q0,-30 -54,-12Z" fill={MARINE.cap} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M-52,-18 Q0,-36 52,-18 L50,-4 Q0,-22 -50,-4Z" fill={MARINE.blue} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M30,-76 Q56,-60 54,-14 Q46,-40 30,-76Z" fill={MARINE.capS} />
        <circle cx={0} cy={-52} r={9} fill="#e0c050" stroke={INK} strokeWidth={3} />
      </g>
      <g opacity={0}>{seed}</g>
    </g>
  );
};

/* ------------------------------------ the hawk-eyed swordsman ------------------------------------ */

/**
 * An original "Hawk Eye" type: tall black coat with a stand-up collar, wide flat
 * black hat with a long feather, narrow gold hawk eyes, stubble goatee, and an
 * enormous black sword on his back. Feet at (0,0), ~900 tall at s=1.
 */
export const HawkEye: React.FC<{ x: number; y: number; s?: number; flipX?: boolean; coat?: number }> = ({ x, y, s = 1, flipX, coat = 0 }) => {
  const lw = 6;
  const BLK = "#23212b", BLKS = "#121118";
  const sway = Math.sin(coat) * 12;
  return (
    <Wrap x={x} y={y} s={s} flipX={flipX}>
      {/* the huge black sword on his back */}
      <g transform="translate(40,-720) rotate(-32)">
        <Part d={smooth([[-10, -16], [640, -30], [700, 0], [640, 30], [-10, 16]], true, 0.2)} fill="#2a2a34" shade="#101016" lw={lw} sh={[0, -8]}>
          <path d="M80,-4 L620,-6" stroke="#6a6a7e" strokeWidth={6} strokeLinecap="round" />
        </Part>
        <Part d={smooth([[-120, -12], [-10, -14], [-10, 14], [-120, 12]], true, 0.2)} fill="#6a1818" shade="#3a0a0a" lw={lw} />
        <Part d={smooth([[-20, -86], [10, -86], [10, 86], [-20, 86]], true, 0.2)} fill="#3c3b48" shade="#1a1a22" lw={lw} />
        <Part d={smooth([[-56, -22], [-30, -22], [-30, 22], [-56, 22]], true, 0.2)} fill="#c9a84a" shade="#8a6a20" lw={lw} />
      </g>
      {/* coat tails */}
      <Part d={smooth([[-120, -520], [140, -520], [190 + sway, -120], [0 + sway, -60], [-190 + sway, -120]], true, 0.35)} fill={BLK} shade={BLKS} lw={lw} sh={[-14, -4]}>
        <path d="M0,-520 L2,-70" stroke={BLKS} strokeWidth={6} />
      </Part>
      {/* legs */}
      <Part d={tube([[-42, -420], [-50, -220], [-56, -30]], [34, 30, 28])} fill="#1a1a22" shade="#0c0c10" lw={lw} />
      <Part d={tube([[42, -420], [50, -220], [56, -30]], [34, 30, 28])} fill="#1a1a22" shade="#0c0c10" lw={lw} />
      <Part d={smooth([[-100, -30], [-26, -34], [-20, 8], [-100, 8]], true, 0.3)} fill="#2a1a12" shade="#140a06" lw={lw} />
      <Part d={smooth([[100, -30], [26, -34], [20, 8], [100, 8]], true, 0.3)} fill="#2a1a12" shade="#140a06" lw={lw} />
      {/* torso: open V coat, bare chest with a gold cross pendant */}
      <Part d={smooth([[-110, -820], [110, -820], [130, -520], [-130, -520]], true, 0.3)} fill={BLK} shade={BLKS} lw={lw} sh={[-12, -4]}>
        <path d="M-52,-830 L0,-560 L52,-830Z" fill="#e8b890" />
        <path d="M-52,-830 L0,-560 L52,-830" stroke={INK} strokeWidth={4} fill="none" strokeLinejoin="round" />
        <path d="M0,-720 v62 M-18,-694 h36" stroke="#e8c040" strokeWidth={8} strokeLinecap="round" />
      </Part>
      {/* stand-up collar */}
      <Part d={smooth([[-120, -800], [-90, -900], [-40, -840], [-60, -800]], true, 0.3)} fill={BLK} shade={BLKS} lw={lw} />
      <Part d={smooth([[120, -800], [90, -900], [40, -840], [60, -800]], true, 0.3)} fill={BLK} shade={BLKS} lw={lw} />
      {/* arms folded, big sleeves */}
      <Part d={tube([[-110, -790], [-130, -650], [-40, -640]], [34, 32, 28])} fill={BLK} shade={BLKS} lw={lw} />
      <Part d={tube([[110, -790], [130, -650], [40, -650]], [34, 32, 28])} fill={BLK} shade={BLKS} lw={lw} />
      <Part d={smooth([[-60, -690], [60, -690], [66, -630], [-66, -630]], true, 0.3)} fill={BLK} shade={BLKS} lw={lw} />
      {/* head */}
      <g transform="translate(0,-900) scale(1.15)">
        <HeadBase turn={0} skin={SKIN} lw={lw * 0.8} jaw={1.0} neckW={22} />
        {/* stubble goatee + moustache */}
        <path d="M-26,30 Q0,22 26,30 Q22,44 0,42 Q-22,44 -26,30Z" fill="#2a2420" />
        <path d="M-12,48 Q0,80 12,48 Q0,54 -12,48Z" fill="#2a2420" stroke={INK} strokeWidth={2} />
        {/* narrow gold hawk eyes */}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M${sd * 40},-6 Q${sd * 22},-18 ${sd * 6},-2 Q${sd * 22},6 ${sd * 40},-6Z`} fill="#ffe27a" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
            <circle cx={sd * 22} cy={-6} r={4.4} fill={INK} />
            <path d={`M${sd * 46},-20 L${sd * 4},-8`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          </g>
        ))}
        <path d="M0,8 L4,24 L-2,26" stroke={INK} strokeWidth={2.2} fill="none" />
        <path d="M-12,40 L12,40" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      </g>
      {/* the big flat hat and long feather */}
      <Part d={smooth([[-200, -980], [-90, -1010], [90, -1010], [200, -980], [90, -960], [-90, -960]], true, 0.4)} fill="#1c1a24" shade="#0c0b10" lw={lw} sh={[-6, -8]} />
      <Part d={smooth([[-84, -1000], [-70, -1086], [70, -1086], [84, -1000]], true, 0.4)} fill="#23212b" shade="#121118" lw={lw} />
      <path d="M-84,-1020 L84,-1020" stroke="#c9a84a" strokeWidth={9} />
      <path d="M60,-1030 Q170,-1120 230,-1000 Q150,-1050 80,-1020Z" fill="#c43a3a" stroke={INK} strokeWidth={lw * 0.8} strokeLinejoin="round" />
    </Wrap>
  );
};

/* ------------------------------------ Nami ------------------------------------ */

export const NAMI = { hair: "#ff8a1c", hairS: "#d95f0c", top: "#f4f6fb", topS: "#bfc8dc", stripe: "#2e86d8", skirt: "#3f6fb0", skirtS: "#284a80", boot: "#b9824e", bootS: "#7e5230" };

export type NFace = "smile" | "grin" | "coin" | "angry" | "smug" | "shock";

export const NamiHead: React.FC<{ face?: NFace; turn?: number; lw: number }> = ({ face = "smile", turn = 0, lw }) => {
  const sx = turn * 12;
  const mouth = (() => {
    if (face === "grin" || face === "coin") return (
      <g>
        <path d={`M${sx - 24},38 Q${sx},48 ${sx + 24},38 Q${sx + 18},66 ${sx},68 Q${sx - 18},66 ${sx - 24},38Z`} fill="#7a1e22" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
        <path d={`M${sx - 21},40 Q${sx},48 ${sx + 21},40 L${sx + 19},48 Q${sx},54 ${sx - 19},48Z`} fill="#fff" />
      </g>
    );
    if (face === "angry") return <path d={`M${sx - 18},52 Q${sx},40 ${sx + 18},52`} stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />;
    if (face === "shock") return <ellipse cx={sx} cy={50} rx={8} ry={11} fill="#5a1418" stroke={INK} strokeWidth={2.6} />;
    if (face === "smug") return <path d={`M${sx - 16},46 Q${sx + 2},56 ${sx + 20},40`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
    return <path d={`M${sx - 14},46 Q${sx},54 ${sx + 14},46`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
  })();
  return (
    <g>
      {/* back of the bob */}
      <Part d={smooth([[-66, -20], [-70, -78], [-24, -112], [34, -108], [70, -70], [66, -10], [62, 36], [44, 54], [40, 10], [-40, 10], [-46, 54], [-64, 38]], true, 0.6)} fill={NAMI.hair} shade={NAMI.hairS} lw={lw} />
      <HeadBase turn={turn} skin={SKIN} lw={lw} jaw={0.95} neckW={14} />
      {/* fringe, swept to one side */}
      <Part d={smooth([[-62 + sx, 6], [-66, -60], [-28, -96], [24, -98], [64, -66], [62 + sx, 6], [48, -26], [26, -52], [6 + sx, -26], [-12, -50], [-34, -22], [-46, -42]], true, 0.6)} fill={NAMI.hair} shade={NAMI.hairS} lw={lw} sh={[-4, -5]} />
      <path d={`M${-8 + sx},-90 q14,18 4,40 M${-30 + sx},-84 q12,16 4,32`} stroke={NAMI.hairS} strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* eyes: big and round, lashes */}
      {face === "coin" ? (
        [-20, 20].map((ex) => (
          <g key={ex}>
            <circle cx={ex + sx} cy={0} r={15} fill="#ffd23a" stroke={INK} strokeWidth={2.4} />
            <text x={ex + sx} y={8} textAnchor="middle" fontFamily="Poppins Black" fontSize={22} fill="#a06a08">B</text>
          </g>
        ))
      ) : face === "angry" ? (
        <>
          <Eye x={-20 + sx} y={2} kind="angry" /><Eye x={20 + sx} y={2} kind="angry" flip />
        </>
      ) : face === "shock" ? (
        <><Eye x={-20 + sx} y={0} kind="shock" /><Eye x={20 + sx} y={0} kind="shock" flip /></>
      ) : (
        <>
          <Eye x={-20 + sx} y={0} kind="round" iris="#7a4a2a" /><Eye x={20 + sx} y={0} kind="round" iris="#7a4a2a" flip />
        </>
      )}
      <path d={`M${-34 + sx},${face === "angry" ? -20 : -22} l22,${face === "angry" ? 10 : -2} M${34 + sx},${face === "angry" ? -20 : -22} l-22,${face === "angry" ? 10 : -2}`} stroke={NAMI.hairS} strokeWidth={3.4} strokeLinecap="round" />
      <path d={`M${sx + 2},12 l3,12 l-5,2`} stroke={INK} strokeWidth={2} fill="none" strokeLinejoin="round" />
      {mouth}
    </g>
  );
};

type NProps = { p: Pose; lw?: number; face?: NFace; x?: number; y?: number; s?: number; flipX?: boolean; children?: React.ReactNode };

/** Nami: striped crop top, denim mini, tan boots, short orange hair. Same skeleton as the rest of the cast. */
export const NamiFig: React.FC<NProps> = ({ p, lw = 4, face = "smile", x = 0, y = 0, s = 1, flipX, children }) => {
  const skin = SKIN;
  const T = torsoPts(p, 0.2, 10);
  const midH = mix(p.hipL, p.hipR, 0.5);
  const leg = (hip: P, kn: P, ft: P, fd: number, key: string) => (
    <g key={key}>
      <Part d={tube([hip, kn, ft], [21, 18, 15])} fill={skin.base} shade={skin.shade} lw={lw} />
      <Part d={tube([mix(kn, ft, 0.5), add(ft, [0, 6])], [19, 18])} fill={NAMI.boot} shade={NAMI.bootS} lw={lw} />
      <g transform={`translate(${ft[0]},${ft[1] + 4})`}><Part d={footShape(fd, 1.0)} fill={NAMI.boot} shade={NAMI.bootS} lw={lw} /></g>
    </g>
  );
  const arm = (sh: P, el: P, ha: P, hk: HandKind, side: number, key: string) => (
    <g key={key}>
      <Part d={tube([sh, el, ha], [14, 12, 10])} fill={skin.base} shade={skin.shade} lw={lw} />
      <Hand at={ha} dir={armDir(el, ha)} kind={hk} skin={skin.base} shade={skin.shade} lw={lw} flip={side < 0} s={0.95} />
    </g>
  );
  const topPts: P[] = [...T.slice(0, 5), mix(T[4], T[5], 0.55), mix(T[9], T[8], 0.55)];
  return (
    <Wrap x={x} y={y} s={s} flipX={flipX}>
      {leg(p.hipL, p.knL, p.ftL, p.fdL ?? 0, "lL")}
      {leg(p.hipR, p.knR, p.ftR, p.fdR ?? 0, "lR")}
      {/* midriff */}
      <Part d={smooth([...T.slice(0, 6), add(p.hipR, [12, 0]), add(p.hipL, [-12, 0]), ...T.slice(8)], true, 0.6)} fill={skin.base} shade={skin.shade} lw={lw} />
      {/* denim mini skirt */}
      <Part d={smooth([add(T[8], [-4, 0]), add(T[5], [4, 0]), add(p.hipR, [34, 96]), add(midH, [0, 110]), add(p.hipL, [-34, 96])], true, 0.35)} fill={NAMI.skirt} shade={NAMI.skirtS} lw={lw}>
        <path d={`M${p.hipL[0] - 30},${p.hipL[1] + 40} L${p.hipR[0] + 30},${p.hipR[1] + 40}`} stroke={NAMI.skirtS} strokeWidth={3} />
      </Part>
      {/* striped crop top */}
      <Part d={smooth(topPts, true, 0.5)} fill={NAMI.top} shade={NAMI.topS} lw={lw} sh={[-8, -4]}>
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-200,${p.shL[1] + 40 + i * 28} L200,${p.shL[1] + 40 + i * 28}`} stroke={NAMI.stripe} strokeWidth={13} />)}
      </Part>
      {arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}><NamiHead face={face} turn={p.turn} lw={lw} /></g>
      {children}
    </Wrap>
  );
};

/* ------------------------------------ props ------------------------------------ */

/** a pocket calculator, in body space, held in a hand at (x,y) */
export const Calculator: React.FC<{ x: number; y: number; a?: number; s?: number; lit?: boolean }> = ({ x, y, a = 0, s = 1, lit = true }) => (
  <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>
    <rect x={-34} y={-58} width={68} height={92} rx={10} fill="#5a6070" stroke={INK} strokeWidth={6} />
    <rect x={-26} y={-50} width={52} height={24} rx={4} fill={lit ? "#a8f0a0" : "#6a8a68"} stroke={INK} strokeWidth={3} />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-26 + c * 19} y={-18 + r * 17} width={13} height={11} rx={2} fill="#e8d870" stroke={INK} strokeWidth={2} />))}
  </g>
);

/** a long receipt: hangs from the hand at (x,y) in body space, falls to the floor (y=0) and trails behind along it */
export const ReceiptTrail: React.FC<{ x: number; y: number; unroll?: number; trail?: number; w?: number }> = ({ x, y, unroll = 1, trail = 700, w = 56 }) => {
  const drop = (0 - y) * Math.min(1, unroll * 1.4);
  const run = trail * Math.max(0, unroll * 1.4 - 0.4) / 1.0;
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={Math.max(2, drop)} fill="#fffdf0" stroke={INK} strokeWidth={5} />
      {Array.from({ length: Math.floor(drop / 36) }, (_, i) => <path key={i} d={`M${x - w * 0.36},${y + 14 + i * 36} h${w * 0.72}`} stroke="#b8b8c0" strokeWidth={4} />)}
      {run > 4 && (
        <g>
          <path d={`M${x - w / 2},${-4} L${x - w / 2 - run},${-4} L${x - w / 2 - run},${-4 - 4} `} fill="none" />
          <rect x={x - w / 2 - run} y={-w * 0.32} width={run + w / 2} height={w * 0.32} fill="#fffdf0" stroke={INK} strokeWidth={5} />
          {Array.from({ length: Math.floor(run / 50) }, (_, i) => <path key={i} d={`M${x - w / 2 - 20 - i * 50},${-w * 0.26} v${w * 0.2}`} stroke="#b8b8c0" strokeWidth={4} />)}
        </g>
      )}
    </g>
  );
};

/** a berry pouch: tied brown sack with a 10% tag */
export const Pouch: React.FC<{ x: number; y: number; s?: number; rot?: number; lw?: number; tag?: boolean }> = ({ x, y, s = 1, rot = 0, lw = 6, tag = true }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d={smooth([[-70, -20], [-20, -50], [20, -50], [70, -20], [86, 40], [50, 84], [-50, 84], [-86, 40]], true, 0.8)} fill="#c8914a" shade="#8a5a26" lw={lw} sh={[-10, -8]}>
      <path d="M-60,10 Q-40,50 -60,70 M60,10 Q40,50 60,70" stroke="#8a5a26" strokeWidth={5} fill="none" />
    </Part>
    <Part d={smooth([[-26, -54], [-34, -92], [-12, -80], [0, -104], [12, -80], [34, -92], [26, -54], [0, -46]], true, 0.4)} fill="#c8914a" shade="#8a5a26" lw={lw} />
    <path d="M-34,-50 Q0,-34 34,-50" stroke="#e0b040" strokeWidth={10} fill="none" strokeLinecap="round" />
    <circle cx={0} cy={26} r={32} fill="#f6c52a" stroke={INK} strokeWidth={5} />
    <text x={0} y={38} textAnchor="middle" fontFamily="Poppins Black" fontSize={34} fill="#a06a08">B</text>
    {tag && (
      <g transform="translate(46,-28) rotate(12)">
        <rect x={-48} y={-24} width={96} height={46} rx={8} fill="#fffdf0" stroke={INK} strokeWidth={5} />
        <text x={0} y={12} textAnchor="middle" fontFamily="Poppins Black" fontSize={34} fill="#d02828">10%</text>
      </g>
    )}
  </g>
);

export const vec = { add, mul, nrm, mix };
export type { P, Pose };

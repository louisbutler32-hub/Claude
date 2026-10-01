import React from "react";
import { INK } from "../common";
import {
  add, ang, armDir, Eye, Face, footShape, Hand, HandKind, HeadBase, mix, mul, nrm, P, Part, Pose, SKIN, SKIN_TAN, smooth, spikyCap, sub, torsoPts, tube, Wrap,
} from "../bowling/characters";
import { G, GuestHead } from "../guest";

/**
 * The cast of "Zoro vs the cursed sword", on the shared figure kit from
 * src/akki/bowling/characters.tsx (pose skeleton, feet at y=0, ~1000 tall).
 *
 *  - ZoroPre: pre-timeskip Zoro — white short-sleeved shirt, black bandana
 *    tied round his left bicep, bright green haramaki, near-black green
 *    trousers tucked into boots, three swords on his left hip. `noArmR`
 *    takes his right arm off at the bicep, for after the sword decides.
 *  - Clerk: the shop owner — topknot, cyan short-sleeved button shirt,
 *    black trousers, permanently annoyed.
 *  - Katana: a sword in local space along +x (handle at 0, tip at len).
 */

export const SHIRT = "#f5f2e8", SHIRT_S = "#cdc8b8";
export const HARA = "#69c043", HARA_S = "#3f8a2a";
export const PANTS = "#1d2a1f", PANTS_S = "#0f1710";
export const BOOT = "#141416", BOOT_S = "#060607";
export const ZHAIR = "#9be05e", ZHAIR_S = "#5ea83a";
export const BLOOD = "#8c0f14", BLOOD_D = "#5a070b";

const fx = (p: P): string => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

/* --------------------------------- swords --------------------------------- */

/** the cursed one: dark steel, beige guard, black wrap */
export const Katana: React.FC<{ x: number; y: number; a: number; len?: number; w?: number; lw?: number; sheathed?: boolean; blade?: string; edge?: string; wrap?: string; guard?: string }> = ({
  x, y, a, len = 520, w = 13, lw = 4, sheathed = false, blade = "#4c5068", edge = "#c9cfe8", wrap = "#24222a", guard = "#cdb27a",
}) => {
  const hl = len * 0.24;
  const bend = len * 0.035;
  return (
    <g transform={`translate(${x},${y}) rotate(${a})`}>
      {/* blade (or scabbard) with a gentle curve toward -y */}
      <Part d={smooth([[hl, -w * 0.55], [hl + (len - hl) * 0.5, -w * 0.5 - bend], [len - w * 1.2, -w * 0.25 - bend * 1.6], [len, -bend * 2], [len - w * 0.6, w * 0.2 - bend * 1.6], [hl + (len - hl) * 0.5, w * 0.5 - bend], [hl, w * 0.55]], true, 0.6)}
        fill={sheathed ? "#2a2a30" : blade} shade={sheathed ? "#16161a" : "#33364a"} lw={lw} sh={[0, -w * 0.35]}>
        {!sheathed && <path d={`M${hl},${w * 0.3} Q${hl + (len - hl) * 0.5},${w * 0.25 - bend} ${len - w},${-bend * 1.6}`} stroke={edge} strokeWidth={w * 0.32} fill="none" strokeLinecap="round" />}
      </Part>
      {/* handle */}
      <Part d={tube([[-w * 0.2, 0], [hl, 0]], [w * 0.62, w * 0.66])} fill={wrap} lw={lw}>
        {Array.from({ length: Math.floor(hl / (w * 1.1)) }, (_, i) => (
          <path key={i} d={`M${w * 0.6 + i * w * 1.1},${-w * 0.6} l${w * 0.55},${w * 1.2} M${w * 1.15 + i * w * 1.1},${-w * 0.6} l${-w * 0.55},${w * 1.2}`} stroke="#5a5866" strokeWidth={w * 0.14} />
        ))}
      </Part>
      <Part d={smooth([[-w * 0.5, -w * 0.62], [w * 0.1, -w * 0.66], [w * 0.1, w * 0.66], [-w * 0.5, w * 0.62]], true, 0.3)} fill={guard} lw={lw * 0.8} />
      {/* tsuba: an oval guard seen edge-on-ish */}
      <Part d={smooth([[hl - w * 0.35, -w * 1.5], [hl + w * 0.35, -w * 1.5], [hl + w * 0.45, 0], [hl + w * 0.35, w * 1.5], [hl - w * 0.35, w * 1.5], [hl - w * 0.45, 0]], true, 0.8)} fill={guard} shade="#9a8050" lw={lw} />
    </g>
  );
};

/* ---------------------------------- heads ---------------------------------- */

/**
 * Zoro's hair: a short, rounded, messy crop — small irregular tufts over the
 * crown, a jagged fringe that sits high on the forehead, and short sideburns
 * down to the top of the ears. Not a crown of big spikes.
 */
export const zoroHair = (sx: number): string => {
  const pts: P[] = [];
  // sideburn (viewer's left), up over the crown, down to the right sideburn
  pts.push([-58 + sx * 0.6, -8], [-62 + sx * 0.5, -36]);
  const n = 15;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI;
    const tuft = i % 2 ? 1.0 : 1.13 + 0.05 * Math.sin(i * 2.3);
    pts.push([sx * 0.45 + Math.cos(a) * 62 * tuft, -38 + Math.sin(a) * 60 * tuft]);
  }
  pts.push([62 + sx * 0.5, -36], [58 + sx * 0.6, -8]);
  // the fringe, right to left: short jagged points over a high forehead
  const fringe: P[] = [[48, -26], [40, -40], [30, -30], [20, -46], [8, -34], [-4, -48], [-16, -34], [-28, -46], [-38, -30], [-48, -40], [-52, -24]];
  fringe.forEach(([x, y]) => pts.push([x + sx, y]));
  return "M" + pts.map(fx).join("L") + "Z";
};


export type ZFace = "calm" | "smirk" | "narrow" | "closed" | "wince" | "goofy";

/** pre-timeskip Zoro: both eyes, earrings, short green spikes */
export const ZoroPreHead: React.FC<{ face?: ZFace; turn?: number; lw: number }> = ({ face = "calm", turn = 0, lw }) => {
  const sx = turn * 12;
  const ek = face === "closed" ? "closed" : face === "narrow" ? "half" : "sharp";
  return (
    <g>
      <HeadBase turn={turn} skin={SKIN_TAN} lw={lw} jaw={1.04} neckW={19} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${54 - Math.max(0, -turn) * 10 + i * 3},${16 + i * 2} l0,8 q-4,6 0,12 q4,-6 0,-12`} fill="#f2c230" stroke={INK} strokeWidth={1.4} />
      ))}
      <Part d={zoroHair(sx)} fill={ZHAIR} shade={ZHAIR_S} lw={lw} sh={[-4, -5]}>
        <path d={`M${-20 + sx},-74 l6,14 M${10 + sx},-80 l2,14 M${34 + sx},-68 l-4,12`} stroke={ZHAIR_S} strokeWidth={2.4} />
      </Part>
      {face === "goofy" ? (
        <>
          {[-22, 22].map((ex) => (
            <g key={ex}>
              <ellipse cx={ex + sx} cy={-4} rx={17} ry={20} fill="#fff" stroke={INK} strokeWidth={3} />
              <circle cx={ex + sx + (ex < 0 ? 3 : -3)} cy={-2} r={4.5} fill={INK} />
            </g>
          ))}
          {/* the big dumb grin, one fang */}
          <path d={`M${sx - 30},28 Q${sx},34 ${sx + 30},26 Q${sx + 26},70 ${sx},72 Q${sx - 26},70 ${sx - 30},28Z`} fill="#6a1418" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <ellipse cx={sx} cy={58} rx={14} ry={8} fill="#e0585a" />
          <path d={`M${sx - 18},30 l5,10 l5,-9Z`} fill="#fff" stroke={INK} strokeWidth={1.4} />
          <path d={`M${sx - 50},-30 q4,14 -2,26`} stroke="#7ac0ff" strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      ) : face === "wince" ? (
        <>
          <path d={`M${-36 + sx},-6 L${-10 + sx},2 L${-34 + sx},10 M${36 + sx},-6 L${10 + sx},2 L${34 + sx},10`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${-38 + sx},-20 L${-8 + sx},-8 M${38 + sx},-20 L${8 + sx},-8`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <path d={`M${sx - 22},36 L${sx + 22},36 L${sx + 18},52 L${sx - 18},52Z`} fill="#fff" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
          <path d={`M${sx - 20},44 L${sx + 20},44 M${sx - 8},36 L${sx - 8},52 M${sx + 6},36 L${sx + 6},52`} stroke={INK} strokeWidth={1.4} />
          <path d={`M${sx - 46},-4 l-10,-6 M${sx + 46},-4 l10,-6`} stroke={INK} strokeWidth={2} />
        </>
      ) : (
        <>
          <path d={`M${-36 + sx},-16 L${-8 + sx},-10`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <path d={`M${8 + sx},-10 L${36 + sx},-16`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <Eye x={-20 + sx} y={0} kind={ek} />
          <Eye x={20 + sx} y={0} kind={ek} flip />
          <path d={`M${sx + 3},12 L${sx + 6},28 L${sx},30`} stroke={INK} strokeWidth={2} fill="none" />
          {face === "smirk" ? (
            <path d={`M${sx - 14},44 Q${sx + 4},50 ${sx + 18},38`} stroke={INK} strokeWidth={2.8} fill="none" strokeLinecap="round" />
          ) : (
            <path d={`M${sx - 10},46 L${sx + 12},44`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
          )}
        </>
      )}
    </g>
  );
};

export type CFace = "yell" | "shock" | "glare";

export const ClerkHead: React.FC<{ face?: CFace; turn?: number; lw: number }> = ({ face = "yell", turn = 0, lw }) => {
  const sx = turn * 12;
  return (
    <g>
      {/* topknot */}
      <Part d={smooth([[-10 + sx * 0.3, -96], [-14 + sx * 0.3, -122], [6 + sx * 0.3, -132], [18 + sx * 0.3, -112], [12 + sx * 0.3, -94]])} fill="#1c1a22" lw={lw} />
      <HeadBase turn={turn} skin={SKIN} lw={lw} jaw={1.1} />
      <Part d={smooth([[-54 + sx, -6], [-50, -64], [-12, -90], [30, -86], [54 + sx, -54], [54 + sx, -6], [42 + sx, -40], [10 + sx, -54], [-30 + sx, -52], [-44 + sx, -36]])} fill="#1c1a22" lw={lw} />
      {face === "shock" ? (
        <>
          <ellipse cx={-20 + sx} cy={0} rx={11} ry={10} fill="#fff" stroke={INK} strokeWidth={2.4} />
          <ellipse cx={20 + sx} cy={0} rx={11} ry={10} fill="#fff" stroke={INK} strokeWidth={2.4} />
          <circle cx={-20 + sx} cy={0} r={2.6} fill={INK} /><circle cx={20 + sx} cy={0} r={2.6} fill={INK} />
          <path d={`M${-34 + sx},-24 Q${-20 + sx},-30 ${-8 + sx},-22 M${8 + sx},-22 Q${20 + sx},-30 ${34 + sx},-24`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={`M${sx - 18},40 Q${sx},34 ${sx + 18},40 Q${sx + 16},64 ${sx},66 Q${sx - 16},64 ${sx - 18},40Z`} fill="#5a1418" stroke={INK} strokeWidth={2.6} />
        </>
      ) : (
        <>
          {/* flat annoyed eyes under heavy brows */}
          <path d={`M${-32 + sx},-2 L${-8 + sx},-2 M${8 + sx},-2 L${32 + sx},-2`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <circle cx={-19 + sx} cy={3} r={4} fill={INK} /><circle cx={19 + sx} cy={3} r={4} fill={INK} />
          <path d={`M${-36 + sx},-20 L${-8 + sx},-12 M${8 + sx},-12 L${36 + sx},-20`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <path d={`M${sx + 2},12 L${sx + 5},26 L${sx - 1},28`} stroke={INK} strokeWidth={2} fill="none" />
          {face === "yell" ? (
            <>
              <path d={`M${sx - 24},34 L${sx + 24},34 L${sx + 18},68 L${sx - 18},68Z`} fill="#6a1418" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
              <path d={`M${sx - 22},35 L${sx + 22},35 L${sx + 21},42 L${sx - 21},42Z`} fill="#fff" />
              <path d={`M${sx - 14},68 Q${sx},54 ${sx + 14},68Z`} fill="#e0585a" />
            </>
          ) : (
            <path d={`M${sx - 14},46 Q${sx},40 ${sx + 14},46`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
          )}
        </>
      )}
    </g>
  );
};

/* --------------------------------- bodies ---------------------------------- */

type ZProps = {
  p: Pose; lw?: number; face?: ZFace; x?: number; y?: number; s?: number; flipX?: boolean;
  /** right arm gone at the bicep, bleeding */
  noArmR?: boolean;
  /** draw the swords at his hip */
  swords?: boolean;
  /** rubbery noodle legs for the denial dance: offsets for the knee curve */
  noodle?: number;
  children?: React.ReactNode;
};

export const ZoroPre: React.FC<ZProps> = ({ p, lw = 4, face = "calm", x = 0, y = 0, s = 1, flipX, noArmR, swords = true, noodle = 0, children }) => {
  const skin = SKIN_TAN;
  const T = torsoPts(p, 0.16, 4);
  const waistL = T[8], waistR = T[5];
  const midS = mix(p.shL, p.shR, 0.5);
  const leg = (hip: P, kn: P, ft: P, fd = 0, key: string, bend = 0) => {
    const k2: P = add(kn, [bend, 0]);
    return (
      <g key={key}>
        <Part d={tube([hip, k2, mix(k2, ft, 0.55)], [30, 27, 25])} fill={PANTS} shade={PANTS_S} lw={lw} />
        <Part d={tube([mix(k2, ft, 0.45), ft], [24, 22])} fill={BOOT} shade={BOOT_S} lw={lw} />
        <g transform={`translate(${ft[0]},${ft[1] + 4})`}><Part d={footShape(fd, 1.1)} fill={BOOT} shade={BOOT_S} lw={lw} /></g>
      </g>
    );
  };
  const arm = (sh: P, el: P, ha: P, hk: HandKind, side: number, key: string) => (
    <g key={key}>
      <Part d={tube([sh, el, ha], [20, 17, 14])} fill={skin.base} shade={skin.shade} lw={lw} />
      {/* short sleeve */}
      <Part d={tube([sh, mix(sh, el, 0.5)], [30, 29])} fill={SHIRT} shade={SHIRT_S} lw={lw} />
      {/* black bandana on his left arm (viewer's right) */}
      {side > 0 && <Part d={tube([mix(sh, el, 0.52), mix(sh, el, 0.74)], [23, 22])} fill="#22262a" shade="#0e1012" lw={lw} />}
      <Hand at={ha} dir={armDir(el, ha)} kind={hk} skin={skin.base} shade={skin.shade} lw={lw} s={1.08} flip={side < 0} />
    </g>
  );
  const stump = (sh: P, el: P) => {
    // the forearm is what's on the floor: the upper arm, sleeve and bandana stay
    const end = mix(sh, el, 1.04);
    const dir = nrm(sub(el, sh));
    return (
      <g>
        <Part d={tube([sh, end], [21, 19])} fill={skin.base} shade={skin.shade} lw={lw} />
        <Part d={tube([sh, mix(sh, el, 0.5)], [30, 29])} fill={SHIRT} shade={SHIRT_S} lw={lw} />
        <Part d={tube([mix(sh, el, 0.52), mix(sh, el, 0.74)], [23, 22])} fill="#22262a" shade="#0e1012" lw={lw} />
        <ellipse cx={end[0]} cy={end[1]} rx={19} ry={9} transform={`rotate(${ang2(dir) + 90} ${end[0]} ${end[1]})`} fill={BLOOD} stroke={INK} strokeWidth={lw * 0.8} />
      </g>
    );
  };
  const swordBase = add(waistR, [6, 16]);
  return (
    <Wrap x={x} y={y} s={s} flipX={flipX}>
      {p.backL && arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {p.backR && !noArmR && arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      {swords && [0, 1, 2].map((i) => (
        <Katana key={`s${i}`} x={swordBase[0] - 8 + i * 6} y={swordBase[1] + i * 4} a={112 - i * 6} len={520} w={11} lw={lw * 0.85} sheathed wrap={["#f0eee6", "#2a2430", "#c43030"][i]} />
      ))}
      {leg(p.hipL, p.knL, p.ftL, p.fdL, "lL", -noodle)}
      {leg(p.hipR, p.knR, p.ftR, p.fdR, "lR", noodle)}
      {/* shirt */}
      <Part d={smooth([...T.slice(0, 6), add(waistR, [4, 30]), add(waistL, [-4, 30]), ...T.slice(8)])} fill={SHIRT} shade={SHIRT_S} lw={lw} sh={[-10, -4]}>
        {/* henley placket */}
        <path d={`M${fx(add(p.neck, [-14, 6]))}L${fx(add(p.neck, [-4, 40]))}L${fx(add(p.neck, [10, 6]))}`} stroke={INK} strokeWidth={2.4} fill="none" />
        <path d={`M${fx(add(p.neck, [-4, 40]))}L${fx(add(p.neck, [-4, 110]))}`} stroke={INK} strokeWidth={2} />
        <path d={smooth([add(mix(midS, waistL, 0.55), [10, 0]), add(mix(midS, waistR, 0.6), [-20, 10])], false)} stroke={SHIRT_S} strokeWidth={3} />
      </Part>
      {/* haramaki */}
      <Part d={smooth([add(waistL, [-8, -4]), add(waistR, [8, -4]), add(p.hipR, [12, 10]), add(p.hipL, [-12, 10])], true, 0.4)} fill={HARA} shade={HARA_S} lw={lw}>
        <path d={`M${fx(add(waistL, [-10, 26]))}L${fx(add(waistR, [10, 26]))}`} stroke={HARA_S} strokeWidth={3} />
      </Part>
      {!p.backL && arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {noArmR ? stump(p.shR, p.elR) : !p.backR && arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}><ZoroPreHead face={face} turn={p.turn} lw={lw} /></g>
      {children}
    </Wrap>
  );
};
const ang2 = (d: P) => (Math.atan2(d[1], d[0]) * 180) / Math.PI;

export const Clerk: React.FC<{ p: Pose; lw?: number; face?: CFace; x?: number; y?: number; s?: number; flipX?: boolean }> = ({ p, lw = 4, face = "yell", x = 0, y = 0, s = 1, flipX }) => {
  const skin = G.skin;
  const T = torsoPts(p, 0.04, 16);
  const midH = mix(p.hipL, p.hipR, 0.5);
  const shirt = G.tee, shirtS = G.teeS;
  const leg = (hip: P, kn: P, ft: P, fd = 0, key: string) => (
    <g key={key}>
      <Part d={tube([hip, kn, ft], [27, 25, 23])} fill={G.jeans} shade={G.jeansS} lw={lw} />
      <g transform={`translate(${ft[0]},${ft[1] + 4})`}><Part d={footShape(fd, 1.05)} fill="#1a1a1e" lw={lw} /></g>
    </g>
  );
  const arm = (sh: P, el: P, ha: P, hk: HandKind, side: number, key: string) => (
    <g key={key}>
      <Part d={tube([sh, el, ha], [16, 14, 12])} fill={skin.base} shade={skin.shade} lw={lw} />
      <Part d={tube([sh, mix(sh, el, 0.62)], [26, 25])} fill={shirt} shade={shirtS} lw={lw} />
      <Hand at={ha} dir={armDir(el, ha)} kind={hk} skin={skin.base} shade={skin.shade} lw={lw} flip={side < 0} />
    </g>
  );
  return (
    <Wrap x={x} y={y} s={s} flipX={flipX}>
      {leg(p.hipL, p.knL, p.ftL, p.fdL, "lL")}
      {leg(p.hipR, p.knR, p.ftR, p.fdR, "lR")}
      <Part d={smooth([add(T[8], [-6, 0]), add(T[5], [6, 0]), add(p.hipR, [18, 14]), add(midH, [0, 30]), add(p.hipL, [-18, 14])])} fill={G.jeans} shade={G.jeansS} lw={lw} />
      <Part d={smooth([...T.slice(0, 6), add(p.hipR, [22, 0]), add(p.hipL, [-22, 0]), ...T.slice(8)])} fill={shirt} shade={shirtS} lw={lw}>
        {/* crew neck */}
        <path d={smooth([add(p.neck, [-34, 6]), add(p.neck, [0, 26]), add(p.neck, [34, 6])], false)} stroke={INK} strokeWidth={2.6} fill="none" />
        <path d={smooth([add(p.neck, [-26, 12]), add(p.neck, [0, 30]), add(p.neck, [26, 12])], false)} stroke={shirtS} strokeWidth={4} fill="none" />
      </Part>
      {arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}><GuestHead face={face === "glare" ? "blank" : face} turn={p.turn} lw={lw} /></g>
    </Wrap>
  );
};

/* ------------------------------ odds and ends ------------------------------ */

/** a forearm and fist lying on the floor, cut end toward -x */
export const LooseArm: React.FC<{ x: number; y: number; s?: number; a?: number; lw?: number }> = ({ x, y, s = 1, a = 0, lw = 5 }) => (
  <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>
    <Part d={smooth([[-150, -44], [40, -50], [90, -60], [150, -66], [190, -40], [196, 20], [170, 56], [100, 60], [40, 46], [-150, 40]], true, 0.7)} fill={SKIN_TAN.base} shade={SKIN_TAN.shade} lw={lw} sh={[0, -14]}>
      {/* knuckle and finger lines */}
      <path d="M128,-60 Q150,-20 140,30 M156,-58 Q178,-16 168,36 M106,-52 Q124,-12 116,40" stroke={INK} strokeWidth={3} fill="none" />
      <path d="M40,-20 Q60,-28 80,-20 M30,10 Q50,4 70,12" stroke="#a8714e" strokeWidth={2.4} fill="none" />
    </Part>
    {/* thumb */}
    <Part d={smooth([[70, -54], [110, -86], [140, -84], [130, -60], [100, -48]])} fill={SKIN_TAN.base} shade={SKIN_TAN.shade} lw={lw} />
    {/* the cut */}
    <ellipse cx={-150} cy={-2} rx={16} ry={42} fill={BLOOD} stroke={INK} strokeWidth={lw} />
    <ellipse cx={-148} cy={-2} rx={6} ry={12} fill="#e8d8c0" />
  </g>
);

export const Spray: React.FC<{ x: number; y: number; a: number; s?: number; seed?: number }> = ({ x, y, a, s = 1, seed = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>
    {Array.from({ length: 22 }, (_, i) => {
      const r = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
      const f = r - Math.floor(r);
      const sp = (f - 0.5) * 70;
      const l = 60 + ((i * 37) % 70);
      return <path key={i} d={`M0,0 L${l},${sp}`} stroke={i % 3 ? BLOOD : BLOOD_D} strokeWidth={6 + (i % 4) * 3} strokeLinecap="round" />;
    })}
  </g>
);

export const vec = { add, mul, mix };
export type { P, Pose, HandKind };
export { ang };

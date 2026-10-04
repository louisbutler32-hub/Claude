import React from "react";
import { INK } from "../common";
import {
  add, Arm, Costume, FaceFeatures, FaceSpec, Figure, FigureProps, frameOf, fx, HeadBase, Leg, mix, mul, P, Part, poly, seatPts, Skin, smooth, torsoPts, tube,
} from "../kit2";
import { Abacus, Clipboard, Quill } from "./props3";
import { Build, FaceOf, K, reshape } from "./shared";
import type { Held } from "./ronan";

/**
 * MIRA — original design. Petite, sharp-eyed navigator-accountant: a thick
 * dark-plum braid over one shoulder, round gold-rim glasses with coin
 * glints, a bright yellow rain-slicker tied at the waist over a teal
 * blouse, a short plum skirt, lace-up boots, a brass abacus bandolier, a
 * clipboard and a quill behind the ear.
 */

export type MiraFace = "sweet" | "cold" | "furious" | "counting" | "smug" | "shock" | "pant";
const MIRA_FACES: Record<MiraFace, FaceSpec> = {
  sweet: { eye: "round", brow: "flat", mouth: "smile", blush: true },
  cold: { eye: "half", brow: "flat", mouth: "flat" },
  furious: { eye: "angry", brow: "down", mouth: "grit", vein: true },
  counting: { eye: "dot", brow: "up", mouth: "cat", blush: true },
  smug: { eye: "half", brow: "flat", mouth: "smirk" },
  shock: { eye: "shock", brow: "up", mouth: "o" },
  pant: { eye: "angry", brow: "down", mouth: "o", sweat: true },
};

export const MIRA = {
  skin: { base: "#f5cfa8", shade: "#d9a07a" } as Skin,
  hair: "#4d2150", hairS: "#2f1233", hairL: "#7a3a80",
  blouse: "#1fa59a", blouseS: "#127570", skirt: "#6a2f6e", skirtS: "#43194a",
  slick: "#ffd51f", slickS: "#d6a20c", boot: "#6a3e22", bootS: "#3e2312", lace: "#f3e6c8",
  gold: "#e3b43a", goldS: "#a8761c", strap: "#7b4a2a", strapS: "#4d2c14",
};
export const MIRA_BUILD: Build = { s: 0.86, kx: 0.92, ky: 0.97 };

const glint = (x: number, y: number, r: number) => (
  <path d={`M${x},${y - r} L${x + r * 0.28},${y - r * 0.28} L${x + r},${y} L${x + r * 0.28},${y + r * 0.28} L${x},${y + r} L${x - r * 0.28},${y + r * 0.28} L${x - r},${y} L${x - r * 0.28},${y - r * 0.28}Z`} fill="#fff" />
);

export const MiraHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string; drained?: boolean }> = ({ face = "sweet", turn = 0, lw, ink = INK, drained }) => {
  const sx = turn * 14;
  const f = FaceOf(MIRA_FACES, face, "sweet");
  const k = K(drained);
  const eyeX = 25;
  const lens = (cx: number) => `M${cx - 22},0 a22,22 0 1 0 44,0 a22,22 0 1 0 -44,0Z`;
  return (
    <g>
      {/* back of the head */}
      <Part d={smooth([[-68, -18], [-72, -82], [-26, -114], [36, -112], [72, -76], [68, -14], [58, 34], [40, 20], [-40, 20], [-56, 34]], true, 0.6)} fill={k(MIRA.hair)} shade={k(MIRA.hairS)} lw={lw} ink={ink} />
      {/* the braid: over the viewer's-left shoulder, a chain of plaited lobes */}
      <g>
        <Part d={tube([[-52, 24], [-82, 90], [-76, 160], [-86, 230], [-80, 286]], [22, 24, 22, 18, 12])} fill={k(MIRA.hair)} shade={k(MIRA.hairS)} lw={lw} sh={[-5, -4]} ink={ink}>
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-108 + (i % 2) * 8},${52 + i * 26} l32,${i % 2 ? 12 : -4}`} stroke={k(MIRA.hairL)} strokeWidth={4} strokeLinecap="round" />)}
        </Part>
        <Part d={tube([[-82, 276], [-80, 304]], [16, 14])} fill={k(MIRA.gold)} shade={k(MIRA.goldS)} lw={lw * 0.8} ink={ink} />
      </g>
      <HeadBase turn={turn} skin={drained ? { base: "#eef0f3", shade: "#c3c8d2" } : MIRA.skin} lw={lw} jaw={0.9} neckW={14} ink={ink} />
      <FaceFeatures f={f} sx={sx} iris="#6a3a22" lash browC={k(MIRA.hairS)} eyeX={eyeX} ink={ink} />
      {/* coin eyes behind the glasses for "counting" */}
      {face === "counting" && [-1, 1].map((sg) => (
        <g key={sg} transform={`translate(${sg * eyeX + sx},0)`}>
          <circle r={17} fill="#ffd23a" stroke={ink} strokeWidth={2.6} />
          <circle r={11} fill="none" stroke="#b98408" strokeWidth={2} />
          <text x={0} y={7} textAnchor="middle" fontFamily="Poppins Black" fontSize={19} fill="#9a640a">G</text>
        </g>
      ))}
      {/* round gold-rim glasses */}
      <g transform={`translate(${sx},0)`}>
        {[-1, 1].map((sg) => <path key={sg} d={lens(sg * eyeX)} fill="#cfeff2" opacity={0.2} />)}
        <path d={`M${-eyeX + 22},-2 Q0,-12 ${eyeX - 22},-2`} stroke={ink} strokeWidth={6.4} fill="none" strokeLinecap="round" />
        <path d={`M${-eyeX + 22},-2 Q0,-12 ${eyeX - 22},-2`} stroke={MIRA.gold} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        {[-1, 1].map((sg) => <g key={sg}><path d={lens(sg * eyeX)} stroke={ink} strokeWidth={7} fill="none" /><path d={lens(sg * eyeX)} stroke={MIRA.gold} strokeWidth={3.6} fill="none" /></g>)}
        {[-1, 1].map((sg) => <g key={sg} transform={`translate(${sg * eyeX},0)`}>{glint(-9, -9, face === "counting" ? 8 : 6)}{face !== "furious" && <circle cx={10} cy={8} r={2.4} fill="#fff" opacity={0.85} />}</g>)}
        <path d={`M${-eyeX - 22},-2 L-62,-6 M${eyeX + 22},-2 L62,-6`} stroke={MIRA.gold} strokeWidth={3.4} strokeLinecap="round" />
      </g>
      {/* fringe, swept to the viewer's right */}
      <Part d={smooth([[-68 + sx, 8], [-72, -64], [-30, -104], [28, -108], [70, -70], [68 + sx, 8], [56, -26], [36, -46], [14 + sx, -42], [-8, -56], [-30, -34], [-46, -50]], true, 0.6)} fill={k(MIRA.hair)} shade={k(MIRA.hairS)} lw={lw} sh={[-4, -5]} ink={ink}>
        <path d={`M${-12 + sx},-98 q16,18 10,46 M${-38 + sx},-90 q12,16 6,34 M${20 + sx},-100 q12,14 8,36`} stroke={k(MIRA.hairL)} strokeWidth={3} fill="none" strokeLinecap="round" />
      </Part>
      {/* quill behind the viewer's-right ear */}
      {!drained && <Quill x={58 + sx * 0.4} y={-6} rot={26} s={0.5} lw={2.4} />}
    </g>
  );
};

export type MiraOpts = {
  /** a clipboard held in the viewer's-right hand, an abacus held out in the left, etc. */
  prop?: "none" | "clipboard";
  propSide?: "L" | "R";
  /** show the abacus bandolier (default true) */
  bandolier?: boolean;
  /** 0..1 how far the abacus beads slide (rattle) */
  rattle?: number;
};

export const miraCostume = (o: MiraOpts = {}): Costume => {
  const { prop = "none", propSide = "R", bandolier = true, rattle = 0 } = o;
  const armHeld = (side: -1 | 1): Held | undefined => {
    if (prop !== "clipboard" || (side < 0 ? "L" : "R") !== propSide) return undefined;
    return (ha) => <Clipboard x={ha[0] + 8} y={ha[1] - 40} rot={side * 6} s={0.9} lw={4} />;
  };
  return {
    skin: MIRA.skin,
    headScale: 1.42,
    behind: (c) => {
      const k = K(c.drained);
      const T = torsoPts(c.p);
      const { across, down } = frameOf(c.p);
      // the slicker's body hangs behind from the waist where its sleeves are tied
      const wL = T[8], wR = T[5];
      return (
        <Part d={smooth([add(wL, [-14, 4]), add(wR, [14, 4]), add(add(c.p.hipR, mul(across, 40)), mul(down, 190)), add(add(c.p.hipL, mul(across, -40)), mul(down, 190))], true, 0.35)} fill={k(MIRA.slick)} shade={k(MIRA.slickS)} lw={c.lw} sh={[-6, -6]} ink={c.ink}>
          <path d={`M${fx(add(c.p.hipL, mul(down, 60)))} l-4,110 M${fx(add(c.p.hipR, mul(down, 60)))} l4,110`} stroke={k(MIRA.slickS)} strokeWidth={4} fill="none" strokeLinecap="round" />
        </Part>
      );
    },
    leg: (hip, kn, ft, fd, _s, c) => {
      const k = K(c.drained);
      return (
        <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[22, 18, 14]} shoe="boot" shoeC={k(MIRA.boot)} shoeS={k(MIRA.bootS)} bootTop={0.45} sock={k("#f3e6c8")} />
      );
    },
    arm: (sh, el, ha, hk, side, c) => {
      const k = K(c.drained);
      const h = armHeld(side);
      return (
        <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[17, 13, 11]} handS={1.05} sleeve={0.55} cloth={k(MIRA.blouse)} clothS={k(MIRA.blouseS)}>
          {h && h(ha, el, c)}
        </Arm>
      );
    },
    torso: (c, T) => {
      const p = c.p;
      const k = K(c.drained);
      const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
      const { across, down } = frameOf(p);
      const wL = T[8], wR = T[5];
      const skirtL = add(add(p.hipL, mul(across, -52)), mul(down, 108)), skirtR = add(add(p.hipR, mul(across, 52)), mul(down, 108));
      // abacus bandolier: strap from the viewer's-right shoulder to the left hip
      const sA = add(mix(p.shR, T[3], 0.4), [-14, 10]), sB = add(p.hipL, [8, -6]);
      const ang = (Math.atan2(sB[1] - sA[1], sB[0] - sA[0]) * 180) / Math.PI;
      const ac = mix(sA, sB, 0.5);
      // the slicker's sleeves tied round the waist: a fat knot at the front with two ends
      const kn = add(mix(wL, wR, 0.5), [0, 10]);
      return (
        <g>
          <Part d={smooth(seatPts(p, 20, 60))} fill={k(MIRA.skirt)} shade={k(MIRA.skirtS)} lw={c.lw} ink={c.ink} />
          {/* plum skirt */}
          <Part d={smooth([add(wL, mul(down, 6)), add(wR, mul(down, 6)), skirtR, add(mix(skirtL, skirtR, 0.5), mul(down, 12)), skirtL], true, 0.35)} fill={k(MIRA.skirt)} shade={k(MIRA.skirtS)} lw={c.lw} ink={c.ink}>
            {[0.2, 0.5, 0.8].map((u) => <path key={u} d={`M${fx(mix(wL, wR, u))} L${fx(mix(skirtL, skirtR, u))}`} stroke={k(MIRA.skirtS)} strokeWidth={3} opacity={0.7} />)}
          </Part>
          {/* teal blouse with a pointed collar */}
          <Part d={smooth([...T.slice(0, 5), mix(T[4], T[5], 0.9), add(mix(p.hipR, T[5], 0.4), [8, -4]), add(mix(p.hipL, T[8], 0.4), [-8, -4]), mix(T[9], T[8], 0.9)], true, 0.5)} fill={k(MIRA.blouse)} shade={k(MIRA.blouseS)} lw={c.lw} sh={[-7, -4]} ink={c.ink}>
            <path d={`M${fx(add(p.neck, [0, 10]))} L${fx(mix(midS, midH, 0.55))}`} stroke={k(MIRA.blouseS)} strokeWidth={3} />
            {[0.3, 0.5, 0.7].map((u) => { const b = mix(add(p.neck, [0, 14]), mix(midS, midH, 0.6), u); return <circle key={u} cx={b[0]} cy={b[1]} r={3.6} fill="#f3e6c8" stroke={c.ink} strokeWidth={1.4} />; })}
          </Part>
          <Part d={poly([add(p.neck, [-34, -2]), add(p.neck, [0, 30]), add(p.neck, [-8, 8])])} fill={k("#f4fbfa")} shade={k("#bfe3df")} lw={c.lw * 0.7} ink={c.ink} />
          <Part d={poly([add(p.neck, [34, -2]), add(p.neck, [0, 30]), add(p.neck, [8, 8])])} fill={k("#f4fbfa")} shade={k("#bfe3df")} lw={c.lw * 0.7} ink={c.ink} />
          {/* tied slicker: waist roll, knot, two dangling sleeve ends */}
          <Part d={smooth([add(wL, [-18, -8]), add(wR, [18, -8]), add(wR, [20, 22]), add(wL, [-20, 22])], true, 0.4)} fill={k(MIRA.slick)} shade={k(MIRA.slickS)} lw={c.lw} sh={[-5, -5]} ink={c.ink} />
          <Part d={[tube([add(kn, [-10, 4]), add(kn, [-34, 56]), add(kn, [-26, 112])], [13, 12, 10]), tube([add(kn, [8, 6]), add(kn, [28, 50]), add(kn, [48, 96])], [13, 12, 10])]} fill={k(MIRA.slick)} shade={k(MIRA.slickS)} lw={c.lw * 0.9} ink={c.ink} />
          <Part d={smooth([add(kn, [-18, -6]), add(kn, [18, -6]), add(kn, [20, 16]), add(kn, [-20, 16])], true, 0.7)} fill={k(MIRA.slick)} shade={k(MIRA.slickS)} lw={c.lw} ink={c.ink} />
          {/* bandolier */}
          {bandolier && (
            <g>
              <Part d={tube([sA, sB], [9, 9])} fill={k(MIRA.strap)} shade={k(MIRA.strapS)} lw={c.lw * 0.8} ink={c.ink} />
              <Abacus x={ac[0]} y={ac[1]} rot={ang} w={190} h={52} lw={3} split={[3 + Math.round(rattle * 3), 6 - Math.round(rattle * 3), 4]} frameC={k(MIRA.gold)} />
            </g>
          )}
        </g>
      );
    },
    head: (c) => <MiraHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} drained={c.drained} />,
  };
};

export const Mira: React.FC<FigureProps & MiraOpts> = ({ pose, s = 1, prop, propSide, bandolier, rattle, ...rest }) => (
  <Figure costume={miraCostume({ prop, propSide, bandolier, rattle })} pose={reshape(pose, MIRA_BUILD)} s={s * MIRA_BUILD.s} {...rest} />
);

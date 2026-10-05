import React from "react";
import { INK } from "../common";
import {
  add, Arm, Costume, Ctx, FaceFeatures, FaceSpec, Figure, FigureProps, frameOf, fx, HeadBase, Leg, mix, mul, P, Part, poly, rnd, seatPts, Skin, smooth, sub, torsoPts, tube,
} from "../kit2";
import { Bells, RonanSword, Scarf } from "./props3";
import { Build, FaceOf, K, reshape } from "./shared";

/**
 * RONAN — original design. Tall, broad, stoic. Messy dark-navy hair with one
 * white streak, tan skin, a long crimson scarf, a brown leather coat with
 * brass buttons over a cream shirt, charcoal trousers, tall boots, a huge
 * single-edged cleaver-sword on his back and a rope belt with three bells.
 */

export type RonanFace = "calm" | "smirk" | "narrow" | "terror" | "drained" | "proud" | "wink" | "yawn" | "twitch" | "shout";
const RONAN_FACES: Record<RonanFace, FaceSpec> = {
  calm: { eye: "half", brow: "thickDown", mouth: "flat", browY: -22 },
  smirk: { eye: "sharp", brow: "thick", mouth: "smirk" },
  narrow: { eye: "half", brow: "thickDown", mouth: "line", browY: -20 },
  terror: { eye: "shock", brow: "worry", mouth: "wobble", sweat: true, shade: true, eyeS: 1.15 },
  drained: { eye: "blank", brow: "worry", mouth: "wobble", shade: true },
  proud: { eye: "content", brow: "thickUp", mouth: "smile" },
  wink: { eye: "sharp", eyeL: "squint", brow: "thick", mouth: "smirk" },
  yawn: { eye: "squint", brow: "thickUp", mouth: "shout", mouthS: 0.9 },
  twitch: { eye: "half", eyeL: "wide", brow: "thickDown", mouth: "flat", sweat: true, browY: -22 },
  shout: { eye: "angry", brow: "thickDown", mouth: "yell", vein: true },
};

export const RONAN = {
  skin: { base: "#e2a672", shade: "#b87a4c" } as Skin,
  hair: "#1b2244", hairS: "#0e1330", streak: "#f6f8ff", streakS: "#c6cde0",
  coat: "#8a5a34", coatS: "#5c3a1e", coatL: "#a97a4c", shirt: "#f3e9d2", shirtS: "#cdbf9c",
  pants: "#383a44", pantsS: "#20212a", boot: "#4a2e1c", bootS: "#2a190e", rope: "#cdb27e", ropeS: "#9a8050",
  brass: "#e5b040", brassS: "#a8761c",
};
export const RONAN_BUILD: Build = { s: 1.04, kx: 1.1, ky: 1.06 };

/** messy, swept-back crown with sharp tufts and a ragged fringe */
const ronanCap = (sx: number): string => {
  const pts: P[] = [[-64 + sx * 0.4, 2], [-70 + sx * 0.4, -34]];
  const n = 17;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI;
    const tuft = i % 2 ? 1.0 : 1.2 + 0.22 * rnd(i, 4);
    const sweep = i % 2 ? 0 : -9;
    pts.push([sx * 0.45 + Math.cos(a) * 68 * tuft + sweep, -38 + Math.sin(a) * 66 * tuft]);
  }
  pts.push([70 + sx * 0.4, -34], [64 + sx * 0.4, 0]);
  const fringe: P[] = [[54, -26], [48, -42], [34, -30], [24, -46], [10, -32], [0, -50], [-10, -28], [-18, -48], [-28, -22], [-36, -44], [-44, -30], [-52, -12], [-58, -28]];
  fringe.forEach(([x, y]) => pts.push([x + sx, y]));
  return poly(pts);
};

export const RonanHead: React.FC<{ face?: string; turn?: number; lw: number; drained?: boolean; ink?: string }> = ({ face = "calm", turn = 0, lw, drained, ink = INK }) => {
  const sx = turn * 14;
  const f = FaceOf(RONAN_FACES, drained ? "drained" : face, "calm");
  const k = K(drained);
  const skin: Skin = drained ? { base: "#eef0f3", shade: "#c3c8d2" } : RONAN.skin;
  return (
    <g>
      {/* long locks at the nape, behind the head */}
      <Part d={smooth([[-62, -20], [-86, 10], [-96, 56], [-70, 40], [-60, 78], [-40, 36], [-30, 10]], true, 0.4)} fill={k(RONAN.hair)} shade={k(RONAN.hairS)} lw={lw} ink={ink} />
      <HeadBase turn={turn} skin={skin} lw={lw} jaw={1.12} wide={1.07} neckW={26} ink={ink} />
      <FaceFeatures f={f} sx={sx} iris={drained ? "#777" : "#33405e"} browC={k(RONAN.hair)} eyeX={26} ink={ink} />
      {/* stubble shadow on the jaw */}
      {!drained && <path d={`M${-34 + sx},52 Q${sx},70 ${34 + sx},52`} stroke={RONAN.skin.shade} strokeWidth={3} strokeDasharray="2 5" fill="none" opacity={0.9} />}
      <Part d={ronanCap(sx)} fill={k(RONAN.hair)} shade={k(RONAN.hairS)} lw={lw} sh={[-4, -5]} ink={ink}>
        <path d={`M${-30 + sx},-84 l10,22 M${6 + sx},-92 l4,24 M${40 + sx},-74 l-6,18`} stroke={k(RONAN.hairS)} strokeWidth={2.8} strokeLinecap="round" />
      </Part>
      {/* the white streak: one lock from the parting sweeping down over the fringe */}
      <Part d={smooth([[16 + sx, -88], [-2 + sx, -66], [-16 + sx, -40], [-26 + sx, -20], [-34 + sx, -42], [-22 + sx, -74], [2 + sx, -94]], true, 0.5)} fill={drained ? "#ffffff" : RONAN.streak} shade={RONAN.streakS} lw={lw * 0.7} sh={[-3, -3]} ink={ink} />
      {/* a stray lock between brow and eye */}
      <path d={`M${-40 + sx},-26 q-4,18 4,32`} stroke={ink} strokeWidth={lw * 0.9} fill="none" strokeLinecap="round" />
    </g>
  );
};

export type Held = (ha: P, el: P, c: Ctx) => React.ReactNode;
export type RonanOpts = {
  /** "back": sheathed across the back; "none"; "hand": drawn in the hand named by `handSide` */
  sword?: "back" | "none" | "hand";
  handSide?: "L" | "R";
  swordRot?: number;
  swordS?: number;
  /** seconds, drives the scarf flutter and the bells */
  t?: number;
  wind?: number;
  bellAmp?: number;
  /** a body-space point the scarf tail is pulled to (it is being hauled) */
  scarfTo?: P;
  scarfLen?: number;
};

export const ronanCostume = (o: RonanOpts = {}): Costume => {
  const { sword = "back", handSide = "R", swordRot = -20, swordS = 0.95, t = 0, wind = 1, bellAmp = 8, scarfTo, scarfLen = 300 } = o;
  const held = (side: "L" | "R"): Held | undefined => {
    if (sword !== "hand" || handSide !== side) return undefined;
    return (ha) => {
      const r = (swordRot * Math.PI) / 180;
      return <RonanSword x={ha[0] + Math.cos(r) * 60 * swordS} y={ha[1] + Math.sin(r) * 60 * swordS} rot={swordRot} s={swordS} mode="drawn" />;
    };
  };
  const armFor = (side: -1 | 1): Held | undefined => held(side < 0 ? "L" : "R");
  return {
    skin: RONAN.skin,
    headScale: 1.22,
    behind: (c) => {
      const k = K(c.drained);
      const T = torsoPts(c.p);
      const midS = mix(c.p.shL, c.p.shR, 0.5);
      return (
        <g>
          <Scarf from={add(c.p.neck, [-6, 22])} to={scarfTo} dir={-1} len={scarfLen} t={t} wind={wind} w={24} lw={c.lw} c={k("#c8203a")} cs={k("#8e1226")} stripe={k("#f4d9a0")} ink={c.ink} />
          {sword === "back" && <RonanSword x={midS[0] + 22} y={midS[1] + 50} rot={132} s={0.8} mode="sheathed" lw={c.lw} />}
          {/* the coat's back skirt, so it shows between the legs and sways a little */}
          <Part d={smooth([add(T[8], [-20, 0]), add(T[5], [20, 0]), add(c.p.hipR, [70, 210]), add(c.p.hipL, [-70, 210])], true, 0.3)} fill={k(RONAN.coatS)} lw={c.lw} ink={c.ink} />
        </g>
      );
    },
    leg: (hip, kn, ft, fd, _s, c) => <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[33, 27, 22]} cloth={K(c.drained)(RONAN.pants)} clothS={K(c.drained)(RONAN.pantsS)} shoe="boot" shoeC={K(c.drained)(RONAN.boot)} shoeS={K(c.drained)(RONAN.bootS)} bootTop={0.32} />,
    arm: (sh, el, ha, hk, side, c) => {
      const k = K(c.drained);
      const h = armFor(side);
      return (
        <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[26, 21, 17]} sleeve={1} cloth={k(RONAN.coat)} clothS={k(RONAN.coatS)} handS={1.2}>
          {/* cream shirt cuff */}
          <Part d={tube([mix(el, ha, 0.7), mix(el, ha, 0.88)], [24, 23])} fill={k(RONAN.shirt)} shade={k(RONAN.shirtS)} lw={c.lw * 0.9} ink={c.ink} />
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
      const hemL = add(add(p.hipL, mul(across, -62)), mul(down, 205)), hemR = add(add(p.hipR, mul(across, 62)), mul(down, 205));
      const hemM = add(midH, mul(down, 224));
      const collarC = add(p.neck, [0, 14]);
      const vBot = mix(midS, midH, 0.55);
      const belt = mix(wL, wR, 0.5);
      return (
        <g>
          <Part d={smooth(seatPts(p, 26, 80))} fill={k(RONAN.pants)} shade={k(RONAN.pantsS)} lw={c.lw} ink={c.ink} />
          {/* the coat */}
          <Part d={smooth([T[0], T[1], T[2], T[3], T[4], wR, hemR, hemM, hemL, wL, T[9]], true, 0.55)} fill={k(RONAN.coat)} shade={k(RONAN.coatS)} lw={c.lw} sh={[-12, -6]} ink={c.ink}>
            {/* centre split + hem band + a wrinkle or two */}
            <path d={`M${fx(add(belt, mul(down, 30)))} L${fx(hemM)}`} stroke={k(RONAN.coatS)} strokeWidth={4} />
            <path d={`M${fx(add(hemL, mul(down, -18)))} Q${fx(hemM)} ${fx(add(hemR, mul(down, -18)))}`} stroke={k(RONAN.coatS)} strokeWidth={9} fill="none" opacity={0.7} />
            <path d={`M${fx(mix(wL, hemL, 0.4))} q-8,26 4,52 M${fx(mix(wR, hemR, 0.4))} q8,26 -4,52`} stroke={k(RONAN.coatS)} strokeWidth={3.4} fill="none" strokeLinecap="round" />
          </Part>
          {/* cream shirt wedge */}
          <Part d={poly([add(collarC, [-30, 0]), add(collarC, [30, 0]), add(vBot, [14, 0]), add(vBot, [-14, 0])])} fill={k(RONAN.shirt)} shade={k(RONAN.shirtS)} lw={c.lw * 0.8} sh={[-5, -3]} ink={c.ink}>
            <path d={`M${fx(collarC)} L${fx(vBot)}`} stroke={k(RONAN.shirtS)} strokeWidth={2.4} />
          </Part>
          {/* lapels */}
          <Part d={poly([add(p.neck, [-38, -6]), add(collarC, [-26, 6]), add(vBot, [-14, 0]), add(mix(midS, vBot, 0.5), [-58, 6])])} fill={k(RONAN.coatL)} shade={k(RONAN.coatS)} lw={c.lw * 0.9} sh={[-5, -3]} ink={c.ink} />
          <Part d={poly([add(p.neck, [38, -6]), add(collarC, [26, 6]), add(vBot, [14, 0]), add(mix(midS, vBot, 0.5), [58, 6])])} fill={k(RONAN.coatL)} shade={k(RONAN.coatS)} lw={c.lw * 0.9} sh={[-5, -3]} ink={c.ink} />
          {/* brass buttons down the viewer's-right front */}
          {[0.15, 0.4, 0.65, 0.9].map((u) => {
            const b = add(mix(collarC, vBot, u * 0.9), [30 - u * 6, 12 + u * 6]);
            return <g key={u}><circle cx={b[0]} cy={b[1]} r={8} fill={k(RONAN.brass)} stroke={c.ink} strokeWidth={c.lw * 0.6} /><circle cx={b[0] - 2} cy={b[1] - 2} r={2.4} fill="#fff7d0" opacity={c.drained ? 0 : 0.9} /></g>;
          })}
          {/* rope belt with a knot and the bells */}
          <Part d={smooth([add(wL, [-18, -10]), add(wR, [18, -10]), add(wR, [20, 14]), add(wL, [-20, 14])], true, 0.3)} fill={k(RONAN.rope)} shade={k(RONAN.ropeS)} lw={c.lw * 0.9} ink={c.ink}>
            {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${fx(add(mix(wL, wR, i / 11), [-14 + i * 2.6, -12]))} l7,26`} stroke={k(RONAN.ropeS)} strokeWidth={3} />)}
          </Part>
          <Bells x={wL[0] + 12} y={wL[1] + 12} t={t} amp={bellAmp} spacing={32} lw={c.lw * 0.7} s={0.9} />
          {/* scarf wrapped round the neck */}
          <Part d={tube([add(p.neck, [-40, 4]), add(p.neck, [0, 26]), add(p.neck, [40, 4])], [19, 23, 19])} fill={k("#c8203a")} shade={k("#8e1226")} lw={c.lw} sh={[-4, -6]} ink={c.ink}>
            <path d={`M${fx(add(p.neck, [-20, 14]))} l-6,30 M${fx(add(p.neck, [10, 22]))} l-6,30`} stroke={k("#8e1226")} strokeWidth={4} fill="none" />
          </Part>
        </g>
      );
    },
    head: (c) => <RonanHead face={c.face} turn={c.p.turn} lw={c.lw} drained={c.drained} ink={c.ink} />,
  };
};

export const Ronan: React.FC<FigureProps & RonanOpts> = ({ pose, s = 1, sword, handSide, swordRot, swordS, t, wind, bellAmp, scarfTo, scarfLen, ...rest }) => (
  <Figure costume={ronanCostume({ sword, handSide, swordRot, swordS, t, wind, bellAmp, scarfTo, scarfLen })} pose={reshape(pose, RONAN_BUILD)} s={s * RONAN_BUILD.s} {...rest} />
);
export const _ronanUnused = { sub };

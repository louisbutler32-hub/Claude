import React from "react";
import { INK } from "../common";
import {
  add, Arm, Costume, FaceFeatures, FaceSpec, Figure, FigureProps, frameOf, fx, HeadBase, Leg, mix, mul, P, Part, poly, rrect, seatPts, Skin, smooth, torsoPts, tube,
} from "../kit2";
import { HarbourBadge } from "./props3";
import { FaceOf, K, reshape, Build } from "./shared";
import type { Held } from "./ronan";

/* ============================ HARBOUR GUARD (generic) ============================ */

export type GuardFace = "blank" | "yell" | "shock" | "dizzy";
const GUARD_FACES: Record<GuardFace, FaceSpec> = {
  blank: { eye: "dot", brow: "flat", mouth: "line" },
  yell: { eye: "angry", brow: "down", mouth: "yell" },
  shock: { eye: "shock", brow: "up", mouth: "o", sweat: true },
  dizzy: { eye: "spiral", brow: "worry", mouth: "wobble" },
};
export const GUARD = { tabard: "#1f9a94", tabardS: "#13706c", under: "#e9ecef", underS: "#b8bfc9", helm: "#b4bfcc", helmS: "#7a869a", pants: "#2c3140", pantsS: "#181b25", boot: "#3a2a1c", skin: { base: "#f2c49c", shade: "#d49a74" } as Skin, stache: "#4a2c1a" };

export const GuardHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string; skin?: Skin; tone?: number }> = ({ face = "blank", turn = 0, lw, ink = INK, skin = GUARD.skin, tone = 0 }) => {
  const sx = turn * 14;
  const f = FaceOf(GUARD_FACES, face, "blank");
  const helm = tone ? "#c3b79a" : GUARD.helm;
  return (
    <g>
      <HeadBase turn={turn} skin={skin} lw={lw} ink={ink} />
      <FaceFeatures f={f} sx={sx} ink={ink} />
      {/* the tiny moustache */}
      <Part d={smooth([[-16 + sx, 33], [-6 + sx, 28], [1 + sx, 32], [8 + sx, 28], [18 + sx, 33], [8 + sx, 38], [1 + sx, 35], [-6 + sx, 38]], true, 0.5)} fill={GUARD.stache} lw={lw * 0.6} ink={ink} />
      {/* big round helmet */}
      <Part d={smooth([[-76, -14], [-80, -74], [-40, -122], [0, -130], [40, -122], [80, -74], [76, -14], [60, -26], [0, -34], [-60, -26]], true, 0.65)} fill={helm} shade={GUARD.helmS} lw={lw} sh={[-8, -8]} ink={ink}>
        <path d="M-50,-92 Q-30,-116 0,-118" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85} />
      </Part>
      <Part d={rrect(-80, -36, 160, 20, 9)} fill="#8d99ab" shade="#5d687b" lw={lw * 0.9} ink={ink} />
      <Part d={poly([[-6, -36], [6, -36], [8, -4], [-8, -4]])} fill="#8d99ab" shade="#5d687b" lw={lw * 0.8} ink={ink} />
      <circle cx={sx * 0.3} cy={-92} r={9} fill="#e5b040" stroke={ink} strokeWidth={lw * 0.6} />
    </g>
  );
};

export const guardCostume: Costume = {
  skin: GUARD.skin,
  headScale: 1.3,
  leg: (hip, kn, ft, fd, _s, c) => <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[28, 23, 19]} cloth={GUARD.pants} clothS={GUARD.pantsS} shoe="boot" shoeC={GUARD.boot} shoeS="#1e150d" bootTop={0.6} />,
  arm: (sh, el, ha, hk, side, c) => <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[22, 18, 15]} sleeve={1} cloth={GUARD.under} clothS={GUARD.underS} />,
  torso: (c, T) => {
    const p = c.p;
    const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
    const { across, down } = frameOf(p);
    const wL = T[8], wR = T[5];
    const hemL = add(add(p.hipL, mul(across, -34)), mul(down, 120)), hemR = add(add(p.hipR, mul(across, 34)), mul(down, 120));
    return (
      <g>
        <Part d={smooth(seatPts(p, 22, 70))} fill={GUARD.pants} shade={GUARD.pantsS} lw={c.lw} ink={c.ink} />
        <Part d={smooth([...T.slice(0, 6), add(p.hipR, [24, 16]), add(p.hipL, [-24, 16]), ...T.slice(8)], true, 0.8)} fill={GUARD.under} shade={GUARD.underS} lw={c.lw} ink={c.ink} />
        <Part d={smooth([add(T[0], [8, 4]), add(T[1], [0, 8]), add(T[2], [0, 8]), add(T[3], [-8, 4]), add(wR, [12, 0]), hemR, add(mix(hemL, hemR, 0.5), mul(down, 12)), hemL, add(wL, [-12, 0])], true, 0.4)} fill={GUARD.tabard} shade={GUARD.tabardS} lw={c.lw} sh={[-8, -5]} ink={c.ink}>
          <path d={`M${fx(add(mix(wL, wR, 0.5), mul(down, 4)))} L${fx(mix(hemL, hemR, 0.5))}`} stroke={GUARD.tabardS} strokeWidth={3} opacity={0.8} />
        </Part>
        <Part d={smooth([add(wL, [-14, 4]), add(wR, [14, 4]), add(wR, [14, 24]), add(wL, [-14, 24])], true, 0.3)} fill="#6a4a2a" shade="#3e2a14" lw={c.lw * 0.9} ink={c.ink} />
        <HarbourBadge x={mix(midS, midH, 0.34)[0]} y={mix(midS, midH, 0.34)[1] + 6} s={0.62} lw={3} />
      </g>
    );
  },
  head: (c) => <GuardHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} />,
};
export const Guard: React.FC<FigureProps> = (props) => <Figure costume={guardCostume} {...props} />;

/* ============================ THE DUELIST (hawk-eyed) ============================ */

export type DuelistFace = "cold" | "glare" | "shock";
const DUELIST_FACES: Record<DuelistFace, FaceSpec> = {
  cold: { eye: "sharp", brow: "down", mouth: "flat", browY: -26 },
  glare: { eye: "angry", brow: "down", mouth: "line", browY: -26 },
  shock: { eye: "shock", brow: "up", mouth: "o", sweat: true },
};
export const DUEL = { duster: "#8d949e", dusterS: "#5c636e", dusterL: "#b3bac4", hat: "#2c2f3a", hatS: "#171923", band: "#a43232", feather: "#e9edf2", featherS: "#9fb0c4", skin: { base: "#efd2b4", shade: "#cba584" } as Skin, pants: "#23252d", pantsS: "#12131a", boot: "#2a1d14", steel: "#dfe8f0" };

export const DuelistHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string }> = ({ face = "cold", turn = 0, lw, ink = INK }) => {
  const sx = turn * 14;
  const f = FaceOf(DUELIST_FACES, face, "cold");
  return (
    <g>
      {/* long dark hair behind the head */}
      <Part d={smooth([[-60, -30], [-74, 40], [-62, 100], [-34, 60], [-30, 0]], true, 0.5)} fill="#1e1e26" shade="#0c0c12" lw={lw} ink={ink} />
      <HeadBase turn={turn} skin={DUEL.skin} lw={lw} jaw={0.86} wide={0.92} neckW={15} ink={ink} />
      <FaceFeatures f={f} sx={sx} iris="#d9a21a" eyeX={22} ink={ink} />
      {/* hawk-eye ring and a thin goatee */}
      <path d={`M${22 + sx},-18 a24,16 0 0 1 24,16`} stroke={ink} strokeWidth={2} fill="none" opacity={0.6} />
      <Part d={poly([[-8 + sx, 52], [8 + sx, 52], [4 + sx, 96], [0 + sx, 104], [-4 + sx, 96]])} fill="#1e1e26" lw={lw * 0.5} ink={ink} />
      {/* wide-brimmed hat with a long feather */}
      <Part d={smooth([[-130, -50], [-60, -66], [0, -70], [60, -66], [130, -50], [96, -34], [0, -40], [-96, -34]], true, 0.6)} fill={DUEL.hat} shade={DUEL.hatS} lw={lw} sh={[-6, -6]} ink={ink} />
      <Part d={smooth([[-56, -54], [-58, -104], [-30, -132], [0, -138], [30, -132], [58, -104], [56, -54], [0, -46]], true, 0.6)} fill={DUEL.hat} shade={DUEL.hatS} lw={lw} sh={[-8, -6]} ink={ink} />
      <Part d={smooth([[-57, -58], [-58, -76], [0, -82], [58, -76], [57, -58], [0, -50]], true, 0.6)} fill={DUEL.band} shade="#6a1a1a" lw={lw * 0.8} ink={ink} />
      <Part d={smooth([[40, -78], [120, -150], [190, -170], [150, -120], [84, -60]], true, 0.7)} fill={DUEL.feather} shade={DUEL.featherS} lw={lw * 0.9} sh={[-5, -4]} ink={ink}>
        <path d="M50,-76 Q120,-130 184,-166" stroke={DUEL.featherS} strokeWidth={3} fill="none" />
        {[0.2, 0.4, 0.6, 0.8].map((u) => <path key={u} d={`M${50 + 134 * u},${-76 - 90 * u} l-14,26`} stroke={DUEL.featherS} strokeWidth={2} />)}
      </Part>
    </g>
  );
};

/** a thin rapier: grip at the origin, blade along +x, swept cup guard */
export const Rapier: React.FC<{ x?: number; y?: number; rot?: number; s?: number; lw?: number }> = ({ x = 0, y = 0, rot = 0, s = 1, lw = 3.6 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <Part d={tube([[0, 0], [700, 0]], [6, 1.5])} fill={DUEL.steel} shade="#98a8b8" lw={lw * 0.8} sh={[-2, -3]} />
    <Part d={smooth([[-6, -34], [40, -26], [48, 0], [40, 26], [-6, 34], [20, 0]], true, 0.4)} fill="#d6b24a" shade="#8e6c1c" lw={lw} />
    <Part d={rrect(-80, -8, 76, 16, 6)} fill="#4a3022" shade="#2a1a10" lw={lw} />
    <circle cx={-84} cy={0} r={11} fill="#d6b24a" stroke={INK} strokeWidth={lw * 0.8} />
  </g>
);

export type DuelistOpts = { rapier?: boolean; rapierRot?: number; t?: number };
export const duelistCostume = (o: DuelistOpts = {}): Costume => {
  const { rapier = true, rapierRot = 0, t = 0 } = o;
  return {
    skin: DUEL.skin,
    headScale: 1.2,
    behind: (c) => {
      const p = c.p;
      const T = torsoPts(p);
      const { across, down } = frameOf(p);
      const sway = Math.sin(t * 6) * 16;
      return (
        <Part d={smooth([add(T[8], [-26, 0]), add(T[5], [26, 0]), add(add(p.hipR, mul(across, 100)), [sway + 40, 400]), add(mix(p.hipL, p.hipR, 0.5), [sway, 440]), add(add(p.hipL, mul(across, -100)), [sway - 50, 400])], true, 0.35)} fill={DUEL.dusterS} lw={c.lw} ink={c.ink} />
      );
    },
    leg: (hip, kn, ft, fd, _s, c) => <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[24, 20, 16]} cloth={DUEL.pants} clothS={DUEL.pantsS} shoe="boot" shoeC={DUEL.boot} shoeS="#120c08" bootTop={0.4} />,
    arm: (sh, el, ha, hk, side, c) => {
      const h: Held | undefined = rapier && side > 0 ? (hand) => <Rapier x={hand[0]} y={hand[1]} rot={rapierRot} s={0.82} lw={3} /> : undefined;
      return (
        <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[20, 16, 13]} sleeve={1} cloth={DUEL.duster} clothS={DUEL.dusterS} handS={1.05}>
          {h && h(ha, el, c)}
        </Arm>
      );
    },
    torso: (c, T) => {
      const p = c.p;
      const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
      const { across } = frameOf(p);
      const sway = Math.sin(t * 6) * 16;
      const hemL = add(add(p.hipL, mul(across, -64)), [sway - 30, 420]), hemR = add(add(p.hipR, mul(across, 64)), [sway + 30, 420]);
      return (
        <g>
          <Part d={smooth(seatPts(p, 20, 70))} fill={DUEL.pants} shade={DUEL.pantsS} lw={c.lw} ink={c.ink} />
          <Part d={smooth([T[0], T[1], T[2], T[3], T[4], T[5], hemR, add(mix(hemL, hemR, 0.5), [0, 14]), hemL, T[8], T[9]], true, 0.5)} fill={DUEL.duster} shade={DUEL.dusterS} lw={c.lw} sh={[-10, -5]} ink={c.ink}>
            <path d={`M${fx(add(p.neck, [0, 20]))} L${fx(add(midH, [0, 330]))}`} stroke={DUEL.dusterS} strokeWidth={4} />
            {[0.25, 0.45, 0.65].map((u) => { const b = mix(add(p.neck, [0, 30]), midH, u); return <circle key={u} cx={b[0] + 14} cy={b[1]} r={6} fill="#cfd5dd" stroke={c.ink} strokeWidth={1.8} />; })}
            <path d={`M${fx(mix(T[8], hemL, 0.4))} q-8,40 6,90 M${fx(mix(T[5], hemR, 0.4))} q8,40 -6,90`} stroke={DUEL.dusterS} strokeWidth={3.4} fill="none" strokeLinecap="round" />
          </Part>
          {/* high turned-up collar */}
          <Part d={poly([add(p.neck, [-46, 8]), add(p.neck, [-34, -34]), add(p.neck, [-8, 14]), add(mix(midS, midH, 0.2), [-8, 10])])} fill={DUEL.dusterL} shade={DUEL.dusterS} lw={c.lw * 0.9} ink={c.ink} />
          <Part d={poly([add(p.neck, [46, 8]), add(p.neck, [34, -34]), add(p.neck, [8, 14]), add(mix(midS, midH, 0.2), [8, 10])])} fill={DUEL.dusterL} shade={DUEL.dusterS} lw={c.lw * 0.9} ink={c.ink} />
          <Part d={smooth([add(T[8], [-14, -6]), add(T[5], [14, -6]), add(T[5], [14, 14]), add(T[8], [-14, 14])], true, 0.3)} fill="#3a2a1c" shade="#20150c" lw={c.lw * 0.9} ink={c.ink} />
        </g>
      );
    },
    head: (c) => <DuelistHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} />,
  };
};
export const GUARD_BUILD: Build = { s: 1, kx: 1, ky: 1 };
export const DUELIST_BUILD: Build = { s: 1.02, kx: 0.96, ky: 1.06 };
export const Duelist: React.FC<FigureProps & DuelistOpts> = ({ pose, s = 1, rapier, rapierRot, t, ...rest }) => (
  <Figure costume={duelistCostume({ rapier, rapierRot, t })} pose={reshape(pose, DUELIST_BUILD)} s={s * DUELIST_BUILD.s} {...rest} />
);
export const _x = { K };

import React from "react";
import { INK } from "../common";
import { curlyMop } from "../guest";
import {
  add, Brows, circ, ell, Eye, FaceFeatures, FaceSpec, fx, HeadBase, mix, mul, nrm, P, Part, poly, rnd, SKIN, SKIN_PALE, SKIN_TAN, Skin, smooth, sub, tube,
} from "./draw";
import { Arm, Costume, Ctx, Figure, FigureProps, frameOf, Leg, seatPts, torsoPts } from "./figure";

/**
 * The kit v2 cast — our own drawings of the characters, on-model but ours.
 * Every character is a `Costume` for the Figure engine plus a head drawn in
 * head space (eye line y=0, chin +72, crown -86) with a named expression set.
 */

const FaceOf = <T extends string>(table: Record<T, FaceSpec>, name: string, fallback: T): FaceSpec => table[(name in table ? name : fallback) as T];

/* ====================================== ZORO ====================================== */

export type ZoroFace = "calm" | "smirk" | "narrow" | "shout" | "terror" | "drained" | "grin" | "sleep";
const ZORO_FACES: Record<ZoroFace, FaceSpec> = {
  calm: { eye: "sharp", brow: "flat", mouth: "flat" },
  smirk: { eye: "sharp", brow: "flat", mouth: "smirk" },
  narrow: { eye: "half", brow: "down", mouth: "flat" },
  shout: { eye: "angry", brow: "down", mouth: "yell", vein: true },
  terror: { eye: "shock", brow: "worry", mouth: "wobble", sweat: true, shade: true, eyeS: 1.1 },
  drained: { eye: "blank", brow: "worry", mouth: "wobble", shade: true },
  grin: { eye: "content", brow: "flat", mouth: "bigGrin" },
  sleep: { eye: "squint", brow: "flat", mouth: "o", mouthS: 0.7 },
};
export const ZORO = { hair: "#8fd45e", hairS: "#58a338", shirt: "#f7f4ec", shirtS: "#cfc9ba", hara: "#7cc242", haraS: "#4e8c28", pants: "#243d2c", pantsS: "#142419", boot: "#1a1a20", bootS: "#0a0a0e", band: "#1f3a2a" };

/** short green crop: a cap with small tufts and a jagged fringe high on the forehead */
const zoroHair = (sx: number): string => {
  const pts: P[] = [[-62 + sx * 0.5, -4], [-66 + sx * 0.4, -40]];
  const n = 15;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI;
    const tuft = i % 2 ? 1.0 : 1.12 + 0.05 * Math.sin(i * 2.3);
    pts.push([sx * 0.45 + Math.cos(a) * 66 * tuft, -40 + Math.sin(a) * 62 * tuft]);
  }
  pts.push([66 + sx * 0.4, -40], [62 + sx * 0.5, -4]);
  const fringe: P[] = [[52, -30], [44, -44], [32, -32], [22, -50], [8, -36], [-4, -52], [-16, -36], [-28, -50], [-40, -32], [-50, -44], [-56, -26]];
  fringe.forEach(([x, y]) => pts.push([x + sx, y]));
  return poly(pts);
};

export const ZoroHead: React.FC<{ face?: string; turn?: number; lw: number; drained?: boolean; ink?: string }> = ({ face = "calm", turn = 0, lw, drained, ink = INK }) => {
  const sx = turn * 14;
  const f = FaceOf(ZORO_FACES, drained ? "drained" : face, "calm");
  const skin: Skin = drained ? { base: "#eef0f3", shade: "#c3c8d2" } : SKIN_TAN;
  const hair = drained ? "#cfd6cf" : ZORO.hair, hairS = drained ? "#9aa49a" : ZORO.hairS;
  return (
    <g>
      <HeadBase turn={turn} skin={skin} lw={lw} jaw={1.06} neckW={22} ink={ink} />
      {/* three gold earrings on the viewer's-right ear */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${60 - Math.max(0, -turn) * 10 + i * 3},${16 + i * 3} l0,10 q-5,7 0,14 q5,-7 0,-14`} fill="#f2c230" stroke={ink} strokeWidth={1.6} />
      ))}
      <Part d={zoroHair(sx)} fill={hair} shade={hairS} lw={lw} sh={[-4, -5]} ink={ink}>
        <path d={`M${-22 + sx},-80 l6,16 M${12 + sx},-86 l2,16 M${38 + sx},-72 l-4,14`} stroke={hairS} strokeWidth={2.6} />
      </Part>
      <FaceFeatures f={f} sx={sx} iris="#2a2418" ink={ink} />
      {drained && <path d={`M${-30 + sx},-62 l-4,40 M${-14 + sx},-66 l-2,40 M${2 + sx},-66 l0,40 M${18 + sx},-66 l2,40 M${34 + sx},-62 l4,40`} stroke="#8b94a8" strokeWidth={2.4} strokeLinecap="round" />}
    </g>
  );
};

export const zoroCostume: Costume = {
  skin: SKIN_TAN,
  behind: (c) => {
    // three sheaths tied at the viewer's-left hip, hanging down and back
    const T = torsoPts(c.p);
    const w = T[8];
    return (
      <g>
        {[0, 1, 2].map((i) => <Part key={i} d={tube([add(w, [-14 + i * 10, 40 + i * 4]), add(w, [-70 + i * 26, 330 + i * 12])], [8, 7])} fill={["#f2f0ea", "#1a1a22", "#8c1a1a"][i]} shade={["#bdb9ad", "#08080c", "#5a0e0e"][i]} lw={c.lw * 0.9} ink={c.ink} />)}
      </g>
    );
  },
  leg: (hip, kn, ft, fd, _side, c) => <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[31, 26, 21]} cloth={c.drained ? "#9aa29c" : ZORO.pants} clothS={c.drained ? "#6f776f" : ZORO.pantsS} shoe="boot" shoeC={ZORO.boot} shoeS={ZORO.bootS} bootTop={0.5} />,
  arm: (sh, el, ha, hk, side, c) => (
    <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[24, 19, 16]} sleeve={0.42} cloth={c.drained ? "#e2e2de" : ZORO.shirt} clothS={ZORO.shirtS}>
      {/* bandana tied round the viewer's-right upper arm */}
      {side > 0 && <Part d={tube([mix(sh, el, 0.5), mix(sh, el, 0.66)], [31, 30])} fill={ZORO.band} shade="#102015" lw={c.lw * 0.9} ink={c.ink}><path d={`M${fx(mix(sh, el, 0.58))} l30,10 l-6,14 M${fx(mix(sh, el, 0.58))} l34,-4`} stroke="#102015" strokeWidth={3} fill="none" /></Part>}
    </Arm>
  ),
  torso: (c, T) => {
    const p = c.p;
    const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
    const vBot = mix(midS, midH, 0.36);
    const wL = T[8], wR = T[5];
    const shirt = c.drained ? "#e2e2de" : ZORO.shirt;
    return (
      <g>
        <Part d={smooth(seatPts(p, 24, 80))} fill={c.drained ? "#9aa29c" : ZORO.pants} shade={ZORO.pantsS} lw={c.lw} ink={c.ink} />
        {/* henley */}
        <Part d={smooth([...T.slice(0, 6), add(p.hipR, [26, 20]), add(p.hipL, [-26, 20]), ...T.slice(8)], true, 0.8)} fill={shirt} shade={ZORO.shirtS} lw={c.lw} sh={[-10, -5]} ink={c.ink}>
          <path d={`M${fx(add(p.neck, [-34, 14]))} Q${fx(add(p.neck, [0, 40]))} ${fx(add(p.neck, [34, 14]))}`} stroke={c.ink} strokeWidth={3} fill="none" />
          <path d={`M${fx(add(p.neck, [0, 36]))} L${fx(vBot)}`} stroke={c.ink} strokeWidth={2.4} />
          {[0.3, 0.55, 0.8].map((t) => <circle key={t} cx={mix(add(p.neck, [0, 36]), vBot, t)[0]} cy={mix(add(p.neck, [0, 36]), vBot, t)[1]} r={5} fill="#ddd6c4" stroke={c.ink} strokeWidth={1.8} />)}
          <path d={`M${fx(mix(p.shL, wL, 0.5))} q10,30 0,70 M${fx(mix(p.shR, wR, 0.5))} q-10,30 0,70`} stroke={ZORO.shirtS} strokeWidth={3} fill="none" />
        </Part>
        {/* haramaki */}
        <Part d={smooth([add(wL, [-10, -34]), add(wR, [10, -34]), add(p.hipR, [26, 0]), add(p.hipL, [-26, 0])], true, 0.4)} fill={c.drained ? "#c5d1bc" : ZORO.hara} shade={ZORO.haraS} lw={c.lw} ink={c.ink}>
          {[-20, 0, 20].map((o) => <path key={o} d={`M${fx(add(wL, [-20, o - 10]))} L${fx(add(wR, [20, o - 10]))}`} stroke={ZORO.haraS} strokeWidth={2.4} opacity={0.6} />)}
        </Part>
      </g>
    );
  },
  front: (c) => {
    // katana hilts over the haramaki at the viewer's-left hip
    const T = torsoPts(c.p);
    const w = T[8];
    return (
      <g>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <Part d={tube([add(w, [6 + i * 8, 20 + i * 6]), add(w, [-74 + i * 10, -70 + i * 16])], [8, 8])} fill={["#f2f0ea", "#1a1a22", "#8c1a1a"][i]} shade={["#bdb9ad", "#08080c", "#5a0e0e"][i]} lw={c.lw * 0.9} ink={c.ink}>
              <path d={`M${fx(add(w, [-10 + i * 9, -4 + i * 8]))} l-40,-45`} stroke={i === 1 ? "#c9a23a" : "#8a8a8a"} strokeWidth={3} strokeDasharray="6 6" />
            </Part>
            <path d={`M${fx(add(w, [-6 + i * 8, 2 + i * 8]))} l-10,-6 l20,-12`} stroke="#d0a030" strokeWidth={7} strokeLinecap="round" fill="none" />
          </g>
        ))}
      </g>
    );
  },
  head: (c) => <ZoroHead face={c.face} turn={c.p.turn} lw={c.lw} drained={c.drained} ink={c.ink} />,
};
export const Zoro: React.FC<FigureProps> = (props) => <Figure costume={zoroCostume} {...props} />;

/* ====================================== NAMI ====================================== */

export type NamiFace = "sweet" | "cold" | "furious" | "money" | "shock" | "smug";
const NAMI_FACES: Record<NamiFace, FaceSpec> = {
  sweet: { eye: "round", brow: "flat", mouth: "smile", blush: true },
  cold: { eye: "half", brow: "flat", mouth: "flat" },
  furious: { eye: "angry", brow: "down", mouth: "yell", vein: true },
  money: { eye: "money", brow: "up", mouth: "bigGrin", blush: true },
  shock: { eye: "shock", brow: "up", mouth: "o" },
  smug: { eye: "half", brow: "flat", mouth: "smirk" },
};
export const NAMI = { hair: "#ff8f1f", hairS: "#d9600e", top: "#f6f7fb", topS: "#c0c8da", stripe: "#2d7fd6", skirt: "#3a6fcb", skirtS: "#25478e", sandal: "#b57a44", sandalS: "#7d5230" };

export const NamiHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string }> = ({ face = "sweet", turn = 0, lw, ink = INK }) => {
  const sx = turn * 14;
  const f = FaceOf(NAMI_FACES, face, "sweet");
  return (
    <g>
      {/* back of the bob */}
      <Part d={smooth([[-70, -20], [-74, -80], [-26, -116], [36, -112], [74, -74], [70, -10], [66, 44], [48, 60], [42, 12], [-42, 12], [-48, 60], [-68, 46]], true, 0.6)} fill={NAMI.hair} shade={NAMI.hairS} lw={lw} ink={ink} />
      <HeadBase turn={turn} skin={SKIN} lw={lw} jaw={0.94} neckW={15} ink={ink} />
      <FaceFeatures f={f} sx={sx} iris="#8a4a22" lash browC={NAMI.hairS} ink={ink} />
      {/* fringe swept to one side */}
      <Part d={smooth([[-66 + sx, 6], [-70, -62], [-30, -100], [26, -102], [68, -68], [66 + sx, 2], [52, -30], [30, -56], [8 + sx, -30], [-12, -54], [-36, -24], [-50, -44]], true, 0.6)} fill={NAMI.hair} shade={NAMI.hairS} lw={lw} sh={[-4, -5]} ink={ink}>
        <path d={`M${-8 + sx},-94 q14,18 4,44 M${-32 + sx},-88 q12,16 4,34`} stroke={NAMI.hairS} strokeWidth={3} fill="none" strokeLinecap="round" />
      </Part>
    </g>
  );
};

export const namiCostume: Costume = {
  skin: SKIN,
  leg: (hip, kn, ft, fd, _s, c) => <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[26, 21, 16]} shoe="sandal" shoeC={NAMI.sandal} shoeS={NAMI.sandalS} />,
  arm: (sh, el, ha, hk, side, c) => <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[19, 15, 12]} handS={1.0} />,
  torso: (c, T) => {
    const p = c.p;
    const midH = mix(p.hipL, p.hipR, 0.5);
    const { across, down } = frameOf(p);
    const wL = T[8], wR = T[5];
    const hemL = add(add(p.hipL, mul(across, -46)), mul(down, 120)), hemR = add(add(p.hipR, mul(across, 46)), mul(down, 120));
    return (
      <g>
        {/* midriff */}
        <Part d={smooth([...T.slice(0, 6), add(p.hipR, [16, 4]), add(p.hipL, [-16, 4]), ...T.slice(8)], true, 0.6)} fill={c.skin.base} shade={c.skin.shade} lw={c.lw} ink={c.ink}>
          <circle cx={midH[0]} cy={midH[1] - 50} r={3} fill={c.skin.shade} />
        </Part>
        {/* blue mini skirt */}
        <Part d={smooth([add(wL, mul(down, 14)), add(wR, mul(down, 14)), hemR, add(mix(hemL, hemR, 0.5), mul(down, 10)), hemL], true, 0.35)} fill={NAMI.skirt} shade={NAMI.skirtS} lw={c.lw} ink={c.ink}>
          <path d={`M${fx(add(wL, mul(down, 36)))} L${fx(add(wR, mul(down, 36)))}`} stroke={NAMI.skirtS} strokeWidth={4} />
          <path d={`M${fx(mix(wL, wR, 0.5))} l0,40`} stroke={NAMI.skirtS} strokeWidth={3} />
        </Part>
        {/* striped top, sleeveless, short */}
        <Part d={smooth([...T.slice(0, 5), mix(T[4], T[5], 0.78), mix(T[9], T[8], 0.78)], true, 0.5)} fill={NAMI.top} shade={NAMI.topS} lw={c.lw} sh={[-8, -4]} ink={c.ink}>
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-220,${p.shL[1] + 36 + i * 30} L220,${p.shL[1] + 36 + i * 30}`} stroke={NAMI.stripe} strokeWidth={14} />)}
          <path d={`M${fx(add(p.neck, [-30, 12]))} Q${fx(add(p.neck, [0, 34]))} ${fx(add(p.neck, [30, 12]))}`} stroke={c.ink} strokeWidth={3} fill="none" />
        </Part>
      </g>
    );
  },
  head: (c) => <NamiHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} />,
};
export const Nami: React.FC<FigureProps> = (props) => <Figure costume={namiCostume} {...props} />;

/* ====================================== THE BOSS ====================================== */

export type BossFace = "grin" | "blank" | "shock" | "smug" | "sob" | "yell";
const BOSS_FACES: Record<BossFace, FaceSpec> = {
  grin: { eye: "content", brow: "thickUp", mouth: "bigGrin", blush: true },
  blank: { eye: "round", brow: "thick", mouth: "line" },
  shock: { eye: "shock", brow: "thickUp", mouth: "o", sweat: true },
  smug: { eye: "half", brow: "thick", mouth: "smirk" },
  sob: { eye: "closed", brow: "worry", mouth: "sob", tears: true },
  yell: { eye: "angry", brow: "thickDown", mouth: "yell" },
};
export const BOSS = { hair: "#3b261a", hairS: "#22140c", curl: "#5a3a26", skin: { base: "#f3c6a2", shade: "#d79a78" } as Skin, tee: "#2f6a42", teeS: "#1d4428", apron: "#d3262c", apronS: "#8e141a", jeans: "#2c3446", jeansS: "#1a2030" };

export const BossHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string }> = ({ face = "grin", turn = 0, lw, ink = INK }) => {
  const sx = turn * 14;
  const f = FaceOf(BOSS_FACES, face, "grin");
  const mop = curlyMop(sx * 0.4, -56, 66, 56, -54, -18, 16, 7);
  return (
    <g>
      <HeadBase turn={turn} skin={BOSS.skin} lw={lw} jaw={1.02} ink={ink} />
      <FaceFeatures f={f} sx={sx} iris="#4a2c18" browC={BOSS.hair} ink={ink} />
      <Part d={mop.blobs} fill={BOSS.hair} shade={BOSS.hairS} lw={lw} ink={ink}>
        <path d={mop.marks.join("")} stroke={BOSS.curl} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </Part>
    </g>
  );
};

export const bossCostume: Costume = {
  skin: BOSS.skin,
  leg: (hip, kn, ft, fd, _s, c) => <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[30, 25, 20]} cloth={BOSS.jeans} clothS={BOSS.jeansS} shoe="sneaker" shoeC="#2a2a30" shoeS="#141418" />,
  arm: (sh, el, ha, hk, side, c) => <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[22, 18, 15]} sleeve={0.4} cloth={BOSS.tee} clothS={BOSS.teeS} />,
  torso: (c, T) => {
    const p = c.p;
    const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
    const { across, down } = frameOf(p);
    const wL = T[8], wR = T[5];
    const chest = mix(midS, midH, 0.22);
    const hemL = add(add(p.hipL, mul(across, -36)), mul(down, 150)), hemR = add(add(p.hipR, mul(across, 36)), mul(down, 150));
    return (
      <g>
        <Part d={smooth(seatPts(p, 22, 70))} fill={BOSS.jeans} shade={BOSS.jeansS} lw={c.lw} ink={c.ink} />
        {/* tee */}
        <Part d={smooth([...T.slice(0, 6), add(p.hipR, [24, 16]), add(p.hipL, [-24, 16]), ...T.slice(8)], true, 0.8)} fill={BOSS.tee} shade={BOSS.teeS} lw={c.lw} ink={c.ink}>
          <path d={`M${fx(add(p.neck, [-32, 12]))} Q${fx(add(p.neck, [0, 32]))} ${fx(add(p.neck, [32, 12]))}`} stroke={c.ink} strokeWidth={3} fill="none" />
        </Part>
        {/* red apron: bib + skirt, neck strap, waist ties */}
        <path d={`M${fx(add(chest, [-40, 0]))} Q${fx(add(p.neck, [0, 6]))} ${fx(add(chest, [40, 0]))}`} stroke="#8e141a" strokeWidth={8} fill="none" />
        <Part d={smooth([add(chest, [-44, 0]), add(chest, [44, 0]), add(wR, [8, 0]), hemR, add(mix(hemL, hemR, 0.5), mul(down, 8)), hemL, add(wL, [-8, 0])], true, 0.4)} fill={BOSS.apron} shade={BOSS.apronS} lw={c.lw} ink={c.ink}>
          <path d={`M${fx(add(wL, mul(down, -6)))} L${fx(add(wR, mul(down, -6)))}`} stroke={BOSS.apronS} strokeWidth={5} />
          <path d={`M${fx(add(mix(wL, wR, 0.5), mul(down, 70)))} m-30,0 h60 v50 h-60Z`} stroke={BOSS.apronS} strokeWidth={3} fill="none" />
        </Part>
        <path d={`M${fx(add(wR, [10, -4]))} q30,10 44,30 q-26,-6 -44,-14`} fill={BOSS.apron} stroke={c.ink} strokeWidth={c.lw * 0.8} strokeLinejoin="round" />
      </g>
    );
  },
  head: (c) => <BossHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} />,
};
export const Boss: React.FC<FigureProps> = (props) => <Figure costume={bossCostume} {...props} />;

/* ====================================== LUFFY ====================================== */

export type LuffyFace = "grin" | "blank" | "stuffed" | "shock" | "laugh" | "hungry";
const LUFFY_FACES: Record<LuffyFace, FaceSpec> = {
  grin: { eye: "round", brow: "up", mouth: "bigGrin" },
  blank: { eye: "round", brow: "flat", mouth: "line" },
  stuffed: { eye: "content", brow: "up", mouth: "stuffed" },
  shock: { eye: "shock", brow: "up", mouth: "shout" },
  laugh: { eye: "content", brow: "up", mouth: "bigGrin", blush: true },
  hungry: { eye: "round", brow: "worry", mouth: "o", tears: true },
};
export const LUFFY = { hair: "#1b1820", hairS: "#0a0810", vest: "#e1262d", vestS: "#9d141d", sash: "#f6c51c", sashS: "#c48a0a", shorts: "#2f6fd0", shortsS: "#1d4a98", hat: "#f1cb5e", hatS: "#c9952c", band: "#d8262c" };

const spikyCap = (cx: number, top: number, w: number, bottom: number, n: number, spike: number, seed = 1): string => {
  const pts: P[] = [[cx - w, bottom]];
  for (let i = 0; i <= n * 2; i++) {
    const a = Math.PI + (i / (n * 2)) * Math.PI;
    const r = i % 2 === 1 ? 1 + (spike / w) * (0.75 + 0.5 * Math.abs(Math.sin(i * 1.7 + seed))) : 1;
    pts.push([cx + Math.cos(a) * w * r, bottom + Math.sin(a) * (bottom - top) * r]);
  }
  pts.push([cx + w, bottom]);
  return poly(pts);
};

export const LuffyHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string; hat?: boolean }> = ({ face = "grin", turn = 0, lw, ink = INK, hat = true }) => {
  const sx = turn * 14;
  const f = FaceOf(LUFFY_FACES, face, "grin");
  return (
    <g>
      <Part d={spikyCap(sx * 0.5, -104, 70, 24, 7, 24, 3)} fill={LUFFY.hair} lw={lw} ink={ink} />
      <HeadBase turn={turn} skin={SKIN} lw={lw} ink={ink} />
      {/* bangs */}
      <Part d={poly([[-60 + sx, -62], [-52 + sx, -8], [-40 + sx, -48], [-26 + sx, -12], [-14 + sx, -52], [0 + sx, -16], [12 + sx, -54], [26 + sx, -14], [36 + sx, -52], [50 + sx, -10], [60 + sx, -60], [0, -86]])} fill={LUFFY.hair} lw={lw} ink={ink} />
      <FaceFeatures f={f} sx={sx} iris="#2a1c14" ink={ink} />
      {/* scar under his left eye (viewer's right) */}
      <path d={`M${14 + sx},18 Q${26 + sx},23 ${38 + sx},17 M${20 + sx},14 L${19 + sx},23 M${31 + sx},14 L${32 + sx},22`} stroke={ink} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      {hat && (
        <g transform={`translate(${sx * 0.6},0)`}>
          <Part d={smooth([[-118, -54], [-64, -70], [0, -76], [64, -70], [118, -54], [102, -38], [0, -42], [-102, -38]])} fill={LUFFY.hat} shade={LUFFY.hatS} lw={lw} ink={ink} />
          <Part d={smooth([[-50, -64], [-54, -102], [-32, -130], [0, -136], [32, -130], [54, -102], [50, -64], [0, -58]])} fill={LUFFY.hat} shade={LUFFY.hatS} lw={lw} ink={ink}>
            <path d="M-50,-90 Q0,-100 50,-90 M-44,-112 Q0,-122 44,-112" stroke={LUFFY.hatS} strokeWidth={2} fill="none" opacity={0.7} />
          </Part>
          <Part d={smooth([[-52, -66], [-53, -84], [0, -90], [53, -84], [52, -66], [0, -60]])} fill={LUFFY.band} shade="#9e141e" lw={lw} ink={ink} />
          <path d="M-86,-50 Q0,-64 86,-50" stroke={LUFFY.hatS} strokeWidth={2} fill="none" opacity={0.6} />
        </g>
      )}
    </g>
  );
};

export const luffyCostume: Costume = {
  skin: SKIN,
  leg: (hip, kn, ft, fd, _s, c) => <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[26, 22, 17]} cloth={LUFFY.shorts} clothS={LUFFY.shortsS} cuff={0.72} shoe="sandal" shoeC="#8a4a24" shoeS="#5a2e14" />,
  arm: (sh, el, ha, hk, side, c) => <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[20, 16, 14]} />,
  torso: (c, T) => {
    const p = c.p;
    const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
    const wL = T[8], wR = T[5];
    const { across, down } = frameOf(p);
    const hem = (pt: P) => add(pt, mul(down, 30));
    return (
      <g>
        <Part d={smooth(seatPts(p, 22, 70))} fill={LUFFY.shorts} shade={LUFFY.shortsS} lw={c.lw} ink={c.ink} />
        {/* bare chest */}
        <Part d={smooth(T, true, 0.8)} fill={c.skin.base} shade={c.skin.shade} lw={c.lw} sh={[-10, -4]} ink={c.ink}>
          <path d={smooth([mix(p.neck, p.shL, 0.5), add(mix(midS, midH, 0.25), [-40, 0]), add(mix(midS, midH, 0.28), [-4, 0])], false)} stroke={c.ink} strokeWidth={2.4} fill="none" />
          <path d={smooth([mix(p.neck, p.shR, 0.5), add(mix(midS, midH, 0.25), [40, 0]), add(mix(midS, midH, 0.28), [4, 0])], false)} stroke={c.ink} strokeWidth={2.4} fill="none" />
        </Part>
        {/* open red vest: two panels, yellow buttons */}
        <Part d={smooth([add(p.shL, [-6, -4]), mix(p.neck, p.shL, 0.25), add(mix(p.neck, wL, 0.55), [10, 0]), add(wL, [16, 8]), hem(add(wL, [-6, 0])), add(T[9], [-6, 0])], true, 0.5)} fill={LUFFY.vest} shade={LUFFY.vestS} lw={c.lw} ink={c.ink}>
          {[0.45, 0.65, 0.85].map((t) => <circle key={t} cx={mix(mix(p.neck, p.shL, 0.25), add(wL, [16, 8]), t)[0] + 6} cy={mix(mix(p.neck, p.shL, 0.25), add(wL, [16, 8]), t)[1]} r={6} fill="#f2c230" stroke={c.ink} strokeWidth={1.6} />)}
        </Part>
        <Part d={smooth([add(p.shR, [6, -4]), mix(p.neck, p.shR, 0.25), add(mix(p.neck, wR, 0.55), [-10, 0]), add(wR, [-16, 8]), hem(add(wR, [6, 0])), add(T[4], [6, 0])], true, 0.5)} fill={LUFFY.vest} shade={LUFFY.vestS} lw={c.lw} ink={c.ink} />
        {/* yellow sash, knot and tail */}
        <Part d={smooth([add(wL, [-12, -4]), add(wR, [12, -4]), add(wR, mul(down, 46)), add(wL, mul(down, 46))], true, 0.4)} fill={LUFFY.sash} shade={LUFFY.sashS} lw={c.lw} ink={c.ink} />
        <Part d={smooth([add(wR, [-20, 12]), add(wR, [6, 16]), add(wR, [26, 120]), add(wR, [16, 200]), add(wR, [-4, 200]), add(wR, [-4, 110])])} fill={LUFFY.sash} shade={LUFFY.sashS} lw={c.lw} ink={c.ink} />
      </g>
    );
  },
  head: (c) => <LuffyHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} />,
};
export const Luffy: React.FC<FigureProps> = (props) => <Figure costume={luffyCostume} {...props} />;

/* ====================================== SANJI ====================================== */

export type SanjiFace = "calm" | "heart" | "shock" | "grin" | "angry";
const SANJI_FACES: Record<SanjiFace, FaceSpec> = {
  calm: { eye: "half", brow: "none", mouth: "smirk" },
  heart: { eye: "heart", brow: "none", mouth: "bigGrin", blush: true },
  shock: { eye: "shock", brow: "none", mouth: "o" },
  grin: { eye: "content", brow: "none", mouth: "grin" },
  angry: { eye: "angry", brow: "none", mouth: "grit", vein: true },
};
export const SANJI = { hair: "#f7dc4c", hairS: "#cfa820", suit: "#22222c", suitS: "#0f0f16", shirt: "#4f7fd0", shirtS: "#2f58a0", tie: "#1a1a24", shoe: "#141418" };

export const SanjiHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string }> = ({ face = "calm", turn = 0, lw, ink = INK }) => {
  const sx = turn * 14;
  const f = FaceOf(SANJI_FACES, face, "calm");
  return (
    <g>
      <Part d={smooth([[-66 + sx, 24], [-70 + sx, -44], [-44, -100], [12, -106], [58, -84], [70 + sx, -32], [64 + sx, 12], [54 + sx, -20], [44 + sx, -54]])} fill={SANJI.hair} shade={SANJI.hairS} lw={lw} ink={ink} />
      <HeadBase turn={turn} skin={SKIN} lw={lw} jaw={1.08} ink={ink} />
      {/* only the viewer's-right eye shows; curly brow */}
      <Eye x={24 + sx} y={0} kind={f.eye} flip iris="#2a3a5a" ink={ink} />
      <path d={`M${8 + sx},-22 q4,-10 10,-6 q3,4 -2,6 M${10 + sx},-22 Q${26 + sx},-32 ${42 + sx},-20`} stroke={ink} strokeWidth={4.2} fill="none" strokeLinecap="round" />
      <path d={`M${sx + 4},12 L${sx + 8},30 L${sx + 1},32`} stroke={ink} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <FaceFeatures f={{ ...f, eye: "dot", brow: "none" }} sx={sx + 2} ink={ink} nose={false} eyeX={-200} />
      {/* goatee stubble + cigarette */}
      <path d={`M${sx - 6},70 q6,6 12,0`} stroke={SANJI.hairS} strokeWidth={3} fill="none" />
      <path d={`M${sx + 18},48 L${sx + 62},40`} stroke="#f4f4f0" strokeWidth={6} strokeLinecap="round" />
      <path d={`M${sx + 56},41 L${sx + 62},40`} stroke="#ff6a1a" strokeWidth={6} strokeLinecap="round" />
      <path d={`M${sx + 64},36 q6,-14 -2,-26`} stroke="#aaa" strokeWidth={2} fill="none" opacity={0.7} />
      {/* fringe over the viewer's-left eye */}
      <Part d={smooth([[-68 + sx, -40], [-34, -94], [20, -92], [50 + sx, -64], [34 + sx, -54], [14 + sx, -34], [0 + sx, 2], [-12 + sx, 30], [-30 + sx, 40], [-56 + sx, 30]])} fill={SANJI.hair} shade={SANJI.hairS} lw={lw} ink={ink}>
        <path d={`M${-10 + sx},-64 Q${-26 + sx},-20 ${-32 + sx},22 M${12 + sx},-66 Q${-2 + sx},-30 ${-10 + sx},6`} stroke={SANJI.hairS} strokeWidth={2.4} fill="none" />
      </Part>
    </g>
  );
};

export const sanjiCostume: Costume = {
  skin: SKIN,
  leg: (hip, kn, ft, fd, _s, c) => <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[26, 22, 18]} cloth={SANJI.suit} clothS={SANJI.suitS} shoe="shoe" shoeC={SANJI.shoe} shoeS="#050508" />,
  arm: (sh, el, ha, hk, side, c) => <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[20, 17, 15]} sleeve={1} cloth={SANJI.suit} clothS={SANJI.suitS} cuff={SANJI.shirt} />,
  torso: (c, T) => {
    const p = c.p;
    const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
    const vBot = mix(midS, midH, 0.42);
    return (
      <g>
        <Part d={smooth(seatPts(p, 22, 70))} fill={SANJI.suit} shade={SANJI.suitS} lw={c.lw} ink={c.ink} />
        <Part d={smooth([...T.slice(0, 6), add(p.hipR, [30, 76]), add(midH, [0, 92]), add(p.hipL, [-30, 76]), ...T.slice(8)], true, 0.8)} fill={SANJI.suit} shade={SANJI.suitS} lw={c.lw} ink={c.ink}>
          <path d={`M${fx(add(midH, [0, 92]))} L${fx(add(vBot, [0, 60]))}`} stroke="#0a0c18" strokeWidth={2.6} />
          {[0, 1, 2].map((i) => [-1, 1].map((sd) => <circle key={`${i}${sd}`} cx={vBot[0] + sd * 28} cy={vBot[1] + 44 + i * 56} r={6.5} fill="#e8b830" stroke={c.ink} strokeWidth={1.6} />))}
          <path d={`M${fx(add(p.hipL, [-10, 20]))} l40,4 M${fx(add(p.hipR, [-30, 24]))} l40,-4`} stroke="#0a0c18" strokeWidth={2.6} />
        </Part>
        <Part d={smooth([mix(p.neck, p.shL, 0.3), mix(p.neck, p.shR, 0.3), vBot], true, 0.3)} fill={SANJI.shirt} shade={SANJI.shirtS} lw={c.lw * 0.8} ink={c.ink} />
        <Part d={smooth([add(p.neck, [-7, 14]), add(p.neck, [7, 14]), add(vBot, [7, -12]), add(vBot, [0, 6]), add(vBot, [-7, -12])], true, 0.3)} fill={SANJI.tie} lw={c.lw * 0.6} ink={c.ink} />
        <path d={`M${fx(mix(p.neck, p.shL, 0.32))}L${fx(add(vBot, [-8, 12]))}M${fx(mix(p.neck, p.shR, 0.32))}L${fx(add(vBot, [8, 12]))}`} stroke="#0a0c18" strokeWidth={3.4} />
      </g>
    );
  },
  head: (c) => <SanjiHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} />,
};
export const Sanji: React.FC<FigureProps> = (props) => <Figure costume={sanjiCostume} {...props} />;

/* ====================================== ADMIRALS ====================================== */

export type AdmiralKey = "akainu" | "kuzan" | "kizaru";
export type AdmiralFace = "stern" | "angry" | "sleepy" | "smirk" | "oh" | "shock";
type Look = { suit: string; suitS: string; shirt: string; shirtS: string; shoe: string; skin: Skin; stripe?: string };
export const ADMIRAL_LOOK: Record<AdmiralKey, Look> = {
  akainu: { suit: "#8c1c22", suitS: "#5c0e14", shirt: "#c2303a", shirtS: "#8a1a24", shoe: "#2a1414", skin: SKIN_TAN },
  kuzan: { suit: "#eef0f4", suitS: "#b8bfcc", shirt: "#4f7fd0", shirtS: "#335aa0", shoe: "#3a3a40", skin: SKIN_TAN },
  kizaru: { suit: "#f2c62e", suitS: "#c6961a", shirt: "#7a3aa8", shirtS: "#52207a", shoe: "#f0e6d0", skin: SKIN_PALE, stripe: "#c9921a" },
};

export const AkainuHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string }> = ({ face = "stern", turn = 0, lw, ink = INK }) => {
  const sx = turn * 14;
  const angry = face === "angry" || face === "shock";
  const f: FaceSpec = angry ? { eye: "angry", brow: "thickDown", mouth: "grit", vein: face === "angry" } : { eye: "half", brow: "thickDown", mouth: "frown" };
  return (
    <g>
      <HeadBase turn={turn} skin={SKIN_TAN} lw={lw} jaw={1.2} neckW={26} wide={1.06} ink={ink} />
      <Part d={[smooth([[-58 + sx * 0.5, -44], [-64, -10], [-58, 16], [-50, -22]]), smooth([[58 + sx * 0.5, -44], [64, -10], [58, 16], [50, -22]])]} fill="#1a1416" lw={lw} ink={ink} />
      <FaceFeatures f={f} sx={sx} iris="#1a1416" browC="#1a1416" ink={ink} />
      <path d={`M${-32 + sx},26 Q${-36 + sx},46 ${-28 + sx},62 M${32 + sx},26 Q${36 + sx},46 ${28 + sx},62`} stroke={ink} strokeWidth={2} fill="none" />
      <path d={`M${sx},74 l0,6`} stroke={ink} strokeWidth={1.8} />
      {/* the Marine cap */}
      <Part d={smooth([[-66, -42], [-70, -92], [-32, -120], [32, -120], [70, -92], [66, -42]], true, 0.6)} fill="#f4f4f0" shade="#c8ccd4" lw={lw} ink={ink} />
      <Part d="M-67,-62 L67,-62 L66,-42 L-66,-42Z" fill="#24305a" lw={lw * 0.8} ink={ink} />
      <Part d={smooth([[-64, -42], [0, -30], [64, -42], [60, -30], [0, -16], [-60, -30]], true, 0.6)} fill="#18181c" lw={lw * 0.8} ink={ink} />
      <text x={0} y={-80} textAnchor="middle" fontFamily="Poppins Black" fontSize={16} fill="#24305a">MARINE</text>
    </g>
  );
};

export const KuzanHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string }> = ({ face = "sleepy", turn = 0, lw, ink = INK }) => {
  const sx = turn * 14;
  const afro = curlyMop(sx * 0.3, -70, 78, 74, -60, -12, 18, 21);
  const f: FaceSpec = face === "oh" || face === "shock" ? { eye: "shock", brow: "up", mouth: "o" } : face === "angry" ? { eye: "angry", brow: "down", mouth: "frown" } : { eye: "half", brow: "worry", mouth: "pout" };
  return (
    <g>
      <HeadBase turn={turn} skin={SKIN_TAN} lw={lw} jaw={1.1} neckW={22} ink={ink} />
      <path d={`M${-42 + sx},36 Q${sx},90 ${42 + sx},36`} stroke="#6a5a50" strokeWidth={7} fill="none" strokeDasharray="2 4" opacity={0.6} />
      <FaceFeatures f={f} sx={sx} iris="#1a1416" browC="#1a1416" ink={ink} />
      <Part d={afro.blobs} fill="#1a1618" shade="#0c0a0c" lw={lw} ink={ink}><path d={afro.marks.join("")} stroke="#3a3238" strokeWidth={2.4} fill="none" /></Part>
      <Part d="M-70,-54 Q0,-66 70,-54 L68,-32 Q0,-44 -68,-32Z" fill="#9cc8f0" shade="#6a9ad0" lw={lw * 0.8} ink={ink} />
      {[-26, 26].map((ex) => <g key={ex}><ellipse cx={ex} cy={-46} rx={13} ry={8} fill="#fff" stroke={ink} strokeWidth={1.8} /><circle cx={ex} cy={-46} r={4} fill={ink} /></g>)}
    </g>
  );
};

export const KizaruHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string }> = ({ face = "smirk", turn = 0, lw, ink = INK }) => {
  const sx = turn * 14;
  return (
    <g>
      <HeadBase turn={turn} skin={SKIN_PALE} lw={lw} jaw={1.22} neckW={19} ink={ink} />
      <Part d={smooth([[-60, -6], [-64, -58], [-38, -94], [10, -102], [56, -88], [64, -50], [60, -6], [54, -48], [22, -72], [-22, -72], [-54, -44]])} fill="#2a2220" shade="#140e0c" lw={lw} ink={ink}>
        <path d="M-42,-76 Q0,-90 46,-72 M-48,-60 Q0,-78 52,-56" stroke="#4a3a34" strokeWidth={2.6} fill="none" />
      </Part>
      <path d={`M${-38 + sx},-24 Q${-24 + sx},-30 ${-10 + sx},-24 M${10 + sx},-24 Q${24 + sx},-30 ${38 + sx},-24`} stroke="#2a2220" strokeWidth={3.6} fill="none" strokeLinecap="round" />
      {[-23, 23].map((ex) => <path key={ex} d={`M${ex - 18 + sx},-10 L${ex + 18 + sx},-10 L${ex + 16 + sx},6 Q${ex + sx},16 ${ex - 16 + sx},6Z`} fill="#f08a2a" stroke={ink} strokeWidth={2.8} strokeLinejoin="round" />)}
      <path d={`M${-5 + sx},-8 L${5 + sx},-8 M${-41 + sx},-8 L${-54 + sx},-14 M${41 + sx},-8 L${54 + sx},-14`} stroke={ink} strokeWidth={2.8} />
      <path d={`M${sx + 2},14 L${sx + 8},36 L${sx},39`} stroke={ink} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {face === "oh" || face === "shock" ? <ellipse cx={sx} cy={58} rx={11} ry={9} fill="#5a1418" stroke={ink} strokeWidth={2.6} /> : <path d={`M${sx - 20},56 Q${sx},62 ${sx + 22},54`} stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round" />}
      <path d={`M${sx - 4},74 q4,6 8,0`} stroke={ink} strokeWidth={2} fill="none" />
    </g>
  );
};

export const admiralCostume = (who: AdmiralKey, coat = true): Costume => {
  const L = ADMIRAL_LOOK[who];
  return {
    skin: L.skin,
    behind: (c) => {
      if (!coat) return null;
      const p = c.p, midH = mix(p.hipL, p.hipR, 0.5);
      return <Part d={smooth([add(p.shL, [-34, -8]), add(p.neck, [0, -12]), add(p.shR, [34, -8]), add(p.shR, [84, 200]), add(p.hipR, [96, 240]), add(midH, [0, 310]), add(p.hipL, [-96, 240]), add(p.shL, [-84, 200])], true, 0.7)} fill="#f6f6f2" shade="#c4c8d2" lw={c.lw} sh={[-10, -4]} ink={c.ink} />;
    },
    leg: (hip, kn, ft, fd, _s, c) => <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[28, 24, 20]} cloth={L.suit} clothS={L.suitS} shoe="shoe" shoeC={L.shoe} shoeS={L.suitS} />,
    arm: (sh, el, ha, hk, side, c) => <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[24, 20, 17]} sleeve={1} cloth={L.suit} clothS={L.suitS} />,
    torso: (c, T) => {
      const p = c.p;
      const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
      const vBot = mix(midS, midH, 0.42);
      return (
        <g>
          <Part d={smooth(seatPts(p, 24, 70))} fill={L.suit} shade={L.suitS} lw={c.lw} ink={c.ink} />
          <Part d={smooth([...T.slice(0, 6), add(p.hipR, [30, 64]), add(midH, [0, 80]), add(p.hipL, [-30, 64]), ...T.slice(8)], true, 0.8)} fill={L.suit} shade={L.suitS} lw={c.lw} ink={c.ink}>
            {L.stripe && [-60, -30, 0, 30, 60].map((o) => <path key={o} d={`M${fx(add(midS, [o, -20]))}L${fx(add(midH, [o * 1.2, 90]))}`} stroke={L.stripe} strokeWidth={2.4} />)}
            {[0, 1].map((i) => <circle key={i} cx={vBot[0] + 12} cy={vBot[1] + 64 + i * 64} r={6.5} fill="#e8d8a0" stroke={c.ink} strokeWidth={1.6} />)}
          </Part>
          <Part d={smooth([mix(p.neck, p.shL, 0.3), mix(p.neck, p.shR, 0.3), vBot], true, 0.3)} fill={L.shirt} shade={L.shirtS} lw={c.lw * 0.8} ink={c.ink}>
            {who === "akainu" && [[-14, 20], [10, 36], [-4, 56], [16, 70]].map(([dx, dy], i) => <circle key={i} cx={p.neck[0] + dx} cy={p.neck[1] + dy} r={6} fill="#e85a64" stroke="#5c0e14" strokeWidth={1.4} />)}
          </Part>
          <path d={`M${fx(mix(p.neck, p.shL, 0.32))}L${fx(add(vBot, [-4, 8]))}M${fx(mix(p.neck, p.shR, 0.32))}L${fx(add(vBot, [4, 8]))}`} stroke={c.ink} strokeWidth={3.2} />
          {coat && <path d={`M${fx(add(p.shL, [-34, -8]))}Q${fx(add(p.shL, [-6, -30]))} ${fx(add(p.neck, [-32, -16]))} M${fx(add(p.shR, [34, -8]))}Q${fx(add(p.shR, [6, -30]))} ${fx(add(p.neck, [32, -16]))}`} stroke={c.ink} strokeWidth={c.lw} fill="none" />}
        </g>
      );
    },
    head: (c) => who === "akainu" ? <AkainuHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} /> : who === "kuzan" ? <KuzanHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} /> : <KizaruHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} />,
  };
};
const ADMIRALS = { akainu: admiralCostume("akainu"), kuzan: admiralCostume("kuzan"), kizaru: admiralCostume("kizaru") };
export const Akainu: React.FC<FigureProps> = (props) => <Figure costume={ADMIRALS.akainu} {...props} />;
export const Kuzan: React.FC<FigureProps> = (props) => <Figure costume={ADMIRALS.kuzan} {...props} />;
export const Kizaru: React.FC<FigureProps> = (props) => <Figure costume={ADMIRALS.kizaru} {...props} />;

/* ====================================== MARINE ====================================== */

export type MarineFace = "blank" | "shock" | "yell" | "salute";
const MARINE_FACES: Record<MarineFace, FaceSpec> = {
  blank: { eye: "dot", brow: "flat", mouth: "line" },
  shock: { eye: "shock", brow: "up", mouth: "o", sweat: true },
  yell: { eye: "angry", brow: "down", mouth: "yell" },
  salute: { eye: "dot", brow: "up", mouth: "grit" },
};
export const MARINE = { cap: "#f7f7f2", capS: "#c9cfdc", blue: "#2f5da8", blueS: "#1e3c70", white: "#f2f2ec", whiteS: "#c4cadb", shoe: "#1a1a20" };

export const MarineHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string }> = ({ face = "blank", turn = 0, lw, ink = INK }) => {
  const sx = turn * 14;
  const f = FaceOf(MARINE_FACES, face, "blank");
  return (
    <g>
      <HeadBase turn={turn} skin={SKIN} lw={lw} ink={ink} />
      <Part d={smooth([[-56, -30], [-50, -70], [0, -84], [50, -70], [56, -30], [40, -42], [-40, -42]])} fill="#3a2a1c" lw={lw} ink={ink} />
      <FaceFeatures f={f} sx={sx} ink={ink} />
      <Part d={smooth([[-62, -40], [-66, -90], [-30, -118], [30, -118], [66, -90], [62, -40]], true, 0.6)} fill={MARINE.cap} shade={MARINE.capS} lw={lw} ink={ink} />
      <Part d="M-63,-60 L63,-60 L62,-40 L-62,-40Z" fill={MARINE.blue} lw={lw * 0.8} ink={ink} />
      <Part d={smooth([[-60, -40], [0, -28], [60, -40], [56, -28], [0, -14], [-56, -28]], true, 0.6)} fill="#18181c" lw={lw * 0.8} ink={ink} />
      <text x={0} y={-78} textAnchor="middle" fontFamily="Poppins Black" fontSize={15} fill={MARINE.blue}>MARINE</text>
    </g>
  );
};

export const marineCostume: Costume = {
  skin: SKIN,
  leg: (hip, kn, ft, fd, _s, c) => <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[27, 23, 19]} cloth={MARINE.white} clothS={MARINE.whiteS} shoe="shoe" shoeC={MARINE.shoe} shoeS="#050508" />,
  arm: (sh, el, ha, hk, side, c) => <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[21, 17, 14]} sleeve={0.42} cloth={MARINE.white} clothS={MARINE.whiteS} />,
  torso: (c, T) => {
    const p = c.p;
    const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
    return (
      <g>
        <Part d={smooth(seatPts(p, 22, 70))} fill={MARINE.white} shade={MARINE.whiteS} lw={c.lw} ink={c.ink} />
        <Part d={smooth([...T.slice(0, 6), add(p.hipR, [24, 16]), add(p.hipL, [-24, 16]), ...T.slice(8)], true, 0.8)} fill={MARINE.white} shade={MARINE.whiteS} lw={c.lw} ink={c.ink}>
          <path d={`M${fx(add(midH, [-40, -40]))} L${fx(add(midH, [40, -40]))}`} stroke={MARINE.blue} strokeWidth={10} opacity={0.0} />
        </Part>
        {/* blue neckerchief */}
        <Part d={smooth([add(p.shL, [10, -10]), add(p.neck, [0, 10]), add(p.shR, [-10, -10]), add(p.shR, [-20, 30]), add(mix(midS, midH, 0.3), [0, 10]), add(p.shL, [20, 30])], true, 0.4)} fill={MARINE.blue} shade={MARINE.blueS} lw={c.lw * 0.9} ink={c.ink} />
        <Part d={smooth([add(mix(midS, midH, 0.25), [-8, 0]), add(mix(midS, midH, 0.25), [8, 0]), add(mix(midS, midH, 0.4), [10, 60]), add(mix(midS, midH, 0.4), [-10, 60])], true, 0.3)} fill={MARINE.blue} shade={MARINE.blueS} lw={c.lw * 0.8} ink={c.ink} />
      </g>
    );
  },
  head: (c) => <MarineHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} />,
};
export const Marine: React.FC<FigureProps> = (props) => <Figure costume={marineCostume} {...props} />;

/* ====================================== BIG PIG BEN ====================================== */

export type BenFace = "scared" | "sly" | "cry" | "shock";
export const BEN = { skin: { base: "#f6b7c4", shade: "#d98196" } as Skin, shirt: "#f4f0e6", stripe: "#2a2a34", bandana: "#c8282e", shorts: "#4a3a2a" };

export const BenHead: React.FC<{ face?: string; turn?: number; lw: number; ink?: string }> = ({ face = "scared", turn = 0, lw, ink = INK }) => {
  const sx = turn * 14;
  const f: FaceSpec = face === "sly" ? { eye: "half", brow: "down", mouth: "smirk" } : face === "cry" ? { eye: "closed", brow: "worry", mouth: "sob", tears: true } : face === "shock" ? { eye: "shock", brow: "up", mouth: "o" } : { eye: "shock", brow: "worry", mouth: "wobble", sweat: true, eyeS: 0.9 };
  return (
    <g>
      {/* round pig head with floppy ears */}
      <Part d={[smooth([[-60 + sx * 0.5, -50], [-78, -96], [-30, -70]], true, 0.6), smooth([[60 + sx * 0.5, -50], [78, -96], [30, -70]], true, 0.6)]} fill={BEN.skin.base} shade={BEN.skin.shade} lw={lw} ink={ink} />
      <Part d={tube([[sx * 0.5, 40], [sx * 0.5, 100]], [18, 20])} fill={BEN.skin.base} shade={BEN.skin.shade} lw={lw} ink={ink} />
      <Part d={ell([sx * 0.4, -4], 66, 70)} fill={BEN.skin.base} shade={BEN.skin.shade} lw={lw} sh={[-6, -4]} ink={ink} />
      <FaceFeatures f={f} sx={sx} iris="#3a2a2a" ink={ink} nose={false} eyeX={26} eyeY={-8} />
      {/* snout */}
      <Part d={ell([sx + 2, 30], 30, 20)} fill="#f8c9d4" shade={BEN.skin.shade} lw={lw} ink={ink}>
        <ellipse cx={sx - 10} cy={30} rx={5} ry={7} fill={ink} /><ellipse cx={sx + 14} cy={30} rx={5} ry={7} fill={ink} />
      </Part>
      {/* eye patch + pirate bandana */}
      <path d={`M${-60 + sx},-30 L${50 + sx},-50`} stroke={ink} strokeWidth={3} />
      <Part d={ell([-26 + sx, -8], 16, 17)} fill="#1a1a20" lw={lw * 0.8} ink={ink} />
      <Part d={smooth([[-70 + sx * 0.4, -34], [-56, -78], [0, -94], [56, -78], [70 + sx * 0.4, -34], [0, -42]], true, 0.7)} fill={BEN.bandana} shade="#8e141a" lw={lw} ink={ink}>
        {[-30, 0, 30].map((x) => <circle key={x} cx={x} cy={-66} r={6} fill="#fff" />)}
      </Part>
      <path d={`M${64 + sx * 0.4},-40 q30,10 40,40 q-20,-16 -42,-24`} fill={BEN.bandana} stroke={ink} strokeWidth={lw * 0.8} strokeLinejoin="round" />
    </g>
  );
};

export const benCostume: Costume = {
  skin: BEN.skin, headScale: 1.1,
  leg: (hip, kn, ft, fd, _s, c) => <Leg hip={hip} kn={kn} ft={ft} fd={fd} c={c} w={[26, 22, 18]} cloth={BEN.shorts} clothS="#2e2418" cuff={0.4} shoe="bare" />,
  arm: (sh, el, ha, hk, side, c) => <Arm sh={sh} el={el} ha={ha} hk={hk} side={side} c={c} w={[20, 17, 14]} sleeve={0.4} cloth={BEN.shirt} clothS="#c9c4b4" />,
  torso: (c, T) => {
    const p = c.p;
    return (
      <g>
        <Part d={smooth(seatPts(p, 22, 60))} fill={BEN.shorts} shade="#2e2418" lw={c.lw} ink={c.ink} />
        <Part d={smooth([...T.slice(0, 6), add(p.hipR, [36, 20]), add(p.hipL, [-36, 20]), ...T.slice(8)], true, 0.8)} fill={BEN.shirt} shade="#c9c4b4" lw={c.lw} ink={c.ink}>
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-220,${p.shL[1] + 40 + i * 44} L220,${p.shL[1] + 40 + i * 44}`} stroke={BEN.stripe} strokeWidth={16} />)}
        </Part>
      </g>
    );
  },
  head: (c) => <BenHead face={c.face} turn={c.p.turn} lw={c.lw} ink={c.ink} />,
};
/** tiny: default scale is 0.45 of a person */
export const BigPigBen: React.FC<FigureProps> = ({ s = 0.45, ...props }) => <Figure costume={benCostume} s={s} {...props} />;

/* ====================================== SEA KING ====================================== */

const SK = { base: "#35a58f", shade: "#1d6e68", belly: "#d9efb8", fin: "#e8613a", finS: "#a63a22" };

/**
 * A big cartoon sea-serpent: neck rising from the water at (x,y), head
 * rearing over to the viewer's left. `jaw` opens the mouth (deg), `rise` 0..1
 * lifts it out of the water, `wob` wobbles the neck.
 */
export const SeaKing: React.FC<{ x: number; y: number; s?: number; jaw?: number; rise?: number; wob?: number; lw?: number; flipX?: boolean; face?: "angry" | "shock" | "happy" }> = ({ x, y, s = 1, jaw = 25, rise = 1, wob = 0, lw = 6, flipX, face = "angry" }) => {
  const spine: P[] = [[140, 80], [170, -220 * rise], [110, -520 * rise], [-10, -760 * rise], [-180, -900 * rise], [-330, -930 * rise]].map((p, i) => [p[0] + Math.sin(wob + i) * 12 * (i / 5), p[1]]);
  const neck = spine[spine.length - 1];
  const piv: P = [30, 62];
  return (
    <g transform={`translate(${x},${y}) scale(${flipX ? -s : s},${s})`}>
      {/* dorsal fin */}
      <Part d={smooth([...spine.slice(0, 5).map((p): P => [p[0] + 70, p[1]]), ...spine.slice(0, 5).reverse().map((p, i): P => [p[0] + 130 + 40 * Math.sin(i * 2.1), p[1] + 40])], true, 0.5)} fill={SK.fin} shade={SK.finS} lw={lw} />
      <Part d={tube(spine, [150, 132, 112, 98, 90, 92])} fill={SK.base} shade={SK.shade} lw={lw} sh={[-14, -10]}>
        <path d={smooth(spine.map((p): P => [p[0] - 50, p[1]]), false)} stroke={SK.belly} strokeWidth={60} fill="none" opacity={0.9} />
        {spine.slice(0, 5).map((p, i) => <path key={i} d={`M${p[0] - 90},${p[1] - 30} q40,-20 80,0 M${p[0] - 90},${p[1] + 30} q40,-20 80,0`} stroke={SK.shade} strokeWidth={5} fill="none" opacity={0.5} />)}
      </Part>
      <g transform={`translate(${neck[0]},${neck[1]})`}>
        <Part d={smooth([[60, -80], [100, -200], [30, -160], [40, -270], [-40, -180], [-60, -240], [-100, -140], [-30, -40]], true, 0.4)} fill={SK.fin} shade={SK.finS} lw={lw} />
        <path d={`M30,36 L-396,12 L-340,56 L30,118Z`} fill="#6a1822" stroke={INK} strokeWidth={lw} strokeLinejoin="round" transform={`rotate(${-jaw * 0.5} ${piv[0]} ${piv[1]})`} />
        <g transform={`rotate(${-jaw} ${piv[0]} ${piv[1]})`}>
          <Part d={smooth([[30, 40], [-150, 54], [-330, 54], [-392, 76], [-352, 130], [-170, 142], [30, 126]], true, 0.8)} fill={SK.base} shade={SK.shade} lw={lw} sh={[-8, -10]}>
            <path d="M-370,102 Q-170,130 20,110" stroke={SK.belly} strokeWidth={24} fill="none" opacity={0.9} />
          </Part>
          {Array.from({ length: 6 }, (_, i) => { const bx = -320 + i * 56; return <path key={i} d={`M${bx - 17},58 L${bx + 2},${10 - (i % 2) * 12} L${bx + 17},58Z`} fill="#fffdf2" stroke={INK} strokeWidth={lw * 0.7} strokeLinejoin="round" />; })}
          <path d="M-60,100 Q-150,140 -250,110 Q-150,70 -60,100Z" fill="#e0585a" />
        </g>
        <Part d={smooth([[50, -130], [-90, -168], [-260, -130], [-392, -68], [-424, -14], [-392, 22], [-250, 32], [-100, 42], [50, 66]], true, 0.9)} fill={SK.base} shade={SK.shade} lw={lw} sh={[-10, -12]}>
          <path d="M-420,-20 L-300,-40 M-160,-152 q30,26 10,60 M-30,-152 q30,30 6,70" stroke={SK.shade} strokeWidth={8} fill="none" strokeLinecap="round" />
        </Part>
        {Array.from({ length: 7 }, (_, i) => { const bx = -380 + i * 56; const by = 14 + (bx + 400) * 0.09; return <path key={i} d={`M${bx - 20},${by - 2} L${bx + 3},${by + 52 + (i % 2) * 16} L${bx + 22},${by + 2}Z`} fill="#fffdf2" stroke={INK} strokeWidth={lw * 0.7} strokeLinejoin="round" />; })}
        {[-200, -110, -20].map((cx, i) => <path key={i} d={`M${cx - 30},${-150 + i * 8} L${cx + 6},${-236 + i * 14} L${cx + 34},${-140 + i * 8}Z`} fill={SK.fin} stroke={INK} strokeWidth={lw} strokeLinejoin="round" />)}
        <ellipse cx={-392} cy={-34} rx={14} ry={9} fill={INK} />
        {face === "shock" ? (
          <><ellipse cx={-170} cy={-72} rx={48} ry={40} fill="#fff" stroke={INK} strokeWidth={lw} /><circle cx={-176} cy={-72} r={8} fill={INK} /></>
        ) : (
          <>
            <ellipse cx={-170} cy={-72} rx={46} ry={34} fill="#ffd23a" stroke={INK} strokeWidth={lw} />
            <ellipse cx={-176} cy={-72} rx={9} ry={27} fill={INK} />
            {face === "angry" && <path d="M-234,-124 L-116,-78" stroke={INK} strokeWidth={22} strokeLinecap="round" />}
            {face === "happy" && <path d="M-220,-100 Q-170,-130 -120,-100" stroke={INK} strokeWidth={16} strokeLinecap="round" fill="none" />}
          </>
        )}
      </g>
    </g>
  );
};

/* ====================================== DINOSAUR ====================================== */

const DINO = { base: "#6aa84f", shade: "#3f7a2e", belly: "#d8e6a2", claw: "#f3ecd2" };

/** a cartoon T-rex facing the viewer's left, feet at (x,y). `jaw` opens the mouth, `t` runs the legs (0..1 loop), `lean` tilts the body. */
export const Dino: React.FC<{ x: number; y: number; s?: number; jaw?: number; t?: number; lw?: number; flipX?: boolean; lean?: number; face?: "roar" | "blank" | "shock" }> = ({ x, y, s = 1, jaw = 20, t = 0, lw = 6, flipX, lean = 0, face = "roar" }) => {
  const ph = t * Math.PI * 2;
  const legA = { kn: [60 + Math.sin(ph) * 40, -300] as P, ft: [100 + Math.sin(ph) * 110, -20 + Math.max(0, Math.cos(ph)) * -60] as P };
  const legB = { kn: [60 - Math.sin(ph) * 40, -300] as P, ft: [100 - Math.sin(ph) * 110, -20 + Math.max(0, -Math.cos(ph)) * -60] as P };
  const foot = (ft: P, k: string) => (
    <g key={k} transform={`translate(${ft[0]},${ft[1]})`}>
      <Part d={[smooth([[-70, -40], [40, -46], [60, 0], [40, 22], [-50, 22], [-80, 0]], true, 0.7), ...[-62, -20, 24].map((fx0) => smooth([[fx0 - 14, 6], [fx0 - 26, -20], [fx0 + 16, -16], [fx0 + 18, 10]], true, 0.6))]} fill={DINO.base} shade={DINO.shade} lw={lw} />
      {[-70, -28, 16].map((cx) => <path key={cx} d={`M${cx - 14},6 l-20,22 l26,-6Z`} fill={DINO.claw} stroke={INK} strokeWidth={lw * 0.7} strokeLinejoin="round" />)}
    </g>
  );
  const leg = (L: typeof legA, k: string) => (
    <g key={k}>
      <Part d={tube([[120, -520], L.kn, add(L.ft, [-10, -30])], [110, 70, 50])} fill={DINO.base} shade={DINO.shade} lw={lw} />
      {foot(L.ft, k + "f")}
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${flipX ? -s : s},${s}) rotate(${lean})`}>
      {leg(legB, "b")}
      {/* tail + body */}
      <Part d={smooth([[-120, -620], [100, -700], [300, -640], [520, -500], [760, -420], [980, -400], [760, -380], [540, -400], [320, -330], [120, -380], [-40, -440]], true, 0.6)} fill={DINO.base} shade={DINO.shade} lw={lw} sh={[-14, -10]}>
        <path d="M-60,-470 Q100,-330 320,-350" stroke={DINO.belly} strokeWidth={60} fill="none" />
        {[320, 440, 560, 680].map((bx) => <path key={bx} d={`M${bx},${-320 - (bx - 320) * 0.32} l10,-40`} stroke={DINO.shade} strokeWidth={5} opacity={0.6} />)}
      </Part>
      {/* back spikes */}
      {[-40, 60, 160, 260, 380, 500].map((bx, i) => <path key={i} d={`M${bx - 24},${-660 + i * 24 + Math.max(0, i - 3) * 20} l24,-50 l24,50Z`} fill={DINO.shade} stroke={INK} strokeWidth={lw * 0.8} strokeLinejoin="round" />)}
      {/* tiny arms */}
      <Part d={[tube([[-30, -560], [-100, -540], [-120, -500]], [26, 22, 18]), tube([[-20, -600], [-90, -590], [-130, -560]], [26, 22, 18])]} fill={DINO.base} shade={DINO.shade} lw={lw} />
      {[[-124, -500], [-134, -560]].map(([cx, cy], i) => <path key={i} d={`M${cx},${cy} l-26,10 l20,8 M${cx},${cy} l-18,20`} stroke={DINO.claw} strokeWidth={6} strokeLinecap="round" fill="none" />)}
      {leg(legA, "a")}
      {/* neck + head */}
      <Part d={tube([[-60, -640], [-180, -800], [-300, -870]], [100, 90, 80])} fill={DINO.base} shade={DINO.shade} lw={lw} />
      <g transform="translate(-300,-870)">
        {/* mouth interior */}
        <path d={`M40,30 L-360,30 L-340,60 L40,80Z`} fill="#6a1822" stroke={INK} strokeWidth={lw} strokeLinejoin="round" transform={`rotate(${-jaw * 0.5} 40 40)`} />
        <g transform={`rotate(${-jaw} 40 40)`}>
          <Part d={smooth([[40, 40], [-200, 44], [-350, 48], [-370, 90], [-320, 130], [-160, 136], [40, 120]], true, 0.8)} fill={DINO.base} shade={DINO.shade} lw={lw} sh={[-8, -10]} />
          {Array.from({ length: 6 }, (_, i) => { const bx = -320 + i * 60; return <path key={i} d={`M${bx - 16},52 L${bx + 2},${12 - (i % 2) * 10} L${bx + 16},52Z`} fill="#fffdf2" stroke={INK} strokeWidth={lw * 0.7} strokeLinejoin="round" />; })}
          <path d="M-80,100 Q-180,130 -280,100 Q-180,80 -80,100Z" fill="#e0585a" />
        </g>
        <Part d={smooth([[60, -120], [-60, -160], [-240, -140], [-370, -90], [-400, -30], [-370, 24], [-200, 34], [-40, 44], [60, 60]], true, 0.9)} fill={DINO.base} shade={DINO.shade} lw={lw} sh={[-10, -12]}>
          <path d="M-390,-40 q20,-8 40,0" stroke={DINO.shade} strokeWidth={6} fill="none" />
        </Part>
        {Array.from({ length: 7 }, (_, i) => { const bx = -350 + i * 60; return <path key={i} d={`M${bx - 18},18 L${bx + 2},${70 + (i % 2) * 16} L${bx + 20},22Z`} fill="#fffdf2" stroke={INK} strokeWidth={lw * 0.7} strokeLinejoin="round" />; })}
        <ellipse cx={-370} cy={-40} rx={12} ry={8} fill={INK} />
        {face === "shock" ? (
          <><ellipse cx={-180} cy={-70} rx={44} ry={40} fill="#fff" stroke={INK} strokeWidth={lw} /><circle cx={-186} cy={-70} r={8} fill={INK} /></>
        ) : (
          <>
            <ellipse cx={-180} cy={-70} rx={40} ry={32} fill="#ffd23a" stroke={INK} strokeWidth={lw} />
            <ellipse cx={-186} cy={-70} rx={9} ry={24} fill={INK} />
            {face === "roar" && <path d="M-240,-116 L-130,-84" stroke={INK} strokeWidth={20} strokeLinecap="round" />}
          </>
        )}
      </g>
    </g>
  );
};

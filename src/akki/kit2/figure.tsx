import React, { useId } from "react";
import { INK } from "../common";
import { add, ang, Foot, Hand, HandKind, mix, mul, nrm, P, Part, ShoeKind, Skin, sub, tube } from "./draw";
import { Pose } from "./pose";

/**
 * The figure engine. A character is a `Costume`: a set of drawing functions
 * (legs, arms, torso, head, things behind/in front) that the `Figure`
 * component calls in the right z-order for a pose:
 *
 *   contact shadow → behind → back arms → back leg → front leg → torso →
 *   head → front arms → front
 *
 * Limbs are tapered tubes with a real bend; sleeves and boot shafts are
 * tubes over the same joints so clothes follow the body.
 */

export type Ctx = { p: Pose; lw: number; skin: Skin; ink: string; face: string; drained: boolean };

export type Costume = {
  skin: Skin;
  /** thick-thin limb radii: [upper, joint, lower] */
  armW?: [number, number, number];
  legW?: [number, number, number];
  headScale?: number;
  behind?: (c: Ctx) => React.ReactNode;
  leg: (hip: P, kn: P, ft: P, fd: number, side: -1 | 1, c: Ctx) => React.ReactNode;
  arm: (sh: P, el: P, ha: P, hk: HandKind, side: -1 | 1, c: Ctx) => React.ReactNode;
  torso: (c: Ctx, T: P[]) => React.ReactNode;
  head: (c: Ctx) => React.ReactNode;
  front?: (c: Ctx) => React.ReactNode;
};

/** torso outline points: [shL, neckL, neckR, shR, pitR, waistR, hipR, hipL, waistL, pitL] */
export const torsoPts = (p: Pose, waistIn = 0.18, hipOut = 14): P[] => {
  const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
  const mid = mix(midS, midH, 0.62);
  const wl = mix(mix(p.shL, p.hipL, 0.62), mid, waistIn), wr = mix(mix(p.shR, p.hipR, 0.62), mid, waistIn);
  const across = nrm(sub(p.hipR, p.hipL));
  const up = nrm(sub(midS, midH));
  const pitL = add(mix(p.shL, p.hipL, 0.2), mul(across, 6)), pitR = sub(mix(p.shR, p.hipR, 0.2), mul(across, 6));
  const nl = add(p.neck, add(mul(across, -32), mul(up, -18))), nr = add(p.neck, add(mul(across, 32), mul(up, -18)));
  return [p.shL, nl, nr, p.shR, pitR, wr, add(p.hipR, mul(across, hipOut)), add(p.hipL, mul(across, -hipOut)), wl, pitL];
};

/** unit vectors across the hips and down the body for a pose */
export const frameOf = (p: Pose): { across: P; down: P } => {
  const across = nrm(sub(p.hipR, p.hipL));
  return { across, down: [-across[1], across[0]] };
};

/** the seat/crotch between the two leg tops, so trousers read as one garment */
export const seatPts = (p: Pose, out = 20, drop = 70): P[] => {
  const { across, down } = frameOf(p);
  const mid = mix(p.hipL, p.hipR, 0.5);
  return [add(p.hipL, mul(across, -out)), add(p.hipR, mul(across, out)), add(add(p.hipR, mul(across, out * 0.6)), mul(down, drop * 0.8)), add(mid, mul(down, drop)), add(add(p.hipL, mul(across, -out * 0.6)), mul(down, drop * 0.8))];
};

export const armDir = (el: P, ha: P) => ang(el, ha);
export const Wrap: React.FC<{ x: number; y: number; s: number; flipX?: boolean; children: React.ReactNode }> = ({ x, y, s, flipX, children }) => (
  <g transform={`translate(${x},${y}) scale(${flipX ? -s : s},${s})`}>{children}</g>
);

/** soft contact shadow on the ground under a figure (body space) */
export const ContactShadow: React.FC<{ x?: number; y?: number; w?: number; h?: number; o?: number }> = ({ x = 0, y = 0, w = 150, h = 26, o = 0.45 }) => {
  const id = "sh" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <g>
      <defs><radialGradient id={id}><stop offset="0" stopColor="#000" stopOpacity={o} /><stop offset="0.6" stopColor="#000" stopOpacity={o * 0.5} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={x} cy={y} rx={w} ry={h} fill={`url(#${id})`} />
    </g>
  );
};

/* ------------------------------ limb helpers ------------------------------ */

/** a bare or trousered leg + shoe. `cuff` (0..1) is where the trouser ends down the shin; 1 = full length */
export const Leg: React.FC<{ hip: P; kn: P; ft: P; fd: number; c: Ctx; w?: [number, number, number]; cloth?: string; clothS?: string; cuff?: number; shoe: ShoeKind; shoeC?: string; shoeS?: string; bootTop?: number; sock?: string }> = ({ hip, kn, ft, fd, c, w = [30, 25, 20], cloth, clothS, cuff = 1, shoe, shoeC, shoeS, bootTop, sock }) => {
  const ankle = mix(kn, ft, 0.9);
  return (
    <g>
      <Part d={tube([hip, kn, ankle], w)} fill={c.skin.base} shade={c.skin.shade} lw={c.lw} ink={c.ink} />
      <Foot ft={ft} fd={fd} kind={shoe} c={shoeC} cs={shoeS} skin={c.skin} lw={c.lw} ink={c.ink} />
      {sock && <Part d={tube([mix(kn, ft, 0.55), ankle], [w[2] + 2, w[2] + 2])} fill={sock} lw={c.lw} ink={c.ink} />}
      {bootTop !== undefined && <Part d={tube([mix(kn, ft, bootTop), add(ft, [0, 2])], [w[2] + 4, w[2] + 3])} fill={shoeC ?? "#1a1a20"} shade={shoeS ?? "#0a0a0e"} lw={c.lw} ink={c.ink} />}
      {cloth && cuff > 0 && (
        cuff >= 1
          ? <Part d={tube([hip, kn, mix(kn, ft, 0.82)], [w[0] + 6, w[1] + 5, w[2] + 5])} fill={cloth} shade={clothS} lw={c.lw} ink={c.ink} />
          : cuff > 0.5
            ? <Part d={tube([hip, kn, mix(kn, ft, (cuff - 0.5) * 2)], [w[0] + 6, w[1] + 6, w[2] + 7])} fill={cloth} shade={clothS} lw={c.lw} ink={c.ink} />
            : <Part d={tube([hip, mix(hip, kn, cuff * 2)], [w[0] + 8, w[0] + 9])} fill={cloth} shade={clothS} lw={c.lw} ink={c.ink} />
      )}
    </g>
  );
};

/** an arm: skin tube, optional sleeve to `sleeve` (0..1 of the way down, 1 = to the wrist), hand */
export const Arm: React.FC<{ sh: P; el: P; ha: P; hk: HandKind; side: -1 | 1; c: Ctx; w?: [number, number, number]; sleeve?: number; cloth?: string; clothS?: string; cuff?: string; handS?: number; children?: React.ReactNode }> = ({ sh, el, ha, hk, side, c, w = [22, 18, 15], sleeve = 0, cloth, clothS, cuff, handS = 1.15, children }) => {
  const dir = armDir(el, ha);
  const wrist = mix(el, ha, 0.92);
  return (
    <g>
      {hk !== "pocket" && <Part d={tube([sh, el, wrist], w)} fill={c.skin.base} shade={c.skin.shade} lw={c.lw} ink={c.ink} />}
      {cloth && sleeve > 0 && (
        sleeve >= 1
          ? <Part d={tube([sh, el, hk === "pocket" ? ha : mix(el, ha, 0.86)], [w[0] + 6, w[1] + 5, w[2] + 5])} fill={cloth} shade={clothS} lw={c.lw} ink={c.ink}>{cuff && <path d={`M${mix(el, ha, 0.78).join(",")} L${mix(el, ha, 0.86).join(",")}`} stroke={cuff} strokeWidth={w[2] * 2 + 12} />}</Part>
          : sleeve > 0.5
            ? <Part d={tube([sh, el, mix(el, ha, (sleeve - 0.5) * 2)], [w[0] + 6, w[1] + 5, w[2] + 6])} fill={cloth} shade={clothS} lw={c.lw} ink={c.ink} />
            : <Part d={tube([add(sh, mul(nrm(sub(sh, el)), 10)), mix(sh, el, sleeve * 2)], [w[0] + 8, w[0] + 8])} fill={cloth} shade={clothS} lw={c.lw} ink={c.ink} />
      )}
      {children}
      {hk !== "pocket" && <Hand at={ha} dir={dir} kind={hk} skin={c.skin} lw={c.lw} flip={side < 0} s={handS} ink={c.ink} />}
    </g>
  );
};

/* ---------------------------------- Figure --------------------------------- */

export type FigureProps = {
  pose: Pose; face?: string; x?: number; y?: number; s?: number; flipX?: boolean; lw?: number;
  shadow?: boolean; shadowW?: number; drained?: boolean; children?: React.ReactNode;
  /** z-order inside a <Characters> layer (lower = further back) */
  z?: number;
};

export const Figure: React.FC<FigureProps & { costume: Costume }> = ({ costume: K, pose: p, face = "", x = 0, y = 0, s = 1, flipX, lw = 4.5, shadow = true, shadowW, drained = false, children }) => {
  const c: Ctx = { p, lw, skin: drained ? { base: "#eef0f3", shade: "#c3c8d2" } : K.skin, ink: drained ? "#5a5e68" : INK, face, drained };
  const T = torsoPts(p);
  const hL = p.hL ?? "relax", hR = p.hR ?? "relax";
  const legL = K.leg(p.hipL, p.knL, p.ftL, p.fdL ?? 0, -1, c);
  const legR = K.leg(p.hipR, p.knR, p.ftR, p.fdR ?? 0, 1, c);
  const groundX = (p.ftL[0] + p.ftR[0]) / 2, groundY = Math.max(p.ftL[1], p.ftR[1]) + 12;
  return (
    <Wrap x={x} y={y} s={s} flipX={flipX}>
      {shadow && <ContactShadow x={groundX} y={groundY} w={shadowW ?? Math.max(120, Math.abs(p.ftL[0] - p.ftR[0]) * 0.8 + 90)} />}
      {K.behind?.(c)}
      {p.backL && K.arm(p.shL, p.elL, p.haL, hL, -1, c)}
      {p.backR && K.arm(p.shR, p.elR, p.haR, hR, 1, c)}
      {p.legRBack ? <>{legR}{legL}</> : <>{legL}{legR}</>}
      {K.torso(c, T)}
      <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(${K.headScale ?? 1.28})`}>{K.head(c)}</g>
      {!p.backL && K.arm(p.shL, p.elL, p.haL, hL, -1, c)}
      {!p.backR && K.arm(p.shR, p.elR, p.haR, hR, 1, c)}
      {K.front?.(c)}
      {children}
    </Wrap>
  );
};

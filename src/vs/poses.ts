import * as THREE from "three";
import { D2R, H, lerp, V, W } from "./kit";
import { Pose } from "./rig";

/** The move library: each returns a pose for local frame t (30 fps). */

/** blend two poses (numbers and tuples lerp; face snaps at the midpoint) */
export const mix = (a: Pose, b: Pose, u: number): Pose => {
  const out: Record<string, unknown> = { ...a };
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  keys.forEach((k) => {
    const x = (a as Record<string, unknown>)[k], y = (b as Record<string, unknown>)[k];
    if (k === "face") { out[k] = u < 0.5 ? x ?? y : y ?? x; return; }
    if (typeof x === "number" || typeof y === "number") { out[k] = lerp((x as number) ?? 0, (y as number) ?? 0, u); return; }
    if (Array.isArray(x) || Array.isArray(y)) {
      const xa = (x as number[]) ?? (y as number[]).map(() => 0), ya = (y as number[]) ?? xa;
      out[k] = xa.map((v, i) => lerp(v ?? 0, ya[i] ?? 0, u));
    }
  });
  return out as Pose;
};

/** rotate a character-local offset into the world */
export const toWorld = (at: V, yawDeg: number, l: V, scale = 1): V => {
  const c = Math.cos(yawDeg * D2R), s = Math.sin(yawDeg * D2R);
  const x = l[0] * scale, y = l[1] * scale, z = l[2] * scale;
  return [at[0] + x * c + z * s, at[1] + y, at[2] - x * s + z * c];
};
/** yaw (deg) that faces from a to b on the floor */
export const face = (a: V, b: V) => Math.atan2(b[0] - a[0], b[2] - a[2]) / D2R;

/** parabola from p to q peaking h above the straight line */
export const arc = (p: V, q: V, h: number, u: number): V => [lerp(p[0], q[0], u), lerp(p[1], q[1], u) + h * 4 * u * (1 - u), lerp(p[2], q[2], u)];

/** screen position of a world point for a camera, for pinning 2D tags */
export const project = (cam: { pos: V; look: V; fov: number }, p: V): [number, number] => {
  const c = new THREE.PerspectiveCamera(cam.fov, W / H, 0.05, 900);
  c.position.set(...cam.pos); c.lookAt(...cam.look); c.updateMatrixWorld(); c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x + 1) * 0.5 * W, (1 - v.y) * 0.5 * H];
};

/* ------------------------------------------------------------------ LeBron */

export const LB_SCALE = 1.07;
export const DRIB = 16; // frames per bounce

/** right-hand dribble on the spot (or on the move): the pose, and the ball in character-local space */
export const dribble = (t: number, base: Pose = {}, speed = 1): { pose: Pose; ball: V } => {
  const ph = ((t * speed) % DRIB) / DRIB;
  const h = Math.abs(Math.cos(Math.PI * ph)); // 1 at the hand, 0 at the floor
  const y = 0.13 + 0.78 * h;
  return { pose: { knL: 22, knR: 22, hipL: [18, 6], hipR: [18, 6], lean: 14, shL: [20, 20], elL: 40, ...base, shR: [18 + 26 * h, 14], elR: 30 + 20 * h, face: base.face ?? "focus" }, ball: [-0.34, y / LB_SCALE, 0.4] };
};

export const run = (t: number, rate = 0.55, extra: Pose = {}): Pose => {
  const w = t * rate, s = Math.sin(w);
  return { lean: 14, hipL: [38 * s, 4], hipR: [-38 * s, 4], knL: 22 + 46 * Math.max(0, -s), knR: 22 + 46 * Math.max(0, s), shL: [-34 * s, 10], shR: [34 * s, 10], elL: 60, elR: 60, y: 0.05 * Math.abs(Math.cos(w)), face: "focus", ...extra };
};

export const walk = (t: number, extra: Pose = {}): Pose => {
  const s = Math.sin(t * 0.32);
  return { lean: 4, hipL: [22 * s, 3], hipR: [-22 * s, 3], knL: 8 + 20 * Math.max(0, -s), knR: 8 + 20 * Math.max(0, s), shL: [-16 * s, 8], shR: [16 * s, 8], elL: 20, elR: 20, ...extra };
};

export const LB = {
  stand: { shL: [2, 8], shR: [2, 8], elL: 10, elR: 10 } as Pose,
  crossed: { shL: [32, 6], shR: [32, 6], elL: 118, elR: 118, twL: -62, twR: 62, face: "smirk" } as Pose,
  flex: { shL: [0, 84], shR: [0, 84], twL: 90, twR: -90, elL: 112, elR: 112, face: "grin", knL: 6, knR: 6 } as Pose,
  tpose: { shL: [0, 88], shR: [0, 88], elL: 0, elR: 0, face: "plain" } as Pose,
  shock: { shL: [26, 22], shR: [26, 22], elL: 70, elR: 70, twL: -30, twR: 30, face: "shock", lean: -6, head: [-4, 0] } as Pose,
  overhead: { shL: [168, 12], shR: [168, 12], elL: 52, elR: 52, face: "focus", knL: 10, knR: 10, hipL: [6, 4], hipR: [6, 4] } as Pose,
  facepalm: { shR: [118, -6], elR: 128, twR: 28, shL: [6, 10], elL: 10, head: [14, 0], face: "plain" } as Pose,
  shrug: { shL: [30, 34], shR: [30, 34], elL: 78, elR: 78, twL: 40, twR: -40, face: "shock", head: [-6, 0, 8] } as Pose,
  celebrate: { shL: [150, 55], shR: [150, 55], elL: 20, elR: 20, face: "shout", head: [-14, 0], lean: -8 } as Pose,
  duck: { lean: 38, hipL: [62, 10], hipR: [62, 10], knL: 84, knR: 84, shL: [40, 10], shR: [40, 10], elL: 90, elR: 90, face: "shock", head: [-30, 0] } as Pose,
};
/** where the ball sits in LB.overhead, character-local */
export const OVERHEAD_BALL: V = [0, 2.42 / LB_SCALE, 0.16];

/* ------------------------------------------------------------------ the gorilla */

export const GO_SCALE = 1.12;

export const GO = {
  stand: { lean: 10, shL: [6, 14], shR: [6, 14], elL: 16, elR: 16, hipL: [10, 10], hipR: [10, 10], knL: 18, knR: 18 } as Pose,
  tall: { lean: -4, shL: [10, 22], shR: [10, 22], elL: 30, elR: 30, hipL: [4, 10], hipR: [4, 10], knL: 8, knR: 8, face: "plain" } as Pose,
  knuckle: { lean: 55, shL: [55, 12], shR: [55, 12], elL: 0, elR: 0, hipL: [50, 12], hipR: [50, 12], knL: 62, knR: 62, head: [-45, 0], face: "plain" } as Pose,
  tpose: { lean: -2, shL: [0, 86], shR: [0, 86], elL: 0, elR: 0, hipL: [4, 10], hipR: [4, 10], knL: 8, knR: 8, face: "plain" } as Pose,
  hold: { lean: 4, shL: [70, 20], shR: [70, 20], elL: 72, elR: 72, twL: -24, twR: 24, hipL: [8, 10], hipR: [8, 10], knL: 14, knR: 14, head: [8, 0], face: "plain" } as Pose,
  sit: { lean: -14, hipL: [88, 22], hipR: [88, 22], knL: 80, knR: 80, shL: [14, 24], shR: [14, 24], elL: 30, elR: 30, face: "dazed", head: [6, 0, 14] } as Pose,
};

/** both fists beating the chest, alternating */
export const chestBeat = (t: number, extra: Pose = {}): Pose => {
  const a = (Math.sin(t * 0.85) + 1) / 2, b = 1 - a;
  return { ...GO.tall, shL: [54 + 32 * a, 26], shR: [54 + 32 * b, 26], elL: 104, elR: 104, twL: -36, twR: 36, head: [-14, 0], face: "shout", ...extra };
};

export const gallop = (t: number, rate = 0.7): Pose => {
  const w = t * rate, s = Math.sin(w);
  return { ...GO.knuckle, lean: 52 + 6 * s, shL: [55 + 34 * s, 12], shR: [55 + 34 * Math.sin(w + 0.7), 12], hipL: [50 - 26 * s, 12], hipR: [50 - 26 * Math.sin(w + 0.7), 12], y: 0.14 * Math.abs(Math.cos(w)), face: "shout" };
};

/** an upright, side-to-side waddle carrying something at the chest */
export const waddle = (t: number): Pose => {
  const s = Math.sin(t * 0.36);
  return { ...GO.hold, side: 9 * s, hipL: [8 + 16 * s, 12], hipR: [8 - 16 * s, 12], knL: 16 + 14 * Math.max(0, -s), knR: 16 + 14 * Math.max(0, s), y: 0.03 * Math.abs(s), face: "plain", head: [0, 0, -6 * s] };
};
/** the ball held in GO.hold / waddle, character-local */
export const HOLD_BALL: V = [0, 1.3, 0.46];

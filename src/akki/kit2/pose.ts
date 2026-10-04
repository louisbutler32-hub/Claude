import { HandKind, mix, P } from "./draw";

/**
 * The pose skeleton. Body space: feet on y=0, figure ~1000 units tall,
 * +x is the viewer's right. "L" is the limb on the viewer's left. Field
 * names match the old kit's Pose so existing lerpPose-style code blends.
 *
 * Every pose has a real bend at elbow and knee — straight limbs are what
 * made the old kit look like sticks.
 */
export type Pose = {
  head: P; tilt: number; turn: number;
  neck: P;
  shL: P; elL: P; haL: P; shR: P; elR: P; haR: P;
  hipL: P; knL: P; ftL: P; hipR: P; knR: P; ftR: P;
  hL?: HandKind; hR?: HandKind;
  /** foot directions: -1 points left, 1 right, 0 toward camera */
  fdL?: number; fdR?: number;
  /** draw this arm behind the torso */
  backL?: boolean; backR?: boolean;
  /** draw the viewer's-right leg behind the left one */
  legRBack?: boolean;
  /** lean of the whole torso drawn as a hint for costumes (deg) — optional */
  lean?: number;
};

export const STAND: Pose = {
  head: [0, -896], tilt: 0, turn: 0, neck: [0, -812],
  shL: [-100, -784], elL: [-132, -612], haL: [-122, -462],
  shR: [100, -784], elR: [132, -612], haR: [122, -462],
  hipL: [-54, -478], knL: [-60, -250], ftL: [-70, -12],
  hipR: [54, -478], knR: [60, -250], ftR: [70, -12],
  hL: "relax", hR: "relax", fdL: 0, fdR: 0,
};

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => {
  const o: Record<string, unknown> = { ...(t < 0.5 ? a : b) };
  for (const k of Object.keys(a) as (keyof Pose)[]) {
    const va = a[k], vb = b[k];
    if (Array.isArray(va) && Array.isArray(vb)) o[k] = mix(va as P, vb as P, t);
    else if (typeof va === "number" && typeof vb === "number") o[k] = va + (vb - va) * t;
  }
  return o as Pose;
};
/** build a pose from a base with overrides */
export const pose = (o: Partial<Pose>, base: Pose = STAND): Pose => ({ ...base, ...o });
/** shift a whole pose */
export const shiftPose = (p: Pose, d: P): Pose => {
  const o = { ...p } as Record<string, unknown>;
  for (const k of Object.keys(p) as (keyof Pose)[]) { const v = p[k]; if (Array.isArray(v)) o[k] = [v[0] + d[0], v[1] + d[1]]; }
  return o as Pose;
};
/** mirror a pose left-right (swap limbs and negate x) — turns a walk frame into its other half */
export const swapSides = (p: Pose): Pose => {
  const m = (v: P): P => [-v[0], v[1]];
  return {
    head: m(p.head), tilt: -p.tilt, turn: -p.turn, neck: m(p.neck),
    shL: m(p.shR), elL: m(p.elR), haL: m(p.haR), shR: m(p.shL), elR: m(p.elL), haR: m(p.haL),
    hipL: m(p.hipR), knL: m(p.knR), ftL: m(p.ftR), hipR: m(p.hipL), knR: m(p.knL), ftR: m(p.ftL),
    hL: p.hR, hR: p.hL, fdL: p.fdR === undefined ? undefined : -p.fdR, fdR: p.fdL === undefined ? undefined : -p.fdL,
    backL: p.backR, backR: p.backL, legRBack: p.legRBack === undefined ? undefined : !p.legRBack, lean: p.lean === undefined ? undefined : -p.lean,
  };
};
/** swap which limbs are L/R without mirroring space (for cycles that keep facing one way) */
export const swapLimbs = (p: Pose): Pose => ({
  ...p,
  shL: p.shR, elL: p.elR, haL: p.haR, shR: p.shL, elR: p.elL, haR: p.haL,
  hipL: p.hipR, knL: p.knR, ftL: p.ftR, hipR: p.hipL, knR: p.knL, ftR: p.ftL,
  hL: p.hR, hR: p.hL, fdL: p.fdR, fdR: p.fdL, backL: p.backR, backR: p.backL,
  legRBack: p.legRBack === undefined ? undefined : !p.legRBack,
});

/* ---------------------------------- the library --------------------------------- */

/** facing the viewer's right, a touch of three-quarter */
const FACE_R = { turn: 0.9 };

/** walk cycle, 4 drawings for one step (contact, down, pass, up) — the figure faces +x; mirror with swapLimbs for the other step */
export const WALK: Pose[] = [
  pose({ ...FACE_R, head: [14, -890], neck: [10, -808], shL: [-70, -786], shR: [86, -786],
    hipL: [-20, -478], knL: [60, -262], ftL: [96, -14], fdL: 1,
    hipR: [20, -478], knR: [-40, -270], ftR: [-90, -6], fdR: 1, legRBack: true,
    elL: [-110, -630], haL: [-110, -470], elR: [150, -640], haR: [150, -520], hL: "relax", hR: "fist", backL: true }),
  pose({ ...FACE_R, head: [18, -878], neck: [12, -796], shL: [-70, -774], shR: [86, -774],
    hipL: [-18, -466], knL: [30, -250], ftL: [52, -14], fdL: 1,
    hipR: [18, -466], knR: [-26, -248], ftR: [-50, -24], fdR: 1, legRBack: true,
    elL: [-96, -620], haL: [-70, -470], elR: [140, -630], haR: [128, -500], hL: "relax", hR: "fist", backL: true }),
  pose({ ...FACE_R, head: [20, -900], neck: [14, -816], shL: [-70, -792], shR: [86, -792],
    hipL: [-14, -484], knL: [0, -258], ftL: [8, -14], fdL: 1,
    hipR: [14, -484], knR: [40, -300], ftR: [0, -80], fdR: 1, legRBack: true,
    elL: [-100, -624], haL: [-40, -500], elR: [122, -624], haR: [90, -480], hL: "relax", hR: "fist", backL: true }),
  pose({ ...FACE_R, head: [16, -894], neck: [12, -810], shL: [-70, -788], shR: [86, -788],
    hipL: [-14, -480], knL: [-20, -254], ftL: [-50, -10], fdL: 1,
    hipR: [14, -480], knR: [80, -300], ftR: [70, -56], fdR: 1, legRBack: true,
    elL: [-120, -640], haL: [-96, -520], elR: [116, -612], haR: [60, -470], hL: "fist", hR: "relax", backL: true }),
];

/** run cycle, 4 drawings — bigger stride, lean, a flight frame */
export const RUN: Pose[] = [
  pose({ ...FACE_R, head: [70, -870], tilt: 8, neck: [56, -790], shL: [-40, -772], shR: [120, -772], lean: 12,
    hipL: [-10, -470], knL: [120, -300], ftL: [150, -20], fdL: 1,
    hipR: [20, -470], knR: [-80, -330], ftR: [-150, -140], fdR: 1, legRBack: true,
    elL: [-130, -690], haL: [-150, -560], elR: [210, -740], haR: [190, -620], hL: "fist", hR: "fist", backL: true }),
  pose({ ...FACE_R, head: [76, -850], tilt: 8, neck: [60, -772], shL: [-36, -756], shR: [124, -756], lean: 12,
    hipL: [-6, -456], knL: [60, -250], ftL: [60, -14], fdL: 1,
    hipR: [20, -456], knR: [-20, -300], ftR: [-120, -70], fdR: 1, legRBack: true,
    elL: [-100, -660], haL: [-70, -540], elR: [200, -700], haR: [150, -590], hL: "fist", hR: "fist", backL: true }),
  pose({ ...FACE_R, head: [80, -900], tilt: 8, neck: [64, -820], shL: [-30, -802], shR: [130, -802], lean: 12,
    hipL: [0, -500], knL: [-60, -340], ftL: [-130, -160], fdL: 1,
    hipR: [24, -500], knR: [140, -330], ftR: [160, -60], fdR: 1, legRBack: false,
    elL: [-110, -720], haL: [-130, -600], elR: [220, -760], haR: [200, -650], hL: "fist", hR: "fist", backL: true }),
  pose({ ...FACE_R, head: [78, -876], tilt: 8, neck: [62, -796], shL: [-34, -780], shR: [126, -780], lean: 12,
    hipL: [4, -480], knL: [-10, -300], ftL: [-100, -90], fdL: 1,
    hipR: [24, -480], knR: [70, -250], ftR: [70, -14], fdR: 1, legRBack: false,
    elL: [-60, -680], haL: [-10, -560], elR: [190, -720], haR: [120, -600], hL: "fist", hR: "fist", backL: true }),
];

/** blend through a looping list of keyframes; t in 0..1 is one loop (walk = one step, so a full stride is t 0..2 with swapLimbs on the second half) */
export const cycle = (frames: Pose[], t: number): Pose => {
  const n = frames.length;
  const u = ((t % 1) + 1) % 1 * n;
  const i = Math.floor(u), f = u - i;
  return lerpPose(frames[i % n], frames[(i + 1) % n], f);
};
/** a full stride: t 0..1 covers both steps */
export const walkCycle = (t: number): Pose => { const u = ((t % 1) + 1) % 1; return u < 0.5 ? cycle(WALK, u * 2) : swapLimbs(cycle(WALK, (u - 0.5) * 2)); };
export const runCycle = (t: number): Pose => { const u = ((t % 1) + 1) % 1; return u < 0.5 ? cycle(RUN, u * 2) : swapLimbs(cycle(RUN, (u - 0.5) * 2)); };

export const POINT: Pose = pose({
  turn: 0.8, head: [10, -894], neck: [6, -812],
  shL: [-98, -784], elL: [-140, -620], haL: [-120, -470], hL: "fist",
  shR: [100, -784], elR: [220, -720], haR: [340, -690], hR: "point",
  hipL: [-60, -478], knL: [-70, -250], ftL: [-90, -12], hipR: [54, -478], knR: [80, -256], ftR: [96, -12], fdR: 1, fdL: -0.5,
});

export const ARMS_FOLDED: Pose = pose({
  head: [0, -894], tilt: -3, neck: [0, -812],
  shL: [-102, -782], elL: [-150, -650], haL: [60, -620], hL: "fist",
  shR: [102, -782], elR: [150, -650], haR: [-60, -640], hR: "fist", backR: false,
  hipL: [-56, -478], knL: [-72, -250], ftL: [-90, -12], hipR: [56, -478], knR: [72, -250], ftR: [90, -12],
});

export const SHRUG: Pose = pose({
  head: [0, -880], tilt: 6, neck: [0, -800],
  shL: [-104, -810], elL: [-190, -690], haL: [-220, -600], hL: "open",
  shR: [104, -810], elR: [190, -690], haR: [220, -600], hR: "open",
  hipL: [-56, -478], knL: [-66, -250], ftL: [-80, -12], hipR: [56, -478], knR: [66, -250], ftR: [80, -12], fdL: -0.6, fdR: 0.6,
});

export const COWER: Pose = pose({
  head: [-10, -700], tilt: -14, neck: [-6, -630],
  shL: [-96, -610], elL: [-170, -520], haL: [-110, -680], hL: "spread",
  shR: [90, -610], elR: [170, -520], haR: [100, -690], hR: "spread",
  hipL: [-70, -360], knL: [-150, -250], ftL: [-110, -12], hipR: [60, -360], knR: [140, -250], ftR: [120, -12], fdL: -0.7, fdR: 0.7,
});

/** flat on his back, head to the viewer's left */
export const COLLAPSE: Pose = pose({
  head: [-470, -110], tilt: -92, turn: 0.2, neck: [-400, -100],
  shL: [-340, -140], elL: [-240, -200], haL: [-150, -170], hL: "open", backL: true,
  shR: [-340, -56], elR: [-200, -40], haR: [-60, -70], hR: "open",
  hipL: [-20, -120], knL: [170, -170], ftL: [330, -90], fdL: 1,
  hipR: [-20, -56], knR: [160, -70], ftR: [330, -40], fdR: 1,
});

/** sat on something at knee height, facing the viewer's right */
export const SIT: Pose = pose({
  turn: 0.7, head: [20, -840], tilt: 4, neck: [14, -760],
  shL: [-84, -736], elL: [-60, -600], haL: [60, -530], hL: "relax",
  shR: [100, -736], elR: [150, -610], haR: [130, -520], hR: "relax",
  hipL: [-50, -440], knL: [150, -420], ftL: [170, -12], fdL: 1,
  hipR: [10, -440], knR: [200, -400], ftR: [220, -12], fdR: 1, legRBack: true,
});

/** a sword lunge to the right */
export const LUNGE: Pose = pose({
  turn: 1, head: [150, -820], tilt: 10, neck: [120, -748], lean: 20,
  shL: [10, -730], elL: [-80, -620], haL: [-160, -560], hL: "hold", backL: true,
  shR: [190, -730], elR: [320, -700], haR: [440, -650], hR: "hold",
  hipL: [-40, -440], knL: [-200, -280], ftL: [-320, -12], fdL: 1, legRBack: false,
  hipR: [60, -440], knR: [260, -340], ftR: [320, -12], fdR: 1,
});

export const CELEBRATE: Pose = pose({
  head: [0, -900], tilt: -6, neck: [0, -816],
  shL: [-104, -796], elL: [-200, -900], haL: [-160, -1060], hL: "fist",
  shR: [104, -796], elR: [200, -900], haR: [160, -1060], hR: "fist",
  hipL: [-56, -478], knL: [-110, -250], ftL: [-150, -12], hipR: [56, -478], knR: [110, -250], ftR: [150, -12], fdL: -0.6, fdR: 0.6,
});

/** hauling something behind, leaning into it, walking right */
export const DRAG: Pose = pose({
  turn: 0.9, head: [60, -880], tilt: 10, neck: [40, -800], lean: 14,
  shL: [-50, -784], elL: [-170, -700], haL: [-240, -640], hL: "hold", backL: true,
  shR: [110, -784], elR: [20, -720], haR: [-120, -660], hR: "hold",
  hipL: [-20, -478], knL: [80, -262], ftL: [110, -14], fdL: 1,
  hipR: [20, -478], knR: [-40, -270], ftR: [-110, -8], fdR: 1, legRBack: true,
});

export const POSES = {
  stand: STAND, walk1: WALK[0], walk2: WALK[1], walk3: WALK[2], walk4: WALK[3],
  run1: RUN[0], run2: RUN[1], run3: RUN[2], run4: RUN[3],
  point: POINT, armsFolded: ARMS_FOLDED, shrug: SHRUG, cower: COWER, collapse: COLLAPSE, sit: SIT, lunge: LUNGE, celebrate: CELEBRATE, drag: DRAG,
} as const;
export type PoseName = keyof typeof POSES;

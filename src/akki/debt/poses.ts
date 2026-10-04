import { pose, POSES, Pose } from "../kit2";
import { P } from "../kit2";

/** extra poses for the debt short (body space, feet on y=0, ~1000 tall) */

export const YAWN: Pose = pose({
  ...POSES.stand, head: [0, -892], tilt: -7, neck: [0, -812],
  shR: [100, -784], elR: [150, -760], haR: [34, -866], hR: "fist",
  elL: [-130, -620], haL: [-112, -470], hL: "fist",
});
export const HANDS_HEAD: Pose = pose({
  ...POSES.stand, tilt: -4,
  elL: [-250, -820], haL: [-52, -930], hL: "relax",
  elR: [250, -820], haR: [52, -930], hR: "relax",
  knL: [-62, -250], knR: [66, -250],
});
/** reaching back over the shoulder to sheathe a sword; faces right */
export const SHEATHE: Pose = pose({
  ...POSES.stand, turn: 0.9, head: [14, -896], neck: [8, -812],
  shL: [-84, -784], elL: [-150, -640], haL: [-130, -500], hL: "relax", backL: true,
  shR: [100, -784], elR: [150, -820], haR: [62, -930], hR: "hold",
  hipL: [-50, -478], knL: [-52, -250], ftL: [-64, -12], hipR: [50, -478], knR: [60, -250], ftR: [76, -12], fdL: 1, fdR: 1,
});
/** a stiff, hands-clasped tremble: terror stand */
export const TREMBLE: Pose = pose({
  ...POSES.stand, head: [0, -880], tilt: 5, neck: [0, -800],
  shL: [-98, -796], elL: [-150, -690], haL: [-40, -700], hL: "spread",
  shR: [98, -796], elR: [150, -690], haR: [40, -704], hR: "spread",
  hipL: [-56, -478], knL: [-70, -250], ftL: [-86, -12], hipR: [56, -478], knR: [70, -250], ftR: [86, -12], fdL: -0.5, fdR: 0.5,
});
/** arms folded, facing the viewer's left */
export const FOLDED_L: Pose = pose({ ...POSES.armsFolded, turn: -0.5 });
/** a hand on the hip, weight on one leg: Mira waiting */
export const WAIT: Pose = pose({
  ...POSES.stand, tilt: 4,
  elL: [-170, -610], haL: [-70, -520], hL: "fist",
  elR: [170, -610], haR: [110, -540], hR: "relax",
  knL: [-58, -250], ftL: [-72, -12], knR: [80, -252], ftR: [100, -12], fdL: -0.3, fdR: 0.3,
});
/** hands on knees, panting */
export const PANT: Pose = pose({
  ...POSES.stand, head: [30, -760], tilt: 12, neck: [18, -690], turn: 0.4,
  shL: [-70, -690], elL: [-120, -520], haL: [-86, -380], hL: "fist",
  shR: [110, -690], elR: [150, -520], haR: [120, -380], hR: "fist",
  hipL: [-50, -478], knL: [-70, -250], ftL: [-80, -12], hipR: [50, -478], knR: [90, -250], ftR: [100, -12],
});
/** lying on his back, head to the viewer's RIGHT (when flipX), hands clawing the ground */
export const DRAGGED_FLAT: Pose = pose({
  head: [-470, -110], tilt: -92, turn: 0.2, neck: [-400, -100],
  shL: [-340, -140], elL: [-440, -90], haL: [-560, -40], hL: "spread", backL: true,
  shR: [-340, -56], elR: [-250, -10], haR: [-130, -30], hR: "spread",
  hipL: [-20, -120], knL: [170, -160], ftL: [330, -90], fdL: 1,
  hipR: [-20, -56], knR: [160, -70], ftR: [330, -40], fdR: 1,
});
export const _P: P = [0, 0];

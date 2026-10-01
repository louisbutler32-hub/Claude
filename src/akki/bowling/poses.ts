import { pose, Pose } from "./characters";

/** Every pose in the short, feet at y=0, ~1000 units tall. L = viewer's left limb. */

export const LUFFY_HOLD: Pose = pose({
  elL: [-142, -650], haL: [-128, -770], hL: "hold",
  elR: [118, -616], haR: [128, -452], hR: "relax",
  ftL: [-64, -14], ftR: [64, -14], fdL: -0.4, fdR: 0.4,
});

export const LUFFY_WIND: Pose = pose({
  head: [-20, -850], tilt: -8, neck: [-14, -778],
  shL: [-104, -752], elL: [-170, -580], haL: [-200, -440], hL: "hold",
  shR: [82, -760], elR: [250, -720], haR: [400, -706], hR: "open",
  hipL: [-50, -440], knL: [-130, -240], ftL: [-150, -14],
  hipR: [48, -440], knR: [110, -236], ftR: [140, -14],
});

export const LUFFY_RELEASE: Pose = pose({
  head: [-10, -830], tilt: 4, neck: [-6, -760],
  shL: [-100, -740], elL: [-90, -600], haL: [-40, -520], hL: "open",
  shR: [86, -746], elR: [240, -760], haR: [380, -800], hR: "open",
  hipL: [-50, -430], knL: [-140, -240], ftL: [-150, -14],
  hipR: [48, -430], knR: [120, -236], ftR: [150, -14],
}, LUFFY_WIND);

export const LUFFY_LUNGE: Pose = pose({
  head: [-262, -626], tilt: -26, turn: -0.7, neck: [-206, -570],
  shL: [-206, -548], elL: [-400, -470], haL: [-600, -430], hL: "open",
  shR: [-128, -596], elR: [10, -700], haR: [170, -770], hR: "open", backR: true,
  hipL: [-26, -420], knL: [-300, -280], ftL: [-330, -16], fdL: -1,
  hipR: [26, -436], knR: [230, -230], ftR: [470, -30], fdR: 1,
});

export const SANJI_STAND: Pose = pose({
  head: [6, -905], tilt: 4, turn: -0.25,
  elL: [-196, -650], haL: [-214, -780], hL: "hold",
  elR: [128, -640], haR: [96, -500], hR: "pocket",
  ftL: [-46, -14], ftR: [70, -14], fdL: -0.5, fdR: 0.6,
  knL: [-40, -254],
});

export const SANJI_TOSS: Pose = pose({
  elL: [-170, -700], haL: [-120, -860], hL: "open",
}, SANJI_STAND);

export const SANJI_CHAMBER: Pose = pose({
  head: [30, -880], tilt: 10, turn: -0.4, neck: [24, -806],
  shL: [-70, -780], elL: [-170, -660], haL: [-210, -540], hL: "open",
  shR: [116, -790], elR: [190, -640], haR: [180, -520], hR: "relax",
  hipL: [-30, -480], knL: [-50, -250], ftL: [-60, -14], fdL: -0.5,
  hipR: [60, -486], knR: [-80, -560], ftR: [-120, -330], fdR: -1,
});

export const SANJI_KICK: Pose = pose({
  head: [80, -860], tilt: 18, turn: -0.5, neck: [70, -790],
  shL: [-20, -770], elL: [-60, -900], haL: [-30, -1010], hL: "open",
  shR: [150, -760], elR: [260, -650], haR: [330, -560], hR: "open",
  hipL: [10, -470], knL: [30, -240], ftL: [40, -14], fdL: 1,
  hipR: [70, -480], knR: [-170, -500], ftR: [-420, -470], fdR: -1,
});

export const ZORO_HOLD: Pose = pose({
  shL: [-104, -806], elL: [-232, -716], haL: [-300, -790], hL: "hold",
  shR: [104, -806], elR: [232, -716], haR: [300, -790], hR: "hold",
  knL: [-62, -254], ftL: [-80, -14], knR: [62, -254], ftR: [80, -14], fdL: -0.5, fdR: 0.5,
});

export const ZORO_RELEASE: Pose = pose({
  head: [0, -880], tilt: 0,
  shL: [-104, -786], elL: [-220, -650], haL: [-300, -600], hL: "open",
  shR: [104, -786], elR: [220, -650], haR: [300, -600], hR: "open",
  hipL: [-56, -470], knL: [-120, -250], ftL: [-150, -14],
  hipR: [56, -470], knR: [120, -250], ftR: [150, -14],
}, ZORO_HOLD);

export const ZORO_THROW: Pose = pose({
  head: [0, -862], tilt: 0, neck: [0, -790],
  shL: [-104, -766], elL: [-270, -712], haL: [-420, -700], hL: "spread",
  shR: [104, -766], elR: [270, -712], haR: [420, -694], hR: "spread",
  hipL: [-58, -450], knL: [-176, -262], ftL: [-232, -14], fdL: -0.6,
  hipR: [58, -450], knR: [176, -262], ftR: [232, -14], fdR: 0.6,
});

export const ZORO_ANGRY: Pose = pose({
  head: [12, -900], tilt: 8, turn: 0.35,
  elL: [-122, -620], haL: [-118, -456], hL: "fist",
  elR: [124, -620], haR: [116, -456], hR: "fist",
});

export const SANJI_LAUGH: Pose = pose({
  head: [-96, -872], tilt: -12, turn: -0.45, neck: [-76, -800],
  shL: [-160, -760], elL: [-250, -880], haL: [-330, -990], hL: "point",
  shR: [10, -760], elR: [60, -600], haR: [-30, -560], hR: "fist",
  hipL: [-50, -486], knL: [-80, -254], ftL: [-90, -14], fdL: -0.5,
  hipR: [46, -490], knR: [60, -252], ftR: [90, -14], fdR: 0.5,
});

export const SANJI_LAUGH2: Pose = pose({
  head: [-104, -850], tilt: -4, neck: [-84, -786],
  shL: [-168, -748], elL: [-256, -866], haL: [-340, -970],
  shR: [4, -770], elR: [56, -610], haR: [-34, -566],
}, SANJI_LAUGH);

export const REG_STAND: Pose = pose({ elL: [-110, -612], haL: [-112, -446], elR: [110, -612], haR: [112, -446] });
export const REG_STARTLE: Pose = pose({
  head: [0, -900], tilt: -4,
  elL: [-170, -660], haL: [-200, -540], hL: "open",
  elR: [170, -660], haR: [200, -540], hR: "open",
  knL: [-80, -250], ftL: [-110, -14], knR: [80, -250], ftR: [110, -14],
});

/* ------------------------------- the brawl ----------------------------------- */
// four drawings each, cycled on twos; y offsets lift jumps off the counter

export const BRAWL_ZORO: { p: Pose; dy: number }[] = [
  { dy: -150, p: pose({ head: [10, -900], tilt: -6, shL: [-90, -800], elL: [-120, -940], haL: [-60, -1060], hL: "fist", elR: [150, -700], haR: [80, -620], hR: "fist", knL: [-120, -420], ftL: [-60, -230], knR: [80, -260], ftR: [60, -10], fdL: -1, fdR: 1 }) },
  { dy: 0, p: pose({ head: [-10, -860], neck: [-6, -790], shL: [-96, -770], shR: [96, -770], elL: [-200, -700], haL: [-180, -820], hL: "fist", elR: [200, -660], haR: [290, -720], hR: "fist", hipL: [-56, -440], knL: [-190, -270], ftL: [-260, -14], hipR: [56, -440], knR: [190, -270], ftR: [260, -14], fdL: -1, fdR: 1 }) },
  { dy: 0, p: pose({ head: [80, -820], tilt: 14, neck: [70, -756], shL: [-20, -740], shR: [150, -740], elL: [-140, -660], haL: [-220, -720], hL: "fist", elR: [300, -720], haR: [460, -740], hR: "fist", hipL: [-30, -430], knL: [-220, -230], ftL: [-380, -14], hipR: [60, -440], knR: [200, -260], ftR: [220, -14], fdL: -1, fdR: 1 }) },
  { dy: -60, p: pose({ head: [0, -890], shL: [-96, -790], elL: [-180, -880], haL: [-120, -980], hL: "fist", elR: [200, -700], haR: [320, -640], hR: "open", knL: [-150, -340], ftL: [-230, -120], knR: [120, -330], ftR: [240, -150], fdL: -1, fdR: 1 }) },
];

export const BRAWL_SANJI: { p: Pose; dy: number }[] = [
  { dy: 0, p: pose({ head: [40, -880], tilt: 12, shL: [-50, -790], elL: [-160, -760], haL: [-260, -800], hL: "open", shR: [130, -780], elR: [240, -700], haR: [320, -640], hR: "open", hipL: [0, -480], knL: [-80, -760], ftL: [-130, -1060], fdL: -1, hipR: [60, -480], knR: [70, -250], ftR: [80, -14], fdR: 1 }) },
  { dy: -120, p: pose({ head: [120, -760], tilt: 30, neck: [90, -700], shL: [40, -700], shR: [140, -690], elL: [150, -820], haL: [220, -900], hL: "open", elR: [240, -620], haR: [330, -560], hR: "open", hipL: [-40, -520], knL: [-280, -560], ftL: [-520, -560], fdL: -1, hipR: [20, -520], knR: [120, -340], ftR: [-20, -200], fdR: -1 }) },
  { dy: 0, p: pose({ head: [60, -600], tilt: 20, neck: [40, -540], shL: [-40, -520], shR: [110, -520], elL: [-120, -380], haL: [-140, -240], hL: "open", elR: [200, -400], haR: [260, -260], hR: "open", hipL: [-30, -300], knL: [-260, -160], ftL: [-480, -40], fdL: -1, hipR: [40, -300], knR: [140, -150], ftR: [100, -14], fdR: 1 }) },
  { dy: -40, p: pose({ head: [30, -890], tilt: 6, shL: [-60, -800], elL: [-180, -820], haL: [-260, -760], hL: "open", shR: [120, -790], elR: [230, -720], haR: [300, -780], hR: "open", hipL: [-10, -490], knL: [-140, -700], ftL: [-60, -960], fdL: -1, hipR: [60, -490], knR: [90, -250], ftR: [100, -14], fdR: 1 }) },
];

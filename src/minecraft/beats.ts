/**
 * The cut list and event sheet for the Minecraft Short, measured off the
 * original with a scene-change detector and a frame-by-frame pass. Every
 * number is an absolute frame at 30 fps; the original runs 506 frames
 * (16.87 s, 506 frames — the container claims 508) and so does this.
 */
export const FPS = 30;
export const W = 1080;
export const H = 1920;
/** The white caption band ends here; the picture fills the rest. */
export const PANEL_TOP = 397;
export const PANEL_H = H - PANEL_TOP;
export const TOTAL_FRAMES = 506;

export const CAPTION = ["Minecrafters every time", "they lose their stuff:"];

/** [first frame, first frame of the next shot] */
export const SHOT = {
  /** creeper goes off, the stuff scatters, the body despawns */
  death: [0, 17],
  /** respawn on the grass — denial, bargaining, worry */
  overworld: [17, 147],
  /** top-down map, the long walk back */
  aerial: [147, 175],
  /** the cave mouth from inside */
  tunnel: [175, 195],
  /** a dark stone room, thinking */
  darkRoom: [195, 221],
  /** crossing lava on one block */
  lava: [221, 254],
  /** torchlight, tears, and the spiders arrive */
  torch: [254, 289],
  /** home, weighing what's in the chest */
  house: [289, 333],
  /** back at the spot — it's all still there? */
  closeup: [333, 351],
  /** it's all still there. Then it isn't. */
  finale: [351, 506],
} as const;

export type ShotName = keyof typeof SHOT;

export const shotLen = (s: ShotName) => SHOT[s][1] - SHOT[s][0];

/** Events, absolute frames. */
export const EV = {
  creeperIn: 1,
  explosion: 2,
  landed: 11,
  bodyGone: 12,
  respawn: 19,
  eyesA: 265,
  eyesB: 268,
  leaveTorch: 270,
  torchOut: 275,
  eyesC: 276,
  eyesD: 279,
  houseGrin: 300,
  houseMeh: 315,
  joyFace: 355,
  pullBackEnd: 362,
  wiggleEnd: 380,
  danceStart: 385,
  despawn: 421,
  scratch: 423,
  gasp: 426,
  handsOnHead: 436,
  scream: 461,
  frown: 480,
  deadpan: 485,
  pickUp: 486,
  pickHeld: 493,
  pickRaised: 500,
} as const;

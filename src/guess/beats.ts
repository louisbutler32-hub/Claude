/**
 * The beat sheet every episode of the format runs to. Frame numbers are
 * relative to the round; the audio build reads the same numbers, so a line
 * of voiceover and the thing it describes cannot drift apart.
 */
export const FPS = 30;
export const ROUND_LEN = 52 * FPS; // 1560
export const INTRO_LEN = 4 * FPS; //  120

export const BEAT = {
  /** empty meadow, something drifts past */
  driftIn: 0,
  driftOut: 150,
  /** a tiny version of the thing hops along the bush line */
  hopIn: 130,
  hopOut: 320,
  /** the silhouette rises and the question types on */
  silRise: 350,
  question: 382,
  /** the pop */
  flash: 518,
  reveal: 522,
  name: 546,
  /** it shrinks down and drops onto the grass */
  shrink: 716,
  shrinkEnd: 806,
  /** ── the subject owns 800-1240 ── */
  mid: 800,
  midOut: 1240,
  /** the board */
  boardRise: 1212,
  boardPop: 1256,
  flyStart: 1300,
  land: 1382,
  celebrate: 1386,
  boardExit: 1478,
} as const;

export const totalFrames = (rounds: number) => INTRO_LEN + rounds * ROUND_LEN;
export const roundBase = (n: number) => INTRO_LEN + n * ROUND_LEN;

import type { DrifterId } from "./critters";
import type { VeggieId } from "./veggies";

/**
 * The twelve rounds, in the order they are revealed. Mirrors the fruit
 * edit: the reveal order jumps around the board so the grid fills in
 * scattered rather than left to right.
 */
export type Round = {
  id: VeggieId;
  /** the thing that drifts past during the quiet opening beat */
  drifter: DrifterId;
  /** one-line voiceover cue for the audio pass */
  vo: string;
};

export const ROUNDS: Round[] = [
  { id: "carrot",   drifter: "bee",       vo: "What is that? ... A carrot! Crunchy orange carrot." },
  { id: "corn",     drifter: "airplane",  vo: "What is that? ... Corn! Sweet yellow corn." },
  { id: "tomato",   drifter: "butterfly", vo: "What is that? ... A tomato! Round red tomato." },
  { id: "pumpkin",  drifter: "kite",      vo: "What is that? ... A pumpkin! Big orange pumpkin." },
  { id: "pepper",   drifter: "ladybug",   vo: "What is that? ... A bell pepper! Shiny red pepper." },
  { id: "cucumber", drifter: "snail",     vo: "What is that? ... A cucumber! Long green cucumber." },
  { id: "potato",   drifter: "bee",       vo: "What is that? ... A potato! Lumpy brown potato." },
  { id: "onion",    drifter: "crab",      vo: "What is that? ... An onion! Purple papery onion." },
  { id: "eggplant", drifter: "butterfly", vo: "What is that? ... An eggplant! Shiny purple eggplant." },
  { id: "peas",     drifter: "bunny",     vo: "What is that? ... Peas! Little green peas in a pod." },
  { id: "broccoli", drifter: "dino",      vo: "What is that? ... Broccoli! Bushy green broccoli." },
  { id: "mushroom", drifter: "kite",      vo: "What is that? ... A mushroom! Cute little mushroom." },
];

/** How big each vegetable plays in the full-screen reveal. */
export const HERO_SCALE: Record<VeggieId, number> = {
  carrot: 2.3,
  corn: 2.25,
  tomato: 2.5,
  pumpkin: 2.2,
  pepper: 2.35,
  cucumber: 2.3,
  potato: 2.4,
  onion: 2.1,
  eggplant: 2.1,
  peas: 2.05,
  broccoli: 2.45,
  mushroom: 2.4,
};

/* ------------------------------------------------------------------ */
/* round timing — every round runs to the same 52-second beat sheet    */
/* ------------------------------------------------------------------ */

export const FPS = 30;
export const ROUND_LEN = 52 * FPS; // 1560
export const INTRO_LEN = 4 * FPS; //  120

export const BEAT = {
  /** empty meadow, something drifts past */
  driftIn: 0,
  driftOut: 150,
  /** a tiny version of the vegetable hops along the bush line */
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
  /** cut to where it grows; it rolls off to the right */
  habitat: 800,
  rollStart: 824,
  rollEnd: 1010,
  /** the crocodile comes for it */
  crocIn: 996,
  chomp: 1104,
  crocOut: 1150,
  habitatOut: 1206,
  /** the board */
  boardRise: 1212,
  boardPop: 1256,
  flyStart: 1300,
  land: 1382,
  celebrate: 1386,
  boardExit: 1478,
} as const;

export const TOTAL_FRAMES = INTRO_LEN + ROUNDS.length * ROUND_LEN;

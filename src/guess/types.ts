import type React from "react";
import type { DrifterId } from "./critters";

/**
 * One subject for the guess-the-silhouette format.
 *
 * The engine owns the beats every episode shares — a shape rises, "what is
 * that?", the reveal, the collection board. A subject supplies the twelve
 * things being guessed, and owns the middle stretch of the round, which is
 * where the episodes actually differ: vegetables visit the plant they grew
 * on and get eaten, animals go home and make their noise, numbers get
 * counted out.
 */

/** Drawn once, rendered either in colour or as its own flat-black shadow. */
export type GuessArt = React.FC<{ sil?: boolean }>;

export type GuessRound = {
  id: string;
  /** what drifts past during the quiet opening beat */
  drifter: DrifterId;
};

export type RingItem = {
  id: string;
  x: number;
  y: number;
  s: number;
  r: number;
};

export type GuessSubject = {
  /** used for deterministic randomness, so two subjects don't share scatter */
  key: string;
  /** the word after "Chomp Chomp" on the title card */
  titleWord: string;
  /** [fill, shade] per letter of that word, cycled */
  titleLetters: [string, string][];
  /** gradient defs the art needs; mounted inside every svg that draws it */
  Defs: React.FC;
  art: Record<string, GuessArt>;
  names: Record<string, string>;
  /** twelve ids in board reading order, 4 across by 3 down */
  boardOrder: string[];
  /** per-item scale on the board, so odd shapes read at one weight */
  slotScale: Record<string, number>;
  /** per-item scale in the full-screen reveal */
  heroScale: Record<string, number>;
  /** the reveal order — deliberately scattered across the board */
  rounds: GuessRound[];
  /** frames 800-1206 of every round belong to the subject */
  MidBeat: React.FC<{ id: string }>;
  /** produce ringing the title card */
  ringItems: RingItem[];
};

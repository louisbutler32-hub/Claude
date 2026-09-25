import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Item } from "../guess/Board";
import { PEBBLO_CAST } from "../guess/cast";
import { Bush, BushPair, GROUND_Y, H, W } from "../guess/scene";
import type { GuessSubject } from "../guess/types";
import { FruitDefs, FRUIT_ART, FRUIT_NAME, type FruitId } from "./fruit";
import { Habitat } from "./habitats";

/**
 * Fruit — the first episode on the Peekaboo Pebblo cast.
 *
 * The middle of each round visits the tree or vine the fruit grew on, the
 * fruit rolls in to sit under it, and Munch turns up and eats it.
 */

const HABITAT_OUT = 1206;
const ROLL_START = 824;
const ROLL_END = 1010;
const MUNCH_IN = 996;
const CHOMP = 1104;

const MidBeat: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const onHabitat = frame < HABITAT_OUT;
  const Chomper = PEBBLO_CAST.Chomper;

  const rollT = interpolate(frame, [ROLL_START, ROLL_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rollX = interpolate(rollT, [0, 1], [960, 800]);
  const rollHop = Math.abs(Math.sin(rollT * Math.PI * 5)) * 26 * (1 - rollT);
  const eaten = frame >= CHOMP + 4;
  // in the last half-second before the bite the fruit hops up into Munch's
  // open mouth, so the chomp lands on it rather than beside it
  const biteT = interpolate(frame, [CHOMP - 16, CHOMP], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const biteEase = biteT * biteT * (3 - 2 * biteT);

  // Munch walks in from the right, stops with his mouth over the fruit,
  // shuts it, then carries on out to the left, chewing.
  const walkT = interpolate(frame, [MUNCH_IN, CHOMP], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const munchX =
    frame <= CHOMP
      ? interpolate(walkT, [0, 1], [2400, 900])
      : interpolate(frame, [CHOMP + 18, HABITAT_OUT + 30], [900, -700], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const chompAmt = interpolate(
    frame,
    [CHOMP - 8, CHOMP, CHOMP + 12, CHOMP + 26, CHOMP + 40, CHOMP + 54],
    [0, 1, 1, 0.55, 1, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  // a quick lean into the bite
  const lean = interpolate(frame, [CHOMP - 10, CHOMP, CHOMP + 14], [0, -8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const walking = frame < CHOMP - 6 || frame > CHOMP + 18;

  return (
    <>
      {onHabitat ? (
        <>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <Bush x={1300} y={GROUND_Y - 220} w={740} h={220} tone="lite" seed={11} />
          </svg>
          <Habitat id={id as FruitId} x={interpolate(frame, [800, HABITAT_OUT], [40, -120])} />
        </>
      ) : (
        <BushPair />
      )}

      {frame >= MUNCH_IN - 4 ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${munchX} ${GROUND_Y + 6}) rotate(${lean}) scale(1.02)`}>
            <Chomper chomp={chompAmt} step={walking ? frame / 4.2 : 0.4} />
          </g>
        </svg>
      ) : null}

      {/* drawn after Munch, so the hop into his open mouth reads in front of
          his face rather than vanishing behind his body */}
      {onHabitat && !eaten ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <FruitDefs />
          <Item
            subject={fruitSubject}
            id={id}
            x={interpolate(biteEase, [0, 1], [rollX, munchX - 38])}
            y={GROUND_Y - 36 - rollHop - biteEase * 40 - Math.sin(biteT * Math.PI) * 50}
            size={0.5}
            rotate={rollT * 220 + biteEase * 30}
          />
        </svg>
      ) : null}

    </>
  );
};

export const fruitSubject: GuessSubject = {
  key: "fruit",
  titleWord: "FRUIT",
  titleLetters: [
    ["#e8483f", "#c23f38"],
    ["#f6902f", "#c96a22"],
    ["#f3c93f", "#cfa423"],
    ["#5da648", "#427f33"],
    ["#8b58b3", "#6b3d92"],
  ],
  Defs: FruitDefs,
  art: FRUIT_ART as Record<string, GuessSubject["art"][string]>,
  names: FRUIT_NAME,
  boardOrder: [
    "apple", "grapes", "lemon", "strawberry",
    "pineapple", "banana", "cherry", "peach",
    "watermelon", "kiwi", "orange", "pear",
  ],
  slotScale: {
    apple: 1.0, grapes: 0.98, lemon: 0.98, strawberry: 0.98,
    pineapple: 0.92, banana: 1.02, cherry: 0.98, peach: 1.0,
    watermelon: 1.0, kiwi: 0.98, orange: 1.0, pear: 0.98,
  },
  heroScale: {
    apple: 2.4, banana: 2.35, orange: 2.4, strawberry: 2.3,
    grapes: 2.2, watermelon: 2.3, pineapple: 2.1, pear: 2.3,
    cherry: 2.3, lemon: 2.5, peach: 2.4, kiwi: 2.35,
  },
  rounds: [
    { id: "apple", drifter: "bee" },
    { id: "banana", drifter: "butterfly" },
    { id: "orange", drifter: "kite" },
    { id: "strawberry", drifter: "ladybug" },
    { id: "grapes", drifter: "airplane" },
    { id: "watermelon", drifter: "snail" },
    { id: "pear", drifter: "bunny" },
    { id: "pineapple", drifter: "butterfly" },
    { id: "cherry", drifter: "bee" },
    { id: "lemon", drifter: "kite" },
    { id: "peach", drifter: "crab" },
    { id: "kiwi", drifter: "dino" },
  ],
  MidBeat,
  cast: PEBBLO_CAST,
  ringItems: [
    { id: "apple", x: 92, y: 118, s: 0.95, r: -8 },
    { id: "banana", x: 82, y: 430, s: 0.9, r: -14 },
    { id: "cherry", x: 118, y: 700, s: 0.82, r: 8 },
    { id: "lemon", x: 96, y: 930, s: 0.82, r: -6 },
    { id: "strawberry", x: 360, y: 62, s: 0.82, r: 6 },
    { id: "grapes", x: 640, y: 80, s: 0.72, r: -18 },
    { id: "orange", x: 950, y: 60, s: 0.8, r: 9 },
    { id: "pear", x: 1250, y: 70, s: 0.78, r: -7 },
    { id: "kiwi", x: 1520, y: 84, s: 0.74, r: 5 },
    { id: "watermelon", x: 1810, y: 210, s: 0.9, r: 7 },
    { id: "peach", x: 1830, y: 520, s: 0.88, r: -9 },
    { id: "pineapple", x: 1806, y: 780, s: 0.84, r: 12 },
    { id: "orange", x: 300, y: 980, s: 0.78, r: 16 },
    { id: "grapes", x: 560, y: 1020, s: 0.72, r: -10 },
    { id: "strawberry", x: 820, y: 1010, s: 0.74, r: 6 },
    { id: "apple", x: 1075, y: 1000, s: 0.7, r: -12 },
    { id: "lemon", x: 1330, y: 1020, s: 0.66, r: 9 },
  ],
};

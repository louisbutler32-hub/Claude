import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Item } from "../guess/Board";
import { Crocodile } from "../guess/critters";
import { Bush, BushPair, GROUND_Y, H, W } from "../guess/scene";
import type { GuessSubject } from "../guess/types";
import { FruitDefs, FRUIT_NAME, FRUIT_PHOTO_ART } from "./fruits";
import { FruitHabitat } from "./habitats";

/**
 * Fruits. Same shape as Veggies: the middle of each round visits the
 * plant the fruit grew on, and the crocodile turns up to eat it. No title
 * card — see noTitleCard on the subject below.
 */

const HABITAT_OUT = 1206;
const ROLL_START = 824;
const ROLL_END = 1010;
const CROC_IN = 996;
const CHOMP = 1104;

const MidBeat: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const onHabitat = frame < HABITAT_OUT;

  const rollT = interpolate(frame, [ROLL_START, ROLL_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rollX = interpolate(rollT, [0, 1], [960, 820]);
  const rollHop = Math.abs(Math.sin(rollT * Math.PI * 5)) * 26 * (1 - rollT);
  const eaten = frame >= CHOMP + 4;

  const crocT = interpolate(frame, [CROC_IN, CHOMP], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const crocX =
    frame <= CHOMP
      ? interpolate(crocT, [0, 1], [2560, 1030])
      : interpolate(frame, [CHOMP, HABITAT_OUT + 30], [1030, -760], {
          extrapolateRight: "clamp",
        });
  const chompAmt = interpolate(
    frame,
    [CHOMP - 6, CHOMP, CHOMP + 10, CHOMP + 22],
    [0, 1, 1, 0.75],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      {onHabitat ? (
        <>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <Bush x={1300} y={GROUND_Y - 220} w={740} h={220} tone="lite" seed={11} />
          </svg>
          <FruitHabitat
            id={id}
            x={interpolate(frame, [800, HABITAT_OUT], [40, -120])}
          />
        </>
      ) : (
        <BushPair />
      )}

      {onHabitat && !eaten ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <FruitDefs />
          <Item
            subject={fruitSubject}
            id={id}
            x={rollX}
            y={GROUND_Y - 34 - rollHop}
            size={0.5}
            rotate={rollT * 220}
          />
        </svg>
      ) : null}

      {frame >= CROC_IN - 4 ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${crocX} ${GROUND_Y - 44}) scale(1.72)`}>
            <Crocodile chomp={chompAmt} step={frame / 4.5} />
          </g>
        </svg>
      ) : null}
    </>
  );
};

export const fruitSubject: GuessSubject = {
  key: "fru",
  titleWord: "FRUITS",
  titleLetters: [
    ["#e0433c", "#b8332c"],
    ["#f3941c", "#d97b0f"],
    ["#f3c93f", "#cfa423"],
    ["#5da648", "#427f33"],
    ["#7a4f9e", "#5f3b7d"],
    ["#e0433c", "#b8332c"],
  ],
  Defs: FruitDefs,
  art: FRUIT_PHOTO_ART,
  names: FRUIT_NAME,
  noTitleCard: true,
  boardOrder: [
    "apple", "banana", "orange", "strawberry",
    "grape", "watermelon", "pineapple", "kiwi",
    "mango", "cherry", "peach", "pear",
  ],
  slotScale: {
    apple: 0.95, banana: 0.8, orange: 0.95, strawberry: 0.85,
    grape: 0.88, watermelon: 1.0, pineapple: 0.95, kiwi: 0.8,
    mango: 0.92, cherry: 0.82, peach: 0.92, pear: 0.92,
  },
  heroScale: {
    apple: 2.4, banana: 2.0, orange: 2.4, strawberry: 2.3,
    grape: 2.2, watermelon: 2.1, pineapple: 2.2, kiwi: 2.35,
    mango: 2.3, cherry: 2.3, peach: 2.35, pear: 2.3,
  },
  rounds: [
    { id: "apple", drifter: "bee" },
    { id: "banana", drifter: "airplane" },
    { id: "orange", drifter: "butterfly" },
    { id: "strawberry", drifter: "kite" },
    { id: "grape", drifter: "ladybug" },
    { id: "watermelon", drifter: "snail" },
    { id: "pineapple", drifter: "bee" },
    { id: "kiwi", drifter: "crab" },
    { id: "mango", drifter: "bunny" },
    { id: "cherry", drifter: "dino" },
    { id: "peach", drifter: "kite" },
    { id: "pear", drifter: "butterfly" },
  ],
  MidBeat,
  ringItems: [
    { id: "apple", x: 92, y: 120, s: 0.9, r: -8 },
    { id: "strawberry", x: 78, y: 432, s: 0.86, r: -12 },
    { id: "kiwi", x: 128, y: 700, s: 0.76, r: 8 },
    { id: "pineapple", x: 100, y: 930, s: 0.88, r: -6 },
    { id: "banana", x: 366, y: 70, s: 0.7, r: 6 },
    { id: "cherry", x: 650, y: 74, s: 0.72, r: -8 },
    { id: "orange", x: 950, y: 62, s: 0.86, r: 9 },
    { id: "watermelon", x: 1250, y: 68, s: 0.9, r: -7 },
    { id: "grape", x: 1520, y: 86, s: 0.78, r: 5 },
    { id: "mango", x: 1810, y: 214, s: 0.84, r: 7 },
    { id: "peach", x: 1830, y: 522, s: 0.84, r: -9 },
    { id: "pear", x: 1806, y: 786, s: 0.84, r: 10 },
    { id: "apple", x: 306, y: 986, s: 0.62, r: 14 },
    { id: "strawberry", x: 566, y: 1022, s: 0.6, r: -10 },
    { id: "kiwi", x: 826, y: 1012, s: 0.6, r: 6 },
    { id: "cherry", x: 1082, y: 1002, s: 0.6, r: -12 },
    { id: "orange", x: 1336, y: 1022, s: 0.62, r: 9 },
  ],
};

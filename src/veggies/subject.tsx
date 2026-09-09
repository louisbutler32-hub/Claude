import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Item } from "../guess/Board";
import { Crocodile } from "../guess/critters";
import { Bush, BushPair, GROUND_Y, H, W } from "../guess/scene";
import type { GuessSubject } from "../guess/types";
import { Habitat } from "./habitats";
import { VeggieDefs, VEGGIE_NAME, VEGGIE_ART } from "./veggies";

/**
 * Vegetables. The middle of each round visits the plant the vegetable grew
 * on, and the crocodile turns up to eat it.
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
            <Bush
              x={1300}
              y={GROUND_Y - 220}
              w={740}
              h={220}
              tone="lite"
              seed={11}
            />
          </svg>
          <Habitat
            id={id as never}
            x={interpolate(frame, [800, HABITAT_OUT], [40, -120])}
          />
        </>
      ) : (
        <BushPair />
      )}

      {onHabitat && !eaten ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <VeggieDefs />
          <Item
            subject={veggieSubject}
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

export const veggieSubject: GuessSubject = {
  key: "veg",
  titleWord: "VEGGIES",
  titleLetters: [
    ["#ef8a3c", "#c96a22"],
    ["#ea5b52", "#c23f38"],
    ["#4a9450", "#357038"],
    ["#f3c93f", "#cfa423"],
    ["#ea5a4d", "#c23f38"],
    ["#8b58b3", "#6b3d92"],
    ["#5da648", "#427f33"],
  ],
  Defs: VeggieDefs,
  art: VEGGIE_ART as Record<string, GuessSubject["art"][string]>,
  names: VEGGIE_NAME,
  boardOrder: [
    "carrot", "potato", "eggplant", "tomato",
    "peas", "pumpkin", "pepper", "broccoli",
    "onion", "mushroom", "corn", "cucumber",
  ],
  slotScale: {
    carrot: 1.0, potato: 0.97, eggplant: 0.92, tomato: 1.05,
    peas: 0.9, pumpkin: 1.02, pepper: 1.0, broccoli: 1.0,
    onion: 0.97, mushroom: 0.95, corn: 0.92, cucumber: 0.9,
  },
  heroScale: {
    carrot: 2.3, corn: 2.25, tomato: 2.5, pumpkin: 2.2,
    pepper: 2.35, cucumber: 2.3, potato: 2.4, onion: 2.1,
    eggplant: 2.1, peas: 2.05, broccoli: 2.45, mushroom: 2.4,
  },
  rounds: [
    { id: "carrot", drifter: "bee" },
    { id: "corn", drifter: "airplane" },
    { id: "tomato", drifter: "butterfly" },
    { id: "pumpkin", drifter: "kite" },
    { id: "pepper", drifter: "ladybug" },
    { id: "cucumber", drifter: "snail" },
    { id: "potato", drifter: "bee" },
    { id: "onion", drifter: "crab" },
    { id: "eggplant", drifter: "butterfly" },
    { id: "peas", drifter: "bunny" },
    { id: "broccoli", drifter: "dino" },
    { id: "mushroom", drifter: "kite" },
  ],
  MidBeat,
  ringItems: [
    { id: "broccoli", x: 92, y: 118, s: 0.95, r: -8 },
    { id: "carrot", x: 78, y: 430, s: 0.9, r: -14 },
    { id: "peas", x: 118, y: 700, s: 0.8, r: 8 },
    { id: "onion", x: 96, y: 930, s: 0.82, r: -6 },
    { id: "tomato", x: 360, y: 62, s: 0.82, r: 6 },
    { id: "cucumber", x: 640, y: 76, s: 0.7, r: -18 },
    { id: "corn", x: 950, y: 60, s: 0.8, r: 9 },
    { id: "eggplant", x: 1250, y: 66, s: 0.78, r: -7 },
    { id: "mushroom", x: 1520, y: 84, s: 0.76, r: 5 },
    { id: "pumpkin", x: 1810, y: 210, s: 0.95, r: 7 },
    { id: "pepper", x: 1830, y: 520, s: 0.88, r: -9 },
    { id: "potato", x: 1806, y: 780, s: 0.84, r: 12 },
    { id: "carrot", x: 300, y: 980, s: 0.78, r: 16 },
    { id: "tomato", x: 560, y: 1020, s: 0.72, r: -10 },
    { id: "broccoli", x: 820, y: 1010, s: 0.74, r: 6 },
    { id: "corn", x: 1075, y: 1000, s: 0.7, r: -12 },
    { id: "peas", x: 1330, y: 1020, s: 0.66, r: 9 },
  ],
};

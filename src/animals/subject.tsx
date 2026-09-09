import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Item } from "../guess/Board";
import { fonts } from "../guess/palette";
import { BushPair, GROUND_Y, H, W } from "../guess/scene";
import type { GuessSubject } from "../guess/types";
import { AnimalDefs, ANIMAL_ART, ANIMAL_NAME, ANIMAL_SOUND } from "./animals";
import { AnimalHabitat } from "./habitats";

/**
 * Animals. The middle of each round goes to where the animal lives, and
 * ends on the sound it makes — which is the thing this episode is really
 * teaching, so it gets the speech bubble and the big text.
 */

const HABITAT_OUT = 1206;
const WALK_START = 824;
const WALK_END = 1020;
const SOUND_AT = 1142;
const SOUND_OUT = 1215;

/** White speech bubble with the animal's noise in it. */
const SpeechBubble: React.FC<{ text: string; x: number; y: number }> = ({
  text,
  x,
  y,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - SOUND_AT,
    fps,
    config: { damping: 9, mass: 0.45, stiffness: 200 },
  });
  const fade = interpolate(frame, [SOUND_OUT, SOUND_OUT + 12], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (pop <= 0.01 || fade <= 0) return null;
  const w = Math.max(300, text.length * 62 + 120);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -100%) scale(${0.4 + pop * 0.6})`,
        opacity: fade,
      }}
    >
      <div
        style={{
          position: "relative",
          width: w,
          padding: "26px 30px 34px",
          background: "#ffffff",
          border: "9px solid #3d5c34",
          borderRadius: 54,
          textAlign: "center",
          fontFamily: fonts.display,
          fontSize: 92,
          lineHeight: 1,
          color: "#3d5c34",
          boxShadow: "0 14px 0 rgba(60,80,50,.18)",
        }}
      >
        {text}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -46,
            marginLeft: -26,
            width: 0,
            height: 0,
            borderLeft: "26px solid transparent",
            borderRight: "26px solid transparent",
            borderTop: "48px solid #3d5c34",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -30,
            marginLeft: -17,
            width: 0,
            height: 0,
            borderLeft: "17px solid transparent",
            borderRight: "17px solid transparent",
            borderTop: "34px solid #ffffff",
          }}
        />
      </div>
    </div>
  );
};

const MidBeat: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const onHabitat = frame < HABITAT_OUT;

  const walkT = interpolate(frame, [WALK_START, WALK_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(walkT, [0, 1], [1740, 880]);
  const waddle = Math.sin(frame / 4.5) * (walkT < 1 ? 9 : 2);
  const step = Math.abs(Math.sin(frame / 4.5)) * (walkT < 1 ? 14 : 0);

  // a hop on the noise
  const shout = spring({
    frame: frame - SOUND_AT,
    fps,
    config: { damping: 7, mass: 0.4, stiffness: 210 },
  });
  const hop = Math.sin(shout * Math.PI) * 46;
  const y = GROUND_Y - 148 - step - hop;

  return (
    <>
      {onHabitat ? (
        <AnimalHabitat
          id={id}
          x={interpolate(frame, [800, HABITAT_OUT], [40, -110])}
        />
      ) : (
        <BushPair />
      )}

      {onHabitat ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <AnimalDefs />
          <g transform={`rotate(${waddle * 0.4} ${x} ${y})`}>
            <Item
              subject={animalSubject}
              id={id}
              x={x}
              y={y}
              size={1.5}
              rotate={waddle * 0.3}
            />
          </g>
        </svg>
      ) : null}

      {onHabitat ? (
        <SpeechBubble text={ANIMAL_SOUND[id]} x={x} y={y - 250} />
      ) : null}
    </>
  );
};

export const animalSubject: GuessSubject = {
  key: "ani",
  titleWord: "ANIMALS",
  titleLetters: [
    ["#ef8a3c", "#c96a22"],
    ["#5aa0c8", "#3d7a9e"],
    ["#ea5b52", "#c23f38"],
    ["#4a9450", "#357038"],
    ["#f3c93f", "#cfa423"],
    ["#8b58b3", "#6b3d92"],
    ["#e07f9c", "#bb5c78"],
  ],
  Defs: AnimalDefs,
  art: ANIMAL_ART,
  names: ANIMAL_NAME,
  boardOrder: [
    "cow", "duck", "pig", "sheep",
    "cat", "dog", "elephant", "lion",
    "frog", "owl", "fish", "penguin",
  ],
  slotScale: {
    cow: 0.95, duck: 0.78, pig: 0.92, sheep: 0.92,
    cat: 0.86, dog: 0.86, elephant: 0.86, lion: 0.86,
    frog: 0.86, owl: 0.88, fish: 0.76, penguin: 0.9,
  },
  heroScale: {
    cow: 2.5, duck: 1.85, pig: 2.45, sheep: 2.45,
    cat: 2.2, dog: 2.25, elephant: 2.2, lion: 2.2,
    frog: 2.2, owl: 2.3, fish: 1.9, penguin: 2.3,
  },
  rounds: [
    { id: "cow", drifter: "bee" },
    { id: "lion", drifter: "airplane" },
    { id: "duck", drifter: "butterfly" },
    { id: "frog", drifter: "kite" },
    { id: "pig", drifter: "ladybug" },
    { id: "penguin", drifter: "snail" },
    { id: "owl", drifter: "bee" },
    { id: "elephant", drifter: "crab" },
    { id: "sheep", drifter: "butterfly" },
    { id: "fish", drifter: "bunny" },
    { id: "cat", drifter: "dino" },
    { id: "dog", drifter: "kite" },
  ],
  MidBeat,
  ringItems: [
    { id: "cow", x: 92, y: 120, s: 0.9, r: -8 },
    { id: "frog", x: 78, y: 432, s: 0.9, r: -12 },
    { id: "fish", x: 128, y: 700, s: 0.72, r: 8 },
    { id: "pig", x: 100, y: 930, s: 0.86, r: -6 },
    { id: "duck", x: 366, y: 70, s: 0.66, r: 6 },
    { id: "owl", x: 650, y: 74, s: 0.76, r: -8 },
    { id: "lion", x: 950, y: 62, s: 0.8, r: 9 },
    { id: "penguin", x: 1250, y: 68, s: 0.8, r: -7 },
    { id: "sheep", x: 1520, y: 86, s: 0.8, r: 5 },
    { id: "elephant", x: 1810, y: 214, s: 0.9, r: 7 },
    { id: "cat", x: 1830, y: 522, s: 0.86, r: -9 },
    { id: "dog", x: 1806, y: 786, s: 0.84, r: 10 },
    { id: "duck", x: 306, y: 986, s: 0.62, r: 14 },
    { id: "frog", x: 566, y: 1022, s: 0.7, r: -10 },
    { id: "owl", x: 826, y: 1012, s: 0.7, r: 6 },
    { id: "fish", x: 1082, y: 1002, s: 0.62, r: -12 },
    { id: "lion", x: 1336, y: 1022, s: 0.68, r: 9 },
  ],
};

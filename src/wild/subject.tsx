import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Item } from "../guess/Board";
import { fonts } from "../guess/palette";
import { BushPair, GROUND_Y, H, W } from "../guess/scene";
import type { GuessSubject } from "../guess/types";
import { WildDefs, WILD_NAME, WILD_PHOTO_ART, WILD_SOUND } from "./wild";
import { WildHabitat } from "./habitats";

/**
 * Wild Animals — the second animals episode. Same shape as the first: the
 * middle of each round goes to where the animal lives, and ends on the
 * sound it makes (or, for the quieter ones, the thing it's known for).
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
        <WildHabitat
          id={id}
          x={interpolate(frame, [800, HABITAT_OUT], [40, -110])}
        />
      ) : (
        <BushPair />
      )}

      {onHabitat ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <WildDefs />
          <g transform={`rotate(${waddle * 0.4} ${x} ${y})`}>
            <Item
              subject={wildSubject}
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
        <SpeechBubble text={WILD_SOUND[id]} x={x} y={y - 250} />
      ) : null}
    </>
  );
};

export const wildSubject: GuessSubject = {
  key: "wild",
  titleWord: "WILD ANIMALS",
  titleLetters: [
    ["#ef8a3c", "#c96a22"],
    ["#5aa0c8", "#3d7a9e"],
    ["#ea5b52", "#c23f38"],
    ["#4a9450", "#357038"],
    ["#f3c93f", "#cfa423"],
    ["#8b58b3", "#6b3d92"],
    ["#e07f9c", "#bb5c78"],
  ],
  Defs: WildDefs,
  art: WILD_PHOTO_ART,
  names: WILD_NAME,
  boardOrder: [
    "zebra", "giraffe", "tiger", "bear",
    "monkey", "kangaroo", "panda", "koala",
    "fox", "camel", "hedgehog", "peacock",
  ],
  slotScale: {
    zebra: 0.92, giraffe: 0.78, tiger: 0.9, bear: 0.9,
    monkey: 0.86, kangaroo: 0.86, panda: 0.88, koala: 0.9,
    fox: 0.88, camel: 0.86, hedgehog: 0.86, peacock: 0.84,
  },
  heroScale: {
    zebra: 2.3, giraffe: 1.85, tiger: 2.3, bear: 2.25,
    monkey: 2.2, kangaroo: 2.2, panda: 2.25, koala: 2.3,
    fox: 2.25, camel: 2.1, hedgehog: 2.4, peacock: 2.15,
  },
  rounds: [
    { id: "zebra", drifter: "bee" },
    { id: "tiger", drifter: "airplane" },
    { id: "giraffe", drifter: "butterfly" },
    { id: "koala", drifter: "kite" },
    { id: "monkey", drifter: "ladybug" },
    { id: "kangaroo", drifter: "snail" },
    { id: "bear", drifter: "bee" },
    { id: "panda", drifter: "crab" },
    { id: "fox", drifter: "bunny" },
    { id: "hedgehog", drifter: "dino" },
    { id: "camel", drifter: "kite" },
    { id: "peacock", drifter: "butterfly" },
  ],
  MidBeat,
  ringItems: [
    { id: "zebra", x: 92, y: 120, s: 0.86, r: -8 },
    { id: "koala", x: 78, y: 432, s: 0.8, r: -12 },
    { id: "hedgehog", x: 128, y: 700, s: 0.7, r: 8 },
    { id: "panda", x: 100, y: 930, s: 0.84, r: -6 },
    { id: "giraffe", x: 366, y: 70, s: 0.62, r: 6 },
    { id: "fox", x: 650, y: 74, s: 0.76, r: -8 },
    { id: "tiger", x: 950, y: 62, s: 0.8, r: 9 },
    { id: "kangaroo", x: 1250, y: 68, s: 0.78, r: -7 },
    { id: "camel", x: 1520, y: 86, s: 0.78, r: 5 },
    { id: "bear", x: 1810, y: 214, s: 0.84, r: 7 },
    { id: "monkey", x: 1830, y: 522, s: 0.8, r: -9 },
    { id: "peacock", x: 1806, y: 786, s: 0.8, r: 10 },
    { id: "zebra", x: 306, y: 986, s: 0.62, r: 14 },
    { id: "koala", x: 566, y: 1022, s: 0.66, r: -10 },
    { id: "fox", x: 826, y: 1012, s: 0.66, r: 6 },
    { id: "hedgehog", x: 1082, y: 1002, s: 0.6, r: -12 },
    { id: "tiger", x: 1336, y: 1022, s: 0.66, r: 9 },
  ],
};

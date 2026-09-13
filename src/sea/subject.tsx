import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Item } from "../guess/Board";
import { fonts } from "../guess/palette";
import { GROUND_Y, H, W } from "../guess/scene";
import type { GuessSubject } from "../guess/types";
import { SeaHabitat } from "./habitats";
import { SeaDefs, SEA_ART, SEA_NAME, SEA_SOUND } from "./sea";
import { AnimalDefs } from "../animals/animals";

/**
 * Sea creatures. The middle of each round shows the seabed it lives on,
 * with the creature swimming across, then ends on its splash / click /
 * wobble in a speech bubble.
 */

const HABITAT_OUT = 1206;
const SWIM_START = 824;
const SWIM_END = 1020;
const SOUND_AT = 1052;
const SOUND_OUT = 1180;

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
  const w = Math.max(280, text.length * 54 + 120);

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
          border: "9px solid #2c6e7a",
          borderRadius: 54,
          textAlign: "center",
          fontFamily: fonts.display,
          fontSize: 80,
          lineHeight: 1,
          color: "#2c6e7a",
          boxShadow: "0 14px 0 rgba(30,80,90,.18)",
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
            borderTop: "48px solid #2c6e7a",
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

/** Which creatures swim mid-water vs sit/crawl on the seabed. */
const SWIMMERS = new Set([
  "whale", "dolphin", "jellyfish", "shark", "squid", "clownfish",
]);

const MidBeat: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const onHabitat = frame < HABITAT_OUT;
  const swims = SWIMMERS.has(id);

  const t = interpolate(frame, [SWIM_START, SWIM_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(t, [0, 1], [1740, 880]);
  const bob = Math.sin(frame / 9) * (swims ? 20 : 8);
  const baseY = swims ? 420 : GROUND_Y - 60;

  const shout = spring({
    frame: frame - SOUND_AT,
    fps: 30,
    config: { damping: 7, mass: 0.4, stiffness: 210 },
  });
  const hop = Math.sin(shout * Math.PI) * 36;
  const y = baseY + bob - hop;

  return (
    <>
      {onHabitat ? (
        <SeaHabitat
          id={id}
          x={interpolate(frame, [800, HABITAT_OUT], [40, -120])}
        />
      ) : null}

      {onHabitat ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <SeaDefs />
          <AnimalDefs />
          <Item subject={seaSubject} id={id} x={x} y={y} size={1.3} />
        </svg>
      ) : null}

      {onHabitat ? (
        <SpeechBubble text={SEA_SOUND[id]} x={x} y={y - 130} />
      ) : null}
    </>
  );
};

export const seaSubject: GuessSubject = {
  key: "sea",
  titleWord: "SEA LIFE",
  titleLetters: [
    ["#5aa0c8", "#3d7a9e"],
    ["#ea5b52", "#c23f38"],
    ["#f3c93f", "#cfa423"],
    ["#4a9450", "#357038"],
    ["#8b58b3", "#6b3d92"],
    ["#e07f9c", "#bb5c78"],
    ["#ea8a3c", "#c96a22"],
  ],
  Defs: () => (
    <>
      <SeaDefs />
      <AnimalDefs />
    </>
  ),
  art: SEA_ART,
  names: SEA_NAME,
  boardOrder: [
    "octopus", "crab", "starfish", "seahorse",
    "whale", "dolphin", "jellyfish", "turtle",
    "shark", "squid", "lobster", "clownfish",
  ],
  slotScale: {
    octopus: 0.86, crab: 0.92, starfish: 0.9, seahorse: 0.84,
    whale: 0.9, dolphin: 0.9, jellyfish: 0.84, turtle: 0.9,
    shark: 0.9, squid: 0.82, lobster: 0.84, clownfish: 0.9,
  },
  heroScale: {
    octopus: 2.2, crab: 2.3, starfish: 2.15, seahorse: 2.1,
    whale: 2.1, dolphin: 2.1, jellyfish: 2.1, turtle: 2.2,
    shark: 2.1, squid: 2.0, lobster: 2.1, clownfish: 2.35,
  },
  rounds: [
    { id: "octopus", drifter: "bee" },
    { id: "shark", drifter: "airplane" },
    { id: "crab", drifter: "butterfly" },
    { id: "starfish", drifter: "kite" },
    { id: "clownfish", drifter: "ladybug" },
    { id: "seahorse", drifter: "snail" },
    { id: "whale", drifter: "bee" },
    { id: "turtle", drifter: "crab" },
    { id: "dolphin", drifter: "bunny" },
    { id: "jellyfish", drifter: "dino" },
    { id: "lobster", drifter: "butterfly" },
    { id: "squid", drifter: "kite" },
  ],
  MidBeat,
  ringItems: [
    { id: "octopus", x: 92, y: 120, s: 0.62, r: -8 },
    { id: "turtle", x: 78, y: 432, s: 0.62, r: -12 },
    { id: "starfish", x: 128, y: 700, s: 0.6, r: 8 },
    { id: "crab", x: 100, y: 930, s: 0.6, r: -6 },
    { id: "seahorse", x: 372, y: 74, s: 0.5, r: 6 },
    { id: "jellyfish", x: 660, y: 78, s: 0.54, r: -8 },
    { id: "whale", x: 952, y: 66, s: 0.56, r: 9 },
    { id: "dolphin", x: 1246, y: 72, s: 0.56, r: -7 },
    { id: "lobster", x: 1524, y: 88, s: 0.56, r: 5 },
    { id: "shark", x: 1812, y: 216, s: 0.58, r: 7 },
    { id: "squid", x: 1832, y: 524, s: 0.58, r: -9 },
    { id: "clownfish", x: 1808, y: 788, s: 0.6, r: 10 },
  ],
};

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Item } from "../guess/Board";
import { fonts } from "../guess/palette";
import { GROUND_Y, H, W } from "../guess/scene";
import type { GuessSubject } from "../guess/types";
import { DinoDefs, DINO_ART, DINO_NAME, DINO_SOUND } from "./dinosaurs";
import { DinoHabitat } from "./habitats";

/**
 * Dinosaurs. The middle of each round shows where it lived — ferns, a
 * volcano, a swamp — with the dinosaur stomping across, then ends on its
 * roar (or honk, or snort) in a speech bubble.
 */

const HABITAT_OUT = 1206;
const WALK_START = 824;
const WALK_END = 1020;
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
    config: { damping: 8, mass: 0.42, stiffness: 220 },
  });
  const fade = interpolate(frame, [SOUND_OUT, SOUND_OUT + 12], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (pop <= 0.01 || fade <= 0) return null;
  const w = Math.max(300, text.length * 58 + 120);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -100%) scale(${0.4 + pop * 0.65})`,
        opacity: fade,
      }}
    >
      <div
        style={{
          position: "relative",
          width: w,
          padding: "26px 30px 34px",
          background: "#ffffff",
          border: "9px solid #6b4a2f",
          borderRadius: 54,
          textAlign: "center",
          fontFamily: fonts.display,
          fontSize: 84,
          lineHeight: 1,
          color: "#6b4a2f",
          boxShadow: "0 14px 0 rgba(70,50,30,.18)",
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
            borderTop: "48px solid #6b4a2f",
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
  const onHabitat = frame < HABITAT_OUT;
  const flies = id === "pterodactyl";

  const walkT = interpolate(frame, [WALK_START, WALK_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(walkT, [0, 1], [1740, 880]);
  const stomp = flies ? 0 : Math.abs(Math.sin(frame / 5)) * (walkT < 1 ? 16 : 0);
  const bob = flies ? Math.sin(frame / 8) * 14 : 0;

  const shout = spring({
    frame: frame - SOUND_AT,
    fps: 30,
    config: { damping: 7, mass: 0.4, stiffness: 210 },
  });
  const hop = Math.sin(shout * Math.PI) * 40;
  const y = (flies ? 420 : GROUND_Y - 110) - stomp - hop + bob;

  return (
    <>
      {onHabitat ? (
        <DinoHabitat
          id={id}
          x={interpolate(frame, [800, HABITAT_OUT], [40, -120])}
        />
      ) : null}

      {onHabitat ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <DinoDefs />
          <Item subject={dinoSubject} id={id} x={x} y={y} size={1.3} />
        </svg>
      ) : null}

      {onHabitat ? (
        <SpeechBubble text={DINO_SOUND[id]} x={x} y={y - 130} />
      ) : null}
    </>
  );
};

export const dinoSubject: GuessSubject = {
  key: "dino",
  titleWord: "DINOSAURS",
  titleLetters: [
    ["#6fb84a", "#4f9236"],
    ["#ea8a3c", "#c96a22"],
    ["#5aa8bd", "#3f8798"],
    ["#d9a836", "#b8871f"],
    ["#ab6cbd", "#8a4f9c"],
    ["#d9647e", "#b84a62"],
    ["#c25b3c", "#a1462b"],
  ],
  Defs: DinoDefs,
  art: DINO_ART,
  names: DINO_NAME,
  boardOrder: [
    "trex", "triceratops", "stegosaurus", "brachiosaurus",
    "velociraptor", "pterodactyl", "ankylosaurus", "spinosaurus",
    "diplodocus", "parasaurolophus", "iguanodon", "allosaurus",
  ],
  slotScale: {
    trex: 0.9, triceratops: 0.92, stegosaurus: 0.92, brachiosaurus: 0.8,
    velociraptor: 0.9, pterodactyl: 0.82, ankylosaurus: 0.9, spinosaurus: 0.85,
    diplodocus: 0.82, parasaurolophus: 0.9, iguanodon: 0.9, allosaurus: 0.88,
  },
  heroScale: {
    trex: 2.2, triceratops: 2.3, stegosaurus: 2.3, brachiosaurus: 1.85,
    velociraptor: 2.3, pterodactyl: 2.0, ankylosaurus: 2.15, spinosaurus: 2.0,
    diplodocus: 1.9, parasaurolophus: 2.15, iguanodon: 2.2, allosaurus: 2.2,
  },
  rounds: [
    { id: "trex", drifter: "bee" },
    { id: "triceratops", drifter: "airplane" },
    { id: "pterodactyl", drifter: "butterfly" },
    { id: "stegosaurus", drifter: "kite" },
    { id: "velociraptor", drifter: "ladybug" },
    { id: "brachiosaurus", drifter: "snail" },
    { id: "ankylosaurus", drifter: "bee" },
    { id: "spinosaurus", drifter: "crab" },
    { id: "parasaurolophus", drifter: "bunny" },
    { id: "diplodocus", drifter: "dino" },
    { id: "iguanodon", drifter: "butterfly" },
    { id: "allosaurus", drifter: "kite" },
  ],
  MidBeat,
  ringItems: [
    { id: "trex", x: 92, y: 120, s: 0.62, r: -8 },
    { id: "triceratops", x: 78, y: 432, s: 0.62, r: -12 },
    { id: "pterodactyl", x: 128, y: 700, s: 0.6, r: 8 },
    { id: "stegosaurus", x: 100, y: 930, s: 0.6, r: -6 },
    { id: "velociraptor", x: 372, y: 74, s: 0.56, r: 6 },
    { id: "brachiosaurus", x: 660, y: 78, s: 0.5, r: -8 },
    { id: "ankylosaurus", x: 952, y: 66, s: 0.58, r: 9 },
    { id: "spinosaurus", x: 1246, y: 72, s: 0.56, r: -7 },
    { id: "parasaurolophus", x: 1524, y: 88, s: 0.58, r: 5 },
    { id: "diplodocus", x: 1812, y: 216, s: 0.5, r: 7 },
    { id: "iguanodon", x: 1832, y: 524, s: 0.6, r: -9 },
    { id: "allosaurus", x: 1808, y: 788, s: 0.6, r: 10 },
  ],
};

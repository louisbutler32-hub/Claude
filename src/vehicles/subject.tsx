import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Item } from "../guess/Board";
import { fonts } from "../guess/palette";
import { GROUND_Y, H, W } from "../guess/scene";
import type { GuessSubject } from "../guess/types";
import { VehicleHabitat, vehicleKind } from "./habitats";
import { VehicleDefs, VEHICLE_ART, VEHICLE_NAME, VEHICLE_SOUND } from "./vehicles";

/**
 * Vehicles. The middle of each round shows where it travels — road, sky,
 * track or water — with the vehicle driving across, then ends on the
 * sound it makes in a speech bubble, same as the animal episode.
 */

const HABITAT_OUT = 1206;
const DRIVE_START = 824;
const DRIVE_END = 1020;
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
  const w = Math.max(300, text.length * 56 + 120);

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
          border: "9px solid #3d5c6c",
          borderRadius: 54,
          textAlign: "center",
          fontFamily: fonts.display,
          fontSize: 78,
          lineHeight: 1,
          color: "#3d5c6c",
          boxShadow: "0 14px 0 rgba(50,70,80,.18)",
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
            borderTop: "48px solid #3d5c6c",
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
  const kind = vehicleKind(id);
  const flies = kind === "sky";

  const driveT = interpolate(frame, [DRIVE_START, DRIVE_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(driveT, [0, 1], [1760, 860]);
  const bob = flies ? Math.sin(frame / 7) * 10 : 0;
  const wheelBounce = flies ? 0 : Math.abs(Math.sin(frame / 3.4)) * (driveT < 1 ? 6 : 0);
  const y =
    (flies ? 420 : GROUND_Y + (kind === "track" ? 62 : 60)) - wheelBounce + bob;

  const shout = spring({
    frame: frame - SOUND_AT,
    fps: 30,
    config: { damping: 7, mass: 0.4, stiffness: 210 },
  });
  const hop = Math.sin(shout * Math.PI) * 34;

  return (
    <>
      {onHabitat ? (
        <VehicleHabitat
          id={id}
          x={interpolate(frame, [800, HABITAT_OUT], [0, -240])}
        />
      ) : null}

      {onHabitat ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <VehicleDefs />
          <Item
            subject={vehicleSubject}
            id={id}
            x={x}
            y={y - hop}
            size={1.35}
          />
        </svg>
      ) : null}

      {onHabitat ? (
        <SpeechBubble text={VEHICLE_SOUND[id]} x={x} y={y - hop - 150} />
      ) : null}
    </>
  );
};

export const vehicleSubject: GuessSubject = {
  key: "veh",
  titleWord: "VEHICLES",
  titleLetters: [
    ["#ea5b52", "#c23f38"],
    ["#f3c93f", "#cfa423"],
    ["#5aa0c8", "#3d7a9e"],
    ["#6fb845", "#4f9236"],
    ["#8b58b3", "#6b3d92"],
    ["#e07f9c", "#bb5c78"],
    ["#ea8a3c", "#c96a22"],
    ["#3f83bd", "#2d6699"],
  ],
  Defs: VehicleDefs,
  art: VEHICLE_ART,
  names: VEHICLE_NAME,
  boardOrder: [
    "car", "bus", "fireEngine", "policeCar",
    "train", "airplane", "helicopter", "boat",
    "tractor", "digger", "motorcycle", "bicycle",
  ],
  slotScale: {
    car: 0.9, bus: 0.86, fireEngine: 0.86, policeCar: 0.82,
    train: 0.82, airplane: 0.9, helicopter: 0.86, boat: 0.86,
    tractor: 0.84, digger: 0.8, motorcycle: 0.84, bicycle: 0.82,
  },
  heroScale: {
    car: 2.15, bus: 1.95, fireEngine: 1.9, policeCar: 2.1,
    train: 1.7, airplane: 1.85, helicopter: 1.85, boat: 1.9,
    tractor: 1.9, digger: 1.75, motorcycle: 1.9, bicycle: 1.85,
  },
  rounds: [
    { id: "car", drifter: "bee" },
    { id: "airplane", drifter: "kite" },
    { id: "bus", drifter: "butterfly" },
    { id: "fireEngine", drifter: "ladybug" },
    { id: "boat", drifter: "snail" },
    { id: "policeCar", drifter: "bee" },
    { id: "train", drifter: "crab" },
    { id: "tractor", drifter: "bunny" },
    { id: "helicopter", drifter: "dino" },
    { id: "digger", drifter: "butterfly" },
    { id: "bicycle", drifter: "kite" },
    { id: "motorcycle", drifter: "airplane" },
  ],
  MidBeat,
  ringItems: [
    { id: "car", x: 92, y: 120, s: 0.66, r: -8 },
    { id: "train", x: 78, y: 432, s: 0.6, r: -12 },
    { id: "boat", x: 128, y: 700, s: 0.6, r: 8 },
    { id: "tractor", x: 100, y: 930, s: 0.6, r: -6 },
    { id: "bus", x: 372, y: 74, s: 0.58, r: 6 },
    { id: "bicycle", x: 660, y: 78, s: 0.54, r: -8 },
    { id: "airplane", x: 952, y: 66, s: 0.6, r: 9 },
    { id: "digger", x: 1246, y: 72, s: 0.56, r: -7 },
    { id: "helicopter", x: 1524, y: 88, s: 0.56, r: 5 },
    { id: "fireEngine", x: 1812, y: 216, s: 0.64, r: 7 },
    { id: "policeCar", x: 1832, y: 524, s: 0.62, r: -9 },
    { id: "motorcycle", x: 1808, y: 788, s: 0.6, r: 10 },
  ],
};

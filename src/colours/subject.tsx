import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Item } from "../guess/Board";
import { AnimalDefs } from "../animals/animals";
import { DinoDefs } from "../dinosaurs/dinosaurs";
import { fonts } from "../guess/palette";
import { GROUND_Y, H, W } from "../guess/scene";
import type { GuessSubject } from "../guess/types";
import { SeaDefs } from "../sea/sea";
import { VeggieDefs } from "../veggies/veggies";
import { VehicleDefs } from "../vehicles/vehicles";
import { COLOURS, type ColourDef } from "./colours";

/**
 * Colours. There is no shadow beat — a silhouette has no colour, so
 * `noSilhouette` keeps the hero visible in full colour from the moment it
 * rises. The middle of each round is a soft wash of the colour behind the
 * hero, joined by two "friends" — the same colour turning up on a
 * completely different cast member — which is the actual lesson.
 */

const byId: Record<string, ColourDef> = Object.fromEntries(
  COLOURS.map((c) => [c.id, c])
);

const HERO_X = 620;
const HERO_Y = 700;
const FRIEND_START = 840;
const FRIEND_STEP = 130;

/** Every episode's gradients live behind one mount, since a friend can be
 *  drawn from any of the five casts. */
const AllDefs: React.FC = () => (
  <>
    <VeggieDefs />
    <AnimalDefs />
    <VehicleDefs />
    <DinoDefs />
    <SeaDefs />
  </>
);

const Wash: React.FC<{ hex: string }> = ({ hex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 16, mass: 1 } });
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <circle
        cx={W / 2}
        cy={H / 2 - 40}
        r={620 * (0.7 + pop * 0.3)}
        fill={hex}
        opacity={0.16}
        filter="url(#wobbleSoft)"
      />
    </svg>
  );
};

const Caption: React.FC<{ text: string; x: number; y: number; start: number }> = ({
  text,
  x,
  y,
  start,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - start,
    fps,
    config: { damping: 12, mass: 0.5 },
  });
  if (s <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, 0) scale(${0.6 + s * 0.4})`,
        opacity: s,
        fontFamily: fonts.display,
        fontSize: 40,
        color: "#4a3b30",
        textShadow: "0 2px 0 rgba(255,255,255,.7)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/** "Rainbow!" — arc of every earlier hero, in its own colour, underneath. */
const RainbowRecap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prior = COLOURS.filter((c) => c.id !== "rainbow");
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <AllDefs />
      {prior.map((c, i) => {
        const t = i / (prior.length - 1);
        const x = 380 + t * (W - 760);
        const y = 660 - Math.sin(t * Math.PI) * 220;
        const pop = spring({
          frame: frame - 60 - i * 5,
          fps,
          config: { damping: 11, mass: 0.4, stiffness: 160 },
        });
        return (
          <g
            key={c.id}
            transform={`translate(${x} ${y}) scale(${0.5 * (0.5 + pop * 0.5)})`}
            opacity={pop}
          >
            <c.Hero />
          </g>
        );
      })}
    </svg>
  );
};

const MidBeat: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = byId[id];
  const bob = Math.sin(frame / 12) * 10;

  const heroPop = spring({
    frame,
    fps,
    config: { damping: 13, mass: 0.6 },
  });

  if (id === "rainbow") {
    return (
      <>
        <Wash hex={c.hex} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <AllDefs />
          <g
            transform={`translate(${W / 2} 420) scale(${
              c.heroScale * 0.7 * heroPop
            })`}
          >
            <c.Hero />
          </g>
        </svg>
        <RainbowRecap />
      </>
    );
  }

  return (
    <>
      <Wash hex={c.hex} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <AllDefs />
        <g transform={`translate(${HERO_X} ${HERO_Y + bob}) scale(${0.72 * heroPop})`}>
          <c.Hero />
        </g>
        {c.friends.map((f, i) => {
          const start = FRIEND_START + i * FRIEND_STEP;
          const pop = spring({
            frame: frame - start,
            fps,
            config: { damping: 10, mass: 0.5, stiffness: 170 },
          });
          const fx = 1220 + i * 320;
          const fy = 660 + Math.sin((frame - start) / 11) * 8 * Math.min(1, pop);
          if (pop <= 0.005) return null;
          return (
            <g
              key={f.label}
              transform={`translate(${fx} ${fy - (1 - pop) * 140}) scale(${
                0.5 * (0.4 + pop * 0.6)
              })`}
              opacity={Math.min(1, pop * 1.6)}
            >
              <f.Art />
            </g>
          );
        })}
      </svg>
      {c.friends.map((f, i) => {
        const start = FRIEND_START + i * FRIEND_STEP + 14;
        const fx = 1220 + i * 320;
        return (
          <Caption key={f.label} text={f.label} x={fx} y={790} start={start} />
        );
      })}
    </>
  );
};

export const colourSubject: GuessSubject = {
  key: "col",
  titleWord: "COLOURS",
  titleLetters: [
    ["#ea5b52", "#c23f38"],
    ["#ef8a3c", "#c96a22"],
    ["#f3c93f", "#cfa423"],
    ["#4a9450", "#357038"],
    ["#3f83bd", "#2d6699"],
    ["#8b58b3", "#6b3d92"],
    ["#e07f9c", "#bb5c78"],
  ],
  Defs: AllDefs,
  art: Object.fromEntries(COLOURS.map((c) => [c.id, c.Hero])),
  names: Object.fromEntries(COLOURS.map((c) => [c.id, c.name])),
  boardOrder: COLOURS.map((c) => c.id),
  slotScale: Object.fromEntries(COLOURS.map((c) => [c.id, c.slotScale])),
  heroScale: Object.fromEntries(COLOURS.map((c) => [c.id, c.heroScale])),
  // reveal order matches the board, red-through-purple then black, white,
  // grey and rainbow last — colour benefits from a stable order the way
  // shape-guessing deliberately doesn't
  rounds: COLOURS.map((c) => ({ id: c.id, drifter: c.drifter })),
  MidBeat,
  noSilhouette: true,
  question: "What colour is it?",
  ringItems: [
    { id: "red", x: 92, y: 120, s: 0.62, r: -8 },
    { id: "orange", x: 78, y: 432, s: 0.62, r: -12 },
    { id: "yellow", x: 128, y: 700, s: 0.6, r: 8 },
    { id: "green", x: 100, y: 930, s: 0.6, r: -6 },
    { id: "blue", x: 372, y: 74, s: 0.56, r: 6 },
    { id: "purple", x: 660, y: 78, s: 0.54, r: -8 },
    { id: "pink", x: 952, y: 66, s: 0.58, r: 9 },
    { id: "brown", x: 1246, y: 72, s: 0.56, r: -7 },
    { id: "black", x: 1524, y: 88, s: 0.56, r: 5 },
    { id: "white", x: 1812, y: 216, s: 0.6, r: 7 },
    { id: "grey", x: 1832, y: 524, s: 0.56, r: -9 },
    { id: "rainbow", x: 1808, y: 788, s: 0.5, r: 10 },
  ],
};

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimalDefs, ANIMAL_ART } from "../animals/animals";
import { fonts } from "../guess/palette";
import { BushPair, GROUND_Y, H, W } from "../guess/scene";
import type { GuessSubject } from "../guess/types";
import { VeggieDefs, VEGGIE_ART, type VeggieId } from "../veggies/veggies";
import {
  COUNT_ITEM,
  COUNT_START,
  countSlot,
  countStagger,
  NUMBER_ART,
  NUMBER_COLORS,
  NUMBER_NAME,
  NUMBER_VALUES,
} from "./numbers";

/**
 * Numbers. The middle of each round is the counting: that many things pop
 * in one at a time, each landing on the frame the narrator says its number,
 * with a tally building underneath.
 */

const MID_OUT = 1206;

const Defs: React.FC = () => (
  <>
    <VeggieDefs />
    <AnimalDefs />
  </>
);

const MidBeat: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Number(id);
  const stagger = countStagger(n);
  const item = COUNT_ITEM[id];
  const Art =
    item.from === "veg"
      ? VEGGIE_ART[item.id as VeggieId]
      : ANIMAL_ART[item.id];
  const [fill, shade] = NUMBER_COLORS[n];

  if (frame >= MID_OUT) return <BushPair />;

  // how many have landed so far — the running tally
  const shown = Math.max(
    0,
    Math.min(n, Math.floor((frame - COUNT_START) / stagger) + 1)
  );

  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Defs />
        {NUMBER_VALUES.slice(0, n).map((_, i) => {
          const pop = spring({
            frame: frame - COUNT_START - i * stagger,
            fps,
            config: { damping: 9, mass: 0.45, stiffness: 200 },
          });
          if (pop <= 0.001) return null;
          const slot = countSlot(i, n);
          const drop = (1 - pop) * -160;
          return (
            <g
              key={i}
              transform={`translate(${slot.x} ${slot.y + drop}) scale(${
                slot.scale * (0.5 + pop * 0.5)
              })`}
              opacity={Math.min(1, pop * 2)}
            >
              <Art />
            </g>
          );
        })}
      </svg>

      {/* the tally, counting up as they land */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: GROUND_Y - 268,
          width: "100%",
          textAlign: "center",
          fontFamily: fonts.script,
          fontWeight: 800,
          fontSize: 232,
          lineHeight: 1,
          color: fill,
          WebkitTextStroke: `18px ${shade}`,
          paintOrder: "stroke fill",
          textShadow: `0 14px 0 ${shade}`,
          opacity: shown > 0 ? 1 : 0,
        }}
      >
        {shown}
      </div>
    </>
  );
};

export const numberSubject: GuessSubject = {
  key: "num",
  titleWord: "NUMBERS",
  titleLetters: [
    ["#ef8a3c", "#c96a22"],
    ["#ea5b52", "#c23f38"],
    ["#4a9450", "#357038"],
    ["#f3c93f", "#cfa423"],
    ["#5aa0c8", "#3d7a9e"],
    ["#8b58b3", "#6b3d92"],
    ["#e07f9c", "#bb5c78"],
  ],
  Defs,
  art: NUMBER_ART,
  names: NUMBER_NAME,
  // numbers are the one subject that fills the board in its natural order
  boardOrder: NUMBER_VALUES.map(String),
  slotScale: Object.fromEntries(
    NUMBER_VALUES.map((v) => [String(v), v >= 10 ? 1.15 : 0.98])
  ),
  heroScale: Object.fromEntries(
    NUMBER_VALUES.map((v) => [String(v), v >= 10 ? 3.3 : 2.9])
  ),
  rounds: NUMBER_VALUES.map((v, i) => ({
    id: String(v),
    drifter: (
      [
        "bee", "airplane", "butterfly", "kite", "ladybug", "snail",
        "bee", "crab", "butterfly", "bunny", "dino", "kite",
      ] as const
    )[i],
  })),
  MidBeat,
  ringItems: NUMBER_VALUES.map((v, i) => {
    const ring = [
      { x: 92, y: 120, s: 0.5, r: -8 },
      { x: 78, y: 432, s: 0.5, r: -12 },
      { x: 118, y: 702, s: 0.46, r: 8 },
      { x: 100, y: 930, s: 0.48, r: -6 },
      { x: 372, y: 74, s: 0.44, r: 6 },
      { x: 660, y: 78, s: 0.44, r: -8 },
      { x: 952, y: 66, s: 0.46, r: 9 },
      { x: 1246, y: 72, s: 0.44, r: -7 },
      { x: 1524, y: 88, s: 0.44, r: 5 },
      { x: 1812, y: 216, s: 0.52, r: 7 },
      { x: 1832, y: 524, s: 0.5, r: -9 },
      { x: 1808, y: 788, s: 0.48, r: 10 },
    ][i];
    return { id: String(v), ...ring };
  }),
};

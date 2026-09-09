import React from "react";
import { Body } from "../guess/art";
import { fonts } from "../guess/palette";
import type { GuessArt } from "../guess/types";

/**
 * The numerals 1-12.
 *
 * Unlike the other episodes the thing being guessed is a symbol, not a
 * creature, so the numerals stay plain and fat — legible first, and the
 * personality comes from the things being counted underneath them.
 */

export const NUMBER_VALUES = Array.from({ length: 12 }, (_, i) => i + 1);

/** [fill, keyline] per numeral. */
export const NUMBER_COLORS: Record<number, [string, string]> = {
  1: ["#ef8a3c", "#c96a22"],
  2: ["#ea5b52", "#c23f38"],
  3: ["#4a9450", "#357038"],
  4: ["#f3c93f", "#cfa423"],
  5: ["#5aa0c8", "#3d7a9e"],
  6: ["#8b58b3", "#6b3d92"],
  7: ["#e07f9c", "#bb5c78"],
  8: ["#5da648", "#427f33"],
  9: ["#f0913f", "#c96a22"],
  10: ["#4fa8a0", "#357e78"],
  11: ["#d4665c", "#a84a42"],
  12: ["#7a6bc4", "#57499b"],
};

export const NumberDefs: React.FC = () => <defs />;

const numeral = (value: number): GuessArt =>
  function Numeral({ sil }) {
    const [fill, shade] = NUMBER_COLORS[value];
    // two-digit numerals need to be narrower so they hold the same box
    const wide = value >= 10;
    return (
      <Body sil={sil}>
        <g transform={wide ? "scale(0.62 1)" : undefined}>
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={fonts.script}
            fontWeight={800}
            fontSize={250}
            fill={fill}
            stroke={shade}
            strokeWidth={22}
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            {value}
          </text>
        </g>
      </Body>
    );
  };

export const NUMBER_ART: Record<string, GuessArt> = Object.fromEntries(
  NUMBER_VALUES.map((v) => [String(v), numeral(v)])
);

export const NUMBER_NAME: Record<string, string> = {
  "1": "One", "2": "Two", "3": "Three", "4": "Four",
  "5": "Five", "6": "Six", "7": "Seven", "8": "Eight",
  "9": "Nine", "10": "Ten", "11": "Eleven", "12": "Twelve",
};

/** What each round counts — a different thing every time, for variety. */
export const COUNT_ITEM: Record<string, { from: "veg" | "animal"; id: string }> = {
  "1": { from: "veg", id: "carrot" },
  "2": { from: "veg", id: "tomato" },
  "3": { from: "animal", id: "duck" },
  "4": { from: "veg", id: "broccoli" },
  "5": { from: "animal", id: "fish" },
  "6": { from: "veg", id: "pumpkin" },
  "7": { from: "animal", id: "frog" },
  "8": { from: "veg", id: "corn" },
  "9": { from: "veg", id: "mushroom" },
  "10": { from: "veg", id: "peas" },
  "11": { from: "veg", id: "tomato" },
  "12": { from: "veg", id: "carrot" },
};

/** Plural used by the narrator: "three ducks". */
export const COUNT_WORD: Record<string, string> = {
  "1": "carrot", "2": "tomatoes", "3": "ducks", "4": "broccolis",
  "5": "fish", "6": "pumpkins", "7": "frogs", "8": "corn cobs",
  "9": "mushrooms", "10": "pea pods", "11": "tomatoes", "12": "carrots",
};

/* ── counting layout ──────────────────────────────────────────────── */
/** Frame (relative to the round) the counting starts. */
export const COUNT_START = 812;
/** Gap between one item appearing and the next. Mirrored in the audio build. */
export const countStagger = (n: number) =>
  Math.max(32, Math.min(64, Math.round(360 / n)));

/** Where item `i` of `n` sits, laid out in rows of at most six. */
export const countSlot = (i: number, n: number) => {
  const perRow = n <= 6 ? n : Math.ceil(n / 2);
  const rows = Math.ceil(n / perRow);
  const row = Math.floor(i / perRow);
  const col = i % perRow;
  const inRow = row === rows - 1 ? n - perRow * row : perRow;
  const gap = Math.min(250, 1500 / Math.max(inRow, 1));
  const x = 960 + (col - (inRow - 1) / 2) * gap;
  const y = rows === 1 ? 430 : 336 + row * 250;
  return { x, y, scale: n <= 4 ? 0.95 : n <= 8 ? 0.78 : 0.66 };
};

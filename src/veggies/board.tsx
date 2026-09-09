import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { board as boardColors } from "./palette";
import { H, W } from "./scene";
import { Veggie, VeggieDefs, type VeggieId } from "./veggies";

/**
 * The collection board. Twelve silhouettes on a pink-framed sage panel;
 * one more of them turns into full colour at the end of every round, so
 * the board doubles as the progress bar for the whole video.
 */

/** Reading order on the board — 4 across, 3 down. */
export const BOARD_ORDER: VeggieId[] = [
  "carrot", "potato", "eggplant", "tomato",
  "peas", "pumpkin", "pepper", "broccoli",
  "onion", "mushroom", "corn", "cucumber",
];

const PANEL = { x: 307, y: 20, w: 1290, h: 860, r: 90 };
const BORDER = 34;
const COLS = 4;
const ROWS = 3;

export const slotIndex = (id: VeggieId) => BOARD_ORDER.indexOf(id);

/** Screen position of a board slot, in frame coordinates. */
export const slotPos = (id: VeggieId) => {
  const i = slotIndex(id);
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const innerX = PANEL.x + BORDER + 24;
  const innerY = PANEL.y + BORDER + 22;
  const innerW = PANEL.w - (BORDER + 24) * 2;
  const innerH = PANEL.h - (BORDER + 22) * 2;
  return {
    x: innerX + (col + 0.5) * (innerW / COLS),
    y: innerY + (row + 0.5) * (innerH / ROWS),
  };
};

/** Per-vegetable scale so the odd shapes all read at the same weight. */
const SLOT_SCALE: Record<VeggieId, number> = {
  carrot: 1.0,
  potato: 0.97,
  eggplant: 0.92,
  tomato: 1.05,
  peas: 0.9,
  pumpkin: 1.02,
  pepper: 1.0,
  broccoli: 1.0,
  onion: 0.97,
  mushroom: 0.95,
  corn: 0.92,
  cucumber: 0.9,
};

export const Board: React.FC<{
  /** vegetables already coloured in when this board comes up */
  solved: VeggieId[];
  /** the one that fills in during this board beat */
  filling?: VeggieId;
  /** frame (relative to the sequence) the board starts rising */
  riseAt: number;
  /** frame the silhouettes start popping in */
  popAt: number;
  /** frame the new vegetable lands in its slot */
  landAt: number;
  /** frame the board drops back down */
  exitAt: number;
}> = ({ solved, filling, riseAt, popAt, landAt, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = spring({
    frame: frame - riseAt,
    fps,
    config: { damping: 14, mass: 0.9, stiffness: 90 },
  });
  const exit = spring({
    frame: frame - exitAt,
    fps,
    config: { damping: 16, mass: 0.8 },
  });
  const y = interpolate(rise, [0, 1], [H + 120, 0]) + exit * (H + 160);
  const tilt = interpolate(rise, [0, 0.7, 1], [6, -1.5, 0]);

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <VeggieDefs />
      <g transform={`translate(0 ${y}) rotate(${tilt} 960 900)`}>
        {/* post into the ground */}
        <rect
          x={930}
          y={PANEL.y + PANEL.h - 20}
          width={60}
          height={80}
          rx={16}
          fill={boardColors.border}
        />
        <g filter="url(#wobble)">
          <rect
            x={PANEL.x}
            y={PANEL.y}
            width={PANEL.w}
            height={PANEL.h}
            rx={PANEL.r}
            fill={boardColors.border}
          />
          <rect
            x={PANEL.x + BORDER}
            y={PANEL.y + BORDER}
            width={PANEL.w - BORDER * 2}
            height={PANEL.h - BORDER * 2}
            rx={PANEL.r - BORDER * 0.6}
            fill={boardColors.fill}
          />
        </g>

        {BOARD_ORDER.map((id, i) => {
          const p = slotPos(id);
          const pop = spring({
            frame: frame - popAt - i * 2.2,
            fps,
            config: { damping: 12, mass: 0.5, stiffness: 150 },
          });
          if (pop <= 0.001) return null;

          const isSolved = solved.includes(id);
          const isFilling = filling === id;
          // the filling one stays a silhouette until it is landed on
          const showColour = isSolved || (isFilling && frame >= landAt);
          const landPop = isFilling
            ? spring({
                frame: frame - landAt,
                fps,
                config: { damping: 9, mass: 0.4, stiffness: 190 },
              })
            : 0;
          const bump = isFilling ? 1 + Math.sin(landPop * Math.PI) * 0.22 : 1;

          return (
            <g key={id} transform={`translate(${p.x} ${p.y})`}>
              <g transform={`scale(${(0.5 + pop * 0.5) * bump})`}>
                <Veggie
                  id={id}
                  size={SLOT_SCALE[id]}
                  sil={!showColour}
                  opacity={pop}
                />
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/**
 * The just-revealed vegetable flying across the frame and dropping into
 * its slot on the board.
 */
export const FlyToSlot: React.FC<{
  id: VeggieId;
  start: number;
  landAt: number;
  fromX?: number;
  fromY?: number;
}> = ({ id, start, landAt, fromX = 120, fromY = 620 }) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > landAt) return null;
  const t = interpolate(frame, [start, landAt], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const target = slotPos(id);
  const ease = t * t * (3 - 2 * t);
  const x = interpolate(ease, [0, 1], [fromX, target.x]);
  const arc = Math.sin(t * Math.PI) * 190;
  const y = interpolate(ease, [0, 1], [fromY, target.y]) - arc;
  const size = interpolate(ease, [0, 1], [0.62, SLOT_SCALE[id]]);
  const spin = interpolate(t, [0, 1], [-22, 0]);

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <VeggieDefs />
      <Veggie id={id} x={x} y={y} size={size} rotate={spin} />
    </svg>
  );
};

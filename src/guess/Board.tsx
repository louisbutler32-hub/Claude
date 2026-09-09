import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { board as boardColors } from "./palette";
import { H, W } from "./scene";
import type { GuessSubject } from "./types";

/**
 * The collection board. Twelve silhouettes on a pink-framed sage panel; one
 * more turns to full colour every round, so the board doubles as the
 * progress bar for the whole episode.
 */

const PANEL = { x: 307, y: 20, w: 1290, h: 860, r: 90 };
const BORDER = 34;
const COLS = 4;
const ROWS = 3;

/** Screen position of a board slot, in frame coordinates. */
export const slotPos = (subject: GuessSubject, id: string) => {
  const i = subject.boardOrder.indexOf(id);
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

/** Draw one of a subject's items anywhere on screen. */
export const Item: React.FC<{
  subject: GuessSubject;
  id: string;
  x?: number;
  y?: number;
  size?: number;
  rotate?: number;
  sil?: boolean;
  opacity?: number;
}> = ({ subject, id, x = 0, y = 0, size = 1, rotate = 0, sil, opacity = 1 }) => {
  const Art = subject.art[id];
  if (!Art) return null;
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${size})`}
      opacity={opacity}
    >
      <Art sil={sil} />
    </g>
  );
};

export const Board: React.FC<{
  subject: GuessSubject;
  /** already coloured in when this board comes up */
  solved: string[];
  /** the one that fills in during this board beat */
  filling?: string;
  riseAt: number;
  popAt: number;
  landAt: number;
  exitAt: number;
}> = ({ subject, solved, filling, riseAt, popAt, landAt, exitAt }) => {
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
      <subject.Defs />
      <g transform={`translate(0 ${y}) rotate(${tilt} 960 900)`}>
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

        {subject.boardOrder.map((id, i) => {
          const p = slotPos(subject, id);
          const pop = spring({
            frame: frame - popAt - i * 2.2,
            fps,
            config: { damping: 12, mass: 0.5, stiffness: 150 },
          });
          if (pop <= 0.001) return null;

          const isFilling = filling === id;
          const showColour = solved.includes(id) || (isFilling && frame >= landAt);
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
                <Item
                  subject={subject}
                  id={id}
                  size={subject.slotScale[id]}
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

/** The just-revealed item flying across and dropping into its slot. */
export const FlyToSlot: React.FC<{
  subject: GuessSubject;
  id: string;
  start: number;
  landAt: number;
  fromX?: number;
  fromY?: number;
}> = ({ subject, id, start, landAt, fromX = 130, fromY = 640 }) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > landAt) return null;
  const t = interpolate(frame, [start, landAt], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const target = slotPos(subject, id);
  const ease = t * t * (3 - 2 * t);
  const x = interpolate(ease, [0, 1], [fromX, target.x]);
  const arc = Math.sin(t * Math.PI) * 190;
  const y = interpolate(ease, [0, 1], [fromY, target.y]) - arc;
  const size = interpolate(ease, [0, 1], [0.62, subject.slotScale[id]]);

  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <subject.Defs />
      <Item
        subject={subject}
        id={id}
        x={x}
        y={y}
        size={size}
        rotate={interpolate(t, [0, 1], [-22, 0])}
      />
    </svg>
  );
};

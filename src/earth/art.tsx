import React from "react";
import { useCurrentFrame } from "remotion";
import { STROKE, blob, line, rng, smooth } from "../planets/kit";
import { bob } from "../planets/motion";

// The cast for "7 Ways the Earth Kills You Without Warning".
//
// Warmer and higher contrast than the killers kit — this one is allowed to be
// alarming — but it still draws phenomena rather than casualties. Nobody in
// this video is depicted dying.

export const PAPER = "#f6f2e9";
export const INK = "#16181c";
export const GREY = "#6d6a63";
export const FAINT = "#cdc7ba";
export const RED = "#d1402f";
export const AMBER = "#e08b2c";
export const GAS = "#b8c9a8";
export const WATER = "#4a86a8";
export const ROCK = "#9a8f7d";
export const SKY = "#cfe0ea";
export const NIGHT = "#1b2330";

export const Paper: React.FC<{ fill?: string }> = ({ fill = PAPER }) => (
  <rect x={0} y={0} width={1920} height={1080} fill={fill} />
);

/** A person. Faceless and small: a sense of scale, never a casualty. */
export const Figure: React.FC<{
  x: number;
  y: number;
  scale?: number;
  fill?: string;
  outline?: boolean;
}> = ({ x, y, scale = 1, fill = "#8d97a3", outline = true }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path
      d="M -52 0 q 0 -82 33 -101 q -17 -16 -17 -39 q 0 -36 36 -36 q 36 0 36 36 q 0 23 -17 39 q 33 19 33 101 Z"
      {...(outline ? line(STROKE - 2) : { stroke: "none" })}
      fill={fill}
    />
  </g>
);

/** Layered ground: rock, sand, whatever the beat needs. */
export const Strata: React.FC<{
  y: number;
  layers: { h: number; fill: string; label?: string }[];
  children?: React.ReactNode;
}> = ({ y, layers, children }) => {
  let top = y;
  return (
    <g>
      {layers.map((l, i) => {
        const edge = smooth([
          [-20, top],
          [560, top - 7],
          [1180, top + 6],
          [1940, top - 4],
        ]);
        const band = (
          <g key={i}>
            <path d={`${edge} L 1940 1120 L -20 1120 Z`} fill={l.fill} />
            <path d={edge} {...line(i === 0 ? STROKE : 3, i === 0 ? INK : "rgba(0,0,0,0.22)")} />
            {l.label ? (
              <text
                x={1780}
                y={top + l.h / 2}
                fontFamily="'ComicRelief', 'Comic Sans MS', cursive"
                fontSize={30}
                fill="rgba(0,0,0,0.4)"
                textAnchor="end"
              >
                {l.label}
              </text>
            ) : null}
          </g>
        );
        top += l.h;
        return band;
      })}
      {children}
    </g>
  );
};

/** A crater lake in section: water, and the gas charge held under it. */
export const CraterLake: React.FC<{
  x: number;
  y: number;
  scale?: number;
  charge?: number;
  rising?: boolean;
}> = ({ x, y, scale = 1, charge = 0, rising }) => {
  const frame = useCurrentFrame();
  const r = rng(7);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M -560 0 L -300 -300 L 300 -300 L 560 0 Z" {...line(STROKE)} fill={ROCK} />
      <path d="M -320 -300 L 320 -300 L 300 140 L -300 140 Z" {...line(STROKE)} fill={WATER} />
      {[...Array(46)].map((_, i) => {
        const bx = -280 + r() * 560;
        const by = 120 - r() * 320 * (0.35 + charge * 0.65);
        return <circle key={i} cx={bx} cy={by} r={3 + r() * 5} fill={GAS} opacity={0.55 + charge * 0.45} />;
      })}
      {rising ? (
        <g>
          {[...Array(16)].map((_, i) => {
            const bx = -220 + ((i * 37) % 440);
            const by = ((frame * 9 + i * 40) % 520) - 300;
            return <circle key={i} cx={bx} cy={-by} r={7 + (i % 4) * 4} fill={GAS} opacity={0.8} />;
          })}
        </g>
      ) : null}
      <path d="M -320 -300 L 320 -300" {...line(STROKE, INK)} />
    </g>
  );
};

/** Heavy gas pouring downhill and pooling. */
export const GasFlow: React.FC<{ level: number; y?: number; fill?: string }> = ({
  level,
  y = 900,
  fill = GAS,
}) => {
  const frame = useCurrentFrame();
  const top = y - level * 420;
  return (
    <path
      d={`${smooth([
        [-20, top + bob(frame, 22, 5)],
        [620, top - 12 + bob(frame, 18, 6)],
        [1300, top + 10 + bob(frame, 25, 5)],
        [1940, top - 6],
      ])} L 1940 1120 L -20 1120 Z`}
      fill={fill}
      opacity={0.86}
    />
  );
};

/** A volcano in profile, with an optional flow down one flank. */
export const Volcano: React.FC<{
  x: number;
  y: number;
  scale?: number;
  flow?: number;
  fill?: string;
}> = ({ x, y, scale = 1, flow = 0, fill = ROCK }) => {
  const frame = useCurrentFrame();
  const r = rng(11);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M -520 0 L -120 -420 L 120 -420 L 520 0 Z" {...line(STROKE)} fill={fill} />
      {flow > 0 ? (
        <g>
          {[...Array(26)].map((_, i) => {
            const t = (i / 26) * flow;
            const px = -60 + t * 520 + r() * 40;
            const py = -400 + t * 400 + r() * 30;
            return (
              <circle
                key={i}
                cx={px}
                cy={py + bob(frame + i * 4, 9, 5)}
                r={26 + r() * 34}
                fill={i % 3 === 0 ? "#7d736a" : "#9a8f84"}
                opacity={0.9}
              />
            );
          })}
        </g>
      ) : null}
    </g>
  );
};

/** A big temperature or figure readout. */
export const Readout: React.FC<{
  x: number;
  y: number;
  value: string;
  label: string;
  color?: string;
  size?: number;
}> = ({ x, y, value, label, color = RED, size = 96 }) => (
  <g transform={`translate(${x} ${y})`}>
    <text x={0} y={0} fontFamily="'ComicRelief', 'Comic Sans MS', cursive" fontSize={size} fill={color} textAnchor="middle">
      {value}
    </text>
    <text x={0} y={size * 0.56} fontFamily="'ComicRelief', 'Comic Sans MS', cursive" fontSize={32} fill={GREY} textAnchor="middle">
      {label}
    </text>
  </g>
);

/** A house, for the sinkhole chapter. */
export const House: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({
  x,
  y,
  scale = 1,
  tilt = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-150} y={-180} width={300} height={180} {...line(STROKE)} fill="#e8ddc8" />
    <path d="M -180 -180 L 0 -300 L 180 -180 Z" {...line(STROKE)} fill="#b4674a" />
    <rect x={-100} y={-140} width={70} height={70} {...line(4)} fill={SKY} />
    <rect x={30} y={-140} width={70} height={70} {...line(4)} fill={SKY} />
    <rect x={-34} y={-70} width={68} height={70} {...line(4)} fill="#8a6a4a" />
  </g>
);

/** A void under the ground, and the roof of sand holding it up. */
export const Void: React.FC<{ x: number; y: number; scale?: number; open?: number }> = ({
  x,
  y,
  scale = 1,
  open = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d={blob(0, 0, 210, 6, 0.12)} fill={NIGHT} />
    {open < 1 ? (
      <path
        d={`M -230 -190 q 230 ${-70 + open * 200} 460 0`}
        {...line(STROKE, INK)}
        fill="none"
        opacity={1 - open}
      />
    ) : null}
  </g>
);

/** A basin of water that can be made to slosh. */
export const Basin: React.FC<{ x: number; y: number; w: number; h: number; phase: number }> = ({
  x,
  y,
  w,
  h,
  phase,
}) => {
  const tilt = Math.sin(phase) * h * 0.32;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M ${-w / 2} ${-h / 2 - tilt} Q 0 ${-h / 2} ${w / 2} ${-h / 2 + tilt} L ${w / 2} ${h / 2} L ${-w / 2} ${h / 2} Z`}
        fill={WATER}
      />
      <path d={`M ${-w / 2} ${-h / 2 - tilt} Q 0 ${-h / 2} ${w / 2} ${-h / 2 + tilt}`} {...line(4, "#2f6a8a")} />
      <path
        d={`M ${-w / 2 - 20} ${-h / 2 - 70} L ${-w / 2 - 20} ${h / 2 + 20} L ${w / 2 + 20} ${h / 2 + 20} L ${w / 2 + 20} ${-h / 2 - 70}`}
        {...line(STROKE)}
        fill="none"
      />
    </g>
  );
};

/** The sun, with an optional mass ejection leaving it. */
export const Sun: React.FC<{ x: number; y: number; r: number; burst?: number }> = ({
  x,
  y,
  r,
  burst = 0,
}) => {
  const frame = useCurrentFrame();
  const rand = rng(5);
  return (
    <g transform={`translate(${x} ${y})`}>
      {[...Array(18)].map((_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const l = r * (1.16 + rand() * 0.1) + bob(frame + i * 6, 14, 6);
        return (
          <path
            key={i}
            d={`M ${Math.cos(a) * r} ${Math.sin(a) * r} L ${Math.cos(a) * l} ${Math.sin(a) * l}`}
            {...line(7, AMBER)}
          />
        );
      })}
      <circle cx={0} cy={0} r={r} {...line(STROKE)} fill="#f0b23c" />
      {burst > 0 ? (
        <g opacity={0.9}>
          {[...Array(12)].map((_, i) => {
            const a = -0.5 + (i / 12) * 1.0;
            const d = r + burst * 900;
            return (
              <circle
                key={i}
                cx={Math.cos(a) * d}
                cy={Math.sin(a) * d}
                r={22 + (i % 3) * 14}
                fill={AMBER}
                opacity={0.55}
              />
            );
          })}
        </g>
      ) : null}
    </g>
  );
};

/** A grid transformer, for the solar storm chapter. */
export const Transformer: React.FC<{ x: number; y: number; scale?: number; hot?: number }> = ({
  x,
  y,
  scale = 1,
  hot = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-130} y={-170} width={260} height={230} rx={10} {...line(STROKE)} fill="#9aa6ae" />
    <rect x={-130} y={-170} width={260} height={230} rx={10} fill={RED} opacity={hot * 0.75} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <path d={`M ${-70 + i * 70} -170 l 0 -70`} {...line(9, "#7b858c")} />
        <circle cx={-70 + i * 70} cy={-258} r={26} {...line(5)} fill="#c9d2d8" />
      </g>
    ))}
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M -110 ${-120 + i * 54} l 220 0`} {...line(4, "rgba(0,0,0,0.25)")} />
    ))}
  </g>
);

/** A star collapsing and firing two beams. */
export const Burst: React.FC<{ x: number; y: number; t: number; scale?: number }> = ({
  x,
  y,
  t,
  scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {t > 0 ? (
      <g opacity={Math.min(1, t * 2)}>
        <path d={`M 0 0 L ${-70 - t * 60} -900 L ${70 + t * 60} -900 Z`} fill="#b8d8f0" opacity={0.75} />
        <path d={`M 0 0 L ${-70 - t * 60} 900 L ${70 + t * 60} 900 Z`} fill="#b8d8f0" opacity={0.75} />
      </g>
    ) : null}
    <circle cx={0} cy={0} r={46 - t * 24} {...line(STROKE, "#ffffff")} fill="#dceefb" />
  </g>
);

export { blob, smooth, rng, bob };

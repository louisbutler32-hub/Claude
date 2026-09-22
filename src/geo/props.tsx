import React from "react";
import { FONT_SANS } from "./fonts";
import { useGeo } from "./GeoCanvas";
import { alive, beat, easeOut, overshoot } from "./motion";
import { LonLat } from "./projection";

// ── Map props ─────────────────────────────────────────────────────────
//
// The little objects the reference channels drop onto the map — a coin, a
// derrick, a cluster of people, a windmill. Each is drawn in a 100×100 box
// with a light from the upper left and a soft contact shadow, so it reads
// as an object sitting on the ground rather than a flat sticker. They drop
// in from above and bounce once.

export type PropKey =
  | "coin"
  | "cash"
  | "derrick"
  | "barrel"
  | "people"
  | "star"
  | "cattle"
  | "capitol"
  | "flagpole"
  | "ship"
  | "factory"
  | "wheat";

const GOLD = "#f5c542";
const GOLD_D = "#b8860b";
const STEEL = "#8d99a6";
const STEEL_D = "#5a6672";

const Drawing: React.FC<{ kind: PropKey }> = ({ kind }) => {
  switch (kind) {
    case "coin":
      return (
        <>
          <ellipse cx={50} cy={64} rx={34} ry={30} fill={GOLD_D} />
          <ellipse cx={50} cy={56} rx={34} ry={30} fill={GOLD} />
          <ellipse cx={50} cy={56} rx={25} ry={22} fill="none" stroke={GOLD_D} strokeWidth={3.5} />
          <text x={50} y={68} textAnchor="middle" fontSize={34} fontWeight={900} fill={GOLD_D} fontFamily="Montserrat, sans-serif">$</text>
          <ellipse cx={40} cy={44} rx={12} ry={7} fill="#fff3c4" opacity={0.55} transform="rotate(-24 40 44)" />
        </>
      );
    case "cash":
      return (
        <>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${i * 4} ${-i * 7})`}>
              <rect x={14} y={44} width={72} height={40} rx={4} fill="#3f8f4f" stroke="#255c31" strokeWidth={3} />
              <rect x={22} y={50} width={56} height={28} rx={3} fill="none" stroke="#7fc08c" strokeWidth={2.4} />
              <circle cx={50} cy={64} r={10} fill="#bfe6c6" stroke="#255c31" strokeWidth={2.4} />
            </g>
          ))}
        </>
      );
    case "derrick":
      return (
        <>
          <path d="M28 92 L42 22 H58 L72 92 Z" fill={STEEL} stroke={STEEL_D} strokeWidth={3} strokeLinejoin="round" />
          <path d="M34 70 H66 M37 54 H63 M40 40 H60" stroke={STEEL_D} strokeWidth={3.4} />
          <path d="M28 92 L72 22 M72 92 L28 22" stroke={STEEL_D} strokeWidth={2.4} opacity={0.75} />
          <rect x={40} y={12} width={20} height={12} rx={3} fill={STEEL_D} />
          <path d="M50 92 v-14" stroke="#141414" strokeWidth={5} />
          <ellipse cx={50} cy={95} rx={26} ry={5} fill="#141414" opacity={0.25} />
        </>
      );
    case "barrel":
      return (
        <>
          <ellipse cx={50} cy={30} rx={26} ry={9} fill="#3b3f46" />
          <path d="M24 30 v42 a26 9 0 0 0 52 0 V30" fill="#22262b" />
          <path d="M24 44 a26 9 0 0 0 52 0 M24 60 a26 9 0 0 0 52 0" stroke="#4d535c" strokeWidth={3.4} fill="none" />
          <ellipse cx={42} cy={28} rx={8} ry={3} fill="#6b727c" opacity={0.7} />
        </>
      );
    case "people":
      return (
        <>
          {[
            [28, 62, 0.85],
            [50, 56, 1],
            [72, 62, 0.85],
            [39, 76, 0.7],
            [61, 76, 0.7],
          ].map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <circle cx={0} cy={-16} r={9} fill="#f2f4f7" stroke="#9aa4b0" strokeWidth={1.6} />
              <path d="M-11 20 v-12 a11 13 0 0 1 22 0 v12 z" fill="#f2f4f7" stroke="#9aa4b0" strokeWidth={1.6} />
            </g>
          ))}
        </>
      );
    case "star":
      return (
        <>
          <path
            d="M50 8 L61 38 H94 L67 57 L78 90 L50 70 L22 90 L33 57 L6 38 H39 Z"
            fill="#ffffff"
            stroke="#0b2c4f"
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path d="M50 8 L61 38 H94 L67 57 Z" fill="#dce7f2" opacity={0.7} />
        </>
      );
    case "cattle":
      return (
        <>
          <ellipse cx={52} cy={62} rx={30} ry={20} fill="#8b5a3c" stroke="#5c3a26" strokeWidth={3} />
          <circle cx={24} cy={52} r={14} fill="#8b5a3c" stroke="#5c3a26" strokeWidth={3} />
          <path d="M14 44 q -8 -10 2 -12 M34 44 q 8 -10 -2 -12" stroke="#e8dcc8" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M34 80 v12 M50 80 v12 M64 80 v12 M76 76 v16" stroke="#5c3a26" strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={62} cy={58} rx={11} ry={8} fill="#e8dcc8" opacity={0.8} />
          <circle cx={19} cy={50} r={2.6} fill="#241812" />
        </>
      );
    case "capitol":
      return (
        <>
          <rect x={12} y={62} width={76} height={28} fill="#e9e4d8" stroke="#a89f8c" strokeWidth={2.6} />
          <path d="M50 14 q 22 16 22 34 H28 q 0 -18 22 -34 Z" fill="#e9e4d8" stroke="#a89f8c" strokeWidth={2.6} />
          <rect x={46} y={6} width={8} height={10} fill="#a89f8c" />
          {[20, 34, 48, 62, 76].map((x) => (
            <rect key={x} x={x} y={62} width={7} height={28} fill="#cfc7b5" />
          ))}
          <rect x={10} y={88} width={80} height={6} fill="#a89f8c" />
        </>
      );
    case "flagpole":
      return (
        <>
          <rect x={20} y={8} width={5} height={86} rx={2.5} fill="#b9c2cc" />
          <circle cx={22.5} cy={7} r={4.5} fill={GOLD} />
          <path d="M25 12 H84 V50 H25 Z" fill="#002868" />
          <path d="M45 12 H84 V31 H45 Z" fill="#ffffff" />
          <path d="M45 31 H84 V50 H45 Z" fill="#bf0a30" />
          <path d="M34 20 l3 8 h9 l-7 5 3 9 -8 -6 -8 6 3 -9 -7 -5 h9 z" fill="#ffffff" />
          <ellipse cx={30} cy={96} rx={16} ry={4} fill="#141414" opacity={0.25} />
        </>
      );
    case "ship":
      return (
        <>
          <path d="M12 62 H88 L76 84 H24 Z" fill="#cfd6de" stroke="#7f8b97" strokeWidth={2.6} />
          <rect x={36} y={38} width={28} height={24} fill="#eef2f6" stroke="#7f8b97" strokeWidth={2.4} />
          <rect x={46} y={22} width={9} height={16} fill="#e4562f" />
          <path d="M6 88 q 11 -8 22 0 t 22 0 t 22 0 t 22 0" stroke="#5fb4e6" strokeWidth={4.5} fill="none" strokeLinecap="round" />
        </>
      );
    case "factory":
      return (
        <>
          <path d="M10 90 V50 L34 64 V50 L58 64 V50 L82 64 V26 H92 V90 Z" fill="#b9c2cc" stroke="#7f8b97" strokeWidth={2.6} strokeLinejoin="round" />
          {[20, 44, 68].map((x) => (
            <rect key={x} x={x} y={70} width={11} height={11} fill="#4a5560" />
          ))}
          <ellipse cx={86} cy={18} rx={10} ry={7} fill="#dfe5ea" opacity={0.8} />
          <ellipse cx={74} cy={10} rx={8} ry={6} fill="#dfe5ea" opacity={0.6} />
        </>
      );
    case "wheat":
      return (
        <>
          {[30, 50, 70].map((x, i) => (
            <g key={x} transform={`translate(${x} 0) rotate(${(i - 1) * 8} 0 90)`}>
              <path d="M0 90 V34" stroke="#c9a227" strokeWidth={5} strokeLinecap="round" />
              {[36, 48, 60].map((y) => (
                <g key={y}>
                  <ellipse cx={-8} cy={y} rx={7} ry={4} fill="#e8c34a" transform={`rotate(-34 -8 ${y})`} />
                  <ellipse cx={8} cy={y} rx={7} ry={4} fill="#e8c34a" transform={`rotate(34 8 ${y})`} />
                </g>
              ))}
              <ellipse cx={0} cy={28} rx={5} ry={9} fill="#e8c34a" />
            </g>
          ))}
        </>
      );
  }
};

/** A prop dropped onto a place on the map. */
export const MapProp: React.FC<{
  at: LonLat;
  kind: PropKey;
  in: number;
  until?: number;
  size?: number;
  dx?: number;
  dy?: number;
  fade?: number;
  /** a label chip under it */
  label?: string;
  shadow?: boolean;
  rotate?: number;
}> = ({ at, kind, in: from, until, size = 120, dx = 0, dy = 0, fade = 0.3, label, shadow = true, rotate = 0 }) => {
  const { t, point } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const [x, y] = point(at);
  const drop = overshoot(beat(t, from, 0.5));
  const lift = (1 - drop) * size * 0.9;
  const cx = x + dx;
  const cy = y + dy;
  return (
    <g opacity={a}>
      {shadow ? (
        <ellipse cx={cx} cy={cy + size * 0.06} rx={size * 0.3 * drop} ry={size * 0.09 * drop} fill="#000" opacity={0.3} />
      ) : null}
      <g transform={`translate(${cx - size / 2} ${cy - size - lift}) scale(${size / 100}) rotate(${rotate} 50 50)`} filter="url(#geo-shadow)">
        <Drawing kind={kind} />
      </g>
      {label ? (
        <text
          x={cx}
          y={cy + size * 0.32}
          textAnchor="middle"
          fontFamily={FONT_SANS}
          fontWeight={800}
          fontSize={size * 0.22}
          fill="#ffffff"
          opacity={easeOut(beat(t, from + 0.25, 0.3))}
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.8))" }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

/** A row of the same prop, for "forty percent of the oil" — counts read
 *  faster as a row of objects than as a number. */
export const PropRow: React.FC<{
  at: LonLat;
  kind: PropKey;
  count: number;
  in: number;
  until?: number;
  size?: number;
  gap?: number;
  step?: number;
  fade?: number;
  /** grey out the props past this index */
  dim?: number;
}> = ({ at, kind, count, in: from, until, size = 90, gap = 0.9, step = 0.08, fade = 0.3, dim }) => {
  const { t, point } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const [x, y] = point(at);
  const pitch = size * gap;
  const x0 = x - (pitch * (count - 1)) / 2;
  return (
    <g opacity={a}>
      {Array.from({ length: count }, (_, i) => {
        const drop = overshoot(beat(t, from + i * step, 0.45));
        if (drop <= 0) return null;
        const faded = dim !== undefined && i >= dim;
        return (
          <g key={i} opacity={faded ? 0.28 : 1}>
            <ellipse cx={x0 + i * pitch} cy={y + size * 0.05} rx={size * 0.26 * drop} ry={size * 0.08 * drop} fill="#000" opacity={0.28} />
            <g
              transform={`translate(${x0 + i * pitch - size / 2} ${y - size - (1 - drop) * size * 0.8}) scale(${size / 100})`}
              filter="url(#geo-shadow)"
            >
              <Drawing kind={kind} />
            </g>
          </g>
        );
      })}
    </g>
  );
};

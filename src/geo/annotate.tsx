import React from "react";
import { FONT_SANS } from "./fonts";
import { useGeo } from "./GeoCanvas";
import { alive, beat, easeOut, overshoot, pulse } from "./motion";
import { LonLat } from "./projection";
import { ScreenPolygon, projectShape } from "./shapes";

// ── Annotation ────────────────────────────────────────────────────────
//
// The clean, professional half of the reference format — the Great Lakes
// and Holland end of it, not the googly-eyes end. Flat saturated fills
// with white outlines, the country's name set on the country itself, a
// hand-drawn yellow ring around whatever is being talked about with a
// leader out to its label, big numbers on leaders, and silhouettes of
// other countries dropped on for scale.

export const YELLOW = "#ffd23f";

/** A country or region, filled flat and outlined white. The workhorse. */
export const Region: React.FC<{
  shape?: string;
  shapes?: string[];
  ring?: LonLat[];
  color: string;
  in: number;
  until?: number;
  opacity?: number;
  edge?: string;
  edgeWidth?: number;
  fade?: number;
  /** the fill wipes in over this long */
  draw?: number;
  /** a soft outer glow, for the one thing being discussed */
  glow?: boolean;
}> = ({
  shape,
  shapes,
  ring,
  color,
  in: from,
  until,
  opacity = 0.88,
  edge = "#ffffff",
  edgeWidth = 3.5,
  fade = 0.35,
  draw = 0.55,
  glow = false,
}) => {
  const { t, shape: get, ring: toPath } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const names = shapes ?? (shape ? [shape] : []);
  let d = names.map((n) => get(n).d).join("");
  if (ring) d += toPath(ring);
  if (!d) return null;
  const grow = easeOut(beat(t, from, draw));
  return (
    <g opacity={a}>
      {glow ? (
        <path
          d={d}
          fill="none"
          stroke="#ffffff"
          strokeWidth={14 + 7 * pulse(t, 2.1)}
          strokeLinejoin="round"
          filter="url(#geo-glow)"
          opacity={0.55 * grow}
        />
      ) : null}
      <path d={d} fill={color} opacity={opacity * grow} />
      <path
        d={d}
        fill="none"
        stroke={edge}
        strokeWidth={edgeWidth}
        strokeLinejoin="round"
        opacity={0.95 * grow}
      />
    </g>
  );
};

/** A rough hand-drawn ring around a place — the yellow ellipse the Great
 *  Lakes video circles the lakes with. Draws itself on. */
export const Ring: React.FC<{
  at: LonLat;
  in: number;
  until?: number;
  /** radii in screen px at the current zoom */
  rx?: number;
  ry?: number;
  color?: string;
  width?: number;
  rotate?: number;
  fade?: number;
  dur?: number;
}> = ({ at, in: from, until, rx = 190, ry = 130, color = YELLOW, width = 6, rotate = -12, fade = 0.35, dur = 0.8 }) => {
  const { t, point } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const [x, y] = point(at);
  const p = easeOut(beat(t, from, dur));
  // a slightly irregular ellipse, so it reads as drawn rather than plotted
  const seg = 44;
  const pts: string[] = [];
  for (let i = 0; i <= seg * p; i++) {
    const th = (i / seg) * Math.PI * 2;
    const wob = 1 + Math.sin(th * 3 + 1.2) * 0.035 + Math.cos(th * 5) * 0.022;
    pts.push(`${(Math.cos(th) * rx * wob).toFixed(1)} ${(Math.sin(th) * ry * wob).toFixed(1)}`);
  }
  if (pts.length < 2) return null;
  return (
    <g opacity={a} transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d={`M${pts.join("L")}`} fill="none" stroke="#000" strokeWidth={width + 3} opacity={0.3} strokeLinecap="round" />
      <path d={`M${pts.join("L")}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
    </g>
  );
};

/** A label on a leader line out to a place — "Great Lakes" on its yellow
 *  stalk. The label end is screen-space, the pointed-at end is on the map. */
export const Leader: React.FC<{
  at: LonLat;
  text: string;
  sub?: string;
  in: number;
  until?: number;
  /** where the label sits relative to the point, in px */
  dx?: number;
  dy?: number;
  size?: number;
  color?: string;
  subColor?: string;
  fade?: number;
  dotColor?: string;
}> = ({ at, text, sub, in: from, until, dx = 190, dy = -150, size = 46, color = YELLOW, subColor = "#ffffff", fade = 0.3, dotColor }) => {
  const { t, point } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const [x, y] = point(at);
  const p = easeOut(beat(t, from, 0.4));
  const lx = x + dx;
  const ly = y + dy;
  const pop = overshoot(beat(t, from + 0.2, 0.4));
  return (
    <g opacity={a}>
      <line
        x1={x}
        y1={y}
        x2={x + dx * p}
        y2={y + dy * p}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.95}
      />
      <circle cx={x} cy={y} r={7} fill={dotColor ?? color} />
      {pop > 0 ? (
        <g transform={`translate(${lx} ${ly}) scale(${0.7 + 0.3 * pop})`} opacity={Math.min(1, pop * 1.5)}>
          <text
            textAnchor={dx < 0 ? "end" : "start"}
            dominantBaseline="central"
            fontFamily={FONT_SANS}
            fontWeight={900}
            fontSize={size}
            fill={color}
            style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.85))" }}
          >
            {text}
          </text>
          {sub ? (
            <text
              y={size * 0.82}
              textAnchor={dx < 0 ? "end" : "start"}
              dominantBaseline="central"
              fontFamily={FONT_SANS}
              fontWeight={700}
              fontSize={size * 0.52}
              fill={subColor}
              style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.85))" }}
            >
              {sub}
            </text>
          ) : null}
        </g>
      ) : null}
    </g>
  );
};

/** Another country's outline, scaled and dropped onto a place for size —
 *  the Great Lakes video laying Austria, Czechia and Ireland on the lakes.
 *  The shape keeps its own proportions; `fit` is its width in screen px. */
export const ScaleSilhouette: React.FC<{
  shape: string;
  at: LonLat;
  fit: number;
  label?: string;
  sub?: string;
  in: number;
  until?: number;
  color?: string;
  edge?: string;
  fade?: number;
  rotate?: number;
}> = ({ shape, at, fit, label, sub, in: from, until, color = "rgba(255,255,255,0.3)", edge = "#ffffff", fade = 0.3, rotate = 0 }) => {
  const { t, point, proj } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  // project the shape at the live camera, then rescale its own box to `fit`
  const s = projectShape(shape, proj, 1e6);
  if (!s.polygons.length) return null;
  const main: ScreenPolygon = s.polygons.reduce((m, p) => (p.area > m.area ? p : m), s.polygons[0]);
  const [x0, y0, x1, y1] = main.box;
  const w = Math.max(1, x1 - x0);
  const k = fit / w;
  const [tx, ty] = point(at);
  const pop = overshoot(beat(t, from, 0.5));
  return (
    <g opacity={a * Math.min(1, pop * 1.4)}>
      <g
        transform={`translate(${tx} ${ty}) rotate(${rotate}) scale(${(k * (0.6 + 0.4 * pop)).toFixed(4)}) translate(${-(x0 + x1) / 2} ${-(y0 + y1) / 2})`}
      >
        <path d={main.d} fill={color} stroke={edge} strokeWidth={3 / k} strokeLinejoin="round" />
      </g>
      {label ? (
        <text
          x={tx}
          y={ty - fit * 0.16}
          textAnchor="middle"
          fontFamily={FONT_SANS}
          fontWeight={900}
          fontSize={Math.max(20, fit * 0.17)}
          fill="#ffffff"
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))" }}
        >
          {label}
        </text>
      ) : null}
      {sub ? (
        <text
          x={tx}
          y={ty + fit * 0.02}
          textAnchor="middle"
          fontFamily={FONT_SANS}
          fontWeight={700}
          fontSize={Math.max(14, fit * 0.1)}
          fill={YELLOW}
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))" }}
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
};

/** A big number planted on the map with a leader down to its subject —
 *  the "20% of Earth's surface freshwater" treatment. Screen-space, so it
 *  always lands where you put it. */
export const BigStat: React.FC<{
  value: string;
  sub?: string;
  in: number;
  until?: number;
  x?: number;
  y: number;
  /** the place the leader points at */
  at?: LonLat;
  size?: number;
  color?: string;
  fade?: number;
}> = ({ value, sub, in: from, until, x, y, at, size = 130, color = YELLOW, fade = 0.32 }) => {
  const { t, point, width } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const cx = x ?? width / 2;
  const pop = overshoot(beat(t, from, 0.45));
  const p = easeOut(beat(t, from + 0.15, 0.45));
  const target = at ? point(at) : null;
  return (
    <g opacity={a}>
      {target ? (
        <line
          x1={cx}
          y1={y + size * 0.4}
          x2={cx + (target[0] - cx) * p}
          y2={y + size * 0.4 + (target[1] - y - size * 0.4) * p}
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.9}
        />
      ) : null}
      <g transform={`translate(${cx} ${y}) scale(${0.65 + 0.35 * pop})`}>
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={FONT_SANS}
          fontWeight={900}
          fontSize={size}
          fill={color}
          style={{ filter: "drop-shadow(0 5px 12px rgba(0,0,0,0.9))" }}
        >
          {value}
        </text>
        {sub ? (
          <text
            y={size * 0.62}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={FONT_SANS}
            fontWeight={700}
            fontSize={size * 0.27}
            fill="#ffffff"
            style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.9))" }}
          >
            {sub}
          </text>
        ) : null}
      </g>
    </g>
  );
};

/** The country's name, set on the country itself in heavy white caps —
 *  "Canada", "USA" in the Great Lakes reference. */
export const PlaceName: React.FC<{
  at: LonLat;
  text: string;
  in: number;
  until?: number;
  size?: number;
  color?: string;
  rotate?: number;
  fade?: number;
  opacity?: number;
}> = ({ at, text, in: from, until, size = 62, color = "#ffffff", rotate = 0, fade = 0.35, opacity = 1 }) => {
  const { t, point } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const [x, y] = point(at);
  const p = easeOut(beat(t, from, 0.4));
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      transform={`rotate(${rotate} ${x} ${y})`}
      fontFamily={FONT_SANS}
      fontWeight={900}
      fontSize={size}
      fill={color}
      opacity={a * opacity * p}
      letterSpacing="0.01em"
      style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.9))" }}
    >
      {text}
    </text>
  );
};

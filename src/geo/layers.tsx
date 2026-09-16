import React, { useId } from "react";
import { FLAG_COLOR, Flag, FlagKey, Sheen } from "./flags";
import { FONT_CAPTION, FONT_SANS, FONT_SERIF } from "./fonts";
import { useGeo } from "./GeoCanvas";
import { Icon, IconKey } from "./icons";
import { alive, beat, easeOut, overshoot, pulse } from "./motion";
import { LonLat } from "./projection";

// ── Map layers ────────────────────────────────────────────────────────
// SVG, pinned to the ground. Everything is placed in lon/lat and timed in
// seconds, so a layer stays glued to its place while the camera moves and
// stays in sync with the narration when the voice is regenerated.

const fontFor = (font?: "sans" | "serif" | "caption") =>
  font === "serif" ? FONT_SERIF : font === "caption" ? FONT_CAPTION : FONT_SANS;

// ── Highlight ─────────────────────────────────────────────────────────
// A country wearing its flag, with the white halo the reference channel
// puts around whatever the narration is talking about.

export const Highlight: React.FC<{
  shape?: string;
  /** several shapes worn as one: the states east of the Mississippi */
  shapes?: string[];
  /** a hand-drawn ring in lon/lat, for a region that is not on the data */
  ring?: LonLat[];
  flag?: FlagKey;
  /** plain fill instead of a flag */
  color?: string;
  in: number;
  until?: number;
  /** halo strength, 0-1 */
  glow?: number;
  opacity?: number;
  /** polygons smaller than this (px²) get a plain fill instead of a flag */
  minArea?: number;
  ripple?: boolean;
  fade?: number;
  outline?: boolean;
  /** Stretch the flag over this lon/lat rectangle (north-west corner,
   *  south-east corner) instead of each polygon's own bounds. For a country
   *  so big that only a corner of it is on screen — Russia, Alaska — so the
   *  corner still wears a whole flag. */
  flagBox?: [LonLat, LonLat];
}> = ({
  shape,
  shapes,
  ring,
  flag,
  color,
  in: from,
  until,
  glow = 1,
  opacity = 1,
  minArea = 900,
  ripple = true,
  fade = 0.45,
  outline = true,
  flagBox,
}) => {
  const id = useId();
  const { t, shape: get, point, ring: toPath } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const names = shapes ?? (shape ? [shape] : []);
  const polygons = names.flatMap((n) => get(n).polygons);
  if (ring) {
    const pts = ring.map(point);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const box: [number, number, number, number] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    polygons.push({ d: toPath(ring), box, area: (box[2] - box[0]) * (box[3] - box[1]) });
  }
  const s = { d: polygons.map((p) => p.d).join(""), polygons };
  if (!s.d) return null;
  const plain = color ?? (flag ? FLAG_COLOR[flag] : "#ffffff");
  const pad = 24;
  return (
    <g opacity={a * opacity}>
      {glow > 0 ? (
        <path
          d={s.d}
          fill="#ffffff"
          stroke="#ffffff"
          strokeWidth={12 + 8 * pulse(t, 2.2)}
          strokeLinejoin="round"
          filter="url(#geo-glow)"
          opacity={(0.75 + 0.25 * pulse(t, 2.2)) * glow}
        />
      ) : null}
      {s.polygons.map((p, i) => {
        const fb = flagBox ? [...point(flagBox[0]), ...point(flagBox[1])] : null;
        // a polygon outside the flag box — an outlying island — takes the
        // flag's colour instead of an empty clip
        const outside = fb ? p.box[2] < fb[0] || p.box[0] > fb[2] || p.box[3] < fb[1] || p.box[1] > fb[3] : false;
        if (!flag || p.area < minArea || outside) {
          return <path key={i} d={p.d} fill={plain} opacity={0.92} />;
        }
        const [x0, y0, x1, y1] = fb ?? p.box;
        const clip = `${id}-${i}`;
        return (
          <g key={i}>
            <clipPath id={clip}>
              <path d={p.d} />
            </clipPath>
            <g clipPath={`url(#${clip})`}>
              <g filter={ripple ? "url(#geo-ripple)" : undefined}>
                <Flag flag={flag} x={x0 - pad} y={y0 - pad} w={x1 - x0 + pad * 2} h={y1 - y0 + pad * 2} />
              </g>
              <Sheen x={x0 - pad} y={y0 - pad} w={x1 - x0 + pad * 2} h={y1 - y0 + pad * 2} t={t} />
            </g>
          </g>
        );
      })}
      {outline ? (
        <path d={s.d} fill="none" stroke="#ffffff" strokeWidth={2.2} strokeLinejoin="round" opacity={0.95} />
      ) : null}
    </g>
  );
};

// ── Wash ──────────────────────────────────────────────────────────────
// A colour laid over a region: an empire, a purchase, a park. The outline
// draws itself on, then the fill washes in behind it.

export const Wash: React.FC<{
  shape?: string;
  ring?: LonLat[];
  color: string;
  opacity?: number;
  outline?: string | null;
  outlineWidth?: number;
  in: number;
  until?: number;
  draw?: number;
  fade?: number;
  dashed?: boolean;
}> = ({
  shape,
  ring,
  color,
  opacity = 0.55,
  outline = "#ffffff",
  outlineWidth = 3,
  in: from,
  until,
  draw = 1.1,
  fade = 0.4,
  dashed = false,
}) => {
  const { t, shape: get, ring: toPath } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const d = shape ? get(shape).d : ring ? toPath(ring) : "";
  if (!d) return null;
  const drawn = easeOut(beat(t, from, draw));
  const fill = easeOut(beat(t, from + draw * 0.3, 0.8));
  return (
    <g opacity={a}>
      <path d={d} fill={color} opacity={fill * opacity} />
      {outline ? (
        <path
          d={d}
          fill="none"
          stroke={outline}
          strokeWidth={outlineWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1000}
          strokeDasharray={dashed ? `${12} ${10}` : 1000}
          strokeDashoffset={dashed ? 0 : 1000 * (1 - drawn)}
          opacity={dashed ? drawn : 1}
        />
      ) : null}
    </g>
  );
};

// ── Label ─────────────────────────────────────────────────────────────
// A name on the ground. Bold geometric caps by default, the way the
// reference sets "Spain" across Spain.

export const Label: React.FC<{
  at: LonLat;
  text: string;
  size?: number;
  color?: string;
  rotate?: number;
  in: number;
  until?: number;
  weight?: number;
  font?: "sans" | "serif" | "caption";
  dx?: number;
  dy?: number;
  anchor?: "middle" | "start" | "end";
  upper?: boolean;
  spacing?: number;
  fade?: number;
  /** a soft white glow instead of the drop shadow */
  glow?: boolean;
  opacity?: number;
}> = ({
  at,
  text,
  size = 54,
  color = "#ffffff",
  rotate = 0,
  in: from,
  until,
  weight = 800,
  font = "sans",
  dx = 0,
  dy = 0,
  anchor = "middle",
  upper = false,
  spacing = 0.02,
  fade = 0.35,
  glow = false,
  opacity = 1,
}) => {
  const { t, point } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const [x, y] = point(at);
  const pop = 0.7 + 0.3 * overshoot(beat(t, from, 0.5));
  return (
    <g
      transform={`translate(${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}) rotate(${rotate}) scale(${pop.toFixed(3)})`}
      opacity={a * opacity}
      filter={glow ? "url(#geo-glow)" : "url(#geo-shadow)"}
    >
      {glow ? (
        <text
          fontFamily={fontFor(font)}
          fontSize={size}
          fontWeight={weight}
          fill="#ffffff"
          textAnchor={anchor}
          dominantBaseline="middle"
          letterSpacing={`${spacing}em`}
          opacity={0.7}
        >
          {upper ? text.toUpperCase() : text}
        </text>
      ) : null}
      <text
        fontFamily={fontFor(font)}
        fontSize={size}
        fontWeight={weight}
        fill={color}
        textAnchor={anchor}
        dominantBaseline="middle"
        letterSpacing={`${spacing}em`}
      >
        {upper ? text.toUpperCase() : text}
      </text>
    </g>
  );
};

// ── Measure ───────────────────────────────────────────────────────────
// A distance between two places: a line with end ticks and a chip that
// says how far — "14 km" in the reference.

export const Measure: React.FC<{
  from: LonLat;
  to: LonLat;
  text: string;
  in: number;
  until?: number;
  color?: string;
  /** chip offset from the midpoint, px, perpendicular to the line */
  offset?: number;
  width?: number;
  dashed?: boolean;
  size?: number;
  fade?: number;
}> = ({
  from: a,
  to: b,
  text,
  in: from,
  until,
  color = "#ffe27a",
  offset = 46,
  width = 4,
  dashed = false,
  size = 34,
  fade = 0.35,
}) => {
  const { t, point } = useGeo();
  const vis = alive(t, from, until, fade);
  if (vis <= 0.001) return null;
  const [x0, y0] = point(a);
  const [x1, y1] = point(b);
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const drawn = easeOut(beat(t, from, 0.6));
  const ex = x0 + dx * drawn;
  const ey = y0 + dy * drawn;
  const tick = 12;
  const mx = (x0 + x1) / 2 + nx * offset;
  const my = (y0 + y1) / 2 + ny * offset;
  const pop = overshoot(beat(t, from + 0.35, 0.45));
  const w = text.length * size * 0.6 + 36;
  const h = size * 1.5;
  return (
    <g opacity={vis}>
      <line
        x1={x0}
        y1={y0}
        x2={ex}
        y2={ey}
        stroke="#000"
        strokeWidth={width + 3}
        opacity={0.35}
        strokeDasharray={dashed ? "10 10" : undefined}
        strokeLinecap="round"
      />
      <line
        x1={x0}
        y1={y0}
        x2={ex}
        y2={ey}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dashed ? "10 10" : undefined}
        strokeLinecap="round"
      />
      <line x1={x0 + nx * tick} y1={y0 + ny * tick} x2={x0 - nx * tick} y2={y0 - ny * tick} stroke={color} strokeWidth={width} strokeLinecap="round" />
      {drawn > 0.98 ? (
        <line x1={x1 + nx * tick} y1={y1 + ny * tick} x2={x1 - nx * tick} y2={y1 - ny * tick} stroke={color} strokeWidth={width} strokeLinecap="round" />
      ) : null}
      {pop > 0 ? (
        <g transform={`translate(${mx.toFixed(1)} ${my.toFixed(1)}) scale(${(0.6 + 0.4 * pop).toFixed(3)})`} opacity={Math.min(1, pop * 1.5)} filter="url(#geo-shadow)">
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="#0d2f45" stroke={color} strokeWidth={3} />
          <text
            fontFamily={FONT_CAPTION}
            fontSize={size}
            fontWeight={700}
            fill="#ffffff"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {text}
          </text>
        </g>
      ) : null}
    </g>
  );
};

// ── Route ─────────────────────────────────────────────────────────────
// A line that travels: a road, a tunnel, a voyage. Drawn on by cutting the
// polyline at a fraction of its screen length, so a dash pattern survives
// the draw-on and the tip can carry a marker.

const cut = (pts: [number, number][], p: number): { d: string; tip: [number, number] } => {
  if (pts.length === 0) return { d: "", tip: [0, 0] };
  const seg: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = seg[seg.length - 1];
  const target = total * Math.min(1, Math.max(0, p));
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  let tip: [number, number] = pts[0];
  for (let i = 1; i < pts.length; i++) {
    if (seg[i] <= target) {
      d += `L${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
      tip = pts[i];
    } else {
      const f = (target - seg[i - 1]) / Math.max(seg[i] - seg[i - 1], 1e-6);
      tip = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
      d += `L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`;
      break;
    }
  }
  return { d, tip };
};

export const Route: React.FC<{
  points: LonLat[];
  in: number;
  /** draw-on time, seconds */
  dur?: number;
  until?: number;
  color?: string;
  width?: number;
  dashed?: boolean;
  glow?: boolean;
  /** draw only this span of the line, as fractions of its length */
  from?: number;
  to?: number;
  fade?: number;
  head?: "none" | "dot";
  /** an icon riding the tip: a car crawling, a ship sailing */
  headIcon?: IconKey;
  headSize?: number;
  opacity?: number;
}> = ({
  points,
  in: start,
  dur = 1.2,
  until,
  color = "#ffd23f",
  width = 6,
  dashed = false,
  glow = true,
  from = 0,
  to = 1,
  fade = 0.35,
  head = "none",
  headIcon,
  headSize = 90,
  opacity = 1,
}) => {
  const { t, point } = useGeo();
  const vis = alive(t, start, until, fade);
  if (vis <= 0.001) return null;
  const pts = points.map(point);
  const p = from + (to - from) * easeOut(beat(t, start, dur));
  const { d, tip } = cut(pts, p);
  // drop the part before `from`
  const prefix = from > 0 ? cut(pts, from).d : "";
  const dash = dashed ? `${width * 2.2} ${width * 1.8}` : undefined;
  return (
    <g opacity={vis * opacity}>
      {glow ? (
        <path d={d} fill="none" stroke={color} strokeWidth={width * 3} strokeLinecap="round" strokeLinejoin="round" filter="url(#geo-glow)" opacity={0.55} />
      ) : null}
      <path d={d} fill="none" stroke="#000" strokeWidth={width + 3} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} strokeDasharray={dash} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
      {prefix ? <path d={prefix} fill="none" stroke="#0b2c4f" strokeWidth={width + 4} strokeLinecap="round" opacity={0} /> : null}
      {head === "dot" ? (
        <>
          <circle cx={tip[0]} cy={tip[1]} r={width * 2.2} fill={color} filter="url(#geo-glow)" opacity={0.8} />
          <circle cx={tip[0]} cy={tip[1]} r={width * 1.1} fill="#ffffff" />
        </>
      ) : null}
      {headIcon ? (
        <g transform={`translate(${(tip[0] - headSize / 2).toFixed(1)} ${(tip[1] - headSize * 0.62).toFixed(1)})`} filter="url(#geo-shadow)">
          <Icon icon={headIcon} size={headSize} />
        </g>
      ) : null}
    </g>
  );
};

// ── Dashed ────────────────────────────────────────────────────────────
// A boundary that isn't a thing: a date line, a border at sea.

export const Dashed: React.FC<{
  points: LonLat[];
  in: number;
  until?: number;
  color?: string;
  width?: number;
  dash?: string;
  fade?: number;
  opacity?: number;
}> = ({ points, in: from, until, color = "#ffffff", width = 4, dash = "16 14", fade = 0.4, opacity = 0.9 }) => {
  const { t, ring } = useGeo();
  const vis = alive(t, from, until, fade);
  if (vis <= 0.001) return null;
  const d = ring(points, false);
  return (
    <g opacity={vis * opacity}>
      <path d={d} fill="none" stroke="#000" strokeWidth={width + 3} strokeDasharray={dash} opacity={0.35} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
    </g>
  );
};

// ── Pin ───────────────────────────────────────────────────────────────
// A place. Drops in from above and lands with a little bounce.

export const Pin: React.FC<{
  at: LonLat;
  label?: string;
  in: number;
  until?: number;
  color?: string;
  size?: number;
  side?: "right" | "left" | "top" | "bottom";
  fade?: number;
  labelSize?: number;
}> = ({ at, label, in: from, until, color = "#e63946", size = 56, side = "right", fade = 0.3, labelSize = 34 }) => {
  const { t, point } = useGeo();
  const vis = alive(t, from, until, fade);
  if (vis <= 0.001) return null;
  const [x, y] = point(at);
  const drop = overshoot(beat(t, from, 0.5));
  const lift = (1 - drop) * 60;
  const r = size * 0.3;
  const lx = side === "right" ? r * 1.6 : side === "left" ? -r * 1.6 : 0;
  const ly = side === "top" ? -size - 12 : side === "bottom" ? 18 : -size * 0.55;
  const anchor = side === "right" ? "start" : side === "left" ? "end" : "middle";
  return (
    <g opacity={vis} transform={`translate(${x.toFixed(1)} ${(y - lift).toFixed(1)})`}>
      <ellipse cx={0} cy={2} rx={r * 0.9} ry={r * 0.35} fill="#000" opacity={0.35 * drop} />
      <path
        d={`M0 0 C ${-r * 1.1} ${-r * 1.2}, ${-r * 1.1} ${-size * 0.75}, 0 ${-size * 0.75} C ${r * 1.1} ${-size * 0.75}, ${r * 1.1} ${-r * 1.2}, 0 0 Z`}
        fill={color}
        stroke="#ffffff"
        strokeWidth={3}
        filter="url(#geo-shadow)"
      />
      <circle cx={0} cy={-size * 0.5} r={r * 0.42} fill="#ffffff" />
      {label ? (
        <text
          x={lx}
          y={ly}
          fontFamily={FONT_SANS}
          fontSize={labelSize}
          fontWeight={800}
          fill="#ffffff"
          textAnchor={anchor}
          dominantBaseline="middle"
          filter="url(#geo-shadow)"
          letterSpacing="0.02em"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

// ── Rings ─────────────────────────────────────────────────────────────
// Expanding circles out of a point: a tremor, a signal, a shock.

export const Rings: React.FC<{
  at: LonLat;
  in: number;
  until?: number;
  color?: string;
  count?: number;
  period?: number;
  maxR?: number;
  width?: number;
  fade?: number;
}> = ({ at, in: from, until, color = "#e63946", count = 3, period = 1.6, maxR = 160, width = 5, fade = 0.3 }) => {
  const { t, point } = useGeo();
  const vis = alive(t, from, until, fade);
  if (vis <= 0.001) return null;
  const [x, y] = point(at);
  return (
    <g opacity={vis}>
      {Array.from({ length: count }, (_, i) => {
        const phase = (((t - from) / period + i / count) % 1 + 1) % 1;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={8 + phase * maxR}
            fill="none"
            stroke={color}
            strokeWidth={width * (1 - phase * 0.6)}
            opacity={(1 - phase) * 0.9}
          />
        );
      })}
      <circle cx={x} cy={y} r={9} fill={color} stroke="#fff" strokeWidth={3} />
    </g>
  );
};

// ── Sign ──────────────────────────────────────────────────────────────
// A little board on a post: "FOR SALE".

export const Sign: React.FC<{
  at: LonLat;
  text: string;
  in: number;
  until?: number;
  color?: string;
  textColor?: string;
  size?: number;
  fade?: number;
}> = ({ at, text, in: from, until, color = "#e63946", textColor = "#ffffff", size = 30, fade = 0.3 }) => {
  const { t, point } = useGeo();
  const vis = alive(t, from, until, fade);
  if (vis <= 0.001) return null;
  const [x, y] = point(at);
  const pop = overshoot(beat(t, from, 0.5));
  const lines = text.split("\n");
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.68 + 30;
  const h = lines.length * size * 1.15 + 20;
  return (
    <g opacity={vis} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(0.5 + 0.5 * pop).toFixed(3)})`} filter="url(#geo-shadow)">
      <rect x={-4} y={-h - 6} width={8} height={h + 26} fill="#f1e9d2" />
      <rect x={-w / 2} y={-h - 40} width={w} height={h} rx={6} fill={color} stroke="#ffffff" strokeWidth={4} />
      {lines.map((l, i) => (
        <text
          key={i}
          y={-h - 40 + 14 + (i + 0.5) * size * 1.15}
          fontFamily={FONT_SANS}
          fontSize={size}
          fontWeight={900}
          fill={textColor}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {l}
        </text>
      ))}
    </g>
  );
};

// ── Spot ──────────────────────────────────────────────────────────────
// A soft glowing disc on a place: "here".

export const Spot: React.FC<{
  at: LonLat;
  in: number;
  until?: number;
  color?: string;
  r?: number;
  fade?: number;
}> = ({ at, in: from, until, color = "#ffffff", r = 40, fade = 0.4 }) => {
  const { t, point } = useGeo();
  const vis = alive(t, from, until, fade);
  if (vis <= 0.001) return null;
  const [x, y] = point(at);
  const breathe = 0.85 + 0.15 * pulse(t, 1.8);
  return (
    <g opacity={vis}>
      <circle cx={x} cy={y} r={r * breathe} fill={color} filter="url(#geo-glow-soft)" opacity={0.75} />
      <circle cx={x} cy={y} r={r * 0.28} fill={color} />
    </g>
  );
};

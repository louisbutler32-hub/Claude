import React from "react";
import { useVideoConfig } from "remotion";
import { countryPath, useMap } from "./MapCanvas";
import {
  LonLat,
  arrowPath,
  bowControl,
  easeOutCubic,
  quadAt,
  ramp,
  visibility,
} from "./projection";
import { MapTheme } from "./theme";

// ── Layers ─────────────────────────────────────────────────────────────
// Everything is placed in longitude/latitude, never in pixels, so a layer
// stays glued to the ground when the camera moves. Timings are seconds.

export type Tone = "accent" | "counter" | "neutral";

const toneColor = (theme: MapTheme, tone: Tone) =>
  tone === "accent" ? theme.accent : tone === "counter" ? theme.counter : theme.neutral;

/** Darken (or lighten) a hex colour — used for territory outlines so each
 *  nation's border is its own colour, a shade down. */
export const shade = (hex: string, amount: number): string => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const mix = (c: number) =>
    Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount));
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const toneFill = (theme: MapTheme, tone: Tone) =>
  tone === "accent"
    ? theme.accentFill
    : tone === "counter"
    ? theme.counterFill
    : theme.neutralFill;

// ── Territory ──────────────────────────────────────────────────────────
// Countries filled and outlined in a tone. The border draws itself on, then
// the fill washes in behind it — the same beat as a hand shading a map.

export const Territory: React.FC<{
  /** Natural Earth country names, e.g. ["Germany", "Austria"] */
  countries: string[];
  tone?: Tone;
  /** Any colour, or a key from theme.palette — overrides `tone`. */
  color?: string;
  in?: number;
  until?: number;
  /** Border draw-on time, seconds. */
  draw?: number;
  opacity?: number;
  /** How solid the fill is. Defaults to the theme. */
  fillOpacity?: number;
}> = ({
  countries,
  tone = "accent",
  color,
  in: from = 0,
  until,
  draw = 0.9,
  opacity = 1,
  fillOpacity,
}) => {
  const { theme, t, worldTransform } = useMap();
  const d = countryPath(countries);
  if (!d) return null;

  const alive = visibility(t, from, until, 0.5);
  if (alive <= 0.01) return null;

  const drawn = easeOutCubic(ramp(t, from, from + draw));
  const fill = easeOutCubic(ramp(t, from + draw * 0.35, from + draw * 0.35 + 0.7));

  const solid = color ? theme.palette[color] ?? color : null;

  return (
    <g transform={worldTransform} opacity={alive * opacity}>
      <path
        d={d}
        fill={solid ?? toneFill(theme, tone)}
        opacity={fill * (solid ? fillOpacity ?? theme.fillOpacity : 1)}
      />
      <path
        d={d}
        fill="none"
        stroke={solid ? shade(solid, -0.35) : toneColor(theme, tone)}
        strokeWidth={2.4}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        pathLength={1000}
        strokeDasharray={1000}
        strokeDashoffset={1000 * (1 - drawn)}
      />
    </g>
  );
};

// ── Label ──────────────────────────────────────────────────────────────
// Engraved caps, wide tracking, optionally bowed along an arc the way an
// atlas sets a country name across its territory.

export const MapLabel: React.FC<{
  at: LonLat;
  text: string;
  size?: number;
  tone?: Tone | "plain";
  tracking?: number;
  /** Arc height in px. Positive bows upward. 0 is a straight line. */
  bow?: number;
  rotate?: number;
  in?: number;
  until?: number;
  weight?: number;
  opacity?: number;
  /** Any colour, or a key from theme.palette. */
  color?: string;
}> = ({
  at,
  text,
  size = 46,
  tone = "plain",
  color: colorProp,
  tracking = 6,
  bow = 0,
  rotate = 0,
  in: from = 0,
  until,
  weight = 600,
  opacity = 1,
}) => {
  const { project, theme, t } = useMap();
  const alive = visibility(t, from, until, 0.5);
  if (alive <= 0.01) return null;

  const [x, y] = project(at);
  const color = colorProp
    ? theme.palette[colorProp] ?? colorProp
    : tone === "plain"
    ? theme.label
    : toneColor(theme, tone);
  // Labels ease in with a touch of extra tracking that settles — reads as
  // the word arriving rather than switching on.
  const settle = easeOutCubic(ramp(t, from, from + 0.7));
  const track = tracking + (1 - settle) * size * 0.14;

  const id = `arc-${Math.round(x)}-${Math.round(y)}-${text.length}`;
  const half = 1400;
  const arc = `M ${x - half} ${y + bow} Q ${x} ${y - bow} ${x + half} ${y + bow}`;

  const common = {
    fontFamily: theme.fontLabel,
    fontSize: size,
    fontWeight: weight,
    letterSpacing: track,
    fill: color,
    stroke: theme.labelShadow,
    strokeWidth: size * 0.14,
    paintOrder: "stroke" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <g opacity={alive * opacity} transform={`rotate(${rotate} ${x} ${y})`}>
      {bow === 0 ? (
        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" {...common}>
          {text}
        </text>
      ) : (
        <>
          <defs>
            <path id={id} d={arc} />
          </defs>
          <text textAnchor="middle" dominantBaseline="middle" {...common}>
            <textPath href={`#${id}`} startOffset="50%">
              {text}
            </textPath>
          </text>
        </>
      )}
    </g>
  );
};

// ── City ───────────────────────────────────────────────────────────────

export const CityMarker: React.FC<{
  at: LonLat;
  name: string;
  in?: number;
  until?: number;
  size?: number;
  tone?: Tone | "plain";
  /** Which side of the dot the name sits on. */
  side?: "below" | "right" | "left" | "above";
}> = ({ at, name, in: from = 0, until, size = 13, tone = "plain", side = "below" }) => {
  const { project, theme, t } = useMap();
  const alive = visibility(t, from, until, 0.35);
  if (alive <= 0.01) return null;

  const [x, y] = project(at);
  const pop = easeOutCubic(ramp(t, from, from + 0.4));
  const color = tone === "plain" ? theme.label : toneColor(theme, tone);

  const dx = side === "right" ? size * 1.9 : side === "left" ? -size * 1.9 : 0;
  const dy = side === "below" ? size * 2.9 : side === "above" ? -size * 2.4 : size * 0.45;
  const anchor = side === "right" ? "start" : side === "left" ? "end" : "middle";

  return (
    <g opacity={alive}>
      <circle cx={x} cy={y} r={size * pop} fill="none" stroke={color} strokeWidth={size * 0.34} />
      <circle cx={x} cy={y} r={size * 0.34 * pop} fill={color} />
      <text
        x={x + dx}
        y={y + dy}
        textAnchor={anchor}
        dominantBaseline="middle"
        fontFamily={theme.fontLabel}
        fontSize={size * 2.1}
        fontWeight={500}
        letterSpacing={size * 0.08}
        fill={theme.label}
        stroke={theme.labelShadow}
        strokeWidth={size * 0.42}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {name}
      </text>
    </g>
  );
};

// ── Arrow ──────────────────────────────────────────────────────────────
// A tapered ribbon that grows along a curve. This is the workhorse of the
// format: an offensive, a trade route, a migration.

export const MapArrow: React.FC<{
  from: LonLat;
  to: LonLat;
  /** Curvature. Positive bends left of travel, negative right. ±0.1–0.4. */
  bow?: number;
  in?: number;
  /** Seconds the arrow takes to draw. */
  dur?: number;
  until?: number;
  tone?: Tone;
  /** Any colour, or a key from theme.palette. Defaults to theme.arrow. */
  color?: string;
  /** Thickness at the tail and at the head, in px at 1080 wide. */
  width?: number;
}> = ({
  from: a,
  to: b,
  bow = 0.18,
  in: start = 0,
  dur = 1.1,
  until,
  tone,
  color,
  width = 16,
}) => {
  const { project, theme, t } = useMap();
  const { width: canvasWidth } = useVideoConfig();
  const alive = visibility(t, start, until, 0.4);
  if (alive <= 0.01) return null;

  const scale = canvasWidth / 1080;
  const p = easeOutCubic(ramp(t, start, start + dur));
  const d = arrowPath(project(a), project(b), bow, p, {
    startWidth: width * 0.45 * scale,
    endWidth: width * scale,
    headWidth: width * 3.1 * scale,
    headLength: width * 3.4 * scale,
  });
  if (!d) return null;

  const paint = color
    ? theme.palette[color] ?? color
    : tone
    ? toneColor(theme, tone)
    : theme.arrow;

  return (
    <g opacity={alive}>
      <path d={d} fill="rgba(0,0,0,0.5)" transform={`translate(${5 * scale} ${7 * scale})`} />
      <path d={d} fill={paint} />
      <path
        d={d}
        fill="none"
        stroke={theme.arrowEdge}
        strokeWidth={2.2 * scale}
        strokeLinejoin="round"
      />
    </g>
  );
};

// ── Link ───────────────────────────────────────────────────────────────
// A thin bright line with a travelling head: alliances, treaties, sea lanes.

export const LinkLine: React.FC<{
  from: LonLat;
  to: LonLat;
  bow?: number;
  in?: number;
  dur?: number;
  until?: number;
  tone?: Tone;
  width?: number;
}> = ({ from: a, to: b, bow = -0.22, in: start = 0, dur = 1.4, until, tone = "accent", width = 4 }) => {
  const { project, theme, t } = useMap();
  const { width: canvasWidth } = useVideoConfig();
  const alive = visibility(t, start, until, 0.4);
  if (alive <= 0.01) return null;

  const scale = canvasWidth / 1080;
  const p = easeOutCubic(ramp(t, start, start + dur));
  const pa = project(a);
  const pb = project(b);
  const c = bowControl(pa, pb, bow);
  const head = quadAt(pa, c, pb, p);
  const color = toneColor(theme, tone);

  return (
    <g opacity={alive}>
      <path
        d={`M ${pa[0]} ${pa[1]} Q ${c[0]} ${c[1]} ${pb[0]} ${pb[1]}`}
        fill="none"
        stroke={color}
        strokeWidth={width * scale}
        strokeLinecap="round"
        pathLength={1000}
        strokeDasharray={1000}
        strokeDashoffset={1000 * (1 - p)}
        opacity={0.9}
      />
      <circle cx={head[0]} cy={head[1]} r={width * 1.9 * scale} fill={theme.accentBright} opacity={p < 1 ? 1 : 0} />
    </g>
  );
};

// ── Era chip ───────────────────────────────────────────────────────────
// The date in the corner. Drawn in HTML so the type can use the same stack
// as the rest of the channel's graphics.

export const EraChip: React.FC<{
  steps: { at: number; text: string; sub?: string }[];
}> = ({ steps }) => {
  const { theme, t } = useMap();
  const { width, height } = useVideoConfig();
  const scale = width / 1080;

  const index = steps.reduce((acc, s, i) => (t >= s.at ? i : acc), -1);
  if (index < 0) return null;
  const step = steps[index];
  const swap = easeOutCubic(ramp(t, step.at, step.at + 0.45));

  return (
    <div
      style={{
        position: "absolute",
        left: 58 * scale,
        top: height * 0.075,
        opacity: swap,
        transform: `translateY(${(1 - swap) * 14 * scale}px)`,
      }}
    >
      <div
        style={{
          fontFamily: theme.fontLabel,
          fontSize: 92 * scale,
          fontWeight: 700,
          color: theme.label,
          letterSpacing: 2 * scale,
          textShadow: `0 ${4 * scale}px ${18 * scale}px rgba(0,0,0,0.8)`,
          lineHeight: 1,
        }}
      >
        {step.text}
      </div>
      <div
        style={{
          width: 108 * scale,
          height: 3 * scale,
          background: theme.accent,
          margin: `${14 * scale}px 0`,
        }}
      />
      {step.sub ? (
        <div
          style={{
            fontFamily: theme.fontChip,
            fontSize: 25 * scale,
            fontWeight: 600,
            letterSpacing: 5 * scale,
            textTransform: "uppercase",
            color: theme.labelDim,
            textShadow: `0 ${2 * scale}px ${10 * scale}px rgba(0,0,0,0.8)`,
          }}
        >
          {step.sub}
        </div>
      ) : null}
    </div>
  );
};

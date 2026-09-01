import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile, useVideoConfig } from "remotion";
import { ARMS, ArmsKey, EMBLEMS, FlagKey } from "./flags";
import { useCountryPath, useMap } from "./MapCanvas";
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
  const { theme, t } = useMap();
  const d = useCountryPath(countries);

  const alive = visibility(t, from, until, 0.5);
  if (alive <= 0.01) return null;

  const drawn = easeOutCubic(ramp(t, from, from + draw));
  const fill = easeOutCubic(ramp(t, from + draw * 0.35, from + draw * 0.35 + 0.7));

  const solid = color ? theme.palette[color] ?? color : null;

  if (!d) return null;

  return (
    <g opacity={alive * opacity}>
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
  /** Any colour, or a key from theme.palette. */
  color?: string;
  width?: number;
}> = ({
  from: a,
  to: b,
  bow = -0.22,
  in: start = 0,
  dur = 1.4,
  until,
  tone = "accent",
  color,
  width = 4,
}) => {
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
  const paint = color ? theme.palette[color] ?? color : toneColor(theme, tone);

  return (
    <g opacity={alive}>
      <path
        d={`M ${pa[0]} ${pa[1]} Q ${c[0]} ${c[1]} ${pb[0]} ${pb[1]}`}
        fill="none"
        stroke={paint}
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

// ── Pinned art: flags, portraits, unit icons ───────────────────────────
// The furniture that turns a coloured map into a documentary map. Each one
// is pinned in lon/lat, so it rides the camera with the territory it marks.

/** Blocks the frame until an image file has decoded, so a render never
 *  captures a half-loaded portrait. */
const usePreloaded = (src?: string) => {
  const [handle] = useState(() => (src ? delayRender(`image ${src}`) : null));
  useEffect(() => {
    if (!src || handle === null) return;
    const image = new Image();
    const done = () => continueRender(handle);
    image.onload = done;
    image.onerror = done;
    image.src = src;
  }, [src, handle]);
};

const shapePath = (shape: PinShape, w: number, h: number): string => {
  if (shape === "shield") {
    return `M0 0 H${w} V${h * 0.52} C${w} ${h * 0.82} ${w * 0.64} ${h} ${
      w / 2
    } ${h} C${w * 0.36} ${h} 0 ${h * 0.82} 0 ${h * 0.52} Z`;
  }
  return `M0 0 H${w} V${h} H0 Z`;
};

export type PinShape = "badge" | "shield" | "circle" | "panel";

export const FlagPin: React.FC<{
  at: LonLat;
  /** One of the drawn flags or coats of arms in flags.tsx … */
  flag?: FlagKey | ArmsKey;
  /** … or your own file in public/, e.g. "assets/flags/reich.png". */
  src?: string;
  in?: number;
  until?: number;
  /** Flag width in px at 1080 wide. */
  size?: number;
  shape?: PinShape;
  /** Name set under the flag. */
  label?: string;
  /** Nudge off the anchor point, in px at 1080 wide. */
  offset?: [number, number];
}> = ({
  at,
  flag,
  src,
  in: from = 0,
  until,
  size = 62,
  shape: shapeProp,
  label,
  offset = [0, 0],
}) => {
  // Coats of arms want the shield; flags want the badge.
  const shape: PinShape =
    shapeProp ?? (flag && flag in ARMS ? "shield" : "badge");
  const { project, theme, t } = useMap();
  const { width: canvasWidth } = useVideoConfig();
  const file = src ? (/^https?:\/\//.test(src) ? src : staticFile(src)) : undefined;
  usePreloaded(file);

  const alive = visibility(t, from, until, 0.35);
  if (alive <= 0.01) return null;

  const scale = canvasWidth / 1080;
  const w = size * scale;
  const h =
    shape === "circle"
      ? w
      : shape === "shield"
      ? w * 1.16
      : shape === "panel"
      ? w * 1.22 // upright, for a manuscript panel or a portrait
      : w * (2 / 3);
  const [px, py] = project(at);
  const x = px + offset[0] * scale - w / 2;
  const y = py + offset[1] * scale - h / 2;

  // Lands with a small overshoot — enough to feel placed, not bouncy.
  const p = easeOutCubic(ramp(t, from, from + 0.45));
  const pop = 0.72 + 0.28 * p + Math.sin(Math.PI * p) * 0.05;

  const id = `pin-${Math.round(px)}-${Math.round(py)}-${flag ?? "img"}`;
  const emblem = flag ? EMBLEMS[flag] : null;
  const path = shapePath(shape, w, h);

  return (
    <g opacity={alive} transform={`translate(${px} ${py}) scale(${pop}) translate(${-px} ${-py})`}>
      <g transform={`translate(${x} ${y})`}>
        <defs>
          <clipPath id={id}>
            {shape === "circle" ? (
              <circle cx={w / 2} cy={h / 2} r={w / 2} />
            ) : (
              <path d={path} />
            )}
          </clipPath>
        </defs>

        {/* drop shadow, matched to the arrows */}
        {shape === "circle" ? (
          <circle cx={w / 2 + 2 * scale} cy={h / 2 + 4 * scale} r={w / 2} fill="rgba(0,0,0,0.45)" />
        ) : (
          <path d={path} fill="rgba(0,0,0,0.45)" transform={`translate(${2 * scale} ${4 * scale})`} />
        )}

        <g clipPath={`url(#${id})`}>
          {file ? (
            <image href={file} x={0} y={0} width={w} height={h} preserveAspectRatio="xMidYMid slice" />
          ) : emblem ? (
            <g transform={`scale(${w / emblem.width} ${h / emblem.height})`}>
              <emblem.Draw />
            </g>
          ) : (
            <rect width={w} height={h} fill={theme.neutral} />
          )}
        </g>

        {shape === "circle" ? (
          <circle
            cx={w / 2}
            cy={h / 2}
            r={w / 2}
            fill="none"
            stroke={theme.label}
            strokeWidth={2.2 * scale}
          />
        ) : (
          <path d={path} fill="none" stroke={theme.label} strokeWidth={2.2 * scale} />
        )}
      </g>

      {label ? (
        <text
          x={px + offset[0] * scale}
          y={y + h + 20 * scale}
          textAnchor="middle"
          fontFamily={theme.fontLabel}
          fontSize={19 * scale}
          fontWeight={600}
          letterSpacing={1.6 * scale}
          fill={theme.label}
          stroke={theme.labelShadow}
          strokeWidth={4 * scale}
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

/** A framed portrait — the leader, the general, the ship. Supply your own
 *  image in public/assets/portraits/; nothing is bundled. */
export const Portrait: React.FC<{
  at: LonLat;
  src: string;
  caption?: string;
  in?: number;
  until?: number;
  size?: number;
  shape?: PinShape;
  offset?: [number, number];
}> = ({ at, src, caption, in: from = 0, until, size = 130, shape = "circle", offset }) => (
  <FlagPin
    at={at}
    src={src}
    in={from}
    until={until}
    size={size}
    shape={shape}
    label={caption}
    offset={offset}
  />
);

/** NATO-style unit marker: a box with a strength label. */
export const UnitIcon: React.FC<{
  at: LonLat;
  kind?: "infantry" | "armour";
  tone?: Tone;
  color?: string;
  label?: string;
  in?: number;
  until?: number;
  size?: number;
}> = ({ at, kind = "infantry", tone = "accent", color, label, in: from = 0, until, size = 46 }) => {
  const { project, theme, t } = useMap();
  const { width: canvasWidth } = useVideoConfig();
  const alive = visibility(t, from, until, 0.35);
  if (alive <= 0.01) return null;

  const scale = canvasWidth / 1080;
  const w = size * scale;
  const h = w * 0.66;
  const [cx, cy] = project(at);
  const x = cx - w / 2;
  const y = cy - h / 2;
  const paint = color ? theme.palette[color] ?? color : toneColor(theme, tone);
  const pop = easeOutCubic(ramp(t, from, from + 0.4));

  return (
    <g opacity={alive} transform={`translate(${cx} ${cy}) scale(${0.8 + 0.2 * pop}) translate(${-cx} ${-cy})`}>
      <rect x={x + 2 * scale} y={y + 3 * scale} width={w} height={h} fill="rgba(0,0,0,0.4)" />
      <rect x={x} y={y} width={w} height={h} fill={paint} stroke={theme.label} strokeWidth={2 * scale} />
      {kind === "infantry" ? (
        <g stroke={theme.label} strokeWidth={2 * scale}>
          <path d={`M${x} ${y} L${x + w} ${y + h}`} />
          <path d={`M${x + w} ${y} L${x} ${y + h}`} />
        </g>
      ) : (
        <ellipse
          cx={cx}
          cy={cy}
          rx={w * 0.34}
          ry={h * 0.32}
          fill="none"
          stroke={theme.label}
          strokeWidth={2 * scale}
        />
      )}
      {label ? (
        <text
          x={cx}
          y={y - 8 * scale}
          textAnchor="middle"
          fontFamily={theme.fontChip}
          fontSize={17 * scale}
          fontWeight={700}
          letterSpacing={1.4 * scale}
          fill={theme.label}
          stroke={theme.labelShadow}
          strokeWidth={3.6 * scale}
          paintOrder="stroke"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};


// ── Battle ─────────────────────────────────────────────────────────────
// Crossed swords, with an optional date under them. The marker every map
// documentary drops on the spot where an army stopped existing.

export const BattleMarker: React.FC<{
  at: LonLat;
  label?: string;
  date?: string;
  in?: number;
  until?: number;
  size?: number;
}> = ({ at, label, date, in: from = 0, until, size = 44 }) => {
  const { project, theme, t } = useMap();
  const { width: canvasWidth } = useVideoConfig();
  const alive = visibility(t, from, until, 0.3);
  if (alive <= 0.01) return null;

  const scale = canvasWidth / 1080;
  const s = size * scale;
  const [x, y] = project(at);
  const p = easeOutCubic(ramp(t, from, from + 0.35));
  const pop = 0.6 + 0.4 * p;
  // Swords land crossed: they swing in from opposite sides and meet.
  const swing = (1 - p) * 18;

  const sword = (angle: number) => (
    <g transform={`rotate(${angle} 0 0)`}>
      <rect x={-s * 0.045} y={-s * 0.62} width={s * 0.09} height={s * 1.0} fill="#e9edf2" />
      <path d={`M${-s * 0.045} ${-s * 0.62} L0 ${-s * 0.78} L${s * 0.045} ${-s * 0.62} Z`} fill="#e9edf2" />
      <rect x={-s * 0.24} y={s * 0.3} width={s * 0.48} height={s * 0.1} rx={s * 0.05} fill="#c9a227" />
      <rect x={-s * 0.05} y={s * 0.4} width={s * 0.1} height={s * 0.22} fill="#c9a227" />
      <circle cx={0} cy={s * 0.66} r={s * 0.08} fill="#c9a227" />
    </g>
  );

  return (
    <g opacity={alive}>
      <g transform={`translate(${x} ${y}) scale(${pop})`}>
        <g opacity={0.5} transform={`translate(${3 * scale} ${4 * scale})`}>
          <g transform={`rotate(${45 + swing} 0 0)`}>
            <rect x={-s * 0.05} y={-s * 0.78} width={s * 0.1} height={s * 1.44} fill="rgba(0,0,0,0.6)" />
          </g>
          <g transform={`rotate(${-45 - swing} 0 0)`}>
            <rect x={-s * 0.05} y={-s * 0.78} width={s * 0.1} height={s * 1.44} fill="rgba(0,0,0,0.6)" />
          </g>
        </g>
        <g stroke="rgba(0,0,0,0.55)" strokeWidth={1.4 * scale}>
          {sword(45 + swing)}
          {sword(-45 - swing)}
        </g>
      </g>
      {label || date ? (
        <text
          x={x}
          y={y + s * 1.15}
          textAnchor="middle"
          fontFamily={theme.fontLabel}
          fontSize={s * 0.46}
          fontWeight={600}
          letterSpacing={s * 0.03}
          fill={theme.label}
          stroke={theme.labelShadow}
          strokeWidth={s * 0.14}
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          {label}
          {label && date ? "  ·  " : ""}
          {date}
        </text>
      ) : null}
    </g>
  );
};

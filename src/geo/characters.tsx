import React from "react";
import { FONT_SANS } from "./fonts";
import { useGeo } from "./GeoCanvas";
import { alive, beat, easeOut, overshoot, pulse } from "./motion";
import { LonLat } from "./projection";
import { ScreenPolygon } from "./shapes";

// ── Countries as characters ───────────────────────────────────────────
//
// The thing that makes the reference channels read as a cartoon rather
// than a diagram: the country itself is the character. Its shape is the
// body — filled flat and saturated so it reads at a glance — and it wears
// big white eyes, heavy brows, a thin mouth, and sometimes a pair of
// hanging arms. It looks where the story is and talks in a line of text
// tethered to its head.
//
// Everything is placed off the country's own on-screen bounding box, so a
// character stays glued to its shape through any camera move.

export type Mood =
  | "plain"
  | "happy"
  | "proud"
  | "worried"
  | "shocked"
  | "sad"
  | "smug"
  | "angry"
  | "thinking";

type Look = [number, number];

const MOOD: Record<Mood, { brow: number; lift: number; mouth: string; squint?: number }> = {
  //            brow angle   brow lift   mouth path (in a 100-wide box)
  plain: { brow: 0, lift: 0, mouth: "M -26 0 q 26 8 52 0" },
  happy: { brow: -6, lift: -4, mouth: "M -30 -4 q 30 30 60 -4" },
  proud: { brow: -10, lift: -6, mouth: "M -28 -2 q 28 22 56 -2", squint: 0.8 },
  worried: { brow: 20, lift: 2, mouth: "M -24 4 q 24 -12 48 4" },
  shocked: { brow: -4, lift: -12, mouth: "M 0 2 a 15 18 0 1 0 0.1 0" },
  sad: { brow: 24, lift: 4, mouth: "M -24 6 q 24 -16 48 6" },
  smug: { brow: -14, lift: -2, mouth: "M -26 0 q 20 18 46 -8", squint: 0.6 },
  angry: { brow: 30, lift: -2, mouth: "M -26 4 q 26 -10 52 4" },
  thinking: { brow: -8, lift: -3, mouth: "M -20 2 q 14 6 34 -2" },
};

/** The face, drawn into a box of width `w` centred on (cx, cy). */
const Face: React.FC<{
  cx: number;
  cy: number;
  w: number;
  mood: Mood;
  look: Look;
  blink: number;
  stroke: number;
}> = ({ cx, cy, w, mood, look, blink, stroke }) => {
  const m = MOOD[mood];
  const s = w / 100; // everything below is drawn in a 100-unit box
  const eyeDx = 26 * s;
  const eyeRx = 17 * s;
  const eyeRy = 21 * s * (m.squint ?? 1) * blink;
  const pupil = 7.4 * s;
  const px = look[0] * 5.2 * s;
  const py = look[1] * 5.2 * s;
  const browY = cy - 30 * s + m.lift * s;

  return (
    <g>
      {/* brows — inner end drops for anger, lifts for worry */}
      {[-1, 1].map((side) => {
        const inner = cx + side * (eyeDx - 19 * s);
        const outer = cx + side * (eyeDx + 19 * s);
        const tilt = (m.brow * s) / 2.4;
        return (
          <path
            key={side}
            d={`M ${inner} ${browY + tilt} Q ${cx + side * eyeDx} ${browY - 7 * s + tilt * 0.3} ${outer} ${browY - tilt * 0.55}`}
            stroke="#141414"
            strokeWidth={stroke * 1.55}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
      {/* eyes */}
      {[-1, 1].map((side) => (
        <g key={side}>
          <ellipse
            cx={cx + side * eyeDx}
            cy={cy}
            rx={eyeRx}
            ry={Math.max(eyeRy, stroke)}
            fill="#ffffff"
            stroke="#141414"
            strokeWidth={stroke}
          />
          {blink > 0.35 ? (
            <circle cx={cx + side * eyeDx + px} cy={cy + py} r={pupil} fill="#141414" />
          ) : null}
        </g>
      ))}
      {/* mouth */}
      <path
        d={m.mouth
          .split(" ")
          .map((tok) => (isNaN(Number(tok)) ? tok : String(Number(tok) * s)))
          .join(" ")}
        transform={`translate(${cx} ${cy + 40 * s})`}
        stroke="#141414"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill={mood === "shocked" ? "#141414" : "none"}
      />
    </g>
  );
};

/** Two hanging arms, one each side of the shape's box. `raise` swings them
 *  up — 0 hangs, 1 is thrown in the air. */
const Arms: React.FC<{
  box: [number, number, number, number];
  stroke: number;
  raise: number;
  swing: number;
}> = ({ box, stroke, raise, swing }) => {
  const [x0, y0, x1, y1] = box;
  const h = y1 - y0;
  const top = y0 + h * 0.46;
  const len = Math.min(h * 0.34, (x1 - x0) * 0.22);
  return (
    <g stroke="#141414" strokeWidth={stroke * 1.35} strokeLinecap="round" fill="none">
      {[-1, 1].map((side) => {
        const ax = side < 0 ? x0 - len * 0.1 : x1 + len * 0.1;
        const out = side * len * (0.5 + raise * 0.5);
        const down = len * (1 - raise * 1.7);
        const bend = side * len * 0.4 * (1 - raise) + side * swing * len * 0.25;
        return (
          <path
            key={side}
            d={`M ${ax} ${top} q ${bend} ${down * 0.55} ${out * 0.7} ${down}`}
          />
        );
      })}
    </g>
  );
};

export type CharacterProps = {
  /** the shape to bring to life — a key from shapes.json */
  shape: string;
  in: number;
  until?: number;
  /** the flat body colour */
  color: string;
  mood?: Mood;
  /** where the eyes point, in eye-widths: [x, y] */
  look?: Look;
  /** nudge the face inside the shape, as a fraction of the box */
  faceX?: number;
  faceY?: number;
  /** face size as a fraction of the shape's width */
  faceScale?: number;
  arms?: boolean;
  /** 0 hangs, 1 thrown up */
  raise?: number;
  opacity?: number;
  fade?: number;
  /** breathe/bob so it never looks like a still */
  idle?: boolean;
};

/** The country, filled flat and wearing a face. */
export const Character: React.FC<CharacterProps> = ({
  shape,
  in: from,
  until,
  color,
  mood = "plain",
  look = [0, 0],
  faceX = 0,
  faceY = -0.04,
  faceScale = 0.28,
  arms = false,
  raise = 0,
  opacity = 1,
  fade = 0.4,
  idle = true,
}) => {
  const { t, shape: get, width } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const s = get(shape);
  if (!s.d) return null;

  // the face goes on the biggest polygon — the mainland, not an island
  const main: ScreenPolygon = s.polygons.reduce((m, p) => (p.area > m.area ? p : m), s.polygons[0]);
  if (!main) return null;
  const [x0, y0, x1, y1] = main.box;
  const w = x1 - x0;
  const h = y1 - y0;
  // A country far bigger than the frame would otherwise wear a face the
  // size of the screen — cap it against the viewport, not just the shape.
  const faceW = Math.max(28, Math.min(Math.min(w, h) * faceScale * 1.35, width * 0.3));
  const cx = Math.max(faceW * 0.7, Math.min(width - faceW * 0.7, x0 + w * (0.5 + faceX)));
  const cy = y0 + h * (0.5 + faceY);
  const stroke = Math.max(2.4, faceW * 0.042);

  // a slow bob, and a blink every few seconds
  const bob = idle ? Math.sin((t - from) * 1.7) * faceW * 0.012 : 0;
  const phase = ((t - from) % 4.3) / 4.3;
  const blink = phase > 0.965 ? Math.abs(Math.cos((phase - 0.965) / 0.035 * Math.PI)) * 0.9 + 0.1 : 1;
  const pop = overshoot(beat(t, from, 0.45));

  return (
    <g opacity={a * opacity}>
      <path d={s.d} fill={color} opacity={0.94} />
      <path d={s.d} fill="none" stroke="#141414" strokeWidth={stroke * 0.9} strokeLinejoin="round" opacity={0.9} />
      <g transform={`translate(0 ${bob})`} opacity={Math.min(1, pop * 1.4)}>
        {arms ? <Arms box={main.box} stroke={stroke} raise={raise} swing={Math.sin((t - from) * 2.1)} /> : null}
        <Face cx={cx} cy={cy} w={faceW} mood={mood} look={look} blink={blink} stroke={stroke} />
      </g>
    </g>
  );
};

// ── Dialogue ──────────────────────────────────────────────────────────
// What a character says, tethered to its head by a thin leader — the
// reference channel's "Cut the rates!" line. HTML, so it goes in `hud`.

export const Dialogue: React.FC<{
  text: string;
  /** the shape it comes out of */
  shape?: string;
  at?: LonLat;
  in: number;
  until?: number;
  /** how far above the head the line sits, px */
  rise?: number;
  dx?: number;
  size?: number;
  color?: string;
  fade?: number;
  leader?: boolean;
}> = ({ text, shape, at, in: from, until, rise = 150, dx = 0, size = 52, color = "#ffffff", fade = 0.25, leader = true }) => {
  const { t, shape: get, point } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;

  let hx: number;
  let hy: number;
  if (shape) {
    const s = get(shape);
    if (!s.d) return null;
    const main = s.polygons.reduce((m, p) => (p.area > m.area ? p : m), s.polygons[0]);
    if (!main) return null;
    const [x0, y0, x1, y1] = main.box;
    hx = (x0 + x1) / 2;
    hy = y0 + (y1 - y0) * 0.3;
  } else if (at) {
    [hx, hy] = point(at);
  } else {
    return null;
  }

  const pop = overshoot(beat(t, from, 0.32));
  const top = hy - rise;
  return (
    <>
      {leader ? (
        <div
          style={{
            position: "absolute",
            left: hx + dx * 0.5,
            top: top + size * 0.55,
            width: 2,
            height: Math.max(0, (rise - size * 0.75) * easeOut(beat(t, from, 0.28))),
            background: "rgba(255,255,255,0.85)",
            transform: `translateX(-50%) rotate(${dx > 0 ? -7 : dx < 0 ? 7 : 0}deg)`,
            transformOrigin: "top center",
            opacity: a,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: hx + dx,
          top,
          transform: `translate(-50%, -50%) scale(${0.72 + 0.28 * pop})`,
          opacity: a,
          fontFamily: FONT_SANS,
          fontWeight: 800,
          fontSize: size,
          color,
          whiteSpace: "pre-line",
          textAlign: "center",
          lineHeight: 1.12,
          textShadow: "0 2px 0 rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.85)",
        }}
      >
        {text}
      </div>
    </>
  );
};

/** A flat, saturated country fill with a dark edge — the reference look for
 *  every country that is coloured but not a character. */
export const Solid: React.FC<{
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
  draw?: number;
}> = ({ shape, shapes, ring, color, in: from, until, opacity = 0.94, edge = "#141414", edgeWidth = 3, fade = 0.35, draw = 0.5 }) => {
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
      <path d={d} fill={color} opacity={opacity * grow} />
      <path d={d} fill="none" stroke={edge} strokeWidth={edgeWidth} strokeLinejoin="round" opacity={0.9 * grow} />
    </g>
  );
};

/** A soft pulsing ring under a character, for "this one is speaking". */
export const Spotlight: React.FC<{ shape: string; in: number; until?: number; color?: string }> = ({
  shape,
  in: from,
  until,
  color = "#ffffff",
}) => {
  const { t, shape: get } = useGeo();
  const a = alive(t, from, until, 0.4);
  if (a <= 0.001) return null;
  const s = get(shape);
  if (!s.d) return null;
  return (
    <path
      d={s.d}
      fill="none"
      stroke={color}
      strokeWidth={9 + 6 * pulse(t, 1.8)}
      strokeLinejoin="round"
      filter="url(#geo-glow)"
      opacity={a * 0.75}
    />
  );
};

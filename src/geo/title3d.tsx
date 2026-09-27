import React from "react";
import { FONT_SANS } from "./fonts";
import { useGeo } from "./GeoCanvas";
import { alive, beat, easeOut, overshoot } from "./motion";
import { LonLat } from "./projection";

// ── 3D title words ────────────────────────────────────────────────────
//
// The big word the reference channels drop on the map: heavy white sans
// lying on a plane inside the shot, extruded so you can see its thickness,
// a warm bloom behind it, and a flattened ghost of itself on the ground as
// a cast shadow. It is a render, not a caption — it turns and settles into
// place rather than fading up.
//
// Built from three stacked copies of the same text:
//   glow    a blurred, colour-tinted copy behind everything
//   shadow  a squashed, blurred copy below, as if thrown onto the terrain
//   face    the word itself, extruded with a stack of offset shadows
//
// Everything is CSS transforms, so it stays sharp at any size.

/** The extrusion: N copies of the glyph stepped down-right, dark to darker.
 *  Cheaper and crisper than a real 3D mesh, and matches how the reference
 *  renders read at phone size. */
const extrude = (depth: number, dark: string): string =>
  Array.from({ length: depth }, (_, i) => {
    const t = i / Math.max(1, depth - 1);
    const shade = Math.round(30 + t * 26);
    return `${(i + 1) * 0.9}px ${(i + 1) * 0.9}px 0 ${dark || `rgb(${shade},${shade - 6},${shade - 10})`}`;
  }).join(", ");

export type Title3DProps = {
  text: string;
  in: number;
  until?: number;
  /** pin the word to a place on the map, or leave it screen-centred */
  at?: LonLat;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  size?: number;
  color?: string;
  /** the bloom behind the word */
  glow?: string;
  /** how far the word is turned away from the viewer, degrees */
  turn?: number;
  /** how far it is laid down, degrees */
  tilt?: number;
  /** in-plane rotation, degrees */
  roll?: number;
  depth?: number;
  fade?: number;
  /** the flattened copy on the ground below */
  groundShadow?: boolean;
  weight?: number;
  /** letters land one after another instead of the whole word at once */
  stagger?: boolean;
};

export const Title3D: React.FC<Title3DProps> = ({
  text,
  in: from,
  until,
  at,
  x,
  y,
  dx = 0,
  dy = 0,
  size = 150,
  color = "#ffffff",
  glow = "rgba(255,150,30,0.85)",
  turn = -24,
  tilt = 10,
  roll = -4,
  depth = 16,
  fade = 0.4,
  groundShadow = true,
  weight = 800,
  stagger = false,
}) => {
  const { t, point, width, height } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;

  const [px, py] = at ? point(at) : [x ?? width / 2, y ?? height * 0.42];
  const p = beat(t, from, 0.75);
  const land = overshoot(p);
  // it swings in from further round and settles
  const turnNow = turn - (1 - easeOut(p)) * 42;
  const scale = 0.72 + 0.28 * land;
  const rise = (1 - easeOut(p)) * size * 0.35;

  const common: React.CSSProperties = {
    position: "absolute",
    left: px + dx,
    top: py + dy - rise,
    fontFamily: FONT_SANS,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 1,
    whiteSpace: "nowrap",
    letterSpacing: "-0.015em",
    transformOrigin: "center center",
  };

  const plane = `perspective(${size * 7}px) rotateX(${tilt}deg) rotateY(${turnNow}deg) rotateZ(${roll}deg)`;

  const letters = stagger ? text.split("") : [text];

  return (
    <div style={{ opacity: a, pointerEvents: "none" }}>
      {/* the bloom behind */}
      <div
        style={{
          ...common,
          transform: `translate(-50%, -50%) ${plane} scale(${scale * 1.04})`,
          color: glow,
          filter: `blur(${size * 0.22}px)`,
          opacity: 0.95 * easeOut(p),
        }}
      >
        {text}
      </div>

      {/* thrown onto the ground */}
      {groundShadow ? (
        <div
          style={{
            ...common,
            top: py + dy + size * 0.62,
            transform: `translate(-50%, -50%) perspective(${size * 7}px) rotateX(72deg) rotateY(${turnNow}deg) rotateZ(${roll}deg) scale(${scale})`,
            color: "rgba(0,0,0,0.42)",
            filter: `blur(${size * 0.06}px)`,
            opacity: 0.8 * easeOut(p),
          }}
        >
          {text}
        </div>
      ) : null}

      {/* the word */}
      <div
        style={{
          ...common,
          transform: `translate(-50%, -50%) ${plane} scale(${scale})`,
          color,
          textShadow: `${extrude(depth, "")}, 0 ${size * 0.09}px ${size * 0.16}px rgba(0,0,0,0.55)`,
          display: "flex",
        }}
      >
        {letters.map((ch, i) => {
          const lp = stagger ? overshoot(beat(t, from + i * 0.035, 0.45)) : 1;
          return (
            <span key={i} style={stagger ? { transform: `translateY(${(1 - lp) * -size * 0.3}px)`, opacity: Math.min(1, lp * 1.6) } : undefined}>
              {ch === " " ? " " : ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** A smaller, flat-on-screen version for a sub-line under a Title3D —
 *  the "(1756–1763)" under "Seven Years' War". */
export const TitleSub: React.FC<{
  text: string;
  in: number;
  until?: number;
  x?: number;
  y: number;
  size?: number;
  color?: string;
  fade?: number;
}> = ({ text, in: from, until, x, y, size = 52, color = "#ffd23f", fade = 0.35 }) => {
  const { t, width } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const pop = overshoot(beat(t, from, 0.5));
  return (
    <div
      style={{
        position: "absolute",
        left: x ?? width / 2,
        top: y,
        transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * pop})`,
        opacity: a,
        fontFamily: FONT_SANS,
        fontWeight: 800,
        fontSize: size,
        color,
        whiteSpace: "nowrap",
        textShadow: "0 3px 0 rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.7)",
      }}
    >
      {text}
    </div>
  );
};

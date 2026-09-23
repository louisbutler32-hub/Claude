import React from "react";
import { useGeo } from "./GeoCanvas";
import { alive, beat, easeOut, pulse } from "./motion";
import { LonLat } from "./projection";

// ── Flat regions ──────────────────────────────────────────────────────
//
// The cartoon-face treatment that used to live here is gone: the channel's
// look is the clean one — see src/geo/annotate.tsx for Region, Ring,
// Leader, ScaleSilhouette, BigStat and PlaceName, which replaced it.
// These two are kept because other shorts import them.

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

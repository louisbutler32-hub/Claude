import React from "react";
import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Shared by the AKKI TALKS shorts (src/akki/*). Everything on screen is drawn
 * here in SVG — no frames, art or audio from the original uploads.
 *
 * House look, measured off the channel's own shorts: flat cel colour with one
 * hard shadow tone, thick near-black outlines (INK, ~6px at 1080 wide), 24fps,
 * and a white title card for the opening seconds. No "AKKI TALKS" header or
 * watermark on screen — the owner asked for it gone from every short.
 */

export const W = 1080;
export const H = 1920;
export const FPS = 24;
export const INK = "#141014";

let started = false;
export const loadAkkiFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("loading akki fonts");
  const face = new FontFace("Poppins Black", `url(${staticFile("fonts/Poppins-Black.ttf")}) format("truetype")`, { weight: "400" });
  face.load().then((f) => { document.fonts.add(f); continueRender(handle); }).catch(() => continueRender(handle));
};

/** A white title in the house caption style (used for the opening title card). */
export const TitleText: React.FC<{ text: string; y?: number; size?: number; color?: string }> = ({ text, y = 230, size = 54, color = "#ffffff" }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <text x={W / 2} y={y} textAnchor="middle" fontFamily="Poppins Black" fontSize={size} fill={color} stroke={INK} strokeWidth={size * 0.2} paintOrder="stroke" strokeLinejoin="round">{text}</text>
  </svg>
);

/** smoothstep between frames a and b */
export const ease = (f: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (f - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
